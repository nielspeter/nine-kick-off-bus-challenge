import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    const { User, Team } = useModels()
    
    // Find user with their team
    const user = await User.findByPk(userId, {
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] },
        include: [{
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'picture', 'role'],
          through: { attributes: [] }
        }]
      }]
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const team = user.teams && user.teams.length > 0 ? user.teams[0] : null

    return {
      success: true,
      data: team
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching user team:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})