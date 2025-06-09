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

    const teamId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { userEmail } = body

    if (!teamId || !userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and user email are required',
      })
    }

    const { getDatabase } = await import('~/server/utils/db')
    const { QueryTypes } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { User, Team } = initModels(sequelize)

    // Find the team
    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'email', 'name', 'picture', 'role'],
        },
      ],
    })

    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Find the requesting user
    const requestingUser = await User.findOne({ where: { email: session.user.email } })
    if (!requestingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Requesting user not found',
      })
    }

    // Verify that the requesting user is the team captain
    if (team.captainId !== requestingUser.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only team captains can remove members',
      })
    }

    // Find the user to remove
    const userToRemove = await User.findOne({ where: { email: userEmail } })
    if (!userToRemove) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Check if user is a member of this team
    const isMember = team.members?.some(member => member.id === userToRemove.id)
    if (!isMember) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is not a member of this team',
      })
    }

    // Cannot remove the captain
    if (userToRemove.id === team.captainId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot remove team captain. Transfer captaincy first.',
      })
    }

    // Remove the user from the team using raw SQL
    await sequelize.query('DELETE FROM "TeamMembers" WHERE "TeamId" = ? AND "UserId" = ?', {
      replacements: [teamId, userToRemove.id],
      type: QueryTypes.DELETE,
    })

    // Get updated team data
    const updatedTeam = await Team.findByPk(teamId, {
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
    })

    return {
      success: true,
      message: 'Team member removed successfully',
      team: updatedTeam,
    }
  } catch (error: unknown) {
    console.error('Remove team member error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to remove team member',
    })
  }
})
