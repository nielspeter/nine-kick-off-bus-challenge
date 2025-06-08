import { getServerSession } from '#auth'
import { getDatabase } from '~/server/utils/db'
import { getCompetitionState } from '~/server/utils/competitionState'

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
    const { teamId, taskId } = body

    if (!teamId || !taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and task ID are required',
      })
    }

    // Check competition state
    const competitionState = await getCompetitionState()

    if (!competitionState.isStarted) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Competition has not started yet. Please wait for the competition to begin.',
      })
    }

    if (competitionState.isPaused) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Competition is currently paused. Please wait for it to resume.',
      })
    }

    // Check if competition has ended
    if (competitionState.endTime && new Date() > new Date(competitionState.endTime)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Competition has ended. No new challenges can be started.',
      })
    }

    const sequelize = await getDatabase()

    // Verify team exists
    const [teamCheck] = await sequelize.query(
      `
      SELECT id, name FROM "Teams" WHERE id = :teamId
    `,
      {
        replacements: { teamId },
      }
    )

    if (!teamCheck || (teamCheck as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found',
      })
    }

    // Verify task exists
    const [taskCheck] = await sequelize.query(
      `
      SELECT id, title, category, description, "estimatedTime", difficulty 
      FROM "Tasks" WHERE id = :taskId
    `,
      {
        replacements: { taskId },
      }
    )

    if (!taskCheck || (taskCheck as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found',
      })
    }

    // Check if team already has an active submission for this task
    const [existingSubmission] = await sequelize.query(
      `
      SELECT * FROM "Submissions" 
      WHERE "teamId" = :teamId AND "taskId" = :taskId AND status = 'in_progress'
    `,
      {
        replacements: { teamId, taskId },
      }
    )

    if (existingSubmission && (existingSubmission as any[]).length > 0) {
      return {
        success: true,
        submission: (existingSubmission as any[])[0],
        message: 'Task already in progress',
      }
    }

    // Check if team has any other active challenge (only one challenge at a time)
    const [activeChallenge] = await sequelize.query(
      `
      SELECT * FROM "Submissions" 
      WHERE "teamId" = :teamId AND status = 'in_progress'
    `,
      {
        replacements: { teamId },
      }
    )

    if (activeChallenge && (activeChallenge as any[]).length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Team already has an active challenge. Complete or forfeit the current challenge before starting a new one.',
      })
    }

    // Check if team has completed this task
    const [completedSubmission] = await sequelize.query(
      `
      SELECT * FROM "Submissions" 
      WHERE "teamId" = :teamId AND "taskId" = :taskId AND status = 'completed'
    `,
      {
        replacements: { teamId, taskId },
      }
    )

    if (completedSubmission && (completedSubmission as any[]).length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task already completed by this team',
      })
    }

    // Create new submission
    const submissionId = crypto.randomUUID()
    await sequelize.query(
      `
      INSERT INTO "Submissions" (id, "teamId", "taskId", status, "chatHistory", "finalAnswers", "createdAt", "updatedAt")
      VALUES (:id, :teamId, :taskId, 'in_progress', '[]', '[]', NOW(), NOW())
    `,
      {
        replacements: {
          id: submissionId,
          teamId,
          taskId,
        },
      }
    )

    // Fetch submission with task and team details
    const [submissionDetails] = await sequelize.query(
      `
      SELECT 
        s.*,
        t.title as task_title,
        t.category as task_category,
        t.description as task_description,
        t."estimatedTime" as task_estimated_time,
        t.difficulty as task_difficulty,
        team.name as team_name
      FROM "Submissions" s
      JOIN "Tasks" t ON s."taskId" = t.id
      JOIN "Teams" team ON s."teamId" = team.id
      WHERE s.id = :submissionId
    `,
      {
        replacements: { submissionId },
      }
    )

    return {
      success: true,
      submission: (submissionDetails as any[])[0],
      message: 'Challenge started successfully',
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to start challenge',
    })
  }
})
