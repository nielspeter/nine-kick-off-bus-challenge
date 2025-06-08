import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async _event => {
  try {
    const sequelize = await getDatabase()

    // Use raw query to get users not already in teams
    const [results] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.picture,
        u.role
      FROM "Users" u
      LEFT JOIN "TeamMembers" tm ON u.id = tm."UserId"
      WHERE tm."UserId" IS NULL
      ORDER BY u.name ASC
    `)

    return {
      success: true,
      data: results,
    }
  } catch (error) {
    console.error('Database error in available users:', error)
    return {
      success: false,
      data: [],
      error: String(error),
    }
  }
})
