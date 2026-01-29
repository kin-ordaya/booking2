FROM node:18-alpine AS builder

WORKDIR /app

# Crear directorio de logs con permisos adecuados
RUN mkdir -p /app/logs && chmod 755 /app/logs

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

# Invalidar cache - rebuild 2026-01-29-v2
RUN npm run build && ls -la dist/

# Etapa de producción
FROM node:18-alpine AS production

RUN apk add --no-cache dumb-init curl

# Crear usuario con UID específico para mejor control de permisos
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Crear directorios necesarios con permisos adecuados
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R nestjs:nodejs /app && \
    chmod -R 755 /app/logs /app/uploads /app/temp

# Copiar package.json para tener la info de dependencias
COPY --chown=nestjs:nodejs package*.json ./

# Solo copiar las dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar el código compilado desde el builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Verificar que los archivos existan
RUN ls -la /app/dist/ || echo "ERROR: dist directory is empty or missing"

USER nestjs

EXPOSE 3000

CMD ["dumb-init", "node", "dist/main.js"]