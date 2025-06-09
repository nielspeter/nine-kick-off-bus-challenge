import { getServerSession } from '#auth'

export default defineEventHandler(async event => {
  try {
    // Verify user session using @sidebase/nuxt-auth
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    const body = await readBody(event)
    const { name, captainEmail } = body

    if (!name || !captainEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team name and captain email are required',
      })
    }

    // Verify that the requesting user is the captain
    if (session.user.email !== captainEmail) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create teams for yourself',
      })
    }

    const { getDatabase } = await import('~/server/utils/db')
    const { QueryTypes } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { User, Team } = initModels(sequelize)

    // Find captain
    const captain = await User.findOne({ where: { email: captainEmail } })
    if (!captain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Captain not found',
      })
    }

    // Check if captain is already in a team
    const existingMembership = await sequelize.query(
      'SELECT * FROM "TeamMembers" WHERE "UserId" = ?',
      { replacements: [captain.id], type: QueryTypes.SELECT }
    )

    if (existingMembership.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is already a member of a team',
      })
    }

    // Create team
    const team = await Team.create({
      name,
      captainId: captain.id,
    })

    // Add captain as first member
    await sequelize.query(
      'INSERT INTO "TeamMembers" ("TeamId", "UserId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      { replacements: [team.id, captain.id], type: QueryTypes.INSERT }
    )

    // Fetch complete team data
    const teamWithMembers = await Team.findByPk(team.id, {
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
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create team',
    })
  }
})
