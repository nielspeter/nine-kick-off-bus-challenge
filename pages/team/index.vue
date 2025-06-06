<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Team Management</h1>
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full"
          :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
        ></div>
        <span class="text-sm text-gray-600">
          {{ isConnected ? 'Live' : 'Offline' }}
        </span>
      </div>
    </div>
    
    <!-- User's Current Team -->
    <div v-if="userTeam" class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4 md:gap-0">
        <div>
          <h2 class="text-2xl font-semibold">{{ userTeam.name }}</h2>
          <p class="text-gray-600">{{ userTeam.members?.length || 0 }}/4 members</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button 
            v-if="isUserCaptain"
            @click="showInviteModal = true"
            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            :disabled="(userTeam.members?.length || 0) >= 4"
          >
            Invite Member
          </button>
          <button 
            v-if="!isUserCaptain"
            @click="leaveTeam"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Leave Team
          </button>
          <button 
            v-else-if="(userTeam.members?.length || 0) <= 1"
            @click="leaveTeam"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Disband Team
          </button>
          <button 
            v-else
            @click="showCaptainOptionsModal = true"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Leave/Disband Team
          </button>
        </div>
      </div>
      
      <!-- Team Members -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div 
          v-for="member in userTeam.members" 
          :key="member.id"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <img 
            v-if="member.picture" 
            :src="member.picture" 
            :alt="member.name"
            class="w-10 h-10 rounded-full"
          >
          <div v-else class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
            {{ member.name?.charAt(0) || '?' }}
          </div>
          <div class="flex-1">
            <div class="font-medium">{{ member.name }}</div>
            <div class="text-sm text-gray-600">{{ member.role }}</div>
            <div v-if="member.id === userTeam.captainId" class="text-xs text-primary font-medium">
              Team Captain
            </div>
          </div>
        </div>
      </div>

      <!-- Team Actions -->
      <div class="flex gap-4">
        <NuxtLink 
          to="/tasks" 
          class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-medium"
          :class="{ 'opacity-50 cursor-not-allowed': (userTeam.members?.length || 0) < 2 }"
        >
          View Challenges
        </NuxtLink>
        <span v-if="(userTeam.members?.length || 0) < 2" class="text-sm text-gray-500 self-center">
          Need at least 2 members to start challenges
        </span>
      </div>
    </div>

    <!-- Create/Join Team -->
    <div v-else class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-semibold mb-4">You're not on a team yet</h2>
      <div class="flex gap-4">
        <button 
          @click="showCreateModal = true"
          class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Create New Team
        </button>
        <button 
          @click="showJoinModal = true"
          class="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg hover:bg-primary/5"
        >
          Join Existing Team
        </button>
      </div>
    </div>

    <!-- All Teams -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4">All Teams</h2>
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading teams...</p>
      </div>
      <div v-else-if="teams.length === 0" class="text-center py-8 text-gray-600">
        No teams created yet. Be the first!
      </div>
      <div v-else class="grid gap-4">
        <div 
          v-for="team in teams" 
          :key="team.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-semibold">{{ team.name }}</h3>
              <p class="text-gray-600">{{ team.members?.length || 0 }}/4 members</p>
            </div>
            <button 
              v-if="!userTeam && (team.members?.length || 0) < 4"
              @click="joinTeam(team.id)"
              class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
            >
              Join
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="member in team.members?.slice(0, 3)" 
              :key="member.id"
              class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
            >
              {{ member.name }}
              <span v-if="member.id === team.captainId" class="text-primary">👑</span>
            </span>
            <span 
              v-if="(team.members?.length || 0) > 3"
              class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
            >
              +{{ (team.members?.length || 0) - 3 }} more
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Team Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Create New Team</h3>
        <form @submit.prevent="createTeam">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Team Name</label>
            <input 
              v-model="newTeamName"
              type="text" 
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter team name"
            >
          </div>
          <div class="flex justify-end gap-2">
            <button 
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="!newTeamName.trim()"
              class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Join Team Modal -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Join Team</h3>
        <div class="mb-4">
          <p class="text-gray-600 mb-4">Select a team to join:</p>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <button
              v-for="team in availableTeams"
              :key="team.id"
              @click="joinTeam(team.id)"
              class="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
            >
              <div class="font-medium">{{ team.name }}</div>
              <div class="text-sm text-gray-600">{{ team.members?.length || 0 }}/4 members</div>
            </button>
          </div>
        </div>
        <div class="flex justify-end">
          <button 
            @click="showJoinModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Invite Member Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Invite Team Member</h3>
        <form @submit.prevent="inviteMember">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Employee Email</label>
            <input 
              v-model="inviteEmail"
              type="email" 
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="colleague@nine.dk"
              pattern=".*@nine\.dk$"
              title="Must be a Nine email address"
            >
          </div>
          <div class="flex justify-end gap-2">
            <button 
              type="button"
              @click="showInviteModal = false"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="!inviteEmail.trim()"
              class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Captain Options Modal -->
    <div v-if="showCaptainOptionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Captain Options</h3>
        <p class="text-gray-600 mb-6">
          As team captain with other members, you can either transfer captaincy to another member or disband the entire team.
        </p>
        
        <div class="space-y-4">
          <!-- Transfer Captaincy Option -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium mb-2">Transfer Captaincy</h4>
            <p class="text-sm text-gray-600 mb-3">Choose a new captain and leave the team</p>
            <select 
              v-model="selectedNewCaptain" 
              class="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="">Select new captain...</option>
              <option 
                v-for="member in otherMembers" 
                :key="member.id" 
                :value="member.id"
              >
                {{ member.name }} ({{ member.email }})
              </option>
            </select>
            <button 
              @click="transferCaptaincy"
              :disabled="!selectedNewCaptain"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Transfer & Leave
            </button>
          </div>
          
          <!-- Disband Team Option -->
          <div class="border border-red-200 rounded-lg p-4">
            <h4 class="font-medium mb-2 text-red-800">Disband Team</h4>
            <p class="text-sm text-red-600 mb-3">Remove all members and delete the team permanently</p>
            <button 
              @click="disbandTeam"
              class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Disband Team
            </button>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button 
            @click="showCaptainOptionsModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Real-time updates
const { isConnected, startPolling, stopPolling } = useRealtime()

// Temporary mock data for testing without auth
const mockUser = {
  id: 'user_anv',
  email: 'anv@nine.dk',
  name: 'Aku Nour Shirazi Valta'
}

const teams = ref([])
const userTeam = ref(null)
const loading = ref(true)

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const showInviteModal = ref(false)
const showCaptainOptionsModal = ref(false)

const newTeamName = ref('')
const inviteEmail = ref('')
const selectedNewCaptain = ref('')

const isUserCaptain = computed(() => {
  return userTeam.value?.captainId === mockUser.id
})

const availableTeams = computed(() => {
  return teams.value.filter(team => 
    (team.members?.length || 0) < 4 && 
    !team.members?.find(member => member.id === mockUser.id)
  )
})

const otherMembers = computed(() => {
  if (!userTeam.value?.members) return []
  return userTeam.value.members.filter(member => member.id !== mockUser.id)
})

async function fetchTeams() {
  loading.value = true
  try {
    const response = await $fetch('/api/teams')
    teams.value = response.teams
    
    // Find user's team
    userTeam.value = teams.value.find(team => 
      team.members?.find(member => member.id === mockUser.id)
    ) || null
  } catch (error) {
    console.error('Failed to fetch teams:', error)
  }
  loading.value = false
}

async function createTeam() {
  try {
    const response = await $fetch('/api/teams/create', {
      method: 'POST',
      body: {
        name: newTeamName.value,
        captainEmail: mockUser.email
      }
    })
    
    showCreateModal.value = false
    newTeamName.value = ''
    await fetchTeams()
  } catch (error) {
    console.error('Failed to create team:', error)
    alert('Failed to create team: ' + error.message)
  }
}

async function joinTeam(teamId: string) {
  try {
    const response = await $fetch('/api/teams/join', {
      method: 'POST',
      body: {
        teamId,
        userEmail: mockUser.email
      }
    })
    
    showJoinModal.value = false
    await fetchTeams()
  } catch (error) {
    console.error('Failed to join team:', error)
    alert('Failed to join team: ' + error.message)
  }
}

async function leaveTeam() {
  if (!userTeam.value) return
  
  const confirmMessage = isUserCaptain.value 
    ? 'Are you sure you want to disband this team? This action cannot be undone.'
    : 'Are you sure you want to leave this team?'
    
  if (!confirm(confirmMessage)) return
  
  try {
    const response = await $fetch('/api/teams/leave', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        userEmail: mockUser.email
      }
    })
    
    await fetchTeams()
  } catch (error) {
    console.error('Failed to leave team:', error)
    alert('Failed to leave team: ' + error.message)
  }
}

async function inviteMember() {
  if (!userTeam.value) return
  
  try {
    const response = await $fetch('/api/teams/join', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        userEmail: inviteEmail.value
      }
    })
    
    showInviteModal.value = false
    inviteEmail.value = ''
    await fetchTeams()
  } catch (error) {
    console.error('Failed to invite member:', error)
    alert('Failed to invite member: ' + error.message)
  }
}

async function transferCaptaincy() {
  if (!selectedNewCaptain.value || !userTeam.value) return
  
  const confirmMessage = 'Are you sure you want to transfer captaincy and leave the team?'
  if (!confirm(confirmMessage)) return
  
  try {
    // First, create an API endpoint to transfer captaincy
    await $fetch('/api/teams/transfer-captain', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        newCaptainId: selectedNewCaptain.value,
        currentCaptainEmail: mockUser.email
      }
    })
    
    showCaptainOptionsModal.value = false
    selectedNewCaptain.value = ''
    await fetchTeams()
  } catch (error) {
    console.error('Failed to transfer captaincy:', error)
    alert('Failed to transfer captaincy: ' + error.message)
  }
}

async function disbandTeam() {
  if (!userTeam.value) return
  
  const confirmMessage = 'Are you sure you want to disband this team? This will remove all members and cannot be undone.'
  if (!confirm(confirmMessage)) return
  
  try {
    await $fetch('/api/teams/leave', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        userEmail: mockUser.email,
        forceDisband: true
      }
    })
    
    showCaptainOptionsModal.value = false
    await fetchTeams()
  } catch (error) {
    console.error('Failed to disband team:', error)
    alert('Failed to disband team: ' + error.message)
  }
}

onMounted(() => {
  // Start real-time updates every 10 seconds for team changes
  startPolling(fetchTeams, 10000)
})

onUnmounted(() => {
  stopPolling()
})
</script>