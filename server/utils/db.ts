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

  const { Sequelize } = await import('sequelize')
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
  console.log('✅ Database singleton connection established')

  return instance
}
