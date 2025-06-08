export const useCompetitionTimer = () => {
  const timeLeft = ref('')
  const competitionStatus = ref<'upcoming' | 'active' | 'ended'>('upcoming')
  const progress = ref(0)
  const timer = ref<NodeJS.Timeout | null>(null)
  const isLoading = ref(true)
  const competitionState = ref<any>(null)

  // Fetch competition state from API
  async function fetchCompetitionState() {
    try {
      const state = await $fetch('/api/competition/settings')
      competitionState.value = state
      isLoading.value = false
    } catch (error) {
      console.error('Failed to fetch competition state:', error)
      isLoading.value = false
    }
  }

  function updateTimer() {
    if (!competitionState.value) return

    const now = new Date()
    const { isStarted, startTime, endTime, isPaused } = competitionState.value

    if (!isStarted) {
      // Competition not started
      competitionStatus.value = 'upcoming'
      timeLeft.value = 'Not Started'
      progress.value = 0
    } else if (isPaused) {
      // Competition is paused
      competitionStatus.value = 'active'
      timeLeft.value = 'PAUSED'
      // Keep the current progress
    } else if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)

      if (now < end) {
        // Competition is active
        competitionStatus.value = 'active'
        const timeDiff = end.getTime() - now.getTime()
        timeLeft.value = formatTimeLeft(timeDiff)

        // Calculate progress (0-100%)
        const totalDuration = end.getTime() - start.getTime()
        const elapsed = now.getTime() - start.getTime()
        progress.value = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
      } else {
        // Competition has ended
        competitionStatus.value = 'ended'
        timeLeft.value = 'Competition Ended'
        progress.value = 100
      }
    }
  }

  function formatTimeLeft(milliseconds: number) {
    if (milliseconds <= 0) return '00:00:00'

    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  async function startTimer() {
    await fetchCompetitionState() // Fetch state first
    updateTimer() // Initial update
    timer.value = setInterval(async () => {
      // Fetch state periodically to get updates from admin
      await fetchCompetitionState()
      updateTimer()
    }, 1000) // Update every second
  }

  function stopTimer() {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  function getStatusMessage() {
    switch (competitionStatus.value) {
      case 'upcoming':
        return 'Competition starts in:'
      case 'active':
        return 'Time remaining:'
      case 'ended':
        return 'Competition has ended'
      default:
        return ''
    }
  }

  function getStatusColor() {
    switch (competitionStatus.value) {
      case 'upcoming':
        return 'text-blue-600'
      case 'active':
        return 'text-green-600'
      case 'ended':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Clean up on component unmount
  onUnmounted(() => {
    stopTimer()
  })

  return {
    timeLeft: readonly(timeLeft),
    competitionStatus: readonly(competitionStatus),
    progress: readonly(progress),
    isLoading: readonly(isLoading),
    startTimer,
    stopTimer,
    getStatusMessage,
    getStatusColor,
    competitionState: readonly(competitionState),
  }
}
