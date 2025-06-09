export default defineEventHandler(async event => {
  try {
    const teamId = getRouterParam(event, 'teamId')

    if (!teamId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID is required',
      })
    }

    const { getDatabase } = await import('~/server/utils/db')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { Submission, Task, Team } = initModels(sequelize)

    // Verify team exists
    const team = await Team.findByPk(teamId)
    if (!team) {
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
