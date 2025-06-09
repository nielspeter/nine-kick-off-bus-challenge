import { getServerSession } from '#auth'
import { getDatabase } from '~/server/utils/db'
import { initModels } from '~/server/models'
import { getRedisClient } from '~/server/utils/redis'

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
    const { submissionId, finalAnswers } = body

    if (!submissionId || !finalAnswers) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Submission ID and final answers are required',
      })
    }

    const sequelize = await getDatabase()
    const { Submission, Task, Team } = initModels(sequelize)

    // Find submission
    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['title', 'category', 'description'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name'],
        },
      ],
    })

    if (!submission) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    if (submission.status !== 'in_progress') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Challenge is not active',
      })
    }

    // Check if competition is paused
    const { getCompetitionState } = await import('~/server/utils/competitionState')
    const competitionState = await getCompetitionState()

    if (competitionState.isPaused) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Competition is currently paused. Please wait for it to resume.',
      })
    }

    // Update submission
    await submission.update({
      status: 'completed',
      finalAnswers,
      submittedAt: new Date(),
    })

    // Broadcast submission update to team members via Redis
    try {
      const redisClient = await getRedisClient()
      await redisClient.publish(
        `challenge:${submissionId}:answer`,
        JSON.stringify({
          type: 'submission_completed',
          submissionId,
          finalAnswers,
          submittedAt: new Date().toISOString(),
          submittedBy: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          },
          task: {
            title: submission.task.title,
            category: submission.task.category,
          },
          team: {
            name: submission.team.name,
          },
          timestamp: new Date().toISOString(),
        })
      )
      console.log(`📢 Broadcasted submission completion for ${submissionId}`)
    } catch (redisError) {
      console.error('Failed to broadcast submission completion:', redisError)
      // Don't fail the submission if Redis is unavailable
    }

    return {
      success: true,
      submission,
      message: 'Challenge submitted successfully!',
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to submit challenge',
    })
  }
})
