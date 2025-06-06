#!/bin/bash

# Nine KickOff Bus Challenge - Development Teardown Script

echo "🛑 Stopping Nine KickOff Bus Challenge Development Environment..."

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

echo "✅ Development environment stopped!"
echo ""
echo "💡 To completely reset (remove volumes):"
echo "   docker-compose -f docker-compose.dev.yml down -v"
echo ""
echo "🚀 To start again:"
echo "   ./scripts/dev-up.sh"