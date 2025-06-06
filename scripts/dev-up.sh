#!/bin/bash

# Nine KickOff Bus Challenge - Development Setup Script

echo "🚀 Starting Nine KickOff Bus Challenge Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys before continuing!"
    echo "   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY"
    read -p "Press enter when you've updated the .env file..."
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.dev.yml ps

# Seed database
echo "🌱 Seeding database with initial data..."
sleep 5
curl -X POST http://localhost:3000/api/seed || echo "Database seeding will happen on first API call"

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Frontend:     http://localhost:3000"
echo "🗄️  Database UI:  http://localhost:8080"
echo "📊 Adminer:      user: nineuser, password: ninepass, database: kickoff_challenge"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "🛑 To stop:      docker-compose -f docker-compose.dev.yml down"
echo ""
echo "Happy coding! 🎉"