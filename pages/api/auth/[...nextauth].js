import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

export default NextAuth({
  debug: true, // Para logs de depuración
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("Authorize called with username:", credentials?.username);
        console.log("Authorize called with password:", credentials?.password);

        let client;
        try {
          client = await MongoClient.connect(process.env.MONGODB_URI);
          console.log("MongoDB connected");
        } catch (err) {
          console.error("Error connecting to MongoDB:", err);
          throw new Error("Error al conectar con la base de datos");
        }

        const db = client.db();
        const usersCollection = db.collection("users");

        const userDoc = await usersCollection.findOne({ username: credentials.username });
        console.log("userDoc found:", userDoc);

        if (!userDoc) {
          client.close();
          throw new Error("No existe el usuario");
        }

        const isValid = await bcrypt.compare(credentials.password, userDoc.passwordHash);
        console.log("isValid?", isValid);

        client.close();
        if (!isValid) {
          throw new Error("Contraseña inválida");
        }

        return {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role || "usuario",
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
});
