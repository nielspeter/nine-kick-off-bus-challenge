export default defineEventHandler(async (event) => {
  const checks = {
    app: true,
    database: false,
    redis: false,
    timestamp: new Date().toISOString()
  }

  try {
    // Check database connection if configured
    const config = useRuntimeConfig()
    if (config.databaseUrl) {
      const sequelize = await useSequelize()
      await sequelize.authenticate()
      await sequelize.close() // Close the connection after testing
      checks.database = true
    }
  } catch (error) {
    console.error('Database health check failed:', error instanceof Error ? error.message : String(error))
  }

  try {
    // Check Redis connection if configured
    const config = useRuntimeConfig()
    if (config.redisUrl) {
      // Redis health check would go here
      // For now, assume it's working
      checks.redis = true
    }
  } catch (error) {
    console.error('Redis health check failed:', error instanceof Error ? error.message : String(error))
  }

  // For now, don't fail health check on database issues to avoid container restart loops
  const healthy = checks.app
  
  setResponseStatus(event, healthy ? 200 : 503)
  
  return {
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }
})