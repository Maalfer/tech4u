// ─────────────────────────────────────────────────────────────────────────────
// NetLab — Guided Troubleshooting Scenarios
// Organised by difficulty: facil | medio | dificil
// All outputs are simulated — zero real execution.
// ─────────────────────────────────────────────────────────────────────────────

export const SCENARIOS = [

// ══════════════════════════════════════════════════════════════════════════════
// ██████  FÁCIL  ██████
// ══════════════════════════════════════════════════════════════════════════════

  {
    id: 'f1-interface-shutdown', num: 1, difficulty: 'facil',
    title: 'Interfaz Apagada',
    category: 'Capa 1 · Física', estimatedTime: '5–8 min', points: 80,
    symptom: 'PC1 no puede hacer ping al gateway (192.168.1.1) ni a internet. Todos los pings fallan. La tarjeta de red del PC parece activa y el cable está conectado.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1',    sublabel: '192.168.1.10/24', x: 90,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',     sublabel: 'Cisco IOS',       x: 300, y: 100 },
        { id: 'srv', type: 'server', label: 'Server', sublabel: '10.0.0.1/24',     x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: true  },
        { from: 'r1',  to: 'srv', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig', output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.1` },
        { cmd: 'ping 192.168.1.1', output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      r1: [
        { cmd: 'show ip interface brief', revealsFault: true,
          output: `Interface           IP-Address    OK? Status                Protocol\nGigabitEthernet0/0  192.168.1.1   YES administratively down down\nGigabitEthernet0/1  10.0.0.254    YES up                    up` },
        { cmd: 'show running-config interface Gi0/0', revealsFault: true,
          output: `interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n shutdown` },
      ],
      srv: [
        { cmd: 'ping 192.168.1.10', output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-if)# no shutdown', layer: 1 },
    diagnosisOptions: [
      { id: 'a', text: 'La IP de PC1 está mal configurada', correct: false },
      { id: 'b', text: 'La interfaz Gi0/0 del router tiene el comando "shutdown" aplicado (administratively down)', correct: true },
      { id: 'c', text: 'El cable entre PC1 y R1 está físicamente roto', correct: false },
      { id: 'd', text: 'Falta una ruta estática en R1 para la red 192.168.1.0/24', correct: false },
    ],
    hints: [
      'Empieza verificando la IP del PC y probando el ping al gateway.',
      'Si el PC parece bien configurado, inspecciona el router. Revisa el estado de sus interfaces.',
      'En "show ip interface brief" fíjate en la columna Status. "administratively down" significa que hay un comando en la config que lo apaga.',
    ],
    solutionExplanation: 'La interfaz Gi0/0 del router tiene el comando "shutdown" en su configuración. Esto la pone en estado "administratively down" impidiendo toda comunicación. Fix: interface Gi0/0 → no shutdown.',
  },

  {
    id: 'f2-wrong-gateway', num: 2, difficulty: 'facil',
    title: 'Gateway Perdido',
    category: 'Capa 3 · Red', estimatedTime: '5–8 min', points: 80,
    symptom: 'PC1 puede hacer ping a otros equipos en su misma red local pero no llega a ninguna red remota. El router R1 funciona correctamente.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.1.10/24', x: 80,  y: 100 },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Catalyst',        x: 240, y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: '192.168.1.1',     x: 400, y: 100 },
        { id: 'srv', type: 'server', label: 'SRV', sublabel: '10.0.0.1/24',     x: 540, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: true  },
        { from: 'sw1', to: 'r1',  fromLabel: 'Gi0/1', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',  to: 'srv', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig', revealsFault: true,
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.2` },
        { cmd: 'ping 192.168.1.1',
          output: `Respuesta desde 192.168.1.1: bytes=32 tiempo=1ms TTL=255\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
        { cmd: 'ping 10.0.0.1',
          output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'tracert 10.0.0.1',
          output: `  1     *     *     *    Tiempo de espera agotado.\n  2     *     *     *    Tiempo de espera agotado.` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface           IP-Address    OK? Status  Protocol\nGigabitEthernet0/0  192.168.1.1   YES up      up\nGigabitEthernet0/1  10.0.0.254    YES up      up` },
        { cmd: 'ping 192.168.1.10',
          output: `Sending 5 ICMP Echos to 192.168.1.10:\n!!!!!\nSuccess rate 100 percent (5/5)` },
      ],
    },
    fault: { deviceId: 'pc1', fixCommand: 'Corregir gateway de 192.168.1.2 → 192.168.1.1', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'R1 no tiene ruta hacia la red 10.0.0.0/24', correct: false },
      { id: 'b', text: 'PC1 tiene configurado el gateway 192.168.1.2, que no existe. Debería ser 192.168.1.1', correct: true },
      { id: 'c', text: 'La máscara de subred de PC1 es incorrecta', correct: false },
      { id: 'd', text: 'El switch SW1 está bloqueando el tráfico inter-VLAN', correct: false },
    ],
    hints: [
      'PC1 llega a hosts locales pero no a redes remotas. El problema está en cómo PC1 decide enviar el tráfico externo.',
      'Para salir a redes remotas el PC usa su gateway. Comprueba la IP del gateway configurado en PC1 con ipconfig.',
      'El gateway configurado en PC1 es 192.168.1.2. ¿Existe algún dispositivo con esa IP en la red?',
    ],
    solutionExplanation: 'PC1 tiene el gateway 192.168.1.2 pero el router tiene la IP 192.168.1.1. Los paquetes dirigidos a redes remotas se envían a .2, que no existe → timeout. Fix: corregir el gateway a 192.168.1.1.',
  },

  {
    id: 'f3-wrong-ip-network', num: 3, difficulty: 'facil',
    title: 'IP en Red Incorrecta',
    category: 'Capa 3 · Direccionamiento', estimatedTime: '5–8 min', points: 80,
    symptom: 'PC1 no puede comunicarse con ningún otro dispositivo de la red. Ni siquiera puede hacer ping al gateway. El administrador acaba de reconfigurar manualmente la IP del equipo.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.2.10/24', x: 90,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: '192.168.1.1',     x: 300, y: 100 },
        { id: 'srv', type: 'server', label: 'SRV', sublabel: '192.168.1.20/24', x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: true  },
        { from: 'r1',  to: 'srv', fromLabel: 'Gi0/0', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig', revealsFault: true,
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.2.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.1` },
        { cmd: 'ping 192.168.1.1',
          output: `Host de destino inaccesible.\nHost de destino inaccesible.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'ping 192.168.1.20',
          output: `Host de destino inaccesible.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'arp -a',
          output: `Interfaz: 192.168.2.10\n  Sin entradas ARP para 192.168.1.1 — fuera de la subred local.` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface           IP-Address    OK? Status  Protocol\nGigabitEthernet0/0  192.168.1.1   YES up      up` },
        { cmd: 'ping 192.168.2.10',
          output: `.....  Success rate 0 percent (0/5) — sin ruta a 192.168.2.0` },
      ],
      srv: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.20\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.1` },
        { cmd: 'ping 192.168.2.10',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
    },
    fault: { deviceId: 'pc1', fixCommand: 'Cambiar IP de PC1 a 192.168.1.10/24', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El router R1 no tiene una interfaz activa en la red 192.168.1.0/24', correct: false },
      { id: 'b', text: 'PC1 tiene la IP 192.168.2.10, que pertenece a una red diferente a la del router (192.168.1.0/24)', correct: true },
      { id: 'c', text: 'El gateway de PC1 está en blanco, por eso no puede salir a redes externas', correct: false },
      { id: 'd', text: 'Hay una ACL en el router bloqueando el tráfico de PC1', correct: false },
    ],
    hints: [
      'El mensaje "Host de destino inaccesible" indica que el equipo ni siquiera puede enviar el ARP para encontrar al destinatario.',
      'Compara la IP de PC1 con la del router. ¿Están en la misma red /24?',
      'PC1 es 192.168.2.10/24 → red 192.168.2.0. El router es 192.168.1.1/24 → red 192.168.1.0. Son redes distintas: PC1 está mal configurado.',
    ],
    solutionExplanation: 'PC1 tiene la IP 192.168.2.10 pero la red local es 192.168.1.0/24. Con /24 ambas redes no se solapan y no hay ARP directo posible. El gateway 192.168.1.1 tampoco es alcanzable desde la subred .2.x. Fix: asignar a PC1 una IP en el rango 192.168.1.0/24 (ej. 192.168.1.10).',
  },

  {
    id: 'f4-wrong-mask', num: 4, difficulty: 'facil',
    title: 'Máscara Incorrecta',
    category: 'Capa 3 · Direccionamiento', estimatedTime: '6–9 min', points: 80,
    symptom: 'PC1 puede hacer ping a equipos cercanos pero no puede llegar a PC2 (192.168.1.130) que está en el mismo switch. El administrador cree que están en la misma red.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.1.10/25',  x: 80,  y: 80  },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Catalyst',         x: 300, y: 130 },
        { id: 'pc2', type: 'pc',     label: 'PC2', sublabel: '192.168.1.130/24', x: 520, y: 80  },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: true  },
        { from: 'sw1', to: 'pc2', fromLabel: 'Fa0/2', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig', revealsFault: true,
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.10\n   Máscara  . : 255.255.255.128\n   Gateway  . : 192.168.1.1` },
        { cmd: 'ping 192.168.1.130',
          output: `Host de destino inaccesible.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'ping 192.168.1.20',
          output: `Respuesta desde 192.168.1.20: tiempo<1ms TTL=128\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
      ],
      sw1: [
        { cmd: 'show vlan brief',
          output: `VLAN  Name     Status    Ports\n1     default  active    Fa0/1, Fa0/2, Gi0/1` },
        { cmd: 'show interfaces status',
          output: `Port   Status     Vlan   Speed\nFa0/1  connected  1      100\nFa0/2  connected  1      100` },
      ],
      pc2: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.130\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.1` },
        { cmd: 'ping 192.168.1.10',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
    },
    fault: { deviceId: 'pc1', fixCommand: 'Cambiar máscara de PC1 a 255.255.255.0 (/24)', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'PC2 tiene la IP incorrecta y está en una VLAN diferente a PC1', correct: false },
      { id: 'b', text: 'PC1 tiene máscara /25 (255.255.255.128): su subred es .0–.127, por lo que .130 le parece una red remota inaccesible directamente', correct: true },
      { id: 'c', text: 'El switch SW1 no tiene la VLAN 1 activa y descarta el tráfico entre puertos', correct: false },
      { id: 'd', text: 'Falta una ruta estática entre PC1 y PC2 en el switch', correct: false },
    ],
    hints: [
      'El switch parece OK (misma VLAN, puertos conectados). El problema está en la configuración IP de algún PC.',
      'PC1 puede alcanzar 192.168.1.20 pero no 192.168.1.130. ¿Qué diferencia hay entre esas IPs desde el punto de vista de PC1?',
      'Con máscara /25 (255.255.255.128) la subred de PC1 va de .0 a .127. La IP .130 está fuera → PC1 la trata como red remota y necesita un router para llegar.',
    ],
    solutionExplanation: 'PC1 tiene máscara /25 en lugar de /24. Con /25 su subred válida es 192.168.1.0–.127. La IP .130 de PC2 queda en la segunda mitad (.128–.255) que PC1 ve como red remota. PC2 tiene /24 correcto. Fix: cambiar la máscara de PC1 a /24 (255.255.255.0).',
  },

  {
    id: 'f5-duplicate-ip', num: 5, difficulty: 'facil',
    title: 'IP Duplicada',
    category: 'Capa 3 · Conflicto ARP', estimatedTime: '6–9 min', points: 80,
    symptom: 'PC1 tenía conectividad perfecta hasta hace 10 minutos. Ahora los pings son intermitentes: a veces llegan y a veces no. Otro equipo se acaba de conectar a la red.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1',  sublabel: '192.168.1.10/24',  x: 80,  y: 80  },
        { id: 'sw1', type: 'switch', label: 'SW1',  sublabel: 'Catalyst',          x: 300, y: 130 },
        { id: 'pc2', type: 'pc',     label: 'PC2',  sublabel: '192.168.1.10/24 ⚠', x: 520, y: 80  },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: false },
        { from: 'sw1', to: 'pc2', fromLabel: 'Fa0/2', toLabel: '', faulty: true  },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.254` },
        { cmd: 'ping 192.168.1.254',
          output: `Respuesta desde 192.168.1.254: tiempo=1ms\nTiempo de espera agotado.\nRespuesta desde 192.168.1.254: tiempo=2ms\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=2, perdidos=2 (50%)` },
        { cmd: 'arp -a', revealsFault: true,
          output: `Interfaz: 192.168.1.10\n  192.168.1.254   aa-bb-cc-dd-ee-01  dinámica\n\n⚠ CONFLICTO DE IP: dirección 192.168.1.10 ya está en uso por\n  MAC: 00-1A-2B-3C-4D-5F (dispositivo diferente)` },
      ],
      sw1: [
        { cmd: 'show mac address-table', revealsFault: true,
          output: `Vlan  Mac Address        Type     Ports\n1     aa-bb-cc-00-01-01  DYNAMIC  Fa0/1\n1     00-1a-2b-3c-4d-5f  DYNAMIC  Fa0/2\n\nNota: ambos puertos responden a la IP 192.168.1.10 alternativamente.` },
        { cmd: 'show interfaces status',
          output: `Port   Status     Vlan  Speed\nFa0/1  connected  1     100\nFa0/2  connected  1     100` },
      ],
      pc2: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.254` },
      ],
    },
    fault: { deviceId: 'pc2', fixCommand: 'Asignar a PC2 una IP libre, ej. 192.168.1.11/24', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El switch SW1 tiene una tormenta de broadcast que genera pérdida de paquetes', correct: false },
      { id: 'b', text: 'PC2 tiene la misma IP que PC1 (192.168.1.10/24), generando conflicto ARP e intermitencia', correct: true },
      { id: 'c', text: 'El gateway 192.168.1.254 está caído y responde solo a veces', correct: false },
      { id: 'd', text: 'El cable de PC1 tiene un fallo intermitente de capa física', correct: false },
    ],
    hints: [
      'La conectividad intermitente (50% de pérdida) con un nuevo dispositivo recién conectado es muy característica de un conflicto de IP.',
      'Ejecuta "arp -a" en PC1 y observa si hay algún aviso de conflicto. Luego compara las IPs de ambos PCs.',
      'Ambos PCs tienen la misma IP 192.168.1.10. El switch aprende la MAC de forma alternativa para esa IP, causando pérdida intermitente.',
    ],
    solutionExplanation: 'PC2 se configuró con la misma IP que PC1 (192.168.1.10). El switch actualiza su tabla MAC alternativamente con la MAC de cada PC cuando envían tráfico, causando que los paquetes lleguen al equipo equivocado el 50% del tiempo. Fix: asignar a PC2 una IP libre, ej. 192.168.1.11.',
  },

  {
    id: 'f6-dns-wrong', num: 6, difficulty: 'facil',
    title: 'DNS Mal Configurado',
    category: 'Capa 7 · Aplicación', estimatedTime: '5–7 min', points: 80,
    symptom: 'Los usuarios se quejan de que las páginas web no cargan. Sin embargo, el administrador puede hacer ping a la IP de Google (8.8.8.8) sin problema. El acceso a internet "funciona" pero los nombres no resuelven.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1',    sublabel: '192.168.1.10/24', x: 80,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',     sublabel: 'Gateway',          x: 300, y: 100 },
        { id: 'dns', type: 'server', label: 'DNS',    sublabel: '8.8.8.8',          x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',  to: 'dns', fromLabel: 'Gi0/1', toLabel: '',  faulty: true  },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig /all', revealsFault: true,
          output: `Adaptador Ethernet:\n   IPv4 . . . . . . : 192.168.1.10\n   Máscara  . . . . : 255.255.255.0\n   Gateway  . . . . : 192.168.1.1\n   Serv. DNS prim . : 8.8.9.9\n   Serv. DNS sec  . : (vacío)` },
        { cmd: 'ping 8.8.8.8',
          output: `Respuesta desde 8.8.8.8: bytes=32 tiempo=12ms TTL=118\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
        { cmd: 'ping google.com',
          output: `No se puede encontrar el host google.com. Verifique el nombre e inténtelo de nuevo.` },
        { cmd: 'nslookup google.com', revealsFault: true,
          output: `Servidor:  8.8.9.9\nAddress:   8.8.9.9\n\n*** 8.8.9.9 no puede encontrar google.com: Server failed` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface           IP-Address   OK? Status  Protocol\nGigabitEthernet0/0  192.168.1.1  YES up      up\nGigabitEthernet0/1  10.0.0.1     YES up      up` },
      ],
    },
    fault: { deviceId: 'pc1', fixCommand: 'Cambiar DNS primario de 8.8.9.9 a 8.8.8.8', layer: 7 },
    diagnosisOptions: [
      { id: 'a', text: 'El router R1 está bloqueando el puerto 53 (DNS) con una ACL', correct: false },
      { id: 'b', text: 'El servidor DNS configurado en PC1 es 8.8.9.9 (IP incorrecta). Debería ser 8.8.8.8', correct: true },
      { id: 'c', text: 'PC1 no tiene configurado el gateway y no puede salir a internet', correct: false },
      { id: 'd', text: 'El protocolo DNS usa TCP en lugar de UDP y está bloqueado en el firewall', correct: false },
    ],
    hints: [
      'El ping a una IP funciona pero no a un nombre de dominio. Eso indica que la conectividad IP es correcta pero la resolución DNS falla.',
      'Ejecuta "ipconfig /all" (no solo ipconfig) para ver el servidor DNS configurado. Compáralo con el DNS de Google real.',
      'El DNS configurado es 8.8.9.9 en lugar de 8.8.8.8. Un simple typo de un dígito hace que la resolución de nombres falle completamente.',
    ],
    solutionExplanation: 'PC1 tiene configurado el DNS 8.8.9.9 en lugar de 8.8.8.8. La IP está mal tecleada por un dígito. Como ese servidor no existe o no responde DNS, todos los nombres de dominio fallan aunque la conectividad IP sea perfecta. Fix: corregir el DNS a 8.8.8.8.',
  },

  {
    id: 'f7-link-down', num: 7, difficulty: 'facil',
    title: 'Cable Desconectado',
    category: 'Capa 1 · Física', estimatedTime: '4–6 min', points: 80,
    symptom: 'PC1 pierde conectividad de repente después de mover algunos equipos del rack. Antes funcionaba perfectamente. No hay ningún cambio de configuración.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.1.10/24', x: 90,  y: 100 },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Catalyst',        x: 300, y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: '192.168.1.1',     x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/3', faulty: true  },
        { from: 'sw1', to: 'r1',  fromLabel: 'Gi0/1', toLabel: 'Gi0/0', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 169.254.10.5\n   Máscara  . : 255.255.0.0\n   Gateway  . : (vacío)\n\n⚠ APIPA: dirección autoconfigurable. Sin servidor DHCP alcanzable.` },
        { cmd: 'ping 192.168.1.1',
          output: `Host de destino inaccesible.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      sw1: [
        { cmd: 'show interfaces status', revealsFault: true,
          output: `Port    Name   Status        Vlan  Speed\nFa0/1          connected     1     100\nFa0/2          connected     1     100\nFa0/3          notconnect    1     auto\nGi0/1          connected     1     1000` },
        { cmd: 'show interfaces Fa0/3', revealsFault: true,
          output: `FastEthernet0/3 is down, line protocol is down (notconnect)\n  Hardware is Fast Ethernet\n  No link detected — cable may be unplugged or faulty` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface          IP-Address   OK? Status  Protocol\nGigabitEthernet0/0 192.168.1.1  YES up      up\nGigabitEthernet0/1 —            YES up      up` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'Conectar correctamente el cable RJ45 en el puerto Fa0/3 del SW1', layer: 1 },
    diagnosisOptions: [
      { id: 'a', text: 'El puerto Fa0/3 del switch tiene un "shutdown" aplicado en la configuración', correct: false },
      { id: 'b', text: 'El puerto Fa0/3 del switch está en estado "notconnect": el cable está físicamente desconectado o roto', correct: true },
      { id: 'c', text: 'PC1 no tiene DHCP y su IP APIPA no es válida para la red', correct: false },
      { id: 'd', text: 'El switch no tiene la VLAN 1 configurada en el puerto Fa0/3', correct: false },
    ],
    hints: [
      'PC1 tiene una IP 169.254.x.x (APIPA). Eso significa que no ha podido contactar con el servidor DHCP, lo que apunta a un problema físico o de capa 2.',
      'Revisa el estado de los puertos del switch con "show interfaces status". Busca algún puerto en estado "notconnect".',
      'El puerto Fa0/3 donde está PC1 aparece como "notconnect". Eso indica que el switch no detecta señal eléctrica: el cable está desenchufado.',
    ],
    solutionExplanation: 'El cable entre PC1 y el switch (puerto Fa0/3) no está conectado (notconnect). PC1 al no recibir respuesta DHCP se asigna una IP APIPA (169.254.x.x) que no le sirve para comunicarse. Fix: verificar y reconectar el cable RJ45 en el puerto Fa0/3.',
  },

  {
    id: 'f8-no-default-route', num: 8, difficulty: 'facil',
    title: 'Sin Ruta por Defecto',
    category: 'Capa 3 · Routing', estimatedTime: '6–8 min', points: 80,
    symptom: 'Los PCs de la oficina (192.168.1.0/24) pueden comunicarse entre sí pero no acceden a internet. El ISP confirma que el enlace WAN está activo.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1',   type: 'pc',     label: 'PC1',     sublabel: '192.168.1.10/24', x: 80,  y: 100 },
        { id: 'r1',    type: 'router', label: 'R1',      sublabel: '192.168.1.1',     x: 270, y: 100 },
        { id: 'isp',   type: 'router', label: 'ISP-GW',  sublabel: '203.0.113.2',     x: 450, y: 100 },
        { id: 'inet',  type: 'server', label: 'Internet', sublabel: '8.8.8.8',        x: 560, y: 100 },
      ],
      links: [
        { from: 'pc1',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',   to: 'isp',  fromLabel: 'Gi0/1', toLabel: '',  faulty: true  },
        { from: 'isp',  to: 'inet', fromLabel: '', toLabel: '',        faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ping 192.168.1.1',
          output: `Respuesta desde 192.168.1.1: tiempo=1ms TTL=255\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
        { cmd: 'ping 8.8.8.8',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface           IP-Address    OK? Status  Protocol\nGigabitEthernet0/0  192.168.1.1   YES up      up\nGigabitEthernet0/1  203.0.113.1   YES up      up` },
        { cmd: 'show ip route', revealsFault: true,
          output: `Codes: C - connected, S - static\n\nC  192.168.1.0/24 via GigabitEthernet0/0\nC  203.0.113.0/30 via GigabitEthernet0/1\n\nGateway of last resort is not set` },
        { cmd: 'ping 8.8.8.8',
          output: `Sending 5 ICMP Echos to 8.8.8.8:\n.....\nSuccess rate 0 percent — no route to host` },
        { cmd: 'ping 203.0.113.2',
          output: `Sending 5 ICMP Echos to 203.0.113.2:\n!!!!!\nSuccess rate 100 percent` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La interfaz WAN del router (Gi0/1) está caída y no conecta con el ISP', correct: false },
      { id: 'b', text: 'R1 no tiene configurada ninguna ruta por defecto (default route). No sabe dónde enviar el tráfico a internet', correct: true },
      { id: 'c', text: 'PC1 no tiene configurado el gateway correcto', correct: false },
      { id: 'd', text: 'El ISP está bloqueando el tráfico ICMP desde 203.0.113.1', correct: false },
    ],
    hints: [
      'Los PCs llegan al router pero no más allá. Revisa la tabla de rutas del router: ¿sabe a dónde enviar el tráfico destinado a internet?',
      'En "show ip route" busca la línea "Gateway of last resort". Si dice "is not set", el router no tiene ruta por defecto.',
      'R1 solo conoce sus redes directamente conectadas. Para llegar a internet necesita una ruta 0.0.0.0/0 apuntando al ISP (203.0.113.2).',
    ],
    solutionExplanation: 'R1 tiene ambas interfaces activas y puede llegar al ISP (203.0.113.2) pero no tiene ruta por defecto. Sin "Gateway of last resort", el router descarta cualquier paquete cuyo destino no sea una red directamente conectada. Fix: ip route 0.0.0.0 0.0.0.0 203.0.113.2.',
  },

  {
    id: 'f9-router-ip-wrong', num: 9, difficulty: 'facil',
    title: 'IP del Router Incorrecta',
    category: 'Capa 3 · Direccionamiento', estimatedTime: '5–7 min', points: 80,
    symptom: 'Los PCs tienen el gateway configurado como 192.168.1.1 pero ninguno puede hacer ping a él. El router fue reconfigurado recientemente por el equipo técnico.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.1.10/24', x: 90,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: '192.168.1.2 ⚠',  x: 300, y: 100 },
        { id: 'srv', type: 'server', label: 'SRV', sublabel: '10.0.0.1/24',     x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: true  },
        { from: 'r1',  to: 'srv', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.1.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.1.1` },
        { cmd: 'ping 192.168.1.1',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'ping 192.168.1.2',
          output: `Respuesta desde 192.168.1.2: tiempo=1ms TTL=255\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
        { cmd: 'arp -a',
          output: `192.168.1.2   cc-dd-ee-ff-00-01   dinámica\n(Sin entrada para 192.168.1.1)` },
      ],
      r1: [
        { cmd: 'show ip interface brief', revealsFault: true,
          output: `Interface           IP-Address    OK? Status  Protocol\nGigabitEthernet0/0  192.168.1.2   YES up      up\nGigabitEthernet0/1  10.0.0.254    YES up      up` },
        { cmd: 'show running-config interface Gi0/0', revealsFault: true,
          output: `interface GigabitEthernet0/0\n ip address 192.168.1.2 255.255.255.0\n no shutdown` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-if)# ip address 192.168.1.1 255.255.255.0', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El gateway de PC1 está mal configurado: debería ser 192.168.1.2', correct: false },
      { id: 'b', text: 'La interfaz Gi0/0 del router tiene la IP 192.168.1.2 en lugar de 192.168.1.1. No coincide con el gateway configurado en los PCs', correct: true },
      { id: 'c', text: 'La interfaz del router está en shutdown y no responde a ninguna IP', correct: false },
      { id: 'd', text: 'Hay un dispositivo no autorizado con la IP 192.168.1.2 respondiendo en lugar del router', correct: false },
    ],
    hints: [
      'PC1 no puede hacer ping a 192.168.1.1 (su gateway) pero sí puede a otra IP en la misma red. Prueba distintas IPs para ver cuál responde.',
      'Si ping 192.168.1.2 funciona, algo tiene esa IP. Revisa la configuración del router.',
      'El router tiene la IP 192.168.1.2 en Gi0/0, no 192.168.1.1. Alguien cometió un error durante la reconfiguración.',
    ],
    solutionExplanation: 'Durante la reconfiguración, alguien asignó la IP 192.168.1.2 a la interfaz Gi0/0 del router en lugar de 192.168.1.1. Todos los PCs tienen el gateway .1, que no existe → sin conectividad a redes externas. Fix: corregir la IP de la interfaz a 192.168.1.1.',
  },

  {
    id: 'f10-vlan-simple', num: 10, difficulty: 'facil',
    title: 'Puerto en VLAN Incorrecta',
    category: 'Capa 2 · VLAN', estimatedTime: '5–7 min', points: 80,
    symptom: 'PC1 no puede hacer ping a PC2 aunque están en el mismo switch y en el mismo rango de IPs. Es el primer día tras configurar VLANs en la red.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.10.1/24', x: 80,  y: 80  },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Catalyst',        x: 300, y: 130 },
        { id: 'pc2', type: 'pc',     label: 'PC2', sublabel: '192.168.10.2/24', x: 520, y: 80  },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: true  },
        { from: 'sw1', to: 'pc2', fromLabel: 'Fa0/2', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.10.1\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.10.254` },
        { cmd: 'ping 192.168.10.2',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      sw1: [
        { cmd: 'show vlan brief', revealsFault: true,
          output: `VLAN  Name      Status    Ports\n1     default   active    Fa0/1\n10    USUARIOS  active    Fa0/2\n20    MGMT      active    Gi0/1` },
        { cmd: 'show interfaces Fa0/1 switchport', revealsFault: true,
          output: `Name: Fa0/1\nSwitchport: Enabled\nAdministrative Mode: static access\nAccess Mode VLAN: 1 (default)` },
        { cmd: 'show interfaces Fa0/2 switchport',
          output: `Name: Fa0/2\nSwitchport: Enabled\nAdministrative Mode: static access\nAccess Mode VLAN: 10 (USUARIOS)` },
      ],
      pc2: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.10.2\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.10.254` },
        { cmd: 'ping 192.168.10.1',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config-if)# switchport access vlan 10', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'La VLAN 10 no está creada en el switch, por eso no existe ese dominio de broadcast', correct: false },
      { id: 'b', text: 'El puerto Fa0/1 está en VLAN 1 (default) y Fa0/2 en VLAN 10. Al estar en VLANs distintas no pueden comunicarse sin router', correct: true },
      { id: 'c', text: 'Las IPs de PC1 y PC2 pertenecen a subredes /24 diferentes', correct: false },
      { id: 'd', text: 'Falta habilitar spanning tree en el switch para que los puertos puedan reenviar tramas', correct: false },
    ],
    hints: [
      'La IP de los PCs parece correcta. El problema está en la capa 2. Revisa en qué VLAN está asignado cada puerto.',
      'Ejecuta "show vlan brief" en SW1 y compara qué VLAN aparece para Fa0/1 y para Fa0/2.',
      'Fa0/1 está en VLAN 1 y Fa0/2 en VLAN 10. Para que PC1 y PC2 se comuniquen, ambos puertos deben estar en la misma VLAN.',
    ],
    solutionExplanation: 'El puerto Fa0/1 (PC1) quedó en la VLAN 1 (default) sin asignar, mientras Fa0/2 (PC2) está correctamente en VLAN 10. Los switches no pasan tramas entre VLANs sin un router. Fix: entrar en interface Fa0/1 y ejecutar "switchport access vlan 10".',
  },

// ══════════════════════════════════════════════════════════════════════════════
// ████████  MEDIO  ████████
// ══════════════════════════════════════════════════════════════════════════════

  {
    id: 'm1-trunk-vlan-blocked', num: 11, difficulty: 'medio',
    title: 'VLAN Bloqueada en Trunk',
    category: 'Capa 2 · Switching', estimatedTime: '10–14 min', points: 120,
    symptom: 'PC1 (VLAN 20) conectado a SW1 no puede comunicarse con PC2 (VLAN 20) conectado a SW2. PCs en VLAN 10 funcionan perfectamente entre los mismos switches.',
    topology: {
      viewBox: '0 0 640 220',
      nodes: [
        { id: 'pc1',  type: 'pc',     label: 'PC1',  sublabel: '192.168.20.1/24 VLAN20', x: 80,  y: 110 },
        { id: 'sw1',  type: 'switch', label: 'SW1',  sublabel: 'Cisco Catalyst',          x: 240, y: 110 },
        { id: 'sw2',  type: 'switch', label: 'SW2',  sublabel: 'Cisco Catalyst',          x: 400, y: 110 },
        { id: 'pc2',  type: 'pc',     label: 'PC2',  sublabel: '192.168.20.2/24 VLAN20', x: 560, y: 110 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: false },
        { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', faulty: true },
        { from: 'sw2', to: 'pc2', fromLabel: 'Fa0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ping 192.168.20.2',
          output: `Haciendo ping a 192.168.20.2 con 32 bytes de datos:\nTiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      sw1: [
        { cmd: 'show vlan brief',
          output: `VLAN Name                Status    Ports\n---- -------------------- --------- -------------------\n1    default              active    \n10   GESTION              active    Fa0/2\n20   USUARIOS             active    Fa0/1` },
        { cmd: 'show interfaces trunk', revealsFault: true,
          output: `Port     Mode      Encap  Status    Native VLAN\nGi0/1    desirable 802.1q  trunking  1\n\nPort     VLANs allowed on trunk\nGi0/1    1-19,21-4094\n\nPort     VLANs allowed and active in mgmt domain\nGi0/1    1,10` },
        { cmd: 'show running-config interface Gi0/1', revealsFault: true,
          output: `interface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk allowed vlan 1,10` },
      ],
      sw2: [
        { cmd: 'show interfaces trunk',
          output: `Port     Mode      Encap  Status    Native VLAN\nGi0/1    desirable 802.1q  trunking  1\n\nPort     VLANs allowed on trunk\nGi0/1    1-19,21-4094\n\nPort     VLANs allowed and active in mgmt domain\nGi0/1    1,10` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config-if)# switchport trunk allowed vlan add 20', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'La VLAN 20 no está creada en ninguno de los dos switches', correct: false },
      { id: 'b', text: 'El enlace trunk entre SW1 y SW2 no tiene VLAN 20 en la lista de VLANs permitidas', correct: true },
      { id: 'c', text: 'PC1 y PC2 están en subredes IP distintas', correct: false },
      { id: 'd', text: 'Falta un router para enrutar entre VLAN 10 y VLAN 20', correct: false },
    ],
    hints: [
      'Las PCs en VLAN 10 funcionan, pero no las de VLAN 20. El problema es específico a esa VLAN, no a la conectividad física.',
      'Ejecuta "show interfaces trunk" en SW1. Observa bien la sección "VLANs allowed on trunk" para Gi0/1.',
      'La lista de VLANs permitidas en el trunk es 1-19,21-4094. ¡La VLAN 20 está excluida! Fix: "switchport trunk allowed vlan add 20".',
    ],
    solutionExplanation: 'El trunk entre SW1 y SW2 fue configurado con una lista explícita de VLANs: "switchport trunk allowed vlan 1,10", que excluye la VLAN 20. Las tramas de VLAN 20 son descartadas al cruzar el trunk. Fix: "switchport trunk allowed vlan add 20" para incluirla sin borrar las existentes.',
  },

  {
    id: 'm2-ospf-area-mismatch', num: 12, difficulty: 'medio',
    title: 'OSPF — Area Incorrecta',
    category: 'Capa 3 · Enrutamiento', estimatedTime: '10–15 min', points: 130,
    symptom: 'R2 no aprende las rutas de R1 por OSPF. La tabla de enrutamiento de R2 no contiene la red 10.0.0.0/24 que R1 debería anunciar. Los pings entre las redes fallan.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC-A', sublabel: '10.0.0.10/24',   x: 80,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',   sublabel: 'OSPF area 0',     x: 260, y: 100 },
        { id: 'r2',  type: 'router', label: 'R2',   sublabel: 'OSPF area 1',     x: 440, y: 100 },
        { id: 'pc2', type: 'pc',     label: 'PC-B', sublabel: '172.16.0.10/24', x: 570, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',  to: 'r2',  fromLabel: 'Gi0/1 10.1.1.1/30', toLabel: 'Gi0/0 10.1.1.2/30', faulty: true },
        { from: 'r2',  to: 'pc2', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      r1: [
        { cmd: 'show ip ospf neighbor',
          output: `Neighbor ID   Pri  State    Dead Time  Address     Interface\n(sin vecinos OSPF)` },
        { cmd: 'show ip ospf interface Gi0/1',
          output: `GigabitEthernet0/1 is up, line protocol is up\n  Internet Address 10.1.1.1/30, Area 0\n  Process ID 1, Router ID 1.1.1.1, Network Type POINT_TO_POINT\n  Timer intervals: Hello 10, Dead 40` },
        { cmd: 'show running-config | section ospf',
          output: `router ospf 1\n network 10.0.0.0 0.0.0.255 area 0\n network 10.1.1.0 0.0.0.3 area 0` },
      ],
      r2: [
        { cmd: 'show ip ospf neighbor',
          output: `Neighbor ID   Pri  State    Dead Time  Address     Interface\n(sin vecinos OSPF)` },
        { cmd: 'show ip ospf interface Gi0/0', revealsFault: true,
          output: `GigabitEthernet0/0 is up, line protocol is up\n  Internet Address 10.1.1.2/30, Area 1\n  Process ID 1, Router ID 2.2.2.2, Network Type POINT_TO_POINT\n  Timer intervals: Hello 10, Dead 40` },
        { cmd: 'show running-config | section ospf', revealsFault: true,
          output: `router ospf 1\n network 10.1.1.0 0.0.0.3 area 1\n network 172.16.0.0 0.0.0.255 area 0` },
        { cmd: 'show ip route',
          output: `Gateway of last resort is not set\nC    10.1.1.0/30 is directly connected, GigabitEthernet0/0\nC    172.16.0.0/24 is directly connected, GigabitEthernet0/1\n(no hay rutas OSPF aprendidas)` },
      ],
    },
    fault: { deviceId: 'r2', fixCommand: 'R2(config-router)# network 10.1.1.0 0.0.0.3 area 0', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'R1 y R2 tienen Router IDs en conflicto, lo que impide la adyacencia OSPF', correct: false },
      { id: 'b', text: 'El enlace entre R1 y R2 está en area 0 en R1 pero en area 1 en R2. El area debe coincidir en ambos extremos del enlace', correct: true },
      { id: 'c', text: 'Los process IDs de OSPF son distintos en R1 y R2, impidiendo la adyacencia', correct: false },
      { id: 'd', text: 'Falta un "default-information originate" en R1 para propagar rutas', correct: false },
    ],
    hints: [
      'No hay vecinos OSPF. El primer paso es revisar si ambos routers ven el mismo área en el enlace de interconexión.',
      'Ejecuta "show ip ospf interface Gi0/1" en R1 y "show ip ospf interface Gi0/0" en R2. Compara el campo "Area" en ambos.',
      'R1 tiene el enlace en Area 0 y R2 en Area 1. Para establecer adyacencia en un enlace punto a punto, ambos extremos deben estar en la misma área.',
    ],
    solutionExplanation: 'OSPF requiere que los dos extremos de un enlace pertenezcan al mismo área. R1 anuncia la red 10.1.1.0/30 en area 0, pero R2 la tiene configurada en area 1. Esto impide la formación de adyacencia (permanece en estado INIT/2WAY nunca llegando a FULL). Fix en R2: reemplazar "network 10.1.1.0 0.0.0.3 area 1" por "network 10.1.1.0 0.0.0.3 area 0".',
  },

  {
    id: 'm3-acl-blocking-icmp', num: 13, difficulty: 'medio',
    title: 'ACL Bloqueando ICMP',
    category: 'Capa 3–4 · Seguridad', estimatedTime: '10–14 min', points: 120,
    symptom: 'PC1 puede acceder a la web del servidor (puerto 80) pero los pings fallan. El administrador dice que "todo debería funcionar" tras la última política de seguridad.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.1.10/24',  x: 90,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: 'ACL en Gi0/0 IN', x: 300, y: 100 },
        { id: 'srv', type: 'server', label: 'SRV', sublabel: '10.0.0.5/24',      x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0 [ACL]', faulty: true },
        { from: 'r1',  to: 'srv', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ping 10.0.0.5',
          output: `Haciendo ping a 10.0.0.5:\nTiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'tracert 10.0.0.5',
          output: `Rastreando ruta a 10.0.0.5:\n  1   192.168.1.1   1 ms\n  2   *   *   *   Tiempo de espera de la solicitud agotado.\n(El ping ICMP es filtrado antes de llegar al destino)` },
      ],
      r1: [
        { cmd: 'show access-lists', revealsFault: true,
          output: `Extended IP access list POLITICA_IN\n  10 permit tcp any any eq 80\n  20 permit tcp any any eq 443\n  30 deny icmp any any\n  40 permit ip any any` },
        { cmd: 'show ip interface Gi0/0', revealsFault: true,
          output: `GigabitEthernet0/0 is up, line protocol is up\n  Inbound  access list is POLITICA_IN\n  Outbound access list is not set` },
        { cmd: 'show running-config | section access-list',
          output: `ip access-list extended POLITICA_IN\n permit tcp any any eq 80\n permit tcp any any eq 443\n deny icmp any any\n permit ip any any` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-ext-nacl)# no 30\nR1(config-ext-nacl)# 30 permit icmp any any', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La ACL tiene el orden correcto pero falta una ruta de retorno para el ICMP', correct: false },
      { id: 'b', text: 'La ACL "POLITICA_IN" tiene una línea "deny icmp any any" (entrada 30) antes del "permit ip any any", bloqueando todo el tráfico ICMP entrante', correct: true },
      { id: 'c', text: 'El servidor no responde a pings porque tiene un firewall de host activado', correct: false },
      { id: 'd', text: 'El protocolo ICMP está desactivado en la interfaz Gi0/0 del router', correct: false },
    ],
    hints: [
      'PC1 puede navegar web (TCP 80) pero no hacer ping (ICMP). Busca una ACL que permita TCP pero bloquee ICMP.',
      'Ejecuta "show access-lists" en R1 y busca cualquier línea relacionada con ICMP. Recuerda que las ACLs se procesan en orden secuencial.',
      'La ACE número 30 es "deny icmp any any". Las ACEs se evalúan de arriba a abajo: el ICMP llega a esa línea antes de alcanzar el "permit ip any any" de la línea 40.',
    ],
    solutionExplanation: 'La ACL "POLITICA_IN" procesa líneas en orden. La línea 30 "deny icmp any any" bloquea todos los pings antes de que se aplique el "permit ip any any" de la línea 40. Aunque "permit ip any any" incluye ICMP, las ACLs son first-match. Fix: borrar la línea 30 o cambiarla a "permit icmp any any echo-reply" si el objetivo era sólo permitir respuestas de ping.',
  },

  {
    id: 'm4-native-vlan-mismatch', num: 14, difficulty: 'medio',
    title: 'Native VLAN Mismatch',
    category: 'Capa 2 · Trunking', estimatedTime: '12–16 min', points: 125,
    symptom: 'CDP reporta errores en el enlace troncal entre SW1 y SW2. El tráfico de gestión (VLAN 1) es intermitente. Los logs muestran "%CDP-4-NATIVE_VLAN_MISMATCH" cada 60 segundos.',
    topology: {
      viewBox: '0 0 560 200',
      nodes: [
        { id: 'admin', type: 'pc',     label: 'Admin', sublabel: '192.168.1.5/24 VLAN1', x: 80,  y: 100 },
        { id: 'sw1',   type: 'switch', label: 'SW1',   sublabel: 'Native VLAN 1',         x: 240, y: 100 },
        { id: 'sw2',   type: 'switch', label: 'SW2',   sublabel: 'Native VLAN 99',         x: 400, y: 100 },
        { id: 'srv',   type: 'server', label: 'SRV',   sublabel: '192.168.1.100/24',       x: 530, y: 100 },
      ],
      links: [
        { from: 'admin', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: false },
        { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1 NativeV:1', toLabel: 'Gi0/1 NativeV:99', faulty: true },
        { from: 'sw2', to: 'srv', fromLabel: 'Fa0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      sw1: [
        { cmd: 'show interfaces trunk',
          output: `Port     Mode    Encap   Status    Native VLAN\nGi0/1    on      802.1q  trunking  1\n\nPort     VLANs allowed on trunk\nGi0/1    1-4094` },
        { cmd: 'show running-config interface Gi0/1',
          output: `interface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk encapsulation dot1q` },
      ],
      sw2: [
        { cmd: 'show interfaces trunk', revealsFault: true,
          output: `Port     Mode    Encap   Status    Native VLAN\nGi0/1    on      802.1q  trunking  99\n\nPort     VLANs allowed on trunk\nGi0/1    1-4094` },
        { cmd: 'show running-config interface Gi0/1', revealsFault: true,
          output: `interface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk encapsulation dot1q\n switchport trunk native vlan 99` },
        { cmd: 'show vlan brief',
          output: `VLAN Name       Status   Ports\n---- ----------- -------- -----\n1    default     active   \n99   MGMT        active   ` },
      ],
    },
    fault: { deviceId: 'sw2', fixCommand: 'SW2(config-if)# switchport trunk native vlan 1', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'El enlace trunk usa encapsulación ISL en SW1 y 802.1Q en SW2, generando incompatibilidad', correct: false },
      { id: 'b', text: 'La Native VLAN del trunk es VLAN 1 en SW1 y VLAN 99 en SW2. Deben ser iguales en ambos extremos o las tramas untagged se asignan a VLANs distintas', correct: true },
      { id: 'c', text: 'La VLAN 99 no está creada en SW1, por eso el tráfico de gestión falla', correct: false },
      { id: 'd', text: 'Falta configurar "spanning-tree vlan 99 priority 0" para que el tráfico fluya', correct: false },
    ],
    hints: [
      'Los mensajes CDP "NATIVE_VLAN_MISMATCH" indican que los dos extremos del trunk no coinciden en su native VLAN. Compara "show interfaces trunk" en ambos switches.',
      'SW1 muestra Native VLAN 1. ¿Qué muestra SW2? El estándar 802.1Q exige que la native VLAN sea idéntica en ambos extremos del enlace trunk.',
      'SW2 tiene "switchport trunk native vlan 99". Para solucionar el mismatch, configura la misma native VLAN en ambos switches (por estándar, usa VLAN 1 o una VLAN de gestión dedicada).',
    ],
    solutionExplanation: 'En 802.1Q, las tramas de la Native VLAN viajan sin etiqueta (untagged). Si SW1 asume Native VLAN 1 y SW2 asume Native VLAN 99, las tramas sin etiquetar se asignan a VLANs distintas en cada extremo, corrompiendo el tráfico. CDP detecta esta inconsistencia y genera alertas. Fix: alinear la native VLAN en ambos extremos con "switchport trunk native vlan 1" en SW2.',
  },

  {
    id: 'm5-stp-blocking', num: 15, difficulty: 'medio',
    title: 'STP Puerto Bloqueado',
    category: 'Capa 2 · Spanning Tree', estimatedTime: '12–17 min', points: 130,
    symptom: 'PC1 conectado a SW2 puede llegar a la mayoría de la red, pero la ruta directa entre SW2 y SW3 parece inactiva. El tráfico tarda el doble en llegar entre esos segmentos.',
    topology: {
      viewBox: '0 0 600 230',
      nodes: [
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Root Bridge',      x: 300, y: 50  },
        { id: 'sw2', type: 'switch', label: 'SW2', sublabel: 'Priority 32768',   x: 120, y: 170 },
        { id: 'sw3', type: 'switch', label: 'SW3', sublabel: 'Priority 32768',   x: 480, y: 170 },
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '10.0.0.10/24',     x: 40,  y: 60  },
      ],
      links: [
        { from: 'pc1', to: 'sw2', fromLabel: '', toLabel: 'Fa0/1', faulty: false },
        { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', faulty: false },
        { from: 'sw1', to: 'sw3', fromLabel: 'Gi0/2', toLabel: 'Gi0/1', faulty: false },
        { from: 'sw2', to: 'sw3', fromLabel: 'Gi0/2', toLabel: 'Gi0/2', faulty: true },
      ],
    },
    commands: {
      sw1: [
        { cmd: 'show spanning-tree vlan 1',
          output: `VLAN0001\n  Root ID   Priority   24576\n            Address    0001.0001.0001\n            This bridge is the root\n  Bridge ID Priority   24576\n\nInterface  Role  Sts  Cost  Prio.Nbr\nGi0/1      Desg  FWD  4     128.1\nGi0/2      Desg  FWD  4     128.2` },
      ],
      sw2: [
        { cmd: 'show spanning-tree vlan 1', revealsFault: true,
          output: `VLAN0001\n  Root ID   Priority   24576\n            Address    0001.0001.0001\n            Cost       4\n  Bridge ID Priority   32768\n            Address    0002.0002.0002\n\nInterface  Role  Sts  Cost  Prio.Nbr\nGi0/1      Root  FWD  4     128.1\nGi0/2      Altn  BLK  4     128.2` },
        { cmd: 'show interfaces Gi0/2 status',
          output: `Port     Name  Status     Vlan   Duplex  Speed\nGi0/2          connected  1      a-full  1000` },
      ],
      sw3: [
        { cmd: 'show spanning-tree vlan 1',
          output: `VLAN0001\n  Root ID   Priority   24576\n            Address    0001.0001.0001\n  Bridge ID Priority   32768\n            Address    0003.0003.0003\n\nInterface  Role  Sts  Cost  Prio.Nbr\nGi0/1      Root  FWD  4     128.1\nGi0/2      Desg  FWD  4     128.2` },
      ],
    },
    fault: { deviceId: 'sw2', fixCommand: 'SW2(config-if)# spanning-tree portfast', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'El cable entre SW2 y SW3 está físicamente dañado, por eso el puerto no reenvía', correct: false },
      { id: 'b', text: 'STP ha puesto el puerto Gi0/2 de SW2 en estado Alternate/Blocking para eliminar el bucle. Es el comportamiento esperado de STP; el tráfico usa la ruta por SW1', correct: true },
      { id: 'c', text: 'El puerto Gi0/2 de SW2 está en modo Half-Duplex, causando colisiones que STP interpreta como fallo', correct: false },
      { id: 'd', text: 'La VLAN 1 no está permitida en el trunk entre SW2 y SW3', correct: false },
    ],
    hints: [
      'El puerto está físicamente "connected" (show interfaces status lo confirma). El bloqueo no es físico. Ejecuta "show spanning-tree vlan 1" en SW2.',
      'En el output de spanning-tree de SW2 busca el campo "Sts" (status). Un puerto en estado "BLK" (Blocking) existe para prevenir bucles de capa 2, no es un fallo.',
      'Este es el comportamiento correcto de STP: Gi0/2 de SW2 está en Alternate/Blocking. El tráfico entre SW2 y SW3 fluye por SW1. Para redes con acceso a usuarios finales, usa "spanning-tree portfast" en puertos de acceso, no en puertos trunk.',
    ],
    solutionExplanation: 'Spanning Tree Protocol (STP/802.1D) bloquea uno de los puertos redundantes para evitar bucles de broadcast. En esta topología en triángulo, SW2 Gi0/2 queda en estado Alternate-Blocking porque SW1 es el Root Bridge y SW3 Gi0/2 tiene mejor path cost a root. El tráfico entre SW2 y SW3 viaja por SW1 (ruta redundante activa). Esto es correcto. Para optimizar convergencia en puertos de usuario final: "spanning-tree portfast" en Fa0/1 de SW2.',
  },

  {
    id: 'm6-vlan-not-in-database', num: 16, difficulty: 'medio',
    title: 'VLAN Inactiva en Base de Datos',
    category: 'Capa 2 · VLANs', estimatedTime: '10–14 min', points: 115,
    symptom: 'El puerto Fa0/3 del switch fue asignado a VLAN 30, pero PC3 no puede comunicarse con nadie. "show interfaces status" muestra el puerto en VLAN 30 pero parece inactivo.',
    topology: {
      viewBox: '0 0 520 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '10.30.0.1/24 VLAN30', x: 80,  y: 100 },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'VLAN DB incompleta',   x: 280, y: 100 },
        { id: 'pc2', type: 'pc',     label: 'PC2', sublabel: '10.30.0.2/24 VLAN30', x: 460, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: false },
        { from: 'sw1', to: 'pc2', fromLabel: 'Fa0/2', toLabel: '', faulty: true },
      ],
    },
    commands: {
      sw1: [
        { cmd: 'show interfaces status',
          output: `Port    Name  Status     Vlan  Duplex  Speed\nFa0/1         connected  30    a-full  100\nFa0/2         connected  30    a-full  100` },
        { cmd: 'show vlan brief', revealsFault: true,
          output: `VLAN Name                Status    Ports\n---- -------------------- --------- -------------------\n1    default              active    \n10   VENTAS               active    \n20   SOPORTE              active    \n(VLAN 30 no aparece — no existe en la base de datos)` },
        { cmd: 'show running-config | include vlan',
          output: `interface FastEthernet0/1\n switchport access vlan 30\ninterface FastEthernet0/2\n switchport access vlan 30` },
        { cmd: 'show interfaces Fa0/1 switchport', revealsFault: true,
          output: `Name: Fa0/1\nSwitchport: Enabled\nAdministrative Mode: static access\nAccess Mode VLAN: 30 (Inactive)\nOperational Mode: static access\nAdministrative Trunking Encapsulation: dot1q` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config)# vlan 30\nSW1(config-vlan)# name DESARROLLO', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'Los puertos Fa0/1 y Fa0/2 están en mode trunk en lugar de access, por eso no envían tráfico de VLAN 30', correct: false },
      { id: 'b', text: 'La VLAN 30 está asignada a los puertos pero no existe en la base de datos de VLANs del switch, quedando en estado Inactive', correct: true },
      { id: 'c', text: 'Las IPs de PC1 y PC2 están en subredes /24 distintas y necesitan un router para comunicarse', correct: false },
      { id: 'd', text: 'STP está bloqueando ambos puertos simultáneamente para evitar un micro-bucle', correct: false },
    ],
    hints: [
      'Los puertos muestran VLAN 30 en "show interfaces status" pero el tráfico no pasa. Ejecuta "show vlan brief" para ver qué VLANs existen realmente en el switch.',
      'En la salida de "show vlan brief" ¿aparece VLAN 30? Si no aparece, la VLAN existe en la config de la interfaz pero no en la base de datos VLAN — queda "Inactive".',
      'Crea la VLAN 30 explícitamente: en modo global escribe "vlan 30" y opcionalmente "name DESARROLLO". Una vez creada, los puertos pasarán a estado Active.',
    ],
    solutionExplanation: 'Cisco IOS requiere que una VLAN esté creada en la base de datos de VLANs (show vlan brief) para que los puertos asignados a ella sean operativos. Un puerto en una VLAN no existente queda en estado "Inactive" — recibe tramas pero no las reenvía. Fix: "vlan 30" en modo configuración global. En switches con VTP en modo Server, la VLAN se propaga automáticamente al resto del dominio.',
  },

  {
    id: 'm7-router-on-stick-wrong-vlan', num: 17, difficulty: 'medio',
    title: 'Router-on-a-Stick: Encapsulación Errónea',
    category: 'Capa 2–3 · Inter-VLAN', estimatedTime: '14–18 min', points: 135,
    symptom: 'En una arquitectura router-on-a-stick, VLAN 10 puede llegar al router pero VLAN 20 no. PC2 (VLAN 20) no puede hacer ping al gateway 192.168.20.1 aunque el subinterfaz Gi0/0.20 está "up".',
    topology: {
      viewBox: '0 0 600 210',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1 V10', sublabel: '192.168.10.2/24 GW:.10.1', x: 80,  y: 80  },
        { id: 'pc2', type: 'pc',     label: 'PC2 V20', sublabel: '192.168.20.2/24 GW:.20.1', x: 80,  y: 155 },
        { id: 'sw1', type: 'switch', label: 'SW1',     sublabel: 'Trunk Gi0/1',               x: 280, y: 115 },
        { id: 'r1',  type: 'router', label: 'R1',      sublabel: 'Gi0/0.10 / Gi0/0.20',       x: 470, y: 115 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1 V10', faulty: false },
        { from: 'pc2', to: 'sw1', fromLabel: '', toLabel: 'Fa0/2 V20', faulty: false },
        { from: 'sw1', to: 'r1',  fromLabel: 'Gi0/1 trunk', toLabel: 'Gi0/0', faulty: true },
      ],
    },
    commands: {
      pc2: [
        { cmd: 'ping 192.168.20.1',
          output: `Haciendo ping a 192.168.20.1:\nTiempo de espera agotado x4\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface          IP-Address      OK? Status  Protocol\nGi0/0              unassigned      YES up       up\nGi0/0.10           192.168.10.1    YES up       up\nGi0/0.20           192.168.20.1    YES up       up` },
        { cmd: 'show interfaces Gi0/0.10',
          output: `GigabitEthernet0/0.10 is up\n  Encapsulation 802.1Q Virtual LAN, Vlan ID 10` },
        { cmd: 'show interfaces Gi0/0.20', revealsFault: true,
          output: `GigabitEthernet0/0.20 is up\n  Encapsulation 802.1Q Virtual LAN, Vlan ID 30` },
        { cmd: 'show running-config | section interface Gi0/0', revealsFault: true,
          output: `interface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface GigabitEthernet0/0.20\n encapsulation dot1Q 30\n ip address 192.168.20.1 255.255.255.0` },
      ],
      sw1: [
        { cmd: 'show interfaces trunk',
          output: `Port    Mode  Encap   Status    Native VLAN\nGi0/1   on    802.1q  trunking  1\n\nVLANs allowed on trunk: 1-4094\nVLANs active:           1,10,20` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-subif)# encapsulation dot1Q 20', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El switch no permite la VLAN 20 en el trunk hacia el router', correct: false },
      { id: 'b', text: 'El subinterfaz Gi0/0.20 tiene configurado "encapsulation dot1Q 30" en lugar de "dot1Q 20". Las tramas de VLAN 20 llegan al router pero con una etiqueta que no coincide con el subinterfaz', correct: true },
      { id: 'c', text: 'El gateway 192.168.20.1 no está en la misma subred que PC2', correct: false },
      { id: 'd', text: 'Falta el comando "no shutdown" en el subinterfaz Gi0/0.20', correct: false },
    ],
    hints: [
      'El subinterfaz está "up/up" y tiene la IP correcta. El problema es más sutil. Ejecuta "show interfaces Gi0/0.20" y revisa el campo "Encapsulation".',
      'La encapsulación del subinterfaz debe coincidir con la VLAN tag de las tramas que llegan del trunk. Compara el Vlan ID del subinterfaz con el número de VLAN asignado a los puertos de acceso.',
      'Gi0/0.20 tiene "Encapsulation 802.1Q Vlan ID 30". Las tramas del switch llegan con etiqueta VLAN 20, pero el router las espera con etiqueta 30. Fix: "encapsulation dot1Q 20" en Gi0/0.20.',
    ],
    solutionExplanation: 'En router-on-a-stick, el subinterfaz captura sólo las tramas cuya etiqueta 802.1Q coincide con el Vlan ID configurado en "encapsulation dot1Q". El subinterfaz Gi0/0.20 tenía "encapsulation dot1Q 30" — acepta tramas de VLAN 30 pero descarta las de VLAN 20. El switch envía tramas de VLAN 20 correctamente, pero el router las ignora. Fix: cambiar a "encapsulation dot1Q 20".',
  },

  {
    id: 'm8-dhcp-wrong-pool', num: 18, difficulty: 'medio',
    title: 'DHCP — Pool de Red Incorrecto',
    category: 'Capa 3–7 · DHCP', estimatedTime: '10–14 min', points: 120,
    symptom: 'Los clientes piden IP por DHCP pero reciben direcciones 10.10.10.x en lugar de 192.168.5.x. La nueva red debería ser 192.168.5.0/24 pero el servidor DHCP fue reconfigurado hace dos días.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'cl1', type: 'pc',     label: 'Cliente1', sublabel: 'IP via DHCP',           x: 80,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',       sublabel: 'DHCP Server integrado', x: 300, y: 100 },
        { id: 'cl2', type: 'pc',     label: 'Cliente2', sublabel: 'IP via DHCP',           x: 510, y: 100 },
      ],
      links: [
        { from: 'cl1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',  to: 'cl2', fromLabel: 'Gi0/1', toLabel: '', faulty: true },
      ],
    },
    commands: {
      cl1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 10.10.10.5\n   Máscara  . : 255.255.255.0\n   Gateway  . : 10.10.10.1\n\n(La IP asignada pertenece a la red antigua 10.10.10.0/24)` },
      ],
      r1: [
        { cmd: 'show ip dhcp pool', revealsFault: true,
          output: `Pool CLIENTES :\n Utilization mark (high/low)  : 100/0\n Subnet size (first/next)      : 0/0\n Total addresses               : 254\n Leased addresses              : 12\n Pending event                 : none\n Network               : 10.10.10.0 255.255.255.0\n Default router        : 10.10.10.1\n DNS server            : 8.8.8.8` },
        { cmd: 'show running-config | section dhcp', revealsFault: true,
          output: `ip dhcp excluded-address 192.168.5.1 192.168.5.10\nip dhcp pool CLIENTES\n network 10.10.10.0 255.255.255.0\n default-router 10.10.10.1\n dns-server 8.8.8.8` },
        { cmd: 'show ip interface brief',
          output: `Interface       IP-Address      OK? Status  Protocol\nGi0/0           192.168.5.1     YES up       up\nGi0/1           192.168.5.1     YES up       up` },
        { cmd: 'show ip dhcp binding',
          output: `IP address      Client-ID        Lease expiration        Type\n10.10.10.5      0100.50ab.cd12   Mar 11 2026 08:00 AM    Automatic\n10.10.10.6      0100.22bb.ef34   Mar 11 2026 08:00 AM    Automatic` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip dhcp pool CLIENTES\nR1(dhcp-config)# network 192.168.5.0 255.255.255.0\nR1(dhcp-config)# default-router 192.168.5.1', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'Los clientes tienen configurada una IP estática de la red antigua y no están pidiendo DHCP realmente', correct: false },
      { id: 'b', text: 'El pool DHCP "CLIENTES" tiene configurada la red 10.10.10.0/24 en lugar de 192.168.5.0/24. Los clientes reciben IPs de la red antigua', correct: true },
      { id: 'c', text: 'El servidor DHCP está dando IPs de la red equivocada porque las exclusiones de dirección apuntan a 192.168.5.x', correct: false },
      { id: 'd', text: 'El gateway por defecto 10.10.10.1 no existe en el router, por eso falla la comunicación', correct: false },
    ],
    hints: [
      'Los clientes obtienen IPs de la red 10.10.10.0/24 pero las interfaces del router están en 192.168.5.x. Algo está mal en la config del pool DHCP.',
      'Ejecuta "show ip dhcp pool" o "show running-config | section dhcp" en R1. Compara el campo "network" con la red que deberían recibir los clientes.',
      'El pool "CLIENTES" tiene "network 10.10.10.0 255.255.255.0". La red debe actualizarse a 192.168.5.0 255.255.255.0, y el default-router a 192.168.5.1.',
    ],
    solutionExplanation: 'El pool DHCP quedó con la configuración de la red antigua (10.10.10.0/24) tras la migración. Aunque el router ya tiene IP 192.168.5.1 en sus interfaces, el servidor DHCP sigue entregando direcciones de la red anterior. Fix: modificar el pool con "network 192.168.5.0 255.255.255.0" y "default-router 192.168.5.1". Opcionalmente, limpiar los bindings actuales con "clear ip dhcp binding *" para que los clientes renueven.',
  },

  {
    id: 'm9-port-security-violation', num: 19, difficulty: 'medio',
    title: 'Port Security: Puerto err-disabled',
    category: 'Capa 2 · Seguridad', estimatedTime: '12–16 min', points: 125,
    symptom: 'Un nuevo portátil conectado en Fa0/5 no obtiene conectividad. El LED del puerto parpadea en ámbar. El técnico anterior dijo que "había configurado seguridad en los puertos".',
    topology: {
      viewBox: '0 0 520 200',
      nodes: [
        { id: 'laptop', type: 'pc',     label: 'Laptop', sublabel: 'MAC nueva',           x: 80,  y: 100 },
        { id: 'sw1',    type: 'switch', label: 'SW1',    sublabel: 'Port Security ON',     x: 300, y: 100 },
        { id: 'router', type: 'router', label: 'R1',     sublabel: '192.168.1.1 gateway',  x: 470, y: 100 },
      ],
      links: [
        { from: 'laptop', to: 'sw1', fromLabel: '', toLabel: 'Fa0/5 [ERR-DIS]', faulty: true },
        { from: 'sw1',    to: 'router', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      sw1: [
        { cmd: 'show interfaces status',
          output: `Port    Name  Status       Vlan  Duplex  Speed\nFa0/1         connected    10    a-full  100\nFa0/5         err-disabled 10    auto    auto` },
        { cmd: 'show port-security interface Fa0/5', revealsFault: true,
          output: `Port Security              : Enabled\nPort Status                : Secure-shutdown\nViolation Mode             : Shutdown\nAging Time                 : 0 mins\nMaximum MAC Addresses      : 1\nTotal MAC Addresses        : 1\nConfigured MAC Addresses   : 0\nSticky MAC Addresses       : 1\nLast Source Address:Vlan   : aabb.cc11.2233:10\nSecurity Violation Count   : 1` },
        { cmd: 'show port-security', revealsFault: true,
          output: `Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action\nFa0/5        1              1            1                  Shutdown` },
        { cmd: 'show running-config interface Fa0/5',
          output: `interface FastEthernet0/5\n switchport mode access\n switchport access vlan 10\n switchport port-security\n switchport port-security maximum 1\n switchport port-security mac-address sticky\n switchport port-security violation shutdown` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config-if)# shutdown\nSW1(config-if)# no shutdown', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'El puerto Fa0/5 está en la VLAN incorrecta y por eso rechaza la conexión del laptop', correct: false },
      { id: 'b', text: 'Port Security entró en modo Shutdown (err-disabled) al detectar una MAC diferente a la "sticky" que tenía memorizada. Para reactivar hay que hacer shutdown/no shutdown en el puerto', correct: true },
      { id: 'c', text: 'El laptop tiene una dirección IP inválida y el switch la rechaza a nivel de capa 2', correct: false },
      { id: 'd', text: 'El modo de violación es "Restrict" y sólo descarta tramas, pero el puerto en realidad sí funciona', correct: false },
    ],
    hints: [
      'El estado "err-disabled" en un puerto de switch casi siempre tiene una causa registrada. Ejecuta "show port-security interface Fa0/5".',
      'El campo "Violation Mode: Shutdown" indica que cuando llegó una MAC no autorizada, el puerto se apagó automáticamente. El campo "Last Source Address" muestra qué MAC lo disparó.',
      'Para recuperar el puerto: entrar a la interfaz, ejecutar "shutdown" y luego "no shutdown". Si el laptop sigue conectado (y es el único), port-security aprenderá su MAC como sticky y no volverá a dispararse.',
    ],
    solutionExplanation: 'Port Security con "violation shutdown" pone el puerto en estado err-disabled al detectar una dirección MAC diferente a la que tenía memorizada (sticky). Esto es un mecanismo de seguridad: el switch asume que alguien desconectó el dispositivo autorizado y conectó uno no autorizado. Para recuperar: "shutdown" + "no shutdown" en la interfaz. Si el incidente fue legítimo (cambio de PC), considera "switchport port-security mac-address sticky" para que aprenda la nueva MAC automáticamente, o especifica la MAC manualmente.',
  },

  {
    id: 'm10-wrong-static-route', num: 20, difficulty: 'medio',
    title: 'Ruta Estática con Next-Hop Incorrecto',
    category: 'Capa 3 · Enrutamiento', estimatedTime: '12–16 min', points: 120,
    symptom: 'Los paquetes de la red 10.1.1.0/24 hacia la red remota 172.16.0.0/24 nunca llegan a destino. Traceroute muestra que los paquetes llegan al router R1 pero luego desaparecen.',
    topology: {
      viewBox: '0 0 640 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1',  sublabel: '10.1.1.10/24',    x: 80,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',   sublabel: '10.1.1.1 / .2.1', x: 250, y: 100 },
        { id: 'r2',  type: 'router', label: 'R2',   sublabel: '10.1.2.2 / .3.1', x: 420, y: 100 },
        { id: 'srv', type: 'server', label: 'SRV',  sublabel: '172.16.0.5/24',   x: 570, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',  to: 'r2',  fromLabel: 'Gi0/1 10.1.2.1', toLabel: 'Gi0/0 10.1.2.2', faulty: true },
        { from: 'r2',  to: 'srv', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'tracert 172.16.0.5',
          output: `Rastreando ruta a 172.16.0.5:\n  1   10.1.1.1   1 ms\n  2   *   *   *   Tiempo de espera agotado\n  3   *   *   *   Tiempo de espera agotado\n(Los paquetes desaparecen después de R1)` },
      ],
      r1: [
        { cmd: 'show ip route', revealsFault: true,
          output: `Gateway of last resort is not set\nC    10.1.1.0/24 is directly connected, Gi0/0\nC    10.1.2.0/30 is directly connected, Gi0/1\nS    172.16.0.0/24 [1/0] via 10.1.3.1` },
        { cmd: 'ping 10.1.3.1',
          output: `Haciendo ping a 10.1.3.1:\n!!!!  — wait, no response\nU.U.U  (Destination host unreachable)\nSuceso: 10.1.3.1 no es una red alcanzable desde R1` },
        { cmd: 'show ip interface brief',
          output: `Interface       IP-Address    OK? Status  Protocol\nGi0/0           10.1.1.1      YES up       up\nGi0/1           10.1.2.1      YES up       up` },
      ],
      r2: [
        { cmd: 'show ip route',
          output: `C    10.1.2.0/30 is directly connected, Gi0/0\nC    172.16.0.0/24 is directly connected, Gi0/1\nS    10.1.1.0/24 [1/0] via 10.1.2.1` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip route 172.16.0.0 255.255.255.0 10.1.2.2', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'Falta una ruta de retorno en R2 hacia la red 10.1.1.0/24', correct: false },
      { id: 'b', text: 'La ruta estática en R1 para 172.16.0.0/24 tiene como next-hop 10.1.3.1, que no existe. El next-hop correcto es 10.1.2.2 (la IP de R2 en el enlace compartido)', correct: true },
      { id: 'c', text: 'El protocolo de enrutamiento en R2 no redistribuye la red 172.16.0.0/24 hacia R1', correct: false },
      { id: 'd', text: 'PC1 no tiene configurada la puerta de enlace correcta hacia R1', correct: false },
    ],
    hints: [
      'El traceroute llega a R1 pero no continúa. Ejecuta "show ip route" en R1 para ver si tiene ruta hacia 172.16.0.0/24 y fíjate en el next-hop.',
      'La tabla de rutas de R1 muestra "S 172.16.0.0/24 [1/0] via 10.1.3.1". ¿Existe la red 10.1.3.x en algún interface de R1? Usa "show ip interface brief" para comprobarlo.',
      'R1 no tiene ninguna interfaz en la red 10.1.3.x. El next-hop 10.1.3.1 es inalcanzable. El enlace entre R1 y R2 es 10.1.2.0/30, así que el next-hop correcto hacia R2 es 10.1.2.2.',
    ],
    solutionExplanation: 'La ruta estática en R1 apunta a 10.1.3.1 como next-hop, pero esa dirección no pertenece a ninguna red directamente conectada a R1. Al intentar reenviar paquetes hacia 172.16.0.0/24, R1 busca cómo alcanzar 10.1.3.1 y falla (recursive lookup falla o lleva a null0). Fix: "ip route 172.16.0.0 255.255.255.0 10.1.2.2" — usando la IP real de R2 en el enlace compartido 10.1.2.0/30.',
  },

// ══════════════════════════════════════════════════════════════════════════════
// ████████  DIFÍCIL  ████████
// ══════════════════════════════════════════════════════════════════════════════

  {
    id: 'd1-ospf-auth-mismatch', num: 21, difficulty: 'dificil',
    title: 'OSPF MD5 — Autenticación Rota',
    category: 'Capa 3 · OSPF Auth', estimatedTime: '16–22 min', points: 180,
    symptom: 'Tras activar autenticación OSPF en el backbone, R2 y R3 perdieron sus adyacencias con R1. Las rutas OSPF han desaparecido. R1 sí ve sus vecinos caídos en logs pero la interfaz está "up/up".',
    topology: {
      viewBox: '0 0 600 220',
      nodes: [
        { id: 'r1', type: 'router', label: 'R1', sublabel: 'OSPF key "cisco123"',  x: 300, y: 50  },
        { id: 'r2', type: 'router', label: 'R2', sublabel: 'OSPF key "Cisco123"',  x: 120, y: 170 },
        { id: 'r3', type: 'router', label: 'R3', sublabel: 'OSPF key "cisco123"',  x: 480, y: 170 },
      ],
      links: [
        { from: 'r1', to: 'r2', fromLabel: 'Gi0/1', toLabel: 'Gi0/0', faulty: true  },
        { from: 'r1', to: 'r3', fromLabel: 'Gi0/2', toLabel: 'Gi0/0', faulty: false },
      ],
    },
    commands: {
      r1: [
        { cmd: 'show ip ospf neighbor',
          output: `Neighbor ID  Pri  State    Dead Time  Address      Interface\n3.3.3.3      1    FULL/DR  00:00:38   10.1.3.3     Gi0/2\n(R2 no aparece como vecino)` },
        { cmd: 'show ip ospf interface Gi0/1',
          output: `GigabitEthernet0/1 is up\n  Internet Address 10.1.2.1/30, Area 0\n  Simple authentication enabled` },
        { cmd: 'show running-config interface Gi0/1', revealsFault: true,
          output: `interface GigabitEthernet0/1\n ip address 10.1.2.1 255.255.255.252\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 cisco123` },
      ],
      r2: [
        { cmd: 'show ip ospf neighbor',
          output: `Neighbor ID  Pri  State       Dead Time  Address     Interface\n(No neighbors — adyacencia no establecida)` },
        { cmd: 'show running-config interface Gi0/0', revealsFault: true,
          output: `interface GigabitEthernet0/0\n ip address 10.1.2.2 255.255.255.252\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 Cisco123` },
        { cmd: 'debug ip ospf adj',
          output: `OSPF: Rcv pkt from 10.1.2.1, Gi0/0 : Mismatch Authentication Key - Message Digest Key 1\nOSPF: Send with youngest Key 1` },
      ],
      r3: [
        { cmd: 'show ip ospf neighbor',
          output: `Neighbor ID  Pri  State    Dead Time  Address     Interface\n1.1.1.1      1    FULL/BDR  00:00:35   10.1.3.1    Gi0/0` },
      ],
    },
    fault: { deviceId: 'r2', fixCommand: 'R2(config-if)# ip ospf message-digest-key 1 md5 cisco123', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'R1 y R2 tienen Router IDs iguales, provocando un conflicto de identidad en OSPF', correct: false },
      { id: 'b', text: 'La clave MD5 OSPF en R2 ("Cisco123") no coincide con la de R1 ("cisco123"). OSPF es case-sensitive en las claves de autenticación', correct: true },
      { id: 'c', text: 'El área OSPF del enlace R1-R2 es diferente en cada extremo', correct: false },
      { id: 'd', text: 'Falta el comando "area 0 authentication message-digest" en el proceso OSPF de R2', correct: false },
    ],
    hints: [
      'R3 sí tiene adyacencia con R1 pero R2 no. Algo diferente tiene R2. Activa "debug ip ospf adj" en R2 y observa los mensajes de error.',
      'El debug muestra "Mismatch Authentication Key". Las claves OSPF MD5 son case-sensitive. Compara exactamente el campo "md5 <key>" en la config de R1 y R2.',
      'R1 tiene "md5 cisco123" (minúsculas) y R2 tiene "md5 Cisco123" (mayúscula C). Corrige en R2: "ip ospf message-digest-key 1 md5 cisco123".',
    ],
    solutionExplanation: 'OSPF MD5 authentication valida los hellos con un hash que incluye la clave. Las claves son case-sensitive: "cisco123" y "Cisco123" producen hashes distintos, impidiendo la adyacencia. El debug "Mismatch Authentication Key" es la pista definitiva. Fix en R2: "ip ospf message-digest-key 1 md5 cisco123". Lección importante: en entornos de producción, usa un gestor de contraseñas y documenta las claves exactas.',
  },

  {
    id: 'd2-nat-overload-missing', num: 22, difficulty: 'dificil',
    title: 'NAT Overload — Tráfico Saliente Roto',
    category: 'Capa 3 · NAT/PAT', estimatedTime: '18–25 min', points: 190,
    symptom: 'Los clientes de la red privada 192.168.10.0/24 no pueden navegar a internet. El router tiene conectividad WAN (puede hacer ping a 8.8.8.8 desde su propia CLI) pero los clientes no pasan por NAT.',
    topology: {
      viewBox: '0 0 620 200',
      nodes: [
        { id: 'cl1',  type: 'pc',     label: 'Client1', sublabel: '192.168.10.10/24',  x: 80,  y: 100 },
        { id: 'r1',   type: 'router', label: 'R1',      sublabel: 'NAT Router',         x: 290, y: 100 },
        { id: 'isp',  type: 'router', label: 'ISP',     sublabel: '1.2.3.254 gateway',  x: 480, y: 100 },
        { id: 'inet', type: 'server', label: 'Internet',sublabel: '8.8.8.8',            x: 590, y: 100 },
      ],
      links: [
        { from: 'cl1',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0 inside', faulty: false },
        { from: 'r1',   to: 'isp',  fromLabel: 'Gi0/1 1.2.3.1 outside', toLabel: '', faulty: true },
        { from: 'isp',  to: 'inet', fromLabel: '', toLabel: '', faulty: false },
      ],
    },
    commands: {
      cl1: [
        { cmd: 'ping 8.8.8.8',
          output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'ping 192.168.10.1',
          output: `Respuesta desde 192.168.10.1: bytes=32 tiempo<1ms TTL=255\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
      ],
      r1: [
        { cmd: 'ping 8.8.8.8',
          output: `Enviando 5 pings ICMP a 8.8.8.8:\n!!!!!  — 5/5 éxito (100%)` },
        { cmd: 'show ip nat translations',
          output: `(Tabla vacía — no hay traducciones activas)` },
        { cmd: 'show running-config | include nat', revealsFault: true,
          output: `ip nat inside source list ACL_NAT interface GigabitEthernet0/1 overload` },
        { cmd: 'show ip access-lists ACL_NAT', revealsFault: true,
          output: `%ACL_NAT no encontrada en la configuración actual.` },
        { cmd: 'show running-config | section ip access-list', revealsFault: true,
          output: `ip access-list standard NAT_CLIENTS\n permit 192.168.10.0 0.0.0.255\n(La ACL referenciada en NAT se llama "ACL_NAT" pero la ACL creada se llama "NAT_CLIENTS")` },
        { cmd: 'show ip interface Gi0/0',
          output: `GigabitEthernet0/0: ip nat inside` },
        { cmd: 'show ip interface Gi0/1',
          output: `GigabitEthernet0/1: ip nat outside` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip nat inside source list NAT_CLIENTS interface GigabitEthernet0/1 overload', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'Falta el comando "ip nat inside" en la interfaz Gi0/0 que conecta con los clientes', correct: false },
      { id: 'b', text: 'El comando NAT referencia la ACL "ACL_NAT" pero esa ACL no existe. La ACL que sí existe se llama "NAT_CLIENTS". El nombre debe coincidir exactamente', correct: true },
      { id: 'c', text: 'El overload NAT no funciona con IPv4 en routers Cisco IOS modernos, hay que usar NAT estático', correct: false },
      { id: 'd', text: 'Falta una ruta default hacia el ISP en R1 para que los paquetes NAT salgan correctamente', correct: false },
    ],
    hints: [
      'El router pinga internet pero los clientes no pasan. NAT está configurado pero "show ip nat translations" está vacío. Algo impide que se creen las traducciones.',
      'Verifica la ACL referenciada en el comando NAT: "show running-config | include nat". Luego verifica si esa ACL existe: "show ip access-lists ACL_NAT".',
      'El comando NAT usa "list ACL_NAT" pero esa ACL no existe. La ACL correcta se llama "NAT_CLIENTS". O renombra la ACL, o actualiza el comando NAT para referenciar "NAT_CLIENTS".',
    ],
    solutionExplanation: 'NAT overload (PAT) requiere una ACL que defina qué IPs se traducen. Si la ACL referenciada no existe, IOS no puede determinar qué paquetes natear y descarta la traducción silenciosamente. La ACL se creó con el nombre "NAT_CLIENTS" pero el comando NAT apunta a "ACL_NAT". Fix: actualizar el comando NAT con el nombre correcto: "ip nat inside source list NAT_CLIENTS interface Gi0/1 overload". Verificar con "debug ip nat" que las traducciones se crean.',
  },

  {
    id: 'd3-bgp-wrong-as', num: 23, difficulty: 'dificil',
    title: 'BGP — AS Remoto Incorrecto',
    category: 'Capa 3 · BGP', estimatedTime: '18–25 min', points: 200,
    symptom: 'La sesión BGP entre el router de borde (R1, AS 65001) y el router del proveedor (ISP, AS 65100) no se establece. Lleva más de 30 minutos en estado Active. Conectividad física confirmada.',
    topology: {
      viewBox: '0 0 560 200',
      nodes: [
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: 'AS 65001',   x: 120, y: 100 },
        { id: 'isp', type: 'router', label: 'ISP', sublabel: 'AS 65100',   x: 440, y: 100 },
      ],
      links: [
        { from: 'r1', to: 'isp', fromLabel: '203.0.113.1', toLabel: '203.0.113.2', faulty: true },
      ],
    },
    commands: {
      r1: [
        { cmd: 'show bgp summary',
          output: `BGP router identifier 1.1.1.1, local AS number 65001\nNeighbor        V  AS      MsgRcvd  MsgSent  Up/Down  State\n203.0.113.2     4  65200   0        47       00:31:12 Active` },
        { cmd: 'show running-config | section bgp', revealsFault: true,
          output: `router bgp 65001\n bgp router-id 1.1.1.1\n neighbor 203.0.113.2 remote-as 65200\n network 10.0.0.0 mask 255.255.255.0` },
        { cmd: 'debug ip bgp 203.0.113.2',
          output: `BGP: 203.0.113.2 open active, delay 1000ms\nBGP: 203.0.113.2 rcv OPEN w/ OPEN Notification\nBGP: 203.0.113.2 Bad AS number in OPEN: Expected 65200, Received AS 65100\nBGP: 203.0.113.2 went from Active to Idle` },
      ],
      isp: [
        { cmd: 'show bgp summary',
          output: `BGP router identifier 2.2.2.2, local AS number 65100\nNeighbor       V  AS     MsgRcvd  MsgSent  Up/Down  State\n203.0.113.1    4  65001  47       0        00:31:12  Active` },
        { cmd: 'show running-config | section bgp',
          output: `router bgp 65100\n neighbor 203.0.113.1 remote-as 65001` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-router)# neighbor 203.0.113.2 remote-as 65100', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'Los routers tienen el mismo Router ID, lo que genera un conflicto en BGP', correct: false },
      { id: 'b', text: 'R1 tiene configurado "neighbor 203.0.113.2 remote-as 65200" pero el AS real del ISP es 65100. BGP rechaza la conexión cuando el AS del OPEN no coincide con el esperado', correct: true },
      { id: 'c', text: 'El TTL entre R1 e ISP es demasiado bajo para establecer la sesión BGP (eBGP requiere TTL ≥ 1)', correct: false },
      { id: 'd', text: 'Falta una ruta estática en R1 hacia 203.0.113.2 para que el TCP handshake BGP funcione', correct: false },
    ],
    hints: [
      'BGP en estado "Active" durante mucho tiempo indica que el TCP handshake funciona pero el OPEN BGP falla. Activa "debug ip bgp 203.0.113.2" y lee el error exacto.',
      'El debug muestra "Bad AS number in OPEN: Expected 65200, Received AS 65100". R1 espera que el vecino sea AS 65200 pero recibe el OPEN de AS 65100.',
      'El ISP es AS 65100, pero R1 lo tiene configurado como "remote-as 65200". Corrige: "neighbor 203.0.113.2 remote-as 65100".',
    ],
    solutionExplanation: 'eBGP valida el AS Number en el mensaje OPEN. Si el AS anunciado por el vecino no coincide con el "remote-as" configurado localmente, se envía una NOTIFICATION y la sesión vuelve a Idle. El debug "Bad AS number in OPEN" es diagnóstico definitivo. Fix: "neighbor 203.0.113.2 remote-as 65100". Tras el fix, la sesión debería llegar a ESTABLISHED en segundos.',
  },

  {
    id: 'd4-acl-wrong-direction', num: 24, difficulty: 'dificil',
    title: 'ACL Aplicada en Dirección Incorrecta',
    category: 'Capa 3–4 · ACL', estimatedTime: '16–22 min', points: 175,
    symptom: 'Se aplicó una ACL para bloquear el tráfico SSH (TCP 22) entrante desde internet hacia la DMZ. Sin embargo, el tráfico SSH desde la LAN interna hacia la DMZ también quedó bloqueado, cosa que no debería ocurrir.',
    topology: {
      viewBox: '0 0 640 210',
      nodes: [
        { id: 'lan',  type: 'pc',     label: 'LAN',  sublabel: '10.0.0.0/24',    x: 80,  y: 100 },
        { id: 'r1',   type: 'router', label: 'R1',   sublabel: 'ACL en Gi0/2',   x: 300, y: 100 },
        { id: 'dmz',  type: 'server', label: 'DMZ',  sublabel: '172.16.0.10/24', x: 500, y: 70  },
        { id: 'inet', type: 'router', label: 'Internet', sublabel: 'WAN',         x: 500, y: 155 },
      ],
      links: [
        { from: 'lan',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0 inside',    faulty: false },
        { from: 'r1',   to: 'dmz',  fromLabel: 'Gi0/2 [ACL OUT]', toLabel: '', faulty: true  },
        { from: 'r1',   to: 'inet', fromLabel: 'Gi0/1 outside',   toLabel: '', faulty: false },
      ],
    },
    commands: {
      lan: [
        { cmd: 'ssh admin@172.16.0.10',
          output: `ssh: connect to host 172.16.0.10 port 22: Connection timed out\n(El SSH desde LAN hacia DMZ también falla)` },
      ],
      r1: [
        { cmd: 'show ip access-lists BLOCK_SSH_IN',
          output: `Extended IP access list BLOCK_SSH_IN\n  10 deny tcp any any eq 22\n  20 permit ip any any` },
        { cmd: 'show ip interface Gi0/2', revealsFault: true,
          output: `GigabitEthernet0/2 is up\n  Inbound  access list is not set\n  Outbound access list is BLOCK_SSH_IN` },
        { cmd: 'show running-config interface Gi0/2', revealsFault: true,
          output: `interface GigabitEthernet0/2\n ip address 172.16.0.1 255.255.255.0\n ip access-group BLOCK_SSH_IN out` },
      ],
      dmz: [
        { cmd: 'netstat -tlnp',
          output: `Proto  Recv-Q  Send-Q  Local Address  Foreign Address  State\ntcp    0       0       0.0.0.0:22     0.0.0.0:*        LISTEN\ntcp    0       0       0.0.0.0:80     0.0.0.0:*        LISTEN` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-if)# no ip access-group BLOCK_SSH_IN out\nR1(config-if)# ip access-group BLOCK_SSH_IN in\n! (aplicar en Gi0/1 inbound, no en Gi0/2 outbound)', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La ACL tiene la sentencia "deny" antes del "permit", por eso bloquea todo el SSH indiscriminadamente', correct: false },
      { id: 'b', text: 'La ACL está aplicada en dirección "out" en la interfaz Gi0/2 (hacia DMZ). Esto bloquea SSH desde CUALQUIER origen hacia la DMZ, incluyendo la LAN. Debería aplicarse "in" en la interfaz WAN (Gi0/1) para filtrar sólo el tráfico externo', correct: true },
      { id: 'c', text: 'El servidor SSH de la DMZ no está configurado para aceptar conexiones desde 10.0.0.0/24', correct: false },
      { id: 'd', text: 'Falta una ruta en R1 que lleve el tráfico de retorno SSH desde DMZ hacia LAN', correct: false },
    ],
    hints: [
      'La ACL bloquea SSH desde LAN también, no sólo desde internet. Ejecuta "show ip interface Gi0/2" y fíjate en la dirección (inbound/outbound) y la interfaz donde está aplicada.',
      'La ACL está en "outbound" en Gi0/2 (interfaz hacia DMZ). Outbound aplica a TODOS los paquetes saliendo hacia la DMZ, sin importar de dónde vengan. Si quieres filtrar sólo internet, aplícala inbound en Gi0/1 (interfaz WAN).',
      'Solución: quitar la ACL de Gi0/2 y aplicarla en Gi0/1 inbound. Opcionalmente, refinar la ACL para denegar SSH sólo desde redes externas y permitirlo desde 10.0.0.0/24.',
    ],
    solutionExplanation: 'Las ACLs outbound filtran TODO el tráfico que sale por esa interfaz, sin importar el origen. Al aplicar BLOCK_SSH_IN en Gi0/2 outbound, se bloquea SSH tanto de internet como de la LAN hacia la DMZ. La solución es aplicar la ACL inbound en la interfaz WAN (Gi0/1), donde sólo llega tráfico externo. Alternativamente, refinar la ACL: "deny tcp 0.0.0.0 255.255.255.255 172.16.0.0 0.0.0.255 eq 22" pero con "permit tcp 10.0.0.0 0.0.0.255 any" antes.',
  },

  {
    id: 'd5-dhcp-relay-missing', num: 25, difficulty: 'dificil',
    title: 'DHCP Relay — Agente ip helper-address',
    category: 'Capa 3 · DHCP Relay', estimatedTime: '18–24 min', points: 185,
    symptom: 'Los clientes de la VLAN 40 (192.168.40.0/24) no reciben IP por DHCP. El servidor DHCP centralizado (10.0.0.100) funciona correctamente para otras VLANs en el mismo router. Las VLANs 10 y 20 sí reciben IPs.',
    topology: {
      viewBox: '0 0 660 220',
      nodes: [
        { id: 'cl40', type: 'pc',     label: 'Client V40', sublabel: 'DHCP → sin IP',    x: 80,  y: 150 },
        { id: 'sw1',  type: 'switch', label: 'SW1',        sublabel: 'L3 Switch',         x: 240, y: 110 },
        { id: 'r1',   type: 'router', label: 'R1',         sublabel: 'DHCP Relay / GW',   x: 420, y: 110 },
        { id: 'srv',  type: 'server', label: 'DHCP SRV',   sublabel: '10.0.0.100',        x: 580, y: 110 },
      ],
      links: [
        { from: 'cl40', to: 'sw1', fromLabel: '', toLabel: 'VLAN40', faulty: false },
        { from: 'sw1',  to: 'r1',  fromLabel: 'Trunk', toLabel: 'Gi0/0', faulty: true },
        { from: 'r1',   to: 'srv', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      cl40: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 169.254.x.x\n   Máscara  . : 255.255.0.0\n   Gateway  . : (en blanco)\n\n(APIPA — el cliente no recibió IP del servidor DHCP)` },
      ],
      r1: [
        { cmd: 'show running-config interface Gi0/0.10',
          output: `interface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\n ip helper-address 10.0.0.100` },
        { cmd: 'show running-config interface Gi0/0.20',
          output: `interface GigabitEthernet0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\n ip helper-address 10.0.0.100` },
        { cmd: 'show running-config interface Gi0/0.40', revealsFault: true,
          output: `interface GigabitEthernet0/0.40\n encapsulation dot1Q 40\n ip address 192.168.40.1 255.255.255.0\n (sin ip helper-address configurado)` },
        { cmd: 'show ip dhcp pool',
          output: `Pool VLAN10: network 192.168.10.0/24, default-router 192.168.10.1\nPool VLAN20: network 192.168.20.0/24, default-router 192.168.20.1\nPool VLAN40: network 192.168.40.0/24, default-router 192.168.40.1` },
      ],
      srv: [
        { cmd: 'show ip dhcp binding | include 192.168.40',
          output: `(sin entradas para la red 192.168.40.x — el servidor nunca recibió DISCOVER de esa VLAN)` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-subif)# ip helper-address 10.0.0.100', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El pool DHCP para VLAN 40 no está creado en el servidor, por eso no asigna IPs', correct: false },
      { id: 'b', text: 'Falta el comando "ip helper-address 10.0.0.100" en el subinterfaz Gi0/0.40. Sin el relay, los broadcasts DHCP de la VLAN 40 no llegan al servidor centralizado', correct: true },
      { id: 'c', text: 'La encapsulación dot1Q de Gi0/0.40 es incorrecta, descartando las tramas de VLAN 40', correct: false },
      { id: 'd', text: 'El servidor DHCP no tiene una ruta de retorno hacia la red 192.168.40.0/24', correct: false },
    ],
    hints: [
      'Las VLANs 10 y 20 funcionan pero la 40 no. Compara la configuración de los subinterfaces: ¿qué tienen Gi0/0.10 y Gi0/0.20 que no tiene Gi0/0.40?',
      'El DHCP usa broadcasts. Cuando el cliente envía un DISCOVER, es un broadcast que no cruza routers. El "ip helper-address" convierte ese broadcast en unicast hacia el servidor DHCP.',
      'El subinterfaz Gi0/0.40 no tiene "ip helper-address". El broadcast DHCP de VLAN 40 llega al router pero este lo descarta (no sabe a quién reenviarlo). Añade "ip helper-address 10.0.0.100".',
    ],
    solutionExplanation: 'El protocolo DHCP usa broadcast UDP (puerto 67/68). Los routers descartan broadcasts por defecto. El comando "ip helper-address" convierte el broadcast DHCP en unicast hacia el servidor centralizado, actuando como agente de relay. VLAN 10 y 20 funcionan porque tienen el helper configurado. VLAN 40 fue añadida después y se olvidó el helper. Fix: "ip helper-address 10.0.0.100" en Gi0/0.40.',
  },

  {
    id: 'd6-eigrp-wildcard', num: 26, difficulty: 'dificil',
    title: 'EIGRP — Wildcard Mask Errónea',
    category: 'Capa 3 · EIGRP', estimatedTime: '18–24 min', points: 190,
    symptom: 'R2 anuncia la red 172.16.5.0/24 por EIGRP pero R1 no la recibe en su tabla de rutas. Ambos routers tienen adyacencia EIGRP establecida y comparten otras rutas sin problema.',
    topology: {
      viewBox: '0 0 580 200',
      nodes: [
        { id: 'net1', type: 'pc',     label: 'Red A',  sublabel: '10.1.1.0/24',    x: 70,  y: 100 },
        { id: 'r1',   type: 'router', label: 'R1',     sublabel: 'EIGRP AS 100',   x: 220, y: 100 },
        { id: 'r2',   type: 'router', label: 'R2',     sublabel: 'EIGRP AS 100',   x: 400, y: 100 },
        { id: 'net2', type: 'server', label: 'Red B',  sublabel: '172.16.5.0/24',  x: 540, y: 100 },
      ],
      links: [
        { from: 'net1', to: 'r1',   fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',   to: 'r2',   fromLabel: 'Gi0/1 10.0.0.1', toLabel: 'Gi0/0 10.0.0.2', faulty: false },
        { from: 'r2',   to: 'net2', fromLabel: 'Gi0/1', toLabel: '', faulty: true },
      ],
    },
    commands: {
      r1: [
        { cmd: 'show ip eigrp neighbors',
          output: `H  Address    Interface  Hold  Uptime  SRTT  RTO  Q  Seq\n0  10.0.0.2   Gi0/1      13    01:24:02  1   200  0  15` },
        { cmd: 'show ip route eigrp',
          output: `D    10.1.1.0/24 via 10.0.0.2\n(172.16.5.0/24 no aparece — no se recibió por EIGRP)` },
      ],
      r2: [
        { cmd: 'show ip eigrp neighbors',
          output: `H  Address    Interface  Hold  Uptime  SRTT  RTO  Q  Seq\n0  10.0.0.1   Gi0/0      11    01:24:05  1   200  0  22` },
        { cmd: 'show running-config | section eigrp', revealsFault: true,
          output: `router eigrp 100\n network 10.0.0.0 0.0.0.3\n network 172.16.5.0 0.0.5.255` },
        { cmd: 'show ip interface brief',
          output: `Interface       IP-Address     OK? Status  Protocol\nGi0/0           10.0.0.2       YES up       up\nGi0/1           172.16.5.1     YES up       up` },
        { cmd: 'show ip eigrp interfaces',
          output: `EIGRP Interfaces for AS(100)\n                        Xmit Queue   PeerQ   Mean  Pacing Time  Multicast    Pending\nInterface  Peers  Un/Reliable  Un/Reliable  SRTT  Un/Reliable  Flow Timer   Routes\nGi0/0      1      0/0          0/0          1     0/0          50           0\n(Gi0/1 no aparece — EIGRP no activo en esa interfaz)` },
      ],
    },
    fault: { deviceId: 'r2', fixCommand: 'R2(config-router)# network 172.16.5.0 0.0.0.255', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'Los AS numbers de EIGRP son distintos en R1 y R2, aunque ambos muestran 100', correct: false },
      { id: 'b', text: 'La wildcard mask "0.0.5.255" en R2 para la red 172.16.5.0 es incorrecta. Cubre un rango que no incluye 172.16.5.1, por lo que EIGRP no activa Gi0/1', correct: true },
      { id: 'c', text: 'R2 tiene una ACL de distribución EIGRP que filtra los anuncios de 172.16.5.0/24', correct: false },
      { id: 'd', text: 'La interfaz Gi0/1 de R2 está en modo passive-interface y no envía hellos EIGRP', correct: false },
    ],
    hints: [
      'La adyacencia EIGRP existe. El problema es que R2 no anuncia 172.16.5.0/24. Revisa en R2: "show ip eigrp interfaces" — ¿aparece Gi0/1?',
      'Gi0/1 no aparece en EIGRP interfaces. El comando "network" de EIGRP activa el protocolo en las interfaces cuya IP coincide con la network+wildcard. Revisa la wildcard: "network 172.16.5.0 0.0.5.255".',
      'La wildcard 0.0.5.255 en binario: los bits "5" (00000101) están activos, lo que hace coincidir IPs como 172.16.0.x y 172.16.5.x pero con lógica OR, no .1 específicamente. La wildcard correcta para /24 es 0.0.0.255: "network 172.16.5.0 0.0.0.255".',
    ],
    solutionExplanation: 'EIGRP activa el protocolo en las interfaces cuya IP coincide con el comando "network <dirección> <wildcard>". La wildcard mask 0.0.5.255 no cubre correctamente la IP 172.16.5.1 — la lógica de bits hace que la coincidencia falle para esa dirección específica. Por tanto, EIGRP no activa Gi0/1 y no anuncia esa red. La wildcard correcta para una red /24 es siempre 0.0.0.255: "network 172.16.5.0 0.0.0.255".',
  },

  {
    id: 'd7-route-redistribution', num: 27, difficulty: 'dificil',
    title: 'Redistribución de Rutas OSPF↔EIGRP',
    category: 'Capa 3 · Redistribución', estimatedTime: '20–28 min', points: 200,
    symptom: 'El router frontera R-ABR redistribuye OSPF en EIGRP y viceversa. Las rutas OSPF aparecen en el dominio EIGRP, pero las rutas EIGRP no aparecen en el dominio OSPF. Algo falta en la redistribución.',
    topology: {
      viewBox: '0 0 660 210',
      nodes: [
        { id: 'ro1',  type: 'router', label: 'R-OSPF', sublabel: 'OSPF area 0',        x: 80,  y: 110 },
        { id: 'rabr', type: 'router', label: 'R-ABR',  sublabel: 'OSPF+EIGRP Redist',  x: 320, y: 110 },
        { id: 're1',  type: 'router', label: 'R-EIGRP',sublabel: 'EIGRP AS 10',        x: 560, y: 110 },
        { id: 'net1', type: 'server', label: '10.1.x', sublabel: 'Red OSPF',           x: 80,  y: 40  },
        { id: 'net2', type: 'server', label: '172.x',  sublabel: 'Red EIGRP',          x: 560, y: 40  },
      ],
      links: [
        { from: 'net1', to: 'ro1',  fromLabel: '', toLabel: '', faulty: false },
        { from: 'ro1',  to: 'rabr', fromLabel: 'OSPF', toLabel: 'OSPF/EIGRP', faulty: false },
        { from: 'rabr', to: 're1',  fromLabel: 'EIGRP', toLabel: 'EIGRP', faulty: true },
        { from: 'net2', to: 're1',  fromLabel: '', toLabel: '', faulty: false },
      ],
    },
    commands: {
      rabr: [
        { cmd: 'show ip route',
          output: `O    10.1.1.0/24 via 10.0.1.1 (OSPF)\nD    172.16.0.0/24 via 10.0.2.1 (EIGRP)\nC    10.0.1.0/30 directly connected\nC    10.0.2.0/30 directly connected` },
        { cmd: 'show running-config | section router ospf', revealsFault: true,
          output: `router ospf 1\n network 10.0.1.0 0.0.0.3 area 0\n redistribute eigrp 10 subnets` },
        { cmd: 'show running-config | section router eigrp', revealsFault: true,
          output: `router eigrp 10\n network 10.0.2.0 0.0.0.3\n (sin redistribute ospf 1 metric ...)` },
        { cmd: 'show ip ospf database external',
          output: `OSPF Router with ID (3.3.3.3)\nType-5 AS External Link States:\n(vacío — ninguna ruta EIGRP redistribuida en OSPF, aunque el comando está)` },
      ],
      ro1: [
        { cmd: 'show ip route',
          output: `O    10.0.1.0/30 via 10.0.1.2\nC    10.1.1.0/24 directly connected\n(sin rutas externas — las rutas EIGRP no llegaron)` },
      ],
      re1: [
        { cmd: 'show ip route eigrp',
          output: `D EX 10.1.1.0/24 via 10.0.2.254 (redistribuida desde OSPF)\nD EX 10.0.1.0/30 via 10.0.2.254` },
      ],
    },
    fault: { deviceId: 'rabr', fixCommand: 'R-ABR(config-router)# redistribute ospf 1 metric 10000 100 255 1 1500', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La redistribución de OSPF en EIGRP requiere una route-map y sin ella falla silenciosamente', correct: false },
      { id: 'b', text: 'Falta el comando "redistribute ospf 1 metric ..." dentro del proceso EIGRP. Solo está configurada la redistribución en sentido EIGRP→OSPF, no OSPF→EIGRP', correct: true },
      { id: 'c', text: 'El dominio EIGRP tiene un filtro de distribución que bloquea las rutas externas (D EX) de tipo OSPF', correct: false },
      { id: 'd', text: 'La redistribución falla porque OSPF usa subnets variables y EIGRP no las soporta sin la keyword "subnets"', correct: false },
    ],
    hints: [
      'Las rutas EIGRP llegan a R-OSPF (redistribución EIGRP→OSPF funciona). Pero las rutas OSPF no llegan a R-EIGRP. Revisa el proceso EIGRP en R-ABR.',
      '"show running-config | section router eigrp" en R-ABR. ¿Tiene "redistribute ospf 1 metric..."? Compara con la config del proceso OSPF que sí tiene el redistribute.',
      'El proceso EIGRP no tiene el comando redistribute. EIGRP requiere una métrica compuesta (bandwidth, delay, reliability, load, MTU) al redistribuir. Ejemplo: "redistribute ospf 1 metric 10000 100 255 1 1500".',
    ],
    solutionExplanation: 'La redistribución debe configurarse en AMBOS procesos de enrutamiento: en OSPF para redistribuir EIGRP→OSPF (ya estaba), y en EIGRP para redistribuir OSPF→EIGRP (faltaba). EIGRP exige especificar los 5 parámetros de la métrica compuesta (K-values) al redistribuir: bandwidth, delay, reliability, load, MTU. Sin la métrica, IOS rechaza el comando. Fix: en el proceso EIGRP añadir "redistribute ospf 1 metric 10000 100 255 1 1500".',
  },

  {
    id: 'd8-hsrp-no-preempt', num: 28, difficulty: 'dificil',
    title: 'HSRP — Gateway Subóptimo sin Preempt',
    category: 'Capa 3 · Alta Disponibilidad', estimatedTime: '20–26 min', points: 185,
    symptom: 'Tras un reinicio de R1 (router HSRP primario), el tráfico sigue pasando por R2 aunque R1 ya recuperó. R1 tiene prioridad 110 y R2 prioridad 90, pero R2 sigue siendo Active. El gateway virtual 192.168.1.254 apunta a R2.',
    topology: {
      viewBox: '0 0 600 220',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: 'GW: 192.168.1.254', x: 80,  y: 110 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: 'HSRP Pri 110',      x: 290, y: 50  },
        { id: 'r2',  type: 'router', label: 'R2',  sublabel: 'HSRP Pri 90 Active',x: 290, y: 175 },
        { id: 'isp', type: 'router', label: 'ISP', sublabel: 'Internet',           x: 500, y: 110 },
      ],
      links: [
        { from: 'pc1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'pc1', to: 'r2',  fromLabel: '', toLabel: 'Gi0/0', faulty: false },
        { from: 'r1',  to: 'isp', fromLabel: 'Gi0/1', toLabel: '', faulty: true  },
        { from: 'r2',  to: 'isp', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      r1: [
        { cmd: 'show standby brief',
          output: `            P indicates configured to preempt.\n\nInterface  Grp  Pri  P  State    Active          Standby         VIP\nGi0/0      1    110     Standby  192.168.1.2     local           192.168.1.254` },
        { cmd: 'show running-config | section standby', revealsFault: true,
          output: `interface GigabitEthernet0/0\n standby 1 ip 192.168.1.254\n standby 1 priority 110\n (sin standby 1 preempt)` },
      ],
      r2: [
        { cmd: 'show standby brief',
          output: `            P indicates configured to preempt.\n\nInterface  Grp  Pri  P  State    Active          Standby         VIP\nGi0/0      1    90      Active   local           192.168.1.1     192.168.1.254` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-if)# standby 1 preempt', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'R1 tiene una prioridad HSRP incorrecta; debería ser mayor de 128 para ser Active', correct: false },
      { id: 'b', text: 'Falta el comando "standby 1 preempt" en R1. Sin preempt, aunque R1 tenga mayor prioridad, no arrebata el rol Active a R2 cuando se recupera', correct: true },
      { id: 'c', text: 'R2 también tiene preempt configurado con prioridad mayor, por eso gana el rol Active', correct: false },
      { id: 'd', text: 'El VIP 192.168.1.254 está mal configurado; debería estar en una subred diferente', correct: false },
    ],
    hints: [
      'R1 tiene prioridad 110 (mayor que R2 con 90) pero R2 es el Active. En condiciones normales, mayor prioridad = Active. ¿Qué mecanismo permite a un router recuperar el rol Active?',
      'Observa la salida de "show standby brief" en R1. La columna "P" está vacía para R1. Esa "P" indica "configured to preempt". Sin preempt, HSRP no cambia el Active aunque la prioridad sea mayor.',
      '"standby 1 preempt" le dice a R1 que reclame el rol Active si su prioridad es mayor que el Active actual. Añade este comando en la interfaz Gi0/0 de R1.',
    ],
    solutionExplanation: 'HSRP selecciona el Active en base a la prioridad, pero por defecto no reconsidera el rol una vez establecido (no-preempt). Cuando R1 reinició, R2 se convirtió en Active. Al volver R1, sin "preempt" configurado, respeta a R2 como Active aunque tenga menor prioridad. Fix: "standby 1 preempt" en R1. Opcionalmente añadir "standby 1 preempt delay minimum 30" para evitar que R1 tome el control antes de que sus rutas converjan.',
  },

  {
    id: 'd9-acl-order-suboptimal', num: 29, difficulty: 'dificil',
    title: 'ACL — Regla Implícita Shadowing',
    category: 'Capa 3–4 · ACL Avanzado', estimatedTime: '18–24 min', points: 190,
    symptom: 'La ACL "FIREWALL" debería bloquear el host 10.0.0.50 y permitir el resto de la red 10.0.0.0/24. Sin embargo, el host 10.0.0.50 sigue pudiendo comunicarse. Otro administrador modificó la ACL ayer.',
    topology: {
      viewBox: '0 0 560 200',
      nodes: [
        { id: 'bad', type: 'pc',     label: 'Host .50', sublabel: '10.0.0.50 DEBE BLOQUEAR', x: 80,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',       sublabel: 'ACL FIREWALL in Gi0/0',   x: 300, y: 100 },
        { id: 'srv', type: 'server', label: 'SRV',      sublabel: '172.16.0.10',              x: 500, y: 100 },
      ],
      links: [
        { from: 'bad', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0 [ACL IN]', faulty: true },
        { from: 'r1',  to: 'srv', fromLabel: 'Gi0/1', toLabel: '',          faulty: false },
      ],
    },
    commands: {
      bad: [
        { cmd: 'ping 172.16.0.10',
          output: `Respuesta desde 172.16.0.10: bytes=32 tiempo=1ms TTL=127\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)\n(El host bloqueado puede comunicarse — la ACL no funciona)` },
      ],
      r1: [
        { cmd: 'show access-lists FIREWALL', revealsFault: true,
          output: `Extended IP access list FIREWALL\n  5  permit ip 10.0.0.0 0.0.0.255 any\n  10 deny   ip host 10.0.0.50 any\n  20 permit ip any any` },
        { cmd: 'show ip interface Gi0/0',
          output: `GigabitEthernet0/0 is up\n  Inbound  access list is FIREWALL` },
        { cmd: 'show access-lists FIREWALL detail',
          output: `Extended IP access list FIREWALL\n  5  permit ip 10.0.0.0 0.0.0.255 any (247 matches)\n  10 deny   ip host 10.0.0.50 any (0 matches)\n  20 permit ip any any (0 matches)` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip access-list extended FIREWALL\nR1(config-ext-nacl)# no 5\nR1(config-ext-nacl)# 5 deny ip host 10.0.0.50 any\nR1(config-ext-nacl)# 6 permit ip 10.0.0.0 0.0.0.255 any', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La ACL no está aplicada en la dirección correcta; debería ser outbound en Gi0/1', correct: false },
      { id: 'b', text: 'La regla "permit ip 10.0.0.0 0.0.0.255 any" (entrada 5) está antes que la regla "deny host 10.0.0.50". Como ACL es first-match, el host .50 hace match con la regla 5 y queda permitido sin llegar a la regla 10', correct: true },
      { id: 'c', text: 'La ACL usa sintaxis "Extended" pero la regla debería ser una ACL estándar para funcionar con hosts individuales', correct: false },
      { id: 'd', text: 'Falta "log" al final de la regla deny para que se active el bloqueo en el router', correct: false },
    ],
    hints: [
      'La ACL está aplicada correctamente (inbound en Gi0/0). Revisa "show access-lists FIREWALL detail" — fíjate en el contador "matches" de cada regla.',
      'La entrada 5 tiene 247 matches. La entrada 10 tiene 0 matches. Esto significa que TODOS los paquetes (incluyendo los de 10.0.0.50) están siendo permitidos por la regla 5, sin llegar jamás a la regla 10.',
      'La regla "permit 10.0.0.0/24" es más general e incluye al host .50. Si va primero, hace match y se aplica sin leer el "deny" posterior. Solución: reordenar — primero el "deny host 10.0.0.50", luego el "permit 10.0.0.0/24".',
    ],
    solutionExplanation: 'Las ACLs son first-match: el primer match gana y se detiene la evaluación. La regla 5 "permit ip 10.0.0.0 0.0.0.255 any" incluye a 10.0.0.50 (está dentro del /24), por lo que el tráfico de ese host es permitido antes de llegar a la regla 10 "deny host 10.0.0.50". Las reglas más específicas (host) siempre deben ir ANTES que las más generales (red). Fix: insertar "deny host 10.0.0.50 any" como regla 5 (o cualquier número menor a 5) y mover el permit a continuación.',
  },

  {
    id: 'd10-ipv6-ra-missing', num: 30, difficulty: 'dificil',
    title: 'IPv6 SLAAC — Router Advertisement Bloqueado',
    category: 'Capa 3 · IPv6', estimatedTime: '20–26 min', points: 195,
    symptom: 'Los clientes IPv6 de la red no reciben autoconfiguracion SLAAC. Todos muestran solo la link-local (fe80::). El router R1 tiene IPv6 habilitado en la interfaz pero los clientes nunca reciben el prefijo global.',
    topology: {
      viewBox: '0 0 560 200',
      nodes: [
        { id: 'cl1', type: 'pc',     label: 'Client1', sublabel: 'fe80:: only / sin global', x: 80,  y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',      sublabel: 'IPv6 2001:db8:1::/64',    x: 350, y: 100 },
        { id: 'isp', type: 'router', label: 'ISP',     sublabel: 'IPv6 upstream',            x: 510, y: 100 },
      ],
      links: [
        { from: 'cl1', to: 'r1',  fromLabel: '', toLabel: 'Gi0/0', faulty: true  },
        { from: 'r1',  to: 'isp', fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      cl1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   Dirección IPv6 de vínculo local . : fe80::a1b2:c3d4:e5f6:7890\n   (Sin dirección IPv6 global — SLAAC no funcionó)` },
      ],
      r1: [
        { cmd: 'show ipv6 interface brief',
          output: `GigabitEthernet0/0   [up/up]\n    FE80::1\n    2001:DB8:1::1\nGigabitEthernet0/1   [up/up]\n    FE80::2` },
        { cmd: 'show running-config interface Gi0/0', revealsFault: true,
          output: `interface GigabitEthernet0/0\n ipv6 address 2001:DB8:1::1/64\n ipv6 nd ra suppress all` },
        { cmd: 'show ipv6 neighbors',
          output: `IPv6 Address      Age  Link-layer Addr  State  Interface\nFE80::a1b2...     0    aabb.cc11.2233   REACH  Gi0/0` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config-if)# no ipv6 nd ra suppress all', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El prefijo 2001:db8:1::/64 no es un prefijo ruteado globalmente válido, por eso SLAAC no lo anuncia', correct: false },
      { id: 'b', text: 'El comando "ipv6 nd ra suppress all" en Gi0/0 suprime completamente los Router Advertisements (RA). Sin RA, los clientes no reciben el prefijo global para SLAAC', correct: true },
      { id: 'c', text: 'Los clientes necesitan DHCPv6 en lugar de SLAAC para obtener una dirección global IPv6', correct: false },
      { id: 'd', text: 'Falta habilitar "ipv6 unicast-routing" en el router para que envíe Router Advertisements', correct: false },
    ],
    hints: [
      'El router tiene configurada la dirección IPv6 global en Gi0/0 y está up/up. Pero los clientes sólo tienen link-local. Revisa la config completa de Gi0/0 con "show running-config interface Gi0/0".',
      'SLAAC funciona cuando el router envía mensajes ICMPv6 Router Advertisement (RA) con el prefijo. Busca cualquier comando "nd" en la interfaz que pueda suprimir estos mensajes.',
      '"ipv6 nd ra suppress all" desactiva completamente los RA en esa interfaz. Los clientes esperan RA para autoconfigurarse. Fix: "no ipv6 nd ra suppress all" para que el router vuelva a anunciar el prefijo.',
    ],
    solutionExplanation: 'IPv6 SLAAC depende de los mensajes ICMPv6 Router Advertisement (RA) que el router envía periódicamente (y en respuesta a Router Solicitations de los clientes). El comando "ipv6 nd ra suppress all" inhibe completamente estos mensajes, impidiendo que los clientes autoconfiguren su dirección global. Fue posiblemente activado para reducir ruido en la red o por error. Fix: "no ipv6 nd ra suppress all". Tras unos segundos, el router enviará RA y los clientes autoconfigurarán sus IPs con el prefijo 2001:db8:1::/64.',
  },

// ══════════════════════════════════════════════════════════════════════════════
// ██████  VLANs & ACLs  ██████
// ══════════════════════════════════════════════════════════════════════════════

  {
    id: 'v1-vlan-access-wrong', num: 31, difficulty: 'facil',
    title: 'Puerto en VLAN Incorrecta',
    category: 'VLANs · Capa 2', estimatedTime: '5–8 min', points: 85,
    symptom: 'PC1 no puede comunicarse con ningún dispositivo de la red. Todos los pings fallan incluso al gateway. El administrador acaba de conectar el equipo a un puerto nuevo del switch.',
    topology: {
      viewBox: '0 0 600 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.10.10/24',   x: 85,  y: 100 },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Catalyst 2960',      x: 300, y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: 'GW 192.168.10.1',   x: 510, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/3',  faulty: true  },
        { from: 'sw1', to: 'r1',  fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.10.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.10.1` },
        { cmd: 'ping 192.168.10.1',
          output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      sw1: [
        { cmd: 'show vlan brief', revealsFault: true,
          output: `VLAN Name                 Status    Ports\n---- ----------------- --------- -------------------------\n1    default           active    Fa0/1, Fa0/2, Fa0/3, Fa0/4\n10   EMPLEADOS         active    Fa0/5, Fa0/6, Fa0/7, Gi0/1\n20   SERVIDORES        active    Fa0/8, Fa0/9` },
        { cmd: 'show interfaces Fa0/3 switchport', revealsFault: true,
          output: `Name: Fa0/3\nSwitchport: Enabled\nAdministrative Mode: static access\nOperational Mode: static access\nAccess Mode VLAN: 1 (default)\nTrunking Native Mode VLAN: 1 (native)` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface              IP-Address     OK? Status Protocol\nGi0/0.10               192.168.10.1   YES up     up\nGi0/0.20               192.168.20.1   YES up     up` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config)# interface Fa0/3\nSW1(config-if)# switchport access vlan 10', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'La IP de PC1 está en la subred incorrecta; debería ser 192.168.1.x para coincidir con el router', correct: false },
      { id: 'b', text: 'El puerto Fa0/3 del switch está en VLAN 1 (default) en lugar de VLAN 10 (EMPLEADOS). PC1 queda aislado del resto de la red que opera en VLAN 10', correct: true },
      { id: 'c', text: 'La VLAN 10 no está creada en el switch; por eso PC1 no puede comunicarse', correct: false },
      { id: 'd', text: 'El router no tiene ruta hacia la red 192.168.10.0/24', correct: false },
    ],
    hints: [
      'PC1 tiene IP y gateway correctos pero no llega ni al gateway. El problema está en la capa 2 — en el switch.',
      'Ejecuta "show vlan brief" en el switch. Fíjate en qué VLAN aparece el puerto Fa0/3 donde está PC1.',
      'Fa0/3 está en VLAN 1 (default), pero la red 192.168.10.0/24 opera en VLAN 10. Fix: "switchport access vlan 10" en ese puerto.',
    ],
    solutionExplanation: 'El puerto Fa0/3 donde está conectado PC1 pertenece a la VLAN 1 (default) del switch. La infraestructura opera en VLAN 10 (EMPLEADOS). Las VLANs aíslan el tráfico: PC1 en VLAN 1 no puede ver nada de VLAN 10, ni el gateway. Fix: "interface Fa0/3 → switchport access vlan 10". Importante: configurar siempre el puerto de acceso con la VLAN correcta al conectar un nuevo equipo.',
  },

  {
    id: 'v2-vlan-not-created', num: 32, difficulty: 'facil',
    title: 'VLAN Asignada pero No Existe',
    category: 'VLANs · Capa 2', estimatedTime: '6–9 min', points: 90,
    symptom: 'PC1 tiene el puerto asignado a VLAN 30 pero no hay conectividad. El switch muestra el puerto como inactivo aunque el cable está correctamente conectado.',
    topology: {
      viewBox: '0 0 560 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.30.10/24', x: 90,  y: 100 },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Catalyst 2960',    x: 290, y: 100 },
        { id: 'r1',  type: 'router', label: 'R1',  sublabel: 'GW 192.168.30.1', x: 470, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/2', faulty: true  },
        { from: 'sw1', to: 'r1',  fromLabel: 'Gi0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.30.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.30.1` },
        { cmd: 'ping 192.168.30.1',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      sw1: [
        { cmd: 'show vlan brief', revealsFault: true,
          output: `VLAN Name                 Status    Ports\n---- ----------------- --------- -------------------------\n1    default           active    Fa0/1\n10   EMPLEADOS         active    Fa0/3, Fa0/4, Gi0/1\n20   SERVIDORES        active    Fa0/5\n\n(VLAN 30 no aparece — no está creada en la base de datos del switch)` },
        { cmd: 'show interfaces Fa0/2 switchport', revealsFault: true,
          output: `Name: Fa0/2\nSwitchport: Enabled\nAdministrative Mode: static access\nOperational Mode: static access\nAccess Mode VLAN: 30 (Inactive)\nTrunking Native Mode VLAN: 1 (native)` },
        { cmd: 'show interfaces Fa0/2 status',
          output: `Port    Name     Status     Vlan  Duplex Speed Type\nFa0/2            inactive   30    auto   auto  10/100BaseTX` },
      ],
      r1: [
        { cmd: 'show ip interface brief',
          output: `Interface              IP-Address     OK? Status Protocol\nGi0/0.10               192.168.10.1   YES up     up\nGi0/0.30               192.168.30.1   YES up     up` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config)# vlan 30\nSW1(config-vlan)# name CONTABILIDAD\nSW1(config-vlan)# exit', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'El cable entre PC1 y SW1 está físicamente dañado, por eso el puerto aparece inactivo', correct: false },
      { id: 'b', text: 'El puerto Fa0/2 está asignado a VLAN 30, pero VLAN 30 no existe en la base de datos del switch. Un puerto asignado a una VLAN inexistente queda en estado "inactive"', correct: true },
      { id: 'c', text: 'La IP de PC1 no es válida para la red — debería ser 192.168.1.30', correct: false },
      { id: 'd', text: 'El router no tiene subinterface para VLAN 30 así que el puerto del switch permanece inactivo', correct: false },
    ],
    hints: [
      'El puerto está físicamente up pero "show interfaces Fa0/2 status" lo muestra como "inactive". Esto no es un fallo de cable.',
      'Compara las VLANs que aparecen en "show vlan brief" con la VLAN asignada al puerto Fa0/2. ¿Existe VLAN 30?',
      'Un puerto con "Access Mode VLAN: 30 (Inactive)" indica que VLAN 30 no está creada. Fix: entrar al modo "vlan 30" en el switch para crearla.',
    ],
    solutionExplanation: 'Cisco IOS Catalyst pone un puerto en estado "inactive" cuando la VLAN asignada no existe en la VLAN database del switch. El administrador configuró "switchport access vlan 30" pero nunca ejecutó "vlan 30" para crearla. Fix: "vlan 30 → name CONTABILIDAD" en modo de configuración global. Una vez creada la VLAN, el puerto pasa automáticamente a estado activo.',
  },

  {
    id: 'v3-trunk-not-configured', num: 33, difficulty: 'medio',
    title: 'Trunk No Configurado',
    category: 'VLANs · Trunking', estimatedTime: '10–14 min', points: 130,
    symptom: 'PC1 (conectado a SW1) y PC2 (conectado a SW2) están en la misma VLAN 10 pero no pueden comunicarse entre sí. Los dispositivos en el mismo switch sí se ven.',
    topology: {
      viewBox: '0 0 620 200',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1', sublabel: '192.168.10.10',     x: 60,  y: 100 },
        { id: 'sw1', type: 'switch', label: 'SW1', sublabel: 'Gi0/2 → SW2',      x: 230, y: 100 },
        { id: 'sw2', type: 'switch', label: 'SW2', sublabel: 'Gi0/2 → SW1',      x: 400, y: 100 },
        { id: 'pc2', type: 'pc',     label: 'PC2', sublabel: '192.168.10.20',     x: 560, y: 100 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1', faulty: false },
        { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/2', toLabel: 'Gi0/2', faulty: true },
        { from: 'sw2', to: 'pc2', fromLabel: 'Fa0/1', toLabel: '', faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.10.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.10.1` },
        { cmd: 'ping 192.168.10.20',
          output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      sw1: [
        { cmd: 'show vlan brief',
          output: `VLAN Name                 Status    Ports\n---- ----------------- --------- -------------------------\n1    default           active    Gi0/2\n10   EMPLEADOS         active    Fa0/1, Fa0/2, Fa0/3\n20   SERVIDORES        active    Fa0/4, Fa0/5` },
        { cmd: 'show interfaces Gi0/2 switchport', revealsFault: true,
          output: `Name: Gi0/2\nSwitchport: Enabled\nAdministrative Mode: static access\nOperational Mode: static access\nAccess Mode VLAN: 1 (default)\nTrunking Native Mode VLAN: 1 (native)\nTrunking VLANs Enabled: ALL\n\n(¡Este enlace entre switches debería ser TRUNK!)` },
        { cmd: 'show interfaces trunk',
          output: `(No hay interfaces en modo trunk configuradas en este switch)` },
      ],
      sw2: [
        { cmd: 'show vlan brief',
          output: `VLAN Name                 Status    Ports\n---- ----------------- --------- -------------------------\n1    default           active    Gi0/2\n10   EMPLEADOS         active    Fa0/1, Fa0/2\n20   SERVIDORES        active    Fa0/3` },
        { cmd: 'show interfaces Gi0/2 switchport', revealsFault: true,
          output: `Name: Gi0/2\nSwitchport: Enabled\nAdministrative Mode: static access\nOperational Mode: static access\nAccess Mode VLAN: 1 (default)\n\n(También en modo ACCESS — ambos extremos deben ser trunk)` },
      ],
    },
    fault: { deviceId: 'sw1', fixCommand: 'SW1(config)# interface Gi0/2\nSW1(config-if)# switchport mode trunk\n\nSW2(config)# interface Gi0/2\nSW2(config-if)# switchport mode trunk', layer: 2 },
    diagnosisOptions: [
      { id: 'a', text: 'La VLAN 10 no está creada en SW2, por eso los paquetes no llegan al otro switch', correct: false },
      { id: 'b', text: 'El enlace entre SW1 y SW2 (Gi0/2↔Gi0/2) está configurado en modo ACCESS en ambos extremos. Solo puede transportar tráfico de VLAN 1, dejando el tráfico de VLAN 10 y 20 sin paso entre switches', correct: true },
      { id: 'c', text: 'Falta añadir las rutas IP entre los dos switches para que el tráfico inter-switch funcione', correct: false },
      { id: 'd', text: 'El problema es que PC1 y PC2 tienen direcciones IP en subredes distintas', correct: false },
    ],
    hints: [
      'PC1 llega a PC3 en el mismo switch (SW1) pero no a PC2 en SW2. El problema está en el enlace entre los dos switches.',
      'Inspecciona el puerto Gi0/2 de SW1 con "show interfaces Gi0/2 switchport". Fíjate en el "Administrative Mode".',
      'El puerto Gi0/2 está en modo "static access" — solo transporta tráfico de VLAN 1. El enlace inter-switch debe ser TRUNK para llevar múltiples VLANs. Fix: "switchport mode trunk" en ambos extremos.',
    ],
    solutionExplanation: 'Un enlace trunk entre switches es necesario para que el tráfico de múltiples VLANs pueda cruzar el enlace inter-switch. Con el modo "access" configurado en Gi0/2, el switch solo permite pasar tráfico de VLAN 1 (etiquetas IEEE 802.1Q descartadas). PC1 (VLAN 10, SW1) y PC2 (VLAN 10, SW2) no pueden comunicarse porque la trama de VLAN 10 es bloqueada en el enlace. Fix: "switchport mode trunk" en Gi0/2 de ambos switches.',
  },

  {
    id: 'v4-intervlan-no-subinterface', num: 34, difficulty: 'medio',
    title: 'Inter-VLAN: Subinterface Faltante',
    category: 'VLANs · Inter-VLAN Routing', estimatedTime: '12–16 min', points: 135,
    symptom: 'Los equipos de VLAN 20 (Servidores) no tienen conectividad con ninguna otra red. Los equipos de VLAN 10 sí funcionan correctamente. La topología usa Router-on-a-Stick.',
    topology: {
      viewBox: '0 0 620 220',
      nodes: [
        { id: 'pc1', type: 'pc',     label: 'PC1',    sublabel: 'VLAN 10 · 192.168.10.10', x: 60,  y: 70  },
        { id: 'srv', type: 'server', label: 'SRV1',   sublabel: 'VLAN 20 · 192.168.20.10', x: 60,  y: 160 },
        { id: 'sw1', type: 'switch', label: 'SW1',    sublabel: 'Trunk → R1',              x: 280, y: 110 },
        { id: 'r1',  type: 'router', label: 'R1',     sublabel: 'Gi0/0 (trunk)',           x: 500, y: 110 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', fromLabel: '', toLabel: 'Fa0/1 (VLAN10)', faulty: false },
        { from: 'srv', to: 'sw1', fromLabel: '', toLabel: 'Fa0/2 (VLAN20)', faulty: false },
        { from: 'sw1', to: 'r1',  fromLabel: 'Gi0/1 (trunk)', toLabel: 'Gi0/0', faulty: true },
      ],
    },
    commands: {
      srv: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.20.10\n   Máscara  . : 255.255.255.0\n   Gateway  . : 192.168.20.1` },
        { cmd: 'ping 192.168.20.1',
          output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'ping 192.168.10.10',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      pc1: [
        { cmd: 'ping 192.168.10.1',
          output: `Respuesta desde 192.168.10.1: bytes=32 tiempo=1ms TTL=255\nPaquetes: enviados=4, recibidos=4, perdidos=0 (0%)` },
        { cmd: 'ping 192.168.20.10',
          output: `Respuesta desde 192.168.20.10: tiempo de espera agotado (gateway de VLAN20 no existe)\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      r1: [
        { cmd: 'show ip interface brief', revealsFault: true,
          output: `Interface              IP-Address      OK? Status Protocol\nGigabitEthernet0/0     unassigned      YES up     up\nGigabitEthernet0/0.10  192.168.10.1    YES up     up\n(No existe Gi0/0.20 — la subinterface para VLAN 20 no está creada)` },
        { cmd: 'show running-config | section interface',
          output: `interface GigabitEthernet0/0\n no ip address\n!\ninterface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\n!` },
        { cmd: 'show ip route',
          output: `C  192.168.10.0/24 is directly connected, Gi0/0.10\n(No hay ruta para 192.168.20.0/24)` },
      ],
      sw1: [
        { cmd: 'show interfaces trunk',
          output: `Port        Mode  Encapsulation Status    Native vlan\nGi0/1       on    802.1q        trunking  1\n\nVLANs allowed and active in management domain:\nGi0/1    10,20` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# interface GigabitEthernet0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 192.168.20.1 255.255.255.0', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'El switch no está enviando tráfico de VLAN 20 por el trunk hacia el router', correct: false },
      { id: 'b', text: 'El router R1 tiene la subinterface Gi0/0.10 para VLAN 10 pero no tiene la subinterface Gi0/0.20 para VLAN 20. Sin ella, no hay gateway para los equipos de VLAN 20 ni ruta para esa subred', correct: true },
      { id: 'c', text: 'La IP del servidor SRV1 está en la subred incorrecta; debería usar 192.168.10.x', correct: false },
      { id: 'd', text: 'Falta configurar "ip routing" en el switch SW1 para que funcione el inter-VLAN', correct: false },
    ],
    hints: [
      'PC1 en VLAN 10 funciona correctamente. El problema afecta solo a VLAN 20. El router gestiona el routing inter-VLAN.',
      'Ejecuta "show ip interface brief" en R1. Compara las subinterfaces existentes con las VLANs configuradas en el switch.',
      'Gi0/0.10 existe para VLAN 10, pero no hay Gi0/0.20 para VLAN 20. Fix: crear la subinterface con "encapsulation dot1Q 20" + "ip address 192.168.20.1 255.255.255.0".',
    ],
    solutionExplanation: 'En Router-on-a-Stick, cada VLAN necesita una subinterface dedicada en el router con "encapsulation dot1Q <vlan-id>" para que el router etiquete/desetiquete el tráfico IEEE 802.1Q y le asigne una dirección IP que actúa como gateway. La subinterface para VLAN 20 no estaba creada, por lo que no había gateway ni ruta para 192.168.20.0/24. Fix: "interface Gi0/0.20 → encapsulation dot1Q 20 → ip address 192.168.20.1 255.255.255.0".',
  },

  {
    id: 'v5-acl-implicit-deny', num: 35, difficulty: 'medio',
    title: 'ACL Sin Permit — Bloquea Todo',
    category: 'ACLs · Capa 3', estimatedTime: '10–14 min', points: 140,
    symptom: 'Tras aplicar una ACL para bloquear un servidor comprometido, todos los usuarios de la red han perdido el acceso a internet. El administrador solo quería bloquear la IP 10.0.0.50.',
    topology: {
      viewBox: '0 0 620 200',
      nodes: [
        { id: 'pc1',  type: 'pc',     label: 'PC1',        sublabel: '10.0.0.10',       x: 80,  y: 80  },
        { id: 'srv',  type: 'server', label: 'Infectado',  sublabel: '10.0.0.50',       x: 80,  y: 160 },
        { id: 'r1',   type: 'router', label: 'R1',         sublabel: 'ACL BLOCK-HOST',  x: 310, y: 120 },
        { id: 'inet', type: 'server', label: 'Internet',   sublabel: '8.8.8.8',         x: 530, y: 120 },
      ],
      links: [
        { from: 'pc1',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0 (in)', faulty: true  },
        { from: 'srv',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0 (in)', faulty: true  },
        { from: 'r1',   to: 'inet', fromLabel: 'Gi0/1', toLabel: '',      faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ping 8.8.8.8',
          output: `Tiempo de espera agotado.\nTiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
        { cmd: 'ping 10.0.0.1',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      r1: [
        { cmd: 'show access-lists', revealsFault: true,
          output: `Extended IP access list BLOCK-HOST\n  10 deny   ip host 10.0.0.50 any (5 matches)\n\n(¡Falta un "permit ip any any"! La negación implícita al final bloquea todo el tráfico no coincidente)` },
        { cmd: 'show ip interface Gi0/0',
          output: `GigabitEthernet0/0 is up, line protocol is up\n  Inbound access list is BLOCK-HOST` },
        { cmd: 'show running-config | include access-list',
          output: `ip access-list extended BLOCK-HOST\n deny ip host 10.0.0.50 any\n(implicit deny ip any any)` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip access-list extended BLOCK-HOST\nR1(config-ext-nacl)# permit ip any any', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La ACL está aplicada en la dirección equivocada; debería ser "outbound" en Gi0/1 para funcionar correctamente', correct: false },
      { id: 'b', text: 'La ACL BLOCK-HOST solo tiene la regla "deny host 10.0.0.50". Al final de toda ACL Cisco hay un "deny any any" implícito, por lo que todo el tráfico que no sea de 10.0.0.50 también queda bloqueado por esta regla implícita', correct: true },
      { id: 'c', text: 'La ACL debería ser Estándar, no Extended, para bloquear un host individual correctamente', correct: false },
      { id: 'd', text: 'El problema está en el NAT del router, no en la ACL; el NAT está descartando las sesiones', correct: false },
    ],
    hints: [
      'La ACL se aplicó justo antes de la interrupción. Revisa su contenido con "show access-lists".',
      'Las ACLs de Cisco siempre tienen un "deny ip any any" implícito al final que no aparece en pantalla. Si tu ACL no termina con un "permit ip any any" explícito, todo el tráfico no coincidente será bloqueado.',
      'La solución es añadir "permit ip any any" al final de la ACL BLOCK-HOST para que solo el tráfico de 10.0.0.50 sea bloqueado y el resto pase normalmente.',
    ],
    solutionExplanation: 'Todas las ACLs de Cisco IOS tienen una regla implícita "deny ip any any" al final que no aparece en la salida de "show access-lists". Si la ACL solo contiene reglas deny y ningún permit explícito, todo el tráfico que no haga match con las reglas deny llegará a la regla implícita y será descartado. Fix: añadir "permit ip any any" al final de la ACL para permitir el tráfico legítimo. Regla de oro: siempre terminar las ACLs permisivas con "permit ip any any".',
  },

  {
    id: 'v6-acl-wildcard-error', num: 36, difficulty: 'dificil',
    title: 'Wildcard Mask Incorrecta en ACL',
    category: 'ACLs · Capa 3', estimatedTime: '16–22 min', points: 175,
    symptom: 'El administrador aplicó una ACL para restringir el acceso de la subred 192.168.10.0/28 (16 hosts: .1 a .14) a internet. Sin embargo, todos los equipos de la red 192.168.10.0/24 han perdido conectividad, no solo los del /28.',
    topology: {
      viewBox: '0 0 640 220',
      nodes: [
        { id: 'pc1',  type: 'pc',     label: 'PC-A',    sublabel: '192.168.10.5 (/28)',  x: 70,  y: 70  },
        { id: 'pc2',  type: 'pc',     label: 'PC-B',    sublabel: '192.168.10.100 (/24)',x: 70,  y: 160 },
        { id: 'r1',   type: 'router', label: 'R1',      sublabel: 'ACL RESTRICT-LAN',   x: 320, y: 110 },
        { id: 'inet', type: 'server', label: 'Internet', sublabel: '8.8.8.8',           x: 560, y: 110 },
      ],
      links: [
        { from: 'pc1',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0 (in)', faulty: true  },
        { from: 'pc2',  to: 'r1',   fromLabel: '', toLabel: 'Gi0/0 (in)', faulty: true  },
        { from: 'r1',   to: 'inet', fromLabel: 'Gi0/1', toLabel: '',      faulty: false },
      ],
    },
    commands: {
      pc1: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.10.5\n   Máscara  . : 255.255.255.240  (/28)\n   Gateway  . : 192.168.10.14` },
        { cmd: 'ping 8.8.8.8',
          output: `Tiempo de espera agotado.\nPaquetes: enviados=4, recibidos=0, perdidos=4 (100%)` },
      ],
      pc2: [
        { cmd: 'ipconfig',
          output: `Adaptador Ethernet:\n   IPv4 . . . : 192.168.10.100\n   Máscara  . : 255.255.255.0  (/24)\n   Gateway  . : 192.168.10.254` },
        { cmd: 'ping 8.8.8.8',
          output: `Tiempo de espera agotado.\n(PC-B también está bloqueado, aunque está fuera del /28 que se quería restringir)` },
      ],
      r1: [
        { cmd: 'show access-lists', revealsFault: true,
          output: `Extended IP access list RESTRICT-LAN\n  10 deny   ip 192.168.10.0 0.0.0.255 any (312 matches)\n  20 permit ip any any (0 matches)\n\n(Wildcard 0.0.0.255 coincide con TODA la /24, no solo con el /28 deseado)` },
        { cmd: 'show ip interface Gi0/0',
          output: `GigabitEthernet0/0 is up\n  Inbound access list is RESTRICT-LAN` },
        { cmd: 'show running-config | section access-list',
          output: `ip access-list extended RESTRICT-LAN\n deny ip 192.168.10.0 0.0.0.255 any\n permit ip any any` },
      ],
    },
    fault: { deviceId: 'r1', fixCommand: 'R1(config)# ip access-list extended RESTRICT-LAN\nR1(config-ext-nacl)# no 10\nR1(config-ext-nacl)# 10 deny ip 192.168.10.0 0.0.0.15 any\n\n(Wildcard correcta para /28: 0.0.0.15 — permite bits 0-3 del último octeto)', layer: 3 },
    diagnosisOptions: [
      { id: 'a', text: 'La ACL está aplicada en la interfaz incorrecta; debería estar en Gi0/1 outbound para funcionar solo con el /28', correct: false },
      { id: 'b', text: 'La wildcard mask de la regla deny es 0.0.0.255, que corresponde a una /24 completa (256 hosts). El administrador quería bloquear solo la /28 (16 hosts), para lo que la wildcard correcta es 0.0.0.15', correct: true },
      { id: 'c', text: 'El problema es que la regla "permit ip any any" debería estar antes que la regla deny para que el tráfico no bloqueado pueda pasar primero', correct: false },
      { id: 'd', text: 'Falta especificar el protocolo correcto; "ip" no funciona con ACLs Extended, debe ser "tcp" o "udp"', correct: false },
    ],
    hints: [
      'El objetivo era bloquear solo 192.168.10.0/28 (IPs .1 a .14). Pero PC-B con IP .100 también está bloqueado. Revisa la ACL con "show access-lists".',
      'La wildcard mask en una ACL funciona como máscara invertida: los bits en "0" deben coincidir, los bits en "1" pueden variar. 0.0.0.255 permite variar los 8 bits del último octeto → bloquea toda la /24. Para una /28 se necesita 0.0.0.15 (permite variar los 4 bits menos significativos, es decir .0 a .15).',
      'Fórmula de wildcard: 255.255.255.255 − máscara de subred. Para /28 (255.255.255.240): 255−255=0, 255−255=0, 255−255=0, 255−240=15 → wildcard = 0.0.0.15. Fix: reemplazar "0.0.0.255" por "0.0.0.15" en la regla 10.',
    ],
    solutionExplanation: 'La wildcard mask en ACLs de Cisco es la inversa de la máscara de subred. Para /28 (255.255.255.240), la wildcard correcta es 0.0.0.15 (no 0.0.0.255 que corresponde a /24). Con 0.0.0.255, la regla deny hace match con cualquier IP de 192.168.10.0 a 192.168.10.255 — bloqueando toda la /24. Fórmula: wildcard = 255.255.255.255 − máscara. Para /28: 255−240 = 15 → 0.0.0.15. Fix: "no 10" + "10 deny ip 192.168.10.0 0.0.0.15 any".',
  },

];

export default SCENARIOS;
