/**
 * winServerData3.js — Módulos avanzados de Windows Server
 * Hyper-V · PowerShell DSC · WDS/MDT · Azure AD Connect
 */

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULOS
// ─────────────────────────────────────────────────────────────────────────────
export const WIN_MODULES_3 = [
  {
    id: 'hyperv',
    title: 'Hyper-V y Virtualización',
    description: 'Instala y gestiona máquinas virtuales, redes virtuales y snapshots con Hyper-V.',
    icon: '🖥️',
    color: 'from-indigo-600 to-violet-600',
    xp: 280,
    scenarios: ['hyperv-install', 'hyperv-vms'],
  },
  {
    id: 'dsc',
    title: 'PowerShell DSC',
    description: 'Automatiza la configuración de servidores con Desired State Configuration.',
    icon: '⚙️',
    color: 'from-emerald-600 to-teal-600',
    xp: 300,
    scenarios: ['dsc-intro', 'dsc-apply'],
  },
  {
    id: 'wds',
    title: 'WDS y MDT',
    description: 'Despliega sistemas operativos en red con Windows Deployment Services y MDT.',
    icon: '📡',
    color: 'from-sky-600 to-blue-700',
    xp: 260,
    scenarios: ['wds-setup', 'mdt-images'],
  },
  {
    id: 'azure-ad-connect',
    title: 'Azure AD Connect',
    description: 'Sincroniza tu Active Directory local con Azure AD para SSO e identidad híbrida.',
    icon: '☁️',
    color: 'from-blue-500 to-cyan-600',
    xp: 320,
    scenarios: ['aad-prep', 'aad-sync'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIOS
// ─────────────────────────────────────────────────────────────────────────────
export const WIN_SCENARIOS_3 = [

  // ══════════════════════════════════════════════════════
  // HYPER-V
  // ══════════════════════════════════════════════════════
  {
    id: 'hyperv-install',
    moduleId: 'hyperv',
    title: 'Instalación y configuración de Hyper-V',
    description: 'Habilita el rol Hyper-V, crea un switch virtual externo y configura los parámetros base del host.',
    difficulty: 'intermediate',
    xp: 140,
    minutes: 30,
    objectives: [
      'Habilitar el rol Hyper-V mediante PowerShell',
      'Crear un switch virtual externo para conectividad de red',
      'Verificar la instalación y ver las capacidades del host',
    ],
    theory: `## Hyper-V en Windows Server

Hyper-V es el hipervisor de tipo 1 de Microsoft. Se instala como **rol de Windows Server** y permite ejecutar múltiples máquinas virtuales (VMs) sobre el mismo hardware físico.

### Conceptos clave

| Concepto | Descripción |
|---|---|
| Hipervisor | Capa de software que gestiona la virtualización |
| VM | Máquina virtual — sistema operativo aislado |
| Switch Virtual | Red virtual que conecta VMs entre sí o al exterior |
| Checkpoint | Snapshot del estado de una VM en un momento dado |
| VHDX | Formato de disco virtual de Hyper-V |

### Tipos de switch virtual

- **Externo**: Conecta VMs a la red física real del host
- **Interno**: Permite comunicación entre VMs y el host, sin acceso externo
- **Privado**: Solo comunicación entre VMs, sin acceso al host ni al exterior

### Requisitos del hardware

El procesador debe soportar **virtualización por hardware** (Intel VT-x o AMD-V) y la opción debe estar habilitada en la BIOS/UEFI. Comprueba con \`Get-VMHost\` una vez instalado el rol.`,

    steps: [
      {
        title: 'Instalar el rol Hyper-V',
        explanation: `Instalamos Hyper-V con sus herramientas de administración. El parámetro \`-IncludeManagementTools\` instala la consola gráfica y los cmdlets de PowerShell. El flag \`-Restart\` reinicia automáticamente si es necesario (en lab, usamos \`-WhatIf\` para simular).`,
        command: 'Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart',
        expectedOutput: `Success Restart Needed Exit Code Feature Result
------- -------------- --------- --------------
True    Yes            Success   {Hyper-V, Hyper-V Module for Windows P...}`,
        hint: 'Usa Install-WindowsFeature con el parámetro -Name Hyper-V y añade -IncludeManagementTools para las herramientas de administración.',
      },
      {
        title: 'Verificar la instalación de Hyper-V',
        explanation: `Tras el reinicio, verificamos que el rol Hyper-V está instalado y obtenemos información sobre las capacidades del host de virtualización.`,
        command: 'Get-WindowsFeature -Name Hyper-V | Select-Object Name, InstallState',
        expectedOutput: `Name   InstallState
----   ------------
Hyper-V Installed`,
        hint: 'Usa Get-WindowsFeature filtrando por -Name Hyper-V y selecciona Name e InstallState.',
      },
      {
        title: 'Crear un switch virtual externo',
        explanation: `Un switch virtual externo permite que las VMs accedan a la red física. Necesitamos especificar el adaptador de red físico del host (\`NetAdapterName\`) al que conectar el switch.`,
        command: 'New-VMSwitch -Name "ExternalSwitch" -NetAdapterName "Ethernet" -AllowManagementOS $true',
        expectedOutput: `Name           SwitchType NetAdapterInterfaceDescription
----           ---------- ------------------------------
ExternalSwitch External   Intel(R) Ethernet Connection`,
        hint: 'Usa New-VMSwitch con -Name para el nombre, -NetAdapterName para el adaptador físico y -AllowManagementOS $true para que el host también use ese switch.',
      },
      {
        title: 'Verificar el switch virtual creado',
        explanation: `Listamos los switches virtuales disponibles en el host para confirmar que el switch externo se ha creado correctamente.`,
        command: 'Get-VMSwitch | Select-Object Name, SwitchType, NetAdapterInterfaceDescription',
        expectedOutput: `Name           SwitchType NetAdapterInterfaceDescription
----           ---------- ------------------------------
ExternalSwitch External   Intel(R) Ethernet Connection`,
        hint: 'Usa Get-VMSwitch con Select-Object para filtrar las propiedades relevantes.',
      },
      {
        title: 'Obtener información del host Hyper-V',
        explanation: `\`Get-VMHost\` muestra la configuración del host: rutas por defecto para VMs y discos virtuales, número máximo de migraciones en vivo, etc.`,
        command: 'Get-VMHost | Select-Object Name, VirtualMachinePath, VirtualHardDiskPath, LogicalProcessorCount',
        expectedOutput: `Name        VirtualMachinePath       VirtualHardDiskPath           LogicalProcessorCount
----        ------------------       -------------------           ---------------------
WINSERVER   C:\ProgramData\Hyper-V\  C:\Users\Public\Documents\...  8`,
        hint: 'Usa Get-VMHost y selecciona las propiedades Name, VirtualMachinePath, VirtualHardDiskPath y LogicalProcessorCount.',
      },
    ],
  },

  {
    id: 'hyperv-vms',
    moduleId: 'hyperv',
    title: 'Gestión de máquinas virtuales',
    description: 'Crea, configura, inicia y gestiona máquinas virtuales y checkpoints con PowerShell.',
    difficulty: 'advanced',
    xp: 160,
    minutes: 35,
    objectives: [
      'Crear una VM con PowerShell especificando CPU y RAM',
      'Adjuntar un disco virtual VHDX a la VM',
      'Gestionar el ciclo de vida: start, stop, checkpoint',
      'Monitorizar el uso de recursos de las VMs',
    ],
    theory: `## Gestión de VMs con PowerShell

### Cmdlets principales de Hyper-V

\`\`\`
New-VM             — Crear una nueva máquina virtual
Set-VM             — Modificar configuración de una VM existente
Start-VM / Stop-VM — Iniciar o detener una VM
Checkpoint-VM      — Crear un snapshot (checkpoint)
Get-VM             — Listar VMs y su estado
Remove-VM          — Eliminar una VM
\`\`\`

### Generaciones de VM

- **Generación 1**: Compatible con sistemas legacy, BIOS, IDE
- **Generación 2**: UEFI, Secure Boot, mayor rendimiento — recomendada para Windows 8+ y Server 2012+

### Tipos de memoria

- **Estática**: La VM tiene siempre la RAM asignada reservada
- **Dinámica**: La RAM se ajusta según la demanda (Hyper-V Dynamic Memory)`,

    steps: [
      {
        title: 'Crear una nueva máquina virtual',
        explanation: `Creamos una VM de Generación 2 con 2 GB de RAM dinámica. El switch virtual que usamos es el que creamos en el escenario anterior.`,
        command: 'New-VM -Name "VM-Test01" -MemoryStartupBytes 2GB -Generation 2 -SwitchName "ExternalSwitch"',
        expectedOutput: `Name      State CPUUsage(%) MemoryAssigned(M) Uptime   Status             Version
----      ----- ----------- ----------------- ------   ------             -------
VM-Test01 Off   0           0                 00:00:00 Operating normally 10.0`,
        hint: 'Usa New-VM con -Name, -MemoryStartupBytes 2GB, -Generation 2 y -SwitchName con el nombre del switch.',
      },
      {
        title: 'Crear y adjuntar un disco virtual VHDX',
        explanation: `Creamos un disco virtual de 60 GB de tipo dinámico (crece a medida que se llena) y lo adjuntamos a la VM como disco duro.`,
        command: 'New-VHD -Path "C:\\Hyper-V\\VM-Test01\\disk.vhdx" -SizeBytes 60GB -Dynamic | Add-VMHardDiskDrive -VMName "VM-Test01"',
        expectedOutput: `ComputerName ControllerType ControllerNumber ControllerLocation DiskNumber Path
------------ -------------- ---------------- ------------------ ---------- ----
WINSERVER    SCSI           0                0                             C:\Hyper-V\VM-Test01\disk.vhdx`,
        hint: 'Usa New-VHD con -Path, -SizeBytes 60GB y -Dynamic, luego pipe a Add-VMHardDiskDrive con -VMName.',
      },
      {
        title: 'Configurar RAM dinámica en la VM',
        explanation: `Habilitamos la memoria dinámica (Dynamic Memory) para que la VM pueda usar entre 512 MB y 4 GB según la demanda, con un valor de inicio de 2 GB.`,
        command: 'Set-VMMemory -VMName "VM-Test01" -DynamicMemoryEnabled $true -MinimumBytes 512MB -MaximumBytes 4GB -StartupBytes 2GB',
        expectedOutput: ``,
        hint: 'Usa Set-VMMemory con -VMName, -DynamicMemoryEnabled $true, y especifica -MinimumBytes, -MaximumBytes y -StartupBytes.',
      },
      {
        title: 'Iniciar la máquina virtual',
        explanation: `Iniciamos la VM. El estado cambiará de "Off" a "Running". Podemos conectarnos a ella con \`vmconnect.exe\` o Hyper-V Manager.`,
        command: 'Start-VM -Name "VM-Test01"',
        expectedOutput: ``,
        hint: 'Usa Start-VM con -Name seguido del nombre de la VM.',
      },
      {
        title: 'Crear un checkpoint (snapshot)',
        explanation: `Un checkpoint captura el estado completo de la VM en un momento dado. Si algo sale mal, podemos restaurarla a este punto. Útil antes de actualizaciones o cambios importantes.`,
        command: 'Checkpoint-VM -Name "VM-Test01" -SnapshotName "Pre-Config-Snapshot"',
        expectedOutput: ``,
        hint: 'Usa Checkpoint-VM con -Name para la VM y -SnapshotName para dar un nombre descriptivo al checkpoint.',
      },
      {
        title: 'Listar todas las VMs y su estado',
        explanation: `Verificamos el estado de todas las VMs del host. Vemos CPU, RAM asignada, estado y tiempo de actividad.`,
        command: 'Get-VM | Select-Object Name, State, CPUUsage, MemoryAssigned, Uptime | Format-Table -AutoSize',
        expectedOutput: `Name      State   CPUUsage MemoryAssigned  Uptime
----      -----   -------- --------------  ------
VM-Test01 Running 3        2147483648      00:02:14`,
        hint: 'Usa Get-VM con Select-Object para filtrar las propiedades y Format-Table -AutoSize para la visualización.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // POWERSHELL DSC
  // ══════════════════════════════════════════════════════
  {
    id: 'dsc-intro',
    moduleId: 'dsc',
    title: 'Introducción a PowerShell DSC',
    description: 'Aprende a escribir configuraciones DSC para definir el estado deseado de un servidor.',
    difficulty: 'advanced',
    xp: 150,
    minutes: 35,
    objectives: [
      'Entender el modelo declarativo de DSC',
      'Escribir una configuración DSC básica',
      'Compilar la configuración a MOF',
      'Aplicar la configuración localmente',
    ],
    theory: `## PowerShell Desired State Configuration (DSC)

DSC es un framework de gestión de configuración **declarativo** — describes el **estado que deseas**, no los pasos para llegar a él. El sistema se encarga de alcanzar y mantener ese estado.

### Modos de operación

| Modo | Descripción |
|---|---|
| **Push** | El administrador envía la configuración al nodo manualmente |
| **Pull** | El nodo consulta periódicamente un servidor pull para obtener su configuración |

### Estructura de una configuración DSC

\`\`\`powershell
Configuration MiConfig {
    Node "NombreServidor" {
        WindowsFeature InstalarFeature {
            Name   = "Web-Server"
            Ensure = "Present"   # o "Absent" para eliminar
        }
        File CrearArchivo {
            DestinationPath = "C:\\config.txt"
            Contents        = "Configurado por DSC"
            Ensure          = "Present"
        }
    }
}
\`\`\`

### Recursos DSC integrados

- \`WindowsFeature\` — instalar/eliminar roles
- \`File\` — gestionar archivos y directorios
- \`Registry\` — gestionar claves de registro
- \`Service\` — gestionar servicios de Windows
- \`User\` / \`Group\` — gestionar usuarios y grupos locales`,

    steps: [
      {
        title: 'Verificar la versión de PowerShell y DSC',
        explanation: `Primero comprobamos que tenemos PowerShell 5.x o superior y que DSC está disponible. LCM = Local Configuration Manager, el motor de DSC en el nodo.`,
        command: 'Get-DscLocalConfigurationManager | Select-Object LCMState, RefreshMode, ConfigurationMode',
        expectedOutput: `LCMState      RefreshMode ConfigurationMode
---------     ----------- -----------------
Idle          Push        ApplyAndMonitor`,
        hint: 'Usa Get-DscLocalConfigurationManager y selecciona LCMState, RefreshMode y ConfigurationMode.',
      },
      {
        title: 'Crear un script de configuración DSC',
        explanation: `Definimos una configuración DSC que instala IIS (Web-Server) y crea un archivo de marca. En la práctica este bloque iría en un archivo .ps1, pero aquí usamos Here-String y lo ejecutamos directamente.`,
        keyCommand: `WebServerConfig -OutputPath "C:\\DSC\\WebServerConfig"`,
        command: `Configuration WebServerConfig {
    Node "localhost" {
        WindowsFeature IIS {
            Name   = "Web-Server"
            Ensure = "Present"
        }
    }
}
WebServerConfig -OutputPath "C:\\DSC\\WebServerConfig"`,
        expectedOutput: `    Directory: C:\DSC\WebServerConfig

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        01/01/2024  10:00             1234   localhost.mof`,
        hint: 'El comando declara el bloque Configuration y luego lo ejecuta con -OutputPath para generar el MOF.',
      },
      {
        title: 'Ver el contenido del archivo MOF generado',
        explanation: `El archivo MOF (Managed Object Format) es la representación compilada de la configuración DSC. Es el fichero que se envía al nodo o que el LCM interpreta.`,
        command: 'Get-Content "C:\\DSC\\WebServerConfig\\localhost.mof"',
        expectedOutput: `/*
@TargetNode='localhost'
@GeneratedBy=Administrator
@GenerationDate=01/01/2024 10:00:00
@GenerationHost=WINSERVER
*/

instance of MSFT_RoleResource as $MSFT_RoleResource1ref
{
ResourceID = "[WindowsFeature]IIS";
Name = "Web-Server";
Ensure = "Present";
};`,
        hint: 'Usa Get-Content con la ruta completa al archivo localhost.mof generado.',
      },
      {
        title: 'Aplicar la configuración DSC localmente',
        explanation: `Aplicamos la configuración al nodo local. El LCM leerá el MOF y realizará los cambios necesarios para alcanzar el estado deseado.`,
        command: 'Start-DscConfiguration -Path "C:\\DSC\\WebServerConfig" -Wait -Verbose -Force',
        expectedOutput: `VERBOSE: Perform operation 'Invoke CimMethod' with following parameters, ''methodName' = SendConfiguration...
VERBOSE: An LCM method call arrived from computer WINSERVER with user sid S-1-5-21...
VERBOSE: [WINSERVER]: LCM: [ Start Set ]
VERBOSE: [WINSERVER]: [[WindowsFeature]IIS] The operation 'Set' started.
VERBOSE: [WINSERVER]: [[WindowsFeature]IIS] Installed Web-Server successfully.
VERBOSE: [WINSERVER]: LCM: [ End Set ] ...`,
        hint: 'Usa Start-DscConfiguration con -Path al directorio del MOF, -Wait para esperar a que termine y -Verbose para ver el progreso.',
      },
      {
        title: 'Verificar el estado de la configuración DSC',
        explanation: `\`Test-DscConfiguration\` comprueba si el nodo cumple con la configuración deseada. Si devuelve \`True\`, el nodo está en el estado correcto.`,
        command: 'Test-DscConfiguration -Verbose',
        expectedOutput: `VERBOSE: Perform operation 'Invoke CimMethod' ...
VERBOSE: [WINSERVER]: [[WindowsFeature]IIS] Test-TargetResource:  The resource is in the desired state.
True`,
        hint: 'Usa Test-DscConfiguration con -Verbose para ver el resultado detallado de cada recurso.',
      },
    ],
  },

  {
    id: 'dsc-apply',
    moduleId: 'dsc',
    title: 'DSC avanzado — Recursos y Pull Server',
    description: 'Usa recursos DSC para gestionar usuarios, servicios y archivos. Configura el LCM en modo Pull.',
    difficulty: 'advanced',
    xp: 160,
    minutes: 40,
    objectives: [
      'Usar múltiples recursos DSC en una configuración',
      'Configurar el LCM en modo ApplyAndAutoCorrect',
      'Instalar y usar módulos de recursos DSC de la galería',
      'Entender el ciclo de vida del Pull Server',
    ],
    theory: `## DSC Avanzado

### LCM — Local Configuration Manager

El LCM es el motor que ejecuta DSC en cada nodo. Sus parámetros más importantes:

| Parámetro | Descripción |
|---|---|
| \`ConfigurationMode\` | ApplyOnly / ApplyAndMonitor / ApplyAndAutoCorrect |
| \`RefreshMode\` | Push / Pull |
| \`RefreshFrequencyMins\` | Cada cuántos minutos el nodo consulta el pull server |
| \`ConfigurationModeFrequencyMins\` | Cada cuántos minutos aplica/verifica la configuración |

### ApplyAndAutoCorrect

Con este modo, si alguien modifica manualmente el servidor (config drift), el LCM detecta la desviación y **restaura automáticamente** el estado deseado. Ideal para entornos de producción.

### PSGallery Resources

La galería de PowerShell tiene cientos de recursos DSC:
\`\`\`powershell
Find-Module -Tag DSCResource | Select Name, Version
Install-Module -Name NetworkingDsc -Force
\`\`\``,

    steps: [
      {
        title: 'Configurar el LCM en modo ApplyAndAutoCorrect',
        explanation: `Configuramos el LCM para que aplique la configuración y corrija automáticamente cualquier desviación cada 30 minutos. El bloque \`LocalConfigurationManager\` es la configuración meta de DSC.`,
        keyCommand: `Set-DscLocalConfigurationManager -Path "C:\\DSC\\LCM" -Verbose`,
        command: `[DSCLocalConfigurationManager()]
Configuration LCMConfig {
    Node "localhost" {
        Settings {
            ConfigurationMode = "ApplyAndAutoCorrect"
            RefreshMode       = "Push"
            RefreshFrequencyMins           = 30
            ConfigurationModeFrequencyMins = 30
        }
    }
}
LCMConfig -OutputPath "C:\\DSC\\LCM"
Set-DscLocalConfigurationManager -Path "C:\\DSC\\LCM" -Verbose`,
        expectedOutput: `VERBOSE: Performing operation 'Set-DscLocalConfigurationManager' on target 'WINSERVER'.
VERBOSE: [WINSERVER]: LCM: [ Start Set ] ...
VERBOSE: [WINSERVER]: LCM: [ End Set ] ...`,
        hint: 'La configuración del LCM usa [DSCLocalConfigurationManager()] como atributo. Luego Set-DscLocalConfigurationManager aplica el meta-MOF.',
      },
      {
        title: 'Instalar un módulo de recursos DSC de la galería',
        explanation: `\`xWebAdministration\` es un módulo de recursos DSC de la comunidad para gestionar IIS de forma avanzada. Lo instalamos desde PSGallery.`,
        command: 'Install-Module -Name xWebAdministration -Force -AllowClobber',
        expectedOutput: `Installing package 'xWebAdministration'
  Installing package 'xWebAdministration' (version 3.3.0)
[ooooooooooooooooooooooooooooooooooooooooo]`,
        hint: 'Usa Install-Module con -Name xWebAdministration y los flags -Force -AllowClobber.',
      },
      {
        title: 'Crear configuración DSC con múltiples recursos',
        explanation: `Creamos una configuración que gestiona IIS, un sitio web específico, y un servicio de Windows, todo de forma declarativa en un único bloque.`,
        keyCommand: `WebAppConfig -OutputPath "C:\\DSC\\WebApp"`,
        command: `Configuration WebAppConfig {
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -ModuleName xWebAdministration
    Node "localhost" {
        WindowsFeature IIS { Name = "Web-Server"; Ensure = "Present" }
        Service W3SVC { Name = "W3SVC"; State = "Running"; StartupType = "Automatic" }
        xWebsite DefaultSite { Name = "Default Web Site"; State = "Started"; PhysicalPath = "C:\\inetpub\\wwwroot"; Ensure = "Present"; DependsOn = "[WindowsFeature]IIS" }
    }
}
WebAppConfig -OutputPath "C:\\DSC\\WebApp"`,
        expectedOutput: `    Directory: C:\DSC\WebApp

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        01/01/2024  10:30             2048   localhost.mof`,
        hint: 'Usa Import-DscResource para los dos módulos y define los tres recursos: WindowsFeature, Service y xWebsite con DependsOn.',
      },
      {
        title: 'Verificar módulos DSC instalados',
        explanation: `Comprobamos qué módulos de recursos DSC están disponibles en el sistema para usarlos en nuestras configuraciones.`,
        command: 'Get-DscResource | Select-Object Name, Module, Version | Sort-Object Module | Format-Table -AutoSize',
        expectedOutput: `Name                  Module                  Version
----                  ------                  -------
File                  PSDesiredStateConfig... 1.1
WindowsFeature        PSDesiredStateConfig... 1.1
Service               PSDesiredStateConfig... 1.1
xWebsite              xWebAdministration      3.3.0
xWebApplication       xWebAdministration      3.3.0`,
        hint: 'Usa Get-DscResource con Select-Object para Name, Module y Version, ordena por Module y formatea como tabla.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // WDS / MDT
  // ══════════════════════════════════════════════════════
  {
    id: 'wds-setup',
    moduleId: 'wds',
    title: 'Configuración de Windows Deployment Services',
    description: 'Instala y configura WDS para desplegar sistemas operativos en red mediante PXE boot.',
    difficulty: 'intermediate',
    xp: 130,
    minutes: 30,
    objectives: [
      'Instalar el rol WDS en Windows Server',
      'Configurar el servidor WDS con la ruta de imágenes',
      'Añadir una imagen de arranque (Boot Image)',
      'Configurar opciones DHCP para PXE boot',
    ],
    theory: `## Windows Deployment Services (WDS)

WDS permite desplegar sistemas operativos a través de la red sin necesidad de medios físicos. Los equipos arrancan mediante **PXE** (Preboot Execution Environment) y obtienen la imagen del servidor WDS.

### Componentes de WDS

| Componente | Descripción |
|---|---|
| **Boot Image** | Imagen WinPE que arranca el cliente PXE |
| **Install Image** | Imagen del SO a instalar (WIM de Windows Server/Client) |
| **Image Group** | Agrupación lógica de imágenes de instalación |

### Flujo de despliegue PXE

\`\`\`
1. Cliente arranca → solicita IP via DHCP
2. DHCP responde con IP + dirección del servidor PXE (opción 66/67)
3. Cliente descarga la Boot Image (WinPE) del servidor WDS
4. WinPE arranca → muestra menú de instalación
5. Usuario selecciona Install Image
6. WDS transfiere la imagen → instalación desatendida
\`\`\`

### Prerequisitos

- AD DS instalado (WDS requiere dominio)
- DHCP configurado en la red
- Partición NTFS con espacio suficiente para las imágenes`,

    steps: [
      {
        title: 'Instalar el rol WDS',
        explanation: `Instalamos WDS con los dos subcomponentes: \`WDS-Deployment\` (el servicio de despliegue) y \`WDS-Transport\` (el servidor de transporte multicast).`,
        command: 'Install-WindowsFeature -Name WDS -IncludeManagementTools -IncludeAllSubFeature',
        expectedOutput: `Success Restart Needed Exit Code Feature Result
------- -------------- --------- --------------
True    No             Success   {Windows Deployment Services, WDS Dep...}`,
        hint: 'Usa Install-WindowsFeature con -Name WDS y añade -IncludeManagementTools -IncludeAllSubFeature.',
      },
      {
        title: 'Configurar el servidor WDS',
        explanation: `Inicializamos WDS especificando la carpeta donde almacenará las imágenes. El servidor se configura para responder automáticamente a todos los clientes PXE.`,
        command: 'wdsutil /Initialize-Server /RemInst:"C:\\RemoteInstall" /Authorize',
        expectedOutput: `The operation completed successfully.
WDS Server is initialized.
BINL is authorized in DHCP.`,
        hint: 'Usa wdsutil con /Initialize-Server, la ruta /RemInst y la opción /Authorize para autorizar el servidor en DHCP.',
      },
      {
        title: 'Configurar la respuesta automática PXE',
        explanation: `Configuramos WDS para que responda automáticamente a todos los clientes PXE conocidos y desconocidos, lo que simplifica el proceso de despliegue masivo.`,
        command: 'wdsutil /Set-Server /AnswerClients:All /PxePromptPolicy /Known:NoPrompt /New:NoPrompt',
        expectedOutput: `The operation completed successfully.`,
        hint: 'Usa wdsutil /Set-Server /AnswerClients:All y configura /PxePromptPolicy para clientes conocidos y nuevos.',
      },
      {
        title: 'Añadir una imagen de arranque Boot Image',
        explanation: `Añadimos la imagen WinPE de arranque. Esta imagen (boot.wim) es la que el cliente PXE descarga para iniciar el proceso de instalación. Se encuentra en el DVD de Windows.`,
        command: 'Import-WdsBootImage -Path "D:\\sources\\boot.wim" -NewImageName "Windows Server 2022 PE" -NewDescription "Boot Image WS2022"',
        expectedOutput: `FileName    : boot.wim
ImageName   : Windows Server 2022 PE
Description : Boot Image WS2022
Enabled     : True`,
        hint: 'Usa Import-WdsBootImage con -Path al boot.wim del DVD, -NewImageName y -NewDescription.',
      },
      {
        title: 'Verificar el estado del servicio WDS',
        explanation: `Comprobamos que el servicio WDS (WDSSERVER) está en ejecución y configurado correctamente.`,
        command: 'Get-Service -Name WDSServer | Select-Object Name, Status, StartType',
        expectedOutput: `Name      Status  StartType
----      ------  ---------
WDSServer Running Automatic`,
        hint: 'Usa Get-Service con -Name WDSServer y selecciona Name, Status y StartType.',
      },
    ],
  },

  {
    id: 'mdt-images',
    moduleId: 'wds',
    title: 'Microsoft Deployment Toolkit (MDT)',
    description: 'Crea un Deployment Share, captura imágenes y automatiza instalaciones con MDT.',
    difficulty: 'advanced',
    xp: 140,
    minutes: 40,
    objectives: [
      'Instalar MDT y el Windows ADK',
      'Crear un Deployment Share',
      'Importar un sistema operativo al share',
      'Crear una task sequence de instalación desatendida',
    ],
    theory: `## Microsoft Deployment Toolkit (MDT)

MDT es una herramienta gratuita de Microsoft que extiende WDS para ofrecer despliegues automatizados y personalizables. Gestiona **Task Sequences** (secuencias de tareas) que definen cada paso del despliegue.

### Componentes de MDT

- **Deployment Share**: Recurso compartido de red donde residen las imágenes, controladores y aplicaciones
- **Task Sequence**: Serie de pasos ordenados que definen la instalación (formatear disco, instalar SO, instalar apps, configurar sistema...)
- **Bootstrap.ini**: Configuración inicial que el WinPE usa al arrancar
- **CustomSettings.ini**: Personalización del despliegue (nombre de equipo, OU de AD, etc.)
- **LiteTouch** vs **ZeroTouch**: LiteTouch requiere mínima interacción del usuario; ZeroTouch es 100% desatendido (necesita SCCM/Intune)`,

    steps: [
      {
        title: 'Verificar la instalación de MDT',
        explanation: `MDT debe instalarse descargándolo de Microsoft junto con el Windows ADK. Verificamos que el módulo de MDT para PowerShell está disponible.`,
        command: 'Import-Module "C:\\Program Files\\Microsoft Deployment Toolkit\\bin\\MicrosoftDeploymentToolkit.psd1"',
        expectedOutput: ``,
        hint: 'Usa Import-Module con la ruta completa al módulo MicrosoftDeploymentToolkit.psd1.',
      },
      {
        title: 'Crear un nuevo Deployment Share',
        explanation: `Creamos el Deployment Share, que es la carpeta compartida donde MDT almacena todo el material de despliegue. Este share debe ser accesible desde la red.`,
        command: 'New-PSDrive -Name "DS001" -PSProvider MDTProvider -Root "C:\\DeploymentShare" -Description "Production Deployment Share" -NetworkPath "\\\\WINSERVER\\DeploymentShare$" -Verbose | Add-MDTPersistentDrive -Verbose',
        expectedOutput: `VERBOSE: New-PSDrive ...
Name  : DS001
Root  : C:\DeploymentShare
Description: Production Deployment Share`,
        hint: 'Usa New-PSDrive con -PSProvider MDTProvider y pipe a Add-MDTPersistentDrive para que persista entre sesiones.',
      },
      {
        title: 'Importar un sistema operativo al Deployment Share',
        explanation: `Importamos los archivos del SO desde el DVD o ISO montado. MDT copia los archivos necesarios al Deployment Share y los registra en su base de datos.`,
        command: 'Import-MDTOperatingSystem -Path "DS001:\\Operating Systems" -SourcePath "D:\\" -DestinationFolder "Windows Server 2022"',
        expectedOutput: `Importing OS files...
  Copying files... [████████████████████] 100%
Import complete. OS: Windows Server 2022 SERVERSTANDARD
  ID: {12345678-1234-1234-1234-123456789012}`,
        hint: 'Usa Import-MDTOperatingSystem con -Path al destino en el share, -SourcePath al DVD montado y -DestinationFolder.',
      },
      {
        title: 'Crear una Task Sequence',
        explanation: `La Task Sequence define todos los pasos del despliegue. El template \`StandardServer\` incluye los pasos estándar para instalar Windows Server de forma desatendida.`,
        command: 'Import-MDTTaskSequence -Path "DS001:\\Task Sequences" -Name "Deploy WS2022 Standard" -Template "StandardServer.xml" -Comment "Despliegue WS2022 STANDARDCORE" -ID "WS2022-STD" -Version "1.0" -OperatingSystemPath "DS001:\\Operating Systems\\Windows Server 2022" -FullName "Administrator" -OrgName "Tech4U Academy" -HomePage "about:blank"',
        expectedOutput: `Import-MDTTaskSequence complete.
Task Sequence ID : WS2022-STD
Name             : Deploy WS2022 Standard`,
        hint: 'Usa Import-MDTTaskSequence con los parámetros -Path, -Name, -Template, -ID, -OperatingSystemPath y los datos de organización.',
      },
      {
        title: 'Actualizar el Deployment Share (generar ISO/WIM)',
        explanation: `Este paso regenera el LiteTouch WinPE basándose en la configuración actual del Deployment Share. Genera el boot.wim y la ISO LiteTouchPE para importar en WDS.`,
        command: 'Update-MDTDeploymentShare -Path "DS001:" -Force',
        expectedOutput: `Updating MDT Deployment Share...
  Generating LiteTouch WinPE...
  Processing drivers...
  Creating bootable media...
Update complete. Files in C:\DeploymentShare\Boot\
  LiteTouchPE_x64.iso
  LiteTouchPE_x64.wim`,
        hint: 'Usa Update-MDTDeploymentShare con -Path apuntando al drive MDT y -Force para regenerar todo.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // AZURE AD CONNECT
  // ══════════════════════════════════════════════════════
  {
    id: 'aad-prep',
    moduleId: 'azure-ad-connect',
    title: 'Preparación para Azure AD Connect',
    description: 'Verifica los prerrequisitos, configura UPNs y prepara el AD local para la sincronización híbrida.',
    difficulty: 'advanced',
    xp: 160,
    minutes: 35,
    objectives: [
      'Verificar los requisitos de AD y conectividad con Azure',
      'Configurar el sufijo UPN personalizado',
      'Preparar las cuentas de servicio necesarias',
      'Verificar la salud del AD antes de sincronizar',
    ],
    theory: `## Azure AD Connect — Identidad Híbrida

Azure AD Connect sincroniza objetos de tu **Active Directory local** (on-premises) con **Azure Active Directory** (ahora Entra ID). Esto permite:

- **Single Sign-On (SSO)**: Los usuarios usan las mismas credenciales on-prem y en la nube
- **Sincronización de contraseñas** (Password Hash Sync - PHS): Las contraseñas se sincronizan hasheadas
- **Pass-through Authentication (PTA)**: La autenticación se delega al AD local
- **Federation con AD FS**: Autenticación federada completa

### Métodos de autenticación

| Método | Descripción | Complejidad |
|---|---|---|
| Password Hash Sync | Sync del hash de contraseña | Baja |
| Pass-through Auth | Auth delegada al AD local | Media |
| Federation (ADFS) | Token federation | Alta |

### Prerrequisitos

- Windows Server 2016/2019/2022 para el servidor de Azure AD Connect
- Al menos 4 GB RAM, 70 GB disco
- Conectividad a internet (puertos 443, 9090-9091)
- Cuenta Global Administrator en Azure AD
- Cuenta Enterprise Administrator en AD local`,

    steps: [
      {
        title: 'Verificar la conectividad con Azure AD',
        explanation: `Antes de instalar Azure AD Connect, verificamos que el servidor tiene conectividad con los endpoints de Microsoft necesarios para la sincronización.`,
        command: 'Test-NetConnection -ComputerName "login.microsoftonline.com" -Port 443',
        expectedOutput: `ComputerName     : login.microsoftonline.com
RemoteAddress    : 20.190.144.147
RemotePort       : 443
InterfaceAlias   : Ethernet
SourceAddress    : 192.168.1.100
TcpTestSucceeded : True`,
        hint: 'Usa Test-NetConnection con -ComputerName apuntando a login.microsoftonline.com y -Port 443.',
      },
      {
        title: 'Añadir sufijo UPN personalizado al dominio',
        explanation: `El sufijo UPN debe coincidir con el dominio verificado en Azure AD. Si el dominio local es \`corp.local\` (no enrutable), añadimos el dominio público \`empresa.com\` como sufijo UPN alternativo.`,
        command: 'Get-ADForest | Select-Object -ExpandProperty UPNSuffixes',
        expectedOutput: `empresa.com`,
        hint: 'Usa Get-ADForest con Select-Object -ExpandProperty UPNSuffixes para ver los sufijos configurados.',
      },
      {
        title: 'Configurar el sufijo UPN en el bosque',
        explanation: `Añadimos el dominio verificado en Azure AD como sufijo UPN del bosque de AD, de forma que los usuarios puedan tener UPNs del tipo usuario@empresa.com.`,
        command: 'Set-ADForest -Identity "corp.local" -UPNSuffixes @{Add="empresa.com"}',
        expectedOutput: ``,
        hint: 'Usa Set-ADForest con -Identity y -UPNSuffixes @{Add="dominio"} para añadir el nuevo sufijo.',
      },
      {
        title: 'Actualizar UPN de usuarios para la sincronización',
        explanation: `Actualizamos el UPN de los usuarios del dominio para que usen el sufijo correcto que coincide con Azure AD. En producción se haría de forma selectiva, aquí lo mostramos para un OU específico.`,
        command: 'Get-ADUser -Filter * -SearchBase "OU=Usuarios,DC=corp,DC=local" | ForEach-Object { Set-ADUser $_ -UserPrincipalName ($_.SamAccountName + "@empresa.com") }',
        expectedOutput: ``,
        hint: 'Usa Get-ADUser con -Filter * y -SearchBase, luego pipe a ForEach-Object con Set-ADUser para actualizar el UPN.',
      },
      {
        title: 'Verificar salud del AD con IdFix',
        explanation: `Antes de sincronizar, ejecutamos una verificación de objetos duplicados o con formato incorrecto. Aquí verificamos con PowerShell nativo buscando objetos con UPN duplicado.`,
        command: 'Get-ADUser -Filter * -Properties UserPrincipalName | Group-Object UserPrincipalName | Where-Object { $_.Count -gt 1 } | Select-Object Name, Count',
        expectedOutput: `(Sin resultados — no hay UPNs duplicados)`,
        hint: 'Usa Get-ADUser con -Properties UserPrincipalName, pipe a Group-Object y filtra donde Count -gt 1.',
      },
    ],
  },

  {
    id: 'aad-sync',
    moduleId: 'azure-ad-connect',
    title: 'Azure AD Connect — Sincronización y SSO',
    description: 'Gestiona ciclos de sincronización, filtra OUs, configura Password Hash Sync y verifica la identidad híbrida.',
    difficulty: 'advanced',
    xp: 170,
    minutes: 40,
    objectives: [
      'Verificar el estado de la sincronización de Azure AD Connect',
      'Ejecutar sincronizaciones manuales delta y full',
      'Monitorizar errores de sincronización',
      'Verificar objetos sincronizados en Azure AD',
    ],
    theory: `## Gestión de la Sincronización

Una vez instalado Azure AD Connect, el servicio **ADSync** gestiona la sincronización automáticamente. Por defecto, sincroniza cada **30 minutos**.

### Tipos de sincronización

| Tipo | Descripción | Cuándo usarlo |
|---|---|---|
| **Delta Sync** | Solo objetos modificados desde la última sync | Operación normal |
| **Full Sync** | Todos los objetos del AD | Tras cambios de configuración |
| **Full Import** | Reimporta todos los objetos del conector | Tras cambios de esquema |

### Módulo ADSync PowerShell

\`\`\`powershell
Import-Module ADSync
Get-ADSyncScheduler          # ver configuración del scheduler
Start-ADSyncSyncCycle        # iniciar ciclo manual
Get-ADSyncConnector          # ver conectores configurados
Get-ADSyncRunProfileResult   # ver historial de sync
\`\`\`

### Errores comunes de sincronización

- **AttributeValueMustBeUnique**: UPN o proxyAddress duplicado
- **ObjectTypeMismatch**: Conflicto de tipo de objeto entre AD local y Azure AD
- **InvalidSoftMatch**: No se puede hacer soft-match automático entre objetos`,

    steps: [
      {
        title: 'Importar el módulo ADSync',
        explanation: `El módulo ADSync proporciona los cmdlets para gestionar Azure AD Connect desde PowerShell. Debe ejecutarse en el servidor donde está instalado Azure AD Connect.`,
        command: 'Import-Module ADSync; Get-ADSyncScheduler | Select-Object SyncCycleEnabled, NextSyncCyclePolicyType, CurrentlyRunning',
        expectedOutput: `SyncCycleEnabled NextSyncCyclePolicyType CurrentlyRunning
---------------- ----------------------- ----------------
True             Delta                   False`,
        hint: 'Usa Import-Module ADSync y luego Get-ADSyncScheduler con Select-Object para ver el estado del scheduler.',
      },
      {
        title: 'Ejecutar una sincronización delta manual',
        explanation: `Forzamos una sincronización delta para que los cambios recientes en el AD local se propaguen a Azure AD inmediatamente, sin esperar al ciclo automático de 30 minutos.`,
        command: 'Start-ADSyncSyncCycle -PolicyType Delta',
        expectedOutput: `Result
------
Success`,
        hint: 'Usa Start-ADSyncSyncCycle con -PolicyType Delta para sincronizar solo los cambios desde la última sync.',
      },
      {
        title: 'Verificar el resultado del último ciclo de sincronización',
        explanation: `Comprobamos el historial de ejecuciones para ver si la última sincronización fue exitosa o si hubo errores.`,
        command: 'Get-ADSyncRunProfileResult | Sort-Object StartDate -Descending | Select-Object -First 5 | Format-Table StartDate, RunProfileName, Result -AutoSize',
        expectedOutput: `StartDate           RunProfileName Result
---------           -------------- ------
01/01/2024 10:30:00 Delta Import   success
01/01/2024 10:30:05 Delta Sync     success
01/01/2024 10:30:10 Export         success`,
        hint: 'Usa Get-ADSyncRunProfileResult, ordena por StartDate descendente, toma los primeros 5 y formatea como tabla.',
      },
      {
        title: 'Ver errores de sincronización de objetos',
        explanation: `Identificamos objetos que fallaron durante la sincronización. Esto es esencial para diagnosticar problemas de identidad híbrida.`,
        command: 'Get-ADSyncCSObject -ConnectorName "empresa.com - AAD" -ErrorState | Select-Object DN, ErrorCode, ErrorDescription | Format-Table -AutoSize',
        expectedOutput: `(Sin errores de sincronización)

DN  ErrorCode  ErrorDescription
--  ---------  ----------------`,
        hint: 'Usa Get-ADSyncCSObject con -ConnectorName del conector de Azure AD y -ErrorState para filtrar solo los objetos con error.',
      },
      {
        title: 'Verificar conectores configurados',
        explanation: `Listamos los conectores de Azure AD Connect para confirmar que tanto el conector de AD local como el de Azure AD están operativos.`,
        command: 'Get-ADSyncConnector | Select-Object Name, Type, ConnectorTypeName | Format-Table -AutoSize',
        expectedOutput: `Name                Type ConnectorTypeName
----                ---- -----------------
corp.local          AD   Active Directory
empresa.com - AAD   AAD  Windows Azure Active Directory`,
        hint: 'Usa Get-ADSyncConnector con Select-Object Name, Type y ConnectorTypeName, formateado como tabla.',
      },
    ],
  },
];
