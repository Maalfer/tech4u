#!/bin/bash
echo "🚀 Reiniciando entorno Tech4U..."

# Limpiar puertos
lsof -ti:8000,5173 | xargs kill -9 2>/dev/null

# Iniciar Backend en segundo plano
cd backend && source venv/bin/activate && uvicorn main:app --port 8000 > /tmp/backend.log 2>&1 &
echo "✅ Backend arrancando en http://localhost:8000"

# Iniciar Frontend
cd ../frontend && npm run dev

