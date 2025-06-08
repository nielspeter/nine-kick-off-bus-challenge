<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Team Management</h1>
      <div class="flex items-center gap-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
        />
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
            :disabled="(userTeam.members?.length || 0) >= 4"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            @click="openInviteModal"
          >
            Invite Member
          </button>
          <button
            v-if="!isUserCaptain"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            @click="leaveTeam"
          >
            Leave Team
          </button>
          <button
            v-else-if="(userTeam.members?.length || 0) <= 1"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            @click="leaveTeam"
          >
            Disband Team
          </button>
          <button
            v-else
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            @click="showCaptainOptionsModal = true"
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
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium"
          >
            {{ member.name?.charAt(0) || '?' }}
          </div>
          <div class="flex-1">
            <div class="font-medium">{{ member.name }}</div>
            <div class="text-sm text-gray-600">{{ member.role }}</div>
            <div v-if="member.id === userTeam.captainId" class="text-xs text-primary font-medium">
              Team Captain
            </div>
          </div>
          <!-- Remove Member Button (only visible to captain for non-captain members) -->
          <button
            v-if="isUserCaptain && member.id !== userTeam.captainId"
            class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Remove member from team"
            @click="removeMember(member)"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Current Challenge -->
      <div v-if="currentChallenge" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="text-lg font-semibold mb-2 text-blue-800">Current Challenge</h3>
        <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div class="flex-1">
            <h4 class="font-medium text-blue-900">{{ currentChallenge.task_title }}</h4>
            <p class="text-sm text-blue-700 mb-2">{{ currentChallenge.task_category }}</p>
            <p class="text-sm text-gray-700 mb-2">{{ currentChallenge.task_description }}</p>
            <div class="flex gap-4 text-xs text-gray-600">
              <span>⏱️ {{ currentChallenge.task_estimated_time }} minutes</span>
              <span>📊 Difficulty: {{ currentChallenge.task_difficulty }}/3</span>
              <span>🚀 Started: {{ formatDate(currentChallenge.createdAt) }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <NuxtLink
              :to="`/challenge/${currentChallenge.id}`"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm"
            >
              Continue Challenge
            </NuxtLink>
            <span class="text-xs text-blue-600 text-center">In Progress</span>
          </div>
        </div>
      </div>

      <!-- Team Actions -->
      <div class="flex gap-4">
        <NuxtLink
          to="/tasks"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
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
    <div v-if="!userTeam" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-semibold mb-4">You're not on a team yet</h2>
      <div class="flex gap-4">
        <button
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 border border-gray-300"
          @click="showCreateModal = true"
        >
          Create New Team
        </button>
        <button
          v-if="availableTeams.length > 0"
          class="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg hover:bg-primary/5"
          @click="showJoinModal = true"
        >
          Join Existing Team
        </button>
      </div>
    </div>

    <!-- All Teams -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4">All Teams</h2>
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
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
              class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
              @click="joinTeam(team.id)"
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
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Create New Team</h3>
        <form @submit.prevent="createTeam">
          <div class="mb-4">
            <label for="team-name-input" class="block text-sm font-medium mb-2">Team Name</label>
            <input
              id="team-name-input"
              v-model="newTeamName"
              type="text"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter team name"
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="showCreateModal = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!newTeamName.trim()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Join Team Modal -->
    <div
      v-if="showJoinModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Join Team</h3>
        <div class="mb-4">
          <p class="text-gray-600 mb-4">Select a team to join:</p>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <button
              v-for="team in availableTeams"
              :key="team.id"
              class="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              @click="joinTeam(team.id)"
            >
              <div class="font-medium">{{ team.name }}</div>
              <div class="text-sm text-gray-600">{{ team.members?.length || 0 }}/4 members</div>
            </button>
          </div>
        </div>
        <div class="flex justify-end">
          <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            @click="showJoinModal = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Invite Member Modal -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Invite Team Member</h3>
        <form @submit.prevent="inviteMember">
          <div class="mb-4">
            <label for="invite-user-select" class="block text-sm font-medium mb-2"
              >Select User</label
            >
            <select
              id="invite-user-select"
              v-model="selectedUserToInvite"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a user to invite...</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <p v-if="availableUsers.length === 0" class="text-sm text-gray-500 mt-1">
              No available users to invite
            </p>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="showInviteModal = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!selectedUserToInvite"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Captain Options Modal -->
    <div
      v-if="showCaptainOptionsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Captain Options</h3>
        <p class="text-gray-600 mb-6">
          As team captain with other members, you can either transfer captaincy to another member or
          disband the entire team.
        </p>

        <div class="space-y-4">
          <!-- Transfer Captaincy Option -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium mb-2">Transfer Captaincy</h4>
            <p class="text-sm text-gray-600 mb-3">Choose a new captain and leave the team</p>
            <select v-model="selectedNewCaptain" class="w-full border rounded-lg px-3 py-2 mb-3">
              <option value="">Select new captain...</option>
              <option v-for="member in otherMembers" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.email }})
              </option>
            </select>
            <button
              :disabled="!selectedNewCaptain"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              @click="transferCaptaincy"
            >
              Transfer & Leave
            </button>
          </div>

          <!-- Disband Team Option -->
          <div class="border border-red-200 rounded-lg p-4">
            <h4 class="font-medium mb-2 text-red-800">Disband Team</h4>
            <p class="text-sm text-red-600 mb-3">
              Remove all members and delete the team permanently
            </p>
            <button
              class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              @click="disbandTeam"
            >
              Disband Team
            </button>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            @click="showCaptainOptionsModal = false"
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
  name: 'Aku Nour Shirazi Valta',
}

const teams = ref([])
const userTeam = ref(null)
const loading = ref(false)
const currentChallenge = ref(null)

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const showInviteModal = ref(false)
const showCaptainOptionsModal = ref(false)

const newTeamName = ref('')
const selectedUserToInvite = ref('')
const selectedNewCaptain = ref('')
const availableUsers = ref([])

const isUserCaptain = computed(() => {
  return userTeam.value?.captainId === mockUser.id
})

const availableTeams = computed(() => {
  return teams.value.filter(
    team =>
      (team.members?.length || 0) < 4 && !team.members?.find(member => member.id === mockUser.id)
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
    userTeam.value =
      teams.value.find(team => team.members?.find(member => member.id === mockUser.id)) || null

    console.log('Teams fetched:', teams.value)
    console.log('User team:', userTeam.value)
  } catch (error) {
    console.error('Failed to fetch teams:', error)
  }
  loading.value = false
}

async function createTeam() {
  try {
    await $fetch('/api/teams/create', {
      method: 'POST',
      body: {
        name: newTeamName.value,
        captainEmail: mockUser.email,
      },
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
    await $fetch('/api/teams/join', {
      method: 'POST',
      body: {
        teamId,
        userEmail: mockUser.email,
      },
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
    await $fetch('/api/teams/leave', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        userEmail: mockUser.email,
      },
    })

    await fetchTeams()
  } catch (error) {
    console.error('Failed to leave team:', error)
    alert('Failed to leave team: ' + error.message)
  }
}

async function removeMember(member: any) {
  if (!userTeam.value || !isUserCaptain.value) return

  const confirmMessage = `Are you sure you want to remove ${member.name} from the team?`
  if (!confirm(confirmMessage)) return

  try {
    await $fetch(`/api/teams/${userTeam.value.id}/remove-member`, {
      method: 'POST',
      body: {
        userEmail: member.email,
      },
    })

    // Refresh team data
    await fetchTeams()
  } catch (error) {
    console.error('Failed to remove team member:', error)
    alert('Failed to remove team member: ' + error.message)
  }
}

async function fetchAvailableUsers() {
  try {
    console.log('Fetching available users from API...')
    const response = await $fetch('/api/users/available')
    console.log('API response:', response)
    availableUsers.value = response.data
    console.log('Available users set:', availableUsers.value.length)
  } catch (error) {
    console.error('Failed to fetch available users:', error)
    availableUsers.value = []
  }
}

async function inviteMember() {
  if (!userTeam.value || !selectedUserToInvite.value) return

  const selectedUser = availableUsers.value.find(user => user.id === selectedUserToInvite.value)
  if (!selectedUser) return

  try {
    await $fetch('/api/teams/join', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        userEmail: selectedUser.email,
      },
    })

    showInviteModal.value = false
    selectedUserToInvite.value = ''
    await fetchTeams()
    await fetchAvailableUsers() // Refresh available users
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
        currentCaptainEmail: mockUser.email,
      },
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

  const confirmMessage =
    'Are you sure you want to disband this team? This will remove all members and cannot be undone.'
  if (!confirm(confirmMessage)) return

  try {
    await $fetch('/api/teams/leave', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        userEmail: mockUser.email,
        forceDisband: true,
      },
    })

    showCaptainOptionsModal.value = false
    await fetchTeams()
  } catch (error) {
    console.error('Failed to disband team:', error)
    alert('Failed to disband team: ' + error.message)
  }
}

async function openInviteModal() {
  await fetchAvailableUsers()
  showInviteModal.value = true
}

async function fetchCurrentChallenge() {
  if (!userTeam.value?.id) {
    currentChallenge.value = null
    return
  }

  try {
    const response = await $fetch(`/api/teams/${userTeam.value.id}/current-challenge`)
    currentChallenge.value = response.data
  } catch (error) {
    console.error('Failed to fetch current challenge:', error)
    currentChallenge.value = null
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  // Initial fetch
  await fetchTeams()
  await fetchCurrentChallenge()
  await fetchAvailableUsers()
  // Start real-time updates every 10 seconds for team changes
  startPolling(async () => {
    await fetchTeams()
    await fetchCurrentChallenge()
  }, 10000)
})

onUnmounted(() => {
  stopPolling()
})
</script>
