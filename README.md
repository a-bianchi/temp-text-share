# 🚀 Text Share App - Docker Edition

A complete application for temporarily sharing text with Go backend, HTML/CSS/JS frontend, and Redis database, all containerized with Docker.

## 🏗️ Architecture

- **Frontend**: Static web application served by Nginx
- **Backend**: REST API in Go with Gin framework
- **Database**: Redis for temporary storage
- **Containers**: Docker with docker-compose for orchestration

## 📋 Prerequisites

- Docker Desktop installed and running
- docker-compose available
- curl (for health checks)

## 🚀 Quick Start

### Option 1: Complete Startup (Recommended)
```bash
# From the project root directory
chmod +x start-app.sh
./start-app.sh
```

### Option 2: Manual Startup
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps
```

### Option 3: Development Mode
```bash
chmod +x dev-start.sh
./dev-start.sh
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8010
- **Redis**: localhost:6379

## 📁 Project Structure

```
temp-text-share/
├── frontend/                 # Static frontend
│   ├── Dockerfile           # Frontend image
│   ├── nginx.conf           # Nginx configuration
│   ├── build-frontend.sh    # Build script
│   └── .dockerignore        # Files to ignore in Docker
├── backend/                  # Go API
│   ├── Dockerfile           # Backend image
│   ├── main.go              # Main code
│   ├── auto-restart.sh      # Automatic monitoring
│   └── restart-server.sh    # Manual restart
├── docker-compose.yml       # Service orchestration
├── start-app.sh             # Complete startup script
├── dev-start.sh             # Development script
└── README.md                # This file
```

## 🔧 Useful Commands

### Service Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service_name]

# Check status
docker-compose ps
```

### Development
```bash
# Rebuild and restart
docker-compose up --build -d

# Backend only
docker-compose up -d redis api

# Frontend only
docker-compose up -d frontend

# Redis only
docker-compose up -d redis
```

### Monitoring
```bash
# Automatic backend monitoring
cd backend && ./auto-restart.sh

# Frontend build
cd frontend && ./build-frontend.sh
```

## 🚨 Auto-Recovery Features

### Backend
- **Panic recovery**: Captures and handles critical errors
- **Automatic restart**: Restarts on fatal errors
- **Retry limit**: Maximum 5 attempts before failing
- **Health checks**: Automatic status verification

### Frontend
- **Health endpoint**: `/health` for monitoring
- **Gzip compression**: Performance optimization
- **Cache headers**: Better user experience
- **Security headers**: Basic protection

## 🔍 Troubleshooting

### Common Issues

1. **Ports in use**
   ```bash
   # Check ports in use
   lsof -i :3000
   lsof -i :8009
   lsof -i :6379
   ```

2. **Services not starting**
   ```bash
   # View error logs
   docker-compose logs [service_name]
   
   # Complete rebuild
   docker-compose down
   docker-compose up --build -d
   ```

3. **Frontend not connecting to backend**
   - Verify both services are running
   - Check frontend logs for CORS errors
   - Confirm backend URL is correct

### Health Checks
```bash
# Backend
curl http://localhost:8009/ping

# Frontend
curl http://localhost:3000/health

# Redis
docker-compose exec redis redis-cli ping
```

## 🛠️ Development

### Modifying Backend
1. Edit files in `backend/`
2. Dockerfile rebuilds automatically
3. Use `docker-compose restart api` to apply changes

### Modifying Frontend
1. Edit files in `frontend/`
2. Use `docker-compose restart frontend` to apply changes
3. For nginx.conf changes, complete rebuild needed

### Environment Variables
```bash
# Backend
REDIS_HOST=redis
REDIS_PORT=6379
API_PORT=8009
API_ENV=production

# Frontend
NGINX_HOST=localhost
NGINX_PORT=80
```

## 📊 Monitoring and Logs

### Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Health Metrics
- **Backend**: `/ping` and `/admin/test`
- **Frontend**: `/health`
- **Redis**: Internal `ping` command

## 🚀 Production Deployment

### Considerations
1. Change exposed ports as needed
2. Configure appropriate environment variables
3. Implement SSL/TLS for HTTPS
4. Configure Redis backup
5. External service monitoring

### Production Commands
```bash
# Production mode
export API_ENV=production
docker-compose -f docker-compose.yml up -d

# With environment file
docker-compose --env-file .env.prod up -d
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 🆘 Support

If you encounter problems:
1. Check logs: `docker-compose logs`
2. Verify status: `docker-compose ps`
3. Consult this README
4. Open an issue in the repository

---

**Enjoy sharing text temporarily and securely! 🎉**
