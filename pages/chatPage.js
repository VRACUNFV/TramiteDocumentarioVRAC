// pages/chatPage.js
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Container, TextField, Button, Typography, List, ListItem, ListItemText, Box } from "@mui/material";

let socket;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    fetch("/api/chat"); // Inicializa el socket en el backend
    socket = io();
    socket.on("chat-message", (data) => {
      setChat((prev) => [...prev, data]);
    });
    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("chat-message", message);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Chat Interno</Typography>
      <Box sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", mb: 2, p: 1 }}>
        <List>
          {chat.map((msg, idx) => (
            <ListItem key={idx}>
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
