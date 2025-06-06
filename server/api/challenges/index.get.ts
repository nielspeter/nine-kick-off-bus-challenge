export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()
    const { Sequelize } = await import('sequelize')
    const { initModels } = await import('~/server/models')
    
    const sequelize = new Sequelize(config.databaseUrl, { logging: false })
    const { Task } = initModels(sequelize)

    const tasks = await Task.findAll({
      attributes: ['id', 'title', 'category', 'description', 'estimatedTime', 'difficulty'],
      order: [['category', 'ASC'], ['difficulty', 'ASC']]
    })

    await sequelize.close()

    // Group tasks by category
    const groupedTasks = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = []
      }
      acc[task.category].push(task)
      return acc
    }, {} as Record<string, any[]>)

    return {
      success: true,
      tasks,
      groupedTasks
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch challenges'
    })
  }
})