#!/bin/bash

echo "🔄 Restarting Text Share API Server"
echo "=================================="

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

# Step 1: Stop all containers
print_status "Stopping all containers..."
docker-compose down
if [ $? -eq 0 ]; then
    print_success "Containers stopped successfully"
else
    print_error "Failed to stop containers"
    exit 1
fi

# Step 2: Remove old images to force rebuild
print_status "Removing old images..."
docker-compose down --rmi all
if [ $? -eq 0 ]; then
    print_success "Old images removed"
else
    print_warning "Some images could not be removed (this is normal if they don't exist)"
fi

# Step 3: Clean up any dangling images
print_status "Cleaning up dangling images..."
docker image prune -f
print_success "Cleanup completed"

# Step 4: Rebuild without cache
print_status "Rebuilding images without cache..."
docker-compose build --no-cache
if [ $? -eq 0 ]; then
    print_success "Images rebuilt successfully"
else
    print_error "Failed to rebuild images"
    exit 1
fi

# Step 5: Start services
print_status "Starting services..."
docker-compose up -d
if [ $? -eq 0 ]; then
    print_success "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Step 6: Wait a moment for services to be ready
print_status "Waiting for services to be ready..."
sleep 3

# Step 7: Check service status
print_status "Checking service status..."
docker-compose ps

# Step 8: Show logs
print_status "Recent logs from API service:"
docker-compose logs --tail=10 api

# Step 9: Show configuration
print_status "Current configuration:"
echo "  - API Port: $(docker-compose exec -T api sh -c 'echo $API_PORT' 2>/dev/null || echo '8009')"
echo "  - API Environment: $(docker-compose exec -T api sh -c 'echo $API_ENV' 2>/dev/null || echo 'production')"
echo "  - Redis Host: $(docker-compose exec -T api sh -c 'echo $REDIS_HOST' 2>/dev/null || echo 'redis')"
echo "  - Redis Port: $(docker-compose exec -T api sh -c 'echo $REDIS_PORT' 2>/dev/null || echo '6379')"

echo ""
print_success "🎉 Server restarted successfully!"
echo ""
echo "📋 Quick commands:"
echo "  - View logs: docker-compose logs -f api"
echo "  - Stop server: docker-compose down"
echo "  - Test API: curl http://localhost:8009/ping"
echo "  - Run tests: ./test-api.sh"
echo ""
echo "🌐 API is available at: http://localhost:8009" 