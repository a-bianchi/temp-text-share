#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "Environment variables loaded successfully!"
else
    echo "No .env file found. Using default values."
fi

# Run the API
echo "Starting API with configuration:"
echo "  - API_PORT: ${API_PORT:-8080}"
echo "  - API_ENV: ${API_ENV:-production}"
echo "  - REDIS_HOST: ${REDIS_HOST:-localhost}"
echo "  - REDIS_PORT: ${REDIS_PORT:-6379}"
echo ""

go run main.go 