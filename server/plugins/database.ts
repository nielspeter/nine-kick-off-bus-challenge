import { Sequelize } from 'sequelize'
import { initModels } from '../models'

export default defineNitroPlugin(async () => {
  console.log('🚀 Database plugin starting...')
  const config = useRuntimeConfig()
  
  if (!config.databaseUrl) {
    console.warn('DATABASE_URL not configured, skipping database initialization')
    return
  }
  
  console.log('📝 DATABASE_URL found, initializing database...')

  try {
    const sequelize = new Sequelize(config.databaseUrl, {
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    })

    // Test the connection
    await sequelize.authenticate()
    console.log('Database connection established successfully')

    // Initialize models
    initModels(sequelize)

    // Sync models with database
    await sequelize.sync({ alter: true })
    console.log('Database models synchronized')

    // Store sequelize instance globally
    globalThis.__sequelize = sequelize
    console.log('✅ Database singleton connection established')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
})