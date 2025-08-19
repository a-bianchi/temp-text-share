#!/bin/bash

# Auto-restart script for Text Share API
# This script monitors the API and automatically restarts it on errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://192.168.88.252:8010"
HEALTH_ENDPOINT="/ping"
ADMIN_ENDPOINT="/admin/test"
CHECK_INTERVAL=30  # seconds
MAX_FAILURES=3
FAILURE_COUNT=0
RESTART_DELAY=10   # seconds

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

# Function to check API health
check_api_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}${HEALTH_ENDPOINT}" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        return 0  # Success
    else
        return 1  # Failure
    fi
}

# Function to check admin endpoint
check_admin_endpoint() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}${ADMIN_ENDPOINT}" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        return 0  # Success
    else
        return 1  # Failure
    fi
}

# Function to restart the API
restart_api() {
    print_warning "Restarting API due to repeated failures..."
    
    # Stop containers
    docker-compose down
    
    # Wait a moment
    sleep 2
    
    # Start containers
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 5
    
    # Reset failure count
    FAILURE_COUNT=0
    
    print_success "API restarted successfully"
}

# Function to show API status
show_api_status() {
    print_status "API Status Check:"
    echo "  - Health endpoint: ${API_URL}${HEALTH_ENDPOINT}"
    echo "  - Admin endpoint: ${API_URL}${ADMIN_ENDPOINT}"
    echo "  - Check interval: ${CHECK_INTERVAL} seconds"
    echo "  - Max failures before restart: ${MAX_FAILURES}"
    echo "  - Current failure count: ${FAILURE_COUNT}"
    echo ""
}

# Main monitoring loop
main() {
    print_success "🚀 Starting API Auto-Restart Monitor"
    print_status "Monitoring API at: ${API_URL}"
    print_status "Press Ctrl+C to stop monitoring"
    echo ""
    
    show_api_status
    
    while true; do
        # Check API health
        if check_api_health; then
            if [ $FAILURE_COUNT -gt 0 ]; then
                print_success "API recovered! Health check passed"
                FAILURE_COUNT=0
            fi
        else
            FAILURE_COUNT=$((FAILURE_COUNT + 1))
            print_warning "API health check failed (${FAILURE_COUNT}/${MAX_FAILURES})"
            
            # Check admin endpoint as secondary verification
            if check_admin_endpoint; then
                print_status "Admin endpoint working, API might be partially functional"
            else
                print_error "Both health and admin endpoints failed"
            fi
            
            # Restart if max failures reached
            if [ $FAILURE_COUNT -ge $MAX_FAILURES ]; then
                restart_api
            fi
        fi
        
        # Wait before next check
        sleep $CHECK_INTERVAL
    done
}

# Trap Ctrl+C for graceful shutdown
trap 'echo ""; print_status "Stopping monitor..."; exit 0' INT

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the backend directory"
    exit 1
fi

# Start monitoring
main
