import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async event => {
  try {
    const submissionId = getRouterParam(event, 'id')

    if (!submissionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required',
      })
    }

    const sequelize = await getDatabase()

    // Fetch submission with related data using raw SQL
    const [results] = await sequelize.query(
      `
      SELECT 
        s.*,
        t.id as task_id,
        t.title as task_title,
        t.category as task_category,
        t.description as task_description,
        t."estimatedTime" as task_estimated_time,
        t.difficulty as task_difficulty,
        team.id as team_id,
        team.name as team_name
      FROM "Submissions" s
      JOIN "Tasks" t ON s."taskId" = t.id
      JOIN "Teams" team ON s."teamId" = team.id
      WHERE s.id = :submissionId
    `,
      {
        replacements: { submissionId },
      }
    )

    if (!results || (results as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    const result = (results as any[])[0]

    // Format the response to match the expected structure
    const submission = {
      id: result.id,
      teamId: result.teamId,
      taskId: result.taskId,
      status: result.status,
      chatHistory: result.chatHistory,
      finalAnswers: result.finalAnswers,
      submittedAt: result.submittedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      task: {
        id: result.task_id,
        title: result.task_title,
        category: result.task_category,
        description: result.task_description,
        estimatedTime: result.task_estimated_time,
        difficulty: result.task_difficulty,
      },
      team: {
        id: result.team_id,
        name: result.team_name,
      },
    }

    return {
      success: true,
      submission,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch submission',
    })
  }
})
