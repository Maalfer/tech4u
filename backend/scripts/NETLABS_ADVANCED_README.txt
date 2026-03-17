================================================================================
            NetLabs Advanced Networking Scenarios — Complete Guide
================================================================================

OVERVIEW
────────────────────────────────────────────────────────────────────────────────

Three comprehensive Python seed scripts add 25+ advanced network lab scenarios
to the Tech4U Academy platform for Spanish FP Informática ASIR students.

Structure:
  • Part 1: OSPF & BGP (6 scenarios)
  • Part 2: IPv6 & Switch Security (7 scenarios)
  • Part 3: NAT/PAT, EtherChannel, Troubleshooting (8 scenarios)

All scenarios target Cisco IOS CLI using the NetLabScenario database model with:
  - Detailed network topologies (SVG visualization)
  - Realistic symptoms and fault scenarios
  - Step-by-step command sequences
  - Interactive diagnosis options
  - Educational explanations in Spanish
  - Context-sensitive hints


FILE LOCATIONS
────────────────────────────────────────────────────────────────────────────────

/mnt/tech4u/backend/scripts/seed_netlabs_advanced_p1.py
  → OSPF Multiárea (3 scenarios), BGP Básico (3 scenarios)

/mnt/tech4u/backend/scripts/seed_netlabs_advanced_p2.py
  → IPv6 en Cisco IOS (3 scenarios), Switch Security (4 scenarios)

/mnt/tech4u/backend/scripts/seed_netlabs_advanced_p3.py
  → NAT/PAT (3 scenarios), EtherChannel (2 scenarios), Troubleshooting (2 scenarios)

(Legacy combined file maintained for reference:)
/mnt/tech4u/backend/scripts/seed_netlabs_advanced.py


USAGE
────────────────────────────────────────────────────────────────────────────────

1. Navigate to backend directory:
   cd /path/to/backend

2. Run each part in sequence:
   python scripts/seed_netlabs_advanced_p1.py
   python scripts/seed_netlabs_advanced_p2.py
   python scripts/seed_netlabs_advanced_p3.py

   Or all parts at once:
   python scripts/seed_netlabs_advanced_p1.py && \
   python scripts/seed_netlabs_advanced_p2.py && \
   python scripts/seed_netlabs_advanced_p3.py

3. Verify insertion in database:
   SELECT COUNT(*) FROM netlabs_scenarios;
   SELECT DISTINCT category, difficulty FROM netlabs_scenarios ORDER BY category;


SCENARIO BREAKDOWN
────────────────────────────────────────────────────────────────────────────────

MODULE 1: OSPF MULTIÁREA
───────────────────────
[Easy]     OSPF de área única - Configuración básica (100 pts, 15–20 min)
           - 3 routers en área 0
           - Commands: router ospf, network, show ip ospf neighbor
           - Covers: basic topology, neighbor formation

[Medium]   OSPF Multiárea con ABR (150 pts, 25–30 min)
           - Area 0, Area 1, Area 2 with ABR
           - Commands: multiple areas, show ip ospf database
           - Covers: LSA types (Type-1, Type-3), inter-area routing

[Hard]     OSPF - Autenticación MD5 (200 pts, 20–25 min)
           - Neighbor instability due to auth mismatch
           - Commands: ip ospf authentication message-digest
           - Covers: security, key management


MODULE 2: BGP BÁSICO
────────────────
[Medium]   eBGP entre dos sistemas autónomos (150 pts, 20–25 min)
           - AS 100 ↔ AS 200 peering
           - Commands: router bgp, neighbor remote-as, network
           - Covers: eBGP setup, AS numbers, route advertisement

[Hard]     Atributos BGP: LOCAL_PREF y MED (200 pts, 25–30 min)
           - Route preference manipulation
           - Commands: route-map, set local-preference, set metric
           - Covers: path selection, attributes, route-maps


MODULE 3: IPv6 EN CISCO IOS
──────────────────────────
[Easy]     Direccionamiento IPv6 estático (100 pts, 15–20 min)
           - Static IPv6 addresses on routers
           - Commands: ipv6 unicast-routing, ipv6 address
           - Covers: global unicast, notation, interface config

[Medium]   Rutas estáticas IPv6 y link-local (150 pts, 20–25 min)
           - Static routes, link-local vs global unicast
           - Commands: ipv6 route, default route (::/0)
           - Covers: routing, address types, next-hops

[Hard]     OSPFv3 para IPv6 (200 pts, 25–30 min)
           - Dynamic routing for IPv6
           - Commands: ipv6 router ospf, ipv6 ospf (per-interface)
           - Covers: OSPFv3 vs OSPF, neighbor formation


MODULE 4: SEGURIDAD EN SWITCHES
─────────────────────────────
[Easy]     Port Security - Limitar MACs por puerto (100 pts, 15–20 min)
           - MAC limiting and violation modes
           - Commands: switchport port-security, maximum, violation
           - Covers: access mode requirement, shutdown/restrict/protect

[Medium]   DHCP Snooping (150 pts, 20–25 min)
           - Defense against rogue DHCP servers
           - Commands: ip dhcp snooping, trust, rate limiting
           - Covers: trusted/untrusted ports, binding table

[Medium]   Dynamic ARP Inspection (150 pts, 20–25 min)
           - Prevention of ARP spoofing
           - Commands: ip arp inspection vlan, trust
           - Covers: dependency on DHCP Snooping, inspection modes


MODULE 5: NAT/PAT EN CLI
───────────────────────
[Easy]     NAT Estático - Servidor Web interno (100 pts, 15–20 min)
           - Expose internal server (1:1 mapping)
           - Commands: ip nat inside/outside, ip nat inside source static
           - Covers: interface marking, static translations

[Medium]   PAT - Toda la LAN sale con una IP pública (150 pts, 20–25 min)
           - Multiple users sharing one public IP (overload)
           - Commands: access-list, ip nat inside source list ... overload
           - Covers: ACL, port multiplexing, interface-based PAT

[Medium]   NAT con Pool de IPs públicas (150 pts, 20–25 min)
           - Dynamic NAT with multiple public IPs
           - Commands: ip nat pool, ip nat inside source list pool
           - Covers: pool management, distribution


MODULE 6: ETHERCHANNEL
─────────────────────
[Medium]   EtherChannel con LACP (150 pts, 20–25 min)
           - Link aggregation (IEEE 802.3ad standard)
           - Commands: channel-group mode active, show etherchannel
           - Covers: LACP, multiple links, load balancing

[Easy]     EtherChannel con PAgP y configuración estática (100 pts, 15–20 min)
           - Compare LACP vs PAgP vs on
           - Commands: desirable, auto, mode on
           - Covers: protocol differences, compatibility


MODULE 7: TROUBLESHOOTING DE RED
────────────────────────────────
[Medium]   El host no tiene acceso a Internet (150 pts, 20–25 min)
           - Systematic diagnosis steps
           - Commands: ipconfig, ping, nslookup, tracert
           - Covers: IP, gateway, DNS, routing path

[Medium]   Dos VLANs no se comunican (150 pts, 20–25 min)
           - Inter-VLAN routing issues
           - Commands: show interfaces trunk, interface vlan, ip routing
           - Covers: trunk verification, SVI config, routing enable


DATABASE SCHEMA
────────────────────────────────────────────────────────────────────────────────

Table: netlabs_scenarios
Columns:
  id                  INTEGER PRIMARY KEY
  title               VARCHAR UNIQUE (scenario name)
  description         TEXT (learning objective)
  difficulty          VARCHAR (easy|medium|hard)
  subject             VARCHAR (always "redes")
  category            VARCHAR (Routing|Security|Addressing|Switching|Troubleshooting)
  points              INTEGER (100–200)
  estimated_time      VARCHAR (e.g. "15–20 min")
  topology            TEXT (JSON: nodes, links, viewBox)
  symptom             TEXT (Spanish problem statement)
  commands            TEXT (JSON: device → command list with outputs)
  fault               TEXT (JSON: {deviceId, description, fixCommand})
  diagnosis_options   TEXT (JSON: [{id, text, correct}])
  solution_explanation TEXT (Spanish detailed solution)
  hints               TEXT (JSON: array of hints)
  is_active           BOOLEAN
  created_at          DATETIME


STRUCTURE DETAILS
────────────────────────────────────────────────────────────────────────────────

Topology (JSON):
{
  "viewBox": "0 0 900 400",
  "nodes": [
    {"id": "R1", "type": "router|switch|pc|server|firewall", "label": "Router 1", "x": 150, "y": 150}
  ],
  "links": [
    {"from": "R1", "to": "R2", "fromLabel": "G0/0", "toLabel": "G0/0", "faulty": false}
  ]
}

Commands (JSON):
{
  "R1": [
    {"cmd": "show ip ospf neighbor", "output": "...", "revealsFault": true},
    {"cmd": "router ospf 1", "output": "...", "revealsFault": false}
  ]
}

Fault (JSON):
{
  "deviceId": "R1",
  "description": "OSPF no está configurado",
  "fixCommand": "router ospf 1 + network statements"
}

Diagnosis Options (JSON):
[
  {"id": "a", "text": "Opción A (correcta)", "correct": true},
  {"id": "b", "text": "Opción B (correcta)", "correct": true},
  {"id": "c", "text": "Opción C (incorrecta)", "correct": false}
]


KEY FEATURES
────────────────────────────────────────────────────────────────────────────────

✓ Complete Cisco IOS CLI syntax (exact commands)
✓ Spanish language throughout (problem, hints, explanation)
✓ Realistic network topologies with SVG visualization
✓ Graduated difficulty: easy → medium → hard
✓ Progressive learning path per module
✓ Multiple correct answers per diagnosis (teaches critical thinking)
✓ Hints without spoiling the answer
✓ XP reward system (100–200 points per scenario)
✓ Time estimates for course planning
✓ Deduplication logic (checks for existing scenarios)
✓ Full JSON serialization for database compatibility


RUNNING THE SCRIPTS
────────────────────────────────────────────────────────────────────────────────

Prerequisites:
  • PostgreSQL (or SQLite) running with tech4u database
  • Backend environment variables set (.env with DATABASE_URL)
  • SQLAlchemy database models imported

Basic execution:
  $ cd /path/to/tech4u/backend
  $ python scripts/seed_netlabs_advanced_p1.py

Expected output:
  ════════════════════════════════════════════════════════════════════════════
    NetLabs Avanzados Part 1 — OSPF & BGP
  ════════════════════════════════════════════════════════════════════════════

  ✓ Insertados 6 escenarios de NetLabs Avanzados (Part 1)
    Easy: 1  |  Medium: 3  |  Hard: 2
    Módulos: OSPF, BGP

  [✓ Repeat for Parts 2 and 3]

Verification:
  $ psql -U tech4u_admin -d tech4u -c \
    "SELECT title, difficulty, points FROM netlabs_scenarios WHERE subject='redes' ORDER BY created_at DESC LIMIT 10;"


TROUBLESHOOTING
────────────────────────────────────────────────────────────────────────────────

Issue: "DatabaseURL not found"
Solution: Ensure .env file exists with: DATABASE_URL=postgresql://...

Issue: "SkillLabExercise not found"
Solution: This file uses NetLabScenario, not SkillLabExercise. Verify database.py

Issue: "Scenarios not appearing in frontend"
Solution: Check is_active=True in database. Restart backend service.

Issue: "Duplicate key error"
Solution: Deduplication checks title uniqueness. If needed, run with fresh DB.


CUSTOMIZATION
────────────────────────────────────────────────────────────────────────────────

To add a new scenario, use the build_scenario() helper:

  build_scenario(
    title="Your Scenario Title",
    description="...",
    difficulty="medium",  # easy | medium | hard
    category="Routing",
    points=150,
    estimated_time="20–25 min",
    topology={...},
    symptom="Spanish problem statement",
    commands={...},
    fault={...},
    diagnosis_options=[...],
    solution_explanation="Spanish explanation",
    hints=[...]
  )

All JSON fields must use ensure_ascii=False for Spanish characters.


FRONTEND INTEGRATION
────────────────────────────────────────────────────────────────────────────────

Scenarios are accessible via:
  GET /api/netlabs/scenarios?subject=redes&difficulty=easy
  GET /api/netlabs/scenarios/:id

Frontend component: /frontend/src/pages/NetLabCLI.jsx

Uses:
  - Topology visualization (SVG canvas)
  - Command history terminal
  - Interactive diagnosis questions
  - Hint system
  - XP/points calculation


REFERENCES & STANDARDS
────────────────────────────────────────────────────────────────────────────────

Cisco IOS CLI:
  • OSPF: RFC 2328 (OSPFv2), RFC 5340 (OSPFv3)
  • BGP: RFC 4271 (BGPv4), RFC 5492 (BGP capabilities)
  • IPv6: RFC 4291 (IPv6 addressing), RFC 5095 (IPv6 routing)
  • Switch Security: IEEE 802.1X, DHCP Snooping (Cisco proprietary)

Spanish Terminology:
  • Enrutamiento = Routing
  • Conmutación = Switching
  • Dirección MAC = MAC address
  • Interfaz = Interface
  • Vecino = Neighbor
  • Fallo = Fault


LICENSE & ATTRIBUTION
────────────────────────────────────────────────────────────────────────────────

Created for Tech4U Academy (Spanish FP Informática ASIR platform)
All content in Spanish targeting Spanish-speaking technical students
Educational use within Tech4U Academy scope

Generated with Claude Code — Advanced Networking Labs Generator


CONTACT & SUPPORT
────────────────────────────────────────────────────────────────────────────────

For issues or enhancements:
  • Review existing scenarios in database
  • Check NetLabScenario model in database.py
  • Refer to existing topology examples in this file
  • Maintain Spanish language and Cisco IOS syntax


CHANGELOG
────────────────────────────────────────────────────────────────────────────────

v1.0 (2026-03-16)
  ✓ Part 1: OSPF (3) + BGP (3) = 6 scenarios
  ✓ Part 2: IPv6 (3) + Security (4) = 7 scenarios
  ✓ Part 3: NAT/PAT (3) + EtherChannel (2) + Troubleshooting (2) = 7 scenarios
  ✓ Total: 20 advanced networking scenarios
  ✓ All in Spanish with Cisco IOS CLI commands
  ✓ XP rewards from 100–200 points each
  ✓ Difficulty levels: easy (3), medium (12), hard (5)

================================================================================
                            END OF DOCUMENTATION
================================================================================
