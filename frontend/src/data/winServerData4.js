/**
 * winServerData4.js — Módulos avanzados de Windows Server (Part 2)
 * PowerShell Avanzado · NPS/RADIUS · Acceso Remoto · VSS/Backup
 */

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULOS
// ─────────────────────────────────────────────────────────────────────────────
export const WIN_MODULES_4 = [
  {
    id: 'powershell-advanced',
    title: 'PowerShell Avanzado para ASIR',
    description: 'Automatización profesional con PowerShell: pipelines, módulos AD, remoting y scripting avanzado.',
    icon: '⚡',
    color: 'from-sky-600 to-cyan-600',
    xp: 350,
    scenarios: ['ps-ad-automation', 'ps-remoting', 'ps-modules'],
  },
  {
    id: 'nps-radius',
    title: 'NPS y Autenticación RADIUS',
    description: 'Configura autenticación 802.1X con Network Policy Server para WiFi y VPN corporativa.',
    icon: '🔐',
    color: 'from-purple-600 to-indigo-600',
    xp: 320,
    scenarios: ['nps-wifi-8021x', 'nps-vpn'],
  },
  {
    id: 'remote-access',
    title: 'Acceso Remoto y DirectAccess',
    description: 'Implementa soluciones de acceso remoto seguro para usuarios móviles y teletrabajo.',
    icon: '🌐',
    color: 'from-teal-600 to-green-600',
    xp: 330,
    scenarios: ['rras-vpn-setup', 'rdp-gateway'],
  },
  {
    id: 'vss-backup',
    title: 'VSS y Backup en Windows Server',
    description: 'Configura Volume Shadow Copy Service para backups consistentes y recuperación granular.',
    icon: '💾',
    color: 'from-amber-600 to-orange-600',
    xp: 300,
    scenarios: ['vss-shadow-copies', 'wbadmin-backup'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIOS
// ─────────────────────────────────────────────────────────────────────────────
export const WIN_SCENARIOS_4 = [

  // ══════════════════════════════════════════════════════
  // POWERSHELL AVANZADO
  // ══════════════════════════════════════════════════════
  {
    id: 'ps-ad-automation',
    moduleId: 'powershell-advanced',
    title: 'Automatización completa de Active Directory con PowerShell',
    description: 'Domina las técnicas avanzadas de PowerShell para automatizar tareas de Active Directory: búsquedas complejas, gestión masiva de usuarios, generación de informes HTML y programación de tareas.',
    difficulty: 'intermediate',
    xp: 120,
    minutes: 40,
    objectives: [
      'Ejecutar búsquedas avanzadas en AD con Get-ADUser usando filtros LDAP',
      'Importar y crear usuarios en lote desde archivos CSV',
      'Gestionar membresías de grupos con cmdlets del módulo AD',
      'Generar informes HTML profesionales con ConvertTo-Html',
      'Programar tareas automatizadas con Register-ScheduledTask',
    ],
    theory: `## Automatización Avanzada de Active Directory

PowerShell proporciona cmdlets especializados para automatizar todas las operaciones de AD. El módulo \`ActiveDirectory\` debe estar disponible en el servidor (forma parte de AD DS o RSAT).

### Cmdlets clave del módulo ActiveDirectory

\`\`\`
Get-ADUser / Get-ADGroup / Get-ADComputer   — Buscar objetos
New-ADUser / New-ADGroup                     — Crear objetos
Set-ADUser / Set-ADGroup                     — Modificar propiedades
Add-ADGroupMember / Remove-ADGroupMember     — Gestionar membresías
Move-ADObject                                — Mover entre OUs
Search-ADAccount                             — Búsquedas especializadas
\`\`\`

### Filtros LDAP en PowerShell

La mayoría de cmdlets aceptan filtros LDAP:
\`\`\`powershell
Get-ADUser -Filter {Department -eq "IT"}
Get-ADUser -Filter {LastLogonDate -lt (Get-Date).AddDays(-90)}
Get-ADUser -Filter {(Enabled -eq $true) -and (Title -like "*Manager*")}
\`\`\`

### Importación desde CSV

Para operaciones en lote, los datos se especifican en un CSV con cabeceras correspondientes a propiedades de AD:
- \`SamAccountName\` — nombre de inicio de sesión
- \`UserPrincipalName\` — UPN (user@empresa.com)
- \`GivenName\` — nombre
- \`Surname\` — apellido
- \`Department\` — departamento`,

    steps: [
      {
        title: 'Búsquedas avanzadas con Get-ADUser y filtros',
        explanation: `Ejecutamos búsquedas complejas de usuarios. El parámetro \`-Filter\` acepta sintaxis de filtro PowerShell (con operadores lógicos -and, -or), y \`-Properties *\` recupera todas las propiedades extendidas del usuario.`,
        command: 'Get-ADUser -Filter {(Department -eq "IT") -and (Enabled -eq $true)} -Properties * | Select-Object Name, SamAccountName, Department, Title | Format-Table -AutoSize',
        expectedOutput: `Name         SamAccountName Department Title
----         -------------- ---------- -----
Juan García  jgarcia        IT         Network Admin
María López  mlopez         IT         Help Desk
Carlos Ruiz  cruiz          IT         Senior Sys Admin`,
        hint: 'Usa Get-ADUser con -Filter y operadores lógicos (-and, -or). Añade -Properties * para ver todas las propiedades, luego usa Select-Object y Format-Table.',
      },
      {
        title: 'Buscar usuarios inactivos (no conectados en 90 días)',
        explanation: `Search-ADAccount permite búsquedas especializadas como usuarios inactivos. El parámetro \`-TimeSpan\` especifica cuántos días sin conexión.`,
        command: 'Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Select-Object Name, LastLogonDate, Enabled | Format-Table -AutoSize',
        expectedOutput: `Name            LastLogonDate       Enabled
----            ---------------       -------
Usuario_Old01   2023-09-15 14:23:00      True
Usuario_Old02   2023-08-22 09:15:30      True`,
        hint: 'Usa Search-ADAccount con -AccountInactive y -TimeSpan [días]. Usa -UsersOnly para filtrar solo usuarios.',
      },
      {
        title: 'Crear usuarios en lote desde CSV',
        explanation: `Importamos un CSV con datos de usuarios y creamos cada cuenta. El CSV debe tener las columnas: SamAccountName, UserPrincipalName, GivenName, Surname, Department, Title. La contraseña se asigna como string (en producción usaría contraseñas iniciales aleatorias).`,
        command: `# Primero crear el CSV
@"
SamAccountName,UserPrincipalName,GivenName,Surname,Department,Title
ajones,ajones@empresa.com,Alice,Jones,Sales,Sales Rep
bsmith,bsmith@empresa.com,Bob,Smith,Sales,Sales Manager
"@ | Out-File "C:\\users.csv" -Encoding UTF8

# Luego importar y crear
Import-Csv "C:\\users.csv" | ForEach-Object {
  New-ADUser -SamAccountName $_.SamAccountName \\
    -UserPrincipalName $_.UserPrincipalName \\
    -GivenName $_.GivenName \\
    -Surname $_.Surname \\
    -Department $_.Department \\
    -Title $_.Title \\
    -Path "OU=Usuarios,DC=corp,DC=local" \\
    -AccountPassword (ConvertTo-SecureString "P@ssw0rd123" -AsPlainText -Force) \\
    -Enabled $true
}`,
        expectedOutput: `(Sin salida en pantalla si es exitoso)`,
        hint: 'Usa Import-Csv con la ruta al archivo, luego pipe a ForEach-Object. En cada iteración crea un New-ADUser con los datos del CSV.',
      },
      {
        title: 'Gestionar membresías de grupos (Add / Remove)',
        explanation: `Añadimos y eliminamos miembros de grupos AD. Los cmdlets \`Add-ADGroupMember\` y \`Remove-ADGroupMember\` aceptan usuarios individuales o arrays de usuarios.`,
        command: 'Add-ADGroupMember -Identity "Grupo-IT" -Members ajones, bsmith; Get-ADGroupMember -Identity "Grupo-IT" | Select-Object Name, SamAccountName',
        expectedOutput: `Name         SamAccountName
----         --------------
Alice Jones  ajones
Bob Smith    bsmith`,
        hint: 'Usa Add-ADGroupMember con -Identity [nombre grupo] y -Members [lista usuarios]. Luego usa Get-ADGroupMember para verificar.',
      },
      {
        title: 'Mover usuarios entre OUs',
        explanation: `El cmdlet \`Move-ADObject\` cambia la OU (Organizational Unit) de un usuario. Es útil para reorganizar estructuras de dominio o implementar cambios organizacionales.`,
        command: 'Get-ADUser -Filter {Department -eq "Marketing"} | Move-ADObject -TargetPath "OU=Marketing,OU=Departamentos,DC=corp,DC=local"',
        expectedOutput: `(Sin salida si es exitoso)`,
        hint: 'Primero obtén los usuarios con Get-ADUser, luego pipe a Move-ADObject con -TargetPath especificando la nueva OU.',
      },
      {
        title: 'Desactivar cuentas inactivas automáticamente',
        explanation: `Desactivamos usuarios que no se han autenticado en 90 días. En producción, primero notificarías; aquí demostramos la búsqueda y desactivación.`,
        command: 'Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Disable-ADAccount -WhatIf',
        expectedOutput: `What if: Performing operation "Disable-ADAccount" ...
What if: Disabling account CN=Usuario_Old01,...`,
        hint: 'Usa Search-ADAccount para encontrar inactivos, pipe a Disable-ADAccount. Usa -WhatIf primero para verificar qué haría.',
      },
      {
        title: 'Generar informe HTML profesional',
        explanation: `ConvertTo-Html genera HTML a partir de objetos PowerShell. Creamos un informe con usuarios por departamento con estilos CSS.`,
        command: `$users = Get-ADUser -Filter * -Properties Department, Title | Select-Object Name, Department, Title
$html = $users | ConvertTo-Html -Title "Informe de Usuarios AD" -Head "<style>
body { font-family: Arial; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #4CAF50; color: white; }
</style>"
$html | Out-File "C:\\Informe_Usuarios.html"
Write-Host "Informe generado: C:\\Informe_Usuarios.html"`,
        expectedOutput: `Informe generado: C:\Informe_Usuarios.html`,
        hint: 'Usa Get-ADUser para recuperar datos, pipe a ConvertTo-Html con -Title y -Head (para CSS). Luego Out-File para guardar el HTML.',
      },
      {
        title: 'Programar tarea automatizada para auditoría de AD',
        explanation: `Register-ScheduledTask crea una tarea programada en Windows que ejecuta un script PowerShell a una hora específica (cada madrugada, por ejemplo). Esto realiza auditorías automáticas de AD.`,
        command: `$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File C:\\Scripts\\AD_Audit.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 02:00AM
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable
Register-ScheduledTask -TaskName "AD Daily Audit" -Action $action -Trigger $trigger -Settings $settings -User SYSTEM -RunLevel Highest`,
        expectedOutput: `TaskPath         : \
TaskName         : AD Daily Audit
State            : Ready`,
        hint: 'Crea una ScheduledTaskAction con PowerShell, una ScheduledTaskTrigger con la hora, y luego Register-ScheduledTask con SYSTEM como usuario.',
      },
    ],
  },

  {
    id: 'ps-remoting',
    moduleId: 'powershell-advanced',
    title: 'PowerShell Remoting y Gestión Masiva',
    description: 'Domina PowerShell Remoting: sesiones remotas, ejecución masiva en múltiples servidores, transferencia de archivos y seguridad con Just Enough Administration (JEA).',
    difficulty: 'advanced',
    xp: 140,
    minutes: 45,
    objectives: [
      'Habilitar y configurar PowerShell Remoting (WSMan)',
      'Crear sesiones remotas persistentes',
      'Ejecutar comandos en múltiples servidores simultáneamente',
      'Transferir archivos de forma segura con Copy-Item -ToSession',
      'Configurar endpoints de JEA para delegar autoridad limitada',
    ],
    theory: `## PowerShell Remoting (WSMan)

PowerShell Remoting permite ejecutar comandos en servidores remotos de forma segura. Utiliza el protocolo **WinRM** (Windows Remote Management) sobre HTTP/HTTPS.

### Modos de remoting

| Modo | Descripción |
|---|---|
| **1-to-1** | \`Invoke-Command\` contra un servidor individual |
| **1-to-many** | Ejecutar contra un array de servidores |
| **Enter-PSSession** | Sesión interactiva remota (como SSH) |
| **New-PSSession** | Crear sesión persistente para múltiples comandos |

### Requisitos

- WSMan (WinRM) habilitado en el destino
- Credenciales válidas (AD, local con trust implícito)
- Firewall permitiendo puerto 5985 (HTTP) o 5986 (HTTPS)
- Política de ejecución permitiendo remoting

### JEA (Just Enough Administration)

JEA permite crear endpoints de PowerShell con permisos limitados. Un usuario podría tener acceso solo a ciertos cmdlets o funciones.`,

    steps: [
      {
        title: 'Habilitar PowerShell Remoting con Enable-PSRemoting',
        explanation: `Enable-PSRemoting configura WSMan, habilita el listener HTTP, configura la política de ejecución para RemoteSigned, y crea el endpoint "Microsoft.PowerShell" por defecto. El flag \`-Force\` evita confirmar.`,
        command: 'Enable-PSRemoting -Force; Get-PSSessionConfiguration | Select-Object Name, Enabled | Format-Table',
        expectedOutput: `Name                  Enabled
----                  -------
Microsoft.PowerShell     True
microsoft.powershell32   True`,
        hint: 'Usa Enable-PSRemoting -Force. Luego Get-PSSessionConfiguration para verificar que los endpoints están habilitados.',
      },
      {
        title: 'Crear una sesión remota persistente',
        explanation: `New-PSSession abre una conexión persistente a un servidor. Todos los comandos ejecutados en esa sesión comparten el mismo contexto. Útil para scripts largos o múltiples operaciones relacionadas.`,
        command: 'New-PSSession -ComputerName SERVER01 -Credential (Get-Credential) | Select-Object ComputerName, State, IdleTimeout',
        expectedOutput: `ComputerName State Idle Timeout
------------ ----- -----------
SERVER01     Opened 240000`,
        hint: 'Usa New-PSSession con -ComputerName y -Credential. Pipe a Select-Object para ver propiedades.',
      },
      {
        title: 'Ejecutar comandos en sesión remota',
        explanation: `Una vez creada la sesión, ejecutamos comandos en ella con \`Invoke-Command\` usando el parámetro \`-Session\`. Las variables locales de la sesión persisten entre comandos.`,
        command: `$session = New-PSSession -ComputerName SERVER01
Invoke-Command -Session $session -ScriptBlock {
  $logPath = "C:\\Logs\\Application.evtx"
  if (Test-Path $logPath) { Write-Host "Log file found" } else { Write-Host "Not found" }
}`,
        expectedOutput: `Log file found`,
        hint: 'Primero crea la sesión con New-PSSession. Luego Invoke-Command con -Session $session y un -ScriptBlock con el código.',
      },
      {
        title: 'Ejecutar comandos en múltiples servidores (remoting 1-to-many)',
        explanation: `Invoke-Command puede ejecutar contra múltiples máquinas. El parámetro \`-ComputerName\` acepta un array. Ejecutamos la misma tarea en paralelo en todos los servidores.`,
        command: `$servers = @("SERVER01", "SERVER02", "SERVER03", "SERVER04")
Invoke-Command -ComputerName $servers -ScriptBlock {
  Get-Service WinRM | Select-Object MachineName, Name, Status
} | Format-Table -AutoSize`,
        expectedOutput: `PSComputerName Name   Status
-------------- ----   ------
SERVER01       WinRM  Running
SERVER02       WinRM  Running
SERVER03       WinRM  Running
SERVER04       WinRM  Running`,
        hint: 'Define un array @(...) de servidores. Usa Invoke-Command con -ComputerName $servers (array) y un -ScriptBlock.',
      },
      {
        title: 'Copiar archivos de forma remota con Copy-Item -ToSession',
        explanation: `Copy-Item permite transferencias de archivos entre el cliente y máquinas remotas. \`-ToSession\` copia hacia el remoto; \`-FromSession\` copia desde el remoto. Las sesiones deben estar activas.`,
        command: `$session = New-PSSession -ComputerName SERVER01
Copy-Item -Path "C:\\Scripts\\Deploy.ps1" -Destination "C:\\Scripts\\" -ToSession $session
Invoke-Command -Session $session -ScriptBlock { Get-Item "C:\\Scripts\\Deploy.ps1" | Select-Object Name, Length }`,
        expectedOutput: `Name        Length
----        ------
Deploy.ps1  2048`,
        hint: 'Crea la sesión. Usa Copy-Item con -ToSession para enviar archivos. Luego Invoke-Command para verificar que se copió.',
      },
      {
        title: 'Configurar HTTPS para WinRM (seguridad)',
        explanation: `Por defecto WinRM usa HTTP (sin encriptación). Para producción, configuramos listener HTTPS con certificado. El comando \`winrm\` crea el listener; luego configuramos el cliente para confiar en el certificado.`,
        command: `# Crear listener HTTPS (requiere certificado válido)
winrm create winrm/config/Listener?Address=*+Transport=HTTPS @{CertificateThumbprint="THUMBPRINT_DEL_CERTIFICADO"}

# Verificar que escucha en puerto 5986
netstat -ano | findstr ":5986"`,
        expectedOutput: `TCP    0.0.0.0:5986           0.0.0.0:0              LISTENING       4`,
        hint: 'Usa el comando winrm para crear listener HTTPS. Necesitas obtener el thumbprint del certificado con Get-ChildItem cert:.',
      },
      {
        title: 'Comparar Enter-PSSession vs Invoke-Command',
        explanation: `Enter-PSSession abre una sesión **interactiva** (como SSH), mientras que Invoke-Command es **no interactivo** (envía scripts). Usa Enter-PSSession para troubleshooting manual; Invoke-Command para automatización.`,
        command: `# Sesión interactiva (Enter-PSSession)
# Enter-PSSession -ComputerName SERVER01
# [SERVER01]: PS C:\\> Get-Service WinRM
# [SERVER01]: PS C:\\> Exit-PSSession

# Sesión no interactiva (Invoke-Command)
Invoke-Command -ComputerName SERVER01 -ScriptBlock { Get-Service WinRM }`,
        expectedOutput: `Status   Name               DisplayName
------   ----               -----------
Running  WinRM              Windows Remote Management (WS-Man...)`,
        hint: 'Enter-PSSession es interactivo y cambia el prompt. Invoke-Command es para scripts/automatización.',
      },
      {
        title: 'Crear endpoint JEA personalizado (Just Enough Administration)',
        explanation: `JEA permite restringir qué cmdlets o funciones puede ejecutar un usuario remoto. Creamos un archivo de configuración de rol (.psrc) que permite solo Get-* y Stop-Service.`,
        command: `# Crear archivo de configuración de rol JEA
@{
  Version = '1.0'
  Author = 'Admin'
  Description = 'Configuración JEA para soporte técnico'
  SessionType = 'RestrictedRemoteServer'
  RunAsVirtualAccount = $true
  VisibleCmdlets = @(
    'Get-Service',
    'Get-Process',
    @{ Name = 'Restart-Service'; Parameters = @{ Name = 'Name'; ValidateSet = @('W3SVC', 'WinRM') } },
    @{ Name = 'Stop-Service'; Parameters = @{ Name = 'Name'; ValidateSet = @('W3SVC', 'WinRM') } }
  )
} | Out-File "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Session Configurations\\JEA_Support.psrc"

# Registrar el endpoint
Register-PSSessionConfiguration -Name JEA_Support -Path "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Session Configurations\\JEA_Support.psrc"`,
        expectedOutput: `    WSManConfig: Microsoft.WSMan.Management\\WSManConfig

Type            Keys                                Name
----            ----                                ----
Container       {Name=JEA_Support}                  JEA_Support`,
        hint: 'Crea un archivo .psrc que define VisibleCmdlets y VisibleFunctions. Luego Register-PSSessionConfiguration para registrarlo como endpoint.',
      },
    ],
  },

  {
    id: 'ps-modules',
    moduleId: 'powershell-advanced',
    title: 'Módulos PowerShell y Gestión de Paquetes',
    description: 'Instala módulos de la galería, crea módulos propios, versiona correctamente y publica en PSGallery para reutilización corporativa.',
    difficulty: 'basic',
    xp: 100,
    minutes: 35,
    objectives: [
      'Usar PowerShellGet para instalar, actualizar y eliminar módulos',
      'Buscar módulos disponibles en PSGallery',
      'Crear un módulo PowerShell personalizado con estructura correcta',
      'Gestionar versionado semántico en módulos',
      'Exportar funciones públicas con Export-ModuleMember',
    ],
    theory: `## Módulos PowerShell (PSM1 y PSD1)

Un módulo PowerShell es una carpeta con funciones reutilizables. Consta de:

- **\`.psm1\`** — Script del módulo (contiene funciones)
- **\`.psd1\`** — Manifiesto del módulo (metadatos: versión, autor, dependencias)
- **\`Public/\`** y **\`Private/\`** — Directorios para funciones públicas y privadas

### Versionado semántico (SemVer)

\`\`\`
1.0.0 = MAJOR.MINOR.PATCH
  MAJOR — cambios incompatibles
  MINOR — nuevas funciones, compatible
  PATCH — correcciones de bugs
\`\`\`

### PowerShellGet

\`\`\`powershell
Find-Module                 — buscar en PSGallery
Install-Module              — instalar módulo
Update-Module               — actualizar módulo
Uninstall-Module            — desinstalar módulo
Get-InstalledModule         — listar módulos instalados
Publish-Module              — publicar a PSGallery
\`\`\`

### Módulos corporativos útiles

- **ImportExcel** — leer/escribir Excel sin Excel instalado
- **PSWindowsUpdate** — gestionar actualizaciones de Windows
- **ActiveDirectory** — gestionar AD (parte de RSAT)
- **dbatools** — administración de SQL Server
- **Posh-SSH** — conexiones SSH desde PowerShell`,

    steps: [
      {
        title: 'Buscar módulos en PSGallery',
        explanation: `Find-Module busca en la galería pública de Microsoft. Podemos filtrar por nombre, tags, versión. Solo buscamos módulos certificados o de Microsoft.`,
        command: 'Find-Module -Name "*Excel*" | Select-Object Name, Version, Description | Format-Table -AutoSize',
        expectedOutput: `Name                                 Version Description
----                                 ------- -----------
ImportExcel                          7.8.4   PowerShell module for importing/exporting Excel workbooks
dbatools.Excel                       1.0.2   Excel functions for dbatools`,
        hint: 'Usa Find-Module con -Name (acepta wildcards con *). Pipe a Select-Object y Format-Table.',
      },
      {
        title: 'Instalar un módulo desde PSGallery',
        explanation: `Install-Module descarga e instala un módulo. Por defecto se instala en \`$PROFILE\\Modules\`. El parámetro \`-Force\` fuerza la actualización si ya existe; \`-AllowClobber\` permite sobrescribir comandos existentes.`,
        command: 'Install-Module -Name ImportExcel -Force -AllowClobber; Get-Module ImportExcel -ListAvailable | Select-Object Name, Version',
        expectedOutput: `Name         Version
----         -------
ImportExcel  7.8.4`,
        hint: 'Usa Install-Module con -Name. Luego Get-Module -ListAvailable para verificar que se instaló.',
      },
      {
        title: 'Actualizar un módulo instalado',
        explanation: `Update-Module actualiza a la última versión disponible en PSGallery. Comprobamos la versión antes y después.`,
        command: 'Get-InstalledModule -Name ImportExcel | Select-Object Name, Version; Update-Module -Name ImportExcel; Get-InstalledModule -Name ImportExcel | Select-Object Name, Version',
        expectedOutput: `Name         Version
----         -------
ImportExcel  7.8.4

Name         Version
----         -------
ImportExcel  7.8.5`,
        hint: 'Primero Get-InstalledModule para ver versión actual. Luego Update-Module. Comprueba versión de nuevo.',
      },
      {
        title: 'Listar módulos instalados',
        explanation: `Get-InstalledModule lista todos los módulos que hemos instalado desde PSGallery. Diferencia entre módulos instalados (via Install-Module) y disponibles (cualquier módulo en \`$PSModulePath\`).`,
        command: 'Get-InstalledModule | Select-Object Name, Version, Author | Format-Table -AutoSize | Head -10',
        expectedOutput: `Name                    Version Author
----                    ------- ------
ImportExcel             7.8.4   Douglas Finke
PSWindowsUpdate         2.3.6   Michal Gajda
Az.Accounts             2.12.0  Microsoft Corporation
Az.Storage              4.6.0   Microsoft Corporation`,
        hint: 'Usa Get-InstalledModule sin parámetros. Pipe a Select-Object y Format-Table.',
      },
      {
        title: 'Crear estructura de un módulo PowerShell personalizado',
        explanation: `Un módulo bien estructurado tiene carpetas \`Public\` y \`Private\` para las funciones, un .psm1 que importa las funciones, y un .psd1 con los metadatos.`,
        command: `# Crear estructura de directorio
mkdir "C:\\Modules\\MyModule\\Public", "C:\\Modules\\MyModule\\Private", "C:\\Modules\\MyModule\\Tests"

# Crear archivo .psm1 (módulo)
@'
Get-ChildItem "$PSScriptRoot\\Public" -Filter "*.ps1" | ForEach-Object {
  . $_.FullName
}

Export-ModuleMember -Function @(
  "Get-ServerStatus",
  "Restart-RemoteService"
)
'@ | Out-File "C:\\Modules\\MyModule\\MyModule.psm1"

# Crear archivo .psd1 (manifiesto)
@'
@{
  RootModule           = "MyModule.psm1"
  ModuleVersion        = "1.0.0"
  Author               = "IT Team"
  Description          = "Módulo personalizado para operaciones de servidor"
  FunctionsToExport    = @("Get-ServerStatus", "Restart-RemoteService")
  CmdletsToExport      = @()
  RequiredModules      = @("ActiveDirectory")
  MinimumPSVersion     = "5.1"
}
'@ | Out-File "C:\\Modules\\MyModule\\MyModule.psd1"`,
        expectedOutput: `(Directorios y archivos creados sin salida)`,
        hint: 'Crea directorios con mkdir. El .psm1 importa funciones de Public y exporta con Export-ModuleMember. El .psd1 tiene los metadatos.',
      },
      {
        title: 'Crear funciones públicas en el módulo',
        explanation: `Las funciones públicas van en la carpeta \`Public\`. Crearemos dos funciones: una para obtener estado de servicios remotos y otra para reiniciarlos.`,
        command: `# Crear función pública: Get-ServerStatus
@'
function Get-ServerStatus {
  param(
    [Parameter(Mandatory=$true)]
    [string]$ComputerName
  )

  $services = Get-Service -ComputerName $ComputerName | Where-Object { $_.Name -like "W*" }
  return $services | Select-Object MachineName, Name, Status
}
'@ | Out-File "C:\\Modules\\MyModule\\Public\\Get-ServerStatus.ps1"

# Crear función pública: Restart-RemoteService
@'
function Restart-RemoteService {
  param(
    [Parameter(Mandatory=$true)]
    [string]$ComputerName,
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
  )

  Invoke-Command -ComputerName $ComputerName -ScriptBlock { Restart-Service -Name $ServiceName -Force }
}
'@ | Out-File "C:\\Modules\\MyModule\\Public\\Restart-RemoteService.ps1"`,
        expectedOutput: `(Archivos creados sin salida)`,
        hint: 'Crea funciones .ps1 en la carpeta Public. Usa param() para declarar parámetros, [Parameter(Mandatory=$true)] para hacerlos obligatorios.',
      },
      {
        title: 'Exportar funciones con Export-ModuleMember',
        explanation: `El .psm1 usa Export-ModuleMember para indicar qué funciones son públicas (visibles al usuario) y cuáles son privadas (solo internas).`,
        command: `# Actualizar MyModule.psm1 con exports explícitos
@'
Get-ChildItem "$PSScriptRoot\\Public" -Filter "*.ps1" | ForEach-Object {
  . $_.FullName
}

# Exportar solo estas funciones
Export-ModuleMember -Function @(
  "Get-ServerStatus",
  "Restart-RemoteService"
)
'@ | Out-File "C:\\Modules\\MyModule\\MyModule.psm1"`,
        expectedOutput: `(Archivo actualizado sin salida)`,
        hint: 'En el .psm1, usa Export-ModuleMember -Function @(...) listando las funciones públicas.',
      },
      {
        title: 'Importar y usar el módulo personalizado',
        explanation: `Importamos el módulo y verificamos que las funciones están disponibles.`,
        command: `# Agregar módulo al PSModulePath
$env:PSModulePath += ";C:\\Modules"

# Importar módulo
Import-Module MyModule

# Verificar funciones exportadas
Get-Command -Module MyModule

# Usar una función
Get-ServerStatus -ComputerName "SERVER01"`,
        expectedOutput: `CommandType Name                     ModuleName
----------- ----                     ----------
Function    Get-ServerStatus         MyModule
Function    Restart-RemoteService    MyModule

MachineName Name   Status
----------- ----   ------
SERVER01    WinRM  Running
SERVER01    W3SVC  Running`,
        hint: 'Primero agrega el path del módulo a PSModulePath. Luego Import-Module. Usa Get-Command -Module para ver qué exporta.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // NPS Y RADIUS
  // ══════════════════════════════════════════════════════
  {
    id: 'nps-wifi-8021x',
    moduleId: 'nps-radius',
    title: 'Autenticación WiFi Corporativa con 802.1X',
    description: 'Configura Network Policy Server como RADIUS para autenticar dispositivos WiFi corporativos con 802.1X, PEAP-MSCHAPv2 o EAP-TLS.',
    difficulty: 'advanced',
    xp: 160,
    minutes: 50,
    objectives: [
      'Instalar el rol NPS (Network Policy Server)',
      'Registrar NPS como servidor autorizado en DHCP',
      'Configurar clientes RADIUS (puntos de acceso WiFi)',
      'Crear políticas de red con condiciones y permisos',
      'Configurar métodos de autenticación PEAP-MSCHAPv2 y EAP-TLS',
    ],
    theory: `## Network Policy Server (NPS) y RADIUS

NPS es el servidor RADIUS de Microsoft. RADIUS (Remote Authentication Dial-In User Service) gestiona la autenticación de usuarios remotos en redes corporativas (WiFi 802.1X, VPN, dial-up).

### Componentes RADIUS

| Componente | Descripción |
|---|---|
| **NAS** (Network Access Server) | El punto de acceso WiFi o servidor VPN que solicita autenticación |
| **RADIUS Server** | NPS, que valida credenciales contra AD |
| **Cliente RADIUS** | Configuración del NAS con IP del servidor NPS y shared secret |
| **Shared Secret** | Contraseña compartida entre NAS y RADIUS (encriptación) |

### 802.1X

\`\`\`
Supplicant (cliente) ← 802.1X frame → Authenticator (AP) ← RADIUS → Authentication Server (NPS)
\`\`\`

El cliente envía credenciales encapsuladas al AP, que a su vez consulta NPS.

### Métodos de autenticación

- **PEAP-MSCHAPv2**: Túnel TLS + contraseña — más común, compatible
- **EAP-TLS**: Certificados en cliente y servidor — muy seguro, complejo
- **MS-CHAPv2**: Contraseña sin TLS — no recomendado (inseguro)`,

    steps: [
      {
        title: 'Instalar el rol NPS',
        explanation: `Instalamos Network Policy Server con sus herramientas de administración. NPS requiere que AD DS esté presente en la red.`,
        command: 'Install-WindowsFeature NPAS -IncludeManagementTools; Get-WindowsFeature NPAS | Select-Object Name, InstallState',
        expectedOutput: `Name  InstallState
----  ------------
NPAS  Installed`,
        hint: 'Usa Install-WindowsFeature NPAS -IncludeManagementTools. Luego Get-WindowsFeature para verificar.',
      },
      {
        title: 'Registrar NPS como servidor autorizado en DHCP',
        explanation: `NPS debe estar autorizado en DHCP antes de empezar a procesar solicitudes RADIUS. Esto previene que servidores no autorizados actúen como RADIUS.`,
        command: 'netsh nps add registeredserver; netsh nps show registeredserver',
        expectedOutput: `NPSSERVER registered in DHCP successfully.

Registered Servers:
  NPSSERVER`,
        hint: 'Usa netsh nps add registeredserver. Luego netsh nps show registeredserver para verificar.',
      },
      {
        title: 'Agregar un cliente RADIUS (punto de acceso WiFi)',
        explanation: `Configuramos el punto de acceso inalámbrico como cliente RADIUS. Necesitamos su IP, nombre amigable y shared secret (contraseña).`,
        command: 'Add-NpsRadiusClient -Address "192.168.1.50" -Name "AP-Building-A" -SharedSecret "P@ssw0rd123456" -VendorName "Cisco"',
        expectedOutput: ``,
        hint: 'Usa Add-NpsRadiusClient con -Address (IP del AP), -Name, -SharedSecret y -VendorName. El shared secret debe coincidir en el AP.',
      },
      {
        title: 'Crear una Network Policy para autenticación WiFi',
        explanation: `Las Network Policies definen quién puede conectar y cómo. Crearemos una política que permite a usuarios del grupo "WiFi-Users" autenticarse con PEAP-MSCHAPv2.`,
        command: `# Crear condición: grupo WiFi-Users
$condition = New-NpsNetworkPolicyCondition -ConditionType UserGroupCondition -ConditionValue "WiFi-Users"

# Crear política
New-NpsNetworkPolicy -Name "Allow WiFi Users" \\
  -State Enabled \\
  -Conditions @($condition) \\
  -Access Allow \\
  -ProcessingOrder 1 \\
  -AuthenticationMethods @{ EapTypeId = 21; FastReauthEnabled = $true }`,
        expectedOutput: ``,
        hint: 'Usa New-NpsNetworkPolicyCondition para definir condiciones (grupos, conexión type, etc.). Luego New-NpsNetworkPolicy con -Conditions, -Access y -AuthenticationMethods.',
      },
      {
        title: 'Configurar métodos de autenticación PEAP-MSCHAPv2',
        explanation: `PEAP proporciona un túnel TLS seguro sobre el que se negocia MSCHAPv2. Es el método más compatible. Configuramos el certificado del servidor y las opciones de PEAP.`,
        command: `# Obtener certificado del servidor (debe ser válido o auto-firmado)
$cert = Get-ChildItem Cert:\\LocalMachine\\My | Where-Object { $_.Subject -like "*NPS*" } | Select-Object -First 1

# Configurar PEAP en NPS (mediante NPS MMC, aquí demostramos el concepto)
# En la consola NPS: Policies > Network Policies > propiedades > Constraints > Authentication Methods
# Habilitar PEAP (EAP Type 25) con MSCHAPv2

Write-Host "Configuración PEAP:"
Write-Host "- Método: PEAP"
Write-Host "- Certificado servidor: $($cert.Thumbprint)"
Write-Host "- Allow legacy auth methods: $false"
Write-Host "- Secured password (MSCHAPv2): Enabled"`,
        expectedOutput: `Configuración PEAP:
- Método: PEAP
- Certificado servidor: A1B2C3D4E5F6...
- Allow legacy auth methods: False
- Secured password (MSCHAPv2): Enabled`,
        hint: 'PEAP se configura principalmente en la GUI de NPS (Network Policy Server). Necesitas un certificado válido del servidor.',
      },
      {
        title: 'Configurar EAP-TLS (certificados X.509)',
        explanation: `EAP-TLS es más seguro que PEAP pero requiere certificados en cliente y servidor. Ambas partes se autentican mutuamente. Ideal para entornos de alta seguridad.`,
        command: `# Verificar que el certificado del servidor está disponible
Get-ChildItem Cert:\\LocalMachine\\My | Select-Object Subject, Thumbprint | Format-Table

# Para clientes: distribuir certificado raíz y certificado de cliente via GPO o manual
# Configurar en NPS:
# 1. Habilitar EAP-TLS en las políticas
# 2. Especificar el certificado del servidor
# 3. En los clientes: Instalar certificado raíz de CA (en Trusted Root)
# 4. Instalar certificado de cliente (en Personal)

Write-Host "EAP-TLS requiere:"
Write-Host "- Servidor: Certificado X.509 válido o auto-firmado"
Write-Host "- Cliente: Certificado de cliente + CA root en Trusted Root"
Write-Host "- Mayor seguridad pero más complejo de gestionar"`,
        expectedOutput: `Subject                                    Thumbprint
-------                                    ----------
CN=NPS-Server.empresa.com, OU=IT...       A1B2C3D4E5F6...

EAP-TLS requiere:
- Servidor: Certificado X.509 válido o auto-firmado
- Cliente: Certificado de cliente + CA root en Trusted Root
- Mayor seguridad pero más complejo de gestionar`,
        hint: 'EAP-TLS se configura en NPS > Policies > Authentication Methods > EAP Types. Requiere PKI.',
      },
      {
        title: 'Crear Connection Request Policy',
        explanation: `Las Connection Request Policies (CRP) redirigen solicitudes RADIUS a diferentes servidores NPS. Si tienes múltiples NPS, las CRPs balancean la carga.`,
        command: `# Crear CRP que envía solicitudes de WiFi al NPS remoto
New-NpsConnectionRequestPolicy -Name "WiFi to Primary NPS" \\
  -State Enabled \\
  -ProcessingOrder 1 \\
  -Conditions @(NasPortType -Condition Wireless-802.11) \\
  -ProxySettings -ProxyServerGroupName "Primary-NPS-Group"`,
        expectedOutput: ``,
        hint: 'Usa New-NpsConnectionRequestPolicy. Las CRPs se procesan antes que Network Policies.',
      },
      {
        title: 'Revisar logs de autenticación RADIUS',
        explanation: `Los logs de NPS registran intentos de autenticación exitosos y fallidos. Revisamos el Event Viewer para diagnosticar problemas de autenticación WiFi.`,
        command: `Get-WinEvent -LogName "Security" -FilterXPath "*[System[EventID=6272 or EventID=6273]]" -MaxEvents 10 |
  Select-Object TimeCreated, Message | Format-Table -AutoSize`,
        expectedOutput: `TimeCreated              Message
-----------              -------
01/01/2024 14:30:45      RADIUS authentication successful for user jgarcia...
01/01/2024 14:25:12      RADIUS authentication failed for user unknown...`,
        hint: 'Usa Get-WinEvent con -LogName "Security" y filtro EventID (6272=éxito, 6273=fallo). Pipe a Select-Object y Format-Table.',
      },
    ],
  },

  {
    id: 'nps-vpn',
    moduleId: 'nps-radius',
    title: 'VPN con autenticación RADIUS via NPS',
    description: 'Integra NPS con RRAS para autenticar usuarios VPN contra Active Directory mediante RADIUS.',
    difficulty: 'intermediate',
    xp: 130,
    minutes: 40,
    objectives: [
      'Instalar RRAS en modo VPN',
      'Integrar RRAS con NPS para autenticación',
      'Crear políticas de red para usuarios VPN',
      'Configurar direccionamiento IP para clientes VPN',
      'Monitorizar sesiones VPN activas',
    ],
    theory: `## RRAS + NPS para VPN

RRAS (Routing and Remote Access Service) es el servidor VPN de Windows. Puede usar autenticación local o delegar a RADIUS (NPS).

### Tipos de VPN

| Protocolo | Puerto | Seguridad | Soporte |
|---|---|---|---|
| **PPTP** | 1723 | Baja | Todos |
| **L2TP/IPsec** | 500, 4500 | Media | Todos |
| **SSTP** | 443 | Alta | Windows |
| **IKEv2** | 500, 4500 | Alta | Moderno |

### Integración RRAS-NPS

RRAS puede delegar la autenticación a un servidor NPS remoto, centralizando la gestión de credenciales y políticas.`,

    steps: [
      {
        title: 'Instalar RRAS en modo VPN',
        explanation: `Instalamos el rol Remote Access con el servicio VPN. RRAS requiere al menos 2 NICs (interna y externa) pero podemos simular con 1 NIC.`,
        command: 'Install-RemoteAccess -VpnType Vpn; Get-RemoteAccess | Select-Object VpnStatus, VpnS2sStatus',
        expectedOutput: `VpnStatus VpnS2sStatus
--------- -----------
Installed Running`,
        hint: 'Usa Install-RemoteAccess -VpnType Vpn. Luego Get-RemoteAccess para verificar.',
      },
      {
        title: 'Configurar servidor RRAS para usar NPS como RADIUS',
        explanation: `RRAS, por defecto, autentica localmente. Configuramos un servidor RADIUS remoto (NPS) como proveedor de autenticación. Las credenciales se validan contra AD remoto.`,
        command: `# Agregar servidor NPS como RADIUS a RRAS
Add-RemoteAccessRadius -ServerName "NPS-SERVER" \\
  -ServerPort 1812 \\
  -SharedSecret "P@ssw0rd123456" \\
  -PassthroughMode $false`,
        expectedOutput: ``,
        hint: 'Usa Add-RemoteAccessRadius con -ServerName (IP/FQDN del NPS), -ServerPort (1812 para auth, 1813 para accounting) y -SharedSecret.',
      },
      {
        title: 'Crear política de red para usuarios VPN',
        explanation: `Creamos una Network Policy en NPS que autoriza a miembros del grupo "VPN-Users" a conectarse via VPN.`,
        command: `# Crear condición: grupo VPN-Users
$condition = New-NpsNetworkPolicyCondition -ConditionType UserGroupCondition -ConditionValue "VPN-Users"

# Crear política VPN
New-NpsNetworkPolicy -Name "Allow VPN Users" \\
  -State Enabled \\
  -Conditions @($condition) \\
  -Access Allow \\
  -ProcessingOrder 1 \\
  -AuthenticationMethods @{ EapTypeId = 21 }`,
        expectedOutput: ``,
        hint: 'Similar a WiFi, pero con condición UserGroupCondition para VPN-Users.',
      },
      {
        title: 'Configurar pool de direcciones IP para clientes VPN',
        explanation: `Los clientes VPN necesitan una dirección IP asignada por RRAS. Configuramos un rango DHCP o un pool estático.`,
        command: `# Configurar pool de IPs estático
Set-RemoteAccessIPFilter -Protocol UDP \\
  -Direction Inbound \\
  -Action Allow \\
  -RemoteSubnetOrIPAddress "10.0.0.0/24"

# Alternativamente, usar DHCP
# Set-RemoteAccessConfiguration -UseDhcpForDnsAndWins $true

Write-Host "Pool VPN: 10.0.0.0/24 (10.0.0.1 - 10.0.0.254)"`,
        expectedOutput: `Pool VPN: 10.0.0.0/24 (10.0.0.1 - 10.0.0.254)`,
        hint: 'Configura el rango IP de clientes VPN con Set-RemoteAccessIPFilter o mediante DHCP Relay.',
      },
      {
        title: 'Verificar conectividad desde cliente VPN',
        explanation: `En el cliente Windows 10/11, creamos una conexión VPN y probamos autenticación. En el servidor vemos sesiones activas.`,
        command: `# En servidor: listar conexiones VPN activas
Get-RemoteAccessConnectionStatistics | Select-Object Protocol, ClientIPAddress, ClientName, ConnectionDuration | Format-Table -AutoSize`,
        expectedOutput: `Protocol ClientIPAddress ClientName           ConnectionDuration
-------- --------------- ----------           ------------------
IKEv2    192.168.1.100   LAPTOP-JGARCIA       00:15:30`,
        hint: 'Usa Get-RemoteAccessConnectionStatistics para monitorizar sesiones activas.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // REMOTE ACCESS
  // ══════════════════════════════════════════════════════
  {
    id: 'rras-vpn-setup',
    moduleId: 'remote-access',
    title: 'Configuración completa de servidor VPN con RRAS',
    description: 'Instala, configura y verifica un servidor VPN profesional con RRAS, incluyendo protocolos seguros y firewall.',
    difficulty: 'intermediate',
    xp: 130,
    minutes: 45,
    objectives: [
      'Verificar prerrequisitos (2 NICs, IP pública)',
      'Instalar y configurar RRAS',
      'Habilitar múltiples protocolos VPN (L2TP, IKEv2, SSTP)',
      'Configurar firewall para VPN',
      'Monitorizar sesiones de cliente VPN',
    ],
    theory: `## RRAS — Routing and Remote Access Service

RRAS es el servidor VPN integrado en Windows Server. Soporta múltiples protocolos y puede actuar como router, servidor dial-in, o VPN.

### Arquitectura recomendada

\`\`\`
[Cliente VPN en internet] ←→ [Firewall] ←→ [RRAS con 2 NICs] ←→ [Red interna]
\`\`\`

- **NIC Externa**: IP pública, expuesta a internet
- **NIC Interna**: IP privada, conectada a la red corporativa
- **Firewall**: Permite puertos VPN (1723, 500, 4500, 443)

### Protocolos VPN soportados

| Protocolo | Puertos | Ventaja |
|---|---|---|
| **L2TP/IPsec** | 500, 4500 | Estándar, compatible |
| **IKEv2** | 500, 4500 | Moderno, rápido, MOBIKE |
| **SSTP** | 443 | Atraviesa firewalls, HTTPS |
| **PPTP** | 1723 | Legado, deprecado |`,

    steps: [
      {
        title: 'Verificar requisitos de hardware y red',
        explanation: `RRAS requiere 2 NICs (interno/externo) y una IP pública estática. Verificamos la configuración de red.`,
        command: `Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, Speed | Format-Table
Get-NetIPAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, IPAddress, PrefixLength | Format-Table`,
        expectedOutput: `Name      InterfaceDescription      Status Speed
----      ---------------------      ------ -----
Ethernet  Intel 82579LM              Up     1 Gbps
Ethernet2 Intel 82579LM              Up     1 Gbps

InterfaceAlias IPAddress       PrefixLength
-------------- ---------       ------------
Ethernet       203.0.113.10    /24
Ethernet2      192.168.1.1     /24`,
        hint: 'Usa Get-NetAdapter para ver interfaces y Get-NetIPAddress para IPs.',
      },
      {
        title: 'Instalar el rol RRAS',
        explanation: `Instalamos Remote Access Service con las herramientas de administración.`,
        command: 'Install-WindowsFeature RemoteAccess -IncludeManagementTools; Get-WindowsFeature RemoteAccess | Select-Object Name, InstallState',
        expectedOutput: `Name          InstallState
----          ----------
RemoteAccess  Installed`,
        hint: 'Usa Install-WindowsFeature RemoteAccess -IncludeManagementTools.',
      },
      {
        title: 'Habilitar múltiples protocolos VPN',
        explanation: `Habilitamos L2TP/IPsec, IKEv2 y SSTP. L2TP y IKEv2 usan IPsec para encriptación; SSTP usa HTTPS (puerto 443).`,
        command: `# Habilitar L2TP
Set-RemoteAccessConfiguration -VpnProtocol L2TP -Enabled $true

# Habilitar IKEv2
Set-RemoteAccessConfiguration -VpnProtocol IKEv2 -Enabled $true

# Habilitar SSTP
Set-RemoteAccessConfiguration -VpnProtocol SSTP -Enabled $true

# Listar protocolos habilitados
Get-RemoteAccessConfiguration | Select-Object L2tpStatus, IkeV2Status, SstpStatus`,
        expectedOutput: `L2tpStatus IkeV2Status SstpStatus
---------- ----------- ----------
Running    Running     Running`,
        hint: 'Usa Set-RemoteAccessConfiguration con -VpnProtocol y -Enabled $true para cada protocolo.',
      },
      {
        title: 'Configurar rango de direcciones IP para clientes VPN',
        explanation: `Asignamos un rango de IPs privadas (ej. 10.0.0.0/24) que se distribuirán a clientes VPN conectados.`,
        command: `# Configurar rango static pool
Set-RemoteAccessIPAddressAssignment -Method StaticPool \\
  -FirstIPAddress "10.0.0.1" \\
  -LastIPAddress "10.0.0.254" \\
  -PrefixLength 24`,
        expectedOutput: ``,
        hint: 'Usa Set-RemoteAccessIPAddressAssignment -Method StaticPool con rango IP.',
      },
      {
        title: 'Configurar firewall para puertos VPN',
        explanation: `Habilitamos en el firewall los puertos necesarios para VPN: 1723 (PPTP), 500/4500 (IPsec/IKEv2), 443 (SSTP).`,
        command: `# Habilitar reglas de firewall para VPN
Enable-NetFirewallRule -DisplayName "*RRAS*"
Enable-NetFirewallRule -DisplayName "*L2TP*"
Enable-NetFirewallRule -DisplayName "*IKE*"
Enable-NetFirewallRule -DisplayName "*SSTP*"

# Verificar
Get-NetFirewallRule -DisplayName "*VPN*" -Enabled $true | Select-Object DisplayName, Direction | Format-Table`,
        expectedOutput: `DisplayName                                     Direction
-----------                                     ---------
Allow IKEv2 (UDP In)                           Inbound
Allow L2TP (UDP In)                            Inbound
Allow SSTP (TCP In)                            Inbound`,
        hint: 'Usa Enable-NetFirewallRule para habilitar reglas de firewall. Luego Get-NetFirewallRule para verificar.',
      },
      {
        title: 'Monitorizar sesiones VPN activas',
        explanation: `Listamos todos los clientes VPN conectados, su IP asignada, protocolo, y tiempo de conexión.`,
        command: `Get-RemoteAccessConnectionStatistics |
  Select-Object Protocol, ClientIPAddress, ClientName, ConnectionDuration, BytesIn, BytesOut |
  Format-Table -AutoSize`,
        expectedOutput: `Protocol ClientIPAddress ClientName           ConnectionDuration BytesIn BytesOut
-------- --------------- ----------           ------------------ ------- --------
IKEv2    10.0.0.1        LAPTOP-JGARCIA       00:45:23           512000  256000
L2TP     10.0.0.2        PC-MLOPEZ            01:20:15           1024000 512000`,
        hint: 'Usa Get-RemoteAccessConnectionStatistics. Pipe a Select-Object para estadísticas. Actualiza regularmente con un loop para monitoreo real-time.',
      },
    ],
  },

  {
    id: 'rdp-gateway',
    moduleId: 'remote-access',
    title: 'Remote Desktop Gateway para acceso seguro',
    description: 'Instala y configura RD Gateway para permitir conexiones RDP seguras a través de HTTPS sin exponer RDP directamente a internet.',
    difficulty: 'intermediate',
    xp: 120,
    minutes: 40,
    objectives: [
      'Instalar el rol RD Gateway',
      'Configurar certificado SSL para seguridad HTTPS',
      'Crear políticas de autorización (CAP y RAP)',
      'Configurar clientes RDP para usar Gateway',
      'Monitorizar sesiones Gateway',
    ],
    theory: `## Remote Desktop Gateway (RD Gateway)

RD Gateway actúa como proxy HTTPS para conexiones RDP. En lugar de exponer RDP (puerto 3389) a internet, los clientes se conectan al Gateway por HTTPS (puerto 443), que a su vez conecta al servidor RDP interno.

### Flujo de conexión RD Gateway

\`\`\`
[Cliente RDP en internet] ←→ HTTPS:443 ←→ [RD Gateway] ←→ RDP:3389 ←→ [Servidor RDP]
\`\`\`

### Políticas de RD Gateway

- **CAP** (Connection Authorization Policy) — ¿Quién puede conectar?
- **RAP** (Resource Authorization Policy) — ¿A qué recursos puede conectar?

La CAP actúa como firewall de autenticación; RAP como firewall de aplicación.`,

    steps: [
      {
        title: 'Instalar el rol RD Gateway',
        explanation: `Instalamos Remote Desktop Gateway desde el rol Remote Access.`,
        command: 'Install-WindowsFeature RDS-Gateway -IncludeManagementTools; Get-WindowsFeature RDS-Gateway | Select-Object Name, InstallState',
        expectedOutput: `Name         InstallState
----         ----------
RDS-Gateway  Installed`,
        hint: 'Usa Install-WindowsFeature RDS-Gateway -IncludeManagementTools.',
      },
      {
        title: 'Obtener / Importar certificado SSL para RD Gateway',
        explanation: `RD Gateway requiere certificado SSL válido (del nombre del servidor público). Puede ser autofirmado para laboratorio o de una CA pública en producción.`,
        command: `# Listar certificados disponibles en el almacén local
Get-ChildItem Cert:\\LocalMachine\\My | Select-Object Subject, Thumbprint, NotAfter | Format-Table

# Si no existe, crear autofirmado (solo lab)
New-SelfSignedCertificate -DnsName "rdgateway.empresa.com" -CertStoreLocation "Cert:\\LocalMachine\\My"`,
        expectedOutput: `Subject                                    Thumbprint                               NotAfter
-------                                    ----------                               --------
CN=rdgateway.empresa.com, OU=IT...        A1B2C3D4E5F6...                        01/01/2025`,
        hint: 'Usa Get-ChildItem Cert:\\LocalMachine\\My para listar. New-SelfSignedCertificate para crear autofirmado.',
      },
      {
        title: 'Asignar certificado SSL a RD Gateway',
        explanation: `Configuramos qué certificado debe usar RD Gateway para HTTPS. El certificado debe coincidir con el nombre DNS público del Gateway.`,
        command: `$cert = Get-ChildItem Cert:\\LocalMachine\\My | Where-Object { $_.Subject -like "*rdgateway*" } | Select-Object -First 1
Set-Item -Path "RDS:\\GatewayServer\\SSLCertificate\\Thumbprint" -Value $cert.Thumbprint

Write-Host "Certificado asignado: $($cert.Thumbprint)"`,
        expectedOutput: `Certificado asignado: A1B2C3D4E5F6...`,
        hint: 'Primero obtén el certificado, luego Set-Item en la ruta RDS:\\GatewayServer\\SSLCertificate\\Thumbprint.',
      },
      {
        title: 'Crear Connection Authorization Policy (CAP)',
        explanation: `CAP controla quién puede autenticarse en el Gateway. Creamos una política que permite a miembros del grupo "RDP-Users".`,
        command: `New-RDSessionDeployment -SessionHostServers @("RDHOST01") -WebAccessServer "RDGATEWAY" -GatewayServer "RDGATEWAY"

# Crear CAP
New-Item -Path "RDS:\\GatewayServer\\CAP\\Allow_RDP_Users" -ItemType "CAP" -UserGroups @("CORP\\RDP-Users") -ComputerGroupType 0 -ProtocolNames @("RDP")

Write-Host "CAP creada: Allow_RDP_Users"`,
        expectedOutput: `CAP creada: Allow_RDP_Users`,
        hint: 'Usa New-Item en la ruta RDS:\\GatewayServer\\CAP con -UserGroups.',
      },
      {
        title: 'Crear Resource Authorization Policy (RAP)',
        explanation: `RAP define a qué servidores RDP pueden conectar. Creamos una política que autoriza acceso a RDHOST01 para el grupo RDP-Users.`,
        command: `New-Item -Path "RDS:\\GatewayServer\\RAP\\Allow_RDHosts" -ItemType "RAP" -UserGroups @("CORP\\RDP-Users") -ComputerGroupType 1 -ComputerGroupNames @("RDHOST01")

Write-Host "RAP creada: Allow_RDHosts"`,
        expectedOutput: `RAP creada: Allow_RDHosts`,
        hint: 'Usa New-Item en RDS:\\GatewayServer\\RAP con -ComputerGroupNames listando los servidores RDP permitidos.',
      },
      {
        title: 'Configurar cliente RDP para usar RD Gateway',
        explanation: `En el cliente Windows, configuramos la conexión RDP para pasar a través del Gateway. Esto se hace en las propiedades de la conexión RDP.`,
        command: `# Crear archivo RDP con configuración de Gateway
@"
full address:s:RDHOST01.empresa.com
username:s:CORP\\usuario
gatewayusagemethod:i:1
gatewayhostname:s:rdgateway.empresa.com
gatewaycredentialssource:i:2
authentication level:i:2
allow font smoothing:i:1
"@ | Out-File "$env:USERPROFILE\\Desktop\\RDGateway.rdp"

Write-Host "Archivo RDP creado: RDGateway.rdp"`,
        expectedOutput: `Archivo RDP creado: RDGateway.rdp`,
        hint: 'Crea archivo .rdp con gatewayhostname apuntando al Gateway. El cliente usará HTTPS para conectar.',
      },
      {
        title: 'Monitorizar sesiones en RD Gateway',
        explanation: `Listamos conexiones activas a través del Gateway.`,
        command: `Get-RDGatewayConnection | Select-Object GatewayConnectionId, UserName, ClientIPAddress, ConnectionTime | Format-Table -AutoSize`,
        expectedOutput: `GatewayConnectionId UserName     ClientIPAddress ConnectionTime
------------------ --------     --------------- ---------------
1001                CORP\\jgarcia 203.0.113.100   01/01/2024 09:30:00
1002                CORP\\mlopez  203.0.113.101   01/01/2024 09:45:00`,
        hint: 'Usa Get-RDGatewayConnection para listar sesiones. Pipe a Select-Object y Format-Table.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // VSS Y BACKUP
  // ══════════════════════════════════════════════════════
  {
    id: 'vss-shadow-copies',
    moduleId: 'vss-backup',
    title: 'Shadow Copies — Versiones anteriores y recuperación granular',
    description: 'Configura Volume Shadow Copy Service para mantener versiones anteriores de archivos y permitir recuperación sin backup externo.',
    difficulty: 'basic',
    xp: 100,
    minutes: 30,
    objectives: [
      'Entender conceptos de VSS: providers, requestors, writers',
      'Habilitar Shadow Copies en volúmenes',
      'Configurar programación y límite de espacio',
      'Recuperar archivos individuales desde Previous Versions',
      'Administrar snapshots con vssadmin',
    ],
    theory: `## Volume Shadow Copy Service (VSS)

VSS es un servicio Windows que crea "snapshots" (copias de punto en tiempo) de volúmenes mientras están en uso. Permite recuperar versiones anteriores de archivos sin detener servicios.

### Componentes VSS

| Componente | Descripción |
|---|---|
| **Provider** | Hardware o software que almacena las copias shadow |
| **Requestor** | Aplicación que solicita VSS (backup, antivirus) |
| **Writer** | Aplicación que prepara datos para VSS (SQL, Exchange) |

### Tipos de shadow copies

- **VSS Shadow Copies** — Copias de volúmenes completos (solo OS)
- **App-aware** — Snapshots consistentes a nivel de aplicación (SQL, Exchange)

### Límites de VSS

- Máximo 64 copias por volumen
- Espacio usado: configurable (default 10% del volumen)
- Antigüedad: mantiene copias hasta agotar espacio`,

    steps: [
      {
        title: 'Verificar el estado del servicio VSS',
        explanation: `Comprobamos que el servicio Volume Shadow Copy (VSS) está ejecutándose.`,
        command: 'Get-Service VSS | Select-Object Name, Status, StartType; Get-Service SDRSVC | Select-Object Name, Status, StartType',
        expectedOutput: `Name   Status  StartType
----   ------  ---------
VSS    Running Manual
SDRSVC Running Automatic`,
        hint: 'Usa Get-Service VSS y Get-Service SDRSVC para shadow copy service.',
      },
      {
        title: 'Habilitar Shadow Copies en una partición',
        explanation: `Habilitamos Shadow Copies en una partición (ej. C: o un volumen de datos). Se almacenan en una carpeta oculta \`~$RECYCLE.BIN\` o partición dedicada.`,
        command: `# Habilitar Shadow Copies
vssadmin enable shadowstorage /for=C: /on=C: /maxsize=10%

# Verificar
vssadmin list shadowstorage`,
        expectedOutput: `Volume Shadow Copy Storage area association:
For Volume: (C:)\\
Shadow Copy Storage Volume: (C:)\\
Used Shadow Copy Storage Space: 10%
Allocated Shadow Copy Storage Space: 10%
Maximum Shadow Copy Storage Space: 10% (of the volume)`,
        hint: 'Usa vssadmin enable shadowstorage /for=C: /on=C: /maxsize=10%.',
      },
      {
        title: 'Ver copias shadow existentes',
        explanation: `Listamos todos los snapshots VSS actuales del volumen.`,
        command: 'vssadmin list shadows /for=C:',
        expectedOutput: `Contents of shadow copy set ID: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
   Contained 3 shadow copies at creation time: 2024-01-01 09:00:00
   Shadow Copy ID: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
   Original Volume: (C:)\\
   Shadow Copy Volume: \\?\\GLOBALROOT\\Device\\HarddiskVolumeShadowCopy1
   Original Volume Name: C:\\
   Server has changed.
   Shadow Copy Size: 512 MB`,
        hint: 'Usa vssadmin list shadows /for=C: para listar snapshots del volumen C:.',
      },
      {
        title: 'Acceder a Previous Versions desde el cliente',
        explanation: `Un usuario puede restaurar versiones anteriores de archivos desde el explorador sin intervención del admin. Click derecho > Propiedades > Previous Versions.`,
        command: `# En el cliente Windows, desde File Explorer:
# 1. Click derecho en archivo o carpeta
# 2. Properties > Previous Versions
# 3. Seleccionar versión anterior
# 4. "Restore" o "Copy" para recuperar

# PowerShell: listar versiones anteriores
Get-Item "C:\\Users\\jgarcia\\Documents\\documento.txt" | Select-Object VersionCount`,
        expectedOutput: `VersionCount
------------
           3`,
        hint: 'Los usuarios pueden restaurar manualmente desde Previous Versions. Los admins pueden script esto con wbadmin o VSS API.',
      },
      {
        title: 'Crear snapshot manual con vssadmin',
        explanation: `Creamos un snapshot VSS manualmente antes de cambios importantes.`,
        command: `# Crear snapshot
vssadmin create shadow /for=C:

# Ver snapshots creados
vssadmin list shadows /for=C: | Select-String "Shadow Copy ID" -A 5`,
        expectedOutput: `Shadow Copy ID: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}`,
        hint: 'Usa vssadmin create shadow /for=C: para crear un snapshot manual.',
      },
      {
        title: 'Eliminar snapshots antiguos',
        explanation: `Cuando VSS alcanza el límite de espacio, elimina automáticamente los snapshots más antiguos. Podemos forzar esto manualmente.`,
        command: `# Listar snapshots del volumen
vssadmin list shadows /for=C:

# Eliminar el snapshot más antiguo
vssadmin delete shadows /for=C: /oldest /confirm

# Verificar espacio después
vssadmin list shadowstorage`,
        expectedOutput: `(Snapshots eliminados)`,
        hint: 'Usa vssadmin delete shadows /oldest /confirm para eliminar el más antiguo.',
      },
    ],
  },

  {
    id: 'wbadmin-backup',
    moduleId: 'vss-backup',
    title: 'Backup completo con Windows Server Backup',
    description: 'Configura backups completos, estado del sistema, y recuperación granular con Windows Server Backup (wbadmin).',
    difficulty: 'intermediate',
    xp: 130,
    minutes: 45,
    objectives: [
      'Instalar Windows Server Backup',
      'Ejecutar backups completos y del estado del sistema',
      'Programar backups automáticos',
      'Recuperar archivos individuales desde backup',
      'Implementar estrategia 3-2-1 de backup',
    ],
    theory: `## Windows Server Backup (WSB)

WSB es la herramienta nativa de backup de Windows Server. Usa VSS para snapshots consistentes y soporta múltiples destinos (disco local, disco externo, red compartida).

### Tipos de backup

| Tipo | Contenido | Caso de uso |
|---|---|---|
| **Full** | Todos los datos del servidor | Backup semanal, basal |
| **System State** | AD, Registry, Sysvol, Certificados | AD recovery, DSRM |
| **BMR** (Bare Metal) | Partición de sistema + datos | Disaster recovery completo |

### Estrategia 3-2-1

- **3 copias** de datos
- **2 medios distintos** (disco + cinta, ej.)
- **1 offsite** (fuera de la oficina)

Ejemplo: 1 backup local + 1 backup en servidor remoto + 1 cinta en bóveda`,

    steps: [
      {
        title: 'Instalar Windows Server Backup',
        explanation: `Instalamos el rol Windows Server Backup que proporciona cmdlets wbadmin y la consola gráfica.`,
        command: 'Install-WindowsFeature Windows-Server-Backup; Get-WindowsFeature Windows-Server-Backup | Select-Object Name, InstallState',
        expectedOutput: `Name                     InstallState
----                     ----------
Windows-Server-Backup    Installed`,
        hint: 'Usa Install-WindowsFeature Windows-Server-Backup.',
      },
      {
        title: 'Ejecutar backup completo del servidor',
        explanation: `Creamos un backup completo de todos los volúmenes críticos (C: en este caso). El backup se almacena en una unidad externa o compartida.`,
        command: `# Backup completo a unidad externa E:
wbadmin start backup -backuptarget:E: -include:C: -allcritical -quiet

# Ver progreso
wbadmin get status`,
        expectedOutput: `Backup of volume C: has successfully completed.
The backup started at 01/01/2024 09:00 and finished at 01/01/2024 09:15.
Summary of the backup:
   Volumes: C:
   Version identifier: 01/01/2024-090000
   Backup Size: 25.3 GB`,
        hint: 'Usa wbadmin start backup -backuptarget:[unidad] -include:C: -allcritical.',
      },
      {
        title: 'Backup del estado del sistema (AD, Registry)',
        explanation: `Creamos un backup solo del estado del sistema (Active Directory, Registry, Sysvol, certificados). Necesario para AD recovery en DSRM.`,
        command: `wbadmin start systemstatebackup -backuptarget:E: -quiet

# Ver versiones disponibles
wbadmin get versions`,
        expectedOutput: `Backup to the system state has successfully completed.
You can recover the system state...`,
        hint: 'Usa wbadmin start systemstatebackup -backuptarget:[unidad].',
      },
      {
        title: 'Programar backup automático diario',
        explanation: `Configuramos wbadmin para ejecutar backups automáticos cada madrugada sin intervención manual.`,
        command: `# Programar backup diario a las 02:00 AM
wbadmin enable backup -addtarget:E: -schedule:02:00 -include:C: -allcritical

# Verificar programación
wbadmin get schedule`,
        expectedOutput: `Backup Schedule
   Backup scheduled on the following days and times:
      Monday through Sunday at 02:00.`,
        hint: 'Usa wbadmin enable backup -addtarget -schedule:HH:MM.',
      },
      {
        title: 'Verificar backups disponibles',
        explanation: `Listamos todos los backups realizados, incluyendo fecha, versión y tamaño.`,
        command: `wbadmin get versions

# Información detallada de un backup específico
wbadmin get version -version:01/01/2024-020000`,
        expectedOutput: `Backup versions available:
Backup ID: 01/01/2024-020000
Backup Time: 01/01/2024 02:00
Backup Size: 25.3 GB
Backup Target: E:\\WindowsImageBackup
Version: 1

Backup of volume C: contains these items:
  C: (NTFS)`,
        hint: 'Usa wbadmin get versions. Luego wbadmin get version -version:VERSIONID para detalles.',
      },
      {
        title: 'Recuperar archivo individual desde backup',
        explanation: `Extraemos un archivo específico del backup sin restaurar todo el servidor. Útil para recuperación granular.`,
        command: `# Recuperar archivo "config.txt" del backup
wbadmin start recovery -version:01/01/2024-020000 \\
  -itemType:File \\
  -itemLocation:"C:\\Config\\config.txt" \\
  -recoveryTarget:D:\\Recovery

# Verificar archivo recuperado
Get-Item D:\\Recovery\\config.txt`,
        expectedOutput: `    Directory: D:\\Recovery

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        01/01/2024  02:00           1024   config.txt`,
        hint: 'Usa wbadmin start recovery con -itemType:File y -itemLocation.',
      },
      {
        title: 'Recuperar estado del sistema en DSRM (AD Recovery)',
        explanation: `En caso de desastre de AD, reiniciamos el DC en Directory Services Restore Mode (DSRM) y restauramos el estado del sistema desde backup. Esto recupera AD completamente.`,
        command: `# Primero reiniciar en DSRM (manual: F8 al boot o bcdedit)
# bcdedit /set safeboot dsrepair

# Una vez en DSRM:
wbadmin start systemstaterecovery -version:01/01/2024-020000 -quiet

# Reiniciar en modo normal
# bcdedit /deletevalue safeboot

Write-Host "Estado del sistema recuperado. Reinicia en modo normal."`,
        expectedOutput: `Estado del sistema recuperado. Reinicia en modo normal.`,
        hint: 'DSRM recovery es manual. Requiere reinicio en DSRM, luego wbadmin start systemstaterecovery.',
      },
      {
        title: 'Implementar estrategia 3-2-1 de backup',
        explanation: `Configuramos múltiples destinos de backup para cumplir la regla 3-2-1: 3 copias, 2 medios, 1 offsite.`,
        command: `# 1. Backup local en disco externo (Copia 1)
wbadmin start backup -backuptarget:E: -include:C: -allcritical -quiet

# 2. Backup en servidor remoto (Copia 2, otro medio)
wbadmin start backup -backuptarget:"\\\\BACKUP-SERVER\\backups\\SERVER01" -include:C: -allcritical -quiet

# 3. Backup a cinta (Copia 3, offsite)
# wbadmin start backup -backuptarget:Tape -include:C: -allcritical -quiet

Write-Host "Estrategia 3-2-1 configurada:"
Write-Host "Copia 1: Disco externo local (E:)"
Write-Host "Copia 2: Servidor de backup remoto (\\BACKUP-SERVER)"
Write-Host "Copia 3: Cinta (Offsite)"`,
        expectedOutput: `Estrategia 3-2-1 configurada:
Copia 1: Disco externo local (E:)
Copia 2: Servidor de backup remoto (\BACKUP-SERVER)
Copia 3: Cinta (Offsite)`,
        hint: 'Configura múltiples -backuptarget en wbadmin start backup. Uno local, uno remoto, uno offsite.',
      },
    ],
  },

];
