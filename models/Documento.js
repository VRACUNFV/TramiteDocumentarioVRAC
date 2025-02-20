import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Variable de entorno en Vercel
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {});
    await cachedClient.connect();
  }
  const db = cachedClient.db(); // Si no especificaste base, usará "test"
  const collection = db.collection('documentos');

  if (req.method === 'GET') {
    const documentos = await collection.find({}).toArray();
    return res.status(200).json(documentos);
  }

  if (req.method === 'POST') {
    const result = await collection.insertOne(req.body);
    return res.status(201).json(result.ops[0]);
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
