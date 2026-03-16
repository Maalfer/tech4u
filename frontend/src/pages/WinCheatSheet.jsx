import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Copy, Check, Monitor, BookOpen, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import logoImg from '../assets/tech4u_logo.png';

// ── Cheat sheet data ────────────────────────────────────────────────────────
const CHEAT_SECTIONS = [
  {
    id: 'ad',
    label: 'Active Directory',
    icon: '🏛️',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    commands: [
      { title: 'Instalar AD DS', cmd: 'Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools' },
      { title: 'Nuevo bosque AD', cmd: 'Install-ADDSForest -DomainName "empresa.local" -InstallDns -Force' },
      { title: 'Crear usuario AD', cmd: 'New-ADUser -Name "Juan Lopez" -SamAccountName "jlopez" -AccountPassword (ConvertTo-SecureString "Pass123!" -AsPlainText -Force) -Enabled $true' },
      { title: 'Crear grupo AD', cmd: 'New-ADGroup -Name "Ventas" -GroupScope Global -GroupCategory Security -Path "OU=Grupos,DC=empresa,DC=local"' },
      { title: 'Agregar usuario a grupo', cmd: 'Add-ADGroupMember -Identity "Ventas" -Members "jlopez","mgarcia"' },
      { title: 'Crear OU', cmd: 'New-ADOrganizationalUnit -Name "Marketing" -Path "DC=empresa,DC=local"' },
      { title: 'Mover objeto a OU', cmd: 'Move-ADObject -Identity "CN=jlopez,CN=Users,DC=empresa,DC=local" -TargetPath "OU=Marketing,DC=empresa,DC=local"' },
      { title: 'Buscar usuarios deshabilitados', cmd: 'Search-ADAccount -AccountDisabled -UsersOnly | Select-Object Name, SamAccountName' },
      { title: 'Forzar replicación AD', cmd: 'repadmin /syncall /AdeP' },
      { title: 'Ver estado de replicación', cmd: 'repadmin /replsummary' },
      { title: 'Unlock cuenta de usuario', cmd: 'Unlock-ADAccount -Identity "jlopez"' },
      { title: 'Reset contraseña', cmd: 'Set-ADAccountPassword -Identity "jlopez" -NewPassword (ConvertTo-SecureString "NuevPass!" -AsPlainText -Force) -Reset' },
      { title: 'Buscar usuarios inactivos 90 días', cmd: 'Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Select-Object Name, LastLogonDate' },
      { title: 'Ver miembros de grupo', cmd: 'Get-ADGroupMember -Identity "Domain Admins" -Recursive | Select-Object Name, SamAccountName' },
    ],
  },
  {
    id: 'gpo',
    label: 'Group Policy',
    icon: '📋',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    commands: [
      { title: 'Crear nueva GPO', cmd: 'New-GPO -Name "Politica-Seguridad" -Comment "Restricciones de seguridad general"' },
      { title: 'Vincular GPO a OU', cmd: 'New-GPLink -Name "Politica-Seguridad" -Target "OU=Usuarios,DC=empresa,DC=local" -Enforced Yes' },
      { title: 'Ver todas las GPOs', cmd: 'Get-GPO -All | Select-Object DisplayName, GpoStatus, CreationTime | Format-Table' },
      { title: 'Obtener informe HTML de GPO', cmd: 'Get-GPOReport -Name "Politica-Seguridad" -ReportType HTML -Path "C:\\GPO-Report.html"' },
      { title: 'Forzar actualización de GPO en equipo remoto', cmd: 'Invoke-GPUpdate -Computer "PC-001" -Force' },
      { title: 'Ver GPOs aplicadas en el equipo local', cmd: 'gpresult /R /SCOPE COMPUTER' },
      { title: 'Configurar clave de registro via GPO PS', cmd: 'Set-GPRegistryValue -Name "Politica-Seguridad" -Key "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" -ValueName "NoRun" -Type DWORD -Value 1' },
      { title: 'Backup de GPO', cmd: 'Backup-GPO -Name "Politica-Seguridad" -Path "C:\\GPO-Backups"' },
      { title: 'Restaurar GPO desde backup', cmd: 'Restore-GPO -Name "Politica-Seguridad" -Path "C:\\GPO-Backups"' },
    ],
  },
  {
    id: 'dns_dhcp',
    label: 'DNS / DHCP',
    icon: '🌐',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    commands: [
      { title: 'Instalar DNS y DHCP', cmd: 'Install-WindowsFeature -Name DNS, DHCP -IncludeManagementTools' },
      { title: 'Nueva zona DNS primaria', cmd: 'Add-DnsServerPrimaryZone -Name "empresa.local" -ZoneFile "empresa.local.dns" -DynamicUpdate Secure' },
      { title: 'Agregar registro A', cmd: 'Add-DnsServerResourceRecordA -Name "www" -ZoneName "empresa.local" -IPv4Address "192.168.1.100"' },
      { title: 'Agregar registro CNAME', cmd: 'Add-DnsServerResourceRecordCName -Name "intranet" -ZoneName "empresa.local" -HostNameAlias "www.empresa.local"' },
      { title: 'Crear ámbito DHCP', cmd: 'Add-DhcpServerv4Scope -Name "Red-Principal" -StartRange "192.168.1.10" -EndRange "192.168.1.200" -SubnetMask "255.255.255.0"' },
      { title: 'Reserva DHCP por MAC', cmd: 'Add-DhcpServerv4Reservation -ScopeId "192.168.1.0" -IPAddress "192.168.1.50" -ClientId "AA-BB-CC-DD-EE-FF" -Description "Impresora planta 1"' },
      { title: 'Ver leases DHCP activos', cmd: 'Get-DhcpServerv4Lease -ScopeId "192.168.1.0" | Select-Object IPAddress, ClientId, HostName, AddressState' },
      { title: 'Test resolución DNS', cmd: 'Resolve-DnsName "www.empresa.local" -Type A\nTest-NetConnection "8.8.8.8" -Port 53' },
      { title: 'Ver cache DNS del servidor', cmd: 'Get-DnsServerCache | Select-Object HostName, RecordType, TimeToLive' },
      { title: 'Limpiar cache DNS cliente', cmd: 'Clear-DnsClientCache\nipconfig /flushdns' },
    ],
  },
  {
    id: 'hyperv',
    label: 'Hyper-V',
    icon: '💻',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    commands: [
      { title: 'Instalar Hyper-V', cmd: 'Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart' },
      { title: 'Crear VM básica', cmd: 'New-VM -Name "VM-Test" -MemoryStartupBytes 2GB -Generation 2 -Path "D:\\VMs" -NewVHDPath "D:\\VMs\\VM-Test.vhdx" -NewVHDSizeBytes 80GB' },
      { title: 'Listar todas las VMs', cmd: 'Get-VM | Select-Object Name, State, MemoryAssigned, ProcessorCount, Uptime' },
      { title: 'Iniciar / Detener VM', cmd: 'Start-VM -Name "VM-Test"\nStop-VM -Name "VM-Test" -Force' },
      { title: 'Crear snapshot', cmd: 'Checkpoint-VM -Name "VM-Test" -SnapshotName "Pre-Actualizacion-$(Get-Date -Format yyyyMMdd)"' },
      { title: 'Restaurar snapshot', cmd: 'Restore-VMCheckpoint -Name "Pre-Actualizacion-20260315" -VMName "VM-Test" -Confirm:$false' },
      { title: 'Crear switch virtual', cmd: 'New-VMSwitch -Name "Red-Interna" -SwitchType Internal' },
      { title: 'Agregar memoria dinámica', cmd: 'Set-VMMemory -VMName "VM-Test" -DynamicMemoryEnabled $true -MinimumBytes 512MB -MaximumBytes 4GB -StartupBytes 1GB' },
      { title: 'Exportar VM', cmd: 'Export-VM -Name "VM-Test" -Path "D:\\Exportaciones"' },
      { title: 'Ver uso de recursos de VMs', cmd: 'Get-VM | Get-VMMemory | Select-Object VMName, Startup, Minimum, Maximum\nMeasure-VM -VMName "VM-Test"' },
    ],
  },
  {
    id: 'iis',
    label: 'IIS / Web',
    icon: '🌍',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    commands: [
      { title: 'Instalar IIS con módulos comunes', cmd: 'Install-WindowsFeature -Name Web-Server, Web-Asp-Net45, Web-Mgmt-Console, Web-Log-Libraries -IncludeManagementTools' },
      { title: 'Crear nuevo sitio web', cmd: 'New-IISSite -Name "MiSitio" -BindingInformation "*:80:www.empresa.local" -PhysicalPath "C:\\inetpub\\MiSitio"' },
      { title: 'Ver todos los sitios', cmd: 'Get-IISSite | Select-Object Name, State, Bindings' },
      { title: 'Iniciar / Detener sitio', cmd: 'Start-IISSite -Name "MiSitio"\nStop-IISSite -Name "MiSitio"' },
      { title: 'Crear Application Pool', cmd: 'New-WebAppPool -Name "AppPool-PHP"\nSet-ItemProperty IIS:\\AppPools\\AppPool-PHP managedRuntimeVersion ""' },
      { title: 'Agregar binding HTTPS', cmd: '$cert = Get-ChildItem Cert:\\LocalMachine\\My | Where-Object {$_.Subject -like "*empresa*"}\nNew-WebBinding -Name "MiSitio" -Protocol https -Port 443 -HostHeader "www.empresa.local"\n(Get-WebBinding -Name "MiSitio" -Protocol https).AddSslCertificate($cert.Thumbprint, "My")' },
      { title: 'Ver logs IIS', cmd: 'Get-Content "C:\\inetpub\\logs\\LogFiles\\W3SVC1\\u_ex*.log" | Select-String "500"' },
      { title: 'Redirección HTTP a HTTPS', cmd: 'Install-WindowsFeature -Name Web-Http-Redirect\nSet-WebConfiguration system.webServer/httpRedirect "IIS:\\Sites\\MiSitio" -Value @{enabled="true";destination="https://www.empresa.local";httpResponseStatus="Permanent"}' },
    ],
  },
  {
    id: 'ps',
    label: 'PowerShell Avanzado',
    icon: '⚡',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    commands: [
      { title: 'Habilitar Remoting', cmd: 'Enable-PSRemoting -Force\nSet-Item WSMan:\\localhost\\Client\\TrustedHosts -Value "*" -Force' },
      { title: 'Ejecutar en múltiples servidores', cmd: 'Invoke-Command -ComputerName "srv01","srv02","srv03" -ScriptBlock { Get-Service | Where-Object {$_.Status -eq "Stopped"} }' },
      { title: 'Sesión persistente', cmd: '$s = New-PSSession -ComputerName "srv01" -Name "Admin"\nInvoke-Command -Session $s -ScriptBlock { hostname }\nRemove-PSSession $s' },
      { title: 'Crear tarea programada', cmd: '$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\\Scripts\\tarea.ps1"\n$trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"\nRegister-ScheduledTask -TaskName "MiTarea" -Action $action -Trigger $trigger -RunLevel Highest -User "SYSTEM"' },
      { title: 'Exportar a CSV / JSON', cmd: 'Get-Process | Select-Object Name, CPU, WorkingSet | Export-Csv -Path "C:\\procesos.csv" -NoTypeInformation\nGet-Service | ConvertTo-Json | Out-File "C:\\servicios.json"' },
      { title: 'Mandar email con PS', cmd: 'Send-MailMessage -From "server@empresa.local" -To "admin@empresa.local" -Subject "Alerta" -Body "Mensaje" -SmtpServer "smtp.empresa.local"' },
      { title: 'Gestión de módulos', cmd: 'Find-Module -Name "Az" | Install-Module -Force\nGet-Module -ListAvailable | Sort-Object Name\nImport-Module "NombreModulo" -Verbose' },
      { title: 'Test conectividad TCP', cmd: 'Test-NetConnection -ComputerName "srv01" -Port 443\n1..254 | ForEach-Object { if (Test-Connection -ComputerName "192.168.1.$_" -Count 1 -Quiet) { "192.168.1.$_ - UP" } }' },
      { title: 'Obtener eventos del sistema', cmd: 'Get-EventLog -LogName System -EntryType Error -Newest 20 | Select-Object TimeGenerated, Source, Message\nGet-WinEvent -FilterHashtable @{LogName="Security";Id=4625} -MaxEvents 10' },
    ],
  },
  {
    id: 'fs',
    label: 'File Services',
    icon: '📁',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    commands: [
      { title: 'Crear carpeta compartida', cmd: 'New-SmbShare -Name "Datos" -Path "D:\\Datos" -FullAccess "empresa\\Domain Admins" -ReadAccess "empresa\\Domain Users" -Description "Carpeta compartida Datos"' },
      { title: 'Ver carpetas compartidas', cmd: 'Get-SmbShare | Select-Object Name, Path, Description, ConcurrentUserLimit' },
      { title: 'Configurar permisos NTFS', cmd: '$acl = Get-Acl "D:\\Datos"\n$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("empresa\\Ventas","Modify","ContainerInherit,ObjectInherit","None","Allow")\n$acl.AddAccessRule($rule)\nSet-Acl "D:\\Datos" $acl' },
      { title: 'Ver permisos NTFS', cmd: '(Get-Acl "D:\\Datos").Access | Select-Object IdentityReference, FileSystemRights, AccessControlType' },
      { title: 'Crear cuota de disco', cmd: 'Install-WindowsFeature -Name FS-Resource-Manager -IncludeManagementTools\nNew-FsrmQuota -Path "D:\\Usuarios" -Size 10GB -SoftLimit' },
      { title: 'Ver sesiones SMB abiertas', cmd: 'Get-SmbSession | Select-Object ClientComputerName, ClientUserName, NumOpens' },
      { title: 'Cerrar sesión SMB de usuario', cmd: 'Get-SmbSession | Where-Object {$_.ClientUserName -like "*jlopez*"} | Close-SmbSession -Force' },
      { title: 'Auditar acceso a carpeta', cmd: '$acl = Get-Acl "D:\\Confidencial"\n$rule = New-Object System.Security.AccessControl.FileSystemAuditRule("Everyone","ReadData","ContainerInherit,ObjectInherit","None","Success,Failure")\n$acl.AddAuditRule($rule)\nSet-Acl "D:\\Confidencial" $acl' },
    ],
  },
  {
    id: 'security',
    label: 'Seguridad & Firewall',
    icon: '🔒',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    commands: [
      { title: 'Ver reglas de firewall activas', cmd: 'Get-NetFirewallRule | Where-Object {$_.Enabled -eq "True" -and $_.Direction -eq "Inbound"} | Select-Object DisplayName, Action, Protocol, LocalPort' },
      { title: 'Crear regla firewall', cmd: 'New-NetFirewallRule -DisplayName "Bloquear Puerto 23" -Direction Inbound -Protocol TCP -LocalPort 23 -Action Block' },
      { title: 'Habilitar BitLocker', cmd: 'Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -RecoveryPasswordProtector\nGet-BitLockerVolume | Select-Object MountPoint, VolumeStatus, EncryptionPercentage' },
      { title: 'Ver cuentas con privilegios', cmd: 'Get-ADGroupMember -Identity "Domain Admins" | Select-Object Name, SamAccountName\nGet-LocalGroupMember -Group "Administrators"' },
      { title: 'Auditar inicios de sesión fallidos', cmd: 'Get-WinEvent -FilterHashtable @{LogName="Security";Id=4625} -MaxEvents 50 | Select-Object TimeCreated, @{N="Usuario";E={$_.Properties[5].Value}}, @{N="IP";E={$_.Properties[19].Value}}' },
      { title: 'Política de contraseñas', cmd: 'Get-ADDefaultDomainPasswordPolicy\nSet-ADDefaultDomainPasswordPolicy -Identity "empresa.local" -MinPasswordLength 12 -PasswordHistoryCount 10 -LockoutThreshold 5' },
      { title: 'Verificar servicios vulnerables', cmd: 'Get-Service | Where-Object {$_.StartType -eq "Automatic" -and $_.Status -eq "Running"} | Select-Object DisplayName, Name | Sort-Object DisplayName' },
      { title: 'Deshabilitar protocolos inseguros', cmd: 'Disable-WindowsOptionalFeature -FeatureName "SMB1Protocol" -Online -NoRestart\nSet-SmbServerConfiguration -EnableSMB1Protocol $false -Force' },
    ],
  },
  {
    id: 'rds',
    label: 'RDS / RemoteApp',
    icon: '🖥️',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    commands: [
      { title: 'Instalar roles RDS', cmd: 'Install-WindowsFeature -Name RDS-RD-Server, RDS-Connection-Broker, RDS-Web-Access -IncludeManagementTools' },
      { title: 'Crear colección de sesiones', cmd: 'New-RDSessionCollection -CollectionName "Empleados" -SessionHost "srv-rds01.empresa.local" -ConnectionBroker "srv-rds01.empresa.local"' },
      { title: 'Ver sesiones activas', cmd: 'Get-RDUserSession -ConnectionBroker "srv-rds01.empresa.local" | Select-Object UserName, SessionState, HostServer' },
      { title: 'Desconectar sesión de usuario', cmd: 'Get-RDUserSession | Where-Object {$_.UserName -eq "jlopez"} | Disconnect-RDUser -Force' },
      { title: 'Publicar RemoteApp', cmd: 'New-RDRemoteApp -CollectionName "Empleados" -DisplayName "Mi App" -FilePath "C:\\Apps\\miapp.exe" -ConnectionBroker "srv-rds01.empresa.local"' },
      { title: 'Configurar límites de sesión', cmd: 'Set-RDSessionCollectionConfiguration -CollectionName "Empleados" -DisconnectedSessionLimitMin 60 -IdleSessionLimitMin 30 -ConnectionBroker "srv-rds01.empresa.local"' },
    ],
  },
  {
    id: 'clustering',
    label: 'Failover Cluster',
    icon: '🔗',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    commands: [
      { title: 'Instalar Failover Clustering', cmd: 'Invoke-Command -ComputerName "nodo1","nodo2" -ScriptBlock { Install-WindowsFeature Failover-Clustering -IncludeManagementTools }' },
      { title: 'Validar configuración', cmd: 'Test-Cluster -Node "nodo1","nodo2" -ReportName "C:\\validacion"' },
      { title: 'Crear clúster', cmd: 'New-Cluster -Name "CLUSTER-HA" -Node "nodo1","nodo2" -StaticAddress "192.168.1.50" -NoStorage' },
      { title: 'Ver estado del clúster', cmd: 'Get-ClusterNode -Cluster "CLUSTER-HA" | Select-Object Name, State\nGet-ClusterGroup -Cluster "CLUSTER-HA" | Select-Object Name, State, OwnerNode' },
      { title: 'Mover rol entre nodos', cmd: 'Move-ClusterGroup -Name "VM-HA-01" -Node "nodo2" -Cluster "CLUSTER-HA"' },
      { title: 'Pausar nodo para mantenimiento', cmd: 'Suspend-ClusterNode -Name "nodo1" -Cluster "CLUSTER-HA" -Drain\n# Tras el mantenimiento:\nResume-ClusterNode -Name "nodo1" -Cluster "CLUSTER-HA"' },
      { title: 'Cloud Witness quorum', cmd: 'Set-ClusterQuorum -Cluster "CLUSTER-HA" -CloudWitness -AccountName "storageaccount" -AccessKey "clave"' },
    ],
  },
  {
    id: 'wsus',
    label: 'WSUS / Updates',
    icon: '🔄',
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/20',
    commands: [
      { title: 'Instalar WSUS', cmd: 'Install-WindowsFeature -Name UpdateServices -IncludeManagementTools\n.\\wsusutil.exe postinstall CONTENT_DIR=D:\\WSUS' },
      { title: 'Conectar al servidor WSUS', cmd: '$wsus = Get-WsusServer\n# Para servidor remoto:\n$wsus = Get-WsusServer -Name "srv-wsus" -PortNumber 8530' },
      { title: 'Crear grupo de equipos', cmd: '$wsus = Get-WsusServer\n$wsus.CreateComputerTargetGroup("Piloto")' },
      { title: 'Aprobar actualizaciones críticas', cmd: '$wsus = Get-WsusServer\n$wsus.GetUpdates() | Where-Object {$_.UpdateClassificationTitle -eq "Critical Updates" -and !$_.IsApproved} | Approve-WsusUpdate -Action Install -TargetGroupName "Piloto"' },
      { title: 'Declinar actualizaciones reemplazadas', cmd: '$wsus = Get-WsusServer\n$wsus.GetUpdates() | Where-Object {$_.IsSuperseded -eq $true -and $_.IsDeclined -eq $false} | ForEach-Object { $_.Decline() }' },
      { title: 'Informe de cumplimiento', cmd: '$wsus = Get-WsusServer\n$wsus.GetComputerTargets((New-Object Microsoft.UpdateServices.Administration.ComputerTargetScope)) | Select-Object FullDomainName, @{N="Pendientes";E={($_.GetUpdateInstallationSummary()).NotInstalledCount}}' },
    ],
  },
  {
    id: 'storage',
    label: 'Storage Spaces',
    icon: '💾',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    commands: [
      { title: 'Ver discos disponibles para pool', cmd: 'Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true} | Select-Object FriendlyName, Size, MediaType' },
      { title: 'Crear Storage Pool', cmd: '$discos = Get-PhysicalDisk | Where-Object {$_.CanPool}\nNew-StoragePool -FriendlyName "PoolDatos" -StorageSubSystemFriendlyName "Windows Storage*" -PhysicalDisks $discos' },
      { title: 'Crear espacio Mirror', cmd: 'New-VirtualDisk -StoragePoolFriendlyName "PoolDatos" -FriendlyName "VolumenMirror" -ResiliencySettingName "Mirror" -Size 500GB -ProvisioningType Thin' },
      { title: 'Crear espacio Parity', cmd: 'New-VirtualDisk -StoragePoolFriendlyName "PoolDatos" -FriendlyName "VolumenParity" -ResiliencySettingName "Parity" -Size 1TB -ProvisioningType Thin' },
      { title: 'Habilitar deduplicación', cmd: 'Install-WindowsFeature FS-Data-Deduplication\nEnable-DedupVolume -Volume "E:" -UsageType GeneralPurpose' },
      { title: 'Ver estado del pool', cmd: 'Get-StoragePool | Select-Object FriendlyName, OperationalStatus, HealthStatus, Size, AllocatedSize\nGet-VirtualDisk | Select-Object FriendlyName, ResiliencySettingName, OperationalStatus, Size' },
    ],
  },
  {
    id: 'pki',
    label: 'PKI / Certificados',
    icon: '🔐',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    commands: [
      { title: 'Instalar AD CS', cmd: 'Install-WindowsFeature -Name ADCS-Cert-Authority, ADCS-Web-Enrollment -IncludeManagementTools' },
      { title: 'Configurar Enterprise Root CA', cmd: 'Install-AdcsCertificationAuthority -CAType EnterpriseRootCa -CryptoProviderName "RSA#Microsoft Software Key Storage Provider" -KeyLength 4096 -HashAlgorithmName SHA256 -CACommonName "Empresa-Root-CA" -ValidityPeriod Years -ValidityPeriodUnits 10 -Force' },
      { title: 'Ver certificados del equipo', cmd: 'Get-ChildItem Cert:\\LocalMachine\\My | Select-Object Subject, Thumbprint, NotAfter, Issuer' },
      { title: 'Certificados que expiran en 30 días', cmd: 'Get-ChildItem Cert:\\LocalMachine\\My | Where-Object {$_.NotAfter -lt (Get-Date).AddDays(30)} | Select-Object Subject, NotAfter' },
      { title: 'Crear certificado autofirmado', cmd: 'New-SelfSignedCertificate -DnsName "srv01.empresa.local","intranet.empresa.local" -CertStoreLocation "Cert:\\LocalMachine\\My" -KeyLength 2048 -HashAlgorithm SHA256' },
      { title: 'Exportar certificado a PFX', cmd: '$cert = Get-ChildItem Cert:\\LocalMachine\\My | Where-Object {$_.Subject -like "*srv01*"}\nExport-PfxCertificate -Cert $cert -FilePath "C:\\cert-srv01.pfx" -Password (ConvertTo-SecureString "Pass123!" -AsPlainText -Force)' },
      { title: 'Revocar certificado', cmd: 'Revoke-CACertificate -SerialNumber "1234ABCD" -Reason "KeyCompromise"\ncertutil -crl' },
    ],
  },
];

// ── CopyButton ─────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all bg-white/5 hover:bg-white/10 border border-white/8 text-slate-500 hover:text-slate-200"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'OK' : 'Copy'}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WinCheatSheet() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  const filtered = CHEAT_SECTIONS
    .filter(s => activeSection === 'all' || s.id === activeSection)
    .map(section => ({
      ...section,
      commands: search.trim()
        ? section.commands.filter(c =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.cmd.toLowerCase().includes(search.toLowerCase()))
        : section.commands,
    }))
    .filter(s => s.commands.length > 0);

  const totalCommands = CHEAT_SECTIONS.reduce((a, s) => a + s.commands.length, 0);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0D0D0D]/95 backdrop-blur border-b border-white/5 px-8 py-3 flex items-center gap-3">
          <img src={logoImg} alt="Tech4U" className="w-5 h-5 object-contain" />
          <button onClick={() => navigate('/winlabs')}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Windows Labs
          </button>
          <span className="text-slate-700 text-xs">/</span>
          <span className="text-xs font-mono text-white font-bold">PowerShell Cheat Sheet</span>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-slate-600 border border-white/8 px-2.5 py-1 rounded-lg">
            <BookOpen className="w-3 h-3" />
            {totalCommands} comandos · {CHEAT_SECTIONS.length} módulos
          </div>
        </header>

        <div className="flex-1 px-8 py-7">
          {/* Hero mini */}
          <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-[#0D0D0D] to-[#0D0D0D] px-8 py-6 mb-7 overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-20 bg-amber-500/8 blur-2xl rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-2xl flex-shrink-0">⚡</div>
              <div>
                <h1 className="text-xl font-black text-white font-mono mb-0.5">PowerShell Cheat Sheet</h1>
                <p className="text-xs text-slate-500 font-mono">Referencia rápida de {totalCommands} comandos organizados por módulo. Haz clic en cualquier comando para copiarlo.</p>
              </div>
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar comandos..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
          </div>

          {/* Module tabs */}
          <div className="flex flex-wrap gap-1.5 mb-7">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${activeSection === 'all' ? 'bg-white/10 text-white border-white/20' : 'text-slate-600 border-white/5 hover:text-slate-300 hover:border-white/10'}`}
            >
              Todos
            </button>
            {CHEAT_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${activeSection === s.id ? `${s.bg} ${s.color} ${s.border}` : 'text-slate-600 border-white/5 hover:text-slate-300 hover:border-white/10'}`}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>

          {/* Command sections */}
          <div className="space-y-8">
            {filtered.map(section => (
              <section key={section.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{section.icon}</span>
                  <h2 className={`text-sm font-black font-mono ${section.color}`}>{section.label}</h2>
                  <span className="text-[10px] font-mono text-slate-700 ml-1">{section.commands.length} cmdlets</span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {section.commands.map((cmd, i) => (
                    <div key={i} className={`group rounded-xl border bg-[#080808] hover:bg-[#0E0E0E] transition-colors overflow-hidden ${section.border}`}>
                      <div className={`flex items-center justify-between px-4 py-2 ${section.bg} border-b ${section.border}`}>
                        <span className={`text-[10px] font-black font-mono ${section.color}`}>{cmd.title}</span>
                        <CopyButton text={cmd.cmd} />
                      </div>
                      <pre className="px-4 py-3 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {cmd.cmd}
                      </pre>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-600 font-mono text-sm">
                No se encontraron comandos para "{search}"
              </div>
            )}
          </div>
          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}
