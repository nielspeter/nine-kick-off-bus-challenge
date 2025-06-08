import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async _event => {
  try {
    const sequelize = await getDatabase()

    // Test basic database connection
    console.log('Testing database connection...')

    // Test raw SQL
    const [results] = await sequelize.query('SELECT COUNT(*) FROM "Users"')
    console.log('Raw SQL results:', results)

    // Get first 3 users
    const [sampleUsers] = await sequelize.query('SELECT * FROM "Users" LIMIT 3')
    console.log('Sample users:', sampleUsers)

    // Check what tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    // Check Teams table
    const [teams] = await sequelize.query('SELECT * FROM "Teams"')

    // Check TeamMembers table
    const [teamMembers] = await sequelize.query('SELECT * FROM "TeamMembers"')

    return {
      success: true,
      rawCount: results,
      sampleUsers: sampleUsers,
      tables: tables,
      teams: teams,
      teamMembers: teamMembers,
      message: 'Database connection test successful',
    }
  } catch (error) {
    console.error('Database test failed:', error)
    return {
      success: false,
      error: String(error),
      message: 'Database connection failed',
    }
  }
})
