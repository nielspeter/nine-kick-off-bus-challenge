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
        />
        <span class="text-sm text-gray-600">
          {{ isConnected ? 'Live' : 'Offline' }}
        </span>
      </div>
    </div>

    <!-- Scoring Information -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 mb-6">
      <button
        class="w-full flex items-center justify-between text-left"
        @click="showScoringDetails = !showScoringDetails"
      >
        <span class="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Icon name="heroicons:information-circle" class="w-5 h-5" />
          How Scoring Works
        </span>
        <Icon
          :name="showScoringDetails ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
          class="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
        />
      </button>

      <div v-if="showScoringDetails" class="text-sm text-gray-700 space-y-2 mt-3">
        <p class="font-medium"><strong>Score Formula:</strong> Task Difficulty × Star Rating</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <p class="font-medium mb-1">Difficulty Levels:</p>
            <ul class="space-y-1 text-xs">
              <li>🟢 Easy (1x) - Base multiplier</li>
              <li>🟡 Medium (2x) - Double points</li>
              <li>🔴 Hard (3x) - Triple points</li>
            </ul>
          </div>
          <div>
            <p class="font-medium mb-1">Star Ratings:</p>
            <ul class="space-y-1 text-xs">
              <li>⭐ 1-2 stars: Below average quality</li>
              <li>⭐⭐⭐ 3 stars: Average quality</li>
              <li>⭐⭐⭐⭐⭐ 4-5 stars: Excellent quality</li>
            </ul>
          </div>
        </div>
        <div class="bg-gray-100 rounded p-2 mt-3">
          <p class="text-xs">
            <strong>Example:</strong> Hard task (3x) with 4⭐ rating = 3 × 4 = 12 points
          </p>
        </div>
        <p class="text-xs mt-2">
          <em
            >Note: Only rated submissions contribute to the total score. Unrated submissions show as
            "awaiting rating".</em
          >
        </p>
      </div>
    </div>

    <!-- Last Updated -->
    <div v-if="lastUpdated" class="text-center text-sm text-gray-500 mb-6">
      Last updated: {{ formatTime(lastUpdated) }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
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
                <p class="text-gray-600">Captain: {{ team.captain?.name || 'Unknown' }}</p>
                <p class="text-sm text-gray-500">
                  {{ team.memberCount }} member{{ team.memberCount === 1 ? '' : 's' }}
                </p>
              </div>
            </div>

            <!-- Stats -->
            <div class="text-right">
              <div class="text-3xl font-bold text-primary">
                {{ team.totalScore }}
              </div>
              <div class="text-sm text-gray-600">Total Score</div>

              <div class="mt-2 space-y-1">
                <div class="text-sm text-gray-800">
                  {{ team.scoreBreakdown || `${team.completedChallenges} completed` }}
                </div>
                <div v-if="team.scoreDetails" class="text-xs text-orange-600">
                  {{ team.scoreDetails }}
                </div>
                <div v-if="team.activeChallenges > 0" class="text-sm text-blue-600">
                  {{ team.activeChallenges }} in progress
                </div>
                <div v-if="team.avgDifficulty" class="text-xs text-gray-500">
                  Avg difficulty: {{ team.avgDifficulty }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress indicator for teams with challenges in progress -->
        <div v-if="team.activeChallenges > 0" class="bg-blue-50 px-4 md:px-6 py-2">
          <div class="flex items-center gap-2 text-sm text-blue-800">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Working on {{ team.activeChallenges }} challenge{{
              team.activeChallenges === 1 ? '' : 's'
            }}
          </div>
        </div>

        <!-- Detailed Score Breakdown -->
        <div
          v-if="team.submissions && team.submissions.length > 0"
          class="bg-gray-50 px-4 md:px-6 py-3 border-t"
        >
          <button
            class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="toggleTeamDetails(team.id)"
          >
            <Icon
              :name="expandedTeams.has(team.id) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
              class="w-4 h-4"
            />
            {{ expandedTeams.has(team.id) ? 'Hide' : 'Show' }} Score Calculation
          </button>

          <div v-if="expandedTeams.has(team.id)" class="mt-3 space-y-2">
            <div class="text-xs font-medium text-gray-600 mb-2">Individual Submission Scores:</div>
            <div class="space-y-1">
              <div
                v-for="submission in team.submissions"
                :key="submission.submissionId"
                class="flex items-center justify-between py-1 text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-700">{{ submission.taskTitle }}</span>
                  <span
                    class="px-2 py-0.5 rounded text-xs font-medium"
                    :class="getDifficultyBadgeClass(submission.difficulty)"
                  >
                    {{ getDifficultyText(submission.difficulty) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="submission.isRated" class="text-gray-600">
                    {{ submission.difficulty }}× × {{ submission.rating }}⭐ =
                    <span class="font-bold text-primary">{{ submission.score }}</span> pts
                  </span>
                  <span v-else class="text-orange-600 font-medium">Awaiting rating</span>
                </div>
              </div>
            </div>
            <div class="border-t pt-2 mt-2">
              <div class="flex items-center justify-between text-sm font-bold">
                <span class="text-gray-700">Total Score:</span>
                <span class="text-primary">{{ team.totalScore }} points</span>
              </div>
            </div>
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
const expandedTeams = ref(new Set())
const showScoringDetails = ref(false)

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

function toggleTeamDetails(teamId: string) {
  if (expandedTeams.value.has(teamId)) {
    expandedTeams.value.delete(teamId)
  } else {
    expandedTeams.value.add(teamId)
  }
}

function getDifficultyText(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Easy'
    case 2:
      return 'Medium'
    case 3:
      return 'Hard'
    default:
      return `Lvl ${difficulty}`
  }
}

function getDifficultyBadgeClass(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-800' // Easy - Green
    case 2:
      return 'bg-yellow-100 text-yellow-800' // Medium - Yellow
    case 3:
      return 'bg-red-100 text-red-800' // Hard - Red
    default:
      return 'bg-gray-100 text-gray-800'
  }
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
