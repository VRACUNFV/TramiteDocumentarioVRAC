import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@mui/material';

export default function Bitacora() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBitacora();
  }, []);

  async function fetchBitacora() {
    try {
      const res = await fetch('/api/bitacora');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error al obtener la bitácora:', error);
    }
  }

  const filteredLogs = logs.filter(log =>
    (log.documentId && log.documentId.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bitácora de Cambios
      </Typography>
      <TextField
        label="Buscar por Documento o Acción"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Documento ID</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Cambios</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map(log => (
              <TableRow key={log._id}>
                <TableCell>{log.documentId}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{JSON.stringify(log.changes)}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
