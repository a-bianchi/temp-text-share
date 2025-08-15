#!/bin/bash

# Build script for Frontend Docker image

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

# Configuration
IMAGE_NAME="temp-text-share-frontend"
IMAGE_TAG="latest"
DOCKERFILE="Dockerfile"

print_status "🚀 Building Frontend Docker Image"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    print_error "Dockerfile not found in current directory"
    exit 1
fi

# Build the image
print_status "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

if [ $? -eq 0 ]; then
    print_success "✅ Frontend image built successfully!"
    
    # Show image info
    print_status "Image details:"
    docker images "${IMAGE_NAME}:${IMAGE_TAG}"
    
    echo ""
    print_success "🎉 Frontend is ready to run!"
    echo ""
    echo "📋 Quick commands:"
    echo "  - Run standalone: docker run -p 3000:80 ${IMAGE_NAME}:${IMAGE_TAG}"
    echo "  - Run with docker-compose: cd .. && docker-compose up frontend"
    echo "  - View logs: docker logs <container_id>"
    echo "  - Stop container: docker stop <container_id>"
    echo ""
    echo "🌐 Frontend will be available at: http://localhost:3000"
    
else
    print_error "❌ Failed to build frontend image"
    exit 1
fi
