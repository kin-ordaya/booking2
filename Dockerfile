FROM node:18-alpine

WORKDIR /app

# Instalar herramientas necesarias
RUN apk add --no-cache dumb-init curl

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente - CACHE INVALIDATION 2026-01-29-v3
COPY . .

# Build del proyecto con verificación
RUN echo "=== Iniciando build ===" && \
    npm run build && \
    echo "=== Contenido de dist/ ===" && \
    ls -laR dist/ && \
    echo "=== Verificando main.js ===" && \
    test -f dist/main.js && echo "✓ main.js encontrado" || echo "✗ ERROR: main.js NO encontrado"

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chmod -R 755 /app/logs /app/uploads /app/temp

# Crear usuario
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["dumb-init", "node", "dist/main.js"]