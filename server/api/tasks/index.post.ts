import { getServerSession } from '#auth'
import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async event => {
  try {
    // Verify user session and admin access
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    // Check if user is admin
    if (!(session.user as any)?.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin privileges required',
      })
    }

    const body = await readBody(event)
    const { title, category, description, estimatedTime, difficulty } = body

    if (!title || !category || !description || !estimatedTime || !difficulty) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields are required',
      })
    }

    const sequelize = await getDatabase()
    const { initModels } = await import('~/server/models')
    const { Task } = initModels(sequelize)

    // Create new task
    const task = await Task.create({
      title,
      category,
      description,
      estimatedTime,
      difficulty,
    })

    return {
      success: true,
      task,
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create task',
    })
  }
})
