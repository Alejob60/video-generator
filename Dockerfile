# Etapa de construcción
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar todas las dependencias con legacy-peer-deps para evitar conflictos
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Instalar ffmpeg necesario para procesamiento de video
RUN apk add --no-cache ffmpeg

# Crear directorios para archivos estáticos
RUN mkdir -p public/videos public/audio public/subtitles public/uploads public/avatars public/campaigns public/image

# Copiar dependencias de la etapa de construcción (incluyendo reflect-metadata)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Exponer puerto
EXPOSE 8080

# Comando de inicio
CMD ["node", "dist/main.js"]