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
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Pusher from 'pusher-js';

export default function Home() {
  // Estado para todos los documentos
  const [allDocs, setAllDocs] = useState([]);
  // Formulario
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);

  // Vista: "pendientes" o "historico"
  const [viewType, setViewType] = useState('pendientes');
  // Buscador
  const [searchQuery, setSearchQuery] = useState('');

  // Alertas
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertedDocs, setAlertedDocs] = useState([]);

  // Parámetros de horas para alertas
  const horas24 = 24;
  const horasLegal = 72;

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

  // 1. Cargar documentos al montar y cada 10s
  useEffect(() => {
    fetchDocumentos();
    const interval = setInterval(() => {
      fetchDocumentos();
    }, 10000);
    return () => clearInterval(interval);
  }, [viewType]);

  // 2. Suscripción a Pusher en tiempo real
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe('documents-channel');

    channel.bind('new-document', (data) => {
      // Si el doc no está atendido y la vista es pendientes, agregamos
      // pero en realidad podemos siempre agregar a allDocs, y el front filtra
      setAllDocs((prev) => [...prev, data.document]);
    });

    channel.bind('update-document', (data) => {
      // Actualizar en allDocs
      setAllDocs((prev) =>
        prev.map((doc) => (doc._id === data.document._id ? data.document : doc))
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [viewType]);

  // 3. Obtener documentos desde la API
  async function fetchDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();
      setAllDocs(data);

      // Solo alertamos en la vista "pendientes"
      if (viewType === 'pendientes') {
        const pendientes = data.filter(doc => !doc.atendido);
        let shouldAlert = false;
        const messages = [];
        pendientes.forEach(doc => {
          if (alertedDocs.includes(doc._id)) return;
          const fecha = new Date(doc.fechaLlegada);
          const ahora = new Date();
          const diffHours = (ahora - fecha) / (1000 * 60 * 60);
          if (doc.urgente) {
            messages.push(`El documento ${doc.nt} es urgente.`);
            shouldAlert = true;
          }
          if (diffHours > horas24) {
            messages.push(`El documento ${doc.nt} lleva más de 24h sin atender.`);
            shouldAlert = true;
          }
          if (diffHours > horasLegal) {
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
          const nuevosAlertados = pendientes
            .filter(doc => !alertedDocs.includes(doc._id))
            .map(doc => doc._id);
          setAlertedDocs(prev => [...prev, ...nuevosAlertados]);
        } else {
          setAlertOpen(false);
        }
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  }

  // 4. Crear documento (POST)
  async function crearDocumento(e) {
    e.preventDefault();
    const nuevoDoc = { nt, fechaLlegada, urgente, atrasado, responsable, atendido };
    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDoc),
      });
      await res.json();
      // Limpiar formulario
      setNt('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setResponsable('Karina');
      setAtendido(false);
      // Se actualiza la lista (aunque con Pusher, se reflejará igual, pero es útil)
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  // 5. Actualizar documento (PUT)
  async function actualizarDocumento(id, nuevoResponsable, nuevoAtendido) {
    try {
      await fetch(`/api/documentos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable: nuevoResponsable, atendido: nuevoAtendido }),
      });
      // Se recarga la lista. Pusher también disparará un evento "update-document"
      fetchDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  // 6. Filtrar documentos según la vista y la búsqueda
  const filteredDocs = allDocs.filter(doc => {
    const matchesView = viewType === 'pendientes' ? !doc.atendido : doc.atendido;
    const matchesSearch = doc.nt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesView && matchesSearch;
  });

  return (
    <>
      {/* Audio para alertas */}
      <audio id="alert-audio" src="/alert.mp3" preload="auto" />

      {/* Snackbar de alertas */}
      <Snackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
        autoHideDuration={6000}
      />

      {/* AppBar con logo */}
      <AppBar position="static">
        <Toolbar>
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
        {/* Vista: Pendientes o Histórico */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Documentos</Typography>
          <ToggleButtonGroup
            color="primary"
            value={viewType}
            exclusive
            onChange={(e, newView) => {
              if (newView) setViewType(newView);
            }}
          >
            <ToggleButton value="pendientes">Pendientes</ToggleButton>
            <ToggleButton value="historico">Histórico</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Buscador por NT */}
        <TextField
          placeholder="Buscar por NT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabla de documentos */}
        <Paper sx={{ mb: 4, p: 2 }}>
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
              {filteredDocs.map(doc => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.nt}</TableCell>
                  <TableCell>{doc.fechaLlegada}</TableCell>
                  <TableCell sx={{ backgroundColor: doc.urgente ? '#ffcccc' : 'transparent' }}>
                    {doc.urgente ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: doc.atrasado ? '#ffe0b3' : 'transparent' }}>
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
                      {responsables.map(r => (
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

        {/* Formulario para crear un nuevo documento */}
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
              {responsables.map(r => (
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
      </Container>
    </>
  );
}
