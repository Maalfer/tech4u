import docker
import os
import time
import json
import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Configuration for Docker Proxy or direct socket
DOCKER_URL = os.getenv("DOCKER_URL", "unix:///var/run/docker.sock")

class HardenedDockerClient:
    def __init__(self):
        self._client = None
        self.base_url = DOCKER_URL

    @property
    def client(self):
        if self._client is None:
            try:
                # Use a short timeout for initialization to avoid hanging the app
                self._client = docker.DockerClient(base_url=self.base_url, timeout=5)
            except Exception as e:
                logger.error(f"Error connecting to Docker: {e}")
                return None
        return self._client


    def start_lab_container(self, user_id: int, lab_id: int, image: str, scenario_setup: Optional[str] = None):
        if not self.client:
            raise RuntimeError("Docker client not initialized")

        container_name = f"lab_{lab_id}_user_{user_id}_{int(time.time())}"
        
        # Security & Resource Limits
        # Use our hardened base image if default ubuntu is requested
        effective_image = "tech4u-base:latest" if image == "ubuntu:22.04" else image

        container = self.client.containers.run(
            image=effective_image,
            name=container_name,
            detach=True,
            tty=True,
            stdin_open=True,
            network_mode="none",          # No internet access
            mem_limit="128m",             # Resource limit: 128MB
            memswap_limit="128m",         # Prohibir swap adicional
            cpu_quota=50000,              # 0.5 CPU
            pids_limit=64,                # Lowered pids limit as requested
            # ulimits for process and file descriptors
            ulimits=[
                docker.types.Ulimit(name='nproc', soft=64, hard=64),
                docker.types.Ulimit(name='nofile', soft=128, hard=128)
            ],
            read_only=True,               # Immutable root FS
            cap_drop=["ALL"],             # Drop all by default
            cap_add=["CHOWN", "DAC_OVERRIDE", "FOWNER"], # Essential for scenario injection
            tmpfs={
                "/tmp": "size=16m,mode=1777,rw,exec",  # Volatile /tmp — exec necesario para scripts
                "/home/student": "size=32m,uid=1000,gid=1000,rw,exec", # exec: permite ./script.sh
                "/var/log": "size=8m,mode=1777,rw"      # Support software logs
            },
            user="student",               # Run as non-root (image must have this user)
            auto_remove=True,             # Cleanup on stop
            labels={
                "academy": "tech4u",
                "user_id": str(user_id),
                "lab_id": str(lab_id)
            }
        )

        # Apply Scenario Injection (Files, Directories, Commands)
        if scenario_setup:
            try:
                scenario = json.loads(scenario_setup)
                
                # 1. Create Directories — usar lista para evitar shell injection
                for directory in scenario.get("directories", []):
                    safe_dir = str(directory).strip()
                    # exec_run con lista (sin shell=True) no interpreta metacaracteres
                    container.exec_run(["mkdir", "-p", safe_dir], user="root")

                # 2. Create Files (Securely via Base64)
                for file_obj in scenario.get("files", []):
                    path = file_obj.get("path") or file_obj.get("name")
                    content = file_obj.get("content", "")
                    if not path:
                        continue

                    # Sanitizar path: solo permitir rutas bajo /home/student o /tmp
                    import posixpath
                    safe_path = posixpath.normpath("/" + str(path).lstrip("/"))
                    if not (safe_path.startswith("/home/student/") or safe_path.startswith("/tmp/")):
                        logger.warning(f"[DOCKER] Ruta rechazada por seguridad: {safe_path}")
                        continue

                    # Contenido en Base64 para evitar caracteres especiales en shell
                    b64_content = base64.b64encode(content.encode()).decode()

                    # Crear directorio padre de forma segura
                    parent_dir = posixpath.dirname(safe_path)
                    container.exec_run(["mkdir", "-p", parent_dir], user="root")

                    # Escribir contenido usando printf + base64 — sin interpolación shell
                    # Se pasa como string único a bash pero el path ya está saneado
                    cmd = ["bash", "-c",
                           f'printf "%s" "{b64_content}" | base64 -d > "{safe_path}" && chmod 644 "{safe_path}"']
                    res = container.exec_run(cmd, user="root")
                    if res.exit_code != 0:
                        logger.error(f"Error injecting file {safe_path}: {res.output.decode()}")
                    
                # 3. Running Setup Commands
                for cmd in scenario.get("commands", []):
                    container.exec_run(cmd, user="root")
                    
                # 4. Final Permission Fix (Ensure student owns home / tmp)
                container.exec_run("chown -R student:student /home/student", user="root")
                
            except Exception as e:
                logger.error(f"Error applying scenario setup: {e}")

        return container

    def get_active_containers_for_user(self, user_id: int):
        if not self.client: return []
        return self.client.containers.list(filters={"label": [f"academy=tech4u", f"user_id={user_id}"]})

    def kill_all_for_user(self, user_id: int):
        containers = self.get_active_containers_for_user(user_id)
        for c in containers:
            try:
                c.stop(timeout=1)
            except Exception as e:
                logger.warning(f"Could not stop container {getattr(c, 'id', '?')} for user {user_id}: {e}")

    def get_container(self, container_id: str):
        try:
            return self.client.containers.get(container_id)
        except Exception as e:
            logger.debug(f"Container {container_id} not found: {e}")
            return None

    def kill_container(self, container_id: str):
        container = self.get_container(container_id)
        if container:
            try:
                container.stop(timeout=2)
            except Exception as e:
                logger.warning(f"Could not stop container {container_id}: {e}")

docker_launcher = HardenedDockerClient()
