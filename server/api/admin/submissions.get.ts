export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Submission, Task, Team, User } = initModels(sequelize)

    // Fetch all submissions with related data
    const submissions = await Submission.findAll({
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'category', 'description', 'estimatedTime', 'difficulty']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name'],
          include: [
            {
              model: User,
              as: 'captain',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    await sequelize.close()

    return {
      success: true,
      submissions
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch admin submissions'
    })
  }
})