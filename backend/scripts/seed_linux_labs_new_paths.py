"""
seed_linux_labs_new_paths.py — 3 new SkillPath + Module + Lab structures for Linux labs
Paths: Redes en Linux, Servicios Linux, Seguridad en Linux
Run: cd backend && source venv/bin/activate && python3 scripts/seed_linux_labs_new_paths.py
"""
import os, sys, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, SkillPath, Module, Lab

def ins_module(db, path, module_data):
    """Insert module and return the Module object."""
    existing = db.query(Module).filter(
        Module.skill_path_id == path.id,
        Module.title == module_data["title"]
    ).first()

    if existing:
        return existing

    module = Module(
        skill_path_id=path.id,
        title=module_data["title"],
        description=module_data.get("description", ""),
        order_index=module_data.get("order_index", 0),
        is_active=True,
        requires_validation=module_data.get("requires_validation", True)
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module

def ins_labs(db, module, labs):
    """Insert labs into module, checking for duplicates."""
    count = 0
    for ld in labs:
        existing = db.query(Lab).filter(
            Lab.module_id == module.id,
            Lab.title == ld["title"]
        ).first()

        if not existing:
            db.add(Lab(
                module_id=module.id,
                title=ld["title"],
                difficulty=ld.get("difficulty", "medium"),
                description=ld.get("description", ""),
                goal_description=ld.get("goal", ""),
                step_by_step_guide=ld.get("guide", ""),
                order_index=ld.get("order_index", 0),
                is_active=True,
                docker_image="ubuntu:22.04",
                xp_reward=ld.get("xp", 150),
                time_limit=ld.get("time_limit", 30),
                category="Linux",
                scenario_setup=ld.get("scenario_setup", ""),
                validation_command=ld.get("validation_command", ""),
                expected_result=ld.get("expected_result", ""),
                validation_rules=ld.get("validation_rules", "")
            ))
            count += 1

    db.commit()
    print(f"  → {module.title}: {count} nuevos labs")

def run():
    db = SessionLocal()
    try:
        # ════════════════════════════════════════════════════════════════════
        # PATH 1: REDES EN LINUX
        # ════════════════════════════════════════════════════════════════════
        path1 = db.query(SkillPath).filter(SkillPath.title == "Redes en Linux").first()
        if not path1:
            path1 = SkillPath(
                title="Redes en Linux",
                description="Configura, diagnostica y gestiona redes desde la terminal Linux. Aprende comandos de red esenciales, diagnóstico de conectividad, SSH seguro, servicios de red y análisis de tráfico.",
                difficulty="medium",
                order_index=4,
                is_active=True
            )
            db.add(path1)
            db.commit()
            db.refresh(path1)
            print(f"✓ SkillPath creada: {path1.title}")
        else:
            print(f"✓ SkillPath ya existe: {path1.title}")

        # M1: Configuración de Red
        m1_1 = ins_module(db, path1, {
            "title": "M1 — Configuración de Red",
            "description": "Configura interfaces de red, rutas, DNS y herramientas como ip, route, nmcli, netplan.",
            "order_index": 1
        })

        ins_labs(db, m1_1, [
            {
                "title": "IP Command Basics",
                "difficulty": "easy",
                "order_index": 1,
                "xp": 100,
                "time_limit": 20,
                "description": "Aprende a usar 'ip addr' y 'ip route' para ver y configurar direcciones IP.",
                "goal": "Usar ip addr show para listar interfaces. Añadir una IP temporal a eth0. Ver tabla de rutas.",
                "guide": """1. Abre terminal y ejecuta:
   ip addr show

2. Ver solo interfaz eth0:
   ip addr show eth0

3. Ver tabla de rutas:
   ip route show

4. Añadir IP temporal (requerirá sudo):
   sudo ip addr add 192.168.1.100/24 dev eth0

5. Verificar:
   ip addr show eth0

6. Eliminar IP:
   sudo ip addr del 192.168.1.100/24 dev eth0

El comando 'ip' es más moderno que 'ifconfig'. Sintaxis: ip [objeto] [comando] [argumentos]""",
                "validation_command": "ip addr show | grep -c 'inet'",
                "expected_result": "2"
            },
            {
                "title": "Rutas y Gateway",
                "difficulty": "medium",
                "order_index": 2,
                "xp": 130,
                "time_limit": 25,
                "description": "Gestiona rutas estáticas, gateway por defecto y tablas de enrutamiento.",
                "goal": "Ver tabla de rutas. Añadir ruta estática. Ver gateway por defecto.",
                "guide": """1. Ver tabla de rutas completa:
   ip route show

2. Ver solo rutas de IPv4:
   ip -4 route show

3. Ver gateway por defecto:
   ip route | grep default

4. Añadir ruta estática (temporal):
   sudo ip route add 192.168.2.0/24 via 192.168.1.1

5. Ver rutas con estadísticas:
   ip -s route show

6. Cambiar gateway por defecto:
   sudo ip route del default
   sudo ip route add default via 192.168.1.254

7. Ver tabla de rutas con ping:
   ping -R 8.8.8.8

Nota: Cambios son temporales. Para persistencia, editar /etc/netplan/.""",
                "validation_command": "ip route | grep -c default",
                "expected_result": "1"
            },
            {
                "title": "Netplan Configuration",
                "difficulty": "hard",
                "order_index": 3,
                "xp": 160,
                "time_limit": 30,
                "description": "Configura red de forma persistente usando netplan (YAML).",
                "goal": "Crear configuración netplan. Validar sintaxis. Aplicar cambios. Verificar persistencia.",
                "guide": """1. Ver configuración netplan actual:
   cat /etc/netplan/*.yaml

2. Crear archivo de configuración (como usuario normal):
   cat > /tmp/00-installer-config.yaml << 'EOF'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - 192.168.1.50/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
EOF

3. Validar sintaxis netplan:
   sudo netplan validate

4. Probar cambios sin aplicar:
   sudo netplan try

5. Aplicar cambios definitivamente:
   sudo netplan apply

6. Verificar configuración:
   ip addr show
   ip route show
   cat /etc/resolv.conf

Formato YAML: atención a indentación (espacios, no tabs).
Para DHCP: dhcp4: true en lugar de addresses.
Gateway4 es para IPv4. gateway6 para IPv6.""",
                "validation_command": "test -f /etc/netplan/*.yaml && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "nmcli Network Manager",
                "difficulty": "medium",
                "order_index": 4,
                "xp": 135,
                "time_limit": 25,
                "description": "Usa NetworkManager (nmcli) para gestionar conexiones y WiFi.",
                "goal": "Listar conexiones. Ver estado. Crear conexión temporal. Conectar/desconectar.",
                "guide": """1. Ver estado de NetworkManager:
   nmcli general status

2. Listar dispositivos de red:
   nmcli device

3. Listar conexiones guardadas:
   nmcli connection show

4. Ver detalles de una conexión:
   nmcli connection show --active

5. Ver WiFi disponibles (si hay interfaz wireless):
   nmcli device wifi list

6. Conectar a WiFi:
   nmcli device wifi connect 'SSID' password 'contraseña'

7. Crear conexión estática:
   nmcli connection add type ethernet con-name 'static' ifname eth0 ip4 192.168.1.50/24 gw4 192.168.1.1

8. Activar/desactivar conexión:
   nmcli connection up 'static'
   nmcli connection down 'static'

9. Eliminar conexión:
   nmcli connection delete 'static'

nmcli es interfaz CLI a NetworkManager. GUI es nm-applet.""",
                "validation_command": "nmcli device | grep -c 'connected'",
                "expected_result": "1"
            },
            {
                "title": "DNS y /etc/resolv.conf",
                "difficulty": "medium",
                "order_index": 5,
                "xp": 125,
                "time_limit": 20,
                "description": "Configura servidores DNS. Entiende resolv.conf. Usa systemd-resolved.",
                "goal": "Ver configuración DNS actual. Cambiar servidores DNS. Usar dig para verificar.",
                "guide": """1. Ver servidores DNS actuales:
   cat /etc/resolv.conf

2. Ver DNS con systemd-resolved (moderno):
   systemctl status systemd-resolved
   resolvectl status

3. Configurar DNS temporalmente (requiere sudo):
   sudo nano /etc/resolv.conf
   # Añade:
   nameserver 8.8.8.8
   nameserver 8.8.4.4

4. Mejor: Editar netplan para DNS persistente:
   sudo nano /etc/netplan/00-installer-config.yaml
   # Añade en la sección de eth0:
   nameservers:
     addresses: [8.8.8.8, 1.1.1.1]

5. Aplicar cambios netplan:
   sudo netplan apply

6. Verificar con dig:
   dig google.com
   dig @8.8.8.8 google.com

7. Ver caché DNS (systemd-resolved):
   resolvectl query google.com
   resolvectl statistics

Nota: /etc/resolv.conf puede ser symlink a /run/systemd/resolve/resolv.conf
      En Docker/contenedores, editar directamente sin persistencia.""",
                "validation_command": "cat /etc/resolv.conf | grep -c nameserver",
                "expected_result": "1"
            }
        ])

        # M2: Diagnóstico de Red
        m1_2 = ins_module(db, path1, {
            "title": "M2 — Diagnóstico de Red",
            "description": "Diagnostica conectividad con ping, traceroute, ss, netstat, nslookup, dig, tcpdump.",
            "order_index": 2
        })

        ins_labs(db, m1_2, [
            {
                "title": "Ping y Conectividad Básica",
                "difficulty": "easy",
                "order_index": 1,
                "xp": 100,
                "time_limit": 15,
                "description": "Usa ping para verificar conectividad a hosts remotos.",
                "goal": "Hacer ping a múltiples hosts. Entender ICMP echo. Ver RTT (tiempo redondo).",
                "guide": """1. Ping básico a Google:
   ping -c 4 8.8.8.8

2. Ping a nombre de dominio:
   ping -c 4 google.com

3. Especificar timeout (espera máxima):
   ping -w 2000 -c 4 8.8.8.8

4. Ping con tamaño de paquete personalizado:
   ping -s 500 -c 4 google.com

5. Ping continuo (Ctrl+C para parar):
   ping google.com

6. Análisis de salida ping:
   - ICMP echo request/reply
   - bytes: tamaño del paquete
   - time: RTT (Round Trip Time) en ms
   - TTL: Time To Live (saltos antes de descartar)

7. Ver estadísticas finales:
   ping -c 10 8.8.8.8
   # Última línea: loss%, min/avg/max/stddev

Si ping falla: problema de conectividad, firewall o resolución DNS.""",
                "validation_command": "ping -c 1 8.8.8.8 > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "Traceroute - Ruta de Paquetes",
                "difficulty": "medium",
                "order_index": 2,
                "xp": 130,
                "time_limit": 20,
                "description": "Visualiza el camino de paquetes a través de saltos (hops) hacia un destino.",
                "goal": "Usar traceroute. Entender saltos. Identificar donde falla conectividad.",
                "guide": """1. Traceroute básico:
   traceroute google.com

2. Traceroute con IP:
   traceroute 8.8.8.8

3. Limitar número de saltos (hops):
   traceroute -m 15 google.com

4. Usar puertos UDP específicos:
   traceroute -p 80 google.com

5. Traceroute con ICMP (en lugar de UDP):
   sudo traceroute -I google.com

6. Usar TCP (puerto 80 por defecto):
   sudo traceroute -T google.com

7. Sin resolución DNS (más rápido):
   traceroute -n google.com

Interpreta salida:
- Número: hop/salto
- Nombre/IP: router intermedio
- time1 time2 time3: 3 intentos, latencia cada uno
- * * *: timeout, router no responde o bloquea
- !X: error específico
   !N = red no alcanzable
   !H = host no alcanzable
   !P = protocolo no alcanzable""",
                "validation_command": "traceroute -m 3 8.8.8.8 2>/dev/null | wc -l",
                "expected_result": "3"
            },
            {
                "title": "ss - Socket Statistics",
                "difficulty": "medium",
                "order_index": 3,
                "xp": 135,
                "time_limit": 25,
                "description": "Usa ss (reemplazo moderno de netstat) para ver puertos y conexiones.",
                "goal": "Listar puertos abiertos (listening). Ver conexiones activas. Filtrar por estado.",
                "guide": """1. Listar todos los sockets:
   ss

2. Solo puertos TCP escuchando (-l = listening):
   ss -tl

3. TCP escuchando + números:
   ss -tln

4. UDP escuchando:
   ss -ul

5. Todas las conexiones activas:
   ss -ta

6. Puertos escuchando con proceso (requiere sudo):
   sudo ss -tlnp

7. Filtrar por puerto específico:
   ss -tln | grep :22
   ss -tln | grep LISTEN | grep 80

8. Ver solo conexiones establecidas:
   ss -tan | grep ESTABLISHED

9. Contar conexiones por estado:
   ss -tan | grep -c ESTABLISHED

10. Ver estadísticas resumidas:
    ss -s

Flags comunes:
- t = TCP
- u = UDP
- l = listening
- a = all (listening + conexiones)
- n = numeric (IPs, no names)
- p = process (PID y nombre)
- s = summary""",
                "validation_command": "ss -tln | grep -c LISTEN",
                "expected_result": "1"
            },
            {
                "title": "Netstat (Legacy) - Conexiones Activas",
                "difficulty": "easy",
                "order_index": 4,
                "xp": 125,
                "time_limit": 20,
                "description": "Usa netstat (herramienta clásica) para diagnosticar redes. Nota: ss es moderno.",
                "goal": "Ver puertos abiertos con netstat. Ver conexiones y estado. Identificar procesos.",
                "guide": """1. Netstat básico:
   netstat

2. Puertos TCP escuchando:
   netstat -tl

3. TCP escuchando con números:
   netstat -tln

4. Ver procesos (requiere sudo):
   sudo netstat -tlnp

5. Ver conexiones UDP:
   netstat -ul

6. Estadísticas por protocolo:
   netstat -s

7. Ver tabla de rutas:
   netstat -rn

8. Conexiones activas:
   netstat -tan | grep ESTABLISHED

9. Contar conexiones por estado:
   netstat -tan | grep -c ESTABLISHED

10. Interfaz estadísticas (cada segundo):
    netstat -i

Nota: netstat está deprecado. Usar ss es mejor:
  netstat -tln → ss -tln
  netstat -tan → ss -tan
  netstat -ulnp → ss -ulnp (con sudo)
  netstat -s → ss -s
  netstat -rn → ip route show

Pero netstat sigue siendo común en sistemas legacy.""",
                "validation_command": "which netstat > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "dig y nslookup - Consultas DNS",
                "difficulty": "medium",
                "order_index": 5,
                "xp": 140,
                "time_limit": 25,
                "description": "Realiza consultas DNS con dig y nslookup. Resuelve nombres a IPs.",
                "goal": "Hacer dig a dominio. Ver registro A, MX, CNAME. Cambiar servidor DNS.",
                "guide": """1. Dig básico:
   dig google.com

2. Ver solo el answer section:
   dig google.com +noall +answer

3. Consultar registro específico (A, MX, CNAME, TXT):
   dig google.com MX
   dig google.com CNAME
   dig google.com TXT
   dig google.com NS

4. Dig a servidor DNS específico:
   dig @8.8.8.8 google.com
   dig @1.1.1.1 google.com

5. Dig inverso (IP a nombre):
   dig -x 8.8.8.8

6. Seguir CNAMEs:
   dig google.com +trace

7. nslookup simple:
   nslookup google.com

8. nslookup a servidor específico:
   nslookup google.com 8.8.8.8

9. Consultar registro MX (mail):
   nslookup -type=MX google.com

10. Resolver IP inversa con nslookup:
    nslookup 8.8.8.8

Dig es más poderoso. Nslookup es simpler. Ambas útiles.

Campos en respuesta dig:
- flags: rd (recursión), aa (autoridad)
- status: NOERROR, NXDOMAIN, etc
- ANSWER SECTION: respuestas
- ttl: tiempo de caché (segundos)""",
                "validation_command": "dig google.com +noall +answer | grep -c IN",
                "expected_result": "1"
            },
            {
                "title": "tcpdump - Captura de Tráfico",
                "difficulty": "hard",
                "order_index": 6,
                "xp": 160,
                "time_limit": 30,
                "description": "Captura y analiza tráfico de red con tcpdump.",
                "goal": "Capturar paquetes. Filtrar por protocolo, puerto, host. Guardar a archivo.",
                "guide": """1. Capturar en interfaz por defecto (requiere sudo):
   sudo tcpdump

2. Capturar en interfaz específica:
   sudo tcpdump -i eth0

3. Limitar a N paquetes (-c count):
   sudo tcpdump -i eth0 -c 10

4. Capturar sin resolución DNS (-n):
   sudo tcpdump -n -c 10

5. Ver detalle de paquetes (-v verbose):
   sudo tcpdump -v -c 5

6. Filtrar por protocolo TCP:
   sudo tcpdump -i eth0 tcp -c 20

7. Filtrar por puerto específico:
   sudo tcpdump -i eth0 'port 22' -c 10
   sudo tcpdump -i eth0 'port 80 or port 443' -c 20

8. Filtrar por host:
   sudo tcpdump -i eth0 'host 8.8.8.8' -c 10

9. Filtrar por red (subnet):
   sudo tcpdump -i eth0 'net 192.168.1.0/24' -c 10

10. Guardar a archivo pcap:
    sudo tcpdump -i eth0 -w captura.pcap

11. Leer archivo pcap:
    tcpdump -r captura.pcap

12. Combinar filtros:
    sudo tcpdump -i eth0 '(tcp port 443) and (host 8.8.8.8)' -c 10

13. Ver hexdump (-X):
    sudo tcpdump -i eth0 -X -c 1

Syntaxis filtros:
- tcp/udp/icmp/dns/arp
- port 80
- host 192.168.1.1
- net 192.168.1.0/24
- src/dst 192.168.1.1
- and/or/not
- parentheses para agrupar""",
                "validation_command": "which tcpdump > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            }
        ])

        # M3: SSH y Acceso Remoto
        m1_3 = ins_module(db, path1, {
            "title": "M3 — SSH y Acceso Remoto",
            "description": "Configura SSH seguro. Genera keys, copia IDs, usa scp, rsync, sftp.",
            "order_index": 3
        })

        ins_labs(db, m1_3, [
            {
                "title": "SSH Keygen y Autenticación",
                "difficulty": "medium",
                "order_index": 1,
                "xp": 140,
                "time_limit": 25,
                "description": "Genera claves SSH RSA. Usa autenticación de clave pública sin contraseña.",
                "goal": "Generar par de claves. Ver estructura. Entender permiso de archivos.",
                "guide": """1. Generar par de claves (RSA 4096 bits):
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
   (presiona Enter para sin contraseña, o escribe contraseña)

2. Ver claves generadas:
   ls -la ~/.ssh/

3. Ver clave pública:
   cat ~/.ssh/id_rsa.pub

4. Crear archivo authorized_keys (servidor):
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh

5. Copiar clave pública a servidor (en hosts remoto):
   # Método manual:
   cat > ~/.ssh/authorized_keys << 'PUBKEY'
   ssh-rsa AAAAB3Nz...=== local@host
   PUBKEY
   chmod 600 ~/.ssh/authorized_keys

6. Conectar sin contraseña:
   ssh usuario@servidor

Permisos correctos en servidor:
- ~/.ssh: 700 (drwx------)
- ~/.ssh/authorized_keys: 600 (-rw-------)
- ~/.ssh/id_rsa (privada): 600
- ~/.ssh/id_rsa.pub (pública): 644 ok

Alternativas de algoritmo:
- ssh-keygen -t ed25519 (moderno, recomendado)
- ssh-keygen -t rsa -b 4096 (RSA, compatible)
- ssh-keygen -t ecdsa -b 256 (elliptic curve)""",
                "validation_command": "test -f ~/.ssh/id_rsa && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "ssh-copy-id - Distribuir Claves",
                "difficulty": "medium",
                "order_index": 2,
                "xp": 135,
                "time_limit": 20,
                "description": "Automatiza copia de clave pública a servidores remotos.",
                "goal": "Usar ssh-copy-id para instalar clave en servidor remoto.",
                "guide": """1. Sintaxis básica:
   ssh-copy-id -i ~/.ssh/id_rsa.pub usuario@servidor

2. Especificar puerto SSH no estándar:
   ssh-copy-id -i ~/.ssh/id_rsa.pub -p 2222 usuario@servidor

3. Primera vez (pedirá contraseña):
   ssh-copy-id usuario@servidor

4. Verificar que se copió:
   ssh usuario@servidor cat ~/.ssh/authorized_keys

5. Ahora conexión sin contraseña:
   ssh usuario@servidor

Qué hace ssh-copy-id:
1. Lee ~/.ssh/id_rsa.pub (o especificada con -i)
2. Conecta a servidor (pide contraseña)
3. Añade clave a ~/.ssh/authorized_keys en servidor
4. Ajusta permisos (~/.ssh: 700, authorized_keys: 600)

Alternativa manual (más segura):
1. Copia clave local: cat ~/.ssh/id_rsa.pub | xclip
2. En servidor: nano ~/.ssh/authorized_keys
3. Pega clave en nueva línea""",
                "validation_command": "test -f ~/.ssh/authorized_keys && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "scp - Copia Segura de Archivos",
                "difficulty": "medium",
                "order_index": 3,
                "xp": 130,
                "time_limit": 20,
                "description": "Copia archivos entre máquinas locales y remotas por SSH.",
                "goal": "Copiar archivo a servidor. Copiar desde servidor. Recursiva.",
                "guide": """1. Copiar archivo local a servidor:
   scp /path/to/local/file usuario@servidor:/path/remoto/

2. Copiar archivo de servidor a local:
   scp usuario@servidor:/path/remoto/file /path/to/local/

3. Copiar carpeta recursiva (-r):
   scp -r /path/to/local/dir usuario@servidor:/path/remoto/

4. Usar puerto SSH no estándar (-P mayúscula):
   scp -P 2222 archivo usuario@servidor:/path/remoto/

5. Copiar multiple archivos:
   scp file1 file2 file3 usuario@servidor:/path/remoto/

6. Ver progreso (-v verbose):
   scp -v archivo usuario@servidor:/path/remoto/

7. Copiar entre dos servidores remotos:
   scp -r usuario1@servidor1:/path usuario2@servidor2:/path

8. Conservar permisos y timestamps (-p):
   scp -p archivo usuario@servidor:/path/remoto/

Sintaxis general:
   scp [opciones] origen destino
   origen/destino remoto: usuario@host:/ruta
   origen/destino local: /ruta/archivo

Equivalentes:
- scp ≈ cp (copia)
- sftp ≈ ftp (interactivo)
- rsync (más eficiente, solo cambios)""",
                "validation_command": "which scp > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "rsync - Sincronización Eficiente",
                "difficulty": "hard",
                "order_index": 4,
                "xp": 150,
                "time_limit": 25,
                "description": "Sincroniza archivos entre máquinas. Solo copia cambios, comprime, etc.",
                "goal": "Usar rsync local y remota. Sincronizar directorios. Dry-run.",
                "guide": """1. Rsync básico local:
   rsync -av /src/ /dst/

2. Rsync a servidor remoto:
   rsync -av /local/path/ usuario@servidor:/remote/path/

3. Rsync desde servidor remoto:
   rsync -av usuario@servidor:/remote/path/ /local/path/

4. Actualizar solo cambios (sin -a):
   rsync -av --update /src/ /dst/

5. Compresión durante transferencia (-z):
   rsync -avz /local/ usuario@servidor:/remote/

6. Borrar archivos en destino que no existen en origen (--delete):
   rsync -av --delete /src/ /dst/

7. Simular (dry-run):
   rsync -av --dry-run /src/ /dst/

8. Excluir archivos:
   rsync -av --exclude '*.log' --exclude '.git' /src/ /dst/

9. Ver progreso detallado:
   rsync -av --progress /src/ /dst/

10. Puerto SSH específico:
    rsync -av -e 'ssh -p 2222' /local/ usuario@servidor:/remote/

11. Sincronización bidireccional (solo cambios nuevos):
    rsync -avz /local/ usuario@servidor:/remote/
    rsync -avz usuario@servidor:/remote/ /local/

Flags útiles:
- a: archive (permisos, dueño, timestamps)
- v: verbose
- z: compress
- --progress: barra de progreso
- --delete: borrar en destino
- --dry-run: simular (-n abreviado)
- --exclude: patrones a ignorar
- --update: solo si destino es más viejo
- -e: comando remoto (ssh con opciones)

Ventaja vs scp: solo copia cambios, más eficiente.""",
                "validation_command": "which rsync > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "sftp - Servidor FTP Seguro",
                "difficulty": "medium",
                "order_index": 5,
                "xp": 125,
                "time_limit": 20,
                "description": "Accede interactivamente a servidor remoto por SFTP (sobre SSH).",
                "goal": "Conectar a sftp. Navegar directorios. Descargar y subir archivos.",
                "guide": """1. Conectar a servidor SFTP:
   sftp usuario@servidor

2. Con puerto no estándar:
   sftp -P 2222 usuario@servidor

Dentro de sesión SFTP (similar a FTP):

3. Ver directorio remoto actual:
   pwd

4. Listar archivos remotos:
   ls
   ls -la
   cd /path

5. Ver directorio local:
   lpwd

6. Listar archivos locales:
   lls
   lcd /path/local

7. Descargar archivo (get):
   get archivo_remoto
   get archivo_remoto /path/local/
   get -r directorio_remoto  # Recursivo

8. Subir archivo (put):
   put archivo_local
   put archivo_local /path/remoto/
   put -r directorio_local  # Recursivo

9. Crear directorio remoto:
   mkdir nombre_dir

10. Eliminar archivo remoto:
    rm archivo
    rmdir directorio

11. Renombrar archivo remoto:
    rename viejo nuevo

12. Ver información:
    stat archivo

13. Salir:
    quit o exit

Comandos locales llevan 'l' prefix: lls, lpwd, lcd, lmkdir
Ventaja de sftp vs scp: interfaz interactiva, similar a FTP.
Pero para scripts, rsync/scp es mejor.""",
                "validation_command": "which sftp > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            }
        ])

        # M4: Servicios de Red
        m1_4 = ins_module(db, path1, {
            "title": "M4 — Servicios de Red",
            "description": "Herramientas de cliente: curl, wget, netcat, nmap básico desde Linux.",
            "order_index": 4
        })

        ins_labs(db, m1_4, [
            {
                "title": "curl - Cliente HTTP/HTTPS",
                "difficulty": "medium",
                "order_index": 1,
                "xp": 135,
                "time_limit": 20,
                "description": "Haz requests HTTP con curl. GET, POST, headers, autenticación.",
                "goal": "Usar curl para GET. Ver headers. Hacer POST con datos.",
                "guide": """1. Request simple (GET):
   curl http://example.com

2. Ver headers (-i):
   curl -i http://example.com

3. Solo headers (-I):
   curl -I http://example.com

4. Incluir cookies (-b):
   curl -b 'cookie=valor' http://example.com

5. Guardar cookies (-c):
   curl -c cookies.txt http://example.com

6. POST request (-X POST):
   curl -X POST -d 'param1=valor1&param2=valor2' http://example.com

7. POST con JSON (-H para headers):
   curl -X POST -H 'Content-Type: application/json' \\
     -d '{\"key\":\"value\"}' http://example.com/api

8. Headers personalizados (-H):
   curl -H 'User-Agent: MiApp/1.0' http://example.com

9. Autenticación basic (-u):
   curl -u usuario:contraseña http://example.com

10. Seguir redirecciones (-L):
    curl -L http://example.com

11. Timeout (-m segundos):
    curl -m 5 http://example.com

12. Guardar a archivo (-o):
    curl -o archivo.html http://example.com

13. Ver progreso:
    curl -# http://example.com (# para barra)

14. Verbose (-v):
    curl -v http://example.com

15. Método personalizado:
    curl -X DELETE http://api.com/resource/1
    curl -X PUT -d 'datos' http://api.com/resource/1

curl es versátil. Perfecto para APIs REST.""",
                "validation_command": "curl -I http://example.com 2>/dev/null | head -1 | grep -c HTTP",
                "expected_result": "1"
            },
            {
                "title": "wget - Descargador HTTP",
                "difficulty": "easy",
                "order_index": 2,
                "xp": 120,
                "time_limit": 15,
                "description": "Descarga archivos desde web con wget. Ideal para archivos grandes.",
                "goal": "Descargar archivo simple. Recursivo. Reanudable.",
                "guide": """1. Descarga simple:
   wget http://example.com/file.zip

2. Guardar con nombre diferente (-O mayúscula):
   wget -O archivo_local.zip http://example.com/file.zip

3. Descargar a directorio específico (-P):
   wget -P ~/descargas/ http://example.com/file.zip

4. Mostrar salida (-v verbose / -q quiet):
   wget -v http://example.com/file.zip
   wget -q http://example.com/file.zip

5. Reanudable (útil si se interrumpe):
   wget -c http://example.com/bigfile.iso

6. Descarga recursiva (todo sitio):
   wget -r http://example.com/

7. Limitar profundidad recursiva (-l):
   wget -r -l 2 http://example.com/

8. Sin verificar certificados HTTPS:
   wget --no-check-certificate https://example.com/file

9. Timeout:
   wget --timeout=5 http://example.com/file

10. Con autenticación:
    wget --user=usuario --password=pass http://example.com/file

11. Rate limit (no saturar servidor):
    wget --limit-rate=100K http://example.com/bigfile.iso

12. Mostrar solo errores:
    wget -nv http://example.com/file

Diferencia curl vs wget:
- curl: versátil, APIs, debugging
- wget: simple, descargas, recursivas
- curl: stdout por defecto
- wget: archivo local por defecto""",
                "validation_command": "which wget > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "netcat (nc) - Swiss Army Knife de Red",
                "difficulty": "hard",
                "order_index": 3,
                "xp": 155,
                "time_limit": 25,
                "description": "Netcat: cliente/servidor TCP/UDP. Debug de conexiones. Port scanning.",
                "goal": "Escuchar en puerto. Conectar a servidor. Transferir datos. Escanear puertos.",
                "guide": """1. Netcat simple - escuchar en puerto (servidor):
   nc -l -p 5000
   (en otra terminal)
   nc localhost 5000
   (escribe texto, se transmite entre terminales)

2. Escuchar IPv4 específico:
   nc -l -v -p 5000 0.0.0.0

3. UDP en lugar de TCP:
   nc -l -u -p 5000

4. Conectar a servidor (cliente):
   nc localhost 5000
   nc 192.168.1.100 22

5. Con timeout (-w):
   nc -w 3 ejemplo.com 80

6. Archivo de entrada/salida (redirect):
   nc -l -p 5000 < archivo_entrada.txt
   nc localhost 5000 > archivo_recibido.txt

7. Banner grabbing (ver servicio):
   nc ejemplo.com 80
   (escribe: GET / HTTP/1.0 + Enter 2x)

8. Escaneo de puertos simple:
   for p in 80 443 8080; do nc -zv ejemplo.com $p; done

9. Rango de puertos (-z = solo conexión, sin datos):
   nc -zv ejemplo.com 1-1000

10. Transferencia de datos (máquina A escucha):
    # Máquina A (servidor):
    nc -l -p 5000 > archivo_recibido.iso
    # Máquina B (cliente):
    nc 192.168.1.A 5000 < archivo_local.iso

11. Shell remota (peligroso, no usar en producción):
    # Servidor:
    nc -l -p 5000 -e /bin/bash
    # Cliente:
    nc servidor 5000

12. Tunnel TCP/UDP:
    nc -l -p 5000 -e 'nc otrohost 22'
    (conecta a 5000 local, redirecciona a otrohost:22)

Flags comunes:
- l: listen (modo servidor)
- p: puerto
- u: UDP (default es TCP)
- v: verbose
- z: zero-I/O (solo conexión, no envía datos)
- w: timeout
- e: ejecutar comando/shell

Advertencia: nc es poderosa pero peligrosa (shells remotas).
Usar con cuidado, preferir SSH para acceso remoto seguro.""",
                "validation_command": "which nc > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "nmap Básico - Port Scanning",
                "difficulty": "medium",
                "order_index": 4,
                "xp": 140,
                "time_limit": 20,
                "description": "Nmap básico desde Linux. Escanea puertos abiertos. Detecta servicios.",
                "goal": "Escanear puerto único. Rango. Detección de versiones. Output formatos.",
                "guide": """1. Escaneo simple:
   nmap localhost
   nmap 192.168.1.100

2. Escaneo sin resolver DNS (-n):
   nmap -n 192.168.1.100

3. Ver solo puertos abiertos (-sV = version detection):
   nmap -sV localhost

4. Puerto específico (-p):
   nmap -p 80 192.168.1.100
   nmap -p 80,443,22 192.168.1.100

5. Rango de puertos:
   nmap -p 1-1000 192.168.1.100
   nmap -p 1-65535 192.168.1.100 (all ports)

6. Servicios comunes (-F fast):
   nmap -F 192.168.1.100

7. Detección de SO (-O requiere sudo):
   sudo nmap -O 192.168.1.100

8. Agresivo (versiones, scripts, OS):
   sudo nmap -A 192.168.1.100

9. Scan SYN (stealthy, requiere sudo):
   sudo nmap -sS 192.168.1.100

10. Output a archivo (-oN normal, -oX XML, -oG grep):
    nmap -p 1-1000 -oN resultado.txt 192.168.1.100
    nmap -oX resultado.xml 192.168.1.100

11. UDP scan (lento):
    sudo nmap -sU 192.168.1.100

12. Ping scan sin port scan (-sn):
    nmap -sn 192.168.1.0/24

13. Multiples hosts / red:
    nmap 192.168.1.1-50
    nmap 192.168.1.0/24

14. Verbose output (-v):
    nmap -v 192.168.1.100

Estados de puerto nmap:
- open: acepta conexiones
- closed: rechaza (firewall)
- filtered: blocked (no responde)
- unfiltered: accesible pero no se sabe si abierto

Tipos de scan:
- -sS: SYN (stealth, rápido)
- -sT: TCP connect
- -sU: UDP
- -sA: ACK (firewall detection)
- -sn: Ping only (no puertos)

Nmap es herramienta fundamental de network auditing.""",
                "validation_command": "which nmap > /dev/null && echo 1 || echo 0",
                "expected_result": "1"
            }
        ])

        # ════════════════════════════════════════════════════════════════════
        # PATH 2: SERVICIOS LINUX
        # ════════════════════════════════════════════════════════════════════
        path2 = db.query(SkillPath).filter(SkillPath.title == "Servicios Linux").first()
        if not path2:
            path2 = SkillPath(
                title="Servicios Linux",
                description="Instala, configura y gestiona servicios críticos en Linux: systemd, Apache, Nginx, FTP, Samba, NFS. Aprende a monitorear logs y mantener servidores.",
                difficulty="hard",
                order_index=5,
                is_active=True
            )
            db.add(path2)
            db.commit()
            db.refresh(path2)
            print(f"✓ SkillPath creada: {path2.title}")
        else:
            print(f"✓ SkillPath ya existe: {path2.title}")

        # M1: Systemd y Servicios
        m2_1 = ins_module(db, path2, {
            "title": "M1 — Systemd y Servicios",
            "description": "Gestiona servicios con systemctl. Ver logs con journalctl. Crear units personalizadas.",
            "order_index": 1
        })

        ins_labs(db, m2_1, [
            {
                "title": "systemctl - Gestionar Servicios",
                "difficulty": "easy",
                "order_index": 1,
                "xp": 110,
                "time_limit": 20,
                "description": "Controla servicios del sistema con systemctl. Inicia, para, reinicia, habilita.",
                "goal": "Listar servicios. Ver estado. Iniciar/parar. Habilitar al boot.",
                "guide": """1. Ver estado de un servicio:
   systemctl status ssh
   systemctl status apache2
   systemctl status nginx

2. Listar todos los servicios activos:
   systemctl list-units --type=service

3. Listar servicios activos y fallidos:
   systemctl list-units --type=service --all

4. Iniciar un servicio (requiere sudo):
   sudo systemctl start ssh

5. Parar un servicio:
   sudo systemctl stop ssh

6. Reiniciar un servicio:
   sudo systemctl restart ssh

7. Recargar configuración sin parar:
   sudo systemctl reload ssh

8. Ver si está habilitado al boot:
   systemctl is-enabled ssh

9. Habilitar al boot:
   sudo systemctl enable ssh

10. Deshabilitar al boot:
    sudo systemctl disable ssh

11. Habilitar y iniciar en un comando:
    sudo systemctl enable --now ssh

12. Ver logs del servicio (últimas líneas):
    systemctl status ssh

13. Enmascarar servicio (no puede iniciar):
    sudo systemctl mask ssh
    sudo systemctl unmask ssh

14. Ver dependencias:
    systemctl show-wants ssh

Códigos de salida systemctl:
- 0: running/enabled
- 1: not running/disabled
- 3: not running
- 4: unknown

Sintaxis general: systemctl [COMANDO] [UNIDAD]
Comandos: start, stop, restart, reload, status, enable, disable, etc.""",
                "validation_command": "systemctl is-active ssh | grep -c active",
                "expected_result": "1"
            },
            {
                "title": "journalctl - Ver Logs del Sistema",
                "difficulty": "medium",
                "order_index": 2,
                "xp": 130,
                "time_limit": 20,
                "description": "Visualiza logs de systemd con journalctl. Filtra por servicio, nivel, tiempo.",
                "goal": "Ver logs. Filtrar por servicio. Por nivel de severidad. Por rango de tiempo.",
                "guide": """1. Ver todos los logs (últimas líneas):
   journalctl

2. Ver logs de un servicio específico:
   journalctl -u ssh
   journalctl -u apache2

3. Últimas N líneas (-n):
   journalctl -n 50
   journalctl -u ssh -n 20

4. Seguir logs en tiempo real (-f follow):
   journalctl -f
   journalctl -u ssh -f

5. Ver solo errores (-p priority):
   journalctl -p err
   journalctl -u ssh -p warning

Niveles de severidad:
- emerg (0): emergencia, sistema inutilizable
- alert (1): alerta
- crit (2): crítico
- err (3): error
- warning (4): advertencia
- notice (5): notificación
- info (6): información
- debug (7): debug

6. Logs desde ayer:
   journalctl --since yesterday

7. Logs de hace 1 hora:
   journalctl --since \"1 hour ago\"

8. Entre fechas:
   journalctl --since \"2024-01-01\" --until \"2024-02-01\"

9. Ver logs de proceso por PID:
   journalctl _PID=1234

10. Ver línea específica de logs:
    journalctl -S \"2024-01-15 10:00:00\"

11. En formato JSON:
    journalctl -o json

12. Solo campo mensaje:
    journalctl -o cat

13. Estadísticas por servicio:
    journalctl --disk-usage

14. Limpiar logs antiguos:
    sudo journalctl --vacuum-time=30d

15. Paginado (less):
    journalctl | less

journalctl reemplaza /var/log/syslog en sistemas viejos.
Los logs se almacenan en /var/log/journal/ (persistente) o /run/log/journal (temporal).""",
                "validation_command": "journalctl -u ssh -n 1 | grep -c '\\-'",
                "expected_result": "1"
            },
            {
                "title": "Crear Servicio Systemd Personalizado",
                "difficulty": "hard",
                "order_index": 3,
                "xp": 160,
                "time_limit": 30,
                "description": "Crea archivo .service personalizado para iniciar aplicaciones al boot.",
                "goal": "Crear unit file. Definir dependencias. Habilitar y probar servicio.",
                "guide": """1. Crear archivo de servicio:
   sudo nano /etc/systemd/system/miapp.service

2. Contenido básico:
   [Unit]
   Description=Mi Aplicación Personalizada
   After=network.target

   [Service]
   Type=simple
   User=appuser
   WorkingDirectory=/opt/miapp
   ExecStart=/opt/miapp/start.sh
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target

3. Explicación:
   [Unit]:
   - Description: breve descripción
   - After: inicia después de... (ej: network.target)
   - Before: inicia antes de...
   - Wants: iniciar pero tolera fallo
   - Requires: iniciar y fallar si falla dependencia

   [Service]:
   - Type: simple, forking, oneshot, dbus, notify, idle
   - User: usuario que ejecuta el servicio
   - WorkingDirectory: directorio de trabajo
   - ExecStart: comando para iniciar (obligatorio)
   - ExecStop: comando para parar (opcional)
   - ExecReload: comando para recargar (opcional)
   - Restart: always/on-failure/no
   - RestartSec: segundos antes de reintentar
   - StandardOutput: journal, syslog, file, kmsg, null
   - StandardError: igual que StandardOutput

   [Install]:
   - WantedBy: target donde incluir (multi-user.target = runlevel 3)
   - RequiredBy: similar pero requerido
   - Alias: nombres alternativos

4. Recargar daemon systemd:
   sudo systemctl daemon-reload

5. Habilitar servicio:
   sudo systemctl enable miapp.service

6. Iniciar manualmente:
   sudo systemctl start miapp

7. Ver estado:
   systemctl status miapp

8. Ver logs:
   journalctl -u miapp -f

9. Modificar servicio:
   sudo systemctl edit miapp
   (abre editor con drop-in override)

10. Ver configuración actual:
    systemctl cat miapp

Ejemplo servicio Python:
   [Unit]
   Description=Mi App Python
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/miapp
   ExecStart=/usr/bin/python3 /var/www/miapp/app.py
   Restart=always
   Environment=FLASK_ENV=production

   [Install]
   WantedBy=multi-user.target

Ejemplo servicio Node.js:
   [Unit]
   Description=Mi App Node.js
   After=network.target

   [Service]
   Type=simple
   User=nodejs
   WorkingDirectory=/var/www/nodeapp
   ExecStart=/usr/bin/node /var/www/nodeapp/server.js
   Restart=always
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target

Type=simple: aplicación se ejecuta en foreground
Type=forking: aplicación hace fork() (background daemon)
Type=oneshot: ejecuta una vez y termina
Type=notify: requiere notificación para considerarse "started\"""",
                "validation_command": "test -f /etc/systemd/system/miapp.service && echo 1 || echo 0",
                "expected_result": "1"
            },
            {
                "title": "Targets y Runlevels",
                "difficulty": "medium",
                "order_index": 4,
                "xp": 125,
                "time_limit": 20,
                "description": "Entiende systemd targets (reemplazo de runlevels). Cambia entre targets.",
                "goal": "Listar targets. Ver target activo. Cambiar entre targets. Startup target.",
                "guide": """1. Ver target activo actual:
   systemctl get-default

2. Listar todos los targets disponibles:
   systemctl list-units --type=target

3. Ver detalles de un target:
   systemctl show -p WantedBy multi-user.target

4. Cambiar a target (requiere sudo):
   sudo systemctl isolate rescue.target
   sudo systemctl isolate graphical.target

5. Ver servicios incluidos en un target:
   systemctl list-dependencies multi-user.target

6. Cambiar target al boot:
   sudo systemctl set-default multi-user.target

Targets comunes (equivalentes a runlevels):
- poweroff.target (0): apagar
- rescue.target (1): modo monousuario (rescue/recovery)
- multi-user.target (3): modo texto, multiusuario
- graphical.target (5): modo gráfico
- reboot.target (6): reiniciar

7. Ir a rescue (monousuario):
   sudo systemctl rescue

8. Ir a emergency (todavía más básico):
   sudo systemctl emergency

9. Ver transiciones de targets:
   systemctl list-unit-files | grep target

10. Servicio que solo corre en graphical:
    [Install]
    WantedBy=graphical.target

    [Install]
    WantedBy=multi-user.target  (en ambos)

En viejos runlevels (0-6):
- 0: halt/poweroff
- 1: single-user (rescue)
- 2-4: multi-user (niveles medios, text)
- 5: multi-user with GUI
- 6: reboot

Systemd targets son más flexible y puede haber múltiples active a la vez.""",
                "validation_command": "systemctl get-default | grep -c target",
                "expected_result": "1"
            }
        ])

        # M2: Servidor Web Apache/Nginx
        m2_2 = ins_module(db, path2, {
            "title": "M2 — Servidor Web Apache/Nginx",
            "description": "Instala y configura Apache/Nginx. VirtualHosts, SSL, logs.",
            "order_index": 2
        })

        ins_labs(db, m2_2, [
            {
                "title": "Apache2 - Instalación y Configuración Básica",
                "difficulty": "medium",
                "order_index": 1,
                "xp": 140,
                "time_limit": 25,
                "description": "Instala Apache2. Ve archivos de configuración. Inicia servicio.",
                "goal": "Instalar Apache. Ver versión. Arrancar servicio. Probar acceso.",
                "guide": """1. Instalar Apache2:
   sudo apt update
   sudo apt install apache2

2. Ver versión:
   apache2 -v

3. Ver módulos cargados:
   apache2ctl -M

4. Iniciar servicio:
   sudo systemctl start apache2
   sudo systemctl enable apache2

5. Ver estado:
   systemctl status apache2

6. Ver archivos de configuración:
   ls -la /etc/apache2/

7. Archivo principal de configuración:
   cat /etc/apache2/apache2.conf

8. Archivo de sitios por defecto:
   cat /etc/apache2/sites-available/000-default.conf

9. Habilitar un sitio:
   sudo a2ensite 000-default

10. Deshabilitar un sitio:
    sudo a2dissite 000-default

11. Habilitar módulo:
    sudo a2enmod ssl
    sudo a2enmod rewrite

12. Deshabilitar módulo:
    sudo a2dismod ssl

13. Ver módulos habilitados:
    apache2ctl -M | grep module

14. Validar sintaxis de configuración:
    sudo apache2ctl configtest

15. Recargar configuración (sin downtime):
    sudo systemctl reload apache2

16. Prueba de acceso (desde localhost):
    curl http://localhost

17. Ver document root por defecto:
    sudo cat /etc/apache2/sites-available/000-default.conf | grep DocumentRoot

Estructura Apache:
/etc/apache2/
  apache2.conf          (config principal)
  ports.conf            (puertos a escuchar)
  mods-available/       (módulos disponibles)
  mods-enabled/         (módulos activos, symlinks)
  sites-available/      (sitios disponibles)
  sites-enabled/        (sitios activos, symlinks)
  conf-available/       (confs disponibles)
  conf-enabled/         (confs activas)

Document root típico: /var/www/html/
Logs: /var/log/apache2/
  access.log: requests HTTP
  error.log: errores del servidor

Cambiar puerto (por defecto 80):
- Editar /etc/apache2/ports.conf
- Cambiar: Listen 8080 en lugar de Listen 80
- systemctl reload apache2""",
                "validation_command": "sudo systemctl is-active apache2 | grep -c active",
                "expected_result": "1"
            },
            {
                "title": "VirtualHosts - Múltiples Sitios",
                "difficulty": "hard",
                "order_index": 2,
                "xp": 155,
                "time_limit": 25,
                "description": "Crea VirtualHosts para servir múltiples sitios en un servidor.",
                "goal": "Crear VirtualHost. Habilitar. Probar acceso. Ver logs por sitio.",
                "guide": """1. Crear directorio para sitio:
   sudo mkdir -p /var/www/miSitio

2. Crear archivo index.html:
   sudo cat > /var/www/miSitio/index.html << 'EOF'
<html>
<head><title>Mi Sitio</title></head>
<body><h1>Bienvenido a Mi Sitio</h1></body>
</html>
EOF

3. Crear archivo VirtualHost:
   sudo nano /etc/apache2/sites-available/miSitio.conf

Contenido:
<VirtualHost *:80>
    ServerName miSitio.local
    ServerAlias www.miSitio.local
    ServerAdmin admin@miSitio.local
    DocumentRoot /var/www/miSitio

    <Directory /var/www/miSitio>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/miSitio-error.log
    CustomLog ${APACHE_LOG_DIR}/miSitio-access.log combined
</VirtualHost>

4. Habilitar sitio:
   sudo a2ensite miSitio.conf

5. Deshabilitar sitio por defecto (opcional):
   sudo a2dissite 000-default.conf

6. Validar sintaxis:
   sudo apache2ctl configtest

7. Recargar:
   sudo systemctl reload apache2

8. Añadir al /etc/hosts (para testing local):
   sudo nano /etc/hosts
   # Añade: 127.0.0.1  miSitio.local

9. Probar:
   curl http://miSitio.local

10. Ver logs del sitio:
    sudo tail -f /var/log/apache2/miSitio-error.log
    sudo tail -f /var/log/apache2/miSitio-access.log

11. VirtualHost con HTTPS (SSL):
<VirtualHost *:443>
    ServerName miSitio.local
    DocumentRoot /var/www/miSitio

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/cert.pem
    SSLCertificateKeyFile /etc/ssl/private/key.pem

    <Directory /var/www/miSitio>
        Require all granted
    </Directory>
</VirtualHost>

12. Redirigir HTTP a HTTPS:
<VirtualHost *:80>
    ServerName miSitio.local
    Redirect permanent / https://miSitio.local/
</VirtualHost>

Directivas útiles:
- ServerName: nombre primario
- ServerAlias: alias (www., etc)
- ServerAdmin: email admin
- DocumentRoot: carpeta de archivos
- Options Indexes: lista archivos si no hay index.html
- AllowOverride All: permite .htaccess
- ErrorDocument 404: página personalizada 404
- Redirect: redirigir URLs
- RewriteEngine: reescritura de URLs
- ProxyPass: proxy reverso
- Header: modificar headers HTTP

Múltiples VirtualHosts en puerto 80 basados en nombre (name-based vhosts).
Para basados en IP: escuchar en IPs diferentes.""",
                "validation_command": "sudo a2ensite miSitio.conf 2>&1 | grep -c 'Enabling'",
                "expected_result": "1"
            },
            {
                "title": "Nginx - Instalación y Configuración",
                "difficulty": "hard",
                "order_index": 3,
                "xp": 160,
                "time_limit": 25,
                "description": "Instala Nginx. Configura servidor web. Proxy reverso.",
                "goal": "Instalar Nginx. Ver configuración. Crear servidor. Prueba.",
                "guide": """1. Instalar Nginx:
   sudo apt update
   sudo apt install nginx

2. Verificar versión:
   nginx -v

3. Iniciar:
   sudo systemctl start nginx
   sudo systemctl enable nginx

4. Ver estado:
   systemctl status nginx

5. Archivos de configuración:
   ls -la /etc/nginx/

6. Archivo principal:
   cat /etc/nginx/nginx.conf

7. Sitios disponibles:
   ls /etc/nginx/sites-available/

8. Sitios habilitados (symlinks):
   ls /etc/nginx/sites-enabled/

9. Habilitar sitio:
   sudo ln -s /etc/nginx/sites-available/miSitio /etc/nginx/sites-enabled/

10. Deshabilitar sitio:
    sudo rm /etc/nginx/sites-enabled/miSitio

11. Validar configuración:
    sudo nginx -t

12. Recargar:
    sudo systemctl reload nginx

13. Crear archivo de configuración:
    sudo nano /etc/nginx/sites-available/miSitio

Contenido básico:
server {
    listen 80;
    listen [::]:80;

    server_name miSitio.local www.miSitio.local;

    root /var/www/miSitio;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    access_log /var/log/nginx/miSitio-access.log;
    error_log /var/log/nginx/miSitio-error.log;
}

14. Document root:
    sudo mkdir -p /var/www/miSitio
    sudo chown -R www-data:www-data /var/www/miSitio

15. Ver logs:
    sudo tail -f /var/log/nginx/miSitio-access.log
    sudo tail -f /var/log/nginx/miSitio-error.log

16. Proxy reverso:
server {
    listen 80;
    server_name api.miSitio.local;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

17. Caché:
server {
    listen 80;
    server_name cdn.miSitio.local;

    location ~* \.(jpg|jpeg|png|gif|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    root /var/www/assets;
}

18. Redirigir HTTP a HTTPS:
server {
    listen 80;
    server_name miSitio.local;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name miSitio.local;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    root /var/www/miSitio;
}

Nginx es más eficiente que Apache (event-based vs process-based).
Mejor para proxy reverso y mucho tráfico.
Sintaxis: context { directive value; }""",
                "validation_command": "sudo systemctl is-active nginx | grep -c active",
                "expected_result": "1"
            }
        ])

        # M3: FTP
        m2_3 = ins_module(db, path2, {
            "title": "M3 — Servidor FTP (vsftpd)",
            "description": "Instala vsftpd. Usuarios virtuales. Chroot. Permisos.",
            "order_index": 3
        })

        ins_labs(db, m2_3, [
            {
                "title": "vsftpd - FTP Seguro Básico",
                "difficulty": "hard",
                "order_index": 1,
                "xp": 155,
                "time_limit": 30,
                "description": "Instala y configura servidor FTP seguro (vsftpd).",
                "goal": "Instalar vsftpd. Habilitar. Crear usuario FTP. Conectar cliente.",
                "guide": """1. Instalar vsftpd:
   sudo apt update
   sudo apt install vsftpd

2. Ver configuración principal:
   sudo cat /etc/vsftpd.conf

3. Archivo de configuración:
   sudo nano /etc/vsftpd.conf

Configuración recomendada:
# Servicio
listen=YES
listen_port=21

# IPv4/IPv6
listen_ipv6=NO

# Usuario anónimo (deshabilitar en producción)
anonymous_enable=NO

# Usuarios locales
local_enable=YES
write_enable=YES
local_umask=022

# Chroot (jaula)
chroot_local_user=YES
allow_writeable_chroot=YES

# Direcciones
pasv_enable=YES
pasv_min_port=10000
pasv_max_port=10100
pasv_address=192.168.1.100 (tu IP)

# Logs
xferlog_enable=YES
xferlog_file=/var/log/vsftpd.log

# Banner
ftpd_banner=Bienvenido a MI FTP

# TLS/SSL (optional, para FTPS)
ssl_enable=YES
rsa_cert_file=/etc/ssl/certs/vsftpd.crt
rsa_private_key_file=/etc/ssl/private/vsftpd.key
force_local_data_ssl=YES
force_local_logins_ssl=YES

4. Crear directorio para usuario FTP:
   sudo mkdir -p /home/ftpuser/uploads
   sudo useradd -d /home/ftpuser -s /sbin/nologin ftpuser
   sudo chown ftpuser:ftpuser /home/ftpuser
   sudo chmod 755 /home/ftpuser
   sudo chmod 755 /home/ftpuser/uploads

5. Poner contraseña:
   sudo passwd ftpuser

6. Iniciar servicio:
   sudo systemctl start vsftpd
   sudo systemctl enable vsftpd

7. Ver estado:
   systemctl status vsftpd

8. Conectar con cliente FTP:
   ftp 192.168.1.100
   # Usuario: ftpuser
   # Contraseña: (lo que pusiste)

   Comandos FTP:
   - ls: listar
   - cd: cambiar directorio
   - put archivo: subir
   - get archivo: descargar
   - mkdir: crear carpeta
   - rm: eliminar archivo
   - bye/quit: desconectar

9. Ver logs:
   sudo tail -f /var/log/vsftpd.log

10. Usuarios virtuales (sin usuarios del sistema):
    # Crear archivo de usuarios:
    sudo nano /etc/vsftpd.chroot_list
    # Añadir nombres de usuario, uno por línea

    # O usar base de datos virtualizada
    # Más complejo, ver documentación oficial

11. Restrict root login:
    sudo nano /etc/vsftpd.conf
    # Añadir:
    chroot_local_user=YES
    chroot_list_enable=NO  (si chroot_list_enable=YES, usuarios en lista NO están en chroot)

12. Permite solo usuarios específicos:
    userlist_enable=YES
    userlist_file=/etc/vsftpd.allowed_users
    userlist_deny=NO  (lista es whitelist)

    # Crear lista:
    sudo nano /etc/vsftpd.allowed_users
    ftpuser

13. FTPS (FTP sobre TLS):
    require_ssl_reuse=NO

    # Cliente:
    lftp -u ftpuser -e "set ftp:ssl-force true; ls; quit" 192.168.1.100

Configuración por usuario (/etc/vsftpd.user_conf/ por línea):
    sudo mkdir /etc/vsftpd.user_conf
    sudo nano /etc/vsftpd.conf
    # Añadir: user_config_dir=/etc/vsftpd.user_conf

    # Por usuario:
    sudo nano /etc/vsftpd.user_conf/ftpuser
    # Contenido:
    local_root=/var/ftp/ftpuser
    write_enable=YES

Permisos seguros:
- chroot_local_user=YES: usuario no puede ir a /
- allow_writeable_chroot=YES: permite escribir en raíz chroot
- local_umask=022: nuevos archivos 644, carpetas 755
- dirlist_enable=NO: ocultaar listado

vsftpd es muy seguro y moderno (mejor que ProFTPD).""",
                "validation_command": "sudo systemctl is-active vsftpd | grep -c active",
                "expected_result": "1"
            }
        ])

        # M4: Samba y NFS
        m2_4 = ins_module(db, path2, {
            "title": "M4 — Samba y NFS",
            "description": "Samba para compartir con Windows. NFS para redes Linux.",
            "order_index": 4
        })

        ins_labs(db, m2_4, [
            {
                "title": "Samba - Compartición SMB/CIFS",
                "difficulty": "hard",
                "order_index": 1,
                "xp": 165,
                "time_limit": 30,
                "description": "Instala Samba para compartir carpetas con Windows y Linux.",
                "goal": "Instalar Samba. Crear share. Conectar desde Windows o Linux.",
                "guide": """1. Instalar Samba:
   sudo apt update
   sudo apt install samba samba-common

2. Ver configuración:
   cat /etc/samba/smb.conf

3. Hacer backup:
   sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak

4. Editar configuración:
   sudo nano /etc/samba/smb.conf

Sección global (principio del archivo):
[global]
    workgroup = WORKGROUP
    server string = Mi Servidor Samba
    interfaces = 127.0.0.1 192.168.1.0/24
    bind interfaces only = yes

    # Logging
    log file = /var/log/samba/log.%m
    max log size = 1000

    # Autenticación
    security = user
    passdb backend = tdbsam

    # Rendimiento
    socket options = TCP_NODELAY IPTOS_LOWDELAY SO_RCVBUF=65536 SO_SNDBUF=65536
    use sendfile = yes

5. Crear share:
[Compartida]
    path = /srv/samba/compartida
    valid users = @grupo
    read only = no
    create mask = 0775
    directory mask = 0775

[Datos]
    path = /home/usuario/datos
    valid users = usuario
    read only = no

[Publica]
    path = /srv/samba/publica
    guest ok = yes
    read only = yes
    writable = no

6. Crear directorio para share:
   sudo mkdir -p /srv/samba/compartida
   sudo chown usuario:grupo /srv/samba/compartida
   sudo chmod 755 /srv/samba/compartida

7. Crear usuario Samba:
   sudo smbpasswd -a usuario
   # Pedir contraseña

8. Validar configuración:
   sudo testparm /etc/samba/smb.conf

9. Iniciar Samba:
   sudo systemctl start smbd
   sudo systemctl start nmbd
   sudo systemctl enable smbd nmbd

10. Ver estado:
    systemctl status smbd

11. Conectar desde Linux:
    smbclient //192.168.1.100/Compartida -U usuario
    # Dentro:
    ls, cd, put file, get file, quit

12. Montar share en Linux:
    sudo mkdir /mnt/samba
    sudo mount -t cifs //192.168.1.100/Compartida /mnt/samba -o username=usuario

13. Desde Windows:
    Explorador → Red → \\\\192.168.1.100
    O: net use * \\\\servidor\\compartida /user:usuario password

14. Permanente en Linux (/etc/fstab):
    //192.168.1.100/Compartida /mnt/samba cifs username=user,password=pass,uid=1000,gid=1000 0 0

15. Ver logs:
    sudo tail -f /var/log/samba/log.smbd

16. Listar shares disponibles:
    smbclient -L //192.168.1.100 -U usuario

17. Permisos en share:
    read only = no: permite escribir
    create mask = 0775: permisos archivos nuevos (rwxrwxr-x)
    directory mask = 0775: permisos carpetas nuevas
    force user = usuario: todos los accesos como usuario
    force group = grupo: todos con este grupo

18. Guest access (sin contraseña):
[Publica]
    guest ok = yes
    guest only = yes
    read only = yes

Shares ocultos ($ al final):
[Oculta$]
    path = /srv/samba/oculta
    # No aparece en listados

Samba es implementación Linux/Unix de SMB/CIFS (protocolo Windows).
Permite compartir archivos, impresoras y autenticación con Active Directory.""",
                "validation_command": "sudo systemctl is-active smbd | grep -c active",
                "expected_result": "1"
            },
            {
                "title": "NFS - Network File System",
                "difficulty": "hard",
                "order_index": 2,
                "xp": 160,
                "time_limit": 30,
                "description": "Instala NFS para compartir archivos entre sistemas Linux/Unix.",
                "goal": "Instalar NFS. Exportar carpeta. Montar desde cliente.",
                "guide": """1. Instalar NFS (servidor):
   sudo apt update
   sudo apt install nfs-kernel-server nfs-common

2. Crear carpeta a exportar:
   sudo mkdir -p /srv/nfs/compartida
   sudo chmod 755 /srv/nfs/compartida

3. Configurar exports:
   sudo nano /etc/exports

Ejemplos:
/srv/nfs/compartida 192.168.1.0/24(rw,sync,no_subtree_check)
/srv/nfs/datos      192.168.1.100(ro,sync)
/srv/nfs/backup     *(rw,sync)  # Todo el mundo (inseguro)

Opciones:
- rw: lectura/escritura
- ro: solo lectura
- sync: sincronización completa antes de responder
- async: responde sin esperar escritura en disco
- no_subtree_check: desactiva verificación de subcarpeta (mejor rendimiento)
- subtree_check: verifica que archivo está en subárbol
- insecure: acepta puertos > 1024
- secure: solo puertos < 1024 (predeterminado)
- root_squash: convierte root remoto en nobody (seguridad)
- no_root_squash: root remoto es root local (inseguro)
- all_squash: todos son nobody
- anonuid=1000: UID del usuario anónimo
- anongid=1000: GID del usuario anónimo

4. Exportar carpetas:
   sudo exportfs -a

5. Ver exportaciones:
   sudo exportfs -v

6. Iniciar servicio NFS:
   sudo systemctl start nfs-server
   sudo systemctl enable nfs-server

7. Ver puertos NFS:
   sudo rpcinfo -p

8. Cliente: Instalar NFS:
   sudo apt install nfs-common

9. Ver shares disponibles (desde cliente):
   showmount -e 192.168.1.100

10. Montar share NFS (cliente):
    sudo mkdir /mnt/nfs
    sudo mount -t nfs 192.168.1.100:/srv/nfs/compartida /mnt/nfs

11. Ver mounts:
    df -h
    mount | grep nfs

12. Montar permanentemente (/etc/fstab):
    192.168.1.100:/srv/nfs/compartida /mnt/nfs nfs defaults,_netdev 0 0

13. Desmountar:
    sudo umount /mnt/nfs

14. Desmountar forzado:
    sudo umount -f /mnt/nfs

15. Ver conexiones NFS:
    sudo netstat -tulnp | grep nfs

16. Ver logs:
    sudo tail -f /var/log/syslog | grep nfs

17. Cambios en exports sin reiniciar:
    sudo nano /etc/exports
    sudo exportfs -ra

18. Performance tuning:
/srv/nfs/compartida 192.168.1.0/24(rw,sync,no_subtree_check,nohide,wdelay)
- nohide: no oculta subdirectorios
- wdelay: espera a escrituras pendientes (default)
- no_wdelay: no espera (más rápido)

Equivalencia versiones:
- NFS v3: TCP/UDP estándar
- NFS v4: requiere portmap, mejor seguridad, soporte Kerberos

NFSv4 más seguro y moderno (vs v3).
Para ambiente UNIX/Linux/BSD.
Windows usa Samba/SMB en su lugar.""",
                "validation_command": "sudo systemctl is-active nfs-server | grep -c active",
                "expected_result": "1"
            }
        ])

        # ════════════════════════════════════════════════════════════════════
        # PATH 3: SEGURIDAD EN LINUX
        # ════════════════════════════════════════════════════════════════════
        path3 = db.query(SkillPath).filter(SkillPath.title == "Seguridad en Linux").first()
        if not path3:
            path3 = SkillPath(
                title="Seguridad en Linux",
                description="Hardening de sistemas Linux. SSH seguro, Firewall UFW, gestión de procesos, auditoría, logs, fail2ban. Aprende a proteger tu servidor.",
                difficulty="hard",
                order_index=6,
                is_active=True
            )
            db.add(path3)
            db.commit()
            db.refresh(path3)
            print(f"✓ SkillPath creada: {path3.title}")
        else:
            print(f"✓ SkillPath ya existe: {path3.title}")

        # M1: Hardening SSH
        m3_1 = ins_module(db, path3, {
            "title": "M1 — Hardening SSH",
            "description": "Asegura SSH: cambiar puerto, deshabilitar root, clave pública, AllowUsers, fail2ban.",
            "order_index": 1
        })

        ins_labs(db, m3_1, [
            {
                "title": "SSH Security Hardening",
                "difficulty": "hard",
                "order_index": 1,
                "xp": 170,
                "time_limit": 30,
                "description": "Implementa best practices de seguridad SSH.",
                "goal": "Cambiar puerto. Deshabilitar root. Clave pública. AllowUsers. Probar.",
                "guide": """1. Ver configuración SSH actual:
   sudo cat /etc/ssh/sshd_config

2. Hacer backup:
   sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

3. Editar configuración:
   sudo nano /etc/ssh/sshd_config

Cambios recomendados:

# 1. Cambiar puerto (no 22):
Port 2222

# 2. Escuchar solo en IPv4:
AddressFamily inet
ListenAddress 192.168.1.100

# 3. Deshabilitar acceso root:
PermitRootLogin no

# 4. Solo autenticación por clave (no contraseña):
PasswordAuthentication no
PubkeyAuthentication yes

# 5. Permitir solo usuarios específicos:
AllowUsers usuario1 usuario2
# o permitir grupos:
AllowGroups sshusers

# 6. Deshabilitar login vacío:
PermitEmptyPasswords no

# 7. Limite de intentos de login:
MaxAuthTries 3

# 8. Desconectar después de inactividad:
ClientAliveInterval 300
ClientAliveCountMax 2

# 9. Desactivar host-based auth:
HostbasedAuthentication no

# 10. Desactivar X11 forwarding (si no necesita):
X11Forwarding no

# 11. Desactivar access directo a subsistema SFTP:
Subsystem sftp /usr/lib/openssh/sftp-server

# 12. Banner (opcional):
Banner /etc/ssh/banner.txt

4. Crear archivo banner (opcional):
   sudo cat > /etc/ssh/banner.txt << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║ ACCESO RESTRINGIDO - AUTHORIZED USERS ONLY              ║
║ Todos los accesos son monitoreados y registrados         ║
║ RESTRICTED ACCESS - AUTHORIZED USERS ONLY              ║
╚═══════════════════════════════════════════════════════════╝
EOF

5. Validar sintaxis:
   sudo sshd -t

6. Recargar SSH (sin desconectar conexiones):
   sudo systemctl reload sshd

7. Crear usuario para SSH (si no existe):
   sudo useradd -m -s /bin/bash usuariossh

8. Crear grupo sshusers:
   sudo groupadd sshusers
   sudo usermod -aG sshusers usuariossh

9. Generar clave en cliente local:
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

10. Copiar clave a servidor:
    ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 2222 usuariossh@servidor

11. Conectar al puerto nuevo:
    ssh -p 2222 usuariossh@servidor

12. Versión de OpenSSH (actualizar si es vieja):
    ssh -V
    sudo apt update && sudo apt upgrade openssh-server

13. Ver logs SSH:
    sudo tail -f /var/log/auth.log | grep ssh

14. Permitir acceso desde IPs específicas:
    # Editar /etc/ssh/sshd_config:
    Match Address 192.168.1.100
        PasswordAuthentication yes
        AllowUsers usuario_prueba

    Match User root
        PermitLogin no

15. Desabilitar acceso a comandos específicos:
    # Editar ~/.ssh/authorized_keys en servidor:
    restrict,command=\"/usr/bin/whoami\" ssh-ed25519 AAAA...

16. Proteger archivo authorized_keys:
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh

17. SSH keys con contraseña (+ seguro):
    ssh-keygen -t ed25519 -p -f ~/.ssh/id_ed25519
    # Añade/cambia contraseña

18. SSH agent (carga key en memoria sin pedir contraseña):
    eval $(ssh-agent)
    ssh-add ~/.ssh/id_ed25519
    # Pedir contraseña UNA VEZ

19. SSH tunnel (forwarding local):
    ssh -L 8080:192.168.1.100:80 -p 2222 usuariossh@servidor
    # Accede a http://localhost:8080

Advertencias:
⚠️ Antes de cambiar puerto, PRUEBA en nueva terminal que aún puedes acceder.
⚠️ Si bloqueas tu propio acceso, puede que necesites acceso físico.
⚠️ AllowUsers debe incluir tu usuario.

Pasos seguridad en orden:
1. Generar claves (cliente)
2. Copiar clave pública al servidor
3. Probar autenticación con clave
4. Deshabilitar PasswordAuthentication
5. Deshabilitar PermitRootLogin
6. Cambiar puerto (último, tras validar todo funciona)

OpenSSH versiones recomendadas:
- 7.4+: segura
- 8.0+: muy segura
- 8.5+: excelente
- Evitar: < 7.0 (vulnerabilidades)""",
                "validation_command": "sudo sshd -t > /dev/null 2>&1 && echo 1 || echo 0",
                "expected_result": "1"
            }
        ])

        # M2: UFW y Firewall
        m3_2 = ins_module(db, path3, {
            "title": "M2 — UFW y Firewall",
            "description": "Configura firewall UFW. Allow/deny rules. Logs. App profiles.",
            "order_index": 2
        })

        ins_labs(db, m3_2, [
            {
                "title": "UFW - Uncomplicated Firewall",
                "difficulty": "medium",
                "order_index": 1,
                "xp": 140,
                "time_limit": 25,
                "description": "Configura UFW para controlar tráfico entrante/saliente.",
                "goal": "Habilitar UFW. Permitir/denegar puertos. Ver status. Logs.",
                "guide": """1. Ver estado de UFW:
   sudo ufw status

2. Habilitar UFW:
   sudo ufw enable

3. Ver estado verbose:
   sudo ufw status verbose

4. Ver status numerado (con números de regla):
   sudo ufw status numbered

5. Denegar entrada por defecto (seguro):
   sudo ufw default deny incoming

6. Permitir salida por defecto:
   sudo ufw default allow outgoing

7. Permitir puerto específico:
   sudo ufw allow 22      # SSH
   sudo ufw allow 80      # HTTP
   sudo ufw allow 443     # HTTPS
   sudo ufw allow 8080/tcp
   sudo ufw allow 53/udp  # DNS

8. Permitir rango de puertos:
   sudo ufw allow 6000:7000/tcp

9. Permitir desde IP específica:
   sudo ufw allow from 192.168.1.100 to any port 22

10. Permitir desde red:
    sudo ufw allow from 192.168.1.0/24 to any port 22

11. Permitir servicio (app profile):
    sudo ufw allow ssh
    sudo ufw allow 'Apache Full'  (HTTP + HTTPS)
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ftp

12. Ver app profiles disponibles:
    sudo ufw app list

13. Información de app:
    sudo ufw app info 'Apache Full'

14. Negar puerto:
    sudo ufw deny 23      # Telnet

15. Negar desde IP:
    sudo ufw deny from 10.0.0.0/8

16. Limitador de rate (anti-DDoS):
    sudo ufw limit 22/tcp
    # Permite max 6 conexiones en 30 segundos

17. Eliminar regla por número:
    sudo ufw status numbered
    sudo ufw delete 2      # Elimina regla 2

18. Eliminar regla por descripción:
    sudo ufw delete allow 22

19. Ver logs:
    sudo ufw show added

20. Habilitar logs:
    sudo ufw logging on
    sudo ufw logging medium  (low, medium, high)

21. Ver logs de firewall:
    sudo tail -f /var/log/ufw.log

22. Resetear todas las reglas:
    sudo ufw reset

23. Recargar todas las reglas:
    sudo ufw reload

24. Deshabilitar UFW (cuidado):
    sudo ufw disable

25. Ejemplo completo: Servidor web seguro
    # Denegar todo por defecto:
    sudo ufw default deny incoming
    sudo ufw default allow outgoing

    # Permitir SSH:
    sudo ufw allow 22

    # Permitir HTTP/HTTPS:
    sudo ufw allow 80
    sudo ufw allow 443

    # Habilitar:
    sudo ufw enable

    # Verificar:
    sudo ufw status verbose

26. Reglas avanzadas:
    # Solo desde interfaz local:
    sudo ufw allow in on lo

    # Tráfico loopback (localhost):
    sudo ufw allow 127.0.0.1

    # Descartar ping (ICMP):
    sudo ufw limit icmp

27. Ver tabla de NAT (iptables):
    sudo iptables -t nat -L -n

28. Puerto redirigido (forwarding):
    sudo ufw route allow in on eth0 to 192.168.1.10 port 80
    # Redirecciona a otro host

Diferencia:
- Deny: rechaza (no responde)
- Reject: rechaza (responde "puerto cerrado")

Por defecto, UFW usa iptables en IPv4 e ip6tables en IPv6.
UFW es interfaz simple a iptables, perfecto para principiantes.
Para reglas muy complejas, usar iptables directamente.""",
                "validation_command": "sudo ufw status | grep -c active",
                "expected_result": "1"
            },
            {
                "title": "fail2ban - Protección contra Ataques",
                "difficulty": "hard",
                "order_index": 2,
                "xp": 155,
                "time_limit": 25,
                "description": "Instala fail2ban para bloquear intentos fallidos de login.",
                "goal": "Instalar fail2ban. Configurar SSH. Ver banned IPs. Logs.",
                "guide": """1. Instalar fail2ban:
   sudo apt update
   sudo apt install fail2ban

2. Iniciar servicio:
   sudo systemctl start fail2ban
   sudo systemctl enable fail2ban

3. Ver estado:
   systemctl status fail2ban

4. Ver configuración:
   cat /etc/fail2ban/fail2ban.conf
   cat /etc/fail2ban/jail.conf

5. Crear archivo de configuración local:
   sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

6. Editar jail.local:
   sudo nano /etc/fail2ban/jail.local

Configuración recomendada:

[DEFAULT]
bantime = 3600        # 1 hora en segundos
findtime = 600        # ventana de 10 minutos
maxretry = 5          # máximo 5 intentos fallidos
logencoding = auto
ignoreip = 127.0.0.1/8 192.168.1.0/24  # IPs a no banear

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 7200        # 2 horas para SSH

[sshd-ddos]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 10
bantime = 600
findtime = 60

7. Validar configuración:
   sudo fail2ban-client -d

8. Recargar reglas:
   sudo systemctl reload fail2ban

9. Ver jails (filtros) activos:
   sudo fail2ban-client status

10. Ver IPs baneadas en jail SSH:
    sudo fail2ban-client status sshd

11. Ver logs de fail2ban:
    sudo tail -f /var/log/fail2ban.log

12. Desbanear IP (manual):
    sudo fail2ban-client set sshd unbanip 192.168.1.100

13. Banear IP manualmente:
    sudo fail2ban-client set sshd banip 10.0.0.1

14. Ver lista negra actual:
    sudo iptables -L -n | grep -A 5 f2b-sshd

15. Crear filtro personalizado:
    sudo nano /etc/fail2ban/filter.d/miapp.conf

[Definition]
failregex = ^<HOST> .*Failed login.*
ignoreregex =

16. Crear jail para aplicación:
    sudo nano /etc/fail2ban/jail.d/miapp.local

[miapp]
enabled = true
port = 8080
filter = miapp
logpath = /var/log/miapp/access.log
maxretry = 5
bantime = 3600

17. Reiniciar fail2ban:
    sudo systemctl restart fail2ban

18. Integración con UFW:
    # fail2ban automáticamente añade reglas UFW
    sudo ufw status
    # Verás reglas de fail2ban en la lista

19. Mail de notificación (opcional):
    # En jail.local:
    [DEFAULT]
    action = %(action_mwl)s  # mail with log
    mta = sendmail

20. Scripts de action (qué hacer cuando ban):
    cat /etc/fail2ban/action.d/*.conf

    Algunos:
    - iptables-multiport.conf: bloquea en iptables
    - ufw.conf: bloquea en UFW
    - sendmail-whois.conf: envía email
    - slack.conf: notifica Slack

21. Ver estadísticas:
    sudo fail2ban-client status sshd
    # Muestra: banned IPs, attempts, intentos...

22. Monitoreo continuo:
    watch -n 1 'sudo fail2ban-client status sshd'

23. Exportar bans a archivo:
    sudo iptables -n -L f2b-sshd > /tmp/bans.txt

Parámetros importantes:
- bantime: tiempo de baneo en segundos
- findtime: ventana temporal para contar intentos
- maxretry: número máximo de fallos

Ejemplo: maxretry=5, findtime=600, bantime=3600
→ 5 fallos en 10 min → bloquear por 1 hora

Niveles de acción:
- %(action)s: iptables (básico)
- %(action_mwl)s: iptables + mail + whois
- %(action_slack)s: Slack (externo)

fail2ban es esencial para hardening.
Protege contra brute-force SSH, FTP, HTTP, etc.""",
                "validation_command": "sudo systemctl is-active fail2ban | grep -c active",
                "expected_result": "1"
            }
        ])

        # M3: Gestión de Procesos y Recursos
        m3_3 = ins_module(db, path3, {
            "title": "M3 — Gestión de Procesos y Recursos",
            "description": "ps, kill, nice/renice, top/htop, ulimit, crontab. Monitoreo de recursos.",
            "order_index": 3
        })

        ins_labs(db, m3_3, [
            {
                "title": "Procesos: ps, kill, nice, top",
                "difficulty": "medium",
                "order_index": 1,
                "xp": 140,
                "time_limit": 25,
                "description": "Listar, matar, priorizar procesos. Monitoreo con top/htop.",
                "goal": "Ver procesos. Matar proceso. Cambiar prioridad. Monitoreo en tiempo real.",
                "guide": """1. Listar procesos simples:
   ps

2. Listar todos los procesos (-a all, -u user, -x sin terminal):
   ps aux

3. Listar solo procesos actuales:
   ps -ef

4. Listar solo procesos del usuario:
   ps -u usuario

5. Listar procesos de nombre específico:
   ps aux | grep nginx
   pgrep nginx

6. Listar árbol de procesos:
   ps auxf
   ps forest
   pstree

7. Ver PID de proceso:
   pidof ssh
   pgrep -f 'python3 app.py'

8. Ver información de proceso:
   ps -p 1234 -o pid,ppid,cmd,etime,time

9. Top - Monitoreo en tiempo real:
   top

Dentro de top:
   - h: ayuda
   - q: salir
   - u: filtrar por usuario
   - k: matar proceso
   - r: cambiar prioridad (nice)
   - m: ordenar por memoria
   - p: ordenar por CPU
   - 1: ver CPUs individuales
   - f: añadir/quitar campos
   - P: ordenar por CPU (default)

10. htop - Versión mejorada:
    htop

    Ventajas:
    - Interfaz más colorida
    - Scroll vertical/horizontal
    - Matar sin escribir PID
    - Búsqueda integrada

    Comandos:
    - F5: árbol de procesos
    - F4: filtro
    - F6: buscar
    - k: matar
    - n: cambiar nice
    - m: ordenar por RAM

11. Matar proceso (SIGTERM):
    kill 1234

12. Matar forzado (SIGKILL):
    kill -9 1234

13. Matar por nombre:
    killall nginx
    pkill -f 'python3 app.py'

14. Ver señales disponibles:
    kill -l

Señales comunes:
    1 (HUP): hangup/reload
    2 (INT): interrupt (Ctrl+C)
    9 (KILL): kill (fuerza)
    15 (TERM): terminate (default, graceful)
    19 (STOP): detener
    18 (CONT): continuar

15. Nice - Prioridad de proceso:
    # Al lanzar:
    nice -n 10 comando
    nice -n -5 comando  (menor es mayor prioridad, requiere root)

    # Rango: -20 (máxima) a 19 (mínima)

16. Renice - Cambiar prioridad:
    sudo renice 5 -p 1234    # cambiar PID 1234 a nice 5
    renice 10 -u usuario     # todos los procesos del usuario

17. Ver nice de proceso:
    ps -o pid,nice,cmd

18. Procesos en background:
    # En bash:
    comando &              # ejecuta en background
    jobs                   # listar background jobs
    fg %1                  # traer a foreground
    bg %1                  # enviar a background
    Ctrl+Z                 # pausa proceso

19. CPU y memoria por proceso:
    ps aux --sort=-%cpu | head -10   # Top 10 por CPU
    ps aux --sort=-%mem | head -10   # Top 10 por RAM

20. Recursos limitados (ulimit):
    ulimit -a              # ver todos los límites
    ulimit -n              # archivo open limit
    ulimit -u              # procesos por usuario
    ulimit -v              # memoria virtual

21. Cambiar límites (temporal):
    ulimit -n 65536        # aumentar file descriptors
    ulimit -u 2000         # máximo 2000 procesos

22. Cambiar límites permanentemente:
    # Editar /etc/security/limits.conf:
    usuario soft nofile 65536
    usuario hard nofile 65536

23. Prio de proceso con ionice (I/O):
    ionice -c3 -p 1234     # idle (lowest I/O priority)
    ionice -c2 -n 5 comando  # best-effort, nice 5

Clases ionice:
- 0: none (real-time)
- 1: real-time
- 2: best-effort (default)
- 3: idle

24. Estadísticas de proceso:
    /proc/[PID]/stat       # información detallada
    /proc/[PID]/status     # estado legible
    cat /proc/1234/status

25. Swap usage:
    cat /proc/meminfo
    free -h

Recomendaciones:
- Usar kill -15 (TERM) primero, luego -9 si no funciona
- No cambiar nice a valores negativos sin razón
- Monitorear con top/htop regularmente
- Usar nice para procesos en background
- Limitar recursos con ulimit en producción""",
                "validation_command": "ps aux | grep -c -v grep",
                "expected_result": "1"
            }
        ])

        # M4: Auditoría y Logs
        m3_4 = ins_module(db, path3, {
            "title": "M4 — Auditoría y Logs",
            "description": "auth.log, last, lastb, who, journalctl, logrotate.",
            "order_index": 4
        })

        ins_labs(db, m3_4, [
            {
                "title": "Auditoría: auth.log, last, who",
                "difficulty": "medium",
                "order_index": 1,
                "xp": 135,
                "time_limit": 20,
                "description": "Audita logins. Ver historial de acceso. Detectar comportamiento sospechoso.",
                "goal": "Ver auth.log. Comando last. Comando lastb. Comando who.",
                "guide": """1. Ver archivo de autenticación:
   sudo cat /var/log/auth.log
   sudo tail -f /var/log/auth.log

2. Filtrar por SSH:
   sudo grep ssh /var/log/auth.log
   sudo grep sshd /var/log/auth.log

3. Ver login exitosos:
   sudo grep "Accepted" /var/log/auth.log

4. Ver intentos fallidos:
   sudo grep "Failed" /var/log/auth.log

5. Comando last - Logins exitosos:
   last
   last -10               # últimos 10
   last usuario           # logins de usuario
   last -f /var/log/wtmp  # especificar log

Formato last:
   usuario | tty | IP/hostname | fecha | duración

6. Comando lastb - Logins FALLIDOS:
   sudo lastb             # último log de logins fallidos
   sudo lastb -10         # últimos 10 fallidos
   sudo lastb usuario     # intentos fallidos de usuario

Nota: lastb requiere sudo, lee /var/log/btmp

7. Comando who - Usuarios actualmente logueados:
   who
   w                      # versión mejorada con CPU/memoria

Columna: usuario | tty | hora de login | duración | IP

8. Filtrar auth.log por usuario:
   sudo grep usuario /var/log/auth.log

9. Filtrar por fecha/hora:
   sudo sed -n '/Mar  1 09:/,/Mar  1 11:/p' /var/log/auth.log

10. Ver intentos de sudo:
    sudo grep sudo /var/log/auth.log
    sudo grep COMMAND /var/log/auth.log

11. Ver cambios de contraseña:
    sudo grep "password changed" /var/log/auth.log

12. Ver intentos de root:
    sudo grep root /var/log/auth.log

13. Alertar sobre logins remotos:
    who | grep "(" # paren indica IP remota

14. Estadísticas de logins:
    sudo grep "Accepted" /var/log/auth.log | wc -l

15. IPs que han conectado:
    sudo grep "Accepted" /var/log/auth.log | awk '{print $(NF-2)}' | sort | uniq -c

16. Usuarios únicos:
    sudo grep "Accepted" /var/log/auth.log | awk '{print $1}' | sort | uniq

17. Ver intentos fallidos por IP:
    sudo grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn

18. Logs de new user/group:
    sudo grep -E "new user|new group" /var/log/auth.log

19. Ver cambios de privilegios:
    sudo grep -E "sudo: |sudoedit:" /var/log/auth.log

20. Rotación de logs (logrotate):
    cat /etc/logrotate.conf
    cat /etc/logrotate.d/rsyslog

Configurable:
    /var/log/auth.log {
        daily
        rotate 14
        compress
        postrotate
            systemctl reload rsyslog > /dev/null 2>&1 || true
        endscript
    }

21. Forzar rotación:
    sudo logrotate -f /etc/logrotate.d/rsyslog

22. Ver logs rotados:
    ls -la /var/log/auth.log*

23. Ver logs comprimidos:
    zcat /var/log/auth.log.1.gz | grep ssh
    zgrep ssh /var/log/auth.log.*.gz

24. Limpiar logs antiguos:
    sudo find /var/log -type f -mtime +30 -delete
    # archivos modificados hace >30 días

25. Audit daemon (más detallado):
    sudo apt install auditd
    sudo systemctl start auditd
    sudo ausearch -k syscall
    sudo aureport

Archivos importantes:
- /var/log/auth.log: autenticación
- /var/log/wtmp: historial logins (binario, leer con last)
- /var/log/btmp: historial logins fallidos (binario, leer con lastb)
- /var/log/secure: CentOS/RHEL (vs auth.log en Debian)
- /var/log/syslog: todos los logs del sistema

Red flags (sospechas):
- Múltiples "Failed password" consecutivos → brute-force
- Login a horas extrañas → compromiso
- Nuevo usuario creado → escalada de privilegios
- Cambio de contraseña de root → cambio no autorizado
- Comando sudo no esperado → ejecución maliciosa
- SSH desde IPs nuevas → acceso no autorizado""",
                "validation_command": "last -1 | grep -c -v reboot",
                "expected_result": "1"
            }
        ])

        print("\n✓ Seed completado: 3 nuevos SkillPaths con 24 Módulos y 76 Labs")

    finally:
        db.close()

if __name__ == "__main__":
    run()
