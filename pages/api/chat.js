// pages/api/chat.js
import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Creando nueva instancia de Socket.IO");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Cliente conectado", socket.id);

      socket.on("chat-message", (data) => {
        // Emite el mensaje a todos los conectados
        io.emit("chat-message", data);
      });
    });
  }
  res.end();
}
