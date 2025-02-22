// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Definición de usuarios estáticos
const USERS = [
  { username: 'kh', password: '1234', name: 'Karina', email: 'kh@example.com', role: 'usuario' },
  { username: 'jv', password: '1234', name: 'Jessica', email: 'jv@example.com', role: 'usuario' },
  { username: 'wc', password: '1234', name: 'Walter', email: 'wc@example.com', role: 'usuario' },
  { username: 'ls', password: '1234', name: 'Luis', email: 'ls@example.com', role: 'usuario' },
  { username: 'dm', password: '1234', name: 'David', email: 'dm@example.com', role: 'usuario' },
  { username: 'fy', password: '1234', name: 'Fabiola', email: 'fy@example.com', role: 'usuario' },
  { username: 'rt', password: '1234', name: 'Romina', email: 'rt@example.com', role: 'usuario' },
  { username: 'ac', password: '1234', name: 'Angel', email: 'ac@example.com', role: 'usuario' },
  { username: 'cc', password: '1234', name: 'Christian', email: 'cc@example.com', role: 'usuario' },
];

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        // Busca el usuario en el arreglo USERS
        const user = USERS.find(
          (u) =>
            u.username === credentials?.username &&
            u.password === credentials?.password
        );
        if (user) {
          // Retorna un objeto con los datos del usuario
          return {
            id: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        // Si las credenciales no coinciden, lanza un error
        throw new Error('Credenciales inválidas');
      }
    })
  ],
  // En producción es obligatorio definir un secreto para NextAuth
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
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
    },
  }
});
