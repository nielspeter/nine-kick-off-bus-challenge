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

    const teamId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { userEmail } = body

    if (!teamId || !userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and user email are required',
      })
    }

    const { getDatabase } = await import('~/server/utils/db')
    const { QueryTypes } = await import('sequelize')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { User, Team } = initModels(sequelize)

    // Find the team
    const team = await Team.findByPk(teamId)
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Find the requesting user (captain)
    const requestingUser = await User.findOne({ where: { email: session.user.email } })
    if (!requestingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Requesting user not found',
      })
    }

    // Verify that the requesting user is the team captain
    if (team.captainId !== requestingUser.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only team captains can invite members',
      })
    }

    // Find the user to invite
    const userToInvite = await User.findOne({ where: { email: userEmail } })
    if (!userToInvite) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User to invite not found',
      })
    }

    // Check if user is already in a team
    const existingMembership = await sequelize.query(
      'SELECT * FROM "TeamMembers" WHERE "UserId" = ?',
      { replacements: [userToInvite.id], type: QueryTypes.SELECT }
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
      { replacements: [teamId, userToInvite.id], type: QueryTypes.INSERT }
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
      message: `${userToInvite.name} was invited to the team successfully`,
    }
  } catch (error: unknown) {
    console.error('Invite team member error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to invite team member',
    })
  }
})
