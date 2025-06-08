import { getCompetitionState } from '~/server/utils/competitionState'

export default defineEventHandler(async () => {
  const state = await getCompetitionState()

  return {
    isStarted: state.isStarted,
    startTime: state.startTime,
    endTime: state.endTime,
    durationMinutes: state.durationMinutes,
    isPaused: state.isPaused,
    totalPausedTime: state.totalPausedTime,
  }
})
