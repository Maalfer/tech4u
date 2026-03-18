from typing import List, Dict
import json
import logging
import os
import asyncio
from fastapi import WebSocket
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Map user_id to a list of active local WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.redis_url = os.getenv("REDIS_URL")
        self.redis = None
        self.pubsub_task = None

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        # Initialize Redis and PubSub task on first connection if not already running
        if self.redis_url and not self.redis:
            try:
                self.redis = redis.from_url(self.redis_url, decode_responses=True)
                self.pubsub_task = asyncio.create_task(self._listen_to_redis())
            except Exception as e:
                logger.error(f"Redis connection error: {e}")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def _listen_to_redis(self):
        """Listens to Redis for broadcast messages from other workers."""
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("websocket_broadcast")
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                target_user = data.get("user_id")
                payload = data.get("payload")
                
                if target_user:
                    await self._send_local(payload, int(target_user))
                else:
                    await self._broadcast_local(payload)

    async def _send_local(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

    async def _broadcast_local(self, message: dict):
        for user_id in list(self.active_connections.keys()):
            await self._send_local(message, user_id)

    async def send_personal_message(self, message: dict, user_id: int):
        # 1. Send locally if user is connected to this worker
        await self._send_local(message, user_id)
        
        # 2. Publish to Redis so other workers can send to the user if they have the connection
        if self.redis:
            await self.redis.publish("websocket_broadcast", json.dumps({
                "user_id": user_id,
                "payload": message
            }))

    async def broadcast(self, message: dict):
        # 1. Broadast locally
        await self._broadcast_local(message)
        
        # 2. Publish to Redis for other workers
        if self.redis:
            await self.redis.publish("websocket_broadcast", json.dumps({
                "user_id": None,
                "payload": message
            }))

manager = ConnectionManager()
