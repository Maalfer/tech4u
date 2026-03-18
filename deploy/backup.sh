#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Tech4U Academy — Backup de base de datos
#  Ejecución manual: sudo bash deploy/backup.sh
#  Ejecución automática: cron (ver abajo) — 3 veces al día
#  Backups guardados en: /backups/tech4u/
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

DB_NAME="tech4u"
DB_USER="tech4u_admin"
BACKUP_DIR="/backups/tech4u"
KEEP_DAYS=7           # retención local
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/tech4u_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump comprimido
if [[ -f /root/.tech4u_db_pass ]]; then
  PGPASSWORD=$(cat /root/.tech4u_db_pass) \
    pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$BACKUP_FILE"
else
  # Usar autenticación por peer (si el script corre como postgres)
  sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup completado: $BACKUP_FILE ($SIZE)"

# Limpiar backups viejos (más de $KEEP_DAYS días)
find "$BACKUP_DIR" -name "tech4u_*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Backups > $KEEP_DAYS días eliminados"

# ── Para programar con cron (ejecuta como root): ──────────────────────────────
# crontab -e
# 0 3,11,19 * * * /bin/bash /opt/tech4u/deploy/backup.sh >> /var/log/tech4u/backup.log 2>&1
