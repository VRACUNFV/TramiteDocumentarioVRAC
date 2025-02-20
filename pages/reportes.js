import { useState, useEffect } from 'react';
import { Container, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

function exportPDF(documentos) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Reporte de Documentos", 14, 20);

  // Define las columnas de la tabla
  const tableColumn = ["NT", "Fecha de Llegada", "Urgente", "Atrasado", "Responsable", "Atendido"];
  // Prepara las filas a partir de los documentos
  const tableRows = documentos.map((d) => [
    d.nt,
    d.fechaLlegada,
    d.urgente ? "Sí" : "No",
    d.atrasado ? "Sí" : "No",
    d.responsable,
    d.atendido ? "Sí" : "No"
  ]);

  // Agrega la tabla al PDF
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [128, 0, 0] }
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
