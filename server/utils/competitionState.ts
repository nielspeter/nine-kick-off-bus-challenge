// Global competition state management with database persistence
import type { CompetitionSettings as CompetitionSettingsType } from '~/server/models'
import { getDatabase } from '~/server/utils/db'
import { initModels } from '~/server/models'

interface CompetitionState {
  isStarted: boolean
  startTime: Date | null
  durationMinutes: number
  isPaused: boolean
  pausedAt: Date | null
  totalPausedTime: number // in milliseconds
}

// Cache for the competition state to avoid excessive DB queries
let cachedState: CompetitionState | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 2000 // 2 seconds

// Get or create the singleton competition settings record
async function getOrCreateSettings(): Promise<CompetitionSettingsType> {
  const sequelize = await getDatabase()
  const { CompetitionSettings } = initModels(sequelize)

  // Try to find existing settings
  let settings = await CompetitionSettings.findOne()

  if (!settings) {
    // Create default settings if none exist
    settings = await CompetitionSettings.create({
      isStarted: false,
      startTime: null,
      durationMinutes: 240, // Default 4 hours
      isPaused: false,
      pausedAt: null,
      totalPausedTime: 0,
    })
  }

  return settings as CompetitionSettingsType
}

// Convert database model to state object
function modelToState(settings: CompetitionSettingsType): CompetitionState {
  return {
    isStarted: settings.isStarted,
    startTime: settings.startTime,
    durationMinutes: settings.durationMinutes,
    isPaused: settings.isPaused,
    pausedAt: settings.pausedAt,
    totalPausedTime: settings.totalPausedTime,
  }
}

export async function getCompetitionState() {
  // Check if we have a valid cached state
  if (cachedState && Date.now() - cacheTimestamp < CACHE_DURATION) {
    const state = cachedState

    // Calculate end time if competition is started
    if (state.isStarted && state.startTime) {
      const endTime = new Date(
        state.startTime.getTime() + state.durationMinutes * 60 * 1000 + state.totalPausedTime
      )

      return {
        ...state,
        endTime,
      }
    }

    return {
      ...state,
      endTime: null,
    }
  }

  // Fetch from database
  const settings = await getOrCreateSettings()
  const state = modelToState(settings)

  // Update cache
  cachedState = state
  cacheTimestamp = Date.now()

  // Calculate end time if competition is started
  if (state.isStarted && state.startTime) {
    const endTime = new Date(
      state.startTime.getTime() + state.durationMinutes * 60 * 1000 + state.totalPausedTime
    )

    return {
      ...state,
      endTime,
    }
  }

  return {
    ...state,
    endTime: null,
  }
}

export async function startCompetition() {
  const settings = await getOrCreateSettings()

  if (!settings.isStarted) {
    await settings.update({
      isStarted: true,
      startTime: new Date(),
      isPaused: false,
      pausedAt: null,
      totalPausedTime: 0,
    })

    // Clear cache to force reload
    cachedState = null
  }

  return getCompetitionState()
}

export async function stopCompetition() {
  const settings = await getOrCreateSettings()

  await settings.update({
    isStarted: false,
    startTime: null,
    isPaused: false,
    pausedAt: null,
    totalPausedTime: 0,
  })

  // Clear cache to force reload
  cachedState = null

  return getCompetitionState()
}

export async function pauseCompetition() {
  const settings = await getOrCreateSettings()

  if (settings.isStarted && !settings.isPaused) {
    await settings.update({
      isPaused: true,
      pausedAt: new Date(),
    })

    // Clear cache to force reload
    cachedState = null
  }

  return getCompetitionState()
}

export async function resumeCompetition() {
  const settings = await getOrCreateSettings()

  if (settings.isStarted && settings.isPaused && settings.pausedAt) {
    const pauseDuration = new Date().getTime() - settings.pausedAt.getTime()
    await settings.update({
      totalPausedTime: settings.totalPausedTime + pauseDuration,
      isPaused: false,
      pausedAt: null,
    })

    // Clear cache to force reload
    cachedState = null
  }

  return getCompetitionState()
}

export async function updateCompetitionDuration(minutes: number) {
  if (minutes > 0) {
    const settings = await getOrCreateSettings()
    await settings.update({
      durationMinutes: minutes,
    })

    // Clear cache to force reload
    cachedState = null
  }

  return getCompetitionState()
}

export async function resetCompetition() {
  return stopCompetition()
}
