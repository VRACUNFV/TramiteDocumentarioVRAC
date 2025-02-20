import { useState, useEffect } from 'react';
import { Container, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Reportes() {
  const [documentos, setDocumentos] = useState([]);

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

  // Función que genera el PDF usando jsPDF y jsPDF-AutoTable
  function exportPDF(data) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Documentos", 14, 20);

    // Define las columnas de la tabla
    const tableColumn = ["NT", "Fecha de Llegada", "Urgente", "Atrasado", "Responsable", "Atendido"];
    // Prepara las filas a partir de los documentos
    const tableRows = data.map((d) => [
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

  // Esta función se llama cuando el usuario hace clic en el botón "Exportar Reporte PDF"
  function handleExportPDF() {
    exportPDF(documentos);
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reportes Avanzados
      </Typography>
      <Button variant="contained" color="primary" onClick={handleExportPDF} sx={{ mb: 2 }}>
        Exportar Reporte PDF
      </Button>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lista de Documentos
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NT</TableCell>
              <TableCell>Fecha de Llegada</TableCell>
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
                <TableCell>{doc.urgente ? 'Sí' : 'No'}</TableCell>
                <TableCell>{doc.atrasado ? 'Sí' : 'No'}</TableCell>
                <TableCell>{doc.responsable}</TableCell>
                <TableCell>{doc.atendido ? 'Sí' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
