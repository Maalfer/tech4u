// ── Quiz data para Windows Server Labs ───────────────────────────────────────
// Cada scenario tiene un array de preguntas tipo test (3-4 opciones, una correcta)

export const WIN_QUIZZES = {

  'ad-install': [
    {
      q: '¿Qué cmdlet se usa para promocionar un servidor a Controlador de Dominio?',
      options: ['Install-ADDSDomainController', 'Install-ADDSForest', 'New-ADDomain', 'Add-WindowsFeature AD-DS'],
      answer: 1,
      explanation: 'Install-ADDSForest crea un nuevo bosque AD. Install-ADDSDomainController añade un DC a un dominio existente.',
    },
    {
      q: '¿Qué puerto usa el protocolo LDAP estándar (sin SSL)?',
      options: ['443', '636', '389', '3268'],
      answer: 2,
      explanation: 'LDAP usa el puerto 389. LDAPS (con SSL) usa el 636. El Global Catalog usa 3268 y 3269 (SSL).',
    },
    {
      q: '¿Qué sucede si el servidor DNS del nuevo dominio no está disponible durante la instalación de AD DS?',
      options: [
        'La instalación crea un DNS automáticamente',
        'La instalación falla porque AD requiere DNS',
        'Se puede continuar sin DNS y configurarlo después',
        'Se usa el DNS de Internet como alternativa',
      ],
      answer: 1,
      explanation: 'Active Directory depende completamente de DNS. Sin DNS funcional, la instalación falla o el dominio no funciona correctamente.',
    },
    {
      q: 'Al instalar AD DS, ¿qué es el modo de restauración de servicios de directorio (DSRM)?',
      options: [
        'Un modo de inicio para reparar la base de datos de AD',
        'Un comando de PowerShell para restaurar usuarios eliminados',
        'Una copia de seguridad automática del AD',
        'El modo de solo lectura de los controladores de dominio',
      ],
      answer: 0,
      explanation: 'DSRM es un modo especial de arranque (como modo seguro) para reparar o restaurar la base de datos de AD cuando el DC no puede arrancar normalmente.',
    },
  ],

  'ad-users': [
    {
      q: '¿Qué tipo de grupo de AD puede contener miembros de diferentes dominios del mismo bosque?',
      options: ['Domain Local', 'Global', 'Universal', 'Distribution'],
      answer: 2,
      explanation: 'Los grupos Universal pueden contener cuentas y grupos de cualquier dominio del bosque. Los grupos Global solo pueden contener objetos del mismo dominio.',
    },
    {
      q: '¿Cuál es la estrategia de grupos recomendada por Microsoft (A-G-DL-P)?',
      options: [
        'Accounts → Global → Domain Local → Permissions',
        'Admin → Group → Domain → Policy',
        'Accounts → Global → Distribution → Principals',
        'Authorization → Groups → DL → Permissions',
      ],
      answer: 0,
      explanation: 'A-G-DL-P: usuarios en grupos Globales, grupos Globales en grupos Domain Local, permisos en grupos Domain Local. Facilita la administración y auditoría.',
    },
    {
      q: '¿Qué parámetro de New-ADUser fuerza el cambio de contraseña en el primer inicio de sesión?',
      options: ['-PasswordNeverExpires', '-ChangePasswordAtLogon', '-MustChangePasswordAtLogon', '-ForcePasswordChange'],
      answer: 2,
      explanation: 'El parámetro correcto es -MustChangePasswordAtLogon:$true. Esto activa la casilla "El usuario debe cambiar la contraseña en el siguiente inicio de sesión".',
    },
  ],

  'rds-install': [
    {
      q: '¿Qué rol de RDS es responsable del balanceo de carga entre múltiples Session Hosts?',
      options: ['RD Web Access', 'RD Session Host', 'RD Connection Broker', 'RD Licensing'],
      answer: 2,
      explanation: 'El RD Connection Broker gestiona la distribución de conexiones entre múltiples Session Hosts y permite la reconexión de sesiones desconectadas.',
    },
    {
      q: '¿En qué puerto escucha el protocolo RDP por defecto?',
      options: ['443', '8080', '3389', '5900'],
      answer: 2,
      explanation: 'RDP usa el puerto 3389/TCP por defecto. Se puede cambiar en el registro, pero requiere actualizar el firewall y los clientes.',
    },
    {
      q: '¿Qué tipo de licencia RDS se recomienda cuando los usuarios se conectan desde múltiples dispositivos?',
      options: ['Per Device CAL', 'Per User CAL', 'Per Server CAL', 'Open License'],
      answer: 1,
      explanation: 'Per User CAL permite que un usuario se conecte desde cualquier dispositivo. Per Device CAL sería ineficiente si el usuario usa varios equipos.',
    },
    {
      q: '¿Qué es una RemoteApp?',
      options: [
        'Una aplicación que se ejecuta en el servidor pero se muestra en el escritorio local del usuario',
        'Una aplicación móvil para conectarse a RDS',
        'Un escritorio virtual completo en la nube',
        'Una herramienta de administración de RDS',
      ],
      answer: 0,
      explanation: 'RemoteApp permite que aplicaciones remotas se integren en el escritorio local del usuario, apareciendo como si fueran aplicaciones locales con su propia barra de tareas.',
    },
  ],

  'rds-gateway': [
    {
      q: '¿Por qué es más seguro usar RD Gateway que exponer directamente el puerto 3389?',
      options: [
        'RD Gateway cifra el tráfico con AES-256',
        'El tráfico RDP va encapsulado en HTTPS (443), exponiendo solo un puerto estándar',
        'RD Gateway usa VPN para proteger la conexión',
        'RD Gateway bloquea automáticamente IPs maliciosas',
      ],
      answer: 1,
      explanation: 'RD Gateway encapsula el RDP dentro de HTTPS. Solo el 443 necesita estar abierto en el firewall externo. El 3389 permanece cerrado desde Internet.',
    },
    {
      q: '¿Qué diferencia hay entre una CAP y una RAP en RD Gateway?',
      options: [
        'CAP define quién puede conectarse; RAP define a qué recursos puede llegar',
        'CAP es para certificados; RAP es para contraseñas',
        'CAP es la política de cliente; RAP es la política del servidor',
        'No hay diferencia, son sinónimos',
      ],
      answer: 0,
      explanation: 'CAP (Connection Authorization Policy) controla quién puede usar el gateway. RAP (Resource Authorization Policy) controla a qué recursos internos puede conectarse ese usuario.',
    },
    {
      q: '¿Qué tipo de certificado se recomienda usar en RD Gateway en producción?',
      options: [
        'Certificado autofirmado (self-signed)',
        'Certificado de una CA pública o CA corporativa',
        'Certificado de cifrado simétrico',
        'No se necesita certificado',
      ],
      answer: 1,
      explanation: 'En producción siempre debe usarse un certificado de una CA de confianza. Los autofirmados generan advertencias de seguridad en los clientes y no son apropiados para entornos reales.',
    },
  ],

  'cluster-install': [
    {
      q: '¿Por qué es obligatorio ejecutar Test-Cluster antes de crear el clúster?',
      options: [
        'Solo es recomendable, no obligatorio',
        'Microsoft exige la validación para dar soporte técnico al clúster',
        'Sin la validación, el clúster no se puede crear',
        'La validación instala los drivers necesarios',
      ],
      answer: 1,
      explanation: 'Microsoft no da soporte técnico a un clúster que no haya pasado la validación sin errores. Además, la validación detecta problemas de red, almacenamiento y configuración antes de crear el clúster.',
    },
    {
      q: '¿Qué es el quorum en un Failover Cluster?',
      options: [
        'El almacenamiento compartido entre nodos',
        'El mecanismo que decide qué nodos forman el clúster activo cuando hay una partición de red',
        'La IP virtual del clúster',
        'El nodo principal del clúster',
      ],
      answer: 1,
      explanation: 'El quorum es el mecanismo de votación que evita el "split-brain": que dos grupos de nodos aislados crean cada uno ser el clúster activo, corrompiendo los datos.',
    },
    {
      q: '¿Cuál es la ventaja del Cloud Witness frente al Disk Witness como quorum?',
      options: [
        'Cloud Witness es más rápido',
        'Cloud Witness no requiere hardware adicional ni un tercer sitio físico',
        'Cloud Witness soporta más nodos',
        'Cloud Witness proporciona más votos',
      ],
      answer: 1,
      explanation: 'Cloud Witness usa Azure Blob Storage como tercer voto. Elimina la necesidad de un disco testigo físico (que sería otro punto de fallo) o un tercer sitio de recuperación.',
    },
    {
      q: '¿Qué es el CNO (Cluster Name Object)?',
      options: [
        'El disco compartido del clúster',
        'La cuenta de equipo en AD que representa al clúster',
        'El nodo principal del clúster',
        'La IP virtual del clúster',
      ],
      answer: 1,
      explanation: 'El CNO es una cuenta de equipo creada automáticamente en Active Directory cuando se crea el clúster. Representa al clúster en la red y el dominio.',
    },
  ],

  'cluster-csv': [
    {
      q: '¿Qué ventaja tienen los Cluster Shared Volumes (CSV) sobre los discos de clúster tradicionales?',
      options: [
        'Los CSV son más rápidos que los discos normales',
        'Varios nodos pueden leer y escribir simultáneamente en el mismo volumen',
        'Los CSV no necesitan almacenamiento compartido',
        'Los CSV tienen redundancia automática',
      ],
      answer: 1,
      explanation: 'Con discos de clúster tradicionales, solo el nodo propietario puede acceder al disco. Los CSV permiten acceso simultáneo desde todos los nodos, lo que es esencial para Live Migration de VMs.',
    },
    {
      q: '¿Cuál es la diferencia entre Live Migration y Quick Migration?',
      options: [
        'Live Migration mueve la VM encendida sin downtime; Quick Migration guarda el estado y hay breve interrupción',
        'Live Migration es más lenta; Quick Migration es instantánea',
        'Live Migration requiere CSV; Quick Migration no necesita almacenamiento compartido',
        'No hay diferencia, son lo mismo',
      ],
      answer: 0,
      explanation: 'Live Migration transfiere la memoria de la VM en tiempo real entre nodos: 0 segundos de downtime. Quick Migration guarda el estado en disco, mueve y restaura: hay una interrupción de segundos.',
    },
  ],

  'wsus-install': [
    {
      q: '¿Cuál es la principal ventaja de usar WSUS frente a las actualizaciones directas desde Microsoft?',
      options: [
        'WSUS descarga más rápido las actualizaciones',
        'WSUS permite controlar qué actualizaciones se instalan y cuándo, y ahorra ancho de banda',
        'WSUS instala las actualizaciones automáticamente sin interrupciones',
        'WSUS solo descarga actualizaciones de seguridad',
      ],
      answer: 1,
      explanation: 'WSUS centraliza las descargas (una vez por toda la empresa), permite probar actualizaciones en grupos piloto antes del despliegue masivo, y da control total sobre el calendario de instalación.',
    },
    {
      q: '¿Qué grupo de equipos de WSUS es el recomendado para probar las actualizaciones antes del despliegue masivo?',
      options: ['All Computers', 'Unassigned Computers', 'Piloto / Test', 'Domain Controllers'],
      answer: 2,
      explanation: 'El grupo Piloto (o Test) contiene una muestra representativa de equipos donde se prueban las actualizaciones durante 48-72h antes de aprobarlas para el resto de la organización.',
    },
    {
      q: '¿En qué puerto HTTP escucha WSUS por defecto?',
      options: ['80', '8080', '8530', '443'],
      answer: 2,
      explanation: 'WSUS usa el puerto 8530/TCP para HTTP y el 8531/TCP para HTTPS. Esto evita conflictos con IIS que pueda usar los puertos 80 y 443.',
    },
  ],

  'wsus-maintenance': [
    {
      q: '¿Por qué es importante declinar las actualizaciones reemplazadas (superseded)?',
      options: [
        'Las actualizaciones reemplazadas contienen virus',
        'Para liberar espacio en base de datos y evitar aprobar versiones antiguas innecesariamente',
        'Las actualizaciones reemplazadas no se pueden instalar',
        'Para cumplir con las políticas de Microsoft',
      ],
      answer: 1,
      explanation: 'Las actualizaciones reemplazadas tienen una versión más nueva disponible. No declinarlas infla la base de datos de WSUS y puede causar que se instalen versiones antiguas.',
    },
    {
      q: '¿Qué indica un alto valor de "NotInstalledCount" en el informe de cumplimiento de un equipo?',
      options: [
        'El equipo tiene muchas actualizaciones aprobadas pendientes de instalar',
        'El equipo no está registrado en WSUS',
        'El equipo tiene el Windows Update deshabilitado',
        'El equipo tiene conflictos de software',
      ],
      answer: 0,
      explanation: 'NotInstalledCount alto suele indicar que el equipo no se reinicia tras las actualizaciones, o que la política de WSUS no está llegando al equipo correctamente.',
    },
  ],

  'storage-spaces': [
    {
      q: '¿Cuántos discos físicos mínimo necesita un Storage Space con resiliencia Mirror de dos vías?',
      options: ['1', '2', '3', '4'],
      answer: 1,
      explanation: 'Mirror de dos vías escribe los datos en dos discos simultáneamente (como RAID 1). Necesita mínimo 2 discos para poder mantener la copia duplicada.',
    },
    {
      q: '¿Qué sistema de ficheros es más recomendado para Storage Spaces?',
      options: ['FAT32', 'NTFS', 'ReFS', 'exFAT'],
      answer: 2,
      explanation: 'ReFS (Resilient File System) está diseñado para trabajar con Storage Spaces. Proporciona verificación automática de integridad, reparación sin downtime y mejor tolerancia a la corrupción.',
    },
    {
      q: '¿Qué hace la deduplicación de datos?',
      options: [
        'Hace copias de seguridad automáticas de los archivos',
        'Elimina bloques de datos duplicados, almacenando solo una copia de cada bloque único',
        'Comprime los archivos para ocupar menos espacio',
        'Replica los datos a otro servidor',
      ],
      answer: 1,
      explanation: 'La deduplicación trabaja a nivel de bloque: identifica bloques de datos idénticos en diferentes archivos y guarda solo uno, referenciando el bloque único desde todos los archivos. Ahorra entre 30-80% de espacio.',
    },
  ],

  'pki-ca': [
    {
      q: '¿Qué diferencia hay entre una Enterprise CA y una Standalone CA?',
      options: [
        'La Enterprise CA es más cara y la Standalone es gratuita',
        'La Enterprise CA se integra con AD y permite inscripción automática; la Standalone es independiente de AD',
        'La Enterprise CA solo emite certificados de servidor; la Standalone emite todos los tipos',
        'No hay diferencia funcional entre ambas',
      ],
      answer: 1,
      explanation: 'Enterprise CA requiere AD y permite que equipos y usuarios del dominio soliciten certificados automáticamente via GPO. Standalone CA no requiere AD pero toda la gestión es manual.',
    },
    {
      q: '¿Qué es una CRL (Certificate Revocation List)?',
      options: [
        'Una lista de certificados emitidos por la CA',
        'Una lista de certificados que han sido revocados antes de su fecha de expiración',
        'Una lista de CA de confianza',
        'Un registro de solicitudes de certificados pendientes',
      ],
      answer: 1,
      explanation: 'La CRL lista los números de serie de los certificados revocados (por compromiso de clave, cambio de rol, etc.). Los clientes la descargan para verificar si un certificado sigue siendo válido.',
    },
    {
      q: '¿Por qué la CA Raíz debería estar offline en una infraestructura PKI de producción?',
      options: [
        'Para ahorrar energía',
        'Porque una CA raíz comprometida comprometería TODOS los certificados del bosque',
        'Porque no puede estar conectada a la red por limitaciones técnicas',
        'Para evitar conflictos con otras CAs',
      ],
      answer: 1,
      explanation: 'Si la CA raíz es comprometida, el atacante puede emitir certificados fraudulentos para cualquier dominio. Mantenerla offline (encendiéndola solo para mantenimiento) minimiza este riesgo crítico.',
    },
    {
      q: '¿Cuál es el algoritmo hash mínimo recomendado para certificados en 2024?',
      options: ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'],
      answer: 2,
      explanation: 'SHA-1 está deprecado y rechazado por todos los navegadores modernos desde 2017. SHA-256 es el mínimo aceptable. SHA-384 y SHA-512 son más seguros pero raramente necesarios.',
    },
  ],

  'ad-delegation': [
    {
      q: '¿Qué principio de seguridad aplica la delegación de administración en AD?',
      options: ['Defensa en profundidad', 'Mínimo privilegio', 'Seguridad por oscuridad', 'Zero trust'],
      answer: 1,
      explanation: 'El principio de mínimo privilegio establece que cada usuario/proceso solo debe tener los permisos mínimos necesarios para su función. La delegación en AD aplica esto permitiendo solo las acciones específicas necesarias.',
    },
    {
      q: '¿Qué herramienta de línea de comandos permite gestionar las ACLs de objetos AD de forma granular?',
      options: ['adprep', 'ntdsutil', 'dsacls', 'ldifde'],
      answer: 2,
      explanation: 'dsacls.exe (Directory Services Access Control Lists) permite ver y modificar permisos de objetos de AD desde la línea de comandos con gran granularidad.',
    },
  ],

  'ps-remoting': [
    {
      q: '¿Qué protocolo usa PowerShell Remoting por defecto en entornos Windows?',
      options: ['SSH', 'WinRM', 'RDP', 'Telnet'],
      answer: 1,
      explanation: 'PowerShell Remoting usa WinRM (Windows Remote Management), que es la implementación de Microsoft del protocolo WS-Management. Puede usar HTTP (5985) o HTTPS (5986).',
    },
    {
      q: '¿Cuándo es más eficiente usar New-PSSession en lugar de Invoke-Command?',
      options: [
        'Siempre, New-PSSession es más rápido en todos los casos',
        'Cuando necesitas ejecutar múltiples comandos en el mismo servidor remoto',
        'Cuando necesitas conectarte a más de 10 servidores simultáneamente',
        'Cuando el servidor remoto está en otra red',
      ],
      answer: 1,
      explanation: 'New-PSSession crea una conexión persistente reutilizable. Para un único comando, Invoke-Command es más simple. Para múltiples operaciones en el mismo servidor, la sesión persistente evita la sobrecarga de crear/destruir conexiones.',
    },
    {
      q: '¿Qué parámetro de Invoke-Command controla cuántos equipos se procesan en paralelo?',
      options: ['-Parallel', '-MaxJobs', '-ThrottleLimit', '-BatchSize'],
      answer: 2,
      explanation: '-ThrottleLimit define el número máximo de conexiones simultáneas (por defecto 32). Reducirlo evita saturar la red; aumentarlo acelera operaciones masivas en infraestructuras grandes.',
    },
  ],
};

// Función helper: obtener quiz de un escenario
export function getQuizForScenario(scenarioId) {
  return WIN_QUIZZES[scenarioId] || [];
}
