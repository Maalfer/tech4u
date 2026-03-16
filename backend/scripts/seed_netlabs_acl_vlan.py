"""
seed_netlabs_acl_vlan.py
═══════════════════════════════════════════════════════════════════════════════
NetLabs — ACL & VLAN Skill Lab Exercises
═══════════════════════════════════════════════════════════════════════════════
Adds drag & drop exercises (SkillLabExercise) for:
  • ACL Estándar (numeradas y nombradas)
  • ACL Extendida (numeradas y nombradas)
  • VLANs: creación, asignación de puertos, modos trunk/access
  • Trunking 802.1Q y VTP
  • Inter-VLAN Routing (Router-on-a-Stick y SVI)
  • Port Security
  • Verificación y troubleshooting

Subject: "redes"
Difficulty: easy / medium / hard

Usage:
    cd /path/to/backend
    python scripts/seed_netlabs_acl_vlan.py
═══════════════════════════════════════════════════════════════════════════════
"""

import json
import os
import sys

# Ensure the backend root is in the path so 'database' can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://tech4u_admin:tech4u_admin@localhost:5432/tech4u")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─────────────────────────────────────────────────────────────────────────────
# EXERCISE DATA
# ─────────────────────────────────────────────────────────────────────────────

EXERCISES = [

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 1 — ACL ESTÁNDAR (easy)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Las ACLs estándar en Cisco filtran el tráfico basándose únicamente en la dirección IP de [BLANK].",
        "correct_answers": ["origen"],
        "distractors": ["destino", "subred", "protocolo", "puerto"],
        "explanation": "Las ACLs estándar (1-99 y 1300-1999) solo examinan la IP de origen del paquete, a diferencia de las extendidas que también filtran por destino y protocolo."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "El rango de números reservados para las ACLs estándar en Cisco IOS es del [BLANK] al 99.",
        "correct_answers": ["1"],
        "distractors": ["0", "10", "100", "50"],
        "explanation": "Las ACLs estándar numeradas utilizan los rangos 1-99 y 1300-1999 en Cisco IOS."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Para aplicar una ACL a una interfaz se usa el comando [BLANK] access-group.",
        "correct_answers": ["ip"],
        "distractors": ["show", "access", "interface", "permit"],
        "explanation": "El comando completo es: ip access-group <número_ACL> {in|out}, aplicado en modo de configuración de interfaz."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Al final de toda ACL en Cisco existe de forma implícita una sentencia [BLANK] any.",
        "correct_answers": ["deny"],
        "distractors": ["permit", "block", "drop", "reject"],
        "explanation": "El 'deny any' implícito descarta todo el tráfico que no coincida con ninguna regla anterior de la ACL. Si no hay ningún permit, todo el tráfico será bloqueado."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "El comando para verificar las ACLs configuradas en un router Cisco es show ip [BLANK].",
        "correct_answers": ["access-lists"],
        "distractors": ["acl", "filters", "rules", "policies"],
        "explanation": "El comando 'show ip access-lists' muestra todas las ACLs con sus sentencias y contadores de coincidencias."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "La palabra clave [BLANK] en una ACL equivale a la wildcard 0.0.0.0, representando un host específico.",
        "correct_answers": ["host"],
        "distractors": ["any", "all", "exact", "single"],
        "explanation": "Usar 'host 192.168.1.10' es equivalente a escribir '192.168.1.10 0.0.0.0'. Significa exactamente esa dirección IP."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "La palabra clave [BLANK] en una ACL equivale a 0.0.0.0 255.255.255.255, representando cualquier dirección IP.",
        "correct_answers": ["any"],
        "distractors": ["all", "host", "default", "global"],
        "explanation": "Usar 'any' como origen o destino en una ACL hace coincidir cualquier dirección IP del universo."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Las ACLs estándar deben aplicarse lo más [BLANK] posible al destino del tráfico que se desea filtrar.",
        "correct_answers": ["cerca"],
        "distractors": ["lejos", "distante", "alejadas", "separadas"],
        "explanation": "Buena práctica: las ACLs estándar se colocan cerca del destino porque solo filtran por IP de origen. Si se colocaran cerca del origen, podrían bloquear tráfico hacia otras redes destino."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 2 — ACL EXTENDIDA (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Las ACLs extendidas filtran el tráfico usando IP de origen, IP de destino, protocolo y número de [BLANK].",
        "correct_answers": ["puerto"],
        "distractors": ["VLAN", "interfaz", "máscara", "dominio"],
        "explanation": "Las ACLs extendidas ofrecen un filtrado mucho más granular: permiten especificar protocolo (TCP, UDP, ICMP...) y puertos de origen/destino."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El rango de números para las ACLs extendidas en Cisco IOS comienza en el [BLANK] y llega hasta el 199.",
        "correct_answers": ["100"],
        "distractors": ["1", "50", "200", "101"],
        "explanation": "Las ACLs extendidas numeradas usan los rangos 100-199 y 2000-2699 en Cisco IOS."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Para crear una ACL extendida nombrada se usa el comando ip access-list [BLANK] NOMBRE.",
        "correct_answers": ["extended"],
        "distractors": ["standard", "named", "advanced", "filtered"],
        "explanation": "Ejemplo: 'ip access-list extended BLOQUEAR_HTTP' crea una ACL extendida llamada BLOQUEAR_HTTP donde se pueden añadir sentencias permit/deny."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Las ACLs extendidas deben aplicarse lo más [BLANK] posible al origen del tráfico para evitar que recorra la red innecesariamente.",
        "correct_answers": ["cerca"],
        "distractors": ["lejos", "distante", "separadas", "alejadas"],
        "explanation": "Buena práctica: las ACLs extendidas van cerca del origen. Dado que filtran por origen Y destino, pueden aplicarse con precisión sin bloquear otro tráfico legítimo."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "En una ACL extendida, para filtrar el tráfico web HTTP se especifica el protocolo [BLANK] y el puerto 80.",
        "correct_answers": ["tcp"],
        "distractors": ["udp", "icmp", "ip", "http"],
        "explanation": "HTTP usa TCP puerto 80. La sintaxis sería: permit tcp <origen> <destino> eq 80"
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "La máscara wildcard [BLANK] en una ACL coincide con cualquier host de la subred 192.168.1.0/24.",
        "correct_answers": ["0.0.0.255"],
        "distractors": ["255.255.255.0", "0.0.0.0", "255.0.0.0", "0.255.255.255"],
        "explanation": "La wildcard se calcula como la inversa de la máscara de subred. Para /24 (255.255.255.0), la wildcard es 0.0.0.255. Un bit '0' exige coincidencia, un '1' la ignora."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "En una ACL, la sentencia 'deny tcp any any eq 23' bloquea el protocolo de acceso remoto no cifrado [BLANK].",
        "correct_answers": ["Telnet"],
        "distractors": ["SSH", "FTP", "HTTP", "SFTP"],
        "explanation": "Telnet usa TCP puerto 23 y transmite en texto plano. SSH (puerto 22) es su alternativa segura. Bloquear Telnet con ACL es una práctica de seguridad recomendada."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Para filtrar el tráfico ICMP (ping) en una ACL extendida se especifica el protocolo [BLANK].",
        "correct_answers": ["icmp"],
        "distractors": ["tcp", "udp", "ip", "arp"],
        "explanation": "ICMP (Internet Control Message Protocol) es el protocolo de diagnóstico de red. Ejemplo: 'deny icmp any any' bloquearía todos los pings."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "La dirección que se aplica cuando el tráfico entra en la interfaz del router se denomina dirección [BLANK].",
        "correct_answers": ["in"],
        "distractors": ["out", "inbound", "entrada", "forward"],
        "explanation": "Al aplicar una ACL con 'ip access-group <ACL> in', el router evalúa la ACL antes de procesar el paquete entrante. Con 'out', la evalúa antes de enviar el paquete."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 3 — ACL NOMBRADA Y TROUBLESHOOTING (hard)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Para eliminar una sentencia específica dentro de una ACL nombrada se usa la palabra clave [BLANK] antes del número de secuencia.",
        "correct_answers": ["no"],
        "distractors": ["delete", "remove", "clear", "erase"],
        "explanation": "En ACLs nombradas puedes hacer: 'no 30' (dentro de la ACL) para eliminar la línea con secuencia 30. En ACLs numeradas debes borrar toda la ACL y recrearla."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Los números de secuencia en una ACL se incrementan de [BLANK] en [BLANK] por defecto, permitiendo insertar reglas entre las existentes.",
        "correct_answers": ["10"],
        "distractors": ["1", "5", "100", "20"],
        "explanation": "Por defecto, Cisco IOS asigna secuencias 10, 20, 30... Esto deja espacio para insertar (ej: 15) entre sentencias sin reescribir toda la ACL."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "El comando 'ip access-list resequence NOMBRE 10 10' reordena los números de [BLANK] de una ACL nombrada.",
        "correct_answers": ["secuencia"],
        "distractors": ["interfaz", "host", "protocolo", "subred"],
        "explanation": "Resequence permite reorganizar los números de secuencia cuando se han agotado los huecos para insertar nuevas reglas sin necesidad de recrear la ACL."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Una ACL reflexiva permite que el tráfico de retorno de una sesión TCP/UDP sea [BLANK] dinámicamente por el router.",
        "correct_answers": ["permitido"],
        "distractors": ["bloqueado", "filtrado", "enrutado", "encapsulado"],
        "explanation": "Las ACLs reflexivas (ip access-list extended con reflect) crean entradas temporales dinámicas que permiten el tráfico de respuesta de conexiones iniciadas desde dentro, sin abrir el firewall de par en par."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "El comando 'show ip interface GigabitEthernet0/0' muestra qué ACL está aplicada [BLANK] y [BLANK] en esa interfaz.",
        "correct_answers": ["inbound"],
        "distractors": ["subred", "VLAN", "protocolo", "velocidad"],
        "explanation": "La salida de 'show ip interface' indica 'Inbound access list is X' y 'Outbound access list is Y', mostrando las ACLs activas en cada dirección de la interfaz."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 4 — VLANs: CONCEPTOS Y CREACIÓN (easy)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Una VLAN (Virtual Local Area Network) divide lógicamente una red física en múltiples dominios de [BLANK] separados.",
        "correct_answers": ["broadcast"],
        "distractors": ["colisión", "enrutamiento", "seguridad", "acceso"],
        "explanation": "Las VLANs segmentan la red creando dominios de broadcast independientes. El tráfico de broadcast de una VLAN no llega a los dispositivos de otras VLANs."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Para crear la VLAN 10 en un switch Cisco se usa el comando [BLANK] 10.",
        "correct_answers": ["vlan"],
        "distractors": ["create", "add", "interface", "network"],
        "explanation": "En modo de configuración global: 'vlan 10' crea la VLAN y entra en su modo de configuración. Opcionalmente se añade 'name NOMBRE_VLAN'."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "El comando para ver un resumen de todas las VLANs activas en un switch Cisco es show vlan [BLANK].",
        "correct_answers": ["brief"],
        "distractors": ["summary", "detail", "all", "active"],
        "explanation": "'show vlan brief' muestra el ID, nombre, estado y puertos asignados a cada VLAN en formato compacto."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "La VLAN [BLANK] es la VLAN nativa por defecto en los switches Cisco y se usa para gestión si no se cambia.",
        "correct_answers": ["1"],
        "distractors": ["0", "10", "99", "100"],
        "explanation": "VLAN 1 es la VLAN nativa predeterminada. Por seguridad se recomienda cambiarla y no usarla para datos de usuario."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Para asignar el puerto Fa0/1 a la VLAN 20 en modo acceso se usa el comando switchport access vlan [BLANK].",
        "correct_answers": ["20"],
        "distractors": ["1", "10", "100", "trunk"],
        "explanation": "Secuencia completa: interface Fa0/1 → switchport mode access → switchport access vlan 20. El puerto quedará en la VLAN 20."
    },
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Un puerto en [BLANK] solo pertenece a una VLAN y se usa para conectar dispositivos finales como PCs o impresoras.",
        "correct_answers": ["modo acceso"],
        "distractors": ["modo trunk", "modo dinámico", "modo routed", "modo nativo"],
        "explanation": "Los puertos en modo acceso (switchport mode access) llevan el tráfico de una única VLAN sin etiquetar. Los puertos trunk transportan múltiples VLANs etiquetadas."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 5 — TRUNKING Y 802.1Q (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Un enlace [BLANK] (trunk) transporta el tráfico de múltiples VLANs entre switches mediante etiquetas 802.1Q.",
        "correct_answers": ["troncal"],
        "distractors": ["acceso", "nativo", "uplink", "routed"],
        "explanation": "Los enlaces trunk se configuran entre switches (o switch-router) para transportar múltiples VLANs. Cada trama lleva una etiqueta 802.1Q que identifica su VLAN."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El estándar IEEE [BLANK] define el etiquetado de VLANs en tramas Ethernet para enlaces trunk.",
        "correct_answers": ["802.1Q"],
        "distractors": ["802.11", "802.3", "802.1X", "802.1D"],
        "explanation": "IEEE 802.1Q inserta una etiqueta de 4 bytes en la trama Ethernet que contiene el ID de VLAN (12 bits), permitiendo hasta 4094 VLANs."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Para configurar un puerto como trunk en Cisco IOS se usa el comando switchport mode [BLANK].",
        "correct_answers": ["trunk"],
        "distractors": ["access", "dynamic", "encapsulation", "vlan"],
        "explanation": "Secuencia: interface GigabitEthernet0/1 → switchport mode trunk → opcionalmente: switchport trunk encapsulation dot1q (en switches más antiguos)."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "La VLAN [BLANK] es aquella cuyo tráfico viaja sin etiquetar por el enlace trunk, y debe coincidir en ambos extremos del enlace.",
        "correct_answers": ["nativa"],
        "distractors": ["de gestión", "de datos", "de voz", "extendida"],
        "explanation": "La VLAN nativa (por defecto VLAN 1) no lleva etiqueta 802.1Q en el trunk. Si los extremos tienen VLAN nativa diferente, habrá un VLAN mismatch y problemas de seguridad."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Para cambiar la VLAN nativa del trunk al ID 99 se usa: switchport trunk native vlan [BLANK].",
        "correct_answers": ["99"],
        "distractors": ["1", "100", "0", "trunk"],
        "explanation": "Cambiar la VLAN nativa de 1 a otra (como VLAN 99 dedicada) es una buena práctica de seguridad para evitar ataques de VLAN hopping."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El comando 'switchport trunk allowed vlan add [BLANK]' añade la VLAN 30 a la lista de VLANs permitidas en el trunk.",
        "correct_answers": ["30"],
        "distractors": ["1", "10", "99", "all"],
        "explanation": "Por defecto el trunk permite todas las VLANs. Con 'switchport trunk allowed vlan' puedes restringir qué VLANs atraviesan el enlace, mejorando la seguridad."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El protocolo DTP (Dynamic Trunking Protocol) de Cisco puede causar un trunk automáticamente si un extremo está en modo [BLANK].",
        "correct_answers": ["dynamic desirable"],
        "distractors": ["access", "static", "trunk", "negotiate"],
        "explanation": "DTP permite la negociación automática de trunk. 'dynamic desirable' inicia activamente la negociación. 'dynamic auto' espera. Se recomienda desactivar DTP con 'switchport nonegotiate' por seguridad."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 6 — VTP (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El protocolo VTP (VLAN Trunking Protocol) sincroniza la información de VLANs entre switches del mismo [BLANK] VTP.",
        "correct_answers": ["dominio"],
        "distractors": ["subred", "rango", "grupo", "servidor"],
        "explanation": "VTP propaga automáticamente la configuración de VLANs entre switches del mismo dominio VTP a través de los enlaces trunk."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Un switch en modo VTP [BLANK] puede crear, modificar y eliminar VLANs, propagando los cambios al resto del dominio.",
        "correct_answers": ["server"],
        "distractors": ["client", "transparent", "off", "passive"],
        "explanation": "Modos VTP: Server (crea/modifica VLANs), Client (recibe pero no crea), Transparent (no participa en VTP pero reenvía mensajes), Off (desactiva VTP completamente)."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Un switch VTP en modo [BLANK] tiene su propia base de datos de VLANs independiente y no sincroniza con el dominio.",
        "correct_answers": ["transparent"],
        "distractors": ["server", "client", "off", "passive"],
        "explanation": "El modo transparent es útil cuando quieres que un switch tenga configuración VLAN independiente. Reenvía mensajes VTP pero no los aplica ni genera."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 7 — INTER-VLAN ROUTING (hard)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Para que el tráfico pueda pasar entre VLANs distintas es necesario un dispositivo de [BLANK] de capa 3.",
        "correct_answers": ["enrutamiento"],
        "distractors": ["conmutación", "filtrado", "bridging", "switching"],
        "explanation": "Las VLANs son dominios de broadcast separados. Para comunicar hosts de distintas VLANs se necesita un router (o switch L3) que enrute entre ellas."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "La técnica Router-on-a-Stick usa una sola interfaz física del router con múltiples [BLANK] lógicas, una por VLAN.",
        "correct_answers": ["subinterfaces"],
        "distractors": ["puertos", "VLANs", "tablas", "rutas"],
        "explanation": "Router-on-a-Stick crea subinterfaces (G0/0.10, G0/0.20...) sobre un único enlace trunk al switch. Cada subinterfaz tiene su propia IP de gateway para la VLAN correspondiente."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "En una subinterfaz de router para inter-VLAN routing se usa el comando encapsulation [BLANK] <vlan-id>.",
        "correct_answers": ["dot1q"],
        "distractors": ["isl", "trunk", "access", "802.1Q"],
        "explanation": "Ejemplo: interface G0/0.10 → encapsulation dot1q 10 → ip address 192.168.10.1 255.255.255.0. Esto asocia la subinterfaz con la VLAN 10."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Una interfaz virtual de switch (SVI) en un switch multicapa se crea con el comando interface [BLANK] <id-vlan>.",
        "correct_answers": ["vlan"],
        "distractors": ["loopback", "virtual", "trunk", "routed"],
        "explanation": "Ejemplo en switch L3: 'interface vlan 10' → 'ip address 192.168.10.1 255.255.255.0' → 'no shutdown'. La SVI actúa como gateway para la VLAN 10."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Para activar el enrutamiento IP en un switch multicapa se utiliza el comando ip [BLANK].",
        "correct_answers": ["routing"],
        "distractors": ["forward", "enable", "route", "unicast"],
        "explanation": "'ip routing' habilita las capacidades de enrutamiento de capa 3 en un switch multicapa (Layer 3 switch), permitiéndole enrutar entre VLANs sin necesidad de un router externo."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "En Router-on-a-Stick, la interfaz física del router conectada al switch debe configurarse con el comando [BLANK] para activarse sin IP.",
        "correct_answers": ["no shutdown"],
        "distractors": ["ip routing", "switchport trunk", "encapsulation dot1q", "ip address"],
        "explanation": "La interfaz física padre (ej: G0/0) debe estar activa (no shutdown) pero sin IP asignada. Las IPs se configuran en las subinterfaces (G0/0.10, G0/0.20...) junto con encapsulation dot1q."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 8 — PORT SECURITY (medium/hard)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Port Security en un switch Cisco permite restringir el acceso a un puerto basándose en la dirección [BLANK] del dispositivo conectado.",
        "correct_answers": ["MAC"],
        "distractors": ["IP", "VLAN", "CDP", "serial"],
        "explanation": "Port Security examina las direcciones MAC de las tramas que llegan al puerto. Si una MAC no autorizada intenta conectarse, el puerto reacciona según la política configurada (violation mode)."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Para activar Port Security en una interfaz de acceso se usa el comando switchport port-security, pero primero el puerto debe estar en modo [BLANK].",
        "correct_answers": ["access"],
        "distractors": ["trunk", "dynamic", "routed", "monitor"],
        "explanation": "Port Security solo funciona en puertos de acceso estáticos. Primero: 'switchport mode access', luego: 'switchport port-security'."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El modo de violación [BLANK] en Port Security deshabilita el puerto automáticamente cuando se detecta una MAC no autorizada.",
        "correct_answers": ["shutdown"],
        "distractors": ["restrict", "protect", "err-disable", "drop"],
        "explanation": "Modos de violación: Shutdown (desactiva el puerto, err-disabled state, la más segura), Restrict (descarta tramas y genera log), Protect (descarta tramas sin log)."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "La función 'sticky' en Port Security aprende dinámicamente las MACs y las guarda en la [BLANK] de configuración como entradas estáticas.",
        "correct_answers": ["running-config"],
        "distractors": ["VLAN database", "CAM table", "startup-config", "ARP cache"],
        "explanation": "'switchport port-security mac-address sticky' hace que el switch aprenda automáticamente las MACs conectadas y las convierta en entradas estáticas en la running-config. Si se guarda con 'wr', persisten."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Para recuperar un puerto en estado err-disabled por Port Security se usa el comando [BLANK] en modo configuración de interfaz seguido de no shutdown.",
        "correct_answers": ["shutdown"],
        "distractors": ["errdisable recovery", "clear port-security", "reset", "no err-disable"],
        "explanation": "El proceso para recuperar un puerto err-disabled manualmente es: 1) interface Fa0/1 → 2) shutdown → 3) no shutdown. También puede configurarse recuperación automática con 'errdisable recovery cause psecure-violation'."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 9 — VLAN DE VOZ Y GESTIÓN (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Para conectar un teléfono IP al switch, el puerto debe configurarse con una VLAN de datos y una VLAN de [BLANK].",
        "correct_answers": ["voz"],
        "distractors": ["gestión", "trunk", "nativa", "control"],
        "explanation": "Con 'switchport voice vlan 100' se configura la VLAN de voz. El teléfono IP etiqueta su tráfico con esa VLAN, mientras el PC conectado al teléfono usa la VLAN de datos sin etiquetar."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "La VLAN de gestión se usa para acceder al switch remotamente vía [BLANK] o Telnet. Debe asignarse a la SVI de gestión.",
        "correct_answers": ["SSH"],
        "distractors": ["FTP", "HTTP", "SNMP", "CDP"],
        "explanation": "La SVI de gestión (ej: interface vlan 99) recibe la IP de gestión del switch. Se debe usar SSH (no Telnet) para el acceso remoto seguro."
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLOQUE 10 — VERIFICACIÓN Y TROUBLESHOOTING (mixed)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "subject": "redes",
        "difficulty": "easy",
        "sentence_template": "Para ver los detalles de trunking de una interfaz, incluyendo VLANs permitidas, se usa el comando show interfaces [BLANK].",
        "correct_answers": ["trunk"],
        "distractors": ["vlan", "switchport", "status", "detail"],
        "explanation": "'show interfaces trunk' muestra: modo de encapsulación, estado del trunk, VLAN nativa, VLANs permitidas, VLANs activas y VLANs en STP forwarding."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "El comando 'show interfaces Fa0/1 [BLANK]' muestra si el puerto está en modo acceso o trunk y a qué VLAN pertenece.",
        "correct_answers": ["switchport"],
        "distractors": ["trunk", "vlan", "status", "brief"],
        "explanation": "'show interfaces Fa0/1 switchport' revela: modo operacional (access/trunk), VLAN de acceso, encapsulación trunk, VLAN nativa y lista de VLANs permitidas."
    },
    {
        "subject": "redes",
        "difficulty": "medium",
        "sentence_template": "Si dos switches tienen distinta VLAN [BLANK] en un enlace trunk, se genera un log de advertencia y puede haber problemas de seguridad.",
        "correct_answers": ["nativa"],
        "distractors": ["de acceso", "de gestión", "extendida", "de datos"],
        "explanation": "VLAN nativa mismatch es un error común. Cisco genera: 'CDP-4-NATIVE_VLAN_MISMATCH'. Debe coincidir en ambos extremos del trunk para evitar problemas de seguridad tipo VLAN hopping."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "El ataque de doble etiquetado 802.1Q (double tagging) explota el hecho de que la VLAN [BLANK] viaja sin etiquetar por el trunk.",
        "correct_answers": ["nativa"],
        "distractors": ["de gestión", "de datos", "de voz", "extendida"],
        "explanation": "En double tagging, el atacante envía una trama con dos etiquetas VLAN: la exterior es la VLAN nativa (eliminada en el primer switch) y la interior es la VLAN objetivo. Cambiar la VLAN nativa de 1 a una VLAN no utilizada mitiga este ataque."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Para verificar que una ACL está produciendo hits (coincidencias) se usa el comando show ip access-lists y se observan los contadores de [BLANK].",
        "correct_answers": ["matches"],
        "distractors": ["hits", "drops", "errors", "packets"],
        "explanation": "'show ip access-lists' muestra cada sentencia ACL con su contador de coincidencias: 'permit tcp any any eq 80 (1247 matches)'. Para resetear los contadores: 'clear ip access-list counters'."
    },
    {
        "subject": "redes",
        "difficulty": "hard",
        "sentence_template": "Una VLAN no aparece en la tabla de VLANs del switch cliente VTP porque el número de [BLANK] VTP del servidor es menor o igual al del cliente.",
        "correct_answers": ["revisión"],
        "distractors": ["dominio", "versión", "prioridad", "ID"],
        "explanation": "El número de revisión VTP (configuration revision number) determina qué switch tiene la información más reciente. Un cliente solo actualiza si recibe un mensaje VTP con número de revisión mayor al suyo."
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# INSERTION FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def bulk_insert(exercises_list):
    from database import SkillLabExercise
    db = SessionLocal()
    try:
        count = 0
        for ex_data in exercises_list:
            exercise = SkillLabExercise(
                subject=ex_data['subject'],
                difficulty=ex_data['difficulty'],
                sentence_template=ex_data['sentence_template'],
                correct_answers=json.dumps(ex_data['correct_answers'], ensure_ascii=False),
                distractors=json.dumps(ex_data['distractors'], ensure_ascii=False),
                explanation=ex_data['explanation'],
                approved=True,
            )
            db.add(exercise)
            count += 1
        db.commit()
        easy   = sum(1 for e in exercises_list if e['difficulty'] == 'easy')
        medium = sum(1 for e in exercises_list if e['difficulty'] == 'medium')
        hard   = sum(1 for e in exercises_list if e['difficulty'] == 'hard')
        print(f"\n✅  Insertados {count} ejercicios de NetLabs ACL & VLAN")
        print(f"    Easy: {easy}  |  Medium: {medium}  |  Hard: {hard}")
        print(f"    Subject: redes\n")
    except Exception as e:
        db.rollback()
        print(f"\n❌  Error durante la inserción: {e}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧  Iniciando seed de ejercicios NetLabs — ACL & VLAN...")
    bulk_insert(EXERCISES)
