import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (_event) => {
  try {
    const { User, Team } = useModels()
    
    // Find users who are not in any team
    const availableUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'picture', 'role'],
      include: [{
        model: Team,
        as: 'teams',
        required: false,
        through: { attributes: [] }
      }],
      where: {
        '$teams.id$': null
      }
    })

    return {
      success: true,
      data: availableUsers
    }
  } catch (error) {
    console.error('Error fetching available users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})