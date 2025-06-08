import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async (_event) => {
  try {
    const sequelize = await getDatabase()
    
    // Use raw query with singleton connection
    const [results] = await sequelize.query(`
      SELECT 
        id,
        name,
        email,
        picture,
        role
      FROM "Users"
      ORDER BY name ASC
      LIMIT 50
    `)

    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error('Database error in available users:', error)
    return {
      success: false,
      data: [],
      error: String(error)
    }
  }
})