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
              to="/users" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path.startsWith('/users') }"
            >
              Users
            </NuxtLink>
            <NuxtLink 
              v-if="userIsAdmin"
              to="/admin" 
              class="text-gray-700 hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': $route.path.startsWith('/admin') }"
            >
              Admin
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Current user -->
            <div v-if="user" class="hidden md:flex items-center space-x-2">
              <img 
                v-if="(user as any).picture" 
                :src="(user as any).picture" 
                :alt="(user as any).name"
                class="w-8 h-8 rounded-full"
              >
              <div 
                v-else 
                class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
              >
                {{ (user as any).name?.charAt(0) || '?' }}
              </div>
              <span class="text-gray-700">{{ (user as any).name }}</span>
              <button 
                class="text-gray-500 hover:text-gray-700 text-sm"
                @click="logout"
              >
                Logout
              </button>
            </div>
            
            <!-- Login button when not authenticated -->
            <div v-else class="hidden md:flex">
              <NuxtLink 
                to="/auth/signin"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </NuxtLink>
            </div>
            
            <!-- Mobile menu button -->
            <button 
              class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              @click="showMobileMenu = !showMobileMenu"
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
              to="/users" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Users
            </NuxtLink>
            <NuxtLink 
              v-if="userIsAdmin"
              to="/admin" 
              class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              @click="showMobileMenu = false"
            >
              Admin
            </NuxtLink>
            
            <!-- Mobile User Info -->
            <div v-if="user" class="border-t pt-2 mt-2">
              <div class="px-3 py-2 flex items-center space-x-2">
                <img 
                  v-if="(user as any).picture" 
                  :src="(user as any).picture" 
                  :alt="(user as any).name"
                  class="w-6 h-6 rounded-full"
                >
                <div 
                  v-else 
                  class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium"
                >
                  {{ (user as any).name?.charAt(0) || '?' }}
                </div>
                <span class="text-gray-700 text-sm">{{ (user as any).name }}</span>
              </div>
              <button 
                class="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                @click="logout"
              >
                Logout
              </button>
            </div>
            
            <!-- Mobile Login -->
            <div v-else class="border-t pt-2 mt-2">
              <NuxtLink 
                to="/auth/signin"
                class="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-center"
                @click="showMobileMenu = false"
              >
                Sign In
              </NuxtLink>
            </div>
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
const { data: session, signOut } = useAuth()
const user = computed(() => session.value?.user)
const userIsAdmin = ref(false)

// Check if current user is admin
async function checkUserAdmin() {
  const currentUser = user.value as { id?: string } | undefined
  if (!currentUser?.id) {
    userIsAdmin.value = false
    return
  }

  try {
    const userResponse = await $fetch(`/api/users/${currentUser.id}`) as {
      success: boolean
      user?: { isAdmin: boolean }
    }
    userIsAdmin.value = userResponse.success && userResponse.user?.isAdmin === true
  } catch (error) {
    console.error('Failed to check admin status:', error)
    userIsAdmin.value = false
  }
}

// Watch for user changes to check admin status
watch(user, async (newUser) => {
  if (newUser) {
    await checkUserAdmin()
  } else {
    userIsAdmin.value = false
  }
}, { immediate: true })

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  showMobileMenu.value = false
})

async function logout() {
  await signOut()
  await navigateTo('/auth/signin')
}
</script>