import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    // Llamamos a NextAuth con el provider 'credentials'
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false, // Manejo manual de la redirección
    });

    if (res?.error) {
      setErrorMsg('Credenciales inválidas');
    } else {
      // Si no hay error, vamos a la página principal
      router.push('/');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Iniciar Sesión
        </Typography>

        {errorMsg && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Typography>
        )}

        <TextField
          label="Usuario"
          fullWidth
          sx={{ mb: 2 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button variant="contained" type="submit">
          Entrar
        </Button>
      </Box>
    </Container>
  );
}
