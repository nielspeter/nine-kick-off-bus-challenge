export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { submissionId, finalAnswers } = body

    if (!submissionId || !finalAnswers) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID and final answers are required',
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Submission, Task, Team } = initModels(sequelize)

    // Find submission
    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['title', 'category', 'description'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name'],
        },
      ],
    })

    if (!submission) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    if (submission.status !== 'in_progress') {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'Challenge is not active',
      })
    }

    // Update submission
    await submission.update({
      status: 'completed',
      finalAnswers,
      submittedAt: new Date(),
    })

    await sequelize.close()

    return {
      success: true,
      submission,
      message: 'Challenge submitted successfully!',
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to submit challenge',
    })
  }
})
