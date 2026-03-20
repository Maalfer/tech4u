#!/bin/bash
# ==============================================================
# TECH4U DEPLOY SCRIPT — Use this to update the VPS
# Rebuilds the Vite frontend and picks up all code changes.
# ==============================================================
set -e

echo "🚀 Iniciando despliegue de Tech4U..."

# 1. Pull changes
echo "📥 Obteniendo cambios de Git..."
git pull

# 2. Rebuild and restart containers
echo "🏗️ Reconstruyendo imágenes y reiniciando contenedores..."
echo "Esto puede tardar unos minutos (Compilando React)..."
docker compose up -d --build

# 3. DB Migrations (if needed)
echo "📂 Ejecutando migraciones de base de datos..."
docker exec tech4u-backend alembic upgrade head || echo "⚠️ Saltando migraciones o ya actualizadas."

# 4. Cleanup
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo ""
echo "=========================================="
echo "  DESPLIEGUE FINALIZADO ✅"
echo "=========================================="
echo "  Visita https://tech4uacademy.es"
echo "=========================================="
