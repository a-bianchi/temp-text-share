#!/bin/bash

# Development startup script for Text Share App

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
    echo -e "${BLUE}  🔧 Development Mode Starter${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Configuration
COMPOSE_FILE="docker-compose.yml"

print_header

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "❌ docker-compose is not installed or not in PATH"
    exit 1
fi

# Show menu
echo "Select which services to start:"
echo ""
echo "1) 🚀 Full Stack (Redis + Backend + Frontend)"
echo "2) 🔌 Backend Only (Redis + Backend)"
echo "3) 🎨 Frontend Only (Frontend)"
echo "4) 🗄️  Redis Only"
echo "5) 🛑 Stop All Services"
echo "6) 📊 Show Service Status"
echo "7) 📝 View Logs"
echo "8) 🔄 Restart Services"
echo "9) 🚪 Exit"
echo ""

read -p "Enter your choice (1-9): " choice

case $choice in
    1)
        print_status "Starting Full Stack..."
        docker-compose up --build -d
        print_success "✅ Full stack started!"
        echo "🌐 Frontend: http://192.168.88.252:3001"
        echo "🔌 Backend: http://192.168.88.252:8010"
        echo "🗄️  Redis: localhost:6379"
        ;;
    2)
        print_status "Starting Backend (Redis + API)..."
        docker-compose up --build -d redis api
        print_success "✅ Backend started!"
        echo "🔌 Backend: http://192.168.88.252:8010"
        echo "🗄️  Redis: localhost:6379"
        ;;
    3)
        print_status "Starting Frontend..."
        docker-compose up --build -d frontend
        print_success "✅ Frontend started!"
        echo "🌐 Frontend: http://192.168.88.252:3001"
        print_warning "⚠️  Note: Backend API is required for full functionality"
        ;;
    4)
        print_status "Starting Redis only..."
        docker-compose up --build -d redis
        print_success "✅ Redis started!"
        echo "🗄️  Redis: localhost:6379"
        ;;
    5)
        print_status "Stopping all services..."
        docker-compose down
        print_success "✅ All services stopped!"
        ;;
    6)
        print_status "Service Status:"
        docker-compose ps
        ;;
    7)
        print_status "Select service to view logs:"
        echo "1) All services"
        echo "2) Frontend"
        echo "3) Backend"
        echo "4) Redis"
        read -p "Enter choice (1-4): " log_choice
        
        case $log_choice in
            1) docker-compose logs -f ;;
            2) docker-compose logs -f frontend ;;
            3) docker-compose logs -f api ;;
            4) docker-compose logs -f redis ;;
            *) print_error "Invalid choice" ;;
        esac
        ;;
    8)
        print_status "Restarting services..."
        docker-compose restart
        print_success "✅ Services restarted!"
        ;;
    9)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_status "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f [service_name]"
echo "  - Stop services: docker-compose down"
echo "  - Rebuild: docker-compose up --build -d"
echo "  - Health check: docker-compose ps"
echo ""
