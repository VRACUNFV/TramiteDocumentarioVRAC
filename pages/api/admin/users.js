import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  const db = cachedClient.db();
  const usersCollection = db.collection("users");

  if (req.method === "GET") {
    try {
      const users = await usersCollection.find({}).toArray();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener usuarios", error });
    }
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const { role } = req.body;
    try {
      const { ObjectId } = require("mongodb");
      const _id = new ObjectId(id);
      const result = await usersCollection.updateOne(
        { _id },
        { $set: { role } }
      );
      return res.status(200).json({ message: "Rol actualizado", result });
    } catch (error) {
      return res.status(500).json({ message: "Error al actualizar rol", error });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
