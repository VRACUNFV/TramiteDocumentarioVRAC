import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  // Obtener la sesión actual (asegúrate de haber configurado NextAuth)
  const { data: session, status } = useSession();
  if (status === 'loading') return <div>Cargando...</div>;

  // Suponemos que el campo "usuario" en la sesión es el que usamos para asignar documentos
  const currentUser = session?.user?.name || '';

  // Estados para almacenar documentos y para el formulario
  const [allDocs, setAllDocs] = useState([]);
  const [nt, setNt] = useState('');
  const [anio, setAnio] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [usuario, setUsuario] = useState(currentUser); // Se inicializa con el usuario autenticado
  const [atendido, setAtendido] = useState(false);

  // Vista: "pendientes" (no atendidos) o "historico" (atendidos)
  const [viewType, setViewType] = useState('pendientes');
  // Buscador (filtrar por NT)
  const [searchQuery, setSearchQuery] = useState('');
  // Estado para alertas en UI
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  // Objeto para llevar registro de la última alerta por documento (clave: doc._id, valor: timestamp)
  const [alertedDocsMap, setAlertedDocsMap] = useState({});

  // Lista de usuarios (para asignación). Aquí se puede incluir a todos los usuarios autorizados.
  const usuarios = [
    'Karina',
    'Jessica',
    'Walter',
    'Luis',
    'Fabiola',
    'Romina',
    'David',
    'Christian'
  ];

  // Parámetro para alertas: se enviará una alerta cada 1 hora (3600000 ms)
  const alertaIntervalMs = 3600000; // 1 hora en ms

  // Cargar documentos al montar la página y cada 10 segundos
  useEffect(() => {
    fetchDocumentos();
    const interval = setInterval(() => {
      fetchDocumentos();
    }, 10000);
    return () => clearInterval(interval);
  }, [viewType]);

  // Efecto para suscribirse a Pusher y recibir actualizaciones en tiempo real
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe('documents-channel');

    channel.bind('new-document', (data) => {
      // Solo agregamos si el documento asignado es para el usuario actual
      if (data.document.usuario === currentUser) {
        setAllDocs(prev => [...prev, data.document]);
      }
    });

    channel.bind('update-document', (data) => {
      setAllDocs(prev =>
        prev.map(doc => (doc._id === data.document._id ? data.document : doc))
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [currentUser]);

  // Función para obtener documentos desde la API
  async function fetchDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();
      setAllDocs(data);

      // Solo para la vista "pendientes", se evaluarán las condiciones de alerta
      if (viewType === 'pendientes') {
        const pendientes = data.filter(doc => !doc.atendido && doc.usuario === currentUser);
        const now = new Date().getTime();
        let shouldAlert = false;
        const messages = [];
        // Copia del objeto de alertas
        const nuevosAlertas = { ...alertedDocsMap };

        pendientes.forEach(doc => {
          // Si ya se alertó este documento y no ha pasado una hora, se salta
          if (nuevosAlertas[doc._id] && (now - nuevosAlertas[doc._id]) < alertaIntervalMs) return;
          messages.push(`Alerta: Documento ${doc.nt}/${doc.anio} asignado a ${doc.usuario} no atendido.`);
          nuevosAlertas[doc._id] = now; // Actualiza el timestamp para este documento
          shouldAlert = true;
        });

        if (shouldAlert && messages.length > 0) {
          setAlertMessage(messages.join(' | '));
          setAlertOpen(true);
          // Reproducir sonido de alerta
          const audio = document.getElementById('alert-audio');
          if (audio) {
            audio.play().catch(err => console.error('Error al reproducir audio:', err));
          }
          setAlertedDocsMap(nuevosAlertas);
        } else {
          setAlertOpen(false);
        }
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  }

  // Función para crear un documento (POST)
  async function crearDocumento(e) {
    e.preventDefault();
    const nuevoDoc = { nt, anio, fechaLlegada, urgente, atrasado, usuario, atendido };
    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDoc)
      });
      await res.json();
      // Reproduce el sonido de alerta inmediatamente al crear
      const audio = document.getElementById('alert-audio');
      if (audio) {
        audio.play().catch(err => console.error('Error al reproducir audio:', err));
      }
      // Limpia el formulario
      setNt('');
      setAnio('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setUsuario(currentUser); // Se reinicia al usuario actual
      setAtendido(false);
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  // Función para actualizar un documento (PUT)
  async function actualizarDocumento(id, nuevoUsuario, nuevoAtendido) {
    try {
      await fetch(`/api/documentos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: nuevoUsuario, atendido: nuevoAtendido })
      });
      fetchDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  // Filtrar documentos según la vista (pendientes o histórico) y el buscador
  const filteredDocs = allDocs.filter(doc => {
    const matchesView = viewType === 'pendientes' ? !doc.atendido : doc.atendido;
    const matchesSearch = doc.nt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesView && matchesSearch;
  });

  return (
    <>
      {/* Elemento de audio para alertas */}
      <audio id="alert-audio" src="/alert.mp3" preload="auto" />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
        autoHideDuration={6000}
      />

      {/* AppBar con el logo */}
      <AppBar position="static">
        <Toolbar>
          <Box component="img" src="/vrac-logo.png" alt="VRAC Logo" sx={{ height: 50, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Alertas VRAC
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Controles para cambiar la vista: Pendientes vs. Histórico */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Documentos</Typography>
          <ToggleButtonGroup
            color="primary"
            value={viewType}
            exclusive
            onChange={(e, newView) => { if (newView) setViewType(newView); }}
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
                <TableCell>Año</TableCell>
                <TableCell>Fecha Llegada</TableCell>
                <TableCell>Urgente</TableCell>
                <TableCell>Atrasado</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Atendido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocs.map(doc => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.nt}</TableCell>
                  <TableCell>{doc.anio}</TableCell>
                  <TableCell>{doc.fechaLlegada}</TableCell>
                  <TableCell sx={{ backgroundColor: doc.urgente ? '#ffcccc' : 'transparent' }}>
                    {doc.urgente ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: doc.atrasado ? '#ffe0b3' : 'transparent' }}>
                    {doc.atrasado ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={doc.usuario}
                      onChange={(e) =>
                        actualizarDocumento(doc._id, e.target.value, doc.atendido)
                      }
                      size="small"
                    >
                      {usuarios.map(u => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={doc.atendido}
                      onChange={(e) =>
                        actualizarDocumento(doc._id, doc.usuario, e.target.checked)
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
              label="Año"
              variant="outlined"
              required
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
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
            <Typography>Usuario</Typography>
            <Select
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            >
              {usuarios.map(u => (
                <MenuItem key={u} value={u}>
                  {u}
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
