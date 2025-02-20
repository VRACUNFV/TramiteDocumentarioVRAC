import { MongoClient } from 'mongodb';
import pusher from '../../lib/pusher';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  const db = cachedClient.db();
  const collection = db.collection('documentos');

 if (req.method === 'GET') {
  try {
    const { limit = 50, skip = 0 } = req.query; // Valores por defecto
    const documentos = await collection.find({})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    return res.status(200).json(documentos);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener documentos', error });
  }
}

  if (req.method === 'POST') {
    try {
      const result = await collection.insertOne(req.body);
      const insertedId = result.insertedId;
      const newDoc = await collection.findOne({ _id: insertedId });
      // Dispara el evento "new-document" vía Pusher
      await pusher.trigger('documents-channel', 'new-document', { document: newDoc });
      return res.status(201).json(newDoc);
    } catch (error) {
      return res.status(400).json({ message: 'Error al crear documento', error });
    }
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    try {
      const { ObjectId } = require('mongodb');
      const _id = new ObjectId(id);
      const { responsable, atendido } = req.body;
      const updated = await collection.findOneAndUpdate(
        { _id },
        { $set: { responsable, atendido } },
        { returnDocument: 'after' }
      );
      if (!updated.value) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      // Inserta en la colección "bitacora" el registro de cambio
      const bitacoraCollection = db.collection('bitacora');
      await bitacoraCollection.insertOne({
        documentId: _id,
        action: 'update',
        changes: { responsable, atendido },
        timestamp: new Date()
      });
      // Dispara el evento "update-document" vía Pusher
      await pusher.trigger('documents-channel', 'update-document', { document: updated.value });
      return res.status(200).json(updated.value);
    } catch (error) {
      return res.status(400).json({ message: 'Error al actualizar documento', error });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
