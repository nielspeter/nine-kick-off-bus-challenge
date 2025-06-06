// Mock team creation endpoint for testing without database
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, captainEmail } = body

    if (!name || !captainEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Team name and captain email are required'
      })
    }

    // Mock user data
    const mockCaptain = {
      id: 'user_anv',
      email: 'anv@nine.dk',
      name: 'Aku Nour Shirazi Valta',
      role: 'Software Developer',
      picture: null
    }

    // Mock team data
    const mockTeam = {
      id: `team_${Date.now()}`,
      name,
      captainId: mockCaptain.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      captain: mockCaptain,
      members: [mockCaptain]
    }

    return {
      success: true,
      team: mockTeam,
      message: `Team "${name}" created successfully with ${mockCaptain.name} as captain`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create team'
    })
  }
})