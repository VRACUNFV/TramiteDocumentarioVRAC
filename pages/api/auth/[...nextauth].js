// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export default NextAuth({
  // Configuración de proveedores de autenticación
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Puedes agregar más proveedores (Google, etc.) según lo requieras
  ],
  callbacks: {
    async session({ session, token }) {
      // Puedes agregar campos adicionales a la sesión, por ejemplo, un rol
      session.user.role = token.role || "usuario";
      return session;
    },
    async jwt({ token, account, user }) {
      // Al iniciar sesión, asigna un rol basado en el email (por ejemplo)
      if (account && user) {
        token.role = user.email && user.email.endsWith("@unfv.edu.pe") ? "administrador" : "usuario";
      }
      return token;
    },
  },
});
