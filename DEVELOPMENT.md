# Development Setup Guide

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed and running
- Git
- Text editor (VS Code recommended)

### 1. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your API keys:

**Required for Google Authentication:**
- `GOOGLE_CLIENT_ID` - Get from [Google Cloud Console](https://console.developers.google.com/)
- `GOOGLE_CLIENT_SECRET` - Get from Google Cloud Console

**Required for AI Features:**
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `CLAUDE_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)

### 2. Start Development Environment

Use the provided script for easy setup:

```bash
./scripts/dev-up.sh
```

Or manually with Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Database Admin**: http://localhost:8080
  - Server: `postgres`
  - Username: `nineuser`
  - Password: `ninepass`
  - Database: `kickoff_challenge`

### 4. Seed Initial Data

```bash
npm run db:seed
```

## 🛠️ Development Commands

```bash
# Start development environment
npm run dev:setup
./scripts/dev-up.sh

# Stop development environment  
npm run dev:teardown
./scripts/dev-down.sh

# View application logs
npm run docker:logs
docker-compose -f docker-compose.dev.yml logs -f app-dev

# Reset everything (including database)
npm run docker:reset

# Seed database with sample data
npm run db:seed
```

## 🔥 Hot Reload Features

The development setup includes:

- **Code Hot Reload**: Changes to `.vue`, `.ts`, and `.js` files automatically reload
- **Database Persistence**: Data persists between container restarts
- **Live Debugging**: Access to Vue DevTools and Nuxt DevTools
- **Fast Refresh**: Vite-powered fast refresh for instant updates

## 📁 Project Structure

```
/
├── 📂 components/          # Vue components
├── 📂 layouts/            # Nuxt layouts
├── 📂 pages/              # File-based routing
├── 📂 server/             # Server-side code
│   ├── 📂 api/           # API routes
│   ├── 📂 models/        # Database models
│   └── 📂 utils/         # Server utilities
├── 📂 stores/             # Pinia stores
├── 📂 scripts/            # Development scripts
├── 🐳 docker-compose.dev.yml  # Development Docker setup
├── 🔧 .env               # Environment variables
└── 📋 nuxt.config.ts     # Nuxt configuration
```

## 🗄️ Database Management

### Access Database
```bash
# Via Adminer (Web UI)
open http://localhost:8080

# Via Command Line
docker-compose -f docker-compose.dev.yml exec postgres psql -U nineuser -d kickoff_challenge
```

### Database Operations
```bash
# View database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U nineuser kickoff_challenge > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U nineuser -d kickoff_challenge < backup.sql
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

### Database Connection Issues
```bash
# Check if PostgreSQL container is running
docker-compose -f docker-compose.dev.yml ps postgres

# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres
```

### Clear Everything and Start Fresh
```bash
# Stop all containers and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove all images (optional)
docker system prune -a

# Start fresh
./scripts/dev-up.sh
```

## 🔑 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes | `123456-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Yes | `GOCSPX-abcdef123456` |
| `OPENAI_API_KEY` | OpenAI API Key | Yes | `sk-abcdef123456...` |
| `CLAUDE_API_KEY` | Anthropic API Key | Yes | `sk-ant-abcdef123456...` |
| `AUTH_SECRET` | JWT Secret | Auto | Auto-generated for dev |
| `DATABASE_URL` | PostgreSQL URL | Auto | Auto-configured |

## 🐳 Docker Services

| Service | Purpose | Port | Health Check |
|---------|---------|------|--------------|
| `app-dev` | Nuxt 3 Application | 3000 | http://localhost:3000/api/health |
| `postgres` | PostgreSQL Database | 5432 | `pg_isready` |
| `redis` | Redis Cache/Sessions | 6379 | `redis-cli ping` |
| `adminer` | Database Admin UI | 8080 | HTTP Response |

## 📝 Development Tips

1. **Use Vue DevTools**: Install browser extension for debugging
2. **Nuxt DevTools**: Press `Shift + Alt + D` in browser
3. **Database Browser**: Use Adminer at localhost:8080
4. **API Testing**: Use `/api/health` endpoint to test API
5. **Hot Reload**: Save any file to trigger automatic reload
6. **Logs**: Always check `docker-compose logs` for errors

## 🔑 Google OAuth Setup Instructions

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Click "New Project" or select existing project
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" for testing
   - Fill in Application name: "Nine KickOff Bus Challenge"
   - Add your email as developer contact
   - Save and continue through all steps

### 3. Configure OAuth Client
1. Application type: "Web application"
2. Name: "Nine KickOff Bus Challenge - Dev"
3. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://127.0.0.1:3000/api/auth/callback/google`

### 4. Copy Credentials to .env
1. Copy the Client ID and Client Secret
2. Add to your `.env` file:
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
```

### 5. Test OAuth Integration
1. Restart your development server:
   ```bash
   docker-compose -f docker-compose.dev.yml restart app-dev
   ```
2. Go to http://localhost:3000
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth flow

### 6. OAuth Consent Screen Setup (Production)
For production deployment, you'll need to:
1. Verify your domain
2. Add privacy policy and terms of service URLs
3. Submit for verification if using sensitive scopes
4. Update redirect URIs to production URLs

## 🎯 Next Steps

1. ✅ Set up Google OAuth credentials (see instructions above)
2. Add AI API keys for challenge features
3. Start developing team management features
4. Implement challenge workspace interface

Happy coding! 🚀