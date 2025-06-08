<template>
  <div class="max-w-4xl mx-auto text-center p-4 md:p-6">
    <!-- Competition Timer -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg p-6 mb-8">
      <div class="mb-4">
        <h2 class="text-2xl font-bold mb-2">🚌 Nine KickOff Bus Challenge</h2>
        <p class="opacity-90">{{ getStatusMessage() }}</p>
      </div>
      
      <div class="text-4xl font-mono font-bold mb-4" :class="getStatusColor()">
        {{ timeLeft }}
      </div>
      
      <!-- Progress Bar -->
      <div v-if="competitionStatus === 'active'" class="w-full bg-white/20 rounded-full h-2 mb-4">
        <div 
          class="bg-white h-2 rounded-full transition-all duration-1000"
          :style="{ width: `${progress}%` }"
        />
      </div>
      
      <div class="text-sm opacity-75">
        <div v-if="competitionStatus === 'upcoming'">
          Get ready for an exciting AI creativity journey!
        </div>
        <div v-else-if="competitionStatus === 'active'">
          Competition is live! Form your team and start solving challenges.
        </div>
        <div v-else>
          Thank you for participating! Results will be announced soon.
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="py-8">
      <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Nine KickOff
        <span class="text-blue-600">Bus Challenge</span>
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        An AI creativity competition where teams compete by using AI to solve challenges 
        across different professional domains during the bus trip.
      </p>
      
      <!-- Quick Actions -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          Ready to compete?
        </h2>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/team" 
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Manage Team
          </NuxtLink>
          <NuxtLink 
            to="/tasks" 
            class="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Challenges
          </NuxtLink>
          <NuxtLink 
            to="/leaderboard" 
            class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Leaderboard
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-12 grid md:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <Icon name="heroicons:users" class="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Team Formation</h3>
        <p class="text-gray-600">
          Self-organize into teams of 2-4 people and compete together
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <Icon name="heroicons:puzzle-piece" class="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">AI Challenges</h3>
        <p class="text-gray-600">
          Solve creative challenges across 8 different professional domains
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <Icon name="heroicons:trophy" class="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Competition</h3>
        <p class="text-gray-600">
          Compete for creativity, innovation, and best use of AI
        </p>
      </div>
    </div>

    <!-- Challenge Categories -->
    <div class="py-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">Challenge Categories</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="category in categories" :key="category.name" class="bg-white p-4 rounded-lg border text-center">
          <div class="text-2xl mb-2">{{ category.icon }}</div>
          <h4 class="font-semibold text-sm">{{ category.name }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Competition timer
const { 
  timeLeft, 
  competitionStatus, 
  progress, 
  startTimer, 
  getStatusMessage, 
  getStatusColor 
} = useCompetitionTimer()

const categories = [
  { name: 'Test', icon: '🧪' },
  { name: 'Project Management', icon: '📋' },
  { name: 'Backend', icon: '⚙️' },
  { name: 'Frontend', icon: '🎨' },
  { name: 'Sales', icon: '💼' },
  { name: 'Business Analysis', icon: '📊' },
  { name: 'BUL/Sales', icon: '🤝' },
  { name: 'Communication', icon: '📢' }
]

// Start the competition timer when component mounts
onMounted(() => {
  startTimer()
})
</script>