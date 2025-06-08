<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center">
          <Icon name="heroicons:academic-cap" class="h-12 w-12 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Nine KickOff Bus Challenge
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">Sign in with your Nine email account</p>
      </div>

      <!-- Fake Auth Mode -->
      <div v-if="config.public.authMode === 'fake'" class="mt-8 space-y-6">
        <div class="space-y-4">
          <label for="user-select" class="block text-sm font-medium text-gray-700">
            Select User (Development Mode)
          </label>
          <select
            id="user-select"
            v-model="selectedUserId"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <option value="">Choose a user...</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
          <button
            v-if="selectedUserId"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            :disabled="loading"
            @click="signInWithFakeUser"
          >
            {{ loading ? 'Signing in...' : 'Sign In as Selected User' }}
          </button>
        </div>
        <div class="text-center text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          🚨 Development Mode: AUTH_MODE=fake
        </div>
      </div>

      <!-- Google OAuth Mode -->
      <div v-else class="mt-8 space-y-6">
        <button
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="handleSignIn"
        >
          <Icon name="logos:google-icon" class="w-5 h-5 mr-2" />
          {{ loading ? 'Signing in...' : 'Sign in with Google' }}
        </button>

        <div class="text-center">
          <p class="text-xs text-gray-500">
            Only Nine employees (@nine.dk) can access this platform
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const loading = ref(false)
const selectedUserId = ref('')
const users = ref([])

// Fetch users for fake auth mode
if (config.public.authMode === 'fake') {
  try {
    const response = await $fetch('/api/users/all')
    users.value = response.data || []
    console.log('👥 Loaded users:', users.value.length, 'users')
    console.log('🔍 First few users:', users.value.slice(0, 3))
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// Watch for changes in selectedUserId to debug the selection issue
watch(selectedUserId, (newValue, oldValue) => {
  console.log('🔄 selectedUserId changed from', oldValue, 'to', newValue)
  if (newValue) {
    const selectedUser = users.value.find(user => user.id === newValue)
    console.log('👤 Selected user:', selectedUser)
  }
})

async function handleSignIn() {
  loading.value = true
  try {
    const { signIn } = useAuth()
    await signIn('google')
  } catch (error) {
    console.error('Sign in error:', error)
  } finally {
    loading.value = false
  }
}

async function signInWithFakeUser() {
  if (!selectedUserId.value) {
    console.error('No user selected')
    return
  }

  console.log('🔍 signInWithFakeUser called with selectedUserId:', selectedUserId.value)

  loading.value = true
  try {
    // Use @sidebase/nuxt-auth's signIn method instead of direct fetch
    const { signIn } = useAuth()

    console.log('🚀 Calling signIn with fake-auth provider and userId:', selectedUserId.value)

    const result = await signIn('fake-auth', {
      userId: selectedUserId.value,
      callbackUrl: '/',
      redirect: false,
    })

    console.log('✅ signIn result:', result)

    if (result && 'error' in result && result.error) {
      console.error('❌ Sign in failed:', result.error)
      alert('Failed to sign in: ' + result.error)
    } else {
      console.log('✅ Sign in successful, redirecting to home page')
      // Redirect manually since we used redirect: false
      await navigateTo('/')
    }
  } catch (error) {
    console.error('❌ Fake sign in error:', error)
    alert('Failed to sign in')
  } finally {
    loading.value = false
  }
}
</script>
