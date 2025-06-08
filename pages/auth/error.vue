<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center">
          <Icon name="heroicons:exclamation-triangle" class="h-12 w-12 text-red-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Error</h2>
        <p class="mt-2 text-center text-sm text-gray-600">There was a problem signing you in</p>
      </div>

      <div class="mt-8 space-y-6">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Sign in failed</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage }}</p>
                <p class="mt-2">
                  Only Nine employees with @nine.dk email addresses can access this platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button
            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            @click="goToSignIn"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const errorMessage = computed(() => {
  const error = route.query.error as string

  switch (error) {
    case 'AccessDenied':
      return 'Access denied. Only Nine employees can sign in.'
    case 'Configuration':
      return 'Authentication configuration error. Please contact support.'
    case 'Verification':
      return 'Email verification required. Please verify your email and try again.'
    default:
      return error || 'An unknown error occurred during sign in.'
  }
})

function goToSignIn() {
  navigateTo('/auth/signin')
}
</script>
