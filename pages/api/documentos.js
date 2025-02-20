// pages/api/documentos.js
import dbConnect from '../../lib/dbConnect';
import Documento from '../../models/Documento';

export default async function handler(req, res) {
  await dbConnect();  // <-- Se conecta a MongoDB usando tu variable MONGODB_URI

  if (req.method === 'GET') {
    try {
      const documentos = await Documento.find({});
      return res.status(200).json(documentos);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener documentos', error });
    }
  }

  if (req.method === 'POST') {
    try {
      const nuevoDoc = await Documento.create(req.body);
      return res.status(201).json(nuevoDoc);
    } catch (error) {
      return res.status(400).json({ message: 'Error al crear documento', error });
    }
  }

  if (req.method === 'PUT') {
    const { id } = req.query; // id de Mongo
    try {
      const doc = await Documento.findById(id);
      if (!doc) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      // Actualiza campos según lo que te llegue en el body
      if (req.body.responsable !== undefined) {
        doc.responsable = req.body.responsable;
      }
      if (typeof req.body.atendido === 'boolean') {
        doc.atendido = req.body.atendido;
      }
      await doc.save();
      return res.status(200).json(doc);
    } catch (error) {
      return res.status(400).json({ message: 'Error al actualizar documento', error });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}


  // Método no permitido
  return res.status(405).json({ message: 'Método no permitido' });
}
