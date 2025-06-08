<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Challenge Arena</h1>
      <p class="text-gray-600">Select challenges for your team to solve using AI creativity</p>
    </div>

    <!-- Team Status -->
    <NuxtLink v-if="userTeam" to="/team" class="block bg-white rounded-lg shadow-md p-4 md:p-6 mb-8 hover:shadow-lg transition-shadow cursor-pointer">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h2 class="text-xl font-semibold">{{ userTeam.name }}</h2>
          <p class="text-gray-600">{{ userTeam.members?.length || 0 }} members</p>
        </div>
        <div class="text-left md:text-right">
          <div class="text-2xl font-bold text-blue-600">{{ completedChallenges }}/{{ totalChallenges }}</div>
          <div class="text-sm text-gray-600">Challenges Completed</div>
        </div>
      </div>
    </NuxtLink>

    <!-- No Team Warning -->
    <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 mb-8">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-yellow-600" />
        <div>
          <h3 class="font-semibold text-yellow-800">No Team Found</h3>
          <p class="text-yellow-700">You need to be part of a team to participate in challenges.</p>
        </div>
      </div>
      <NuxtLink 
        to="/team" 
        class="mt-4 inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
      >
        Go to Team Management
      </NuxtLink>
    </div>

    <!-- Challenge Categories -->
    <div v-if="userTeam" class="grid gap-8">
      <div 
        v-for="(categoryTasks, category) in groupedTasks" 
        :key="category"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 md:p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
            <div>
              <h2 class="text-2xl font-bold">{{ category }}</h2>
              <p class="opacity-90">{{ categoryTasks.length }} challenge{{ categoryTasks.length === 1 ? '' : 's' }} available</p>
            </div>
            <div class="text-3xl">{{ getCategoryIcon(category) }}</div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid gap-4">
            <div 
              v-for="task in categoryTasks" 
              :key="task.id"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow"
              :class="getTaskStatusClass(task)"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold mb-2">{{ task.title }}</h3>
                  <p class="text-gray-600 mb-3">{{ task.description }}</p>
                  
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <Icon name="heroicons:clock" class="w-4 h-4" />
                      {{ task.estimatedTime }} min
                    </div>
                    <div class="flex items-center gap-1">
                      <Icon name="heroicons:star" class="w-4 h-4" />
                      {{ getDifficultyText(task.difficulty) }}
                    </div>
                    <div v-if="getTaskStatus(task) === 'completed'" class="flex items-center gap-1 text-green-600">
                      <Icon name="heroicons:check-circle" class="w-4 h-4" />
                      Completed
                    </div>
                    <div v-else-if="getTaskStatus(task) === 'in_progress'" class="flex items-center gap-1 text-blue-600">
                      <Icon name="heroicons:play-circle" class="w-4 h-4" />
                      In Progress
                    </div>
                  </div>
                </div>
                
                <div class="ml-4">
                  <div v-if="getTaskStatus(task) === 'available'" class="text-right">
                    <button 
                      @click="startChallenge(task)"
                      :disabled="!isTaskAvailable(task)"
                      class="px-4 py-2 rounded-lg font-medium"
                      :class="isTaskAvailable(task) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                    >
                      Start Challenge
                    </button>
                    <div v-if="!isTaskAvailable(task)" class="text-xs text-gray-500 mt-1">
                      Complete current challenge first
                    </div>
                  </div>
                  <button 
                    v-else-if="getTaskStatus(task) === 'in_progress'"
                    @click="continueChallenge(task)"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                  <div 
                    v-else-if="getTaskStatus(task) === 'completed'"
                    class="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium"
                  >
                    ✓ Completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading challenges...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mock user for testing
const mockUser = {
  id: 'user_anv',
  email: 'anv@nine.dk',
  name: 'Aku Nour Shirazi Valta'
}

const loading = ref(true)
const tasks = ref([])
const groupedTasks = ref({})
const userTeam = ref(null)
const submissions = ref([])

const totalChallenges = computed(() => tasks.value.length)
const completedChallenges = computed(() => 
  submissions.value.filter(sub => sub.status === 'completed').length
)

function getCategoryIcon(category: string) {
  const icons = {
    'Test': '🧪',
    'Project Management': '📋',
    'Backend': '⚙️',
    'Frontend': '🎨',
    'Sales': '💼',
    'Business Analysis': '📊',
    'BUL/Sales': '🤝',
    'Communication': '📢'
  }
  return icons[category] || '📝'
}

function getDifficultyText(difficulty: number) {
  const levels = ['Easy', 'Medium', 'Hard']
  return levels[difficulty - 1] || 'Unknown'
}

function getTaskStatus(task: any) {
  const submission = submissions.value.find(sub => sub.taskId === task.id)
  if (!submission) return 'available'
  return submission.status
}

function hasActiveChallenge() {
  return submissions.value.some(sub => sub.status === 'in_progress')
}

function isTaskAvailable(task: any) {
  const taskStatus = getTaskStatus(task)
  if (taskStatus === 'completed') return false
  if (taskStatus === 'in_progress') return true
  // Task is available only if team has no active challenges
  return !hasActiveChallenge()
}

function getTaskStatusClass(task: any) {
  const status = getTaskStatus(task)
  if (status === 'completed') return 'border-green-200 bg-green-50'
  if (status === 'in_progress') return 'border-blue-200 bg-blue-50'
  return 'border-gray-200'
}

async function startChallenge(task: any) {
  console.log('startChallenge called with task:', task)
  console.log('userTeam.value:', userTeam.value)
  
  if (!userTeam.value) {
    console.error('No user team found!')
    alert('You need to be on a team to start challenges. Please go to the Team Management page.')
    return
  }
  
  try {
    console.log('Starting challenge with teamId:', userTeam.value.id, 'taskId:', task.id)
    const response = await $fetch('/api/challenges/start', {
      method: 'POST',
      body: {
        teamId: userTeam.value.id,
        taskId: task.id
      }
    })
    
    console.log('Challenge start response:', response)
    // Navigate to challenge interface
    await navigateTo(`/challenge/${response.submission.id}`)
  } catch (error) {
    console.error('Failed to start challenge:', error)
    alert('Failed to start challenge: ' + error.message)
  }
}

async function continueChallenge(task: any) {
  const submission = submissions.value.find(sub => sub.taskId === task.id && sub.status === 'in_progress')
  if (submission) {
    await navigateTo(`/challenge/${submission.id}`)
  }
}

async function fetchData() {
  loading.value = true
  try {
    console.log('Fetching data...')
    
    // Fetch challenges
    const challengesResponse = await $fetch('/api/challenges')
    console.log('Challenges response:', challengesResponse)
    tasks.value = challengesResponse.tasks
    groupedTasks.value = challengesResponse.groupedTasks

    // Fetch user's team
    const teamsResponse = await $fetch('/api/teams')
    console.log('Teams response:', teamsResponse)
    console.log('Looking for user with ID:', mockUser.id)
    
    userTeam.value = teamsResponse.teams.find(team => 
      team.members?.find(member => member.id === mockUser.id)
    ) || null
    
    console.log('Found user team:', userTeam.value)

    // Fetch team's submissions if user has a team
    if (userTeam.value) {
      try {
        console.log('Fetching submissions for team:', userTeam.value.id)
        const submissionsResponse = await $fetch(`/api/teams/${userTeam.value.id}/submissions`)
        console.log('Submissions response:', submissionsResponse)
        submissions.value = (submissionsResponse.success && submissionsResponse.submissions) ? submissionsResponse.submissions : []
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
        submissions.value = []
      }
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
  loading.value = false
}

onMounted(() => {
  fetchData()
})
</script>