export default defineEventHandler(async () => {
  try {
    const { getDatabase } = await import('~/server/utils/db')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { User, Team } = initModels(sequelize)

    const teams = await Team.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'email', 'name', 'picture', 'role'],
        },
        {
          model: User,
          as: 'captain',
          attributes: ['id', 'email', 'name', 'picture', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      teams,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch teams',
    })
  }
})
