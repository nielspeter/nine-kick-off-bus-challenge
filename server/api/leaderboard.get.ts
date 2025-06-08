export default defineEventHandler(async event => {
  try {
    const { getDatabase } = await import('~/server/utils/db')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    const { Team, User, Submission } = initModels(sequelize)

    // Get all teams with their completed submissions count
    const teams = await Team.findAll({
      include: [
        {
          model: User,
          as: 'captain',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    // Get submission counts for each team
    const leaderboard = await Promise.all(
      teams.map(async team => {
        const completedCount = await Submission.count({
          where: {
            teamId: team.id,
            status: 'completed',
          },
        })

        const inProgressCount = await Submission.count({
          where: {
            teamId: team.id,
            status: 'in_progress',
          },
        })

        return {
          id: team.id,
          name: team.name,
          captain: team.captain,
          memberCount: team.members?.length || 0,
          completedChallenges: completedCount,
          activeChallenges: inProgressCount,
          totalScore: completedCount, // Simple scoring: 1 point per completed challenge
          lastActivity: team.updatedAt,
        }
      })
    )

    // Sort by completed challenges (descending), then by last activity
    leaderboard.sort((a, b) => {
      if (a.completedChallenges !== b.completedChallenges) {
        return b.completedChallenges - a.completedChallenges
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })

    return {
      success: true,
      leaderboard,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch leaderboard',
    })
  }
})
