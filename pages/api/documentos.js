// pages/api/documentos.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await cachedClient.connect();
  }
  const db = cachedClient.db(); // Usa la base de datos por defecto o la que indiques en la URI
  const collection = db.collection('documentos');

  if (req.method === 'GET') {
    try {
      const documentos = await collection.find({}).toArray();
      return res.status(200).json(documentos);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener documentos', error });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = await collection.insertOne(req.body);
      return res.status(201).json(result.ops[0]);
    } catch (error) {
      return res.status(400).json({ message: 'Error al crear documento', error });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
