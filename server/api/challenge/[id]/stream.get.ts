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

    const submissionId = getRouterParam(event, 'id')
    if (!submissionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required',
      })
    }

    // Set SSE headers manually first
    setHeader(event, 'cache-control', 'no-cache')
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'content-type', 'text/event-stream')
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Headers', 'Cache-Control')
    setResponseStatus(event, 200)

    console.log(`🔗 SSE connection established for submission: ${submissionId}`)
    
    const user = session.user as any // Type assertion to access id field
    
    let counter = 0
    const sendEvent = (data: any) => {
      event.node.res.write(`id: ${++counter}\n`)
      event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
    
    // Send initial connection message immediately
    sendEvent({
      type: 'connected',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    })

    let redisSubscriber: any = null

    // Setup Redis connection asynchronously to not block initial response
    setImmediate(async () => {
      try {
        // Subscribe to Redis channel for this submission
        const redisClient = await getRedisClient()
        redisSubscriber = redisClient.duplicate()
        await redisSubscriber.connect()

        console.log(`✅ Redis connected for SSE stream: ${submissionId}`)

        // Subscribe to chat messages
        await redisSubscriber.subscribe(`challenge:${submissionId}:chat`, async message => {
          try {
            const parsedMessage = JSON.parse(message)
            sendEvent({
              type: 'chat_message',
              data: parsedMessage,
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Failed to process chat message for SSE:', error)
          }
        })

        // Subscribe to user activity updates
        await redisSubscriber.subscribe(`challenge:${submissionId}:activity`, async message => {
          try {
            const parsedMessage = JSON.parse(message)
            sendEvent({
              type: 'user_activity',
              data: parsedMessage,
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Failed to process activity message for SSE:', error)
          }
        })

        // Subscribe to final answer updates
        await redisSubscriber.subscribe(`challenge:${submissionId}:answer`, async message => {
          try {
            const parsedMessage = JSON.parse(message)
            sendEvent({
              type: 'answer_update',
              data: parsedMessage,
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Failed to process answer update for SSE:', error)
          }
        })

        // Publish user joined event
        await redisClient.publish(
          `challenge:${submissionId}:activity`,
          JSON.stringify({
            action: 'user_joined',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            timestamp: new Date().toISOString(),
          })
        )
      } catch (redisError) {
        console.error('Redis connection failed, continuing without real-time features:', redisError)
        // Send error message to client
        sendEvent({
          type: 'error',
          message: 'Real-time features unavailable',
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Handle connection close
    event.node.req.on('close', async () => {
      console.log(`🔌 SSE connection closed for submission: ${submissionId}`)
      try {
        // Publish user left event
        if (redisSubscriber) {
          const redisClient = await getRedisClient()
          await redisClient.publish(
            `challenge:${submissionId}:activity`,
            JSON.stringify({
              action: 'user_left',
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
              },
              timestamp: new Date().toISOString(),
            })
          )

          // Clean up Redis subscription
          await redisSubscriber.quit()
        }
      } catch (error) {
        console.error('Error during SSE cleanup:', error)
      }
    })

    // Keep connection alive
    event._handled = true
  } catch (error: any) {
    console.error('SSE endpoint error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to establish real-time connection',
    })
  }
})
