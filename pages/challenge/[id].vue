<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p class="mt-4 text-gray-600">Loading challenge...</p>
    </div>

    <div v-else-if="submission" class="space-y-6">
      <!-- Challenge Header -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4 md:gap-0">
          <div>
            <h1 class="text-2xl font-bold mb-2">{{ submission.task.title }}</h1>
            <p class="text-gray-600 mb-4">{{ submission.task.description }}</p>

            <div class="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500">
              <div class="flex items-center gap-1">
                <Icon name="heroicons:clock" class="w-4 h-4" />
                {{ submission.task.estimatedTime }} minutes
              </div>
              <div class="flex items-center gap-1">
                <Icon name="heroicons:star" class="w-4 h-4" />
                {{ getDifficultyText(submission.task.difficulty) }}
              </div>
              <div class="flex items-center gap-1">
                <Icon name="heroicons:tag" class="w-4 h-4" />
                {{ submission.task.category }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-sm text-gray-500">Team</div>
            <div class="font-medium">{{ submission.team.name }}</div>
            <div
              class="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2"
              :class="getStatusClass(submission.status)"
            >
              {{ submission.status === 'in_progress' ? 'In Progress' : 'Completed' }}
            </div>
          </div>
        </div>

        <!-- Challenge Actions -->
        <div v-if="submission.status === 'in_progress'" class="flex flex-col sm:flex-row gap-3">
          <button
            :disabled="!finalAnswer.trim()"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            @click="showSubmitModal = true"
          >
            Submit Final Answer
          </button>
          <button
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            @click="forfeitChallenge"
          >
            Forfeit Challenge
          </button>
        </div>
      </div>

      <!-- AI Chat Interface -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold">AI Collaboration Space</h2>
              <p class="text-blue-100">Work with AI to solve this challenge creatively</p>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400',
                ]"
              />
              <span class="text-blue-100">
                {{ isConnected ? 'Live' : 'Offline' }}
              </span>
              <span v-if="activeUsers.length > 0" class="text-blue-200 ml-2">
                {{ activeUsers.length }} active
              </span>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div ref="chatContainer" class="h-[600px] overflow-y-auto p-4 space-y-4">
          <div v-if="chatHistory.length === 0" class="text-center text-gray-500 py-8">
            <Icon
              name="heroicons:chat-bubble-left-right"
              class="w-12 h-12 mx-auto mb-2 text-gray-400"
            />
            <p>Start a conversation with AI to brainstorm solutions!</p>
          </div>

          <div
            v-for="(message, index) in displayChatHistory"
            :key="index"
            class="flex gap-3"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              v-if="message.role === 'assistant'"
              class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
              :title="getModelName(message.provider)"
            >
              🤖
            </div>

            <div
              class="max-w-3xl px-4 py-2 rounded-lg"
              :class="
                message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
              "
            >
              <div v-if="message.role === 'user' && message.user" class="text-xs opacity-70 mb-1">
                {{ message.user.name }}
              </div>
              <div class="whitespace-pre-wrap">{{ message.content }}</div>
              <!-- Debug role -->
              <div class="text-xs mt-1 opacity-50">[Role: {{ message.role }}]</div>
              <div class="text-xs opacity-70 mt-1">
                {{ formatTime(message.timestamp) }}
                <span v-if="message.provider" class="ml-2">
                  • {{ getModelName(message.provider) }}
                </span>
              </div>
            </div>

            <div
              v-if="message.role === 'user'"
              class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white"
            >
              {{ message.user?.name?.charAt(0) || '👤' }}
            </div>
          </div>

          <div v-if="isTyping" class="flex gap-3 justify-start">
            <div
              class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
            >
              🤖
            </div>
            <div class="bg-gray-100 px-4 py-2 rounded-lg">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0.1s"
                />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0.2s"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="border-t p-4">
          <div v-if="submission.status === 'completed'" class="text-center py-4 text-gray-500">
            <Icon name="heroicons:chat-bubble-left-right" class="w-8 h-8 mx-auto mb-2" />
            <p>Chat is disabled for completed challenges</p>
          </div>
          <div v-else-if="isCompetitionPaused" class="text-center py-4 text-orange-600">
            <Icon name="heroicons:pause-circle" class="w-8 h-8 mx-auto mb-2" />
            <p>Competition is paused. Chat will resume when competition continues.</p>
          </div>
          <form v-else class="flex flex-col sm:flex-row gap-2" @submit.prevent="sendMessage">
            <select
              v-model="selectedProvider"
              class="border rounded-lg px-3 py-2 bg-white"
              :disabled="isTyping"
            >
              <option value="openai">GPT-4</option>
              <option value="claude">Claude</option>
            </select>
            <input
              v-model="newMessage"
              type="text"
              placeholder="Ask AI for help with this challenge..."
              class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
              :disabled="isTyping"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || isTyping"
              class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <!-- Final Answer Section -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h3 class="text-lg font-semibold mb-4">Final Answer</h3>
        <textarea
          v-model="finalAnswer"
          placeholder="Write your team's final creative solution here..."
          class="w-full h-32 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          :disabled="submission.status === 'completed'"
        />

        <div
          v-if="submission.status === 'completed'"
          class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div class="flex items-center gap-2 text-green-800">
            <Icon name="heroicons:check-circle" class="w-5 h-5" />
            <span class="font-medium">Challenge Completed!</span>
          </div>
          <p class="text-green-700 mt-1">Submitted on {{ formatTime(submission.submittedAt) }}</p>
        </div>

        <div v-else class="mt-4 flex justify-end">
          <div v-if="isCompetitionPaused" class="text-orange-600 text-sm">
            <Icon name="heroicons:pause-circle" class="w-4 h-4 inline mr-1" />
            Submission disabled while competition is paused
          </div>
          <button
            v-else
            :disabled="!finalAnswer.trim()"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            @click="showSubmitModal = true"
          >
            Submit Final Answer
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div
      v-if="showSubmitModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Submit Challenge</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to submit your final answer? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            @click="showSubmitModal = false"
          >
            Cancel
          </button>
          <button
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            @click="submitChallenge"
          >
            Submit
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-12">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Challenge Not Found</h3>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <NuxtLink to="/tasks" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
        Back to Challenges
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Authentication setup - following @sidebase/nuxt-auth pattern
definePageMeta({
  middleware: 'auth',
})

const { data: session } = useAuth()

const route = useRoute()
const submissionId = route.params.id as string

// Competition state
const competitionState = ref(null)

// Real-time collaboration
const {
  chatHistory: realtimeChatHistory,
  activeUsers,
  isConnected,
  updateChatHistory,
  publishTyping,
} = useRealtimeChallenge(submissionId)

const loading = ref(true)
const error = ref('')
const submission = ref(null)
const chatHistory = ref([])
const newMessage = ref('')
const selectedProvider = ref('openai')
const isTyping = ref(false)
const finalAnswer = ref('')
const showSubmitModal = ref(false)
const chatContainer = ref(null)

// Computed property to check if competition is paused
const isCompetitionPaused = computed(() => {
  return competitionState.value?.isPaused === true
})

// Merge local and real-time chat history
const displayChatHistory = computed(() => {
  // If local chat has more recent messages (user just sent something), prefer local
  // Otherwise use real-time chat history for synchronized view
  const localLength = chatHistory.value.length
  const realtimeLength = realtimeChatHistory.value.length

  // Use local if it has more messages (user just sent something)
  // or if real-time is empty
  if (localLength > realtimeLength || realtimeLength === 0) {
    return chatHistory.value
  }

  return realtimeChatHistory.value
})

function getDifficultyText(difficulty: number) {
  const levels = ['Easy', 'Medium', 'Hard']
  return levels[difficulty - 1] || 'Unknown'
}

function getStatusClass(status: string) {
  if (status === 'completed') return 'bg-green-100 text-green-800'
  return 'bg-blue-100 text-blue-800'
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleString()
}

function getModelName(provider: string) {
  switch (provider) {
    case 'openai':
      return 'GPT-4'
    case 'claude':
      return 'Claude 3 Sonnet'
    default:
      return provider || 'AI'
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || isTyping.value) return

  const message = newMessage.value.trim()
  newMessage.value = ''
  isTyping.value = true

  // Add user message immediately to chat history for instant feedback
  const user = session.value?.user as any // Type assertion to access id field
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
    user: {
      id: user?.id,
      name: user?.name,
      email: user?.email,
    },
  }

  // Add to local chat history immediately
  chatHistory.value = [...chatHistory.value, userMessage]
  scrollToBottom()

  try {
    const response = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        submissionId,
        message,
        provider: selectedProvider.value,
      },
    })

    // Update with complete chat history from server (includes AI response)
    chatHistory.value = response.chatHistory
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    alert('Failed to send message: ' + error.message)

    // Remove the user message from chat if API call failed
    chatHistory.value = chatHistory.value.filter(m => m !== userMessage)
  } finally {
    isTyping.value = false
  }
}

async function submitChallenge() {
  if (!finalAnswer.value.trim()) return

  try {
    await $fetch('/api/challenges/submit', {
      method: 'POST',
      body: {
        submissionId,
        finalAnswers: [finalAnswer.value],
      },
    })

    showSubmitModal.value = false
    await fetchSubmission() // Refresh data

    // Success notification
    alert('Challenge submitted successfully!')
  } catch (error) {
    console.error('Failed to submit challenge:', error)
    alert('Failed to submit challenge: ' + error.message)
  }
}

async function forfeitChallenge() {
  if (!submission.value) return

  const confirmMessage =
    'Are you sure you want to forfeit this challenge? This will allow you to start a new challenge, but your progress will be lost.'
  if (!confirm(confirmMessage)) return

  try {
    await $fetch(`/api/submissions/${submission.value.id}/forfeit`, {
      method: 'POST',
    })

    // Success notification and redirect
    alert('Challenge forfeited successfully! You can now start a new challenge.')
    await navigateTo('/tasks')
  } catch (error) {
    console.error('Failed to forfeit challenge:', error)
    alert('Failed to forfeit challenge: ' + error.message)
  }
}

async function fetchCompetitionState() {
  try {
    competitionState.value = await $fetch('/api/competition/settings')
  } catch (error) {
    console.error('Failed to fetch competition state:', error)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function fetchSubmission() {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/submissions/${submissionId}`)
    submission.value = response.submission

    // Initialize both local and real-time chat history
    const initialHistory = response.submission.chatHistory || []
    chatHistory.value = initialHistory
    updateChatHistory(initialHistory)

    // Set final answer if exists
    if (response.submission.finalAnswers && response.submission.finalAnswers.length > 0) {
      finalAnswer.value = response.submission.finalAnswers[0]
    }
  } catch (err) {
    error.value = err.message || 'Submission not found'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubmission()
  fetchCompetitionState()

  // Listen for real-time chat message events
  window.addEventListener('chat-message-added', scrollToBottom)
})

onUnmounted(() => {
  window.removeEventListener('chat-message-added', scrollToBottom)
})

// Auto-scroll when new messages arrive
watch(
  displayChatHistory,
  () => {
    scrollToBottom()
  },
  { deep: true }
)
</script>
