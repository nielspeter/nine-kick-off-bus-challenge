<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center">
          <Icon name="heroicons:academic-cap" class="h-12 w-12 text-primary" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Nine KickOff Bus Challenge
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in with your Nine email account
        </p>
      </div>
      <div class="mt-8 space-y-6">
        <button
          @click="handleSignIn"
          :disabled="loading"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
const { signIn } = useAuth()
const loading = ref(false)

async function handleSignIn() {
  loading.value = true
  try {
    await signIn('google', { callbackUrl: '/team' })
  } catch (error) {
    console.error('Sign in error:', error)
  } finally {
    loading.value = false
  }
}
</script>