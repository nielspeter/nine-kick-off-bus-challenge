<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-8">Competition Administration</h1>

    <!-- Competition Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
        <div class="text-2xl md:text-3xl font-bold text-blue-600">{{ stats.totalTeams }}</div>
        <div class="text-sm md:text-base text-gray-600">Total Teams</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
        <div class="text-2xl md:text-3xl font-bold text-green-600">{{ stats.totalSubmissions }}</div>
        <div class="text-sm md:text-base text-gray-600">Total Submissions</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
        <div class="text-2xl md:text-3xl font-bold text-purple-600">{{ stats.completedSubmissions }}</div>
        <div class="text-sm md:text-base text-gray-600">Completed Challenges</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
        <div class="text-2xl md:text-3xl font-bold text-orange-600">{{ stats.activeSubmissions }}</div>
        <div class="text-sm md:text-base text-gray-600">Active Challenges</div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="bg-white rounded-lg shadow-md mb-6">
      <div class="border-b">
        <nav class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === tab.id 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Teams Tab -->
      <div v-if="activeTab === 'teams'" class="p-4 md:p-6">
        <h2 class="text-xl font-semibold mb-4">Teams Management</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">Team Name</th>
                <th class="text-left py-2">Captain</th>
                <th class="text-left py-2">Members</th>
                <th class="text-left py-2">Completed</th>
                <th class="text-left py-2">In Progress</th>
                <th class="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in teams" :key="team.id" class="border-b hover:bg-gray-50">
                <td class="py-3 font-medium">{{ team.name }}</td>
                <td class="py-3">{{ team.captain?.name || 'N/A' }}</td>
                <td class="py-3">{{ team.members?.length || 0 }}/4</td>
                <td class="py-3">
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {{ getTeamCompletedCount(team.id) }}
                  </span>
                </td>
                <td class="py-3">
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {{ getTeamActiveCount(team.id) }}
                  </span>
                </td>
                <td class="py-3">
                  <button 
                    @click="viewTeamDetails(team)"
                    class="text-primary hover:text-primary/80 text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Submissions Tab -->
      <div v-if="activeTab === 'submissions'" class="p-4 md:p-6">
        <h2 class="text-xl font-semibold mb-4">Submissions & Judging</h2>
        <div class="space-y-4">
          <div 
            v-for="submission in completedSubmissions" 
            :key="submission.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-semibold">{{ submission.task?.title }}</h3>
                <p class="text-gray-600">{{ submission.team?.name }}</p>
                <p class="text-sm text-gray-500">
                  Submitted: {{ formatDate(submission.submittedAt) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  {{ submission.task?.category }}
                </span>
                <button 
                  @click="reviewSubmission(submission)"
                  class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                >
                  Review
                </button>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded p-3">
              <h4 class="font-medium text-sm mb-2">Final Answer:</h4>
              <p class="text-sm">
                {{ submission.finalAnswers?.[0] || 'No answer provided' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard Tab -->
      <div v-if="activeTab === 'leaderboard'" class="p-4 md:p-6">
        <h2 class="text-xl font-semibold mb-4">Competition Leaderboard</h2>
        <div class="space-y-3">
          <div 
            v-for="(team, index) in leaderboard" 
            :key="team.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-4">
              <div class="text-2xl font-bold text-gray-400">
                #{{ index + 1 }}
              </div>
              <div>
                <div class="font-semibold">{{ team.name }}</div>
                <div class="text-sm text-gray-600">
                  {{ team.members?.length || 0 }} members
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-primary">
                {{ team.completedCount }}
              </div>
              <div class="text-sm text-gray-600">challenges completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p v-if="loadingAuth" class="mt-4 text-gray-600">Checking authentication...</p>
      <p v-else class="mt-4 text-gray-600">Loading admin data...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Protect page - redirect unauthenticated users to signin
definePageMeta({
  auth: {
    navigateUnauthenticatedTo: '/auth/signin'
  }
})

// Check admin access on component mount
const { data: session, status } = useAuth()
const loadingAdminData = ref(false)
const activeTab = ref('teams')

// Get isAdmin directly from session
const isAdmin = computed(() => {
  return (session.value?.user as any)?.isAdmin === true
})

// Check if we're still loading auth status
const loadingAuth = computed(() => {
  return status.value === 'loading'
})

// Combined loading state for UI
const loading = computed(() => {
  return loadingAuth.value || loadingAdminData.value
})

// Check admin access
function checkAdminAccess() {
  if (status.value === 'loading') {
    return
  }
  
  if (status.value === 'unauthenticated') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  if (!isAdmin.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin privileges required.'
    })
  }
}

// Watch for auth status changes
watch([status, isAdmin], () => {
  if (status.value !== 'loading') {
    checkAdminAccess()
  }
}, { immediate: true })

const teams = ref([])
const submissions = ref([])
const stats = ref({
  totalTeams: 0,
  totalSubmissions: 0,
  completedSubmissions: 0,
  activeSubmissions: 0
})

const tabs = [
  { id: 'teams', label: 'Teams' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'leaderboard', label: 'Leaderboard' }
]

const completedSubmissions = computed(() => 
  submissions.value.filter(sub => sub.status === 'completed')
)

const leaderboard = computed(() => {
  return teams.value
    .map(team => ({
      ...team,
      completedCount: getTeamCompletedCount(team.id)
    }))
    .sort((a, b) => b.completedCount - a.completedCount)
})

function getTeamCompletedCount(teamId: string) {
  return submissions.value.filter(sub => 
    sub.teamId === teamId && sub.status === 'completed'
  ).length
}

function getTeamActiveCount(teamId: string) {
  return submissions.value.filter(sub => 
    sub.teamId === teamId && sub.status === 'in_progress'
  ).length
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function viewTeamDetails(team: any) {
  // TODO: Implement team details modal or navigation
  console.log('View team details:', team)
}

function reviewSubmission(submission: any) {
  // TODO: Implement submission review modal
  console.log('Review submission:', submission)
}

async function fetchAdminData() {
  if (!isAdmin.value) {
    return
  }
  
  loadingAdminData.value = true
  try {
    // Fetch teams
    const teamsResponse = await $fetch('/api/teams')
    teams.value = teamsResponse.teams

    // Fetch all submissions
    const submissionsResponse = await $fetch('/api/admin/submissions')
    submissions.value = submissionsResponse.submissions || []

    // Calculate stats
    stats.value = {
      totalTeams: teams.value.length,
      totalSubmissions: submissions.value.length,
      completedSubmissions: submissions.value.filter(sub => sub.status === 'completed').length,
      activeSubmissions: submissions.value.filter(sub => sub.status === 'in_progress').length
    }
  } catch (error) {
    console.error('Failed to fetch admin data:', error)
  } finally {
    loadingAdminData.value = false
  }
}

// Watch for admin status change to fetch data
watch(isAdmin, async (newIsAdmin) => {
  if (newIsAdmin) {
    await fetchAdminData()
  }
})
</script>