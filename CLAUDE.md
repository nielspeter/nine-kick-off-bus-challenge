# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **fully implemented** Nuxt 3 application for the "Nine KickOff Bus Challenge" - an AI creativity competition platform where teams compete by using AI to solve challenges across different professional domains during a bus trip.

**Status**: ✅ **Production Ready** - All core features implemented and tested

## Key Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production with TypeScript checking
- `npm run preview` - Preview production build locally
- `npm run lint` - ESLint with Prettier integration for code formatting

### Docker Development
- `docker-compose -f docker-compose.dev.yml up -d` - Start all services (app, database, Redis, LiteLLM)
- `docker-compose -f docker-compose.dev.yml logs <service>` - View service logs
- `docker-compose -f docker-compose.dev.yml down -v` - Stop services and remove volumes

### Database & Seed Data
- `node scripts/generate-seed-sql.mjs > init-db/seed.sql` - Generate seed data from Nine.dk
- `docker-compose -f docker-compose.dev.yml exec postgres psql -U nineuser -d kickoff_challenge` - Connect to database

## Architecture Overview

### ✅ Implemented Tech Stack
- **Frontend**: Nuxt 3 (v3.17.5) + Vue 3 + TypeScript + Tailwind CSS
- **Backend**: Nitro server with REST API routes
- **Database**: PostgreSQL with Sequelize ORM (fully modeled)
- **Real-time**: Redis + Server-Sent Events (SSE) for live collaboration
- **AI Integration**: LiteLLM proxy with OpenAI, Claude, Gemini support
- **Authentication**: @sidebase/nuxt-auth with Google OAuth + fake auth
- **Containerization**: Docker Compose for development and production

### Key Nuxt Modules (All Configured)
- `@nuxt/eslint` - Code linting and formatting
- `@nuxt/icon` - Heroicons icon system
- `@nuxt/image` - Image optimization
- `@nuxt/fonts` - Font optimization
- `@nuxtjs/tailwindcss` - Utility-first CSS framework
- `@pinia/nuxt` - State management (configured but not used)
- `@sidebase/nuxt-auth` - Authentication system

### Project Structure (Fully Implemented)
```
├── pages/
│   ├── index.vue                 # Landing page with competition overview
│   ├── auth/signin.vue          # Authentication page with fake/Google auth
│   ├── team/index.vue           # Team management and member administration
│   ├── tasks/index.vue          # Challenge selection and task browsing
│   ├── challenge/[id].vue       # Main challenge workspace with AI chat
│   ├── leaderboard.vue          # Competition leaderboard and rankings
│   ├── admin/index.vue          # Admin interface for submission management
│   └── users.vue                # User directory and profiles
├── server/api/
│   ├── auth/[...].ts            # NextAuth.js authentication handler
│   ├── ai/
│   │   ├── chat.post.ts         # Streaming AI chat with LiteLLM integration
│   │   └── models.get.ts        # Available AI models endpoint
│   ├── challenges/
│   │   ├── index.get.ts         # List available challenges
│   │   ├── start.post.ts        # Start new challenge for team
│   │   └── submit.post.ts       # Submit final answer with Redis broadcast
│   ├── teams/
│   │   ├── index.get.ts         # List teams
│   │   ├── create.post.ts       # Create new team
│   │   ├── join.post.ts         # Join existing team
│   │   ├── leave.post.ts        # Leave team
│   │   └── [id]/*.ts            # Team management operations
│   ├── submissions/
│   │   ├── [id].get.ts          # Get submission details
│   │   └── [id]/*.ts            # Submission operations (forfeit, rate)
│   ├── competition/
│   │   ├── settings.get.ts      # Competition state and timing
│   │   ├── start.post.ts        # Start competition
│   │   ├── pause.post.ts        # Pause competition
│   │   └── *.ts                 # Competition management
│   └── challenge/[id]/
│       └── stream.get.ts        # SSE real-time streaming endpoint
├── composables/
│   ├── useRealtimeChallenge.ts  # Real-time collaboration composable
│   ├── useRealtime.ts           # Basic real-time utilities
│   └── useCompetitionTimer.ts   # Competition timing and countdown
├── server/models/index.ts       # Complete Sequelize database models
├── server/utils/
│   ├── db.ts                    # Database connection and initialization
│   ├── redis.ts                 # Redis client and connection management
│   ├── competitionState.ts     # Competition state management
│   └── scoring.ts               # Difficulty-based scoring system
└── scripts/generate-seed-sql.mjs # Seed data generator from Nine.dk
```

## ✅ Implemented Features

### 1. **Complete Authentication System**
- **Dual Mode Authentication**: Fake auth (development) + Google OAuth (production)
- **Role-Based Access**: Admin vs regular users with JWT-based permissions
- **Page Protection**: Middleware-based route protection with graceful redirects
- **Session Management**: 30-day JWT tokens with automatic refresh

### 2. **Team Management System**
- **Self-Organizing Teams**: 2-4 members per team with captain designation
- **Dynamic Membership**: Join/leave teams, transfer captaincy
- **Team Invitations**: Invite members by email with validation
- **Single Team Constraint**: Users can only be in one team at a time

### 3. **Challenge System**
- **8 Challenge Categories**: Test, PM, Backend, Frontend, Sales, BA, BUL, Communication
- **16 Creative AI Challenges**: Unique scenarios like "Pet Dating App Testing" and "Hogwarts IT Proposal"
- **Difficulty-Based Scoring**: 1-3 star difficulty rating system
- **Sequential Progression**: Teams complete one challenge before starting next
- **Time Estimation**: Each challenge includes estimated completion time

### 4. **Real-Time AI Collaboration**
- **Streaming AI Chat**: Server-Sent Events for real-time AI responses
- **Multi-Model Support**: OpenAI GPT, Claude, Gemini via LiteLLM proxy
- **Team Collaboration**: All team members see live AI conversations
- **Model Selection**: Choose from available AI models per conversation
- **Chat History**: Persistent conversation storage with metadata

### 5. **Real-Time Features**
- **Live User Tracking**: See active team members in real-time
- **Streaming Responses**: Watch AI generate responses character by character
- **Submission Notifications**: Automatic UI updates when team members submit
- **Activity Indicators**: Typing indicators and connection status
- **Automatic Reconnection**: Robust error handling and reconnection logic

### 6. **Competition Management**
- **Admin Dashboard**: Comprehensive submission management and rating
- **Competition Timer**: Start/pause/stop competition with precise timing
- **Leaderboard**: Real-time rankings with difficulty-weighted scoring
- **Submission Rating**: 1-5 star rating system for manual judging
- **Competition State**: Global pause/resume functionality

### 7. **Database Architecture**
- **Complete Schema**: Users, Teams, Tasks, Submissions, CompetitionSettings
- **Relational Integrity**: Proper foreign keys and constraints
- **JSON Storage**: Chat history and final answers in JSONB format
- **Audit Trails**: Created/updated timestamps on all entities
- **Seed Data System**: Automated import of Nine.dk employee data

### 8. **AI Integration**
- **LiteLLM Proxy**: Unified interface for multiple AI providers
- **Streaming Support**: Real-time token streaming for all models
- **Model Management**: Dynamic model discovery and selection
- **Error Handling**: Graceful fallbacks and error recovery
- **Rate Limiting**: Configurable request limiting and queuing

## Business Logic Implementation

### Team Competition Flow
1. **User Authentication**: Sign in with Google OAuth or fake auth
2. **Team Formation**: Create or join teams (2-4 members)
3. **Challenge Selection**: Browse and start challenges by category
4. **AI Collaboration**: Work with AI in real-time streaming chat
5. **Solution Development**: Use AI to brainstorm creative solutions
6. **Final Submission**: Submit final answer to complete challenge
7. **Manual Judging**: Admin rates submissions post-competition

### Real-Time Collaboration
- **SSE Streaming**: Direct connection for sender, Redis broadcast for team
- **Dual Chat History**: Local chat for sender, real-time for viewers
- **Active User Tracking**: Redis-based presence with cleanup
- **Submission Broadcasting**: Automatic page refresh when teammate submits

### Scoring System
- **Difficulty Weighting**: 1 star = 1x, 2 star = 1.5x, 3 star = 2x multiplier
- **Time Bonuses**: Faster completion receives scoring bonuses
- **Manual Rating**: Admin 1-5 star rating affects final score
- **Team Rankings**: Combined score across all completed challenges

## Environment Configuration

### Development (Docker)
```bash
DATABASE_URL=postgresql://nineuser:ninepass@postgres:5432/kickoff_challenge
REDIS_URL=redis://redis:6379
AUTH_MODE=fake
LITELLM_MASTER_KEY=sk-1234567890abcdef
```

### Production
```bash
AUTH_MODE=google
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
DATABASE_URL=your-production-database-url
REDIS_URL=your-production-redis-url
```

## API Endpoints (All Implemented)

### Authentication
- `GET /api/auth/session` - Current user session
- `POST /api/auth/signin/fake-auth` - Fake authentication (dev only)

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams/create` - Create new team
- `POST /api/teams/join` - Join existing team
- `POST /api/teams/leave` - Leave current team
- `POST /api/teams/{id}/invite-member` - Invite team member
- `POST /api/teams/{id}/remove-member` - Remove team member
- `POST /api/teams/transfer-captain` - Transfer team leadership

### Challenges
- `GET /api/challenges` - List available challenges
- `POST /api/challenges/start` - Start new challenge for team
- `POST /api/challenges/submit` - Submit final answer

### AI Integration
- `GET /api/ai/models` - Available AI models
- `POST /api/ai/chat` - Streaming AI chat with model selection

### Real-Time
- `GET /api/challenge/{id}/stream` - SSE endpoint for real-time features

### Competition
- `GET /api/competition/settings` - Competition state and timing
- `POST /api/competition/start` - Start competition (admin)
- `POST /api/competition/pause` - Pause competition (admin)
- `POST /api/competition/resume` - Resume competition (admin)

### Admin
- `GET /api/admin/submissions` - All submissions for judging
- `POST /api/submissions/{id}/rate` - Rate submission (admin)

## Security Implementation

### Authentication Security
- **JWT Tokens**: Secure session management with 30-day expiration
- **Server-Side Validation**: All API endpoints verify authentication
- **Admin Authorization**: Role-based access with database-driven permissions
- **CSRF Protection**: Built-in NextAuth.js CSRF protection

### API Security
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Secure error messages without information leakage
- **Rate Limiting**: Configurable rate limiting for AI endpoints
- **Session Verification**: Consistent session checking across all endpoints

### Data Security
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Protection**: Vue.js automatic escaping and sanitization
- **Environment Secrets**: Proper secret management in environment variables
- **Database Constraints**: Foreign key constraints and data validation

## Real-Time Architecture

### SSE (Server-Sent Events) Implementation
```typescript
// Streaming endpoint with Redis integration
export default defineEventHandler(async event => {
  // Set SSE headers
  setHeader(event, 'content-type', 'text/event-stream')
  
  // Redis pub/sub for team collaboration
  await redisSubscriber.subscribe(`challenge:${submissionId}:chat`)
  
  // Send real-time events
  sendEvent({ type: 'chat_message', data: message })
})
```

### Redis Integration
- **Pub/Sub Messaging**: Real-time event broadcasting between team members
- **Active User Tracking**: Redis sets for tracking online users
- **Session Management**: Distributed session storage for scaling
- **Event Broadcasting**: Challenge updates, submissions, user activity

### Client-Side Real-Time
```typescript
// Composable for real-time features
export function useRealtimeChallenge(submissionId: string) {
  const eventSource = new EventSource(`/api/challenge/${submissionId}/stream`)
  
  // Handle different event types
  eventSource.onmessage = event => {
    const data = JSON.parse(event.data)
    handleMessage(data) // Process chat, user activity, submissions
  }
}
```

## Mobile-First Design

### Responsive Implementation
- **Tailwind CSS**: Mobile-first responsive design system
- **Touch-Optimized**: Large touch targets and swipe gestures
- **Offline Resilience**: Service worker for offline functionality
- **Performance**: Optimized for mobile networks and devices

### Bus-Friendly Features
- **Real-Time Sync**: Automatic reconnection during connectivity issues
- **Progressive Enhancement**: Core features work without JavaScript
- **Battery Optimization**: Efficient SSE connections and minimal polling
- **Network Resilience**: Graceful degradation on poor connections

## Testing Strategy

### Code Quality
- **TypeScript**: Full type safety throughout application
- **ESLint + Prettier**: Consistent code formatting and style
- **Build Validation**: TypeScript compilation catches errors early

### Manual Testing Capabilities
- **Docker Environment**: Consistent testing environment
- **Fake Authentication**: Easy user switching for testing scenarios
- **Seed Data**: Realistic test data from Nine.dk employees
- **Admin Interface**: Manual testing of all competition features

## Deployment Architecture

### Docker Compose Setup
```yaml
services:
  nuxt-app:     # Main application
  postgres:     # Database
  redis:        # Real-time features
  litellm:      # AI proxy
  adminer:      # Database admin UI
```

### Production Considerations
- **Health Checks**: Comprehensive health monitoring
- **Logging**: Structured logging for debugging
- **Monitoring**: Redis and database monitoring
- **Scaling**: Horizontal scaling with Redis session storage

## Available Tools for Claude Code

When working on this project, Claude Code has access to:

### Browser Testing
- **Playwright MCP** - Full browser automation for testing
  - Test authentication flows (fake and Google OAuth)
  - Verify real-time features and AI chat functionality
  - Test team management and competition flows
  - Screenshot capture for visual verification

### Container Management  
- **Docker MCP** - Complete container lifecycle management
  - Monitor service health and logs
  - Debug database and Redis connectivity
  - Test AI model integration via LiteLLM
  - Troubleshoot real-time streaming issues

These tools enable end-to-end testing of the complete application stack.

## Development Workflow

### Getting Started
1. Clone repository and install dependencies
2. Copy `.env.example` to `.env` and configure
3. Start services: `docker-compose -f docker-compose.dev.yml up -d`
4. Generate seed data: `node scripts/generate-seed-sql.mjs > init-db/seed.sql`
5. Import seed data to database
6. Access application at http://localhost:3000

### Code Quality Checks
```bash
npm run build  # TypeScript validation
npm run lint   # ESLint + Prettier formatting
```

### Database Management
```bash
# Connect to database
docker-compose -f docker-compose.dev.yml exec postgres psql -U nineuser -d kickoff_challenge

# View service logs
docker-compose -f docker-compose.dev.yml logs <service>

# Reset everything
docker-compose -f docker-compose.dev.yml down -v
```

## Future Enhancement Areas

While the application is feature-complete for the competition, potential enhancements include:

1. **Automated Testing Suite** - Unit and integration tests
2. **Performance Monitoring** - APM integration and metrics
3. **Advanced Analytics** - Detailed usage and performance analytics
4. **Mobile App** - Native mobile application
5. **Video Integration** - Screen sharing and video collaboration
6. **AI Model Training** - Custom models trained on Nine's domain

## Summary

This is a **production-ready, fully-featured** AI creativity competition platform with:
- ✅ Complete team management and competition flow
- ✅ Real-time AI collaboration with streaming responses
- ✅ Comprehensive authentication and authorization
- ✅ Admin interface for competition management
- ✅ Mobile-optimized responsive design
- ✅ Docker-based deployment architecture
- ✅ Scalable real-time features with Redis
- ✅ Multi-provider AI integration via LiteLLM

The application successfully enables teams to collaborate with AI to solve creative challenges in a competitive, real-time environment optimized for mobile usage during the Nine bus trip.