#!/bin/bash

echo "🚀 Reiniciando Tech4U..."

lsof -ti:8000,5173 | xargs kill -9 2>/dev/null

cd backend
source venv/bin/activate
uvicorn main:app --port 8000 &

cd ../frontend
npm run dev
