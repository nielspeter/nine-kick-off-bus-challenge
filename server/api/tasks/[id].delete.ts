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

    const taskId = getRouterParam(event, 'id')
    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required',
      })
    }

    const sequelize = await getDatabase()
    const { initModels } = await import('~/server/models')
    const { Task } = initModels(sequelize)

    // Find task
    const task = await Task.findByPk(taskId)
    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found',
      })
    }

    // Delete task
    await task.destroy()

    return {
      success: true,
      message: 'Task deleted successfully',
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete task',
    })
  }
})
