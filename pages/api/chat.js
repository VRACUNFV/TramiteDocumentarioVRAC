// pages/api/chat.js
import { Server } from "socket.io";

export default function handler(req, res) {
  // Verifica si ya se creó una instancia de Socket.IO
  if (!res.socket.server.io) {
    console.log("Creando nueva instancia de Socket.IO");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);
      
      // Recibir un mensaje del cliente
      socket.on("chat-message", (data) => {
        // Reenvía el mensaje a todos los clientes conectados
        io.emit("chat-message", data);
      });
    });
  }
  res.end();
}
