// Esto simula nuestra “base de datos” en memoria
let documentos = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Devolver todos los documentos
    return res.status(200).json(documentos);
  }

  if (req.method === 'POST') {
    // Crear un nuevo documento
    const { nt, fechaLlegada, estado, urgente, atrasado, responsable, atendido } = req.body;
    const nuevoDoc = {
      id: Date.now(),
      nt,
      fechaLlegada,
      estado,
      urgente,
      atrasado,
      responsable,
      atendido
    };
    documentos.push(nuevoDoc);
    return res.status(201).json(nuevoDoc);
  }

  if (req.method === 'PUT') {
    // Actualizar documento (reasignar responsable o marcar atendido)
    const { id } = req.query;
    const { responsable, atendido } = req.body;

    const docIndex = documentos.findIndex(doc => doc.id == id);
    if (docIndex === -1) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    if (responsable) {
      documentos[docIndex].responsable = responsable;
    }
    if (typeof atendido === 'boolean') {
      documentos[docIndex].atendido = atendido;
    }

    return res.status(200).json(documentos[docIndex]);
  }

  // Método no permitido
  return res.status(405).json({ message: 'Método no permitido' });
}
