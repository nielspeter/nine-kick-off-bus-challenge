<template>
  <NuxtLayout name="default">
    <div class="max-w-4xl mx-auto p-4 md:p-6">
      <!-- Error Header -->
      <div class="text-center mb-12">
        <!-- Error Icon -->
        <div class="mx-auto h-20 w-20 flex items-center justify-center mb-6">
          <Icon :name="errorIcon" class="h-20 w-20" :class="errorIconColor" />
        </div>

        <!-- Error Code -->
        <h1 class="text-6xl font-bold text-gray-900 mb-2">
          {{ error.statusCode }}
        </h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">
          {{ errorTitle }}
        </h2>
        <p class="text-gray-600 text-lg">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Error Details Card -->
      <div class="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
        <!-- Additional Info for 403 -->
        <div v-if="error.statusCode === 403" class="mb-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <Icon
                name="heroicons:shield-exclamation"
                class="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
              />
              <div class="text-sm text-red-800">
                <p class="font-medium">Admin Access Required</p>
                <p class="mt-1">
                  Only administrators can access this section. If you believe you should have
                  access, please contact your system administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info for 404 -->
        <div v-if="error.statusCode === 404" class="mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <Icon
                name="heroicons:information-circle"
                class="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              />
              <div class="text-sm text-blue-800">
                <p class="font-medium">Page Not Found</p>
                <p class="mt-1">
                  The page you're looking for might have been moved, deleted, or the URL might be
                  incorrect. Try navigating using the menu above.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Server Error Info -->
        <div v-if="error.statusCode >= 500" class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start">
              <Icon
                name="heroicons:exclamation-triangle"
                class="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
              />
              <div class="text-sm text-yellow-800">
                <p class="font-medium">Server Error</p>
                <p class="mt-1">
                  We're experiencing technical difficulties. Please try again in a few moments.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            class="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
            @click="handleError"
          >
            {{ primaryAction }}
          </button>

          <NuxtLink
            to="/"
            class="bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium text-center"
          >
            <Icon name="heroicons:home" class="w-4 h-4 inline mr-2" />
            Go Home
          </NuxtLink>
        </div>
      </div>

      <!-- Help Section -->
      <div class="bg-gray-50 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p class="text-gray-600 mb-4">
          If you continue to experience issues, you can try the following:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="text-gray-700">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 inline mr-1" />
            Refresh the page
          </div>
          <div class="text-gray-700">
            <Icon name="heroicons:home" class="w-4 h-4 inline mr-1" />
            Return to homepage
          </div>
          <div class="text-gray-700">
            <Icon name="heroicons:user-circle" class="w-4 h-4 inline mr-1" />
            Check your permissions
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
interface ErrorProps {
  statusCode: number
  statusMessage?: string
}

const props = defineProps<{
  error: ErrorProps
}>()

// Computed properties for different error types
const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 403:
      return 'Access Denied'
    case 404:
      return 'Page Not Found'
    case 500:
      return 'Server Error'
    default:
      return 'Something went wrong'
  }
})

const errorMessage = computed(() => {
  if (props.error.statusMessage) {
    return props.error.statusMessage
  }

  switch (props.error.statusCode) {
    case 403:
      return "You don't have permission to access this resource."
    case 404:
      return "The page you're looking for doesn't exist."
    case 500:
      return 'An internal server error occurred.'
    default:
      return 'An unexpected error occurred.'
  }
})

const errorIcon = computed(() => {
  switch (props.error.statusCode) {
    case 403:
      return 'heroicons:shield-exclamation'
    case 404:
      return 'heroicons:question-mark-circle'
    case 500:
      return 'heroicons:exclamation-triangle'
    default:
      return 'heroicons:x-circle'
  }
})

const errorIconColor = computed(() => {
  switch (props.error.statusCode) {
    case 403:
      return 'text-red-500'
    case 404:
      return 'text-blue-500'
    case 500:
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
})

const primaryAction = computed(() => {
  switch (props.error.statusCode) {
    case 403:
      return 'Sign In'
    case 404:
      return 'Go Back'
    default:
      return 'Try Again'
  }
})

const handleError = () => {
  switch (props.error.statusCode) {
    case 403:
      navigateTo('/auth/signin')
      break
    case 404:
      window.history.back()
      break
    default:
      window.location.reload()
  }
}

// Set page title based on error
useHead({
  title: `${props.error.statusCode} - ${errorTitle.value} | Nine KickOff Bus Challenge`,
})
</script>
