import { getServerSession } from '#auth'

export default defineEventHandler(async event => {
  try {
    // Verify user session
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    // Check if user is admin
    const user = session.user as any
    if (!user.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin privileges required',
      })
    }

    const submissionId = getRouterParam(event, 'id')
    if (!submissionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required',
      })
    }

    const body = await readBody(event)
    const { rating } = body

    if (!rating || rating < 1 || rating > 5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rating must be between 1 and 5',
      })
    }

    const { getDatabase } = await import('~/server/utils/db')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { Submission } = initModels(sequelize)

    // Find the submission
    const submission = await Submission.findByPk(submissionId)
    if (!submission) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    // Update the rating
    await submission.update({
      rating: parseFloat(rating.toFixed(1)),
      ratedBy: user.email,
      ratedAt: new Date(),
    })

    return {
      success: true,
      message: 'Submission rated successfully',
      data: {
        id: submission.id,
        rating: submission.rating,
        ratedBy: submission.ratedBy,
        ratedAt: submission.ratedAt,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to rate submission',
    })
  }
})
