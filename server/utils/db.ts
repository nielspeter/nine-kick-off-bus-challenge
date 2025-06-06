import type { Sequelize } from 'sequelize'
import { User, Team, Task, Submission } from '../models'

export async function useSequelize(): Promise<Sequelize> {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL not configured')
  }
  
  const { Sequelize } = await import('sequelize')
  return new Sequelize(config.databaseUrl, {
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  })
}

export function useModels() {
  return {
    User,
    Team,
    Task,
    Submission
  }
}