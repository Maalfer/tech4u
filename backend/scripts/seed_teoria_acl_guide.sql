-- ═══════════════════════════════════════════════════════════════════════════════
-- Tech4U — Seed Teoría: Guía completa ACLs en Redes Cisco
-- Ejecutar con: psql -U tech4u_admin -d tech4u -f seed_teoria_acl_guide.sql
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Crear subject Redes si no existe
INSERT INTO theory_subjects (name, slug, description, icon, order_index)
VALUES (
  'Redes',
  'redes',
  'Fundamentos de redes, TCP/IP, OSI, subredes, enrutamiento, switching y seguridad.',
  '🌐',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insertar el post (usa el id del subject recién creado o existente)
INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: Creación de ACLs en redes Cisco',
  'guia-creacion-acls-redes-cisco',
  $CONTENT$# Guía Completa: Creación y Gestión de ACLs en Redes Cisco

> Las **Access Control Lists (ACLs)** son el mecanismo fundamental de filtrado de tráfico en routers y switches Cisco. Dominarlas es imprescindible para cualquier técnico de redes ASIR.

---

## ¿Qué es una ACL y para qué sirve?

Una **ACL (Access Control List)** es una lista ordenada de sentencias que el router evalúa secuencialmente para **permitir o denegar** el paso de paquetes en una interfaz.

Sus usos principales son:

- **Control de acceso**: qué hosts o redes pueden comunicarse entre sí
- **Seguridad perimetral**: bloquear protocolos inseguros (Telnet, FTP sin cifrar)
- **QoS y políticas**: marcar o clasificar tráfico para calidad de servicio
- **NAT**: definir qué tráfico debe ser traducido
- **VPN**: especificar el tráfico interesante de un túnel

### ¿Cómo procesa el router una ACL?

El router lee las sentencias de **arriba a abajo**, una a una. En cuanto una sentencia coincide con el paquete, ejecuta la acción (permit / deny) y **deja de leer el resto**. Si ninguna sentencia coincide, se aplica la regla implícita final:

```
                         ┌──────────────────────────────────┐
  Paquete entrante ───►  │  ¿Coincide con sentencia 1?      │ ──► Sí → Aplicar acción
                         └──────────────┬───────────────────┘
                                        │ No
                         ┌──────────────▼───────────────────┐
                         │  ¿Coincide con sentencia 2?      │ ──► Sí → Aplicar acción
                         └──────────────┬───────────────────┘
                                        │ No
                         ┌──────────────▼───────────────────┐
                         │  ¿Coincide con sentencia N?      │ ──► Sí → Aplicar acción
                         └──────────────┬───────────────────┘
                                        │ No coincide ninguna
                         ┌──────────────▼───────────────────┐
                         │   DENY ANY (implícito y oculto)  │ ──► Paquete DESCARTADO
                         └──────────────────────────────────┘
```

> ⚠️ **Regla de oro**: toda ACL tiene al final un `deny any` implícito e invisible. Si no añades al menos un `permit`, **todo el tráfico será bloqueado**.

---

## Tipos de ACLs

| Tipo | Rango numérico | Filtra por | Colocación recomendada |
|------|---------------|-----------|------------------------|
| **Estándar numerada** | 1–99 y 1300–1999 | Solo IP de origen | Cerca del destino |
| **Extendida numerada** | 100–199 y 2000–2699 | Origen, destino, protocolo, puerto | Cerca del origen |
| **Estándar nombrada** | Nombre personalizado | Solo IP de origen | Cerca del destino |
| **Extendida nombrada** | Nombre personalizado | Origen, destino, protocolo, puerto | Cerca del origen |

### ¿Por qué usar ACLs nombradas vs numeradas?

| Característica | Numerada | Nombrada |
|----------------|----------|----------|
| Editar sentencias individuales | ❌ (hay que borrar toda la ACL) | ✅ (se borran por número de secuencia) |
| Insertar reglas entre existentes | ❌ | ✅ |
| Nombres descriptivos | ❌ | ✅ |
| Soporte en IOS moderno | ✅ | ✅ |

---

## Wildcard Masks — La clave para entender las ACLs

La **wildcard mask** (máscara comodín) indica al router qué bits de la dirección IP deben coincidir exactamente y cuáles se ignoran.

- Bit **0** → el bit correspondiente de la IP **debe coincidir**
- Bit **1** → el bit correspondiente de la IP **se ignora** (wildcard)

### Cómo calcular la wildcard

La wildcard es la **inversa matemática** de la máscara de subred:

```
Máscara de subred:  255.255.255.0    →   Wildcard: 0.0.0.255
Máscara de subred:  255.255.0.0      →   Wildcard: 0.0.255.255
Máscara de subred:  255.255.255.128  →   Wildcard: 0.0.0.127
Máscara de subred:  255.255.255.252  →   Wildcard: 0.0.0.3
```

**Truco**: resta la máscara a 255.255.255.255:

```
  255.255.255.255
- 255.255.255.0    (máscara /24)
─────────────────
    0.  0.  0.255  (wildcard resultante)
```

### Palabras clave especiales

```
host    →  equivale a wildcard 0.0.0.0       (un único host)
any     →  equivale a wildcard 255.255.255.255 (cualquier IP)
```

### Ejemplos de wildcards

| Objetivo | Dirección IP | Wildcard | Notación corta |
|----------|-------------|----------|----------------|
| Un solo host (192.168.1.10) | 192.168.1.10 | 0.0.0.0 | `host 192.168.1.10` |
| Red /24 completa | 192.168.1.0 | 0.0.0.255 | — |
| Red /16 completa | 10.10.0.0 | 0.0.255.255 | — |
| Cualquier IP | 0.0.0.0 | 255.255.255.255 | `any` |
| Solo hosts pares (.0, .2, .4...) | 192.168.1.0 | 0.0.0.254 | — |
| Red /30 (4 IPs) | 192.168.1.0 | 0.0.0.3 | — |

---

## ACLs Estándar

Filtran **únicamente por la dirección IP de origen**. Son simples pero menos precisas.

### Sintaxis

```
! Crear sentencia permit
Router(config)# access-list <1-99> permit <ip-origen> <wildcard>

! Crear sentencia deny
Router(config)# access-list <1-99> deny <ip-origen> <wildcard>

! Usar palabras clave host / any
Router(config)# access-list 10 permit host 192.168.1.50
Router(config)# access-list 10 deny any

! Aplicar a una interfaz
Router(config-if)# ip access-group <número-ACL> {in | out}
```

### Ejemplo 1 — Permitir solo la red 192.168.1.0/24

Objetivo: solo los hosts de la red 192.168.1.0/24 pueden acceder al servidor en 10.0.0.1

```
Router(config)# access-list 10 permit 192.168.1.0 0.0.0.255
! El deny any implícito bloquea el resto

Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip access-group 10 out
```

### Ejemplo 2 — Denegar un host específico y permitir el resto

```
Router(config)# access-list 20 deny host 192.168.1.99
Router(config)# access-list 20 permit any
```

> ⚠️ **Colocación**: las ACLs estándar deben aplicarse **cerca del destino** porque solo filtran por IP de origen. Si las pones cerca del origen, podrías bloquear accidentalmente tráfico hacia otras redes.

---

## ACLs Extendidas

Filtran por **IP de origen, IP de destino, protocolo y número de puerto**. Son mucho más precisas y son las más usadas en producción.

### Sintaxis completa

```
Router(config)# access-list <100-199> {permit|deny} <protocolo>
    <ip-origen> <wildcard-origen>
    <ip-destino> <wildcard-destino>
    [operador <puerto>]
```

### Protocolos más comunes

| Keyword en IOS | Descripción | Ejemplo de uso |
|----------------|-------------|----------------|
| `tcp` | Protocolo TCP | HTTP, HTTPS, SSH, Telnet, FTP |
| `udp` | Protocolo UDP | DNS, DHCP, SNMP, TFTP |
| `icmp` | ICMP (ping, traceroute) | Control y diagnóstico |
| `ip` | Cualquier protocolo IP | Filtrado genérico |

### Operadores de puerto

| Operador | Significado | Ejemplo |
|----------|-------------|---------|
| `eq` | igual a | `eq 80` (exactamente el 80) |
| `neq` | distinto de | `neq 23` |
| `lt` | menor que | `lt 1024` (puertos bien conocidos) |
| `gt` | mayor que | `gt 1023` (puertos dinámicos) |
| `range` | rango inclusivo | `range 20 21` (FTP data+control) |

### Puertos más importantes para el examen

| Puerto | Protocolo | Servicio |
|--------|-----------|---------|
| 20, 21 | TCP | FTP (data, control) |
| 22 | TCP | SSH |
| 23 | TCP | Telnet |
| 25 | TCP | SMTP |
| 53 | TCP/UDP | DNS |
| 67, 68 | UDP | DHCP (server, client) |
| 80 | TCP | HTTP |
| 110 | TCP | POP3 |
| 143 | TCP | IMAP |
| 161 | UDP | SNMP |
| 443 | TCP | HTTPS |
| 514 | UDP | Syslog |

### Ejemplo 1 — Bloquear Telnet desde cualquier origen

```
Router(config)# access-list 110 deny tcp any any eq 23
Router(config)# access-list 110 permit ip any any

Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip access-group 110 in
```

### Ejemplo 2 — Permitir solo tráfico web desde una red interna

Escenario: la red 192.168.10.0/24 solo puede navegar por HTTP/HTTPS hacia cualquier destino.

```
Router(config)# access-list 120 permit tcp 192.168.10.0 0.0.0.255 any eq 80
Router(config)# access-list 120 permit tcp 192.168.10.0 0.0.0.255 any eq 443
Router(config)# access-list 120 deny ip any any
! (el deny final es redundante porque ya existe implícito, pero mejora la legibilidad)

Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip access-group 120 in
```

### Ejemplo 3 — Permitir SSH y HTTPS, bloquear todo lo demás hacia un servidor

Escenario: proteger el servidor 10.10.10.5, permitiendo solo SSH y HTTPS.

```
Router(config)# access-list 150 permit tcp any host 10.10.10.5 eq 22
Router(config)# access-list 150 permit tcp any host 10.10.10.5 eq 443
Router(config)# access-list 150 deny ip any host 10.10.10.5
Router(config)# access-list 150 permit ip any any

Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip access-group 150 out
```

### Ejemplo 4 — Bloquear ping pero permitir el resto

```
Router(config)# access-list 160 deny icmp any any
Router(config)# access-list 160 permit ip any any
```

> ✅ **Colocación**: las ACLs extendidas deben aplicarse **cerca del origen** del tráfico que se quiere filtrar. Así evitas que el tráfico rechazado recorra innecesariamente la red antes de ser descartado.

---

## ACLs Nombradas

Las ACLs nombradas permiten **editar sentencias individuales** mediante números de secuencia, lo que las hace mucho más manejables en producción.

### Sintaxis

```
! Crear ACL estándar nombrada
Router(config)# ip access-list standard NOMBRE_ACL
Router(config-std-nacl)# permit 192.168.1.0 0.0.0.255
Router(config-std-nacl)# deny any

! Crear ACL extendida nombrada
Router(config)# ip access-list extended NOMBRE_ACL
Router(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 any eq 443
Router(config-ext-nacl)# deny tcp any any eq 23
Router(config-ext-nacl)# permit ip any any
```

### Números de secuencia

Cada sentencia lleva un número de secuencia (por defecto: 10, 20, 30...). Esto permite **insertar reglas** entre las existentes:

```
Router# show ip access-lists POLITICA_WEB
Extended IP access list POLITICA_WEB
    10 permit tcp 192.168.1.0 0.0.0.255 any eq 80
    20 permit tcp 192.168.1.0 0.0.0.255 any eq 443
    30 deny ip any any

! Insertar una regla entre la 10 y la 20 (por ejemplo, permitir FTP):
Router(config)# ip access-list extended POLITICA_WEB
Router(config-ext-nacl)# 15 permit tcp 192.168.1.0 0.0.0.255 any range 20 21
```

### Eliminar una sentencia específica

```
Router(config)# ip access-list extended POLITICA_WEB
Router(config-ext-nacl)# no 30
! Elimina únicamente la sentencia con secuencia 30
```

### Reorganizar números de secuencia (resequence)

Cuando se han agotado los huecos entre sentencias:

```
Router(config)# ip access-list resequence POLITICA_WEB 10 10
! Renumera desde 10, incrementando de 10 en 10
```

---

## Aplicación de ACLs a Interfaces

Una ACL no tiene efecto hasta que se aplica a una interfaz en una dirección concreta.

```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip access-group NOMBRE_O_NÚMERO {in | out}
```

### Dirección in vs out

```
                     ┌─────────────────────────┐
                     │         ROUTER          │
                     │                         │
  Red A ────[ACL IN]─►──[Proceso de routing]──►──[ACL OUT]──── Red B
                     │                         │
                     └─────────────────────────┘

  in  → El paquete acaba de LLEGAR a la interfaz (antes de enrutar)
  out → El paquete está a punto de SALIR por la interfaz (después de enrutar)
```

### Regla fundamental

> **Solo puede haber UNA ACL por interfaz por dirección.**
> Una interfaz puede tener una ACL `in` y una ACL `out`, pero no dos ACLs `in` simultáneamente.

| Combinación | ¿Permitido? |
|------------|-------------|
| G0/0 → ACL 10 `in` + ACL 20 `out` | ✅ Sí |
| G0/0 → ACL 10 `in` + ACL 20 `in` | ❌ No (la segunda reemplaza a la primera) |
| G0/0 → ACL 10 `in` + G0/1 → ACL 10 `out` | ✅ Sí (misma ACL en diferentes interfaces) |

---

## Casos Prácticos Completos

### Práctica 1 — Securizar acceso SSH al router

**Escenario**: solo el equipo de administración (192.168.99.0/24) puede acceder al router por SSH. Nadie más.

```
! ACL que permite SSH solo desde la VLAN de gestión
Router(config)# ip access-list extended GESTIÓN_SSH
Router(config-ext-nacl)# permit tcp 192.168.99.0 0.0.0.255 any eq 22
Router(config-ext-nacl)# deny tcp any any eq 22
Router(config-ext-nacl)# permit ip any any

! Aplicar a la interfaz WAN (tráfico entrante desde fuera)
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip access-group GESTIÓN_SSH in
```

### Práctica 2 — Aislar VLANs (no permitir que la VLAN 10 acceda a la VLAN 20)

**Escenario**: VLAN 10 = empleados (192.168.10.0/24), VLAN 20 = servidores (192.168.20.0/24). Los empleados no deben acceder directamente a los servidores excepto por HTTPS.

```
Router(config)# ip access-list extended VLAN10_A_VLAN20
Router(config-ext-nacl)# permit tcp 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255 eq 443
Router(config-ext-nacl)# deny ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255
Router(config-ext-nacl)# permit ip any any

! Aplicar en la subinterfaz que da a la VLAN 10
Router(config)# interface GigabitEthernet0/0.10
Router(config-subif)# ip access-group VLAN10_A_VLAN20 in
```

### Práctica 3 — Bloquear todo salvo DNS y web (política restrictiva corporativa)

**Escenario**: la red de invitados (10.0.0.0/24) solo puede usar DNS y navegar por web. No ping, no SSH, no nada más.

```
Router(config)# ip access-list extended RED_INVITADOS
Router(config-ext-nacl)# permit udp 10.0.0.0 0.0.0.255 any eq 53
Router(config-ext-nacl)# permit tcp 10.0.0.0 0.0.0.255 any eq 53
Router(config-ext-nacl)# permit tcp 10.0.0.0 0.0.0.255 any eq 80
Router(config-ext-nacl)# permit tcp 10.0.0.0 0.0.0.255 any eq 443
! Todo lo demás queda bloqueado por el deny any implícito

Router(config)# interface GigabitEthernet0/2
Router(config-if)# ip access-group RED_INVITADOS in
```

### Práctica 4 — Permitir el retorno de conexiones establecidas (stateless workaround)

**Escenario**: se bloquea el tráfico entrante, pero se necesita que las respuestas a conexiones TCP iniciadas desde dentro puedan volver.

```
! Los routers sin stateful inspection necesitan permitir TCP established
Router(config)# ip access-list extended ENTRADA_WAN
Router(config-ext-nacl)# permit tcp any 192.168.0.0 0.0.0.255 established
Router(config-ext-nacl)# permit udp any host 192.168.0.5 eq 53
Router(config-ext-nacl)# deny ip any any

Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip access-group ENTRADA_WAN in
```

> La palabra clave `established` solo permite paquetes TCP con los flags ACK o RST activados, lo que indica que la conexión fue iniciada desde dentro.

---

## Verificación y Troubleshooting

### Comandos esenciales de verificación

```
! Ver todas las ACLs con sus contadores de coincidencias
Router# show ip access-lists

! Ver una ACL específica
Router# show ip access-lists POLITICA_WEB

! Ver qué ACLs están aplicadas en cada interfaz
Router# show ip interface GigabitEthernet0/0

! Ver la configuración completa de las ACLs
Router# show running-config | section access-list

! Limpiar los contadores de una ACL
Router# clear ip access-list counters POLITICA_WEB
```

### Ejemplo de salida de `show ip access-lists`

```
Router# show ip access-lists POLITICA_WEB
Extended IP access list POLITICA_WEB
    10 permit tcp 192.168.1.0 0.0.0.255 any eq www (1523 matches)
    20 permit tcp 192.168.1.0 0.0.0.255 any eq 443 (4891 matches)
    30 deny tcp any any eq telnet (12 matches)
    40 permit ip any any (50234 matches)
```

Los **contadores de matches** son clave para el troubleshooting: permiten saber si una sentencia está siendo alcanzada.

### Errores más frecuentes

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| Todo el tráfico bloqueado | Falta de `permit` en la ACL | Añadir `permit ip any any` al final |
| La ACL no filtra nada | No está aplicada a ninguna interfaz | Verificar con `show ip interface` |
| Se bloquea tráfico legítimo | Orden incorrecto de sentencias (deny antes del permit) | Revisar el orden con `show ip access-lists` |
| La nueva regla no funciona | Las sentencias se procesan en orden, el paquete ya coincidió antes | Insertar la nueva sentencia con un número de secuencia menor |
| Cambio de ACL no surte efecto | La ACL antigua sigue aplicada con `ip access-group` | Retirar y volver a aplicar la ACL |
| Bloquea el tráfico de retorno | Se bloquea TCP sin el flag `established` | Añadir `permit tcp any <mi_red> established` |

### Debug (usar con precaución en producción)

```
! Debug de paquetes que coinciden con una ACL (puede saturar la CPU)
Router# debug ip packet detail
Router# debug ip packet <número-ACL> detail

! Desactivar todos los debugs
Router# undebug all
```

---

## Buenas Prácticas Profesionales

### 1. Usa siempre ACLs nombradas en producción

```
! Mal: difícil de mantener
Router(config)# access-list 110 permit tcp ...

! Bien: fácil de identificar y editar
Router(config)# ip access-list extended POLITICA_INTERNET_USERS
```

### 2. Documenta con `remark`

```
Router(config)# ip access-list extended POLITICA_SERVIDORES
Router(config-ext-nacl)# remark === Permite acceso SSH desde red de gestión ===
Router(config-ext-nacl)# 10 permit tcp 192.168.99.0 0.0.0.255 any eq 22
Router(config-ext-nacl)# remark === Permite HTTPS hacia zona DMZ ===
Router(config-ext-nacl)# 20 permit tcp any 10.10.10.0 0.0.0.255 eq 443
Router(config-ext-nacl)# remark === Bloquear todo lo demas ===
Router(config-ext-nacl)# 30 deny ip any any
```

### 3. Deja espacio entre números de secuencia

Usa incrementos de 10 (o 5 si prevés muchos cambios) para poder insertar reglas sin reescribir toda la ACL.

### 4. Añade siempre un `permit ip any any` explícito al final (si procede)

Aunque el deny implícito siempre está, tener el deny/permit final **explícito** hace la ACL más legible y los contadores de matches te ayudarán a ver si el tráfico llega al final de la lista.

### 5. Prueba la ACL antes de aplicarla en producción

Usa un entorno de laboratorio (Packet Tracer, GNS3, CML) para verificar el comportamiento antes de aplicar en producción.

### 6. Principio de mínimo privilegio

Empieza siempre desde una postura restrictiva (`deny all`) y añade solo lo estrictamente necesario. Nunca uses `permit ip any any` en la interfaz WAN sin un motivo justificado.

---

## Resumen de Comandos ACL

### ACLs Estándar

```
access-list <1-99> {permit|deny} <ip> [<wildcard>]
access-list <1-99> {permit|deny} host <ip>
access-list <1-99> {permit|deny} any
ip access-group <1-99> {in|out}
```

### ACLs Extendidas

```
access-list <100-199> {permit|deny} <protocolo>
    <src-ip> <src-wildcard>
    <dst-ip> <dst-wildcard>
    [eq|neq|lt|gt|range <puerto(s)>]
```

### ACLs Nombradas

```
ip access-list {standard|extended} <NOMBRE>
  [<secuencia>] {permit|deny} ...
  remark <comentario>
  no <secuencia>
ip access-list resequence <NOMBRE> <inicio> <incremento>
```

### Aplicación y verificación

```
ip access-group {<número>|<nombre>} {in|out}   ! en modo config-if
no ip access-group {<número>|<nombre>} {in|out} ! para eliminar

show ip access-lists [<nombre-o-número>]
show ip interface <interfaz>
show running-config | section access-list
clear ip access-list counters [<nombre-o-número>]
```

---

## Checklist antes de implementar una ACL

- [ ] He identificado el **tráfico que quiero controlar** (origen, destino, protocolo, puerto)
- [ ] He decidido el **tipo de ACL** adecuado (estándar vs extendida, nombrada vs numerada)
- [ ] He calculado correctamente las **wildcard masks**
- [ ] He planificado el **orden de las sentencias** (las más específicas primero)
- [ ] He incluido el **`permit` o `deny` final** que corresponde según la política
- [ ] He decidido la **interfaz y dirección** (`in` o `out`) correctas según la topología
- [ ] He **probado en laboratorio** antes de aplicar en producción
- [ ] He **documentado** con `remark` cada bloque de reglas
- [ ] Sé cómo **verificar** que la ACL funciona con `show ip access-lists`
- [ ] Sé cómo **revertir** los cambios si hay un problema$CONTENT$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

COMMIT;

-- Verificación
SELECT s.name AS subject, p.title, p.slug, length(p.markdown_content) AS content_chars
FROM theory_posts p
JOIN theory_subjects s ON s.id = p.subject_id
WHERE p.slug = 'guia-creacion-acls-redes-cisco';
