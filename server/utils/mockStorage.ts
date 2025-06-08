// In-memory storage for mock data during development
// This allows mock endpoints to share data between requests

interface MockTeam {
  id: string
  name: string
  captainId: string
  createdAt: string
  updatedAt: string
  captain: MockUser
  members: MockUser[]
}

interface MockUser {
  id: string
  email: string
  name: string
  role: string
  picture?: string | null
}

// In-memory storage
const storage = {
  teams: new Map<string, MockTeam>(),
  users: new Map<string, MockUser>()
}

// Initialize with default data
function initializeStorage() {
  // Default user
  const defaultUser: MockUser = {
    id: 'user_anv',
    email: 'anv@nine.dk',
    name: 'Aku Nour Shirazi Valta',
    role: 'Software Developer',
    picture: null
  }
  
  storage.users.set(defaultUser.id, defaultUser)
  
  // Add more mock users
  const mockUsers: MockUser[] = [
    { id: 'user_jd', email: 'jd@nine.dk', name: 'John Doe', role: 'Project Manager', picture: null },
    { id: 'user_js', email: 'js@nine.dk', name: 'Jane Smith', role: 'UX Designer', picture: null },
    { id: 'user_mb', email: 'mb@nine.dk', name: 'Mike Brown', role: 'Backend Developer', picture: null },
    { id: 'user_ej', email: 'ej@nine.dk', name: 'Emma Johnson', role: 'Frontend Developer', picture: null },
    { id: 'user_tw', email: 'tw@nine.dk', name: 'Tom Wilson', role: 'QA Engineer', picture: null },
    { id: 'user_sm', email: 'sm@nine.dk', name: 'Sarah Miller', role: 'Business Analyst', picture: null },
    { id: 'user_rg', email: 'rg@nine.dk', name: 'Robert Garcia', role: 'DevOps Engineer', picture: null }
  ]
  
  mockUsers.forEach(user => storage.users.set(user.id, user))
}

// Initialize on first import
initializeStorage()

export const mockStorage = {
  // Teams
  getTeams(): MockTeam[] {
    return Array.from(storage.teams.values())
  },
  
  getTeam(id: string): MockTeam | undefined {
    return storage.teams.get(id)
  },
  
  createTeam(name: string, captainId: string): MockTeam {
    const captain = storage.users.get(captainId)
    if (!captain) {
      throw new Error('Captain not found')
    }
    
    // Check if captain already in a team
    const existingTeam = Array.from(storage.teams.values()).find(team =>
      team.members.some(member => member.id === captainId)
    )
    
    if (existingTeam) {
      throw new Error('User is already a member of a team')
    }
    
    const team: MockTeam = {
      id: `team_${Date.now()}`,
      name,
      captainId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      captain,
      members: [captain]
    }
    
    storage.teams.set(team.id, team)
    return team
  },
  
  addMemberToTeam(teamId: string, userId: string): MockTeam {
    const team = storage.teams.get(teamId)
    if (!team) {
      throw new Error('Team not found')
    }
    
    const user = storage.users.get(userId)
    if (!user) {
      throw new Error('User not found')
    }
    
    // Check if user already in a team
    const existingTeam = Array.from(storage.teams.values()).find(t =>
      t.members.some(member => member.id === userId)
    )
    
    if (existingTeam) {
      throw new Error('User is already a member of a team')
    }
    
    if (team.members.length >= 4) {
      throw new Error('Team is already full')
    }
    
    team.members.push(user)
    team.updatedAt = new Date().toISOString()
    
    return team
  },
  
  removeMemberFromTeam(teamId: string, userId: string): MockTeam | null {
    const team = storage.teams.get(teamId)
    if (!team) {
      throw new Error('Team not found')
    }
    
    team.members = team.members.filter(member => member.id !== userId)
    team.updatedAt = new Date().toISOString()
    
    // If team is empty or captain left and team has only 1 member, delete team
    if (team.members.length === 0 || (userId === team.captainId && team.members.length === 1)) {
      storage.teams.delete(teamId)
      return null
    }
    
    // If captain left, assign new captain
    if (userId === team.captainId && team.members.length > 0) {
      team.captainId = team.members[0].id
      team.captain = team.members[0]
    }
    
    return team
  },
  
  // Users
  getUsers(): MockUser[] {
    return Array.from(storage.users.values())
  },
  
  getUser(id: string): MockUser | undefined {
    return storage.users.get(id)
  },
  
  getUserByEmail(email: string): MockUser | undefined {
    return Array.from(storage.users.values()).find(user => user.email === email)
  },
  
  getAvailableUsers(): MockUser[] {
    const usersInTeams = new Set<string>()
    
    Array.from(storage.teams.values()).forEach(team => {
      team.members.forEach(member => usersInTeams.add(member.id))
    })
    
    return Array.from(storage.users.values()).filter(user => !usersInTeams.has(user.id))
  }
}