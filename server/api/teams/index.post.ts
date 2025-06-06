import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { Team, User } = useModels()
    
    // Validate input
    if (!body.name || !body.captainId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team name and captain ID are required'
      })
    }

    // Check if captain exists and is not already in a team
    const captain = await User.findByPk(body.captainId, {
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] }
      }]
    })

    if (!captain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Captain not found'
      })
    }

    if (captain.teams && captain.teams.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Captain is already in a team'
      })
    }

    // Create team
    const team = await Team.create({
      name: body.name.trim(),
      captainId: body.captainId
    })

    // Add captain to team
    await team.addUser(captain)

    // Return team with members
    const teamWithMembers = await Team.findByPk(team.id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'email', 'picture', 'role'],
        through: { attributes: [] }
      }]
    })

    return {
      success: true,
      data: teamWithMembers
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error creating team:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})