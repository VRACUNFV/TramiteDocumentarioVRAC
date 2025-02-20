
import { useEffect, useState } from 'react';

export default function Home() {
  const [documentos, setDocumentos] = useState([]);
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [estado, setEstado] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);

  // 1. Cargar documentos al iniciar la página
  useEffect(() => {
    obtenerDocumentos();
  }, []);

  async function obtenerDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();
      setDocumentos(data);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  }

  // 2. Crear un nuevo documento (POST)
  async function crearDocumento(e) {
    e.preventDefault(); // Evita que la página se recargue
    const nuevoDoc = {
      nt,
      fechaLlegada,
      estado,
      urgente,
      atrasado,
      responsable,
      atendido
    };

    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoDoc)
      });
      const data = await res.json();
      console.log('Documento creado:', data);

      // Limpia el formulario
      setNt('');
      setFechaLlegada('');
      setEstado('');
      setUrgente(false);
      setAtrasado(false);
      setResponsable('Karina');
      setAtendido(false);

      // Vuelve a cargar la lista de documentos
      obtenerDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  // 3. Actualizar un documento (ej. cambiar responsable o marcar atendido)
  async function actualizarDocumento(id, nuevoResponsable, nuevoAtendido) {
    try {
      await fetch(`/api/documentos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable: nuevoResponsable, atendido: nuevoAtendido })
      });
      // Recarga la lista
      obtenerDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  // Lista de responsables para el dropdown
  const responsables = ['Karina', 'Jessica', 'Walter', 'Luis', 'Fabiola', 'Romina', 'David', 'Christian'];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema de Alertas VRAC</h1>
      <p>¡Bienvenido! Aquí puedes gestionar tus documentos.</p>

      {/* Formulario para crear un nuevo documento */}
      <form onSubmit={crearDocumento} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h2>Registrar Documento</h2>
        <div>
          <label>NT: </label>
          <input type="text" value={nt} onChange={(e) => setNt(e.target.value)} required />
        </div>
        <div>
          <label>Fecha de Llegada: </label>
          <input type="date" value={fechaLlegada} onChange={(e) => setFechaLlegada(e.target.value)} required />
        </div>
        <div>
          <label>Estado: </label>
          <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} />
        </div>
        <div>
          <label>¿Urgente? </label>
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
        </div>
        <div>
          <label>¿Atrasado? </label>
          <input type="checkbox" checked={atrasado} onChange={(e) => setAtrasado(e.target.checked)} />
        </div>
        <div>
          <label>Responsable: </label>
          <select value={responsable} onChange={(e) => setResponsable(e.target.value)}>
            {responsables.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label>¿Atendido? </label>
          <input type="checkbox" checked={atendido} onChange={(e) => setAtendido(e.target.checked)} />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Crear</button>
      </form>

      {/* Tabla de documentos */}
      <h2>Lista de Documentos</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>NT</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Fecha Llegada</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Urgente</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Atrasado</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Responsable</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Atendido</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.nt}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.fechaLlegada}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.estado}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: doc.urgente ? '#ffcccc' : '' }}>
                {doc.urgente ? 'Sí' : 'No'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: doc.atrasado ? '#ffe0b3' : '' }}>
                {doc.atrasado ? 'Sí' : 'No'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <select
                  value={doc.responsable}
                  onChange={(e) => actualizarDocumento(doc.id, e.target.value, doc.atendido)}
                >
                  {responsables.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <input
                  type="checkbox"
                  checked={doc.atendido}
                  onChange={(e) => actualizarDocumento(doc.id, doc.responsable, e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
