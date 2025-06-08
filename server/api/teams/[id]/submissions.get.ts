import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async event => {
  try {
    const teamId = getRouterParam(event, 'id')

    if (!teamId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID is required',
      })
    }

    const sequelize = await getDatabase()

    // Get all submissions for this team
    const [results] = await sequelize.query(
      `
      SELECT 
        s.*,
        t.title as task_title,
        t.category as task_category,
        t.description as task_description,
        t."estimatedTime" as task_estimated_time,
        t.difficulty as task_difficulty
      FROM "Submissions" s
      JOIN "Tasks" t ON s."taskId" = t.id
      WHERE s."teamId" = :teamId
      ORDER BY s."createdAt" DESC
    `,
      {
        replacements: { teamId },
      }
    )

    return {
      success: true,
      submissions: results || [],
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch team submissions',
    })
  }
})
