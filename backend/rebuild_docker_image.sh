#!/bin/bash
# Reconstruye la imagen Docker del sandbox con nano ya instalado
# Ejecuta este script desde la carpeta backend/

echo "🔨 Reconstruyendo imagen tech4u-base:latest con nano incluido..."
docker build -f Dockerfile.sandbox -t tech4u-base:latest .
echo "✅ Imagen reconstruida. Reinicia el backend para aplicar los cambios."
