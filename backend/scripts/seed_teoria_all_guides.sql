-- ═══════════════════════════════════════════════════════════════════
-- Tech4U — Seed Teoría: 27 guías completas (5 asignaturas)
-- Uso: psql -U tech4u_admin -d tech4u -f seed_teoria_all_guides.sql
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ─── Redes ────────────────────────────────────────
INSERT INTO theory_subjects (name, slug, description, icon, order_index)
VALUES ('Redes', 'redes', 'Fundamentos de redes, TCP/IP, OSI, subnetting, enrutamiento, switching y seguridad.', '🌐', 1)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      order_index = EXCLUDED.order_index;

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: Subnetting y CIDR',
  'subnetting-y-cidr',
  $MKDN$# Guía completa: Subnetting y CIDR

## Introducción

El subnetting es una de las habilidades más fundamentales en networking. Permite dividir una red IP en subredes más pequeñas, optimizando el uso de direcciones IP y mejorando la eficiencia de la red. Esta guía te llevará desde los conceptos básicos hasta problemas avanzados de examen.

## Representación Binaria de Direcciones IP

Una dirección IPv4 consta de 32 bits divididos en 4 octetos (bytes). Cada octeto puede variar de 0 a 255.

```
192.168.1.100

Binario:
11000000.10101000.00000001.01100100

Desglose por octeto:
11000000 = 192
10101000 = 168
00000001 = 1
01100100 = 100
```

### Tabla de Conversión Rápida

| Potencia | 2^7 | 2^6 | 2^5 | 2^4 | 2^3 | 2^2 | 2^1 | 2^0 |
|----------|-----|-----|-----|-----|-----|-----|-----|-----|
| Valor    | 128 | 64  | 32  | 16  | 8   | 4   | 2   | 1   |

## Conceptos Clave: Bits de Red y Host

Una dirección IP se divide en:
- **Bits de Red**: Identifican la red
- **Bits de Host**: Identifican dispositivos dentro de la red

```
Dirección: 192.168.1.100/24

Bits de red (24): 192.168.1
Bits de host (8): 100
```

## Máscaras de Subred

Una máscara de subred determina cuál parte de la dirección IP es la red y cuál es el host.

### Máscaras Comunes en Notación Decimal Punteada

| CIDR | Máscara Decimal | Bits de Red | Bits de Host | Hosts Útiles |
|------|-----------------|-------------|--------------|--------------|
| /24  | 255.255.255.0   | 24          | 8            | 254          |
| /25  | 255.255.255.128 | 25          | 7            | 126          |
| /26  | 255.255.255.192 | 26          | 6            | 62           |
| /27  | 255.255.255.224 | 27          | 5            | 30           |
| /28  | 255.255.255.240 | 28          | 4            | 14           |
| /29  | 255.255.255.248 | 29          | 3            | 6            |
| /30  | 255.255.255.252 | 30          | 2            | 2            |
| /31  | 255.255.255.254 | 31          | 1            | 2 (punto-punto) |

## Notación CIDR (Classless Inter-Domain Routing)

La notación CIDR simplifica la representación de máscaras de subred. El número después de la barra (/) indica los bits de red.

```
192.168.1.0/24  → Máscara: 255.255.255.0 (24 bits de red)
10.0.0.0/8      → Máscara: 255.0.0.0 (8 bits de red)
172.16.0.0/12   → Máscara: 255.240.0.0 (12 bits de red)
```

## Proceso de Subnetting Paso a Paso

### Paso 1: Determinar Bits de Host Necesarios

Para alojar N hosts, necesitas: **ceil(log₂(N+2))** bits de host.
(+2 para direcciones de red y broadcast)

### Paso 2: Calcular Parámetros de Subred

Con b bits de host:
- **Salto de subred**: 2^b
- **Hosts por subred**: 2^b - 2
- **Subredes totales**: 2^(32-bits_de_red)

### Paso 3: Direcciones Especiales

Para cada subred con máscara /M:
- **Dirección de Red**: Todos los bits de host en 0
- **Primera dirección de host**: Dirección de red + 1
- **Última dirección de host**: Dirección de broadcast - 1
- **Dirección de Broadcast**: Todos los bits de host en 1

## Ejemplo Completo: Subnetting de 192.168.1.0/24

**Requisito**: Dividir en 4 subredes

### Solución:

1. Bits de host actuales: 8
2. Para 4 subredes necesitamos: log₂(4) = 2 bits de red adicionales
3. Nueva máscara: /26 (24 + 2)
4. Salto de subred: 2^(32-26) = 64

```
Subred 1: 192.168.1.0/26
  - Red: 192.168.1.0
  - Primer host: 192.168.1.1
  - Último host: 192.168.1.62
  - Broadcast: 192.168.1.63

Subred 2: 192.168.1.64/26
  - Red: 192.168.1.64
  - Primer host: 192.168.1.65
  - Último host: 192.168.1.126
  - Broadcast: 192.168.1.127

Subred 3: 192.168.1.128/26
  - Red: 192.168.1.128
  - Primer host: 192.168.1.129
  - Último host: 192.168.1.190
  - Broadcast: 192.168.1.191

Subred 4: 192.168.1.192/26
  - Red: 192.168.1.192
  - Primer host: 192.168.1.193
  - Último host: 192.168.1.254
  - Broadcast: 192.168.1.255
```

## VLSM (Variable Length Subnet Masking)

VLSM permite usar diferentes máscaras de subred dentro de la misma red clase. Es esencial para el uso eficiente de direcciones IP.

### Ejemplo VLSM: 10.0.0.0/22

**Requerimientos**:
- Subred A: 500 hosts
- Subred B: 200 hosts
- Subred C: 50 hosts
- Subred D: 20 hosts

**Solución**:

```
Subred A (500 hosts): 10.0.0.0/23
  - Salto: 512, Hosts: 510
  - Rango: 10.0.0.0 - 10.0.1.255

Subred B (200 hosts): 10.0.2.0/24
  - Salto: 256, Hosts: 254
  - Rango: 10.0.2.0 - 10.0.2.255

Subred C (50 hosts): 10.0.3.0/26
  - Salto: 64, Hosts: 62
  - Rango: 10.0.3.0 - 10.0.3.63

Subred D (20 hosts): 10.0.3.64/27
  - Salto: 32, Hosts: 30
  - Rango: 10.0.3.64 - 10.0.3.95
```

## Clases de Direcciones IPv4

| Clase | Rango de Red | Primer Octeto | Máscara Default | Hosts por Red |
|-------|--------------|---------------|-----------------|---------------|
| A     | 1.0.0.0 - 126.0.0.0 | 1-126 | /8 | 16,777,214 |
| B     | 128.0.0.0 - 191.255.0.0 | 128-191 | /16 | 65,534 |
| C     | 192.0.0.0 - 223.255.255.0 | 192-223 | /24 | 254 |
| D     | 224.0.0.0 - 239.255.255.255 | 224-239 | Multicast | - |
| E     | 240.0.0.0 - 255.255.255.255 | 240-255 | Reservado | - |

## Rangos Privados vs Públicos

| Clase | Rango Privado | Rango Público |
|-------|--------------|---------------|
| A | 10.0.0.0/8 | 1.0.0.0 - 9.255.255.255 |
| B | 172.16.0.0/12 | 11.0.0.0 - 172.15.255.255 |
| C | 192.168.0.0/16 | 192.168.0.0 - 199.255.255.255 |

## Problemas Tipo Examen con Soluciones

### Problema 1: Subnetting Simple

**Pregunta**: Divide 10.0.0.0/8 en 256 subredes. ¿Cuántos hosts útiles tiene cada subred?

**Solución**:
- Necesitamos 256 subredes: log₂(256) = 8 bits adicionales
- Nueva máscara: /16 (8 + 8)
- Hosts por subred: 2^(32-16) - 2 = 65,534

### Problema 2: CIDR a Máscara Decimal

**Pregunta**: Convierte /19 a máscara decimal.

**Solución**:
```
/19 = 19 bits de red, 13 bits de host

Octeto 1: 11111111 = 255
Octeto 2: 11111111 = 255
Octeto 3: 11100000 = 224
Octeto 4: 00000000 = 0

Respuesta: 255.255.224.0
```

### Problema 3: Identificar la Subred

**Pregunta**: ¿A qué subred pertenece 172.16.50.100 con máscara /22?

**Solución**:
```
172.16.50.100 en binario:
Octeto 3: 00110010 (50)
Octeto 4: 01100100 (100)

/22 significa 22 bits de red
Tercera octeto: 11000000 (192) sería el límite
50 cae en: 10101100.00010000.00110010.01100100
Subred: 172.16.48.0/22
```

## Comandos Cisco para Configuración de Subredes

```
! Configuración de interfaz con subred
Router(config)# interface ethernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown

! Ver configuración de IP
Router# show ip interface brief

! Verificar tabla de enrutamiento
Router# show ip route

! Verificar direcciones IP configuradas
Router# show ip interface

! Ping para verificar conectividad
Router# ping 192.168.1.100
```

## Consejos Prácticos para Exámenes

1. **Aprende de memoria**: Máscaras /24, /25, /26, /27, /28, /30
2. **Método rápido de salto**: 256 - (último octeto de máscara)
3. **Dirección de broadcast**: Siempre la última dirección de la subred
4. **Hosts útiles**: Siempre = 2^(bits_de_host) - 2
5. **Orden VLSM**: Planifica de mayor a menor número de hosts

## Resumen

El subnetting es fundamental para cualquier ingeniero de redes. Dominar CIDR, máscaras de subred y VLSM te permitirá diseñar redes eficientes y aprobar cualquier examen de certificación. Practica constantemente con diferentes escenarios hasta que los cálculos sean automáticos.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: VLANs y Trunking 802.1Q',
  'vlans-y-trunking-802-1q',
  $MKDN$# Guía completa: VLANs y Trunking 802.1Q

## ¿Qué son las VLANs?

Una VLAN (Virtual Local Area Network) es un grupo lógico de dispositivos de red que pueden estar físicamente dispersos, pero actúan como si estuvieran en la misma red. Las VLANs segmentan dominios de broadcast y mejoran la seguridad y el rendimiento.

### Beneficios de las VLANs

| Beneficio | Descripción |
|-----------|-------------|
| Segmentación | Aísla el tráfico entre grupos de usuarios |
| Rendimiento | Reduce dominios de broadcast innecesarios |
| Seguridad | Impide acceso directo entre VLANs |
| Flexibilidad | Permite reorganizar redes sin cambios físicos |
| Administración | Facilita gestión de políticas por grupo |

## Concepto de Dominios de Broadcast

```
Sin VLANs (1 dominio broadcast):
┌─────────────────────────────┐
│   Switch - Todas en VLAN 1   │
├──────┬──────┬──────┬─────────┤
│ PC1  │ PC2  │ PC3  │ Servidor│
└──────┴──────┴──────┴─────────┘
Broadcast alcanza a TODOS

Con VLANs (3 dominios broadcast):
┌────────────────────────────────┐
│          Switch                 │
├──────────┬──────────┬──────────┤
│ VLAN 10  │ VLAN 20  │ VLAN 30  │
├──┬──┬────┼──┬──┬────┼──┬──┬────┤
│PC1│PC2│PC3│PC4│PC5│PC6│PC7│PC8│
└──┴──┴────┴──┴──┴────┴──┴──┴────┘
Broadcast solo dentro de cada VLAN
```

## Creación de VLANs en Cisco

```
! Crear VLAN
Switch(config)# vlan 10
Switch(config-vlan)# name Administración
Switch(config-vlan)# exit

! Crear múltiples VLANs
Switch(config)# vlan 20
Switch(config-vlan)# name Contabilidad
Switch(config-vlan)# exit

Switch(config)# vlan 30
Switch(config-vlan)# name Usuarios
Switch(config-vlan)# exit

! Ver VLANs
Switch# show vlan brief
Switch# show vlan id 10
Switch# show vlan name Administración
```

## Puertos Access vs Puertos Trunk

### Puerto Access

Un puerto access pertenece a **una única VLAN** y lleva tráfico sin etiquetar.

```
Switch(config)# interface fastethernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
Switch(config-if)# no shutdown
```

### Puerto Trunk

Un puerto trunk puede llevar tráfico de **múltiples VLANs** usando etiquetas 802.1Q.

```
Switch(config)# interface fastethernet 0/48
Switch(config-if)# switchport mode trunk
Switch(config-if)# no shutdown
```

## Formato de Encapsulación IEEE 802.1Q

El estándar IEEE 802.1Q agrega un campo de 4 bytes después del MAC destino:

```
Trama Ethernet sin VLAN (original):
┌──────┬──────┬──────┬────────┬─────────┐
│ Dst  │ Src  │ Tipo │ Datos  │   FCS  │
│ 6B   │ 6B   │ 2B   │ 46-1500│ 4B     │
└──────┴──────┴──────┴────────┴─────────┘

Trama Ethernet con 802.1Q tag:
┌──────┬──────┬────┬──────┬──────┬────────┬─────────┐
│ Dst  │ Src  │TPID│ TCI  │ Tipo │ Datos  │   FCS  │
│ 6B   │ 6B   │2B  │ 2B   │ 2B   │ 46-1500│ 4B     │
└──────┴──────┴────┴──────┴──────┴────────┴─────────┘

Campo TCI (Tag Control Information):
┌──────┬──────┬──────────────┐
│ PCP  │ DEI  │   VLAN ID    │
│ 3b   │ 1b   │   12 bits    │
└──────┴──────┴──────────────┘
PCP: Priority (0-7)
DEI: Drop Eligible
VLAN ID: Identifica VLAN (1-4094)
```

## Configuración de Trunk Ports

```
! Configurar puerto como trunk
Switch(config)# interface fastethernet 0/48
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk native vlan 99
Switch(config-if)# switchport trunk allowed vlan 10,20,30
Switch(config-if)# no shutdown

! Ver estado de trunk
Switch# show interfaces trunk
Switch# show interfaces fastethernet 0/48 switchport

! Permitir rango de VLANs
Switch(config-if)# switchport trunk allowed vlan 1-100

! Resetear a todas las VLANs
Switch(config-if)# no switchport trunk allowed vlan
Switch(config-if)# switchport trunk allowed vlan all
```

## VLAN Nativa (Native VLAN)

La VLAN nativa es aquella que **no recibe etiqueta 802.1Q** en puertos trunk. Por defecto es VLAN 1.

```
! Cambiar VLAN nativa
Switch(config)# interface fastethernet 0/48
Switch(config-if)# switchport trunk native vlan 99
Switch(config-if)# no shutdown

! Importante: Configurar igual en ambos switches
Switch2(config-if)# switchport trunk native vlan 99

! Ver VLAN nativa
Switch# show interfaces trunk
```

**Advertencia**: Si las VLAN nativas no coinciden en ambos extremos del trunk, se produce una situación de VLAN mismatch, permitiendo tráfico no deseado entre VLANs.

## Protocolo DTP (Dynamic Trunking Protocol)

DTP permite que los switches negotien automáticamente si un puerto debe ser trunk o access.

```
! Modos DTP en Cisco

! Desactivar DTP (recomendado en producción)
Switch(config-if)# switchport mode access
Switch(config-if)# switchport nonegotiate

! Forzar trunk sin DTP
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport nonegotiate

! Permitir DTP (por defecto)
Switch(config-if)# switchport mode dynamic desirable
Switch(config-if)# switchport mode dynamic auto

! Ver negociación DTP
Switch# debug sw-vlan vtp events
```

### Tabla de Negociación DTP

| Lado A | Lado B | Resultado |
|--------|--------|-----------|
| trunk | trunk | Trunk |
| trunk | dynamic desirable | Trunk |
| trunk | dynamic auto | Trunk |
| dynamic desirable | dynamic desirable | Trunk |
| dynamic desirable | dynamic auto | Trunk |
| dynamic auto | dynamic auto | Access |
| access | access | Access |

## VTP (VLAN Trunking Protocol)

VTP permite sincronizar información de VLANs entre múltiples switches, reduciendo la configuración manual.

### Modos VTP

| Modo | Descripción | Crear/Modificar VLANs | Sincronizar |
|------|-------------|----------------------|-------------|
| Server | Administra VLANs | Sí | Sí |
| Client | Recibe cambios | No | Sí |
| Transparent | Ignora VTP | Sí (localmente) | No |
| Off | VTP desactivado | Sí | No |

```
! Configurar VTP en servidor
Switch1(config)# vtp mode server
Switch1(config)# vtp domain EMPRESA
Switch1(config)# vtp password SEGURA
Switch1(config)# vtp version 2

! Configurar VTP en cliente
Switch2(config)# vtp mode client
Switch2(config)# vtp domain EMPRESA
Switch2(config)# vtp password SEGURA
Switch2(config)# vtp version 2

! Verificar VTP
Switch# show vtp status
Switch# show vtp password
```

## Enrutamiento Inter-VLAN

### Método 1: Router on a Stick

Usa una subinterfaz por VLAN en un router.

```
! En el Switch
Switch(config)# interface fastethernet 0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk native vlan 99

! En el Router
Router(config)# interface fastethernet 0/0
Router(config-if)# no shutdown

! Crear subinterfaces
Router(config)# interface fastethernet 0/0.10
Router(config-subif)# encapsulation dot1q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0
Router(config-subif)# exit

Router(config)# interface fastethernet 0/0.20
Router(config-subif)# encapsulation dot1q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
Router(config-subif)# exit

! Verificar
Router# show ip route
Router# show ip interface brief
```

### Método 2: Switch Capa 3 (SVI)

Un switch Capa 3 puede enrutar directamente entre VLANs.

```
! Habilitar enrutamiento
Switch(config)# ip routing

! Crear VLAN Interface (SVI)
Switch(config)# interface vlan 10
Switch(config-if)# ip address 192.168.10.1 255.255.255.0
Switch(config-if)# no shutdown

Switch(config)# interface vlan 20
Switch(config-if)# ip address 192.168.20.1 255.255.255.0
Switch(config-if)# no shutdown

! Configurar puertos como access
Switch(config)# interface range fastethernet 0/1-10
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport access vlan 10

! Verificar
Switch# show ip route
Switch# show ip interface brief
```

## Comparación Router on a Stick vs SVI

| Característica | Router on a Stick | Switch Capa 3 |
|----------------|-------------------|---------------|
| Dispositivos | Router + Switch | Solo Switch L3 |
| Velocidad | Limitada por enlace | Muy rápida |
| Costo | Bajo | Alto (equipos L3) |
| Complejidad | Media | Baja |
| Escalabilidad | Limitada | Excelente |
| Casos de Uso | Redes pequeñas | Empresarial |

## Comandos de Verificación

```
! Ver resumen de VLANs
Switch# show vlan brief

! Ver detalles de VLAN específica
Switch# show vlan id 10

! Ver estado de ports
Switch# show interfaces switchport
Switch# show interfaces fastethernet 0/1 switchport

! Ver trunks activos
Switch# show interfaces trunk

! Ver VTP status
Switch# show vtp status

! Ver ip routing habilitado
Switch# show ip routing

! Ver interfaces virtuales
Switch# show interface vlan 10

! Ver tabla MAC
Switch# show mac-address-table vlan 10
```

## Tabla de Troubleshooting

| Problema | Síntomas | Causa | Solución |
|----------|----------|-------|----------|
| VLANs no comunican | Hosts en diferentes VLANs no se alcanzan | No hay enrutamiento inter-VLAN | Configurar SVI o Router on a Stick |
| VLAN mismatch | Tráfico cruzado entre VLANs | VLAN nativa diferente en trunk | Sincronizar VLAN nativa en ambos switches |
| Trunk no forma | Puertos no pasan tráfico | DTP deshabilitado o modos incompatibles | Usar switchport mode trunk en ambos lados |
| VTP no sincroniza | VLANs no se propagan | Dominios o contraseñas diferentes | Verificar show vtp status |
| SVI inactiva | Interfaz vlan down | Ningún puerto access en VLAN | Asignar al menos un puerto a la VLAN |

## Resumen de Mejores Prácticas

1. **Desactivar DTP**: Usar switchport nonegotiate en producción
2. **Sincronizar nativas**: Configurar misma VLAN nativa en ambos extremos
3. **VTP transparente**: Usar modo transparent para más control
4. **Documentar VLANs**: Mantener registro de uso de cada VLAN
5. **Seguridad**: Proteger acceso a configuración de VLANs
6. **Escalabilidad**: Usar SVI en switches Capa 3 para mejor rendimiento
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: NAT y PAT',
  'nat-y-pat',
  $MKDN$# Guía completa: NAT y PAT

## ¿Por Qué Existe NAT?

NAT (Network Address Translation) fue creado debido al agotamiento inminente de direcciones IPv4. Con una población de dispositivos de red en crecimiento exponencial, el espacio de direcciones de 32 bits se vuelve insuficiente. NAT permite que múltiples dispositivos privados compartan una o pocas direcciones públicas.

### Historia del Agotamiento IPv4

```
Distribución de direcciones IPv4:
Clase A (1.0.0.0 - 126.0.0.0):    126 millones de IPs
Clase B (128.0.0.0 - 191.255.0.0): 1,073 millones de IPs
Clase C (192.0.0.0 - 223.255.255.0): 2,097 millones de IPs

Total teórico: 4,294,967,296 IPs

Reservadas para privadas:
10.0.0.0/8:          16,777,216 IPs
172.16.0.0/12:       1,048,576 IPs
192.168.0.0/16:      65,536 IPs

Por lo tanto: solo ~3,700 millones IPs públicas disponibles
```

## Tipos de NAT

### 1. NAT Estático

Una dirección IP privada se asigna a una dirección IP pública de forma permanente.

**Uso**: Servidores web, mail, FTP que necesitan acceso desde internet

```
10.0.0.10 (privado) ←→ 203.0.113.10 (público)
10.0.0.20 (privado) ←→ 203.0.113.20 (público)
```

### 2. NAT Dinámico

Múltiples IPs privadas se asignan a un pool de IPs públicas dinámicamente.

**Uso**: Oficinas que necesitan múltiples IPs públicas

```
Pool de públicas: 203.0.113.10 - 203.0.113.20 (11 IPs)
IPs privadas: 10.0.0.1 - 10.0.0.255 (255 IPs)

Asignación dinámica cuando se inicializa conexión
```

### 3. NAT Overload (PAT - Port Address Translation)

Múltiples IPs privadas comparten una única IP pública, diferenciadas por puertos.

**Uso**: Empresas pequeñas, redes domésticas

```
10.0.0.10:1025 → 203.0.113.1:5000
10.0.0.10:1026 → 203.0.113.1:5001
10.0.0.20:1025 → 203.0.113.1:5002
```

## Tabla Comparativa de NAT

| Tipo | Dirección IP Pública | Puerto | Caso de Uso | Ventajas | Desventajas |
|------|----------------------|--------|-------------|----------|-------------|
| Estático | 1:1 | Mismo | Servidores internos | Acceso directo siempre | Costo alto (IPs públicas) |
| Dinámico | Pool | Mismo | Oficinas medianas | Escalable | Requiere múltiples públicas |
| PAT/Overload | Compartida | Diferentes | PYMES, hogares | Máxima eficiencia | Solo salida, puertos limitados |

## Cómo Funciona la Tabla de Traducción NAT

NAT mantiene una tabla en memoria que mapea direcciones internas a externas.

```
Tabla de Traducción NAT (ejemplo):
┌──────────────┬──────────┬──────────────┬──────────┐
│ Int IP:Port  │ Int Prot │ Ext IP:Port  │ Ext Prot │
├──────────────┼──────────┼──────────────┼──────────┤
│ 10.0.0.10:80 │ TCP      │ 203.0.113.1  │ 5000     │
│ 10.0.0.20:21 │ TCP      │ 203.0.113.1  │ 5001     │
│ 10.0.0.30:53 │ UDP      │ 203.0.113.1  │ 5002     │
└──────────────┴──────────┴──────────────┴──────────┘

Flujo de paquete:
1. Cliente interno: 10.0.0.10:1500 → Servidor externo: 8.8.8.8:53
2. Router NAT traduce:
   - IP origen: 10.0.0.10 → 203.0.113.1
   - Puerto origen: 1500 → 5000
   Paquete saliente: 203.0.113.1:5000 → 8.8.8.8:53
3. Respuesta: 8.8.8.8:53 → 203.0.113.1:5000
4. Router NAT traduce de vuelta:
   - IP destino: 203.0.113.1 → 10.0.0.10
   - Puerto destino: 5000 → 1500
   Paquete entrante: 8.8.8.8:53 → 10.0.0.10:1500
```

## Configuración de NAT Estático en Cisco

```
! Designar interfaces
Router(config)# interface fastethernet 0/0
Router(config-if)# ip nat inside

Router(config)# interface fastethernet 0/1
Router(config-if)# ip nat outside

! Crear mapeo estático
Router(config)# ip nat inside source static 10.0.0.10 203.0.113.10
Router(config)# ip nat inside source static 10.0.0.20 203.0.113.20

! Verificar
Router# show ip nat translations
Router# show ip nat statistics
```

## Configuración de NAT Dinámico

```
! Designar interfaces
Router(config)# interface fastethernet 0/0
Router(config-if)# ip nat inside
Router(config-if)# exit

Router(config)# interface fastethernet 0/1
Router(config-if)# ip nat outside
Router(config-if)# exit

! Crear pool de direcciones públicas
Router(config)# ip nat pool POOL1 203.0.113.10 203.0.113.20 netmask 255.255.255.0

! Crear ACL para tráfico a traducir
Router(config)# access-list 1 permit 10.0.0.0 0.0.0.255

! Asociar ACL a pool
Router(config)# ip nat inside source list 1 pool POOL1

! Verificar
Router# show ip nat translations
Router# show ip nat statistics
```

## Configuración de PAT (NAT Overload)

```
! Designar interfaces
Router(config)# interface fastethernet 0/0
Router(config-if)# ip nat inside
Router(config-if)# exit

Router(config)# interface fastethernet 0/1
Router(config-if)# ip nat outside
Router(config-if)# exit

! Método 1: Usar interfaz externa como IP pública
Router(config)# access-list 1 permit 10.0.0.0 0.0.0.255
Router(config)# ip nat inside source list 1 interface fastethernet 0/1 overload

! Método 2: Usar pool específico
Router(config)# ip nat pool POOL1 203.0.113.1 203.0.113.1 netmask 255.255.255.0
Router(config)# ip nat inside source list 1 pool POOL1 overload

! Verificar traducciones
Router# show ip nat translations
Router# show ip nat statistics

! Ver traducciones en tiempo real
Router# debug ip nat
Router# undebug all
```

## Comandos de Verificación NAT

```
! Ver tabla de traducciones
Router# show ip nat translations
Router# show ip nat translations verbose

! Ver estadísticas
Router# show ip nat statistics

! Ver dirección inside/outside
Router# show ip nat statistics all

! Limpiar traducciones (útil en troubleshooting)
Router# clear ip nat translation *
Router# clear ip nat translation inside 10.0.0.10 203.0.113.1

! Ver configuración NAT
Router# show running-config | include nat

! Ver ACLs
Router# show access-list
```

## Troubleshooting de NAT

### Problema 1: Tráfico no se traduce

```
Verificar:
1. Interface correctamente designada:
   Router# show ip nat statistics

2. ACL permitiendo tráfico:
   Router# show access-list

3. Problema típico: ACL referencia interfaz equivocada
   - ACL con interfaz NAT outside: NO TRADUCE
   - ACL debe estar en interfaz NAT inside

Solución:
Router(config)# no access-list 1
Router(config)# access-list 1 permit 10.0.0.0 0.0.0.255
Router(config)# no ip nat inside source list 1 interface fastethernet 0/1 overload
Router(config)# ip nat inside source list 1 interface fastethernet 0/1 overload
```

### Problema 2: Puertos conflictivos

```
Síntoma: Ciertos puertos (80, 443) no funcionan tras NAT

Solución: Usar NAT dinámico + PAT para puertos específicos
Router(config)# ip nat pool POOL1 203.0.113.1 203.0.113.1 netmask 255.255.255.0
Router(config)# access-list 1 permit 10.0.0.0 0.0.0.255
Router(config)# ip nat inside source list 1 pool POOL1 overload
```

## NAT64 (Mención Importante)

Con el agotamiento de IPv4 cerca de su fin, IPv6 es la solución a largo plazo. NAT64 permite que clientes IPv6 accedan a servidores IPv4.

```
[IPv6 Cliente] ←NAT64→ [IPv4 Server]
   fe80::1              192.168.1.1

Configuración básica Cisco:
Router(config)# nat64 enable
Router(config)# nat64 prefix 64:ff9b::/96
```

## Escenario Empresarial Real

**Empresa: TechCorp con 300 empleados**

Requisitos:
- Red interna: 10.0.0.0/16
- ISP proporciona: 203.0.113.0/28 (14 IPs públicas)
- Servidor web: debe ser accesible desde internet
- Empleados: deben acceder a internet

```
Solución:
1. NAT Estático para servidor web
   10.0.0.100 ←→ 203.0.113.10

2. PAT para empleados
   10.0.0.0/16 ←→ 203.0.113.1 (overload)

Configuración:
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip nat inside

Router(config)# interface gigabitethernet 0/1
Router(config-if)# ip nat outside

! Estático para servidor
Router(config)# ip nat inside source static 10.0.0.100 203.0.113.10

! Dinámico para empleados
Router(config)# access-list 1 permit 10.0.0.0 0.0.0.255
Router(config)# access-list 1 deny 10.0.0.100
Router(config)# ip nat inside source list 1 interface gigabitethernet 0/1 overload

Verificación:
Router# show ip nat translations
Router# show ip nat statistics
```

## Ventajas y Desventajas Generales

| Ventajas | Desventajas |
|----------|-------------|
| Extiende vida útil de IPv4 | Complejidad en troubleshooting |
| Seguridad por ocultamiento | Latencia procesamiento |
| Privacidad de red interna | No funciona bien con P2P |
| Escalabilidad de clientes | Dificulta auditoría |
| Bajo costo | VoIP y videoconferencia problemática |

## Resumen

NAT y PAT son tecnologías esenciales en redes modernas. Mientras NAT Estático es ideal para servidores internos, PAT es perfecto para pequeñas redes que necesitan eficiencia de direcciones. Domina su configuración y troubleshooting para cualquier ambiente de producción.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: Enrutamiento dinámico con OSPF',
  'enrutamiento-dinamico-ospf',
  $MKDN$# Guía completa: Enrutamiento dinámico con OSPF

## ¿Por Qué Enrutamiento Dinámico?

El enrutamiento estático escala pobremente. Imagina una empresa con 1000 routers: mantener manualmente todas las rutas sería imposible. Los protocolos dinámicos permiten que los routers aprendan automáticamente la topología de la red.

## Comparación: Distance-Vector vs Link-State

| Característica | Distance-Vector | Link-State |
|----------------|-----------------|-----------|
| Protocolo Ejemplo | RIP, EIGRP | OSPF, IS-IS |
| Métrica | Saltos, ancho banda | Costo (basado en ancho de banda) |
| Actualizaciones | Periódicas (RIP cada 30s) | Event-driven |
| Convergencia | Lenta (minutos) | Rápida (segundos) |
| Escalabilidad | Pobre (máx 15 saltos) | Excelente |
| Consumo CPU | Bajo | Moderado-Alto |
| Consumo Ancho Banda | Bajo | Moderado |
| Hello Interval | N/A | 10s (broadcast) / 30s (NBMA) |
| Base de datos | Tabla de enrutamiento | LSDB (Link State Database) |

### Comparación Tripartita

| Protocolo | Tipo | Métrica | Convergencia | Escalabilidad |
|-----------|------|--------|--------------|---------------|
| RIP v2 | Distance-Vector | Saltos | Muy lenta | Muy pobre |
| EIGRP | Híbrido | Composita | Rápida | Muy buena |
| OSPF | Link-State | Costo | Muy rápida | Excelente |

## Conceptos Fundamentales de OSPF

### 1. Áreas

OSPF divide grandes redes en áreas para escalar mejor.

```
Estructura jerárquica OSPF:

                    ┌─────────────────┐
                    │   Internet      │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │ Area 0 (Backbone)│
                    │   (Obligatoria)  │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
            ┌─────┴─────┐         ┌─────┴─────┐
            │  Area 1   │         │  Area 2   │
            │(Regular)  │         │(Stub)     │
            └───────────┘         └───────────┘
```

### 2. Elección de DR/BDR

OSPF elige un Designated Router (DR) y Backup DR (BDR) en redes multi-acceso.

```
Prioridad OSPF (0-255):
- Prioridad 0: Nunca es DR
- Mayor prioridad gana
- Empate: Mayor IP gana

Timers OSPF:
- Hello: 10 segundos
- Dead: 40 segundos (4 x Hello)

Determinación DR:
1. Router con mayor prioridad
2. Si empate, router con mayor ID (IP)
3. No elige nuevo DR si el actual está vivo (sticky)
```

### 3. Base de Datos de Estados de Enlace (LSDB)

Cada router OSPF mantiene una copia idéntica de la topología.

```
LSA (Link State Advertisement) Tipos:

Tipo 1: Router LSA
  - Originado por cada router
  - Describe enlaces conectados

Tipo 2: Network LSA
  - Originado por DR
  - Describe red multi-acceso

Tipo 3: Network Summary LSA
  - Originado por ABR
  - Resume redes en otras áreas

Tipo 4: ASBR Summary LSA
  - Anuncia ubicación de ASBR

Tipo 5: External LSA
  - Describe rutas externas (redistribuidas)
```

## Cálculo del Costo OSPF

```
Fórmula: Costo = Referencia Ancho Banda / Ancho Banda Interfaz

Valores por defecto:
┌─────────────┬──────────────┬──────────┐
│ Tipo Enlace │ Ancho Banda  │ Costo    │
├─────────────┼──────────────┼──────────┤
│ 10 Mbps     │ 10,000,000   │ 100      │
│ 100 Mbps    │ 100,000,000  │ 10       │
│ 1 Gbps      │ 1,000,000,000│ 1        │
│ 10 Gbps     │ 10,000,000,000│ 1 (capped)│
│ Serial 64k  │ 64,000       │ 1562     │
│ Serial 128k │ 128,000      │ 781      │
│ Serial 256k │ 256,000      │ 390      │
└─────────────┴──────────────┴──────────┘

Ejemplo:
Router(config-if)# bandwidth 1000  (especificar en Kbps)
```

## OSPF de Área Única (Single-Area)

Toda la red en área 0.

```
Topología:
        ┌──────────┐
        │ Router A │
        │ Area 0   │
        └────┬─────┘
             │
        192.168.1.0/24
             │
        ┌────┴─────┐
        │ Router B │
        │ Area 0   │
        └──────────┘

Configuración Router A:
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# router-id 1.1.1.1
Router(config-router)# exit

Configuración Router B:
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# router-id 2.2.2.2
Router(config-router)# exit

! Verificar vecinos
Router# show ip ospf neighbor
Router# show ip route ospf
Router# show ip ospf database
```

## OSPF Multi-área (Multi-Area)

```
Topología:
    ┌─────────┐
    │ Area 0  │  Backbone
    └────┬────┘
         │
    ┌────┴─────────────────┐
    │                       │
┌───┴──────┐         ┌──────┴───┐
│ Area 1   │         │ Area 2   │
│(Regular) │         │(Stub)    │
└──────────┘         └──────────┘

Configuración ABR (router en Area 0 y 1):
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# network 10.1.0.0 0.0.0.255 area 1
Router(config-router)# router-id 1.1.1.1
Router(config-router)# exit

Configuración ASBR (redistribuidor de rutas externas):
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# redistribute static
Router(config-router)# default-information originate
Router(config-router)# exit

! Verificar ABRs
Router# show ip ospf border-routers
```

## Tipos de Áreas OSPF

| Tipo de Área | Recibe LSA Tipo 3 | Recibe LSA Tipo 4 | Recibe LSA Tipo 5 | Usa Default |
|--------------|-------------------|------------------|------------------|-------------|
| Normal | Sí | Sí | Sí | No |
| Stub | Sí | No | No | Sí |
| Totally Stubby | No | No | No | Sí |
| NSSA | Sí | No | No (Type 7) | Sí |

```
Configuración Área Stub:
Router(config)# router ospf 1
Router(config-router)# area 1 stub
Router(config-router)# exit

Configuración Área Totally Stubby:
Router(config)# router ospf 1
Router(config-router)# area 1 stub no-summary
Router(config-router)# exit
```

## Autenticación OSPF

```
Autenticación simple (clara - insegura):
Router(config-if)# ip ospf authentication-key PASSWORD
Router(config-if)# ip ospf authentication

Autenticación MD5 (segura):
Router(config-if)# ip ospf message-digest-key 1 md5 PASSWORD
Router(config-if)# ip ospf authentication message-digest

! Verificar autenticación
Router# show ip ospf interface
Router# show ip ospf interface serial 0/0 | include Authentication
```

## Comandos Clave de OSPF

```
! Ver resumen OSPF
Router# show ip ospf

! Ver proceso OSPF
Router# show ip ospf process-id 1

! Ver vecinos
Router# show ip ospf neighbor
Router# show ip ospf neighbor detail

! Ver base de datos de enlaces
Router# show ip ospf database
Router# show ip ospf database router
Router# show ip ospf database summary

! Ver tabla de enrutamiento OSPF
Router# show ip route ospf
Router# show ip route 10.0.0.0

! Ver interfaces OSPF
Router# show ip ospf interface brief
Router# show ip ospf interface fastethernet 0/0

! Estadísticas
Router# show ip ospf statistics

! Debugger (cuidado en producción)
Router# debug ip ospf packets
Router# debug ip ospf hello
Router# undebug all
```

## Tabla de Troubleshooting OSPF

| Problema | Síntomas | Causa Común | Solución |
|----------|----------|-------------|----------|
| Vecinos no forman | Neighbors = 0 | OSPF no habilitado en interfaz | Verificar network command en router ospf |
| Vecinos inestables | Constant up/down | MTU mismatch, timers diferentes | Verificar ip mtu, hello y dead timers |
| No converge | Rutas antiguas | LSDB no sincronizada | Verificar show ip ospf database |
| Cost incorrecto | Métrica inesperada | Bandwidth configurado mal | Usar bandwidth <kbps> en interfaz |
| DR no elige correcto | DR incorrecto | Prioridad no configurada | Configurar ip ospf priority |
| Auth falla | Neighbors down | Passwords no coinciden | Sincronizar keys en ambos routers |
| Flapping de rutas | Inestabilidad | Interfaz intermitente | Investigar capa física |

## Ejemplo Completo: Empresa Multi-sitio

**Requisito**: 3 oficinas con OSPF multi-área

```
Topología:
          [Internet]
              │
         ┌────┴────┐
         │ Area 0   │ HQ (Backbone)
         │Router A  │
         └────┬─────┘
              │ 10.0.0.0/24
         ┌────┴──────────────────┐
         │                        │
      [Area 1]              [Area 2]
      Router B              Router C
      10.1.0.0/24           10.2.0.0/24
      (Stub)                (Stub)

Router A (HQ - Backbone):
=========================
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# network 172.16.0.0 0.0.0.255 area 0
Router(config-router)# router-id 10.255.255.1
Router(config-router)# exit

Router B (Oficina 1 - Area 1):
=============================
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# network 10.1.0.0 0.0.0.255 area 1
Router(config-router)# area 1 stub
Router(config-router)# router-id 10.255.255.2
Router(config-router)# exit

Router C (Oficina 2 - Area 2):
=============================
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# network 10.2.0.0 0.0.0.255 area 2
Router(config-router)# area 2 stub
Router(config-router)# router-id 10.255.255.3
Router(config-router)# exit

Verificación:
Router# show ip ospf neighbor
Router# show ip route ospf
Router# show ip ospf database summary
```

## Resumen

OSPF es el protocolo de enrutamiento más flexible y escalable para redes corporativas. Su capacidad de crear áreas, calcular costos basados en ancho de banda y converger rápidamente lo hacen superior a protocolos más antiguos. Domina su configuración multi-área para cualquier ambiente empresarial.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: IPv6 - Direccionamiento y Transición',
  'ipv6-direccionamiento-y-transicion',
  $MKDN$# Guía completa: IPv6 - Direccionamiento y Transición

## ¿Por Qué IPv6?

El agotamiento de direcciones IPv4 es inminente. Con solo ~3,700 millones de direcciones públicas disponibles y más de 8,000 millones de personas en el planeta, IPv6 es obligatorio.

```
Comparación IPv4 vs IPv6:

IPv4: 32 bits = 2^32 = 4,294,967,296 direcciones
IPv6: 128 bits = 2^128 = 340,282,366,920,938,463,463,374,607,431,768,211,456 direcciones

Es decir: ~340 sextillones de direcciones
Suficiente para asignar ~50 direcciones por metro cuadrado de Tierra
```

## Formato de Dirección IPv6

Una dirección IPv6 consta de 128 bits, usualmente expresados en hexadecimal separados por dos puntos cada 16 bits (32 caracteres hex).

```
Formato completo:
2001:0db8:0000:0000:0000:0000:0000:0001

Desglose:
2001  = 0010 0000 0000 0001
0db8  = 0000 1101 1011 1000
0000  = 0000 0000 0000 0000
0000  = 0000 0000 0000 0000
0000  = 0000 0000 0000 0000
0000  = 0000 0000 0000 0000
0000  = 0000 0000 0000 0000
0001  = 0000 0000 0000 0001
```

## Reglas de Abreviación IPv6

### Regla 1: Omitir Ceros Iniciales

```
2001:0db8:0000:0000:0000:0000:0000:0001
                                        ↓
2001:db8:0:0:0:0:0:1
```

### Regla 2: Comprimir Ceros Consecutivos (una vez por dirección)

```
2001:db8:0:0:0:0:0:1
                  ↓
2001:db8::1  (mucho mejor)

2001:0db8:85a3:0000:0000:8a2e:0370:7334
             ↓
2001:db8:85a3::8a2e:370:7334
```

## Tipos de Direcciones IPv6

### 1. Unicast Global (GUA)

Similar a dirección pública IPv4. Comienza con 2000::/3.

```
Formato:
┌──────────────┬────────────────┬──────────────┐
│ Global Prefix│  Subnet ID     │ Interface ID │
│   48 bits    │    16 bits     │   64 bits    │
└──────────────┴────────────────┴──────────────┘

Ejemplo:
2001:db8::/32  → Prefix Global
2001:db8:1234::/48 → Subred de empresa
2001:db8:1234:5678::1 → Dirección específica

Rango: 2000::/3 a 3fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
```

### 2. Link-Local

Generada automáticamente. Comienza con fe80::/10. Solo válida en enlace local.

```
Ejemplo: fe80::1

Características:
- Autogenerada por cada interfaz
- No enrutable globalmente
- Usada para vecinos en mismo enlace
- Usada por OSPF, BGP para vecindad
```

### 3. Multicast

Para comunicación grupo-a-grupo. Comienza con ff00::/8.

```
Estructura:
┌──────┬──────┬────────────────┐
│ Prefix│ Flags│ Group Address  │
│ 8 bits│ 4   │   112 bits     │
└──────┴──────┴────────────────┘

Ejemplos:
ff02::1         - Todos los nodos en enlace
ff02::2         - Todos los routers en enlace
ff02::1:ff00:1  - Solicitud de Neighbor Advertisement

Puertos IPv6 multicast en Cisco:
ff02::1:ffxx:xxxx - Neighbor Solicitation
```

### 4. Anycast

Dirección compartida por múltiples servidores. El más cercano responde.

```
Configuración:
Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 address 2001:db8:1::1
Router(config-if)# ipv6 address 2001:db8:1::1 anycast
```

### 5. Loopback

Usada para identificar el router. No se asigna a interfaces físicas.

```
Ejemplo: ::1 (equivalente a 127.0.0.1 en IPv4)

Configuración en Cisco:
Router(config)# interface loopback 0
Router(config-if)# ipv6 address 2001:db8::1
```

## Notación de Prefijo IPv6

CIDR se usa igual en IPv6. El número después de / indica bits de red.

```
2001:db8::/32 → 32 bits de red
2001:db8:1234::/48 → 48 bits de red
2001:db8:1234:5678::/64 → 64 bits de red

Cálculo de subredes IPv6:
/48 = 48 bits de red, 80 bits de host
/64 = 64 bits de red, 64 bits de host

Para subnetting:
- /48 es típico para empresa
- /64 es típico para subred local
- /128 es para host individual
```

## Configuración Automática EUI-64

EUI-64 (Extended Unique Identifier) genera automáticamente el ID de interfaz usando la dirección MAC.

```
Proceso:
1. Tomar MAC: 00:1a:2b:3c:4d:5e
2. Insertar ffff en medio: 00:1a:2b:ff:fe:3c:4d:5e
3. Invertir bit 7 del primer octeto:
   00 → 02 (00000000 → 00000010)
   Resultado: 02:1a:2b:ff:fe:3c:4d:5e
4. Convertir a IPv6:
   021a:2bff:fe3c:4d5e

Dirección completa:
fe80::021a:2bff:fe3c:4d5e

Configuración Cisco:
Router(config-if)# ipv6 address 2001:db8:1::/64 eui-64
```

## SLAAC (Stateless Address Auto-Configuration)

SLAAC permite que dispositivos se auto-configuren sin servidor DHCP.

```
Proceso SLAAC:
1. Cliente recibe Router Advertisement con prefijo
2. Combina prefijo + EUI-64 para dirección completa
3. Realiza Duplicate Address Detection (DAD)
4. Dirección está lista para usar

Configuración Router (envía RA):
Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 address 2001:db8:1::1/64
Router(config-if)# ipv6 nd ra-interval 200  (cada 200 segundos)
Router(config-if)# ipv6 nd prefix 2001:db8:1::/64

Configuración Cliente (recibe RA):
Router(config-if)# ipv6 address autoconfig
```

## DHCPv6 Stateful vs Stateless

| Característica | Stateless | Stateful |
|----------------|-----------|----------|
| Dirección | SLAAC | Servidor DHCP |
| DNS | DHCPv6 | DHCPv6 |
| Gateway | Router Advertisement | Servidor DHCP |
| Caso de Uso | Redes pequeñas | Empresas |
| Complejidad | Baja | Media |

```
Configuración DHCPv6 Stateless:
Router(config)# ipv6 dhcp pool IPV6POOL
Router(config-dhcp)# dns-server 2001:db8:1::53
Router(config-dhcp)# domain-name ejemplo.com
Router(config-dhcp)# exit

Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 nd other-config-flag
Router(config-if)# ipv6 dhcp server IPV6POOL

Configuración DHCPv6 Stateful:
Router(config)# ipv6 dhcp pool STATEFULPOOL
Router(config-dhcp)# address prefix 2001:db8:1::/64
Router(config-dhcp)# dns-server 2001:db8:1::53
Router(config-dhcp)# exit

Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 nd managed-config-flag
Router(config-if)# ipv6 dhcp server STATEFULPOOL
```

## IPv6 en Cisco

### Habilitar Enrutamiento IPv6

```
Router(config)# ipv6 unicast-routing

! Verificar
Router# show ipv6 status
```

### Configuración Básica de Interfaz

```
Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 address 2001:db8:1::1/64
Router(config-if)# ipv6 address fe80::1 link-local
Router(config-if)# ipv6 enable
Router(config-if)# no shutdown

! Verificar
Router# show ipv6 interface brief
Router# show ipv6 interface fastethernet 0/0
Router# show ipv6 address
```

### Configuración OSPF para IPv6

```
Router(config)# ipv6 router ospf 1
Router(config-rtr)# router-id 1.1.1.1
Router(config-rtr)# exit

Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 ospf 1 area 0
Router(config-if)# exit

! Verificar
Router# show ipv6 ospf neighbor
Router# show ipv6 route ospf
```

## Mecanismos de Transición IPv4 → IPv6

### 1. Dual-Stack

Ejecutar IPv4 e IPv6 simultáneamente.

```
Ventajas:
- Coexistencia pacífica
- Migración gradual
- Ambos protocolos funcionan

Desventajas:
- Complejidad de gestión
- Doble overhead de red

Configuración:
Router(config)# interface fastethernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# ipv6 address 2001:db8:1::1/64
Router(config-if)# no shutdown
```

### 2. Tunelización

Encapsular tráfico IPv6 dentro de IPv4.

```
Tipos:
- 6to4: Automática, sin configuración de túnel
- Teredo: Atraviesa NAT
- Manual: Explícitamente configurado

Túnel manual:
Router(config)# interface tunnel 0
Router(config-if)# tunnel source 192.168.1.1 (IPv4)
Router(config-if)# tunnel destination 192.168.1.2
Router(config-if)# tunnel mode ipv6ip
Router(config-if)# ipv6 address 2001:db8:1::1/64
Router(config-if)# no shutdown

! Verificar
Router# show interface tunnel 0
Router# show tunnel
```

### 3. NAT64

Permitir comunicación entre clientes IPv6 y servidores IPv4.

```
Configuración básica:
Router(config)# nat64 enable
Router(config)# nat64 prefix 64:ff9b::/96

! Verificar
Router# show nat64 status
Router# show nat64 statistics
```

## Tabla Comparativa: IPv4 vs IPv6

| Aspecto | IPv4 | IPv6 |
|--------|------|------|
| Bits | 32 | 128 |
| Direcciones | ~4.3 mil millones | ~340 sextillones |
| Notación | Decimal | Hexadecimal |
| Máscara | 255.255.255.0 | /64 |
| DHCP | DHCPv4 | DHCPv6 |
| Auto-config | APIPA | SLAAC |
| Multicast | Limitado | Robusto |
| Loopback | 127.0.0.1 | ::1 |
| Broadcast | Sí | No (multicast) |
| Fragmentación | Router | Host |
| Checksum | IP + ICMP | Solo ICMPv6 |
| QoS | ToS | Traffic Class |
| IPSec | Opcional | Mandatorio (conceptual) |

## Ejemplo Real: Migración Empresa a IPv6

**Empresa TechCorp**: 500 empleados, red 10.0.0.0/8

```
Fase 1: Planificación
- Asignar 2001:db8::/32 de ISP
- Dividir en /48 por departamento:
  * 2001:db8:1::/48 → Administración
  * 2001:db8:2::/48 → Contabilidad
  * 2001:db8:3::/48 → Usuarios

Fase 2: Implementación Dual-Stack
Router(config)# ipv6 unicast-routing
Router(config)# interface fastethernet 0/0
Router(config-if)# ip address 10.0.0.1 255.255.0.0
Router(config-if)# ipv6 address 2001:db8:1::1/48
Router(config-if)# no shutdown

Fase 3: DHCP e IPv6
Router(config)# ipv6 dhcp pool EMPRESA
Router(config-dhcp)# address prefix 2001:db8:1::/64
Router(config-dhcp)# dns-server 2001:db8::53
Router(config-dhcp)# exit

Fase 4: Verificación
Router# show ipv6 interface brief
Router# show ipv6 route
Router# ping 2001:db8:1::100
```

## Comandos de Verificación IPv6

```
! Estado IPv6
Router# show ipv6 status

! Direcciones configuradas
Router# show ipv6 interface brief
Router# show ipv6 address

! Ruta IPv6
Router# show ipv6 route
Router# show ipv6 route 2001:db8::/32

! Vecinos IPv6
Router# show ipv6 neighbors

! OSPF IPv6
Router# show ipv6 ospf neighbor
Router# show ipv6 ospf database

! Ping IPv6
Router# ping ipv6 2001:db8::1

! Traceroute IPv6
Router# traceroute ipv6 2001:db8::1

! DHCP
Router# show ipv6 dhcp pool
Router# show ipv6 dhcp binding
```

## Resumen

IPv6 es el presente de internet. Su adopción es inevitable y obligatoria. Domina los conceptos de direccionamiento, configuración automática y mecanismos de transición para preparar tu carrera en networking moderno.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: Spanning Tree Protocol (STP y RSTP)',
  'spanning-tree-stp-rstp',
  $MKDN$# Guía completa: Spanning Tree Protocol (STP y RSTP)

## ¿Por Qué STP?

En redes con enlaces redundantes, sin STP ocurrirían desastres de broadcast que colapsarían la red en segundos.

```
Red sin STP (3 switches, enlaces redundantes):
        ┌────────────┐
        │  Switch A  │
        └─────┬──────┘
              │
         ┌────┴─────┐
         │           │
    ┌────┴───┐   ┌──┴────┐
    │Switch B│   │Switch C│
    └────┬───┘   └──┬─────┘
         │           │
         └─────┬─────┘
         Broadcast Frame:
         - Switch A envía broadcast
         - Switch B recibe y reenvía
         - Switch C recibe y reenvía
         - Llega nuevamente a A
         - A reenvía nuevamente
         - TORMENTA DE BROADCAST INFINITA
```

## Problemas que STP Resuelve

| Problema | Descripción | Impacto |
|----------|-------------|--------|
| Loops | Bucles en topología | Broadcast infinito |
| MAC Table Instability | Tabla MAC inestable | Flooding incorrecto |
| Duplicate Frames | Múltiples copias de frames | Corrupción de datos |
| Bandwidth Wasted | Utilización ineficiente | Congestionamiento |

## Conceptos Fundamentales de STP

### 1. Elección del Root Bridge

El Root Bridge es el puente "central" de la topología. La elección se basa en:

```
Prioridad: Menor es mejor (defecto: 32768)
Si empate en prioridad: MAC menor

Cambiar prioridad:
Switch(config)# spanning-tree vlan 1 priority 4096

Cambiar para ser Root (automático):
Switch(config)# spanning-tree vlan 1 root primary

Cambiar para backup Root:
Switch(config)# spanning-tree vlan 1 root secondary
```

### 2. Root Path Cost

Es el costo acumulativo desde cada switch al Root Bridge.

```
Cálculo:
Path Cost = suma de costos de todos los puertos en el camino

Costos de Puerto (802.1D):
Velocidad     | Costo
─────────────┼──────────
10 Mbps      | 100
100 Mbps     | 19
1 Gbps       | 4
10 Gbps      | 2

Switch(config-if)# spanning-tree cost 10 (modificar)
```

### 3. Roles de Puerto STP

```
┌──────────────────────────────────────┐
│      Root Bridge                     │
│  ┌──────────┬──────────┐             │
│  │ Root Port│Root Port │             │
│  │ (forwarding)        │             │
│  └──────────┴──────────┘             │
└──────────────────────────────────────┘
         ↓
    ┌────────────────┐
    │ Non-Root       │
    │ Switch 1       │
    │ ┌──────┬─────┐ │
    │ │Root  │Blocked
    │ │Port  │Port  │
    │ └──────┴─────┘ │
    └────────────────┘

Root Port: Puerto con menor costo hacia Root Bridge
Designated Port: Puerto que forwarda en cada segmento
Blocked Port: Puerto bloqueado (previene loops)
```

### 4. Estados de Puerto STP

| Estado | Duración | Aprende MAC | Reenvía Frames | Propósito |
|--------|----------|-------------|----------------|-----------|
| Disabled | - | No | No | Puerto administrativamente deshabilitado |
| Blocking | - | No | No | Previene loops, no hay datos |
| Listening | 15 seg | No | No | Escucha BPDUs, determina rol |
| Learning | 15 seg | Sí | No | Aprende direcciones MAC |
| Forwarding | - | Sí | Sí | Funcionamiento normal |

### 5. Mensajes BPDU (Bridge Protocol Data Unit)

Los BPDUs son mensajes que intercambian los switches para elegir la topología.

```
Estructura BPDU:
┌─────────────────────────────────────┐
│ Bridge Priority (2 bytes)            │
├─────────────────────────────────────┤
│ Bridge MAC Address (6 bytes)         │
├─────────────────────────────────────┤
│ Root Path Cost (4 bytes)             │
├─────────────────────────────────────┤
│ Sender Priority (2 bytes)            │
├─────────────────────────────────────┤
│ Sender MAC Address (6 bytes)         │
├─────────────────────────────────────┤
│ Port ID (1 byte)                     │
└─────────────────────────────────────┘

Los switches intercambian BPDUs cada 2 segundos (default)
```

## Timers STP

| Timer | Defecto | Descripción |
|-------|---------|-------------|
| Hello Time | 2 seg | Intervalo entre BPDUs |
| Forward Delay | 15 seg | Listening + Learning |
| Max Age | 20 seg | Tiempo antes de olvidad BPDU |

```
Cambiar timers (en root bridge):
Switch(config)# spanning-tree vlan 1 hello-time 1
Switch(config)# spanning-tree vlan 1 forward-time 10
Switch(config)# spanning-tree vlan 1 max-age 20
```

## Cambios de Topología en STP

Cuando cambia la topología (falla un enlace):

```
1. Switch detecta cambio
2. Envía BPDU con Topology Change flag
3. Root Bridge confirma con TCN ACK
4. Forward Delay se reduce temporalmente
5. Puertos bloqueados pasan a Forwarding
6. Convergencia: máximo 50 segundos

Configurar TCN:
Switch(config)# spanning-tree vlan 1 forward-time 10
(reduce tiempo de convergencia)
```

## RSTP (Rapid STP - 802.1w)

RSTP mejora STP significativamente, reduciendo convergencia a segundos.

### Mejoras de RSTP

```
Comparación STP vs RSTP:

Característica      | STP (802.1D) | RSTP (802.1w)
─────────────────┼──────────────┼─────────────
Convergencia      | ~50 segundos | ~1 segundo
Estados Puerto    | 5            | 3
Roles Puerto      | 3            | 4
Backup Port       | No           | Sí
Alternate Port    | No           | Sí
Edge Ports        | No           | Sí
BPDU Handling     | Receive only | Send/Receive
```

### Puertos Edge (PortFast en RSTP)

Un puerto conectado directamente a un host puede ser configurado como "edge" para inmediata transición a forwarding.

```
Configuración PortFast (para switches Cisco):
Switch(config)# interface fastethernet 0/1
Switch(config-if)# spanning-tree portfast
Switch(config-if)# spanning-tree bpduguard enable

! En rango de puertos
Switch(config)# interface range fastethernet 0/1-24
Switch(config-if-range)# spanning-tree portfast
Switch(config-if-range)# spanning-tree bpduguard enable

! Verificar
Switch# show spanning-tree interface fastethernet 0/1 detail
```

### BPDU Guard

Protege contra dispositivos no autorizados que envíen BPDUs.

```
Cuando BPDU Guard se activa:
1. Puerto recibe BPDU
2. Puerto entra en estado disabled
3. Requiere intervención manual para habilitarlo

Configuración:
Switch(config)# spanning-tree portfast bpduguard default
Switch(config-if)# spanning-tree bpduguard enable

Recuperación:
Switch(config)# errdisable recovery cause bpduguard
Switch(config)# errdisable recovery interval 30
```

## PVST+ y Rapid PVST+

| Protocolo | Descripción | STP por VLAN |
|-----------|-------------|--------------|
| CST (Common Spanning Tree) | Original, todos en una topología | No |
| PVST (Per-VLAN STP) | Topología STP por VLAN | Sí, propietario Cisco |
| PVST+ | PVST mejorado, interoperable | Sí |
| RSTP (Rapid STP) | 802.1w, rápida convergencia | No (una sola topología) |
| Rapid PVST+ | RSTP + por VLAN (mejor opción) | Sí |

```
Cambiar modo STP:
Switch(config)# spanning-tree mode rapid-pvst

! Verificar modo actual
Switch# show spanning-tree summary

! Configurar prioridad por VLAN
Switch(config)# spanning-tree vlan 10 priority 4096
Switch(config)# spanning-tree vlan 20 priority 8192
```

## Comandos de Verificación STP

```
! Resumen STP
Switch# show spanning-tree

! Detalles de VLAN específica
Switch# show spanning-tree vlan 1

! Detalles de puerto
Switch# show spanning-tree interface fastethernet 0/1
Switch# show spanning-tree interface fastethernet 0/1 detail

! Estadísticas
Switch# show spanning-tree statistics
Switch# show spanning-tree statistics interface fastethernet 0/1

! Configuración actual
Switch# show spanning-tree root

! BPDUs recibidos
Switch# show spanning-tree bridge id

! PortFast status
Switch# show spanning-tree interface fastethernet 0/1 portfast
```

## Tabla de Troubleshooting STP

| Problema | Síntomas | Causa Común | Solución |
|----------|----------|-------------|----------|
| Loops de broadcast | Utilización 100% CPU/ancho banda | STP deshabilitado | Habilitar STP |
| Convergencia lenta | Servicios caídos por 50 seg | Timers por defecto | Configurar timers o usar RSTP |
| Root bridge incorrecto | Tráfico ineficiente | Prioridad no configurada | Establecer root primary |
| Puerto no forwarda | Switch aparece aislado | Bloqueado por STP | Usar PortFast o investigar topología |
| PortFast causa loops | Broadcast storm en PortFast | BPDU Guard no activo | Habilitar BPDU Guard |
| Topología inestable | STP constantemente converge | Interfaz intermitente | Investigar capa física |

## Diagrama de Decisión de Roles STP

```
¿Es Root Bridge?
    │
    ├─ Sí  → Todos los puertos = Designated
    │
    └─ No  → ¿Este puerto tiene menor Path Cost al Root?
            │
            ├─ Sí  → Root Port
            │
            └─ No  → ¿Este puerto puede enviar al Root por otro camino?
                    │
                    ├─ Sí  → Designated Port (otro switch lo bloquea)
                    │
                    └─ No  → Blocked Port
```

## Ejemplo Real: Configuración STP Empresarial

**Topología**: Distribución con 5 switches Capa 2

```
                    ┌──────────────────┐
                    │   Core Switch A  │
                    │  (Root Bridge)   │
                    └────────┬─────────┘
                             │
                    ┌────────┴──────────┐
                    │                   │
            ┌───────┴──────┐    ┌──────┴──────┐
            │ Access Sw. B │    │ Access Sw. C│
            │   (RSTP)     │    │   (RSTP)    │
            └───────┬──────┘    └──────┬──────┘
                    │                   │
            ┌───────┴──────┐    ┌──────┴──────┐
            │ Access Sw. D │────│ Access Sw. E│
            │   (RSTP)     │    │   (RSTP)    │
            └──────────────┘    └─────────────┘

Configuración Core (Root):
==========================
Switch(config)# spanning-tree mode rapid-pvst
Switch(config)# spanning-tree vlan 1-100 priority 0

! Habilitar en todas las VLANs
Switch(config)# interface range fastethernet 0/1-48
Switch(config-if-range)# spanning-tree portfast
Switch(config-if-range)# spanning-tree bpduguard enable

Configuración Access (No-Root):
===============================
Switch(config)# spanning-tree mode rapid-pvst
Switch(config)# spanning-tree vlan 1-100 priority 8192

! PortFast en puertos de usuario
Switch(config)# interface range fastethernet 0/1-24
Switch(config-if-range)# spanning-tree portfast
Switch(config-if-range)# spanning-tree bpduguard enable

! Trunk hacia distribución (sin PortFast)
Switch(config)# interface fastethernet 0/48
Switch(config-if)# switchport mode trunk
Switch(config-if)# spanning-tree portfast disable

Verificación:
=============
Switch# show spanning-tree summary
Switch# show spanning-tree vlan 1
Switch# show spanning-tree root
Switch# show spanning-tree interface summary
```

## Resumen

STP es la tecnología fundamental que permite redes redundantes sin caos. RSTP y Rapid PVST+ son evoluciones modernas que todos los switches Capa 2 deberían utilizar. Domina sus conceptos y configuración para diseñar redes confiables.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: DHCP - Configuración y Troubleshooting',
  'dhcp-configuracion-y-troubleshooting',
  $MKDN$# Guía completa: DHCP - Configuración y Troubleshooting

## ¿Qué es DHCP?

DHCP (Dynamic Host Configuration Protocol) automatiza la asignación de direcciones IP a clientes en la red, eliminando la necesidad de configuración manual.

```
Estadísticas de DHCP:
- ~3,000 millones de dispositivos DHCP-enabled en el mundo
- Usado en 99% de redes empresariales
- Reduce tiempo de configuración de O(minutos) a O(segundos)
```

## Proceso DORA (Discover/Offer/Request/Acknowledge)

El proceso DORA es el corazón de DHCP.

```
Timeline del proceso DORA:

   Cliente           Servidor DHCP
      │                  │
      │─ DISCOVER ──────>│  (broadcast 255.255.255.255)
      │                  │  "¿Hay servidor DHCP?"
      │                  │
      │<─ OFFER ────────│  (oferta de dirección)
      │                  │  "Toma 192.168.1.100"
      │                  │
      │─ REQUEST ───────>│  (acepta la oferta)
      │                  │  "Confirmo 192.168.1.100"
      │                  │
      │<─ ACK ──────────│  (confirmación final)
      │                  │  "¡Listo! Úsala por 24h"

Tiempo total: ~500ms en condiciones ideales
```

### Detalles Técnicos del DORA

```
1. DISCOVER (Puerto 68 → 67)
   ├─ Origen: 0.0.0.0
   ├─ Destino: 255.255.255.255 (broadcast)
   ├─ Payload: DHCP packet with DHCP message type = 1
   └─ Campo: CHADDR = MAC del cliente

2. OFFER (Puerto 67 → 68)
   ├─ Origen: IP del servidor
   ├─ Destino: 255.255.255.255 (broadcast, aún no conoce del cliente)
   ├─ Campo: YIADDR = 192.168.1.100 (oferta)
   ├─ Campo: DHCP Server Identifier = IP del servidor
   └─ Campo: Lease Time = 86400 segundos (24 horas)

3. REQUEST (Puerto 68 → 67)
   ├─ Campo: Requested IP Address = 192.168.1.100
   ├─ Campo: DHCP Server Identifier (identifica servidor)
   └─ Campo: DHCP message type = 3

4. ACK (Puerto 67 → 68)
   ├─ YIADDR = 192.168.1.100 (confirmación)
   ├─ Lease Time = 86400
   ├─ Subnet Mask = 255.255.255.0
   ├─ Router = 192.168.1.1
   ├─ DNS Server = 8.8.8.8
   └─ DHCP message type = 5
```

## Tiempo de Arrendamiento (Lease Time)

```
Renovación automática:
T=0        Lease concedido (24 horas)
T=12h      Cliente envía RENEW (50% del lease)
T=18h      Cliente envía REBIND (87.5% del lease)
T=24h      Lease expira, DISCOVER nuevo

Problemas comunes:
- Lease muy corto (30 min) → tráfico DHCP excesivo
- Lease muy largo (7 días) → IPs desocupadas
- Óptimo: 24-48 horas para oficinas
```

## Configuración de Servidor DHCP en Cisco Router

```
! Crear pool DHCP
Router(config)# ip dhcp pool OFICINA
Router(dhcp-config)# network 192.168.1.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.1.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# domain-name empresa.local
Router(dhcp-config)# lease 1 0 0  (1 día)
Router(dhcp-config)# exit

! Excluir direcciones (para hosts estáticos)
Router(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
Router(config)# ip dhcp excluded-address 192.168.1.254

! Configurar interfaz con IP
Router(config)# interface fastethernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown

! Habilitar servicio DHCP (si no está)
Router(config)# service dhcp

! Verificar
Router# show ip dhcp pool OFICINA
Router# show ip dhcp binding
Router# show ip dhcp statistics
```

## Direccionamiento de Relay (DHCP Helper)

Cuando el servidor DHCP está en otra subred, se usa DHCP relay.

```
Topología:
    ┌─────────────────┐
    │ Servidor DHCP   │
    │ 10.0.1.5        │
    └────────┬────────┘
             │
        ┌────┴────┐
        │  Router │ (relay)
        │         │
        └────┬────┘
             │
    ┌────────┴────────┐
    │ Cliente (DHCP)  │
    │ 192.168.1.0/24  │
    └─────────────────┘

Configuración en Router:
Router(config)# interface fastethernet 0/0
Router(config-if)# ip helper-address 10.0.1.5
Router(config-if)# exit

! Verificar
Router# show ip helper-address
```

## Opciones DHCP Comunes

```
Opción DHCP | Descripción | Valor Ejemplo
────────────┼─────────────────────────────┼──────────────
1           | Subnet Mask | 255.255.255.0
3           | Default Gateway | 192.168.1.1
6           | DNS Servers | 8.8.8.8, 8.8.4.4
15          | Domain Name | ejemplo.com
42          | NTP Servers | 192.168.1.100
119         | Domain Search | ejemplo.com, subdominio.com

Configuración en Router:
Router(config)# ip dhcp pool OFICINA
Router(dhcp-config)# option 119 ascii "ejemplo.com,sub.ejemplo.com"
Router(dhcp-config)# option 42 ip 192.168.1.100
Router(dhcp-config)# exit
```

## DHCPv6 Stateful

Análogo a DHCP en IPv4, pero para IPv6.

```
Configuración Router:
Router(config)# ipv6 dhcp pool OFFICE-IPV6
Router(config-dhcp)# address prefix 2001:db8:1::/64
Router(config-dhcp)# dns-server 2001:db8::53
Router(config-dhcp)# domain-name empresa.com
Router(config-dhcp)# exit

Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 address 2001:db8:1::1/64
Router(config-if)# ipv6 nd managed-config-flag
Router(config-if)# ipv6 dhcp server OFFICE-IPV6
Router(config-if)# no shutdown

! Verificar
Router# show ipv6 dhcp pool
Router# show ipv6 dhcp binding
```

## DHCPv6 Stateless (SLAAC + DHCPv6 para opciones)

```
Proceso:
1. Cliente recibe Router Advertisement (RA)
2. Genera dirección usando SLAAC + EUI-64
3. Recibe opciones (DNS, dominio) vía DHCPv6

Configuración Router:
Router(config)# ipv6 dhcp pool STATELESS-POOL
Router(config-dhcp)# dns-server 2001:db8::53
Router(config-dhcp)# domain-name empresa.com
Router(config-dhcp)# exit

Router(config)# interface fastethernet 0/0
Router(config-if)# ipv6 address 2001:db8:1::1/64
Router(config-if)# ipv6 nd other-config-flag
Router(config-if)# ipv6 dhcp server STATELESS-POOL
Router(config-if)# no shutdown
```

## Comandos de Verificación DHCP

```
! Ver pools DHCP configurados
Router# show ip dhcp pool
Router# show ip dhcp pool OFICINA

! Ver direcciones asignadas (bindings)
Router# show ip dhcp binding
Router# show ip dhcp binding verbose

! Estadísticas de DHCP
Router# show ip dhcp statistics

! Ver configuración de interfaz
Router# show ip dhcp server statistics
Router# show running-config | section dhcp

! Ver exclusiones
Router# show ip dhcp excluded-address

! Debug de DHCP (debugging)
Router# debug ip dhcp server events
Router# debug ip dhcp server detail
Router# undebug all
```

## Tabla de Troubleshooting DHCP

| Problema | Síntomas | Causa Común | Solución |
|----------|----------|-------------|----------|
| Cliente no recibe IP | Ipconfig muestra 169.169.x.x | Servidor no responde | Verificar servicio DHCP, helper-address |
| Lease expire rápido | IP cambia cada minuto | Lease time muy corto | Ajustar lease time a 24-48h |
| IP del servidor no asignada | 192.168.1.1 no está disponible | Excluida insuficientemente | Excluir rango más amplio |
| Cliente renueva pero falla | Conexión inestable | Problemas de conectividad | Verificar capa 2, PortFast |
| Múltiples servers compiten | Asignaciones conflictivas | Múltiples DHCP sin coordinación | Consolidar a 1 servidor |
| DHCP no llega a otra VLAN | Clientes en VLAN 2 sin IP | Relay no configurado | Configurar ip helper-address |
| Servidor agotado | No hay IPs disponibles | Pool demasiado pequeño | Aumentar rango o reducir lease |

### Ejemplo Detallado: Cliente No Recibe IP

```
Paso 1: Verificar en cliente
  C:> ipconfig /all
  → Si muestra 169.169.x.x = APIPA (sin DHCP)

Paso 2: Verificar conectividad
  C:> ping 192.168.1.1 (gateway)
  → Si timeout: problema de capa 2

Paso 3: En router, verificar servicio
  Router# show ip dhcp
  → Debe mostrar "DHCP server running"

Paso 4: Verificar pool
  Router# show ip dhcp pool
  → Debe listar OFICINA con direcciones disponibles

Paso 5: Verificar binding
  Router# show ip dhcp binding
  → Debe mostrar direcciones asignadas

Paso 6: Debug en router
  Router# debug ip dhcp server events
  C:> ipconfig /release
  C:> ipconfig /renew
  → Debe mostrar DISCOVER, OFFER, REQUEST, ACK

Paso 7: Verificar helper-address (si en otra subred)
  Router# show ip helper-address
  → Debe apuntar al servidor DHCP correcto

Paso 8: Troubleshooting de red
  Router# show ip route
  Router# ping <ip-servidor-dhcp>
  → Debe haber ruta hacia el servidor
```

## DHCP Snooping (Seguridad)

DHCP Snooping protege contra rogue DHCP servers que inyectan IPs falsas.

```
Configuración:
Switch(config)# ip dhcp snooping
Switch(config)# ip dhcp snooping vlan 1
Switch(config)# no ip dhcp snooping information option

! Marcar puerto como trusted (servidor DHCP)
Switch(config)# interface fastethernet 0/48
Switch(config-if)# ip dhcp snooping trust
Switch(config-if)# exit

! Puertos untrusted rechazan mensajes DHCP-server
Switch(config)# interface range fastethernet 0/1-47
Switch(config-if-range)# no ip dhcp snooping trust

! Verificar
Switch# show ip dhcp snooping
Switch# show ip dhcp snooping binding
```

## Escenario Real: DHCP para Múltiples Departamentos

**Empresa con 3 departamentos en VLANs diferentes**

```
Topología:
┌─────────────────────┐
│ VLAN 10: Admin      │
│ 192.168.10.0/24     │
│                     │
│ VLAN 20: Contabil   │
│ 192.168.20.0/24     │
│                     │
│ VLAN 30: Usuarios   │
│ 192.168.30.0/24     │
└─────────────────────┘

Configuración Central Router:
=============================

! Pool para Admin
Router(config)# ip dhcp pool ADMIN
Router(dhcp-config)# network 192.168.10.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.10.1
Router(dhcp-config)# dns-server 8.8.8.8
Router(dhcp-config)# lease 1 0 0
Router(dhcp-config)# exit

Router(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10

! Pool para Contabilidad
Router(config)# ip dhcp pool CONTABIL
Router(dhcp-config)# network 192.168.20.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.20.1
Router(dhcp-config)# dns-server 8.8.8.8
Router(dhcp-config)# exit

Router(config)# ip dhcp excluded-address 192.168.20.1 192.168.20.10

! Pool para Usuarios
Router(config)# ip dhcp pool USUARIOS
Router(dhcp-config)# network 192.168.30.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.30.1
Router(dhcp-config)# dns-server 8.8.8.8
Router(dhcp-config)# exit

Router(config)# ip dhcp excluded-address 192.168.30.1 192.168.30.10

! Configurar interfaces VLAN
Router(config)# interface vlan 10
Router(config-if)# ip address 192.168.10.1 255.255.255.0
Router(config-if)# no shutdown

Router(config)# interface vlan 20
Router(config-if)# ip address 192.168.20.1 255.255.255.0
Router(config-if)# no shutdown

Router(config)# interface vlan 30
Router(config-if)# ip address 192.168.30.1 255.255.255.0
Router(config-if)# no shutdown

! Verificación
Router# show ip dhcp pool
Router# show ip dhcp binding
Router# show running-config | section dhcp
```

## Resumen

DHCP es la tecnología esencial para la provisión automática de dispositivos. Desde configuración básica hasta troubleshooting avanzado, su dominio es crítico en cualquier ambiente de producción. Los conceptos de DORA, lease time y DHCP relay son fundamentales para cualquier ingeniero de redes.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'redes'),
  'Guía completa: VPN e IPsec',
  'vpn-e-ipsec',
  $MKDN$# Guía completa: VPN e IPsec

## ¿Qué es una VPN?

Una VPN (Virtual Private Network) crea un túnel cifrado sobre una red pública (como internet), permitiendo comunicación privada y segura entre dos o más redes/dispositivos.

```
Sin VPN:
[Oficina A] ───[Internet insegura]─── [Oficina B]
                   (visible a todos)

Con VPN:
[Oficina A] ═══[Túnel cifrado]═══ [Oficina B]
           (datos ocultos de observadores)

Beneficios:
✓ Confidencialidad: Datos cifrados
✓ Integridad: Detección de modificaciones
✓ Autenticación: Verificación de identidad
✓ No-repudio: Verificación de origen
```

## Casos de Uso de VPN

| Caso | Descripción | Tipo |
|------|-------------|------|
| Site-to-Site | Oficinas conectadas | IPsec |
| Remote Access | Empleado remoto → Red corporativa | SSL/TLS |
| Hybrid Cloud | On-premises + Cloud | IPsec o SSL |
| Backup/Replication | Sincronización segura de datos | IPsec |
| Partner Connectivity | Conexión con proveedores | IPsec |

## Tipos de VPN

### 1. VPN Site-to-Site (IPsec)

Conecta dos redes completas a través de internet.

```
Oficina A (10.0.0.0/16)
    └─ Router A (IP pública: 203.0.113.1)
            │
         [IPsec Tunnel]
            │
    Router B (IP pública: 203.0.113.2)
    └─ Oficina B (172.16.0.0/16)

Beneficios:
- Empleados no necesitan VPN client
- Transparente para aplicaciones
- Ancho de banda dedicado

Desventajas:
- Equipos VPN requeridos en ambos extremos
- Configuración compleja
```

### 2. VPN Remote Access (SSL/TLS)

Permite que usuarios remotos accedan a red corporativa.

```
[Empleado en Café]
    │
    ├─ VPN Client Software
    │
    [Internet]
    │
    [VPN Gateway Corporativo]
    │
    [Red Corporativa]

Beneficios:
- Flexible, funciona desde cualquier lugar
- No requiere hardware específico
- Escalable a miles de usuarios

Desventajas:
- Requiere software cliente
- CPU del cliente consume más
```

### 3. VPN Híbrida

Combinación de site-to-site e IPsec + cloud.

## IPsec Protocol Suite

IPsec es un conjunto de protocolos que implementan VPN a nivel de capa 3 (IP).

```
Componentes de IPsec:

1. AH (Authentication Header)
   - Autenticación e integridad
   - NO cifra datos
   - Protocolo IP 51

2. ESP (Encapsulating Security Payload)
   - Cifrado, autenticación, integridad
   - Protocolo IP 50
   - Usualmente preferido sobre AH

3. IKE (Internet Key Exchange)
   - Negocia parámetros de seguridad
   - Intercambia claves
   - Usa protocolo UDP puerto 500 (IKEv1) o 4500 (IKEv2)
```

## Algoritmos de Cifrado

| Algoritmo | Tipo | Tamaño Clave | Seguridad | Velocidad |
|-----------|------|--------------|-----------|-----------|
| DES | Simétrico | 56 bits | Obsoleto | Rápido |
| 3DES | Simétrico | 168 bits | Débil | Lento |
| AES-128 | Simétrico | 128 bits | Muy bueno | Rápido |
| AES-192 | Simétrico | 192 bits | Excelente | Muy rápido |
| AES-256 | Simétrico | 256 bits | Perfecto | Muy rápido |
| RSA | Asimétrico | 2048/4096 bits | Muy bueno | Lento |
| ECDH | Asimétrico | 256 bits | Excelente | Muy rápido |
| SHA-256 | Hash | - | Muy bueno | Rápido |
| SHA-512 | Hash | - | Excelente | Rápido |

```
Recomendaciones 2026:
- Evitar: DES, 3DES, MD5
- Aceptable: AES-128, SHA-256
- Preferido: AES-256, SHA-512, ECDH
```

## Fases de IPsec

### Phase 1 (IKE Phase 1): Establecimiento de Canal Seguro

```
Objetivo: Establecer SA (Security Association) para IKE

Proceso:
1. Router A → Router B: Propuestas de cifrado
   (AES-256, SHA-512, ECDH)

2. Router B elige la mejor propuesta común
   y responde

3. Negociación de Diffie-Hellman
   (intercambio seguro de claves)

4. Ambos routers derivan claves compartidas

5. Autenticación mutua
   (pre-shared key o certificados)

Resultado: Canal seguro para IKE (Phase 2)

Duración: ~1 segundo normalmente
```

### Phase 2 (IKE Phase 2): Establecimiento de Túnel IPsec

```
Objetivo: Establecer SA para ESP/AH

Proceso:
1. Usando canal Phase 1 seguro

2. Router A → Router B: Propuestas para túnel
   (AES-128, SHA-256, lifetime 3600s)

3. Router B acepta/negocia

4. Se establecen SAs bidireccionales
   - SA outbound: A→B
   - SA inbound: B→A

5. Se aplican a tráfico de datos

Resultado: Túnel IPsec funcional

Duración: ~100ms normalmente
```

## Modo Túnel vs Modo Transporte

```
MODO TÚNEL (típicamente usado):
┌─────────────────────────────────────────┐
│ IP original │ TCP │ Datos               │
└─────────────────────────────────────────┘
                  ↓ Encapsulación IPsec
┌──────────────────────────────────────────┐
│ IP nueva │ ESP │ [original pkt cifrado] │
└──────────────────────────────────────────┘

Caso de uso: Site-to-site (protege IP original)

MODO TRANSPORTE:
┌──────────────────────────┐
│ IP │ TCP │ Datos        │
└──────────────────────────┘
         ↓ ESP añadido
┌──────────────────────────────┐
│ IP │ ESP │ TCP │ [datos] │
└──────────────────────────────┘

Caso de uso: Host-to-host, cliente-servidor
```

## Configuración Site-to-Site IPsec en Cisco

```
Topología:
Router A (203.0.113.1) ←→ Router B (203.0.113.2)
10.0.0.0/8                  172.16.0.0/12

PASO 1: Definir política IKE (Phase 1)
========================================

Router A(config)# crypto isakmp policy 1
Router A(config-isakmp)# authentication pre-share
Router A(config-isakmp)# encryption aes 256
Router A(config-isakmp)# hash sha512
Router A(config-isakmp)# group 14
Router A(config-isakmp)# lifetime 86400
Router A(config-isakmp)# exit

! Definir pre-shared key
Router A(config)# crypto isakmp key 0 MiClaveSegura address 203.0.113.2

PASO 2: Definir Transform Set (Phase 2)
========================================

Router A(config)# crypto ipsec transform-set TS1 esp-aes 256 esp-sha512-hmac
Router A(config-crypto-trans)# mode tunnel
Router A(config-crypto-trans)# exit

PASO 3: Crear ACL para tráfico a proteger
============================================

Router A(config)# access-list 101 permit ip 10.0.0.0 0.255.255.255 172.16.0.0 0.15.255.255

PASO 4: Crear Crypto Map
=========================

Router A(config)# crypto map CRYPTOMAP 1 ipsec-isakmp
Router A(config-crypto-map)# set peer 203.0.113.2
Router A(config-crypto-map)# set transform-set TS1
Router A(config-crypto-map)# match address 101
Router A(config-crypto-map)# exit

PASO 5: Aplicar Crypto Map a Interfaz Pública
===============================================

Router A(config)# interface serial 0/0
Router A(config-if)# ip address 203.0.113.1 255.255.255.0
Router A(config-if)# crypto map CRYPTOMAP
Router A(config-if)# no shutdown
Router A(config-if)# exit

PASO 6: Configurar enrutamiento hacia red remota
==================================================

Router A(config)# ip route 172.16.0.0 255.240.0.0 203.0.113.2

===== CONFIGURACIÓN ANÁLOGA EN ROUTER B =====

Router B(config)# crypto isakmp policy 1
Router B(config-isakmp)# authentication pre-share
Router B(config-isakmp)# encryption aes 256
Router B(config-isakmp)# hash sha512
Router B(config-isakmp)# group 14
Router B(config-isakmp)# exit

Router B(config)# crypto isakmp key 0 MiClaveSegura address 203.0.113.1

Router B(config)# crypto ipsec transform-set TS1 esp-aes 256 esp-sha512-hmac
Router B(config-crypto-trans)# mode tunnel
Router B(config-crypto-trans)# exit

Router B(config)# access-list 101 permit ip 172.16.0.0 0.15.255.255 10.0.0.0 0.255.255.255

Router B(config)# crypto map CRYPTOMAP 1 ipsec-isakmp
Router B(config-crypto-map)# set peer 203.0.113.1
Router B(config-crypto-map)# set transform-set TS1
Router B(config-crypto-map)# match address 101
Router B(config-crypto-map)# exit

Router B(config)# interface serial 0/0
Router B(config-if)# ip address 203.0.113.2 255.255.255.0
Router B(config-if)# crypto map CRYPTOMAP
Router B(config-if)# no shutdown

Router B(config)# ip route 10.0.0.0 255.0.0.0 203.0.113.1

PASO 7: Verificación
====================

RouterA# show crypto isakmp sa
RouterA# show crypto ipsec sa
RouterA# show crypto map
RouterA# debug crypto isakmp
(ping para trigger)
```

## Túneles GRE (Generic Routing Encapsulation)

GRE es un protocolo de tunelización alternativa a IPsec, útil para protocoles no IP.

```
Comparación GRE vs IPsec:

Característica     | GRE         | IPsec
─────────────────┼─────────────┼──────────
Cifrado           | NO          | Sí
Autenticación     | NO          | Sí
Protocolos        | Cualquiera  | IP
Overhead          | Bajo (4B)   | Medio (20B+)
Complejidad       | Baja        | Alta
Routing dinámico  | Sí          | Sí

Configuración GRE básica:
Router(config)# interface tunnel 1
Router(config-if)# tunnel source 203.0.113.1
Router(config-if)# tunnel destination 203.0.113.2
Router(config-if)# ip address 192.168.100.1 255.255.255.0
Router(config-if)# tunnel mode gre ip
Router(config-if)# no shutdown

GRE con IPsec (protocolo 47 cifrado):
Router(config)# access-list 101 permit gre 203.0.113.1 203.0.113.2
Router(config)# crypto map ipsec_map 1 ipsec-isakmp
Router(config-crypto-map)# match address 101
```

## VPN SSL/TLS (Remote Access)

Para acceso remoto de empleados, usando HTTPS.

```
Ventajas:
- Usa puerto 443 (HTTPS), atraviesa NAT/firewall
- Basada en certificados
- Fácil de implementar
- Compatible con navegadores

Configuración básica (Cisco ASA):
ciscoasa(config)# ssl encryption rc4-128 aes128-cbc aes192-cbc aes256-cbc
ciscoasa(config)# webvpn
ciscoasa(config-webvpn)# enable outside
ciscoasa(config-webvpn)# tunnel-group DefaultWEBVPNGroup
ciscoasa(config-tunnel-webvpn)# authentication certificate
```

## Verificación de VPN

```
! Estado de SAs (Security Associations)
Router# show crypto ipsec sa
Router# show crypto ipsec sa peer 203.0.113.2
Router# show crypto ipsec sa detail

! Estado de IKE
Router# show crypto isakmp sa
Router# show crypto isakmp sa detail

! Mapas de encriptación
Router# show crypto map
Router# show crypto map tag CRYPTOMAP

! Estadísticas
Router# show crypto ipsec statistics

! Ver sesiones activas
Router# show crypto session brief
Router# show crypto session detail

! Debug (en produccción, cuidado)
Router# debug crypto isakmp 255
Router# debug crypto ipsec 255
Router# debug crypto engine 255

! Monitores en vivo
Router# crypto session monitor peer 203.0.113.2
```

## Troubleshooting de IPsec

| Problema | Síntomas | Causa | Solución |
|----------|----------|-------|----------|
| No forma SA Phase 1 | Crypto sa vacío | Pre-shared key diferente | Sincronizar claves |
| Negocia Phase 1 pero no Phase 2 | Phase 1 OK, Phase 2 no | Transform-set no coincide | Sincronizar encryption/hash |
| Tráfico interesante no gatilla túnel | Manual ping pero no automático | ACL incorrecto | Revisar access-list |
| Túnel inestable | Constantemente forma y cae | Rekey timeout | Aumentar lifetime Phase 1 |
| Cifrado muy lento | CPU 100%, latencia alta | Algoritmo demasiado pesado | Usar AES-128 en lugar de AES-256 |
| Routing no converge | Rutas de host específico | Redistribución no completa | Configurar rutas dinámicas o estáticas |

## Ventajas y Desventajas de VPN

| Ventajas | Desventajas |
|----------|-------------|
| Seguridad end-to-end | Complejidad de configuración |
| Privacidad garantizada | Overhead de procesamiento |
| Escalable a múltiples sitios | Troubleshooting difícil |
| Aprovecha infraestructura existente | Latencia adicional |
| Certificación de identidad | Dependencia de conectividad |
| Cumplimiento regulatorio | Costo de equipos VPN |

## Resumen

IPsec es el protocolo VPN más robusto para conexiones site-to-site entre oficinas. Comprender sus fases, algoritmos y configuración es esencial para cualquier ingeniero de redes corporativas. Las VPN SSL/TLS complementan el acceso remoto flexible. Domina ambas tecnologías para proteger la comunicación de tu empresa.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

-- ─── Bases de Datos ────────────────────────────────────────
INSERT INTO theory_subjects (name, slug, description, icon, order_index)
VALUES ('Bases de Datos', 'bases-de-datos', 'SQL, modelado relacional, normalización, transacciones y administración de bases de datos.', '🗄️', 2)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      order_index = EXCLUDED.order_index;

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'bases-de-datos'),
  'Guía completa: SQL DDL y DML',
  'sql-ddl-y-dml',
  $MKDN$# Guía completa: SQL DDL y DML

## Introducción a SQL y sus subconjuntos

SQL (Structured Query Language) es el lenguaje estándar para la gestión de bases de datos relacionales. Se divide en cuatro categorías principales:

| Categoría | Descripción | Comandos |
|-----------|-------------|----------|
| DDL (Data Definition Language) | Define la estructura de la BD | CREATE, ALTER, DROP, TRUNCATE |
| DML (Data Manipulation Language) | Manipula los datos | INSERT, UPDATE, DELETE, SELECT |
| DCL (Data Control Language) | Controla permisos | GRANT, REVOKE |
| TCL (Transaction Control Language) | Gestiona transacciones | COMMIT, ROLLBACK, SAVEPOINT |

## DDL: Lenguaje de Definición de Datos

### CREATE TABLE: Creación de tablas

La sentencia CREATE TABLE define la estructura de una tabla con sus columnas, tipos de datos y restricciones.

#### Tipos de datos fundamentales

| Tipo | Descripción | Ejemplo | Rango/Tamaño |
|------|-------------|---------|----------------|
| INT / INTEGER | Número entero | `INT` | -2,147,483,648 a 2,147,483,647 |
| BIGINT | Entero grande | `BIGINT` | ±9,223,372,036,854,775,807 |
| DECIMAL(p,s) | Decimal con precisión | `DECIMAL(10,2)` | Precisión p, escala s |
| VARCHAR(n) | Texto variable | `VARCHAR(100)` | Hasta n caracteres |
| CHAR(n) | Texto fijo | `CHAR(10)` | Exactamente n caracteres |
| TEXT | Texto grande | `TEXT` | Hasta 1GB aproximadamente |
| DATE | Fecha | `DATE` | Formato YYYY-MM-DD |
| DATETIME / TIMESTAMP | Fecha y hora | `TIMESTAMP` | Con zona horaria opcional |
| BOOLEAN | Verdadero/Falso | `BOOLEAN` | TRUE o FALSE |
| ENUM | Valores enumerados | `ENUM('activo','inactivo')` | Lista predefinida |

#### Restricciones (Constraints)

Las restricciones garantizan la integridad de los datos:

```sql
CREATE TABLE empleados (
    -- PRIMARY KEY: Identificador único, no nulo
    id_empleado INT PRIMARY KEY AUTO_INCREMENT,

    -- NOT NULL: Campo obligatorio
    nombre VARCHAR(100) NOT NULL,

    -- UNIQUE: Valores únicos
    email VARCHAR(100) UNIQUE,

    -- FOREIGN KEY: Referencia a otra tabla
    id_departamento INT NOT NULL,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id),

    -- DEFAULT: Valor por defecto
    estado VARCHAR(20) DEFAULT 'activo',

    -- CHECK: Validación de valor
    salario DECIMAL(10,2) CHECK (salario > 0),

    -- Fecha con valor por defecto actual
    fecha_contratacion DATE DEFAULT CURRENT_DATE
);
```

#### Tabla de restricciones

| Restricción | Propósito | Ejemplo |
|-------------|----------|---------|
| PRIMARY KEY | Identificador único, no nulo | `id INT PRIMARY KEY` |
| FOREIGN KEY | Referencia a otra tabla | `FOREIGN KEY (id_dept) REFERENCES depts(id)` |
| NOT NULL | Campo obligatorio | `nombre VARCHAR(100) NOT NULL` |
| UNIQUE | Valores únicos | `email VARCHAR(100) UNIQUE` |
| CHECK | Validación de condición | `edad INT CHECK (edad >= 18)` |
| DEFAULT | Valor por defecto | `estado VARCHAR(20) DEFAULT 'activo'` |

### Ejemplo completo: Schema de una empresa

```sql
-- Tabla de departamentos
CREATE TABLE departamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    presupuesto DECIMAL(15,2) CHECK (presupuesto > 0),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de empleados
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    salario DECIMAL(10,2) NOT NULL CHECK (salario >= 1000),
    id_departamento INT NOT NULL,
    fecha_contratacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla de proyectos
CREATE TABLE proyectos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_departamento INT NOT NULL,
    presupuesto DECIMAL(15,2) CHECK (presupuesto > 0),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado ENUM('planificado','en_progreso','completado','cancelado') DEFAULT 'planificado',
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id),
    CHECK (fecha_fin >= fecha_inicio OR fecha_fin IS NULL)
);

-- Tabla de asignaciones (relación muchos-a-muchos)
CREATE TABLE asignaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_empleado INT NOT NULL,
    id_proyecto INT NOT NULL,
    horas_asignadas DECIMAL(5,2) NOT NULL,
    rol VARCHAR(50),
    FOREIGN KEY (id_empleado) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_asignacion (id_empleado, id_proyecto)
);
```

### ALTER TABLE: Modificación de estructura

```sql
-- Añadir una columna
ALTER TABLE empleados ADD COLUMN telefono VARCHAR(20);

-- Modificar una columna (tipo de dato)
ALTER TABLE empleados MODIFY COLUMN nombre VARCHAR(150);

-- Cambiar nombre de columna
ALTER TABLE empleados CHANGE COLUMN telefono numero_telefonico VARCHAR(20);

-- Eliminar una columna
ALTER TABLE empleados DROP COLUMN numero_telefonico;

-- Añadir restricción
ALTER TABLE empleados ADD CONSTRAINT check_salario CHECK (salario > 0);

-- Eliminar restricción
ALTER TABLE empleados DROP CONSTRAINT check_salario;

-- Renombrar tabla
ALTER TABLE empleados RENAME TO staff;
```

### DROP y TRUNCATE

```sql
-- DROP TABLE: Elimina toda la tabla y su estructura
DROP TABLE asignaciones;

-- TRUNCATE: Elimina todos los datos pero mantiene la estructura
-- Más rápido que DELETE, no se puede hacer rollback sin transacción
TRUNCATE TABLE asignaciones;

-- DROP con restricción de clave foránea
DROP TABLE departamentos CASCADE; -- PostgreSQL
DROP TABLE departamentos; -- MySQL (si no hay FK activas)
```

## DML: Lenguaje de Manipulación de Datos

### INSERT: Inserción de datos

```sql
-- Insertar una fila (especificando columnas)
INSERT INTO empleados (nombre, apellido, email, salario, id_departamento)
VALUES ('Juan', 'Pérez', 'juan.perez@company.com', 3500.00, 1);

-- Insertar una fila (todas las columnas en orden)
INSERT INTO empleados
VALUES (NULL, 'María', 'García', 'maria.garcia@company.com', 4000.00, 2, CURRENT_DATE);

-- Insertar múltiples filas
INSERT INTO empleados (nombre, apellido, email, salario, id_departamento) VALUES
('Carlos', 'López', 'carlos.lopez@company.com', 3200.00, 1),
('Ana', 'Martínez', 'ana.martinez@company.com', 4500.00, 3),
('Roberto', 'Sánchez', 'roberto.sanchez@company.com', 3800.00, 2);

-- Insertar desde otra tabla (INSERT INTO SELECT)
INSERT INTO empleados_copia (nombre, apellido, email, salario)
SELECT nombre, apellido, email, salario FROM empleados WHERE id_departamento = 1;
```

### UPDATE: Actualización de datos

```sql
-- Actualizar una fila específica
UPDATE empleados
SET salario = 3700.00
WHERE id = 1;

-- Actualizar múltiples columnas
UPDATE empleados
SET salario = 4000.00, estado = 'activo'
WHERE id_departamento = 1;

-- Actualizar con condiciones complejas
UPDATE empleados
SET salario = salario * 1.10
WHERE salario < 3500 AND id_departamento = 2;

-- Actualizar usando JOIN
UPDATE empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
SET e.salario = e.salario * 1.05
WHERE d.nombre = 'Desarrollo';

-- Actualizar basado en subquery
UPDATE empleados
SET salario = (SELECT AVG(salario) FROM empleados WHERE id_departamento = 1)
WHERE id_departamento = 2 AND salario < 3000;
```

### DELETE: Eliminación de datos

```sql
-- Eliminar una fila específica
DELETE FROM empleados WHERE id = 5;

-- Eliminar múltiples filas
DELETE FROM empleados WHERE id_departamento = 2 AND salario < 3000;

-- Eliminar con JOIN
DELETE e FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
WHERE d.nombre = 'Deprecated';

-- Eliminar usando IN
DELETE FROM empleados
WHERE id IN (SELECT id_empleado FROM asignaciones WHERE id_proyecto = 10);

-- Importante: Siempre usar WHERE para evitar eliminar toda la tabla
-- Sin WHERE, se eliminarían TODOS los registros
```

### Comparativa: TRUNCATE vs DELETE

| Aspecto | DELETE | TRUNCATE |
|--------|--------|----------|
| Velocidad | Más lento (fila por fila) | Más rápido (desasigna bloques) |
| WHERE | Permite condiciones | No permite condiciones |
| Rollback | Reversible en transacción | Reversible en transacción |
| Identity/Auto-increment | No se reinicia | Se reinicia en algunas BD |
| Espacio | Mantiene espacio asignado | Libera espacio |
| Triggers | Se disparan | No se disparan |
| Condiciones | Soporta | No soporta |

```sql
-- Ejemplo de TRUNCATE
TRUNCATE TABLE empleados;

-- Resetear auto-increment en MySQL
ALTER TABLE empleados AUTO_INCREMENT = 1;
```

## Errores comunes y mejores prácticas

| Error | Ejemplo | Solución |
|-------|---------|----------|
| Olvidar PRIMARY KEY | `CREATE TABLE t (id INT)` | `CREATE TABLE t (id INT PRIMARY KEY)` |
| Sin valor por defecto | `CREATE TABLE t (estado VARCHAR(20))` | `CREATE TABLE t (estado VARCHAR(20) DEFAULT 'activo')` |
| DELETE sin WHERE | `DELETE FROM empleados;` | `DELETE FROM empleados WHERE condición;` |
| Tipos de datos incorrectos | `CREATE TABLE t (precio VARCHAR(10))` | `CREATE TABLE t (precio DECIMAL(10,2))` |
| Olvidar NOT NULL requerido | `email VARCHAR(100)` | `email VARCHAR(100) NOT NULL UNIQUE` |
| UPDATE sin WHERE | `UPDATE empleados SET salario = 5000;` | `UPDATE empleados SET salario = 5000 WHERE id = 1;` |
| Violar restricción UNIQUE | Insertar email duplicado | Validar en aplicación o DB antes |
| Circular FOREIGN KEY | Referencia circular entre tablas | Diseñar estructura jerárquica correcta |

## Ejercicios prácticos

### Ejercicio 1: Crear schema de biblioteca
Crea un schema para una biblioteca con tablas de autores, libros, miembros y préstamos con las restricciones apropiadas.

### Ejercicio 2: Actualizar salarios
Incrementa el salario un 15% a todos los empleados del departamento "Desarrollo" que ganen menos de 4000.

### Ejercicio 3: Migrar datos
Copia todos los empleados activos a una tabla de histórico, luego elimínalos de la tabla principal.

## Conclusión

DDL y DML son la base de cualquier trabajo con bases de datos. El diseño correcto de tablas con restricciones adecuadas y la manipulación cuidadosa de datos son fundamentales para mantener la integridad y consistencia de la información.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'bases-de-datos'),
  'Guía completa: JOINs en SQL',
  'joins-en-sql',
  $MKDN$# Guía completa: JOINs en SQL

## ¿Qué es un JOIN y por qué es importante?

Un JOIN permite combinar datos de múltiples tablas basándose en una condición de relación. Es fundamental en el modelo relacional de bases de datos, que busca evitar redundancia de datos dividiendo la información en tablas relacionadas.

### El modelo relacional

En lugar de almacenar toda la información en una tabla (violando normalización), usamos múltiples tablas:

```
Sin JOIN (desnormalizado, redundante):
ID | Nombre  | Departamento | Jefe_Depto | Presupuesto
1  | Juan    | Desarrollo   | Carlos     | 50000
2  | María   | Desarrollo   | Carlos     | 50000  <- Repetición

Con JOIN (normalizado):
EMPLEADOS: ID | Nombre | id_depto
DEPTO: id | nombre | jefe | presupuesto
```

## Tipos de JOINs con diagramas

### Representación visual de JOINs

```
INNER JOIN            LEFT JOIN            RIGHT JOIN
┌─────────┐          ┌─────────┐          ┌─────────┐
│  Tabla1 │          │  Tabla1 │          │  Tabla1 │
│ ╭─────╮ │          │ ╭─────╮ │          │ ╭─────╮ │
│ │█████│ │          │ │█████│ │          │ │  │█  │
│ ╰─────╯ │          │ ╰─────╯ │          │ ╰─────╯ │
│ Tabla2  │          │ Tabla2  │          │ Tabla2  │
│ ┌─────┐ │          │ ┌─────┐ │          │ ┌─────┐ │
│ │█████│ │          │ │█ █  │ │          │ │  ███│ │
│ └─────┘ │          │ └─────┘ │          │ └─────┘ │
└─────────┘          └─────────┘          └─────────┘

FULL OUTER JOIN      CROSS JOIN
┌─────────┐          ┌─────────┐
│  Tabla1 │          │  Tabla1 │
│ ╭─────╮ │          │ ╭─────╮ │
│ │█████│ │          │ │█████│ │
│ ╰─────╯ │          │ ╰─────╯ │
│ Tabla2  │          │ Tabla2  │
│ ┌─────┐ │          │ ┌─────┐ │
│ │█████│ │          │ │█████│ │
│ └─────┘ │          │ └─────┘ │
└─────────┘          └─────────┘
```

### Comparativa de todos los JOINs

| Tipo | Resultado | Cuándo usar |
|------|----------|-------------|
| INNER | Solo filas con coincidencia | Datos que deben existir en ambas tablas |
| LEFT | Todas del lado izq + coincidencias | Todas las filas izq, datos opcionales derecha |
| RIGHT | Coincidencias + todas del lado derecho | Todas las filas derecha, datos opcionales izq |
| FULL OUTER | Todas las filas de ambas tablas | Necesitas todo, rellenar NULL donde falte |
| CROSS | Producto cartesiano | Combinaciones de todas las filas |
| SELF | Tabla unida consigo misma | Comparar filas dentro de la misma tabla |

## INNER JOIN: Solo coincidencias

Retorna solo las filas donde existe coincidencia en ambas tablas.

```sql
-- Sintaxis básica
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id;

-- Múltiples INNER JOINs
SELECT
    e.nombre AS empleado,
    d.nombre AS departamento,
    p.nombre AS proyecto
FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
INNER JOIN proyectos p ON d.id = p.id_departamento;

-- Con WHERE adicional
SELECT e.nombre, d.nombre, e.salario
FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
WHERE e.salario > 3500 AND d.nombre = 'Desarrollo';

-- Con agregación
SELECT d.nombre, COUNT(e.id) AS total_empleados
FROM departamentos d
INNER JOIN empleados e ON d.id = e.id_departamento
GROUP BY d.id, d.nombre
HAVING COUNT(e.id) > 2;
```

## LEFT JOIN: Izquierda + coincidencias

Retorna todas las filas de la tabla izquierda y las coincidencias de la derecha (NULLs si no hay coincidencia).

```sql
-- Obtener todos los empleados y su departamento (si existe)
SELECT
    e.nombre AS empleado,
    COALESCE(d.nombre, 'Sin departamento') AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.id_departamento = d.id;

-- Encontrar empleados sin departamento asignado
SELECT e.nombre, e.email
FROM empleados e
LEFT JOIN departamentos d ON e.id_departamento = d.id
WHERE d.id IS NULL;

-- Múltiples LEFT JOINs
SELECT
    e.nombre,
    d.nombre AS departamento,
    COUNT(a.id) AS num_proyectos
FROM empleados e
LEFT JOIN departamentos d ON e.id_departamento = d.id
LEFT JOIN asignaciones a ON e.id = a.id_empleado
GROUP BY e.id, e.nombre, d.nombre;
```

## RIGHT JOIN: Derechas + coincidencias

Retorna todas las filas de la tabla derecha y las coincidencias de la izquierda.

```sql
-- Todos los departamentos y sus empleados
SELECT
    d.nombre AS departamento,
    COUNT(e.id) AS num_empleados
FROM empleados e
RIGHT JOIN departamentos d ON e.id_departamento = d.id
GROUP BY d.id, d.nombre;

-- Encontrar departamentos sin empleados
SELECT d.nombre
FROM empleados e
RIGHT JOIN departamentos d ON e.id_departamento = d.id
WHERE e.id IS NULL;

-- Nota: RIGHT JOIN es menos común
-- Puede reescribirse como LEFT JOIN invertido
-- SELECT ... FROM departamentos d LEFT JOIN empleados e ...
```

## FULL OUTER JOIN: Todas las filas

Retorna todas las filas de ambas tablas, llenando con NULLs donde no hay coincidencia.

```sql
-- Nota: MySQL no soporta FULL OUTER JOIN nativo
-- Usar UNION de LEFT y RIGHT JOIN

-- En PostgreSQL:
SELECT
    COALESCE(e.nombre, 'Sin empleado') AS empleado,
    COALESCE(d.nombre, 'Sin departamento') AS departamento
FROM empleados e
FULL OUTER JOIN departamentos d ON e.id_departamento = d.id;

-- Equivalente en MySQL usando UNION:
SELECT
    e.nombre AS empleado,
    d.nombre AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.id_departamento = d.id
UNION
SELECT
    e.nombre AS empleado,
    d.nombre AS departamento
FROM empleados e
RIGHT JOIN departamentos d ON e.id_departamento = d.id;
```

## CROSS JOIN: Producto cartesiano

Combina cada fila de la primera tabla con cada fila de la segunda (A x B filas).

```sql
-- Generar todas las combinaciones posibles
SELECT
    e.nombre AS empleado,
    p.nombre AS proyecto
FROM empleados e
CROSS JOIN proyectos p
ORDER BY e.nombre, p.nombre;

-- Casos de uso: generar calendario de turnos
SELECT
    e.nombre,
    dias.fecha
FROM empleados e
CROSS JOIN (
    SELECT DATE_ADD('2024-01-01', INTERVAL n DAY) AS fecha
    FROM (
        SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
    ) AS numeros
) dias;

-- Usar INNER JOIN sin ON (equivalente a CROSS JOIN)
SELECT e.nombre, d.nombre
FROM empleados e, departamentos d;  -- Equivalente a CROSS JOIN
```

## SELF JOIN: Tabla unida consigo misma

Compara datos dentro de la misma tabla.

```sql
-- Encontrar empleados en el mismo departamento
SELECT
    e1.nombre AS empleado1,
    e2.nombre AS empleado2,
    d.nombre AS departamento
FROM empleados e1
INNER JOIN empleados e2 ON e1.id_departamento = e2.id_departamento
INNER JOIN departamentos d ON e1.id_departamento = d.id
WHERE e1.id < e2.id;  -- Evitar duplicados

-- Estructura jerárquica: empleado-supervisor
-- Asumir tabla con id_supervisor
SELECT
    e.nombre AS empleado,
    s.nombre AS supervisor
FROM empleados e
LEFT JOIN empleados s ON e.id_supervisor = s.id;

-- Encontrar empleados que ganan más que su supervisor
SELECT
    e.nombre AS empleado,
    e.salario,
    s.nombre AS supervisor,
    s.salario AS salario_supervisor
FROM empleados e
LEFT JOIN empleados s ON e.id_supervisor = s.id
WHERE e.salario > s.salario;
```

## Alias y claridad en JOINs

```sql
-- Usar alias para mejorar legibilidad
SELECT
    emp.nombre,
    emp.salario,
    dept.nombre AS nom_departamento,
    proj.nombre AS nom_proyecto
FROM empleados AS emp
INNER JOIN departamentos AS dept ON emp.id_departamento = dept.id
LEFT JOIN proyectos AS proj ON dept.id = proj.id_departamento;

-- Alias cortos para código más conciso
SELECT
    e.nombre,
    d.nombre,
    COUNT(a.id) AS proyectos
FROM empleados e
LEFT JOIN departamentos d ON e.id_departamento = d.id
LEFT JOIN asignaciones a ON e.id = a.id_empleado
GROUP BY e.id, e.nombre, d.nombre;
```

## JOINs con GROUP BY y agregación

```sql
-- Contar empleados por departamento
SELECT
    d.nombre,
    COUNT(e.id) AS num_empleados,
    AVG(e.salario) AS salario_promedio
FROM departamentos d
LEFT JOIN empleados e ON d.id = e.id_departamento
GROUP BY d.id, d.nombre;

-- Proyectos con más asignaciones
SELECT
    p.nombre,
    COUNT(a.id) AS num_empleados_asignados,
    SUM(a.horas_asignadas) AS total_horas
FROM proyectos p
LEFT JOIN asignaciones a ON p.id = a.id_proyecto
GROUP BY p.id, p.nombre
HAVING COUNT(a.id) > 0
ORDER BY total_horas DESC;

-- Empleados con proyectos y departamento
SELECT
    e.nombre,
    d.nombre AS departamento,
    COUNT(DISTINCT a.id_proyecto) AS num_proyectos,
    GROUP_CONCAT(DISTINCT p.nombre) AS proyectos
FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
LEFT JOIN asignaciones a ON e.id = a.id_empleado
LEFT JOIN proyectos p ON a.id_proyecto = p.id
GROUP BY e.id, e.nombre, d.nombre;
```

## Consideraciones de rendimiento

```sql
-- BUENO: Usar índices en claves de JOIN
CREATE INDEX idx_empleados_depto ON empleados(id_departamento);
CREATE INDEX idx_asignaciones_emp ON asignaciones(id_empleado);

-- MALO: Demasiados JOINs sin índices
SELECT ... FROM t1 JOIN t2 ON ... JOIN t3 ON ... JOIN t4 ON ... JOIN t5 ON ...;

-- BUENO: Usar INNER JOIN cuando sea posible (más rápido que LEFT)
-- MALO: Usar LEFT JOIN innecesariamente

-- BUENO: Filtrar en WHERE antes de JOINs
SELECT e.nombre FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
WHERE d.nombre = 'Desarrollo';

-- MALO: JOINs sin condición de igualdad (CROSS JOIN implícito)
SELECT e.nombre FROM empleados e, departamentos d WHERE e.salario > d.presupuesto;
```

## Ejercicios prácticos con soluciones

### Ejercicio 1: Empleados y departamentos
Obtén nombre del empleado, salario y nombre del departamento. Incluye empleados sin departamento.

**Solución:**
```sql
SELECT e.nombre, e.salario, COALESCE(d.nombre, 'Sin asignar') AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.id_departamento = d.id
ORDER BY d.nombre, e.nombre;
```

### Ejercicio 2: Proyectos con más asignaciones
Encuentra los 5 proyectos con más empleados asignados, mostrando el nombre del proyecto, departamento y cantidad de empleados.

**Solución:**
```sql
SELECT
    p.nombre AS proyecto,
    d.nombre AS departamento,
    COUNT(DISTINCT a.id_empleado) AS num_empleados
FROM proyectos p
INNER JOIN departamentos d ON p.id_departamento = d.id
LEFT JOIN asignaciones a ON p.id = a.id_proyecto
GROUP BY p.id, p.nombre, d.id, d.nombre
ORDER BY num_empleados DESC
LIMIT 5;
```

### Ejercicio 3: Comparación de salarios
Obtén los nombres de empleados que ganan más que el promedio de su departamento.

**Solución:**
```sql
SELECT
    e.nombre,
    e.salario,
    d.nombre AS departamento,
    promedio.salario_promedio
FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
INNER JOIN (
    SELECT id_departamento, AVG(salario) AS salario_promedio
    FROM empleados
    GROUP BY id_departamento
) promedio ON e.id_departamento = promedio.id_departamento
WHERE e.salario > promedio.salario_promedio
ORDER BY d.nombre, e.salario DESC;
```

### Ejercicio 4: Matriz de empleados-proyectos
Crea una lista donde cada fila represente un empleado con todos sus proyectos asignados.

**Solución:**
```sql
SELECT
    e.nombre AS empleado,
    d.nombre AS departamento,
    GROUP_CONCAT(p.nombre SEPARATOR ', ') AS proyectos,
    COUNT(DISTINCT a.id_proyecto) AS total_proyectos
FROM empleados e
INNER JOIN departamentos d ON e.id_departamento = d.id
LEFT JOIN asignaciones a ON e.id = a.id_empleado
LEFT JOIN proyectos p ON a.id_proyecto = p.id
GROUP BY e.id, e.nombre, d.id, d.nombre
ORDER BY e.nombre;
```

### Ejercicio 5: Departamentos vs Empleados
Obtén todos los departamentos mostrando: nombre del departamento, presupuesto, cantidad de empleados y salario promedio. Incluye departamentos vacíos.

**Solución:**
```sql
SELECT
    d.nombre,
    d.presupuesto,
    COUNT(e.id) AS num_empleados,
    ROUND(AVG(e.salario), 2) AS salario_promedio,
    SUM(e.salario) AS nomina_total
FROM departamentos d
LEFT JOIN empleados e ON d.id = e.id_departamento
GROUP BY d.id, d.nombre, d.presupuesto
ORDER BY num_empleados DESC, d.nombre;
```

## Conclusión

Los JOINs son fundamentales para aprovechar el diseño relacional de bases de datos. Dominarlos es esencial para cualquier profesional de bases de datos. La elección del tipo correcto de JOIN impacta tanto la precisión de los resultados como el rendimiento de la consulta.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'bases-de-datos'),
  'Guía completa: Normalización de Bases de Datos',
  'normalizacion-bases-de-datos',
  $MKDN$# Guía completa: Normalización de Bases de Datos

## ¿Qué es la normalización y por qué importa?

La normalización es el proceso de organizar datos en una base de datos de manera que se minimicen redundancias y se asegure la integridad. Una base de datos bien normalizada evita anomalías de datos y mejora la eficiencia.

### Anomalías de datos

Sin normalización, sufres de tres tipos de anomalías:

| Tipo de Anomalía | Descripción | Ejemplo |
|------------------|-------------|---------|
| **Anomalía de inserción** | No puedes insertar datos sin información completa | No puedes agregar un depto sin empleados |
| **Anomalía de actualización** | Cambios inconsistentes si datos se repiten | Actualizar salario en una fila pero no en otra |
| **Anomalía de eliminación** | Perder datos al borrar registros relacionados | Eliminar empleado pierde info del depto |

## Dependencias funcionales

Una dependencia funcional existe cuando el valor de un atributo determina unívocamente el valor de otro.

```
Notación: A → B (A determina B)

Ejemplos:
- id_empleado → nombre_empleado (el ID determina el nombre)
- id_empleado → id_departamento (el ID determina el depto)
- id_departamento → nombre_departamento (el ID depto determina su nombre)

Dependencia completa: Cuando B depende de TODOS los atributos de A
Dependencia parcial: Cuando B depende de PARTE de A
Dependencia transitiva: Cuando A → B → C (A determina C indirectamente)
```

## Primera Forma Normal (1NF)

**Regla:** Todos los atributos deben contener valores atómicos (indivisibles). No se permiten grupos repetidos o atributos multivaluados.

### Ejemplo: De 0NF a 1NF

**ANTES (0NF - Violador):**
```
Tabla: PEDIDOS
┌──────────┬────────────┬──────────────────────────┐
│ id_orden │ cliente    │ productos                │
├──────────┼────────────┼──────────────────────────┤
│ 1001     │ Juan Pérez │ Laptop, Mouse, Teclado   │  <- No atómico
│ 1002     │ María Gómez│ Monitor, Webcam          │  <- No atómico
└──────────┴────────────┴──────────────────────────┘
```

**DESPUÉS (1NF):**
```
Tabla: PEDIDOS
┌──────────┬────────────┐
│ id_orden │ cliente    │
├──────────┼────────────┤
│ 1001     │ Juan Pérez │
│ 1002     │ María Gómez│
└──────────┴────────────┘

Tabla: LINEAS_PEDIDO
┌──────────┬──────────┐
│ id_orden │ producto │
├──────────┼──────────┤
│ 1001     │ Laptop   │
│ 1001     │ Mouse    │
│ 1001     │ Teclado  │
│ 1002     │ Monitor  │
│ 1002     │ Webcam   │
└──────────┴──────────┘
```

**SQL para 1NF:**
```sql
-- Correctamente normalizado en 1NF
CREATE TABLE pedidos_1nf (
    id_orden INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    cliente_nombre VARCHAR(100),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

CREATE TABLE lineas_pedido (
    id_linea INT PRIMARY KEY AUTO_INCREMENT,
    id_orden INT NOT NULL,
    producto VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_orden) REFERENCES pedidos_1nf(id_orden)
);
```

## Segunda Forma Normal (2NF)

**Reglas:**
1. Estar en 1NF
2. Todos los atributos no-clave deben depender completamente de la clave primaria (eliminar dependencias parciales)

### Ejemplo: De 1NF a 2NF

**ANTES (1NF - Problema):**
```
Tabla: ASIGNACIONES
┌────┬────────────┬───────────────┬──────────────┐
│ id │ id_empleado│ nombre_empleado│ id_proyecto  │
├────┼────────────┼───────────────┼──────────────┤
│ 1  │ 101        │ Juan          │ P001         │  <- Dependencia parcial
│ 2  │ 102        │ María         │ P001         │     nombre_empleado depende
│ 3  │ 101        │ Juan          │ P002         │     solo de id_empleado
└────┴────────────┴───────────────┴──────────────┘

Clave primaria: (id_empleado, id_proyecto)
Problema: nombre_empleado depende solo de id_empleado, no del par completo
```

**DESPUÉS (2NF):**
```
Tabla: EMPLEADOS
┌────────────┬─────────────────┐
│ id_empleado│ nombre_empleado │
├────────────┼─────────────────┤
│ 101        │ Juan            │
│ 102        │ María           │
└────────────┴─────────────────┘

Tabla: ASIGNACIONES (2NF)
┌────────────┬────────────┐
│ id_empleado│ id_proyecto│
├────────────┼────────────┤
│ 101        │ P001       │
│ 102        │ P001       │
│ 101        │ P002       │
└────────────┴────────────┘
```

**SQL para 2NF:**
```sql
CREATE TABLE empleados_2nf (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    UNIQUE(nombre)  -- Opcional: evitar duplicados
);

CREATE TABLE asignaciones_2nf (
    id_empleado INT NOT NULL,
    id_proyecto INT NOT NULL,
    PRIMARY KEY (id_empleado, id_proyecto),
    FOREIGN KEY (id_empleado) REFERENCES empleados_2nf(id_empleado),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto)
);
```

## Tercera Forma Normal (3NF)

**Reglas:**
1. Estar en 2NF
2. Eliminar dependencias transitivas (atributos que dependen de otros atributos no-clave)

### Ejemplo: De 2NF a 3NF

**ANTES (2NF - Problema):**
```
Tabla: EMPLEADOS_DPTO
┌────────────┬─────────────┬──────────────┬────────────┐
│ id_empleado│ nombre      │ id_departamento│ nom_depto  │
├────────────┼─────────────┼──────────────┼────────────┤
│ 101        │ Juan        │ 5            │ Desarrollo │  <- Dependencia transitiva
│ 102        │ María       │ 5            │ Desarrollo │     nom_depto depende
│ 103        │ Carlos      │ 3            │ Ventas     │     de id_departamento
└────────────┴─────────────┴──────────────┴────────────┘

Problema: id_empleado → id_departamento → nom_depto (transitivo)
```

**DESPUÉS (3NF):**
```
Tabla: DEPARTAMENTOS
┌──────────────┬────────────┐
│ id_departamento│ nom_depto │
├──────────────┼────────────┤
│ 5            │ Desarrollo │
│ 3            │ Ventas     │
└──────────────┴────────────┘

Tabla: EMPLEADOS_3NF
┌────────────┬──────────┬──────────────┐
│ id_empleado│ nombre   │ id_departamento│
├────────────┼──────────┼──────────────┤
│ 101        │ Juan     │ 5            │
│ 102        │ María    │ 5            │
│ 103        │ Carlos   │ 3            │
└────────────┴──────────┴──────────────┘
```

**SQL para 3NF:**
```sql
CREATE TABLE departamentos_3nf (
    id_departamento INT PRIMARY KEY,
    nom_depto VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE empleados_3nf (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_departamento INT NOT NULL,
    FOREIGN KEY (id_departamento) REFERENCES departamentos_3nf(id_departamento)
);
```

## Boyce-Codd Normal Form (BCNF)

**Regla:** Una forma más estricta de 3NF. Cada determinante debe ser una clave candidata.

```sql
-- Ejemplo: Profesor-Clase-Hora
-- Problema 3NF: Un profesor enseña múltiples clases a la misma hora

CREATE TABLE profesor_clase_3nf (
    id_profesor INT,
    id_clase INT,
    hora TIME,
    aula VARCHAR(10),
    PRIMARY KEY (id_profesor, id_clase)
);

-- Problema: hora y aula determinan id_profesor,
-- pero id_profesor no es clave primaria
-- Solución BCNF: Separar

CREATE TABLE profesor_clase_bcnf (
    id_profesor INT,
    id_clase INT,
    PRIMARY KEY (id_profesor, id_clase),
    FOREIGN KEY (id_profesor) REFERENCES profesores(id)
);

CREATE TABLE clase_horario_bcnf (
    id_clase INT PRIMARY KEY,
    hora TIME NOT NULL,
    aula VARCHAR(10) NOT NULL,
    id_profesor INT NOT NULL,
    FOREIGN KEY (id_profesor) REFERENCES profesores(id)
);
```

## Cuarta Forma Normal (4NF)

Aborda dependencias multivaluadas (atributos independientes que varían juntos).

```
Ejemplo de dependencia multivaluada:
Profesor → Cursos (un profesor puede enseñar múltiples cursos)
Profesor → Horarios (un profesor puede enseñar en múltiples horarios)

ANTES (sin 4NF):
┌──────────┬────────┬──────────┐
│ profesor │ curso  │ horario  │
├──────────┼────────┼──────────┤
│ Juan     │ Python │ 09:00    │
│ Juan     │ Python │ 14:00    │
│ Juan     │ Java   │ 09:00    │
│ Juan     │ Java   │ 14:00    │
└──────────┴────────┴──────────┘

DESPUÉS (4NF):
Profesor-Curso: Juan-Python, Juan-Java
Profesor-Horario: Juan-09:00, Juan-14:00
```

## Comparativa de Formas Normales

| Forma | Requisitos | Elimina | Anomalías resueltas |
|-------|-----------|---------|-------------------|
| 0NF | Sin normalizar | - | Ninguna |
| 1NF | Valores atómicos | Grupos repetidos | Inserción básica |
| 2NF | 1NF + sin dep. parciales | Dep. parciales | Actualización parcial |
| 3NF | 2NF + sin dep. transitivas | Dep. transitivas | Eliminación de datos |
| BCNF | 3NF + determinantes clave | Anomalías 3NF | Mayor integridad |
| 4NF | BCNF + sin multidep. | Dep. multivaluadas | Claridad conceptual |

## Ejemplo completo: Normalización de tabla "Pedidos"

**TABLA ORIGINAL (DESNORMALIZADA):**
```
PEDIDOS
┌─────────┬────────┬──────────────┬──────────────┬──────────────┬─────────────┐
│ id_ped  │ cliente│ prod_1       │ cantidad_1   │ precio_1     │ estado_ped  │
├─────────┼────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│ 001     │ Juan   │ Laptop       │ 1            │ 1000         │ completado  │
│ 001     │ Juan   │ Mouse        │ 2            │ 25           │ completado  │
└─────────┴────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

**PASO 1: 1NF (Eliminar grupos repetidos)**
```sql
CREATE TABLE pedidos_1nf (
    id_pedido INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    nombre_cliente VARCHAR(100),
    estado VARCHAR(20)
);

CREATE TABLE detalle_pedidos_1nf (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    nombre_producto VARCHAR(100),
    cantidad INT,
    precio DECIMAL(10,2),
    FOREIGN KEY (id_pedido) REFERENCES pedidos_1nf(id_pedido)
);
```

**PASO 2: 2NF (Eliminar dependencias parciales)**
```sql
CREATE TABLE clientes (
    id_cliente INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE pedidos_2nf (
    id_pedido INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    estado VARCHAR(20),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE productos (
    id_producto INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE detalle_pedidos_2nf (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos_2nf(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
```

**PASO 3: 3NF (Eliminar dependencias transitivas)**
```sql
-- Agregar tabla de estados y categorías
CREATE TABLE estados_pedido (
    id_estado INT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE categorias_producto (
    id_categoria INT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE
);

-- Modificar tablas
CREATE TABLE pedidos_3nf (
    id_pedido INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_estado INT NOT NULL,
    fecha_pedido DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado)
);

CREATE TABLE productos_3nf (
    id_producto INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_categoria INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    FOREIGN KEY (id_categoria) REFERENCES categorias_producto(id_categoria)
);

CREATE TABLE detalle_pedidos_3nf (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos_3nf(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos_3nf(id_producto)
);
```

## Normalización vs Desnormalización

A veces, por rendimiento, se permite cierta desnormalización:

```sql
-- En una tabla de reportes, podría ser aceptable duplicar datos
-- si mejora el rendimiento de lecturas
CREATE TABLE reportes_ventas (
    id_reporte INT PRIMARY KEY,
    id_pedido INT,
    nombre_cliente VARCHAR(100),  -- Desnormalizado (duplicado de clientes)
    total_pedido DECIMAL(12,2),   -- Calculado/desnormalizado
    fecha_pedido DATE
);

-- Usar triggers para mantener consistencia
CREATE TRIGGER actualizar_reporte_ventas
AFTER INSERT ON pedidos_3nf
FOR EACH ROW
BEGIN
    INSERT INTO reportes_ventas (id_pedido, nombre_cliente, total_pedido, fecha_pedido)
    SELECT NEW.id_pedido, c.nombre, SUM(d.precio_unitario * d.cantidad), NEW.fecha_pedido
    FROM clientes c
    LEFT JOIN detalle_pedidos_3nf d ON NEW.id_pedido = d.id_pedido
    WHERE c.id_cliente = NEW.id_cliente;
END;
```

| Ventaja | Normalización | Desnormalización |
|---------|--------------|------------------|
| Integridad | Excelente | Requiere cuidado |
| Actualización | Rápida (menos lugares) | Lenta (múltiples lugares) |
| Consultas simples | Más JOINs | Más rápidas |
| Espacio en disco | Mínimo | Mayor |
| Mantenimiento | Fácil | Complejo |

## Ejercicios

### Ejercicio 1: Identificar formas normales
Dada esta tabla, identifica qué forma normal viola y normalízala a 3NF.

```
ESTUDIANTES_CURSOS
┌──────────┬────────────────┬─────────────┬──────────────┐
│ id_est   │ nombre_estudiante│ id_curso  │ nombre_curso │
├──────────┼────────────────┼─────────────┼──────────────┤
│ 1        │ Juan Pérez     │ C1, C2, C3  │ Python, Java │
└──────────┴────────────────┴─────────────┴──────────────┘
```

**Solución:** Viola 1NF (no atómico) y 2NF. Ver ejemplo de normalización arriba.

### Ejercicio 2: Diseñar schema para biblioteca
Crea un schema completamente normalizado a 3NF para una biblioteca con: autores, libros, miembros y préstamos.

## Conclusión

La normalización es fundamental para bases de datos robustas y mantenibles. Aunque la normalización completa (3NF o BCNF) es la recomendación estándar, a veces es aceptable desnormalizar estratégicamente por rendimiento, siempre manteniendo mecanismos de consistencia como triggers.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'bases-de-datos'),
  'Guía completa: Subconsultas y Consultas Avanzadas',
  'subconsultas-y-consultas-avanzadas',
  $MKDN$# Guía completa: Subconsultas y Consultas Avanzadas

## Subconsultas: ¿Qué son?

Una subconsulta (subquery) es una consulta dentro de otra consulta. Permite descomponer problemas complejos en pasos lógicos.

```
SELECT columnas
FROM tabla
WHERE condición (SELECT ... FROM tabla2)
                ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                Subconsulta (también llamada consulta interna)
```

### Ubicaciones donde pueden aparecer subconsultas

| Ubicación | Ejemplo | Retorna |
|-----------|---------|---------|
| **SELECT** | `SELECT (SELECT MAX(salario) FROM e)` | Escalar (1 valor) |
| **FROM** | `SELECT * FROM (SELECT ...) AS tabla_temporal` | Tabla derivada |
| **WHERE** | `SELECT * WHERE id IN (SELECT id FROM ...)` | Lista o escalar |
| **HAVING** | `GROUP BY dept HAVING COUNT(*) > (SELECT AVG(...))` | Escalar |
| **JOIN ON** | `FROM t1 JOIN (SELECT ...) t2 ON t1.id = t2.id` | Tabla derivada |

## Tipos de Subconsultas

### Subconsultas no correlacionadas (Independent)

Se ejecutan una sola vez, de dentro hacia afuera.

```sql
-- Encontrar empleados que ganan más que el salario promedio
SELECT nombre, salario
FROM empleados
WHERE salario > (SELECT AVG(salario) FROM empleados);

-- Empleados del mismo departamento que el empleado 'Juan'
SELECT nombre, id_departamento
FROM empleados
WHERE id_departamento = (
    SELECT id_departamento
    FROM empleados
    WHERE nombre = 'Juan'
);

-- Múltiples subconsultas
SELECT nombre, salario
FROM empleados
WHERE salario > (SELECT AVG(salario) FROM empleados)
  AND id_departamento IN (SELECT id FROM departamentos WHERE presupuesto > 50000);
```

### Subconsultas correlacionadas (Correlated)

Se ejecutan para cada fila de la tabla externa. Más lento pero más flexible.

```sql
-- Empleados que ganan más que el promedio de su departamento
SELECT e.nombre, e.salario, e.id_departamento
FROM empleados e
WHERE e.salario > (
    SELECT AVG(e2.salario)
    FROM empleados e2
    WHERE e2.id_departamento = e.id_departamento
);

-- Departamentos con empleados que ganan más que el promedio general
SELECT DISTINCT d.nombre
FROM departamentos d
WHERE EXISTS (
    SELECT 1
    FROM empleados e
    WHERE e.id_departamento = d.id
      AND e.salario > (SELECT AVG(salario) FROM empleados)
);
```

## Subconsultas Escalares

Retornan un único valor (1 fila, 1 columna).

```sql
-- En SELECT
SELECT
    nombre,
    salario,
    (SELECT AVG(salario) FROM empleados) AS salario_promedio,
    salario - (SELECT AVG(salario) FROM empleados) AS diferencia
FROM empleados;

-- En WHERE
SELECT nombre, salario
FROM empleados
WHERE salario = (SELECT MAX(salario) FROM empleados);

-- En CASE
SELECT
    nombre,
    CASE
        WHEN salario > (SELECT AVG(salario) FROM empleados) THEN 'Arriba del promedio'
        WHEN salario = (SELECT AVG(salario) FROM empleados) THEN 'En el promedio'
        ELSE 'Bajo el promedio'
    END AS clasificacion
FROM empleados;
```

## Operadores de Comparación con Subconsultas

### IN y NOT IN

```sql
-- IN: Empleados en departamentos específicos
SELECT nombre, id_departamento
FROM empleados
WHERE id_departamento IN (
    SELECT id FROM departamentos
    WHERE nombre IN ('Desarrollo', 'Ventas')
);

-- NOT IN: Empleados que NO tienen asignaciones
SELECT nombre
FROM empleados
WHERE id NOT IN (
    SELECT DISTINCT id_empleado FROM asignaciones
);

-- Nota: IN con NULL puede dar resultados inesperados
-- NULL no es igual a nada, ni siquiera a NULL
SELECT * FROM empleados
WHERE id IN (SELECT id_manager FROM empleados WHERE id_manager IS NULL);
-- Esto devuelve cero filas, aunque hay NULLs
```

### EXISTS y NOT EXISTS

```sql
-- EXISTS: Verificar si existe al menos un registro
SELECT nombre
FROM departamentos d
WHERE EXISTS (
    SELECT 1
    FROM empleados e
    WHERE e.id_departamento = d.id
);

-- NOT EXISTS: Departamentos sin empleados
SELECT nombre
FROM departamentos d
WHERE NOT EXISTS (
    SELECT 1
    FROM empleados e
    WHERE e.id_departamento = d.id
);

-- EXISTS es más eficiente que IN para grandes conjuntos
-- Porque se detiene al encontrar el primer resultado
```

### ANY y ALL

```sql
-- ANY: Compara con cualquier valor de la lista
SELECT nombre, salario
FROM empleados
WHERE salario > ANY (
    SELECT salario FROM empleados WHERE id_departamento = 2
);
-- Equivalente a: salario > (SELECT MIN(salario) FROM ...)

-- ALL: Compara con todos los valores
SELECT nombre, salario
FROM empleados
WHERE salario > ALL (
    SELECT salario FROM empleados WHERE id_departamento = 2
);
-- Equivalente a: salario > (SELECT MAX(salario) FROM ...)

-- Ejemplos prácticos
SELECT nombre, salario
FROM empleados
WHERE salario >= ALL (SELECT salario FROM empleados);  -- Máximo salario

SELECT nombre, salario
FROM empleados
WHERE salario <= ANY (SELECT salario FROM empleados);  -- Cualquiera
```

## Tablas Derivadas (Subconsultas en FROM)

```sql
-- Obtener empleados y su salario relativo al departamento
SELECT
    e.nombre,
    e.salario,
    depto_avg.salario_promedio,
    e.salario - depto_avg.salario_promedio AS diferencia
FROM empleados e
INNER JOIN (
    SELECT
        id_departamento,
        AVG(salario) AS salario_promedio,
        COUNT(*) AS num_empleados
    FROM empleados
    GROUP BY id_departamento
) depto_avg ON e.id_departamento = depto_avg.id_departamento;

-- Tabla derivada con TOP N
SELECT * FROM (
    SELECT nombre, salario, ROW_NUMBER() OVER (ORDER BY salario DESC) AS rank
    FROM empleados
) ranked
WHERE rank <= 5;
```

## CTEs: Common Table Expressions (WITH)

Las CTEs hacen el código más legible que las tablas derivadas.

### CTEs básicos

```sql
-- CTE no recursivo
WITH salarios_promedio AS (
    SELECT
        id_departamento,
        AVG(salario) AS promedio,
        MIN(salario) AS minimo,
        MAX(salario) AS maximo
    FROM empleados
    GROUP BY id_departamento
)
SELECT
    e.nombre,
    e.salario,
    sa.promedio,
    CASE
        WHEN e.salario > sa.promedio THEN 'Arriba'
        ELSE 'Abajo'
    END AS clasificacion
FROM empleados e
INNER JOIN salarios_promedio sa ON e.id_departamento = sa.id_departamento;

-- Múltiples CTEs
WITH empleados_activos AS (
    SELECT * FROM empleados WHERE activo = 1
),
departamentos_grandes AS (
    SELECT id_departamento, COUNT(*) AS total
    FROM empleados_activos
    GROUP BY id_departamento
    HAVING COUNT(*) > 5
)
SELECT e.nombre, d.nombre AS departamento
FROM empleados_activos e
INNER JOIN departamentos_grandes dg ON e.id_departamento = dg.id_departamento
INNER JOIN departamentos d ON e.id_departamento = d.id;
```

### CTEs recursivos

Útiles para jerarquías (org chart, categorías anidadas).

```sql
-- Estructura organizacional: empleado - manager - director
CREATE TABLE empleados_jerarquia (
    id INT PRIMARY KEY,
    nombre VARCHAR(100),
    id_manager INT,
    FOREIGN KEY (id_manager) REFERENCES empleados_jerarquia(id)
);

-- CTE recursivo para obtener toda la cadena de mando
WITH RECURSIVE cadena_mando AS (
    -- Caso base: empleados sin manager
    SELECT
        id,
        nombre,
        id_manager,
        nombre AS cadena,
        1 AS nivel
    FROM empleados_jerarquia
    WHERE id_manager IS NULL

    UNION ALL

    -- Caso recursivo: empleados con manager
    SELECT
        e.id,
        e.nombre,
        e.id_manager,
        CONCAT(cm.cadena, ' > ', e.nombre),
        cm.nivel + 1
    FROM empleados_jerarquia e
    INNER JOIN cadena_mando cm ON e.id_manager = cm.id
    WHERE cm.nivel < 10  -- Limitar profundidad para evitar loops infinitos
)
SELECT * FROM cadena_mando
ORDER BY nivel, id;
```

## Window Functions (Funciones de Ventana)

Realizan cálculos sobre rangos de filas sin colapsarlas (a diferencia de GROUP BY).

### Funciones de ranking

```sql
-- ROW_NUMBER: Numeración única
SELECT
    nombre,
    salario,
    id_departamento,
    ROW_NUMBER() OVER (ORDER BY salario DESC) AS rank_general,
    ROW_NUMBER() OVER (PARTITION BY id_departamento ORDER BY salario DESC) AS rank_depto
FROM empleados;

-- RANK: Ranking con empates (números se saltan)
SELECT
    nombre,
    salario,
    RANK() OVER (ORDER BY salario DESC) AS rank
FROM empleados;
-- Resultado: 1, 2, 2, 4, 5 (salta el 3 cuando hay empate)

-- DENSE_RANK: Ranking con empates (números consecutivos)
SELECT
    nombre,
    salario,
    DENSE_RANK() OVER (ORDER BY salario DESC) AS dense_rank
FROM empleados;
-- Resultado: 1, 2, 2, 3, 4 (no salta)
```

### Funciones de desplazamiento

```sql
-- LAG: Acceder a filas anteriores
SELECT
    nombre,
    salario,
    LAG(salario) OVER (ORDER BY nombre) AS salario_anterior,
    salario - LAG(salario) OVER (ORDER BY nombre) AS diferencia
FROM empleados;

-- LEAD: Acceder a filas siguientes
SELECT
    nombre,
    fecha_contratacion,
    LEAD(nombre) OVER (ORDER BY fecha_contratacion) AS siguiente_empleado
FROM empleados;

-- FIRST_VALUE y LAST_VALUE
SELECT
    nombre,
    salario,
    FIRST_VALUE(salario) OVER (PARTITION BY id_departamento ORDER BY salario) AS salario_minimo_depto,
    LAST_VALUE(salario) OVER (PARTITION BY id_departamento ORDER BY salario) AS salario_maximo_depto
FROM empleados;
```

### Funciones de agregación como window functions

```sql
-- SUM OVER: Suma acumulativa
SELECT
    nombre,
    salario,
    SUM(salario) OVER (ORDER BY id) AS nomina_acumulativa,
    SUM(salario) OVER (PARTITION BY id_departamento) AS nomina_departamento,
    SUM(salario) OVER () AS nomina_total
FROM empleados
ORDER BY id;

-- AVG, COUNT, MIN, MAX también funcionan
SELECT
    nombre,
    salario,
    id_departamento,
    AVG(salario) OVER (PARTITION BY id_departamento) AS promedio_depto,
    COUNT(*) OVER (PARTITION BY id_departamento) AS count_depto
FROM empleados;
```

## CASE WHEN: Lógica condicional

```sql
-- CASE simple
SELECT
    nombre,
    salario,
    CASE salario
        WHEN salario > 5000 THEN 'Nivel A'
        WHEN salario > 3000 THEN 'Nivel B'
        ELSE 'Nivel C'
    END AS nivel
FROM empleados;

-- CASE buscado (más flexible)
SELECT
    nombre,
    salario,
    id_departamento,
    CASE
        WHEN salario > 5000 AND id_departamento = 1 THEN 'Senior'
        WHEN salario > 3000 THEN 'Mid-level'
        WHEN salario < 2000 THEN 'Junior'
        ELSE 'Otro'
    END AS nivel_empleado,
    CASE id_departamento
        WHEN 1 THEN 'Desarrollo'
        WHEN 2 THEN 'Ventas'
        WHEN 3 THEN 'Admin'
        ELSE 'Otros'
    END AS depto_nombre
FROM empleados;

-- CASE en GROUP BY y ORDER BY
SELECT
    CASE id_departamento
        WHEN 1 THEN 'Desarrollo'
        WHEN 2 THEN 'Ventas'
        ELSE 'Otros'
    END AS departamento,
    COUNT(*) AS total,
    AVG(salario) AS promedio
FROM empleados
GROUP BY CASE id_departamento WHEN 1 THEN 'Desarrollo' WHEN 2 THEN 'Ventas' ELSE 'Otros' END
ORDER BY CASE WHEN total > 10 THEN 1 ELSE 2 END;
```

## GROUP BY avanzado: HAVING vs WHERE

```sql
-- WHERE: Filtra ANTES de agrupar
-- HAVING: Filtra DESPUÉS de agrupar

SELECT
    id_departamento,
    COUNT(*) AS total_empleados,
    AVG(salario) AS promedio_salario
FROM empleados
WHERE salario > 2000           -- Filtra filas ANTES del GROUP BY
GROUP BY id_departamento
HAVING COUNT(*) > 2            -- Filtra DESPUÉS de GROUP BY
   AND AVG(salario) > 3500;

-- Orden de ejecución:
-- 1. FROM
-- 2. WHERE (filtra filas)
-- 3. GROUP BY
-- 4. HAVING (filtra grupos)
-- 5. SELECT
-- 6. ORDER BY
```

## ROLLUP y CUBE para subtotales

```sql
-- ROLLUP: Subtotales jerárquicos (PostgreSQL, MySQL 8.0+)
SELECT
    YEAR(fecha_pedido) AS año,
    MONTH(fecha_pedido) AS mes,
    COUNT(*) AS total_pedidos,
    SUM(monto) AS total_ventas
FROM pedidos
GROUP BY ROLLUP(YEAR(fecha_pedido), MONTH(fecha_pedido));
-- Genera: totales por año-mes, por año, y total general

-- CUBE: Todas las combinaciones de subtotales
SELECT
    id_departamento,
    id_proyecto,
    COUNT(*) AS asignaciones
FROM asignaciones
GROUP BY CUBE(id_departamento, id_proyecto);
-- Genera subtotales para: depto-proyecto, depto, proyecto, total
```

## Ejemplo práctico integrado

```sql
-- Análisis completo de empleados con múltiples técnicas

WITH datos_base AS (
    -- Preparar datos
    SELECT
        e.id,
        e.nombre,
        e.salario,
        d.nombre AS departamento,
        d.presupuesto,
        COUNT(DISTINCT a.id_proyecto) AS num_proyectos
    FROM empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id
    LEFT JOIN asignaciones a ON e.id = a.id_empleado
    GROUP BY e.id, e.nombre, e.salario, d.id, d.nombre, d.presupuesto
),
analisis AS (
    -- Análisis por departamento
    SELECT
        db.departamento,
        db.nombre,
        db.salario,
        db.num_proyectos,
        ROUND(AVG(db.salario) OVER (PARTITION BY db.departamento), 2) AS promedio_depto,
        ROW_NUMBER() OVER (PARTITION BY db.departamento ORDER BY db.salario DESC) AS rank_depto
    FROM datos_base db
)
SELECT
    departamento,
    nombre,
    salario,
    promedio_depto,
    CASE
        WHEN salario > promedio_depto THEN 'Arriba del promedio'
        ELSE 'Bajo del promedio'
    END AS posicion,
    num_proyectos,
    rank_depto
FROM analisis
WHERE rank_depto <= 3  -- Top 3 por departamento
ORDER BY departamento, salario DESC;
```

## Ejercicios prácticos

### Ejercicio 1: Empleados de alto rendimiento
Encuentra empleados que ganan más que el promedio de su departamento Y están asignados a más de 2 proyectos.

**Solución:**
```sql
SELECT e.nombre, e.salario, COUNT(DISTINCT a.id_proyecto) AS proyectos
FROM empleados e
LEFT JOIN asignaciones a ON e.id = a.id_empleado
WHERE e.salario > (
    SELECT AVG(salario) FROM empleados e2
    WHERE e2.id_departamento = e.id_departamento
)
GROUP BY e.id, e.nombre, e.salario
HAVING COUNT(DISTINCT a.id_proyecto) > 2;
```

### Ejercicio 2: Ranking de departamentos
Crea un ranking de departamentos por presupuesto y muestra el número de empleados.

**Solución:**
```sql
SELECT
    d.nombre,
    d.presupuesto,
    COUNT(e.id) AS num_empleados,
    RANK() OVER (ORDER BY d.presupuesto DESC) AS rank_presupuesto
FROM departamentos d
LEFT JOIN empleados e ON d.id = e.id_departamento
GROUP BY d.id, d.nombre, d.presupuesto;
```

## Conclusión

Las subconsultas y consultas avanzadas permiten resolver problemas complejos de forma elegante. CTEs mejoran la legibilidad, window functions evitan agregaciones, y CASE proporciona lógica condicional poderosa.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'bases-de-datos'),
  'Guía completa: Transacciones y Propiedades ACID',
  'transacciones-y-acid',
  $MKDN$# Guía completa: Transacciones y Propiedades ACID

## ¿Qué es una transacción?

Una transacción es una secuencia de operaciones SQL que se ejecuta de forma atómica: o se completan todas o ninguna se ejecuta. Es la unidad fundamental de trabajo en una base de datos.

```
Transacción = Múltiples operaciones tratadas como una unidad

Ejemplo: Transferencia bancaria
1. Debitar cuenta A: UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1
2. Acreditar cuenta B: UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2

Si falla (1) pero no (2): inconsistencia de datos
Solución: Agrupar en transacción
```

## Propiedades ACID

Las propiedades ACID garantizan la confiabilidad de las transacciones:

### 1. Atomicity (Atomicidad)

**Concepto:** La transacción es indivisible. Se ejecuta completamente o no se ejecuta.

| Escenario | Resultado |
|-----------|-----------|
| Todas las operaciones exitosas | COMMIT: se guardan todos los cambios |
| Una operación falla | ROLLBACK: se revierten todos los cambios |
| Base de datos se cae | ROLLBACK: se revierten cambios no guardados |

**Ejemplo de fallo de atomicidad (sin transacción):**
```
ANTES: Cuenta A = 1000, Cuenta B = 500
1. UPDATE ... A = 900       ✓ Éxito
2. UPDATE ... B = 600       ✗ Falla por constraint
DESPUÉS: Cuenta A = 900, Cuenta B = 500  <- INCONSISTENCIA

Dinero perdido: 100
```

**Con transacción:**
```sql
START TRANSACTION;
UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;  -- O ROLLBACK si hay error

-- Con manejo de error
BEGIN;
UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
EXCEPTION WHEN OTHERS THEN ROLLBACK;
COMMIT;
```

### 2. Consistency (Consistencia)

**Concepto:** La transacción lleva la BD de un estado consistente a otro consistente. Se respetan todas las restricciones.

```sql
-- Violación de consistencia sin transacción
UPDATE empleados SET id_departamento = 999 WHERE id = 1;
-- Falla: id_departamento 999 no existe (violación FK)
-- Si ya se hizo la actualización: INCONSISTENCIA

-- Con transacción
START TRANSACTION;
UPDATE empleados SET id_departamento = 999 WHERE id = 1;
-- Falla: ROLLBACK automático
-- Estado vuelve a ser consistente

-- Restricciones que protegen consistencia
CREATE TABLE empleados (
    id INT PRIMARY KEY,
    salario DECIMAL(10,2) CHECK (salario >= 0),  -- No salarios negativos
    id_departamento INT NOT NULL,                 -- Depto obligatorio
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
);

-- Intentar violar: salario negativo en transacción
START TRANSACTION;
UPDATE empleados SET salario = -100 WHERE id = 1;
-- ROLLBACK: violación de CHECK
COMMIT;
```

### 3. Isolation (Aislamiento)

**Concepto:** Transacciones concurrentes no se interfieren. Cada una ve un estado consistente de los datos.

```
Transacción A          Transacción B
-----------            -----------
START                  START
READ salario=1000
                       UPDATE salario = 1100
                       COMMIT
READ salario=?         <- ¿Ve 1000 o 1100?
COMMIT

Depende del nivel de aislamiento:
- READ UNCOMMITTED: Ve 1100 (lectura sucia)
- READ COMMITTED: Ve 1000 (lectura consistente)
- REPEATABLE READ: Ve 1000 (mismo valor en toda la transacción)
- SERIALIZABLE: Se ejecuta como si fuera secuencial
```

**Implementación en SQL:**
```sql
-- Ver nivel de aislamiento actual
SHOW TRANSACTION ISOLATION LEVEL;

-- Establecer nivel de aislamiento
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Para una transacción específica
START TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- ... operaciones ...
COMMIT;
```

### 4. Durability (Durabilidad)

**Concepto:** Una vez que se hace COMMIT, los datos persisten incluso si hay fallos.

```
Antes: Datos en memoria
Datos: CPU RAM    <- Vulnerable a fallo de energía
       ↓
       Disco      <- Permanente

COMMIT asegura:
1. Datos se escriben en disco
2. Log de transacciones se persiste
3. En caso de fallo: BD se recupera desde el log
```

**Implementación:**
```sql
-- Usar SYNC para garantizar durabilidad (más lento)
SET GLOBAL innodb_flush_log_at_trx_commit = 1;  -- Escribir inmediatamente

-- Usar ASYNC para más velocidad (menos seguro)
SET GLOBAL innodb_flush_log_at_trx_commit = 2;  -- Escribir cada segundo

-- Verificar durabilidad después de COMMIT
START TRANSACTION;
INSERT INTO empleados VALUES (1, 'Juan');
COMMIT;  -- Garantizado que está en disco
-- Incluso si servidor falla ahora, el dato está guardado
```

## Comandos de Control de Transacciones (TCL)

| Comando | Efecto | Ejemplo |
|---------|--------|---------|
| BEGIN / START TRANSACTION | Inicia transacción | `START TRANSACTION;` |
| COMMIT | Persiste cambios | `COMMIT;` |
| ROLLBACK | Deshace cambios | `ROLLBACK;` |
| SAVEPOINT | Punto de restauración | `SAVEPOINT sp1;` |
| ROLLBACK TO | Restaurar a savepoint | `ROLLBACK TO sp1;` |
| SET TRANSACTION | Configurar aislamiento | `SET TRANSACTION ISOLATION LEVEL ...` |

### Ejemplos de TCL

```sql
-- Transacción básica
START TRANSACTION;
INSERT INTO departamentos VALUES (10, 'IT', 100000);
INSERT INTO empleados VALUES (1, 'Juan', 3000, 10);
COMMIT;  -- Se guardan ambos

-- Con ROLLBACK en caso de error
START TRANSACTION;
UPDATE empleados SET salario = salario + 500 WHERE id_departamento = 1;
-- Si hay error:
ROLLBACK;  -- Se revierten cambios
-- Si todo está bien:
COMMIT;

-- Con SAVEPOINT
START TRANSACTION;
INSERT INTO empleados VALUES (2, 'María', 3500, 1);
SAVEPOINT sp1;

INSERT INTO empleados VALUES (3, 'Carlos', 4000, 1);
-- Si falla este INSERT:
ROLLBACK TO sp1;  -- Revierte solo el segundo INSERT
-- María está insertada, Carlos no

INSERT INTO empleados VALUES (4, 'Ana', 3200, 1);
COMMIT;  -- María y Ana se guardan, Carlos no
```

## Niveles de Aislamiento

### READ UNCOMMITTED (Nivel 0)

El más bajo. Permite lecturas sucias (leer datos no comprometidos).

```
Transacción A              Transacción B
-----------                -----------
START                      START
UPDATE sal = 1100
                           READ sal    <- Lee 1100 sin COMMIT de A
ROLLBACK
                           READ sal    <- Ahora lee valor original
                           COMMIT

PROBLEMA: Lectura sucia de 1100 que fue revertida
```

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
START TRANSACTION;
SELECT salario FROM empleados WHERE id = 1;  -- Puede leer dato no comprometido
COMMIT;
```

### READ COMMITTED (Nivel 1)

Permite solo lecturas comprometidas. Evita lecturas sucias pero no lecturas no repetibles.

```
Transacción A              Transacción B
-----------                -----------
START                      START
                           READ sal = 1000
UPDATE sal = 1100
COMMIT
                           READ sal = 1100  <- Valor cambió en misma transacción
                           COMMIT

PROBLEMA: Lectura no repetible (valor cambió entre lecturas)
```

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT salario FROM empleados WHERE id = 1;  -- Lee 1000
-- Otra transacción cambia el valor
SELECT salario FROM empleados WHERE id = 1;  -- Lee 1100
COMMIT;
```

### REPEATABLE READ (Nivel 2)

Garantiza que lecturas de los mismos datos devuelven el mismo valor durante la transacción.

```
Transacción A              Transacción B
-----------                -----------
START                      START
READ sal = 1000
                           UPDATE sal = 1100
                           COMMIT
READ sal = 1000            <- Repite mismo valor, ignora cambio de B

PROBLEMA: Lectura fantasma (nuevas filas insertadas no se ven)
```

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
SELECT COUNT(*) FROM empleados WHERE activo = 1;  -- Cuenta = 10
-- Otra transacción inserta empleado
SELECT COUNT(*) FROM empleados WHERE activo = 1;  -- Sigue siendo 10
COMMIT;
```

### SERIALIZABLE (Nivel 3)

El más restrictivo. Garantiza que transacciones se comportan como si se ejecutaran en serie.

```
Transacción A              Transacción B
-----------                -----------
START                      START
READ DATA
WRITE DATA
COMMIT
                           START
                           Accede a datos modificados por A
                           COMMIT

Efecto: Se ejecutan secuencialmente, no hay concurrencia real
```

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
SELECT COUNT(*) FROM empleados;
INSERT INTO empleados VALUES (...);
-- Ninguna otra transacción puede modificar empleados hasta COMMIT
COMMIT;
```

## Tabla de Anomalías por Nivel

| Anomalía | Descripción | READ UNCOMMITTED | READ COMMITTED | REPEATABLE READ | SERIALIZABLE |
|----------|-------------|:----------------:|:---------------:|:---------------:|:------------:|
| Lectura Sucia | Leer dato no comprometido | ✓ POSIBLE | ✗ No | ✗ No | ✗ No |
| Lectura No Repetible | Mismo dato cambia en transacción | ✓ POSIBLE | ✓ POSIBLE | ✗ No | ✗ No |
| Lectura Fantasma | Nuevas filas en rango | ✓ POSIBLE | ✓ POSIBLE | ✓ POSIBLE | ✗ No |

## Deadlocks (Bloqueos Mutuos)

Ocurre cuando dos transacciones se esperan mutuamente.

### Ejemplo de deadlock

```
Transacción A          Transacción B
-----------            -----------
LOCK tabla1
                       LOCK tabla2
WAIT para tabla2
                       WAIT para tabla1

DEADLOCK: Ambas esperan indefinidamente
```

**En SQL:**
```sql
-- Transacción A
START TRANSACTION;
UPDATE empleados SET salario = 4000 WHERE id = 1;
-- Espera...
UPDATE departamentos SET presupuesto = 100000 WHERE id = 1;
COMMIT;

-- Transacción B (en paralelo)
START TRANSACTION;
UPDATE departamentos SET presupuesto = 100000 WHERE id = 1;
-- Espera...
UPDATE empleados SET salario = 4000 WHERE id = 1;
COMMIT;

-- Base de datos detecta y cancela una transacción
```

### Prevención de deadlocks

```sql
-- 1. Acceder a recursos en el mismo orden
-- Transacción A y B: primero empleados, después departamentos
START TRANSACTION;
UPDATE empleados SET salario = 4000 WHERE id = 1;
UPDATE departamentos SET presupuesto = 100000 WHERE id = 1;
COMMIT;

-- 2. Reducir duración de transacciones
START TRANSACTION;
-- Hacer lo mínimo
UPDATE empleados SET salario = 4000 WHERE id = 1;
COMMIT;  -- Liberar locks rápido

-- 3. Usar SELECT FOR UPDATE para predecir locks
START TRANSACTION;
SELECT * FROM empleados WHERE id = 1 FOR UPDATE;  -- Lock ahora
-- Ahora seguro que nadie más puede cambiar empleados.id=1
UPDATE empleados SET salario = 4000 WHERE id = 1;
COMMIT;

-- 4. Timeout para detectar deadlocks
SET innodb_lock_wait_timeout = 10;  -- Esperar máximo 10 segundos
```

## Locking: Optimistic vs Pessimistic

### Pessimistic Locking (Bloqueo preventivo)

```sql
-- Bloquear antes de modificar
START TRANSACTION;
SELECT * FROM empleados WHERE id = 1 FOR UPDATE;  -- Lock exclusivo
-- Nadie más puede leer con FOR UPDATE ni modificar

UPDATE empleados SET salario = 4000 WHERE id = 1;
COMMIT;  -- Libera lock
```

**Ventaja:** Evita conflictos pero reduce concurrencia.

### Optimistic Locking (Control de versión)

```sql
-- Tabla con versión
CREATE TABLE empleados (
    id INT PRIMARY KEY,
    nombre VARCHAR(100),
    salario DECIMAL(10,2),
    version INT DEFAULT 0
);

-- Lectura
SELECT * FROM empleados WHERE id = 1;  -- version = 5

-- Modificación con validación de versión
UPDATE empleados
SET salario = 4000, version = version + 1
WHERE id = 1 AND version = 5;  -- Solo si versión no cambió

-- Si otra transacción modificó: version cambió, UPDATE afecta 0 filas
-- Aplicación detecta cambio y reintentas
```

**Ventaja:** Mejor concurrencia, pero requiere reintentos.

## Ejemplo práctico: Sistema de contabilidad

```sql
-- Tablas
CREATE TABLE cuentas (
    id INT PRIMARY KEY,
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
    saldo DECIMAL(15,2) NOT NULL CHECK (saldo >= 0),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE transacciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cuenta_origen INT NOT NULL,
    id_cuenta_destino INT,
    monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    tipo ENUM('deposito','retiro','transferencia') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta_origen) REFERENCES cuentas(id),
    FOREIGN KEY (id_cuenta_destino) REFERENCES cuentas(id)
);

-- Función para transferencia segura
DELIMITER $$
CREATE PROCEDURE transferir_dinero(
    IN p_id_origen INT,
    IN p_id_destino INT,
    IN p_monto DECIMAL(15,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Verificaciones
    IF NOT EXISTS (SELECT 1 FROM cuentas WHERE id = p_id_origen) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cuenta origen no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM cuentas WHERE id = p_id_destino) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cuenta destino no existe';
    END IF;

    -- Bloquear cuentas en orden para evitar deadlock
    SELECT * FROM cuentas WHERE id = LEAST(p_id_origen, p_id_destino) FOR UPDATE;
    SELECT * FROM cuentas WHERE id = GREATEST(p_id_origen, p_id_destino) FOR UPDATE;

    -- Verificar saldo
    IF (SELECT saldo FROM cuentas WHERE id = p_id_origen) < p_monto THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente';
    END IF;

    -- Realizar operaciones
    UPDATE cuentas SET saldo = saldo - p_monto WHERE id = p_id_origen;
    UPDATE cuentas SET saldo = saldo + p_monto WHERE id = p_id_destino;

    -- Registrar transacción
    INSERT INTO transacciones (id_cuenta_origen, id_cuenta_destino, monto, tipo)
    VALUES (p_id_origen, p_id_destino, p_monto, 'transferencia');

    COMMIT;
END$$
DELIMITER ;

-- Uso
CALL transferir_dinero(1, 2, 100.00);
```

## Ejercicios

### Ejercicio 1: Identificar anomalías
¿Qué tipo de anomalía ocurre en cada escenario sin transacciones?

1. Insertar empleado con depto inexistente
2. Actualizar salario parcialmente en múltiples filas fallando en la 5ª fila
3. Leer dato, otra transacción lo modifica, leer de nuevo

### Ejercicio 2: Elegir nivel de aislamiento
Para una aplicación de reservas de hotel, ¿qué nivel es más apropiado? ¿Por qué?

**Respuesta:** SERIALIZABLE, para evitar vender la misma habitación dos veces (lectura fantasma).

## Conclusión

Las transacciones ACID son el corazón de bases de datos confiables. Entender atomicidad, consistencia, aislamiento y durabilidad es fundamental para sistemas de producción. Elegir el nivel de aislamiento correcto requiere balance entre seguridad y rendimiento.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'bases-de-datos'),
  'Guía completa: Stored Procedures, Funciones y Triggers',
  'stored-procedures-funciones-triggers',
  $MKDN$# Guía completa: Stored Procedures, Funciones y Triggers

## Introducción: Lógica en la Base de Datos

Los Stored Procedures, Funciones y Triggers permiten encapsular lógica en la base de datos, mejorando seguridad, rendimiento y reutilización de código.

| Característica | Stored Procedure | Función | Trigger |
|---|---|---|---|
| **Propósito** | Automatizar tareas, múltiples operaciones | Calcular y devolver valor | Reaccionar a eventos en tablas |
| **Retorna** | Código de resultado (0 = éxito) | Valor (escalar o tabla) | Nada |
| **Parámetros** | IN, OUT, INOUT | IN (solo entrada) | Implícitos (NEW, OLD) |
| **Invocación** | CALL | SELECT o en expresiones | Automática |
| **Transacciones** | Soporta múltiples | No | Usa transacción del evento |
| **Rendimiento** | Bueno | Muy bueno | Variable |

## Stored Procedures

Un Stored Procedure es un programa almacenado en la BD que ejecuta múltiples operaciones.

### Ventajas

- **Rendimiento:** Se compilan una sola vez
- **Seguridad:** Usuarios solo ejecutan, no modifican lógica
- **Reutilización:** Una sola definición, múltiples usos
- **Transacciones:** Múltiples operaciones atómicas
- **Validación centralizada:** Lógica en un lugar

### Sintaxis básica

```sql
DELIMITER $$
CREATE PROCEDURE nombre_procedimiento(
    IN param_entrada INT,
    OUT param_salida VARCHAR(100),
    INOUT param_modificable INT
)
BEGIN
    DECLARE variable_local INT;

    -- Lógica
    SELECT COUNT(*) INTO variable_local FROM empleados;

    IF variable_local > 0 THEN
        SET param_salida = 'Hay empleados';
    ELSE
        SET param_salida = 'Sin empleados';
    END IF;

    SET param_modificable = param_modificable + 1;
END$$
DELIMITER ;

-- Llamar el procedimiento
CALL nombre_procedimiento(5, @resultado, @contador);
SELECT @resultado, @contador;
```

### Ejemplo 1: Procedimiento simple

```sql
DELIMITER $$
CREATE PROCEDURE obtener_salario_empleado(
    IN p_id_empleado INT,
    OUT p_salario DECIMAL(10,2),
    OUT p_departamento VARCHAR(100)
)
BEGIN
    SELECT
        e.salario,
        d.nombre INTO p_salario, p_departamento
    FROM empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id
    WHERE e.id = p_id_empleado;

    IF p_salario IS NULL THEN
        SET p_salario = 0;
        SET p_departamento = 'No encontrado';
    END IF;
END$$
DELIMITER ;

-- Usar
CALL obtener_salario_empleado(1, @sal, @depto);
SELECT @sal, @depto;
```

### Ejemplo 2: Procedimiento con control de flujo

```sql
DELIMITER $$
CREATE PROCEDURE actualizar_salarios_anual(
    IN p_porcentaje DECIMAL(5,2),
    OUT p_empleados_actualizados INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_empleados_actualizados = -1;
    END;

    START TRANSACTION;

    -- Validar porcentaje
    IF p_porcentaje <= 0 OR p_porcentaje > 50 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Porcentaje debe estar entre 0 y 50';
    END IF;

    -- Actualizar
    UPDATE empleados
    SET salario = ROUND(salario * (1 + p_porcentaje / 100), 2)
    WHERE activo = 1;

    SET p_empleados_actualizados = ROW_COUNT();

    COMMIT;
END$$
DELIMITER ;

-- Usar
CALL actualizar_salarios_anual(5, @total);
SELECT @total AS empleados_actualizados;
```

### Ejemplo 3: Procedimiento con loops

```sql
DELIMITER $$
CREATE PROCEDURE insertar_periodos_prueba()
BEGIN
    DECLARE contador INT DEFAULT 1;
    DECLARE cantidad INT DEFAULT 12;

    WHILE contador <= cantidad DO
        INSERT INTO periodos (numero, nombre, fecha_inicio)
        VALUES (
            contador,
            CONCAT('Período ', contador),
            DATE_ADD(CURDATE(), INTERVAL (contador - 1) MONTH)
        );

        SET contador = contador + 1;
    END WHILE;
END$$
DELIMITER ;

-- Usar
CALL insertar_periodos_prueba();
```

### Ejemplo 4: Procedimiento con cursor

```sql
DELIMITER $$
CREATE PROCEDURE generar_bonificaciones()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_id_empleado INT;
    DECLARE v_salario DECIMAL(10,2);
    DECLARE v_bonificacion DECIMAL(10,2);

    DECLARE cursor_empleados CURSOR FOR
        SELECT id, salario FROM empleados WHERE activo = 1;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cursor_empleados;

    leer_loop: LOOP
        FETCH cursor_empleados INTO v_id_empleado, v_salario;

        IF done THEN
            LEAVE leer_loop;
        END IF;

        -- Calcular bonificación
        IF v_salario > 5000 THEN
            SET v_bonificacion = v_salario * 0.20;
        ELSEIF v_salario > 3000 THEN
            SET v_bonificacion = v_salario * 0.10;
        ELSE
            SET v_bonificacion = v_salario * 0.05;
        END IF;

        -- Insertar en tabla de bonificaciones
        INSERT INTO bonificaciones (id_empleado, monto, fecha)
        VALUES (v_id_empleado, v_bonificacion, CURDATE());
    END LOOP;

    CLOSE cursor_empleados;
END$$
DELIMITER ;
```

## Funciones (CREATE FUNCTION)

Una función retorna un valor y se usa en consultas, no se "llama" como un procedimiento.

### Diferencias Procedure vs Function

| Aspecto | Procedure | Function |
|--------|-----------|----------|
| Retorno | Múltiples parámetros OUT | Un valor RETURN |
| Uso | CALL proc(...) | SELECT func(...) |
| Transacciones | BEGIN...COMMIT dentro | No usa transacciones |
| Lado de servidor | Sí | Sí |
| Parámetros | IN/OUT/INOUT | Solo IN |

### Sintaxis básica

```sql
DELIMITER $$
CREATE FUNCTION nombre_funcion(param INT)
RETURNS tipo_retorno
DETERMINISTIC  -- Mismo input = mismo output
READS SQL DATA -- Solo lectura (alternativa: MODIFIES)
BEGIN
    DECLARE resultado tipo_retorno;

    -- Lógica
    SELECT COUNT(*) INTO resultado FROM empleados WHERE id_departamento = param;

    RETURN resultado;
END$$
DELIMITER ;

-- Usar
SELECT nombre, numero_hijos, calcular_descuento(numero_hijos) AS descuento
FROM empleados;
```

### Ejemplo 1: Función determinística simple

```sql
DELIMITER $$
CREATE FUNCTION calcular_antigüedad(fecha_contratacion DATE)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    RETURN YEAR(CURDATE()) - YEAR(fecha_contratacion);
END$$
DELIMITER ;

-- Usar
SELECT
    nombre,
    fecha_contratacion,
    calcular_antigüedad(fecha_contratacion) AS años
FROM empleados;
```

### Ejemplo 2: Función con lógica condicional

```sql
DELIMITER $$
CREATE FUNCTION categorizar_salario(salario DECIMAL(10,2))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE categoria VARCHAR(50);

    CASE
        WHEN salario >= 5000 THEN SET categoria = 'Ejecutivo';
        WHEN salario >= 3500 THEN SET categoria = 'Senior';
        WHEN salario >= 2500 THEN SET categoria = 'Mid-level';
        ELSE SET categoria = 'Junior';
    END CASE;

    RETURN categoria;
END$$
DELIMITER ;

-- Usar en WHERE
SELECT nombre, salario, categorizar_salario(salario) AS categoria
FROM empleados
WHERE categorizar_salario(salario) = 'Senior';
```

### Ejemplo 3: Función que retorna tabla

```sql
DELIMITER $$
CREATE FUNCTION obtener_empleados_depto(p_id_depto INT)
RETURNS TABLE (
    id_empleado INT,
    nombre VARCHAR(100),
    salario DECIMAL(10,2),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
)
READS SQL DATA
BEGIN
    RETURN SELECT id, nombre, salario
           FROM empleados
           WHERE id_departamento = p_id_depto;
END$$
DELIMITER ;

-- Usar
SELECT * FROM obtener_empleados_depto(1);
```

### Diferencias determinísticas

```sql
-- DETERMINISTIC: Mismo input = mismo output
CREATE FUNCTION calcular_impuesto(salario DECIMAL)
RETURNS DECIMAL
DETERMINISTIC
BEGIN
    RETURN salario * 0.20;
END;
-- El resultado es predecible y puede ser cacheado

-- NO DETERMINISTIC: Resultado varía
CREATE FUNCTION obtener_fecha_actual()
RETURNS DATE
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    RETURN CURDATE();
END;
-- Cada ejecución puede devolver fecha diferente
```

## Triggers

Un Trigger es un procedimiento almacenado que se ejecuta automáticamente al ocurrir un evento en una tabla.

### Sintaxis básica

```sql
DELIMITER $$
CREATE TRIGGER nombre_trigger
BEFORE|AFTER INSERT|UPDATE|DELETE  -- Cuándo y sobre qué evento
ON nombre_tabla
FOR EACH ROW  -- Por cada fila afectada
BEGIN
    -- NEW: Valores nuevos (INSERT/UPDATE)
    -- OLD: Valores antiguos (UPDATE/DELETE)

    -- Lógica
    IF NEW.salario < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Salario no puede ser negativo';
    END IF;
END$$
DELIMITER ;
```

### Tipos de Triggers

| Tipo | Evento | Disponible | NEW | OLD |
|------|--------|-----------|-----|-----|
| BEFORE INSERT | Antes de insertar | Sí | Sí | - |
| AFTER INSERT | Después de insertar | Sí | Sí | - |
| BEFORE UPDATE | Antes de actualizar | Sí | Sí | Sí |
| AFTER UPDATE | Después de actualizar | Sí | Sí | Sí |
| BEFORE DELETE | Antes de eliminar | Sí | - | Sí |
| AFTER DELETE | Después de eliminar | Sí | - | Sí |

### Ejemplo 1: Validación (BEFORE INSERT)

```sql
DELIMITER $$
CREATE TRIGGER validar_salario_empleado
BEFORE INSERT ON empleados
FOR EACH ROW
BEGIN
    IF NEW.salario < 1000 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Salario mínimo es 1000';
    END IF;

    IF NEW.id_departamento IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Departamento es obligatorio';
    END IF;

    -- Auto-asignar fecha de contratación si no viene
    IF NEW.fecha_contratacion IS NULL THEN
        SET NEW.fecha_contratacion = CURDATE();
    END IF;
END$$
DELIMITER ;

-- Probar
INSERT INTO empleados (nombre, salario, id_departamento)
VALUES ('Juan', 500, 1);  -- Error: salario < 1000

INSERT INTO empleados (nombre, salario, id_departamento)
VALUES ('Juan', 3000, 1);  -- Éxito, fecha_contratacion = CURDATE()
```

### Ejemplo 2: Auditoría (AFTER UPDATE)

```sql
-- Tabla para auditar cambios
CREATE TABLE auditoria_empleados (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_empleado INT NOT NULL,
    campo_modificado VARCHAR(100),
    valor_anterior VARCHAR(200),
    valor_nuevo VARCHAR(200),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(50)
);

-- Trigger que registra cambios
DELIMITER $$
CREATE TRIGGER auditar_cambios_empleados
AFTER UPDATE ON empleados
FOR EACH ROW
BEGIN
    IF OLD.nombre != NEW.nombre THEN
        INSERT INTO auditoria_empleados (id_empleado, campo_modificado, valor_anterior, valor_nuevo, usuario)
        VALUES (NEW.id, 'nombre', OLD.nombre, NEW.nombre, USER());
    END IF;

    IF OLD.salario != NEW.salario THEN
        INSERT INTO auditoria_empleados (id_empleado, campo_modificado, valor_anterior, valor_nuevo, usuario)
        VALUES (NEW.id, 'salario', CAST(OLD.salario AS CHAR), CAST(NEW.salario AS CHAR), USER());
    END IF;

    IF OLD.id_departamento != NEW.id_departamento THEN
        INSERT INTO auditoria_empleados (id_empleado, campo_modificado, valor_anterior, valor_nuevo, usuario)
        VALUES (NEW.id, 'id_departamento', CAST(OLD.id_departamento AS CHAR), CAST(NEW.id_departamento AS CHAR), USER());
    END IF;
END$$
DELIMITER ;

-- Usar
UPDATE empleados SET salario = 4500 WHERE id = 1;
-- Se registra automáticamente en auditoria_empleados
```

### Ejemplo 3: Cálculo automático (BEFORE INSERT/UPDATE)

```sql
-- Tabla de detalle de pedidos con cálculo automático
CREATE TABLE pedidos_detalle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2),  -- Calculado automáticamente
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
);

-- Trigger para calcular subtotal
DELIMITER $$
CREATE TRIGGER calcular_subtotal_pedido
BEFORE INSERT ON pedidos_detalle
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER actualizar_subtotal_pedido
BEFORE UPDATE ON pedidos_detalle
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
END$$
DELIMITER ;

-- Usar
INSERT INTO pedidos_detalle (id_pedido, id_producto, cantidad, precio_unitario)
VALUES (1, 101, 5, 100);
-- subtotal se calcula automáticamente: 500
```

### Ejemplo 4: Sistema completo de auditoría con triggers

```sql
-- Tabla maestra de auditoría
CREATE TABLE log_cambios (
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    tabla_afectada VARCHAR(100),
    operacion ENUM('INSERT','UPDATE','DELETE'),
    id_registro INT,
    usuario VARCHAR(50),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valores_cambio JSON
);

-- Triggers para todas las tablas principales
DELIMITER $$
CREATE TRIGGER log_insert_empleados
AFTER INSERT ON empleados
FOR EACH ROW
BEGIN
    INSERT INTO log_cambios (tabla_afectada, operacion, id_registro, usuario, valores_cambio)
    VALUES (
        'empleados',
        'INSERT',
        NEW.id,
        USER(),
        JSON_OBJECT(
            'id', NEW.id,
            'nombre', NEW.nombre,
            'salario', NEW.salario,
            'departamento', NEW.id_departamento
        )
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER log_delete_empleados
AFTER DELETE ON empleados
FOR EACH ROW
BEGIN
    INSERT INTO log_cambios (tabla_afectada, operacion, id_registro, usuario, valores_cambio)
    VALUES (
        'empleados',
        'DELETE',
        OLD.id,
        USER(),
        JSON_OBJECT(
            'id', OLD.id,
            'nombre', OLD.nombre,
            'salario', OLD.salario,
            'departamento', OLD.id_departamento
        )
    );
END$$
DELIMITER ;
```

## Comparativa: Procedures vs Functions vs Triggers

| Característica | Procedure | Function | Trigger |
|---|---|---|---|
| **Retorno** | OUT parámetros | RETURN valor | Ninguno |
| **Invocación** | CALL explícita | En SELECT | Automática |
| **Transacciones** | Múltiples, control explícito | Limitadas | Usa transacción del evento |
| **Rendimiento** | Bueno | Muy bueno | Puede ser lento si hay muchos |
| **Debugging** | Intermedio | Difícil en triggers | Muy difícil |
| **Uso típico** | Automatización, lógica compleja | Cálculos, valores derivados | Auditoría, validaciones |

## Problemas comunes y optimización

```sql
-- PROBLEMA: Triggers lentos (demasiadas filas afectadas)
-- SOLUCIÓN: Usar AFTER en lugar de BEFORE cuando sea posible
-- SOLUCIÓN: Minimizar lógica dentro del trigger

-- PROBLEMA: Triggers recursivos (A modifica B, B dispara trigger que modifica A)
-- SOLUCIÓN: SET GLOBAL innodb_autoinc_lock_mode = 0;

-- PROBLEMA: Deadlocks por triggers
-- SOLUCIÓN: Asegurar orden consistente en acceso a tablas

-- Ver triggers definidos
SHOW TRIGGERS;
SHOW TRIGGERS WHERE `Table` = 'empleados';

-- Eliminar trigger
DROP TRIGGER nombre_trigger;

-- Modificar trigger: Eliminar y recrear
DROP TRIGGER log_insert_empleados;
-- ... crear nuevo ...
```

## Ejercicio práctico integrado

```sql
-- Sistema completo: Procedimiento + Función + Triggers

-- 1. Tabla base
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    salario DECIMAL(10,2) NOT NULL,
    id_departamento INT,
    activo BOOLEAN DEFAULT 1,
    fecha_contratacion DATE DEFAULT CURRENT_DATE
);

-- 2. Función: Calcular bonus
DELIMITER $$
CREATE FUNCTION calcular_bonus(salario DECIMAL, antiguedad INT)
RETURNS DECIMAL
DETERMINISTIC
BEGIN
    DECLARE bonus DECIMAL;
    SET bonus = salario * (0.05 + (antiguedad * 0.01));
    RETURN ROUND(bonus, 2);
END$$
DELIMITER ;

-- 3. Procedimiento: Procesar bonificaciones
DELIMITER $$
CREATE PROCEDURE procesar_bonificaciones(IN p_id_depto INT)
BEGIN
    DECLARE v_total_bonificado DECIMAL DEFAULT 0;

    INSERT INTO bonificaciones (id_empleado, monto, fecha)
    SELECT
        id,
        calcular_bonus(salario, YEAR(CURDATE()) - YEAR(fecha_contratacion)),
        CURDATE()
    FROM empleados
    WHERE id_departamento = p_id_depto AND activo = 1;

    SELECT SUM(monto) INTO v_total_bonificado FROM bonificaciones WHERE fecha = CURDATE();

    SELECT v_total_bonificado AS total_bonificado;
END$$
DELIMITER ;

-- 4. Trigger: Auditoría
DELIMITER $$
CREATE TRIGGER auditar_insert_empleados
AFTER INSERT ON empleados
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_empleados (id_empleado, accion, fecha)
    VALUES (NEW.id, 'INSERT', CURDATE());
END$$
DELIMITER ;

-- Uso completo
CALL procesar_bonificaciones(1);
```

## Conclusión

Procedures, Functions y Triggers son herramientas poderosas para encapsular lógica en la base de datos. Su uso adecuado mejora seguridad, rendimiento y mantenibilidad, pero requiere cuidado en diseño y testing para evitar problemas de rendimiento y debugging.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

-- ─── Sistemas Operativos ────────────────────────────────────────
INSERT INTO theory_subjects (name, slug, description, icon, order_index)
VALUES ('Sistemas Operativos', 'sistemas-operativos', 'Linux, Windows Server, administración de usuarios, servicios, scripting y virtualización.', '💻', 3)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      order_index = EXCLUDED.order_index;

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'sistemas-operativos'),
  'Guía completa: Usuarios, Grupos y Permisos en Linux',
  'usuarios-grupos-permisos-linux',
  $MKDN$
# Guía completa: Usuarios, Grupos y Permisos en Linux

## Introducción

El sistema de control de acceso en Linux es fundamental para la seguridad del sistema operativo. Este modelo está basado en usuarios (UID), grupos (GID) y permisos que controlan quién puede hacer qué en el sistema. En esta guía exploraremos en profundidad cómo funciona este sistema y cómo gestionarlo de forma efectiva.

## Modelo de Usuarios en Linux

### UID y GID

Todo usuario en Linux tiene un identificador único llamado UID (User ID) y pertenece a uno o más grupos identificados por GID (Group ID). El sistema utiliza estos números internamente, aunque nosotros trabajamos con nombres para mayor legibilidad.

- **UID 0**: Reservado para el usuario `root` (administrador del sistema)
- **UID 1-99**: Típicamente para usuarios del sistema (servicios)
- **UID 100+**: Usuarios normales del sistema

```bash
# Ver el UID y GID actual
id
id usuario1

# Ver todos los usuarios y sus UIDs
getent passwd
```

### Estructura de /etc/passwd

El archivo `/etc/passwd` contiene la información básica de todos los usuarios del sistema. Aunque históricamente guardaba contraseñas, ahora solo contiene un marcador.

```
usuario:x:UID:GID:GECOS:HOME:SHELL
```

Ejemplo y explicación línea por línea:

```
root:x:0:0:root:/root:/bin/bash
juan:x:1000:1000:Juan García:/home/juan:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

- **usuario**: Nombre de login del usuario
- **x**: Marcador de contraseña (ahora en `/etc/shadow`)
- **UID**: Identificador numérico del usuario
- **GID**: Grupo primario del usuario
- **GECOS**: Información personal (nombre completo, teléfono, etc.)
- **HOME**: Directorio home del usuario
- **SHELL**: Shell por defecto del usuario

### Estructura de /etc/shadow

Almacena las contraseñas cifradas y política de contraseñas. Solo accesible por root.

```
usuario:contraseña_cifrada:última_cambio:mín_días:máx_días:días_aviso:días_inactividad:fecha_expiración
```

```bash
sudo cat /etc/shadow | grep juan
```

### Estructura de /etc/group

Define los grupos del sistema y sus miembros.

```
nombre_grupo:x:GID:lista_usuarios_secundarios
```

Ejemplo:

```
developers:x:1001:juan,maria,pedro
docker:x:999:juan,carlos
sudo:x:27:juan
```

- **nombre_grupo**: Nombre del grupo
- **x**: Marcador (históricamente contraseña de grupo)
- **GID**: Identificador del grupo
- **lista_usuarios**: Usuarios secundarios de este grupo (separados por comas)

## Gestión de Usuarios

### useradd - Crear un nuevo usuario

```bash
# Crear usuario básico
sudo useradd juan

# Crear usuario con opciones completas
sudo useradd -m -s /bin/bash -c "Juan García" -d /home/juan -G sudo,docker juan

# Crear usuario de sistema (sin home por defecto)
sudo useradd -r -s /usr/sbin/nologin nginx
```

Flags principales:

| Flag | Descripción |
|------|-------------|
| `-m` | Crear directorio home |
| `-s` | Especificar shell de login |
| `-c` | Comentario (GECOS) |
| `-d` | Directorio home personalizado |
| `-G` | Grupos secundarios (separados por comas) |
| `-g` | Grupo primario |
| `-r` | Crear usuario de sistema |
| `-u` | UID específico |
| `-e` | Fecha expiración (YYYY-MM-DD) |

### passwd - Establecer contraseña

```bash
# Cambiar contraseña del usuario actual
passwd

# Cambiar contraseña de otro usuario (como root)
sudo passwd juan

# Bloquear cuenta de usuario
sudo passwd -l juan

# Desbloquear cuenta
sudo passwd -u juan

# Generar contraseña aleatoria
openssl rand -base64 12 | sudo passwd juan --stdin
```

### usermod - Modificar usuario

```bash
# Añadir usuario a grupo secundario
sudo usermod -aG docker juan

# Cambiar shell
sudo usermod -s /bin/zsh juan

# Cambiar nombre de usuario
sudo usermod -l juan_nuevo juan

# Cambiar directorio home
sudo usermod -d /home/nuevo_juan -m juan_nuevo

# Cambiar UID
sudo usermod -u 2000 juan
```

### userdel - Eliminar usuario

```bash
# Eliminar usuario (mantiene archivos)
sudo userdel juan

# Eliminar usuario y su directorio home
sudo userdel -r juan

# Eliminar usuario y su directorio en /etc/skel
sudo userdel -r -f juan
```

## Gestión de Grupos

### groupadd - Crear grupo

```bash
# Crear grupo básico
sudo groupadd developers

# Crear grupo con GID específico
sudo groupadd -g 1500 web-admins

# Crear grupo de sistema
sudo groupadd -r mysql
```

### groupmod - Modificar grupo

```bash
# Cambiar nombre del grupo
sudo groupmod -n desarrolladores developers

# Cambiar GID
sudo groupmod -g 1502 web-admins
```

### groupdel - Eliminar grupo

```bash
# Eliminar grupo
sudo groupdel developers

# Nota: No se pueden eliminar grupos que sean grupo primario de algún usuario
```

## Sudo vs Su

### su - Cambiar Usuario

Cambia a otro usuario requiriendo su contraseña:

```bash
# Cambiar a root
su -

# Cambiar a otro usuario
su - juan

# Ejecutar comando como otro usuario
su - juan -c "whoami"
```

### sudo - Ejecutar como Superusuario

Ejecuta comandos con privilegios elevados sin cambiar de usuario:

```bash
# Ejecutar comando como root
sudo apt update

# Ver qué comandos puede ejecutar el usuario actual
sudo -l

# Ejecutar comando como usuario específico
sudo -u juan whoami

# Mantener privilegios por 15 minutos adicionales
sudo -v
```

**Diferencias principales:**

| Aspecto | su | sudo |
|--------|-----|------|
| Requiere | Contraseña del usuario destino | Contraseña del usuario actual |
| Cambio de usuario | Sí, cambia completamente | No, mantiene sesión actual |
| Auditoria | Mínima | Registra comandos ejecutados |
| Flexibilidad | Menos flexible | Muy flexible, granular |
| Riesgo | Mayor (contraseña compartida) | Menor (control individual) |

## Fichero /etc/sudoers

Define quién puede ejecutar qué comandos con privilegios sudo:

```bash
# Editar sudoers (SIEMPRE usar visudo)
sudo visudo

# Ver sin editar
sudo visudo -c
```

### Estructura y ejemplos

```
# Comentarios comienzan con #
# Sintaxis: usuario HOST = (usuario_ejecución) COMANDO

# Permitir a juan ejecutar cualquier comando sin contraseña
juan ALL=(ALL) NOPASSWD: ALL

# Permitir grupo developers ejecutar solo apt con contraseña
%developers ALL=(ALL) apt

# Permitir juan cambiar contraseña de otros usuarios
juan ALL=(ALL) /usr/bin/passwd [A-Za-z0-9_]*

# Múltiples comandos
%admins ALL=(ALL) /usr/sbin/useradd, /usr/sbin/userdel, /usr/sbin/usermod

# Sin contraseña
%docker ALL=(ALL) NOPASSWD: /usr/bin/docker

# Alias de usuarios
User_Alias DEVS = juan, maria, carlos

# Alias de comandos
Cmnd_Alias BACKUP = /usr/bin/rsync, /usr/sbin/dump, /usr/sbin/restore

# Usar alias
%DEVS ALL=(ALL) BACKUP
```

## Modelo de Permisos

### Permisos Básicos (rwx)

Cada archivo/directorio tiene tres tipos de permisos para tres categorías:

```
-rwxrwxrwx
 |||||||||
 ||||||||└─ Otros: ejecución (x)
 |||||||└── Otros: escritura (w)
 ||||||└─── Otros: lectura (r)
 |||||└──── Grupo: ejecución (x)
 ||||└───── Grupo: escritura (w)
 |||└────── Grupo: lectura (r)
 ||└─────── Propietario: ejecución (x)
 |└──────── Propietario: escritura (w)
 └───────── Propietario: lectura (r)
```

### Significado en Archivos

| Permiso | Archivo | Directorio |
|---------|---------|-----------|
| **r** (lectura) | Leer contenido | Listar contenido |
| **w** (escritura) | Modificar archivo | Crear/eliminar archivos |
| **x** (ejecución) | Ejecutar programa | Acceder dentro (cd) |

### Permisos Numéricos (Octal)

```
r (lectura)    = 4
w (escritura)  = 2
x (ejecución)  = 1

Ejemplos:
7 = rwx (4+2+1)
6 = rw- (4+2)
5 = r-x (4+1)
4 = r-- (4)
3 = -wx (2+1)
1 = --x (1)
0 = --- (0)
```

### chmod - Cambiar Permisos

**Modo simbólico:**

```bash
# Dar permiso ejecución al propietario
chmod u+x script.sh

# Quitar permisos de escritura al grupo
chmod g-w archivo.txt

# Dar lectura a todos
chmod a+r documento.txt

# Copiar permisos del propietario al grupo
chmod g=u archivo.txt

# Negar acceso a otros
chmod o= archivo.txt
```

**Modo octal:**

```bash
# 755: rwxr-xr-x (típico para ejecutables)
chmod 755 script.sh

# 644: rw-r--r-- (típico para archivos)
chmod 644 documento.txt

# 700: rwx------ (solo para propietario)
chmod 700 archivo_privado.txt

# 777: rwxrwxrwx (acceso total)
chmod 777 archivo.txt

# Aplicar recursivamente
chmod -R 755 /var/www/html
```

### chown - Cambiar Propietario

```bash
# Cambiar propietario
sudo chown juan archivo.txt

# Cambiar propietario y grupo
sudo chown juan:developers archivo.txt

# Cambiar solo grupo
sudo chown :developers archivo.txt

# Cambiar recursivamente
sudo chown -R juan:developers /home/juan
```

### chgrp - Cambiar Grupo

```bash
# Cambiar grupo
sudo chgrp developers archivo.txt

# Cambiar recursivamente
sudo chgrp -R developers /opt/proyecto
```

## Permisos Especiales

### SUID (Set User ID)

Ejecuta el archivo con permisos del propietario, no del usuario que lo ejecuta:

```
-rwsr-xr-x  (4755 en octal)
     ^
     Bit SUID
```

```bash
# Ejemplo real: /usr/bin/passwd
ls -l /usr/bin/passwd
-rwsr-xr-x 1 root root 68208 Nov  2  2023 /usr/bin/passwd

# Establecer SUID
chmod u+s script.sh
chmod 4755 script.sh

# Remover SUID
chmod u-s script.sh
```

**Riesgo**: Un script SUID mal escrito es un vector de ataque importante.

### SGID (Set Group ID)

Ejecuta el archivo con permisos del grupo propietario:

```
-rwxr-sr-x  (2755 en octal)
      ^
      Bit SGID
```

En directorios: Nuevos archivos heredan el grupo del directorio.

```bash
# Crear directorio con herencia SGID
mkdir proyecto
chmod g+s proyecto

# Establecer SGID
chmod g+s archivo.sh
chmod 2755 archivo.sh
```

### Sticky Bit

Impide que usuarios eliminen archivos ajenos en directorios compartidos:

```
drwxrwxrwt  (1777 en octal)
        ^
        Sticky bit
```

```bash
# Típicamente en /tmp
ls -ld /tmp
drwxrwxrwt 12 root root 4096 Mar 11 10:30 /tmp

# Establecer sticky bit
chmod o+t directorio/
chmod 1777 directorio/

# Remover
chmod o-t directorio/
```

## umask - Máscara de Permisos por Defecto

Define los permisos por defecto para nuevos archivos:

```bash
# Ver umask actual
umask

# Cambiar umask (octal)
umask 0022  # Permisos: 755 para directorios, 644 para archivos

# En ~/.bashrc o ~/.profile
umask 0027  # Más restrictivo: 750 para directorios, 640 para archivos

# Explicación
# umask 0022 significa:
# - Archivos: 666 - 022 = 644 (rw-r--r--)
# - Directorios: 777 - 022 = 755 (rwxr-xr-x)
```

## ACLs (Access Control Lists)

Permisos más granulares que el modelo rwx tradicional:

```bash
# Ver ACLs de archivo
getfacl archivo.txt

# Establecer ACL: usuario juan tiene lectura
setfacl -m u:juan:r archivo.txt

# Establecer ACL: grupo developers tiene lectura y escritura
setfacl -m g:developers:rw archivo.txt

# ACL por defecto en directorio (heredada por nuevos archivos)
setfacl -d -m u:juan:rwx directorio/
setfacl -d -m g:developers:rx directorio/

# Eliminar ACL específica
setfacl -x u:juan archivo.txt

# Eliminar todas las ACLs
setfacl -b archivo.txt

# Copiar ACLs de otro archivo
getfacl archivo_origen.txt | setfacl -b -M - archivo_destino.txt
```

## Escenarios Prácticos Comunes

### Web Server (Apache/Nginx)

| Componente | Propietario | Permisos | Razón |
|-----------|-------------|----------|-------|
| /var/www/html | root | 755 | root administra, www-data lee |
| Archivos PHP | www-data | 644 | www-data puede leer y ejecutar |
| Directorios subidos | www-data | 755 | www-data escribe, otros leen |
| Archivo configuración | root | 600 | Solo root lee credenciales |

```bash
# Configuración típica
sudo chown -R root:www-data /var/www/html
sudo chmod 755 /var/www/html
sudo find /var/www/html -type f -exec chmod 644 {} \;
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod 755 /var/www/html/uploads
```

### Directorio Compartido entre Usuarios

```bash
# Crear directorio compartido
sudo mkdir /opt/proyecto
sudo chgrp developers /opt/proyecto
sudo chmod 2770 /opt/proyecto  # SGID + rwx para owner y group

# Nuevos archivos en el directorio heredan grupo developers
# y tienen permisos rw-rw----
```

### Directorio Privado del Usuario

```bash
# Directorio home
chmod 700 /home/usuario

# Solo el usuario puede acceder
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Archivo de Configuración Sensible

```bash
# Base de datos, API keys, etc.
chmod 600 /etc/app/config.ini
sudo chown root:root /etc/app/config.ini
```

## Resumen de Comandos Esenciales

```bash
# Ver información del usuario
id
whoami
groups

# Crear/modificar/eliminar usuarios
sudo useradd -m -s /bin/bash usuario
sudo usermod -aG grupo usuario
sudo userdel -r usuario

# Gestionar grupos
sudo groupadd grupo
sudo groupmod -n nuevo_nombre grupo
sudo groupdel grupo

# Cambiar permisos
chmod 755 archivo
chmod u+s archivo  # SUID
chmod g+s directorio  # SGID
chmod o+t directorio  # Sticky bit

# Cambiar propietario/grupo
sudo chown usuario:grupo archivo
sudo chown -R usuario:grupo directorio

# ACLs
setfacl -m u:usuario:rx archivo
getfacl archivo

# Sudo
sudo -l
sudo -u usuario comando
sudo visudo  # Editar /etc/sudoers
```

## Conclusión

El sistema de usuarios, grupos y permisos en Linux es potente y flexible. Dominar estos conceptos es esencial para administrar sistemas Linux de forma segura y eficiente. Recuerda que la seguridad comienza con aplicar el principio de "menor privilegio": cada usuario y servicio debe tener exactamente los permisos necesarios para su función, ni más ni menos.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'sistemas-operativos'),
  'Guía completa: LVM y Gestión de Discos en Linux',
  'lvm-y-gestion-de-discos-linux',
  $MKDN$
# Guía completa: LVM y Gestión de Discos en Linux

## Introducción

La gestión de almacenamiento en Linux puede resultar compleja, especialmente cuando necesitas redimensionar volúmenes sin perder datos. LVM (Logical Volume Manager) proporciona una capa de abstracción entre el hardware de almacenamiento y el sistema de archivos, permitiendo una gestión flexible y dinámica. Esta guía cubre desde particiones básicas hasta LVM avanzado.

## Arquitectura de Discos Físicos

### Particiones y Tablas de Particiones

Un disco duro se divide en particiones, cada una actuando como un dispositivo independiente. Existen dos estándares:

**MBR (Master Boot Record):**
- Antiguo, compatible con BIOS
- Máximo 4 particiones primarias
- Tamaño máximo de partición: 2TB
- Sector de arranque en los primeros 512 bytes

**GPT (GUID Partition Table):**
- Moderno, para UEFI
- Ilimitadas particiones (teóricamente)
- Tamaño máximo de partición: 8ZB
- Redundancia de tabla de particiones

### Identificación de Discos

```bash
# Listar discos y particiones
lsblk
lsblk -a
lsblk -o NAME,SIZE,TYPE,FSTYPE

# Información detallada de discos
fdisk -l
sudo fdisk -l /dev/sda

# UUID de dispositivos
blkid

# Información de bloques
blockdev --getsize64 /dev/sda
```

## Herramientas de Particionamiento

### fdisk - Particiones MBR

```bash
# Abrir menú interactivo
sudo fdisk /dev/sda

# Comandos principales dentro de fdisk:
# n - Nueva partición
# d - Eliminar partición
# l - Listar tipos
# t - Cambiar tipo
# w - Escribir cambios
# q - Salir sin guardar

# Ejemplo completo:
sudo fdisk /dev/sda
# n, p, 1, enter, +5G, w
```

### gdisk - Particiones GPT

```bash
# Abrir menú interactivo para GPT
sudo gdisk /dev/sda

# Ver particiones existentes
sudo gdisk -l /dev/sda

# Ejemplo de creación de partición EFI:
sudo gdisk /dev/sda
# n, enter (último número + 1), 0, +512M, ef00 (EFI System), w
```

### parted - Herramienta moderna

```bash
# Modo línea de comandos
sudo parted /dev/sda print
sudo parted -l

# Crear partición
sudo parted /dev/sda mkpart primary ext4 0 100GB

# Redimensionar partición
sudo parted /dev/sda resizepart 1 50GB

# Modo interactivo
sudo parted /dev/sda
# Dentro: help, mkpart, print, quit
```

## Tipos de Sistemas de Archivos

| Filesystem | Máx. Tamaño | Características | Casos de Uso |
|-----------|----------|------------------|--------------|
| **ext4** | 16TB | Estable, confiable, journaling | Sistemas de propósito general |
| **xfs** | 8EB | Alto rendimiento, escalabilidad | Servidores, almacenamiento |
| **btrfs** | 16EB | Copy-on-write, snapshots, RAID | Sistemas modernos, virtuales |
| **ntfs** | 16EB | Compatible Windows | Interoperabilidad |
| **tmpfs** | RAM | En memoria | Cache temporal, /tmp |
| **ext3** | 16TB | Antiguo, journaling básico | Legado |

## Creación y Montaje de Filesystems

### mkfs - Crear Filesystem

```bash
# ext4
sudo mkfs.ext4 /dev/sda1
sudo mkfs.ext4 -L "datos" -m 1 /dev/sda1  # Label, 1% reservado

# xfs
sudo mkfs.xfs /dev/sda2

# btrfs
sudo mkfs.btrfs /dev/sda3

# Crear y ver progress
sudo mkfs.ext4 -F /dev/sda1

# Especificar tamaño de bloque (ext4)
sudo mkfs.ext4 -b 4096 /dev/sda1
```

### mount - Montar Filesystems

```bash
# Montar un filesystem
sudo mount /dev/sda1 /mnt/datos

# Montar con opciones
sudo mount -o rw,noexec,nosuid /dev/sda1 /mnt/datos

# Opciones comunes:
# ro - solo lectura
# rw - lectura/escritura
# noexec - no permitir ejecución
# nosuid - ignorar SUID/SGID
# nodev - ignorar dispositivos
# noatime - no actualizar atime

# Ver filesystems montados
mount
mount | grep /dev

# Ver espacio utilizado
df -h
df -h /mnt/datos
```

### umount - Desmontar Filesystems

```bash
# Desmontar
sudo umount /mnt/datos

# Forzar desmont si está ocupado
sudo umount -l /mnt/datos  # lazy umount

# Desmontar todos los NFS
sudo umount -a -t nfs

# Ver qué procesos usan el filesystem
lsof /mnt/datos
fuser -m /mnt/datos
```

## /etc/fstab - Montaje Automático

El archivo `/etc/fstab` define qué filesystems montar al inicio. Estructura (6 campos):

```
<dispositivo> <punto_montaje> <tipo> <opciones> <dump> <pass>
```

Ejemplo y explicación:

```
# Dispositivo         Punto Montaje  Tipo    Opciones                    Dump Pass
/dev/sda1            /              ext4    defaults,relatime           0    1
/dev/sda2            /boot          ext4    defaults                    0    2
UUID=1234-5678       /home          ext4    defaults,nodev,nosuid       0    2
/dev/sda3            /var           xfs     defaults                    0    2
/dev/mapper/vg0-lv0  /datos         ext4    defaults,nofail             0    3
tmpfs                /tmp           tmpfs   defaults,size=50%,nodev     0    0
/dev/sr0             /media/cdrom   iso9660 ro,user,noauto              0    0
192.168.1.10:/export /mnt/nfs       nfs     defaults,vers=4             0    0
```

**Explicación de campos:**

| Campo | Descripción | Ejemplos |
|-------|-------------|----------|
| **Dispositivo** | Disco a montar | /dev/sda1, UUID=..., /dev/mapper/... |
| **Punto montaje** | Dónde montar | /, /home, /var, /mnt/datos |
| **Tipo** | Filesystem | ext4, xfs, nfs, tmpfs |
| **Opciones** | Flags de montaje | defaults, ro, rw, noexec, nodev |
| **Dump** | Respaldo (dump) | 0=no, 1=sí |
| **Pass** | Orden fsck | 0=no, 1=root, 2=otros |

```bash
# Probar cambios en fstab antes de montar
sudo mount -a

# Montar un entry específico
sudo mount /home

# Ver UUIDs
blkid
ls -l /dev/disk/by-uuid/

# Crear fstab para nuevo sistema
genfstab -U /mnt >> /mnt/etc/fstab
```

## LVM - Logical Volume Manager

### Conceptos Fundamentales

LVM introduce una capa de abstracción entre el hardware y los filesystems:

```
Discos físicos (/dev/sda, /dev/sdb)
        ↓
Physical Volumes (PV) (/dev/sda1, /dev/sdb1)
        ↓
Volume Groups (VG) (vg0, vg1)
        ↓
Logical Volumes (LV) (lv_root, lv_home, lv_data)
        ↓
Filesystems (ext4, xfs, etc.)
```

**PV (Physical Volume):** Partición que participa en LVM
**VG (Volume Group):** Conjunto de PVs que actúan como un pool de almacenamiento
**LV (Logical Volume):** Volumen lógico dentro de un VG, equivalente a una partición

### Crear LVM desde Cero

```bash
# 1. Crear Physical Volumes
sudo pvcreate /dev/sda1 /dev/sdb1
sudo pvs  # Ver PVs
sudo pvdisplay

# 2. Crear Volume Group
sudo vgcreate vg0 /dev/sda1 /dev/sdb1
sudo vgs  # Ver VGs
sudo vgdisplay vg0

# 3. Crear Logical Volumes
sudo lvcreate -L 10G -n lv_root vg0
sudo lvcreate -L 50G -n lv_home vg0
sudo lvcreate -l 100%FREE -n lv_data vg0  # Usar todo el espacio restante

# 4. Crear filesystems
sudo mkfs.ext4 /dev/vg0/lv_root
sudo mkfs.ext4 /dev/vg0/lv_home

# 5. Montar
sudo mount /dev/vg0/lv_root /mnt/root
sudo mount /dev/vg0/lv_home /mnt/home

# 6. Agregar a fstab
echo "/dev/vg0/lv_root /root ext4 defaults 0 2" | sudo tee -a /etc/fstab
echo "/dev/vg0/lv_home /home ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

### Extender Logical Volumes

**Sin redimensionar filesystem (cuidado):**

```bash
# Expandir LV
sudo lvextend -L +10G /dev/vg0/lv_home
sudo lvextend -l +100 /dev/vg0/lv_home  # +100 extents
sudo lvextend -l +100%FREE /dev/vg0/lv_home  # Todo espacio libre
```

**Redimensionar filesystem:**

```bash
# ext4
sudo resize2fs /dev/vg0/lv_home

# xfs
sudo xfs_growfs /home  # Usar punto de montaje, no dispositivo

# btrfs
sudo btrfs filesystem resize max /home
```

**Versión combinada (lo más seguro):**

```bash
# Hacer ambas cosas en una línea
sudo lvextend -L +10G -r /dev/vg0/lv_home
# El flag -r redimensiona automáticamente el filesystem
```

### Reducir Logical Volumes

**PELIGRO:** Reducción incorrecta causa pérdida de datos. Siempre hacer backup.

```bash
# 1. Crear backup
sudo tar czf /backup/lv_home.tar.gz /home

# 2. Desmontar
sudo umount /home

# 3. Verificar y reparar filesystem
sudo e2fsck -f /dev/vg0/lv_home

# 4. Reducir filesystem primero (IMPORTANTE)
sudo resize2fs /dev/vg0/lv_home 40G

# 5. Reducir LV
sudo lvreduce -L 40G /dev/vg0/lv_home

# 6. Remontar y verificar
sudo mount /dev/vg0/lv_home /home
df -h /home
```

### Snapshots de LVM

Copias puntuales del LV para backup o testing:

```bash
# Crear snapshot
sudo lvcreate -L 5G -s -n lv_home_snap /dev/vg0/lv_home

# Montar snapshot
sudo mkdir /mnt/snapshot
sudo mount /dev/vg0/lv_home_snap /mnt/snapshot

# Hacer cambios en el volumen sin afectar snapshot
# El snapshot captura los bloques modificados

# Eliminar snapshot
sudo umount /mnt/snapshot
sudo lvremove /dev/vg0/lv_home_snap
```

### Agregar espacio a Volume Group

```bash
# Crear nuevo PV
sudo pvcreate /dev/sdc1

# Agregar al VG existente
sudo vgextend vg0 /dev/sdc1

# Ver espacio disponible
sudo vgdisplay vg0

# Expandir LV con el nuevo espacio
sudo lvextend -L +20G -r /dev/vg0/lv_home
```

## RAID - Redundant Array of Independent Disks

Combina múltiples discos para redundancia y/o rendimiento.

| Nivel | Discos | Capacidad | Redundancia | Rendimiento | Casos de Uso |
|-------|--------|-----------|-------------|-------------|--------------|
| **0** | 2+ | 100% | No | Excelente | Datos temporales, cachés |
| **1** | 2 | 50% | Espejo | Bueno | Datos críticos, SO |
| **5** | 3+ | (n-1)/n | 1 disco | Muy bueno | Almacenamiento general |
| **6** | 4+ | (n-2)/n | 2 discos | Bueno | Almacenamiento grande |
| **10** | 4+ | 50% | 1 por grupo | Excelente | Aplicaciones críticas |

### Software RAID con mdadm

```bash
# Instalar mdadm
sudo apt install mdadm

# Crear RAID 1 (espejo)
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sda1 /dev/sdb1

# RAID 5 con 3 discos
sudo mdadm --create /dev/md0 --level=5 --raid-devices=3 /dev/sda1 /dev/sdb1 /dev/sdc1

# Ver estado RAID
sudo mdadm --query /dev/md0
sudo cat /proc/mdstat

# Agregar disco de repuesto
sudo mdadm --add /dev/md0 /dev/sdd1

# Remover disco fallido
sudo mdadm --fail /dev/md0 /dev/sda1
sudo mdadm --remove /dev/md0 /dev/sda1

# Monitorear RAID
sudo mdadm --monitor /dev/md0

# Reemplazar disco
sudo mdadm --manage --fail /dev/md0 /dev/sda1
sudo mdadm --manage --remove /dev/md0 /dev/sda1
# Reemplazar disco físico
sudo mdadm --add /dev/md0 /dev/sde1
```

## Monitoreo de Discos

### df - Espacio en Disco

```bash
# Espacio en filesystems montados
df
df -h  # Formato legible
df -h /home

# Ver inodos
df -i

# Excluir tipos
df -h --exclude-type=tmpfs --exclude-type=devtmpfs
```

### du - Uso de Disco

```bash
# Tamaño total de directorio
du -sh /home

# Top 10 directorios más grandes
du -sh /home/* | sort -h | tail -10

# Profundidad de escaneo
du -h --max-depth=1 /home

# Ver archivos más grandes
find /home -type f -exec du -h {} + | sort -h | tail -20
```

### lsblk - Estructura de Bloques

```bash
# Ver jerarquía de discos
lsblk

# Con información adicional
lsblk -a  # Incluyendo dispositivos virtuales
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT
```

### blkid - Identificadores de Bloques

```bash
# Ver UUIDs y tipos
blkid
sudo blkid /dev/sda1

# Escanear para encontrar filesystems
sudo blkid -c /dev/null -s UUID
```

### Alertas de Espacio

```bash
# Crear alerta si espacio < 10%
df -h | awk '$5 >= 90 {print "Alerta: " $6 " está al " $5 " de capacidad"}'

# Script de monitoreo
#!/bin/bash
LIMIT=80
df -H | grep -vE '^Filesystem|tmpfs|cdrom' | awk '{ print $5 " " $1 }' | while read output;
do
  usage=$(echo $output | awk '{ print $1}' | cut -d'%' -f1)
  partition=$(echo $output | awk '{ print $2 }')
  if [ $usage -ge $LIMIT ]; then
    echo "Alerta: $partition al $usage%"
  fi
done
```

## Resumen de Comandos Esenciales

```bash
# Discos y particiones
lsblk
sudo fdisk -l
blkid
sudo parted /dev/sda print

# Filesystem
sudo mkfs.ext4 /dev/sda1
sudo mount /dev/sda1 /mnt/datos
sudo umount /mnt/datos

# LVM
sudo pvcreate /dev/sda1
sudo vgcreate vg0 /dev/sda1
sudo lvcreate -L 10G -n lv_root vg0
sudo lvextend -L +10G -r /dev/vg0/lv_root

# Monitoreo
df -h
du -sh /directorio
sudo mdadm --query /dev/md0
cat /proc/mdstat

# Información
sudo dumpe2fs /dev/sda1 | grep -i label
sudo tune2fs -l /dev/sda1
```

## Conclusión

La gestión correcta de almacenamiento es crítica para la estabilidad del sistema. LVM proporciona la flexibilidad para cambiar la configuración sin interrupciones, mientras que RAID garantiza redundancia. Combina estas herramientas con estrategias de backup sólidas para un sistema resiliente.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'sistemas-operativos'),
  'Guía completa: Bash Scripting desde Cero',
  'bash-scripting-desde-cero',
  $MKDN$
# Guía completa: Bash Scripting desde Cero

## Introducción

Bash (Bourne Again Shell) es el shell estándar en la mayoría de sistemas Linux. El scripting en Bash permite automatizar tareas repetitivas, gestionar sistemas y crear herramientas poderosas. Esta guía te llevará desde los conceptos básicos hasta scripts complejos.

## Por Qué Usar Shell Scripting

**Ventajas:**
- Automatización de tareas administrativas
- Procesamiento rápido de archivos y comandos
- Integración con utilidades Unix (grep, sed, awk, etc.)
- No requiere compilación
- Disponible en cualquier sistema Unix/Linux

**Casos de uso:**
- Scripts de backup y mantenimiento
- Monitoreo de sistemas
- Procesamiento de logs
- Despliegue de aplicaciones
- Administración de usuarios y recursos

## Crear y Ejecutar tu Primer Script

### Shebang - La Línea Mágica

Todo script bash debe comenzar con el shebang:

```bash
#!/bin/bash
```

Esta línea le dice al sistema que ejecute el archivo con `/bin/bash`.

### Hacer Ejecutable un Script

```bash
# Crear archivo
cat > myscript.sh << 'EOF'
#!/bin/bash
echo "Hola mundo"
EOF

# Hacer ejecutable
chmod +x myscript.sh

# Ejecutar
./myscript.sh
```

### Ejecutar sin Hacerlo Ejecutable

```bash
bash myscript.sh
source myscript.sh
. myscript.sh  # En el shell actual
```

## Variables

### Declaración y Asignación

```bash
# Declarar variable
nombre="Juan"
edad=30
ciudad='Madrid'  # Comillas simples = literal

# Variables especiales
RUTA_HOME=$HOME
USUARIO_ACTUAL=$USER
HOY=$(date +%Y-%m-%d)

# Espacios alrededor del = causan error
nombre = "Juan"  # ERROR
nombre="Juan"    # Correcto
```

### Lectura de Variables

```bash
echo $nombre
echo ${nombre}  # Notación extendida (recomendada)
echo "${nombre} vive en ${ciudad}"

# Variables sin asignar son vacías
echo "Valor: $variable_inexistente"  # Imprime: Valor:
```

### Variables de Solo Lectura

```bash
declare -r CONSTANTE="valor"
CONSTANTE="otro"  # ERROR: variable de solo lectura

readonly PI=3.14159
```

## Variables Especiales

| Variable | Descripción |
|----------|-------------|
| `$0` | Nombre del script |
| `$1-$9` | Primer a noveno argumento |
| `${10}` | Décimo o posterior argumento |
| `$#` | Número de argumentos |
| `$@` | Todos los argumentos (como array) |
| `$*` | Todos los argumentos (como string) |
| `$?` | Código de salida del último comando |
| `$$` | PID del script actual |
| `$!` | PID del último proceso en background |
| `$-` | Flags de shell activos |

### Ejemplo de Argumentos

```bash
#!/bin/bash
echo "Script: $0"
echo "Primer arg: $1"
echo "Segundo arg: $2"
echo "Total de args: $#"
echo "Todos los args: $@"

for arg in "$@"; do
    echo "- $arg"
done
```

```bash
$ ./myscript.sh arg1 arg2 arg3
Script: ./myscript.sh
Primer arg: arg1
Segundo arg: arg2
Total de args: 3
Todos los args: arg1 arg2 arg3
- arg1
- arg2
- arg3
```

## Sustitución de Comandos

Ejecutar un comando y usar su output como valor:

```bash
# Sintaxis moderna (recomendada)
fecha=$(date)
usuario=$(whoami)
archivos=$(ls -1 *.txt | wc -l)

# Sintaxis antigua (backticks)
fecha=`date`
usuario=`whoami`

# Combinación con strings
echo "Tienes $archivos archivos de texto"

# Múltiples líneas
listado=$(
    find /home -type f -name "*.log" 2>/dev/null | \
    head -10
)
```

## Aritmética

### Comando let

```bash
a=5
b=3

let suma=$a+$b
let resta=$a-$b
let mult=$a*$b
let div=$a/$b
let resto=$a%$b

echo "Suma: $suma"  # 8
```

### Comando expr

```bash
suma=$(expr 5 + 3)      # 8
resta=$(expr 10 - 4)    # 6
mult=$(expr 3 \* 4)     # 12 (necesita escape)

# Para comparación
expr 5 \> 3 && echo "5 es mayor que 3"
```

### Expansión Aritmética $((...))

```bash
# Sintaxis moderna (recomendada)
suma=$((5 + 3))
mult=$((4 * 6))
resto=$((17 % 5))
potencia=$((2 ** 8))  # 256

# Incremento/decremento
contador=10
((contador++))
((contador--))
((contador += 5))

echo $contador  # 15
```

## Operaciones con Strings

```bash
str1="Hola"
str2="Mundo"

# Concatenación
resultado="$str1 $str2"
resultado=${str1}${str2}

# Longitud
length=${#str1}  # 4

# Substring
cadena="abcdefgh"
sub=${cadena:2:4}  # cdgh (desde posición 2, 4 caracteres)
sub=${cadena:3}    # defgh (desde posición 3 al final)

# Reemplazar
cadena="hello world"
echo ${cadena/world/universe}  # hello universe
echo ${cadena/o/O}              # hellO world (primera)
echo ${cadena//o/O}             # hellO wOrld (todas)

# Convertir a mayúsculas/minúsculas (Bash 4+)
echo ${cadena^^}  # HELLO WORLD
echo ${cadena,,}  # hello world

# Remover prefijo/sufijo
ruta="/home/usuario/archivo.txt"
echo ${ruta#*/}              # home/usuario/archivo.txt
echo ${ruta##*/}             # archivo.txt
echo ${ruta%/*}              # /home/usuario
echo ${ruta%%/*}             # (vacío)
```

## Lectura de Input

### Comando read

```bash
# Lectura simple
read nombre
echo "Hola $nombre"

# Con prompt
read -p "¿Tu nombre?: " nombre

# Sin mostrar lo que escribes
read -sp "Contraseña: " password

# Con timeout
read -t 5 -p "Responde en 5 segundos: " respuesta

# Leer múltiples variables
read nombre edad ciudad
# Entrada: Juan 30 Madrid
echo "$nombre tiene $edad años y vive en $ciudad"

# Leer línea completa
read -r linea  # -r no interpreta backslashes
```

## Condicionales

### if / elif / else

```bash
# Forma básica
if [ $edad -ge 18 ]; then
    echo "Eres mayor de edad"
else
    echo "Eres menor de edad"
fi

# Con elif
if [ $edad -lt 13 ]; then
    echo "Eres un niño"
elif [ $edad -lt 18 ]; then
    echo "Eres un adolescente"
else
    echo "Eres un adulto"
fi

# Múltiples condiciones
if [ $edad -ge 18 ] && [ -f "$archivo" ]; then
    echo "Mayor de edad y archivo existe"
fi

if [ $edad -lt 13 ] || [ $edad -gt 65 ]; then
    echo "Descuento disponible"
fi
```

### Operadores de Comparación

**Números:**

```bash
[ $a -eq $b ]   # igual
[ $a -ne $b ]   # no igual
[ $a -lt $b ]   # menor que
[ $a -le $b ]   # menor o igual
[ $a -gt $b ]   # mayor que
[ $a -ge $b ]   # mayor o igual
```

**Strings:**

```bash
[ "$str1" = "$str2" ]    # igual
[ "$str1" != "$str2" ]   # no igual
[ -z "$str" ]            # vacío
[ -n "$str" ]            # no vacío
[[ $str =~ patron ]]     # expresión regular (Bash 3.2+)
```

**Archivos:**

```bash
[ -e "$archivo" ]   # existe
[ -f "$archivo" ]   # es archivo regular
[ -d "$ruta" ]      # es directorio
[ -r "$archivo" ]   # legible
[ -w "$archivo" ]   # escribible
[ -x "$archivo" ]   # ejecutable
[ -s "$archivo" ]   # tamaño > 0
[ -L "$archivo" ]   # es enlace simbólico
```

**Lógicos:**

```bash
[ $a -lt 10 ] && [ $b -gt 5 ]   # AND
[ $a -lt 10 ] || [ $b -gt 5 ]   # OR
[ ! -f "$archivo" ]              # NOT
```

### case Statement

```bash
#!/bin/bash
read -p "¿Qué versión de Ubuntu prefieres? " version

case "$version" in
    20.04)
        echo "Focal Fossa - LTS"
        ;;
    22.04)
        echo "Jammy Jellyfish - LTS"
        ;;
    23.10)
        echo "Mantic Minotaur"
        ;;
    *)
        echo "Versión desconocida"
        ;;
esac
```

## Bucles

### for Loop

```bash
# Sobre lista explícita
for fruta in manzana plátano naranja; do
    echo "Me gusta $fruta"
done

# Sobre rango
for i in {1..5}; do
    echo "Número: $i"
done

# Sobre archivos
for archivo in *.txt; do
    echo "Procesando: $archivo"
    cat "$archivo"
done

# Estilo C
for ((i=1; i<=10; i++)); do
    echo "Iteración $i"
done

# Sobre output de comando
for usuario in $(cat /etc/passwd | cut -d: -f1); do
    echo "Usuario: $usuario"
done

# Sobre array
array=("a" "b" "c")
for elemento in "${array[@]}"; do
    echo "$elemento"
done
```

### while Loop

```bash
# Básico
contador=1
while [ $contador -le 5 ]; do
    echo "Contador: $contador"
    ((contador++))
done

# Lectura de líneas de archivo
while IFS= read -r linea; do
    echo "Línea: $linea"
done < archivo.txt

# Lectura de input
while true; do
    read -p "Escribe algo (o 'salir'): " entrada
    if [ "$entrada" = "salir" ]; then
        break
    fi
    echo "Escribiste: $entrada"
done
```

### until Loop

```bash
# Opuesto al while: ejecuta mientras la condición sea false
contador=1
until [ $contador -gt 5 ]; do
    echo "Contador: $contador"
    ((contador++))
done
```

## Funciones

### Definición Básica

```bash
#!/bin/bash

# Definir función
saludar() {
    echo "Hola, $1"
}

# Usar función
saludar Juan
saludar María

# Función con múltiples parámetros
sumar() {
    local resultado=$((($1 + $2)))
    echo $resultado
}

suma=$(sumar 5 3)
echo "5 + 3 = $suma"
```

### Variables Locales

```bash
variable_global="global"

mi_funcion() {
    local variable_local="local"
    variable_global="modificada"

    echo "Local: $variable_local"
    echo "Global: $variable_global"
}

mi_funcion
echo "Global fuera: $variable_global"
```

### Valores de Retorno

```bash
# return devuelve código de salida (0-255)
es_numero() {
    if [[ $1 =~ ^[0-9]+$ ]]; then
        return 0  # true
    else
        return 1  # false
    fi
}

# Usar
if es_numero "123"; then
    echo "Es un número"
fi

# Obtener output de función
obtener_fecha() {
    date +%Y-%m-%d
}

fecha=$(obtener_fecha)
echo "Hoy es: $fecha"
```

## Arrays

```bash
# Declarar array
numeros=(1 2 3 4 5)
nombres=("Juan" "María" "Pedro")

# Elemento específico
echo ${numeros[0]}      # 1
echo ${nombres[2]}      # Pedro

# Todos los elementos
echo ${numeros[@]}      # 1 2 3 4 5
echo "${numeros[*]}"    # 1 2 3 4 5

# Longitud
echo ${#numeros[@]}     # 5

# Agregar elemento
numeros+=(6 7)

# Iterar
for num in "${numeros[@]}"; do
    echo $num
done

# Array asociativo (diccionario)
declare -A usuario
usuario[nombre]="Juan"
usuario[edad]="30"
usuario[ciudad]="Madrid"

echo ${usuario[nombre]}
for clave in "${!usuario[@]}"; do
    echo "$clave: ${usuario[$clave]}"
done
```

## Here Documents y Here Strings

```bash
# Here document - múltiples líneas
cat << EOF
Línea 1
Línea 2 con variable: $HOME
Línea 3
EOF

# Sin expansión de variables
cat << 'EOF'
Esto no expande $HOME
EOF

# Here string - una línea
cat <<< "Contenido de una línea"

# Guardar en variable
contenido=$(cat << EOF
Línea 1
Línea 2
EOF
)
```

## Redirección

### Redirección de Output

```bash
# Sobrescribir archivo
echo "Contenido" > archivo.txt

# Agregar al final
echo "Más contenido" >> archivo.txt

# Enviar a múltiples destinos
echo "Hola" | tee archivo.txt /dev/stdout

# Redirigir stderr
comando 2> errores.log

# Redirigir ambos (stdout y stderr)
comando > salida.txt 2>&1
comando &> salida.txt  # Sintaxis moderna
```

### Redirección de Input

```bash
# Usar archivo como input
sort < numeros.txt

# Múltiples inputs
diff < (cat archivo1.txt) < (cat archivo2.txt)
```

### Pipes

```bash
# Encadenar comandos
cat archivo.txt | grep "patrón" | sort | uniq | wc -l

# Pipeline complejo
find /home -type f -name "*.log" | \
    xargs grep "ERROR" | \
    cut -d: -f1 | \
    sort | uniq -c | \
    sort -rn
```

## Scripts Prácticos

### Script de Backup

```bash
#!/bin/bash

# Variables
CARPETA_ORIGEN="/home/usuario/documentos"
CARPETA_BACKUP="/backups"
FECHA=$(date +%Y%m%d_%H%M%S)
NOMBRE_BACKUP="backup_$FECHA.tar.gz"

# Validaciones
if [ ! -d "$CARPETA_ORIGEN" ]; then
    echo "Error: Carpeta origen no existe"
    exit 1
fi

if [ ! -d "$CARPETA_BACKUP" ]; then
    mkdir -p "$CARPETA_BACKUP"
fi

# Crear backup
echo "Creando backup..."
tar czf "$CARPETA_BACKUP/$NOMBRE_BACKUP" "$CARPETA_ORIGEN" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Backup completado: $NOMBRE_BACKUP"
    ls -lh "$CARPETA_BACKUP/$NOMBRE_BACKUP"
else
    echo "Error al crear backup"
    exit 1
fi

# Limpiar backups antiguos (mantener últimos 7)
echo "Limpiando backups antiguos..."
cd "$CARPETA_BACKUP"
ls -t | tail -n +8 | xargs -r rm
```

### Analizador de Logs

```bash
#!/bin/bash

ARCHIVO_LOG="/var/log/syslog"
PATRON="${1:-ERROR}"

if [ ! -f "$ARCHIVO_LOG" ]; then
    echo "Archivo no encontrado: $ARCHIVO_LOG"
    exit 1
fi

echo "Buscando: $PATRON en $ARCHIVO_LOG"
echo "---"

# Contar ocurrencias
total=$(grep -c "$PATRON" "$ARCHIVO_LOG")
echo "Total de ocurrencias: $total"
echo ""

# Últimas 10
echo "Últimas 10 líneas:"
grep "$PATRON" "$ARCHIVO_LOG" | tail -10

# Estadísticas por hora
echo ""
echo "Distribución por hora:"
grep "$PATRON" "$ARCHIVO_LOG" | \
    awk '{print $1 " " $2}' | \
    cut -d: -f1 | \
    sort | uniq -c | sort -rn
```

### Verificación de Salud del Sistema

```bash
#!/bin/bash

echo "=== Reporte de Salud del Sistema ==="
echo ""

# Información del sistema
echo "--- Sistema ---"
uname -a
echo ""

# Uso de CPU
echo "--- CPU ---"
nproc
top -bn1 | head -3
echo ""

# Memoria
echo "--- Memoria ---"
free -h
echo ""

# Disco
echo "--- Disco ---"
df -h | grep -E "^/dev"
echo ""

# Procesos principales
echo "--- Top 5 Procesos ---"
ps aux --sort=-%cpu | head -6
echo ""

# Red
echo "--- Red ---"
ip addr show | grep "inet "
echo ""

# Servicios críticos
echo "--- Servicios ---"
for servicio in ssh apache2 mysql; do
    if systemctl is-active --quiet $servicio; then
        echo "✓ $servicio activo"
    else
        echo "✗ $servicio inactivo"
    fi
done
```

## Manejo de Errores

```bash
#!/bin/bash
set -e          # Salir si hay error
set -u          # Error si variable no existe
set -o pipefail # Error si un pipe falla

# Trap para limpiar
trap 'echo "Error en línea $LINENO"; exit 1' ERR

# Trap para salida
trap 'echo "Script interrumpido"; rm -f /tmp/tempfile' EXIT

# Manejo manual
comando || {
    echo "Error: comando falló"
    exit 1
}

# Verificar $?
comando
if [ $? -ne 0 ]; then
    echo "El comando falló"
    exit 1
fi
```

## Conclusión

Bash scripting es una habilidad esencial para cualquier administrador de sistemas. Comenzando con variables simples y condicionales, puedes evolucionar hacia scripts complejos que automatizan tareas críticas. La práctica constante y el estudio de scripts existentes acelera tu aprendizaje.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'sistemas-operativos'),
  'Guía completa: Active Directory y GPOs en Windows Server',
  'active-directory-y-gpos',
  $MKDN$
# Guía completa: Active Directory y GPOs en Windows Server

## Introducción

Active Directory (AD) es el servicio de directorio central en infraestructuras Windows empresariales. Gestiona usuarios, computadoras, grupos y recursos en redes corporativas. Las Group Policy Objects (GPO) permiten administrar configuraciones de equipos y usuarios de forma centralizada. Esta guía cubre desde conceptos fundamentales hasta implementación práctica.

## Conceptos Fundamentales de Active Directory

### Estructura Jerárquica

Active Directory organiza los recursos en una estructura jerárquica:

```
Bosque (Forest)
├── Árbol (Tree)
│   ├── Dominio (Domain)
│   │   ├── Unidad Organizativa (OU)
│   │   │   ├── Usuarios (Users)
│   │   │   ├── Computadoras (Computers)
│   │   │   └── Grupos (Groups)
│   │   └── OU
│   └── Dominio
└── Árbol
```

**Componentes clave:**

- **Bosque**: Nivel superior, límite de seguridad
- **Árbol**: Dominios en estructura jerárquica con espacio de nombres contiguo
- **Dominio**: Unidad administrativa principal (ej: empresa.com)
- **OU**: Contenedores para organizar usuarios, máquinas y recursos
- **DC (Domain Controller)**: Servidor que mantiene la base de datos AD
- **DNS**: Servicio crítico para localizar DCs

### Instalación de AD DS

```powershell
# En Windows Server, usando PowerShell (con privilegios elevados)

# 1. Instalar el rol AD DS
Install-WindowsFeature -Name AD-Domain-Services, DNS -IncludeManagementTools

# 2. Crear primer dominio
Install-ADDSForest -DomainName "empresa.local" `
    -DomainNetbiosName "EMPRESA" `
    -ForestMode WinThreshold `
    -DomainMode WinThreshold `
    -InstallDns:$true `
    -NoRebootOnCompletion:$false

# 3. Verificar instalación
Get-ADDomain
```

### Unir Equipo al Dominio

```powershell
# En Windows Client/Server

# Cambiar nombre del equipo (opcional)
Rename-Computer -NewName "PC-JUAN-01"

# Unirse al dominio
Add-Computer -DomainName "empresa.local" -Restart

# O vía GUI: Configuración > Acerca de > Cambiar > Dominio
```

## Administración de Objetos AD

### Usuarios

#### Crear Usuario

```powershell
# Crear usuario básico
New-ADUser -Name "Juan García" `
    -SamAccountName "juan.garcia" `
    -UserPrincipalName "juan.garcia@empresa.local" `
    -Path "CN=Users,DC=empresa,DC=local" `
    -Enabled $false `
    -PasswordNeverExpires $false

# Crear usuario con todas las opciones
New-ADUser -Name "Juan García" `
    -SamAccountName "juan.garcia" `
    -GivenName "Juan" `
    -Surname "García" `
    -UserPrincipalName "juan.garcia@empresa.local" `
    -EmailAddress "juan.garcia@empresa.local" `
    -Path "OU=Vendedores,OU=Empresa,DC=empresa,DC=local" `
    -Company "Empresa S.A." `
    -Department "Ventas" `
    -Title "Vendedor Senior" `
    -Office "Madrid" `
    -Telephone "+34 91 123 4567" `
    -MobilePhone "+34 666 777 888" `
    -OfficePhone "+34 91 987 6543" `
    -PostalCode "28001" `
    -City "Madrid" `
    -State "Madrid" `
    -StreetAddress "Calle Principal 123" `
    -Enabled $true `
    -PasswordNeverExpires $false `
    -ChangePasswordAtLogon $true

# Establecer contraseña
Set-ADAccountPassword -Identity "juan.garcia" `
    -NewPassword (ConvertTo-SecureString -AsPlainText "P@ssw0rd123!" -Force) `
    -Reset

# Habilitar usuario
Enable-ADAccount -Identity "juan.garcia"
```

#### Consultar Usuarios

```powershell
# Obtener usuario específico
Get-ADUser -Identity "juan.garcia"

# Obtener usuario con propiedades específicas
Get-ADUser -Identity "juan.garcia" -Properties EmailAddress, Department, Title, Manager

# Listar todos los usuarios de un OU
Get-ADUser -Filter * -SearchBase "OU=Vendedores,OU=Empresa,DC=empresa,DC=local"

# Buscar usuarios por criterios
Get-ADUser -Filter {Department -eq "Ventas"}
Get-ADUser -Filter {City -eq "Madrid"}
Get-ADUser -Filter {Enabled -eq $true}

# Usuarios inactivos (no han iniciado sesión en 90 días)
$fecha = (Get-Date).AddDays(-90)
Get-ADUser -Filter {LastLogonTimeStamp -lt $fecha} -Properties LastLogonTimeStamp
```

#### Modificar Usuarios

```powershell
# Cambiar propiedades
Set-ADUser -Identity "juan.garcia" `
    -Title "Jefe de Ventas" `
    -Department "Dirección Comercial" `
    -City "Barcelona" `
    -EmailAddress "juan.garcia@empresa.local"

# Cambiar manager
Set-ADUser -Identity "juan.garcia" -Manager "maria.lopez"

# Cambiar contraseña
Set-ADAccountPassword -Identity "juan.garcia" `
    -NewPassword (ConvertTo-SecureString -AsPlainText "NuevaP@ss2024!" -Force) `
    -Reset

# Forzar cambio de contraseña en próximo login
Set-ADUser -Identity "juan.garcia" -ChangePasswordAtLogon $true

# Bloquear cuenta
Disable-ADAccount -Identity "juan.garcia"

# Desbloquear cuenta
Enable-ADAccount -Identity "juan.garcia"
```

#### Eliminar Usuario

```powershell
# Eliminar usuario
Remove-ADUser -Identity "juan.garcia" -Confirm

# Eliminar sin confirmación
Remove-ADUser -Identity "juan.garcia" -Confirm:$false
```

### Grupos

| Tipo | Alcance | Descripción | Casos de Uso |
|------|---------|-------------|--------------|
| **Security** | Domain Local | Solo en dominio actual | Permisos en recursos locales |
| **Distribution** | Global/Universal | Cualquier dominio | Listas de distribución email |
| **Security** | Global | Cualquier dominio | Permisos entre dominios |
| **Security** | Universal | Cualquier bosque | Estructuras complejas |

#### Crear y Gestionar Grupos

```powershell
# Crear grupo de seguridad
New-ADGroup -Name "Vendedores" `
    -SamAccountName "vendedores" `
    -GroupCategory Security `
    -GroupScope Global `
    -Path "OU=Grupos,OU=Empresa,DC=empresa,DC=local" `
    -Description "Grupo para el equipo de ventas"

# Crear grupo de distribución
New-ADGroup -Name "TodosEmpleados" `
    -SamAccountName "todos.empleados" `
    -GroupCategory Distribution `
    -GroupScope Universal `
    -Path "OU=Grupos,OU=Empresa,DC=empresa,DC=local"

# Agregar miembros al grupo
Add-ADGroupMember -Identity "vendedores" -Members "juan.garcia", "maria.lopez", "pedro.garcia"

# Obtener miembros de grupo
Get-ADGroupMember -Identity "vendedores"

# Obtener grupos de un usuario
Get-ADPrincipalGroupMembership -Identity "juan.garcia"

# Listar todos los grupos
Get-ADGroup -Filter * -SearchBase "OU=Grupos,OU=Empresa,DC=empresa,DC=local"

# Eliminar grupo
Remove-ADGroup -Identity "vendedores" -Confirm:$false
```

### Computadoras

```powershell
# Crear objeto de computadora preestablecido
New-ADComputer -Name "PC-JUAN-01" `
    -Path "OU=Computadoras,OU=Empresa,DC=empresa,DC=local" `
    -Description "PC de Juan García en Madrid" `
    -Enabled $true

# Listar computadoras
Get-ADComputer -Filter * -SearchBase "OU=Computadoras,OU=Empresa,DC=empresa,DC=local"

# Buscar computadoras activas
$fecha = (Get-Date).AddDays(-30)
Get-ADComputer -Filter {LastLogonTimeStamp -gt $fecha} -Properties LastLogonTimeStamp

# Mover computadora a otro OU
Move-ADObject -Identity "CN=PC-JUAN-01,OU=Computadoras,OU=Empresa,DC=empresa,DC=local" `
    -TargetPath "OU=Vendedores,OU=Empresa,DC=empresa,DC=local"
```

## Group Policy Objects (GPOs)

### Conceptos Fundamentales

Una GPO es un conjunto de configuraciones que se aplican a usuarios o computadoras. Las GPOs se vinculan a sitios, dominios u OUs y se heredan jerárquicamente.

```
Sitio (Site)
├── Dominio (Domain)
│   ├── OU Padre
│   │   └── OU Hijo (hereda política del padre)
│   └── OU Hermana
```

**Ventajas:**
- Gestión centralizada
- Aplicación automática
- Hierencia y herencia de políticas
- Filtrado por grupos de seguridad

### GPMC - Group Policy Management Console

Herramienta principal para administrar GPOs:

```powershell
# Instalar GPMC
Install-WindowsFeature -Name GPMC

# Crear GPO
New-GPO -Name "Política_Vendedores" -Description "GPO para equipo de ventas" | \
    New-GPLink -Target "OU=Vendedores,OU=Empresa,DC=empresa,DC=local"

# Listar GPOs
Get-GPO -All

# Obtener GP vinculadas a OU
Get-GPInheritance -Target "OU=Vendedores,OU=Empresa,DC=empresa,DC=local"

# Remover GPO
Remove-GPO -Name "Política_Vendedores" -Confirm:$false
```

### Configuraciones Comunes de GPO

#### Política de Contraseña

```powershell
# Crear GPO de contraseñas
$gpo = New-GPO -Name "Politica_Contrasenas"

# Establecer políticas (editando la GPO)
Set-GPRegistryValue -Name $gpo.DisplayName `
    -Key "HKLM\System\CurrentControlSet\Services\Netlogon\Parameters" `
    -ValueName "RefusePasswordChange" -Type DWord -Value 0

# Mínimo longitud contraseña (5 caracteres)
# Máximo edad contraseña (90 días)
# Historial contraseña (24 contraseñas)
# Bloqueo después intentos fallidos (5 intentos)
```

#### Restricción de Software y Escritorio

```powershell
# Crear GPO de restricciones
$gpo = New-GPO -Name "Restricciones_Vendedores"

# Ocultar unidades en Mi Equipo
Set-GPRegistryValue -Name $gpo.DisplayName `
    -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
    -ValueName "NoDrives" -Type DWord -Value 3  # Oculta A y B

# Desactivar cambio de contraseña
Set-GPRegistryValue -Name $gpo.DisplayName `
    -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" `
    -ValueName "DisableChangePassword" -Type DWord -Value 1

# Ocultar programas específicos
Set-GPRegistryValue -Name $gpo.DisplayName `
    -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
    -ValueName "NoRun" -Type DWord -Value 1
```

#### Mapeo de Unidades de Red

```powershell
# Script de mapeo (puede ejecutarse vía GPO)
$gpo = New-GPO -Name "Mapeo_Unidades"

# Contenido del script:
<#
net use Z: \\servidor\compartido
net use X: \\servidor\vendedores /persistent:yes
#>

# Vincular a OU
New-GPLink -Name $gpo.DisplayName -Target "OU=Vendedores,OU=Empresa,DC=empresa,DC=local"
```

#### Scripts de Inicio/Cierre

```powershell
# Crear script de logon
$scriptContent = @"
@echo off
:: Script ejecutado al iniciar sesión
net use H: \\servidor\home\%username%
net use Z: \\servidor\documentos
"@

$scriptPath = "\\empresa.local\SYSVOL\empresa.local\Policies\{GUID}\User\Scripts\Logon\"
Set-Content -Path "$scriptPath\mapeo.bat" -Value $scriptContent

# Vincular script a GPO (vía GPMC GUI o PowerShell avanzado)
```

#### Instalación de Software

```powershell
# Vía GPO Software Installation (requiere GPMC y .msi)
# El .msi se coloca en compartido de red
# Se configura en GPMC: Computer Configuration > Software Settings > Software Installation
```

### Aplicar Cambios de GPO

```powershell
# En cliente: forzar actualización de GPO
gpupdate /force

# Mostrar resultados aplicados
gpresult /h reporte_gpo.html

# Ver GPOs aplicadas a un usuario
gpresult /user EMPRESA\juan.garcia /h reporte.html

# Forzar descarga inmediata
gpupdate /force /boot  # Requiere reinicio para políticas de equipo
```

## FSMO Roles

Los roles FSMO (Flexible Single Master of Operations) son funciones críticas que requieren un solo servidor:

| Rol | Ámbito | Función |
|-----|--------|---------|
| **Schema Master** | Bosque | Modifica esquema AD |
| **Domain Naming Master** | Bosque | Agregaa/elimina dominios |
| **RID Master** | Dominio | Genera RIDs únicos |
| **PDC Emulator** | Dominio | Compatibilidad, sincronización de hora |
| **Infrastructure Master** | Dominio | Actualiza referencias entre dominios |

```powershell
# Ver dueños de FSMO
Get-ADDomainController -Filter * | Select-Object -Property HostName, OperationMasterRoles

# Transferir FSMO role
Move-ADDirectoryServerOperationMasterRole -Identity "DC-NUEVA" `
    -OperationMasterRole SchemaMaster,DomainNamingMaster,PDCEmulator,RIDMaster,InfrastructureMaster
```

## Autenticación Kerberos

Active Directory utiliza Kerberos para autenticar usuarios:

```
Cliente → KDC (Key Distribution Center)
Cliente recibe TGT (Ticket Granting Ticket)
Cliente → KDC: TGT para obtener ST (Service Ticket)
Cliente → Servidor: Service Ticket
Servidor valida con DC
Servidor → Cliente: Acceso otorgado
```

```powershell
# Ver tickets Kerberos del usuario actual
klist

# Limpiar tickets
klist purge

# Ver tickets de otro usuario (como admin)
klist tickets
```

## Resumen de Comandos Esenciales

```powershell
# Usuarios
New-ADUser -Name "Juan García" -SamAccountName "juan.garcia" -Enabled $true
Get-ADUser -Identity "juan.garcia" -Properties *
Set-ADUser -Identity "juan.garcia" -Title "Nuevo título"
Remove-ADUser -Identity "juan.garcia" -Confirm:$false

# Grupos
New-ADGroup -Name "Vendedores" -GroupScope Global -GroupCategory Security
Add-ADGroupMember -Identity "vendedores" -Members "juan.garcia"
Get-ADGroupMember -Identity "vendedores"

# Computadoras
New-ADComputer -Name "PC-JUAN-01" -Enabled $true
Get-ADComputer -Filter * -Properties *

# GPOs
New-GPO -Name "Política_Prueba"
Get-GPO -All
New-GPLink -Name "Política_Prueba" -Target "OU=Vendedores,..."
Set-GPRegistryValue -Name "Política_Prueba" -Key "..." -ValueName "..." -Value ...

# Actualizar GPO
gpupdate /force

# Ver aplicadas
gpresult /h reporte.html
```

## Conclusión

Active Directory es el corazón de la infraestructura Windows empresarial. Las GPOs permiten administración centralizada a escala. Dominar estos conceptos es esencial para administradores de sistemas Windows.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'sistemas-operativos'),
  'Guía completa: Systemd y Gestión de Servicios',
  'systemd-y-gestion-de-servicios',
  $MKDN$
# Guía completa: Systemd y Gestión de Servicios

## Introducción

Systemd es el sistema de inicialización estándar en distribuciones Linux modernas (Debian, RHEL, Arch, etc.). Reemplazó a init/SysV, proporcionando una gestión más eficiente de servicios, dependencias y recursos. Esta guía cubre desde conceptos básicos hasta administración avanzada.

## Historia: De init a systemd

### init/SysV (Antiguo)

```bash
# Arranque secuencial y lento
/etc/init.d/servicio start
chkconfig servicio on
```

### systemd (Moderno)

```bash
# Arranque paralelo y rápido
systemctl start servicio
systemctl enable servicio
```

**Ventajas de systemd:**
- Inicio paralelo (más rápido)
- Gestión de dependencias
- Control de recursos
- Integración de logs
- Reinicio automático de servicios

## Conceptos Fundamentales

### Units - Unidades Systemd

Una unit es una configuración que systemd puede gestionar. Los principales tipos son:

| Tipo | Extensión | Descripción |
|------|-----------|-------------|
| **service** | `.service` | Daemons/servicios |
| **socket** | `.socket` | Comunicación entre procesos |
| **timer** | `.timer` | Tareas programadas (cron) |
| **mount** | `.mount` | Puntos de montaje |
| **target** | `.target` | Grupos de units (runlevels) |
| **path** | `.path` | Monitoreo de rutas |
| **device** | `.device` | Dispositivos |
| **swap** | `.swap` | Particiones swap |

```bash
# Listar todos los tipos de units
systemctl --type=service
systemctl --type=timer
systemctl --type=mount
```

## Gestión de Servicios con systemctl

### Operaciones Básicas

```bash
# Iniciar servicio
sudo systemctl start apache2

# Parar servicio
sudo systemctl stop apache2

# Reiniciar servicio
sudo systemctl restart apache2

# Recargar configuración sin reiniciar
sudo systemctl reload apache2

# Recargar o reiniciar si no soporta reload
sudo systemctl reload-or-restart apache2
```

### Habilitar y Deshabilitar Servicios

```bash
# Habilitar servicio (inicia automáticamente al arrancar)
sudo systemctl enable apache2

# Deshabilitar servicio
sudo systemctl disable apache2

# Ver si está habilitado
sudo systemctl is-enabled apache2

# Habilitar y comenzar simultáneamente
sudo systemctl enable --now apache2

# Deshabilitar y parar simultáneamente
sudo systemctl disable --now apache2
```

### Ver Estado de Servicios

```bash
# Estado completo
sudo systemctl status apache2

# Ver si está activo
systemctl is-active apache2

# Salida: active (running) o inactive (dead)
echo $?  # 0 = active, 3 = inactive

# Listar todos los servicios
systemctl list-units --type=service

# Servicios habilitados
systemctl list-unit-files --type=service --state=enabled

# Servicios fallidos
systemctl list-units --state=failed
```

## Journald y Journalctl

Systemd incluye journald, un sistema de logging centralizado que reemplaza syslog.

```bash
# Ver logs (últimas 100 líneas)
journalctl

# Seguimiento de logs en tiempo real (como tail -f)
journalctl -f

# Logs de servicio específico
journalctl -u apache2

# Logs desde hace 2 horas
journalctl --since "2 hours ago"

# Logs entre fechas
journalctl --since "2024-01-15 10:00:00" --until "2024-01-15 11:00:00"

# Logs desde último reinicio
journalctl -b

# Logs de arranque anterior
journalctl -b -1

# Filtrar por prioridad
journalctl -p err              # Solo errores
journalctl -p warning          # Warnings y superiores
journalctl -p info

# Combinaciones útiles
journalctl -u apache2 -f                        # Seguimiento de apache
journalctl -u apache2 --since "1 hour ago"     # Última hora
journalctl -p err --since today                 # Errores de hoy
journalctl -u nginx -n 50                       # Últimas 50 líneas

# Formato JSON
journalctl -o json | jq .

# Estadísticas de boot
systemd-analyze

# Tiempo de cada servicio al arrancar
systemd-analyze blame
```

## Archivo de Configuración de Service Unit

### Estructura Básica

```ini
[Unit]
Description=Descripción del servicio
Documentation=man:apache2(8)
After=network.target remote-fs.target nss-lookup.target
Wants=apache-htcacheclean.service
Before=multi-user.target

[Service]
Type=notify
EnvironmentFile=/etc/default/apache2
ExecStart=/usr/sbin/apache2ctl start
ExecReload=/usr/sbin/apache2ctl graceful
ExecStop=/usr/sbin/apache2ctl stop
KillMode=process
KillSignal=SIGTERM
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal
User=www-data
Group=www-data
PrivateTmp=yes
NoNewPrivileges=yes

[Install]
WantedBy=multi-user.target
```

### Sección [Unit]

Define metadatos e interdependencias:

```ini
[Unit]
Description=Apache HTTP Server
Documentation=https://httpd.apache.org/docs/2.4/

# Después de estos servicios
After=network.target remote-fs.target nss-lookup.target

# Antes de estos
Before=multi-user.target

# Requiere que estos estén activos
Requires=network.target

# Inicia estos servicios (débil)
Wants=apache-htcacheclean.service

# Conflictúa con estos
Conflicts=nginx.service

# Documentación
Documentation=man:apache2(8) https://example.com/docs

# Condiciones
Condition=ConditionFileNotEmpty=/etc/apache2/apache2.conf
Assert=AssertPathExists=/etc/apache2/mods-enabled
```

### Sección [Service]

Define cómo ejecutar el servicio:

```ini
[Service]
# Tipo de servicio
Type=simple              # Proceso foreground (por defecto)
Type=forking             # Fork tradicional
Type=oneshot             # Ejecuta una vez y termina
Type=notify              # Notifica cuando está listo
Type=idle                # Espera a que finalicen jobs

# Comando de ejecución
ExecStart=/usr/sbin/apache2ctl start
ExecStartPre=/bin/mkdir -p /var/run/apache2
ExecStartPost=/bin/echo "Apache started"
ExecReload=/bin/kill -HUP $MAINPID
ExecStop=/usr/sbin/apache2ctl stop
ExecStopPost=/bin/echo "Apache stopped"

# Reinicio automático
Restart=no               # No reiniciar
Restart=always           # Siempre
Restart=on-success       # Solo si salió con éxito
Restart=on-failure       # Solo si falló
Restart=on-abnormal      # Si fue abortado o señalado
RestartSec=5s            # Esperar 5 segundos antes de reiniciar

# Límite de intentos de reinicio
StartLimitIntervalSec=600
StartLimitBurst=3

# Usuario y grupo
User=www-data
Group=www-data

# Directorio de trabajo
WorkingDirectory=/var/www/html

# Variables de entorno
Environment=LANG=es_ES.UTF-8
EnvironmentFile=/etc/default/apache2
EnvironmentFile=-/etc/default/apache2.custom

# Límites de recursos
CPUQuota=50%            # Máximo 50% de CPU
MemoryLimit=512M        # Máximo 512MB de RAM
TasksMax=256            # Máximo 256 procesos
LimitNOFILE=65536       # Límite de archivos abiertos
LimitNPROC=4096         # Límite de procesos

# I/O y privacidad
PrivateTmp=yes          # /tmp privado para el servicio
PrivateDevices=yes      # Acceso restringido a /dev
NoNewPrivileges=yes     # Evita escalada de privilegios
ReadWritePaths=/var/log/apache2

# Logging
StandardOutput=journal
StandardError=journal
StandardOutput=append:/var/log/apache2/access.log
SyslogIdentifier=apache2
```

### Sección [Install]

Define cómo instalar el servicio:

```ini
[Install]
# Vinculado a este target
WantedBy=multi-user.target

# Requerido por este target
RequiredBy=network.target

# Instalador alias
Alias=httpd.service
Alias=httpd
```

## Crear un Servicio Personalizado

Ejemplo: servicio para una aplicación Python:

```bash
# 1. Crear usuario de sistema
sudo useradd -r -s /usr/sbin/nologin miapp

# 2. Crear archivo de unidad
sudo nano /etc/systemd/system/miapp.service
```

Contenido:

```ini
[Unit]
Description=Mi Aplicación Python
After=network.target

[Service]
Type=simple
User=miapp
WorkingDirectory=/opt/miapp
Environment="PATH=/opt/miapp/venv/bin"
ExecStart=/opt/miapp/venv/bin/python /opt/miapp/app.py
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal
PrivateTmp=yes
NoNewPrivileges=yes

[Install]
WantedBy=multi-user.target
```

```bash
# 3. Recargar configuración de systemd
sudo systemctl daemon-reload

# 4. Verificar sintaxis
sudo systemctl status miapp

# 5. Habilitar e iniciar
sudo systemctl enable --now miapp

# 6. Verificar logs
journalctl -u miapp -f
```

## Targets - Niveles de Ejecución

Los targets agrupan servicios para diferentes niveles de ejecución:

| Target | Descripción |
|--------|-------------|
| `multi-user.target` | Modo multiusuario (CLI) |
| `graphical.target` | Modo gráfico (GUI) |
| `rescue.target` | Modo rescate (mantenimiento) |
| `emergency.target` | Modo emergencia (sin servicios) |

```bash
# Ver target actual
systemctl get-default

# Cambiar target por defecto
sudo systemctl set-default multi-user.target
sudo systemctl set-default graphical.target

# Cambiar target temporal (sin reiniciar)
sudo systemctl isolate rescue.target
sudo systemctl isolate graphical.target
```

## Timers - Tareas Programadas

Los timers de systemd reemplazan a cron:

```bash
# Crear script de copia de seguridad
sudo nano /usr/local/bin/backup.sh
```

```bash
#!/bin/bash
tar czf /backups/sistema-$(date +%Y%m%d).tar.gz /home
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup.sh

# Crear servicio para el script
sudo nano /etc/systemd/system/backup.service
```

```ini
[Unit]
Description=Backup diario del sistema
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
StandardOutput=journal
StandardError=journal
```

```bash
# Crear timer
sudo nano /etc/systemd/system/backup.timer
```

```ini
[Unit]
Description=Timer para backup diario
Requires=backup.service

[Timer]
# Ejecutar diariamente a las 3:00 AM
OnCalendar=*-*-* 03:00:00

# Ejecutar 5 minutos después del arranque si se perdió
Persistent=true

# Si pasan 30 minutos sin ejecutarse, ejecutar lo antes posible
AccuracySec=30min

[Install]
WantedBy=timers.target
```

```bash
# Habilitar timer
sudo systemctl daemon-reload
sudo systemctl enable --now backup.timer

# Listar timers activos
systemctl list-timers

# Ver próxima ejecución
systemctl list-timers backup.timer

# Ejecutar manualmente
sudo systemctl start backup.service

# Ver logs
journalctl -u backup.service -f
```

### Sintaxis de OnCalendar

```
# Formato: DayOfWeek Year-Month-Day Hour:Minute:Second

# Ejemplos
OnCalendar=*-*-* 03:00:00              # Diariamente a las 3 AM
OnCalendar=Mon-Fri 09:30:00            # Lunes a viernes a las 9:30 AM
OnCalendar=*-*-15 10:00:00             # Día 15 de cada mes a las 10 AM
OnCalendar=*-01-01 00:00:00            # 1 de enero a medianoche
OnCalendar=0/2 *-*-* 04:00:00          # Cada 2 horas a las 4 AM
OnCalendar=*-*-*,03,06,09,12:02:00     # Cada 3 horas empezando a las 2 AM
OnBootSec=5min                         # 5 minutos después del arranque
OnBootSec=1h 30min                     # 1 hora 30 minutos después del arranque
OnUnitActiveSec=1d                     # Cada día después de la última activación
```

## Gestión de Dependencias

```ini
[Unit]
# Requerimientos
Requires=network.target              # Se requiere que esté activo
Wants=apache2.service                # Deseable pero no obligatorio
PartOf=multi-user.target             # Parar esto detiene el target

# Orden
After=network.target                 # Comenzar después de network
Before=shutdown.target               # Detener antes de shutdown

# Conflictos
Conflicts=nginx.service              # No puede estar activo con nginx

# Bind dependencies
Binds=apache2.service                # Detener esto detiene apache2
```

## Control de Recursos

```ini
[Service]
# CPU
CPUQuota=50%                    # Máximo 50% de CPU
CPUAccounting=yes               # Habilitar contabilidad

# Memoria
MemoryLimit=1G                  # Máximo 1GB de RAM
MemoryAccounting=yes            # Habilitar contabilidad
MemoryMax=1.5G                  # Hard limit

# Procesos
TasksMax=256                    # Máximo 256 procesos

# I/O
IOWeight=100                    # Prioridad I/O
IODeviceWeight=/dev/sda 50     # Peso específico por dispositivo

# Archivos abiertos
LimitNOFILE=65536              # Máximo de archivos abiertos

# Prioridad de CPU
Nice=10                         # Nice level (-20 a 19)
CPUSchedulingPolicy=batch      # Policy de scheduling
```

## Proceso de Arranque

Diagrama del proceso de arranque con systemd:

```
1. Firmware/UEFI
       ↓
2. Bootloader (GRUB)
       ↓
3. Kernel Linux
       ↓
4. systemd como PID 1
       ↓
5. emergency.target
       ↓
6. rescue.target (opcional)
       ↓
7. multi-user.target o graphical.target
       ↓
8. Todos los servicios WantedBy del target
```

```bash
# Análisis de tiempos de arranque
systemd-analyze

# Ver servicios que más tardan
systemd-analyze blame

# Gráfico de arranque
systemd-analyze plot > arranque.svg

# Información detallada de un servicio
systemd-analyze critical-chain apache2.service
```

## Troubleshooting

```bash
# Verificar sintaxis del archivo de unit
systemd-analyze verify /etc/systemd/system/miapp.service

# Ver configuración expandida de una unit
systemctl cat apache2

# Ver configuración real (después de overlays)
systemctl show apache2

# Mostrar archivos de unit cargados
systemctl show-environment

# Ver configuración de un usuario específico
systemctl --user list-units

# Debug detallado
systemctl -vvvvv status apache2

# Rastrear systemd
journalctl _SYSTEMD_UNIT=apache2.service -b

# Mostrar errores de parsing
journalctl -p err -b
```

## Resumen de Comandos Esenciales

```bash
# Gestión básica
sudo systemctl start servicio
sudo systemctl stop servicio
sudo systemctl restart servicio
sudo systemctl reload servicio
sudo systemctl reload-or-restart servicio

# Habilitar/deshabilitar
sudo systemctl enable servicio
sudo systemctl disable servicio
sudo systemctl is-enabled servicio

# Estado
sudo systemctl status servicio
systemctl is-active servicio
systemctl list-units --type=service

# Logs
journalctl -u servicio
journalctl -u servicio -f
journalctl -p err --since today

# Timers
sudo systemctl enable --now backup.timer
systemctl list-timers
sudo systemctl start backup.timer

# Análisis
systemd-analyze
systemd-analyze blame
systemctl show servicio

# Verificación
systemd-analyze verify /etc/systemd/system/miapp.service
systemctl daemon-reload
```

## Conclusión

Systemd proporciona una forma moderna y eficiente de gestionar servicios en Linux. Su sistema de dependencias, control de recursos y gestión de logs lo hacen superior a init/SysV. Dominar systemd es esencial para cualquier administrador de sistemas Linux.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'sistemas-operativos'),
  'Guía completa: Docker y Contenedores',
  'docker-y-contenedores',
  $MKDN$
# Guía completa: Docker y Contenedores

## Introducción

Docker revolucionó la manera de empaquetar, distribuir y ejecutar aplicaciones. Los contenedores ofrecen una alternativa más eficiente y flexible a las máquinas virtuales. Esta guía cubre desde conceptos fundamentales hasta orquestación con Docker Compose.

## Contenedores vs Máquinas Virtuales

| Aspecto | Contenedores | Máquinas Virtuales |
|--------|-------------|-------------------|
| **Overhead** | Mínimo (~MB) | Alto (~GB) |
| **Tiempo arranque** | Segundos | Minutos |
| **Aislamiento** | A nivel de proceso | Completo |
| **Densidad** | Cientos por servidor | 5-10 máquinas |
| **Performance** | Casi nativo | 5-15% overhead |
| **Portabilidad** | Excelente | Buena |
| **Caso de uso** | Microservicios, dev, CI/CD | Legado, multi-SO |

```
Máquina Virtual                    Contenedor
┌──────────────────┐              ┌────────────┐
│ Aplicación       │              │ Aplicación │
├──────────────────┤              ├────────────┤
│ SO Completo      │              │ Librerías  │
│ (Kernel)         │              └────────────┘
├──────────────────┤              └────────────┘
│ Hypervisor       │              Docker Engine
├──────────────────┤              └────────────┘
│ Host OS + Kernel │              Host OS + Kernel
└──────────────────┘              └────────────┘
```

## Arquitectura de Docker

```
┌─────────────────────────────────┐
│    Docker Client (CLI)           │
│  (docker run, docker build)      │
└────────────┬──────────────────────┘
             │ API
┌────────────▼──────────────────────┐
│  Docker Daemon (dockerd)          │
│  - Gestiona contenedores          │
│  - Gestiona imágenes              │
│  - Gestiona networks              │
│  - Gestiona volúmenes             │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│ containerd (container runtime)    │
│ - Ejecuta contenedores            │
│ - Gestiona ciclo de vida          │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│ Kernel Linux                      │
│ - namespaces (aislamiento)        │
│ - cgroups (límites de recursos)   │
└──────────────────────────────────┘
```

**Componentes principales:**

- **Imagen**: Plantilla inmutable con aplicación, librerías, configuración
- **Contenedor**: Instancia ejecutable de una imagen
- **Registry**: Almacén central (Docker Hub, ECR, etc.)
- **Volumen**: Almacenamiento persistente
- **Network**: Comunicación entre contenedores
- **Daemon**: Proceso que gestiona todo

## Instalación de Docker

```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install docker.io

# Agregar usuario al grupo docker (sin sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker ps  # No debería pedir sudo
```

## Comandos Básicos de Docker

### docker run - Ejecutar Contenedores

```bash
# Ejecutar contenedor básico
docker run hello-world

# Ejecutar con opciones comunes
docker run -d \
    --name mi-app \
    -p 8080:80 \
    -v /datos:/app/datos \
    -e DATABASE_URL=postgres://db:5432/app \
    --restart=always \
    nginx:latest

# Explicación de flags
# -d              : Ejecutar en background (detached)
# --name          : Nombre del contenedor
# -p 8080:80      : Mapear puerto host:contenedor
# -v /datos:/app/datos : Montar volumen
# -e VARIABLE=val : Variable de entorno
# --restart=always: Reiniciar automáticamente
# nginx:latest    : Imagen:tag
```

**Flags principales:**

| Flag | Descripción |
|------|-------------|
| `-d` | Detached (background) |
| `-it` | Interactive + TTY (terminal) |
| `-p 8080:80` | Mapear puerto |
| `-v /host:/contenedor` | Montar volumen |
| `-e VAR=valor` | Variable de entorno |
| `--name` | Nombre del contenedor |
| `--restart` | Política de reinicio |
| `--network` | Red personalizada |
| `--rm` | Eliminar al parar |
| `-m 512m` | Límite de memoria |
| `--cpus="1.5"` | Límite de CPU |

### docker ps - Listar Contenedores

```bash
# Contenedores activos
docker ps

# Todos los contenedores (incluyendo parados)
docker ps -a

# Formato personalizado
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Listar solo IDs
docker ps -q

# Contenedores parados
docker ps -f status=exited
```

### docker images - Listar Imágenes

```bash
# Listar imágenes
docker images

# Ver tags de imagen
docker images nginx

# Formato personalizado
docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}"
```

### docker logs - Ver Logs

```bash
# Ver logs de un contenedor
docker logs mi-app

# Seguimiento en tiempo real
docker logs -f mi-app

# Últimas 50 líneas
docker logs --tail 50 mi-app

# Desde hace 10 minutos
docker logs --since 10m mi-app

# Con timestamps
docker logs --timestamps mi-app
```

### docker exec - Ejecutar Comandos

```bash
# Ejecutar comando en contenedor
docker exec mi-app ls -la /app

# Terminal interactiva
docker exec -it mi-app bash

# Como usuario específico
docker exec -u www-data mi-app whoami

# Variables de entorno heredadas
docker exec -e CUSTOM_VAR=valor mi-app env
```

### docker stop/rm - Parar y Eliminar

```bash
# Parar contenedor (graceful)
docker stop mi-app

# Parar forzadamente
docker kill mi-app

# Eliminar contenedor parado
docker rm mi-app

# Eliminar forzadamente
docker rm -f mi-app

# Eliminar múltiples
docker rm $(docker ps -q --filter status=exited)

# Limpiar sistemas sin usar
docker system prune  # Peligro: elimina todo sin usar
docker system prune -a  # Incluyendo imágenes
```

### docker images/rmi - Gestionar Imágenes

```bash
# Ver imágenes disponibles
docker images

# Eliminar imagen
docker rmi nginx:latest

# Eliminar si no está en uso
docker rmi -f nginx:latest

# Limpiar imágenes no etiquetadas
docker rmi $(docker images -f "dangling=true" -q)
```

## Dockerfile - Crear Imágenes Personalizadas

### Estructura Básica

```dockerfile
# Especificar imagen base
FROM python:3.9-slim

# Metadatos
LABEL maintainer="admin@ejemplo.com"
LABEL version="1.0"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos del host
COPY requirements.txt .

# Ejecutar comandos (crear capas)
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY . .

# Variables de entorno
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Exponer puertos
EXPOSE 5000

# Archivo de salud
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Usuario no root
RUN useradd -m appuser
USER appuser

# Comando de inicio
CMD ["python", "app.py"]
```

### Instrucciones Principales

| Instrucción | Descripción | Ejemplo |
|------------|-------------|---------|
| `FROM` | Imagen base | `FROM python:3.9-slim` |
| `WORKDIR` | Directorio de trabajo | `WORKDIR /app` |
| `COPY` | Copiar archivos | `COPY requirements.txt .` |
| `ADD` | Copiar + descomprimir | `ADD app.tar.gz .` |
| `RUN` | Ejecutar comando | `RUN pip install -r requirements.txt` |
| `ENV` | Variable de entorno | `ENV PYTHON=3.9` |
| `EXPOSE` | Documentar puerto | `EXPOSE 5000` |
| `USER` | Usuario de ejecución | `USER appuser` |
| `CMD` | Comando por defecto | `CMD ["python", "app.py"]` |
| `ENTRYPOINT` | Script de entrada | `ENTRYPOINT ["./entrypoint.sh"]` |
| `VOLUME` | Directorio de volumen | `VOLUME ["/data"]` |
| `HEALTHCHECK` | Verificar salud | `HEALTHCHECK CMD ...` |

### Ejemplo Completo: Aplicación Web

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY app.py config.py ./
COPY templates/ ./templates/
COPY static/ ./static/

# Crear usuario no root
RUN useradd -m appuser && \
    chown -R appuser:appuser /app
USER appuser

# Variables de entorno
ENV FLASK_APP=app.py
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Puerto
EXPOSE 5000

# Comando de inicio
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

## .dockerignore

Similar a .gitignore, especifica qué archivos no incluir en la imagen:

```
.git
.gitignore
.env
.env.local
.venv
venv/
*.pyc
__pycache__/
*.log
node_modules/
npm-debug.log
.DS_Store
coverage/
.pytest_cache/
.mypy_cache/
dist/
build/
*.egg-info/
```

## Docker Build y Tagging

```bash
# Construir imagen
docker build -t mi-app:1.0 .

# Construir con Dockerfile personalizado
docker build -f Dockerfile.prod -t mi-app:prod .

# Construir con argumentos
docker build --build-arg PYTHON_VERSION=3.10 -t mi-app .

# Etiquetar imagen existente
docker tag mi-app:1.0 usuario/mi-app:1.0

# Push a registry
docker login
docker push usuario/mi-app:1.0

# Ver historial de capas
docker history mi-app:1.0
```

## Volúmenes

### Tipos de Volúmenes

```bash
# Named Volume (recomendado)
docker volume create datos
docker run -v datos:/app/datos nginx

# Bind Mount (directorio del host)
docker run -v /home/usuario/datos:/app/datos nginx

# Volumen anónimo
docker run -v /app/datos nginx
```

### Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Información de volumen
docker volume inspect datos

# Eliminar volumen
docker volume rm datos

# Limpiar volúmenes no usados
docker volume prune
```

## Networks

### Tipos de Redes

```bash
# Bridge (default)
docker run --network bridge -d nginx

# Host (comparte red del host)
docker run --network host -d nginx

# None (sin red)
docker run --network none -d nginx

# Overlay (Docker Swarm)
docker network create -d overlay mynetwork
```

### Crear Red Personalizada

```bash
# Crear red bridge
docker network create myapp-network

# Conectar contenedor a red
docker run --network myapp-network --name web -d nginx
docker run --network myapp-network --name db -d postgres

# Los contenedores se pueden resolver por nombre
docker exec web ping db  # Funciona con el nombre

# Desconectar red
docker network disconnect myapp-network web

# Listar redes
docker network ls

# Eliminar red
docker network rm myapp-network
```

## Docker Compose

### docker-compose.yml

Orquestar múltiples contenedores con un archivo YAML:

```yaml
version: '3.9'

services:
  # Servicio de aplicación web
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mi-app-web
    ports:
      - "8080:5000"
    volumes:
      - ./app:/app
      - static_volume:/app/static
    environment:
      - FLASK_APP=app.py
      - DATABASE_URL=postgresql://user:password@db:5432/miapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Servicio de base de datos
  db:
    image: postgres:14-alpine
    container_name: mi-app-db
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=miapp
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache
  cache:
    image: redis:7-alpine
    container_name: mi-app-cache
    command: redis-server --appendonly yes
    volumes:
      - cache_data:/data
    networks:
      - app-network
    restart: unless-stopped

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: mi-app-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - static_volume:/app/static:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    networks:
      - app-network
    restart: unless-stopped

# Volúmenes persistentes
volumes:
  db_data:
  cache_data:
  static_volume:

# Redes personalizadas
networks:
  app-network:
    driver: bridge
```

### Comandos de Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Reconstruir imágenes
docker-compose up -d --build

# Ver logs
docker-compose logs
docker-compose logs -f web
docker-compose logs --tail 50 db

# Ver procesos
docker-compose ps

# Ejecutar comando en servicio
docker-compose exec web python -m pytest
docker-compose exec db psql -U user -d miapp

# Parar servicios
docker-compose stop

# Parar y eliminar contenedores
docker-compose down

# Eliminar volúmenes también
docker-compose down -v

# Recrear contenedores
docker-compose up -d --force-recreate

# Escalar servicios
docker-compose up -d --scale worker=3
```

## Seguridad de Docker

```dockerfile
# No correr como root
RUN useradd -m appuser
USER appuser

# Imagen base pequeña y segura
FROM alpine:latest
# o
FROM debian:bookworm-slim

# No incluir secretos en imagen
# Usar BuildKit secrets:
docker build --secret my_secret=./secret.txt .

# En Dockerfile:
RUN --mount=type=secret,id=my_secret \
    cat /run/secrets/my_secret > /app/.env

# Scan de vulnerabilidades
docker scan nginx:latest

# Signatura de imágenes
docker trust inspect nginx:latest
```

## Tabla de Mejores Prácticas

| Aspecto | Buena Práctica |
|--------|----------------|
| **Imagen Base** | Usar imágenes específicas (python:3.9-slim) no latest |
| **Usuario** | Correr como usuario no-root |
| **Capas** | Minimizar capas, combinar RUN con && |
| **Caché** | Aprovechar caché: archivos estables primero |
| **Tamaño** | Usar .dockerignore, eliminar caché de paquetes |
| **Seguridad** | Escanear imágenes, usar secrets para credenciales |
| **Health** | Incluir HEALTHCHECK |
| **Logging** | Usar stdout/stderr, no archivos locales |
| **Variables** | Usar variables de entorno, no hardcoding |

## Conclusión

Docker revoluciona la manera de desarrollar, distribuir y ejecutar aplicaciones. Los contenedores permiten portabilidad, escalabilidad y eficiencia. Docker Compose facilita la orquestación local, mientras que Kubernetes es la opción para producción a escala.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

-- ─── Fundamentos de Hardware ────────────────────────────────────────
INSERT INTO theory_subjects (name, slug, description, icon, order_index)
VALUES ('Fundamentos de Hardware', 'fundamentos-de-hardware', 'Componentes de PC, BIOS/UEFI, RAID, SAIs y arquitectura de centros de datos.', '⚙️', 4)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      order_index = EXCLUDED.order_index;

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'fundamentos-de-hardware'),
  'Guía completa: Componentes y Arquitectura de un PC',
  'componentes-arquitectura-pc',
  $MKDN$
# Guía completa: Componentes y Arquitectura de un PC

## Introducción

La arquitectura de un PC moderno es el resultado de décadas de innovación en hardware. Comprender sus componentes es fundamental para cualquier administrador IT. Esta guía cubre desde el procesador hasta la fuente de alimentación, proporcionando una visión integral de cómo funcionan juntos.

## Procesador (CPU)

### Conceptos Fundamentales

El procesador es el "cerebro" del ordenador. Sus características principales son:

- **Núcleos (Cores)**: Unidades de procesamiento independientes. Un procesador moderno puede tener 2, 4, 8, 16 o más núcleos.
- **Hilos (Threads)**: Cada núcleo puede procesar múltiples hilos. Un procesador de 4 núcleos con Hyper-Threading (Intel) o SMT (AMD) tiene 8 hilos.
- **Velocidad de Reloj (Clock Speed)**: Medida en GHz. Típicamente 2.0-5.5 GHz en procesadores modernos.
- **Thermal Design Power (TDP)**: Potencia máxima que disipa en Watts. Importante para elegir refrigeración.
- **Caché**: Memoria muy rápida integrada en el procesador.

### Niveles de Caché

| Nivel | Tamaño Típico | Velocidad | Latencia |
|-------|---------------|-----------|----------|
| L1 | 32-64 KB/núcleo | Muy rápida | ~4 ciclos |
| L2 | 256-512 KB/núcleo | Rápida | ~12 ciclos |
| L3 | 8-32 MB | Normal | ~40 ciclos |

### Comparación: Intel vs AMD

| Característica | Intel (12ª-14ª gen) | AMD (Ryzen 7000) |
|---|---|---|
| Arquitectura | Alder Lake / Raptor Lake | Zen 4 |
| TDP | 65-253 W | 65-170 W |
| Frecuencia Base | 3.0-3.8 GHz | 4.5-5.7 GHz |
| Frecuencia Boost | 4.2-6.0 GHz | 5.4-5.7 GHz |
| Virtualizacion | VT-x | AMD-V |
| Eficiencia | Buena | Excelente |

## Memoria RAM

### Tipos de RAM

La RAM es la memoria de acceso rápido que almacena datos temporales mientras el sistema está encendido.

| Tecnología | Año | Velocidad | Voltaje | Uso Actual |
|---|---|---|---|---|
| DDR3 | 2007 | 800-2133 MHz | 1.5V | Legacy, economía |
| DDR4 | 2014 | 2133-3600+ MHz | 1.2V | Estándar actual |
| DDR5 | 2021 | 4800-6400+ MHz | 1.1V | Futuro, gama alta |

**Velocidades Comunes DDR4**:
- DDR4-2400: Entrada
- DDR4-3200: Estándar recomendado
- DDR4-3600: Alto rendimiento
- DDR4-4000+: Overclocking

**Cálculo de Latencia Real**: CAS Latency (CL) / Frecuencia = Tiempo real
Ejemplo: CL16 DDR4-3200 = 16 / 3200 * 2000 = 10 ns

## Almacenamiento

### Comparación de Tecnologías

| Tipo | Interfaz | Velocidad Secuencial | Uso | Precio/GB |
|---|---|---|---|---|
| HDD 7200 RPM | SATA | ~150 MB/s | Almacenamiento económico | €0.02 |
| SSD SATA | SATA | ~550 MB/s | Sistema operativo | €0.05 |
| SSD NVMe Gen3 | PCIe 3.0 | ~3500 MB/s | Gaming, rendering | €0.08 |
| SSD NVMe Gen4 | PCIe 4.0 | ~7000 MB/s | Workstations | €0.10 |
| SSD NVMe Gen5 | PCIe 5.0 | ~14000 MB/s | Servidores de alto rendimiento | €0.15 |

**Ejemplo de Velocidades Reales**:
```
Samsung 980 Pro (NVMe Gen4):
- Lectura secuencial: 7100 MB/s
- Escritura secuencial: 6000 MB/s
- IOPS aleatorio: 1M+ IOPS

WD Blue SSD SATA:
- Lectura secuencial: 560 MB/s
- Escritura secuencial: 530 MB/s
- IOPS aleatorio: 95K IOPS
```

### Factor de Forma

- **2.5"**: SSD SATA, portátiles antiguos
- **3.5"**: HDD, máxima capacidad
- **M.2**: SSD NVMe moderno, compacto
- **U.2**: Enterprise NVMe

## Placa Base (Motherboard)

### Factores de Forma

| Factor | Dimensiones | Características | Uso |
|---|---|---|---|
| ATX | 305 × 244 mm | Completa, 4-6 slots RAM, múltiples PCIe | Escritorios estándar |
| Micro-ATX | 244 × 244 mm | Compacta, 2-4 slots RAM | Economía, SFF |
| Mini-ITX | 170 × 170 mm | Muy pequeña, 1-2 slots RAM | HTPCs, servidores |
| E-ATX | 330 × 330 mm | Expandida, workstations | Servidores de alto rendimiento |

### Buses y Conectividad

**PCIe Generaciones**:

| Gen | Año | Velocidad/Carril | Ancho de Banda (x16) | Uso |
|---|---|---|---|---|
| PCIe 2.0 | 2007 | 500 MB/s | 8 GB/s | Legacy |
| PCIe 3.0 | 2013 | 1 GB/s | 16 GB/s | Estándar actual |
| PCIe 4.0 | 2019 | 2 GB/s | 32 GB/s | Gaming, servidores |
| PCIe 5.0 | 2022 | 4 GB/s | 64 GB/s | Futuro (pocos dispositivos) |

**Estándares USB**:

| Estándar | Nombre | Velocidad | Año |
|---|---|---|---|
| USB 2.0 | Hi-Speed | 480 Mbps | 2000 |
| USB 3.0 | SuperSpeed | 5 Gbps | 2008 |
| USB 3.1 | SuperSpeed+ | 10 Gbps | 2013 |
| USB 3.2 | SuperSpeed 20Gbps | 20 Gbps | 2017 |
| USB 4.0 | Thunderbolt 3 | 40 Gbps | 2019 |

## Fuente de Alimentación (PSU)

### Eficiencia 80 PLUS

Las certificaciones 80 PLUS garantizan eficiencia mínima a carga típica (50%):

| Certificación | Eficiencia (50% carga) | Eficiencia (100% carga) | Precio Relativo |
|---|---|---|---|
| 80 PLUS | 80% | 80% | 1.0x |
| Bronze | 85% | 82% | 1.2x |
| Silver | 88% | 85% | 1.4x |
| Gold | 90% | 87% | 1.6x |
| Platinum | 92% | 89% | 2.0x |
| Titanium | 94% | 90% | 2.5x |

### Cálculo de Potencia Requerida

```
Potencia Total = (CPU TDP) + (GPU TDP) + Discos + Periféricos + Margen

Ejemplo para Gaming PC:
- Ryzen 5 5600X: 65W
- RTX 4070: 200W
- Discos, periféricos: 50W
- Margen de seguridad (20%): 83W
- Total: 65 + 200 + 50 + 83 = 398W
- PSU Recomendada: 550-650W (85+ Gold)
```

## GPU (Unidad de Procesamiento Gráfico)

Las GPUs modernas tienen arquitecturas especializadas:

- **NVIDIA**: CUDA cores, architecture Ampere/Ada (para servidores)
- **AMD**: Stream Processors, architecture RDNA
- **Intel**: Xe cores (reciente entrada)

Especificaciones clave:
- Memoria dedicada (VRAM): 6-24 GB típico
- Ancho de banda: DDR6/GDDR6/GDDR6X
- TDP: 50-450W según modelo

## Refrigeración

### Refrigeración por Aire

**Características**:
- Presupuesto: €20-100
- Ruido: Moderado a alto
- Mantenimiento: Limpieza de polvo regular
- Ejemplos: Noctua NH-D15, Bequiet Dark Rock Pro

**Tipos de Configuración**:
- Downdraft (ventilador hacia abajo)
- Tower (ventilador vertical)
- All-in-One (AIO) con radiador separado

### Refrigeración Líquida

**Custom Loop**:
- Presupuesto: €300-1000+
- Rendimiento: Excelente, ~5-10°C mejor
- Mantenimiento: Cambio de líquido cada 1-2 años

**All-in-One (AIO)**:
- Presupuesto: €80-300
- Rendimiento: Muy bueno, 3-5°C mejor
- Mantenimiento: Mínimo
- Ejemplos: NZXT Kraken, Corsair iCUE

## Proceso POST y Códigos de Beep

El Power-On Self Test (POST) es el diagnóstico inicial al encender:

| Beeps | Significado | Acción |
|---|---|---|
| 1 beep corto | POST correcto | Ninguna, inicio normal |
| 1 beep largo + 2 cortos | Error de memoria | Reinstalar RAM |
| Beeps continuos | Error de memoria o tarjeta gráfica | Revisar componentes |
| 1 beep largo + 1 corto | Error de vídeo | Reinstalar GPU o usar integrada |
| 1 beep largo | POST incompleto | Error grave de hardware |

## Selección de Componentes por Caso de Uso

### Servidor

- **CPU**: Múltiples núcleos, TDP controlado (65-95W)
- **RAM**: ECC DDR4/DDR5, 32-256 GB
- **Almacenamiento**: Drives enterprise, SSD NVMe en RAID
- **PSU**: Redundante, mínimo 80 PLUS Gold
- **Motherboard**: Servidor (LGA 3647, EPYC)
- **Refrigeración**: Aire optimizada para ruido/eficiencia

### Workstation

- **CPU**: Alto número de núcleos (8-32), cache grande
- **RAM**: 64-256 GB ECC o no-ECC
- **GPU**: Profesional (NVIDIA RTX, AMD Radeon Pro)
- **Almacenamiento**: SSD NVMe rápido + almacenamiento secundario
- **PSU**: 850W+ Gold mínimo
- **Monitor**: Múltiples 4K, color-accurate

### PC Gaming

- **CPU**: 6-8 núcleos, 4.5+ GHz boost
- **RAM**: 32 GB DDR4/DDR5, 3200+ MHz
- **GPU**: RTX 4070 o superior
- **Almacenamiento**: SSD NVMe Gen4 para SO, adicional para juegos
- **PSU**: 750W+ Gold
- **Refrigeración**: Aire o AIO de 240mm+

---

Esta guía proporciona los fundamentos para entender la arquitectura moderna de PCs. El equilibrio entre componentes es clave para un sistema eficiente.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'fundamentos-de-hardware'),
  'Guía completa: BIOS, UEFI y Proceso de Arranque',
  'bios-uefi-y-arranque',
  $MKDN$
# Guía completa: BIOS, UEFI y Proceso de Arranque

## Introducción a BIOS y UEFI

La BIOS/UEFI es el firmware que inicia el hardware antes de que cargue el sistema operativo. Comprender su funcionamiento es esencial para administradores IT.

## BIOS: El Sistema Legado

### ¿Qué es BIOS?

BIOS (Basic Input/Output System) es firmware de bajo nivel que:
- Se ejecuta antes de cualquier sistema operativo
- Realiza diagnóstico del hardware (POST)
- Inicializa componentes hardware
- Busca y carga el bootloader

**Historia**:
- Año 1981: IBM introduce BIOS en el PC original
- Limitado a 16 bits reales
- 1 MB de espacio de direcciones máximo
- Limitaciones para discos > 2.2 TB

### Limitaciones de BIOS

| Limitación | Problema | Impacto |
|---|---|---|
| 16 bits real mode | No acceso a memoria extendida | Máx. 1 MB usable |
| Disco máx. 2.2 TB | Particiones grandes imposibles | Legacy en drives modernos |
| MBR (512 bytes) | Máx. 4 particiones primarias | Inflexible para particionado |
| Lentitud | Rutinas en 16 bits | Boot lento (>10 seg) |
| Sin red nativa | No boot por red fácil | PXE complicado |
| Sin seguridad | No verificación de boot | Malware de bajo nivel |

## UEFI: El Estándar Moderno

### Ventajas de UEFI

UEFI (Unified Extensible Firmware Interface) es el sucesor moderno:

- **64 bits**: Acceso directo a toda la RAM
- **GPT**: Soporte para discos > 2.2 TB
- **Interfaz gráfica**: Menús modernos con ratón
- **Red integrada**: Boot por PXE nativo
- **Secure Boot**: Verificación criptográfica de bootloader
- **UEFI Shell**: Intérprete de comandos integrado
- **Tiempo de boot**: 2-5 segundos típico

### Características UEFI Principales

**Secure Boot**:
```
Verificación de cadena:
1. UEFI verifica bootloader con clave pública
2. Bootloader verifica kernel
3. Kernel verifica módulos
- Previene rootkits de bajo nivel
- Compatible con Windows/Linux (con mokutil)
```

**GPT (GUID Partition Table)**:
```
Ventajas sobre MBR:
- Máximo 128 particiones (vs 4 primarias en MBR)
- Discos hasta 9.4 zettabytes
- CRC32 para integridad
- Tabla de particiones duplicada
```

## MBR vs GPT

| Característica | MBR | GPT |
|---|---|---|
| Año introducido | 1983 | 2013 |
| Tamaño máximo disco | 2.2 TB | 9.4 ZB |
| Número máximo particiones | 4 primarias | 128 |
| Locación tabla | Sector 1 | Sector 1 + último sector |
| Backup tabla | No | Sí |
| Checksum | No | CRC32 |
| Compatibilidad BIOS | Nativa | Requiere CSM |
| Compatibilidad UEFI | CSM (legacy) | Nativa |
| Velocidad boot | Lenta | Rápida |

## Proceso POST (Power-On Self Test)

### Fases del POST

1. **Inicialización del chipset** (200 ms)
   - Reset de CPU y caché
   - Inicialización de controladores de memoria
   - Auto-detección de RAM

2. **Test de RAM** (1-3 segundos)
   - Lectura/escritura de prueba en memoria
   - Detección de módulos defectuosos
   - Cálculo de memoria total

3. **Inicialización de dispositivos** (1-2 segundos)
   - Búsqueda de GPU
   - Inicialización de controladoras RAID
   - Detección de discos

4. **Test de dispositivos** (0.5-1 segundo)
   - Verificación de conectividad
   - Test de salud básico
   - Reporte de capacidad

### Códigos de Beep Comunes

| Patrón | Significado | Solución |
|---|---|---|
| 1 beep | Boot correcto | Ninguna |
| Beeps continuos | Error de memoria | Reinstalar RAM, limpiar contactos |
| 1 largo + 2 cortos | Error de vídeo | Reinstalar GPU, usar iGPU |
| 1 largo + 3 cortos | Memoria insuficiente | Instalar más RAM |
| 1 largo | POST incompleto | Reiniciar, revisar CPU/RAM |
| 2 beeps | Error de chequeo de paridad | Módulo RAM defectuoso |

## Secuencia de Arranque

### Boot Order en UEFI

La secuencia típica es:

```
1. Power-On → 2. POST → 3. UEFI Init
       ↓
4. Búsqueda de bootloader en boot devices:
   - Disco duro 1 (entrada EFI)
   - Disco duro 2
   - USB
   - DVD
   - Red (PXE)
       ↓
5. Carga de bootloader (GRUB, Windows Boot Manager)
       ↓
6. Bootloader busca y carga kernel
       ↓
7. Kernel asume control y carga SO
```

**Configuración en BIOS/UEFI**:
- Acceso: Del, F2, F10 o F12 (depende de fabricante)
- Sección: Boot, Advanced, o Boot Order
- Cambio temporal: F12 o ESC durante POST

## Categorías de Configuración BIOS/UEFI

### Main (Principal)

```
Información del Sistema:
- Manufacturer: Lenovo, HP, Dell, etc.
- Model: IdeaPad, Pavilion, etc.
- BIOS Date: Fecha del firmware
- System Time/Date: Hora y fecha del sistema
- CPU Type: Modelo del procesador detectado
- CPU Speed: Frecuencia actual
- Total Memory: RAM detectada
```

### Boot (Arranque)

```
Boot Options:
- Boot Device Priority: Orden de dispositivos
- Secure Boot: Enable/Disable
- Boot Mode: UEFI o Legacy BIOS
- Fast Boot: Saltar algunas pruebas POST
- Boot to Network: PXE enable/disable
```

### Security (Seguridad)

```
Configuraciones:
- Secure Boot: Validación de bootloader
- Secure Boot Mode: Setup Mode o Standard Mode
- TPM (Trusted Platform Module): Enable/Disable
- Password: Contraseña de UEFI
- Physical Presence: Permitir cambios sin contraseña
```

### Advanced (Avanzadas)

```
Configuraciones CPU:
- Virtualization Technology (VT-x/AMD-V): Enable
- Hyper-Threading: Enable para multitarea
- C-States: Control de potencia
- Turbo Boost/Turbo Core: Frequency boost

Configuraciones Memoria:
- XMP/DOCP: Perfiles de memoria overclocked
- Memory Frequency: Velocidad manual
- Timing: Latencia (CAS) manual

Configuraciones Almacenamiento:
- AHCI Mode: Enable (vs IDE)
- SATA Controller: Native IDE o AHCI
- M.2 Controller: Enable NVMe
```

## Entering BIOS/UEFI: Guía por Fabricante

| Fabricante | Tecla POST | Tecla Boot | Modelos Típicos |
|---|---|---|---|
| ASUS | DEL, F2 | ESC, F8 | Desktop, Laptop |
| Dell | F2, DEL | F12 | XPS, Inspiron |
| HP/Compaq | F10, ESC | ESC, F9 | Pavilion, EliteDesk |
| Lenovo | F1, DEL | F12, Fn+F12 | IdeaPad, ThinkCentre |
| Acer | DEL, F2 | ESC, F12 | Aspire, Veriton |
| MSI | DEL | DEL | Boards personalizadas |
| Gigabyte | DEL, F2 | DEL, F12 | Boards personalizadas |

## Configuraciones Comunes Importante

### Virtualization (VT-x / AMD-V)

```
Ubicación: Advanced → CPU Settings → Virtualization Technology
Estado: ENABLE (para máquinas virtuales)

Impacto:
- Deshabilitada: Hipervisores como VMware/VirtualBox no funcionan
- Habilitada: Pérdida insignificante de rendimiento (~1%)
```

### XMP (Extreme Memory Profile) / DOCP

```
Ubicación: Advanced → Memory Settings → XMP Profile (ASUS)
          Advanced → Memory Settings → DOCP (AMD)

Función:
- Permite RAM funcionar a velocidades superiores
- Ej: DDR4-3600 en lugar de 3200 JEDEC default

Ejemplo:
- Default: DDR4-3200 (JEDEC standard)
- XMP Enabled: DDR4-3600 (según especificación fabricante)
- Tiempo: +1-2 segundos en boot, mejor rendimiento
```

### AHCI vs IDE

```
AHCI (Advanced Host Controller Interface):
- Ubicación: Advanced → Storage → SATA Mode
- Estado: ENABLE
- Ventajas:
  * Hot-swap de drives
  * Mejor rendimiento
  * Trim support para SSD

IDE (Legacy):
- Modo compatibilidad antigua
- Desventajas:
  * Lento
  * Sin hot-swap
  * Windows debe reinstalarse si cambia
```

### Secure Boot

**Habilitación de Secure Boot**:

```
Ubicación: Security → Secure Boot → Enable

Para Linux:
1. Enable Secure Boot
2. Install shim bootloader
3. Enroll con mokutil (Machine Owner Key)
   mokutil --import /path/to/mok.der
4. Reiniciar y completar MOK enrollment
```

## Bootloaders: GRUB y Windows Boot Manager

### GRUB (GNU GRand Unified Bootloader)

**Ubicación en disco**:
```
Sector 0 (MBR):
- Stage 1: Muy pequeño (~512 bytes)
- Carga Stage 1.5 o Stage 2

/boot/grub/grub.cfg:
- Menú de arranque
- Configuración de kernel
- Parámetros de boot
```

**Archivo de configuración típico**:

```bash
# /etc/default/grub
GRUB_DEFAULT=0
GRUB_TIMEOUT=5
GRUB_CMDLINE_LINUX="ro quiet splash"
GRUB_DISABLE_RECOVERY="true"

# Cambios requieren:
sudo update-grub
```

### Windows Boot Manager

```
Ubicación: EFI\Microsoft\Boot\bootmgfw.efi

Características:
- Menú automático si múltiples SO
- Recovery options integradas
- Secure Boot compatible
```

## Opciones de Recuperación

### UEFI Recovery

```
Situación: Sistema no arranca
Acceso: F9 (Dell), F11 (HP), Varía según fabricante

Opciones:
1. Restore from USB: Recuperar desde backup
2. Reset UEFI to Defaults: Reset valores fábrica
3. Clear CMOS/Battery: Vaciar configuración (requiere abrir carcasa)
4. UEFI Shell: Reparación manual con comandos
```

### GRUB Recovery

```
Situación: No arranca SO Linux
Acceso: GRUB menu → e (edit)

Comandos útiles:
$ ls
$ ls (hd0,gpt2)/
$ root=(hd0,gpt2)
$ linux /vmlinuz-5.15.0 root=/dev/sda2 ro
$ initrd /initrd.img-5.15.0
$ boot

Después: sudo update-grub
```

---

Dominar BIOS/UEFI es esencial para administración de sistemas. Los conceptos aquí cubiertos aplicarán a cualquier plataforma x86.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'fundamentos-de-hardware'),
  'Guía completa: RAID - Tipos, Configuración y Recuperación',
  'raid-tipos-configuracion-recuperacion',
  $MKDN$
# Guía completa: RAID - Tipos, Configuración y Recuperación

## ¿Qué es RAID?

RAID (Redundant Array of Independent Disks) es una tecnología que combina múltiples discos para mejorar rendimiento, redundancia o ambos. Es crucial en servidores y almacenamiento crítico.

## RAID: Hardware vs Software vs Híbrido

| Tipo | Implementación | Rendimiento | Costo | Complejidad | Caso de Uso |
|---|---|---|---|---|---|
| Hardware RAID | Controladora dedicada | Excelente | €300-2000 | Baja | Servidores críticos |
| Software RAID | Sistema operativo | Bueno | Gratis | Media | PCs, servidores Linux |
| Híbrido | RAID falso (fakeraid) | Variable | €50-200 | Media | Laptops, NAS |

### Hardware RAID

```
Ventajas:
- Independiente del SO
- Boot del RAID sin SO
- Mejor rendimiento
- Mejor soporte para hot-swap
- Battery-backed cache

Desventajas:
- Muy caro
- Vinculado a controladora (cambios difíciles)
- Firmware propietario
- Compatibilidad SO limitada
```

### Software RAID (mdadm en Linux)

```
Ventajas:
- Económico (sin hardware adicional)
- Portátil (discos en cualquier sistema)
- Flexible (cambios fáciles)
- Open-source

Desventajas:
- Usa CPU/RAM del SO
- Rendimiento dependiente de carga
- Requiere bootloader especial
```

## RAID 0: Striping (Franjas)

### Concepto

Divide datos en bloques distribuidos entre discos:

```
Disco 1: [Bloque 1] [Bloque 3] [Bloque 5]
Disco 2: [Bloque 2] [Bloque 4] [Bloque 6]

Escribir 6 bloques:
- Sin RAID: 6 × latencia de disco
- RAID 0: 3 × latencia (paralelo)
```

### Características

| Propiedad | Valor |
|---|---|
| Discos mínimos | 2 |
| Redundancia | 0 (ninguna) |
| Espacio usable | 100% (N discos = N×capacidad) |
| Rendimiento lectura | N× (excelente) |
| Rendimiento escritura | N× (excelente) |
| Fiabilidad | PÉSIMA (si 1 disco falla, TODO se pierde) |

### Caso de Uso

- Cache de compilación
- Almacenamiento temporal
- Caché de video 4K
- Datos no críticos que requieren velocidad

**NO USAR RAID 0 PARA**:
- Datos críticos o únicos
- Producciones en vivo
- Servidores de producción

## RAID 1: Mirroring (Espejo)

### Concepto

Duplica datos en dos discos (o más):

```
Disco 1: [Datos A] [Datos B] [Datos C]
Disco 2: [Datos A] [Datos B] [Datos C]  ← Copia idéntica

Lectura: Puede leer de ambos (2× velocidad)
Escritura: Debe escribir en ambos (misma velocidad)
```

### Características

| Propiedad | Valor |
|---|---|
| Discos mínimos | 2 |
| Redundancia | Total (1 disco puede fallar) |
| Espacio usable | 50% (2 discos = 1 capacidad) |
| Rendimiento lectura | 2× (muy bueno) |
| Rendimiento escritura | 1× (igual a 1 disco) |
| Fiabilidad | MUY BUENA |

### Caso de Uso

- Almacenamiento crítico pequeño
- Bases de datos de transacciones
- Servidores web pequeños
- Discos del SO

## RAID 5: Striping con Paridad

### Concepto

Distribuye datos y paridad XOR entre 3+ discos:

```
Disco 1: [Bloque 1] [Paridad 2-3] [Bloque 4]
Disco 2: [Paridad 1-3] [Bloque 2] [Bloque 5]
Disco 3: [Bloque 3] [Bloque 6] [Paridad 4-5]

Paridad: XOR de datos
Si Disco 2 falla: Bloque 2 = Disco 1 XOR Disco 3 (en posición correspondiente)
```

### Características

| Propiedad | Valor |
|---|---|
| Discos mínimos | 3 |
| Redundancia | 1 disco (si 1 falla, recuperable) |
| Espacio usable | (N-1)/N (3 discos = 2 capacidad) |
| Rendimiento lectura | (N-1)× |
| Rendimiento escritura | (N-1)/2× (overhead de paridad) |
| Fiabilidad | BUENA |
| Tiempo reconstrucción | 24-48 horas típico |

### Fórmula de Espacio Usable

```
Capacidad usable = (número de discos - 1) × capacidad disco individual

Ejemplo: 4 discos de 8TB en RAID 5
= (4-1) × 8TB = 24TB usables
```

### Riesgo de Reconstrucción

```
Durante rebuild:
- Discos funcionando bajo estrés extremo
- Tasa de error de lectura (URE): típicamente 1 per 10^12 bits
- Tamaño disco moderno: 8TB = 64 × 10^12 bits
- Riesgo URE durante rebuild: ~64%

Solución: RAID 6 (doble paridad)
```

## RAID 6: Doble Paridad

### Concepto

Almacena 2 bloques de paridad independientes:

```
Puede sobrevivir fallos de 2 discos simultáneamente
Paridad 1: XOR simple (como RAID 5)
Paridad 2: XOR con multiplicación de Galois (Reed-Solomon)
```

### Características

| Propiedad | Valor |
|---|---|
| Discos mínimos | 4 |
| Redundancia | 2 discos |
| Espacio usable | (N-2)/N (4 discos = 2 capacidad) |
| Rendimiento lectura | (N-2)× |
| Rendimiento escritura | (N-2)/2× (mayor overhead que RAID 5) |
| Fiabilidad | EXCELENTE |
| Tiempo reconstrucción | 48-72 horas |

### Cuándo Usar RAID 6

- Discos > 4TB
- Servidores críticos
- Backups on-site
- Almacenamiento empresarial

## RAID 10 (1+0): Striping de Mirrors

### Concepto

Crea múltiples RAID 1 en striping:

```
[Espejo 1]: Disco 1 ↔ Disco 2
[Espejo 2]: Disco 3 ↔ Disco 4
[Espejo 3]: Disco 5 ↔ Disco 6

Datos distribuidos entre espejos
```

### Características

| Propiedad | Valor |
|---|---|
| Discos mínimos | 4 (parejas de espejo) |
| Redundancia | 1 por pareja (parcial total) |
| Espacio usable | 50% (6 discos = 3 capacidad) |
| Rendimiento lectura | N/2× (excelente) |
| Rendimiento escritura | N/2× (muy bueno) |
| Fiabilidad | EXCELENTE |
| Permite fallos | 1 por pareja sin perder datos |

## Comparativa de RAID

| Nivel | Discos Min. | Redundancia | Lectura | Escritura | Espacio Usable | Mejor Para |
|---|---|---|---|---|---|---|
| 0 | 2 | Ninguna | N× | N× | 100% | Caché, temporal |
| 1 | 2 | Total | 2× | 1× | 50% | Pequeño crítico |
| 5 | 3 | 1 disco | (N-1)× | (N-1)/2× | (N-1)/N | Almacenamiento general |
| 6 | 4 | 2 discos | (N-2)× | (N-2)/2× | (N-2)/N | Enterprise grande |
| 10 | 4 | 1 por par | N/2× | N/2× | 50% | Alto rendimiento crítico |

## RAID Anidados

### RAID 50 (Striping de RAID 5)

```
Múltiples grupos RAID 5 en striping

Ejemplo: 12 discos
- 3 grupos de 4 discos en RAID 5
- Grupos distribuidos en striping

Ventaja: Rebuild más rápido que RAID 6
Desventaja: Complejidad de reconstrucción
```

### RAID 60 (Striping de RAID 6)

```
Similar a RAID 50 pero con RAID 6
Mayor redundancia, rebuild más lento
Para infraestructura masiva
```

## Hot Spare (Repuesto Activo)

```
Disco dedicado que entra en acción automáticamente:

Configuración:
1. Declarar disco como "spare"
2. Sistema monitorea RAID
3. Si falla disco activo:
   - Reconstrucción automática a spare
   - Hot-plug del disco fallido sin downtime
4. Disco nuevo se convierte en nuevo spare

Ejemplo mdadm:
mdadm --create /dev/md0 --level=5 --raid-devices=3 \
  --spare-devices=1 /dev/sda1 /dev/sdb1 /dev/sdc1 /dev/sdd1
```

## Tiempo de Reconstrucción y Riesgos

### Cálculo de Tiempo

```
Tiempo estimado = Capacidad × Overhead / Velocidad escritura

Ejemplo: RAID 5 con 3 discos × 8TB (16TB espaciados),
reconstrucción 100 MB/s
= 16TB × (1 + 0.3 overhead) / 100 MB/s
≈ 46.5 horas
```

### Riesgo de URE (Unrecoverable Read Error)

```
Durante rebuild, lecturas intensivas:

RAID 5 Riesgo:
- 2 discos de 8TB con tasa URE 1 per 10^12 bits
- Probabilidad evento URE: ~50-60%
- Resultado: Reconstrucción FALLA

Mitigación:
1. Usar RAID 6
2. Usar SSD (sin errores)
3. RAID con journaling
4. Monitoreo con SMART
```

## Monitoreo de Salud RAID

### Linux (mdadm)

```bash
# Ver estado del RAID
cat /proc/mdstat

# Salida:
md0 : active raid5 sdc1[2] sdb1[1] sda1[0]
      15626240 blocks super 1.2, 512k chunks, algorithm 2
      [3/3] [UUU]
      bitmap: 0/61 pages [0KB], 0KB chunk

# U = up, _ = down
# Si ve [3/2] significa disco fallo

# Reemplazar disco fallido
mdadm /dev/md0 --fail /dev/sda1
mdadm /dev/md0 --remove /dev/sda1
# Quitar disco físico y insertar uno nuevo
mdadm /dev/md0 --add /dev/sda1
```

### SMART Monitoring

```bash
# Instalar smartmontools
apt-get install smartmontools

# Monitorear disco
smartctl -a /dev/sda

# Monitoreo continuo en servicio
systemctl enable smartd
systemctl start smartd
```

## Recuperación de Datos en RAID

### Escenario 1: Disco Fallido (RAID Degradado)

```
Pasos:
1. Identificar disco fallido con mdadm
2. Si hot-spare configurado: automático
3. Si no:
   - Reemplazar disco físico
   - mdadm --add /dev/md0 /dev/sdX1
4. Monitorear reconstrucción: watch cat /proc/mdstat
```

### Escenario 2: Fallo de Controladora (RAID Hardware)

```
RAID Hardware (fakeraid) es problemático:
- Metadatos en el disco
- Recuperable si discos intactos
- Importar discos en diferente controladora

Comando (Linux):
dmraid -r  # Descubrir RAID
dmraid -ay # Activar RAID
```

### Escenario 3: Múltiples Fallos

```
RAID 5 con 2 discos fallidos:
- IRRECUPERABLE sin backup
- Solución: Recuperación forense con empresa especializada
- Muy caro: €5000-15000+

RAID 6 con 2 discos fallidos:
- Recuperable matemáticamente
- Proceso: 72+ horas típico
```

## ¿CUÁNDO NO USAR RAID?

### RAID no es Backup

```
IMPORTANTE: RAID NO reemplaza backups

Escenarios donde RAID FALLA:
- Corrupción de datos: RAID copia el dato corrupto
- Malware ransomware: RAID encripta datos en todos discos
- Eliminación accidental: RAID no recupera
- Fallos de software: RAID no ayuda
- Desastre natural: Todos los discos pueden dañarse

Solución: RAID + Backup offline o en nube
3-2-1 Rule:
- 3 copias de datos
- 2 soportes diferentes
- 1 ubicación remota
```

### Cuándo NO Usar RAID

- Datos con una sola copia local
- Información no crítica
- Presupuesto limitado (mejor SSD grande)
- Rendimiento crítico sin redundancia (RAID 0 = riesgo)
- Sistemas embebidos o IoT

---

RAID es una herramienta poderosa pero no es solución mágica. Requiere monitoreo, mantenimiento y siempre estar respaldado.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'fundamentos-de-hardware'),
  'Guía completa: SAIs, CPD y Alimentación',
  'sais-cpd-alimentacion',
  $MKDN$
# Guía completa: SAIs, CPD y Alimentación

## SAI/UPS: Sistema de Alimentación Ininterrumpible

### ¿Qué es un SAI?

Un SAI (Sistema de Alimentación Ininterrumpible) o UPS (Uninterruptible Power Supply) es un dispositivo que:

- Mantiene alimentación en caso de corte eléctrico
- Protege contra sobretensiones y subtensiones
- Permite apagado ordenado de sistemas
- Es crítico en servidores y almacenamiento

**Analogía**: Es un "airbag" para tu infraestructura eléctrica.

## Tipos de SAI/UPS

### 1. Offline/Standby UPS

```
Arquitectura:
AC entrada → Selector → SAI → Carga
                    ↓
                  Cargador batería

Funcionamiento:
- Normalmente: Electricidad directa a carga
- Corte detectado: Conmuta a batería (~10ms delay)
- Problema: Algunos equipos sensibles necesitan energía inmediata
```

| Aspecto | Detalle |
|---|---|
| Tiempo reacción | 10-20 ms |
| Eficiencia | 90-98% |
| Precio | €50-200 |
| Mantenimiento | Mínimo |
| Mejor para | Escritorios, impresoras |

### 2. Line-Interactive UPS

```
Arquitectura:
AC entrada → Auto-transformer → Carga
                  ↓
            Switches de batería

Funcionamiento:
- Auto-transformer regula tensión
- Corte detectado: Batería entra instantáneamente
- Mejor protección contra variaciones
```

| Aspecto | Detalle |
|---|---|
| Tiempo reacción | 0-2 ms |
| Eficiencia | 95-99% |
| Precio | €200-800 |
| Mantenimiento | Moderado |
| Mejor para | Servidores pequeños |

### 3. Online (Double-Conversion) UPS

```
Arquitectura:
AC entrada → Rectificador → Inversor → Carga
                   ↓           ↓
              Batería siempre cargada

Funcionamiento:
- AC siempre convertido a DC y re-invertido
- Batería SIEMPRE alimentando carga
- Corte AC: No cambia nada (latency = 0)
- Máxima protección
```

| Aspecto | Detalle |
|---|---|
| Tiempo reacción | 0 ms (ideal) |
| Eficiencia | 85-95% (consume más energía) |
| Precio | €1500-50000+ |
| Mantenimiento | Regular |
| Mejor para | Servidores críticos, CPD |
| Coste energía | Alto (pérdidas de conversión) |

### Comparativa de SAI

| Característica | Offline | Line-Interactive | Online |
|---|---|---|---|
| Precio | 1x | 3-4x | 15-100x |
| Eficiencia energética | Muy buena | Buena | Moderada |
| Protección contra variaciones | Básica | Excelente | Perfecta |
| Tiempo de transferencia | ~15ms | <1ms | 0ms |
| Complejidad | Baja | Media | Alta |
| Vida útil batería | 3-5 años | 3-5 años | 3-5 años |

## Especificaciones de SAI: VA vs W

### Diferencia Crítica

```
VA (Voltios-Amperios): Potencia aparente
W (Vatios): Potencia real = VA × Factor de potencia

Factor de potencia (PF):
- Cargas resistivas (resistencias): PF = 1.0
- Cargas reactivas (transformadores, PSU): PF = 0.7-0.9
- Motores: PF = 0.5-0.8

Ejemplo:
SAI 1000 VA con PF 0.7 = 700 W reales
SAI 1000 VA con PF 0.9 = 900 W reales
```

**Regla práctica**:
```
Potencia real ≈ VA especificado × 0.6-0.8

Entonces:
- SAI 500 VA = ~300-400 W reales
- SAI 1000 VA = ~600-800 W reales
- SAI 3000 VA = ~1800-2400 W reales
```

## Cálculo de Tamaño de SAI Requerido

### Fórmula

```
1. Calcular potencia total:
   P_total = Σ(potencia cada equipo)

2. Aplicar factor de potencia:
   P_real = P_total × 0.7 (factor seguridad)

3. Determinar autonomía:
   Ah_batería = P_real × horas_autonomía / V_batería

4. Seleccionar SAI:
   VA_requerido = P_real / 0.8  (para margen)
```

### Ejemplo Práctico: Sala de Servidores Pequeña

```
Equipos:
- Servidor 500 W
- Switch de red 100 W
- Controladora RAID 50 W
- Modem/Router 30 W
- Ventilador cabina 40 W
Total = 720 W

Aplicar factor:
720 W × 0.7 = 504 W (consumo real pico)

Autonomía deseada: 30 minutos
Batería típica: 48V DC

Ah_batería = 504 × 0.5 / 48 = 5.25 Ah
→ Batería: 48V 6Ah mínimo

SAI requerido:
504 W / 0.8 = 630 VA mínimo
→ Seleccionar SAI 1000 VA (ofrece 800W típico)
```

## Tipos y Mantenimiento de Baterías

### Tecnologías de Baterías

| Tipo | Química | Voltaje | Ciclos | Coste | Vida |
|---|---|---|---|---|---|
| Lead-Acid (SLA) | Pb-H₂SO₄ | 12V/24V | 300-500 | Bajo | 3-5 años |
| Lithium-ion (LiFePO₄) | Li-Fe-P-O | 48V | 3000-5000 | Alto | 10+ años |
| NiCd | Níquel-Cadmio | 12V | 1000+ | Medio | 20 años |

**Recomendación moderna**: Lithium-ion (Li-ion) para nuevas instalaciones

### Mantenimiento de Baterías

```
Lead-Acid (SLA):
- Temperatura ideal: 20-25°C
- Evitar descargas profundas (reduce vida)
- Verificar densidad líquido electrolito
- Reemplazo típico: cada 3-5 años

Lithium-ion:
- Menos mantenimiento
- Temperatura ideal: 15-25°C
- Ciclos equivalentes del SLA: 10x más
- Costo inicial: 5x más, pero mejor TCO
```

## Software de Gestión de SAI

### NUT (Network UPS Tools) - Linux

```bash
# Instalar
apt-get install nut nut-client

# Configurar /etc/nut/ups.conf
[myups]
    driver = snmp-ups
    port = 192.168.1.100
    snmp_version = v2c
    snmp_community = public

# Servicio
systemctl start nut-server
systemctl enable nut-server

# Monitorear
upsc myups
upsc myups@localhost | grep battery
```

### APC PowerChute (Windows/Linux)

```
Interfaz gráfica para SAI APC
- Monitoreo en tiempo real
- Alertas por email
- Shutdown automático de servidores
- Integración con vSphere
```

### Apcupsd (Alternativa Open-Source)

```bash
# Instalar
apt-get install apcupsd

# Configurar /etc/apcupsd/apcupsd.conf
UPSCABLE usb
UPSTYPE usb

# Ver estado
apcaccess
```

## CPD: Centro de Procesamiento de Datos

### Definición de CPD

Un CPD es una instalación dedicada que aloja:
- Servidores
- Almacenamiento
- Equipos de red
- Sistemas de refrigeración
- Sistemas de alimentación redundante
- Seguridad física

### Tiers de CPD: Clasificación de Uptime

| Tier | Uptime/Año | Downtime/Año | Requisitos |
|---|---|---|---|
| I | 99.671% | 28.8 horas | Energía única, refrigeración pasiva |
| II | 99.741% | 22 horas | UPS básico, A/C, mantenimiento permitido |
| III | 99.982% | 1.6 horas | Múltiples caminos, UPS redundante, hot-swap |
| IV | 99.995% | 26 minutos | Redundancia completa, SLA 4 horas |

**En la práctica**:
```
Tier I:  Pequeñas oficinas, startups
Tier II: Empresas medianas, retailers
Tier III: Bancos, e-commerce, telecomunicaciones
Tier IV: Infraestructura crítica, defensa, salud
```

### Infraestructura de CPD

#### Refrigeración

```
Métodos:
1. CRAC (Computer Room Air Conditioning)
   - Aire forzado desde piso elevado
   - Distribución por canales debajo de piso

2. CRAH (Computer Room Air Handler)
   - Agua enfriada, mejor eficiencia
   - Temperatura más precisa

3. In-row cooling
   - Refrigeradores entre racks
   - Mejor eficiencia energética

Temperatura objetivo: 18-27°C
Humedad: 35-65% RH
```

#### Redundancia de Alimentación

```
Configuración típica Tier III:
- 2 acometidas eléctricas diferentes
- 2 SAI/UPS separados
- Cada servidor con 2 PSU (una por acometida)
- Cables de diferente color (color = acometida)

PDU (Power Distribution Unit):
- Distribuye energía a racks
- Monitoreado remotamente
- Salidas controlables individualmente
```

#### Pisos Elevados

```
Ventajas:
- Circulación de aire por debajo
- Cableado organizado
- Mantenimiento sin afectar operación
- Altura típica: 30-90 cm

Estructura:
Suelo técnico → Espacio de aire → Equipamiento
↓                ↓
Cables           Aire frío
Tuberías         Suministro
```

### Racks y Unidades

**Rack Unit (U)**:
```
1U = 1.75 pulgadas = 44.45 mm

Alturas típicas:
- 1U: Switch de red, algunos servidores
- 2U: Servidores blade, almacenamiento compacto
- 3U-4U: Almacenamiento, servidores potentes
- 6U-8U: Servidores duales, equipamiento grande

Cálculo de espacio:
Altura rack = 42U típico (1850 mm)
Espacio ocupado ÷ 42 = número de units
```

## Métricas de Eficiencia Energética

### PUE (Power Usage Effectiveness)

```
PUE = Potencia total CPD / Potencia IT equipment

PUE = 2.0 : Por cada 1W en servidores, 2W total (50% eficiencia)
PUE = 1.5 : 67% eficiencia (muy bueno)
PUE = 1.2 : 83% eficiencia (excelente)
PUE = 1.0 : 100% eficiencia (teórico, imposible)

Mejora de PUE:
1. Virtualización (densidad)
2. Refrigeración eficiente
3. Distribución energía optimizada
4. Apagado de equipamiento no usado
```

### Cálculo de PUE

```
Ejemplo CPD:
- Potencia IT: 500 kW (servidores activos)
- HVAC (refrigeración): 400 kW
- Iluminación: 30 kW
- Otras infraestructura: 70 kW
- Total: 1000 kW

PUE = 1000 / 500 = 2.0

Para reducir:
- Mejorar HVAC: -100 kW
- Virtualizar: +200 kW IT (menos hardware)
- Nuevo PUE = 900 / 700 = 1.29
```

## Gestión de Cables

### Best Practices de Cableado

```
Categorización de cables:

1. Energía:
   - Cables gruesos (rojo, negro, azul)
   - Separados de datos por >5cm
   - Canales específicos

2. Red:
   - Cat6 mínimo (10 Gbps)
   - Cat6A recomendado
   - Enrutamiento limpio

3. Rack:
   - Cable vertical por trasera
   - Cinta de velcro (no zip ties apretadas)
   - Identificación clara (etiquetas)

4. Documentación:
   - Plano de cableado
   - Mapeo de puertos
   - Versión actualizada
```

## Seguridad Física en CPD

### Controles de Acceso

```
Niveles de acceso:
1. Perímetro: Valla, guardia, credencial
2. Entrada: Control de acceso biométrico
3. Sala servidores: Badge + PIN
4. Racks especiales: Cerraduras físicas

Registro:
- Quién entra/sale
- Cuándo
- Duración
```

### Protección contra Incendios

```
Sistemas:
1. Detección: Sensores de humo, temperatura
2. Extinción:
   - Rociadores NO en sala servidores
   - Sistemas FM-200 o IG-541 (no conductivos)
   - Extintores manuales de CO2

Procedimiento:
1. Alarma → Evacuación
2. Sistema auto-extinción
3. Poder apagado remoto
```

---

Un CPD bien diseñado es la columna vertebral de cualquier operación IT moderna. La inversión en redundancia y monitoreo es crítica.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

-- ─── Lenguaje de Marcas ────────────────────────────────────────
INSERT INTO theory_subjects (name, slug, description, icon, order_index)
VALUES ('Lenguaje de Marcas', 'lenguaje-de-marcas', 'HTML5, XML, DTD, XSD, JSON, YAML y formatos de datos para el intercambio de información.', '📝', 5)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      order_index = EXCLUDED.order_index;

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'lenguaje-de-marcas'),
  'Guía completa: HTML5 Semántico y Estructura Web',
  'html5-semantico-estructura-web',
  $MKDN$
# Guía completa: HTML5 Semántico y Estructura Web

## Historia y Evolución de HTML

### De HTML4 a HTML5

| Versión | Año | Características | Estado |
|---|---|---|---|
| HTML 1.0 | 1993 | Básico, solo texto | Obsoleto |
| HTML 2.0 | 1995 | Formularios, tablas | Obsoleto |
| HTML 3.2 | 1997 | Applets, scripts | Obsoleto |
| HTML 4.01 | 1999 | CSS, JavaScript avanzado | Legado |
| XHTML 1.0 | 2000 | Versión strict XML | Legado |
| HTML5 | 2014 | Semántica, APIs, multimedia | Estándar actual |

**HTML5 Ventajas**:
- Semántica: Tags que describen contenido
- APIs: Canvas, Geolocation, Storage, Web Workers
- Multimedia nativa: Video, Audio sin plugins
- Mejor accesibilidad integrada
- Mobile-first design

## Estructura Básica de HTML5

### DOCTYPE y Documento Mínimo

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página Web</title>
</head>
<body>
    <h1>Bienvenido</h1>
</body>
</html>
```

**DOCTYPE**: `<!DOCTYPE html>`
- Obligatorio en HTML5 (antes era largo y complicado)
- Indica al navegador que es HTML5
- Sin él, navegadores usan "Quirks Mode" (compatibilidad vieja)

### Meta Tags Esenciales

| Meta Tag | Propósito | Ejemplo |
|---|---|---|
| charset | Codificación de caracteres | `<meta charset="UTF-8">` |
| viewport | Diseño responsive | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` |
| description | SEO, descripción página | `<meta name="description" content="Descripción para buscadores">` |
| author | Autor del contenido | `<meta name="author" content="Juan Pérez">` |
| keywords | Palabras clave (obsoleto pero usado) | `<meta name="keywords" content="palabra1, palabra2">` |
| og:title | Open Graph (redes sociales) | `<meta property="og:title" content="Título">` |
| og:image | Open Graph imagen | `<meta property="og:image" content="imagen.jpg">` |

```html
<!-- Ejemplo completo -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tienda online de artículos electrónicos">
    <meta name="author" content="Tech Shop S.L.">
    <meta property="og:title" content="Tech Shop - Electrónica">
    <meta property="og:image" content="logo.png">
    <title>Tech Shop | Tienda Online</title>
</head>
```

## Elementos Semánticos HTML5

### Estructura Semántica Completa

```html
<body>
    <header>Encabezado principal</header>
    <nav>Navegación</nav>
    <main>
        <article>
            <h1>Título artículo</h1>
            <section>Sección 1</section>
            <section>Sección 2</section>
        </article>
        <aside>Contenido relacionado</aside>
    </main>
    <footer>Pie de página</footer>
</body>
```

### Elementos Semánticos Principales

| Elemento | Uso | Ubicación Típica |
|---|---|---|
| `<header>` | Encabezado (logo, título) | Superior página/sección |
| `<nav>` | Navegación principal | Dentro `<header>` o lateral |
| `<main>` | Contenido principal único | Una sola vez por página |
| `<article>` | Contenido independiente | Blog post, noticia |
| `<section>` | Sección temática | Agrupar contenido relacionado |
| `<aside>` | Contenido lateral/relacionado | Sidebar, publicidad |
| `<footer>` | Pie de página | Inferior página/sección |

### Diferencias: Div vs Elementos Semánticos

```html
<!-- Malo: DIV sin semántica -->
<div id="header">
    <div class="title">Mi Blog</div>
    <div id="nav">
        <div><a href="/">Inicio</a></div>
    </div>
</div>

<!-- Bueno: Semántica HTML5 -->
<header>
    <h1>Mi Blog</h1>
    <nav>
        <a href="/">Inicio</a>
    </nav>
</header>
```

**Beneficios de semántica**:
- SEO: Buscadores entienden estructura
- Accesibilidad: Lectores de pantalla navegación clara
- Mantenibilidad: Código más legible
- Compatibilidad: Mejor soporte mobile

## Jerarquía de Encabezados

```html
<h1>Título principal (una sola vez por página)</h1>
    <h2>Subsección importante</h2>
        <h3>Sub-subsección</h3>
        <h3>Sub-subsección</h3>
    <h2>Otra subsección</h2>
        <h3>Sub-subsección</h3>

<!-- NO HACER: Saltar niveles -->
<h1>Título</h1>
<h3>Subsección (MALO, falta h2)</h3>
```

| Nivel | Uso | Frecuencia | Importancia |
|---|---|---|---|
| H1 | Título principal de página | Una sola | Crítica para SEO |
| H2 | Títulos principales de secciones | 3-5 típico | Muy importante |
| H3 | Subtítulos | Múltiples | Importante |
| H4-H6 | Detalles anidados | Pocas | Menor |

## Elementos de Texto

### Semántica vs Presentación

```html
<!-- MALO: Solo presentación visual -->
<b>Texto importante</b>     <!-- Bold -->
<i>Texto énfasis</i>        <!-- Italic -->

<!-- BUENO: Semántica correcta -->
<strong>Texto importante</strong>    <!-- Énfasis fuerte -->
<em>Texto énfasis</em>              <!-- Énfasis normal -->

<!-- Más elementos -->
<mark>Texto resaltado (amarillo)</mark>
<del>Texto eliminado</del>
<ins>Texto insertado</ins>
<abbr title="HyperText Markup Language">HTML</abbr>
<cite>Referencia a obra</cite>
<code>Código de programación</code>
```

| Elemento | Semántica | Visual | Caso de Uso |
|---|---|---|---|
| `<strong>` | Énfasis fuerte | Bold | Importante |
| `<em>` | Énfasis normal | Italic | Énfasis literario |
| `<mark>` | Marcado/resaltado | Fondo color | Búsqueda, realce |
| `<del>` | Suprimido | Tachado | Cambios documentados |
| `<abbr>` | Abreviación | Ninguno | Siglas con explicación |

## Listas

### Listas Desordenadas (UL)

```html
<ul>
    <li>Elemento 1</li>
    <li>Elemento 2</li>
    <li>Elemento 3</li>
</ul>
```

### Listas Ordenadas (OL)

```html
<ol>
    <li>Primero</li>
    <li>Segundo</li>
    <li>Tercero</li>
</ol>

<!-- Tipos de numeración -->
<ol type="i">          <!-- i, I, a, A, 1 (defecto) -->
    <li>Uno</li>
    <li>Dos</li>
</ol>
```

### Listas de Definición (DL)

```html
<dl>
    <dt>RAID</dt>
    <dd>Redundant Array of Independent Disks</dd>

    <dt>BIOS</dt>
    <dd>Basic Input/Output System</dd>
</dl>
```

## Enlaces (Hipervínculos)

```html
<!-- Enlace básico -->
<a href="https://ejemplo.com">Texto del enlace</a>

<!-- Atributos importantes -->
<a href="pagina.html"              <!-- Destino -->
   target="_blank"                  <!-- Nueva pestaña -->
   rel="noopener noreferrer"        <!-- Seguridad -->
   title="Título al pasar mouse"    <!-- Tooltip -->
   class="btn btn-primary">
   Enlace importante
</a>

<!-- Tipos de enlaces -->
<a href="https://ejemplo.com">Externo</a>
<a href="/pagina">Raíz del sitio</a>
<a href="relativa">Relativa a carpeta actual</a>
<a href="#seccion">Ancla (dentro de página)</a>
<a href="mailto:info@ejemplo.com">Email</a>
<a href="tel:+34666123456">Teléfono</a>
<a href="#" download="archivo.pdf">Descargar</a>
```

| Atributo | Propósito | Ejemplo |
|---|---|---|
| href | Destino del enlace | `https://ejemplo.com` |
| target | Dónde abrir | `_blank` (nueva), `_self` (actual) |
| rel | Relación | `noopener`, `noreferrer`, `external` |
| title | Tooltip | Texto informativo |
| download | Descargar archivo | Nombre archivo descarga |

## Imágenes Responsive

### Imagen Básica

```html
<img src="foto.jpg"
     alt="Descripción importante para SEO y accesibilidad"
     title="Tooltip al pasar mouse"
     width="800"
     height="600">
```

### Imágenes Responsive (Srcset)

```html
<!-- Srcset para diferentes densidades de pantalla -->
<img src="foto-600.jpg"
     srcset="foto-300.jpg 300w,
             foto-600.jpg 600w,
             foto-1200.jpg 1200w"
     sizes="(max-width: 600px) 100vw,
            (max-width: 1200px) 50vw,
            33vw"
     alt="Descripción">
```

**Explicación**:
- `srcset`: Conjunto de imágenes con ancho (300w = 300px)
- `sizes`: Qué ancho usar según viewport
- Navegador elige automáticamente imagen óptima

### Picture Element (Compatibilidad)

```html
<picture>
    <source media="(max-width: 600px)" srcset="mobile.jpg">
    <source media="(max-width: 1200px)" srcset="tablet.jpg">
    <img src="desktop.jpg" alt="Descripción">
</picture>
```

## Tablas Semánticas

```html
<table>
    <thead>
        <tr>
            <th scope="col">Encabezado 1</th>
            <th scope="col">Encabezado 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Dato 1</td>
            <td>Dato 2</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th scope="row">Total</th>
            <td>Suma</td>
        </tr>
    </tfoot>
</table>
```

| Elemento | Propósito | scope |
|---|---|---|
| `<thead>` | Encabezados de tabla | col |
| `<tbody>` | Cuerpo de datos | — |
| `<tfoot>` | Pie/totales | — |
| `<th>` | Celda de encabezado | `col` o `row` |
| `<td>` | Celda de dato | — |

## Formularios

### Estructura Completa

```html
<form method="POST" action="/procesar" enctype="multipart/form-data">

    <!-- Agrupamiento de campos -->
    <fieldset>
        <legend>Datos Personales</legend>

        <!-- Campo de texto con etiqueta -->
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" name="nombre" required>

        <!-- Email con validación nativa -->
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>

        <!-- Contraseña -->
        <label for="pass">Contraseña:</label>
        <input type="password" id="pass" name="password" minlength="8">

        <!-- Select/Dropdown -->
        <label for="pais">País:</label>
        <select id="pais" name="pais" required>
            <option value="">-- Selecciona --</option>
            <option value="es">España</option>
            <option value="mx">México</option>
        </select>

        <!-- Textarea -->
        <label for="comentarios">Comentarios:</label>
        <textarea id="comentarios" name="comentarios" rows="5" cols="40"></textarea>

        <!-- Checkbox -->
        <input type="checkbox" id="newsletter" name="newsletter">
        <label for="newsletter">Suscribir a newsletter</label>

        <!-- Radio buttons -->
        <fieldset>
            <legend>Género</legend>
            <input type="radio" id="hombre" name="genero" value="m">
            <label for="hombre">Hombre</label>
            <input type="radio" id="mujer" name="genero" value="f">
            <label for="mujer">Mujer</label>
        </fieldset>
    </fieldset>

    <!-- Botón submit -->
    <button type="submit">Enviar formulario</button>
    <button type="reset">Limpiar</button>
</form>
```

### Tipos de Input HTML5

| Tipo | Validación | Teclado Móvil | Caso |
|---|---|---|---|
| text | Ninguna | Normal | Texto genérico |
| email | Formato email | @, . | Correo electrónico |
| tel | Ninguna | Numérico | Teléfono |
| number | Numérico | Numérico | Cantidades |
| date | ISO 8601 | Picker | Fechas |
| time | Formato 24h | Picker | Horas |
| color | Hex color | Picker color | Selección color |
| range | 0-100 | Slider | Deslizador |
| file | Tipo archivo | File picker | Descarga archivo |
| checkbox | Booleano | Casilla | Múltiple selección |
| radio | Booleano | Radio | Una opción |

### Validación en HTML5

```html
<!-- Atributos de validación -->
<input type="email"
       required                      <!-- Obligatorio -->
       minlength="5"                 <!-- Mínimo caracteres -->
       maxlength="50"                <!-- Máximo caracteres -->
       pattern="[A-Z]{3}\d{3}"       <!-- Regex: ABC123 -->
       placeholder="Introduce email">

<!-- Validación numérica -->
<input type="number"
       min="0"
       max="100"
       step="5">

<!-- Select con datalist (autocomplete) -->
<input list="navegadores" placeholder="Navegador">
<datalist id="navegadores">
    <option value="Chrome"></option>
    <option value="Firefox"></option>
    <option value="Safari"></option>
</datalist>
```

## Multimedia

### Video HTML5

```html
<video width="320" height="240" controls>
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Tu navegador no soporta HTML5 video.
</video>

<!-- Con atributos -->
<video width="100%" autoplay muted loop poster="portada.jpg">
    <source src="video.mp4" type="video/mp4">
</video>
```

| Atributo | Propósito |
|---|---|
| controls | Mostrar controles reproducción |
| autoplay | Reproducir automáticamente |
| muted | Silenciado (requerido para autoplay) |
| loop | Repetir indefinidamente |
| poster | Imagen previa |

### Audio HTML5

```html
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    Tu navegador no soporta HTML5 audio.
</audio>

<!-- Con controles personalizados -->
<audio id="miAudio">
    <source src="musica.mp3" type="audio/mpeg">
</audio>
<button onclick="document.getElementById('miAudio').play()">
    Reproducir
</button>
```

## Accesibilidad Básica

```html
<!-- ARIA labels para elementos sin texto -->
<button aria-label="Cerrar menú">✕</button>

<!-- Roles ARIA -->
<div role="navigation">Navegación principal</div>
<div role="main">Contenido principal</div>

<!-- Tabindex para navegación teclado -->
<a href="/" tabindex="1">Inicio</a>
<a href="/sobre" tabindex="2">Sobre</a>

<!-- Skip to main content (accesibilidad) -->
<a href="#main" class="skip-to-main">Ir al contenido</a>
...
<main id="main">Contenido</main>
```

---

HTML5 semántico es la base de webs modernas, accesibles y optimizadas para SEO. Use siempre elementos semánticos apropiados.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'lenguaje-de-marcas'),
  'Guía completa: XML, DTD y Esquemas XSD',
  'xml-dtd-y-xsd',
  $MKDN$
# Guía completa: XML, DTD y Esquemas XSD

## Introducción a XML

### ¿Qué es XML?

XML (eXtensible Markup Language) es un estándar para almacenar y transportar datos estructurados de forma legible.

**Características**:
- Auto-descriptivo: Los tags describen su contenido
- Jerárquico: Estructura padre-hijo
- Independiente de plataforma
- Separación de contenido y presentación

### Casos de Uso

| Caso de Uso | Ejemplo | Ventaja |
|---|---|---|
| Archivos de configuración | pom.xml (Maven), web.xml | Legible, estructurado |
| Intercambio de datos | SOAP, Web Services | Estándar universal |
| Almacenamiento | Bases datos XML | Queries complejas |
| Documentos | OOXML (Office), SVG | Compatibilidad |

## Sintaxis XML Fundamental

### Documento XML Válido

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Declaración XML (opcional pero recomendado) -->

<biblioteca>
    <libro id="1">
        <titulo>La Odisea</titulo>
        <autor>Homero</autor>
        <año>800</año>
        <disponible>true</disponible>
    </libro>
    <libro id="2">
        <titulo>Don Quijote</titulo>
        <autor>Cervantes</autor>
        <año>1605</año>
        <disponible>false</disponible>
    </libro>
</biblioteca>
```

### Reglas XML

| Regla | Ejemplo Correcto | Ejemplo Incorrecto |
|---|---|---|
| Un elemento raíz | `<root>...</root>` | Sin elemento raíz |
| Tags cerrados | `<item></item>` | `<item>` (abierto) |
| Tags anidados correctamente | `<a><b></b></a>` | `<a><b></a></b>` |
| Atributos entrecomillados | `attr="valor"` | `attr=valor` |
| Mayúscula sensible | `<Libro>` ≠ `<libro>` | — |

### Well-Formed vs Valid

**Well-Formed**: Cumple reglas XML sintácticas
```xml
<!-- Well-formed pero no necesariamente válido -->
<datos>
    <numero>123</numero>
</datos>
```

**Valid**: Well-formed + cumple DTD/XSD
```xml
<!-- Valida contra esquema -->
<persona>
    <nombre>Juan</nombre>
    <edad>30</edad>  <!-- Edad debe ser número entero -->
</persona>
```

## Elementos vs Atributos

### Cuándo Usar Cada Uno

```xml
<!-- MALO: Todo en atributos -->
<persona nombre="Juan" edad="30" ciudad="Madrid">
</persona>

<!-- MEJOR: Estructura clara -->
<persona id="1">
    <nombre>Juan</nombre>
    <edad>30</edad>
    <ciudad>Madrid</ciudad>
</persona>

<!-- HÍBRIDO: Atributos para metadatos -->
<persona id="1" estado="activo">
    <nombre>Juan</nombre>
    <edad>30</edad>
</persona>
```

| Aspecto | Elementos | Atributos |
|---|---|---|
| Contenido | Sí | Limitado |
| Múltiples valores | Fácil | Difícil |
| Búsqueda/XPath | Mejor | Peor |
| Legibilidad | Mejor | Compacto |
| Uso | Contenido, datos | Metadatos, ID |

## Namespaces (Espacios de Nombres)

### Propósito

Evitar conflictos de nombres en documentos XML complejos:

```xml
<?xml version="1.0"?>
<pedido xmlns="http://ejemplo.com/pedidos"
        xmlns:cliente="http://ejemplo.com/clientes"
        xmlns:producto="http://ejemplo.com/productos">

    <id>PED-001</id>

    <cliente:datos>
        <cliente:nombre>Juan García</cliente:nombre>
        <cliente:email>juan@ejemplo.com</cliente:email>
    </cliente:datos>

    <producto:items>
        <producto:item>
            <producto:nombre>Laptop</producto:nombre>
            <producto:precio>999</producto:precio>
        </producto:item>
    </producto:items>

</pedido>
```

### Declaración de Namespaces

```xml
<!-- Default namespace (sin prefijo) -->
<root xmlns="http://ejemplo.com/default">
    <elemento>Usa namespace default</elemento>
</root>

<!-- Múltiples namespaces con prefijos -->
<root xmlns:a="http://ejemplo.com/a"
      xmlns:b="http://ejemplo.com/b">
    <a:elemento>Namespace A</a:elemento>
    <b:elemento>Namespace B</b:elemento>
</root>
```

## Caracteres Especiales y CDATA

### Entidades XML Predefinidas

```xml
<!-- Caracteres especiales requieren escape -->
<descripcion>
    El símbolo &lt; significa "menor que"
    El símbolo &gt; significa "mayor que"
    El símbolo &amp; significa "y"
    El símbolo &apos; es apóstrofo
    El símbolo &quot; es comilla
</descripcion>

<!-- CDATA: Sección para contenido literal sin escape -->
<codigo>
    <![CDATA[
        if (x < 10 && y > 5) {
            return x + "&valor";
        }
    ]]>
</codigo>
```

| Entidad | Carácter | Uso |
|---|---|---|
| `&lt;` | < | Menor que |
| `&gt;` | > | Mayor que |
| `&amp;` | & | Y (ampersand) |
| `&apos;` | ' | Apóstrofo |
| `&quot;` | " | Comilla |

## Comentarios XML

```xml
<?xml version="1.0"?>
<documento>
    <!-- Este es un comentario simple -->

    <!--
        Comentario multilínea
        Segunda línea del comentario
        Tercera línea
    -->

    <datos>
        <!-- Comentarios se ignoran en parseo -->
    </datos>
</documento>
```

## DTD: Document Type Definition

### DTD Inline (Interno)

```xml
<?xml version="1.0"?>
<!DOCTYPE biblioteca [
    <!ELEMENT biblioteca (libro*)>
    <!ELEMENT libro (titulo, autor, año, disponible)>
    <!ELEMENT titulo (#PCDATA)>
    <!ELEMENT autor (#PCDATA)>
    <!ELEMENT año (#PCDATA)>
    <!ELEMENT disponible (#PCDATA)>
    <!ATTLIST libro id ID #REQUIRED>
]>
<biblioteca>
    <libro id="lib1">
        <titulo>El Quijote</titulo>
        <autor>Cervantes</autor>
        <año>1605</año>
        <disponible>true</disponible>
    </libro>
</biblioteca>
```

### DTD Externo

```xml
<!-- archivo.xml -->
<?xml version="1.0"?>
<!DOCTYPE biblioteca SYSTEM "biblioteca.dtd">
<biblioteca>
    <libro id="lib1">
        <titulo>El Quijote</titulo>
        <autor>Cervantes</autor>
        <año>1605</año>
        <disponible>true</disponible>
    </libro>
</biblioteca>
```

```dtd
<!-- biblioteca.dtd -->
<!ELEMENT biblioteca (libro*)>
<!ELEMENT libro (titulo, autor, año, disponible)>
<!ELEMENT titulo (#PCDATA)>
<!ELEMENT autor (#PCDATA)>
<!ELEMENT año (#PCDATA)>
<!ELEMENT disponible (#PCDATA)>
<!ATTLIST libro id ID #REQUIRED>
```

### Declaraciones DTD

**ELEMENT**:
```dtd
<!ELEMENT nombre (contenido)>

Ejemplos:
<!ELEMENT persona (nombre, edad)>              <!-- Secuencia obligatoria -->
<!ELEMENT persona (nombre, edad, ciudad?)>    <!-- ? = opcional (0-1) -->
<!ELEMENT persona (nombre+)>                   <!-- + = uno o más -->
<!ELEMENT persona (nombre*)>                   <!-- * = cero o más -->
<!ELEMENT persona (nombre | apellido)>         <!-- | = elección (una u otra) -->
<!ELEMENT persona ANY>                         <!-- ANY = cualquier contenido -->
<!ELEMENT texto (#PCDATA)>                     <!-- #PCDATA = texto plano -->
```

**ATTLIST** (Atributos):
```dtd
<!ATTLIST elemento atributo tipo default>

Ejemplo:
<!ATTLIST libro id ID #REQUIRED>
<!ATTLIST libro estado (disponible|prestado) "disponible">
<!ATTLIST libro fecha CDATA #IMPLIED>

Tipos:
- CDATA: Cualquier texto
- ID: Identificador único
- IDREF: Referencia a ID
- NMTOKEN: Token de nombre
- NOTATION: Notación declarada
- Enumeración: (valor1|valor2|valor3)

Valores por defecto:
- #REQUIRED: Obligatorio
- #IMPLIED: Opcional
- "valor": Valor por defecto
- #FIXED "valor": Fijo, no puede cambiar
```

**ENTITY** (Entidades):
```dtd
<!ENTITY nombre "valor">
<!ENTITY empresa "Tech Shop S.L.">
<!ENTITY copyright "(c) 2024 Tech Shop">
```

### Limitaciones de DTD

- Solo validación básica
- No soporta tipos de datos complejos
- Sintaxis antigua y complicada
- No reconoce namespaces bien
- Flexibilidad limitada

## XSD: XML Schema Definition

### Ventajas sobre DTD

| Característica | DTD | XSD |
|---|---|---|
| Sintaxis | Antigua | Moderna, XML-based |
| Tipos de datos | Limitados | Extensibles |
| Validación numérica | No | Sí |
| Patrones regex | No | Sí |
| Namespaces | Limitado | Completo |
| Reutilización | Complicada | Fácil |
| Curva aprendizaje | Media | Empinada |

### Estructura Básica de XSD

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

    <xs:element name="biblioteca">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="libro" type="libroType" maxOccurs="unbounded"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>

    <xs:complexType name="libroType">
        <xs:sequence>
            <xs:element name="titulo" type="xs:string"/>
            <xs:element name="autor" type="xs:string"/>
            <xs:element name="año" type="xs:gYear"/>
            <xs:element name="disponible" type="xs:boolean"/>
        </xs:sequence>
        <xs:attribute name="id" type="xs:ID" use="required"/>
    </xs:complexType>

</xs:schema>
```

### Tipos de Datos XSD Básicos

| Tipo | Descripción | Ejemplo |
|---|---|---|
| xs:string | Cadena de texto | "Hola" |
| xs:integer | Número entero | 123 |
| xs:decimal | Número decimal | 99.99 |
| xs:boolean | Verdadero/Falso | true, false |
| xs:date | Fecha ISO | 2024-03-11 |
| xs:time | Hora | 14:30:00 |
| xs:dateTime | Fecha + hora | 2024-03-11T14:30:00 |
| xs:gYear | Año | 2024 |
| xs:double | Número flotante | 3.14159 |

### Tipos Complejos

**Sequence (Secuencia - Orden obligatorio)**:
```xml
<xs:element name="persona">
    <xs:complexType>
        <xs:sequence>
            <xs:element name="nombre" type="xs:string"/>
            <xs:element name="edad" type="xs:integer"/>
            <xs:element name="ciudad" type="xs:string"/>
        </xs:sequence>
    </xs:complexType>
</xs:element>
```

**All (Todos - Orden flexible)**:
```xml
<xs:complexType>
    <xs:all>
        <xs:element name="nombre" type="xs:string"/>
        <xs:element name="edad" type="xs:integer"/>
    </xs:all>
</xs:complexType>
```

**Choice (Elección - Una o la otra)**:
```xml
<xs:complexType>
    <xs:choice>
        <xs:element name="email" type="xs:string"/>
        <xs:element name="telefono" type="xs:string"/>
    </xs:choice>
</xs:complexType>
```

### Restricciones en XSD

```xml
<!-- String con restricciones -->
<xs:element name="username">
    <xs:simpleType>
        <xs:restriction base="xs:string">
            <xs:minLength value="3"/>
            <xs:maxLength value="20"/>
            <xs:pattern value="[a-zA-Z0-9_]+"/>
        </xs:restriction>
    </xs:simpleType>
</xs:element>

<!-- Número con restricciones -->
<xs:element name="edad">
    <xs:simpleType>
        <xs:restriction base="xs:integer">
            <xs:minInclusive value="0"/>
            <xs:maxInclusive value="150"/>
        </xs:restriction>
    </xs:simpleType>
</xs:element>

<!-- Enumeración (valores permitidos) -->
<xs:element name="estado">
    <xs:simpleType>
        <xs:restriction base="xs:string">
            <xs:enumeration value="activo"/>
            <xs:enumeration value="inactivo"/>
            <xs:enumeration value="suspendido"/>
        </xs:restriction>
    </xs:simpleType>
</xs:element>
```

| Restricción | Propósito | Ejemplo |
|---|---|---|
| minLength | Longitud mínima | 3 caracteres |
| maxLength | Longitud máxima | 50 caracteres |
| pattern | Regex validación | `[a-zA-Z0-9]+` |
| minInclusive | Valor mínimo | 0 |
| maxInclusive | Valor máximo | 100 |
| enumeration | Valores permitidos | activo, inactivo |
| totalDigits | Total de dígitos | 5 (12345) |
| fractionDigits | Decimales | 2 (99.99) |

## Validación de XML

### Con XSD en Python

```python
from lxml import etree

# Cargar esquema XSD
schema_doc = etree.parse('schema.xsd')
schema = etree.XMLSchema(schema_doc)

# Cargar documento XML
xml_doc = etree.parse('documento.xml')

# Validar
if schema.validate(xml_doc):
    print("XML válido")
else:
    print("Errores:")
    print(schema.error_log)
```

### Validación Online

Herramientas disponibles:
- XMLValidator.com
- w3schools.com/xml/xml_validator.asp
- Editores: VS Code (XML Tools extension), oXygen XML

## XML en la Práctica

### Maven pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>
    <groupId>com.ejemplo</groupId>
    <artifactId>mi-app</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

</project>
```

### Web.xml (Configuración Servlet)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                             http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <servlet>
        <servlet-name>mi-servlet</servlet-name>
        <servlet-class>com.ejemplo.MiServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <servlet-name>mi-servlet</servlet-name>
        <url-pattern>/api/*</url-pattern>
    </servlet-mapping>

</web-app>
```

### Spring applicationContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/midb"/>
        <property name="username" value="root"/>
        <property name="password" value="password"/>
    </bean>

    <bean id="personaService" class="com.ejemplo.PersonaService">
        <property name="dataSource" ref="dataSource"/>
    </bean>

</beans>
```

---

XML es fundamental para muchas tecnologías empresariales. Entender DTD y XSD es crucial para validación de datos confiable.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

INSERT INTO theory_posts (subject_id, title, slug, markdown_content, created_at, updated_at)
VALUES (
  (SELECT id FROM theory_subjects WHERE slug = 'lenguaje-de-marcas'),
  'Guía completa: JSON, YAML y Formatos de Datos',
  'json-yaml-y-formatos-datos',
  $MKDN$
# Guía completa: JSON, YAML y Formatos de Datos

## JSON: JavaScript Object Notation

### ¿Qué es JSON?

JSON es un formato ligero para intercambio de datos estructurados:
- Basado en pares clave-valor
- Fácil de leer y parsear
- Estándar de facto en APIs REST
- Independiente de lenguaje

### Tipos de Datos JSON

```json
{
    "cadena": "Hola mundo",
    "numero": 42,
    "decimal": 3.14,
    "booleano": true,
    "nulo": null,
    "array": [1, 2, 3, "cuatro"],
    "objeto": {
        "clave": "valor",
        "anidado": {
            "profundidad": 2
        }
    }
}
```

| Tipo | Ejemplo | Uso |
|---|---|---|
| String | `"texto"` | Cadenas, deben estar entrecomilladas |
| Number | `123`, `3.14` | Enteros y decimales |
| Boolean | `true`, `false` | Lógico |
| Null | `null` | Valor nulo/vacío |
| Array | `[1, 2, 3]` | Lista ordenada |
| Object | `{"key": "value"}` | Pares clave-valor |

### JSON Válido

```json
{
    "usuario": {
        "id": 1,
        "nombre": "Juan García",
        "email": "juan@ejemplo.com",
        "activo": true,
        "roles": ["admin", "usuario"],
        "metadata": {
            "ultimoAcceso": "2024-03-11T14:30:00Z",
            "intentosFallidos": 0
        }
    },
    "pagina": 1,
    "total": 100
}
```

**Reglas JSON**:
- Strings siempre con comillas dobles (no simples)
- Sin comas finales en arrays u objetos
- No hay comentarios en JSON válido
- Nombres de propiedades deben estar entrecomillados

### JSON Schema para Validación

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "nombre": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "edad": {
            "type": "integer",
            "minimum": 0,
            "maximum": 150
        },
        "email": {
            "type": "string",
            "format": "email"
        },
        "roles": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["admin", "editor", "viewer"]
            }
        }
    },
    "required": ["nombre", "email"]
}
```

### Parsing JSON en Python

```python
import json

# String JSON a diccionario Python
json_str = '{"nombre": "Juan", "edad": 30}'
datos = json.loads(json_str)
print(datos["nombre"])  # Juan

# Diccionario Python a string JSON
datos = {"nombre": "María", "edad": 28}
json_str = json.dumps(datos, indent=2)
print(json_str)
# {
#   "nombre": "María",
#   "edad": 28
# }

# Leer archivo JSON
with open('datos.json', 'r') as f:
    datos = json.load(f)

# Escribir archivo JSON
with open('datos.json', 'w') as f:
    json.dump(datos, f, indent=2, ensure_ascii=False)
```

### Parsing JSON en JavaScript

```javascript
// String JSON a objeto JavaScript
const jsonStr = '{"nombre": "Juan", "edad": 30}';
const datos = JSON.parse(jsonStr);
console.log(datos.nombre);  // Juan

// Objeto JavaScript a string JSON
const datos = {nombre: "María", edad: 28};
const jsonStr = JSON.stringify(datos, null, 2);
console.log(jsonStr);

// Acceso a propiedades
console.log(datos.edad);        // 28
console.log(datos["nombre"]);   // María

// Iteración
for (const key in datos) {
    console.log(`${key}: ${datos[key]}`);
}
```

## YAML: YAML Ain't Markup Language

### ¿Qué es YAML?

YAML es formato de configuración legible basado en indentación:
- Diseñado para humanos (no máquinas)
- Indentación define estructura
- Muy usado en DevOps y CI/CD

### Sintaxis YAML

```yaml
# Comentarios con #

# Pares clave-valor (mapas)
nombre: Juan García
edad: 30
activo: true
sueldo: 2500.50
fecha_inicio: 2024-03-11
ciudad: Madrid
ciudad_anterior: null    # Valor nulo

# Listas (arrays)
habilidades:
  - Python
  - JavaScript
  - SQL
  - Docker

# Forma alternativa de lista (fluida)
lenguajes: [Python, Java, Go, Rust]

# Objetos anidados (mapas)
contacto:
  email: juan@ejemplo.com
  telefono: 666-123-456
  ubicacion:
    calle: Calle Principal 123
    codigo_postal: 28001
    pais: España

# Strings multilinea
descripcion: |
  Esta es una descripción
  que abarca múltiples líneas
  y mantiene los saltos de línea

resumen: >
  Este texto está en una sola línea
  aunque esté escrito en múltiples
  en el archivo YAML

# Secuencias de mapas
empleados:
  - nombre: Juan
    puesto: Desarrollador
    sueldo: 3000
  - nombre: María
    puesto: Diseñadora
    sueldo: 2800
```

| Concepto | Sintaxis | Nota |
|---|---|---|
| Mapa (objeto) | `clave: valor` | Indentación = jerarquía |
| Lista | `- item` | Guión + espacio |
| String | `valor` | Comillas opcionales |
| Number | `42`, `3.14` | Sin comillas |
| Boolean | `true`, `false` | Minúsculas |
| Null | `null` | O vacío |

### YAML vs JSON

```json
{
  "nombre": "Juan",
  "edad": 30,
  "activo": true,
  "habilidades": ["Python", "JavaScript"],
  "contacto": {
    "email": "juan@ejemplo.com",
    "telefono": "666-123"
  }
}
```

```yaml
nombre: Juan
edad: 30
activo: true
habilidades:
  - Python
  - JavaScript
contacto:
  email: juan@ejemplo.com
  telefono: 666-123
```

| Aspecto | JSON | YAML |
|---|---|---|
| Sintaxis | Llaves y corchetes | Indentación |
| Legibilidad | Media | Excelente |
| Verbosidad | Alta | Baja |
| Comentarios | No | Sí (#) |
| Curva aprendizaje | Baja | Media |
| Parseo | Rápido | Más lento |
| Archivos pequeños | Mejor | — |
| Archivos grandes | — | Mejor |
| APIs REST | Estándar | Raro |
| Configuración | Posible | Excelente |

### YAML en Práctica

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - NGINX_HOST=ejemplo.com
      - NGINX_PORT=80
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret123
      MYSQL_DATABASE: myapp
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  db_data:
```

**Kubernetes Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-container
        image: myrepo/web-app:1.2.3
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**GitHub Actions Workflow**:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest

      - name: Run tests
        run: pytest tests/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploying..."
```

**Ansible Playbook**:
```yaml
---
- name: Configurar servidor web
  hosts: webservers
  become: yes

  vars:
    nginx_port: 80
    php_version: 8.1

  tasks:
    - name: Instalar paquetes
      apt:
        name:
          - nginx
          - php-fpm
          - git
        state: present
        update_cache: yes

    - name: Iniciar nginx
      systemd:
        name: nginx
        state: started
        enabled: yes

    - name: Clonar repositorio
      git:
        repo: https://github.com/usuario/repo.git
        dest: /var/www/html
        version: main
      notify: Recargar nginx

  handlers:
    - name: Recargar nginx
      systemd:
        name: nginx
        state: reloaded
```

### Errores Comunes YAML

```yaml
# ❌ ERROR: Indentación inconsistente
nombre: Juan
 edad: 30        # Espacio incorrecto

# ✓ CORRECTO
nombre: Juan
edad: 30

# ❌ ERROR: Valores sin entrecomillar conflictivos
valor: yes       # Se interpreta como booleano true

# ✓ CORRECTO
valor: "yes"     # String literal

# ❌ ERROR: Dos mapas en mismo nivel sin array
nombre: Juan
nombre: María    # Sobrescribe el anterior

# ✓ CORRECTO
nombres:
  - Juan
  - María
```

## Comparativa: JSON vs XML vs YAML vs TOML

| Característica | JSON | XML | YAML | TOML |
|---|---|---|---|---|
| Legibilidad | Media | Baja | Excelente | Buena |
| Compacidad | Media | Baja | Alta | Alta |
| Comentarios | No | Sí | Sí | Sí |
| Tipos de datos | 6 | Strings | Ricos | Ricos |
| Indentación sensible | No | No | Sí | Parcial |
| Curva aprendizaje | Baja | Media | Media | Baja |
| Validación | JSON Schema | DTD/XSD | JSON Schema | Schema TOML |
| APIs REST | Estándar | Antiguo | Raro | Raro |
| Configuración | Posible | Antiguo | Excelente | Muy bueno |
| Base datos | Sí (NoSQL) | Sí | No | No |
| Archivos grandes | Deficiente | Deficiente | Mejor | Mejor |

### Casos de Uso Recomendados

| Caso | Mejor Opción | Razón |
|---|---|---|
| API REST | JSON | Estándar universal |
| Configuración aplicación | TOML | Legible, tablas |
| Configuración DevOps | YAML | Legible, estructura |
| Intercambio datos | JSON | Amplio soporte |
| Documentos completos | XML | Schema validación |
| Configuración simple | TOML | Tablas naturales |

## Formato TOML (Breve Mención)

```toml
# TOML: Tom's Obvious, Minimal Language

[package]
name = "mi-app"
version = "1.0.0"
description = "Una aplicación de ejemplo"

[dependencies]
django = "4.2"
requests = "2.31.0"
sqlalchemy = { version = "2.0", optional = true }

[dev-dependencies]
pytest = "7.4.0"
black = "23.9.0"

[[servers]]
name = "server-1"
ip = "192.168.1.1"
role = "web"

[[servers]]
name = "server-2"
ip = "192.168.1.2"
role = "db"
```

## Formato CSV (Breve Mención)

```csv
nombre,edad,ciudad,salario
Juan García,30,Madrid,3000
María López,28,Barcelona,2800
Carlos Ruiz,35,Valencia,3200
Ana Martín,32,Sevilla,2900
```

**Características**:
- Separador por comas (o delimitador)
- Primera línea = encabezados
- Sin estructura anidada
- Muy usado en Excel, bases datos
- Limitaciones: No soporta datos complejos

---

Comprender JSON, YAML, XML y TOML es esencial para desarrollo moderno. Elige el formato apropiado para cada caso de uso.
$MKDN$,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
  SET markdown_content = EXCLUDED.markdown_content,
      updated_at = NOW();

COMMIT;

-- Verificación final
SELECT s.name as asignatura, count(p.id) as num_guias
FROM theory_subjects s
LEFT JOIN theory_posts p ON p.subject_id = s.id
GROUP BY s.name, s.order_index
ORDER BY s.order_index;