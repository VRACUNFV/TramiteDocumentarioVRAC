import { useState, useEffect } from 'react';

// MUI Components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

export default function Home() {
  const [documentos, setDocumentos] = useState([]);
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);

  // Lista de responsables
  const responsables = [
    'Karina',
    'Jessica',
    'Walter',
    'Luis',
    'Fabiola',
    'Romina',
    'David',
    'Christian',
  ];

  // Al montar el componente, cargamos la lista de documentos
  useEffect(() => {
    fetchDocumentos();
  }, []);

  async function fetchDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();
      setDocumentos(data);
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
      atendido,
    };

    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDoc),
      });
      await res.json();

      // Limpia el formulario
      setNt('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setResponsable('Karina');
      setAtendido(false);

      // Vuelve a cargar la lista
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
        body: JSON.stringify({
          responsable: nuevoResponsable,
          atendido: nuevoAtendido,
        }),
      });
      fetchDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  return (
    <>
      {/* Encabezado con AppBar y logo */}
      <AppBar position="static">
        <Toolbar>
          {/* Logo VRAC */}
          <img
            src="/vrac-logo.png"
            alt="VRAC Logo"
            style={{ height: '50px', marginRight: '10px' }}
          />
          <Typography variant="h6" component="div">
            Sistema de Alertas VRAC
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
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
            <Button variant="contained" type="submit">
              Crear
            </Button>
          </Stack>
        </Box>

        <Typography variant="h5" gutterBottom>
          Lista de Documentos
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
                      backgroundColor: doc.urgente ? '#ffcccc' : 'transparent',
                    }}
                  >
                    {doc.urgente ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: doc.atrasado ? '#ffe0b3' : 'transparent',
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
