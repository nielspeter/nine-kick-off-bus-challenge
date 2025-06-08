import { startCompetition } from '~/server/utils/competitionState'
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
  
  const state = startCompetition()
  
  return {
    success: true,
    state
  }
})