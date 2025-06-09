# Nine KickOff Bus Challenge

![Nine KickOff Bus Challenge](screenshot.png)

An AI creativity competition platform where teams compete using AI to solve challenges across different professional domains during the annual Nine bus trip.

## 🚀 Quick Start with Docker

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for generating seed data)
- **Git** for cloning the repository

### 1. Clone and Setup

```bash
git clone <repository-url>
cd NineKickOffBusChallenge

# Install dependencies (needed for seed script)
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` and update the following for Docker:

```bash
# Database Configuration (Docker hostnames)
DATABASE_URL=postgresql://nineuser:ninepass@postgres:5432/kickoff_challenge
REDIS_URL=redis://redis:6379

# Add your AI API keys
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-anthropic-api-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Generate secure secrets (minimum 32 characters)
AUTH_SECRET=your-secure-auth-secret-here
NUXT_SESSION_PASSWORD=your-secure-session-password-here
```

### 3. Generate Seed Data

```bash
# Generate seed SQL from Nine.dk employee data
node scripts/generate-seed-sql.mjs > init-db/seed.sql
```

### 4. Start the Application

```bash
# Start all services (database, Redis, LiteLLM, application)
# PostgreSQL will automatically import seed.sql during initialization
docker-compose -f docker-compose.dev.yml up -d

# Check all services are running
docker-compose -f docker-compose.dev.yml ps
```

### 5. Access the Application

- **Main Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
    - Server: `postgres`
    - Username: `nineuser`
    - Password: `ninepass`
    - Database: `kickoff_challenge`
- **LiteLLM Proxy UI**: http://localhost:4000
    - Username: `admin`
    - Password: `admin123`

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **Backend**: Nitro server with API routes
- **Database**: PostgreSQL with Sequelize ORM
- **Real-time**: Redis + Server-Sent Events (SSE)
- **AI Integration**: LiteLLM proxy for unified AI model access
- **Authentication**: NextAuth.js with Google OAuth + fake auth for development

### Services

| Service  | Port | Description                  |
|----------|------|------------------------------|
| nuxt-app | 3000 | Main Nuxt.js application     |
| postgres | 5432 | PostgreSQL database          |
| redis    | 6379 | Redis for real-time features |
| adminer  | 8080 | Database administration UI   |
| litellm  | 4000 | LiteLLM proxy for AI models  |

## 🎮 How to Use

### Development Mode (Fake Authentication)

1. Visit http://localhost:3000
2. Click "Sign In" → Select any user from dropdown
3. Join or create a team
4. Start challenges and collaborate with AI

### Team-Based Competition

1. **Teams**: 2-4 people per team, self-organizing
2. **Challenges**: 8 categories with different difficulty levels
3. **AI Collaboration**: Real-time streaming AI chat for each challenge
4. **Progression**: Complete one challenge before starting the next
5. **Submission**: Submit final creative solutions for manual judging

### Challenge Categories

- **Test**: Creative test case design
- **Project Management**: Sprint planning and stakeholder management
- **Backend**: API design and architecture
- **Frontend**: UI/UX design and CSS animations
- **Sales**: Value propositions and client pitches
- **Business Analysis**: Process mapping and enterprise architecture
- **BUL/Sales**: Strategic sales approaches
- **Communication**: Branding and marketing campaigns

## 🔧 Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Update .env for local development
DATABASE_URL=postgresql://nineuser:ninepass@localhost:5432/kickoff_challenge
REDIS_URL=redis://localhost:6379

# Start local services
docker-compose up postgres redis adminer litellm -d

# Run development server
npm run dev
```

### Database Management

```bash
# View database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Connect to database directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U nineuser -d kickoff_challenge

# Restart services (keeps database data)
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Reset database (DANGER: loses all data by removing volumes)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Seed Data Management

```bash
# Generate fresh seed data from Nine.dk (before starting containers)
node scripts/generate-seed-sql.mjs > init-db/seed.sql

# If containers are already running, restart to import new seed data
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Or manually import to running database
docker-compose -f docker-compose.dev.yml exec postgres psql -U nineuser -d kickoff_challenge -f /docker-entrypoint-initdb.d/seed.sql

# Backup current database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U nineuser kickoff_challenge > backup.sql
```

### Code Quality

```bash
# Type checking
npm run build

# Linting and formatting
npm run lint

# Run tests
npm test
```

## 🚀 Production Deployment

### Environment Configuration

```bash
# Update .env for production
NODE_ENV=production
AUTH_MODE=google
DATABASE_URL=your-production-database-url
REDIS_URL=your-production-redis-url

# Generate secure secrets
AUTH_SECRET=$(openssl rand -base64 32)
NUXT_SESSION_PASSWORD=$(openssl rand -base64 32)

# Configure Google OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
```

### Docker Production Build

```bash
# Build production image
docker-compose -f docker-compose.yml build

# Start production services
docker-compose -f docker-compose.yml up -d
```

## 📚 API Documentation

### Authentication

- **Fake Auth** (Development): Select any user from dropdown
- **Google OAuth** (Production): Only @nine.dk email addresses allowed

### Key Endpoints

- `GET /api/health` - Health check
- `GET /api/challenges` - List available challenges
- `POST /api/challenges/start` - Start a new challenge
- `POST /api/challenges/submit` - Submit final answer
- `POST /api/ai/chat` - AI chat with streaming
- `GET /api/leaderboard` - Competition leaderboard

### Real-time Features

- **SSE Streaming**: `/api/challenge/{id}/stream`
- **AI Chat Streaming**: Real-time AI responses
- **Team Collaboration**: Live user activity tracking
- **Submission Notifications**: Automatic UI updates

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**

```bash
# Check if postgres is running
docker-compose -f docker-compose.dev.yml ps postgres

# View postgres logs
docker-compose -f docker-compose.dev.yml logs postgres
```

**Redis Connection Failed**

```bash
# Check redis status
docker-compose -f docker-compose.dev.yml ps redis

# Test redis connection
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
```

**LiteLLM Not Working**

```bash
# Check LiteLLM logs
docker-compose -f docker-compose.dev.yml logs litellm

# Verify AI API keys in .env file
```

**Seed Data Issues**

```bash
# Re-generate seed data
node scripts/generate-seed-sql.mjs > init-db/seed.sql

# Re-import seed data
docker-compose -f docker-compose.dev.yml exec postgres psql -U nineuser -d kickoff_challenge -f /docker-entrypoint-initdb.d/seed.sql
```

### Reset Everything

```bash
# Stop all services and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Generate fresh seed data and start services
node scripts/generate-seed-sql.mjs > init-db/seed.sql
docker-compose -f docker-compose.dev.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for the Nine KickOff Bus Challenge 2025
