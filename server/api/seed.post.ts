export default defineEventHandler(async (_event) => {
  return {
    success: true,
    message: 'Database is already seeded with users and tasks from init-db/001-seed.sql'
  }
})