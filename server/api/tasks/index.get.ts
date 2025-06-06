import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (_event) => {
  try {
    const { Task } = useModels()
    
    const tasks = await Task.findAll({
      attributes: ['id', 'title', 'category', 'description', 'estimatedTime', 'difficulty', 'createdAt'],
      order: [['category', 'ASC'], ['title', 'ASC']]
    })

    return {
      success: true,
      data: tasks
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})