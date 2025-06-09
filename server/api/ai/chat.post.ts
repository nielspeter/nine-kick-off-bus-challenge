import { getServerSession } from '#auth'
import { getRedisClient } from '~/server/utils/redis'
import { getDatabase } from '~/server/utils/db'
import { initModels } from '~/server/models'
import OpenAI from 'openai'

export default defineEventHandler(async event => {
  try {
    console.log('🎯 Chat API called')

    // Verify user session
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      console.log('❌ No user session found')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    console.log('✅ User session verified:', session.user.email)

    const body = await readBody(event)
    const { submissionId, message, model = 'gpt-4o-mini' } = body

    if (!submissionId || !message) {
      console.log('❌ Missing required fields:', { submissionId, message: !!message })
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID and message are required',
      })
    }

    console.log('📝 Request data:', { submissionId, model, messageLength: message.length })

    console.log('📊 Getting database connection...')
    const sequelize = await getDatabase()
    console.log('✅ Database connection acquired')

    const { Submission, Task, Team } = initModels(sequelize)
    console.log('✅ Models initialized')

    // Find submission with task details
    console.log('🔍 Finding submission:', submissionId)
    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['title', 'category', 'description', 'estimatedTime', 'difficulty'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name'],
        },
      ],
    })
    console.log('✅ Submission query completed')

    if (!submission) {
      console.log('❌ Submission not found:', submissionId)
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    console.log('✅ Submission found, status:', submission.status)

    if (submission.status !== 'in_progress') {
      console.log('❌ Challenge not active:', submission.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'Challenge is not active',
      })
    }

    // Check if competition is paused
    const { getCompetitionState } = await import('~/server/utils/competitionState')
    const competitionState = await getCompetitionState()

    if (competitionState.isPaused) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Competition is currently paused. Please wait for it to resume.',
      })
    }

    // Create user message object and publish immediately
    const user = session.user as any // Type assertion to access id field
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }

    // Publish user message immediately for real-time collaboration
    try {
      const redisClient = await getRedisClient()
      await redisClient.publish(
        `challenge:${submissionId}:chat`,
        JSON.stringify({
          type: 'message',
          message: userMessage,
          submissionId,
        })
      )
    } catch (redisError) {
      console.error('Failed to publish user message to Redis:', redisError)
      // Don't fail the request if Redis is unavailable
    }

    // Initialize LiteLLM OpenAI-compatible client
    const config = useRuntimeConfig()
    const masterKey = config.litellmMasterKey || 'sk-1234567890abcdef'
    const litellm = new OpenAI({
      baseURL: 'http://litellm:4000/v1', // Point to LiteLLM proxy
      apiKey: masterKey, // Use master key from config
      defaultHeaders: {
        Authorization: `Bearer ${masterKey}`,
      },
    })

    const team = (submission as any).team
    const task = (submission as any).task

    console.log('🤖 Preparing AI request for model:', model)

    const systemPrompt = `You are an AI assistant helping Team "${team.name}" with the "${task.title}" challenge in the "${task.category}" category.

Challenge Description: ${task.description}

Estimated Time: ${task.estimatedTime} minutes
Difficulty: ${task.difficulty}/3

You should:
1. Help them brainstorm creative solutions
2. Provide guidance and suggestions
3. Ask clarifying questions
4. Be encouraging and supportive
5. Help them think outside the box

Remember: This is a creativity competition, so focus on innovative and unique approaches!`

    let aiResponse
    console.log('🔑 Making LiteLLM API call...')
    try {
      const response = await litellm.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(submission.chatHistory as any[]),
          { role: 'user', content: userMessage.content },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      })

      console.log('✅ LiteLLM API response received')
      aiResponse = response.choices[0].message.content
      console.log('✅ AI response extracted, length:', aiResponse?.length)
    } catch (litellmError) {
      console.error('❌ LiteLLM API error:', litellmError)

      // Handle specific error types
      let userErrorMessage = 'Sorry, the AI service is currently unavailable.'
      if (litellmError instanceof Error) {
        if (litellmError.message.includes('rate limit')) {
          userErrorMessage =
            'The AI service is currently rate limited. Please try again in a moment.'
        } else if (
          litellmError.message.includes('authentication') ||
          litellmError.message.includes('401')
        ) {
          userErrorMessage = 'AI service authentication failed. Please contact support.'
        } else if (
          litellmError.message.includes('timeout') ||
          litellmError.message.includes('network')
        ) {
          userErrorMessage = 'Network error connecting to the AI service. Please try again.'
        } else if (
          litellmError.message.includes('model') ||
          litellmError.message.includes('not found')
        ) {
          userErrorMessage = `The selected model "${model}" is not available. Please try a different model.`
        }
      }

      aiResponse = `⚠️ ${userErrorMessage}`
    }

    // Create assistant message
    console.log('📝 Creating assistant message...')
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      model,
    }

    // Update chat history with both messages
    console.log('💾 Updating chat history in database...')
    const updatedChatHistory = [...(submission.chatHistory as any[]), userMessage, assistantMessage]
    console.log('💾 Chat history length before update:', (submission.chatHistory as any[]).length)
    console.log('💾 Chat history length after update:', updatedChatHistory.length)

    try {
      await submission.update({
        chatHistory: updatedChatHistory,
      })
      console.log('✅ Database update successful')
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError)
      throw dbError
    }

    // Publish AI response to Redis for real-time collaboration
    try {
      const redisClient = await getRedisClient()
      await redisClient.publish(
        `challenge:${submissionId}:chat`,
        JSON.stringify({
          type: 'message',
          message: assistantMessage,
          submissionId,
        })
      )
    } catch (redisError) {
      console.error('Failed to publish AI response to Redis:', redisError)
      // Don't fail the request if Redis is unavailable
    }

    return {
      success: true,
      response: aiResponse,
      model,
      chatHistory: updatedChatHistory,
    }
  } catch (error: unknown) {
    console.error('💥 Chat API Error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    })

    if (error && typeof error === 'object' && 'statusCode' in error) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to process AI chat',
    })
  }
})
