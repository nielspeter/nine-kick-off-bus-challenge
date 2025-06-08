<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6">
    <div class="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h1 class="text-3xl font-bold mb-6">Error Page Testing</h1>
      
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Test Error Pages</h2>
        <p class="text-gray-600 mb-6">
          Click the buttons below to test different error scenarios:
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            class="bg-red-100 text-red-800 py-3 px-4 rounded-md hover:bg-red-200 transition-colors font-medium"
            @click="test403"
          >
            Test 403 - Access Denied
          </button>
          
          <button
            class="bg-blue-100 text-blue-800 py-3 px-4 rounded-md hover:bg-blue-200 transition-colors font-medium"
            @click="test404"
          >
            Test 404 - Not Found
          </button>
          
          <button
            class="bg-yellow-100 text-yellow-800 py-3 px-4 rounded-md hover:bg-yellow-200 transition-colors font-medium"
            @click="test500"
          >
            Test 500 - Server Error
          </button>
        </div>
        
        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">
            <strong>Note:</strong> These buttons will trigger error pages to test the error handling.
            Use browser back button to return to this page.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function test403() {
  throw createError({
    statusCode: 403,
    statusMessage: 'Access denied. Admin privileges required.'
  })
}

function test404() {
  throw createError({
    statusCode: 404,
    statusMessage: 'The requested resource could not be found.'
  })
}

function test500() {
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal server error occurred.'
  })
}

useHead({
  title: 'Error Page Testing | Nine KickOff Bus Challenge'
})
</script>