import type { Sequelize } from 'sequelize'

let sequelizeInstance: Sequelize | null = null

export async function getDatabase(): Promise<Sequelize> {
  if (sequelizeInstance) {
    return sequelizeInstance
  }

  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL not configured')
  }
  
  const { Sequelize } = await import('sequelize')
  sequelizeInstance = new Sequelize(config.databaseUrl, {
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  })

  // Test the connection
  await sequelizeInstance.authenticate()
  console.log('✅ Database singleton connection established')
  
  return sequelizeInstance
}