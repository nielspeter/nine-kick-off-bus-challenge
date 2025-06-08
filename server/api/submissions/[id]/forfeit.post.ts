import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const submissionId = getRouterParam(event, 'id')
    
    if (!submissionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required'
      })
    }

    const sequelize = await getDatabase()

    // Check if submission exists and is in progress
    const [existingSubmission] = await sequelize.query(`
      SELECT * FROM "Submissions" WHERE id = :submissionId AND status = 'in_progress'
    `, {
      replacements: { submissionId }
    })

    if (!existingSubmission || (existingSubmission as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Active submission not found'
      })
    }

    // Delete the submission to allow starting a new challenge
    await sequelize.query(`
      DELETE FROM "Submissions" WHERE id = :submissionId
    `, {
      replacements: { submissionId }
    })

    return {
      success: true,
      message: 'Challenge forfeited successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to forfeit challenge'
    })
  }
})