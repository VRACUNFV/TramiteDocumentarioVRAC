import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack,
  Snackbar
} from '@mui/material';

export default function Home() {
  const [documentos, setDocumentos] = useState([]);
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);

  // Para alertas (Snackbar y sonido)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertedDocs, setAlertedDocs] = useState([]);

  const responsables = [
    'Karina',
    'Jessica',
    'Walter',
    'Luis',
    'Fabiola',
    'Romina',
    'David',
    'Christian'
  ];

  // Parámetros para alertas (horas)
  const horas24 = 24;
  const horasLegal = 72;

  // Cargar documentos al montar y cada 10s
  useEffect(() => {
    fetchDocumentos();
    const interval = setInterval(() => {
      fetchDocumentos();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();
      // Filtramos documentos no atendidos
      const noAtendidos = data.filter((doc) => !doc.atendido);
      setDocumentos(noAtendidos);

      // Lógica de alertas para documentos urgentes, >24h o >72h sin atender
      let shouldAlert = false;
      const messages = [];
      noAtendidos.forEach((doc) => {
        if (alertedDocs.includes(doc._id)) return;

        const fecha = new Date(doc.fechaLlegada);
        const ahora = new Date();
        const horasDiff = (ahora - fecha) / (1000 * 60 * 60);

        if (doc.urgente) {
          messages.push(`El documento ${doc.nt} es urgente.`);
          shouldAlert = true;
        }
        if (horasDiff > horas24) {
          messages.push(`El documento ${doc.nt} lleva más de 24h sin atender.`);
          shouldAlert = true;
        }
        if (horasDiff > horasLegal) {
          messages.push(`El documento ${doc.nt} excede el límite legal (${horasLegal}h).`);
          shouldAlert = true;
        }
      });

      if (shouldAlert && messages.length > 0) {
        setAlertMessage(messages.join(' | '));
        setAlertOpen(true);
        const audio = document.getElementById('alert-audio');
        if (audio) {
          audio.play().catch(err => console.error('Error al reproducir audio:', err));
        }
        const nuevosAlertados = noAtendidos
          .filter((doc) => !alertedDocs.includes(doc._id))
          .map((doc) => doc._id);
        setAlertedDocs((prev) => [...prev, ...nuevosAlertados]);
      } else {
        setAlertOpen(false);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  }

  async function crearDocumento(e) {
    e.preventDefault();
    const nuevoDoc = {
      nt,
      fechaLlegada,
      urgente,
      atrasado,
      responsable,
      atendido
    };

    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDoc)
      });
      await res.json();
      // Limpiar formulario
      setNt('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setResponsable('Karina');
      setAtendido(false);
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  async function actualizarDocumento(id, nuevoResponsable, nuevoAtendido) {
    try {
      await fetch(`/api/documentos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable: nuevoResponsable, atendido: nuevoAtendido })
      });
      if (nuevoAtendido) {
        setDocumentos((prev) => prev.filter((doc) => doc._id !== id));
      } else {
        fetchDocumentos();
      }
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  // Función para exportar los documentos no atendidos a CSV
  function exportToCSV(data) {
    const csvRows = [];
    const headers = ['NT', 'Fecha de Llegada', 'Urgente', 'Atrasado', 'Responsable', 'Atendido'];
    csvRows.push(headers.join(','));
    data.forEach(doc => {
      const row = [
        doc.nt,
        doc.fechaLlegada,
        doc.urgente ? 'Sí' : 'No',
        doc.atrasado ? 'Sí' : 'No',
        doc.responsable,
        doc.atendido ? 'Sí' : 'No'
      ];
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  function handleExportCSV() {
    const csvData = exportToCSV(documentos);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'documentos.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <>
      {/* Audio para alertas */}
      <audio id="alert-audio" src="/alert.mp3" preload="auto" />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
        autoHideDuration={6000}
      />

      <AppBar position="static">
        <Toolbar>
          {/* Logo VRAC */}
          <Box
            component="img"
            src="/vrac-logo.png"
            alt="VRAC Logo"
            sx={{ height: 50, mr: 2 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Alertas VRAC
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Botón para exportar CSV */}
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button variant="outlined" onClick={handleExportCSV}>
            Exportar CSV
          </Button>
        </Box>

        {/* Formulario para registrar documentos */}
        <Box component="form" onSubmit={crearDocumento} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Registrar Documento
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 400 }}>
            <TextField
              label="NT"
              variant="outlined"
              required
              value={nt}
              onChange={(e) => setNt(e.target.value)}
            />
            <TextField
              label="Fecha de Llegada"
              type="date"
              InputLabelProps={{ shrink: true }}
              required
              value={fechaLlegada}
              onChange={(e) => setFechaLlegada(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={urgente}
                  onChange={(e) => setUrgente(e.target.checked)}
                />
              }
              label="¿Urgente?"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={atrasado}
                  onChange={(e) => setAtrasado(e.target.checked)}
                />
              }
              label="¿Atrasado?"
            />
            <Typography>Responsable</Typography>
            <Select
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            >
              {responsables.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={
                <Checkbox
                  checked={atendido}
                  onChange={(e) => setAtendido(e.target.checked)}
                />
              }
              label="¿Atendido?"
            />
            <Button variant="contained" type="submit" color="primary">
              CREAR
            </Button>
          </Stack>
        </Box>

        <Typography variant="h5" gutterBottom>
          Lista de Documentos (No Atendidos)
        </Typography>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NT</TableCell>
                <TableCell>Fecha Llegada</TableCell>
                <TableCell>Urgente</TableCell>
                <TableCell>Atrasado</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Atendido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.nt}</TableCell>
                  <TableCell>{doc.fechaLlegada}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: doc.urgente ? '#ffcccc' : 'transparent'
                    }}
                  >
                    {doc.urgente ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: doc.atrasado ? '#ffe0b3' : 'transparent'
                    }}
                  >
                    {doc.atrasado ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={doc.responsable}
                      onChange={(e) =>
                        actualizarDocumento(doc._id, e.target.value, doc.atendido)
                      }
                      size="small"
                    >
                      {responsables.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={doc.atendido}
                      onChange={(e) =>
                        actualizarDocumento(doc._id, doc.responsable, e.target.checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </>
  );
}
