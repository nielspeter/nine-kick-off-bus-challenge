import { getServerSession } from '#auth'
import { getRedisClient } from '~/server/utils/redis'
import { getDatabase } from '~/server/utils/db'
import { initModels } from '~/server/models'
import OpenAI from 'openai'

export default defineEventHandler(async event => {
  try {
    console.log('🎯 Chat API called')

    // Set headers for SSE streaming
    setHeader(event, 'Content-Type', 'text/event-stream')
    setHeader(event, 'Cache-Control', 'no-cache')
    setHeader(event, 'Connection', 'keep-alive')
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Headers', 'Cache-Control')

    // Verify user session
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      console.log('❌ No user session found')
      const errorData = JSON.stringify({ error: 'Authentication required' })
      return `event: error\ndata: ${errorData}\n\n`
    }

    console.log('✅ User session verified:', session.user.email)

    const body = await readBody(event)
    const { submissionId, message, model = 'gpt-4o-mini' } = body

    if (!submissionId || !message) {
      console.log('❌ Missing required fields:', { submissionId, message: !!message })
      const errorData = JSON.stringify({ error: 'Submission ID and message are required' })
      return `event: error\ndata: ${errorData}\n\n`
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
        image: user.image,
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

    // Send user message immediately via SSE
    const userData = JSON.stringify({
      type: 'user_message',
      message: userMessage,
    })
    event.node.res.write(`event: message\ndata: ${userData}\n\n`)

    let aiResponse = ''
    console.log('🔑 Making LiteLLM streaming API call...')

    try {
      const stream = await litellm.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(submission.chatHistory as any[]),
          { role: 'user', content: userMessage.content },
        ],
        temperature: 0.8,
        max_tokens: 4096,
        stream: true,
      })

      console.log('✅ LiteLLM streaming started')

      // Send stream start event and publish to Redis for real-time collaboration
      const startData = JSON.stringify({
        type: 'stream_start',
        model,
        submissionId,
        timestamp: new Date().toISOString(),
      })
      event.node.res.write(`event: stream_start\ndata: ${startData}\n\n`)

      // Publish stream start to Redis for other team members
      try {
        const redisClient = await getRedisClient()
        await redisClient.publish(
          `challenge:${submissionId}:chat`,
          JSON.stringify({
            type: 'stream_start',
            data: {
              type: 'stream_start',
              model,
              submissionId,
              timestamp: new Date().toISOString(),
            },
            submissionId,
          })
        )
      } catch (redisError) {
        console.error('Failed to publish stream start to Redis:', redisError)
      }

      // Process streaming response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          aiResponse += content

          // Send each chunk via SSE to the chat initiator
          const chunkData = JSON.stringify({
            type: 'stream_chunk',
            content,
            submissionId,
            timestamp: new Date().toISOString(),
          })
          event.node.res.write(`event: chunk\ndata: ${chunkData}\n\n`)

          // Publish each chunk to Redis for real-time collaboration
          try {
            const redisClient = await getRedisClient()
            await redisClient.publish(
              `challenge:${submissionId}:chat`,
              JSON.stringify({
                type: 'stream_chunk',
                data: {
                  type: 'stream_chunk',
                  content,
                  submissionId,
                  timestamp: new Date().toISOString(),
                },
                submissionId,
              })
            )
          } catch (redisError) {
            console.error('Failed to publish chunk to Redis:', redisError)
            // Don't fail the stream if Redis is unavailable
          }
        }
      }

      console.log('✅ AI streaming response complete, total length:', aiResponse.length)
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

      // Send error via SSE
      const errorData = JSON.stringify({
        type: 'error',
        message: userErrorMessage,
      })
      event.node.res.write(`event: error\ndata: ${errorData}\n\n`)
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
      const errorData = JSON.stringify({
        type: 'error',
        message: 'Failed to save chat history',
      })
      event.node.res.write(`event: error\ndata: ${errorData}\n\n`)
    }

    // Note: AI response will be published via stream_complete event below
    // No need to publish as a separate message to avoid duplication

    // Send completion event with final data
    const completionData = JSON.stringify({
      type: 'stream_complete',
      assistantMessage,
      chatHistory: updatedChatHistory,
      success: true,
    })
    event.node.res.write(`event: complete\ndata: ${completionData}\n\n`)

    // Publish stream completion to Redis for real-time collaboration
    try {
      const redisClient = await getRedisClient()
      await redisClient.publish(
        `challenge:${submissionId}:chat`,
        JSON.stringify({
          type: 'stream_complete',
          data: {
            type: 'stream_complete',
            assistantMessage,
            submissionId,
            timestamp: new Date().toISOString(),
          },
          submissionId,
        })
      )
    } catch (redisError) {
      console.error('Failed to publish stream completion to Redis:', redisError)
      // Don't fail the request if Redis is unavailable
    }

    // Close the SSE connection
    event.node.res.end()
  } catch (error: unknown) {
    console.error('💥 Chat API Error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    })

    // For SSE, send error event and close connection
    try {
      const errorData = JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process AI chat',
      })
      event.node.res.write(`event: error\ndata: ${errorData}\n\n`)
      event.node.res.end()
    } catch (writeError) {
      console.error('Failed to write error response:', writeError)
    }
  }
})
