# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 application for the "Nine KickOff Bus Challenge" - an AI creativity competition platform where teams compete by using AI to solve challenges across different professional domains during a bus trip.

## Key Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
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

3. **Key Features to Implement**
   - Google SSO authentication
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