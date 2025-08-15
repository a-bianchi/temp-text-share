#!/bin/bash

echo "🚀 Quick Development Restart"
echo "============================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Stopping containers..."
docker-compose down

echo -e "${BLUE}[INFO]${NC} Rebuilding and starting..."
docker-compose up --build -d

echo -e "${BLUE}[INFO]${NC} Waiting for services..."
sleep 2

echo -e "${BLUE}[INFO]${NC} Service status:"
docker-compose ps

echo ""
echo -e "${GREEN}[SUCCESS]${NC} Server restarted!"
echo "🌐 API: http://localhost:8009"
echo "📊 Status: docker-compose ps"
echo "📝 Logs: docker-compose logs -f api" 