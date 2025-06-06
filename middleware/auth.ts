export default defineNuxtRouteMiddleware((_to, _from) => {
  // Temporarily disabled to fix session redirect issue
  // const { status } = useAuth()
  
  // if (status.value === 'unauthenticated') {
  //   return navigateTo('/')
  // }
})