import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async (_event) => {
  try {
    const sequelize = await getDatabase()
    
    // Get all users with their team information
    const [results] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.picture,
        u.role,
        u."isAdmin",
        t.id as team_id,
        t.name as team_name,
        t."captainId" as team_captain_id,
        CASE WHEN t."captainId" = u.id THEN true ELSE false END as is_captain
      FROM "Users" u
      LEFT JOIN "TeamMembers" tm ON u.id = tm."UserId"
      LEFT JOIN "Teams" t ON tm."TeamId" = t.id
      ORDER BY u.name ASC
    `)

    // Format the team info properly
    const usersWithTeamInfo = (results as any[]).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      isAdmin: user.isAdmin,
      team: user.team_id ? {
        id: user.team_id,
        name: user.team_name,
        captainId: user.team_captain_id,
        isCaptain: user.is_captain
      } : null
    }))

    return {
      success: true,
      data: usersWithTeamInfo
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      data: [],
      error: String(error)
    }
  }
})