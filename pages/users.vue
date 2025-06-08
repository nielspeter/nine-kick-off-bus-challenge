<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">All Users</h1>
      <div class="flex items-center gap-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'"
        />
        <span class="text-sm text-gray-600">
          {{ loading ? 'Loading...' : `${users.length} users loaded` }}
        </span>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ users.length }}</div>
        <div class="text-sm text-gray-600">Total Users</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ usersWithTeams }}</div>
        <div class="text-sm text-gray-600">On Teams</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-orange-600">{{ usersWithoutTeams }}</div>
        <div class="text-sm text-gray-600">Available</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ totalTeams }}</div>
        <div class="text-sm text-gray-600">Total Teams</div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name or email..."
            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Users</option>
            <option value="on-team">On Team</option>
            <option value="available">Available</option>
          </select>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            @click="fetchUsers"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4 font-medium text-gray-700">User</th>
              <th class="text-left p-4 font-medium text-gray-700">Email</th>
              <th class="text-left p-4 font-medium text-gray-700">Role</th>
              <th class="text-left p-4 font-medium text-gray-700">Team</th>
              <th class="text-left p-4 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-t hover:bg-gray-50">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="user.picture"
                    :src="user.picture"
                    :alt="user.name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium"
                  >
                    {{ user.name?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="font-medium">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 text-gray-700">{{ user.email }}</td>
              <td class="p-4 text-gray-700">{{ user.role || 'N/A' }}</td>
              <td class="p-4">
                <div v-if="user.team">
                  <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      {{ user.team.name }}
                    </span>
                    <span v-if="user.team.isCaptain" class="text-yellow-600 text-sm">
                      👑 Captain
                    </span>
                  </div>
                </div>
                <div v-else class="text-gray-400 text-sm">No team</div>
              </td>
              <td class="p-4">
                <span
                  v-if="user.team"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  On Team
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  Available
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-8 text-gray-600">
        {{ searchQuery ? 'No users found matching your search.' : 'No users found.' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
  picture?: string
  role?: string
  isAdmin?: boolean
  team?: {
    id: string
    name: string
    captainId: string
    isCaptain: boolean
  } | null
}

const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')

const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      user => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value === 'on-team') {
    filtered = filtered.filter(user => user.team !== null)
  } else if (statusFilter.value === 'available') {
    filtered = filtered.filter(user => user.team === null)
  }

  return filtered
})

const usersWithTeams = computed(() => {
  return users.value.filter(user => user.team !== null).length
})

const usersWithoutTeams = computed(() => {
  return users.value.filter(user => user.team === null).length
})

const totalTeams = computed(() => {
  const teamIds = new Set()
  users.value.forEach(user => {
    if (user.team) {
      teamIds.add(user.team.id)
    }
  })
  return teamIds.size
})

async function fetchUsers() {
  loading.value = true
  try {
    console.log('Fetching users from API...')
    const response = await $fetch('/api/users/all')
    console.log('API response:', response)
    console.log('Response data:', response.data)
    console.log('Response success:', response.success)

    users.value = response.data || []
    console.log('Users loaded:', users.value.length)

    if (users.value.length === 0) {
      console.error('No users returned from API')
      if (!response.success) {
        console.error('API error:', response.error)
      }
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    users.value = []
  }
  loading.value = false
}

onMounted(() => {
  fetchUsers()
})
</script>
