import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        // Conectar a la base de datos
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db();
        const usersCollection = db.collection("users");

        // Buscar el usuario por username
        const userDoc = await usersCollection.findOne({ username: credentials.username });
        if (!userDoc) {
          client.close();
          throw new Error("No existe el usuario");
        }

        // Comparar la contraseña ingresada con el hash almacenado
        const isValid = await bcrypt.compare(credentials.password, userDoc.passwordHash);
        client.close();

        if (!isValid) {
          throw new Error("Contraseña inválida");
        }

        // Retornar los datos del usuario para la sesión
        return {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role || "usuario"
        };
      }
    })
  ],
  // Es importante definir NEXTAUTH_SECRET en Vercel para producción
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role || "usuario";
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  }
});
