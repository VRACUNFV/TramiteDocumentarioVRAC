// pages/dashboard.js
import { useState, useEffect } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    atendidos: 0,
    pendientes: 0,
    urgentes: 0,
    atrasados: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtiene todos los documentos (sin filtrar en la API)
      const res = await fetch('/api/documentos');
      const docs = await res.json();
      const total = docs.length;
      const atendidos = docs.filter((doc) => doc.atendido).length;
      const pendientes = total - atendidos;
      // Calcula urgentes y atrasados, considerando solo los pendientes
      const urgentes = docs.filter((doc) => doc.urgente && !doc.atendido).length;
      const atrasados = docs.filter((doc) => doc.atrasado && !doc.atendido).length;
      setStats({ total, atendidos, pendientes, urgentes, atrasados });
    } catch (error) {
      console.error('Error al obtener datos para el dashboard:', error);
    }
  }

  // Prepara los datos para el gráfico
  const chartData = [
    { name: 'Total', value: stats.total },
    { name: 'Atendidos', value: stats.atendidos },
    { name: 'Pendientes', value: stats.pendientes },
    { name: 'Urgentes', value: stats.urgentes },
    { name: 'Atrasados', value: stats.atrasados },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Documentos
      </Typography>
      <Paper sx={{ padding: 2 }}>
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
