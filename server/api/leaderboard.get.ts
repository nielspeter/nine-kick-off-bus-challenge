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

    console.log(`📊 Found ${teams.length} teams for leaderboard calculation`)

    // Get submission data for each team including ratings
    const leaderboard = await Promise.all(
      teams.map(async team => {
        const completedSubmissions = await Submission.findAll({
          where: {
            teamId: team.id,
            status: 'completed',
          },
          attributes: ['id', 'rating'],
        })

        const inProgressCount = await Submission.count({
          where: {
            teamId: team.id,
            status: 'in_progress',
          },
        })

        // Calculate quality metrics
        const completedCount = completedSubmissions.length
        const ratedSubmissions = completedSubmissions.filter(
          sub => sub.rating !== null && sub.rating !== undefined
        )
        const avgRating =
          ratedSubmissions.length > 0
            ? ratedSubmissions.reduce((sum, sub) => {
                const rating = parseFloat(String(sub.rating || 0))
                return sum + rating
              }, 0) / ratedSubmissions.length
            : 0

        // Quality-adjusted score: completedCount × avgRating
        // If no ratings yet, use completedCount × 3 (neutral score)
        const qualityMultiplier = avgRating > 0 ? avgRating : completedCount > 0 ? 3 : 0
        const totalScore = parseFloat((completedCount * qualityMultiplier).toFixed(1))

        // Debug logging for rating issues
        if (team.name) {
          console.log(
            `Team ${team.name}: completed=${completedCount}, ratedSubs=${ratedSubmissions.length}, avgRating=${avgRating}, qualityMultiplier=${qualityMultiplier}, totalScore=${totalScore}`
          )
          if (completedSubmissions.length > 0) {
            console.log(
              `  All submissions ratings: ${completedSubmissions.map(sub => `${sub.rating} (${typeof sub.rating})`).join(', ')}`
            )
          }
          if (ratedSubmissions.length > 0) {
            console.log(
              `  Filtered rated submissions: ${ratedSubmissions.map(sub => sub.rating).join(', ')}`
            )
          }
        }

        return {
          id: team.id,
          name: team.name,
          captain: team.captain,
          memberCount: team.members?.length || 0,
          completedChallenges: completedCount,
          activeChallenges: inProgressCount,
          avgRating: parseFloat(avgRating.toFixed(1)),
          ratedSubmissions: ratedSubmissions.length,
          totalScore,
          lastActivity: team.updatedAt,
        }
      })
    )

    // Sort by total score (descending), then by completed challenges, then by last activity
    leaderboard.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore
      }
      if (a.completedChallenges !== b.completedChallenges) {
        return b.completedChallenges - a.completedChallenges
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })

    console.log(`📈 Returning ${leaderboard.length} teams in leaderboard`)
    console.log('Final leaderboard:', leaderboard.map(t => `${t.name}: ${t.totalScore}`).join(', '))

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
