export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // For now, return fixed competition times
    // In a real implementation, this would come from a database
    const COMPETITION_START_TIME = '2025-01-15T08:00:00Z'
    const COMPETITION_DURATION_HOURS = 4
    
    const startTime = new Date(COMPETITION_START_TIME)
    const endTime = new Date(startTime.getTime() + COMPETITION_DURATION_HOURS * 60 * 60 * 1000)
    const now = new Date()
    
    let status: 'upcoming' | 'active' | 'ended'
    let timeLeft = 0
    let progress = 0
    
    if (now < startTime) {
      status = 'upcoming'
      timeLeft = startTime.getTime() - now.getTime()
      progress = 0
    } else if (now >= startTime && now < endTime) {
      status = 'active'
      timeLeft = endTime.getTime() - now.getTime()
      const totalDuration = endTime.getTime() - startTime.getTime()
      const elapsed = now.getTime() - startTime.getTime()
      progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
    } else {
      status = 'ended'
      timeLeft = 0
      progress = 100
    }

    return {
      success: true,
      competition: {
        status,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeLeft,
        progress,
        durationHours: COMPETITION_DURATION_HOURS,
        currentTime: now.toISOString()
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch competition status'
    })
  }
})