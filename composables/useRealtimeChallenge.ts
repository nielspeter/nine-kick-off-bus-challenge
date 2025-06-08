export function useRealtimeChallenge(submissionId: string) {
  const chatHistory = ref<any[]>([])
  const activeUsers = ref<any[]>([])
  const isConnected = ref(false)
  const lastActivity = ref<string | null>(null)

  let eventSource: EventSource | null = null

  const connect = () => {
    if (eventSource) {
      disconnect()
    }

    try {
      eventSource = new EventSource(`/api/challenge/${submissionId}/stream`)

      eventSource.onopen = event => {
        console.log('🔗 EventSource connection opened:', event)
        isConnected.value = true
        console.log('🔗 Real-time connection established')
      }

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 SSE message received:', data)
          handleMessage(data)

          // Mark as connected when we receive the first message
          if (!isConnected.value) {
            isConnected.value = true
            console.log('✅ Connection confirmed via message')
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
        }
      }

      eventSource.onerror = error => {
        console.error('❌ SSE connection error:', error)
        console.log('EventSource readyState:', eventSource.readyState)

        // Only set to false if the connection is actually closed
        if (eventSource.readyState === EventSource.CLOSED) {
          isConnected.value = false

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            connect()
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Failed to establish SSE connection:', error)
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      isConnected.value = false
      console.log('🔌 Real-time connection closed')
    }
  }

  const handleMessage = (data: any) => {
    lastActivity.value = data.timestamp

    switch (data.type) {
      case 'connected':
        console.log('✅ Connected to real-time challenge session')
        break

      case 'chat_message':
        // Update chat history with new message
        if (data.data.type === 'message') {
          const message = data.data.message

          // Check if message already exists to avoid duplicates
          const exists = chatHistory.value.some(
            (m: any) =>
              m.timestamp === message.timestamp &&
              m.role === message.role &&
              m.content === message.content
          )

          if (!exists) {
            chatHistory.value = [...chatHistory.value, message]

            // Emit event for auto-scroll
            nextTick(() => {
              window.dispatchEvent(new CustomEvent('chat-message-added'))
            })
          }
        }
        break

      case 'user_activity':
        handleUserActivity(data.data)
        break

      case 'users_sync':
        // Sync active users from server
        activeUsers.value = data.data.activeUsers || []
        console.log(`🔄 Synced active users: ${activeUsers.value.length}`)
        break

      case 'answer_update':
        // Handle real-time final answer updates
        window.dispatchEvent(
          new CustomEvent('answer-updated', {
            detail: data.data,
          })
        )
        break

      case 'heartbeat':
        // Server heartbeat - connection is alive
        lastActivity.value = data.timestamp
        break

      case 'error':
        console.warn('⚠️ Real-time error:', data.message)
        break

      default:
        console.log('Unknown message type:', data.type, data)
    }
  }

  const handleUserActivity = (activity: any) => {
    const { action, user } = activity

    switch (action) {
      case 'user_joined': {
        // Add user to active users if not already present
        const userExists = activeUsers.value.some((u: any) => u.id === user.id)
        if (!userExists) {
          activeUsers.value = [...activeUsers.value, user]
        }
        break
      }

      case 'user_left':
        // Remove user from active users
        activeUsers.value = activeUsers.value.filter((u: any) => u.id !== user.id)
        break

      case 'typing':
        // Handle typing indicators
        window.dispatchEvent(
          new CustomEvent('user-typing', {
            detail: { user, isTyping: activity.isTyping },
          })
        )
        break
    }
  }

  const updateChatHistory = (newHistory: any[]) => {
    chatHistory.value = newHistory
  }

  const publishTyping = async (isTyping: boolean) => {
    try {
      // This could be implemented with a separate endpoint
      // For now, we'll just emit a local event
      window.dispatchEvent(
        new CustomEvent('local-typing', {
          detail: { isTyping },
        })
      )
    } catch (error) {
      console.error('Failed to publish typing status:', error)
    }
  }

  // Auto-connect when composable is used
  onMounted(() => {
    connect()
  })

  // Clean up on unmount
  onUnmounted(() => {
    disconnect()
  })

  // Reconnect when tab becomes visible again
  if (import.meta.client) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !isConnected.value) {
        connect()
      }
    })

    // Additional cleanup when page is about to unload
    const handleBeforeUnload = () => {
      disconnect()
    }

    const handlePageHide = () => {
      disconnect()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    // Cleanup event listeners when component unmounts
    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    })
  }

  return {
    // State
    chatHistory: readonly(chatHistory),
    activeUsers: readonly(activeUsers),
    isConnected: readonly(isConnected),
    lastActivity: readonly(lastActivity),

    // Methods
    connect,
    disconnect,
    updateChatHistory,
    publishTyping,
  }
}
