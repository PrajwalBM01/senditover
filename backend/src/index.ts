import express from "express";
import { nanoid } from "nanoid";
import { WebSocket, WebSocketServer } from "ws";

const app = express();

// the first ever req coming from browser is always a http req and then the server get upgraded to a ws server
const server = app.listen(8080, () => {
  console.log("server listinning on port 8080");
});

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  clientId?: string;
}

const wss = new WebSocketServer({ server });

const rooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws: ExtendedWebSocket) => {
  ws.clientId = nanoid();
  console.log("A new connection was made!");
  ws.on("error", (err) => {
    console.log("error occured", err);
  });

  ws.on("message", (data) => {
    console.log(data.toString());
    const message = JSON.parse(data.toString());

    if (message.type === "CREATE_ROOM") {
      createRoom();
    }

    if (message.type === "JOIN_ROOM") {
      joinRoom(message.data);
    }

    if (message.type === "COMM") {
      if (!ws.roomId) return;
      communication(ws.roomId, message.data);
    }
  });

  const communication = (roomId: string, data: string) => {
    if (!rooms.has(roomId)) {
      ws.send(
        JSON.stringify({ type: "ROOM_NOT_FOUND", data: "Room not found" }),
      );
      return;
    }

    const room = rooms.get(roomId)!;
    console.log(room, typeof room);

    for (const client of room) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "COMM",
            data,
            senderId: ws.clientId,
          }),
        );
      }
    }
  };

  const createRoom = () => {
    const room_id = nanoid();
    if (!rooms.has(room_id)) {
      rooms.set(room_id, new Set());
    }
    ws.roomId = room_id;
    rooms.get(room_id)!.add(ws);
    ws.send(JSON.stringify({ type: "ROOM_ID", data: room_id }));
  };

  const joinRoom = (inviteCode: string) => {
    if (!rooms.has(inviteCode)) {
      ws.send(
        JSON.stringify({ type: "ROOM_NOT_FOUND", data: "Room not found" }),
      );
      return;
    }

    rooms.get(inviteCode)!.add(ws);
    ws.roomId = inviteCode;

    ws.send(JSON.stringify({ type: "ROOM_JOINED", data: inviteCode }));
    console.log(rooms);
  };

  ws.on("close", () => {
    if (!ws.roomId) return;

    const room = rooms.get(ws.roomId);
    if (!room) return;

    room.delete(ws);

    if (room.size === 0) {
      rooms.delete(ws.roomId);
    }
  });

  ws.send(JSON.stringify({
    type: "CLIENT_ID",
    data: ws.clientId
  }));
});
