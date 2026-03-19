# Dockerfile para Tech4U Backend
FROM python:3.11-slim

# Evita que Python genere archivos .pyc y fuerza que el output se vea en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instala dependencias de sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configura el directorio de trabajo
WORKDIR /app

# Instala dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY . .

# Exponer el puerto del API
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["python", "run.py"]
