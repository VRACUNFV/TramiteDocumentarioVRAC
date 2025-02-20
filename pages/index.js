import { useState, useEffect } from 'react';

export default function Home() {
  const [documentos, setDocumentos] = useState([]);
  const [nt, setNt] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  // Eliminamos "estado"
  const [urgente, setUrgente] = useState(false);
  const [atrasado, setAtrasado] = useState(false);
  const [responsable, setResponsable] = useState('Karina');
  const [atendido, setAtendido] = useState(false);

  // Lista de responsables para el desplegable
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

  // Cargar documentos al iniciar la página
  useEffect(() => {
    fetchDocumentos();
  }, []);

  // Función para obtener la lista de documentos (GET)
  async function fetchDocumentos() {
    try {
      const res = await fetch('/api/documentos');
      const data = await res.json();
      setDocumentos(data);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  }

  // Crear un nuevo documento (POST)
  async function crearDocumento(e) {
    e.preventDefault();
    const nuevoDoc = {
      nt,
      fechaLlegada,
      urgente,
      atrasado,
      responsable,
      atendido
    };

    try {
      const res = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDoc)
      });
      await res.json();

      // Limpiar el formulario
      setNt('');
      setFechaLlegada('');
      setUrgente(false);
      setAtrasado(false);
      setResponsable('Karina');
      setAtendido(false);

      // Volver a cargar la lista
      fetchDocumentos();
    } catch (error) {
      console.error('Error al crear documento:', error);
    }
  }

  // Actualizar responsable o “Atendido” (PUT)
  async function actualizarDocumento(id, nuevoResponsable, nuevoAtendido) {
    try {
      await fetch(`/api/documentos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable: nuevoResponsable, atendido: nuevoAtendido })
      });
      fetchDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Encabezado con el logo del VRAC */}
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {/* Asegúrate de colocar el archivo en /public/vrac-logo.png */}
        <img
          src="/vrac-logo.png"
          alt="VRAC Logo"
          style={{ height: '60px', marginRight: '10px' }}
        />
        <h1 style={{ margin: 0 }}>Sistema de Alertas VRAC</h1>
      </header>

      {/* Formulario para crear un nuevo documento */}
      <form
        onSubmit={crearDocumento}
        style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}
      >
        <h2>Registrar Documento</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '5px' }}>NT:</label>
          <input
            type="text"
            value={nt}
            onChange={(e) => setNt(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '5px' }}>Fecha de Llegada:</label>
          <input
            type="date"
            value={fechaLlegada}
            onChange={(e) => setFechaLlegada(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>¿Urgente?</label>
          <input
            type="checkbox"
            checked={urgente}
            onChange={(e) => setUrgente(e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>¿Atrasado?</label>
          <input
            type="checkbox"
            checked={atrasado}
            onChange={(e) => setAtrasado(e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Responsable:</label>
          <select
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            {responsables.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>¿Atendido?</label>
          <input
            type="checkbox"
            checked={atendido}
            onChange={(e) => setAtendido(e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
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
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Urgente</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Atrasado</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Responsable</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Atendido</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc._id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.nt}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.fechaLlegada}</td>
              <td
                style={{
                  border: '1px solid #ccc',
                  padding: '8px',
                  backgroundColor: doc.urgente ? '#ffcccc' : 'transparent'
                }}
              >
                {doc.urgente ? 'Sí' : 'No'}
              </td>
              <td
                style={{
                  border: '1px solid #ccc',
                  padding: '8px',
                  backgroundColor: doc.atrasado ? '#ffe0b3' : 'transparent'
                }}
              >
                {doc.atrasado ? 'Sí' : 'No'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <select
                  value={doc.responsable}
                  onChange={(e) =>
                    actualizarDocumento(doc._id, e.target.value, doc.atendido)
                  }
                >
                  {responsables.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <input
                  type="checkbox"
                  checked={doc.atendido}
                  onChange={(e) =>
                    actualizarDocumento(doc._id, doc.responsable, e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
