export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { teamId, newCaptainId, currentCaptainEmail } = body

    if (!teamId || !newCaptainId || !currentCaptainEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID, new captain ID, and current captain email are required'
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { User, Team } = initModels(sequelize)

    // Find current captain
    const currentCaptain = await User.findOne({ where: { email: currentCaptainEmail } })
    if (!currentCaptain) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Current captain not found'
      })
    }

    // Find team
    const team = await Team.findByPk(teamId)
    if (!team) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found'
      })
    }

    // Verify current user is the captain
    if (team.captainId !== currentCaptain.id) {
      await sequelize.close()
      throw createError({
        statusCode: 403,
        statusMessage: 'Only the current captain can transfer captaincy'
      })
    }

    // Find new captain
    const newCaptain = await User.findByPk(newCaptainId)
    if (!newCaptain) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'New captain not found'
      })
    }

    // Verify new captain is a member of the team
    const membershipCheck = await sequelize.query(
      'SELECT * FROM "TeamMembers" WHERE "TeamId" = ? AND "UserId" = ?',
      { replacements: [teamId, newCaptainId], type: sequelize.QueryTypes.SELECT }
    )

    if (membershipCheck.length === 0) {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'New captain must be a member of the team'
      })
    }

    // Transfer captaincy
    await Team.update(
      { captainId: newCaptainId },
      { where: { id: teamId } }
    )

    // Remove current captain from team
    await sequelize.query(
      'DELETE FROM "TeamMembers" WHERE "TeamId" = ? AND "UserId" = ?',
      { replacements: [teamId, currentCaptain.id], type: sequelize.QueryTypes.DELETE }
    )

    // Fetch updated team data
    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'email', 'name', 'picture', 'role']
        },
        {
          model: User,
          as: 'captain',
          attributes: ['id', 'email', 'name', 'picture', 'role']
        }
      ]
    })

    await sequelize.close()

    return {
      success: true,
      team: updatedTeam,
      message: `Captaincy transferred to ${newCaptain.name}. ${currentCaptain.name} left the team.`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to transfer captaincy'
    })
  }
})