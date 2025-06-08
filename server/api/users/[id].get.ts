export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const config = useRuntimeConfig()
    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { User } = initModels(sequelize)

    // Find user by ID
    const user = await User.findByPk(userId)
    await sequelize.close()

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        isAdmin: user.isAdmin
      }
    }
  } catch (error: any) {
    console.error('Error fetching user:', error)
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user details'
    })
  }
})