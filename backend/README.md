# Temporary Text Share API

A simple Go API for temporarily storing and retrieving text using Redis.

## Features

- **POST** `/text` - Save text and get a unique ID
- **GET** `/text/{id}` - Get text by ID
- **GET** `/ping` - Check API status
- Text validation (1-10,000 characters)
- Configurable TTL (1 min, 15 min, 1 hour, 24 hours)
- CORS enabled for frontend development

## Requirements

- Go 1.21 or higher
- Redis (you can use Docker)

## Installation

### Option 1: Local Development

1. **Clone the repository:**
```bash
git clone <your-repository>
cd temp-text-share
```

2. **Install dependencies:**
```bash
go mod tidy
```

3. **Start Redis:**
```bash
# With Docker (recommended)
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

4. **Run the API:**
```bash
go run main.go
```

### Option 2: With Docker Compose (Recommended)

1. **Clone the repository:**
```bash
git clone <your-repository>
cd temp-text-share
```

2. **Run with Docker Compose:**
```bash
# Quick start
docker-compose up -d

# Or use the restart script (recommended for development)
./restart-server.sh
```

This will start both Redis and the API automatically.

The API will be available at `http://localhost:8080`

## Usage

### Save text
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello world!",
    "ttl": 60
  }'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello world!",
  "ttl": 60
}
```

**Available TTL values:**
- `1` - 1 minute
- `15` - 15 minutes  
- `60` - 1 hour
- `1440` - 24 hours

For detailed TTL documentation, see [ttl-constants.md](ttl-constants.md).

### Get text
```bash
curl http://localhost:8080/text/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello world!",
  "ttl": 0
}
```

### Check status
```bash
curl http://localhost:8080/ping
```

## Configuration

### Environment Variables

Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

**Available variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | `` | Redis password (if needed) |
| `API_PORT` | `8080` | API server port |
| `API_ENV` | `production` | Environment mode (`development`/`production`) |

### Redis Configuration

You can modify the Redis configuration in `main.go`:

```go
redisClient = redis.NewClient(&redis.Options{
    Addr:     redisAddr,        // From REDIS_HOST:REDIS_PORT
    Password: redisPassword,    // From REDIS_PASSWORD
    DB:       0,                // Database
})
```

## Project Structure

```
.
├── main.go                  # Main API file
├── go.mod                   # Go dependencies
├── go.sum                   # Dependency checksums
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Service orchestration
├── test-api.sh              # Test script
├── restart-server.sh        # Full server restart script
├── dev-restart.sh           # Quick development restart
├── load-env.sh              # Load environment variables
├── validation-examples.md   # Validation examples
├── ttl-constants.md         # TTL constants documentation
├── env.example              # Environment variables example
├── .gitignore               # Git ignored files
└── README.md                # This file
```

## Testing

You can test the API using the included script:

```bash
# Make sure you have jq installed to format JSON
# macOS: brew install jq
# Ubuntu: sudo apt-get install jq

./test-api.sh
```

For detailed validation examples, see [validation-examples.md](validation-examples.md).

## Development Scripts

### Quick Restart (Development)
```bash
./dev-restart.sh
```
Quick restart for development with basic rebuild.

### Full Restart (Production)
```bash
./restart-server.sh
```
Complete restart with cache cleanup and full rebuild.

### Load Environment Variables
```bash
./load-env.sh
```
Run the API locally with environment variables from `.env` file.

Or manually with curl:

```bash
# Check status
curl http://localhost:8080/ping

# Save text
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!", "ttl": 60}'

# Get text (replace ID_WITH_REAL_ID)
curl http://localhost:8080/text/ID_WITH_REAL_ID
```

## Next Steps

- [x] Environment variables configuration
- [ ] Add authentication
- [ ] Add structured logging
- [ ] Implement rate limiting
- [ ] Add unit tests
- [ ] Configure CI/CD
- [ ] Add Swagger documentation
- [ ] Implement metrics and monitoring 