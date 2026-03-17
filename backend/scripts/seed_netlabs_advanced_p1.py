"""
seed_netlabs_advanced_p1.py — Part 1
═══════════════════════════════════════════════════════════════════════════════
NetLabs — Advanced Networking Scenarios (OSPF, BGP, IPv6)
═══════════════════════════════════════════════════════════════════════════════
Adds interactive Cisco CLI simulator scenarios for:
  • OSPF Multiárea (single-area, multi-area with ABR, MD5 auth)
  • BGP Básico (eBGP, LOCAL_PREF, MED)
  • IPv6 en Cisco IOS (static addressing, static routes, OSPFv3)

Usage:
    cd /path/to/backend
    python scripts/seed_netlabs_advanced_p1.py
═══════════════════════════════════════════════════════════════════════════════
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


def build_scenario(
    title, description, difficulty, category, points, estimated_time,
    topology, symptom, commands, fault, diagnosis_options, solution_explanation, hints
):
    """Helper to construct a NetLabScenario dictionary."""
    return {
        "title": title,
        "description": description,
        "difficulty": difficulty,
        "subject": "redes",
        "category": category,
        "points": points,
        "estimated_time": estimated_time,
        "topology": json.dumps(topology, ensure_ascii=False),
        "symptom": symptom,
        "commands": json.dumps(commands, ensure_ascii=False),
        "fault": json.dumps(fault, ensure_ascii=False),
        "diagnosis_options": json.dumps(diagnosis_options, ensure_ascii=False),
        "solution_explanation": solution_explanation,
        "hints": json.dumps(hints, ensure_ascii=False),
        "is_active": True,
    }


SCENARIOS = [

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 1: OSPF MULTIÁREA
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="OSPF de área única - Configuración básica",
        description="Configura OSPF en 3 routers en el área 0. Aprende 'router ospf', 'network', 'show ip ospf neighbor'.",
        difficulty="easy",
        category="Routing",
        points=100,
        estimated_time="15–20 min",
        topology={
            "viewBox": "0 0 800 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "Router 1\n(10.1.1.1)", "x": 100, "y": 150},
                {"id": "R2", "type": "router", "label": "Router 2\n(10.2.2.1)", "x": 400, "y": 150},
                {"id": "R3", "type": "router", "label": "Router 3\n(10.3.3.1)", "x": 700, "y": 150},
            ],
            "links": [
                {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/1"},
                {"from": "R2", "to": "R3", "fromLabel": "G0/0", "toLabel": "G0/1"},
            ]
        },
        symptom="Los routers R1 y R3 no se ven como vecinos OSPF. Debes configurar OSPF en área 0.",
        commands={
            "R1": [
                {"cmd": "show ip ospf neighbor", "output": "", "revealsFault": True},
                {"cmd": "router ospf 1", "output": "ospf 1 configured", "revealsFault": False},
                {"cmd": "network 10.1.1.0 0.0.0.255 area 0", "output": "network added", "revealsFault": False},
                {"cmd": "network 10.12.0.0 0.0.0.255 area 0", "output": "network added", "revealsFault": False},
                {"cmd": "show ip ospf neighbor", "output": "Neighbor ID     Pri   State\n10.2.2.1        1     FULL", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "router ospf 1", "output": "ospf 1 configured", "revealsFault": False},
                {"cmd": "network 10.2.2.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
                {"cmd": "network 10.12.0.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
                {"cmd": "network 10.23.0.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
            ],
            "R3": [
                {"cmd": "router ospf 1", "output": "ospf 1 configured", "revealsFault": False},
                {"cmd": "network 10.3.3.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
                {"cmd": "network 10.23.0.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R1",
            "description": "OSPF no está configurado. Los routers no forman adyacencias.",
            "fixCommand": "router ospf 1 + network commands en área 0"
        },
        diagnosis_options=[
            {"id": "a", "text": "OSPF no está activo; falta 'router ospf 1'", "correct": True},
            {"id": "b", "text": "Los network statements no incluyen las subredes de enlace", "correct": True},
            {"id": "c", "text": "Los wildcard masks están incorrectos", "correct": False},
            {"id": "d", "text": "El área debe ser 1, no 0", "correct": False},
        ],
        solution_explanation="Para OSPF básico: 1) 'router ospf 1' (identificador del proceso). 2) 'network X.X.X.X wildcard area 0' para cada subred. 3) 'show ip ospf neighbor' para verificar adyacencias.",
        hints=[
            "Verifica con 'show ip ospf neighbor' si hay vecinos.",
            "Si no hay vecinos, probablemente falta 'router ospf 1'.",
            "Asegúrate de incluir la network de enlace (ej: 10.12.0.0/24).",
            "El área 0 es el backbone en OSPF multiárea.",
        ]
    ),

    build_scenario(
        title="OSPF Multiárea con ABR",
        description="Configura OSPF con múltiples áreas (0, 1, 2) y un ABR. Aprende sobre tipos de LSA.",
        difficulty="medium",
        category="Routing",
        points=150,
        estimated_time="25–30 min",
        topology={
            "viewBox": "0 0 900 400",
            "nodes": [
                {"id": "R1", "type": "router", "label": "R1 (Area 0)\n10.1.1.1", "x": 100, "y": 200},
                {"id": "ABR", "type": "router", "label": "ABR\n(Area 0/1/2)", "x": 400, "y": 200},
                {"id": "R2", "type": "router", "label": "R2 (Area 1)\n10.2.2.1", "x": 300, "y": 50},
                {"id": "R3", "type": "router", "label": "R3 (Area 2)\n10.3.3.1", "x": 500, "y": 50},
            ],
            "links": [
                {"from": "R1", "to": "ABR", "fromLabel": "G0/0", "toLabel": "G0/1"},
                {"from": "ABR", "to": "R2", "fromLabel": "G0/2", "toLabel": "G0/1"},
                {"from": "ABR", "to": "R3", "fromLabel": "G0/3", "toLabel": "G0/1"},
            ]
        },
        symptom="Los routers en área 1 y 2 no aprenden rutas del área 0. El ABR no propaga LSA Type-3.",
        commands={
            "R1": [
                {"cmd": "router ospf 1", "output": "", "revealsFault": False},
                {"cmd": "network 10.1.1.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
                {"cmd": "network 10.1a.0.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
            ],
            "ABR": [
                {"cmd": "show ip ospf database summary", "output": "No summary LSAs", "revealsFault": True},
                {"cmd": "router ospf 1", "output": "", "revealsFault": False},
                {"cmd": "network 10.1a.0.0 0.0.0.255 area 0", "output": "", "revealsFault": False},
                {"cmd": "network 10.2a.0.0 0.0.0.255 area 1", "output": "", "revealsFault": False},
                {"cmd": "network 10.3a.0.0 0.0.0.255 area 2", "output": "", "revealsFault": False},
                {"cmd": "show ip ospf database summary", "output": "Type-3 LSAs generated", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "router ospf 1", "output": "", "revealsFault": False},
                {"cmd": "network 10.2.2.0 0.0.0.255 area 1", "output": "", "revealsFault": False},
                {"cmd": "network 10.2a.0.0 0.0.0.255 area 1", "output": "", "revealsFault": False},
            ],
            "R3": [
                {"cmd": "router ospf 1", "output": "", "revealsFault": False},
                {"cmd": "network 10.3.3.0 0.0.0.255 area 2", "output": "", "revealsFault": False},
                {"cmd": "network 10.3a.0.0 0.0.0.255 area 2", "output": "", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "ABR",
            "description": "El ABR no está configurado con interfaces en múltiples áreas.",
            "fixCommand": "Configurar network statements en área 0, 1 y 2 en el ABR"
        },
        diagnosis_options=[
            {"id": "a", "text": "El ABR no tiene interfaces en todas las áreas", "correct": True},
            {"id": "b", "text": "Faltan network statements en el ABR para área 1 y 2", "correct": True},
            {"id": "c", "text": "Los tipos de LSA son incorrectos (debe ser Type-1 y Type-3)", "correct": False},
            {"id": "d", "text": "El área 0 no es el backbone", "correct": False},
        ],
        solution_explanation="Un ABR debe tener interfaces en múltiples áreas OSPF. Type-1 LSAs (Router) se generan en cada router. Type-3 LSAs (Network Summary) se generan por ABRs. Usa 'show ip ospf database' para ver tipos de LSA.",
        hints=[
            "Un ABR necesita interfaces en al menos 2 áreas.",
            "Las Type-3 LSAs se crean automáticamente en un ABR.",
            "Verifica con 'show ip ospf database summary'.",
            "La métrica usa ancho de banda de la interfaz.",
        ]
    ),

    build_scenario(
        title="OSPF - Autenticación MD5",
        description="Configura autenticación MD5 en OSPF. Aprende 'ip ospf authentication message-digest'.",
        difficulty="hard",
        category="Routing",
        points=200,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 600 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "Router 1\n(Secured)", "x": 150, "y": 150},
                {"id": "R2", "type": "router", "label": "Router 2\n(No Auth)", "x": 450, "y": 150},
            ],
            "links": [
                {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/0", "faulty": True}
            ]
        },
        symptom="La adyacencia OSPF entre R1 y R2 es inestable. R1 tiene MD5 configurado, pero R2 no.",
        commands={
            "R1": [
                {"cmd": "show ip ospf neighbor", "output": "Neighbor in EXSTART state (AUTH FAILED)", "revealsFault": True},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ip ospf authentication message-digest", "output": "", "revealsFault": False},
                {"cmd": "ip ospf message-digest-key 1 md5 Cisco123", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ip ospf interface G0/0", "output": "OSPF authentication type MD5", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "show ip ospf neighbor", "output": "Neighbor in EXSTART state (AUTH FAILED)", "revealsFault": True},
                {"cmd": "interface G0/0", "output": "", "revealsFault": False},
                {"cmd": "ip ospf authentication message-digest", "output": "", "revealsFault": False},
                {"cmd": "ip ospf message-digest-key 1 md5 Cisco123", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ip ospf neighbor", "output": "Neighbor ID: FULL", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R2",
            "description": "R2 no tiene autenticación MD5 configurada.",
            "fixCommand": "ip ospf authentication message-digest + ip ospf message-digest-key"
        },
        diagnosis_options=[
            {"id": "a", "text": "R2 no tiene MD5 configurada", "correct": True},
            {"id": "b", "text": "Las claves MD5 no coinciden", "correct": True},
            {"id": "c", "text": "El área OSPF es diferente", "correct": False},
            {"id": "d", "text": "Los wildcard masks son incorrectos", "correct": False},
        ],
        solution_explanation="OSPF MD5 asegura que solo routers autorizados formen adyacencias. 1) 'ip ospf authentication message-digest'. 2) 'ip ospf message-digest-key <num> md5 <key>' (las claves DEBEN ser idénticas). Usa 'show ip ospf interface' para verificar.",
        hints=[
            "Las claves distinguen entre mayúsculas y minúsculas.",
            "El número de clave (1-255) debe coincidir.",
            "Si cambia la clave, la adyacencia se restablece.",
            "Para auth a nivel de proceso, usa 'area <num> authentication'.",
        ]
    ),

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 2: BGP BÁSICO
    # ═══════════════════════════════════════════════════════════════════════

    build_scenario(
        title="eBGP entre dos sistemas autónomos",
        description="Configura eBGP entre AS 100 y AS 200. Aprende 'router bgp', 'neighbor remote-as', 'network'.",
        difficulty="medium",
        category="Routing",
        points=150,
        estimated_time="20–25 min",
        topology={
            "viewBox": "0 0 700 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "R1 (AS 100)\n203.0.113.1", "x": 150, "y": 150},
                {"id": "R2", "type": "router", "label": "R2 (AS 200)\n198.51.100.1", "x": 550, "y": 150},
            ],
            "links": [
                {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/0"}
            ]
        },
        symptom="Dos ISPs (AS 100 y AS 200) no intercambian tráfico. La sesión BGP eBGP no se establece.",
        commands={
            "R1": [
                {"cmd": "show ip bgp summary", "output": "BGP router not running", "revealsFault": True},
                {"cmd": "router bgp 100", "output": "bgp 100 running", "revealsFault": False},
                {"cmd": "neighbor 203.0.113.2 remote-as 200", "output": "", "revealsFault": False},
                {"cmd": "network 192.168.100.0 mask 255.255.255.0", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "show ip bgp summary", "output": "Neighbor State: Established", "revealsFault": False},
            ],
            "R2": [
                {"cmd": "router bgp 200", "output": "", "revealsFault": False},
                {"cmd": "neighbor 203.0.113.1 remote-as 100", "output": "", "revealsFault": False},
                {"cmd": "network 10.0.0.0 mask 255.255.0.0", "output": "", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R1",
            "description": "BGP no está configurado.",
            "fixCommand": "router bgp 100 + neighbor remote-as + network statements"
        },
        diagnosis_options=[
            {"id": "a", "text": "Falta 'router bgp 100'", "correct": True},
            {"id": "b", "text": "No hay vecino BGP configurado", "correct": True},
            {"id": "c", "text": "Las redes no tienen 'network' statement", "correct": True},
            {"id": "d", "text": "El AS debe ser idéntico en ambos routers", "correct": False},
        ],
        solution_explanation="BGP eBGP conecta diferentes ASs. 1) 'router bgp <AS>'. 2) 'neighbor <IP> remote-as <AS_vecino>'. 3) 'network X.X.X.X mask X.X.X.X'. Usa 'show ip bgp summary'.",
        hints=[
            "La IP del neighbor debe ser alcanzable.",
            "El número de AS debe diferir (eBGP).",
            "Las redes anunciadas deben estar en IGP primero.",
            "'show ip bgp' muestra rutas aprendidas.",
        ]
    ),

    build_scenario(
        title="Atributos BGP: LOCAL_PREF y MED",
        description="Usa route-map para manipular LOCAL_PREF y MED. Aprende 'set local-preference' y 'set metric'.",
        difficulty="hard",
        category="Routing",
        points=200,
        estimated_time="25–30 min",
        topology={
            "viewBox": "0 0 900 300",
            "nodes": [
                {"id": "R1", "type": "router", "label": "R1 (AS 100)", "x": 150, "y": 150},
                {"id": "R2", "type": "router", "label": "R2 (AS 200)", "x": 450, "y": 150},
                {"id": "R3", "type": "router", "label": "R3 (AS 200)", "x": 750, "y": 150},
            ],
            "links": [
                {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/0"},
                {"from": "R1", "to": "R3", "fromLabel": "G0/1", "toLabel": "G0/0"},
            ]
        },
        symptom="R1 recibe 10.0.0.0/8 desde R2 y R3. Deseas preferir R2 con LOCAL_PREF más alta.",
        commands={
            "R1": [
                {"cmd": "show ip bgp 10.0.0.0", "output": "Route via 198.51.100.1 (MED=100)", "revealsFault": True},
                {"cmd": "ip prefix-list NETWORK10 seq 10 permit 10.0.0.0/8", "output": "", "revealsFault": False},
                {"cmd": "route-map PREF_R2 permit 10", "output": "", "revealsFault": False},
                {"cmd": "match ip address prefix-list NETWORK10", "output": "", "revealsFault": False},
                {"cmd": "set local-preference 150", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "route-map PREF_R2 permit 20", "output": "", "revealsFault": False},
                {"cmd": "exit", "output": "", "revealsFault": False},
                {"cmd": "router bgp 100", "output": "", "revealsFault": False},
                {"cmd": "neighbor 198.51.100.1 route-map PREF_R2 in", "output": "", "revealsFault": False},
                {"cmd": "clear ip bgp 198.51.100.1", "output": "session reset", "revealsFault": False},
                {"cmd": "show ip bgp 10.0.0.0", "output": "Route via R2 preferred (LOCAL_PREF=150)", "revealsFault": False},
            ]
        },
        fault={
            "deviceId": "R1",
            "description": "No hay route-map para manipular LOCAL_PREF.",
            "fixCommand": "Crear route-map + aplicar con 'neighbor route-map in'"
        },
        diagnosis_options=[
            {"id": "a", "text": "No hay route-map para manipular LOCAL_PREF", "correct": True},
            {"id": "b", "text": "La route-map no está aplicada al neighbor", "correct": True},
            {"id": "c", "text": "LOCAL_PREF es 0-65535 (mayor = preferida)", "correct": False},
            {"id": "d", "text": "MED controla la selección interna dentro del mismo AS", "correct": False},
        ],
        solution_explanation="LOCAL_PREF (0-65535, default 100) influye en selección DENTRO de un AS. Mayor LOCAL_PREF = preferida. MED (menor = preferida) se usa entre ASs. 1) Crear prefix-list. 2) Crear route-map con match y set local-preference. 3) Aplicar a neighbor inbound. 4) 'clear ip bgp' para resetear.",
        hints=[
            "LOCAL_PREF es bien conocido (well-known).",
            "Las route-maps actúan sobre tráfico in/out.",
            "Usa 'clear ip bgp' después de cambiar la route-map.",
            "'show ip bgp' muestra atributos.",
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
                print(f"  ⊘ Skipping '{scenario_data['title']}' (already exists)")
                continue

            scenario = NetLabScenario(
                title=scenario_data['title'],
                description=scenario_data['description'],
                difficulty=scenario_data['difficulty'],
                subject=scenario_data['subject'],
                category=scenario_data['category'],
                points=scenario_data['points'],
                estimated_time=scenario_data['estimated_time'],
                topology=scenario_data['topology'],
                symptom=scenario_data['symptom'],
                commands=scenario_data['commands'],
                fault=scenario_data['fault'],
                diagnosis_options=scenario_data['diagnosis_options'],
                solution_explanation=scenario_data['solution_explanation'],
                hints=scenario_data['hints'],
                is_active=scenario_data['is_active'],
            )
            db.add(scenario)
            count += 1

        db.commit()

        easy = sum(1 for s in scenarios_list if s['difficulty'] == 'easy')
        medium = sum(1 for s in scenarios_list if s['difficulty'] == 'medium')
        hard = sum(1 for s in scenarios_list if s['difficulty'] == 'hard')

        print(f"\n✓ Insertados {count} escenarios de NetLabs Avanzados (Part 1)")
        print(f"  Easy: {easy}  |  Medium: {medium}  |  Hard: {hard}")
        print(f"  Módulos: OSPF, BGP\n")
    except Exception as e:
        db.rollback()
        print(f"\nError: {e}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*80)
    print("  NetLabs Avanzados Part 1 — OSPF & BGP")
    print("="*80 + "\n")
    bulk_insert(SCENARIOS)
