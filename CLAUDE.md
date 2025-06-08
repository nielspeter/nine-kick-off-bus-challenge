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
- `npm run lint` - ESLint with Prettier integration for code formatting
- `npm run build` - TypeScript type-checking occurs during build
- ESLint configured with disabled 'any' type checking for development flexibility

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
- **Session Management**: JWT tokens with 30-day expiration including `isAdmin` field
- **Frontend Integration**: `useAuth()` composable for session access
- **Middleware**: `~/middleware/auth.ts` protects routes (currently disabled globally)

## Admin Access Control

### Recommended Approach (Following @sidebase/nuxt-auth best practices)

The application implements admin-only access using the recommended patterns from @sidebase/nuxt-auth documentation:

### Page Protection Strategy
1. **Authentication Layer**: Use `definePageMeta()` with auth configuration
2. **Authorization Layer**: Client-side admin status checking with error boundaries
3. **UI Control**: Conditional navigation menu items based on admin status

### Implementation Pattern

#### 1. NextAuth.js Session Configuration (`server/api/auth/[...].ts`)
```typescript
export default NuxtAuthHandler({
  providers: [
    {
      id: 'fake-auth',
      async authorize(credentials) {
        const user = await User.findByPk(credentials.userId)
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.picture,
          isAdmin: user.isAdmin,  // Include admin status in auth response
        }
      }
    }
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin  // Add to JWT token
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.isAdmin = token.isAdmin  // Add to session
      }
      return session
    }
  }
})
```

#### 2. Page-Level Protection (`pages/admin/index.vue`)
```vue
<script setup>
// Protect page - redirect unauthenticated users to signin
definePageMeta({
  auth: {
    navigateUnauthenticatedTo: '/auth/signin'
  }
})

// Get isAdmin directly from session - no API calls needed!
const { data: session, status } = useAuth()
const isAdmin = computed(() => session.value?.user?.isAdmin === true)

function checkAdminAccess() {
  if (status.value === 'unauthenticated') {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  if (!isAdmin.value) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Admin privileges required.' })
  }
}

watch([status, isAdmin], checkAdminAccess, { immediate: true })
</script>
```

#### 3. Navigation Menu Control (`layouts/default.vue`)
```vue
<template>
  <NuxtLink 
    v-if="userIsAdmin"
    to="/admin" 
    class="text-gray-700 hover:text-primary transition-colors"
  >
    Admin
  </NuxtLink>
</template>

<script setup>
const { data: session } = useAuth()
const user = computed(() => session.value?.user)

// Get isAdmin directly from session - no API calls needed!
const userIsAdmin = computed(() => user.value?.isAdmin === true)
</script>
```

### Security Considerations
- **Client-side checks are for UX only** - Always validate admin access on the server
- **API endpoints should verify admin status** before returning sensitive data
- **Error boundaries** provide graceful handling of access denied scenarios
- **Database-driven** admin status ensures centralized permission management

### Why This Approach?
- **Follows @sidebase/nuxt-auth best practices** from official documentation
- **Efficient**: No additional API calls needed - admin status is in the session
- **Secure**: Admin status is set during authentication and stored in JWT
- **Separation of concerns**: Authentication vs Authorization
- **Progressive enhancement**: Works with SSR and client-side navigation
- **Error boundary protection**: Clear error messages for unauthorized access

### Session Structure
After authentication, the session endpoint (`/api/auth/session`) returns:
```json
{
  "user": {
    "id": "user_nps",
    "name": "Mikkel Gybel Lindgren",
    "email": "nps@nine.dk", 
    "image": null,
    "isAdmin": false
  },
  "expires": "2025-07-08T14:50:09.278Z"
}
```

This makes admin checking as simple as: `session.value?.user?.isAdmin === true`

## Page Protection Patterns

### Authentication Middleware for Pages

The application uses @sidebase/nuxt-auth middleware patterns for protecting pages:

#### 1. Global Middleware (Disabled by Default)
```typescript
// nuxt.config.ts
auth: {
  globalAppMiddleware: {
    isEnabled: false, // Set to true to protect all pages by default
  },
}
```

#### 2. Page-Level Protection Patterns

**Standard Auth Protection (Redirect to Sign-in):**
```vue
<script setup>
definePageMeta({
  middleware: 'auth', // Uses built-in auth middleware
})

// OR with custom redirect:
definePageMeta({
  auth: {
    navigateUnauthenticatedTo: '/auth/signin',
  },
})
</script>
```

**Examples of Protected Pages:**
- `/pages/challenge/[id].vue` - Requires authentication to access challenges
- `/pages/team/index.vue` - Requires authentication for team management
- `/pages/tasks/index.vue` - Requires authentication to view and start challenges

#### 3. Server-Side API Protection

**All sensitive API endpoints must include authentication checks:**
```typescript
import { getServerSession } from '#auth'

export default defineEventHandler(async event => {
  // Verify user session
  const session = await getServerSession(event)
  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }
  
  // Continue with protected logic...
})
```

**Protected API Endpoints:**
- `/api/ai/chat.post.ts` - AI chat functionality
- `/api/challenges/start.post.ts` - Starting challenges
- `/api/challenges/submit.post.ts` - Submitting challenge solutions
- `/api/submissions/[id].get.ts` - Viewing submission details
- `/api/submissions/[id]/forfeit.post.ts` - Forfeiting challenges
- All team management endpoints (`/api/teams/**`)

#### 4. Frontend Authentication Patterns

**Using Auth Composable:**
```vue
<script setup>
const { data: session, status, signOut } = useAuth()
const user = computed(() => session.value?.user)

// Check authentication status
const isAuthenticated = computed(() => status.value === 'authenticated')
const isAdmin = computed(() => user.value?.isAdmin === true)
</script>

<template>
  <!-- Conditional rendering based on auth status -->
  <div v-if="isAuthenticated">
    <p>Welcome, {{ user.name }}!</p>
    <button @click="signOut">Logout</button>
  </div>
  <div v-else>
    <NuxtLink to="/auth/signin">Sign In</NuxtLink>
  </div>
</template>
```

#### 5. Navigation and UI Controls

**Conditional Navigation Items:**
```vue
<!-- Show Teams link only to authenticated users -->
<NuxtLink v-if="user" to="/team">Teams</NuxtLink>
<span v-else class="text-gray-400 cursor-not-allowed">Teams</span>

<!-- Show Admin link only to admin users -->
<NuxtLink v-if="userIsAdmin" to="/admin">Admin</NuxtLink>
```

### Key Security Principles

1. **Defense in Depth**: Protect both frontend (UX) and backend (security)
2. **Server-Side Validation**: Always validate permissions on API endpoints
3. **Session-Based Auth**: Use JWT tokens stored in session for auth state
4. **Graceful Degradation**: Show appropriate UI states for unauthenticated users
5. **Error Handling**: Provide clear error messages for unauthorized access

### Common Auth Patterns Used

- **Middleware Protection**: `middleware: 'auth'` for page-level protection
- **Session Validation**: `getServerSession(event)` for API endpoint protection
- **Conditional UI**: `v-if="user"` for authenticated-only features
- **Admin Checks**: `user?.isAdmin === true` for admin-only features
- **Redirect Logic**: `navigateUnauthenticatedTo` for custom sign-in redirects