import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
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
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }
  if (!session) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Acceso Restringido</Typography>
        <Typography variant="body1">Debes iniciar sesión para usar el sistema.</Typography>
        <Button variant="contained" color="primary" onClick={() => router.push('/login')}>
          Ir a Login
        </Button>
      </Container>
    );
  }

  const currentUser = session.user.name || session.user.email || 'Usuario';

  // Estados de documentos y formulario
  const [allDocs, setAllDocs] = useState([]);
  const [nt, setNt] = useState('');
  const [anio, setAnio] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [usuario, setUsuario] = useState(currentUser);
  const [atendido, setAtendido] = useState(false);

  // Estado para vista y búsqueda
  const [viewType, setViewType] = useState('pendientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertedDocsMap, setAlertedDocsMap] = useState({});

  // Estado para paginación
  const [page, setPage] = useState(1);
  const limit = 50;

  // Configuraciones personalizables (cargadas desde localStorage)
  const [settings, setSettings] = useState({
    showColumns: {
      nt: true,
      anio: true,
      fechaLlegada: true,
      urgente: true,
      atrasado: true,
      usuario: true,
      atendido: true,
    },
    alertInterval: 3600000
  });

  useEffect(() => {
    const stored = localStorage.getItem('settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  async function fetchDocumentos() {
    try {
      const res = await fetch(`/api/documentos?limit=${limit}&skip=${(page - 1) * limit}`);
      const data = await res.json();
      setAllDocs(data);

      if (viewType === 'pendientes') {
        const pendientes = data.filter(doc => !doc.atendido && doc.usuario === currentUser);
        const now = new Date().getTime();
        let shouldAlert = false;
        const messages = [];
        const nuevosAlertas = { ...alertedDocsMap };

        pendientes.forEach(doc => {
          if (nuevosAlertas[doc._id] && (now - nuevosAlertas[doc._id]) < settings.alertInterval) return;
          messages.push(`Alerta: Documento ${doc.nt}/${doc.anio} asignado a ${doc.usuario} no atendido.`);
          nuevosAlertas[doc._id] = now;
          shouldAlert = true;
        });

        if (shouldAlert && messages.length > 0) {
          setAlertMessage(messages.join(' | '));
          setAlertOpen(true);
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

  useEffect(() => {
    fetchDocumentos();
    const interval = setInterval(() => {
      fetchDocumentos();
    }, 10000);
    return () => clearInterval(interval);
  }, [viewType, page]);

  // Suscribirse a Pusher para actualizaciones en tiempo real
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe('documents-channel');

    channel.bind('new-document', (data) => {
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

      const audio = document.getElementById('alert-audio');
      if (audio) {
        audio.play().catch(err => console.error('Error al reproducir audio:', err));
      }

      setNt('');
      setAnio('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setUsuario(currentUser);
      setAtendido(false);
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

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

  const filteredDocs = allDocs.filter(doc => {
    const matchesView = viewType === 'pendientes' ? !doc.atendido : doc.atendido;
    const matchesSearch = doc.nt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesView && matchesSearch;
  });

  return (
    <>
      <audio id="alert-audio" src="/alert.mp3" preload="auto" />

      <Snackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
        autoHideDuration={6000}
      />

      <AppBar position="static">
        <Toolbar>
          <Box component="img" src="/vrac-logo.png" alt="VRAC Logo" sx={{ height: 50, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Alertas VRAC
          </Typography>
          <Button color="inherit" onClick={() => signOut()}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Bienvenido, {currentUser}
        </Typography>

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

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button variant="outlined" onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
            Anterior
          </Button>
          <Typography variant="body1">Página {page}</Typography>
          <Button variant="outlined" onClick={() => setPage((prev) => prev + 1)}>
            Siguiente
          </Button>
        </Box>
      </Container>
    </>
  );
}
