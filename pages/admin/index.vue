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
        <div class="text-2xl md:text-3xl font-bold text-green-600">
          {{ stats.totalSubmissions }}
        </div>
        <div class="text-sm md:text-base text-gray-600">Total Submissions</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
        <div class="text-2xl md:text-3xl font-bold text-purple-600">
          {{ stats.completedSubmissions }}
        </div>
        <div class="text-sm md:text-base text-gray-600">Completed Challenges</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 text-center">
        <div class="text-2xl md:text-3xl font-bold text-orange-600">
          {{ stats.activeSubmissions }}
        </div>
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
            class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            "
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Competition Settings Tab -->
      <div v-if="activeTab === 'settings'" class="p-4 md:p-6">
        <h2 class="text-xl font-semibold mb-4">Competition Control Center</h2>

        <!-- Competition Status Card -->
        <div class="bg-white rounded-lg border p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Competition Status</h3>
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-3 h-3 rounded-full',
                  competitionState?.isStarted ? 'bg-green-500' : 'bg-gray-400',
                ]"
              />
              <span class="text-sm font-medium">
                {{
                  competitionState?.isStarted
                    ? competitionState?.isPaused
                      ? 'Paused'
                      : 'Active'
                    : 'Not Started'
                }}
              </span>
            </div>
          </div>

          <div v-if="competitionState?.isStarted" class="space-y-2 text-sm text-gray-600 mb-4">
            <p>Started: {{ formatDateTime(competitionState.startTime) }}</p>
            <p>Ends: {{ formatDateTime(competitionState.endTime) }}</p>
            <p v-if="competitionState.isPaused" class="text-orange-600 font-medium">
              Competition is currently paused
            </p>
          </div>

          <!-- Control Buttons -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-if="!competitionState?.isStarted"
              :disabled="controlLoading"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              @click="startCompetition"
            >
              Start Competition
            </button>

            <button
              v-if="competitionState?.isStarted && !competitionState?.isPaused"
              :disabled="controlLoading"
              class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium"
              @click="pauseCompetition"
            >
              Pause
            </button>

            <button
              v-if="competitionState?.isStarted && competitionState?.isPaused"
              :disabled="controlLoading"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
              @click="resumeCompetition"
            >
              Resume
            </button>

            <button
              v-if="competitionState?.isStarted"
              :disabled="controlLoading"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
              @click="stopCompetition"
            >
              Stop & Reset
            </button>
          </div>
        </div>

        <!-- Duration Settings -->
        <div class="bg-white rounded-lg border p-6">
          <h3 class="text-lg font-semibold mb-4">Competition Duration</h3>
          <div class="max-w-md">
            <div class="flex items-end gap-3">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  v-model.number="competitionDurationMinutes"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p class="mt-1 text-sm text-gray-500">
                  {{ Math.floor(competitionDurationMinutes / 60) }} hours
                  {{ competitionDurationMinutes % 60 }} minutes
                </p>
              </div>
              <button
                :disabled="
                  controlLoading || competitionState?.durationMinutes === competitionDurationMinutes
                "
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                @click="updateDuration"
              >
                Update
              </button>
            </div>
            <p v-if="!competitionState?.isStarted" class="mt-3 text-sm text-gray-500">
              Duration will be applied when competition starts
            </p>
            <p v-else class="mt-3 text-sm text-orange-600">
              Note: Changing duration while competition is active will adjust the end time
            </p>
          </div>
        </div>

        <div v-if="settingsMessage" class="mt-4">
          <div
            :class="[
              'p-3 rounded-md',
              settingsMessageType === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800',
            ]"
          >
            {{ settingsMessage }}
          </div>
        </div>
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
                    class="text-primary hover:text-primary/80 text-sm"
                    @click="viewTeamDetails(team)"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tasks Tab -->
      <div v-if="activeTab === 'tasks'" class="p-4 md:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Tasks Management</h2>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            @click="showCreateTaskModal = true"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 inline mr-1" />
            Add Task
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">Title</th>
                <th class="text-left py-2">Category</th>
                <th class="text-left py-2">Difficulty</th>
                <th class="text-left py-2">Est. Time</th>
                <th class="text-left py-2">Submissions</th>
                <th class="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tasks" :key="task.id" class="border-b hover:bg-gray-50">
                <td class="py-3 font-medium">{{ task.title }}</td>
                <td class="py-3">
                  <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    {{ task.category }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="flex">
                    <Icon
                      v-for="i in task.difficulty"
                      :key="i"
                      name="heroicons:star-solid"
                      class="w-4 h-4 text-yellow-400"
                    />
                    <Icon
                      v-for="i in 3 - task.difficulty"
                      :key="i"
                      name="heroicons:star"
                      class="w-4 h-4 text-gray-300"
                    />
                  </div>
                </td>
                <td class="py-3">{{ task.estimatedTime }}min</td>
                <td class="py-3">
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {{ getTaskSubmissionCount(task.id) }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="flex gap-2">
                    <button
                      class="text-primary hover:text-primary/80 text-sm"
                      @click="editTask(task)"
                    >
                      Edit
                    </button>
                    <button
                      class="text-red-600 hover:text-red-800 text-sm"
                      @click="confirmDeleteTask(task)"
                    >
                      Delete
                    </button>
                  </div>
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
              <div class="flex-1">
                <h3 class="font-semibold">{{ submission.task?.title }}</h3>
                <p class="text-gray-600">{{ submission.team?.name }}</p>
                <p class="text-sm text-gray-500">
                  Submitted: {{ formatDate(submission.submittedAt) }}
                </p>
                <div v-if="submission.ratedAt" class="text-xs text-green-600 mt-1">
                  Rated {{ formatDate(submission.ratedAt) }} by {{ submission.ratedBy }}
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  {{ submission.task?.category }}
                </span>

                <!-- Star Rating Component -->
                <div class="flex flex-col items-center">
                  <div class="flex items-center gap-1 mb-1">
                    <button
                      v-for="star in 5"
                      :key="star"
                      :disabled="ratingLoading[submission.id]"
                      class="text-xl transition-colors hover:scale-110 disabled:opacity-50"
                      :class="getRatingStarClass(submission.rating, star)"
                      @click="rateSubmission(submission.id, star)"
                    >
                      {{ getRatingStarIcon(submission.rating, star) }}
                    </button>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ submission.rating ? `${submission.rating}/5` : 'Not rated' }}
                  </div>
                </div>

                <button
                  class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                  @click="reviewSubmission(submission)"
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
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p v-if="loadingAuth" class="mt-4 text-gray-600">Checking authentication...</p>
      <p v-else class="mt-4 text-gray-600">Loading admin data...</p>
    </div>

    <!-- Team Members Modal -->
    <div
      v-if="showTeamDetailsModal && selectedTeam"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold">{{ selectedTeam.name }} Members</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showTeamDetailsModal = false">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="member in selectedTeam.members"
            :key="member.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="member.picture"
                class="w-8 h-8 rounded-full bg-gray-200"
                :style="{ backgroundImage: `url(${member.picture})`, backgroundSize: 'cover' }"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
              >
                {{ member.name?.charAt(0) || '?' }}
              </div>
              <div>
                <div class="font-medium text-sm">{{ member.name }}</div>
                <div class="text-xs text-gray-500">{{ member.email }}</div>
              </div>
            </div>
            <div
              v-if="member.id === selectedTeam.captainId"
              class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              Captain
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            @click="showTeamDetailsModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Task Modal -->
    <div
      v-if="showCreateTaskModal || showEditTaskModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold">
            {{ showEditTaskModal ? 'Edit Task' : 'Create New Task' }}
          </h3>
          <button class="text-gray-500 hover:text-gray-700" @click="closeTaskModal">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <form class="flex flex-col flex-1 overflow-hidden" @submit.prevent="saveTask">
          <div class="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                v-model="taskForm.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="taskForm.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                <option value="Test">Test</option>
                <option value="Project Management">Project Management</option>
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="Sales">Sales</option>
                <option value="Business Analysis">Business Analysis</option>
                <option value="BUL/Sales">BUL/Sales</option>
                <option value="Communication">Communication</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="taskForm.description"
                rows="4"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  v-model.number="taskForm.estimatedTime"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  v-model.number="taskForm.difficulty"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select difficulty</option>
                  <option value="1">1 - Easy</option>
                  <option value="2">2 - Medium</option>
                  <option value="3">3 - Hard</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              @click="closeTaskModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="taskFormLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{
                taskFormLoading ? 'Saving...' : showEditTaskModal ? 'Update Task' : 'Create Task'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Protect page - redirect unauthenticated users to signin
definePageMeta({
  auth: {
    navigateUnauthenticatedTo: '/auth/signin',
  },
})

// Check admin access on component mount
const { data: session, status } = useAuth()
const loadingAdminData = ref(false)
const activeTab = ref('settings')

// Competition settings state
const competitionState = ref<any>(null)
const competitionDurationMinutes = ref(240) // Default 4 hours
const controlLoading = ref(false)
const settingsMessage = ref('')
const settingsMessageType = ref<'success' | 'error'>('success')

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
      statusMessage: 'Authentication required',
    })
  }

  if (!isAdmin.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin privileges required.',
    })
  }
}

// Watch for auth status changes
watch(
  [status, isAdmin],
  () => {
    if (status.value !== 'loading') {
      checkAdminAccess()
    }
  },
  { immediate: true }
)

const teams = ref([])
const tasks = ref([])
const submissions = ref([])
const stats = ref({
  totalTeams: 0,
  totalSubmissions: 0,
  completedSubmissions: 0,
  activeSubmissions: 0,
})

// Rating state
const ratingLoading = ref({})

// Team details modal state
const showTeamDetailsModal = ref(false)
const selectedTeam = ref(null)

// Task management state
const showCreateTaskModal = ref(false)
const showEditTaskModal = ref(false)
const taskFormLoading = ref(false)
const selectedTask = ref(null)
const taskForm = ref({
  title: '',
  category: '',
  description: '',
  estimatedTime: 30,
  difficulty: 1,
})

const tabs = [
  { id: 'settings', label: 'Competition Settings' },
  { id: 'teams', label: 'Teams' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'submissions', label: 'Submissions' },
]

const completedSubmissions = computed(() =>
  submissions.value.filter(sub => sub.status === 'completed')
)

function getTeamCompletedCount(teamId: string) {
  return submissions.value.filter(sub => sub.teamId === teamId && sub.status === 'completed').length
}

function getTeamActiveCount(teamId: string) {
  return submissions.value.filter(sub => sub.teamId === teamId && sub.status === 'in_progress')
    .length
}

function getTaskSubmissionCount(taskId: string) {
  return submissions.value.filter(sub => sub.taskId === taskId).length
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function viewTeamDetails(team: any) {
  selectedTeam.value = team
  showTeamDetailsModal.value = true
}

function reviewSubmission(submission: any) {
  // TODO: Implement submission review modal
  console.log('Review submission:', submission)
}

// Rating functions
async function rateSubmission(submissionId: string, rating: number) {
  ratingLoading.value[submissionId] = true
  try {
    const response = (await $fetch(`/api/submissions/${submissionId}/rate`, {
      method: 'POST',
      body: { rating },
    })) as any

    // Update the submission in the local array
    const submissionIndex = submissions.value.findIndex(sub => sub.id === submissionId)
    if (submissionIndex !== -1) {
      submissions.value[submissionIndex] = {
        ...submissions.value[submissionIndex],
        rating: response.data.rating,
        ratedBy: response.data.ratedBy,
        ratedAt: response.data.ratedAt,
      }
    }

    console.log('Submission rated successfully:', response)
  } catch (error) {
    console.error('Failed to rate submission:', error)
    alert('Failed to rate submission')
  } finally {
    ratingLoading.value[submissionId] = false
  }
}

function getRatingStarIcon(currentRating: number | null, starPosition: number): string {
  if (!currentRating) return '☆'
  return currentRating >= starPosition ? '★' : '☆'
}

function getRatingStarClass(currentRating: number | null, starPosition: number): string {
  if (!currentRating) return 'text-gray-300 hover:text-yellow-400'
  return currentRating >= starPosition ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
}

// Task management functions
function editTask(task: any) {
  selectedTask.value = task
  taskForm.value = {
    title: task.title,
    category: task.category,
    description: task.description,
    estimatedTime: task.estimatedTime,
    difficulty: task.difficulty,
  }
  showEditTaskModal.value = true
}

function confirmDeleteTask(task: any) {
  if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
    deleteTask(task.id)
  }
}

async function deleteTask(taskId: string) {
  try {
    await $fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    // Refresh tasks list
    await fetchTasks()
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete task')
  }
}

async function saveTask() {
  taskFormLoading.value = true
  try {
    if (showEditTaskModal.value && selectedTask.value) {
      // Update existing task
      await $fetch(`/api/tasks/${selectedTask.value.id}`, {
        method: 'PUT',
        body: taskForm.value,
      })
    } else {
      // Create new task
      await $fetch('/api/tasks', {
        method: 'POST',
        body: taskForm.value,
      })
    }

    // Refresh tasks list
    await fetchTasks()
    closeTaskModal()
  } catch (error) {
    console.error('Failed to save task:', error)
    alert('Failed to save task')
  } finally {
    taskFormLoading.value = false
  }
}

function closeTaskModal() {
  showCreateTaskModal.value = false
  showEditTaskModal.value = false
  selectedTask.value = null
  taskForm.value = {
    title: '',
    category: '',
    description: '',
    estimatedTime: 30,
    difficulty: 1,
  }
}

// Competition control functions
async function loadCompetitionState() {
  try {
    competitionState.value = await $fetch('/api/competition/settings')
    if (competitionState.value) {
      competitionDurationMinutes.value = competitionState.value.durationMinutes
    }
  } catch (error) {
    console.error('Failed to load competition state:', error)
  }
}

async function startCompetition() {
  controlLoading.value = true
  settingsMessage.value = ''

  try {
    const response = await $fetch('/api/competition/start', { method: 'POST' })
    competitionState.value = response.state
    settingsMessage.value = 'Competition started!'
    settingsMessageType.value = 'success'
  } catch (error) {
    console.error('Failed to start competition:', error)
    settingsMessage.value = 'Failed to start competition'
    settingsMessageType.value = 'error'
  } finally {
    controlLoading.value = false
  }
}

async function stopCompetition() {
  if (!confirm('Are you sure you want to stop and reset the competition?')) {
    return
  }

  controlLoading.value = true
  settingsMessage.value = ''

  try {
    const response = await $fetch('/api/competition/stop', { method: 'POST' })
    competitionState.value = response.state
    settingsMessage.value = 'Competition stopped and reset'
    settingsMessageType.value = 'success'
  } catch (error) {
    console.error('Failed to stop competition:', error)
    settingsMessage.value = 'Failed to stop competition'
    settingsMessageType.value = 'error'
  } finally {
    controlLoading.value = false
  }
}

async function pauseCompetition() {
  controlLoading.value = true
  settingsMessage.value = ''

  try {
    const response = await $fetch('/api/competition/pause', { method: 'POST' })
    competitionState.value = response.state
    settingsMessage.value = 'Competition paused'
    settingsMessageType.value = 'success'
  } catch (error) {
    console.error('Failed to pause competition:', error)
    settingsMessage.value = 'Failed to pause competition'
    settingsMessageType.value = 'error'
  } finally {
    controlLoading.value = false
  }
}

async function resumeCompetition() {
  controlLoading.value = true
  settingsMessage.value = ''

  try {
    const response = await $fetch('/api/competition/resume', { method: 'POST' })
    competitionState.value = response.state
    settingsMessage.value = 'Competition resumed'
    settingsMessageType.value = 'success'
  } catch (error) {
    console.error('Failed to resume competition:', error)
    settingsMessage.value = 'Failed to resume competition'
    settingsMessageType.value = 'error'
  } finally {
    controlLoading.value = false
  }
}

async function updateDuration() {
  controlLoading.value = true
  settingsMessage.value = ''

  try {
    const response = await $fetch('/api/competition/update-duration', {
      method: 'POST',
      body: { durationMinutes: competitionDurationMinutes.value },
    })
    competitionState.value = response.state
    settingsMessage.value = 'Duration updated successfully'
    settingsMessageType.value = 'success'
  } catch (error) {
    console.error('Failed to update duration:', error)
    settingsMessage.value = 'Failed to update duration'
    settingsMessageType.value = 'error'
  } finally {
    controlLoading.value = false
  }
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

async function fetchTasks() {
  try {
    console.log('📋 Fetching tasks...')
    const tasksResponse = await $fetch('/api/tasks')
    console.log('✅ Tasks response:', tasksResponse)
    tasks.value = tasksResponse.tasks || []
  } catch (error) {
    console.error('❌ Failed to fetch tasks:', error)
  }
}

async function fetchAdminData() {
  if (!isAdmin.value) {
    console.log('🚫 Not fetching admin data - user is not admin')
    return
  }

  console.log('🔄 Fetching admin data...')
  loadingAdminData.value = true
  try {
    // Fetch teams
    console.log('📊 Fetching teams...')
    const teamsResponse = await $fetch('/api/teams')
    console.log('✅ Teams response:', teamsResponse)
    teams.value = teamsResponse.teams

    // Fetch tasks
    await fetchTasks()

    // Fetch all submissions
    console.log('📋 Fetching submissions...')
    const submissionsResponse = await $fetch('/api/admin/submissions')
    console.log('✅ Submissions response:', submissionsResponse)
    submissions.value = submissionsResponse.submissions || []

    // Calculate stats
    stats.value = {
      totalTeams: teams.value.length,
      totalSubmissions: submissions.value.length,
      completedSubmissions: submissions.value.filter(sub => sub.status === 'completed').length,
      activeSubmissions: submissions.value.filter(sub => sub.status === 'in_progress').length,
    }

    console.log('📈 Calculated stats:', stats.value)
  } catch (error) {
    console.error('❌ Failed to fetch admin data:', error)
  } finally {
    loadingAdminData.value = false
  }
}

// Watch for admin status change to fetch data
watch(
  isAdmin,
  async newIsAdmin => {
    if (newIsAdmin) {
      await fetchAdminData()
      await loadCompetitionState()
    }
  },
  { immediate: true }
)

// Refresh competition state periodically when on settings tab
const refreshInterval = ref<NodeJS.Timeout | null>(null)

watch(activeTab, newTab => {
  if (newTab === 'settings') {
    // Load immediately
    loadCompetitionState()
    // Then refresh every 2 seconds
    refreshInterval.value = setInterval(loadCompetitionState, 2000)
  } else {
    // Clear interval when leaving settings tab
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>
