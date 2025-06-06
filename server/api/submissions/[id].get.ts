export default defineEventHandler(async (event) => {
  try {
    const submissionId = getRouterParam(event, 'id')
    
    if (!submissionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID is required'
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Submission, Task, Team } = initModels(sequelize)

    // Fetch submission with related data
    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'category', 'description', 'estimatedTime', 'difficulty']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name']
        }
      ]
    })

    if (!submission) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found'
      })
    }

    await sequelize.close()

    return {
      success: true,
      submission
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch submission'
    })
  }
})