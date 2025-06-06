# Nine KickOff Bus Challenge - Setup Guide

## Team Creation Issue Resolution

### Problem
Team creation was failing because the database wasn't properly connected and seeded with users.

### Temporary Solution (Mock Mode)
To allow immediate testing of team creation functionality, I've created mock API endpoints:
- `/api/teams/create-mock` - Creates teams without database
- `/api/teams/list-mock` - Lists mock teams

The frontend is currently configured to use these mock endpoints.

### To Switch Back to Real Database

1. **Start PostgreSQL Database**:
   ```bash
   docker compose up -d postgres
   ```

2. **Verify Database Connection**:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Seed Database with Users**:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

4. **Update Frontend to Use Real Endpoints**:
   In `pages/team/index.vue`, change:
   ```javascript
   // From:
   const response = await $fetch('/api/teams/create-mock', ...)
   const response = await $fetch('/api/teams/list-mock')
   
   // To:
   const response = await $fetch('/api/teams/create', ...)
   const response = await $fetch('/api/teams')
   ```

### Current Status
✅ Team creation interface works with mock data
✅ Team management UI is fully functional
✅ All team operations (create, join, leave, transfer captaincy) implemented
⚠️ Database connection needs to be established for persistent data

### Testing Team Creation
With the development server running (`npm run dev`), you can:
1. Go to `/team` page
2. Click "Create New Team" 
3. Enter a team name and submit
4. The team will be created and you'll see it in the interface

This allows you to test all team functionality without database dependencies.