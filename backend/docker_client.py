import docker
import os
import time
import json
import base64
from typing import Optional

# Configuration for Docker Proxy or direct socket
DOCKER_URL = os.getenv("DOCKER_URL", "unix:///var/run/docker.sock")

class HardenedDockerClient:
    def __init__(self):
        try:
            self.client = docker.DockerClient(base_url=DOCKER_URL)
        except Exception as e:
            print(f"Error connecting to Docker: {e}")
            self.client = None

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
                "/tmp": "size=16m,mode=1777,rw",       # Volatile /tmp with sticky bit
                "/home/student": "size=32m,uid=1000,gid=1000,rw", # Volatile home owned by student
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
                
                # 1. Create Directories
                for directory in scenario.get("directories", []):
                    container.exec_run(f"mkdir -p {directory}", user="root")
                
                # 2. Create Files (Securely via Base64)
                for file_obj in scenario.get("files", []):
                    path = file_obj.get("path") or file_obj.get("name")
                    content = file_obj.get("content", "")
                    
                    # Encode content to Base64 to handle special shell characters ($, ", ', etc.)
                    b64_content = base64.b64encode(content.encode()).decode()
                    
                    # Ensure directory exists and write content using base64 -d
                    # We also chmod 644 to ensure student can read it
                    cmd = f"bash -c 'mkdir -p $(dirname {path}) && echo \"{b64_content}\" | base64 -d > {path} && chmod 644 {path}'"
                    res = container.exec_run(cmd, user="root")
                    if res.exit_code != 0:
                        print(f"Error injecting file {path}: {res.output.decode()}")
                    
                # 3. Running Setup Commands
                for cmd in scenario.get("commands", []):
                    container.exec_run(cmd, user="root")
                    
                # 4. Final Permission Fix (Ensure student owns home / tmp)
                container.exec_run("chown -R student:student /home/student", user="root")
                
            except Exception as e:
                print(f"Error applying scenario setup: {e}")

        return container

    def get_active_containers_for_user(self, user_id: int):
        if not self.client: return []
        return self.client.containers.list(filters={"label": [f"academy=tech4u", f"user_id={user_id}"]})

    def kill_all_for_user(self, user_id: int):
        containers = self.get_active_containers_for_user(user_id)
        for c in containers:
            try:
                c.stop(timeout=1)
            except:
                pass

    def get_container(self, container_id: str):
        try:
            return self.client.containers.get(container_id)
        except:
            return None

    def kill_container(self, container_id: str):
        container = self.get_container(container_id)
        if container:
            try:
                container.stop(timeout=2)
            except:
                pass

docker_launcher = HardenedDockerClient()
