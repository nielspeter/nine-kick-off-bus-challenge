export default defineEventHandler(async event => {
  try {
    const teamId = getRouterParam(event, 'teamId')

    if (!teamId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID is required',
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Submission, Task, Team } = initModels(sequelize)

    // Verify team exists
    const team = await Team.findByPk(teamId)
    if (!team) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Fetch submissions for this team
    const submissions = await Submission.findAll({
      where: { teamId },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'category', 'description', 'estimatedTime', 'difficulty'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    await sequelize.close()

    return {
      success: true,
      submissions,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch team submissions',
    })
  }
})
