import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const teamId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { Team, User } = useModels()
    
    if (!body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Find team
    const team = await Team.findByPk(teamId, {
      include: [{
        model: User,
        as: 'members',
        through: { attributes: [] }
      }]
    })

    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found'
      })
    }

    // Check team size limit
    if (team.members && team.members.length >= 4) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team is full (maximum 4 members)'
      })
    }

    // Find user
    const user = await User.findByPk(body.userId, {
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] }
      }]
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if user is already in a team
    if (user.teams && user.teams.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already in a team'
      })
    }

    // Add user to team
    await team.addUser(user)

    return {
      success: true,
      message: 'User added to team successfully'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error adding member to team:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})