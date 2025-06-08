import { getServerSession } from '#auth'
import { getRedisClient } from '~/server/utils/redis'

export default defineEventHandler(async event => {
  try {
    // Verify user session
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    const body = await readBody(event)
    const { submissionId, message, provider = 'openai' } = body

    if (!submissionId || !message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID and message are required',
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Submission, Task, Team } = initModels(sequelize)

    // Find submission with task details
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

    if (!submission) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    if (submission.status !== 'in_progress') {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'Challenge is not active',
      })
    }

    // Prepare AI request based on provider
    let aiResponse
    const team = (submission as any).team
    const task = (submission as any).task

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
            { role: 'user', content: message },
          ],
          max_tokens: 1000,
          temperature: 0.8,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      aiResponse = data.choices[0].message.content
    } else if (provider === 'claude' && config.claudeApiKey) {
      // Claude API call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...(submission.chatHistory as any[]), { role: 'user', content: message }],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data = await response.json()
      aiResponse = data.content[0].text
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'AI provider not available or configured',
      })
    }

    // Update chat history
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

    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      provider,
    }

    const updatedChatHistory = [...(submission.chatHistory as any[]), userMessage, assistantMessage]

    await submission.update({
      chatHistory: updatedChatHistory,
    })

    // Publish messages to Redis for real-time collaboration
    try {
      const redisClient = await getRedisClient()

      // Publish user message
      await redisClient.publish(
        `challenge:${submissionId}:chat`,
        JSON.stringify({
          type: 'message',
          message: userMessage,
          submissionId,
        })
      )

      // Publish AI response
      await redisClient.publish(
        `challenge:${submissionId}:chat`,
        JSON.stringify({
          type: 'message',
          message: assistantMessage,
          submissionId,
        })
      )
    } catch (redisError) {
      console.error('Failed to publish to Redis, but continuing:', redisError)
      // Don't fail the request if Redis is unavailable
    }

    await sequelize.close()

    return {
      success: true,
      response: aiResponse,
      provider,
      chatHistory: updatedChatHistory,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to process AI chat',
    })
  }
})
