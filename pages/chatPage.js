// pages/chatPage.js
import { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

let socket;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Inicializa el servidor Socket.IO llamando a nuestro endpoint
    fetch("/api/chat");

    // Conecta el cliente Socket.IO
    socket = io();

    // Escucha el evento "chat-message"
    socket.on("chat-message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    // Limpieza al desmontar
    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      // Envía el mensaje al servidor, que se distribuirá a todos
      socket.emit("chat-message", message);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat Interno
      </Typography>
      <Box sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", mb: 2, p: 1 }}>
        <List>
          {chat.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
        </List>
      </Box>
      <TextField
        label="Mensaje"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button variant="contained" onClick={sendMessage} sx={{ mt: 1 }}>
        Enviar
      </Button>
    </Container>
  );
}
