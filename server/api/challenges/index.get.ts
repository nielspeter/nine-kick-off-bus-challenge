import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async () => {
  try {
    const sequelize = await getDatabase()
    
    // Get all tasks
    const [results] = await sequelize.query(`
      SELECT 
        id,
        title,
        category,
        description,
        "estimatedTime",
        difficulty,
        "createdAt"
      FROM "Tasks"
      ORDER BY category ASC, difficulty ASC
    `)

    const tasks = results as any[]
    
    // Group tasks by category
    const groupedTasks: Record<string, any[]> = {}
    tasks.forEach(task => {
      if (!groupedTasks[task.category]) {
        groupedTasks[task.category] = []
      }
      groupedTasks[task.category].push(task)
    })

    return {
      success: true,
      tasks,
      groupedTasks
    }
  } catch (error: any) {
    console.error('Error fetching challenges:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch challenges'
    })
  }
})