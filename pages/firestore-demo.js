// pages/firestore-demo.js
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { Container, Button, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";

export default function FirestoreDemo() {
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState("");

  // Función para obtener los registros de la colección "bitacora"
  async function fetchLogs() {
    try {
      const q = query(collection(db, "bitacora"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setLogs(data);
    } catch (error) {
      console.error("Error al obtener registros:", error);
    }
  }

  // Función para agregar un registro nuevo
  async function addLog() {
    try {
      await addDoc(collection(db, "bitacora"), {
        message: newLog,
        timestamp: new Date().toISOString()
      });
      setNewLog("");
      fetchLogs();
    } catch (error) {
      console.error("Error al agregar registro:", error);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Demo Firestore: Bitácora
      </Typography>
      <TextField
        label="Nuevo registro"
        fullWidth
        value={newLog}
        onChange={(e) => setNewLog(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={addLog} sx={{ mb: 2 }}>
        Agregar Registro
      </Button>
      <List>
        {logs.map((log) => (
          <ListItem key={log.id}>
            <ListItemText primary={log.message} secondary={log.timestamp} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
