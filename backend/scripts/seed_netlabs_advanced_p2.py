"""
seed_netlabs_advanced_p2.py — Part 2
IPv6, Port Security, DHCP Snooping, DAI
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
    # MODULE 3: IPv6 EN CISCO IOS
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="Direccionamiento IPv6 estático",
        description="Configura direcciones IPv6 estáticas. Aprende 'ipv6 unicast-routing' y 'ipv6 address'.",
        difficulty="easy",
        category="Addressing",
        points=100,
        estimated_time="15–20 min",
        topology={
            "viewBox": "0 0 700 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "R1", "x": 200, "y": 150},
                {"id": "PC1", "type": "pc", "label": "PC1\n2001:DB8:1::10/64", "x": 100, "y": 150},
                {"id": "PC2", "type": "pc", "label": "PC2\n2001:DB8:2::10/64", "x": 300, "y": 150},
                {"id": "R2", "type": "router", "label": "R2", "x": 500, "y": 150},
            ],
            "links": [
                {"from": "PC1", "to": "R1", "fromLabel": "eth0", "toLabel": "G0/0"},
                {"from": "R1", "to": "R2", "fromLabel": "G0/1", "toLabel": "G0/0"},
                {"from": "R2", "to": "PC2", "fromLabel": "G0/1", "toLabel": "eth0"},
            ]
        },
        symptom="Los PCs no pueden alcanzarse por IPv6. Los routers no tienen enrutamiento IPv6.",
        commands={
            "R1": [
                {"cmd": "show ipv6 interface brief", "output": "No IPv6 configured", "revealsFault": True},
                {"cmd": "ipv6 unicast-routing", "output": "IPv6 routing enabled", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ipv6 address 2001:DB8:1::1/64", "output": "", "revealsFault": False},
                {"cmd": "no shutdown", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface G0/1", "output": "", "revealsFault": False},
                {"cmd": "ipv6 address 2001:DB8:12::1/64", "output": "", "revealsFault": False},
                {"cmd": "no shutdown", "output": "", "revealsFault": False},
                {"cmd": "show ipv6 interface brief", "output": "G0/0: 2001:DB8:1::1/64\nG0/1: 2001:DB8:12::1/64", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "ipv6 unicast-routing", "output": "", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ipv6 address 2001:DB8:12::2/64", "output": "", "revealsFault": False},
                {"cmd": "no shutdown", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface G0/1", "output": "", "revealsFault": False},
                {"cmd": "ipv6 address 2001:DB8:2::1/64", "output": "", "revealsFault": False},
                {"cmd": "no shutdown", "output": "", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R1",
            "description": "IPv6 no está habilitado.",
            "fixCommand": "ipv6 unicast-routing + ipv6 address en interfaces"
        },
        diagnosis_options=[
            {"id": "a", "text": "Falta 'ipv6 unicast-routing'", "correct": True},
            {"id": "b", "text": "No hay direcciones IPv6 asignadas", "correct": True},
            {"id": "c", "text": "La notación /64 es correcta", "correct": False},
            {"id": "d", "text": "No se puede mezclar IPv4 e IPv6 en la misma interfaz", "correct": False},
        ],
        solution_explanation="Para IPv6: 1) 'ipv6 unicast-routing' en global. 2) 'ipv6 address 2001:DB8:1::1/64' en interfaz. 3) 'no shutdown'. Usa 'show ipv6 interface brief'.",
        hints=[
            "IPv6 no funciona sin 'ipv6 unicast-routing'.",
            "La notación /64 es estándar para subredes.",
            "Link-local (FE80::/10) se asigna automáticamente.",
            "'show ipv6 route' muestra la tabla de enrutamiento IPv6.",
        ]
    ),

    build_scenario(
        title="Rutas estáticas IPv6 y link-local",
        description="Configura rutas estáticas IPv6 y aprende sobre link-local, global unicast y multicast.",
        difficulty="medium",
        category="Addressing",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 800 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "R1 (HQ)", "x": 150, "y": 150},
                {"id": "R2", "type": "router", "label": "R2 (Branch)", "x": 400, "y": 150},
                {"id": "ISP", "type": "router", "label": "ISP Router", "x": 650, "y": 150},
            ],
            "links": [
                {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/0"},
                {"from": "R2", "to": "ISP", "fromLabel": "G0/1", "toLabel": "G0/0"},
            ]
        },
        symptom="R1 necesita alcanzar redes remotas a través de R2. Las rutas estáticas IPv6 no están configuradas.",
        commands={
            "R1": [
                {"cmd": "show ipv6 route", "output": "No static routes", "revealsFault": True},
                {"cmd": "ipv6 route 2001:DB8:2::/48 2001:DB8:12::2", "output": "", "revealsFault": False},
                {"cmd": "ipv6 route ::/0 2001:DB8:12::2", "output": "", "revealsFault": False},
                {"cmd": "show ipv6 route", "output": "S   2001:DB8:2::/48 [1/0] via 2001:DB8:12::2", "revealsFault": False},
                {"cmd": "show ipv6 interface G0/0", "output": "Link-local: FE80::1\nGlobal: 2001:DB8:1::1", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "ipv6 route 2001:DB8:1::/48 2001:DB8:12::1", "output": "", "revealsFault": False},
                {"cmd": "ipv6 route ::/0 2001:DB8:23::2", "output": "", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R1",
            "description": "No hay rutas estáticas IPv6.",
            "fixCommand": "ipv6 route <destino> <next-hop>"
        },
        diagnosis_options=[
            {"id": "a", "text": "Faltan rutas estáticas IPv6", "correct": True},
            {"id": "b", "text": "Se puede usar link-local como next-hop", "correct": True},
            {"id": "c", "text": "'::/0' es la ruta por defecto", "correct": True},
            {"id": "d", "text": "Las rutas IPv6 son autoconfigurables", "correct": False},
        ],
        solution_explanation="'ipv6 route <destino> <next-hop>'. Link-local (FE80::/10) se genera automáticamente. Global unicast (2001:DB8::/prefix) se configura manualmente. '::/0' es la ruta por defecto.",
        hints=[
            "El /prefix en IPv6 es obligatorio.",
            "Link-local es suficiente para next-hop.",
            "Usa 'show ipv6 interface' para ver direcciones.",
            "'ping ipv6' verifica conectividad.",
        ]
    ),

    build_scenario(
        title="OSPFv3 para IPv6",
        description="Configura OSPFv3 para enrutar IPv6. Aprende 'ipv6 router ospf' e 'ipv6 ospf'.",
        difficulty="hard",
        category="Routing",
        points=200,
        estimated_time="25–30 min",
        topology={
            "viewBox": "0 0 900 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "R1", "x": 150, "y": 150},
                {"id": "R2", "type": "router", "label": "R2", "x": 450, "y": 150},
                {"id": "R3", "type": "router", "label": "R3", "x": 750, "y": 150},
            ],
            "links": [
                {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/0"},
                {"from": "R2", "to": "R3", "fromLabel": "G0/1", "toLabel": "G0/0"},
            ]
        },
        symptom="Tres routers con IPv6 necesitan aprender mutuamente sus redes. OSPFv3 no está activo.",
        commands={
            "R1": [
                {"cmd": "show ipv6 ospf neighbor", "output": "No OSPFv3 configured", "revealsFault": True},
                {"cmd": "ipv6 router ospf 1", "output": "OSPFv3 process 1 created", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ipv6 ospf 1 area 0", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ipv6 ospf neighbor", "output": "Neighbor 2001:DB8:12::2 FULL", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "ipv6 router ospf 1", "output": "", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ipv6 ospf 1 area 0", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface G0/1", "output": "", "revealsFault": False},
                {"cmd": "ipv6 ospf 1 area 0", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
            ],
            "R3": [
                {"cmd": "ipv6 router ospf 1", "output": "", "revealsFault": False},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ipv6 ospf 1 area 0", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ipv6 route ospf", "output": "O   2001:DB8:1::/64\nO   2001:DB8:2::/64", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R1",
            "description": "OSPFv3 no está configurado.",
            "fixCommand": "ipv6 router ospf 1 + ipv6 ospf 1 area 0 en interfaces"
        },
        diagnosis_options=[
            {"id": "a", "text": "Falta 'ipv6 router ospf 1'", "correct": True},
            {"id": "b", "text": "Las interfaces no tienen 'ipv6 ospf 1 area 0'", "correct": True},
            {"id": "c", "text": "OSPFv3 se configura por interfaz, no con network statements", "correct": True},
            {"id": "d", "text": "El proceso debe ser OSPFv2, no OSPFv3", "correct": False},
        ],
        solution_explanation="OSPFv3 es para IPv6. 1) 'ipv6 router ospf <num>'. 2) En interfaz: 'ipv6 ospf <num> area <area>'. 3) Sin network statements. Usa 'show ipv6 ospf neighbor' y 'show ipv6 route ospf'.",
        hints=[
            "OSPFv3 es para IPv6; OSPFv2 para IPv4.",
            "Las interfaces deben tener IPv6 válidas.",
            "Link-local se genera automáticamente.",
            "El área 0 es el backbone.",
        ]
    ),

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 4: SEGURIDAD EN SWITCHES
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="Port Security - Limitar MACs por puerto",
        description="Configura Port Security para limitar MACs por puerto. Aprende 'switchport port-security' y violation modes.",
        difficulty="easy",
        category="Security",
        points=100,
        estimated_time="15–20 min",
        topology={
            "viewBox": "0 0 800 300",
            "nodes": [
                {"id": "SW1", "type": "switch", "label": "Switch 1", "x": 400, "y": 150},
                {"id": "PC1", "type": "pc", "label": "PC1\n(AAA.AAA.AAA)", "x": 200, "y": 150},
                {"id": "PC2", "type": "pc", "label": "PC2\n(BBB.BBB.BBB)", "x": 600, "y": 150},
            ],
            "links": [
                {"from": "PC1", "to": "SW1", "fromLabel": "eth0", "toLabel": "Fa0/1"},
                {"from": "PC2", "to": "SW1", "fromLabel": "eth0", "toLabel": "Fa0/2"},
            ]
        },
        symptom="El puerto Fa0/1 debe permitir solo 1 MAC (PC1). Si otra PC intenta conectarse, el puerto se cierra.",
        commands={
            "SW1": [
                {"cmd": "show port-security interface Fa0/1", "output": "Port Security is disabled", "revealsFault": True},
                {"cmd": "interface Fa0/1", "output": "", "revealsFault": False},
                {"cmd": "switchport mode access", "output": "", "revealsFault": False},
                {"cmd": "switchport port-security", "output": "Port Security enabled", "revealsFault": False},
                {"cmd": "switchport port-security maximum 1", "output": "", "revealsFault": False},
                {"cmd": "switchport port-security violation shutdown", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show port-security interface Fa0/1", "output": "Port Security: Enabled\nViolation mode: shutdown\nMax allowed: 1", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "SW1",
            "description": "Port Security no está habilitado en Fa0/1.",
            "fixCommand": "switchport port-security + switchport port-security maximum"
        },
        diagnosis_options=[
            {"id": "a", "text": "Port Security no está habilitado", "correct": True},
            {"id": "b", "text": "El máximo de MACs no está limitado a 1", "correct": True},
            {"id": "c", "text": "El violation mode debería ser shutdown", "correct": False},
            {"id": "d", "text": "Port Security requiere modo trunk", "correct": False},
        ],
        solution_explanation="Port Security: 1) 'switchport mode access'. 2) 'switchport port-security'. 3) 'switchport port-security maximum <num>'. 4) 'switchport port-security violation <restrict|protect|shutdown>'. Usa 'show port-security interface'.",
        hints=[
            "Port Security solo funciona en acceso estático.",
            "Violation mode shutdown desactiva el puerto (err-disabled).",
            "sticky aprende y guarda MACs en running-config.",
            "'errdisable recovery' recupera puertos automáticamente.",
        ]
    ),

    build_scenario(
        title="DHCP Snooping",
        description="Configura DHCP Snooping para confiar solo en puertos upstream. Aprende 'ip dhcp snooping'.",
        difficulty="medium",
        category="Security",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "SW1", "type": "switch", "label": "Switch", "x": 400, "y": 200},
                {"id": "DHCP", "type": "server", "label": "DHCP Server", "x": 200, "y": 50},
                {"id": "PC1", "type": "pc", "label": "PC1 (Legit)", "x": 600, "y": 300},
                {"id": "PC2", "type": "pc", "label": "PC2 (Rogue)", "x": 600, "y": 150},
            ],
            "links": [
                {"from": "DHCP", "to": "SW1", "fromLabel": "eth0", "toLabel": "Fa0/24"},
                {"from": "SW1", "to": "PC1", "fromLabel": "Fa0/1", "toLabel": "eth0"},
                {"from": "SW1", "to": "PC2", "fromLabel": "Fa0/2", "toLabel": "eth0"},
            ]
        },
        symptom="Un atacante en Fa0/2 ejecuta un DHCP rogue server. DHCP Snooping debe confiar solo en Fa0/24 (DHCP legítimo).",
        commands={
            "SW1": [
                {"cmd": "show ip dhcp snooping binding", "output": "DHCP Snooping is disabled", "revealsFault": True},
                {"cmd": "ip dhcp snooping", "output": "DHCP Snooping enabled globally", "revealsFault": False},
                {"cmd": "ip dhcp snooping vlan 1", "output": "", "revealsFault": False},
                {"cmd": "interface Fa0/24", "output": "", "revealsFault": False},
                {"cmd": "ip dhcp snooping trust", "output": "Port trusted for DHCP", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface Fa0/1", "output": "", "revealsFault": False},
                {"cmd": "ip dhcp snooping limit rate 100", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ip dhcp snooping binding", "output": "Bindings learned and stored", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "SW1",
            "description": "DHCP Snooping no está habilitado.",
            "fixCommand": "ip dhcp snooping + ip dhcp snooping vlan + trust puertos upstream"
        },
        diagnosis_options=[
            {"id": "a", "text": "DHCP Snooping no está activo globalmente", "correct": True},
            {"id": "b", "text": "La VLAN no tiene DHCP Snooping habilitado", "correct": True},
            {"id": "c", "text": "Los puertos untrusted no tienen rate limiting", "correct": False},
            {"id": "d", "text": "Los puertos trusted deben bloquear DHCP", "correct": False},
        ],
        solution_explanation="DHCP Snooping: 1) 'ip dhcp snooping' global. 2) 'ip dhcp snooping vlan <vlan>'. 3) 'ip dhcp snooping trust' en puertos DHCP legítimos. 4) Los untrusted limitan rate de ofertas. Usa 'show ip dhcp snooping binding'.",
        hints=[
            "Trusted: solo puertos hacia DHCP server.",
            "Untrusted: puertos de usuarios (por defecto).",
            "'ip dhcp snooping limit rate' protege contra DoS.",
            "Depende de VLAN database.",
        ]
    ),

    build_scenario(
        title="Dynamic ARP Inspection (DAI)",
        description="Configura DAI para prevenir ARP spoofing. Depende de DHCP Snooping.",
        difficulty="medium",
        category="Security",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 800 400",
            "nodes": [
                {"id": "SW1", "type": "switch", "label": "Switch", "x": 400, "y": 200},
                {"id": "DHCP", "type": "server", "label": "DHCP Server", "x": 150, "y": 50},
                {"id": "PC1", "type": "pc", "label": "PC1 (Legit)", "x": 600, "y": 300},
                {"id": "Attacker", "type": "pc", "label": "Attacker", "x": 600, "y": 150},
            ],
            "links": [
                {"from": "DHCP", "to": "SW1", "fromLabel": "eth0", "toLabel": "Fa0/24"},
                {"from": "SW1", "to": "PC1", "fromLabel": "Fa0/1", "toLabel": "eth0"},
                {"from": "SW1", "to": "Attacker", "fromLabel": "Fa0/2", "toLabel": "eth0"},
            ]
        },
        symptom="Un atacante envía ARP replies falsificadas (ARP spoofing). DAI debería filtrar estos paquetes.",
        commands={
            "SW1": [
                {"cmd": "show ip arp inspection vlan 1", "output": "DAI is not enabled", "revealsFault": True},
                {"cmd": "ip arp inspection vlan 1", "output": "DAI enabled on vlan 1", "revealsFault": False},
                {"cmd": "interface Fa0/24", "output": "", "revealsFault": False},
                {"cmd": "ip arp inspection trust", "output": "Port trusted for ARP", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "interface Fa0/1", "output": "", "revealsFault": False},
                {"cmd": "ip arp inspection limit rate 15", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ip arp inspection vlan 1", "output": "DAI enabled, inspecting requests/replies", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "SW1",
            "description": "DAI no está habilitado en la VLAN.",
            "fixCommand": "ip arp inspection vlan + trust puertos DHCP"
        },
        diagnosis_options=[
            {"id": "a", "text": "DAI no está habilitado en la VLAN", "correct": True},
            {"id": "b", "text": "Los puertos DHCP server no están marcados como trusted", "correct": True},
            {"id": "c", "text": "DAI depende de DHCP Snooping para la tabla de bindings", "correct": True},
            {"id": "d", "text": "DAI solo protege contra IP spoofing", "correct": False},
        ],
        solution_explanation="DAI previene ARP spoofing: 1) 'ip arp inspection vlan <vlan>'. 2) 'ip arp inspection trust' en puertos DHCP. 3) Depende de DHCP Snooping. 4) Inspecciona ARP requests y replies contra bindings. Usa 'show ip arp inspection vlan'.",
        hints=[
            "DAI requiere DHCP Snooping habilitado.",
            "Trusted: solo puertos DHCP server.",
            "'ip arp inspection limit rate' protege contra DoS.",
            "ARP ACLs pueden permitir hosts estáticos sin DHCP.",
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

        print(f"\n✓ Insertados {count} escenarios (Part 2)")
        print(f"  Easy: {easy}  |  Medium: {medium}  |  Hard: {hard}")
        print(f"  Módulos: IPv6, Port Security, DHCP Snooping, DAI\n")
    except Exception as e:
        db.rollback()
        print(f"\nError: {e}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*80)
    print("  NetLabs Avanzados Part 2 — IPv6 & Security")
    print("="*80 + "\n")
    bulk_insert(SCENARIOS)
