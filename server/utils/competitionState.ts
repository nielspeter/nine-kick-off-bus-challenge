// Global competition state management
// This keeps the competition state in memory for the duration of the server runtime

interface CompetitionState {
  isStarted: boolean
  startTime: Date | null
  durationMinutes: number
  isPaused: boolean
  pausedAt: Date | null
  totalPausedTime: number // in milliseconds
}

// Initial state - competition not started
const competitionState: CompetitionState = {
  isStarted: false,
  startTime: null,
  durationMinutes: 240, // Default 4 hours
  isPaused: false,
  pausedAt: null,
  totalPausedTime: 0
}

export function getCompetitionState() {
  // Calculate end time if competition is started
  if (competitionState.isStarted && competitionState.startTime) {
    const endTime = new Date(
      competitionState.startTime.getTime() + 
      competitionState.durationMinutes * 60 * 1000 +
      competitionState.totalPausedTime
    )
    
    return {
      ...competitionState,
      endTime
    }
  }
  
  return {
    ...competitionState,
    endTime: null
  }
}

export function startCompetition() {
  if (!competitionState.isStarted) {
    competitionState.isStarted = true
    competitionState.startTime = new Date()
    competitionState.isPaused = false
    competitionState.pausedAt = null
    competitionState.totalPausedTime = 0
  }
  return getCompetitionState()
}

export function stopCompetition() {
  competitionState.isStarted = false
  competitionState.startTime = null
  competitionState.isPaused = false
  competitionState.pausedAt = null
  competitionState.totalPausedTime = 0
  return getCompetitionState()
}

export function pauseCompetition() {
  if (competitionState.isStarted && !competitionState.isPaused) {
    competitionState.isPaused = true
    competitionState.pausedAt = new Date()
  }
  return getCompetitionState()
}

export function resumeCompetition() {
  if (competitionState.isStarted && competitionState.isPaused && competitionState.pausedAt) {
    const pauseDuration = new Date().getTime() - competitionState.pausedAt.getTime()
    competitionState.totalPausedTime += pauseDuration
    competitionState.isPaused = false
    competitionState.pausedAt = null
  }
  return getCompetitionState()
}

export function updateCompetitionDuration(minutes: number) {
  if (minutes > 0) {
    competitionState.durationMinutes = minutes
  }
  return getCompetitionState()
}

export function resetCompetition() {
  return stopCompetition()
}