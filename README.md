# 🚀 Text Share App - Docker Edition

Una aplicación completa para compartir texto temporalmente con backend en Go, frontend en HTML/CSS/JS, y base de datos Redis, todo containerizado con Docker.

## 🏗️ Arquitectura

- **Frontend**: Aplicación web estática servida por Nginx
- **Backend**: API REST en Go con Gin framework
- **Base de Datos**: Redis para almacenamiento temporal
- **Containers**: Docker con docker-compose para orquestación

## 📋 Prerrequisitos

- Docker Desktop instalado y ejecutándose
- docker-compose disponible
- curl (para health checks)

## 🚀 Inicio Rápido

### Opción 1: Inicio Completo (Recomendado)
```bash
# Desde el directorio raíz del proyecto
chmod +x start-app.sh
./start-app.sh
```

### Opción 2: Inicio Manual
```bash
# Construir y levantar todos los servicios
docker-compose up --build -d

# Verificar el estado
docker-compose ps
```

### Opción 3: Modo Desarrollo
```bash
chmod +x dev-start.sh
./dev-start.sh
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8009
- **Redis**: localhost:6379

## 📁 Estructura del Proyecto

```
temp-text-share/
├── frontend/                 # Frontend estático
│   ├── Dockerfile           # Imagen del frontend
│   ├── nginx.conf           # Configuración de Nginx
│   ├── build-frontend.sh    # Script de build
│   └── .dockerignore        # Archivos a ignorar en Docker
├── backend/                  # API en Go
│   ├── Dockerfile           # Imagen del backend
│   ├── main.go              # Código principal
│   ├── auto-restart.sh      # Monitoreo automático
│   └── restart-server.sh    # Reinicio manual
├── docker-compose.yml       # Orquestación de servicios
├── start-app.sh             # Script de inicio completo
├── dev-start.sh             # Script de desarrollo
└── README.md                # Este archivo
```

## 🔧 Comandos Útiles

### Gestión de Servicios
```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver logs
docker-compose logs -f [service_name]

# Ver estado
docker-compose ps
```

### Desarrollo
```bash
# Rebuild y restart
docker-compose up --build -d

# Solo backend
docker-compose up -d redis api

# Solo frontend
docker-compose up -d frontend

# Solo Redis
docker-compose up -d redis
```

### Monitoreo
```bash
# Monitoreo automático del backend
cd backend && ./auto-restart.sh

# Build del frontend
cd frontend && ./build-frontend.sh
```

## 🚨 Características de Auto-Recovery

### Backend
- **Recuperación de pánico**: Captura y maneja errores críticos
- **Reinicio automático**: Se reinicia ante errores fatales
- **Límite de reintentos**: Máximo 5 intentos antes de fallar
- **Health checks**: Verificación automática del estado

### Frontend
- **Health endpoint**: `/health` para monitoreo
- **Compresión gzip**: Optimización de rendimiento
- **Cache headers**: Mejora en la experiencia del usuario
- **Security headers**: Protección básica

## 🔍 Troubleshooting

### Problemas Comunes

1. **Puertos ocupados**
   ```bash
   # Verificar puertos en uso
   lsof -i :3000
   lsof -i :8009
   lsof -i :6379
   ```

2. **Servicios no inician**
   ```bash
   # Ver logs de errores
   docker-compose logs [service_name]
   
   # Rebuild completo
   docker-compose down
   docker-compose up --build -d
   ```

3. **Frontend no conecta con backend**
   - Verificar que ambos servicios estén corriendo
   - Revisar logs del frontend para errores de CORS
   - Confirmar que la URL del backend sea correcta

### Health Checks
```bash
# Backend
curl http://localhost:8009/ping

# Frontend
curl http://localhost:3000/health

# Redis
docker-compose exec redis redis-cli ping
```

## 🛠️ Desarrollo

### Modificar el Backend
1. Edita archivos en `backend/`
2. El Dockerfile se rebuild automáticamente
3. Usa `docker-compose restart api` para aplicar cambios

### Modificar el Frontend
1. Edita archivos en `frontend/`
2. Usa `docker-compose restart frontend` para aplicar cambios
3. Para cambios en nginx.conf, rebuild completo necesario

### Variables de Entorno
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

## 📊 Monitoreo y Logs

### Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Métricas de Salud
- **Backend**: `/ping` y `/admin/test`
- **Frontend**: `/health`
- **Redis**: Comando `ping` interno

## 🚀 Despliegue en Producción

### Consideraciones
1. Cambiar puertos expuestos según necesidades
2. Configurar variables de entorno apropiadas
3. Implementar SSL/TLS para HTTPS
4. Configurar backup de Redis
5. Monitoreo externo de servicios

### Comandos de Producción
```bash
# Modo producción
export API_ENV=production
docker-compose -f docker-compose.yml up -d

# Con variables de entorno
docker-compose --env-file .env.prod up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica el estado: `docker-compose ps`
3. Consulta este README
4. Abre un issue en el repositorio

---

**¡Disfruta compartiendo texto de forma temporal y segura! 🎉**
