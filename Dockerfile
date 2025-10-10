FROM node:18-alpine AS builder

WORKDIR /app

# Crear directorio de logs con permisos adecuados
RUN mkdir -p /app/logs && chmod 755 /app/logs

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

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

# Solo copiar las dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

CMD ["dumb-init", "node", "dist/main"]