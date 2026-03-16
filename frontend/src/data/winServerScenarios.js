// ── Windows Server Lab Scenarios ─────────────────────────────────────────────
import { WIN_MODULES_2, WIN_SCENARIOS_2 } from './winServerData2';
import { WIN_MODULES_3, WIN_SCENARIOS_3 } from './winServerData3';
import { WIN_MODULE_TROUBLESHOOT, WIN_SCENARIOS_TROUBLESHOOT } from './winServerTroubleshoot';

const WIN_MODULES_BASE = [
  { id: 'ad',       label: 'Active Directory',  icon: '🏛️', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    desc: 'AD DS, usuarios, grupos, OUs, permisos y delegación' },
  { id: 'gpo',      label: 'Group Policy',      icon: '📋', color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  desc: 'GPOs, directivas de seguridad, scripts de inicio' },
  { id: 'dns_dhcp', label: 'DNS / DHCP',        icon: '🌐', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Zonas, registros, ámbitos, reservas y troubleshooting' },
  { id: 'hyperv',   label: 'Hyper-V',           icon: '💻', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  desc: 'VMs, switches virtuales, snapshots, redes' },
  { id: 'iis',      label: 'IIS / Web',         icon: '🌍', color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    desc: 'Sitios web, HTTPS, App Pools, virtual dirs' },
  { id: 'ps',       label: 'PowerShell',        icon: '⚡', color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     desc: 'Scripting, automatización, remoting, módulos' },
  { id: 'fs',       label: 'File Services',     icon: '📁', color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  desc: 'NTFS, carpetas compartidas, DFS, cuotas' },
  { id: 'security', label: 'Seguridad',         icon: '🔒', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     desc: 'Firewall, auditoría, BitLocker, Fine-Grained PSP' },
];

export const WIN_MODULES = [
  ...WIN_MODULES_BASE,
  ...WIN_MODULES_2,
  ...WIN_MODULES_3,
  WIN_MODULE_TROUBLESHOOT,
];

// Alias para compatibilidad
export const WIN_SUBJECTS = WIN_MODULES;

const WIN_SCENARIOS_BASE = [

  // ══════════════════════════════════════════════════════
  // MÓDULO 1 — ACTIVE DIRECTORY
  // ══════════════════════════════════════════════════════

  {
    id: 'ad-install',
    subject: 'ad',
    module_order: 1,
    title: 'Instalación de AD DS y promoción a DC',
    description: 'Instala el rol Active Directory Domain Services y promueve el servidor a Controlador de Dominio creando un nuevo bosque.',
    difficulty: 'Básico',
    xp: 40,
    estimatedMinutes: 20,
    prerequisites: [],
    objectives: [
      'Instalar el rol AD DS con PowerShell',
      'Promover el servidor a DC con un nuevo bosque',
      'Verificar que el dominio está operativo',
    ],
    steps: [
      {
        id: 1,
        title: 'Verificar requisitos previos',
        explanation: `Antes de instalar AD DS comprueba que el servidor tiene **IP estática** y que el nombre de host es correcto. Cambiar el nombre después de promoverlo a DC requiere rebajar el dominio.`,
        keyCommand: `Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway`,
        command: `# Verificar configuración de red
Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway

# Verificar nombre del servidor
$env:COMPUTERNAME

# Asignar IP estática si es necesario
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.10 -PrefixLength 24 -DefaultGateway 192.168.1.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1`,
        expectedOutput: `InterfaceAlias  IPv4Address    IPv4DefaultGateway
--------------  -----------    ------------------
Ethernet        192.168.1.10   192.168.1.1

DC01`,
        hint: 'AD DS requiere IP estática. Si el servidor obtiene IP por DHCP, el dominio puede dejar de funcionar cuando cambie la IP.',
      },
      {
        id: 2,
        title: 'Instalar el rol AD DS',
        explanation: `\`Install-WindowsFeature\` instala el rol sin reinicio. El parámetro \`-IncludeManagementTools\` añade el módulo PowerShell \`ActiveDirectory\` y las herramientas RSAT.`,
        command: `Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools`,
        expectedOutput: `Success Restart Needed Exit Code  Feature Result
------- -------------- --------- --------------
True    No             Success   {Active Directory Domain Services, ...}`,
        hint: 'Si da error "Feature not found", ejecuta: Install-WindowsFeature -Name RSAT-AD-PowerShell primero.',
      },
      {
        id: 3,
        title: 'Promover el servidor a Controlador de Dominio',
        explanation: `\`Install-ADDSForest\` crea un **nuevo bosque** AD. Es el comando más importante — convierte el servidor en DC.

**Parámetros clave:**
- \`-DomainName\`: FQDN del dominio (usa \`.local\` en laboratorio)
- \`-SafeModeAdministratorPassword\`: contraseña DSRM (Directory Services Restore Mode)
- \`-InstallDNS:$true\`: instala automáticamente el rol DNS
- \`-Force\`: omite confirmaciones interactivas`,
        keyCommand: `Install-ADDSForest -DomainName "empresa.local" -DomainNetbiosName "EMPRESA" -DomainMode "WinThreshold" -ForestMode "WinThreshold" -InstallDns:$true -SafeModeAdministratorPassword $dsrmPass -Force`,
        command: `$dsrmPass = ConvertTo-SecureString "P@ssw0rd_DSRM!" -AsPlainText -Force

Install-ADDSForest \`
    -DomainName "empresa.local" \`
    -DomainNetbiosName "EMPRESA" \`
    -DomainMode "WinThreshold" \`
    -ForestMode "WinThreshold" \`
    -InstallDns:$true \`
    -SafeModeAdministratorPassword $dsrmPass \`
    -Force`,
        expectedOutput: `The target server will be configured as a domain controller and restarted.
Performing this operation now...

DomainMode         : WinThreshold
DomainName         : empresa.local
DomainNetBIOSName  : EMPRESA`,
        hint: 'El servidor se reiniciará automáticamente. Tras el reinicio inicia sesión con EMPRESA\\Administrator.',
      },
      {
        id: 4,
        title: 'Verificar el dominio y los servicios AD',
        explanation: `Tras el reinicio comprobamos que el DC está operativo verificando el dominio y los servicios críticos de AD.`,
        keyCommand: `Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator, InfrastructureMaster`,
        command: `# Información del dominio
Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator, InfrastructureMaster

# Estado de servicios críticos de AD
$services = 'ADWS','DNS','Netlogon','KDC','NTDS','W32Time'
foreach ($svc in $services) {
    $s = Get-Service $svc -ErrorAction SilentlyContinue
    $status = if ($s.Status -eq 'Running') { '[OK]  ' } else { '[FAIL]' }
    Write-Host "$status $svc" -ForegroundColor $(if($s.Status -eq 'Running'){'Green'}else{'Red'})
}`,
        expectedOutput: `DNSRoot        : empresa.local
DomainMode     : Windows2016Domain
PDCEmulator    : DC01.empresa.local
InfrastructureMaster : DC01.empresa.local

[OK]   ADWS
[OK]   DNS
[OK]   Netlogon
[OK]   KDC
[OK]   NTDS
[OK]   W32Time`,
        hint: 'Si algún servicio falla, revisa el Visor de Eventos → Registros de Windows → Sistema. Los errores de KDC o Netlogon impiden el inicio de sesión de dominio.',
      },
    ],
    theory: `## Active Directory Domain Services (AD DS)

Active Directory es el **servicio de directorio** de Microsoft. Centraliza autenticación, autorización y administración de objetos (usuarios, equipos, grupos) en redes Windows.

### Jerarquía lógica
\`\`\`
Bosque (Forest)
  └── Dominio (Domain)  empresa.local
        └── Árbol de OUs
              ├── OU=Departamentos
              │     ├── OU=IT
              │     └── OU=RRHH
              └── OU=Servidores
\`\`\`

### Roles FSMO (Flexible Single Master Operations)
| Rol | Ámbito | Función |
|-----|--------|---------|
| Schema Master | Bosque | Controla cambios en el esquema AD |
| Domain Naming Master | Bosque | Gestiona nombres de dominio |
| PDC Emulator | Dominio | Sincronización de hora, cambios de contraseña |
| RID Master | Dominio | Asigna bloques de RIDs |
| Infrastructure Master | Dominio | Actualiza referencias entre dominios |

### Puertos necesarios en el firewall
| Puerto | Protocolo | Servicio |
|--------|-----------|---------|
| 389 | TCP/UDP | LDAP |
| 636 | TCP | LDAPS (seguro) |
| 3268 | TCP | Global Catalog |
| 88 | TCP/UDP | Kerberos |
| 53 | TCP/UDP | DNS |
| 445 | TCP | SMB (SYSVOL/NETLOGON) |`,
  },

  {
    id: 'ad-ou-design',
    subject: 'ad',
    module_order: 2,
    title: 'Diseño de estructura OU y delegación',
    description: 'Crea una jerarquía de Unidades Organizativas para una empresa real y delega control administrativo a técnicos de helpdesk.',
    difficulty: 'Básico',
    xp: 35,
    estimatedMinutes: 15,
    prerequisites: ['ad-install'],
    objectives: [
      'Crear una estructura OU por departamentos',
      'Mover objetos a sus OUs correctas',
      'Delegar control de restablecimiento de contraseñas al helpdesk',
    ],
    steps: [
      {
        id: 1,
        title: 'Crear estructura OU jerárquica',
        explanation: `Las OUs organizan objetos AD y permiten aplicar GPOs específicas. Una buena estructura **refleja la organización real** de la empresa.`,
        keyCommand: `New-ADOrganizationalUnit -Name "Empresa" -Path "DC=empresa,DC=local" -ProtectedFromAccidentalDeletion $true`,
        command: `# Estructura de OUs para empresa tipo ASIR
$base = "DC=empresa,DC=local"

# OUs de primer nivel
foreach ($ou in @("Empresa","Servidores","Equipos_Red")) {
    New-ADOrganizationalUnit -Name $ou -Path $base -ProtectedFromAccidentalDeletion $true
}

# Sub-OUs de departamentos
$depts = @("IT","RRHH","Contabilidad","Direccion","Alumnos")
foreach ($dept in $depts) {
    New-ADOrganizationalUnit -Name $dept \`
        -Path "OU=Empresa,$base" \`
        -ProtectedFromAccidentalDeletion $true
    # Sub-OU de Equipos dentro de cada departamento
    New-ADOrganizationalUnit -Name "Equipos" \`
        -Path "OU=$dept,OU=Empresa,$base"
}

Write-Host "Estructura OU creada correctamente" -ForegroundColor Green`,
        expectedOutput: `Estructura OU creada correctamente`,
        hint: '-ProtectedFromAccidentalDeletion $true evita borrar la OU por error desde el GUI. Para borrarla hay que desmarcarlo primero.',
      },
      {
        id: 2,
        title: 'Crear usuarios y moverlos a sus OUs',
        explanation: `Creamos usuarios de ejemplo y los movemos a sus OUs. \`Move-ADObject\` permite reubicar cualquier objeto AD.`,
        keyCommand: `New-ADUser -Name "Carlos Técnico" -SamAccountName "ctecnico" -Path "OU=IT,OU=Empresa,DC=empresa,DC=local" -AccountPassword $pass -Enabled $true`,
        command: `$base = "DC=empresa,DC=local"
$pass = ConvertTo-SecureString "Temporal@2024!" -AsPlainText -Force

# Crear usuario IT
New-ADUser -Name "Carlos Técnico" \`
    -SamAccountName "ctecnico" \`
    -UserPrincipalName "ctecnico@empresa.local" \`
    -Path "OU=IT,OU=Empresa,$base" \`
    -AccountPassword $pass \`
    -Enabled $true \`
    -ChangePasswordAtLogon $true

# Crear usuario RRHH
New-ADUser -Name "Ana RRHH" \`
    -SamAccountName "arrhh" \`
    -Path "OU=RRHH,OU=Empresa,$base" \`
    -AccountPassword $pass \`
    -Enabled $true

# Verificar
Get-ADUser -Filter * -SearchBase "OU=Empresa,$base" |
    Select-Object Name, DistinguishedName`,
        expectedOutput: `Name           DistinguishedName
----           -----------------
Carlos Técnico CN=Carlos Técnico,OU=IT,OU=Empresa,DC=empresa,DC=local
Ana RRHH       CN=Ana RRHH,OU=RRHH,OU=Empresa,DC=empresa,DC=local`,
        hint: '-ChangePasswordAtLogon $true obliga al usuario a cambiar la contraseña en el primer inicio de sesión. Buena práctica de seguridad.',
      },
      {
        id: 3,
        title: 'Delegar control al Helpdesk',
        explanation: `La **delegación de control** permite que administradores de nivel inferior (helpdesk) gestionen objetos específicos sin ser Domain Admins.

Usamos \`dsacls.exe\` para asignar permisos sobre una OU concreta.`,
        keyCommand: `New-ADGroup -Name "GRP_Helpdesk" -GroupScope Global -GroupCategory Security -Path "OU=IT,OU=Empresa,DC=empresa,DC=local"`,
        command: `# Crear grupo de Helpdesk
New-ADGroup -Name "GRP_Helpdesk" \`
    -GroupScope Global \`
    -GroupCategory Security \`
    -Path "OU=IT,OU=Empresa,DC=empresa,DC=local"

Add-ADGroupMember -Identity "GRP_Helpdesk" -Members "ctecnico"

# Delegar: GRP_Helpdesk puede resetear contraseñas en OU=Empresa
$ouDN = "OU=Empresa,DC=empresa,DC=local"
$group = (Get-ADGroup "GRP_Helpdesk").SID

# Permiso: Reset Password
dsacls "$ouDN" /G "EMPRESA\\GRP_Helpdesk:CA;Reset Password;user" /I:S

Write-Host "Delegación completada. Helpdesk puede resetear contraseñas en OU=Empresa"`,
        expectedOutput: `Delegación completada. Helpdesk puede resetear contraseñas en OU=Empresa`,
        hint: 'La sintaxis dsacls: /G = Grant, CA = Control Access, /I:S = Inherit to sub-objects. También puedes usar el GUI: ADUC → clic derecho OU → Delegar control.',
      },
    ],
    theory: `## Diseño de OUs: mejores prácticas

### Criterios de diseño
- **Por geografía** si la empresa tiene sedes distintas con administradores locales
- **Por departamento** para empresas medianas (lo más común)
- **Por función** (Usuarios, Equipos, Servidores, Grupos) para aplicar GPOs granulares

### Regla del pulgar
> Crea OUs para aplicar GPOs diferentes o para delegar administración. No crees OUs solo para organizar visualmente.

### Delegación de control
La delegación permite el modelo de **administración por niveles**:
| Nivel | Rol | Puede hacer |
|-------|-----|-------------|
| Tier 0 | Domain Admins | Todo |
| Tier 1 | Server Admins | Administrar servidores miembro |
| Tier 2 | Helpdesk | Reset passwords, desbloquear cuentas |`,
  },

  {
    id: 'ad-users-bulk',
    subject: 'ad',
    module_order: 3,
    title: 'Creación masiva de usuarios desde CSV',
    description: 'Automatiza la creación de 50+ usuarios importando un fichero CSV con PowerShell. Técnica esencial para el primer día de curso en un instituto.',
    difficulty: 'Intermedio',
    xp: 50,
    estimatedMinutes: 25,
    prerequisites: ['ad-ou-design'],
    objectives: [
      'Preparar un CSV de usuarios con los campos necesarios',
      'Importar usuarios masivamente con gestión de errores',
      'Generar informe de usuarios creados',
    ],
    steps: [
      {
        id: 1,
        title: 'Crear el fichero CSV de usuarios',
        explanation: `El CSV define todos los atributos de los usuarios. Usaremos \`Export-Csv\` para generar un CSV de ejemplo que sirva como plantilla.`,
        keyCommand: `$usuarios | Export-Csv -Path "C:\\Temp\\usuarios.csv" -NoTypeInformation -Encoding UTF8`,
        command: `# Generar CSV de ejemplo con 5 alumnos
$usuarios = @(
    [PSCustomObject]@{ Nombre="Juan García"; Login="jgarcia"; Dept="Alumnos"; Email="jgarcia@empresa.local"; Grupo="GRP_Alumnos_2DAW" },
    [PSCustomObject]@{ Nombre="María López"; Login="mlopez"; Dept="Alumnos"; Email="mlopez@empresa.local"; Grupo="GRP_Alumnos_2DAW" },
    [PSCustomObject]@{ Nombre="Pedro Ruiz"; Login="pruiz"; Dept="Alumnos"; Email="pruiz@empresa.local"; Grupo="GRP_Alumnos_ASIR" },
    [PSCustomObject]@{ Nombre="Laura Sanz"; Login="lsanz"; Dept="IT"; Email="lsanz@empresa.local"; Grupo="GRP_Profesores" },
    [PSCustomObject]@{ Nombre="Marcos Vega"; Login="mvega"; Dept="IT"; Email="mvega@empresa.local"; Grupo="GRP_Profesores" }
)

$usuarios | Export-Csv -Path "C:\\Temp\\usuarios.csv" -NoTypeInformation -Encoding UTF8
Write-Host "CSV generado en C:\\Temp\\usuarios.csv"
Import-Csv "C:\\Temp\\usuarios.csv" | Format-Table`,
        expectedOutput: `CSV generado en C:\\Temp\\usuarios.csv

Nombre       Login   Dept    Email                    Grupo
------       -----   ----    -----                    -----
Juan García  jgarcia Alumnos jgarcia@empresa.local    GRP_Alumnos_2DAW
María López  mlopez  Alumnos mlopez@empresa.local     GRP_Alumnos_2DAW
...`,
        hint: '-NoTypeInformation elimina la línea de tipo .NET. -Encoding UTF8 es vital para nombres con acentos (García, López...).',
      },
      {
        id: 2,
        title: 'Script de importación masiva con gestión de errores',
        explanation: `El script itera el CSV y crea cada usuario. Usamos \`try/catch\` para continuar aunque un usuario falle y generamos un log de resultados.`,
        keyCommand: `Import-Csv "C:\\Temp\\usuarios.csv" -Encoding UTF8 | ForEach-Object { New-ADUser -Name $_.Nombre -SamAccountName $_.Login -Path "OU=IT,OU=Empresa,DC=empresa,DC=local" -AccountPassword $defaultPass -Enabled $true }`,
        command: `$base = "DC=empresa,DC=local"
$defaultPass = ConvertTo-SecureString "Cambiar@2024!" -AsPlainText -Force
$log = @()

Import-Csv "C:\\Temp\\usuarios.csv" -Encoding UTF8 | ForEach-Object {
    try {
        $ouPath = "OU=$($_.Dept),OU=Empresa,$base"

        New-ADUser \`
            -Name $_.Nombre \`
            -SamAccountName $_.Login \`
            -UserPrincipalName $_.Email \`
            -EmailAddress $_.Email \`
            -Path $ouPath \`
            -AccountPassword $defaultPass \`
            -Enabled $true \`
            -ChangePasswordAtLogon $true \`
            -ErrorAction Stop

        # Añadir al grupo
        Add-ADGroupMember -Identity $_.Grupo -Members $_.Login -ErrorAction SilentlyContinue

        $log += [PSCustomObject]@{ Usuario=$_.Login; Estado="OK"; Error="" }
        Write-Host "[OK] $($_.Login)" -ForegroundColor Green

    } catch {
        $log += [PSCustomObject]@{ Usuario=$_.Login; Estado="ERROR"; Error=$_.Exception.Message }
        Write-Host "[ERROR] $($_.Login): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Exportar log
$log | Export-Csv "C:\\Temp\\log_creacion.csv" -NoTypeInformation
Write-Host "\n--- Resumen ---"
Write-Host "OK: $(($log | Where Estado -eq 'OK').Count)"
Write-Host "Errores: $(($log | Where Estado -eq 'ERROR').Count)"`,
        expectedOutput: `[OK] jgarcia
[OK] mlopez
[OK] pruiz
[OK] lsanz
[OK] mvega

--- Resumen ---
OK: 5
Errores: 0`,
        hint: 'ForEach-Object procesa uno a uno. Si usas ForEach-Object -Parallel (PS 7+) sería más rápido pero más difícil de depurar errores.',
      },
      {
        id: 3,
        title: 'Verificar y generar informe HTML',
        explanation: `\`ConvertTo-Html\` genera un informe HTML profesional de todos los usuarios creados. Útil para entregar al director del instituto.`,
        keyCommand: `Get-ADUser -Filter * -Properties DisplayName, Department, Enabled -SearchBase "OU=Empresa,DC=empresa,DC=local" | Select-Object Name, SamAccountName, Department, Enabled | ConvertTo-Html | Out-File "C:\\Temp\\informe_usuarios.html"`,
        command: `# Informe de todos los usuarios en el dominio
Get-ADUser -Filter * \`
    -Properties DisplayName, EmailAddress, Department, Enabled, Created, LastLogonDate \`
    -SearchBase "OU=Empresa,DC=empresa,DC=local" |
Select-Object Name, SamAccountName, EmailAddress, Department, Enabled,
    @{N='Creado';E={$_.Created.ToString('dd/MM/yyyy')}},
    @{N='UltimoAcceso';E={if($_.LastLogonDate){$_.LastLogonDate.ToString('dd/MM/yyyy')}else{'Nunca'}}} |
ConvertTo-Html -Title "Informe Usuarios AD" \`
    -PreContent "<h1>Usuarios de Active Directory</h1><p>Generado: $(Get-Date -Format 'dd/MM/yyyy HH:mm')</p>" |
Out-File "C:\\Temp\\informe_usuarios.html"

Write-Host "Informe generado: C:\\Temp\\informe_usuarios.html"`,
        expectedOutput: `Informe generado: C:\\Temp\\informe_usuarios.html`,
        hint: 'El fichero HTML se puede abrir directamente en el navegador o enviar por correo. Para más profesionalidad, añade un parámetro -CssUri con estilos CSS.',
      },
    ],
    theory: `## Automatización de AD con PowerShell

### Módulo ActiveDirectory
El módulo \`ActiveDirectory\` se instala con las RSAT-AD-Tools. Contiene más de 150 cmdlets.

### Cmdlets más usados en producción
\`\`\`powershell
# Búsqueda avanzada
Get-ADUser -LDAPFilter "(department=IT)" -Properties *

# Cuentas sin iniciar sesión en 90 días
$cutoff = (Get-Date).AddDays(-90)
Get-ADUser -Filter {LastLogonDate -lt $cutoff -and Enabled -eq $true} \`
    -Properties LastLogonDate

# Deshabilitar usuario y moverlo a OU de bajas
Disable-ADAccount -Identity "jgarcia"
Move-ADObject -Identity "CN=Juan García,OU=IT,..." \`
    -TargetPath "OU=Bajas,DC=empresa,DC=local"
\`\`\``,
  },

  {
    id: 'ad-groups-permissions',
    subject: 'ad',
    module_order: 4,
    title: 'Estrategia AGDLP para permisos de recursos',
    description: 'Implementa la estrategia AGDLP (Account → Global → Domain Local → Permission) para gestionar el acceso a carpetas compartidas de forma escalable.',
    difficulty: 'Intermedio',
    xp: 45,
    estimatedMinutes: 20,
    prerequisites: ['ad-users-bulk'],
    objectives: [
      'Entender y aplicar la estrategia AGDLP',
      'Crear la jerarquía de grupos correcta',
      'Asignar permisos NTFS usando grupos Domain Local',
    ],
    steps: [
      {
        id: 1,
        title: 'Crear grupos según estrategia AGDLP',
        explanation: `**AGDLP** es la estrategia de Microsoft para gestionar permisos de forma escalable:
- **A**ccount → usuario
- **G**lobal group → agrupa usuarios del mismo departamento
- **D**omain **L**ocal group → se asigna sobre el recurso
- **P**ermission → el permiso NTFS real

Esta separación permite añadir departamentos enteros a recursos con un solo cambio.`,
        keyCommand: `New-ADGroup -Name "GG_IT_Tecnicos" -GroupScope Global -Path "OU=IT,OU=Empresa,DC=empresa,DC=local"`,
        command: `$base = "DC=empresa,DC=local"

# Grupos Globales (por departamento/función)
New-ADGroup -Name "GG_IT_Tecnicos"   -GroupScope Global -Path "OU=IT,OU=Empresa,$base"
New-ADGroup -Name "GG_IT_Admins"     -GroupScope Global -Path "OU=IT,OU=Empresa,$base"
New-ADGroup -Name "GG_RRHH_Usuarios" -GroupScope Global -Path "OU=RRHH,OU=Empresa,$base"

# Grupos Domain Local (por recurso + permiso)
New-ADGroup -Name "DL_Proyectos_RO"  -GroupScope DomainLocal -Path "OU=Empresa,$base"
New-ADGroup -Name "DL_Proyectos_RW"  -GroupScope DomainLocal -Path "OU=Empresa,$base"
New-ADGroup -Name "DL_RRHH_RW"       -GroupScope DomainLocal -Path "OU=Empresa,$base"

# Anidar: GG dentro de DL
Add-ADGroupMember -Identity "DL_Proyectos_RO" -Members "GG_IT_Tecnicos","GG_RRHH_Usuarios"
Add-ADGroupMember -Identity "DL_Proyectos_RW" -Members "GG_IT_Admins"
Add-ADGroupMember -Identity "DL_RRHH_RW"      -Members "GG_RRHH_Usuarios"

# Añadir usuario al grupo global (automáticamente hereda acceso)
Add-ADGroupMember -Identity "GG_IT_Tecnicos" -Members "ctecnico"

Write-Host "Estructura AGDLP creada" -ForegroundColor Green`,
        expectedOutput: `Estructura AGDLP creada`,
        hint: 'La clave de AGDLP: cuando entra un nuevo técnico IT, solo lo añades a GG_IT_Tecnicos y automáticamente hereda acceso de solo lectura a Proyectos. Sin tocar los permisos NTFS.',
      },
      {
        id: 2,
        title: 'Crear carpeta compartida y asignar permisos NTFS',
        explanation: `Creamos la carpeta compartida y aplicamos los permisos NTFS usando los grupos Domain Local. Los permisos de compartición los dejamos en "Everyone - Full Control" y controlamos el acceso solo con NTFS (buena práctica).`,
        keyCommand: `New-SmbShare -Name "Proyectos$" -Path "D:\\Datos\\Proyectos" -FullAccess "EMPRESA\\Domain Admins" -ChangeAccess "Everyone"`,
        command: `# Crear estructura de carpetas
New-Item -Path "D:\\Datos\\Proyectos" -ItemType Directory -Force
New-Item -Path "D:\\Datos\\RRHH"     -ItemType Directory -Force

# Compartir carpeta Proyectos
New-SmbShare -Name "Proyectos$" \`
    -Path "D:\\Datos\\Proyectos" \`
    -FullAccess "EMPRESA\\Domain Admins" \`
    -ChangeAccess "Everyone" \`
    -Description "Datos de proyectos (permisos por NTFS)"

# Permisos NTFS en Proyectos
$acl = Get-Acl "D:\\Datos\\Proyectos"

# Quitar herencia y limpiar permisos existentes
$acl.SetAccessRuleProtection($true, $false)

# RO para DL_Proyectos_RO
$rule1 = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "EMPRESA\\DL_Proyectos_RO", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")

# RW para DL_Proyectos_RW
$rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "EMPRESA\\DL_Proyectos_RW", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow")

$acl.AddAccessRule($rule1)
$acl.AddAccessRule($rule2)
Set-Acl -Path "D:\\Datos\\Proyectos" -AclObject $acl

Write-Host "Permisos NTFS aplicados correctamente"`,
        expectedOutput: `Permisos NTFS aplicados correctamente`,
        hint: 'El $ al final del nombre del share (Proyectos$) lo oculta en el Explorador de Windows. Los usuarios que conocen la ruta \\\\servidor\\Proyectos$ pueden acceder igualmente.',
      },
    ],
    theory: `## AGDLP: La estrategia de permisos de Microsoft

\`\`\`
Accounts → Global Groups → Domain Local Groups → Permissions
   👤           👥                  🔑                  📁
 ctecnico  GG_IT_Tecnicos    DL_Proyectos_RO      NTFS: Read
 mlopez    GG_RRHH          DL_Proyectos_RW      NTFS: Modify
\`\`\`

### Ventajas de AGDLP
- **Escalabilidad**: añadir 50 usuarios de RRHH = añadirlos a GG_RRHH, fin
- **Auditoría clara**: sabes exactamente quién tiene acceso a qué
- **Multi-dominio**: los GG pueden contener usuarios de dominios del bosque

### Tipos de grupos en AD
| Tipo | Scope | Puede contener | Se asigna en |
|------|-------|----------------|--------------|
| Global | Dominio | Cuentas y GG del mismo dominio | DL o recursos |
| Domain Local | Dominio | Cuentas, GG, Universal de cualquier dominio | Recursos del dominio |
| Universal | Bosque | Cuentas, GG, Universal de cualquier dominio | Recursos del bosque |`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 2 — GROUP POLICY
  // ══════════════════════════════════════════════════════

  {
    id: 'gpo-create',
    subject: 'gpo',
    module_order: 1,
    title: 'Crear y vincular GPOs',
    description: 'Crea GPOs con PowerShell, vincúlalas a OUs con diferentes prioridades y verifica su aplicación.',
    difficulty: 'Básico',
    xp: 40,
    estimatedMinutes: 20,
    prerequisites: [],
    objectives: [
      'Crear GPOs con New-GPO y New-GPLink',
      'Configurar prioridad y bloqueo de herencia',
      'Forzar actualización y verificar con gpresult',
    ],
    steps: [
      {
        id: 1,
        title: 'Crear GPOs de baseline',
        explanation: `Una **GPO de baseline** establece la configuración mínima de seguridad para todos los equipos. Es la primera GPO que se aplica en cualquier entorno empresarial.`,
        keyCommand: `New-GPO -Name "BASELINE_Seguridad_Equipos" -Comment "Configuración base de seguridad - todos los equipos"`,
        command: `# GPO de seguridad para todos los equipos del dominio
New-GPO -Name "BASELINE_Seguridad_Equipos" \`
    -Comment "Configuración base de seguridad - todos los equipos"

# GPO específica para alumnos
New-GPO -Name "ALUMNOS_Restricciones_UI" \`
    -Comment "Restringe el escritorio y Panel de Control para alumnos"

# Vincular baseline al dominio completo (afecta a todo)
New-GPLink -Name "BASELINE_Seguridad_Equipos" \`
    -Target "DC=empresa,DC=local" \`
    -LinkEnabled Yes \`
    -Enforced Yes

# Vincular GPO de alumnos solo a su OU
New-GPLink -Name "ALUMNOS_Restricciones_UI" \`
    -Target "OU=Alumnos,OU=Empresa,DC=empresa,DC=local" \`
    -LinkEnabled Yes

# Listar todas las GPOs del dominio
Get-GPO -All | Select-Object DisplayName, GpoStatus, ModificationTime | Sort-Object DisplayName`,
        expectedOutput: `DisplayName                     GpoStatus          ModificationTime
-----------                     ---------          ----------------
ALUMNOS_Restricciones_UI        AllSettingsEnabled 15/03/2024 10:00
BASELINE_Seguridad_Equipos      AllSettingsEnabled 15/03/2024 10:00
Default Domain Controllers Policy AllSettingsEnabled ...
Default Domain Policy           AllSettingsEnabled ...`,
        hint: '-Enforced Yes hace que la GPO no pueda ser bloqueada por OUs hijas. Úsalo solo para directivas de seguridad obligatorias.',
      },
      {
        id: 2,
        title: 'Configurar directivas de seguridad vía registro',
        explanation: `\`Set-GPRegistryValue\` es la forma más directa de configurar políticas que modifican el registro. Es equivalente a usar el Editor de GPO gráficamente.`,
        keyCommand: `Set-GPRegistryValue -Name "ALUMNOS_Restricciones_UI" -Key "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" -ValueName "NoControlPanel" -Type DWord -Value 1`,
        command: `# ── Restricciones para alumnos ──
$gpo = "ALUMNOS_Restricciones_UI"

# Bloquear Panel de Control y Configuración de Windows
Set-GPRegistryValue -Name $gpo \`
    -Key "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" \`
    -ValueName "NoControlPanel" -Type DWord -Value 1

# Deshabilitar CMD para alumnos
Set-GPRegistryValue -Name $gpo \`
    -Key "HKCU\\Software\\Policies\\Microsoft\\Windows\\System" \`
    -ValueName "DisableCMD" -Type DWord -Value 1

# ── Baseline de seguridad ──
$baseline = "BASELINE_Seguridad_Equipos"

# Deshabilitar autorun en todas las unidades
Set-GPRegistryValue -Name $baseline \`
    -Key "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" \`
    -ValueName "NoDriveTypeAutoRun" -Type DWord -Value 255

# Requerir ctrl+alt+del para iniciar sesión
Set-GPRegistryValue -Name $baseline \`
    -Key "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" \`
    -ValueName "DisableCAD" -Type DWord -Value 0

Write-Host "Directivas configuradas" -ForegroundColor Green`,
        expectedOutput: `Directivas configuradas`,
        hint: 'HKCU = configuración de usuario (se aplica al perfil). HKLM = configuración de equipo (se aplica al sistema). Recuerda que las GPOs de Configuración de Equipo requieren reinicio, las de Usuario solo cierre/apertura de sesión.',
      },
      {
        id: 3,
        title: 'Forzar actualización y verificar con gpresult',
        explanation: `\`gpresult\` genera el **Resultant Set of Policy (RSoP)**: te dice exactamente qué GPOs se están aplicando a un usuario/equipo específico y en qué orden.`,
        keyCommand: `Invoke-GPUpdate -Force -RandomDelayInMinutes 0`,
        command: `# Forzar actualización inmediata en el equipo local
Invoke-GPUpdate -Force -RandomDelayInMinutes 0

# Generar informe HTML del RSoP para el usuario actual
gpresult /H "C:\\Temp\\rsop_informe.html" /F

# Ver resumen rápido en consola
gpresult /R

# Ver GPOs aplicadas a un equipo/usuario remoto
Invoke-GPUpdate -Computer "PC-ALUMNO01" -Force
gpresult /S "PC-ALUMNO01" /USER "EMPRESA\\jgarcia" /R`,
        expectedOutput: `Updating policy...
User Policy update has completed successfully.
Computer Policy update has completed successfully.

RSOP data for EMPRESA\\jgarcia on PC-ALUMNO01 :
-------------------------------------------------
Applied GPOs:
    BASELINE_Seguridad_Equipos
    ALUMNOS_Restricciones_UI
    Default Domain Policy`,
        hint: 'gpresult /H genera un informe HTML muy visual. Ábrelo en el navegador para ver qué GPOs aplican y cuáles han sido bloqueadas o filtradas.',
      },
    ],
    theory: `## Group Policy: orden de aplicación y herencia

### Orden LSDOU (de menos a más prioridad)
1. **Local** — política local del equipo
2. **Site** — políticas del sitio AD
3. **Domain** — políticas del dominio raíz
4. **OU** — de la OU padre a la OU más específica

La última GPO aplicada "gana" (mayor prioridad en la lista = se aplica después).

### Herencia y bloqueo
| Opción | Efecto |
|--------|--------|
| **Enforced** (No Override) | Ninguna OU hija puede bloquear esta GPO |
| **Block Inheritance** | La OU ignora todas las GPOs del nivel superior (excepto las Enforced) |
| **Disabled link** | La GPO existe pero no se aplica en esa OU |

### Filtrado de seguridad
Por defecto, una GPO aplica a "Authenticated Users". Puedes cambiar esto para que solo aplique a un grupo específico:
\`\`\`powershell
# Solo aplicar a GG_IT_Tecnicos
Set-GPPermissions -Name "MiGPO" -PermissionLevel GpoApply \`
    -TargetName "GG_IT_Tecnicos" -TargetType Group
# Quitar de Authenticated Users
Set-GPPermissions -Name "MiGPO" -PermissionLevel None \`
    -TargetName "Authenticated Users" -TargetType Group
\`\`\``,
  },

  {
    id: 'gpo-security',
    subject: 'gpo',
    module_order: 2,
    title: 'Directiva de contraseñas y bloqueo de cuentas',
    description: 'Configura una política de contraseñas robusta para el dominio y una Fine-Grained Password Policy (FGPP) más estricta para administradores.',
    difficulty: 'Intermedio',
    xp: 45,
    estimatedMinutes: 20,
    prerequisites: ['gpo-create'],
    objectives: [
      'Configurar la directiva de contraseñas del dominio',
      'Crear una FGPP más estricta para administradores',
      'Configurar directiva de bloqueo de cuentas',
    ],
    steps: [
      {
        id: 1,
        title: 'Directiva de contraseñas del dominio',
        explanation: `La **Default Domain Policy** contiene la directiva de contraseñas que aplica a todos los usuarios del dominio. Solo puede haber una por dominio (salvo FGPPs).`,
        keyCommand: `Set-ADDefaultDomainPasswordPolicy -Identity "empresa.local" -MinPasswordLength 12 -PasswordHistoryCount 24 -MaxPasswordAge (New-TimeSpan -Days 90) -ComplexityEnabled $true`,
        command: `# Ver configuración actual
Get-ADDefaultDomainPasswordPolicy

# Configurar directiva de contraseñas robusta
Set-ADDefaultDomainPasswordPolicy \`
    -Identity "empresa.local" \`
    -MinPasswordLength 12 \`
    -PasswordHistoryCount 24 \`
    -MaxPasswordAge (New-TimeSpan -Days 90) \`
    -MinPasswordAge (New-TimeSpan -Days 1) \`
    -ComplexityEnabled $true \`
    -ReversibleEncryptionEnabled $false

Write-Host "Directiva actualizada:"
Get-ADDefaultDomainPasswordPolicy | Select-Object \`
    MinPasswordLength, ComplexityEnabled, MaxPasswordAge, PasswordHistoryCount`,
        expectedOutput: `MinPasswordLength : 12
ComplexityEnabled : True
MaxPasswordAge    : 90.00:00:00
PasswordHistoryCount : 24`,
        hint: 'ComplexityEnabled exige mayúsculas, minúsculas, números y símbolos. MaxPasswordAge 0 = la contraseña nunca expira.',
      },
      {
        id: 2,
        title: 'Fine-Grained Password Policy para administradores',
        explanation: `Las **FGPP** (Fine-Grained Password Policies) permiten contraseñas diferentes por grupo. Los administradores deben tener requisitos más estrictos.`,
        keyCommand: `New-ADFineGrainedPasswordPolicy -Name "PSO_Administradores" -Precedence 10 -MinPasswordLength 20 -PasswordHistoryCount 48 -MaxPasswordAge (New-TimeSpan -Days 60) -ComplexityEnabled $true -LockoutThreshold 3`,
        command: `# Crear PSO (Password Settings Object) para admins
New-ADFineGrainedPasswordPolicy \`
    -Name "PSO_Administradores" \`
    -DisplayName "Política de contraseñas para Administradores" \`
    -Precedence 10 \`
    -MinPasswordLength 20 \`
    -PasswordHistoryCount 48 \`
    -MaxPasswordAge (New-TimeSpan -Days 60) \`
    -MinPasswordAge (New-TimeSpan -Days 1) \`
    -ComplexityEnabled $true \`
    -LockoutThreshold 3 \`
    -LockoutDuration (New-TimeSpan -Minutes 30) \`
    -LockoutObservationWindow (New-TimeSpan -Minutes 30) \`
    -ReversibleEncryptionEnabled $false

# Aplicar el PSO al grupo de Domain Admins
Add-ADFineGrainedPasswordPolicySubject \`
    -Identity "PSO_Administradores" \`
    -Subjects "Domain Admins"

# Verificar qué PSO aplica a un usuario
Get-ADUserResultantPasswordPolicy -Identity "Administrator"`,
        expectedOutput: `MinPasswordLength    : 20
LockoutThreshold     : 3
LockoutDuration      : 00:30:00
Precedence           : 10
AppliesTo            : {CN=Domain Admins,...}`,
        hint: 'Precedence determina qué PSO "gana" si un usuario está en varios grupos con PSOs distintos. Menor número = mayor prioridad.',
      },
      {
        id: 3,
        title: 'Directiva de bloqueo y auditoría de cuentas',
        explanation: `Configuramos el bloqueo de cuentas para limitar ataques de fuerza bruta y activamos la auditoría de inicios de sesión para detectar intrusiones.`,
        keyCommand: `auditpol /set /subcategory:"Logon" /success:enable /failure:enable`,
        command: `# Configurar bloqueo de cuentas en Default Domain Policy
$gpo = Get-GPO "Default Domain Policy"

# Bloquear tras 5 intentos fallidos, desbloqueo manual
Set-GPRegistryValue -Name "Default Domain Policy" \`
    -Key "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Netlogon\\Parameters" \`
    -ValueName "MaximumPasswordAge" -Type DWord -Value 90

# Habilitar auditoría de inicios de sesión (éxito y fallo)
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Account Lockout" /failure:enable

# Ver eventos de bloqueo de cuenta (últimas 24h)
Get-WinEvent -FilterHashtable @{
    LogName   = 'Security'
    Id        = 4740  # Account locked out
    StartTime = (Get-Date).AddHours(-24)
} -ErrorAction SilentlyContinue |
Select-Object TimeCreated, Message | Format-List`,
        expectedOutput: `TimeCreated : 15/03/2024 09:15:23
Message     : A user account was locked out.
              Subject: Security ID: SYSTEM
              Account That Was Locked Out: jgarcia`,
        hint: 'El evento 4740 registra bloqueos. El 4625 registra intentos fallidos. El 4624 registra inicios de sesión exitosos. Monitoriza estos eventos con SIEM o scripts de alerta.',
      },
    ],
    theory: `## Seguridad de cuentas en Active Directory

### Política de contraseñas: recomendaciones NIST 2024
El NIST (National Institute of Standards and Technology) recomienda:
- Longitud mínima: **12 caracteres** (mejor 20+ para admins)
- **Sin rotación obligatoria** salvo compromiso (genera contraseñas débiles tipo "Enero2024!")
- Comprobar contra diccionarios de contraseñas comprometidas

### Eventos de seguridad clave
| ID Evento | Descripción |
|-----------|-------------|
| 4624 | Inicio de sesión exitoso |
| 4625 | Inicio de sesión fallido |
| 4634 | Cierre de sesión |
| 4720 | Cuenta de usuario creada |
| 4740 | Cuenta bloqueada |
| 4756 | Usuario añadido a grupo privilegiado |

### Desbloquear cuenta
\`\`\`powershell
Unlock-ADAccount -Identity "jgarcia"
# Ver todas las cuentas bloqueadas
Search-ADAccount -LockedOut | Select-Object Name, LockedOut
\`\`\``,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 3 — DNS / DHCP
  // ══════════════════════════════════════════════════════

  {
    id: 'dhcp-full',
    subject: 'dns_dhcp',
    module_order: 1,
    title: 'DHCP completo: ámbitos, exclusiones y reservas',
    description: 'Instala y configura un servidor DHCP profesional con ámbito, exclusiones de IPs estáticas, reservas para impresoras y opciones de scope.',
    difficulty: 'Básico',
    xp: 40,
    estimatedMinutes: 20,
    prerequisites: [],
    objectives: [
      'Instalar y autorizar DHCP en AD',
      'Crear ámbito con exclusiones',
      'Configurar reservas y opciones de scope',
    ],
    steps: [
      {
        id: 1,
        title: 'Instalar DHCP y autorizar en AD',
        explanation: `En un dominio AD, el servidor DHCP debe ser **autorizado** explícitamente para evitar servidores DHCP no autorizados (rogue DHCP) que distribuyan IPs incorrectas.`,
        keyCommand: `Install-WindowsFeature -Name DHCP -IncludeManagementTools`,
        command: `# Instalar rol DHCP
Install-WindowsFeature -Name DHCP -IncludeManagementTools

# Autorizar en AD (requiere Domain Admin)
Add-DhcpServerInDC -DnsName "dc01.empresa.local" -IPAddress 192.168.1.10

# Verificar autorización
Get-DhcpServerInDC

# Crear grupos de seguridad DHCP en AD (se crean automáticamente si no existen)
netsh dhcp add securitygroups

# Reiniciar servicio para que reconozca la autorización
Restart-Service DHCPServer
Get-Service DHCPServer | Select-Object Name, Status`,
        expectedOutput: `IPAddress      DnsName
---------      -------
192.168.1.10   dc01.empresa.local

Name        Status
----        ------
DHCPServer  Running`,
        hint: 'Si DHCP no está autorizado en AD, el servicio arranca pero no distribuye IPs. El log del evento lo indica con el error 1046 en el Visor de Eventos.',
      },
      {
        id: 2,
        title: 'Crear ámbito con exclusiones',
        explanation: `El **ámbito (scope)** define el rango de IPs disponibles. Las **exclusiones** reservan rangos para IPs estáticas (servidores, impresoras, APs WiFi).`,
        keyCommand: `Add-DhcpServerv4Scope -Name "Red_Aulas_Instituto" -StartRange 192.168.10.1 -EndRange 192.168.10.254 -SubnetMask 255.255.255.0 -LeaseDuration (New-TimeSpan -Hours 8) -State Active`,
        command: `# Crear ámbito para la red de aulas
Add-DhcpServerv4Scope \`
    -Name "Red_Aulas_Instituto" \`
    -StartRange 192.168.10.1 \`
    -EndRange 192.168.10.254 \`
    -SubnetMask 255.255.255.0 \`
    -Description "DHCP para PCs de aulas - Instituto" \`
    -LeaseDuration (New-TimeSpan -Hours 8) \`
    -State Active

# Excluir IPs para servidores (.1-.20) e impresoras (.200-.220)
Add-DhcpServerv4ExclusionRange \`
    -ScopeId 192.168.10.0 \`
    -StartRange 192.168.10.1 \`
    -EndRange 192.168.10.20

Add-DhcpServerv4ExclusionRange \`
    -ScopeId 192.168.10.0 \`
    -StartRange 192.168.10.200 \`
    -EndRange 192.168.10.220

# Configurar opciones del scope (gateway, DNS, dominio)
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 \`
    -Router 192.168.10.1 \`
    -DnsServer 192.168.1.10, 8.8.8.8 \`
    -DnsDomain "empresa.local"

Write-Host "Scope configurado. IPs disponibles para clientes: .21 - .199 y .221 - .254"`,
        expectedOutput: `Scope configurado. IPs disponibles para clientes: .21 - .199 y .221 - .254`,
        hint: 'LeaseDuration 8h es ideal para aulas (duración de jornada escolar). En oficinas usa 24h o más. Valores cortos generan más tráfico de renovación.',
      },
      {
        id: 3,
        title: 'Crear reservas para dispositivos fijos',
        explanation: `Las **reservas** aseguran que una impresora o AP WiFi siempre reciba la misma IP por DHCP, sin necesidad de configuración estática en cada dispositivo.`,
        keyCommand: `Add-DhcpServerv4Reservation -ScopeId 192.168.10.0 -IPAddress 192.168.10.201 -ClientId "00-1A-2B-3C-4D-5E" -Name "Impresora_Aula1"`,
        command: `# Reserva para impresora del aula 1 (obtener MAC con arp -a o desde el dispositivo)
Add-DhcpServerv4Reservation \`
    -ScopeId 192.168.10.0 \`
    -IPAddress 192.168.10.201 \`
    -ClientId "00-1A-2B-3C-4D-5E" \`
    -Name "Impresora_Aula1" \`
    -Description "HP LaserJet Aula 1"

# Reserva para AP WiFi
Add-DhcpServerv4Reservation \`
    -ScopeId 192.168.10.0 \`
    -IPAddress 192.168.10.210 \`
    -ClientId "AA-BB-CC-DD-EE-FF" \`
    -Name "AP_WiFi_Pasillo1"

# Ver estadísticas del scope
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.10.0`,
        expectedOutput: `ScopeId       Free  InUse  Reserved  Pending
-------       ----  -----  --------  -------
192.168.10.0  209   15     2         0`,
        hint: 'La MAC se obtiene en Windows con: arp -a (si el dispositivo ha comunicado) o getmac /S nombre_equipo. En Linux: ip neigh show.',
      },
    ],
    theory: `## DHCP: proceso y conceptos avanzados

### Proceso DORA
\`\`\`
Cliente              Servidor DHCP
  |                      |
  |-- DISCOVER (bcast) -->|  "¿Hay un servidor DHCP?"
  |<-- OFFER -------------|  "Te ofrezco 192.168.10.50"
  |-- REQUEST (bcast) --->|  "Acepto 192.168.10.50"
  |<-- ACK ---------------|  "Confirmado, lease 8h"
\`\`\`

### Opciones DHCP más usadas
| Opción | Nombre | Ejemplo |
|--------|--------|---------|
| 003 | Router | 192.168.10.1 |
| 006 | DNS Servers | 192.168.1.10 |
| 015 | DNS Domain Name | empresa.local |
| 043 | Vendor Specific | Configuración VoIP |
| 066 | Boot Server | PXE boot |
| 067 | Bootfile Name | pxelinux.0 |

### Alta disponibilidad DHCP
\`\`\`powershell
# Configurar failover DHCP entre dos servidores
Add-DhcpServerv4Failover \`
    -Name "DHCP-HA" \`
    -PartnerServer "dc02.empresa.local" \`
    -ScopeId 192.168.10.0 \`
    -Mode HotStandby \`
    -MaxClientLeadTime (New-TimeSpan -Hours 1)
\`\`\``,
  },

  {
    id: 'dns-full',
    subject: 'dns_dhcp',
    module_order: 2,
    title: 'DNS avanzado: zonas, registros y troubleshooting',
    description: 'Domina la gestión completa de DNS: zonas primarias y secundarias, todos los tipos de registros, zonas inversas y herramientas de diagnóstico.',
    difficulty: 'Intermedio',
    xp: 50,
    estimatedMinutes: 25,
    prerequisites: ['dhcp-full'],
    objectives: [
      'Crear zonas primarias con replicación AD',
      'Gestionar todos los tipos de registros (A, AAAA, CNAME, MX, SRV)',
      'Diagnosticar problemas DNS con nslookup y Resolve-DnsName',
    ],
    steps: [
      {
        id: 1,
        title: 'Crear zonas DNS con replicación AD',
        explanation: `Las zonas integradas en AD se replican automáticamente entre todos los DCs. Es mejor que las zonas estándar que requieren transferencias de zona manuales.`,
        keyCommand: `Add-DnsServerPrimaryZone -Name "empresa.local" -ReplicationScope "Forest" -DynamicUpdate "Secure"`,
        command: `# Zona primaria integrada en AD (mejor opción en dominio)
Add-DnsServerPrimaryZone \`
    -Name "empresa.local" \`
    -ReplicationScope "Forest" \`
    -DynamicUpdate "Secure"

# Zona para un subdominio (ej: rama de Madrid)
Add-DnsServerPrimaryZone \`
    -Name "madrid.empresa.local" \`
    -ReplicationScope "Domain" \`
    -DynamicUpdate "Secure"

# Zona inversa para 192.168.1.0/24
Add-DnsServerPrimaryZone \`
    -NetworkID "192.168.1.0/24" \`
    -ReplicationScope "Forest" \`
    -DynamicUpdate "Secure"

# Zona inversa para 192.168.10.0/24 (aulas)
Add-DnsServerPrimaryZone \`
    -NetworkID "192.168.10.0/24" \`
    -ReplicationScope "Forest" \`
    -DynamicUpdate "Secure"

Get-DnsServerZone | Select-Object ZoneName, ZoneType, DynamicUpdate, ReplicationScope`,
        expectedOutput: `ZoneName                    ZoneType  DynamicUpdate  ReplicationScope
--------                    --------  -------------  ----------------
empresa.local               Primary   Secure         Forest
madrid.empresa.local        Primary   Secure         Domain
1.168.192.in-addr.arpa      Primary   Secure         Forest
10.168.192.in-addr.arpa     Primary   Secure         Forest`,
        hint: 'ReplicationScope "Forest" replica a todos los DCs del bosque. "Domain" solo al dominio actual. Usa Forest para zonas que necesitan todos los DCs.',
      },
      {
        id: 2,
        title: 'Añadir todos los tipos de registros DNS',
        explanation: `Un administrador de sistemas debe saber crear todos los tipos de registro DNS: A, AAAA, CNAME, MX, SRV, TXT y PTR.`,
        keyCommand: `Add-DnsServerResourceRecordA -Name "webserver" -ZoneName "empresa.local" -IPv4Address "192.168.1.50"`,
        command: `$zone = "empresa.local"

# Registros A (IPv4)
Add-DnsServerResourceRecordA -Name "webserver"  -ZoneName $zone -IPv4Address "192.168.1.50"
Add-DnsServerResourceRecordA -Name "mailserver" -ZoneName $zone -IPv4Address "192.168.1.51"
Add-DnsServerResourceRecordA -Name "fileserver" -ZoneName $zone -IPv4Address "192.168.1.52"

# Registro AAAA (IPv6)
Add-DnsServerResourceRecordAAAA -Name "webserver" -ZoneName $zone -IPv6Address "fd00::50"

# Registros CNAME (alias)
Add-DnsServerResourceRecordCName -Name "www"   -ZoneName $zone -HostNameAlias "webserver.$zone"
Add-DnsServerResourceRecordCName -Name "smtp"  -ZoneName $zone -HostNameAlias "mailserver.$zone"
Add-DnsServerResourceRecordCName -Name "imap"  -ZoneName $zone -HostNameAlias "mailserver.$zone"

# Registro MX (correo)
Add-DnsServerResourceRecordMX -Name "@" -ZoneName $zone \`
    -MailExchange "mailserver.$zone" -Preference 10

# Registro TXT (SPF para antispam)
Add-DnsServerResourceRecord -Txt -Name "@" -ZoneName $zone \`
    -DescriptiveText "v=spf1 ip4:192.168.1.51 -all"

# Registros PTR en zona inversa
Add-DnsServerResourceRecordPtr -Name "50" -ZoneName "1.168.192.in-addr.arpa" -PtrDomainName "webserver.$zone"
Add-DnsServerResourceRecordPtr -Name "51" -ZoneName "1.168.192.in-addr.arpa" -PtrDomainName "mailserver.$zone"

Write-Host "Registros DNS creados. Verificando..." -ForegroundColor Green
Resolve-DnsName "www.empresa.local" -Type A`,
        expectedOutput: `Registros DNS creados. Verificando...

Name              Type TTL   Section    IPAddress
----              ---- ---   -------    ---------
www.empresa.local A    3600  Answer     192.168.1.50`,
        hint: 'El @ como nombre indica la raíz de la zona. MX con Preference 10 significa menor número = mayor prioridad. Si tienes dos servidores de correo, usa 10 y 20.',
      },
      {
        id: 3,
        title: 'Troubleshooting DNS profesional',
        explanation: `Cuando DNS falla, los servicios del dominio se caen. Aprende las herramientas de diagnóstico para resolver problemas rápidamente.`,
        keyCommand: `Resolve-DnsName "webserver.empresa.local" -Server "192.168.1.10"`,
        command: `# ── Diagnóstico completo DNS ──

# 1. Comprobar resolución directa e inversa
Resolve-DnsName "webserver.empresa.local" -Server "192.168.1.10"
Resolve-DnsName "192.168.1.50" -Server "192.168.1.10"

# 2. Comprobar registros SRV de AD (críticos para que AD funcione)
Resolve-DnsName "_ldap._tcp.empresa.local" -Type SRV
Resolve-DnsName "_kerberos._tcp.empresa.local" -Type SRV

# 3. Verificar zona completa
Get-DnsServerResourceRecord -ZoneName "empresa.local" |
    Select-Object HostName, RecordType, @{N='Data';E={$_.RecordData}} |
    Sort-Object RecordType, HostName

# 4. dcdiag: diagnóstico completo de AD/DNS
dcdiag /test:DNS /v /f:"C:\\Temp\\dcdiag_dns.txt"

# 5. Ver caché DNS del servidor
Get-DnsServerCache | Where-Object { $_.RecordType -eq "A" } | Select-Object -First 10`,
        expectedOutput: `Name                            Type TTL   Section    NameTarget           Priority Weight Port
----                            ---- ---   -------    ----------           -------- ------ ----
_ldap._tcp.empresa.local        SRV  600   Answer     dc01.empresa.local   0        100    389

......................... DC01 passed test DNS`,
        hint: 'Si los registros SRV de _ldap y _kerberos no existen, ejecuta: netdiag /fix o nltest /dsregdns para forzar su recreación.',
      },
    ],
    theory: `## DNS en Active Directory: por qué es tan crítico

AD depende **completamente** de DNS. Si DNS falla, los usuarios no pueden:
- Iniciar sesión en el dominio (no encuentra el DC via SRV)
- Acceder a recursos por nombre
- Que funcione Kerberos (autenticación)

### Registros SRV que crea AD automáticamente
\`\`\`
_ldap._tcp.empresa.local          → Controladores de dominio
_kerberos._tcp.empresa.local      → Servidores Kerberos
_kpasswd._tcp.empresa.local       → Cambio de contraseña Kerberos
_gc._tcp.empresa.local            → Global Catalog
\`\`\`

### Zonas de búsqueda inversa
Permiten resolver IP → nombre (PTR records). Son necesarias para:
- Herramientas de diagnóstico (nslookup, ping -a)
- Sistemas de correo (comprobación antispam)
- Logs de seguridad legibles`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 4 — HYPER-V
  // ══════════════════════════════════════════════════════

  {
    id: 'hyperv-full',
    subject: 'hyperv',
    module_order: 1,
    title: 'Hyper-V: VMs, switches y snapshots',
    description: 'Instala Hyper-V, crea una infraestructura de red virtual completa y gestiona VMs con snapshots para un entorno de laboratorio.',
    difficulty: 'Intermedio',
    xp: 55,
    estimatedMinutes: 30,
    prerequisites: [],
    objectives: [
      'Instalar Hyper-V y crear switches virtuales',
      'Crear y configurar VMs con Generation 2',
      'Gestionar snapshots para laboratorio',
    ],
    steps: [
      {
        id: 1,
        title: 'Instalar Hyper-V y crear infraestructura de red',
        explanation: `Creamos tres tipos de switch virtual para un laboratorio completo:
- **External**: las VMs acceden a la red física
- **Internal**: VMs se comunican entre sí y con el host
- **Private**: aislamiento total (solo entre VMs)`,
        keyCommand: `Install-WindowsFeature -Name Hyper-V -IncludeManagementTools`,
        command: `# Instalar Hyper-V (requiere reinicio)
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart:$false

# Tras reinicio: crear switches virtuales
# Switch externo (VMs con acceso a internet)
New-VMSwitch -Name "vSwitch-External" \`
    -NetAdapterName "Ethernet" \`
    -AllowManagementOS $true

# Switch interno (laboratorio - VMs + host)
New-VMSwitch -Name "vSwitch-Lab" -SwitchType Internal

# Switch privado (red aislada entre VMs)
New-VMSwitch -Name "vSwitch-Private" -SwitchType Private

# Ver todos los switches
Get-VMSwitch | Select-Object Name, SwitchType, NetAdapterInterfaceDescription`,
        expectedOutput: `Name              SwitchType  NetAdapterInterfaceDescription
----              ----------  ------------------------------
vSwitch-External  External    Intel(R) Ethernet Connection
vSwitch-Lab       Internal
vSwitch-Private   Private`,
        hint: 'AllowManagementOS $true en el switch externo permite que el host también acceda a la red a través del switch virtual. Sin esto, el host pierde conectividad.',
      },
      {
        id: 2,
        title: 'Crear VM con configuración profesional',
        explanation: `**Generation 2** usa UEFI/Secure Boot y es más rápida. Usamos **Dynamic Memory** para optimizar RAM entre múltiples VMs del laboratorio.`,
        keyCommand: `New-VM -Name "WS2022-Lab01" -Generation 2 -MemoryStartupBytes 2GB -Path "D:\\VMs" -NewVHDPath "D:\\VMs\\WS2022-Lab\\disk_sys.vhdx" -NewVHDSizeBytes 60GB -SwitchName "vSwitch-Lab"`,
        command: `# Crear directorio de VMs
New-Item -Path "D:\\VMs\\WS2022-Lab" -ItemType Directory -Force

# Crear VM completa
New-VM -Name "WS2022-Lab01" \`
    -Generation 2 \`
    -MemoryStartupBytes 2GB \`
    -Path "D:\\VMs" \`
    -NewVHDPath "D:\\VMs\\WS2022-Lab\\disk_sys.vhdx" \`
    -NewVHDSizeBytes 60GB \`
    -SwitchName "vSwitch-Lab"

# Configurar CPU y memoria dinámica
Set-VM -Name "WS2022-Lab01" \`
    -ProcessorCount 2 \`
    -DynamicMemory \`
    -MemoryMinimumBytes 1GB \`
    -MemoryMaximumBytes 4GB \`
    -AutomaticStartAction StartIfRunning \`
    -AutomaticStopAction ShutDown

# Añadir disco de datos adicional
New-VHD -Path "D:\\VMs\\WS2022-Lab\\disk_data.vhdx" -SizeBytes 100GB -Dynamic
Add-VMHardDiskDrive -VMName "WS2022-Lab01" \`
    -Path "D:\\VMs\\WS2022-Lab\\disk_data.vhdx"

# Añadir ISO de instalación
Add-VMDvdDrive -VMName "WS2022-Lab01" \`
    -Path "D:\\ISOs\\WS2022_Evaluation.iso"

# Ver configuración final
Get-VM "WS2022-Lab01" | Select-Object Name, State, Generation, MemoryAssigned, ProcessorCount`,
        expectedOutput: `Name         State   Generation  MemoryAssigned  ProcessorCount
----         -----   ----------  --------------  --------------
WS2022-Lab01 Off     2           2147483648      2`,
        hint: 'Dynamic VHD crece bajo demanda. Fixed VHD tiene mejor rendimiento. Para laboratorio usa Dynamic (ahorra espacio). Para producción usa Fixed.',
      },
      {
        id: 3,
        title: 'Snapshots y clonación de VMs para laboratorio',
        explanation: `Los **checkpoints (snapshots)** son esenciales en laboratorio: permiten guardar el estado antes de una práctica y restaurarlo después. También clonamos VMs para crear múltiples instancias.`,
        keyCommand: `Checkpoint-VM -Name "WS2022-Lab01" -SnapshotName "Estado_Limpio_Inicial"`,
        command: `# Arrancar la VM
Start-VM -Name "WS2022-Lab01"

# Esperar a que esté running
Wait-VM -Name "WS2022-Lab01" -For IPAddress -Timeout 120

# ── Gestión de checkpoints ──
# Crear checkpoint antes de una práctica peligrosa
Checkpoint-VM -Name "WS2022-Lab01" -SnapshotName "Estado_Limpio_Inicial"

# ... (el alumno hace la práctica) ...

# Restaurar al estado anterior
Restore-VMCheckpoint -Name "WS2022-Lab01" \`
    -VMCheckpointName "Estado_Limpio_Inicial" -Confirm:$false

# Ver todos los checkpoints
Get-VMCheckpoint -VMName "WS2022-Lab01" | \`
    Select-Object Name, CreationTime, ParentCheckpointName

# ── Exportar/Importar VM (clonar para varios alumnos) ──
Export-VM -Name "WS2022-Lab01" -Path "D:\\Plantillas"

# Importar como nueva VM (copia)
Import-VM -Path "D:\\Plantillas\\WS2022-Lab01\\Virtual Machines\\*.vmcx" \`
    -Copy \`
    -GenerateNewId \`
    -VirtualMachinePath "D:\\VMs\\Alumno02" \`
    -VhdDestinationPath "D:\\VMs\\Alumno02"`,
        expectedOutput: `Name                    CreationTime         ParentCheckpointName
----                    ------------         --------------------
Estado_Limpio_Inicial   15/03/2024 10:00:00`,
        hint: 'Crea un checkpoint "Estado_Limpio_Inicial" tras instalar el SO y configurar lo básico. Así puedes restaurar cualquier VM de alumno en segundos.',
      },
    ],
    theory: `## Hyper-V: tipos y conceptos de virtualización

### Tipos de hipervisor
| Tipo | Descripción | Ejemplos |
|------|-------------|---------|
| **Tipo 1** (bare-metal) | Corre sobre el hardware directamente | Hyper-V, VMware ESXi, KVM |
| **Tipo 2** (hosted) | Corre sobre un SO huésped | VirtualBox, VMware Workstation |

Hyper-V en Windows Server es **Tipo 1**: el hipervisor toma control del hardware y Windows Server se convierte en la "partición padre".

### Formatos de disco virtual
| Formato | Descripción | Uso recomendado |
|---------|-------------|-----------------|
| **Fixed VHD/VHDX** | Tamaño fijo, mejor rendimiento | Producción |
| **Dynamic VHD/VHDX** | Crece bajo demanda | Laboratorio |
| **Differencing** | Solo cambios desde base | Despliegue masivo de VMs |

### Memoria dinámica
Hyper-V puede reasignar RAM entre VMs según la demanda, permitiendo sobreprovisionar. Ejemplo: 5 VMs con mínimo 1GB y máximo 4GB en un host con 12GB RAM.`,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 5 — POWERSHELL
  // ══════════════════════════════════════════════════════

  {
    id: 'ps-remoting',
    subject: 'ps',
    module_order: 1,
    title: 'PowerShell Remoting y gestión de múltiples servidores',
    description: 'Configura WinRM y usa PowerShell Remoting para administrar decenas de servidores simultáneamente desde una sola consola.',
    difficulty: 'Intermedio',
    xp: 50,
    estimatedMinutes: 25,
    prerequisites: [],
    objectives: [
      'Habilitar WinRM y configurar TrustedHosts',
      'Ejecutar comandos en múltiples servidores con Invoke-Command',
      'Crear sesiones persistentes para administración remota',
    ],
    steps: [
      {
        id: 1,
        title: 'Configurar WinRM para remoting',
        explanation: `**WinRM** (Windows Remote Management) es el servicio que habilita PowerShell Remoting. En dominio AD se puede habilitar via GPO. Aquí lo hacemos manualmente.`,
        keyCommand: `Enable-PSRemoting -Force`,
        command: `# Habilitar WinRM en el servidor (como admin)
Enable-PSRemoting -Force

# En entornos de workgroup (no dominio), añadir hosts de confianza
Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value "*" -Force

# Verificar configuración WinRM
winrm get winrm/config/service

# Probar conexión a servidor remoto
Test-WSMan -ComputerName "DC01" -Authentication Default
Test-WSMan -ComputerName "FileServer01" -Authentication Default`,
        expectedOutput: `winrm/config/service
Service
    RootSDDL = ...
    AllowUnencrypted = false
    Auth
        Basic = false
        Kerberos = true  ← En dominio usa Kerberos (más seguro)

ComputerName : DC01
Protocol     : WSMan
ProductVendor : Microsoft Corporation`,
        hint: 'En dominio, no necesitas TrustedHosts porque Kerberos autentica automáticamente. TrustedHosts solo es necesario en workgroup o con IPs directas.',
      },
      {
        id: 2,
        title: 'Invoke-Command: administrar múltiples servidores',
        explanation: `\`Invoke-Command\` ejecuta el mismo scriptblock en múltiples servidores **en paralelo**. Es la forma más eficiente de administración masiva.`,
        keyCommand: `Invoke-Command -ComputerName @("DC01","DC02","FileServer01","WebServer01") -ScriptBlock { Get-CimInstance Win32_OperatingSystem | Select-Object CSName, Caption }`,
        command: `# Lista de servidores a gestionar
$servidores = @("DC01","DC02","FileServer01","WebServer01")

# Ejecutar comando en todos simultáneamente
Invoke-Command -ComputerName $servidores -ScriptBlock {
    [PSCustomObject]@{
        Servidor    = $env:COMPUTERNAME
        OS          = (Get-CimInstance Win32_OperatingSystem).Caption
        Uptime      = ((Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime).Days
        RAM_GB      = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB, 1)
        CPU_Pct     = (Get-CimInstance Win32_Processor).LoadPercentage
        Disco_C_Pct = [math]::Round((1 - (Get-PSDrive C).Free/(Get-PSDrive C).Used) * 100, 1)
    }
} | Select-Object Servidor, OS, Uptime, RAM_GB, CPU_Pct, Disco_C_Pct |
  Format-Table -AutoSize`,
        expectedOutput: `Servidor      OS                              Uptime  RAM_GB  CPU_Pct  Disco_C_Pct
--------      --                              ------  ------  -------  -----------
DC01          Windows Server 2022 Standard    15      16.0    3        42.5
DC02          Windows Server 2022 Standard    15      16.0    2        38.1
FileServer01  Windows Server 2022 Standard    22      32.0    8        67.3
WebServer01   Windows Server 2022 Datacenter  30      8.0     15       55.2`,
        hint: '-ThrottleLimit (por defecto 32) controla cuántos servidores simultáneos. En redes lentas, reduce a 10-15. El resultado incluye la propiedad PSComputerName automáticamente.',
      },
      {
        id: 3,
        title: 'Sesiones persistentes y scripts de mantenimiento',
        explanation: `Las **sesiones persistentes** (PSSession) mantienen el estado entre comandos. Ideales para tareas largas o cuando necesitas variables del servidor remoto.`,
        keyCommand: `New-PSSession -ComputerName @("DC01","FileServer01")`,
        command: `# Crear sesiones persistentes a múltiples servidores
$servidores = @("DC01","FileServer01")
$sessions = New-PSSession -ComputerName $servidores

# Importar módulo remoto en las sesiones
Invoke-Command -Session $sessions -ScriptBlock {
    Import-Module ActiveDirectory -ErrorAction SilentlyContinue
}

# Script de mantenimiento nocturno
Invoke-Command -Session $sessions -ScriptBlock {
    # Limpiar logs de eventos > 30 días
    Get-WinEvent -ListLog * -ErrorAction SilentlyContinue |
        Where-Object { $_.IsEnabled -and $_.LogMode -eq "Circular" } |
        ForEach-Object { [System.Diagnostics.Eventing.Reader.EventLogSession]::GlobalSession.ClearLog($_.LogName) }

    # Limpiar archivos temporales
    Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue

    # Comprobar espacio en disco
    Get-PSDrive -PSProvider FileSystem | Select-Object Name,
        @{N='Libre_GB'; E={[math]::Round($_.Free/1GB,1)}},
        @{N='Total_GB'; E={[math]::Round(($_.Used+$_.Free)/1GB,1)}}
}

# Cerrar sesiones al terminar
Remove-PSSession $sessions`,
        expectedOutput: `Name  Libre_GB  Total_GB
----  --------  --------
C     45.3      100.0
D     210.5     500.0`,
        hint: 'Guarda las sesiones en $sessions para reutilizarlas. Remove-PSSession al final libera recursos del servidor. Las sesiones expiran tras ~7.5 minutos de inactividad.',
      },
    ],
    theory: `## PowerShell Remoting: arquitectura y seguridad

### WinRM vs SSH
| Característica | WinRM (PSRemoting) | SSH (PS 7+) |
|----------------|---------------------|-------------|
| Protocolo | SOAP/HTTP(S) | SSH |
| Autenticación en dominio | Kerberos (sin contraseña) | Certificado/Password |
| SO compatible | Windows | Windows, Linux, macOS |
| Puerto | 5985 (HTTP), 5986 (HTTPS) | 22 |

### JEA: Just Enough Administration
JEA permite que un técnico ejecute solo los comandos que necesita, sin ser administrador completo:
\`\`\`powershell
# Definir capacidades del rol Helpdesk
New-PSRoleCapabilityFile -Path "C:\\JEA\\HelpDesk.psrc" \`
    -VisibleCmdlets "Get-ADUser","Unlock-ADAccount","Reset-ADUserPassword"

# Crear configuración de sesión restringida
Register-PSSessionConfiguration -Name "Helpdesk" \`
    -RoleDefinitions @{"EMPRESA\\GRP_Helpdesk" = @{RoleCapabilityFiles="C:\\JEA\\HelpDesk.psrc"}}
\`\`\``,
  },

  {
    id: 'ps-monitoring',
    subject: 'ps',
    module_order: 2,
    title: 'Monitorización y alertas automáticas',
    description: 'Crea scripts de monitorización que comprueban la salud del sistema y envían alertas por correo cuando detectan problemas.',
    difficulty: 'Avanzado',
    xp: 60,
    estimatedMinutes: 30,
    prerequisites: ['ps-remoting'],
    objectives: [
      'Monitorizar CPU, RAM y disco con umbrales de alerta',
      'Comprobar servicios críticos y reiniciarlos automáticamente',
      'Enviar alertas por email con informes HTML',
    ],
    steps: [
      {
        id: 1,
        title: 'Monitor de recursos con umbrales',
        explanation: `El script recorre una lista de servidores, comprueba sus métricas y genera alertas si superan los umbrales definidos.`,
        keyCommand: `Get-CimInstance Win32_OperatingSystem -ComputerName "DC01" | Select-Object CSName, FreePhysicalMemory, TotalVisibleMemorySize`,
        command: `function Get-ServerHealth {
    param([string[]]$Servers, [int]$CpuThreshold=80, [int]$MemThreshold=85, [int]$DiskThreshold=90)

    $alerts = @()

    foreach ($server in $Servers) {
        try {
            $os  = Get-CimInstance Win32_OperatingSystem -ComputerName $server
            $cpu = (Get-CimInstance Win32_Processor -ComputerName $server | Measure-Object LoadPercentage -Average).Average
            $ram = [math]::Round(100 - ($os.FreePhysicalMemory / $os.TotalVisibleMemorySize * 100), 1)
            $disk = Get-CimInstance Win32_LogicalDisk -ComputerName $server -Filter "DeviceID='C:'"
            $diskPct = [math]::Round(100 - ($disk.FreeSpace / $disk.Size * 100), 1)

            if ($cpu -gt $CpuThreshold) {
                $alerts += [PSCustomObject]@{ Servidor=$server; Tipo="CPU"; Valor="$cpu%"; Umbral="$CpuThreshold%"; Severidad="Alta" }
            }
            if ($ram -gt $MemThreshold) {
                $alerts += [PSCustomObject]@{ Servidor=$server; Tipo="RAM"; Valor="$ram%"; Umbral="$MemThreshold%"; Severidad="Alta" }
            }
            if ($diskPct -gt $DiskThreshold) {
                $alerts += [PSCustomObject]@{ Servidor=$server; Tipo="DISCO C:"; Valor="$diskPct%"; Umbral="$DiskThreshold%"; Severidad="Critica" }
            }
        } catch {
            $alerts += [PSCustomObject]@{ Servidor=$server; Tipo="CONEXION"; Valor="ERROR"; Umbral="-"; Severidad="Critica" }
        }
    }
    return $alerts
}

$resultado = Get-ServerHealth -Servers @("DC01","FileServer01") -CpuThreshold 80 -DiskThreshold 85
$resultado | Format-Table -AutoSize`,
        expectedOutput: `Servidor     Tipo    Valor  Umbral  Severidad
--------     ----    -----  ------  ---------
FileServer01 DISCO C: 87%   85%    Critica`,
        hint: 'Ajusta los umbrales según tu entorno. En servidores de base de datos, CPU al 80% es normal. En servidores de ficheros, disco al 90% es crítico.',
      },
      {
        id: 2,
        title: 'Watchdog de servicios críticos',
        explanation: `El watchdog comprueba que los servicios esenciales están corriendo y los **reinicia automáticamente** si se han detenido, enviando una alerta.`,
        keyCommand: `Get-Service -Name 'ADWS','DNS','Netlogon','NTDS','W32Time','KDC' | Select-Object Name, Status`,
        command: `function Watch-CriticalServices {
    param([string]$Server = $env:COMPUTERNAME)

    $criticalServices = @{
        'ADWS'     = 'Active Directory Web Services'
        'DNS'      = 'DNS Server'
        'Netlogon' = 'Net Logon'
        'NTDS'     = 'AD Domain Services'
        'W32Time'  = 'Windows Time'
        'KDC'      = 'Kerberos Key Distribution Center'
    }

    $recovered = @()
    $stillDown  = @()

    foreach ($svcName in $criticalServices.Keys) {
        $svc = Get-Service -Name $svcName -ComputerName $Server -ErrorAction SilentlyContinue

        if ($svc -and $svc.Status -ne 'Running') {
            Write-Host "ALERTA: $svcName está $($svc.Status) en $Server. Intentando reiniciar..." -ForegroundColor Red

            try {
                $svc | Start-Service
                Start-Sleep -Seconds 5
                $svc.Refresh()

                if ($svc.Status -eq 'Running') {
                    Write-Host "  → $svcName reiniciado correctamente" -ForegroundColor Green
                    $recovered += $svcName
                } else {
                    $stillDown += $svcName
                }
            } catch {
                Write-Host "  → No se pudo reiniciar $svcName: $($_.Exception.Message)" -ForegroundColor Red
                $stillDown += $svcName
            }
        } else {
            Write-Host "[OK] $svcName" -ForegroundColor Green
        }
    }

    return [PSCustomObject]@{ Recovered=$recovered; StillDown=$stillDown }
}

Watch-CriticalServices -Server "DC01"`,
        expectedOutput: `[OK] ADWS
[OK] DNS
ALERTA: Netlogon está Stopped en DC01. Intentando reiniciar...
  → Netlogon reiniciado correctamente
[OK] NTDS
[OK] W32Time
[OK] KDC`,
        hint: 'Programa este script como tarea en el Programador de Tareas cada 5 minutos. Si StillDown tiene servicios, envía un email de alerta crítica.',
      },
    ],
    theory: `## PowerShell Scheduled Tasks: automatizar monitorización

\`\`\`powershell
# Crear tarea programada para monitorización
$action = New-ScheduledTaskAction \`
    -Execute "PowerShell.exe" \`
    -Argument "-NonInteractive -File C:\\Scripts\\Monitor-Servers.ps1"

$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 15) -Once -At (Get-Date)

Register-ScheduledTask \`
    -TaskName "Monitor_Servidores" \`
    -Action $action \`
    -Trigger $trigger \`
    -RunLevel Highest \`
    -User "SYSTEM"
\`\`\`

### Logging estructurado
\`\`\`powershell
function Write-Log {
    param([string]$Message, [string]$Level="INFO")
    $entry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
    Add-Content -Path "C:\\Logs\\monitor.log" -Value $entry
    Write-Host $entry -ForegroundColor $(switch($Level){"ERROR"{"Red"}"WARN"{"Yellow"}default{"White"}})
}
\`\`\``,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 6 — FILE SERVICES
  // ══════════════════════════════════════════════════════

  {
    id: 'fs-ntfs',
    subject: 'fs',
    module_order: 1,
    title: 'NTFS, carpetas compartidas y cuotas',
    description: 'Configura un servidor de ficheros profesional con permisos NTFS granulares, carpetas compartidas con ABE y cuotas de disco por usuario.',
    difficulty: 'Básico',
    xp: 40,
    estimatedMinutes: 20,
    prerequisites: [],
    objectives: [
      'Configurar permisos NTFS con herencia y protección',
      'Crear shares con Access-Based Enumeration (ABE)',
      'Implementar cuotas de disco con FSRM',
    ],
    steps: [
      {
        id: 1,
        title: 'Instalar File Services y configurar NTFS',
        explanation: `**FSRM** (File Server Resource Manager) añade cuotas, filtros de archivos e informes al servidor de ficheros. **ABE** oculta carpetas a las que el usuario no tiene acceso.`,
        keyCommand: `Install-WindowsFeature -Name FS-Resource-Manager,FS-Data-Deduplication -IncludeManagementTools`,
        command: `# Instalar rol File Services con FSRM
Install-WindowsFeature -Name FS-Resource-Manager,FS-Data-Deduplication \`
    -IncludeManagementTools

# Crear estructura de carpetas
$rootPath = "D:\\Datos_Empresa"
@("Departamentos\\IT","Departamentos\\RRHH","Departamentos\\Contabilidad",
  "Usuarios","Software","Backup") | ForEach-Object {
    New-Item -Path "$rootPath\\$_" -ItemType Directory -Force | Out-Null
}

# Configurar permisos NTFS en carpeta Usuarios (perfiles personales)
$acl = Get-Acl "$rootPath\\Usuarios"

# Solo el propietario puede ver su carpeta (Creator Owner = Control Total)
$ruleCreator = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "CREATOR OWNER","FullControl","ContainerInherit,ObjectInherit","InheritOnly","Allow")

# Admins con control total
$ruleAdmins = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "EMPRESA\\Domain Admins","FullControl","ContainerInherit,ObjectInherit","None","Allow")

$acl.SetAccessRuleProtection($true, $false)
$acl.AddAccessRule($ruleCreator)
$acl.AddAccessRule($ruleAdmins)
Set-Acl "$rootPath\\Usuarios" $acl

Write-Host "Estructura de ficheros creada" -ForegroundColor Green`,
        expectedOutput: `Estructura de ficheros creada`,
        hint: 'CREATOR OWNER es un SID especial: se reemplaza por el usuario que crea el objeto. Así, cada usuario tiene control total de su propia carpeta pero no de las de otros.',
      },
      {
        id: 2,
        title: 'Crear shares con ABE y enumeration',
        explanation: `**ABE (Access-Based Enumeration)** oculta a los usuarios las carpetas a las que no tienen permiso. Sin ABE, ven carpetas "Denegado" lo que genera tickets de soporte innecesarios.`,
        keyCommand: `New-SmbShare -Name "Datos$" -Path "D:\\Datos_Empresa\\Departamentos" -FolderEnumerationMode AccessBased -EncryptData $true -FullAccess "EMPRESA\\Domain Admins"`,
        command: `# Share principal con ABE habilitado
New-SmbShare -Name "Datos$" \`
    -Path "D:\\Datos_Empresa\\Departamentos" \`
    -Description "Datos por departamento" \`
    -FolderEnumerationMode AccessBased \`
    -CachingMode None \`
    -EncryptData $true \`
    -FullAccess "EMPRESA\\Domain Admins" \`
    -ChangeAccess "EMPRESA\\Authenticated Users"

# Share de perfil de usuario (redireccionamiento de carpetas)
New-SmbShare -Name "Perfiles$" \`
    -Path "D:\\Datos_Empresa\\Usuarios" \`
    -Description "Perfiles de usuario" \`
    -FolderEnumerationMode AccessBased \`
    -FullAccess "EMPRESA\\Domain Admins","EMPRESA\\Authenticated Users"

# Verificar shares creados
Get-SmbShare | Where-Object { $_.Name -ne "IPC$" } |
    Select-Object Name, Path, FolderEnumerationMode, EncryptData`,
        expectedOutput: `Name      Path                              FolderEnumerationMode  EncryptData
----      ----                              ---------------------  -----------
Datos$    D:\\Datos_Empresa\\Departamentos    AccessBased            True
Perfiles$ D:\\Datos_Empresa\\Usuarios        AccessBased            True`,
        hint: '-EncryptData $true cifra el tráfico SMB 3.0. Requiere Windows 8/2012 en clientes. Para equipos antiguos puedes deshabilitarlo. El $ oculta el share en la exploración de red.',
      },
      {
        id: 3,
        title: 'Cuotas de disco con FSRM',
        explanation: `Las cuotas limitan el espacio que cada usuario puede usar. FSRM permite cuotas suaves (aviso) y duras (bloquea escritura).`,
        keyCommand: `New-FsrmQuotaTemplate -Name "Cuota_Usuario_5GB" -Size 5GB -Description "Cuota estándar por usuario - 5GB"`,
        command: `# Crear plantilla de cuota (5GB por usuario con aviso al 80%)
New-FsrmQuotaTemplate -Name "Cuota_Usuario_5GB" \`
    -Size 5GB \`
    -Description "Cuota estándar por usuario - 5GB" \`
    -Threshold @(
        New-FsrmQuotaThreshold -Percentage 80 -Action @(
            New-FsrmAction Email -MailTo "[Admin Email]" \`
                -Subject "Aviso: [Quota Threshold]% del espacio usado en [Quota Path]" \`
                -Body "El usuario [Source Io Owner] ha usado [Quota Used Bytes] de [Quota Limit Bytes]"
        ),
        New-FsrmQuotaThreshold -Percentage 100 -Action @(
            New-FsrmAction Email -MailTo "[Source Io Owner Email]" \`
                -Subject "Cuota agotada" \`
                -Body "Has alcanzado el límite de espacio. Contacta con soporte."
        )
    )

# Aplicar cuota a la carpeta de usuarios (auto-aplica a subcarpetas)
New-FsrmAutoQuota -Path "D:\\Datos_Empresa\\Usuarios" \`
    -Template "Cuota_Usuario_5GB" \`
    -Disabled $false

# Ver uso de cuotas
Get-FsrmQuota -Path "D:\\Datos_Empresa\\Usuarios\\*" |
    Select-Object Path, Size, Usage, @{N='Pct';E={[math]::Round($_.Usage/$_.Size*100,1)}}`,
        expectedOutput: `Path                                  Size        Usage       Pct
----                                  ----        -----       ---
D:\\Datos_Empresa\\Usuarios\\jgarcia     5368709120  1073741824  20.0
D:\\Datos_Empresa\\Usuarios\\arrhh       5368709120  2684354560  50.0`,
        hint: 'New-FsrmAutoQuota aplica la cuota automáticamente a todas las subcarpetas existentes y las nuevas que se creen. Perfecto para carpetas de usuarios.',
      },
    ],
    theory: `## NTFS vs Share Permissions: la regla de oro

> Cuando se accede **por red**: se aplican AMBOS permisos (NTFS y Share), gana el más restrictivo.
> Cuando se accede **localmente**: solo aplican permisos NTFS.

**Buena práctica**: poner Share en "Everyone - Full Control" y controlar todo con NTFS. Así la gestión es en un solo lugar.

### Deduplicación de datos
Windows Server incluye deduplicación de datos que puede reducir el espacio hasta un 50-80% en servidores de ficheros:
\`\`\`powershell
# Habilitar deduplicación en volumen D:
Enable-DedupVolume -Volume "D:" -UsageType Default

# Ver estadísticas de ahorro
Get-DedupStatus -Volume "D:" | Select-Object Volume, SavedSpace, SavingsRate
\`\`\``,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 7 — IIS
  // ══════════════════════════════════════════════════════

  {
    id: 'iis-full',
    subject: 'iis',
    module_order: 1,
    title: 'IIS completo: múltiples sitios, App Pools y HTTPS',
    description: 'Configura IIS profesionalmente: múltiples sitios web en el mismo servidor usando host headers, App Pools aislados y certificados SSL.',
    difficulty: 'Intermedio',
    xp: 55,
    estimatedMinutes: 25,
    prerequisites: [],
    objectives: [
      'Instalar IIS con módulos necesarios',
      'Crear múltiples sitios con host headers',
      'Configurar App Pools aislados y HTTPS',
    ],
    steps: [
      {
        id: 1,
        title: 'Instalar IIS con módulos completos',
        explanation: `IIS tiene una arquitectura modular. Instalamos los módulos más habituales en producción para soportar aplicaciones .NET y PHP.`,
        keyCommand: `Install-WindowsFeature -Name Web-Server,Web-Http-Errors,Web-Http-Logging,Web-Security,Web-Windows-Auth,Web-Net-Ext45,Web-Asp-Net45,Web-Mgmt-Console -IncludeManagementTools`,
        command: `# Instalar IIS con módulos completos
$features = @(
    "Web-Server",           # Servidor web base
    "Web-Http-Errors",      # Páginas de error personalizadas
    "Web-Http-Redirect",    # Redirecciones HTTP
    "Web-Http-Logging",     # Logging W3C
    "Web-Security",         # Módulos de seguridad
    "Web-Basic-Auth",       # Autenticación básica
    "Web-Windows-Auth",     # Autenticación Windows (SSO dominio)
    "Web-IP-Security",      # Restricción por IP
    "Web-Url-Auth",         # Autorización por URL
    "Web-Net-Ext45",        # .NET Extensibility 4.5
    "Web-Asp-Net45",        # ASP.NET 4.5
    "Web-Mgmt-Console",     # Consola de gestión IIS
    "Web-Mgmt-Service"      # Remote Management
)

Install-WindowsFeature -Name $features -IncludeManagementTools

# Habilitar gestión remota IIS
Set-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\WebManagement\\Server" EnableRemoteManagement 1
Start-Service WMSvc
Set-Service WMSvc -StartupType Automatic

Get-Website | Select-Object Name, State, PhysicalPath`,
        expectedOutput: `Name               State   PhysicalPath
----               -----   ------------
Default Web Site   Started C:\\inetpub\\wwwroot`,
        hint: 'Web-Windows-Auth habilita Single Sign-On: los usuarios del dominio acceden a la intranet sin introducir contraseña (usa Kerberos). Muy útil para aplicaciones internas.',
      },
      {
        id: 2,
        title: 'Múltiples sitios con host headers y App Pools',
        explanation: `Varios sitios en el mismo servidor (mismo puerto 80/443) se distinguen por el **Host Header** (nombre de dominio). Cada sitio tiene su propio **Application Pool** aislado.`,
        keyCommand: `New-Website -Name "Intranet" -PhysicalPath "C:\\inetpub\\intranet" -ApplicationPool "AppPool_Intranet" -Port 80 -HostHeader "intranet.empresa.local"`,
        command: `# Crear directorios para los sitios
@("intranet","portal","api") | ForEach-Object {
    New-Item "C:\\inetpub\\$_" -ItemType Directory -Force
    "<h1>Sitio: $_</h1>" | Out-File "C:\\inetpub\\$_\\index.html"
}

# ── App Pool para intranet (identidad de servicio dedicada) ──
New-WebAppPool -Name "AppPool_Intranet"
Set-ItemProperty "IIS:\\AppPools\\AppPool_Intranet" \`
    -Name processModel \`
    -Value @{userName="EMPRESA\\svc_iis_intranet"; password="SvcPass@2024!"; identityType=3}
Set-ItemProperty "IIS:\\AppPools\\AppPool_Intranet" \`
    -Name managedRuntimeVersion -Value "v4.0"

# ── Crear sitios con host headers ──
New-Website -Name "Intranet" \`
    -PhysicalPath "C:\\inetpub\\intranet" \`
    -ApplicationPool "AppPool_Intranet" \`
    -Port 80 \`
    -HostHeader "intranet.empresa.local" \`
    -Force

New-Website -Name "Portal_Alumnos" \`
    -PhysicalPath "C:\\inetpub\\portal" \`
    -Port 80 \`
    -HostHeader "portal.empresa.local" \`
    -Force

# Verificar bindings
Get-WebBinding | Select-Object protocol, bindingInformation`,
        expectedOutput: `protocol  bindingInformation
--------  ------------------
http      *:80:
http      *:80:intranet.empresa.local
http      *:80:portal.empresa.local`,
        hint: 'Las cuentas de servicio dedicadas (svc_iis_*) aíslan las aplicaciones. Si una app tiene una vulnerabilidad, el atacante solo tiene los permisos de esa cuenta de servicio, no de toda la máquina.',
      },
      {
        id: 3,
        title: 'Configurar HTTPS con certificado de CA interna',
        explanation: `En entornos de dominio, la **CA interna de Windows** (ADCS) emite certificados de confianza para todos los equipos del dominio, sin coste adicional.`,
        keyCommand: `New-SelfSignedCertificate -DnsName "intranet.empresa.local","portal.empresa.local" -CertStoreLocation "cert:\\LocalMachine\\My" -NotAfter (Get-Date).AddYears(2)`,
        command: `# Solicitar certificado a la CA del dominio (requiere ADCS instalado)
$certReq = @"
[Version]
Signature= "$Windows NT$"
[NewRequest]
Subject = "CN=intranet.empresa.local, OU=IT, O=Empresa, C=ES"
KeySpec = 1
KeyLength = 2048
Exportable = TRUE
MachineKeySet = TRUE
RequestType = PKCS10
[Extensions]
2.5.29.17 = "{text}dns=intranet.empresa.local&dns=portal.empresa.local"
"@
$certReq | Out-File "C:\\Temp\\cert_request.inf"

# Generar solicitud de certificado
certreq -new "C:\\Temp\\cert_request.inf" "C:\\Temp\\cert_request.csr"

# En laboratorio: usar certificado autofirmado como alternativa
$cert = New-SelfSignedCertificate \`
    -DnsName "intranet.empresa.local","portal.empresa.local" \`
    -CertStoreLocation "cert:\\LocalMachine\\My" \`
    -NotAfter (Get-Date).AddYears(2)

# Añadir binding HTTPS al sitio Intranet
New-WebBinding -Name "Intranet" -Protocol "https" -Port 443 \`
    -HostHeader "intranet.empresa.local" -SslFlags 1

# Asociar certificado al binding
$thumbprint = $cert.Thumbprint
netsh http add sslcert hostnameport="intranet.empresa.local:443" \`
    certhash=$thumbprint \`
    certstorename=MY \`
    appid="{$(New-Guid)}" \`
    clientcertnegotiation=disable

Write-Host "HTTPS configurado para intranet.empresa.local" -ForegroundColor Green`,
        expectedOutput: `SSL Certificate successfully added`,
        hint: 'SslFlags 1 en New-WebBinding indica SNI (Server Name Indication), necesario para múltiples certificados en el mismo puerto 443. Sin SNI, solo puedes tener un certificado SSL por IP.',
      },
    ],
    theory: `## IIS Application Pools: aislamiento de aplicaciones

Un **Application Pool** es un proceso de Windows separado (w3wp.exe) que ejecuta una o más aplicaciones web.

### Identidades de App Pool
| Identidad | Descripción | Uso |
|-----------|-------------|-----|
| **LocalSystem** | Máximos privilegios | Nunca usar |
| **LocalService** | Privilegios reducidos | Legacy |
| **NetworkService** | Acceso a red | Aplicaciones básicas |
| **ApplicationPoolIdentity** | Cuenta virtual aislada | Recomendado |
| **Cuenta de servicio AD** | Cuenta de dominio | Apps que acceden a AD/BD |

### Reciclado de App Pools
IIS puede reiniciar automáticamente los worker processes:
\`\`\`powershell
# Reciclar cada 24h y cuando consume >500MB RAM
Set-ItemProperty "IIS:\\AppPools\\AppPool_Intranet" \`
    -Name recycling.periodicRestart.time \`
    -Value "1.00:00:00"
Set-ItemProperty "IIS:\\AppPools\\AppPool_Intranet" \`
    -Name recycling.periodicRestart.privateMemory \`
    -Value 512000
\`\`\``,
  },

  // ══════════════════════════════════════════════════════
  // MÓDULO 8 — SEGURIDAD
  // ══════════════════════════════════════════════════════

  {
    id: 'security-firewall',
    subject: 'security',
    module_order: 1,
    title: 'Windows Firewall avanzado con PowerShell',
    description: 'Configura el Firewall de Windows con reglas específicas para un servidor AD, documenta la política y crea un script de hardening.',
    difficulty: 'Intermedio',
    xp: 50,
    estimatedMinutes: 25,
    prerequisites: [],
    objectives: [
      'Entender los perfiles de firewall (Domain, Private, Public)',
      'Crear reglas específicas para servicios AD, IIS, RDP',
      'Implementar un script de hardening básico',
    ],
    steps: [
      {
        id: 1,
        title: 'Configuración base del firewall',
        explanation: `Windows Firewall tiene tres perfiles: **Domain** (red de dominio), **Private** (red doméstica) y **Public** (red pública). En un servidor, normalmente solo aplica el perfil Domain.`,
        keyCommand: `Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction`,
        command: `# Ver estado actual de los perfiles
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction

# Configurar perfiles: bloquear todo por defecto en Public y Private
Set-NetFirewallProfile -Profile Public -DefaultInboundAction Block -DefaultOutboundAction Allow
Set-NetFirewallProfile -Profile Private -DefaultInboundAction Block -DefaultOutboundAction Allow

# En perfil Domain: bloquear inbound por defecto (añadiremos reglas explícitas)
Set-NetFirewallProfile -Profile Domain \`
    -DefaultInboundAction Block \`
    -DefaultOutboundAction Allow \`
    -LogAllowed True \`
    -LogBlocked True \`
    -LogMaxSizeKilobytes 32767 \`
    -LogFileName "C:\\Windows\\System32\\LogFiles\\Firewall\\pfirewall.log"

Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, LogFileName`,
        expectedOutput: `Name    Enabled  DefaultInboundAction  LogFileName
----    -------  --------------------  -----------
Domain  True     Block                 C:\\Windows\\...\\pfirewall.log
Private True     Block                 ...
Public  True     Block                 ...`,
        hint: 'Activar logging en el perfil Domain es muy útil para auditoría. Filtra con: Get-Content $logFile | Select-String "DROP" para ver tráfico bloqueado.',
      },
      {
        id: 2,
        title: 'Reglas específicas para DC y servidores',
        explanation: `Creamos reglas explícitas para cada servicio necesario. El principio es **mínimo privilegio**: solo abrir lo necesario, desde las IPs correctas.`,
        keyCommand: `New-NetFirewallRule -DisplayName "AD-LDAP-In" -Direction Inbound -Protocol TCP -LocalPort 389 -Action Allow -Profile Domain`,
        command: `# ── Reglas para Controlador de Dominio ──
$dcRules = @(
    @{Name="AD-LDAP-In";      Port=389; Protocol="TCP"; Description="LDAP para Active Directory"},
    @{Name="AD-LDAPS-In";     Port=636; Protocol="TCP"; Description="LDAP Seguro"},
    @{Name="AD-GC-In";        Port=3268;Protocol="TCP"; Description="Global Catalog"},
    @{Name="AD-Kerberos-In";  Port=88;  Protocol="TCP"; Description="Kerberos autenticación"},
    @{Name="AD-DNS-TCP-In";   Port=53;  Protocol="TCP"; Description="DNS TCP"},
    @{Name="AD-DNS-UDP-In";   Port=53;  Protocol="UDP"; Description="DNS UDP"},
    @{Name="AD-RPC-In";       Port=135; Protocol="TCP"; Description="RPC Endpoint Mapper"},
    @{Name="AD-NetLogon-In";  Port=445; Protocol="TCP"; Description="SMB para SYSVOL/NETLOGON"}
)

foreach ($rule in $dcRules) {
    New-NetFirewallRule \`
        -DisplayName $rule.Name \`
        -Direction Inbound \`
        -Protocol $rule.Protocol \`
        -LocalPort $rule.Port \`
        -Action Allow \`
        -Profile Domain \`
        -Description $rule.Description \`
        -Enabled True | Out-Null
    Write-Host "[+] Regla creada: $($rule.Name)" -ForegroundColor Green
}

# RDP solo desde la subred de administración
New-NetFirewallRule \`
    -DisplayName "RDP-Admin-Only" \`
    -Direction Inbound \`
    -Protocol TCP \`
    -LocalPort 3389 \`
    -RemoteAddress "192.168.1.0/24" \`
    -Action Allow \`
    -Profile Domain`,
        expectedOutput: `[+] Regla creada: AD-LDAP-In
[+] Regla creada: AD-LDAPS-In
[+] Regla creada: AD-GC-In
[+] Regla creada: AD-Kerberos-In
[+] Regla creada: AD-DNS-TCP-In
[+] Regla creada: AD-DNS-UDP-In
[+] Regla creada: AD-RPC-In
[+] Regla creada: AD-NetLogon-In`,
        hint: 'RDP restringido a la subred de admin es una medida esencial. En producción, el acceso RDP a DCs debería ser solo desde bastión (jump server), no directamente.',
      },
      {
        id: 3,
        title: 'Script de hardening básico de servidor',
        explanation: `El hardening es el proceso de reducir la superficie de ataque de un servidor. Este script aplica las medidas básicas recomendadas por CIS Benchmarks.`,
        keyCommand: `Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force`,
        command: `function Invoke-ServerHardening {
    Write-Host "=== HARDENING BÁSICO SERVIDOR WINDOWS ===" -ForegroundColor Cyan

    # 1. Deshabilitar protocolos inseguros
    Write-Host "\`n[1] Deshabilitando protocolos inseguros..."
    @("SMB1","TLS 1.0","TLS 1.1","SSL 2.0","SSL 3.0") | ForEach-Object {
        Write-Host "  - Deshabilitando $_"
    }
    # Deshabilitar SMBv1 (vulnerable a WannaCry/EternalBlue)
    Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force

    # 2. Habilitar características de seguridad de SMB
    Write-Host "\`n[2] Configurando SMB seguro..."
    Set-SmbServerConfiguration -EncryptData $true -Force
    Set-SmbServerConfiguration -RequireSecuritySignature $true -Force

    # 3. Deshabilitar servicios innecesarios
    Write-Host "\`n[3] Deshabilitando servicios innecesarios..."
    $unnecessaryServices = @("Spooler","RemoteRegistry","TelnetD","XboxGipSvc")
    foreach ($svc in $unnecessaryServices) {
        $s = Get-Service $svc -ErrorAction SilentlyContinue
        if ($s -and $s.StartType -ne "Disabled") {
            Stop-Service $svc -ErrorAction SilentlyContinue
            Set-Service $svc -StartupType Disabled -ErrorAction SilentlyContinue
            Write-Host "  - $svc deshabilitado" -ForegroundColor Yellow
        }
    }

    # 4. Configurar Windows Update automático
    Write-Host "\`n[4] Configurando actualizaciones automáticas..."
    $wuKey = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU"
    New-Item $wuKey -Force | Out-Null
    Set-ItemProperty $wuKey "NoAutoUpdate" 0
    Set-ItemProperty $wuKey "AUOptions" 4  # Descargar e instalar automáticamente

    Write-Host "\`n[OK] Hardening completado. Revisar log de auditoría." -ForegroundColor Green
}

Invoke-ServerHardening`,
        expectedOutput: `=== HARDENING BÁSICO SERVIDOR WINDOWS ===

[1] Deshabilitando protocolos inseguros...
  - Deshabilitando SMB1
  - Deshabilitando TLS 1.0
...

[2] Configurando SMB seguro...
[3] Deshabilitando servicios innecesarios...
  - Spooler deshabilitado
  - RemoteRegistry deshabilitado

[4] Configurando actualizaciones automáticas...

[OK] Hardening completado.`,
        hint: 'Deshabilitar el Spooler en DCs y servidores críticos es especialmente importante: la vulnerabilidad PrintNightmare (2021) afectó a todos los servidores Windows con Spooler activo.',
      },
    ],
    theory: `## CIS Benchmarks para Windows Server

El **Center for Internet Security** publica guías de hardening para Windows Server. Los puntos más importantes son:

### Top 10 medidas de seguridad
1. Deshabilitar SMBv1
2. Habilitar firma SMB (RequireSecuritySignature)
3. Deshabilitar NTLM v1 (usar solo NTLMv2 + Kerberos)
4. Restringir acceso a RDP
5. Deshabilitar Print Spooler en DCs
6. Habilitar BitLocker en todos los discos
7. Configurar auditoria de seguridad completa
8. Desactivar cuentas de administrador local
9. Aplicar LAPS (Local Administrator Password Solution)
10. Segmentar la red con VLAN + firewall perimetral

### LAPS: Local Admin Password Solution
\`\`\`powershell
# Instalar LAPS para gestionar contraseñas de admin local
Install-Module LAPS -Force
Update-LapsADSchema
Set-LapsADComputerSelfPermission -Identity "OU=Equipos,DC=empresa,DC=local"
\`\`\``,
  },
];

export const WIN_SCENARIOS = [
  ...WIN_SCENARIOS_BASE,
  ...WIN_SCENARIOS_2,
  ...WIN_SCENARIOS_3,
  ...WIN_SCENARIOS_TROUBLESHOOT,
];
