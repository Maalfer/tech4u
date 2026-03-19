#!/bin/bash
# ==============================================================
# TECH4U FIX SCRIPT — Run on VPS after git pull
# Fixes: Skill Labs 500 error + seeds all drag-and-drop exercises
# Usage: bash fix_vps.sh
# ==============================================================
set -e

CONTAINER="tech4u-backend"

echo ""
echo "=========================================="
echo "  TECH4U VPS FIX SCRIPT"
echo "=========================================="
echo ""

# 1. Check container is running
if ! docker ps | grep -q "$CONTAINER"; then
    echo "[!] Container $CONTAINER is not running. Starting..."
    docker compose up -d backend
    sleep 5
fi

echo "[1/3] Restarting backend (picks up permission_service.py fix)..."
docker compose restart backend
sleep 5
echo "      Done."

echo ""
echo "[2/3] Seeding ALL Skill Lab drag-and-drop exercises..."
echo "      This may take 2-5 minutes..."
docker exec "$CONTAINER" python scripts/seed_all_questions.py
echo "      Done."

echo ""
echo "[3/3] Rebuilding and restarting frontend..."
docker compose restart frontend
sleep 3
echo "      Done."

echo ""
echo "=========================================="
echo "  ALL DONE  ✅"
echo "=========================================="
echo ""
echo "  Visit https://tech4uacademy.es/skill-labs"
echo "  to verify the fix."
echo ""
