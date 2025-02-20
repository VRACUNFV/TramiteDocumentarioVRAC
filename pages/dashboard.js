import { useState, useEffect } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
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

  // Calcular estadísticas
  const total = documentos.length;
  const atendidos = documentos.filter(doc => doc.atendido).length;
  const pendientes = total - atendidos;
  const urgentes = documentos.filter(doc => doc.urgente && !doc.atendido).length;
  const atrasados = documentos.filter(doc => doc.atrasado && !doc.atendido).length;

  const chartData = [
    { name: 'Total', value: total },
    { name: 'Atendidos', value: atendidos },
    { name: 'Pendientes', value: pendientes },
    { name: 'Urgentes', value: urgentes },
    { name: 'Atrasados', value: atrasados }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Documentos
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Estadísticas Generales</Typography>
        <Typography>Total Documentos: {total}</Typography>
        <Typography>Atendidos: {atendidos}</Typography>
        <Typography>Pendientes: {pendientes}</Typography>
        <Typography>Urgentes: {urgentes}</Typography>
        <Typography>Atrasados: {atrasados}</Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#800000" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Container>
  );
}
