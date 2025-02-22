// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  // Desactiva el "pages" si quieres usar las rutas por defecto de NextAuth (o define tus propias páginas de login, error, etc.)
  pages: {
    signIn: '/login', // Redirige a /login cuando se requiera iniciar sesión
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        // Aquí defines tu lógica para verificar credenciales.
        // Ejemplo: un arreglo estático de usuarios o consultar en DB.
        
        const USERS = [
          { username: 'Karina', password: '1234', name: 'Karina', email: 'karina@unfv.edu.pe' },
          { username: 'Jessica', password: '5678', name: 'Jessica', email: 'jessica@unfv.edu.pe' },
          // Agrega más usuarios...
        ];

        // Busca el usuario con username y password
        const user = USERS.find(u => 
          u.username === credentials?.username && 
          u.password === credentials?.password
        );

        if (user) {
          // Retorna un objeto con datos del usuario
          return {
            id: user.username,
            name: user.name,
            email: user.email,
          };
        }
        // Si no coincide, lanza error
        throw new Error('Credenciales inválidas');
      }
    })
  ],
  // SECRET en producción
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session, token }) {
      // Asigna un "usuario" o "role" si quieres
      session.user.role = token.role || "usuario";
      // session.user.name ya viene de authorize()
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Al iniciar sesión, token se genera con datos del usuario
        token.role = "usuario"; // o "admin", etc.
      }
      return token;
    }
  }
});
