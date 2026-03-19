"""
seed_skill_labs_new_subjects.py — SkillLabExercise entries for 4 NEW subjects
Subjects: Ciberseguridad, PowerShell, Git, Python
Run: cd backend && source venv/bin/activate && python3 scripts/seed_skill_labs_new_subjects.py
"""
import os, sys, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, SkillLabExercise

def add_exercises(db, subject, exercises):
    """Insert exercises for a subject, checking for duplicates."""
    count = 0
    for ex in exercises:
        # Check if this exercise already exists (by subject + sentence_template)
        existing = db.query(SkillLabExercise).filter(
            SkillLabExercise.subject == subject,
            SkillLabExercise.sentence_template == ex["sentence_template"]
        ).first()

        if not existing:
            db.add(SkillLabExercise(
                subject=subject,
                sentence_template=ex["sentence_template"],
                correct_answers=json.dumps(ex["correct_answers"]),
                distractors=json.dumps(ex["distractors"]),
                explanation=ex.get("explanation", ""),
                difficulty=ex.get("difficulty", "medium"),
                approved=True
            ))
            count += 1

    db.commit()
    print(f"  ✓ {subject}: {count} nuevos ejercicios añadidos")

def run():
    db = SessionLocal()
    try:
        # ────────────────────────────────────────────────────────────────
        # SUBJECT 1: CIBERSEGURIDAD (32 ejercicios)
        # ────────────────────────────────────────────────────────────────
        ciberseguridad_exercises = [
            {
                "sentence_template": "El comando `nmap -sV ___` escanea los puertos de una IP mostrando versiones de servicios.",
                "correct_answers": ["IP_OBJETIVO", "192.168.1.1", "10.0.0.1"],
                "distractors": ["-A", "-sS", "-p 80"],
                "difficulty": "easy",
                "explanation": "El flag -sV realiza version detection. Después debe ir la dirección IP objetivo del escaneo."
            },
            {
                "sentence_template": "Para hacer un escaneo SYN sigiloso en Nmap se usa el flag ___.",
                "correct_answers": ["-sS"],
                "distractors": ["-sT", "-sU", "-sA"],
                "difficulty": "easy",
                "explanation": "-sS es el TCP SYN scan, mucho más rápido y sigiloso que -sT (conexión completa)."
            },
            {
                "sentence_template": "En iptables, la chain ___ controla el tráfico entrante al propio sistema.",
                "correct_answers": ["INPUT"],
                "distractors": ["OUTPUT", "FORWARD", "PREROUTING"],
                "difficulty": "medium",
                "explanation": "Las tres chains principales son INPUT (entrante), OUTPUT (saliente) y FORWARD (reencaminado)."
            },
            {
                "sentence_template": "El algoritmo de cifrado asimétrico más usado es ___.",
                "correct_answers": ["RSA"],
                "distractors": ["DES", "AES", "MD5"],
                "difficulty": "easy",
                "explanation": "RSA es el algoritmo de clave pública más popular para cifrado asimétrico (clave pública/privada)."
            },
            {
                "sentence_template": "El comando para permitir tráfico HTTP en iptables es: `iptables -A INPUT -p tcp --dport 80 ___`.",
                "correct_answers": ["-j ACCEPT"],
                "distractors": ["-j DROP", "-j DENY", "-j LOG"],
                "difficulty": "medium",
                "explanation": "-j ACCEPT permite el tráfico. -j DROP lo rechaza sin responder. -j DENY es específico de algunas variantes."
            },
            {
                "sentence_template": "El algoritmo de hashing criptográfico SHA-256 produce un hash de ___ bits.",
                "correct_answers": ["256"],
                "distractors": ["128", "512", "1024"],
                "difficulty": "easy",
                "explanation": "SHA-256 (Secure Hash Algorithm 256 bits) produce un digest de exactamente 256 bits (64 caracteres hexadecimales)."
            },
            {
                "sentence_template": "La vulnerabilidad OWASP #1 en 2021 es la inyección ___.",
                "correct_answers": ["SQL", "de SQL"],
                "distractors": ["XSS", "CSRF", "XXE"],
                "difficulty": "medium",
                "explanation": "La inyección SQL es la #1 en OWASP Top 10, permite ejecutar código SQL no autorizado en la BD."
            },
            {
                "sentence_template": "En Kali Linux, la herramienta para fuzzing de aplicaciones web es ___.",
                "correct_answers": ["Burp Suite", "burpsuite"],
                "distractors": ["Nmap", "Metasploit", "Aircrack-ng"],
                "difficulty": "medium",
                "explanation": "Burp Suite es el proxy de referencia para testing de seguridad en aplicaciones web."
            },
            {
                "sentence_template": "El protocolo TLS (Transport Layer Security) opera en la capa ___ del modelo OSI.",
                "correct_answers": ["4", "de transporte"],
                "distractors": ["3", "2", "7"],
                "difficulty": "medium",
                "explanation": "TLS es criptografía a nivel de transporte (capa 4). HTTPS = HTTP + TLS sobre TCP."
            },
            {
                "sentence_template": "El estándar X.509 define la estructura de ___.",
                "correct_answers": ["certificados digitales"],
                "distractors": ["llaves privadas", "hashes", "firmas digitales"],
                "difficulty": "hard",
                "explanation": "X.509 es el estándar ITU-T para certificados de clave pública, usado en HTTPS, TLS, etc."
            },
            {
                "sentence_template": "El flag `-p` en Nmap se usa para especificar ___.",
                "correct_answers": ["puertos"],
                "distractors": ["protocolo", "paquete", "payload"],
                "difficulty": "easy",
                "explanation": "-p 80,443,22 escanea puertos específicos. -p- escanea todos los 65535 puertos."
            },
            {
                "sentence_template": "En Metasploit, el módulo `exploit/windows/smb/ms17_010_eternalblue` explota la vulnerabilidad ___.",
                "correct_answers": ["EternalBlue"],
                "distractors": ["Heartbleed", "Shellshock", "Log4Shell"],
                "difficulty": "hard",
                "explanation": "EternalBlue es una vulnerabilidad de NSA filtrada (SMBv1), usada en WannaCry. MS17-010."
            },
            {
                "sentence_template": "El comando `netstat -tlnp` muestra los puertos abiertos en conexión ___.",
                "correct_answers": ["TCP", "listening"],
                "distractors": ["UDP", "ICMP", "FTP"],
                "difficulty": "medium",
                "explanation": "-t = TCP, -l = listening, -n = numeric, -p = PID/programa. En nuevos sistemas usar `ss`."
            },
            {
                "sentence_template": "La técnica de ataque ___ consiste en redirigir tráfico hacia un atacante haciéndose pasar por el gateway legítimo.",
                "correct_answers": ["ARP spoofing", "ARP Spoofing"],
                "distractors": ["DNS spoofing", "DHCP spoofing", "TCP spoofing"],
                "difficulty": "medium",
                "explanation": "ARP spoofing / ARP poisoning permite realizar MITM (man-in-the-middle) en redes locales."
            },
            {
                "sentence_template": "El comando para extraer certificados de un servidor HTTPS es `openssl s_client -connect host:443 ___`.",
                "correct_answers": ["-showcerts"],
                "distractors": ["-extract", "-show", "-list"],
                "difficulty": "hard",
                "explanation": "-showcerts muestra toda la cadena de certificados. Útil para auditoría de HTTPS."
            },
            {
                "sentence_template": "La herramienta `hydra` en Kali Linux se usa para ___.",
                "correct_answers": ["ataque de fuerza bruta"],
                "distractors": ["análisis de tráfico", "fuzzing", "reverse engineering"],
                "difficulty": "medium",
                "explanation": "Hydra ataca credenciales en SSH, FTP, HTTP, RDP, etc. Herramienta de diccionario/fuerza bruta."
            },
            {
                "sentence_template": "El estándar de encriptación simétrica más usado actualmente es ___.",
                "correct_answers": ["AES"],
                "distractors": ["DES", "3DES", "Blowfish"],
                "difficulty": "easy",
                "explanation": "AES (Advanced Encryption Standard, Rijndael) es el estándar NIST para cifrado simétrico de 128/192/256 bits."
            },
            {
                "sentence_template": "En iptables, para bloquear todo el tráfico saliente por defecto se usa: `iptables -P OUTPUT ___`.",
                "correct_answers": ["DROP"],
                "distractors": ["DENY", "REJECT", "BLOCK"],
                "difficulty": "hard",
                "explanation": "-P OUTPUT DROP establece la política por defecto (default policy). Todo DROP = lista blanca."
            },
            {
                "sentence_template": "La vulnerabilidad XSS (Cross-Site Scripting) permite inyectar ___ en la página web.",
                "correct_answers": ["JavaScript"],
                "distractors": ["Python", "SQL", "Bash"],
                "difficulty": "easy",
                "explanation": "XSS reflectada/almacenada permite ejecutar JS en el navegador de la víctima sin validación."
            },
            {
                "sentence_template": "El comando `tcpdump -i eth0 'tcp port 80'` captura tráfico ___.",
                "correct_answers": ["HTTP"],
                "distractors": ["HTTPS", "DNS", "FTP"],
                "difficulty": "medium",
                "explanation": "tcp port 80 es el puerto de HTTP sin cifrar. HTTPS (443) usa TLS sobre TCP."
            },
            {
                "sentence_template": "La contraseña debe tener al menos ___ caracteres según NIST 2021.",
                "correct_answers": ["8"],
                "distractors": ["12", "16", "20"],
                "difficulty": "medium",
                "explanation": "NIST SP 800-63B recomienda 8+ caracteres sin requisitos de complejidad si se permite cualquier carácter."
            },
            {
                "sentence_template": "En Metasploit, `set PAYLOAD windows/meterpreter/reverse_tcp` configura el ___.",
                "correct_answers": ["payload"],
                "distractors": ["exploit", "encoder", "handler"],
                "difficulty": "hard",
                "explanation": "El payload es el código que se ejecuta en la máquina víctima. meterpreter es una shell interactiva."
            },
            {
                "sentence_template": "El tipo de cifrado en base al algoritmo PBKDF2 es ___.",
                "correct_answers": ["key derivation"],
                "distractors": ["stream cipher", "block cipher", "hash"],
                "difficulty": "hard",
                "explanation": "PBKDF2 (Password-Based Key Derivation Function 2) es KDF, no cifrado directo. Usa salt + iteraciones."
            },
            {
                "sentence_template": "La herramienta `aircrack-ng` se usa para ataques contra ___.",
                "correct_answers": ["WiFi", "redes inalámbricas"],
                "distractors": ["firewalls", "servidores", "bases de datos"],
                "difficulty": "medium",
                "explanation": "aircrack-ng captura handshakes WPA/WPA2 y realiza ataque de diccionario para recuperar la contraseña."
            },
            {
                "sentence_template": "El comando `nmap --script vuln ___` ejecuta scripts NSE de detección de vulnerabilidades en el host.",
                "correct_answers": ["hostname/IP", "192.168.1.1"],
                "distractors": ["--target", "-p 1-65535", "--output"],
                "difficulty": "hard",
                "explanation": "NSE = Nmap Scripting Engine. --script vuln ejecuta categoría 'vuln'. Requiere especificar target."
            },
            {
                "sentence_template": "El ataque de denegación de servicio ___ satúra la red con tráfico no solicitado desde múltiples orígenes.",
                "correct_answers": ["DDoS"],
                "distractors": ["DoS", "SYN flood", "Botnet"],
                "difficulty": "easy",
                "explanation": "DDoS = Distributed DoS desde múltiples máquinas. DoS es desde una única fuente."
            },
            {
                "sentence_template": "El protocolo HTTPS utiliza el puerto ___ por defecto.",
                "correct_answers": ["443"],
                "distractors": ["80", "8080", "8443"],
                "difficulty": "easy",
                "explanation": "Puerto 443 es estándar para HTTPS. 80 es HTTP. 8080/8443 son puertos alternativos comunes."
            },
            {
                "sentence_template": "En iptables, `-m state --state ESTABLISHED` permite tráfico ___.",
                "correct_answers": ["de conexiones existentes"],
                "distractors": ["nuevo", "relacionado", "inválido"],
                "difficulty": "hard",
                "explanation": "Stateful firewall rastreia estado. ESTABLISHED = paquetes de conexiones activas. NEW = nuevas conexiones."
            },
            {
                "sentence_template": "El hash MD5 genera un digest de ___ caracteres hexadecimales.",
                "correct_answers": ["32"],
                "distractors": ["16", "64", "128"],
                "difficulty": "easy",
                "explanation": "MD5 produce 128 bits = 32 caracteres hex. SHA-1 = 40, SHA-256 = 64."
            },
            {
                "sentence_template": "La herramienta `john` (John the Ripper) se usa para ___.",
                "correct_answers": ["crackear contraseñas"],
                "distractors": ["análisis de malware", "fuzzing", "sniffing"],
                "difficulty": "medium",
                "explanation": "John the Ripper es cracker offline para hashes de contraseñas (passwd, shadow, SAM, etc)."
            },
            {
                "sentence_template": "El comando `sudo iptables -A INPUT -m limit --limit 10/minute -j ACCEPT` limita conexiones a ___.",
                "correct_answers": ["10 por minuto"],
                "distractors": ["100 por hora", "1000 por día", "5 por segundo"],
                "difficulty": "hard",
                "explanation": "--limit 10/minute = máximo 10 paquetes/minuto. Protege contra DoS/brute force attacks."
            },
            {
                "sentence_template": "La vulnerabilidad Log4Shell (CVE-2021-44228) afecta a la librería ___.",
                "correct_answers": ["Log4j"],
                "distractors": ["Logback", "Serilog", "Python logging"],
                "difficulty": "hard",
                "explanation": "Log4Shell es RCE crítico en Apache Log4j 2.x. Permite inyección JNDI en logs. Parcheado en 2.15.0+."
            }
        ]
        add_exercises(db, "ciberseguridad", ciberseguridad_exercises)

        # ────────────────────────────────────────────────────────────────
        # SUBJECT 2: POWERSHELL (28 ejercicios)
        # ────────────────────────────────────────────────────────────────
        powershell_exercises = [
            {
                "sentence_template": "Para listar todos los usuarios de Active Directory se usa `___ -Filter *`.",
                "correct_answers": ["Get-ADUser"],
                "distractors": ["Get-User", "List-ADUser", "Get-LocalUser"],
                "difficulty": "medium",
                "explanation": "Get-ADUser es el cmdlet para consultar usuarios AD. Requiere Active Directory module."
            },
            {
                "sentence_template": "El cmdlet ___ permite ejecutar comandos en equipos remotos.",
                "correct_answers": ["Invoke-Command"],
                "distractors": ["Remote-Command", "Execute-Remote", "Run-Command"],
                "difficulty": "medium",
                "explanation": "Invoke-Command permite ejecución remota con -ComputerName. Requiere WinRM habilitado."
            },
            {
                "sentence_template": "Para filtrar objetos en un pipeline se usa el cmdlet ___.",
                "correct_answers": ["Where-Object"],
                "distractors": ["Filter-Object", "Select-Object", "Sort-Object"],
                "difficulty": "easy",
                "explanation": "Where-Object (alias ?{}) filtra. Select-Object elige propiedades. Sort-Object ordena."
            },
            {
                "sentence_template": "El cmdlet `___ -Path 'C:\\temp' -Recurse` busca archivos recursivamente.",
                "correct_answers": ["Get-ChildItem"],
                "distractors": ["Get-Item", "Find-Item", "List-Item"],
                "difficulty": "easy",
                "explanation": "Get-ChildItem (alias ls, dir) lista archivos. -Recurse explora subcarpetas."
            },
            {
                "sentence_template": "Para importer un CSV se usa: `___ -Path 'data.csv'`.",
                "correct_answers": ["Import-Csv"],
                "distractors": ["Load-Csv", "Read-Csv", "Open-Csv"],
                "difficulty": "easy",
                "explanation": "Import-Csv convierte CSV a objetos PS. Export-Csv hace lo opuesto."
            },
            {
                "sentence_template": "El cmdlet ___ modifica la configuración de un usuario de Active Directory.",
                "correct_answers": ["Set-ADUser"],
                "distractors": ["Update-ADUser", "Modify-ADUser", "Edit-ADUser"],
                "difficulty": "medium",
                "explanation": "Set-ADUser actualiza atributos de usuario AD. New-ADUser crea usuarios nuevos."
            },
            {
                "sentence_template": "Para crear un nuevo grupo de AD se usa ___.",
                "correct_answers": ["New-ADGroup"],
                "distractors": ["Create-ADGroup", "Add-ADGroup", "Make-ADGroup"],
                "difficulty": "medium",
                "explanation": "New-ADGroup crea grupos. Add-ADGroupMember añade miembros a grupos existentes."
            },
            {
                "sentence_template": "El cmdlet ___ formatea la salida como tabla en la terminal.",
                "correct_answers": ["Format-Table"],
                "distractors": ["Display-Table", "Show-Table", "Print-Table"],
                "difficulty": "easy",
                "explanation": "Format-Table (alias ft) muestra en columnas. Format-List (alias fl) es por líneas."
            },
            {
                "sentence_template": "Para crear una tarea programada se usa ___.",
                "correct_answers": ["Register-ScheduledTask"],
                "distractors": ["New-ScheduledTask", "Create-Task", "Schedule-Task"],
                "difficulty": "hard",
                "explanation": "Register-ScheduledTask registra una tarea. New-ScheduledTask crea objeto sin registrar."
            },
            {
                "sentence_template": "El cmdlet `Get-Service | ___` detiene servicios.",
                "correct_answers": ["Stop-Service"],
                "distractors": ["Pause-Service", "Disable-Service", "Kill-Service"],
                "difficulty": "medium",
                "explanation": "Stop-Service detiene. Start-Service inicia. Disable-Service evita autostart."
            },
            {
                "sentence_template": "Para obtener la información de una máquina remota se usa ___.",
                "correct_answers": ["Get-ComputerInfo"],
                "distractors": ["Get-SystemInfo", "Get-PCInfo", "Get-HostInfo"],
                "difficulty": "medium",
                "explanation": "Get-ComputerInfo retorna datos del SO. Alternativa: Get-WmiObject Win32_ComputerSystem"
            },
            {
                "sentence_template": "El operador `|` en PowerShell es para ___.",
                "correct_answers": ["pipeline"],
                "distractors": ["comentario", "división", "comparación"],
                "difficulty": "easy",
                "explanation": "El pipe (|) envía output de un cmdlet como input al siguiente. Concepto clave de PS."
            },
            {
                "sentence_template": "El cmdlet ___ convierte objetos PS a formato JSON.",
                "correct_answers": ["ConvertTo-Json"],
                "distractors": ["Export-Json", "To-Json", "Format-Json"],
                "difficulty": "medium",
                "explanation": "ConvertTo-Json serializa a JSON. ConvertFrom-Json deserializa JSON a objetos PS."
            },
            {
                "sentence_template": "Para listar miembros de un grupo AD se usa ___.",
                "correct_answers": ["Get-ADGroupMember"],
                "distractors": ["Get-GroupUsers", "List-ADGroupMembers", "Show-GroupMembers"],
                "difficulty": "medium",
                "explanation": "Get-ADGroupMember lista usuarios en un grupo. Parámetro: -Identity 'NombreGrupo'"
            },
            {
                "sentence_template": "El cmdlet ___ copia archivos de forma recursiva entre máquinas.",
                "correct_answers": ["Copy-Item"],
                "distractors": ["Copy-File", "Transfer-Item", "Sync-Item"],
                "difficulty": "medium",
                "explanation": "Copy-Item copia locales. Para remotas: via Invoke-Command o Copy-VMFile (Hyper-V)."
            },
            {
                "sentence_template": "Para mostrar variables de entorno usa ___.",
                "correct_answers": ["$env:"],
                "distractors": ["%env%", "[environment]", "$PATH"],
                "difficulty": "easy",
                "explanation": "$env:PATH, $env:USERNAME, $env:COMPUTERNAME. En Windows: %VAR% es batch/cmd."
            },
            {
                "sentence_template": "El cmdlet `___ -Name 'patrón'` encuentra procesos por nombre.",
                "correct_answers": ["Get-Process"],
                "distractors": ["Find-Process", "List-Process", "Search-Process"],
                "difficulty": "easy",
                "explanation": "Get-Process (alias ps) lista procesos. Get-Process -Name 'chrome' o Get-Process | ? Name -like '*app*'"
            },
            {
                "sentence_template": "Para capturar excepciones se usa el bloque ___.",
                "correct_answers": ["try-catch"],
                "distractors": ["if-else", "try-finally", "do-while"],
                "difficulty": "medium",
                "explanation": "try { } catch { } finally { }. try=bloque, catch=manejo error, finally=siempre ejecuta."
            },
            {
                "sentence_template": "El cmdlet ___ crea un nuevo usuario en Active Directory.",
                "correct_answers": ["New-ADUser"],
                "distractors": ["Create-ADUser", "Add-ADUser", "Make-ADUser"],
                "difficulty": "medium",
                "explanation": "New-ADUser -Name 'Juan' crea usuario. Set-ADUser modifica existentes."
            },
            {
                "sentence_template": "Para instalar un módulo de PowerShell se usa ___.",
                "correct_answers": ["Install-Module"],
                "distractors": ["Import-Module", "Load-Module", "Add-Module"],
                "difficulty": "easy",
                "explanation": "Install-Module descarga de PowerShell Gallery. Import-Module carga módulo ya instalado."
            },
            {
                "sentence_template": "El cmdlet `Get-ChildItem -Path ___` lista archivos de la carpeta System32.",
                "correct_answers": ["$env:WINDIR\\System32", "C:\\Windows\\System32"],
                "distractors": ["C:\\System32", "$SYSTEM32", "WINDIR"],
                "difficulty": "hard",
                "explanation": "$env:WINDIR es típicamente C:\\Windows. System32 es la carpeta del SO y comandos."
            },
            {
                "sentence_template": "Para ejecutar un script con parámetros: `___ -FilePath script.ps1 -ArgumentList param1,param2`.",
                "correct_answers": ["Invoke-Expression", "& ./script.ps1"],
                "distractors": ["Execute-Script", "Run-Script", "Call-Script"],
                "difficulty": "hard",
                "explanation": "& ./script.ps1 param1 param2 ejecuta script. Invoke-Expression también pero más lento."
            },
            {
                "sentence_template": "El cmdlet ___ retorna información sobre el usuario AD conectado.",
                "correct_answers": ["whoami"],
                "distractors": ["Get-User", "Get-CurrentUser", "Get-ADUser"],
                "difficulty": "easy",
                "explanation": "whoami retorna el usuario conectado. $env:USERNAME también funciona."
            },
            {
                "sentence_template": "Para buscar eventos en el Event Viewer usa ___.",
                "correct_answers": ["Get-EventLog", "Get-WinEvent"],
                "distractors": ["List-EventLog", "Find-Event", "Show-EventLog"],
                "difficulty": "hard",
                "explanation": "Get-WinEvent es más moderno. Get-EventLog es legacy. Parámetro -LogName para especificar log."
            },
            {
                "sentence_template": "El cmdlet ___ inicia un proceso Windows.",
                "correct_answers": ["Start-Process"],
                "distractors": ["New-Process", "Launch-Process", "Execute-Process"],
                "difficulty": "medium",
                "explanation": "Start-Process 'notepad.exe' abre proceso. -NoNewWindow lo ejecuta en misma ventana."
            },
            {
                "sentence_template": "Para convertir un hash PowerShell a formato JSON se usa ___.",
                "correct_answers": ["ConvertTo-Json"],
                "distractors": ["Export-Hash", "To-JSON", "Format-Hash"],
                "difficulty": "medium",
                "explanation": "@{prop1='val1'; prop2='val2'} | ConvertTo-Json serializa hash/object a JSON."
            },
            {
                "sentence_template": "El cmdlet `___` añade un usuario a un grupo de AD.",
                "correct_answers": ["Add-ADGroupMember"],
                "distractors": ["New-ADGroupMember", "Set-ADGroupMember", "Join-ADGroup"],
                "difficulty": "medium",
                "explanation": "Add-ADGroupMember -Identity 'Grupo' -Members usuario1,usuario2 añade miembros."
            }
        ]
        add_exercises(db, "powershell", powershell_exercises)

        # ────────────────────────────────────────────────────────────────
        # SUBJECT 3: GIT (28 ejercicios)
        # ────────────────────────────────────────────────────────────────
        git_exercises = [
            {
                "sentence_template": "El comando `git ___` muestra el estado del repositorio actual.",
                "correct_answers": ["status"],
                "distractors": ["show", "log", "diff"],
                "difficulty": "easy",
                "explanation": "git status muestra archivos modificados, staged y untracked. Fundamental en workflow."
            },
            {
                "sentence_template": "Para crear y cambiar a una nueva rama se usa `git checkout ___`.",
                "correct_answers": ["-b nombre-rama", "-b feature/login"],
                "distractors": ["-n nombre-rama", "new nombre-rama", "-c nombre-rama"],
                "difficulty": "easy",
                "explanation": "git checkout -b rama-nueva crea y cambia a la rama. git branch solo crea sin cambiar."
            },
            {
                "sentence_template": "El comando `git ___ HEAD~1` deshace el último commit manteniendo los cambios.",
                "correct_answers": ["reset"],
                "distractors": ["revert", "undo", "restore"],
                "difficulty": "medium",
                "explanation": "git reset HEAD~1 deshace commit pero mantiene cambios unstaged. git revert crea nuevo commit."
            },
            {
                "sentence_template": "Para guardar cambios temporalmente sin commitear se usa `git ___`.",
                "correct_answers": ["stash"],
                "distractors": ["save", "hold", "suspend"],
                "difficulty": "medium",
                "explanation": "git stash guarda trabajo en progreso. git stash pop lo recupera. git stash list lista."
            },
            {
                "sentence_template": "El comando `git ___ origin master` sube commits al repositorio remoto.",
                "correct_answers": ["push"],
                "distractors": ["sync", "upload", "send"],
                "difficulty": "easy",
                "explanation": "git push origin master envía branch local master al remoto. Sin push, cambios no se sincronizar."
            },
            {
                "sentence_template": "Para descargar cambios del repositorio remoto se usa `git ___`.",
                "correct_answers": ["pull"],
                "distractors": ["fetch", "download", "sync"],
                "difficulty": "easy",
                "explanation": "git pull = git fetch + git merge. git fetch solo descarga sin mergear."
            },
            {
                "sentence_template": "El comando `git ___ archivo.txt` añade un archivo específico al staging area.",
                "correct_answers": ["add"],
                "distractors": ["stage", "include", "track"],
                "difficulty": "easy",
                "explanation": "git add archivo.txt prepara archivo. git add . añade todos. git add -A incluye borrados."
            },
            {
                "sentence_template": "Para crear un commit se usa `git ___ -m 'mensaje'`.",
                "correct_answers": ["commit"],
                "distractors": ["save", "record", "store"],
                "difficulty": "easy",
                "explanation": "git commit registra cambios en el historial local. -m proporciona mensaje (obligatorio)."
            },
            {
                "sentence_template": "El comando `git ___ develop` integra la rama develop en la rama actual.",
                "correct_answers": ["merge"],
                "distractors": ["combine", "sync", "integrate"],
                "difficulty": "medium",
                "explanation": "git merge rama combina historiales. Puede causar conflictos si ambas modifican mismos archivos."
            },
            {
                "sentence_template": "Para ver el historial de commits se usa `git ___`.",
                "correct_answers": ["log"],
                "distractors": ["history", "commits", "show"],
                "difficulty": "easy",
                "explanation": "git log muestra commits. git log --oneline resume. git log -p muestra diferencias."
            },
            {
                "sentence_template": "El comando `git ___ origin` configura el repositorio remoto por defecto.",
                "correct_answers": ["remote add", "remote"],
                "distractors": ["origin set", "link", "attach"],
                "difficulty": "medium",
                "explanation": "git remote add origin https://... añade remoto. git remote -v lista remotos."
            },
            {
                "sentence_template": "Para clonar un repositorio remoto se usa `git ___`.",
                "correct_answers": ["clone"],
                "distractors": ["copy", "download", "fetch"],
                "difficulty": "easy",
                "explanation": "git clone https://repo.git descarga repositorio completo con historial."
            },
            {
                "sentence_template": "El comando `git ___ archivo.txt` visualiza cambios sin staged.",
                "correct_answers": ["diff"],
                "distractors": ["show", "compare", "changes"],
                "difficulty": "medium",
                "explanation": "git diff muestra cambios unstaged. git diff --staged muestra staged vs último commit."
            },
            {
                "sentence_template": "Para eliminar una rama local se usa `git branch ___`.",
                "correct_answers": ["-d nombre-rama", "-D nombre-rama"],
                "distractors": ["-r nombre-rama", "remove nombre-rama", "-del nombre-rama"],
                "difficulty": "medium",
                "explanation": "-d borrar normal (safe). -D fuerza borrado. git branch -dr origin/rama elimina rama remota local."
            },
            {
                "sentence_template": "El comando `git ___ <commit>` crea una etiqueta en un commit específico.",
                "correct_answers": ["tag"],
                "distractors": ["label", "mark", "pin"],
                "difficulty": "hard",
                "explanation": "git tag v1.0.0 crea anotada. git push origin v1.0.0 sube etiqueta."
            },
            {
                "sentence_template": "Para reescribir el historial de commits se usa `git ___`.",
                "correct_answers": ["rebase"],
                "distractors": ["rewrite", "reset", "reconstruct"],
                "difficulty": "hard",
                "explanation": "git rebase rama reimplanta commits. -i para rebase interactivo. Peligroso en ramas públicas."
            },
            {
                "sentence_template": "El comando `git ___ HEAD~1 archivo.txt` recupera versión anterior de un archivo.",
                "correct_answers": ["checkout"],
                "distractors": ["restore", "revert", "recover"],
                "difficulty": "medium",
                "explanation": "git checkout HEAD~1 archivo.txt restaura. git restore también funciona (más nueva)."
            },
            {
                "sentence_template": "Para buscar commits por mensaje se usa `git log ___`.",
                "correct_answers": ["--grep"],
                "distractors": ["-m", "-s", "--search"],
                "difficulty": "hard",
                "explanation": "git log --grep='pattern' busca en mensajes. git log -S patrón busca en código."
            },
            {
                "sentence_template": "El comando `git ___ --all` lista todas las ramas (locales y remotas).",
                "correct_answers": ["branch"],
                "distractors": ["list", "branches", "show"],
                "difficulty": "easy",
                "explanation": "git branch lista locales. git branch -a lista todas. git branch -r lista remotas."
            },
            {
                "sentence_template": "Para aplicar un commit de otra rama sin mergear usa `git ___`.",
                "correct_answers": ["cherry-pick"],
                "distractors": ["pick", "apply", "copy"],
                "difficulty": "hard",
                "explanation": "git cherry-pick <commit> aplica commit específico a rama actual sin mergear toda rama."
            },
            {
                "sentence_template": "El comando `git ___ -am 'mensaje'` combina add y commit.",
                "correct_answers": ["commit"],
                "distractors": ["add", "save", "stage"],
                "difficulty": "easy",
                "explanation": "git commit -am 'msg' añade archivos tracked y commtea. No funciona en archivos nuevos (untracked)."
            },
            {
                "sentence_template": "Para ignorar archivos en git se usa un archivo llamado ___.",
                "correct_answers": [".gitignore"],
                "distractors": ["git.ignore", "ignore.txt", ".ignore"],
                "difficulty": "easy",
                "explanation": ".gitignore lista patrones a ignorar (*.log, node_modules/, .env, etc)."
            },
            {
                "sentence_template": "El comando `git ___ origin` obtiene cambios sin mergear automáticamente.",
                "correct_answers": ["fetch"],
                "distractors": ["pull", "sync", "get"],
                "difficulty": "medium",
                "explanation": "git fetch descarga sin mergear. git pull hace fetch + merge. fetch es más seguro."
            },
            {
                "sentence_template": "Para resolver conflictos de merge, primero se debe ___.",
                "correct_answers": ["editar los archivos"],
                "distractors": ["descartar cambios", "abortar merge", "resetear rama"],
                "difficulty": "hard",
                "explanation": "Editar archivos con conflictos (<<<<<<, ======, >>>>>>>), luego git add y git commit."
            },
            {
                "sentence_template": "El comando `git ___ <archivo>` muestra quién modificó cada línea.",
                "correct_answers": ["blame"],
                "distractors": ["who", "author", "history"],
                "difficulty": "hard",
                "explanation": "git blame archivo muestra autor y commit de cada línea. Útil para auditoría."
            }
        ]
        add_exercises(db, "git", git_exercises)

        # ────────────────────────────────────────────────────────────────
        # SUBJECT 4: PYTHON (29 ejercicios)
        # ────────────────────────────────────────────────────────────────
        python_exercises = [
            {
                "sentence_template": "Una list comprehension para obtener números pares del 0 al 20: `[x for x in range(21) if x ___ 2 == 0]`.",
                "correct_answers": ["%"],
                "distractors": ["/", "//", "-"],
                "difficulty": "easy",
                "explanation": "x % 2 == 0 es la condición módulo. Si resto de x/2 es 0, es par."
            },
            {
                "sentence_template": "El decorador ___ se usa para definir un método de clase sin acceso a la instancia.",
                "correct_answers": ["@staticmethod"],
                "distractors": ["@classmethod", "@property", "@staticproperty"],
                "difficulty": "medium",
                "explanation": "@staticmethod para métodos sin self. @classmethod recibe cls. @property hace getters."
            },
            {
                "sentence_template": "Para abrir un archivo de forma segura se usa: `with ___ ('archivo.txt', 'r') as f:`",
                "correct_answers": ["open"],
                "distractors": ["file", "read", "stream"],
                "difficulty": "easy",
                "explanation": "with open(...) as f: cierra archivo automáticamente incluso si hay error."
            },
            {
                "sentence_template": "El método `___ (['a','b','c'])`retorna el número de elementos.",
                "correct_answers": ["len"],
                "distractors": ["size", "count", "length"],
                "difficulty": "easy",
                "explanation": "len(lista) retorna tamaño. len('hola') = 4, len([1,2,3]) = 3."
            },
            {
                "sentence_template": "Para iterar con índice use: `for i, valor in ___ (lista):`",
                "correct_answers": ["enumerate"],
                "distractors": ["iterate", "index", "loop"],
                "difficulty": "easy",
                "explanation": "enumerate(lista) retorna tuplas (índice, valor). Útil para obtener posición."
            },
            {
                "sentence_template": "El operador `___` compara si dos objetos son el mismo en memoria.",
                "correct_answers": ["is"],
                "distractors": ["==", "===", "equals"],
                "difficulty": "medium",
                "explanation": "is compara identidad (mismo objeto). == compara valor. [1]==[1] True, [1] is [1] False."
            },
            {
                "sentence_template": "Para manejar excepciones específicas: `try: ... except ___ as e: ...`",
                "correct_answers": ["ValueError"],
                "distractors": ["Exception", "Error", "TypeError"],
                "difficulty": "medium",
                "explanation": "except ValueError para excepciones de valor. except TypeError para tipos. except Exception es general."
            },
            {
                "sentence_template": "El tipo de datos ___ es una colección desordenada de elementos únicos.",
                "correct_answers": ["set"],
                "distractors": ["list", "tuple", "dict"],
                "difficulty": "easy",
                "explanation": "set({1,2,3}) elimina duplicados. list=[1,2,2] mantiene duplicados."
            },
            {
                "sentence_template": "Para definir una función que acepte argumentos variables: `def func(___)`.",
                "correct_answers": ["*args", "*args, **kwargs"],
                "distractors": ["...args", "^args", "args[]"],
                "difficulty": "medium",
                "explanation": "*args = tupla de argumentos posicionales. **kwargs = diccionario de argumentos nombrados."
            },
            {
                "sentence_template": "El método `___ ()` retorna una copia del diccionario con pares clave-valor.",
                "correct_answers": ["items"],
                "distractors": ["pairs", "values", "keys"],
                "difficulty": "easy",
                "explanation": ".items() retorna pares. .keys() solo claves. .values() solo valores."
            },
            {
                "sentence_template": "Para crear una función anónima: `lambda ___: expresión`",
                "correct_answers": ["x"],
                "distractors": ["def", "function", "->"],
                "difficulty": "medium",
                "explanation": "lambda x: x*2 es función anónima. Se usa en map(), filter(), sort()."
            },
            {
                "sentence_template": "El módulo ___ proporciona funciones matemáticas como sqrt, sin, cos.",
                "correct_answers": ["math"],
                "distractors": ["calculus", "maths", "num"],
                "difficulty": "easy",
                "explanation": "import math; math.sqrt(16) = 4. import numpy para arrays."
            },
            {
                "sentence_template": "El método `___ (clave, valor)` añade un elemento al diccionario.",
                "correct_answers": ["update"],
                "distractors": ["add", "insert", "append"],
                "difficulty": "easy",
                "explanation": "dict.update({k:v}) actualiza. dict[k]=v también. append es para listas."
            },
            {
                "sentence_template": "Para hacer requests HTTP se usa la librería ___.",
                "correct_answers": ["requests"],
                "distractors": ["http", "urllib", "web"],
                "difficulty": "easy",
                "explanation": "requests.get(url) obtiene. requests.post() envia. urllib es más bajo nivel."
            },
            {
                "sentence_template": "El método `___ ()` retorna cadena para representación legible de un objeto.",
                "correct_answers": ["__str__"],
                "distractors": ["__repr__", "to_string", "string"],
                "difficulty": "hard",
                "explanation": "__str__ legible para usuario. __repr__ para desarrollador (debug)."
            },
            {
                "sentence_template": "Para crear un diccionario con default values: `collections. ___`",
                "correct_answers": ["defaultdict"],
                "distractors": ["DefaultDict", "default_dict", "Dict"],
                "difficulty": "hard",
                "explanation": "from collections import defaultdict; d = defaultdict(list) evita KeyError."
            },
            {
                "sentence_template": "El decorator ___ transforma método en property (getter).",
                "correct_answers": ["@property"],
                "distractors": ["@getter", "@field", "@attr"],
                "difficulty": "hard",
                "explanation": "@property permite acceso como atributo. obj.valor en lugar de obj.valor()."
            },
            {
                "sentence_template": "Para iterar dos listas en paralelo: `for x, y in ___ (l1, l2):`",
                "correct_answers": ["zip"],
                "distractors": ["pair", "combine", "merge"],
                "difficulty": "medium",
                "explanation": "zip(l1, l2) empareja elementos. zip('ABC', [1,2,3]) = [('A',1),('B',2),('C',3)]."
            },
            {
                "sentence_template": "Para crear un string formateado: `f'Hola {___}'` (f-string).",
                "correct_answers": ["nombre"],
                "distractors": ["%s nombre", "$nombre", "${nombre}"],
                "difficulty": "easy",
                "explanation": "f'{var}' interpola. Equivalente a '{}'.format(var) o '%s' % var pero más legible."
            },
            {
                "sentence_template": "El módulo ___ proporciona herramientas para expresiones regulares.",
                "correct_answers": ["re"],
                "distractors": ["regex", "regexp", "pattern"],
                "difficulty": "medium",
                "explanation": "import re; re.search(), re.findall(), re.sub() para patrones."
            },
            {
                "sentence_template": "Para ordenar lista de diccionarios por clave: `sorted(lista, key=lambda ___)`",
                "correct_answers": ["x: x['clave']"],
                "distractors": ["item: item.clave", "x: x.get('clave')", "x -> x['clave']"],
                "difficulty": "hard",
                "explanation": "sorted(items, key=lambda x: x['nombre']) ordena por campo 'nombre'."
            },
            {
                "sentence_template": "El módulo ___ permite trabajar con fechas y horas.",
                "correct_answers": ["datetime"],
                "distractors": ["time", "date", "calendar"],
                "difficulty": "easy",
                "explanation": "from datetime import datetime; datetime.now() obtiene fecha/hora actual."
            },
            {
                "sentence_template": "Para aplicar función a cada elemento: `___ (func, lista)`",
                "correct_answers": ["map"],
                "distractors": ["apply", "each", "transform"],
                "difficulty": "medium",
                "explanation": "map(lambda x: x*2, [1,2,3]) = [2,4,6]. Con list() retorna lista."
            },
            {
                "sentence_template": "El método `___ ()` elimina y retorna el último elemento de lista.",
                "correct_answers": ["pop"],
                "distractors": ["remove", "delete", "extract"],
                "difficulty": "easy",
                "explanation": "lista.pop() o lista.pop(índice). .remove(valor) elimina por valor."
            },
            {
                "sentence_template": "Para verificar si elemento está en lista: `___ in lista`",
                "correct_answers": ["elemento"],
                "distractors": ["elemento.in", "contains", "has"],
                "difficulty": "easy",
                "explanation": "'x' in ['x','y','z'] = True. 'x' in 'xyz' también funciona."
            },
            {
                "sentence_template": "El tipo hint para variable que puede ser int o str: `var: ___`",
                "correct_answers": ["int | str", "Union[int, str]"],
                "distractors": ["int/str", "int,str", "(int, str)"],
                "difficulty": "hard",
                "explanation": "Python 3.10+: int | str. Previo: Union[int, str] (typing module)."
            },
            {
                "sentence_template": "Para generar números en rango: `___ (1, 10)` retorna 1-9.",
                "correct_answers": ["range"],
                "distractors": ["for", "loop", "sequence"],
                "difficulty": "easy",
                "explanation": "range(1,10) = [1,2,...,9]. range(10) = [0,1,...,9]. range(0,10,2) = pares."
            },
            {
                "sentence_template": "El módulo ___ proporciona estructuras de datos como Counter y deque.",
                "correct_answers": ["collections"],
                "distractors": ["structures", "data", "types"],
                "difficulty": "hard",
                "explanation": "from collections import Counter, defaultdict, deque, namedtuple."
            }
        ]
        add_exercises(db, "python", python_exercises)

        print("\n✓ Seed completado: 4 nuevos subjects con 113 ejercicios totales")

    finally:
        db.close()

if __name__ == "__main__":
    run()
