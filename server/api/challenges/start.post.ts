export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { teamId, taskId } = body

    if (!teamId || !taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team ID and task ID are required'
      })
    }

    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Team, Task, Submission } = initModels(sequelize)

    // Verify team exists
    const team = await Team.findByPk(teamId)
    if (!team) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found'
      })
    }

    // Verify task exists
    const task = await Task.findByPk(taskId)
    if (!task) {
      await sequelize.close()
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found'
      })
    }

    // Check if team already has an active submission for this task
    const existingSubmission = await Submission.findOne({
      where: {
        teamId,
        taskId,
        status: 'in_progress'
      }
    })

    if (existingSubmission) {
      await sequelize.close()
      return {
        success: true,
        submission: existingSubmission,
        message: 'Task already in progress'
      }
    }

    // Check if team has completed this task
    const completedSubmission = await Submission.findOne({
      where: {
        teamId,
        taskId,
        status: 'completed'
      }
    })

    if (completedSubmission) {
      await sequelize.close()
      throw createError({
        statusCode: 400,
        statusMessage: 'Task already completed by this team'
      })
    }

    // Create new submission
    const submission = await Submission.create({
      teamId,
      taskId,
      status: 'in_progress',
      chatHistory: [],
      finalAnswers: []
    })

    // Fetch submission with task and team details
    const submissionWithDetails = await Submission.findByPk(submission.id, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'category', 'description', 'estimatedTime', 'difficulty']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name']
        }
      ]
    })

    await sequelize.close()

    return {
      success: true,
      submission: submissionWithDetails,
      message: 'Challenge started successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to start challenge'
    })
  }
})