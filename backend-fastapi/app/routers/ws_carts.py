from multiprocessing import connection
from optparse import Option
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

router = APIRouter()


class Manager:
    def __init__(self):
        self.connections = []
        self.user_map = {}

    async def connect(self, ws: WebSocket, user_id: str | None = None):
        await ws.accept()
        self.connections.append(ws)
        if user_id:
            self.user_map[user_id] = ws

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)
        for a, b in list(self.user_map.items()):
            if b == ws:
                del self.user_map[a]

    async def broadcast(self, message: dict):
        text = json.dumps(message)

        for c in self.connections:
            try:
                await c.send_text(text)
            except:
                pass

    async def send_to_user(self, user_id: str, message: dict):
        ws = self.user_map.get(user_id)

        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except:
                pass


manager = Manager()


@router.websocket("/cart")
async def websocket_cart(ws: WebSocket, user_id: Optional[str] = None):
    await manager.connect(ws, user_id=user_id)
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(data)
    except WebSocketDisconnect:
        manager.disconnect(ws)
