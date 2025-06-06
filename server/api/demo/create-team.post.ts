export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { teamName, memberEmails } = body

    if (!teamName || !memberEmails || !Array.isArray(memberEmails) || memberEmails.length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team name and at least 2 member emails are required'
      })
    }

    const config = useRuntimeConfig()
    
    if (!config.databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database URL not configured'
      })
    }

    // Import and create Sequelize instance
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const sequelize = new Sequelize(config.databaseUrl, {
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    })

    // Initialize models
    const { User, Team } = initModels(sequelize)

    // Find users by email
    const users = await User.findAll({
      where: {
        email: memberEmails
      }
    })

    if (users.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No users found with provided emails'
      })
    }

    if (users.length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: `Only found ${users.length} users, need at least 2`
      })
    }

    // Create team with first user as captain
    const captain = users[0]
    const team = await Team.create({
      name: teamName,
      captainId: captain.id
    })

    // Add all users to team using the through table
    for (const user of users) {
      await sequelize.query(
        'INSERT INTO "TeamMembers" ("TeamId", "UserId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
        {
          replacements: [team.id, user.id],
          type: sequelize.QueryTypes.INSERT
        }
      )
    }

    // Return team info with members
    const teamWithMembers = await Team.findByPk(team.id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'email', 'name', 'role']
      }, {
        model: User,
        as: 'captain',
        attributes: ['id', 'email', 'name', 'role']
      }]
    })

    await sequelize.close()

    return {
      success: true,
      team: teamWithMembers,
      message: `Team "${teamName}" created successfully with ${users.length} members`
    }

  } catch (error: any) {
    console.error('Error creating team:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create team'
    })
  }
})