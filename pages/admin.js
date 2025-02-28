// pages/admin.js
import { useState, useEffect } from "react";
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Select, MenuItem } from "@mui/material";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users"); // Endpoint que listar usuarios
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }

  async function updateUserRole(id, newRole) {
    try {
      await fetch(`/api/admin/users?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Error al actualizar rol:", error);
    }
  }

  if (session?.user.role !== "administrador") {
    return (
      <Container>
        <Typography variant="h4" color="error">
          Acceso denegado
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Portal de Administración
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                >
                  <MenuItem value="usuario">Usuario</MenuItem>
                  <MenuItem value="administrador">Administrador</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
