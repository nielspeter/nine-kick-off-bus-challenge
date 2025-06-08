import { getServerSession } from '#auth'
import { getRedisClient } from '~/server/utils/redis'
import { getDatabase } from '~/server/utils/db'
import { initModels } from '~/server/models'

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
    const { submissionId, message, provider = 'openai' } = body

    if (!submissionId || !message) {
      console.log('❌ Missing required fields:', { submissionId, message: !!message })
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID and message are required',
      })
    }

    console.log('📝 Request data:', { submissionId, provider, messageLength: message.length })

    const config = useRuntimeConfig()
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

    // Prepare AI request based on provider
    let aiResponse
    const team = (submission as any).team
    const task = (submission as any).task

    console.log('🤖 Preparing AI request for provider:', provider)

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

    if (provider === 'openai' && config.openaiApiKey) {
      // OpenAI API call
      console.log('🔑 Making OpenAI API call...')
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...(submission.chatHistory as any[]),
              { role: 'user', content: userMessage.content },
            ],
            temperature: 0.8,
          }),
        })

        console.log('📡 OpenAI API response status:', response.status)
        console.log('📡 OpenAI API response ok:', response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ OpenAI API error details:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          })

          // Return a user-friendly error message instead of throwing
          let userErrorMessage = 'Sorry, the AI service is currently unavailable.'
          if (response.status === 429) {
            userErrorMessage =
              'The AI service is currently rate limited. Please try again in a moment.'
          } else if (response.status === 401) {
            userErrorMessage =
              'AI service authentication failed. Please contact support.'
          } else if (response.status >= 500) {
            userErrorMessage =
              'The AI service is experiencing technical difficulties. Please try again later.'
          }

          aiResponse = `⚠️ ${userErrorMessage}`
        } else {
          const data = await response.json()
          console.log('✅ OpenAI API response received, choices length:', data.choices?.length)
          aiResponse = data.choices[0].message.content
          console.log('✅ AI response extracted, length:', aiResponse?.length)
        }
      } catch (fetchError) {
        console.error('❌ OpenAI API fetch error:', fetchError)
        aiResponse =
          '⚠️ Sorry, there was a network error connecting to the AI service. Please try again.'
      }
    } else if (provider === 'claude' && config.claudeApiKey) {
      // Claude API call
      console.log('🔑 Making Claude API call...')
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': config.claudeApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            system: systemPrompt,
            messages: [
              ...(submission.chatHistory as any[]),
              { role: 'user', content: userMessage.content },
            ],
          }),
        })

        console.log('📡 Claude API response status:', response.status)
        console.log('📡 Claude API response ok:', response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Claude API error details:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })

          // Return a user-friendly error message instead of throwing
          let userErrorMessage = 'Sorry, the AI service is currently unavailable.'
          if (response.status === 429) {
            userErrorMessage = 'The AI service is currently rate limited. Please try again in a moment.'
          } else if (response.status === 401) {
            userErrorMessage = 'AI service authentication failed. Please contact support.'
          } else if (response.status >= 500) {
            userErrorMessage = 'The AI service is experiencing technical difficulties. Please try again later.'
          }

          aiResponse = `⚠️ ${userErrorMessage}`
        } else {
          const data = await response.json()
          console.log('✅ Claude API response received, content length:', data.content?.length)
          aiResponse = data.content[0].text
          console.log('✅ AI response extracted, length:', aiResponse?.length)
        }
      } catch (fetchError) {
        console.error('❌ Claude API fetch error:', fetchError)
        aiResponse =
          '⚠️ Sorry, there was a network error connecting to the AI service. Please try again.'
      }
    } else {
      console.error('❌ AI provider not available:', {
        provider,
        hasOpenAIKey: !!config.openaiApiKey,
        hasClaudeKey: !!config.claudeApiKey,
      })
      aiResponse =
        '⚠️ The requested AI provider is not available. Please try switching to a different provider or contact support.'
    }

    // Create assistant message
    console.log('📝 Creating assistant message...')
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      provider,
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
      provider,
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
