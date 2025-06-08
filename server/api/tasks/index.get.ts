import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async (_event) => {
  try {
    const sequelize = await getDatabase()
    
    // Get all tasks using raw SQL
    const [results] = await sequelize.query(`
      SELECT 
        id,
        title,
        category,
        description,
        "estimatedTime",
        difficulty,
        "createdAt"
      FROM "Tasks"
      ORDER BY category ASC, title ASC
    `)

    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})