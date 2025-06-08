export default defineEventHandler(async event => {
  try {
    const teamId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { userEmail } = body

    if (!teamId || !userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and user email are required',
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize, QueryTypes } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
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
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Find the user to remove
    const userToRemove = await User.findOne({ where: { email: userEmail } })
    if (!userToRemove) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Check if user is a member of this team
    const isMember = team.members?.some(member => member.id === userToRemove.id)
    if (!isMember) {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'User is not a member of this team',
      })
    }

    // Cannot remove the captain
    if (userToRemove.id === team.captainId) {
      await sequelize.close()
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

    await sequelize.close()

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
