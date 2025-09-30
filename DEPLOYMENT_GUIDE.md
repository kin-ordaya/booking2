# Guía de Despliegue - Booking2 Backend

## Configuración de Secretos en GitHub

Para que el CI/CD funcione correctamente, necesitas configurar los siguientes secretos en tu repositorio de GitHub:

### 1. Acceso al repositorio
Ve a: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 2. Secretos requeridos para el despliegue:

#### Docker Hub:
- `DOCKER_USERNAME`: Tu usuario de Docker Hub
- `DOCKER_PASSWORD`: Tu contraseña o token de Docker Hub

## ¿Cómo funciona?

### Workflow Automático:
1. **Push a main/master** → Se activa GitHub Actions
2. **Ejecuta tests** → Verifica que el código funcione
3. **Construye imagen Docker** → Crea la imagen del backend
4. **Sube a Docker Hub** → Publica como `tuusuario/booking2-backend:latest`

### Para desplegar manualmente:
```bash
# En tu servidor
docker pull tuusuario/booking2-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

## Configuración del Servidor (Opcional)

Si quieres automatizar el despliegue en el servidor, puedes usar los scripts incluidos:

### 1. Configurar servidor inicial:
```bash
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 2. Desplegar manualmente:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Verificar salud:
```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

## Preparación del Servidor

### 1. Instalar Docker y Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Crear directorio del proyecto
```bash
sudo mkdir -p /opt/booking2
sudo chown $USER:$USER /opt/booking2
cd /opt/booking2
```

### 3. Clonar archivos de configuración
```bash
# Copiar docker-compose.prod.yml y nginx.conf al servidor
# Estos archivos se pueden obtener del repositorio
```

### 4. Configurar firewall (si es necesario)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

## Configuración de SSH

### 1. Generar clave SSH (si no tienes una)
```bash
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"
```

### 2. Copiar clave pública al servidor
```bash
ssh-copy-id usuario@tu-servidor.com
```

### 3. Agregar clave privada a GitHub Secrets
- Copia el contenido de `~/.ssh/id_rsa` (clave privada)
- Agrégala como secreto `SSH_PRIVATE_KEY` en GitHub

## Proceso de Despliegue

### Automático (recomendado)
1. Haz push a la rama `main` o `master`
2. GitHub Actions ejecutará automáticamente:
   - Tests
   - Build de la imagen Docker
   - Push al registry
   - Despliegue al servidor

### Manual
```bash
# En el servidor
cd /opt/booking2
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoreo

### Verificar estado de los contenedores
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Ver logs
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Verificar salud de la aplicación
```bash
curl http://localhost:3001/health
```

## Solución de Problemas

### 1. Error de conexión SSH
- Verificar que la clave SSH esté correctamente configurada
- Comprobar que el usuario tenga permisos sudo
- Verificar que el puerto SSH esté abierto

### 2. Error de Docker
- Verificar que Docker esté instalado y corriendo
- Comprobar permisos del usuario para Docker
- Verificar espacio en disco

### 3. Error de base de datos
- Verificar credenciales de la base de datos
- Comprobar conectividad de red
- Verificar que la base de datos esté corriendo

### 4. Error de variables de entorno
- Verificar que todos los secretos estén configurados en GitHub
- Comprobar que los nombres coincidan exactamente
- Verificar formato de las variables

## Comandos Útiles

```bash
# Reiniciar la aplicación
docker-compose -f docker-compose.prod.yml restart app

# Actualizar la aplicación
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Limpiar imágenes no utilizadas
docker image prune -f

# Ver uso de recursos
docker stats

# Backup de la base de datos (si usas PostgreSQL local)
docker exec booking2-db pg_dump -U postgres booking2 > backup.sql
```