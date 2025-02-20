import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Asegúrate de que esta variable de entorno esté correctamente configurada
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    // Se elimina useNewUrlParser y useUnifiedTopology, ya que son obsoletos en el driver versión 4
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  const db = cachedClient.db(); // Usa la base de datos por defecto o la que especifiques en tu URI
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
      // result.ops[0] es la forma de obtener el documento insertado en algunas versiones,
      // si no funciona, se retorna result directamente
      return res.status(201).json(result.ops ? result.ops[0] : result);
    } catch (error) {
      return res.status(400).json({ message: 'Error al crear documento', error });
    }
  }

  if (req.method === 'PUT') {
    const { id } = req.query; // Se espera que el id sea pasado como query param
    try {
      // Convertir el id a ObjectId
      const { ObjectId } = require('mongodb');
      const _id = new ObjectId(id);

      const { responsable, atendido } = req.body;

      const updated = await collection.findOneAndUpdate(
        { _id },
        { $set: { responsable, atendido } },
        { returnDocument: 'after' } // Retorna el documento después de la actualización
      );

      if (!updated.value) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      return res.status(200).json(updated.value);
    } catch (error) {
      return res.status(400).json({ message: 'Error al actualizar documento', error });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
