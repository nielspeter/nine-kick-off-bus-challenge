<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">Live Leaderboard</h1>
        <p class="text-gray-600">Competition standings updated in real-time</p>
      </div>
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

    <!-- Last Updated -->
    <div v-if="lastUpdated" class="text-center text-sm text-gray-500 mb-6">
      Last updated: {{ formatTime(lastUpdated) }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading leaderboard...</p>
    </div>

    <!-- Leaderboard -->
    <div v-else-if="leaderboard.length > 0" class="space-y-4">
      <div 
        v-for="(team, index) in leaderboard" 
        :key="team.id"
        class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
        :class="getPositionClass(index)"
      >
        <div class="p-4 md:p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Position -->
              <div class="flex-shrink-0">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  :class="getPositionBadgeClass(index)"
                >
                  {{ index + 1 }}
                </div>
              </div>
              
              <!-- Team Info -->
              <div>
                <h3 class="text-xl font-semibold">{{ team.name }}</h3>
                <p class="text-gray-600">
                  Captain: {{ team.captain?.name || 'Unknown' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ team.memberCount }} member{{ team.memberCount === 1 ? '' : 's' }}
                </p>
              </div>
            </div>
            
            <!-- Stats -->
            <div class="text-right">
              <div class="text-2xl font-bold text-primary">
                {{ team.completedChallenges }}
              </div>
              <div class="text-sm text-gray-600">Completed</div>
              <div v-if="team.activeChallenges > 0" class="text-sm text-blue-600 mt-1">
                {{ team.activeChallenges }} in progress
              </div>
            </div>
          </div>
        </div>
        
        <!-- Progress indicator for teams with challenges in progress -->
        <div v-if="team.activeChallenges > 0" class="bg-blue-50 px-4 md:px-6 py-2">
          <div class="flex items-center gap-2 text-sm text-blue-800">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Working on {{ team.activeChallenges }} challenge{{ team.activeChallenges === 1 ? '' : 's' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:trophy" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
      <p class="text-gray-500">Teams will appear here once they start completing challenges.</p>
    </div>

    <!-- Competition Stats -->
    <div class="bg-gray-50 rounded-lg p-4 md:p-6 mt-8">
      <h3 class="text-lg font-semibold mb-4">Competition Statistics</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalTeams }}</div>
          <div class="text-sm text-gray-600">Teams</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ totalCompleted }}</div>
          <div class="text-sm text-gray-600">Completed</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ totalActive }}</div>
          <div class="text-sm text-gray-600">In Progress</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ averageScore }}</div>
          <div class="text-sm text-gray-600">Avg Score</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isConnected, startPolling, stopPolling } = useRealtime()

const loading = ref(true)
const leaderboard = ref([])
const lastUpdated = ref('')

const totalTeams = computed(() => leaderboard.value.length)
const totalCompleted = computed(() => 
  leaderboard.value.reduce((sum, team) => sum + team.completedChallenges, 0)
)
const totalActive = computed(() => 
  leaderboard.value.reduce((sum, team) => sum + team.activeChallenges, 0)
)
const averageScore = computed(() => {
  if (totalTeams.value === 0) return 0
  return Math.round((totalCompleted.value / totalTeams.value) * 10) / 10
})

function getPositionClass(index: number) {
  if (index === 0) return 'ring-2 ring-yellow-400'
  if (index === 1) return 'ring-2 ring-gray-400'
  if (index === 2) return 'ring-2 ring-orange-400'
  return ''
}

function getPositionBadgeClass(index: number) {
  if (index === 0) return 'bg-yellow-400 text-yellow-900'
  if (index === 1) return 'bg-gray-400 text-gray-900'
  if (index === 2) return 'bg-orange-400 text-orange-900'
  return 'bg-gray-200 text-gray-700'
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString()
}

async function fetchLeaderboard() {
  try {
    const response = await $fetch('/api/leaderboard')
    leaderboard.value = response.leaderboard
    lastUpdated.value = response.lastUpdated
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Start real-time updates every 5 seconds
  startPolling(fetchLeaderboard, 5000)
})

onUnmounted(() => {
  stopPolling()
})
</script>