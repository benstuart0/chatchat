from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Tuple, Any
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

# Store active connections and drawing state
class ConnectionManager:
    def __init__(self):
        # (websocket, username, join_time)
        self.active_connections: Dict[str, Tuple[WebSocket, str, datetime]] = {}
        self.user_count = 0
        self.drawing_state: List[Dict[str, Any]] = []  # Store drawing history

    async def connect(self, websocket: WebSocket, username: str) -> str:
        await websocket.accept()
        self.user_count += 1
        user_id = f"id_{self.user_count}"  # Internal ID
        join_time = datetime.now()
        self.active_connections[user_id] = (websocket, username, join_time)
        logger.info(f"New connection: {username} (ID: {user_id}) (Total users: {len(self.active_connections)})")
        # Send current drawing state to new user
        if self.drawing_state:
            await websocket.send_json({
                "type": "draw",
                "content": self.drawing_state[-1],  # Send the latest state
                "messageType": "draw"
            })
        # Broadcast updated user list
        await self.broadcast_user_list()
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

    def get_active_users(self) -> List[str]:
        # Sort users by join time
        sorted_users = sorted(
            self.active_connections.items(),
            key=lambda x: x[1][2]  # Sort by join_time
        )
        return [username for _, (_, username, _) in sorted_users]

    async def broadcast(self, message: dict):
        logger.info(f"Broadcasting message: {message}")
        # Store drawing state if it's a drawing message
        if message.get("type") == "draw":
            if message.get("content", {}).get("clear"):
                self.drawing_state = []
            else:
                self.drawing_state.append(message["content"])
        
        for websocket, _, _ in self.active_connections.values():
            await websocket.send_json(message)

    async def broadcast_user_list(self):
        active_users = self.get_active_users()
        await self.broadcast({
            "type": "users",
            "content": active_users
        })

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
                if message.get("type") == "draw":
                    logger.info(f"Drawing from {username}")
                else:
                    logger.info(f"Message from {username}: {message['content']}")
                await manager.broadcast(message)
            except json.JSONDecodeError:
                logger.error(f"Invalid message format from {username}: {data}")
                continue
                
    except WebSocketDisconnect:
        username = manager.disconnect(user_id)
        # Broadcast user left message
        await manager.broadcast({
            "type": "system",
            "content": f"{username} left the chat"
        })
        # Broadcast updated user list
        await manager.broadcast_user_list()

@app.get("/")
async def read_root():
    return {
        "status": "Server is running",
        "allowed_origins": ALLOWED_ORIGINS
    } 