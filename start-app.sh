#!/bin/bash

# Start script for Text Share App (Backend + Frontend + Redis)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  🚀 Text Share App Starter${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Configuration
COMPOSE_FILE="docker-compose.yml"
BACKEND_URL="http://192.168.88.252:8010"
FRONTEND_URL="http://192.168.88.252:3001"
REDIS_PORT="6379"

print_header

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "❌ docker-compose is not installed or not in PATH"
    exit 1
fi
print_success "✅ docker-compose is available"

# Check if we're in the right directory
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "❌ docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi
print_success "✅ docker-compose.yml found"

# Check if backend and frontend directories exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "❌ Backend or frontend directory not found. Please ensure you're in the project root."
    exit 1
fi
print_success "✅ Project structure verified"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans
print_success "✅ Existing containers stopped"

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

if [ $? -eq 0 ]; then
    print_success "✅ Services started successfully!"
else
    print_error "❌ Failed to start services"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service status
print_status "Checking service status..."
docker-compose ps

# Health checks
print_status "Performing health checks..."

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    print_success "✅ Redis is healthy"
else
    print_warning "⚠️  Redis health check failed"
fi

# Check Backend API
if curl -s -f "${BACKEND_URL}/ping" > /dev/null; then
    print_success "✅ Backend API is healthy"
else
    print_warning "⚠️  Backend API health check failed"
fi

# Check Frontend
if curl -s -f "${FRONTEND_URL}/health" > /dev/null; then
    print_success "✅ Frontend is healthy"
else
    print_warning "⚠️  Frontend health check failed"
fi

# Show final status
echo ""
print_success "🎉 Text Share App is running!"
echo ""
echo "📋 Service URLs:"
echo "  - Frontend: ${FRONTEND_URL}"
echo "  - Backend API: ${BACKEND_URL}"
echo "  - Redis: localhost:${REDIS_PORT}"
echo ""
echo "📋 Quick commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - View specific service logs: docker-compose logs -f [service_name]"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Rebuild and restart: docker-compose up --build -d"
echo ""
echo "🔍 Monitoring:"
echo "  - Backend auto-restart: cd backend && ./auto-restart.sh"
echo "  - Frontend build: cd frontend && ./build-frontend.sh"
echo ""
echo "🌐 Open your browser and go to: ${FRONTEND_URL}"
