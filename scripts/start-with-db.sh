#!/bin/bash

# Start Nine KickOff Bus Challenge with database
echo "🚀 Starting Nine KickOff Bus Challenge..."

# Start PostgreSQL database
echo "🗄️ Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Start the development server (database will auto-initialize)
echo "🌐 Starting development server..."
npm run dev