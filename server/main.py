from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://*.vercel.app"
).split(",")

# Enable CORS with more permissive settings for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if any("vercel.app" in origin for origin in ALLOWED_ORIGINS) else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, tuple[WebSocket, str]] = {}  # (websocket, username)
        self.user_count = 0

    async def connect(self, websocket: WebSocket, username: str) -> str:
        await websocket.accept()
        self.user_count += 1
        user_id = f"id_{self.user_count}"  # Internal ID
        self.active_connections[user_id] = (websocket, username)
        logger.info(f"New connection: {username} (ID: {user_id}) (Total users: {len(self.active_connections)})")
        return user_id

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            username = self.active_connections[user_id][1]
            del self.active_connections[user_id]
            logger.info(f"Disconnected: {username} (ID: {user_id}) (Total users: {len(self.active_connections)})")
            return username

    def get_username(self, user_id: str) -> str:
        if user_id in self.active_connections:
            return self.active_connections[user_id][1]
        return "Unknown User"

    async def broadcast(self, message: dict):
        logger.info(f"Broadcasting message: {message}")
        for websocket, _ in self.active_connections.values():
            await websocket.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    user_id = await manager.connect(websocket, username)
    try:
        # Notify all users about new connection
        await manager.broadcast({
            "type": "system",
            "content": f"{username} joined the chat"
        })
        
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Add user info to the message
                message["user_id"] = user_id
                message["username"] = username
                logger.info(f"Message from {username}: {message['content']}")
                await manager.broadcast(message)
            except json.JSONDecodeError:
                logger.error(f"Invalid message format from {username}: {data}")
                continue
                
    except WebSocketDisconnect:
        username = manager.disconnect(user_id)
        await manager.broadcast({
            "type": "system",
            "content": f"{username} left the chat"
        })

@app.get("/")
async def read_root():
    return {
        "status": "Server is running",
        "allowed_origins": ALLOWED_ORIGINS
    } 