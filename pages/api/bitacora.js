import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  const db = cachedClient.db();
  const bitacoraCollection = db.collection('bitacora');

  if (req.method === 'GET') {
    try {
      const logs = await bitacoraCollection.find({}).toArray();
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener bitácora', error });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
