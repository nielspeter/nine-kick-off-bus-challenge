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

    const body = await readBody(event)
    const { teamId, userEmail, forceDisband } = body

    if (!teamId || !userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and user email are required',
      })
    }

    // Verify that the requesting user matches the userEmail
    if (session.user.email !== userEmail) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only leave teams for yourself',
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { User, Team } = initModels(sequelize)

    // Find user
    const user = await User.findOne({ where: { email: userEmail } })
    if (!user) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Find team
    const team = await Team.findByPk(teamId)
    if (!team) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Check if user is the captain
    if (team.captainId === user.id) {
      // Check if there are other members
      const memberCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM "TeamMembers" WHERE "TeamId" = ?',
        { replacements: [teamId], type: sequelize.QueryTypes.SELECT }
      )

      if (memberCount[0].count > 1 && !forceDisband) {
        await sequelize.close()
        throw createError({
          statusCode: 400,
          statusMessage:
            'Captain cannot leave team with other members. Transfer captaincy or disband team first.',
        })
      }

      // If captain is the only member OR forceDisband is true, delete the team
      await sequelize.query('DELETE FROM "TeamMembers" WHERE "TeamId" = ?', {
        replacements: [teamId],
        type: sequelize.QueryTypes.DELETE,
      })

      await Team.destroy({ where: { id: teamId } })

      await sequelize.close()

      const message = forceDisband
        ? 'Team disbanded successfully (all members removed)'
        : 'Team disbanded successfully'
      return {
        success: true,
        message,
        teamDisbanded: true,
      }
    }

    // Remove user from team
    await sequelize.query('DELETE FROM "TeamMembers" WHERE "TeamId" = ? AND "UserId" = ?', {
      replacements: [teamId, user.id],
      type: sequelize.QueryTypes.DELETE,
    })

    // Fetch updated team data
    const teamWithMembers = await Team.findByPk(teamId, {
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
      team: teamWithMembers,
      message: `${user.name} left the team successfully`,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to leave team',
    })
  }
})
