"""
seed_netlabs_advanced_p3.py — Part 3
NAT/PAT, EtherChannel, Troubleshooting
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://tech4u_admin:tech4u_admin@localhost:5432/tech4u")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def build_scenario(title, description, difficulty, category, points, estimated_time,
    topology, symptom, commands, fault, diagnosis_options, solution_explanation, hints):
    return {
        "title": title, "description": description, "difficulty": difficulty, "subject": "redes",
        "category": category, "points": points, "estimated_time": estimated_time,
        "topology": json.dumps(topology, ensure_ascii=False),
        "symptom": symptom, "commands": json.dumps(commands, ensure_ascii=False),
        "fault": json.dumps(fault, ensure_ascii=False),
        "diagnosis_options": json.dumps(diagnosis_options, ensure_ascii=False),
        "solution_explanation": solution_explanation, "hints": json.dumps(hints, ensure_ascii=False),
        "is_active": True,
    }


SCENARIOS = [

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 5: NAT/PAT EN CLI
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="NAT Estático - Servidor Web interno",
        description="Configura NAT estático para exponer un servidor web interno. Aprende 'ip nat inside source static'.",
        difficulty="easy",
        category="Addressing",
        points=100,
        estimated_time="15–20 min",
        topology={
            "viewBox": "0 0 900 300",
            "nodes": [
                {"id": "Internal", "type": "pc", "label": "Web Server\n192.168.1.10", "x": 100, "y": 150},
                {"id": "NAT_GW", "type": "router", "label": "NAT Router", "x": 450, "y": 150},
                {"id": "Internet", "type": "pc", "label": "Internet Client\n(8.8.8.8)", "x": 800, "y": 150},
            ],
            "links": [
                {"from": "Internal", "to": "NAT_GW", "fromLabel": "eth0", "toLabel": "G0/0", "faulty": True},
                {"from": "NAT_GW", "to": "Internet", "fromLabel": "G0/1", "toLabel": "eth0"},
            ]
        },
        symptom="El servidor web interno (192.168.1.10) debe ser accesible desde Internet en 200.1.1.10:80. NAT estático no está configurado.",
        commands={
            "NAT_GW": [
                {"cmd": "show ip nat translations", "output": "No translations", "revealsFault": True},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ip nat inside", "output": "NAT inside interface", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface G0/1", "output": "", "revealsFault": False},
                {"cmd": "ip nat outside", "output": "NAT outside interface", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "ip nat inside source static 192.168.1.10 200.1.1.10", "output": "Static NAT configured", "revealsFault": False},
                {"cmd": "show ip nat translations", "output": "Pro Inside global    Inside local\nstatic 200.1.1.10    192.168.1.10", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "NAT_GW",
            "description": "NAT estático no está configurado. Faltan interfaces 'ip nat inside/outside'.",
            "fixCommand": "ip nat inside + ip nat outside + ip nat inside source static"
        },
        diagnosis_options=[
            {"id": "a", "text": "No hay interfaces marcadas como 'ip nat inside/outside'", "correct": True},
            {"id": "b", "text": "No hay NAT static configurado", "correct": True},
            {"id": "c", "text": "Los puertos deben especificarse en el comando", "correct": False},
            {"id": "d", "text": "NAT estático solo funciona con protocolo TCP", "correct": False},
        ],
        solution_explanation="NAT estático: 1) Marcar interfaces: 'ip nat inside' (red interna), 'ip nat outside' (red pública). 2) 'ip nat inside source static <IP_privada> <IP_pública>'. Usa 'show ip nat translations'.",
        hints=[
            "Inside: red privada interna.",
            "Outside: red pública o Internet.",
            "1:1 mapping entre IP privada e IP pública.",
            "'debug ip nat' muestra traducci ones en tiempo real.",
        ]
    ),

    build_scenario(
        title="PAT - Toda la LAN sale con una IP pública",
        description="Configura PAT (overload) para que toda la LAN use una IP pública. Aprende 'ip nat inside source list ... overload'.",
        difficulty="medium",
        category="Addressing",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 900 300",
            "nodes": [
                {"id": "LAN", "type": "pc", "label": "LAN\n192.168.1.0/24", "x": 100, "y": 150},
                {"id": "NAT", "type": "router", "label": "NAT Router", "x": 450, "y": 150},
                {"id": "ISP", "type": "pc", "label": "ISP\n(Internet)", "x": 800, "y": 150},
            ],
            "links": [
                {"from": "LAN", "to": "NAT", "fromLabel": "multiple", "toLabel": "G0/0"},
                {"from": "NAT", "to": "ISP", "fromLabel": "G0/1", "toLabel": "upstream"},
            ]
        },
        symptom="Todos los usuarios en la LAN (192.168.1.0/24) deben acceder a Internet con una IP pública (200.1.1.1). PAT no está configurado.",
        commands={
            "NAT": [
                {"cmd": "show access-lists", "output": "No access lists", "revealsFault": True},
                {"cmd": "access-list 1 permit 192.168.1.0 0.0.0.255", "output": "ACL 1 created", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ip nat inside", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface G0/1", "output": "", "revealsFault": False},
                {"cmd": "ip nat outside", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "ip nat inside source list 1 interface G0/1 overload", "output": "PAT configured", "revealsFault": False},
                {"cmd": "show ip nat translations", "output": "Multiple translations on 200.1.1.1 with different ports", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "NAT",
            "description": "PAT (overload) no está configurado. Falta ACL y comando NAT.",
            "fixCommand": "access-list + ip nat inside source list ... overload"
        },
        diagnosis_options=[
            {"id": "a", "text": "No hay access-list para definir tráfico a traducir", "correct": True},
            {"id": "b", "text": "Falta 'overload' para multiplexar en una sola IP", "correct": True},
            {"id": "c", "text": "Las interfaces inside/outside no están marcadas", "correct": True},
            {"id": "d", "text": "PAT solo funciona con hosts, no con redes completas", "correct": False},
        ],
        solution_explanation="PAT (Port Address Translation): 1) Crear ACL para rango privado. 2) Marcar interfaces inside/outside. 3) 'ip nat inside source list <ACL> interface <IP_pública> overload'. Múltiples usuarios comparten una IP pública usando puertos distintos.",
        hints=[
            "Overload = multiplexar múltiples hosts en una sola IP.",
            "ACL define qué tráfico se traduce.",
            "Interface vs pool: G0/1 usa su IP; pool es para múltiples IPs públicas.",
            "'debug ip nat' para troubleshooting detallado.",
        ]
    ),

    build_scenario(
        title="NAT con Pool de IPs públicas",
        description="Configura NAT con un pool de IPs públicas para distribuir carga. Aprende 'ip nat pool'.",
        difficulty="medium",
        category="Addressing",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 900 300",
            "nodes": [
                {"id": "LAN", "type": "pc", "label": "LAN\n192.168.1.0/24", "x": 100, "y": 150},
                {"id": "NAT", "type": "router", "label": "NAT Router", "x": 450, "y": 150},
                {"id": "ISP", "type": "pc", "label": "ISP\n(Internet)", "x": 800, "y": 150},
            ],
            "links": [
                {"from": "LAN", "to": "NAT", "fromLabel": "eth", "toLabel": "G0/0"},
                {"from": "NAT", "to": "ISP", "fromLabel": "G0/1", "toLabel": "ISP"},
            ]
        },
        symptom="La LAN necesita acceso a Internet con 10 IPs públicas (200.1.1.1–200.1.1.10). NAT pool no está configurado.",
        commands={
            "NAT": [
                {"cmd": "show ip nat translations", "output": "No translations", "revealsFault": True},
                {"cmd": "access-list 1 permit 192.168.1.0 0.0.0.255", "output": "", "revealsFault": False},
                {"cmd": "ip nat pool POOL_PUBLIC 200.1.1.1 200.1.1.10 netmask 255.255.255.0", "output": "Pool created", "revealsFault": False},
                {"cmd": "ip nat inside source list 1 pool POOL_PUBLIC", "output": "Dynamic NAT configured", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ip nat inside", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface G0/1", "output": "", "revealsFault": False},
                {"cmd": "ip nat outside", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ip nat statistics", "output": "Pool POOL_PUBLIC: 10 translations", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "NAT",
            "description": "NAT pool no está configurado.",
            "fixCommand": "ip nat pool + ip nat inside source list ... pool"
        },
        diagnosis_options=[
            {"id": "a", "text": "No existe el pool de IPs públicas", "correct": True},
            {"id": "b", "text": "El NAT no está asociado al pool", "correct": True},
            {"id": "c", "text": "Las interfaces inside/outside faltan", "correct": True},
            {"id": "d", "text": "Los pools solo funcionan con overload", "correct": False},
        ],
        solution_explanation="NAT con pool: 1) 'ip nat pool <nombre> <IP_inicio> <IP_fin> netmask <mask>'. 2) 'ip nat inside source list <ACL> pool <nombre>'. Distribuye 1:1 dinámica entre privadas y el pool. Sin 'overload', se agota el pool si hay más usuarios que IPs públicas.",
        hints=[
            "Pool dinámico: distribuye IPs públicas secuencialmente.",
            "Pool + overload: si se agota, usa puertos (PAT).",
            "'show ip nat statistics' muestra uso del pool.",
            "Netmask define la subred pública.",
        ]
    ),

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 6: ETHERCHANNEL
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="EtherChannel con LACP",
        description="Configura EtherChannel con LACP para aumentar ancho de banda. Aprende 'channel-group mode active'.",
        difficulty="medium",
        category="Switching",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 800 300",
            "nodes": [
                {"id": "SW1", "type": "switch", "label": "Switch 1", "x": 200, "y": 150},
                {"id": "SW2", "type": "switch", "label": "Switch 2", "x": 600, "y": 150},
            ],
            "links": [
                {"from": "SW1", "to": "SW2", "fromLabel": "Gi0/1", "toLabel": "Gi0/1"},
                {"from": "SW1", "to": "SW2", "fromLabel": "Gi0/2", "toLabel": "Gi0/2"},
                {"from": "SW1", "to": "SW2", "fromLabel": "Gi0/3", "toLabel": "Gi0/3"},
            ]
        },
        symptom="Tres enlaces Gigabit entre SW1 y SW2. Solo uno se activa (STP bloquea los otros). EtherChannel LACP no está configurado.",
        commands={
            "SW1": [
                {"cmd": "show etherchannel summary", "output": "No EtherChannel", "revealsFault": True},
                {"cmd": "interface range Gi0/1-3", "output": "", "revealsFault": False},
                {"cmd": "channel-group 1 mode active", "output": "LACP active enabled", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show etherchannel summary", "output": "Group 1: LACP, 3 members, all in bundle", "revealsFault": False},
                {"cmd": "show lacp neighbor", "output": "SW2 active, 3 ports bundled", "revealsFault": False},
            ],
            "SW2": [
                {"cmd": "interface range Gi0/1-3", "output": "", "revealsFault": False},
                {"cmd": "channel-group 1 mode active", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show etherchannel summary", "output": "Group 1: 3 members bundled", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "SW1",
            "description": "EtherChannel LACP no está configurado. Solo 1 de 3 enlaces está activo.",
            "fixCommand": "channel-group 1 mode active en interfaces Gi0/1-3"
        },
        diagnosis_options=[
            {"id": "a", "text": "No hay channel-group configurado", "correct": True},
            {"id": "b", "text": "El modo debe ser 'active' (LACP activo)", "correct": True},
            {"id": "c", "text": "STP está bloqueando los enlaces redundantes", "correct": True},
            {"id": "d", "text": "LACP solo funciona en enlaces Ethernet, no Gigabit", "correct": False},
        ],
        solution_explanation="EtherChannel LACP: 1) 'interface range Gi0/1-3'. 2) 'channel-group 1 mode active' (LACP). 3) Las interfaces se unen en port-channel1. Usa 'show etherchannel summary' y 'show lacp neighbor'.",
        hints=[
            "Active: inicia negociación LACP.",
            "Passive: espera LACP de otro lado.",
            "Desirable/Auto: PAgP (protocolo más antiguo).",
            "'show port-channel 1' muestra detalles del bundle.",
        ]
    ),

    build_scenario(
        title="EtherChannel con PAgP y configuración estática",
        description="Compara LACP (IEEE 802.3ad) con PAgP (Cisco) y configuración estática.",
        difficulty="easy",
        category="Switching",
        points=100,
        estimated_time="15–20 min",
        topology={
            "viewBox": "0 0 800 300",
            "nodes": [
                {"id": "SW1", "type": "switch", "label": "Switch 1", "x": 200, "y": 150},
                {"id": "SW2", "type": "switch", "label": "Switch 2", "x": 600, "y": 150},
            ],
            "links": [
                {"from": "SW1", "to": "SW2", "fromLabel": "Gi0/1", "toLabel": "Gi0/1"},
                {"from": "SW1", "to": "SW2", "fromLabel": "Gi0/2", "toLabel": "Gi0/2"},
            ]
        },
        symptom="SW1 tiene EtherChannel LACP configurado, pero SW2 usa PAgP. Los modos no son compatibles.",
        commands={
            "SW1": [
                {"cmd": "show etherchannel summary", "output": "Group 1: LACP", "revealsFault": False},
                {"cmd": "interface range Gi0/1-2", "output": "", "revealsFault": False},
                {"cmd": "channel-group 1 mode desirable", "output": "PAgP desirable mode", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show etherchannel summary", "output": "Group 1: PAgP, bundled", "revealsFault": False},
            ],
            "SW2": [
                {"cmd": "interface range Gi0/1-2", "output": "", "revealsFault": False},
                {"cmd": "channel-group 1 mode desirable", "output": "PAgP desirable", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show etherchannel summary", "output": "Group 1: 2 members bundled", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "SW1",
            "description": "Los modos de EtherChannel no son compatibles entre SW1 y SW2.",
            "fixCommand": "Usar mismo modo en ambos switches (LACP active/active o PAgP desirable/desirable)"
        },
        diagnosis_options=[
            {"id": "a", "text": "SW1 usa LACP y SW2 usa PAgP (incompatibles)", "correct": True},
            {"id": "b", "text": "LACP es estándar IEEE 802.3ad; PAgP es Cisco", "correct": True},
            {"id": "c", "text": "Ambos protocolos pueden usarse simultáneamente", "correct": False},
            {"id": "d", "text": "Desirable es un modo de LACP", "correct": False},
        ],
        solution_explanation="EtherChannel: LACP (IEEE, estándar) o PAgP (Cisco legacy). Modos compatibles: LACP active-active, active-passive. PAgP desirable-desirable, desirable-auto. Estático sin protocolo: 'channel-group 1 mode on'. Usa 'show etherchannel'.",
        hints=[
            "LACP: active/passive o desirable.",
            "PAgP: desirable/auto.",
            "Estático (on): sin negociación, ambos lados 'on'.",
            "'show port-channel load-balance' muestra algoritmo de distribución.",
        ]
    ),

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 7: TROUBLESHOOTING DE RED
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="El host no tiene acceso a Internet - Diagnóstico sistemático",
        description="Diagnostica sistemáticamente por qué un host no alcanza Internet. Pasos: IP, gateway, DNS, ISP.",
        difficulty="medium",
        category="Troubleshooting",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 1000 300",
            "nodes": [
                {"id": "PC", "type": "pc", "label": "PC (192.168.1.100)", "x": 100, "y": 150},
                {"id": "GW", "type": "router", "label": "Gateway\n192.168.1.1", "x": 300, "y": 150},
                {"id": "ISP", "type": "router", "label": "ISP Router", "x": 500, "y": 150},
                {"id": "DNS", "type": "server", "label": "DNS\n8.8.8.8", "x": 700, "y": 150},
                {"id": "Web", "type": "server", "label": "Web Server\n1.1.1.1", "x": 900, "y": 150},
            ],
            "links": [
                {"from": "PC", "to": "GW", "fromLabel": "eth0", "toLabel": "G0/0", "faulty": True},
                {"from": "GW", "to": "ISP", "fromLabel": "G0/1", "toLabel": "G0/0"},
                {"from": "ISP", "to": "DNS", "fromLabel": "G0/1", "toLabel": "eth0"},
                {"from": "ISP", "to": "Web", "fromLabel": "G0/2", "toLabel": "eth0"},
            ]
        },
        symptom="PC no puede acceder a Internet. Diagnostica paso a paso: IP local, gateway, DNS, ruta pública.",
        commands={
            "PC": [
                {"cmd": "ipconfig", "output": "IP: 0.0.0.0 (DHCP failed)", "revealsFault": True},
                {"cmd": "ipconfig /all", "output": "DHCP disabled, no IP assigned", "revealsFault": False},
                {"cmd": "ipconfig /renew", "output": "DHCP request sent", "revealsFault": False},
                {"cmd": "ipconfig", "output": "IP: 192.168.1.100, Gateway: 192.168.1.1", "revealsFault": False},
                {"cmd": "ping 192.168.1.1", "output": "Reply from 192.168.1.1: bytes=32 time<1ms", "revealsFault": False},
                {"cmd": "nslookup www.google.com", "output": "DNS response 1.1.1.1", "revealsFault": False},
                {"cmd": "ping 1.1.1.1", "output": "Reply from 1.1.1.1 bytes=32 time=20ms", "revealsFault": False},
                {"cmd": "tracert 1.1.1.1", "output": "Trace complete: PC->GW->ISP->Web", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "PC",
            "description": "PC no tiene IP (DHCP no obtiene respuesta del servidor).",
            "fixCommand": "ipconfig /renew o configurar IP estática"
        },
        diagnosis_options=[
            {"id": "a", "text": "PC no tiene IP válida asignada", "correct": True},
            {"id": "b", "text": "El gateway no responde a ping desde PC", "correct": True},
            {"id": "c", "text": "DNS no resuelve nombres", "correct": True},
            {"id": "d", "text": "Todos los pasos deben completarse antes de escalar al ISP", "correct": False},
        ],
        solution_explanation="Diagnóstico sistemático: 1) 'ipconfig' (IP local). 2) 'ping gateway' (conectividad local). 3) 'nslookup' (DNS). 4) 'ping IP pública' (ruta). 5) 'tracert' (ruta completa). En router: 'show ip route', 'show ip interface brief', 'show arp'.",
        hints=[
            "Empieza en la capa más baja (IP local).",
            "Verifica cada salto antes de pasar al siguiente.",
            "DNS es crítico para nombres pero IP es fundamental.",
            "'tracert' muestra dónde falla la ruta.",
        ]
    ),

    build_scenario(
        title="Dos VLANs no se comunican - Inter-VLAN routing",
        description="Diagnostica por qué dos VLANs no pueden comunicarse. Verifica trunk, subinterfaces, SVI.",
        difficulty="medium",
        category="Troubleshooting",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 900 400",
            "nodes": [
                {"id": "SW", "type": "switch", "label": "Switch L3", "x": 200, "y": 200},
                {"id": "PC_VLAN10", "type": "pc", "label": "PC VLAN10\n10.1.1.10/24", "x": 100, "y": 50},
                {"id": "PC_VLAN20", "type": "pc", "label": "PC VLAN20\n10.2.1.10/24", "x": 100, "y": 350},
                {"id": "ROUTER", "type": "router", "label": "Router\n(RoaS)", "x": 500, "y": 200},
            ],
            "links": [
                {"from": "PC_VLAN10", "to": "SW", "fromLabel": "eth0", "toLabel": "Fa0/1"},
                {"from": "PC_VLAN20", "to": "SW", "fromLabel": "eth0", "toLabel": "Fa0/2"},
                {"from": "SW", "to": "ROUTER", "fromLabel": "Gi0/1", "toLabel": "G0/0", "faulty": True},
            ]
        },
        symptom="PC en VLAN 10 (10.1.1.10) no puede hacer ping a PC en VLAN 20 (10.2.1.10). Inter-VLAN routing no funciona.",
        commands={
            "SW": [
                {"cmd": "show interfaces trunk", "output": "Gi0/1 not trunking", "revealsFault": True},
                {"cmd": "interface Gi0/1", "output": "", "revealsFault": False},
                {"cmd": "switchport mode trunk", "output": "Trunk configured", "revealsFault": False},
                {"cmd": "switchport trunk allowed vlan 10,20", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface vlan 10", "output": "", "revealsFault": False},
                {"cmd": "ip address 10.1.1.1 255.255.255.0", "output": "", "revealsFault": False},
                {"cmd": "no shutdown", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface vlan 20", "output": "", "revealsFault": False},
                {"cmd": "ip address 10.2.1.1 255.255.255.0", "output": "", "revealsFault": False},
                {"cmd": "no shutdown", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "ip routing", "output": "IP routing enabled", "revealsFault": False},
                {"cmd": "show ip route", "output": "C   10.1.1.0/24 via Vlan10\nC   10.2.1.0/24 via Vlan20", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "SW",
            "description": "Trunk no está configurado. SVIs faltan o IP routing no está habilitado.",
            "fixCommand": "switchport mode trunk + SVI interfaces + ip routing"
        },
        diagnosis_options=[
            {"id": "a", "text": "El enlace no está en modo trunk", "correct": True},
            {"id": "b", "text": "Las SVIs (VLAN interfaces) no tienen IPs configuradas", "correct": True},
            {"id": "c", "text": "'ip routing' no está habilitado en el switch", "correct": True},
            {"id": "d", "text": "Las VLANs deben tener un router externo dedicado", "correct": False},
        ],
        solution_explanation="Inter-VLAN: 1) 'switchport mode trunk' en el enlace. 2) 'interface vlan X' + 'ip address' para cada VLAN. 3) 'ip routing' para habilitar L3. En router-on-stick: 'interface G0/0.10' + 'encapsulation dot1q 10' + 'ip address'.",
        hints=[
            "Trunk: transporta múltiples VLANs con etiqueta 802.1Q.",
            "SVI = interface VLAN; actúa como gateway.",
            "'show interfaces trunk' verifica trunk status.",
            "'show ip interface brief' muestra SVIs activas.",
        ]
    ),
]


def bulk_insert(scenarios_list):
    from database import NetLabScenario
    db = SessionLocal()
    try:
        count = 0
        for scenario_data in scenarios_list:
            existing = db.query(NetLabScenario).filter(
                NetLabScenario.title == scenario_data['title']
            ).first()

            if existing:
                print(f"  ⊘ Skipping '{scenario_data['title']}'")
                continue

            scenario = NetLabScenario(**scenario_data)
            db.add(scenario)
            count += 1

        db.commit()

        easy = sum(1 for s in scenarios_list if s['difficulty'] == 'easy')
        medium = sum(1 for s in scenarios_list if s['difficulty'] == 'medium')
        hard = sum(1 for s in scenarios_list if s['difficulty'] == 'hard')

        print(f"\n✓ Insertados {count} escenarios (Part 3)")
        print(f"  Easy: {easy}  |  Medium: {medium}  |  Hard: {hard}")
        print(f"  Módulos: NAT/PAT, EtherChannel, Troubleshooting\n")
    except Exception as e:
        db.rollback()
        print(f"\nError: {e}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*80)
    print("  NetLabs Avanzados Part 3 — NAT/PAT, EtherChannel & Troubleshooting")
    print("="*80 + "\n")
    bulk_insert(SCENARIOS)
