# Etapa 1: Build de la aplicación con Vite
FROM node:20-alpine AS build-stage

WORKDIR /app

# Instalar dependencias primero para aprovechar el caché de capas
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Inyectar variables de entorno en tiempo de build (Vite las necesita así)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa 2: Servir archivos estáticos con Nginx
FROM nginx:stable-alpine AS production-stage

# Copiar configuración personalizada de Nginx
# nginx.conf  → server block (incluido en http{} via conf.d/)
# nginx_rate_limit.conf → zonas de rate limiting (también en http{} via conf.d/)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx_rate_limit.conf /etc/nginx/conf.d/rate_limit.conf

# Copiar los archivos compilados del build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# NOTA: No se puede ejecutar "nginx -t" aquí porque el upstream "backend"
# solo existe en la red de Docker Compose (runtime), no durante el build.
# Nginx validará la config al arrancar el contenedor.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
