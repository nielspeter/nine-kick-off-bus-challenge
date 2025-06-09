import type { Sequelize } from 'sequelize'

let sequelizeInstance: Sequelize | null = null
let initializationPromise: Promise<Sequelize> | null = null

export async function getDatabase(): Promise<Sequelize> {
  if (sequelizeInstance) {
    return sequelizeInstance
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return initializationPromise
  }

  // Start initialization
  initializationPromise = initializeDatabase()
  sequelizeInstance = await initializationPromise
  initializationPromise = null // Clear the promise once done

  return sequelizeInstance
}

async function initializeDatabase(): Promise<Sequelize> {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL not configured')
  }

  console.log('🚀 Database initialization starting...')
  console.log('📝 DATABASE_URL found, initializing database...')

  const { Sequelize } = await import('sequelize')
  const { initModels } = await import('~/server/models')

  const instance = new Sequelize(config.databaseUrl, {
    logging: false,
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  })

  // Test the connection
  await instance.authenticate()
  console.log('Database connection established successfully')

  // Initialize models
  initModels(instance)
  console.log('Database models initialized')

  // Sync models with database (create tables if they don't exist)
  await instance.sync({ alter: false })
  console.log('Database models synchronized')

  console.log('✅ Database singleton connection established')

  return instance
}
