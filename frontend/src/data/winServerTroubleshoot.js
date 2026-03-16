/**
 * winServerTroubleshoot.js — Escenarios de Troubleshooting de Windows Server
 *
 * Formato especial: cada escenario empieza con un PROBLEMA ya dado (algo está roto)
 * y el alumno debe diagnosticar y resolver usando comandos PS reales.
 * Campo extra: `type: 'troubleshoot'` y `problem` (descripción del fallo).
 */

export const WIN_MODULE_TROUBLESHOOT = {
  id: 'troubleshoot',
  title: 'Troubleshooting Real',
  description: 'Diagnostica y resuelve problemas reales de Windows Server. Algo está roto — encuéntralo y arréglalo.',
  icon: '🔧',
  color: 'from-red-600 to-orange-600',
  xp: 400,
  badge: 'SRE',
  scenarios: ['ts-dns', 'ts-ad-auth', 'ts-services', 'ts-network'],
};

export const WIN_SCENARIOS_TROUBLESHOOT = [

  // ══════════════════════════════════════════════════════
  // 1. DNS NO RESUELVE
  // ══════════════════════════════════════════════════════
  {
    id: 'ts-dns',
    moduleId: 'troubleshoot',
    type: 'troubleshoot',
    title: 'DNS: Los clientes no resuelven nombres internos',
    problem: 'Los usuarios reportan que no pueden acceder a \\\\FILESERVER ni a ningún recurso por nombre. El ping a IPs funciona bien, pero por nombre falla. El servicio DNS parece estar corriendo, pero algo falla.',
    description: 'Diagnostica y resuelve un fallo de resolución DNS en Windows Server. Algo está mal — encuéntralo usando PowerShell.',
    difficulty: 'intermediate',
    xp: 100,
    minutes: 25,
    objectives: [
      'Verificar el estado del servicio DNS',
      'Identificar zonas DNS rotas o mal configuradas',
      'Diagnosticar la replicación AD-integrada',
      'Restaurar la funcionalidad DNS',
    ],
    theory: `## Troubleshooting DNS en Windows Server

El servicio DNS de Windows Server se integra con Active Directory. Los fallos más comunes son:

### Checklist de diagnóstico DNS

\`\`\`
1. ¿Está el servicio DNS corriendo?      → Get-Service DNS
2. ¿Existen las zonas correctas?         → Get-DnsServerZone
3. ¿Hay registros de host (A) válidos?   → Get-DnsServerResourceRecord
4. ¿Responde el servidor a queries?      → Resolve-DnsName / nslookup
5. ¿Hay errores en el event log DNS?     → Get-WinEvent -LogName DNS Server
6. ¿La replicación AD funciona?          → repadmin /showrepl
\`\`\`

### Causas frecuentes

- Servicio DNS detenido o en error
- Zona DNS borrada o corrupta
- Registros A apuntando a IP incorrecta
- Problema de replicación AD (zona AD-integrada)
- Caché DNS corrupta en el servidor
- Forwarders mal configurados`,

    steps: [
      {
        title: 'Verificar el estado del servicio DNS',
        explanation: `Primer paso en cualquier troubleshooting DNS: comprobar si el servicio está corriendo. Si está detenido, ahí está el problema. Si está corriendo pero hay fallos, hay que seguir investigando.`,
        command: 'Get-Service -Name DNS | Select-Object Name, Status, StartType',
        expectedOutput: `Name Status  StartType
---- ------  ---------
DNS  Stopped Automatic`,
        hint: 'Usa Get-Service -Name DNS con Select-Object Name, Status y StartType.',
      },
      {
        title: 'Iniciar el servicio DNS',
        explanation: `El servicio estaba detenido. Lo iniciamos. El tipo de inicio es Automatic, por lo que debería haber arrancado solo — hay que investigar por qué no lo hizo (puede ser una dependencia fallida o un error de inicio).`,
        command: 'Start-Service -Name DNS',
        expectedOutput: ``,
        hint: 'Usa Start-Service -Name DNS para iniciar el servicio.',
      },
      {
        title: 'Verificar que el servicio DNS está activo',
        explanation: `Confirmamos que el servicio ha arrancado correctamente y verificamos las zonas DNS disponibles para asegurarnos de que el servicio funciona con normalidad.`,
        command: 'Get-Service -Name DNS | Select-Object Name, Status',
        expectedOutput: `Name Status
---- ------
DNS  Running`,
        hint: 'Vuelve a usar Get-Service -Name DNS para confirmar que ahora el Status es Running.',
      },
      {
        title: 'Verificar las zonas DNS del servidor',
        explanation: `Comprobamos que las zonas DNS están correctamente configuradas. La zona interna del dominio debe estar presente y en estado correcto.`,
        command: 'Get-DnsServerZone | Select-Object ZoneName, ZoneType, IsAutoCreated, IsDsIntegrated | Format-Table -AutoSize',
        expectedOutput: `ZoneName                ZoneType   IsAutoCreated IsDsIntegrated
--------                --------   ------------- --------------
corp.local              Primary    False         True
_msdcs.corp.local       Primary    True          True
0.in-addr.arpa          Primary    True          False`,
        hint: 'Usa Get-DnsServerZone con Select-Object para ZoneName, ZoneType, IsAutoCreated e IsDsIntegrated.',
      },
      {
        title: 'Verificar resolución DNS de nombre interno',
        explanation: `Probamos que ahora los nombres internos se resuelven correctamente. Resolve-DnsName es el equivalente moderno de nslookup en PowerShell.`,
        command: 'Resolve-DnsName -Name "FILESERVER.corp.local" -Server "127.0.0.1"',
        expectedOutput: `Name                    Type   TTL   Section    IPAddress
----                    ----   ---   -------    ---------
FILESERVER.corp.local   A      1200  Answer     192.168.1.50`,
        hint: 'Usa Resolve-DnsName con -Name del servidor y -Server 127.0.0.1 para forzar la consulta al servidor DNS local.',
      },
      {
        title: 'Revisar el event log de DNS para evitar recurrencias',
        explanation: `Revisamos los últimos eventos del log de DNS para entender por qué se detuvo el servicio y prevenir que vuelva a ocurrir.`,
        command: 'Get-WinEvent -LogName "DNS Server" -MaxEvents 10 | Select-Object TimeCreated, Id, LevelDisplayName, Message | Format-Table -AutoSize -Wrap',
        expectedOutput: `TimeCreated         Id    LevelDisplayName  Message
-----------         --    ----------------  -------
01/01/2024 09:45:00 4015  Error             The DNS server has encountered a critical error...
01/01/2024 09:44:59 4013  Warning           The DNS server is waiting for AD DS to signal...
01/01/2024 10:30:00 2    Information       The DNS Server service has started successfully.`,
        hint: 'Usa Get-WinEvent -LogName "DNS Server" con -MaxEvents 10 y formatea la salida con Format-Table -Wrap.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 2. AD NO AUTENTICA USUARIOS
  // ══════════════════════════════════════════════════════
  {
    id: 'ts-ad-auth',
    moduleId: 'troubleshoot',
    type: 'troubleshoot',
    title: 'Active Directory: Usuarios no pueden autenticarse',
    problem: 'Los usuarios de la OU "Ventas" reportan que no pueden iniciar sesión. El mensaje de error es "La cuenta de usuario está bloqueada" o "El nombre de usuario o la contraseña son incorrectos". Algunos sí pueden entrar, otros no.',
    description: 'Investiga y resuelve problemas de autenticación en Active Directory: cuentas bloqueadas, contraseñas expiradas y políticas de bloqueo.',
    difficulty: 'intermediate',
    xp: 100,
    minutes: 25,
    objectives: [
      'Identificar cuentas de usuario bloqueadas',
      'Desbloquear cuentas y forzar cambio de contraseña',
      'Verificar la política de bloqueo de cuentas',
      'Identificar la fuente de los intentos fallidos',
    ],
    theory: `## Troubleshooting de Autenticación AD

### Causas más frecuentes de fallos de autenticación

| Causa | Diagnóstico | Solución |
|---|---|---|
| Cuenta bloqueada | Get-ADUser -Properties LockedOut | Unlock-ADAccount |
| Contraseña expirada | Get-ADUser -Properties PasswordExpired | Set-ADUser -ChangePasswordAtLogon $true |
| Cuenta desactivada | Get-ADUser -Properties Enabled | Enable-ADAccount |
| Hora desincronizada | w32tm /query /status | w32tm /resync |
| Kerberos roto | klist purge | Renovar tickets |

### Policy de bloqueo de cuentas (Account Lockout Policy)

La política define cuántos intentos fallidos bloquean una cuenta:
\`\`\`powershell
# Ver política de bloqueo
Get-ADDefaultDomainPasswordPolicy | Select-Object LockoutThreshold, LockoutDuration, LockoutObservationWindow
\`\`\`

### Event IDs relevantes en Security log

- **4625**: Failed logon attempt (¡el más importante!)
- **4740**: Account was locked out
- **4767**: Account was unlocked
- **4648**: Logon using explicit credentials (pass-the-hash indicator)`,

    steps: [
      {
        title: 'Buscar cuentas bloqueadas en la OU Ventas',
        explanation: `Buscamos usuarios bloqueados en la OU afectada. El atributo \`LockedOut\` indica si la cuenta está bloqueada por la política de bloqueo de cuenta.`,
        command: 'Search-ADAccount -LockedOut -UsersOnly -SearchBase "OU=Ventas,DC=corp,DC=local" | Select-Object Name, SamAccountName, LockedOut, BadLogonCount, PasswordExpired',
        expectedOutput: `Name         SamAccountName LockedOut BadLogonCount PasswordExpired
----         -------------- --------- ------------- ---------------
Juan García  jgarcia        True      5             False
Ana Martínez amartinez      True      5             False`,
        hint: 'Usa Search-ADAccount con -LockedOut -UsersOnly y -SearchBase apuntando a la OU Ventas.',
      },
      {
        title: 'Verificar la política de bloqueo de cuenta',
        explanation: `Revisamos la política de contraseñas del dominio para entender en qué condiciones se bloquean las cuentas y cuánto tiempo dura el bloqueo.`,
        command: 'Get-ADDefaultDomainPasswordPolicy | Select-Object LockoutThreshold, LockoutDuration, LockoutObservationWindow, MinPasswordLength',
        expectedOutput: `LockoutThreshold LockoutDuration LockoutObservationWindow MinPasswordLength
---------------- --------------- ------------------------ -----------------
5                00:30:00        00:30:00                 8`,
        hint: 'Usa Get-ADDefaultDomainPasswordPolicy y selecciona LockoutThreshold, LockoutDuration, LockoutObservationWindow y MinPasswordLength.',
      },
      {
        title: 'Desbloquear todas las cuentas afectadas de la OU',
        explanation: `Desbloqueamos masivamente todas las cuentas bloqueadas de la OU Ventas. En producción haría falta investigar la causa antes de desbloquear (puede ser un ataque de fuerza bruta).`,
        command: 'Search-ADAccount -LockedOut -UsersOnly -SearchBase "OU=Ventas,DC=corp,DC=local" | Unlock-ADAccount -PassThru | Select-Object Name, LockedOut',
        expectedOutput: `Name         LockedOut
----         ---------
Juan García  False
Ana Martínez False`,
        hint: 'Pipe el resultado de Search-ADAccount a Unlock-ADAccount con -PassThru para ver la confirmación.',
      },
      {
        title: 'Forzar cambio de contraseña en el próximo login',
        explanation: `Como medida de seguridad, forzamos a los usuarios desbloqueados a cambiar su contraseña en el próximo inicio de sesión para asegurar que las credenciales comprometidas no se reutilicen.`,
        command: 'Get-ADUser -Filter * -SearchBase "OU=Ventas,DC=corp,DC=local" | Set-ADUser -ChangePasswordAtLogon $true',
        expectedOutput: ``,
        hint: 'Usa Get-ADUser con -Filter * y -SearchBase, pipe a Set-ADUser -ChangePasswordAtLogon $true.',
      },
      {
        title: 'Identificar la fuente de los intentos fallidos',
        explanation: `Revisamos el Security Event Log para identificar desde qué equipos se produjeron los intentos fallidos. Esto nos permite saber si fue un usuario con la contraseña guardada en caché o algo más grave.`,
        command: 'Get-WinEvent -LogName Security -FilterHashtable @{Id=4740} -MaxEvents 20 | Select-Object TimeCreated, Message | Format-List',
        expectedOutput: `TimeCreated : 01/01/2024 09:15:00
Message     : A user account was locked out.
              Subject: WINSERVER$
              Account That Was Locked Out: jgarcia
              Caller Computer Name: LAPTOP-VENTAS01`,
        hint: 'Usa Get-WinEvent con -LogName Security y -FilterHashtable @{Id=4740} para buscar eventos de bloqueo.',
      },
      {
        title: 'Verificar estado final de las cuentas',
        explanation: `Confirmamos que todas las cuentas de la OU Ventas están desbloqueadas y operativas.`,
        command: 'Get-ADUser -Filter * -SearchBase "OU=Ventas,DC=corp,DC=local" -Properties LockedOut, PasswordExpired, Enabled | Select-Object Name, Enabled, LockedOut, PasswordExpired | Format-Table -AutoSize',
        expectedOutput: `Name         Enabled LockedOut PasswordExpired
----         ------- --------- ---------------
Juan García  True    False     False
Ana Martínez True    False     False
Pedro López  True    False     False`,
        hint: 'Usa Get-ADUser con -Properties LockedOut, PasswordExpired, Enabled y formatea como tabla.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 3. SERVICIOS QUE NO ARRANCAN
  // ══════════════════════════════════════════════════════
  {
    id: 'ts-services',
    moduleId: 'troubleshoot',
    type: 'troubleshoot',
    title: 'Servicios críticos: IIS y SQL Server no arrancan',
    problem: 'Tras un reinicio del servidor de producción, el sitio web ha dejado de responder. IIS no está levantando y el servicio SQL Server tampoco. Los usuarios no pueden acceder a la aplicación corporativa.',
    description: 'Diagnostica por qué IIS y SQL Server no arrancan tras un reinicio. Identifica dependencias rotas y errores de configuración.',
    difficulty: 'advanced',
    xp: 100,
    minutes: 30,
    objectives: [
      'Identificar servicios detenidos y sus dependencias',
      'Diagnosticar errores de inicio en el event log',
      'Resolver problemas de cuenta de servicio',
      'Restaurar los servicios en el orden correcto',
    ],
    theory: `## Troubleshooting de Servicios de Windows

### Dependencias de servicios

Los servicios de Windows tienen dependencias: un servicio no puede arrancar si sus dependencias están detenidas.

\`\`\`powershell
# Ver dependencias de un servicio
Get-Service -Name W3SVC -RequiredServices
Get-Service -Name W3SVC -DependentServices
\`\`\`

### Cuentas de servicio

Los servicios pueden ejecutarse como:
- **SYSTEM** / **LOCAL SERVICE** / **NETWORK SERVICE** — cuentas integradas
- **Cuenta de servicio AD** — cuenta de dominio con permisos específicos
- **Group Managed Service Accounts (gMSA)** — cuentas gestionadas automáticamente (contraseña rotativa)

### Event IDs de servicios

| ID | Significado |
|---|---|
| 7000 | El servicio no se pudo iniciar |
| 7001 | Dependencia de servicio no disponible |
| 7034 | El servicio terminó inesperadamente |
| 7045 | Se instaló un nuevo servicio |`,

    steps: [
      {
        title: 'Ver todos los servicios detenidos que deberían estar corriendo',
        explanation: `Identificamos qué servicios están detenidos pero tienen tipo de inicio Automatic. Estos son los que deberían haber arrancado con el servidor.`,
        command: 'Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" } | Select-Object Name, DisplayName, Status | Format-Table -AutoSize',
        expectedOutput: `Name     DisplayName                          Status
----     -----------                          ------
W3SVC    World Wide Web Publishing Service    Stopped
MSSQLSERVER SQL Server (MSSQLSERVER)          Stopped
WAS      Windows Process Activation Service   Stopped`,
        hint: 'Usa Get-Service con Where-Object filtrando StartType Automatic y Status Stopped.',
      },
      {
        title: 'Verificar las dependencias del servicio IIS (W3SVC)',
        explanation: `IIS (W3SVC) depende de WAS (Windows Process Activation Service). Si WAS no está corriendo, W3SVC no puede arrancar. Esto es una dependencia crítica.`,
        command: 'Get-Service -Name W3SVC -RequiredServices | Select-Object Name, DisplayName, Status',
        expectedOutput: `Name   DisplayName                          Status
----   -----------                          ------
WAS    Windows Process Activation Service   Stopped
HTTP   HTTP Service                         Running`,
        hint: 'Usa Get-Service -Name W3SVC con -RequiredServices para ver los servicios de los que depende.',
      },
      {
        title: 'Revisar el event log de System para errores de servicio',
        explanation: `El Event Log de System registra los errores de inicio de servicios. Los Event ID 7000 y 7001 indican fallos de inicio y dependencias no disponibles respectivamente.`,
        command: 'Get-WinEvent -LogName System -FilterHashtable @{Id=7000,7001,7034} -MaxEvents 10 | Select-Object TimeCreated, Id, Message | Format-List',
        expectedOutput: `TimeCreated : 01/01/2024 08:00:15
Id          : 7000
Message     : The World Wide Web Publishing Service service failed to start due to the following error: The dependency service or group failed to start.

TimeCreated : 01/01/2024 08:00:10
Id          : 7001
Message     : The World Wide Web Publishing Service service depends on the Windows Process Activation Service service which failed to start...`,
        hint: 'Usa Get-WinEvent con -FilterHashtable @{Id=7000,7001,7034} y Format-List para ver el mensaje completo.',
      },
      {
        title: 'Iniciar el servicio WAS (dependencia de IIS)',
        explanation: `Iniciamos primero WAS, que es la dependencia base de IIS. Siempre hay que resolver las dependencias en orden correcto, de lo más básico a lo más alto.`,
        command: 'Start-Service -Name WAS -PassThru | Select-Object Name, Status',
        expectedOutput: `Name Status
---- ------
WAS  Running`,
        hint: 'Usa Start-Service -Name WAS con -PassThru para ver el estado resultante.',
      },
      {
        title: 'Iniciar IIS y SQL Server',
        explanation: `Con WAS corriendo, ahora podemos iniciar IIS (W3SVC) y SQL Server. El orden importa — IIS necesita WAS, que ya está activo.`,
        command: 'Start-Service -Name W3SVC, MSSQLSERVER -PassThru | Select-Object Name, Status',
        expectedOutput: `Name        Status
----        ------
W3SVC       Running
MSSQLSERVER Running`,
        hint: 'Usa Start-Service con los dos nombres separados por coma y -PassThru para confirmar el resultado.',
      },
      {
        title: 'Verificar el estado final de todos los servicios críticos',
        explanation: `Confirmamos que todos los servicios críticos están operativos. También verificamos que IIS responde a peticiones HTTP.`,
        command: 'Get-Service -Name W3SVC, WAS, MSSQLSERVER | Select-Object Name, DisplayName, Status | Format-Table -AutoSize',
        expectedOutput: `Name        DisplayName                          Status
----        -----------                          ------
MSSQLSERVER SQL Server (MSSQLSERVER)             Running
W3SVC       World Wide Web Publishing Service    Running
WAS         Windows Process Activation Service   Running`,
        hint: 'Usa Get-Service con los nombres de los tres servicios y selecciona Name, DisplayName y Status.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 4. PROBLEMAS DE RED Y CONECTIVIDAD
  // ══════════════════════════════════════════════════════
  {
    id: 'ts-network',
    moduleId: 'troubleshoot',
    type: 'troubleshoot',
    title: 'Red: El servidor no tiene conectividad con la red',
    problem: 'Tras instalar actualizaciones de Windows, el servidor ha perdido conectividad de red. El adaptador aparece como "Identificando red" o "Sin acceso a internet". Los clientes no pueden acceder al servidor por IP ni por nombre.',
    description: 'Diagnostica y resuelve problemas de configuración de red en Windows Server tras una actualización del sistema.',
    difficulty: 'intermediate',
    xp: 100,
    minutes: 25,
    objectives: [
      'Diagnosticar la configuración de red actual',
      'Identificar el adaptador de red con problemas',
      'Restablecer la configuración TCP/IP',
      'Verificar la conectividad y las rutas de red',
    ],
    theory: `## Troubleshooting de Red en Windows Server

### Herramientas PowerShell de diagnóstico de red

\`\`\`powershell
Get-NetIPConfiguration      # Ver IP, gateway, DNS configurados
Get-NetAdapter              # Estado de los adaptadores físicos
Get-NetIPAddress            # Todas las IPs configuradas
Get-NetRoute                # Tabla de rutas
Test-NetConnection          # Equivalente a ping + tracert + telnet
Resolve-DnsName             # Resolución DNS
\`\`\`

### Comandos de reparación TCP/IP

\`\`\`powershell
# Resetear Winsock
netsh winsock reset

# Resetear pila TCP/IP
netsh int ip reset

# Liberar y renovar DHCP
ipconfig /release
ipconfig /renew

# Limpiar caché ARP
arp -d *

# Limpiar caché DNS
Clear-DnsClientCache
\`\`\`

### Checklist de diagnóstico de red

1. ¿El adaptador está habilitado? → Get-NetAdapter
2. ¿Tiene IP configurada? → Get-NetIPAddress
3. ¿Tiene gateway? → Get-NetIPConfiguration
4. ¿Llega al gateway? → Test-NetConnection -ComputerName $gateway
5. ¿Hay resolución DNS? → Resolve-DnsName google.com`,

    steps: [
      {
        title: 'Ver el estado de los adaptadores de red',
        explanation: `Revisamos el estado de todos los adaptadores de red del servidor. Un adaptador en estado "Disconnected" o "NotPresent" indica un problema físico o de driver. Un adaptador "Up" pero sin IP indica un problema de configuración.`,
        command: 'Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed, MacAddress | Format-Table -AutoSize',
        expectedOutput: `Name     InterfaceDescription                   Status       LinkSpeed MacAddress
----     --------------------                   ------       --------- ----------
Ethernet Intel(R) Ethernet Connection I219-V     Disconnected 0 bps     00-11-22-33-44-55`,
        hint: 'Usa Get-NetAdapter con Select-Object Name, InterfaceDescription, Status, LinkSpeed y MacAddress.',
      },
      {
        title: 'Habilitar el adaptador de red',
        explanation: `El adaptador está desactivado (Disabled o Disconnected). Lo habilitamos con Enable-NetAdapter. Esto puede ocurrir si una actualización de Windows deshabilitó el adaptador por incompatibilidad de driver.`,
        command: 'Enable-NetAdapter -Name "Ethernet" -Confirm:$false',
        expectedOutput: ``,
        hint: 'Usa Enable-NetAdapter con -Name "Ethernet" y -Confirm:$false para no pedir confirmación.',
      },
      {
        title: 'Verificar la configuración IP actual',
        explanation: `Comprobamos si el adaptador tiene una IP asignada (DHCP o estática). Si no tiene IP, hay que ver si DHCP funciona o configurar una IP estática.`,
        command: 'Get-NetIPConfiguration -InterfaceAlias "Ethernet"',
        expectedOutput: `InterfaceAlias       : Ethernet
InterfaceIndex       : 4
InterfaceDescription : Intel(R) Ethernet Connection I219-V
NetProfile.Name      : corp.local
IPv4Address          : 169.254.x.x
IPv4DefaultGateway   :
DNSServer            :`,
        hint: 'Usa Get-NetIPConfiguration con -InterfaceAlias "Ethernet" para ver la configuración completa.',
      },
      {
        title: 'Forzar renovación de IP por DHCP',
        explanation: `La IP 169.254.x.x es una APIPA (Automatic Private IP Addressing) — indica que DHCP no respondió. Limpiamos y renovamos la concesión DHCP para intentar obtener una IP válida.`,
        command: 'ipconfig /release "Ethernet"; ipconfig /renew "Ethernet"',
        expectedOutput: `Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : corp.local
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
        hint: 'Usa ipconfig /release seguido de ipconfig /renew con el nombre del adaptador entre comillas.',
      },
      {
        title: 'Verificar la conectividad con el gateway',
        explanation: `Probamos que podemos llegar al gateway predeterminado. Si este test falla, el problema es a nivel de capa 2/3 (switch, VLAN). Si funciona, el problema es más arriba (firewall, routing).`,
        command: 'Test-NetConnection -ComputerName "192.168.1.1" -InformationLevel Detailed',
        expectedOutput: `ComputerName            : 192.168.1.1
RemoteAddress           : 192.168.1.1
NameResolutionResults   : 192.168.1.1
InterfaceAlias          : Ethernet
SourceAddress           : 192.168.1.100
NetRoute (NextHop)      : 192.168.1.1
PingSucceeded           : True
PingReplyDetails (RTT)  : 1 ms`,
        hint: 'Usa Test-NetConnection con -ComputerName apuntando al gateway y -InformationLevel Detailed.',
      },
      {
        title: 'Resetear la pila TCP/IP y limpiar caché DNS',
        explanation: `Como paso final de saneamiento, reseteamos la pila TCP/IP (útil cuando las actualizaciones corrompen configuraciones de Winsock) y limpiamos la caché DNS del cliente.`,
        command: 'Clear-DnsClientCache; Get-DnsClientCache | Measure-Object | Select-Object -ExpandProperty Count',
        expectedOutput: `0`,
        hint: 'Usa Clear-DnsClientCache para limpiar la caché y luego Get-DnsClientCache con Measure-Object para verificar que está vacía.',
      },
    ],
  },
];
