export default defineEventHandler(async event => {
  try {
    const { getDatabase } = await import('~/server/utils/db')
    const { initModels } = await import('~/server/models')
    const { calculateTeamScore, formatScoreDisplay } = await import('~/server/utils/scoring')

    const sequelize = await getDatabase()
    const { Team, User, Submission, Task } = initModels(sequelize)

    // Get all teams with their members
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

    // Get submission data for each team including task difficulty and ratings
    const teamScores = await Promise.all(
      teams.map(async team => {
        const completedSubmissions = await Submission.findAll({
          where: {
            teamId: team.id,
            status: 'completed',
          },
          include: [
            {
              model: Task,
              as: 'task',
              attributes: ['title', 'difficulty'],
            },
          ],
          attributes: ['id', 'rating'],
        })

        const inProgressCount = await Submission.count({
          where: {
            teamId: team.id,
            status: 'in_progress',
          },
        })

        // Calculate team score using new scoring module
        const teamScore = calculateTeamScore(
          completedSubmissions.map(sub => ({
            id: sub.id,
            task: {
              title: (sub as any).task.title,
              difficulty: (sub as any).task.difficulty,
            },
            rating: sub.rating,
          }))
        )

        // Set team info
        teamScore.teamId = team.id
        teamScore.teamName = team.name

        // Get formatted display text
        const display = formatScoreDisplay(teamScore)

        // Debug logging for scoring
        if (team.name) {
          console.log(
            `Team ${team.name}: completed=${teamScore.completedCount}, rated=${teamScore.ratedCount}, totalScore=${teamScore.totalScore}`
          )
          if (teamScore.submissions.length > 0) {
            console.log(
              `  Submissions: ${teamScore.submissions.map(s => `${s.taskTitle}(D${s.difficulty}×${s.rating}⭐=${s.score}pts)`).join(', ')}`
            )
          }
        }

        return {
          id: team.id,
          name: team.name,
          captain: team.captain,
          memberCount: team.members?.length || 0,
          completedChallenges: teamScore.completedCount,
          activeChallenges: inProgressCount,
          avgRating: teamScore.averageRating,
          avgDifficulty: teamScore.averageDifficulty,
          ratedSubmissions: teamScore.ratedCount,
          unratedSubmissions: teamScore.unratedCount,
          totalScore: teamScore.totalScore,
          scoreBreakdown: display.breakdown,
          scoreDetails: display.details,
          lastActivity: team.updatedAt,
          // Include detailed submission breakdown for debugging
          submissions: teamScore.submissions,
        }
      })
    )

    // Sort teams by total score (manually since the function expects different type)
    teamScores.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore
      }
      if (a.completedChallenges !== b.completedChallenges) {
        return b.completedChallenges - a.completedChallenges
      }
      return b.avgRating - a.avgRating
    })

    console.log(`📈 Returning ${teamScores.length} teams in leaderboard`)
    console.log('Final leaderboard:', teamScores.map(t => `${t.name}: ${t.totalScore}`).join(', '))

    return {
      success: true,
      leaderboard: teamScores,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch leaderboard',
    })
  }
})
