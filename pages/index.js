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

/**
 * CONFIGURA AQUÍ TUS TIEMPOS:
 *  - horas24: tiempo para la alerta de 24 horas
 *  - horasLegal: tiempo máximo según ley (ej. 72 horas)
 */
const horas24 = 24;
const horasLegal = 72;

export default function Home() {
  const [documentos, setDocumentos] = useState([]);
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);

  // Para las alertas (Snackbar)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  // Para evitar re-alertar el mismo documento varias veces
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

  // Al montar, cargamos documentos
  useEffect(() => {
    fetchDocumentos();
  }, []);

  // Refresco cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDocumentos();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Obtiene todos los documentos y filtra los "atendidos".
   * Además, genera alertas si:
   *   - Hay documentos urgentes no atendidos
   *   - Han pasado 24h
   *   - Han pasado 72h (o el tiempo legal)
   */
  async function fetchDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();

      // Filtra NO atendidos
      const noAtendidos = data.filter((doc) => !doc.atendido);
      setDocumentos(noAtendidos);

      // Lógica de alertas
      const messages = [];
      let shouldAlert = false;

      noAtendidos.forEach((doc) => {
        // Verificamos si ya alertamos por este doc
        if (alertedDocs.includes(doc._id)) return;

        // Calcular horas transcurridas desde fechaLlegada
        const fecha = new Date(doc.fechaLlegada);
        const ahora = new Date();
        const horasDiff = (ahora - fecha) / (1000 * 60 * 60);

        // 1. Si es urgente
        if (doc.urgente) {
          messages.push(`Documento ${doc.nt} es Urgente.`);
          shouldAlert = true;
        }

        // 2. Si pasan 24h sin atender
        if (horasDiff > horas24) {
          messages.push(`Documento ${doc.nt} lleva más de 24h sin atención.`);
          shouldAlert = true;
        }

        // 3. Si excede el límite legal
        if (horasDiff > horasLegal) {
          messages.push(`Documento ${doc.nt} excede el límite legal (${horasLegal}h).`);
          shouldAlert = true;
        }
      });

      if (shouldAlert && messages.length > 0) {
        // Unimos mensajes en una sola notificación
        setAlertMessage(messages.join(' | '));
        setAlertOpen(true);

        // Reproducir sonido
        const audio = document.getElementById('alert-audio');
        if (audio) {
          audio.play().catch((err) => console.error('Error al reproducir audio:', err));
        }

        // Marcamos estos docs como alertados para no repetir
        const newAlertedDocs = noAtendidos
          .filter((doc) => !alertedDocs.includes(doc._id))
          .map((doc) => doc._id);

        setAlertedDocs((prev) => [...prev, ...newAlertedDocs]);
      } else {
        // Si no hay alertas nuevas, cerramos el Snackbar
        setAlertOpen(false);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  }

  // Crear documento (POST)
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

      // Limpia el formulario
      setNt('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setResponsable('Karina');
      setAtendido(false);

      // Recarga
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  // Actualizar (PUT). Si "atendido" => lo quitamos de la lista
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

  return (
    <>
      {/* Audio para alertas */}
      <audio id="alert-audio" src="/alert.mp3" preload="auto" />

      {/* Snackbar para mostrar alertas */}
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
        {/* Formulario */}
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
