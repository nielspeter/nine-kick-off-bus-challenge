import { getServerSession } from '#auth'

export default defineEventHandler(async event => {
  try {
    // Verify user session
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    const body = await readBody(event)
    const { teamId, userEmail } = body

    if (!teamId || !userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and user email are required',
      })
    }

    // Verify that the requesting user matches the userEmail
    if (session.user.email !== userEmail) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only join teams for yourself',
      })
    }

    const { getDatabase } = await import('~/server/utils/db')
    const { QueryTypes } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { User, Team } = initModels(sequelize)

    // Find user
    const user = await User.findOne({ where: { email: userEmail } })
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Find team
    const team = await Team.findByPk(teamId)
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Check if user is already in a team
    const existingMembership = await sequelize.query(
      'SELECT * FROM "TeamMembers" WHERE "UserId" = ?',
      { replacements: [user.id], type: QueryTypes.SELECT }
    )

    if (existingMembership.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already a member of a team',
      })
    }

    // Check team size limit (max 4 members)
    const teamMemberCount = await sequelize.query(
      'SELECT COUNT(*) as count FROM "TeamMembers" WHERE "TeamId" = ?',
      { replacements: [teamId], type: QueryTypes.SELECT }
    )

    if ((teamMemberCount[0] as any).count >= 4) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team is full (maximum 4 members)',
      })
    }

    // Add user to team
    await sequelize.query(
      'INSERT INTO "TeamMembers" ("TeamId", "UserId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      { replacements: [teamId, user.id], type: QueryTypes.INSERT }
    )

    // Fetch updated team data
    const teamWithMembers = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'email', 'name', 'picture', 'role'],
        },
        {
          model: User,
          as: 'captain',
          attributes: ['id', 'email', 'name', 'picture', 'role'],
        },
      ],
    })

    return {
      success: true,
      team: teamWithMembers,
      message: `${user.name} joined the team successfully`,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to join team',
    })
  }
})
