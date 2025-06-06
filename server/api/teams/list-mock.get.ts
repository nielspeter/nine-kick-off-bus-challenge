// Mock teams list endpoint for testing without database
export default defineEventHandler(async (event) => {
  try {
    // Mock team data
    const mockTeams = [
      {
        id: 'team_1',
        name: 'The AI Innovators',
        captainId: 'user_anv',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        captain: {
          id: 'user_anv',
          email: 'anv@nine.dk',
          name: 'Aku Nour Shirazi Valta',
          role: 'Software Developer'
        },
        members: [
          {
            id: 'user_anv',
            email: 'anv@nine.dk',
            name: 'Aku Nour Shirazi Valta',
            role: 'Software Developer'
          }
        ]
      }
    ]

    return {
      success: true,
      teams: mockTeams
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch teams'
    })
  }
})