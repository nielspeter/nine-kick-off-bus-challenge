# Railway Deployment Guide

This guide explains how to deploy the Nine KickOff Bus Challenge application on Railway using their managed services.

## Architecture Overview

The application will be deployed as multiple Railway services:
- **Main App**: Nuxt 3 application
- **PostgreSQL**: Railway's managed PostgreSQL
- **Redis**: Railway's managed Redis
- **LiteLLM**: Custom service for AI proxy

## Prerequisites

1. Railway account with a project created
2. GitHub repository connected to Railway
3. Required API keys (OpenAI, Claude, Google OAuth, etc.)

## Step-by-Step Deployment

### 1. Deploy PostgreSQL

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL instance
4. Note the `DATABASE_URL` from the Variables tab

### 2. Deploy Redis

1. Click "New Service" again
2. Select "Database" → "Redis"
3. Railway will provision a Redis instance
4. Note the `REDIS_URL` from the Variables tab

### 3. Deploy LiteLLM Service

1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. In Settings:
   - Set "Root Directory" to `/`
   - Set "Dockerfile Path" to `Dockerfile.litellm`
4. Add these environment variables:
   ```
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-claude-key
   GOOGLE_API_KEY=your-google-key
   LITELLM_MASTER_KEY=your-generated-master-key
   LITELLM_SALT_KEY=your-generated-salt-key
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   STORE_MODEL_IN_DB=True
   UI_USERNAME=admin
   UI_PASSWORD=your-secure-password
   ```
5. Deploy the service

### 4. Deploy Main Application

1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Railway will detect the `railway.json` configuration
4. Add these environment variables:
   ```
   # Database & Redis (Reference from other services)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   
   # LiteLLM Service URL
   LITELLM_BASE_URL=${{LiteLLM.RAILWAY_PRIVATE_DOMAIN}}
   LITELLM_MASTER_KEY=your-litellm-master-key
   
   # Authentication
   AUTH_MODE=google
   AUTH_SECRET=your-generated-auth-secret
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   ```
5. Deploy the service

### 5. Database Initialization

After PostgreSQL is running, you need to initialize the database:

1. Connect to PostgreSQL using Railway's database tools or CLI
2. Run the initialization scripts from `init-db/` directory:
   - `000-init.sql` - Creates the database and schema
   - `001-seed.sql` - Seeds initial data

You can use Railway's "Connect" feature to run these SQL scripts.

### 6. Configure Custom Domain (Optional)

1. Go to your main app service settings
2. Under "Networking", add your custom domain
3. Update DNS records as instructed by Railway
4. Update Google OAuth redirect URLs to include your domain

## Environment Variables Reference

### Main Application
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `LITELLM_BASE_URL` - Internal URL to LiteLLM service
- `LITELLM_MASTER_KEY` - Master key for LiteLLM API
- `AUTH_MODE` - Set to "google" for production
- `AUTH_SECRET` - Random secret for session encryption
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### LiteLLM Service
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Claude API key
- `GOOGLE_API_KEY` - Google AI API key
- `LITELLM_MASTER_KEY` - Same as main app
- `LITELLM_SALT_KEY` - Salt for key generation
- `DATABASE_URL` - PostgreSQL for storing model configs
- `UI_USERNAME` - LiteLLM admin username
- `UI_PASSWORD` - LiteLLM admin password

## Post-Deployment Steps

1. **Verify Health Endpoints**:
   - Main app: `https://your-app.railway.app/api/health`
   - LiteLLM: `https://your-litellm-service.railway.app/health`

2. **Configure Google OAuth**:
   - Add `https://your-app.railway.app/api/auth/callback/google` to authorized redirect URIs
   - Update `AUTH_URL` if using custom domain

3. **Test Core Features**:
   - Authentication flow
   - Team creation
   - AI chat functionality
   - Real-time features

4. **Monitor Logs**:
   - Check Railway logs for any startup issues
   - Monitor database connections
   - Verify Redis pub/sub is working

## Scaling Considerations

- **Horizontal Scaling**: Increase replicas in Railway settings
- **Database**: Upgrade PostgreSQL plan for more connections
- **Redis**: Upgrade for more memory if needed
- **Performance**: Enable Railway's edge network for better latency

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly referenced
- Check PostgreSQL logs in Railway
- Ensure database initialization scripts ran successfully

### Redis Connection Issues
- Verify `REDIS_URL` includes password if set
- Check Redis memory usage in Railway dashboard

### Authentication Issues
- Verify Google OAuth credentials
- Check `AUTH_URL` matches your deployment URL
- Ensure `AUTH_SECRET` is set and consistent

### AI Chat Not Working
- Verify LiteLLM service is running
- Check API keys are correctly set
- Verify `LITELLM_BASE_URL` uses internal Railway domain

## Cost Optimization

- Use Railway's usage-based pricing
- Set resource limits in deployment settings
- Monitor usage in Railway dashboard
- Consider caching strategies to reduce API calls