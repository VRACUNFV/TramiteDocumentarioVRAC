import { useState, useEffect } from 'react';
import { Container, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { jsPDF } from 'jspdf';

export default function Reportes() {
  const [documentos, setDocumentos] = useState([]);
  const [bitacora, setBitacora] = useState([]);

  useEffect(() => {
    fetchDocumentos();
    fetchBitacora();
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

  async function fetchBitacora() {
    try {
      const res = await fetch('/api/bitacora');
      const data = await res.json();
      setBitacora(data);
    } catch (error) {
      console.error('Error al obtener bitácora:', error);
    }
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Documentos", 10, 20);
    doc.setFontSize(12);
    let y = 30;
    documentos.forEach((d, index) => {
      const text = `Documento ${index + 1}: NT: ${d.nt}, Fecha: ${d.fechaLlegada}, Urgente: ${d.urgente ? 'Sí' : 'No'}, Atrasado: ${d.atrasado ? 'Sí' : 'No'}, Responsable: ${d.responsable}, Atendido: ${d.atendido ? 'Sí' : 'No'}`;
      doc.text(text, 10, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("reporte_documentos.pdf");
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reportes Avanzados
      </Typography>
      <Button variant="contained" color="primary" onClick={exportPDF} sx={{ mb: 2 }}>
        Exportar Reporte PDF
      </Button>

      <Typography variant="h5" gutterBottom>
        Estadísticas Generales
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography>Total Documentos: {documentos.length}</Typography>
        <Typography>Atendidos: {documentos.filter(d => d.atendido).length}</Typography>
        <Typography>Pendientes: {documentos.filter(d => !d.atendido).length}</Typography>
        <Typography>Urgentes: {documentos.filter(d => d.urgente && !d.atendido).length}</Typography>
        <Typography>Atrasados: {documentos.filter(d => d.atrasado && !d.atendido).length}</Typography>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Bitácora de Cambios
      </Typography>
      <Paper sx={{ p: 2 }}>
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
            {bitacora.map((log) => (
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
