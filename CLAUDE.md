# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 application for the "Nine KickOff Bus Challenge" - an AI creativity competition platform where teams compete by using AI to solve challenges across different professional domains during a bus trip.

## Key Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `nohup npm run dev > /dev/null 2>&1 &` - Run development server in background
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run generate` - Generate static site

### Code Quality
- No dedicated lint command configured yet. Consider adding `nuxt lint` to package.json scripts.
- TypeScript is configured and will type-check during build

## Architecture Overview

### Framework Stack
- **Nuxt 3** (v3.17.5) - Vue.js meta-framework with SSR/SSG capabilities
- **Vue 3** - Reactive UI framework
- **TypeScript** - Type safety throughout the application

### Key Nuxt Modules
- `@nuxt/content` - For managing markdown/content files
- `@nuxt/image` - Image optimization
- `@nuxt/icon` - Icon management
- `@nuxt/fonts` - Font optimization
- `@nuxt/eslint` - Code linting
- `@nuxt/test-utils` - Testing utilities (no tests configured yet)

### Project Structure
Currently minimal - only basic Nuxt setup exists. Key directories to be created:
- `/pages/` - File-based routing for different views (teams, challenges, admin)
- `/components/` - Reusable Vue components
- `/composables/` - Composition API utilities for state and logic
- `/server/api/` - API routes for backend functionality

## Business Requirements

The application implements a team-based competition system with:

1. **Team Management**
   - Self-organizing teams of 2-4 people
   - Dynamic team creation and member management
   - Single team membership per person

2. **Challenge System**
   - 8 challenge categories (Test, PM, Backend, Frontend, Tilbud, BA/EA, BUL/Salg, Communication)
   - Self-paced progression (one active challenge per team)
   - Submit-to-proceed workflow

3. **Authentication System**
   - Dual authentication modes via `AUTH_MODE` environment variable
   - Google SSO for production (`AUTH_MODE=google`)
   - Fake auth for development (`AUTH_MODE=fake`)
   - Uses @sidebase/nuxt-auth with NextAuth.js backend

4. **Key Features to Implement**
   - Real-time team status updates
   - Challenge selection and submission
   - Admin interface for manual judging post-event
   - Mobile-responsive design for bus usage

## Database Considerations

PRD specifies PostgreSQL with Sequelize ORM (not yet implemented). Key entities:
- Users (Google SSO integration)
- Teams (with captain designation)
- Challenges (across 8 categories)
- Submissions (with timestamps and content)

## Development Notes

- The project is freshly initialized with no implementation yet
- Focus on mobile-first design as primary usage will be on smartphones during bus ride
- Real-time features suggested for team updates and leaderboard
- Manual judging system required (no automated scoring)

## Available Tools for Claude Code

When working on this project, Claude Code has access to:

### Browser Testing
- **Playwright MCP** - Can interact with the running application in a browser
  - Navigate to pages, fill forms, click buttons
  - Take screenshots and inspect page content
  - Test authentication flows and user interactions
  - Useful for debugging frontend issues and testing functionality

### Container Management  
- **Docker MCP** - Can manage Docker containers and inspect logs
  - List running containers and their status
  - Fetch container logs to debug server-side issues
  - Monitor application health and troubleshoot deployment issues
  - Useful for debugging authentication, database connections, and server errors

These tools enable comprehensive testing and debugging of both frontend and backend functionality without requiring manual browser testing.

## Authentication Configuration

The application uses **@sidebase/nuxt-auth** with dual authentication modes:

### Environment Variables
- `AUTH_MODE=fake` - Development mode with user selection dropdown
- `AUTH_MODE=google` - Production mode with Google OAuth
- `AUTH_ORIGIN=http://localhost:3000/api/auth` - Auth endpoint base URL
- `AUTH_SECRET` - Required for JWT token encryption

### Fake Authentication (Development)
- **Purpose**: Easy testing without Google OAuth setup
- **Access**: Visit `/auth/signin` in development mode
- **Usage**: Select any user from dropdown and click "Sign In as Selected User"
- **Direct Access**: Visit `/api/auth/signin/fake-auth` and enter user ID (e.g., `user_anv`)
- **User IDs**: All follow pattern `user_xxx` where xxx is the 3-letter identifier

### Google Authentication (Production)
- **Purpose**: Secure production authentication
- **Requirements**: Google OAuth client ID and secret
- **Restriction**: Only @nine.dk email addresses allowed
- **Configuration**: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables

### Technical Implementation
- **Handler**: `~/server/api/auth/[...].ts` - NextAuth.js configuration
- **Session Management**: JWT tokens with 30-day expiration
- **Frontend Integration**: `useAuth()` composable for session access
- **Middleware**: `~/middleware/auth.ts` protects routes (currently disabled globally)