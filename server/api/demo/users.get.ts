export default defineEventHandler(async () => {
  try {
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
    const { User } = initModels(sequelize)

    // Get first 10 users as sample
    const users = await User.findAll({
      limit: 10,
      attributes: ['id', 'email', 'name', 'role', 'isAdmin']
    })

    await sequelize.close()

    return {
      success: true,
      count: users.length,
      users
    }

  } catch (error: any) {
    console.error('Error fetching users:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch users'
    })
  }
})