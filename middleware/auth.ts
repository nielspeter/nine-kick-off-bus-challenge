export default defineNuxtRouteMiddleware(async to => {
  // Get user session using @sidebase/nuxt-auth
  const { status } = useAuth()

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/error']

  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    return
  }

  // If user is not logged in, redirect to signin
  if (status.value === 'unauthenticated') {
    return navigateTo('/auth/signin')
  }
})
