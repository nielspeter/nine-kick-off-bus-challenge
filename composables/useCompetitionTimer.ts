export const useCompetitionTimer = () => {
  // Competition settings - can be configured via environment or database
  const COMPETITION_DURATION_HOURS = 4 // 4 hours for the bus journey
  const COMPETITION_START_TIME = '2025-01-15T08:00:00Z' // Example start time
  
  const timeLeft = ref('')
  const competitionStatus = ref<'upcoming' | 'active' | 'ended'>('upcoming')
  const progress = ref(0)
  const timer = ref<NodeJS.Timeout | null>(null)

  const startTime = new Date(COMPETITION_START_TIME)
  const endTime = new Date(startTime.getTime() + COMPETITION_DURATION_HOURS * 60 * 60 * 1000)

  function updateTimer() {
    const now = new Date()
    
    if (now < startTime) {
      // Competition hasn't started yet
      competitionStatus.value = 'upcoming'
      const timeDiff = startTime.getTime() - now.getTime()
      timeLeft.value = formatTimeLeft(timeDiff)
      progress.value = 0
    } else if (now >= startTime && now < endTime) {
      // Competition is active
      competitionStatus.value = 'active'
      const timeDiff = endTime.getTime() - now.getTime()
      timeLeft.value = formatTimeLeft(timeDiff)
      
      // Calculate progress (0-100%)
      const totalDuration = endTime.getTime() - startTime.getTime()
      const elapsed = now.getTime() - startTime.getTime()
      progress.value = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
    } else {
      // Competition has ended
      competitionStatus.value = 'ended'
      timeLeft.value = 'Competition Ended'
      progress.value = 100
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

  function startTimer() {
    updateTimer() // Initial update
    timer.value = setInterval(updateTimer, 1000) // Update every second
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
    startTimer,
    stopTimer,
    getStatusMessage,
    getStatusColor,
    startTime: readonly(ref(startTime)),
    endTime: readonly(ref(endTime))
  }
}