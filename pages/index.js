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

export default function Home() {
  // Estado para almacenar TODOS los documentos obtenidos de la API
  const [allDocs, setAllDocs] = useState([]);
  // Estados para el formulario de creación
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);
  // Estado para elegir la vista: "pendientes" (no atendidos) o "historico" (atendidos)
  const [viewType, setViewType] = useState('pendientes');
  // Estado para el buscador (filtrar por NT)
  const [searchQuery, setSearchQuery] = useState('');
  // Estados para mostrar alertas (Snackbar) en la UI
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  // Para evitar re-alertar el mismo documento varias veces
  const [alertedDocs, setAlertedDocs] = useState([]);

  // Lista de responsables disponibles
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

  // Parámetros de tiempo para generar alertas (en horas)
  const horas24 = 24;
  const horasLegal = 72;

  // Al montar la página y cada 10 segundos se llama a fetchDocumentos
  useEffect(() => {
    fetchDocumentos();
    const interval = setInterval(() => {
      fetchDocumentos();
    }, 10000);
    return () => clearInterval(interval);
  }, [viewType]);

  // Función para obtener documentos de la API
  async function fetchDocumentos() {
    try {
      // fetch hace una solicitud GET a /api/documentos
      const res = await fetch('/api/documentos');
      const data = await res.json();
      setAllDocs(data);

      // Si estamos en la vista "pendientes", se evalúan las condiciones de alerta
      if (viewType === 'pendientes') {
        const pendientes = data.filter(doc => !doc.atendido);
        let shouldAlert = false;
        const messages = [];
        pendientes.forEach(doc => {
          // Si ya se alertó este documento, lo saltamos
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
          // Aquí se podría reproducir un sonido si se desea
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

  // Función para crear un nuevo documento (envía una solicitud POST)
  async function crearDocumento(e) {
    e.preventDefault();
    const nuevoDoc = { nt, fechaLlegada, urgente, atrasado, responsable, atendido };
    try {
      // fetch con método POST envía el nuevo documento a la API
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
      // Recarga la lista de documentos
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  // Función para actualizar un documento (envía una solicitud PUT)
  async function actualizarDocumento(id, nuevoResponsable, nuevoAtendido) {
    try {
      await fetch(`/api/documentos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable: nuevoResponsable, atendido: nuevoAtendido })
      });
      // Recarga la lista de documentos
      fetchDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  // Filtrar documentos según la vista y el buscador
  const filteredDocs = allDocs.filter(doc => {
    const matchesView = viewType === 'pendientes' ? !doc.atendido : doc.atendido;
    const matchesSearch = doc.nt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesView && matchesSearch;
  });

  return (
    <>
      {/* Snackbar para alertas */}
      <Snackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
        autoHideDuration={6000}
      />

      {/* AppBar con el logo */}
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
        {/* Controles para cambiar la vista: Pendientes vs Histórico */}
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

        {/* Formulario para crear documentos */}
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
