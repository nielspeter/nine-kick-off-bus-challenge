import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const teamId = getRouterParam(event, 'id')
    const { Submission, Task } = useModels()
    
    const submissions = await Submission.findAll({
      where: { teamId },
      include: [{
        model: Task,
        as: 'task',
        attributes: ['id', 'title', 'category']
      }],
      attributes: ['id', 'taskId', 'status', 'submittedAt', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    return {
      success: true,
      data: submissions
    }
  } catch (error) {
    console.error('Error fetching team submissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})