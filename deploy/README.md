# Tech4U Academy — Guía de despliegue en OVHcloud

**Dominio:** tech4uacademy.es
**Email:** info@tech4uacademy.es
**VPS:** OVHcloud VPS-2 (Ubuntu 22.04, 6 vCores, 12GB RAM, 100GB NVMe)

---

## Orden de ejecución

### 1. Antes de subir al VPS — Configurar DNS en OVHcloud

En el panel de OVHcloud → Dominio → tech4uacademy.es → Zona DNS, añadir:

| Tipo | Subdominio | Destino | TTL |
|------|-----------|---------|-----|
| `A` | @ (raíz) | `IP_DE_TU_VPS` | 300 |
| `A` | www | `IP_DE_TU_VPS` | 300 |

*(Los registros de email se añaden en el paso 4)*

---

### 2. Primer deploy (VPS limpio)

```bash
# Desde tu máquina local — subir el código al VPS
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='frontend/node_modules' \
  --exclude='backend/venv' \
  --exclude='backend/__pycache__' \
  ./ root@IP_DE_TU_VPS:/tmp/tech4u_src/

# Conectar al VPS
ssh root@IP_DE_TU_VPS

# 1. Setup del servidor (una sola vez — instala todo)
cd /tmp/tech4u_src
bash deploy/setup_vps.sh

# 2. Deploy de la app (build + migraciones BD + servicios)
bash deploy/deploy.sh

# 3. Rellenar el .env de producción con tus claves reales
nano /opt/tech4u/backend/.env

# 4. Reiniciar la API para cargar el nuevo .env
systemctl restart tech4u-api

# 5. Activar HTTPS con Let's Encrypt
certbot --nginx -d tech4uacademy.es -d www.tech4uacademy.es

# 6. Cargar TODOS los datos (preguntas, labs, VMs, seeds) — tarda 15-30 min
bash /tmp/tech4u_src/deploy/seed_all.sh
```

---

### 3. Actualizar código (deploys futuros)

```bash
# Desde tu máquina local:
rsync -av \
  --exclude='.git' --exclude='node_modules' --exclude='backend/venv' \
  ./ root@IP_DE_TU_VPS:/tmp/tech4u_src/

ssh root@IP_DE_TU_VPS
cd /tmp/tech4u_src
bash deploy/deploy.sh   # recompila frontend + migra BD + reinicia servicios
```

---

## Email — Configuración completa

La academia usa **dos sistemas de email separados**:

| Función | Servicio | Para qué |
|---------|---------|---------|
| **Enviar** emails transaccionales | [Resend](https://resend.com) | Bienvenidas, streaks, digests |
| **Recibir** en info@tech4uacademy.es | [Zoho Mail](https://mail.zoho.eu) | Soporte, contacto de alumnos |

---

### Paso A — Zoho Mail (recibir emails en info@tech4uacademy.es)

**Gratis, sin tarjeta de crédito, GDPR europeo.**

1. Ve a [mail.zoho.eu](https://mail.zoho.eu) → *Sign Up for Free*
2. Elige **Zoho Mail Free** (5 usuarios, 5GB/usuario)
3. Añade el dominio `tech4uacademy.es`
4. Zoho te pedirá verificar el dominio y te dará los registros DNS

Añade en OVHcloud → Zona DNS de tech4uacademy.es:

| Tipo | Subdominio | Destino | Prioridad | TTL |
|------|-----------|---------|-----------|-----|
| `MX` | @ | `mx.zoho.eu` | 10 | 300 |
| `MX` | @ | `mx2.zoho.eu` | 20 | 300 |
| `MX` | @ | `mx3.zoho.eu` | 50 | 300 |
| `TXT` | @ | `v=spf1 include:zoho.eu ~all` | — | 300 |
| `TXT` | `zmail._domainkey` | *(valor que te dé Zoho)* | — | 300 |

5. En Zoho, crea la cuenta: **info@tech4uacademy.es**
6. Ya puedes enviar/recibir desde [mail.zoho.eu](https://mail.zoho.eu) o configurar en tu cliente de correo (Outlook, Thunderbird, Apple Mail)

---

### Paso B — Resend (enviar emails transaccionales desde la app)

**Gratis hasta 3.000 emails/mes. Sin tarjeta.**

1. Ve a [resend.com](https://resend.com) → *Get Started for Free*
2. Panel → **Domains** → *Add Domain* → escribe `tech4uacademy.es`
3. Resend te dará 3 registros DNS para añadir en OVHcloud:

| Tipo | Nombre | Valor |
|------|--------|-------|
| `TXT` | `resend._domainkey` | `p=MIGf...` *(valor de Resend)* |
| `TXT` | @ | actualiza el SPF: `v=spf1 include:zoho.eu include:amazonses.com ~all` |
| `MX` | `bounce` | `feedback-smtp.us-east-1.amazonses.com` |

4. Espera la verificación (puede tardar hasta 1 hora)
5. Panel → **API Keys** → *Create API Key* → copia la clave
6. Pégala en el `.env` del VPS:

```bash
nano /opt/tech4u/backend/.env
# Editar línea:
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXX
```

7. Reiniciar:
```bash
systemctl restart tech4u-api
```

---

### Paso C — Verificar que el email funciona

```bash
# En el VPS, probar envío de email de prueba:
ssh root@IP_DE_TU_VPS
cd /opt/tech4u/backend
source venv/bin/activate
python - <<'EOF'
from emails import send_welcome
send_welcome("info@tech4uacademy.es", "Admin Test")
print("Email enviado — revisa la bandeja de entrada")
EOF
```

---

## Variables de entorno críticas — producción

Editar en `/opt/tech4u/backend/.env`:

| Variable | Qué poner |
|----------|-----------|
| `RESEND_API_KEY` | API Key de Resend (re_XXXX...) |
| `FROM_EMAIL` | `Tech4U Academy <info@tech4uacademy.es>` |
| `ADMIN_EMAIL` | `info@tech4uacademy.es` |
| `FRONTEND_URL` | `https://tech4uacademy.es` |
| `BACKEND_URL` | `https://tech4uacademy.es` |
| `STRIPE_SECRET_KEY` | Cambiar `sk_test_` → `sk_live_` |
| `STRIPE_PUBLISHABLE_KEY` | Cambiar `pk_test_` → `pk_live_` |
| `PAYPAL_CLIENT_ID/SECRET` | Credenciales de producción PayPal |
| `PAYPAL_MODE` | `live` |
| `GOOGLE_CLIENT_ID/SECRET` | Actualizar URI de redirección en Google Console |

---

## Scripts incluidos

| Script | Propósito |
|--------|-----------|
| `setup_vps.sh` | Instalación del servidor (una vez) |
| `deploy.sh` | Deploy/update (cada vez que actualices código) |
| `seed_all.sh` | Carga completa de datos — preguntas, labs, VMs, usuarios |
| `backup.sh` | Backup de PostgreSQL |

---

## Servicios systemd

```bash
# Estado
systemctl status tech4u-api
systemctl status tech4u-celery

# Logs en tiempo real
journalctl -u tech4u-api -f
tail -f /var/log/tech4u/api.log

# Reiniciar
systemctl restart tech4u-api
systemctl restart tech4u-celery
```

---

## Backup automático

```bash
# Añadir al crontab (crontab -e como root):
0 3,11,19 * * * /bin/bash /opt/tech4u/deploy/backup.sh >> /var/log/tech4u/backup.log 2>&1
```

---

## Comandos útiles

```bash
# Logs
tail -f /var/log/tech4u/api.log
tail -f /var/log/nginx/tech4u_error.log

# BD — estadísticas
sudo -u postgres psql tech4u -c "SELECT COUNT(*) FROM questions;"
sudo -u postgres psql tech4u -c "SELECT COUNT(*) FROM users;"

# Espacio disco
df -h /; ncdu /opt/tech4u

# Re-ejecutar un seed específico (ej. si añades nuevas preguntas)
rm /var/lib/tech4u/seeds/seed_new_questions.done
bash deploy/seed_all.sh

# Renovar SSL
certbot renew --dry-run  # primero probar
certbot renew             # luego ejecutar
```
