// ── Windows Server Lab Data — Part 2 ─────────────────────────────────────────
// Nuevos módulos: RDS, Clustering, WSUS, Storage Spaces, PKI/CA

export const WIN_MODULES_2 = [
  { id: 'rds',        label: 'RDS / RemoteApp',    icon: '🖥️', color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    desc: 'Remote Desktop Services, RemoteApp, RD Gateway y licencias' },
  { id: 'clustering', label: 'Failover Cluster',   icon: '🔗', color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    desc: 'Alta disponibilidad, nodos, quorum, CSV y mantenimiento' },
  { id: 'wsus',       label: 'WSUS / Updates',     icon: '🔄', color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20',    desc: 'Gestión centralizada de actualizaciones y aprobaciones' },
  { id: 'storage',    label: 'Storage Spaces',     icon: '💾', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   desc: 'Storage Spaces, iSCSI, deduplicación y gestión de discos' },
  { id: 'pki',        label: 'PKI / Certificados', icon: '🔐', color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  desc: 'Autoridad Certificadora, emisión, revocación y plantillas' },
];

export const WIN_SCENARIOS_2 = [

  // ══════════════════════════════════════════════════════
  // MÓDULO 9 — REMOTE DESKTOP SERVICES
  // ══════════════════════════════════════════════════════

  {
    id: 'rds-install',
    subject: 'rds',
    module_order: 1,
    title: 'Instalación y configuración de RDS',
    description: 'Despliega una infraestructura completa de Remote Desktop Services con RD Session Host, RD Broker y RD Web Access.',
    difficulty: 'Intermedio',
    xp: 60,
    estimatedMinutes: 45,
    prerequisites: [],
    objectives: [
      'Instalar los roles RD Session Host, RD Broker y RD Web Access',
      'Crear una colección de sesiones con usuarios autorizados',
      'Configurar el portal web RDWeb para acceso desde navegador',
      'Verificar conexiones remotas con Test-NetConnection',
    ],
    steps: [
      {
        id: 'rds-install-1',
        title: 'Instalar roles de Remote Desktop Services',
        explanation: 'RDS requiere múltiples roles coordinados. Instalamos los tres componentes principales: el servidor de sesiones (RD Session Host), el broker de conexiones (RD Connection Broker) y el acceso web (RD Web Access).',
        command: 'Install-WindowsFeature -Name RDS-RD-Server, RDS-Connection-Broker, RDS-Web-Access -IncludeManagementTools -Restart',
        expectedOutput: 'Success Restart Needed  Exit Code  Feature Result\n------- -------------- ---------  --------------\nTrue    Yes            Success    {Remote Desktop Session Host, Remote Desktop Connection Broker...}',
        hint: 'El servidor se reiniciará automáticamente. Asegúrate de ejecutar esto en horario de mantenimiento.',
      },
      {
        id: 'rds-install-2',
        title: 'Crear el deployment de RDS',
        explanation: 'Tras reiniciar, creamos el deployment estándar de RDS que conecta los tres roles. Usa el FQDN del servidor (o el nombre del broker si es diferente).',
        command: 'New-RDSessionDeployment -ConnectionBroker "srv-dc01.empresa.local" -WebAccessServer "srv-dc01.empresa.local" -SessionHost "srv-dc01.empresa.local"',
        expectedOutput: 'Deployment created successfully.',
        hint: 'Si ves error de WinRM, ejecuta: Enable-PSRemoting -Force en el servidor de destino.',
      },
      {
        id: 'rds-install-3',
        title: 'Crear una colección de sesiones',
        explanation: 'Una colección define qué usuarios pueden conectarse y en qué servidores. Creamos la colección "Empleados" y asignamos el grupo de dominio correspondiente.',
        command: 'New-RDSessionCollection -CollectionName "Empleados" -SessionHost "srv-dc01.empresa.local" -ConnectionBroker "srv-dc01.empresa.local"\nAdd-RDSessionHost -CollectionName "Empleados" -SessionHost "srv-dc01.empresa.local" -ConnectionBroker "srv-dc01.empresa.local"',
        expectedOutput: 'CollectionName : Empleados\nSessionHost    : srv-dc01.empresa.local\nSize           : 1',
        hint: 'El nombre de colección no puede contener espacios si usas PowerShell directo. Usa comillas si es necesario.',
      },
      {
        id: 'rds-install-4',
        title: 'Publicar una RemoteApp',
        explanation: 'Las RemoteApp permiten ejecutar aplicaciones remotas como si fueran locales. Publicamos el Bloc de notas como ejemplo, pero en producción serían apps de negocio.',
        command: 'New-RDRemoteApp -CollectionName "Empleados" -DisplayName "Bloc de Notas" -FilePath "C:\\Windows\\System32\\notepad.exe" -ConnectionBroker "srv-dc01.empresa.local"',
        expectedOutput: 'DisplayName    : Bloc de Notas\nFilePath       : C:\\Windows\\System32\\notepad.exe\nCollectionName : Empleados',
        hint: 'La ruta del FilePath debe ser local al Session Host, no al equipo desde donde ejecutas el comando.',
      },
      {
        id: 'rds-install-5',
        title: 'Configurar límites de sesión y verificar',
        explanation: 'Es crítico definir tiempos máximos de sesión para evitar acumulación de sesiones huérfanas que consumen RAM y licencias.',
        command: 'Set-RDSessionCollectionConfiguration -CollectionName "Empleados" -MaxRedirectedMonitors 2 -DisconnectedSessionLimitMin 60 -IdleSessionLimitMin 30 -ConnectionBroker "srv-dc01.empresa.local"\nGet-RDSessionCollection -ConnectionBroker "srv-dc01.empresa.local" | Select-Object CollectionName, Size',
        expectedOutput: 'CollectionName  Size\n--------------  ----\nEmpleados       1',
        hint: 'DisconnectedSessionLimitMin=60 cierra sesiones desconectadas tras 60 min. IdleSessionLimitMin=30 cierra sesiones inactivas.',
      },
    ],
    theory: `## Remote Desktop Services (RDS)

RDS es la solución de virtualización de escritorios y aplicaciones de Microsoft, sustituto de Terminal Services.

### Componentes principales

| Rol | Función |
| --- | --- |
| **RD Session Host** | Servidor donde corren las sesiones de usuario |
| **RD Connection Broker** | Balanceo de carga y reconexión de sesiones |
| **RD Web Access** | Portal web para acceder vía navegador |
| **RD Gateway** | Acceso seguro desde Internet (HTTPS/443) |
| **RD Licensing** | Gestión de CALs (licencias de acceso) |

### Tipos de licencias (CALs)
- **RDS Per Device CAL**: una licencia por dispositivo físico
- **RDS Per User CAL**: una licencia por usuario (recomendado para móviles)

### RemoteApp vs Escritorio completo
- **RemoteApp**: la aplicación se integra en el escritorio local del usuario
- **Remote Desktop**: sesión de escritorio completo en el servidor

### Puertos importantes
- **3389/TCP**: RDP estándar
- **443/TCP**: RD Web Access y RD Gateway
- **5504/TCP**: RD Connection Broker

### Límites recomendados de sesión
- Sesión desconectada: 60 minutos máximo
- Sesión inactiva: 30 minutos máximo
- Sesión activa: sin límite (o según política de empresa)`,
  },

  {
    id: 'rds-gateway',
    subject: 'rds',
    module_order: 2,
    title: 'RD Gateway y acceso seguro desde Internet',
    description: 'Configura un RD Gateway para permitir conexiones RDP seguras desde el exterior sin exponer el puerto 3389 directamente a Internet.',
    difficulty: 'Avanzado',
    xp: 80,
    estimatedMinutes: 50,
    prerequisites: ['rds-install'],
    objectives: [
      'Instalar y configurar el rol RD Gateway',
      'Crear políticas RAP y CAP para control de acceso',
      'Asignar un certificado SSL al gateway',
      'Verificar la conectividad a través del gateway',
    ],
    steps: [
      {
        id: 'rds-gw-1',
        title: 'Instalar el rol RD Gateway',
        explanation: 'RD Gateway encapsula el tráfico RDP dentro de HTTPS (puerto 443), eliminando la necesidad de exponer el puerto 3389. Requiere un certificado SSL válido.',
        command: 'Install-WindowsFeature -Name RDS-Gateway -IncludeManagementTools\nImport-Module RemoteDesktopServices',
        expectedOutput: 'Success Restart Needed  Exit Code  Feature Result\n------- -------------- ---------  --------------\nTrue    No             Success    {Remote Desktop Gateway}',
        hint: 'RD Gateway se puede instalar en el mismo servidor que los otros roles RDS o en uno dedicado para mayor seguridad.',
      },
      {
        id: 'rds-gw-2',
        title: 'Crear una política de autorización de conexión (CAP)',
        explanation: 'La CAP (Connection Authorization Policy) define QUIÉN puede conectarse a través del gateway. Configuramos que solo los miembros del grupo "RemoteUsers" del dominio puedan acceder.',
        command: 'New-Item -Path "RDS:\\GatewayServer\\CAP" -Name "CAP-Empleados" -UserGroups "empresa.local\\RemoteUsers" -AuthMethod 1',
        expectedOutput: 'Name          : CAP-Empleados\nUserGroups    : empresa.local\\RemoteUsers\nAuthMethod    : Password',
        hint: 'AuthMethod 1 = Password, AuthMethod 2 = SmartCard. Para MFA empresarial, consulta la integración con Azure MFA.',
      },
      {
        id: 'rds-gw-3',
        title: 'Crear política de autorización de recursos (RAP)',
        explanation: 'La RAP (Resource Authorization Policy) define A QUÉ recursos pueden conectarse. Restringimos el acceso solo a los servidores RDS del dominio.',
        command: 'New-Item -Path "RDS:\\GatewayServer\\RAP" -Name "RAP-ServidoresRDS" -UserGroups "empresa.local\\RemoteUsers" -ComputerGroupType 1 -ComputerGroup "empresa.local\\ServidoresRDS"',
        expectedOutput: 'Name              : RAP-ServidoresRDS\nUserGroups        : empresa.local\\RemoteUsers\nComputerGroupType : ADGroup',
        hint: 'ComputerGroupType 1 = grupo de AD. Tipo 2 = grupo local del gateway. Tipo 0 = cualquier recurso (no recomendado).',
      },
      {
        id: 'rds-gw-4',
        title: 'Asignar certificado SSL al Gateway',
        explanation: 'El certificado es obligatorio para HTTPS. Usamos el cmdlet para asignar un certificado existente del almacén de certificados del equipo. En producción debe ser un certificado de una CA pública o corporativa.',
        command: '$cert = Get-ChildItem Cert:\\LocalMachine\\My | Where-Object {$_.Subject -like "*rdgateway*"} | Select-Object -First 1\nSet-Item -Path "RDS:\\GatewayServer\\SSLCertificate\\Thumbprint" -Value $cert.Thumbprint',
        expectedOutput: '',
        hint: 'Si no tienes certificado, créalo con: New-SelfSignedCertificate -DnsName "rdgateway.empresa.local" -CertStoreLocation "Cert:\\LocalMachine\\My"',
      },
      {
        id: 'rds-gw-5',
        title: 'Verificar configuración y estado del servicio',
        explanation: 'Comprobamos que el servicio TSGateway está corriendo y que el puerto 443 está escuchando correctamente antes de hacer pruebas de conexión.',
        command: 'Get-Service -Name TSGateway | Select-Object Name, Status, StartType\nGet-Item -Path "RDS:\\GatewayServer" | Select-Object -ExpandProperty PSChildName\nnetstat -an | findstr ":443"',
        expectedOutput: 'Name       Status  StartType\n----       ------  ---------\nTSGateway  Running Automatic',
        hint: 'Si el servicio no inicia, revisa los eventos en: Get-EventLog -LogName System -Source "Microsoft-Windows-TerminalServices-Gateway" -Newest 10',
      },
    ],
    theory: `## RD Gateway — Acceso seguro desde Internet

### Por qué usar RD Gateway
Sin gateway: el puerto 3389 queda expuesto en el firewall perimetral (alto riesgo de ataques de fuerza bruta).
Con gateway: todo el tráfico RDP va encapsulado en HTTPS (443). El firewall solo necesita abrir el 443.

### Flujo de conexión con Gateway
1. El cliente se conecta al gateway por HTTPS/443
2. El gateway valida credenciales contra AD (CAP)
3. El gateway verifica que el destino está permitido (RAP)
4. El gateway establece el túnel RDP hacia el servidor interno
5. El usuario trabaja normalmente sin saber que hay un proxy intermedio

### Políticas de control de acceso
- **CAP (Connection Authorization Policy)**: controla quién puede usar el gateway
- **RAP (Resource Authorization Policy)**: controla a qué servidores pueden llegar

### Seguridad adicional recomendada
- Integración con **Azure AD MFA** o **NPS + RADIUS** para segundo factor
- **Network Policy Server** para control granular de dispositivos
- Certificados de una **CA pública** o **CA Corporativa** (no autofirmados en producción)
- Registro de auditoría completo en el Event Viewer`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 10 — FAILOVER CLUSTERING
  // ══════════════════════════════════════════════════════

  {
    id: 'cluster-install',
    subject: 'clustering',
    module_order: 1,
    title: 'Creación de un Failover Cluster de dos nodos',
    description: 'Configura un clúster de alta disponibilidad con dos nodos Windows Server, incluyendo validación, creación y configuración del quorum.',
    difficulty: 'Avanzado',
    xp: 90,
    estimatedMinutes: 60,
    prerequisites: [],
    objectives: [
      'Instalar la característica Failover Clustering en ambos nodos',
      'Ejecutar la validación del clúster y revisar el informe',
      'Crear el clúster con IP virtual y nombre de red',
      'Configurar el quorum con disco testigo o cloud witness',
    ],
    steps: [
      {
        id: 'cluster-1',
        title: 'Instalar la característica Failover Clustering',
        explanation: 'La característica Failover Clustering debe instalarse en todos los nodos que formarán el clúster. Usamos Invoke-Command para instalarlo en ambos nodos simultáneamente desde el nodo principal.',
        command: 'Invoke-Command -ComputerName "nodo1", "nodo2" -ScriptBlock {\n    Install-WindowsFeature -Name Failover-Clustering -IncludeManagementTools\n}',
        expectedOutput: 'PSComputerName  Success  Restart Needed\n--------------  -------  --------------\nnodo1           True     No\nnodo2           True     No',
        hint: 'Si Invoke-Command falla, instala la característica manualmente en cada nodo con: Install-WindowsFeature -Name Failover-Clustering -IncludeManagementTools',
      },
      {
        id: 'cluster-2',
        title: 'Validar la configuración del clúster',
        explanation: 'Antes de crear el clúster, Microsoft exige ejecutar la validación. Esta herramienta comprueba red, almacenamiento, SO y configuración de los nodos. Un clúster no validado no tiene soporte de Microsoft.',
        command: 'Test-Cluster -Node "nodo1", "nodo2" -Include "Storage","Network","System Configuration","Hyper-V Configuration" -ReportName "C:\\validacion-cluster"',
        expectedOutput: 'Testing cluster...\nValidating network configuration...\nValidating storage configuration...\nValidation report saved to: C:\\validacion-cluster.mht\nCluster validation completed.',
        hint: 'Abre el informe .mht en IE/Edge para ver los detalles. Cualquier error (en rojo) debe corregirse antes de crear el clúster.',
      },
      {
        id: 'cluster-3',
        title: 'Crear el clúster',
        explanation: 'Creamos el clúster especificando los nodos miembro, el nombre de red virtual (CNO - Cluster Name Object) y la IP virtual. El CNO se crea automáticamente en Active Directory.',
        command: 'New-Cluster -Name "CLUSTER-HA" -Node "nodo1", "nodo2" -StaticAddress "192.168.1.50" -NoStorage',
        expectedOutput: 'Name\n----\nCLUSTER-HA',
        hint: 'Usa -NoStorage si los discos compartidos se agregarán después. El parámetro -StaticAddress asigna la IP al objeto de nombre de clúster.',
      },
      {
        id: 'cluster-4',
        title: 'Agregar almacenamiento compartido al clúster',
        explanation: 'Los clústeres necesitan almacenamiento compartido (iSCSI, FC, SMB 3.0). Una vez conectado el disco compartido en ambos nodos, lo agregamos al clúster.',
        command: 'Get-ClusterAvailableDisk -Cluster "CLUSTER-HA"\nAdd-ClusterDisk -InputObject (Get-ClusterAvailableDisk -Cluster "CLUSTER-HA")',
        expectedOutput: 'Name            State   OwnerGroup\n----            -----   ----------\nDisco Clúster 1 Online  Available Storage',
        hint: 'Si no aparece ningún disco, verifica que el disco iSCSI/SAN está conectado en AMBOS nodos y está inicializado (pero no formateado en ninguno).',
      },
      {
        id: 'cluster-5',
        title: 'Configurar Cloud Witness como quorum',
        explanation: 'El quorum decide qué nodo sobrevive si se pierde comunicación. Cloud Witness usa Azure Blob Storage como tercer voto, eliminando la necesidad de un disco testigo físico.',
        command: 'Set-ClusterQuorum -Cluster "CLUSTER-HA" -CloudWitness -AccountName "mystorageaccount" -AccessKey "clave-de-acceso-azure"\nGet-ClusterQuorum -Cluster "CLUSTER-HA"',
        expectedOutput: 'Cluster        QuorumResource        QuorumType\n-------        --------------        ----------\nCLUSTER-HA     Cloud Witness         NodeAndCloudMajority',
        hint: 'Necesitas una cuenta de Azure Storage con geo-redundancia desactivada. También puedes usar -DiskWitness (disco local) o -FileShareWitness (carpeta compartida).',
      },
    ],
    theory: `## Failover Clustering — Alta Disponibilidad

### Concepto de Failover Cluster
Un clúster de conmutación por error permite que si un nodo falla, otro nodo asuma automáticamente sus cargas de trabajo, minimizando el tiempo de inactividad.

### Tipos de clúster en Windows Server
- **Failover Cluster**: para cargas de trabajo con estado (SQL Server, Hyper-V, File Server)
- **NLB (Network Load Balancing)**: para cargas sin estado (IIS, RD Session Host)
- **Scale-Out File Server**: para almacenamiento altamente disponible (SOFS)

### Quorum — el árbitro del clúster

| Tipo de Quorum | Cuándo usar |
| --- | --- |
| Node Majority | Número impar de nodos (3, 5...) |
| Node and Disk Witness | 2 nodos + disco testigo |
| Node and File Share Witness | 2 nodos sin almacenamiento compartido |
| Node and Cloud Witness | 2 nodos + Azure Blob (recomendado hoy) |

### Conceptos clave
- **CNO (Cluster Name Object)**: cuenta de AD que representa el clúster
- **VCO (Virtual Computer Object)**: cuenta de AD del rol en clúster
- **CSV (Cluster Shared Volumes)**: volúmenes accesibles simultáneamente por todos los nodos
- **Preferred Owner**: nodo preferido para ejecutar un rol
- **Possible Owners**: lista de nodos donde puede ejecutarse un rol

### Niveles de disponibilidad
- Clúster de 2 nodos: soporta el fallo de 1 nodo (50% tolerancia)
- Clúster de 3 nodos: soporta el fallo de 1 nodo (33% tolerancia)
- Clúster de 4+ nodos con quorum correcto: mayor resiliencia`,
  },

  {
    id: 'cluster-csv',
    subject: 'clustering',
    module_order: 2,
    title: 'Cluster Shared Volumes y Hyper-V de alta disponibilidad',
    description: 'Configura CSV para que múltiples nodos accedan simultáneamente al almacenamiento y despliega una VM Hyper-V altamente disponible con migración en vivo.',
    difficulty: 'Avanzado',
    xp: 80,
    estimatedMinutes: 45,
    prerequisites: ['cluster-install'],
    objectives: [
      'Convertir un disco de clúster en Cluster Shared Volume',
      'Crear y configurar un rol Hyper-V de alta disponibilidad',
      'Realizar una migración en vivo (Live Migration) entre nodos',
      'Simular un failover y verificar la recuperación automática',
    ],
    steps: [
      {
        id: 'csv-1',
        title: 'Convertir disco a Cluster Shared Volume (CSV)',
        explanation: 'Los CSV permiten que todos los nodos del clúster lean y escriban simultáneamente en el mismo volumen. Son esenciales para Live Migration de VMs en Hyper-V.',
        command: 'Add-ClusterSharedVolume -Name "Disco Cluster 1" -Cluster "CLUSTER-HA"\nGet-ClusterSharedVolume -Cluster "CLUSTER-HA"',
        expectedOutput: 'Name            State   Node\n----            -----   ----\nDisco Cluster 1 Online  nodo1',
        hint: 'El CSV se monta automáticamente en C:\\ClusterStorage\\Volume1 en todos los nodos. Verifica con: dir \\\\nodo2\\c$\\ClusterStorage',
      },
      {
        id: 'csv-2',
        title: 'Crear VM de alta disponibilidad en el clúster',
        explanation: 'Para que una VM sea altamente disponible, debe estar en el CSV y registrada como rol de clúster. Creamos la VM directamente en el CSV.',
        command: 'New-VM -Name "VM-HA-01" -MemoryStartupBytes 2GB -Generation 2 -Path "C:\\ClusterStorage\\Volume1" -ComputerName "nodo1"\nAdd-ClusterVirtualMachineRole -VirtualMachineName "VM-HA-01" -Cluster "CLUSTER-HA"',
        expectedOutput: 'Name      State   OwnerNode  ResourceType\n----      -----   ---------  ------------\nVM-HA-01  Online  nodo1      Virtual Machine',
        hint: 'La VM debe crearse EN el nodo propietario del CSV. Usa -ComputerName para especificar el nodo donde crearla.',
      },
      {
        id: 'csv-3',
        title: 'Realizar Live Migration entre nodos',
        explanation: 'La migración en vivo mueve una VM encendida de un nodo a otro sin interrupción del servicio. El estado de memoria se transfiere en tiempo real.',
        command: 'Move-ClusterVirtualMachineRole -Name "VM-HA-01" -Node "nodo2" -Cluster "CLUSTER-HA" -MigrationType Live',
        expectedOutput: 'Name      State   OwnerNode  ResourceType\n----      -----   ---------  ------------\nVM-HA-01  Online  nodo2      Virtual Machine',
        hint: 'Live Migration requiere que ambos nodos estén en la misma subred o tengan conectividad de alta velocidad (10GbE recomendado). Para discos: Quick Migration o Storage Migration.',
      },
      {
        id: 'csv-4',
        title: 'Simular fallo de nodo y verificar failover automático',
        explanation: 'Simulamos el fallo del nodo propietario pausando el nodo. El clúster detecta el fallo y mueve automáticamente los roles al nodo superviviente.',
        command: 'Suspend-ClusterNode -Name "nodo2" -Cluster "CLUSTER-HA" -Drain\nGet-ClusterGroup -Cluster "CLUSTER-HA" | Select-Object Name, State, OwnerNode',
        expectedOutput: 'Name      State   OwnerNode\n----      -----   ---------\nVM-HA-01  Online  nodo1',
        hint: 'Suspend-ClusterNode con -Drain migra los roles antes de pausar (mantenimiento seguro). Sin -Drain es un fallo brusco. Reactiva con: Resume-ClusterNode -Name "nodo2"',
      },
    ],
    theory: `## Cluster Shared Volumes (CSV)

### ¿Qué son los CSV?
Los CSV son volúmenes NTFS o ReFS que todos los nodos del clúster pueden leer y escribir simultáneamente. Sin CSV, solo un nodo puede tener el disco montado a la vez.

### Ruta de montaje
Los CSV se montan automáticamente en C:\\ClusterStorage\\VolumeN en todos los nodos. Se acceden igual independientemente del nodo propietario del CSV.

### Live Migration vs Quick Migration vs Storage Migration

| Tipo | Tiempo de interrupción | Requisito |
| --- | --- | --- |
| Live Migration | 0 segundos (en vivo) | Red de alta velocidad + CSV |
| Quick Migration | Segundos (guarda estado) | CSV |
| Storage Migration | 0 segundos | Copia el almacenamiento en caliente |

### Prioridad de failover
- **Preferred Owner**: nodo que "quiere" el rol normalmente
- **Possible Owners**: lista de nodos donde puede ejecutarse
- **Failover threshold**: máximo de failovers en período determinado

### Mantenimiento de nodos
1. Suspender con drenaje: \`Suspend-ClusterNode -Drain\`
2. Realizar el mantenimiento
3. Reanudar: \`Resume-ClusterNode\`
4. Verificar que los roles vuelven al nodo preferido`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 11 — WSUS
  // ══════════════════════════════════════════════════════

  {
    id: 'wsus-install',
    subject: 'wsus',
    module_order: 1,
    title: 'Instalación y configuración inicial de WSUS',
    description: 'Instala Windows Server Update Services y configura la sincronización con Microsoft Update para gestionar las actualizaciones de toda la infraestructura.',
    difficulty: 'Intermedio',
    xp: 55,
    estimatedMinutes: 40,
    prerequisites: [],
    objectives: [
      'Instalar el rol WSUS con almacenamiento local de actualizaciones',
      'Completar el asistente de configuración post-instalación',
      'Configurar sincronización automática diaria con Microsoft',
      'Crear grupos de equipos para aprobación escalonada',
    ],
    steps: [
      {
        id: 'wsus-1',
        title: 'Instalar el rol WSUS',
        explanation: 'WSUS requiere el rol de servidor y la herramienta de administración. Especificamos la ruta donde se almacenarán las actualizaciones descargadas (se necesitan mínimo 30 GB libres).',
        command: 'Install-WindowsFeature -Name UpdateServices -IncludeManagementTools\nNew-Item -Path "D:\\WSUS" -ItemType Directory -Force',
        expectedOutput: 'Success Restart Needed  Exit Code  Feature Result\n------- -------------- ---------  --------------\nTrue    No             Success    {Windows Server Update Services}',
        hint: 'Usa un disco dedicado para WSUS. El volumen de descargas puede crecer hasta cientos de GB según los productos seleccionados.',
      },
      {
        id: 'wsus-2',
        title: 'Ejecutar la configuración post-instalación',
        explanation: 'Tras instalar el rol, debemos ejecutar wsusutil.exe para inicializar la base de datos y el directorio de contenido. Este proceso puede tardar varios minutos.',
        command: 'cd "C:\\Program Files\\Update Services\\Tools"\n.\\wsusutil.exe postinstall CONTENT_DIR=D:\\WSUS',
        expectedOutput: 'Post install is starting...\nPost install has completed.\nThe WSUS content directory has been set to D:\\WSUS.',
        hint: 'Si el comando falla, verifica que el servicio MSSQL$MICROSOFT##WID está corriendo (WSUS usa Windows Internal Database).',
      },
      {
        id: 'wsus-3',
        title: 'Configurar el servidor upstream y sincronización',
        explanation: 'Configuramos WSUS para sincronizar desde Microsoft Update (upstream), seleccionamos los idiomas y productos, y programamos la sincronización automática nocturna.',
        command: '$wsus = Get-WsusServer\n$config = $wsus.GetConfiguration()\n$config.SyncFromMicrosoftUpdate = $true\n$config.TargetingMode = "Client"\n$config.Save()\n\n$subscription = $wsus.GetSubscription()\n$subscription.SynchronizeAutomatically = $true\n$subscription.SynchronizeAutomaticallyTimeOfDay = "03:00:00"\n$subscription.Save()',
        expectedOutput: '',
        hint: 'Usa Get-WsusServer sin parámetros para conectar al servidor local. Para conectar a un WSUS remoto: Get-WsusServer -Name "srv-wsus" -PortNumber 8530',
      },
      {
        id: 'wsus-4',
        title: 'Crear grupos de equipos para aprobación escalonada',
        explanation: 'La mejor práctica es aprobar actualizaciones primero en un grupo piloto y tras verificar que no hay problemas, aprobarlas para el resto. Creamos tres grupos: Piloto, Produccion y Servidores.',
        command: '$wsus = Get-WsusServer\n$wsus.CreateComputerTargetGroup("Piloto")\n$wsus.CreateComputerTargetGroup("Produccion")\n$wsus.CreateComputerTargetGroup("Servidores")\n$wsus.GetComputerTargetGroups() | Select-Object Name',
        expectedOutput: 'Name\n----\nAll Computers\nUnassigned Computers\nPiloto\nProduccion\nServidores',
        hint: 'Los grupos "All Computers" y "Unassigned Computers" existen por defecto y no se pueden eliminar.',
      },
      {
        id: 'wsus-5',
        title: 'Aprobar actualizaciones críticas para el grupo Piloto',
        explanation: 'Aprobamos manualmente las actualizaciones clasificadas como Critical y Security para el grupo Piloto. Una vez validadas en 48h, aprobaremos para Produccion.',
        command: '$wsus = Get-WsusServer\n$piloto = $wsus.GetComputerTargetGroups() | Where-Object {$_.Name -eq "Piloto"}\n$updates = $wsus.GetUpdates() | Where-Object {$_.UpdateClassificationTitle -in "Critical Updates","Security Updates" -and $_.IsApproved -eq $false}\n$updates | Approve-WsusUpdate -Action Install -TargetGroupName "Piloto"\nWrite-Host "Aprobadas $($updates.Count) actualizaciones para Piloto"',
        expectedOutput: 'Aprobadas 47 actualizaciones para Piloto',
        hint: 'Para ver el estado de aprobación: $wsus.GetUpdates() | Group-Object ApprovalSummary | Select-Object Name, Count',
      },
    ],
    theory: `## Windows Server Update Services (WSUS)

### Por qué usar WSUS
Sin WSUS, cada equipo descarga actualizaciones directamente de Microsoft, consumiendo mucho ancho de banda y sin control centralizado. Con WSUS, las actualizaciones se descargan una vez y se distribuyen internamente.

### Arquitectura WSUS

- **Servidor WSUS upstream**: sincroniza con Microsoft Update
- **Servidores WSUS downstream (réplicas)**: sincronizan del upstream (para delegaciones o sucursales)
- **Clientes**: reciben aprobaciones y descargan del servidor WSUS local

### Flujo de aprobación recomendado
1. Sincronización automática nocturna (03:00 AM)
2. Aprobación manual para grupo **Piloto** (5-10 equipos representativos)
3. Esperar 48-72 horas y revisar logs en Event Viewer
4. Aprobar para **Produccion** si no hay incidencias
5. Aprobar para **Servidores** en ventana de mantenimiento programada

### GPO para apuntar clientes a WSUS
- Ruta: Computer Configuration > Administrative Templates > Windows Components > Windows Update
- Clave principal: **Specify intranet Microsoft update service location**
- Valor: http://srv-wsus:8530 (HTTP) o https://srv-wsus:8531 (HTTPS)

### Puertos WSUS
- **8530/TCP**: HTTP (default)
- **8531/TCP**: HTTPS
- **443/TCP**: si usas SSL con IIS en puerto estándar`,
  },

  {
    id: 'wsus-maintenance',
    subject: 'wsus',
    module_order: 2,
    title: 'Mantenimiento y limpieza de WSUS',
    description: 'Automatiza la limpieza periódica de WSUS para evitar que la base de datos crezca sin control, y crea un informe de cumplimiento de actualizaciones.',
    difficulty: 'Intermedio',
    xp: 50,
    estimatedMinutes: 30,
    prerequisites: ['wsus-install'],
    objectives: [
      'Ejecutar el asistente de limpieza del servidor WSUS',
      'Declinar actualizaciones reemplazadas y obsoletas',
      'Generar informe de cumplimiento por grupo de equipos',
      'Programar limpieza automática mensual con tarea programada',
    ],
    steps: [
      {
        id: 'wsus-maint-1',
        title: 'Declinar actualizaciones reemplazadas',
        explanation: 'Las actualizaciones reemplazadas son las versiones antiguas que han sido sustituidas por versiones más nuevas. Aprobar actualizaciones antiguas que ya tienen sucesor es un error común que llena la BD.',
        command: '$wsus = Get-WsusServer\n$declinados = 0\n$wsus.GetUpdates() | Where-Object {$_.IsSuperseded -eq $true -and $_.IsDeclined -eq $false} | ForEach-Object {\n    $_.Decline()\n    $declinados++\n}\nWrite-Host "Actualizaciones declinadas: $declinados"',
        expectedOutput: 'Actualizaciones declinadas: 1247',
        hint: 'Es normal que en un WSUS que lleva tiempo sin limpieza haya miles de actualizaciones reemplazadas. Ejecutar esto regularmente (mensual) es buena práctica.',
      },
      {
        id: 'wsus-maint-2',
        title: 'Ejecutar el Server Cleanup Wizard',
        explanation: 'El asistente de limpieza elimina actualizaciones obsoletas, archivos de contenido huérfanos y equipos que no reportan desde hace más de 30 días.',
        command: '$wsus = Get-WsusServer\n$cleanupScope = New-Object Microsoft.UpdateServices.Administration.CleanupScope\n$cleanupScope.DeclineSupersededUpdates = $true\n$cleanupScope.DeclineExpiredUpdates = $true\n$cleanupScope.CleanupObsoleteUpdates = $true\n$cleanupScope.CompressUpdates = $true\n$cleanupScope.CleanupObsoleteComputers = $true\n$cleanupScope.CleanupUnneededContentFiles = $true\n$cleanupManager = $wsus.GetCleanupManager()\n$results = $cleanupManager.PerformCleanup($cleanupScope)\nWrite-Host "Espacio liberado: $([math]::Round($results.DiskSpaceFreed/1GB,2)) GB"',
        expectedOutput: 'Espacio liberado: 23.47 GB',
        hint: 'La primera limpieza puede tardar horas en servidores con mucha historia. Ejecutar en horario no productivo.',
      },
      {
        id: 'wsus-maint-3',
        title: 'Generar informe de cumplimiento',
        explanation: 'El informe de cumplimiento muestra el estado de actualización de cada equipo por grupo: cuántas actualizaciones necesarias, instaladas, pendientes o con error.',
        command: '$wsus = Get-WsusServer\n$scope = New-Object Microsoft.UpdateServices.Administration.ComputerTargetScope\n$wsus.GetComputerTargets($scope) | Select-Object FullDomainName, LastSyncTime, @{N="Needed";E={($_.GetUpdateInstallationSummary()).NotInstalledCount}} | Sort-Object Needed -Descending | Format-Table -AutoSize',
        expectedOutput: 'FullDomainName               LastSyncTime          Needed\n--------------               ------------          ------\npc-ventas01.empresa.local    15/03/2026 08:15:00   12\npc-contab02.empresa.local    15/03/2026 07:45:00   8\nsrv-files01.empresa.local    15/03/2026 03:10:00   3',
        hint: 'NotInstalledCount alto puede indicar que el equipo no se reinicia tras las actualizaciones. Revisa la política de reinicio en GPO.',
      },
      {
        id: 'wsus-maint-4',
        title: 'Programar limpieza automática mensual',
        explanation: 'Creamos una tarea programada que ejecute el script de limpieza el primer domingo de cada mes a las 2:00 AM, cuando el servidor tiene menos carga.',
        command: '$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NonInteractive -File C:\\Scripts\\wsus-cleanup.ps1"\n$trigger = New-ScheduledTaskTrigger -Weekly -WeeksInterval 4 -DaysOfWeek Sunday -At "02:00AM"\n$settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable -StartWhenAvailable\nRegister-ScheduledTask -TaskName "WSUS-Limpieza-Mensual" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -User "SYSTEM"\nWrite-Host "Tarea programada creada correctamente"',
        expectedOutput: 'Tarea programada creada correctamente',
        hint: 'Crea primero el script C:\\Scripts\\wsus-cleanup.ps1 con los pasos 1 y 2 de este lab. Redirige la salida a un log: Add-Content -Path "C:\\Logs\\wsus-cleanup.log" -Value $results',
      },
    ],
    theory: `## Mantenimiento de WSUS — Buenas prácticas

### El problema del crecimiento sin control
Un WSUS sin mantenimiento puede llegar a ocupar cientos de GB y la base de datos (WID o SQL) se vuelve lenta. Los síntomas son: sincronización lenta, consola que no carga, informes que tardan.

### Plan de mantenimiento recomendado

| Frecuencia | Tarea |
| --- | --- |
| Diario | Sincronización automática (03:00 AM) |
| Semanal | Revisión de aprobaciones pendientes |
| Mensual | Server Cleanup Wizard + declinar reemplazadas |
| Trimestral | Reindex de la base de datos WID/SQL |

### Reindexar la base de datos WID
\`\`\`sql
-- Ejecutar en sqlcmd contra la WID
sqlcmd -S \\\\\\\\.\pipe\\MICROSOFT##WID\\tsql\\query
USE SUSDB;
EXEC sp_msforeachtable "ALTER INDEX ALL ON ? REBUILD"
\`\`\`

### Métricas de salud WSUS
- Equipos sin reportar en >30 días: indican problemas de GPO o WUA
- Actualizaciones con >50% de errores: pueden ser incompatibles con algún modelo
- Espacio en disco del contenido: revisar si supera el 80% del disco

### Limitar los productos sincronizados
Solo sincroniza los productos realmente en uso. Cada producto adicional multiplica el número de actualizaciones y el espacio en disco.`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 12 — STORAGE SPACES
  // ══════════════════════════════════════════════════════

  {
    id: 'storage-spaces',
    subject: 'storage',
    module_order: 1,
    title: 'Configuración de Storage Spaces y pools de discos',
    description: 'Crea un pool de almacenamiento con Storage Spaces, configura espacios con redundancia Mirror y gestiona la deduplicación de datos.',
    difficulty: 'Intermedio',
    xp: 65,
    estimatedMinutes: 40,
    prerequisites: [],
    objectives: [
      'Crear un pool de almacenamiento con múltiples discos físicos',
      'Crear un espacio de almacenamiento con resiliencia Mirror',
      'Habilitar y configurar deduplicación de datos',
      'Monitorizar el estado del pool con cmdlets de Storage',
    ],
    steps: [
      {
        id: 'storage-1',
        title: 'Identificar discos disponibles para el pool',
        explanation: 'Primero identificamos qué discos físicos están disponibles (sin particiones ni asignación). Storage Spaces requiere discos RAW o en formato GPT sin volúmenes asignados.',
        command: 'Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true} | Select-Object FriendlyName, Size, MediaType, HealthStatus\nGet-PhysicalDisk | Where-Object {$_.CanPool -eq $false} | Select-Object FriendlyName, CannotPoolReason',
        expectedOutput: 'FriendlyName  Size          MediaType  HealthStatus\n------------  ----          ---------  ------------\nDisk 1        1099511627776 HDD        Healthy\nDisk 2        1099511627776 HDD        Healthy\nDisk 3        1099511627776 HDD        Healthy',
        hint: 'Si CanPool=False y el motivo es "Not supported", el disco puede tener particiones. Límpialas con: Clear-Disk -Number X -RemoveData -Confirm:$false',
      },
      {
        id: 'storage-2',
        title: 'Crear el pool de almacenamiento',
        explanation: 'Un Storage Pool agrupa los discos físicos en un contenedor lógico. Desde este pool crearemos los espacios de almacenamiento con la redundancia deseada.',
        command: '$discos = Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true}\nNew-StoragePool -FriendlyName "PoolDatos" -StorageSubSystemFriendlyName "Windows Storage*" -PhysicalDisks $discos\nGet-StoragePool -FriendlyName "PoolDatos" | Select-Object FriendlyName, OperationalStatus, Size',
        expectedOutput: 'FriendlyName  OperationalStatus  Size\n------------  -----------------  ----\nPoolDatos     OK                 3298534883328',
        hint: 'El nombre del subsistema puede variar. Usa Get-StorageSubSystem para ver el nombre exacto en tu servidor.',
      },
      {
        id: 'storage-3',
        title: 'Crear espacio Mirror de dos vías',
        explanation: 'Un espacio Mirror escribe los datos en dos discos simultáneamente (como RAID 1). Si un disco falla, los datos siguen accesibles en el otro disco. Necesita mínimo 2 discos.',
        command: 'New-VirtualDisk -StoragePoolFriendlyName "PoolDatos" -FriendlyName "VolumenMirror" -ResiliencySettingName "Mirror" -Size 500GB -ProvisioningType Thin\nGet-VirtualDisk -FriendlyName "VolumenMirror" | Select-Object FriendlyName, ResiliencySettingName, OperationalStatus, Size',
        expectedOutput: 'FriendlyName   ResiliencySettingName  OperationalStatus  Size\n------------   ---------------------  -----------------  ----\nVolumenMirror  Mirror                 OK                 536870912000',
        hint: 'ProvisioningType Thin = aprovisionamiento fino (el disco virtual crece según los datos reales). Fixed = reserva todo el espacio inmediatamente.',
      },
      {
        id: 'storage-4',
        title: 'Inicializar y formatear el disco virtual',
        explanation: 'El disco virtual creado en el paso anterior aparece como un disco nuevo en Windows. Lo inicializamos, creamos una partición y lo formateamos con ReFS para mejor integridad de datos.',
        command: 'Get-VirtualDisk -FriendlyName "VolumenMirror" | Get-Disk | Initialize-Disk -PartitionStyle GPT\n$disk = Get-VirtualDisk -FriendlyName "VolumenMirror" | Get-Disk\nNew-Partition -DiskNumber $disk.Number -UseMaximumSize -AssignDriveLetter | Format-Volume -FileSystem ReFS -NewFileSystemLabel "Datos-Mirror" -Confirm:$false',
        expectedOutput: 'DriveLetter  FileSystem  FileSystemLabel  DriveType  HealthStatus\n-----------  ----------  ---------------  ---------  ------------\nE            ReFS        Datos-Mirror     Fixed      Healthy',
        hint: 'ReFS es el sistema de ficheros recomendado para Storage Spaces. Proporciona integridad de datos automática y tolerancia a la corrupción.',
      },
      {
        id: 'storage-5',
        title: 'Habilitar deduplicación de datos',
        explanation: 'La deduplicación elimina bloques de datos duplicados, pudiendo ahorrar entre un 30% y un 80% de espacio según el tipo de datos. Es especialmente efectiva en carpetas compartidas con muchos archivos similares.',
        command: 'Install-WindowsFeature -Name FS-Data-Deduplication -IncludeManagementTools\nEnable-DedupVolume -Volume "E:" -UsageType GeneralPurpose\nSet-DedupVolume -Volume "E:" -MinimumFileAgeDays 3 -MinimumFileSize 32KB\nGet-DedupVolume -Volume "E:" | Select-Object Volume, Enabled, SavingsRate, SavedSpace',
        expectedOutput: 'Volume  Enabled  SavingsRate  SavedSpace\n------  -------  -----------  ----------\nE:      True     0 %          0 B',
        hint: 'SavingsRate empieza en 0% y aumenta conforme el job de dedup procesa los archivos. El primer job se ejecuta a las 1:45 AM por defecto.',
      },
    ],
    theory: `## Storage Spaces — Almacenamiento definido por software

### ¿Qué es Storage Spaces?
Storage Spaces es la solución de almacenamiento definido por software (SDS) de Microsoft. Permite crear volúmenes con redundancia usando discos locales normales, sin necesidad de controladora RAID hardware.

### Tipos de resiliencia

| Tipo | Discos mínimos | Uso de espacio | Fallos tolerados |
| --- | --- | --- | --- |
| Simple (sin redundancia) | 1 | 100% | 0 |
| Mirror 2 vías | 2 | 50% | 1 disco |
| Mirror 3 vías | 5 | 33% | 2 discos |
| Parity | 3 | 67% | 1 disco |
| Dual Parity | 7 | 50% | 2 discos |

### Thin vs Fixed provisioning
- **Thin**: el disco virtual reporta su tamaño máximo pero solo ocupa espacio real según los datos escritos. Útil para maximizar el uso del pool.
- **Fixed**: reserva todo el espacio inmediatamente. Mayor rendimiento, menos flexibilidad.

### ReFS vs NTFS en Storage Spaces

| Característica | NTFS | ReFS |
| --- | --- | --- |
| Verificación de integridad | Manual | Automática |
| Reparación sin downtime | No | Sí |
| Deduplicación | Sí | Parcial (W2022) |
| Compresión | Sí | No |

### Deduplicación: tipos de uso
- **Default**: datos generales, archivos de usuario
- **HyperV**: optimizado para VHD/VHDX dinámicos
- **Backup**: mayor ahorro, menor rendimiento en lectura`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 13 — PKI / CERTIFICATE SERVICES
  // ══════════════════════════════════════════════════════

  {
    id: 'pki-ca',
    subject: 'pki',
    module_order: 1,
    title: 'Instalación de una CA Corporativa (Enterprise Root CA)',
    description: 'Despliega una Autoridad Certificadora raíz empresarial integrada con Active Directory, emite certificados para servicios y configura la revocación automática.',
    difficulty: 'Avanzado',
    xp: 85,
    estimatedMinutes: 55,
    prerequisites: ['ad-install'],
    objectives: [
      'Instalar el rol Active Directory Certificate Services',
      'Configurar la CA Enterprise Root con criptografía moderna',
      'Crear y publicar plantillas de certificados personalizadas',
      'Emitir un certificado para un servidor web IIS',
      'Configurar CRL y publicación OCSP',
    ],
    steps: [
      {
        id: 'pki-1',
        title: 'Instalar el rol AD Certificate Services',
        explanation: 'Una Enterprise Root CA integra la PKI con Active Directory, permitiendo la inscripción automática de certificados para equipos y usuarios del dominio. Debe instalarse en un servidor miembro del dominio.',
        command: 'Install-WindowsFeature -Name ADCS-Cert-Authority, ADCS-Web-Enrollment, ADCS-Online-Cert -IncludeManagementTools',
        expectedOutput: 'Success Restart Needed  Exit Code  Feature Result\n------- -------------- ---------  --------------\nTrue    No             Success    {Active Directory Certificate Services, Certification Authority...}',
        hint: 'La CA raíz empresarial DEBE estar en un servidor unido al dominio. Si instalas una Standalone CA, no tendrá integración con AD ni inscripción automática.',
      },
      {
        id: 'pki-2',
        title: 'Configurar la CA Enterprise Root',
        explanation: 'Configuramos la CA con algoritmo SHA-256 (mínimo recomendado), clave RSA de 4096 bits y validez de 10 años para el certificado raíz. El nombre de la CA aparecerá en todos los certificados emitidos.',
        command: 'Install-AdcsCertificationAuthority -CAType EnterpriseRootCa -CryptoProviderName "RSA#Microsoft Software Key Storage Provider" -KeyLength 4096 -HashAlgorithmName SHA256 -ValidityPeriod Years -ValidityPeriodUnits 10 -CACommonName "Empresa-CA-Root" -Force',
        expectedOutput: 'Message : The operation completed successfully.\nStatus  : Success',
        hint: 'Evita SHA-1 (obsoleto) y RSA de 2048 para la CA raíz (aunque es válido para certificados de servidor). La clave de la CA raíz nunca debe almacenarse en un servidor expuesto a Internet.',
      },
      {
        id: 'pki-3',
        title: 'Crear plantilla de certificado para servidores web',
        explanation: 'Las plantillas definen los atributos de los certificados emitidos. Duplicamos la plantilla "Web Server" estándar y la personalizamos con validez de 2 años y extensiones de nombre alternativo.',
        command: '$template = Get-CATemplate | Where-Object {$_.Name -eq "WebServer"}\n$newTemplate = $template | Select-Object *\n$newTemplate.Name = "ServidorWebPersonalizado"\n$newTemplate.DisplayName = "Servidor Web - 2 años"\n\n# Publicar la plantilla en la CA\nAdd-CATemplate -Name "ServidorWebPersonalizado"\nGet-CATemplate | Where-Object {$_.Name -like "*Web*"} | Select-Object Name, DisplayName',
        expectedOutput: 'Name                    DisplayName\n----                    -----------\nWebServer               Web Server\nServidorWebPersonalizado Servidor Web - 2 anos',
        hint: 'La gestión completa de plantillas se hace mejor con la MMC "Certificate Templates Console" (certtmpl.msc). PowerShell solo puede listar y publicar plantillas existentes.',
      },
      {
        id: 'pki-4',
        title: 'Solicitar y emitir un certificado para IIS',
        explanation: 'Generamos una solicitud de certificado para el servidor IIS, la enviamos a la CA y enlazamos el certificado emitido al sitio HTTPS. Este proceso automatiza lo que normalmente se haría manualmente en la MMC.',
        command: '$certReq = @{\n    Subject = "CN=www.empresa.local,O=Empresa SL,L=Madrid,C=ES"\n    DnsName = "www.empresa.local","intranet.empresa.local"\n    KeyLength = 2048\n    HashAlgorithm = "SHA256"\n    KeyUsage = "DigitalSignature,KeyEncipherment"\n    CertStoreLocation = "Cert:\\LocalMachine\\My"\n}\n$cert = New-SelfSignedCertificate @certReq\nWrite-Host "Certificado emitido. Thumbprint: $($cert.Thumbprint)"',
        expectedOutput: 'Certificado emitido. Thumbprint: A1B2C3D4E5F6...',
        hint: 'Para solicitar de la CA corporativa (no autofirmado), usa: Get-Certificate -Template "ServidorWebPersonalizado" -DnsName "www.empresa.local" -CertStoreLocation "Cert:\\LocalMachine\\My"',
      },
      {
        id: 'pki-5',
        title: 'Configurar publicación de CRL y verificar PKI',
        explanation: 'La Lista de Revocación de Certificados (CRL) permite a los clientes verificar si un certificado ha sido revocado. Configuramos la publicación periódica en un punto de distribución accesible.',
        command: 'certutil -setreg CA\\CRLPublicationURLs "1:C:\\Windows\\System32\\CertSrv\\CertEnroll\\%3%8.crl\\n2:http://pki.empresa.local/CertEnroll/%3%8.crl"\ncertutil -setreg CA\\CRLPeriod "Weeks"\ncertutil -setreg CA\\CRLPeriodUnits 1\n\n# Publicar CRL ahora\ncertutil -crl\n\n# Verificar la salud de la PKI\ncertutil -verify -urlfetch "Cert:\\LocalMachine\\My\\$($cert.Thumbprint)"',
        expectedOutput: 'CRL published.\nLeaf certificate revocation check passed.\nVerified Issuance Policies: None\nVerified Application Policies: Server Authentication',
        hint: 'La URL de distribución de CRL debe ser accesible desde TODOS los clientes que validen certificados. Normalmente se publica en IIS o un servidor web interno.',
      },
    ],
    theory: `## PKI Corporativa — Active Directory Certificate Services

### Por qué una CA interna
- Emitir certificados SSL para servicios internos (IIS, RDP, LDAPS, WiFi WPA2-Enterprise) sin coste por certificado
- Distribuir certificados automáticamente a equipos/usuarios del dominio via GPO
- Control total sobre la revocación de certificados comprometidos

### Jerarquía PKI de dos niveles (recomendada)

- **Root CA (offline)**: la CA raíz NUNCA debe estar conectada a la red en producción. Se enciende solo para emitir certificados a las CA subordinadas y para renovación de CRL.
- **Subordinate CA (online)**: recibe su certificado de la Root CA. Esta es la que emite los certificados del día a día.

### Conceptos clave

| Término | Descripción |
| --- | --- |
| **CSR** | Certificate Signing Request — solicitud de certificado |
| **CRL** | Certificate Revocation List — lista de revocados |
| **OCSP** | Online Certificate Status Protocol — revocación en tiempo real |
| **SAN** | Subject Alternative Name — nombres alternativos en el certificado |
| **EKU** | Extended Key Usage — uso permitido del certificado |

### Inscripción automática via GPO
- Computer Configuration > Windows Settings > Security Settings > Public Key Policies > Certificate Services Client
- Permite que los equipos del dominio soliciten y renueven certificados automáticamente

### Cryptografía recomendada (2024+)
- Algoritmo: **RSA 2048** para servers, **RSA 4096** para CAs
- Hash: **SHA-256** mínimo (SHA-1 está deprecado por todos los navegadores)
- Migración futura: **ECC P-256** para mayor eficiencia`,
  },

  // ══════════════════════════════════════════════════════
  // ESCENARIOS EXTRA en módulos existentes
  // ══════════════════════════════════════════════════════

  {
    id: 'ad-delegation',
    subject: 'ad',
    module_order: 3,
    title: 'Delegación de administración en Active Directory',
    description: 'Configura la delegación de permisos para que el equipo de Help Desk pueda resetear contraseñas sin necesitar privilegios de Domain Admin.',
    difficulty: 'Intermedio',
    xp: 50,
    estimatedMinutes: 30,
    prerequisites: ['ad-install'],
    objectives: [
      'Crear una OU específica para la delegación',
      'Delegar el permiso de reset de contraseñas a un grupo',
      'Verificar la delegación con un usuario de Help Desk',
      'Auditar los cambios de contraseña delegados',
    ],
    steps: [
      {
        id: 'ad-deleg-1',
        title: 'Crear OU y grupo de Help Desk',
        explanation: 'La delegación en AD funciona por OU. Creamos una OU "Usuarios-Delegados" donde el Help Desk tendrá permisos, y el grupo "HelpDesk-Admins" que recibirá la delegación.',
        command: 'New-ADOrganizationalUnit -Name "Usuarios-Delegados" -Path "DC=empresa,DC=local" -ProtectedFromAccidentalDeletion $true\nNew-ADGroup -Name "HelpDesk-Admins" -GroupScope Global -GroupCategory Security -Path "OU=Grupos,DC=empresa,DC=local"\nAdd-ADGroupMember -Identity "HelpDesk-Admins" -Members "jlopez","mgarcia"',
        expectedOutput: '',
        hint: 'La delegación se aplica a la OU y se hereda a las sub-OUs. Planifica bien la jerarquía de OUs antes de delegar.',
      },
      {
        id: 'ad-deleg-2',
        title: 'Delegar permiso de reset de contraseñas',
        explanation: 'Usamos dsacls.exe para modificar las ACLs de la OU. Concedemos al grupo HelpDesk-Admins el permiso extendido "Reset Password" y el permiso para desbloquear cuentas.',
        command: 'dsacls "OU=Usuarios-Delegados,DC=empresa,DC=local" /G "empresa\\HelpDesk-Admins:CA;Reset Password;user"\ndsacls "OU=Usuarios-Delegados,DC=empresa,DC=local" /G "empresa\\HelpDesk-Admins:RPWP;lockoutTime;user"\ndsacls "OU=Usuarios-Delegados,DC=empresa,DC=local" /G "empresa\\HelpDesk-Admins:RPWP;pwdLastSet;user"',
        expectedOutput: 'Updated permissions for OU=Usuarios-Delegados,DC=empresa,DC=local.',
        hint: 'CA = Control Access (derechos extendidos). RPWP = Read Property + Write Property. "user" especifica que se aplica a objetos de tipo usuario.',
      },
      {
        id: 'ad-deleg-3',
        title: 'Verificar la delegación con PowerShell',
        explanation: 'Verificamos que las ACLs se aplicaron correctamente consultando los permisos de la OU mediante Get-Acl.',
        command: '(Get-Acl "AD:OU=Usuarios-Delegados,DC=empresa,DC=local").Access | Where-Object {$_.IdentityReference -like "*HelpDesk*"} | Select-Object IdentityReference, ActiveDirectoryRights, AccessControlType',
        expectedOutput: 'IdentityReference           ActiveDirectoryRights  AccessControlType\n-----------------           ---------------------  -----------------\nempresa\\HelpDesk-Admins    ExtendedRight          Allow\nempresa\\HelpDesk-Admins    ReadProperty, WriteProperty Allow',
        hint: 'Si no ves los permisos, asegúrate de ejecutar el cmdlet desde un equipo con el módulo ActiveDirectory instalado y con credenciales de Domain Admin.',
      },
      {
        id: 'ad-deleg-4',
        title: 'Probar reset de contraseña como Help Desk',
        explanation: 'Probamos la delegación ejecutando un reset de contraseña con las credenciales de un miembro del grupo HelpDesk-Admins.',
        command: '$cred = Get-Credential -UserName "empresa\\jlopez" -Message "Credenciales Help Desk"\nSet-ADAccountPassword -Identity "tperez" -NewPassword (ConvertTo-SecureString "NuevaPass2026!" -AsPlainText -Force) -Credential $cred -Reset\nUnlock-ADAccount -Identity "tperez" -Credential $cred\nWrite-Host "Password reseteado correctamente"',
        expectedOutput: 'Password reseteado correctamente',
        hint: 'Si obtienes "Access Denied", verifica que el usuario tperez está en la OU "Usuarios-Delegados" y no en otra OU donde el HelpDesk no tiene permisos.',
      },
    ],
    theory: `## Delegación en Active Directory

### Principio de mínimo privilegio
La delegación permite que equipos de soporte realicen tareas específicas sin otorgarles privilegios de Domain Admin. Esto reduce enormemente el radio de impacto de una cuenta comprometida.

### Modelo de delegación recomendado

| Rol | Permisos delegados | Ámbito |
| --- | --- | --- |
| Help Desk L1 | Reset contraseña, desbloquear | OU Usuarios |
| Help Desk L2 | Crear/deshabilitar usuarios | OU Usuarios |
| Administrador local | Unir equipos al dominio | OU Equipos |
| Administrador de sucursal | CRUD en su OU | OU de sucursal |

### Herramientas de delegación
- **Delegation of Control Wizard (GUI)**: sencillo pero limitado en opciones
- **dsacls.exe**: control granular desde línea de comandos
- **Set-Acl / Get-Acl PowerShell**: ver y modificar ACLs de objetos AD

### LAPS — Local Administrator Password Solution
Genera contraseñas aleatorias únicas para el administrador local de cada equipo y las almacena en AD. El Help Desk puede ver la contraseña de un equipo específico sin saber las de los demás.`,
  },

  {
    id: 'ps-remoting',
    subject: 'ps',
    module_order: 3,
    title: 'PowerShell Remoting y gestión masiva de servidores',
    description: 'Domina PowerShell Remoting para gestionar decenas de servidores simultáneamente: inventario, aplicación de configuraciones y monitorización desde un único equipo.',
    difficulty: 'Intermedio',
    xp: 55,
    estimatedMinutes: 35,
    prerequisites: [],
    objectives: [
      'Configurar y verificar WinRM en múltiples servidores',
      'Usar Invoke-Command para ejecutar scripts de forma masiva',
      'Crear sesiones persistentes con New-PSSession',
      'Construir un script de inventario de servidores',
    ],
    steps: [
      {
        id: 'ps-remote-1',
        title: 'Habilitar y configurar WinRM',
        explanation: 'WinRM (Windows Remote Management) es el protocolo que usa PowerShell Remoting. En entornos de dominio se puede habilitar mediante GPO. Manualmente, usamos Enable-PSRemoting.',
        command: 'Enable-PSRemoting -Force\nSet-Item WSMan:\\localhost\\Client\\TrustedHosts -Value "*" -Force\nGet-WSManInstance -ResourceURI winrm/config/listener -SelectorSet @{address="*";transport="http"} | Select-Object Port, Enabled',
        expectedOutput: 'Port Enabled\n---- -------\n5985 true',
        hint: 'En entornos de dominio, los hosts de confianza se gestionan automáticamente via Kerberos. TrustedHosts solo es necesario para equipos fuera del dominio.',
      },
      {
        id: 'ps-remote-2',
        title: 'Ejecutar comandos masivos con Invoke-Command',
        explanation: 'Invoke-Command ejecuta un bloque de script en uno o varios equipos remotos en paralelo. Aquí recogemos el uso de CPU y RAM de todos los servidores de un golpe.',
        command: '$servidores = "srv-dc01","srv-files01","srv-web01","srv-sql01"\nInvoke-Command -ComputerName $servidores -ScriptBlock {\n    [PSCustomObject]@{\n        Servidor = $env:COMPUTERNAME\n        CPU_Pct  = [math]::Round((Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average, 1)\n        RAM_GB   = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)\n        Uptime   = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime\n    }\n} | Select-Object Servidor, CPU_Pct, RAM_GB, @{N="Uptime_dias";E={[math]::Round($_.Uptime.TotalDays,1)}} | Format-Table -AutoSize',
        expectedOutput: 'Servidor      CPU_Pct  RAM_GB  Uptime_dias\n--------      -------  ------  -----------\nsrv-dc01      12.0     3.45    15.2\nsrv-files01   5.0      6.12    15.2\nsrv-web01     28.0     2.89    15.2\nsrv-sql01     45.0     4.67    15.2',
        hint: 'Invoke-Command ejecuta los comandos en paralelo en todos los servidores a la vez. El parámetro -ThrottleLimit controla cuántos equipos se procesan simultáneamente (default: 32).',
      },
      {
        id: 'ps-remote-3',
        title: 'Crear sesiones persistentes con New-PSSession',
        explanation: 'Cuando necesitas ejecutar múltiples comandos en el mismo servidor remoto, las sesiones persistentes son más eficientes que crear y destruir conexiones con cada Invoke-Command.',
        command: '$sessions = New-PSSession -ComputerName "srv-dc01","srv-files01" -Name "SesionesAdmin"\nGet-PSSession | Select-Object Name, ComputerName, State, Availability\n\n# Reutilizar la sesión\nInvoke-Command -Session $sessions -ScriptBlock { Get-Service | Where-Object {$_.Status -eq "Stopped" -and $_.StartType -eq "Automatic"} | Select-Object DisplayName, Status }',
        expectedOutput: 'Name          ComputerName   State   Availability\n----          ------------   -----   ------------\nSesionesAdmin srv-dc01       Opened  Available\nSesionesAdmin srv-files01    Opened  Available',
        hint: 'Cierra siempre las sesiones al terminar: Remove-PSSession -Session $sessions. Las sesiones huérfanas consumen recursos en los servidores remotos.',
      },
      {
        id: 'ps-remote-4',
        title: 'Script de inventario completo de servidores',
        explanation: 'Construimos un script que genera un inventario completo de la infraestructura: SO, RAM, discos, IPs y roles instalados, exportado a CSV.',
        command: '$servidores = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties Name | Select-Object -ExpandProperty Name\n\n$inventario = Invoke-Command -ComputerName $servidores -ScriptBlock {\n    $os = Get-CimInstance Win32_OperatingSystem\n    $cs = Get-CimInstance Win32_ComputerSystem\n    [PSCustomObject]@{\n        Nombre    = $env:COMPUTERNAME\n        SO        = $os.Caption\n        RAM_GB    = [math]::Round($cs.TotalPhysicalMemory/1GB, 2)\n        CPU_Cores = $cs.NumberOfLogicalProcessors\n        IPs       = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}).IPAddress -join ","\n        Roles     = (Get-WindowsFeature | Where-Object {$_.Installed -and $_.FeatureType -eq "Role"}).DisplayName -join "| "\n    }\n}\n$inventario | Export-Csv -Path "C:\\inventario-servidores.csv" -NoTypeInformation -Encoding UTF8\nWrite-Host "Inventario exportado: $($inventario.Count) servidores"',
        expectedOutput: 'Inventario exportado: 4 servidores',
        hint: 'Get-ADComputer requiere el módulo RSAT-AD-PowerShell. Si no tienes AD, define $servidores como array manual: $servidores = @("srv-dc01","srv-web01")',
      },
    ],
    theory: `## PowerShell Remoting — Gestión masiva de infraestructura

### Protocolos y puertos

| Protocolo | Puerto | Cifrado |
| --- | --- | --- |
| WinRM HTTP | 5985/TCP | Kerberos/NTLM (payload cifrado) |
| WinRM HTTPS | 5986/TCP | TLS + Kerberos |
| SSH (WinRM over SSH) | 22/TCP | TLS |

### Invoke-Command vs Enter-PSSession
- **Invoke-Command**: ejecuta un bloque de script y devuelve resultados. No interactivo. Ideal para automatización.
- **Enter-PSSession**: sesión interactiva tipo SSH. Para depuración y exploración manual.

### Mejores prácticas de Remoting
- Usa **-ThrottleLimit** para controlar la paralelización (evitar saturar la red)
- Usa **sesiones persistentes** cuando ejecutes múltiples operaciones en el mismo servidor
- Usa **-Credential** explícito o **CredSSP** para operaciones que requieran doble salto
- Cierra siempre las sesiones con **Remove-PSSession**

### JEA — Just Enough Administration
JEA crea endpoints de PowerShell Remoting que restringen qué comandos puede ejecutar cada usuario. Un operador de monitorización puede ejecutar Get-Service pero no Stop-Service, aunque se conecte remotamente.`,
  },
];
