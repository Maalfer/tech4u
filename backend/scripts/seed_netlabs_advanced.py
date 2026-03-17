"""
seed_netlabs_advanced.py
═══════════════════════════════════════════════════════════════════════════════
NetLabs — Advanced Networking Modules (Cisco CLI Simulator Scenarios)
═══════════════════════════════════════════════════════════════════════════════
Adds NetLab scenarios for advanced networking topics:
  • OSPF Multi-área (Medium)
  • BGP Básico (Hard)
  • IPv6 Addressing y Routing (Medium)
  • Port Security en Switches (Medium)
  • NAT/PAT con Cisco (Medium)
  • EtherChannel con LACP (Medium)
  • QoS Básico — Marcado y Colas (Hard)
  • Troubleshooting de Red — Escenario realista (Hard)

Subject: "redes"
Difficulty: medium / hard

Usage:
    cd /path/to/backend
    python scripts/seed_netlabs_advanced.py
═══════════════════════════════════════════════════════════════════════════════
"""

import json
import os
import sys
from datetime import datetime

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
# NETLABS DATA — Advanced Scenarios
# ─────────────────────────────────────────────────────────────────────────────

NETLABS = [

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 1: OSPF Multi-área (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "OSPF Multi-área: Configuración entre 3 routers",
        "description": "Configura OSPF en una topología de 3 routers distribuidos en 2 áreas (área 0 backbone + área 1).",
        "difficulty": "medium",
        "subject": "redes",
        "category": "Routing",
        "points": 150,
        "estimatedTime": "15–20 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "router1", "label": "R1", "sublabel": "(Area 0)", "type": "router", "x": 150, "y": 100},
                {"id": "router2", "label": "R2", "sublabel": "(Area 0/1)", "type": "router", "x": 400, "y": 100},
                {"id": "router3", "label": "R3", "sublabel": "(Area 1)", "type": "router", "x": 650, "y": 100},
                {"id": "pc1", "label": "PC1", "sublabel": "10.0.0.10", "type": "pc", "x": 150, "y": 250},
                {"id": "pc2", "label": "PC2", "sublabel": "192.168.1.10", "type": "pc", "x": 650, "y": 250},
            ],
            "links": [
                {"from": "router1", "to": "router2", "fromLabel": "Fa0/1", "toLabel": "Fa0/0"},
                {"from": "router2", "to": "router3", "fromLabel": "Fa0/1", "toLabel": "Fa0/0"},
                {"from": "router1", "to": "pc1", "fromLabel": "Fa0/0", "toLabel": "eth0"},
                {"from": "router3", "to": "pc2", "fromLabel": "Fa0/0", "toLabel": "eth0"},
            ]
        },

        "symptom": "La red OSPF no está sincronizada. Los routers no intercambian rutas. Verifica el vecindario y la configuración de áreas.",

        "commands": {
            "router1": [
                {"cmd": "router ospf 1", "output": ""},
                {"cmd": "router-id 1.1.1.1", "output": ""},
                {"cmd": "network 10.0.0.0 0.0.0.255 area 0", "output": ""},
                {"cmd": "network 172.16.0.0 0.0.0.255 area 0", "output": ""},
                {"cmd": "passive-interface FastEthernet0/0", "output": ""},
                {"cmd": "show ip ospf neighbor", "output": "Neighbor ID     Pri   State           Dead Time   Address         Interface\n2.2.2.2         1     FULL/DR         35          172.16.1.2      FastEthernet0/1", "revealsFault": False},
                {"cmd": "show ip route ospf", "output": "O    192.168.1.0 [110/20] via 172.16.1.2, 00:05:10, FastEthernet0/1", "revealsFault": False},
            ],
            "router2": [
                {"cmd": "router ospf 1", "output": ""},
                {"cmd": "router-id 2.2.2.2", "output": ""},
                {"cmd": "network 172.16.0.0 0.0.0.255 area 0", "output": ""},
                {"cmd": "network 172.17.0.0 0.0.0.255 area 1", "output": ""},
                {"cmd": "show ip ospf neighbor", "output": "Neighbor ID     Pri   State           Dead Time   Address         Interface\n1.1.1.1         1     FULL/BDR        35          172.16.1.1      FastEthernet0/0\n3.3.3.3         1     FULL/BDR        35          172.17.1.2      FastEthernet0/1", "revealsFault": False},
                {"cmd": "show ip route ospf", "output": "O    10.0.0.0 [110/20] via 172.16.1.1, 00:05:10, FastEthernet0/0\nO    192.168.1.0 [110/20] via 172.17.1.2, 00:05:10, FastEthernet0/1", "revealsFault": False},
            ],
            "router3": [
                {"cmd": "router ospf 1", "output": ""},
                {"cmd": "router-id 3.3.3.3", "output": ""},
                {"cmd": "network 192.168.1.0 0.0.0.255 area 1", "output": ""},
                {"cmd": "network 172.17.0.0 0.0.0.255 area 1", "output": ""},
                {"cmd": "passive-interface FastEthernet0/0", "output": ""},
                {"cmd": "ip ospf cost 10 interface FastEthernet0/1", "output": ""},
                {"cmd": "show ip ospf neighbor", "output": "Neighbor ID     Pri   State           Dead Time   Address         Interface\n2.2.2.2         1     FULL/DR         35          172.17.1.1      FastEthernet0/0", "revealsFault": False},
                {"cmd": "show ip route ospf", "output": "O    10.0.0.0 [110/30] via 172.17.1.1, 00:05:10, FastEthernet0/0", "revealsFault": False},
            ]
        },

        "fault": {
            "deviceId": "router1",
            "description": "R1 no tiene el proceso OSPF iniciado",
            "fixCommand": "router ospf 1"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "El proceso OSPF no está iniciado en todos los routers", "correct": True},
            {"id": "b", "text": "Las redes no están anunciadas correctamente en OSPF", "correct": False},
            {"id": "c", "text": "El vecindario OSPF está activo pero las áreas no coinciden", "correct": False},
        ],

        "solutionExplanation": "Para habilitar OSPF en Cisco, debes: 1) Iniciar el proceso OSPF con 'router ospf <número>', 2) Configurar el router-id, 3) Anunciar las redes en sus áreas respectivas con 'network <red> <wildcard> area <número>'. Las áreas deben coincidir con los vecinos para intercambiar rutas.",

        "hints": [
            "Verifica con 'show ip ospf neighbor' si los routers reconocen a sus vecinos OSPF.",
            "Comprueba con 'show ip route ospf' si las rutas remotas aparecen en la tabla de enrutamiento.",
            "Usa 'show ip protocols' para revisar el estado general de OSPF.",
            "Recuerda que los vecinos OSPF deben estar en la misma área para comunicarse.",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 2: BGP Básico (hard)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "BGP Básico: eBGP entre dos AS",
        "description": "Configura eBGP entre dos routers en diferentes AS (AS 65001 y AS 65002). Aprende a anunciar redes, establecer vecindarios y verificar la tabla BGP.",
        "difficulty": "hard",
        "subject": "redes",
        "category": "Routing",
        "points": 200,
        "estimatedTime": "20–25 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "router1", "label": "R1", "sublabel": "AS 65001", "type": "router", "x": 200, "y": 100},
                {"id": "router2", "label": "R2", "sublabel": "AS 65002", "type": "router", "x": 600, "y": 100},
                {"id": "pc1", "label": "PC1", "sublabel": "10.1.0.10", "type": "pc", "x": 200, "y": 250},
                {"id": "pc2", "label": "PC2", "sublabel": "10.2.0.10", "type": "pc", "x": 600, "y": 250},
            ],
            "links": [
                {"from": "router1", "to": "router2", "fromLabel": "Gi0/0\n203.0.113.1", "toLabel": "Gi0/0\n203.0.113.2"},
                {"from": "router1", "to": "pc1", "fromLabel": "Fa0/0", "toLabel": "eth0"},
                {"from": "router2", "to": "pc2", "fromLabel": "Fa0/0", "toLabel": "eth0"},
            ]
        },

        "symptom": "Los dos AS no intercambian rutas BGP. Configura eBGP para que ambos routers se anuncien mutuamente sus redes y establezcan una sesión BGP.",

        "commands": {
            "router1": [
                {"cmd": "router bgp 65001", "output": ""},
                {"cmd": "neighbor 203.0.113.2 remote-as 65002", "output": ""},
                {"cmd": "network 10.1.0.0 mask 255.255.255.0", "output": ""},
                {"cmd": "bgp default local-preference 200", "output": ""},
                {"cmd": "show bgp summary", "output": "BGP router identifier 203.0.113.1, local AS number 65001\nNeighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd\n203.0.113.2     4 65002      10      10        5    0    0 00:04:32        1", "revealsFault": False},
                {"cmd": "show ip bgp", "output": "BGP table version is 5, local router ID is 203.0.113.1\nStatus codes: s suppressed, d damped, h history, * valid, > best, i - internal\nOrigin codes: i - IGP, e - EGP, ? - incomplete\n   Network          Next Hop            Metric LocPrf Weight Path\n*> 10.1.0.0/24     0.0.0.0                  0    200      0 i\n*  10.2.0.0/24     203.0.113.2              0            0 65002 i", "revealsFault": False},
            ],
            "router2": [
                {"cmd": "router bgp 65002", "output": ""},
                {"cmd": "neighbor 203.0.113.1 remote-as 65001", "output": ""},
                {"cmd": "network 10.2.0.0 mask 255.255.255.0", "output": ""},
                {"cmd": "ip prefix-list ACCEPT seq 5 permit 10.1.0.0/24", "output": ""},
                {"cmd": "route-map FILTER permit 10", "output": ""},
                {"cmd": "match ip address prefix-list ACCEPT", "output": ""},
                {"cmd": "show bgp summary", "output": "BGP router identifier 203.0.113.2, local AS number 65002\nNeighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd\n203.0.113.1     4 65001      10      10        5    0    0 00:04:32        1", "revealsFault": False},
                {"cmd": "show ip bgp", "output": "BGP table version is 5, local router ID is 203.0.113.2\nStatus codes: s suppressed, d damped, h history, * valid, > best, i - internal\nOrigin codes: i - IGP, e - EGP, ? - incomplete\n   Network          Next Hop            Metric LocPrf Weight Path\n*> 10.2.0.0/24     0.0.0.0                  0    100      0 i\n*  10.1.0.0/24     203.0.113.1              0            0 65001 i", "revealsFault": False},
            ]
        },

        "fault": {
            "deviceId": "router1",
            "description": "El proceso BGP no está configurado",
            "fixCommand": "router bgp 65001"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "El proceso BGP no está inicializado en alguno de los routers", "correct": True},
            {"id": "b", "text": "Los vecinos BGP no tienen el AS remoto correcto configurado", "correct": False},
            {"id": "c", "text": "Las redes no se están anunciando correctamente", "correct": False},
        ],

        "solutionExplanation": "BGP requiere: 1) Inicializar el proceso con 'router bgp <AS>', 2) Configurar vecinos con su AS remoto: 'neighbor <IP> remote-as <AS>', 3) Anunciar redes locales con 'network <red> mask <máscara>'. Usa 'show bgp summary' para verificar la sesión y 'show ip bgp' para la tabla de rutas.",

        "hints": [
            "Verifica con 'show bgp summary' que la sesión BGP esté en estado 'Established'.",
            "Usa 'show ip bgp' para ver qué rutas se han aprendido desde el vecino BGP.",
            "Asegúrate de que los routers pueden alcanzarse en la dirección IP del vecino BGP.",
            "Con 'show ip bgp neighbors' ves detalles completos de la sesión BGP.",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 3: IPv6 Addressing y Routing (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "IPv6: Configuración y Enrutamiento básico",
        "description": "Configura direcciones IPv6, rutas estáticas y OSPFv3 para comunicación IPv6 entre 2 subredes.",
        "difficulty": "medium",
        "subject": "redes",
        "category": "Addressing",
        "points": 150,
        "estimatedTime": "15–20 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "router1", "label": "R1", "sublabel": "IPv6 GW", "type": "router", "x": 200, "y": 100},
                {"id": "router2", "label": "R2", "sublabel": "IPv6 GW", "type": "router", "x": 600, "y": 100},
                {"id": "pc1", "label": "PC1", "sublabel": "2001:db8:1::10", "type": "pc", "x": 200, "y": 250},
                {"id": "pc2", "label": "PC2", "sublabel": "2001:db8:2::10", "type": "pc", "x": 600, "y": 250},
            ],
            "links": [
                {"from": "router1", "to": "router2", "fromLabel": "Gi0/0", "toLabel": "Gi0/0"},
                {"from": "router1", "to": "pc1", "fromLabel": "Fa0/0", "toLabel": "eth0"},
                {"from": "router2", "to": "pc2", "fromLabel": "Fa0/0", "toLabel": "eth0"},
            ]
        },

        "symptom": "La comunicación IPv6 está deshabilitada. Configura IPv6 routing en ambos routers, asigna direcciones y establece rutas para que PC1 alcance a PC2.",

        "commands": {
            "router1": [
                {"cmd": "ipv6 unicast-routing", "output": ""},
                {"cmd": "interface Fa0/0", "output": ""},
                {"cmd": "ipv6 address 2001:db8:1::1/64", "output": ""},
                {"cmd": "ipv6 address FE80::1 link-local", "output": ""},
                {"cmd": "no shutdown", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "interface Gi0/0", "output": ""},
                {"cmd": "ipv6 address 2001:db8:101::1/64", "output": ""},
                {"cmd": "no shutdown", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "ipv6 route 2001:db8:2::/64 2001:db8:101::2", "output": ""},
                {"cmd": "show ipv6 interface brief", "output": "Fa0/0                    [up/up]\n    FE80::1\n    2001:DB8:1::1\nGi0/0                    [up/up]\n    FE80::2\n    2001:DB8:101::1", "revealsFault": False},
                {"cmd": "show ipv6 route", "output": "IPv6 Routing Table - default - 3 entries\nC   2001:DB8:1::/64 [0/0]\n     via FE80::1, Fa0/0\nC   2001:DB8:101::/64 [0/0]\n     via FE80::2, Gi0/0\nS   2001:DB8:2::/64 [1/0]\n     via 2001:DB8:101::2, Gi0/0", "revealsFault": False},
            ],
            "router2": [
                {"cmd": "ipv6 unicast-routing", "output": ""},
                {"cmd": "interface Fa0/0", "output": ""},
                {"cmd": "ipv6 address 2001:db8:2::1/64", "output": ""},
                {"cmd": "ipv6 address FE80::3 link-local", "output": ""},
                {"cmd": "no shutdown", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "interface Gi0/0", "output": ""},
                {"cmd": "ipv6 address 2001:db8:101::2/64", "output": ""},
                {"cmd": "no shutdown", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "ipv6 route 2001:db8:1::/64 2001:db8:101::1", "output": ""},
                {"cmd": "show ipv6 interface brief", "output": "Fa0/0                    [up/up]\n    FE80::3\n    2001:DB8:2::1\nGi0/0                    [up/up]\n    FE80::4\n    2001:DB8:101::2", "revealsFault": False},
                {"cmd": "show ipv6 route", "output": "IPv6 Routing Table - default - 3 entries\nC   2001:DB8:2::/64 [0/0]\n     via FE80::3, Fa0/0\nC   2001:DB8:101::/64 [0/0]\n     via FE80::4, Gi0/0\nS   2001:DB8:1::/64 [1/0]\n     via 2001:DB8:101::1, Gi0/0", "revealsFault": False},
            ]
        },

        "fault": {
            "deviceId": "router1",
            "description": "El enrutamiento IPv6 no está habilitado globalmente",
            "fixCommand": "ipv6 unicast-routing"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "El enrutamiento IPv6 no está habilitado en uno de los routers", "correct": True},
            {"id": "b", "text": "Las direcciones IPv6 no están configuradas correctamente", "correct": False},
            {"id": "c", "text": "Las rutas estáticas IPv6 apuntan a la dirección equivocada", "correct": False},
        ],

        "solutionExplanation": "IPv6 en Cisco requiere: 1) Habilitar 'ipv6 unicast-routing', 2) Asignar direcciones IPv6 con 'ipv6 address', 3) Opcionalmente, direcciones link-local con 'ipv6 address <dirección> link-local', 4) Configurar rutas estáticas o dinámicas (OSPFv3). Verifica con 'show ipv6 interface brief' y 'show ipv6 route'.",

        "hints": [
            "Verifica que IPv6 routing esté habilitado con 'show ipv6 cef'.",
            "Usa 'show ipv6 interface brief' para confirmar que las direcciones IPv6 están configuradas.",
            "Con 'show ipv6 route' ves la tabla de enrutamiento IPv6.",
            "Las direcciones link-local comienzan con FE80::",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 4: Port Security en Switches (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "Port Security: Limitando MACs en puertos de acceso",
        "description": "Configura port security para limitar el número de direcciones MAC permitidas en un puerto, activar sticky learning y establecer modos de violación.",
        "difficulty": "medium",
        "subject": "redes",
        "category": "Switching",
        "points": 150,
        "estimatedTime": "12–15 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "switch1", "label": "SW1", "sublabel": "Catalyst", "type": "switch", "x": 400, "y": 100},
                {"id": "pc1", "label": "PC1", "sublabel": "00:11:22:33:44:55", "type": "pc", "x": 150, "y": 250},
                {"id": "pc2", "label": "PC2", "sublabel": "00:AA:BB:CC:DD:EE", "type": "pc", "x": 400, "y": 250},
                {"id": "pc3", "label": "PC3", "sublabel": "00:FF:FF:FF:FF:FF", "type": "pc", "x": 650, "y": 250},
            ],
            "links": [
                {"from": "switch1", "to": "pc1", "fromLabel": "Fa0/1", "toLabel": "eth0"},
                {"from": "switch1", "to": "pc2", "fromLabel": "Fa0/2", "toLabel": "eth0"},
                {"from": "switch1", "to": "pc3", "fromLabel": "Fa0/3", "toLabel": "eth0"},
            ]
        },

        "symptom": "El puerto Fa0/2 no tiene port security configurado. Habilita port security, limita a máximo 2 MACs aprendidas dinámicamente (sticky) y configura el modo de violación en 'restrict'.",

        "commands": {
            "switch1": [
                {"cmd": "interface FastEthernet0/2", "output": ""},
                {"cmd": "switchport mode access", "output": ""},
                {"cmd": "switchport port-security", "output": ""},
                {"cmd": "switchport port-security maximum 2", "output": ""},
                {"cmd": "switchport port-security mac-address sticky", "output": ""},
                {"cmd": "switchport port-security violation restrict", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "show port-security interface FastEthernet0/2", "output": "Port Security : Enabled\nPort Status : Secure-up\nViolation Mode : Restrict\nAging Time : 0 mins\nAging Type : Absolute\nSecureStatic Address Aging : Disabled\nMaximum MAC Addresses : 2\nTotal MAC Addresses : 2\nConfigured MAC Addresses : 0\nSticky MAC Addresses : 2\nLast Source Address : 00:AA:BB:CC:DD:EE\nSecurity Violation Count : 0", "revealsFault": False},
                {"cmd": "show port-security address", "output": "          Secure Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type                Ports   Remaining Age\n----    -----------       ----                -----   -------------\n   1    00:AA:BB:CC:DD:EE  SecureSticky        Fa0/2        -\n   1    00:11:22:33:44:55  SecureSticky        Fa0/2        -", "revealsFault": False},
                {"cmd": "ip dhcp snooping vlan 10", "output": ""},
                {"cmd": "ip arp inspection vlan 10", "output": ""},
            ],
            "pc1": [
                {"cmd": "show mac address", "output": "MAC Address: 00:11:22:33:44:55"},
            ],
            "pc2": [
                {"cmd": "show mac address", "output": "MAC Address: 00:AA:BB:CC:DD:EE"},
            ],
            "pc3": [
                {"cmd": "show mac address", "output": "MAC Address: 00:FF:FF:FF:FF:FF"},
            ]
        },

        "fault": {
            "deviceId": "switch1",
            "description": "Port Security no está habilitado en Fa0/2",
            "fixCommand": "switchport port-security"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "Port Security no está habilitado en el puerto", "correct": True},
            {"id": "b", "text": "El modo de violación no está configurado a 'restrict'", "correct": False},
            {"id": "c", "text": "El puerto no está en modo de acceso", "correct": False},
        ],

        "solutionExplanation": "Port Security en Cisco: 1) Configura el puerto en modo acceso: 'switchport mode access', 2) Habilita port security: 'switchport port-security', 3) Limita MACs: 'switchport port-security maximum <número>', 4) Activa sticky: 'switchport port-security mac-address sticky', 5) Establece modo de violación: 'switchport port-security violation restrict'. Verifica con 'show port-security interface'.",

        "hints": [
            "Port Security solo funciona en puertos de acceso, no en trunks.",
            "Usa 'show port-security address' para ver las MACs aprendidas.",
            "Con sticky learning, las MACs se guardan automáticamente en la running-config.",
            "Los modos de violación son: shutdown (desactiva puerto), restrict (descarta tráfico) y protect (descarta sin log).",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 5: NAT/PAT con Cisco (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "NAT Overload (PAT): Configuración básica",
        "description": "Configura NAT overload (PAT) para permitir que hosts LAN accedan a internet. Aprende a definir interfaces internas/externas y crear ACLs de NAT.",
        "difficulty": "medium",
        "subject": "redes",
        "category": "Routing",
        "points": 150,
        "estimatedTime": "15–20 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "router1", "label": "R1", "sublabel": "NAT", "type": "router", "x": 400, "y": 100},
                {"id": "lan", "label": "LAN", "sublabel": "192.168.1.0/24", "type": "switch", "x": 150, "y": 250},
                {"id": "wan", "label": "WAN", "sublabel": "203.0.113.0/24", "type": "switch", "x": 650, "y": 250},
            ],
            "links": [
                {"from": "router1", "to": "lan", "fromLabel": "Fa0/0\nInside", "toLabel": ""},
                {"from": "router1", "to": "wan", "fromLabel": "Ser0/0\nOutside", "toLabel": ""},
            ]
        },

        "symptom": "Los hosts LAN no pueden alcanzar el exterior. Configura NAT overload en el router para traducir todas las direcciones privadas a la IP pública del router.",

        "commands": {
            "router1": [
                {"cmd": "interface FastEthernet0/0", "output": ""},
                {"cmd": "ip nat inside", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "interface Serial0/0", "output": ""},
                {"cmd": "ip nat outside", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "access-list 1 permit 192.168.1.0 0.0.0.255", "output": ""},
                {"cmd": "ip nat inside source list 1 interface Serial0/0 overload", "output": ""},
                {"cmd": "ip nat inside source static 192.168.2.10 203.0.113.10", "output": ""},
                {"cmd": "show ip nat translations", "output": "Pro  Inside global      Inside local       Outside local      Outside global\ntcp 203.0.113.1:1024  192.168.1.10:1024  8.8.8.8:443        8.8.8.8:443\ntcp 203.0.113.1:1025  192.168.1.20:1024  8.8.8.8:443        8.8.8.8:443\n--- 203.0.113.10      192.168.2.10       ---                ---\n", "revealsFault": False},
                {"cmd": "show ip nat statistics", "output": "Total active translations: 3 (2 static, 1 dynamic; 1 extended)\nOutside interfaces:\n  Serial0/0\nInside interfaces:\n  FastEthernet0/0\nHits: 150  Misses: 5\nCET expired: 0\nExpired translations: 0\nDynamic mappings:\n  access-list  1 interface Serial0/0 refCount 1\n", "revealsFault": False},
                {"cmd": "clear ip nat translation *", "output": ""},
            ]
        },

        "fault": {
            "deviceId": "router1",
            "description": "Las interfaces inside/outside no están marcadas",
            "fixCommand": "ip nat inside"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "Las interfaces inside/outside no están definidas correctamente", "correct": True},
            {"id": "b", "text": "El comando 'ip nat inside source list' está incorrecto", "correct": False},
            {"id": "c", "text": "La ACL para NAT no contiene la red LAN", "correct": False},
        ],

        "solutionExplanation": "Para configurar NAT overload: 1) Marca la interfaz LAN como 'ip nat inside', 2) Marca la interfaz WAN como 'ip nat outside', 3) Crea una ACL que permita los hosts que harán NAT, 4) Aplica 'ip nat inside source list <ACL> interface <interfaz-wan> overload'. Con 'show ip nat translations' ves las traducciones activas.",

        "hints": [
            "NAT overload usa el mismo puerto externo para múltiples conexiones.",
            "Con 'ip nat inside source static' puedes hacer NAT 1-a-1 para servidores DMZ.",
            "Usa 'debug ip nat' para depurar problemas NAT (con cuidado en producción).",
            "El comando 'clear ip nat translation' limpia las traducciones activas.",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 6: EtherChannel con LACP (medium)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "EtherChannel: Agregación de links con LACP",
        "description": "Configura un bundle de 2 enlaces Ethernet entre switches usando LACP (mode active/passive). Los enlaces se verán como un único logical link en Spanning Tree.",
        "difficulty": "medium",
        "subject": "redes",
        "category": "Switching",
        "points": 150,
        "estimatedTime": "12–15 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "switch1", "label": "SW1", "sublabel": "Catalyst", "type": "switch", "x": 200, "y": 100},
                {"id": "switch2", "label": "SW2", "sublabel": "Catalyst", "type": "switch", "x": 600, "y": 100},
                {"id": "vlan10", "label": "VLAN 10", "sublabel": "10.0.0.0/24", "type": "server", "x": 200, "y": 280},
                {"id": "vlan20", "label": "VLAN 20", "sublabel": "10.1.0.0/24", "type": "server", "x": 600, "y": 280},
            ],
            "links": [
                {"from": "switch1", "to": "switch2", "fromLabel": "Fa0/1, Fa0/2", "toLabel": "Fa0/1, Fa0/2"},
                {"from": "switch1", "to": "vlan10", "fromLabel": "SVI VLAN 10", "toLabel": ""},
                {"from": "switch2", "to": "vlan20", "fromLabel": "SVI VLAN 20", "toLabel": ""},
            ]
        },

        "symptom": "Los dos enlaces entre switches están en modo standby. Agrúpalos con LACP (port-channel) para utilizar ambos links simultáneamente y aumentar el ancho de banda.",

        "commands": {
            "switch1": [
                {"cmd": "interface range FastEthernet0/1 - 2", "output": ""},
                {"cmd": "channel-group 1 mode active", "output": "Creating a port-channel interface Port-channel1"},
                {"cmd": "exit", "output": ""},
                {"cmd": "interface Port-channel1", "output": ""},
                {"cmd": "switchport mode trunk", "output": ""},
                {"cmd": "switchport trunk encapsulation dot1q", "output": ""},
                {"cmd": "switchport trunk allowed vlan 1,10,20", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "show etherchannel summary", "output": "Flags:  D - down        P - bundled in port-channel\n        I - stand-alone s - suspended\n        H - Hot-standby (LACP only)\n        R - Layer3       S - Layer2\n        U - in use       f - failed to allocate aggregator\nNumber of channel-groups in use: 1\nNumber of aggregators:           1\nGroup  Port-channel  Protocol    Ports\n------+-------------+-----------+-----------------------------------------------\n1      Po1(SU)       LACP        Fa0/1(P)   Fa0/2(P)", "revealsFault": False},
                {"cmd": "show interfaces port-channel 1", "output": "Port-channel1 is up, line protocol is up (connected)\n  Hardware is EtherChannel, address is 0000.0001.0001 (bia 0000.0001.0001)\n  MTU 1500 bytes, BW 200000 Kbit/sec\n  Encapsulation ARPA, loopback not set\n  Keepalive set (10 sec)\n  Full-duplex, 100Mb/s\n  Spanning tree enabled protocol rstp\n  Transmit load balancing: Adaptive\n  Receive load balancing: Adaptive\nMembers in this channel: 2\n  Fa0/1\n  Fa0/2", "revealsFault": False},
            ],
            "switch2": [
                {"cmd": "interface range FastEthernet0/1 - 2", "output": ""},
                {"cmd": "channel-group 1 mode passive", "output": "Creating a port-channel interface Port-channel1"},
                {"cmd": "exit", "output": ""},
                {"cmd": "interface Port-channel1", "output": ""},
                {"cmd": "switchport mode trunk", "output": ""},
                {"cmd": "switchport trunk encapsulation dot1q", "output": ""},
                {"cmd": "switchport trunk allowed vlan 1,10,20", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "show etherchannel summary", "output": "Flags:  D - down        P - bundled in port-channel\n        I - stand-alone s - suspended\n        H - Hot-standby (LACP only)\n        R - Layer3       S - Layer2\n        U - in use       f - failed to allocate aggregator\nNumber of channel-groups in use: 1\nNumber of aggregators:           1\nGroup  Port-channel  Protocol    Ports\n------+-------------+-----------+-----------------------------------------------\n1      Po1(SU)       LACP        Fa0/1(P)   Fa0/2(P)", "revealsFault": False},
                {"cmd": "show interfaces port-channel 1", "output": "Port-channel1 is up, line protocol is up (connected)\n  Hardware is EtherChannel, address is 0000.0002.0002 (bia 0000.0002.0002)\n  MTU 1500 bytes, BW 200000 Kbit/sec\n  Encapsulation ARPA, loopback not set\n  Keepalive set (10 sec)\n  Full-duplex, 100Mb/s\n  Spanning tree enabled protocol rstp\n  Transmit load balancing: Adaptive\n  Receive load balancing: Adaptive\nMembers in this channel: 2\n  Fa0/1\n  Fa0/2", "revealsFault": False},
            ]
        },

        "fault": {
            "deviceId": "switch1",
            "description": "Los puertos no están agrupados en un channel-group",
            "fixCommand": "channel-group 1 mode active"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "El channel-group no está configurado en los puertos", "correct": True},
            {"id": "b", "text": "El modo LACP no es compatible entre los switches", "correct": False},
            {"id": "c", "text": "Los puertos están deshabilitados", "correct": False},
        ],

        "solutionExplanation": "EtherChannel con LACP: 1) Agrupa los puertos con 'channel-group <número> mode active/passive', 2) Configura la interfaz lógica Port-channel con trunking si es necesario, 3) Verifica con 'show etherchannel summary' (debe mostrar 'P' para bundled). LACP activo negocia automáticamente con el otro extremo.",

        "hints": [
            "En 'show etherchannel summary', los puertos con (P) están en el port-channel.",
            "Usa 'show interfaces port-channel <número>' para ver detalles del bundle.",
            "LACP permite negociación automática (active-passive o active-active).",
            "Ambos extremos deben tener el mismo number de channel-group.",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 7: QoS Básico — Marcado y Colas (hard)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "QoS: Marcado DSCP y Colas de Prioridad",
        "description": "Implementa QoS para priorizar tráfico de voz (VoIP) sobre HTTP. Usa class-maps, policy-maps y marcado DSCP/CoS para diferenciar servicios.",
        "difficulty": "hard",
        "subject": "redes",
        "category": "QoS",
        "points": 200,
        "estimatedTime": "20–25 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "router1", "label": "R1", "sublabel": "QoS", "type": "router", "x": 400, "y": 100},
                {"id": "voip", "label": "VoIP", "sublabel": "RTP", "type": "phone", "x": 150, "y": 250},
                {"id": "http", "label": "HTTP", "sublabel": "Web", "type": "server", "x": 400, "y": 250},
                {"id": "ftp", "label": "FTP", "sublabel": "Datos", "type": "server", "x": 650, "y": 250},
            ],
            "links": [
                {"from": "router1", "to": "voip", "fromLabel": "Fa0/0", "toLabel": ""},
                {"from": "router1", "to": "http", "fromLabel": "Fa0/1", "toLabel": ""},
                {"from": "router1", "to": "ftp", "fromLabel": "Fa0/2", "toLabel": ""},
            ]
        },

        "symptom": "No hay QoS configurado. La voz IP se degrada cuando hay transferencias HTTP. Implementa clases de tráfico para priorizar VoIP (EF) y HTTP (AF31).",

        "commands": {
            "router1": [
                {"cmd": "class-map match-any VOIP", "output": ""},
                {"cmd": "match protocol rtp", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "class-map match-any HTTP", "output": ""},
                {"cmd": "match protocol http", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "policy-map QOS-POLICY", "output": ""},
                {"cmd": "class VOIP", "output": ""},
                {"cmd": "priority 512", "output": ""},
                {"cmd": "set dscp ef", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "class HTTP", "output": ""},
                {"cmd": "bandwidth 1024", "output": ""},
                {"cmd": "set dscp af31", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "class class-default", "output": ""},
                {"cmd": "fair-queue", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "interface FastEthernet0/3", "output": ""},
                {"cmd": "service-policy output QOS-POLICY", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "show policy-map interface FastEthernet0/3", "output": "  Service Policy : QOS-POLICY\n    Class Map: VOIP\n      Match: protocol rtp\n      Priority: 512 Kbps, Burst Bytes 12800\n      Output Queue: Conversation 265\n        Bandwidth 512 (kbps) Packets Dropped/Marked 2\n        tail/random drops/no drop\n\n    Class Map: HTTP\n      Match: protocol http\n      Queueing Strategy: Weighted Fair\n      Bandwidth 1024 (%) Packets Dropped/Marked 0\n\n    Class Map: class-default\n      Match: any\n      Queueing Strategy: Fair Queueing", "revealsFault": False},
            ]
        },

        "fault": {
            "deviceId": "router1",
            "description": "Las class-maps no están definidas",
            "fixCommand": "class-map match-any VOIP"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "Las class-maps y policy-maps no están configuradas", "correct": True},
            {"id": "b", "text": "El marcado DSCP no está aplicado a las clases", "correct": False},
            {"id": "c", "text": "La policy-map no está aplicada a la interfaz", "correct": False},
        ],

        "solutionExplanation": "QoS básico: 1) Define clases con 'class-map' para identificar tráfico, 2) Crea políticas con 'policy-map' y asigna acciones (priority, bandwidth, set dscp), 3) Aplica con 'service-policy output <map>' en la interfaz. DSCP EF (46) es para voz crítica, AF31 para datos importantes. Verifica con 'show policy-map interface'.",

        "hints": [
            "Usa 'match protocol' para identificar tráfico (requiere NBAR o configuración)",
            "Priority queue garantiza ancho de banda mínimo para VoIP.",
            "DSCP EF = expedited forwarding (46), AF = assured forwarding",
            "Con 'show policy-map' ves qué tráfico coincide cada clase y qué se droppea.",
        ]
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MÓDULO 8: Troubleshooting de Red — Escenario realista (hard)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "title": "Troubleshooting: Diagnóstico y Resolución de múltiples fallos",
        "description": "Una red con múltiples problemas: gateway incorrecto, máscara equivocada, duplex mismatch, rutas faltantes y ACL bloqueando tráfico. Diagnostica y soluciona cada problema.",
        "difficulty": "hard",
        "subject": "redes",
        "category": "Troubleshooting",
        "points": 250,
        "estimatedTime": "25–30 min",

        "topology": {
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "router1", "label": "R1", "sublabel": "Core", "type": "router", "x": 200, "y": 100},
                {"id": "router2", "label": "R2", "sublabel": "Branch", "type": "router", "x": 600, "y": 100},
                {"id": "switch1", "label": "SW1", "sublabel": "LAN1", "type": "switch", "x": 200, "y": 250},
                {"id": "switch2", "label": "SW2", "sublabel": "LAN2", "type": "switch", "x": 600, "y": 250},
                {"id": "pc1", "label": "PC1", "sublabel": "10.0.0.10", "type": "pc", "x": 100, "y": 350},
                {"id": "pc2", "label": "PC2", "sublabel": "10.1.0.10", "type": "pc", "x": 700, "y": 350},
            ],
            "links": [
                {"from": "router1", "to": "router2", "fromLabel": "Gi0/0", "toLabel": "Gi0/0", "faulty": True},
                {"from": "router1", "to": "switch1", "fromLabel": "Fa0/0", "toLabel": "VLAN1"},
                {"from": "router2", "to": "switch2", "fromLabel": "Fa0/0", "toLabel": "VLAN2"},
                {"from": "switch1", "to": "pc1", "fromLabel": "Fa0/1", "toLabel": "eth0"},
                {"from": "switch2", "to": "pc2", "fromLabel": "Fa0/1", "toLabel": "eth0"},
            ]
        },

        "symptom": "PC1 no alcanza PC2. Hay múltiples problemas en la red: verificación de interfaces, tabla de rutas, ACLs y configuración de subredes. Diagnostica cada problema y soluciona.",

        "commands": {
            "router1": [
                {"cmd": "show ip interface brief", "output": "Interface                  IP-Address      OK? Method Status                Protocol\nFastEthernet0/0            10.0.0.1        YES manual up                    up\nGigabitEthernet0/0         172.16.0.1      YES NVRAM  up                    down", "revealsFault": True},
                {"cmd": "show running-config interface GigabitEthernet0/0", "output": "interface GigabitEthernet0/0\n ip address 172.16.0.1 255.255.255.128\n duplex full\n speed auto\nend"},
                {"cmd": "show interfaces GigabitEthernet0/0", "output": "GigabitEthernet0/0 is up, line protocol is down (no carrier)\n  Hardware is Gigabit Ethernet, address is 0000.1111.1111 (bia 0000.1111.1111)\n  Internet address is 172.16.0.1/25\n  MTU 1500 bytes, BW 1000000 Kbit/sec\n  Encapsulation ARPA, loopback not set\n  Keepalive set (10 sec)\n  Full-duplex, 1000Mb/s\n  Error: Duplex mismatch with R2"},
                {"cmd": "show ip route", "output": "C    10.0.0.0/24 [0/0] via FastEthernet0/0\nC    172.16.0.0/25 [0/0] via GigabitEthernet0/0"},
                {"cmd": "show access-lists", "output": "Extended IP access list 100\n    10 permit tcp any any eq 80\n    20 permit tcp any any eq 443\n    30 deny ip any 10.1.0.0 0.0.0.255\n    40 permit ip any any"},
                {"cmd": "show ip interface Fa0/0 accounting", "output": "Protocol    Pkts In   Chars In   Pkts Out  Chars Out\nIP              10      1240         5       620"},
                {"cmd": "no access-list 100", "output": ""},
                {"cmd": "interface GigabitEthernet0/0", "output": ""},
                {"cmd": "duplex auto", "output": ""},
                {"cmd": "speed auto", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "ip route 10.1.0.0 255.255.255.0 172.16.0.2", "output": ""},
            ],
            "router2": [
                {"cmd": "show ip interface brief", "output": "Interface                  IP-Address      OK? Method Status                Protocol\nFastEthernet0/0            10.1.0.1        YES manual up                    up\nGigabitEthernet0/0         172.16.0.2      YES NVRAM  up                    down"},
                {"cmd": "show running-config interface GigabitEthernet0/0", "output": "interface GigabitEthernet0/0\n ip address 172.16.0.130 255.255.255.128\n duplex half\n speed 100\nend"},
                {"cmd": "show interfaces GigabitEthernet0/0", "output": "GigabitEthernet0/0 is up, line protocol is down (no carrier)\n  Hardware is Gigabit Ethernet, address is 0000.2222.2222 (bia 0000.2222.2222)\n  Internet address is 172.16.0.130/25\n  MTU 1500 bytes, BW 1000000 Kbit/sec\n  Encapsulation ARPA, loopback not set\n  Keepalive set (10 sec)\n  Half-duplex, 100Mb/s\n  Error: Duplex and speed mismatch with R1, IP conflict possible"},
                {"cmd": "show ip route", "output": "C    10.1.0.0/24 [0/0] via FastEthernet0/0\nC    172.16.0.0/25 [0/0] via GigabitEthernet0/0"},
                {"cmd": "interface GigabitEthernet0/0", "output": ""},
                {"cmd": "ip address 172.16.0.2 255.255.255.0", "output": ""},
                {"cmd": "duplex full", "output": ""},
                {"cmd": "speed 1000", "output": ""},
                {"cmd": "exit", "output": ""},
                {"cmd": "ip route 10.0.0.0 255.255.255.0 172.16.0.1", "output": ""},
            ],
            "switch1": [
                {"cmd": "show interfaces status", "output": "Port      Name               Status       Vlan       Duplex Speed Type\nFa0/1                        connected    1            auto   auto 10/100BaseTX\nFa0/2                        notconnect   1            auto   auto 10/100BaseTX"},
            ],
            "switch2": [
                {"cmd": "show interfaces status", "output": "Port      Name               Status       Vlan       Duplex Speed Type\nFa0/1                        connected    1            auto   auto 10/100BaseTX\nFa0/2                        notconnect   1            auto   auto 10/100BaseTX"},
            ]
        },

        "fault": {
            "deviceId": "router1",
            "description": "Múltiples problemas: duplex mismatch en Gi0/0, ACL 100 bloqueando tráfico hacia 10.1.0.0, falta ruta a 10.1.0.0/24, y conflicto de subredes",
            "fixCommand": "ip route 10.1.0.0 255.255.255.0 172.16.0.2"
        },

        "diagnosisOptions": [
            {"id": "a", "text": "Múltiples problemas: duplex mismatch, ACL bloqueando, rutas faltantes y subredes conflictivas", "correct": True},
            {"id": "b", "text": "Solo hay un duplex mismatch en Gi0/0", "correct": False},
            {"id": "c", "text": "La ACL no está relacionada con el problema de conectividad", "correct": False},
        ],

        "solutionExplanation": "Troubleshooting de red: 1) Usa 'show ip interface brief' para ver estado, 2) Con 'show interfaces' detecta duplex/speed mismatch, 3) Verifica 'show ip route' para rutas faltantes, 4) Analiza 'show access-lists' para descartar bloqueos, 5) Usa 'show running-config' para revisar configuraciones. Soluciona cada problema: alinea duplex/speed, elimina ACLs bloqueantes, añade rutas estáticas y corrige máscaras de subred.",

        "hints": [
            "El error 'no carrier' en Gi0/0 indica problemas físicos o configuración incompatible.",
            "Un 'duplex mismatch' cause colisiones y degradación severa.",
            "Con 'show access-lists' ves exactamente qué tráfico se bloquea.",
            "Verifica SIEMPRE que las subredes sean consistentes en ambos extremos de un link.",
        ]
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# INSERTION FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def bulk_insert_netlabs(netlabs_list):
    """Insert NetLab scenarios, checking for duplicates by title."""
    from database import NetLabScenario

    db = SessionLocal()
    try:
        count = 0
        for nl_data in netlabs_list:
            # Check if scenario already exists by title
            exists = db.query(NetLabScenario).filter(
                NetLabScenario.title == nl_data['title']
            ).first()

            if exists:
                print(f"⚠  '{nl_data['title']}' ya existe — omitiendo")
                continue

            # Create NetLabScenario record
            scenario = NetLabScenario(
                title=nl_data['title'],
                description=nl_data['description'],
                difficulty=nl_data['difficulty'],
                subject=nl_data['subject'],
                category=nl_data['category'],
                points=nl_data['points'],
                estimated_time=nl_data.get('estimatedTime', '15–20 min'),
                topology=json.dumps(nl_data.get('topology', {}), ensure_ascii=False),
                symptom=nl_data['symptom'],
                commands=json.dumps(nl_data.get('commands', {}), ensure_ascii=False),
                fault=json.dumps(nl_data.get('fault', {}), ensure_ascii=False),
                diagnosis_options=json.dumps(nl_data.get('diagnosisOptions', []), ensure_ascii=False),
                solution_explanation=nl_data.get('solutionExplanation', ''),
                hints=json.dumps(nl_data.get('hints', []), ensure_ascii=False),
                is_active=True,
                created_at=datetime.utcnow(),
            )
            db.add(scenario)
            count += 1

        db.commit()

        easy   = sum(1 for nl in netlabs_list if nl['difficulty'] == 'easy')
        medium = sum(1 for nl in netlabs_list if nl['difficulty'] == 'medium')
        hard   = sum(1 for nl in netlabs_list if nl['difficulty'] == 'hard')

        print(f"\n✅ Insertados {count} escenarios NetLabs avanzados")
        print(f"    Easy: {easy}  |  Medium: {medium}  |  Hard: {hard}")
        print(f"    Subject: redes\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error durante la inserción: {e}\n")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧  Iniciando seed de escenarios NetLabs avanzados...")
    bulk_insert_netlabs(NETLABS)
