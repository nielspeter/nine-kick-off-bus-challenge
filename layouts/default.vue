<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-2">
            <div class="text-2xl font-bold text-primary">Nine</div>
            <div class="text-xl text-gray-600">KickOff Bus Challenge</div>
          </NuxtLink>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-6">
            <NuxtLink 
              to="/" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path === '/' }"
            >
              Home
            </NuxtLink>
            <NuxtLink 
              to="/team" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path.startsWith('/team') }"
            >
              Teams
            </NuxtLink>
            <NuxtLink 
              to="/tasks" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path.startsWith('/tasks') || $route.path.startsWith('/challenge') }"
            >
              Challenges
            </NuxtLink>
            <NuxtLink 
              to="/leaderboard" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path.startsWith('/leaderboard') }"
            >
              Leaderboard
            </NuxtLink>
            <NuxtLink 
              to="/admin" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path.startsWith('/admin') }"
            >
              Admin
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Mock user for now -->
            <div class="hidden md:flex items-center space-x-2">
              <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                A
              </div>
              <span class="text-gray-700">Aku</span>
            </div>
            
            <!-- Mobile menu button -->
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Icon name="heroicons:bars-3" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="showMobileMenu" class="md:hidden py-4 border-t">
          <div class="space-y-2">
            <NuxtLink 
              to="/" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Home
            </NuxtLink>
            <NuxtLink 
              to="/team" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Teams
            </NuxtLink>
            <NuxtLink 
              to="/tasks" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Challenges
            </NuxtLink>
            <NuxtLink 
              to="/leaderboard" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Leaderboard
            </NuxtLink>
            <NuxtLink 
              to="/admin" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Admin
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <div class="text-center text-gray-600">
          <p>&copy; 2025 Nine A/S - KickOff Bus Challenge</p>
          <p class="text-sm mt-1">AI Creativity Competition Platform</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const showMobileMenu = ref(false)

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>