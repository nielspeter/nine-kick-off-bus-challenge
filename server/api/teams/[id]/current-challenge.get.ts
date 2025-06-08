import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const teamId = getRouterParam(event, 'id')
    
    if (!teamId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID is required'
      })
    }

    const sequelize = await getDatabase()

    // Get current active challenge for the team
    const [results] = await sequelize.query(`
      SELECT 
        s.*,
        t.title as task_title,
        t.category as task_category,
        t.description as task_description,
        t."estimatedTime" as task_estimated_time,
        t.difficulty as task_difficulty,
        team.name as team_name
      FROM "Submissions" s
      JOIN "Tasks" t ON s."taskId" = t.id
      JOIN "Teams" team ON s."teamId" = team.id
      WHERE s."teamId" = :teamId AND s.status = 'in_progress'
      ORDER BY s."createdAt" DESC
      LIMIT 1
    `, {
      replacements: { teamId }
    })

    const activeChallenge = (results as any[])[0] || null

    return {
      success: true,
      data: activeChallenge
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to get current challenge'
    })
  }
})