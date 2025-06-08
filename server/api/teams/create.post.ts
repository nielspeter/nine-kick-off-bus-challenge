export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { name, captainEmail } = body

    if (!name || !captainEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team name and captain email are required',
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { User, Team } = initModels(sequelize)

    // Find captain
    const captain = await User.findOne({ where: { email: captainEmail } })
    if (!captain) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Captain not found',
      })
    }

    // Check if captain is already in a team
    const existingMembership = await sequelize.query(
      'SELECT * FROM "TeamMembers" WHERE "UserId" = ?',
      { replacements: [captain.id], type: sequelize.QueryTypes.SELECT }
    )

    if (existingMembership.length > 0) {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already a member of a team',
      })
    }

    // Create team
    const team = await Team.create({
      name,
      captainId: captain.id,
    })

    // Add captain as first member
    await sequelize.query(
      'INSERT INTO "TeamMembers" ("TeamId", "UserId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      { replacements: [team.id, captain.id], type: sequelize.QueryTypes.INSERT }
    )

    // Fetch complete team data
    const teamWithMembers = await Team.findByPk(team.id, {
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
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create team',
    })
  }
})
