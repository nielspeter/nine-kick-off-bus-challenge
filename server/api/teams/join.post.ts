export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { teamId, userEmail } = body

    if (!teamId || !userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and user email are required',
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

    // Check if user is already in a team
    const existingMembership = await sequelize.query(
      'SELECT * FROM "TeamMembers" WHERE "UserId" = ?',
      { replacements: [user.id], type: sequelize.QueryTypes.SELECT }
    )

    if (existingMembership.length > 0) {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already a member of a team',
      })
    }

    // Check team size limit (max 4 members)
    const teamMemberCount = await sequelize.query(
      'SELECT COUNT(*) as count FROM "TeamMembers" WHERE "TeamId" = ?',
      { replacements: [teamId], type: sequelize.QueryTypes.SELECT }
    )

    if (teamMemberCount[0].count >= 4) {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'Team is full (maximum 4 members)',
      })
    }

    // Add user to team
    await sequelize.query(
      'INSERT INTO "TeamMembers" ("TeamId", "UserId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      { replacements: [teamId, user.id], type: sequelize.QueryTypes.INSERT }
    )

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
      message: `${user.name} joined the team successfully`,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to join team',
    })
  }
})
