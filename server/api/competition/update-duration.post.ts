import { updateCompetitionDuration } from '~/server/utils/competitionState'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  // Check if user is authenticated and is admin
  const session = await getServerSession(event)
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  if (!(session.user as any).isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required'
    })
  }
  
  const body = await readBody(event)
  
  if (!body.durationMinutes || typeof body.durationMinutes !== 'number' || body.durationMinutes <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid duration. Must be a positive number of minutes.'
    })
  }
  
  const state = updateCompetitionDuration(body.durationMinutes)
  
  return {
    success: true,
    state
  }
})