// Real-time updates composable using polling (can be enhanced with WebSockets later)
export const useRealtime = () => {
  const updateInterval = ref<NodeJS.Timeout | null>(null)
  const isConnected = ref(false)

  const startPolling = (callback: () => Promise<void>, intervalMs = 5000) => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
    }

    isConnected.value = true
    
    // Initial fetch
    callback()
    
    // Set up polling
    updateInterval.value = setInterval(async () => {
      try {
        await callback()
      } catch (error) {
        console.error('Real-time update failed:', error)
      }
    }, intervalMs)
  }

  const stopPolling = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    isConnected.value = false
  }

  // Clean up on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return {
    isConnected: readonly(isConnected),
    startPolling,
    stopPolling
  }
}