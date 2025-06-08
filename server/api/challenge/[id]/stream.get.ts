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

        // Add user to active users set in Redis with a simple key
        const activeUsersKey = `challenge:${submissionId}:active`
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          lastSeen: Date.now(),
        }
        await redisClient.sAdd(activeUsersKey, JSON.stringify(userInfo))

        // Set expiration for the active users key (auto cleanup after 1 hour of inactivity)
        await redisClient.expire(activeUsersKey, 3600)

        // Get current active users and send to new connection
        const activeUsersList = await redisClient.sMembers(activeUsersKey)
        const activeUsers = activeUsersList.map(userStr => JSON.parse(userStr))

        // Send current active users to the new connection immediately
        sendEvent({
          type: 'users_sync',
          data: { activeUsers },
          timestamp: new Date().toISOString(),
        })

        // Publish user joined event to other clients
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
        // Remove user from active users set and publish user left event
        if (redisSubscriber) {
          const redisClient = await getRedisClient()

          // Remove user from active users set
          const activeUsersKey = `challenge:${submissionId}:active`

          // Get all members and find the one matching this user ID
          const activeUsersList = await redisClient.sMembers(activeUsersKey)
          for (const userStr of activeUsersList) {
            try {
              const userData = JSON.parse(userStr)
              if (userData.id === user.id) {
                await redisClient.sRem(activeUsersKey, userStr)
                break
              }
            } catch (e) {
              // Invalid JSON, remove it
              await redisClient.sRem(activeUsersKey, userStr)
            }
          }

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

    // Send periodic heartbeat to detect disconnected clients
    const heartbeatInterval = setInterval(() => {
      if (event.node.res.writable) {
        sendEvent({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        })
      } else {
        clearInterval(heartbeatInterval)
      }
    }, 30000) // Every 30 seconds

    // Clean up interval on connection close
    event.node.req.on('close', () => {
      clearInterval(heartbeatInterval)
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
