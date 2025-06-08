export default defineEventHandler(async () => {
  return {
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  }
})
