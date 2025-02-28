// pages/settings.js
import { useState } from "react";
import { Container, Typography, FormControlLabel, Checkbox, Button, TextField, Box } from "@mui/material";
import { useRouter } from "next/router";

export default function Settings() {
  const [showColumns, setShowColumns] = useState({
    nt: true,
    anio: true,
    fechaLlegada: true,
    urgente: true,
    atrasado: true,
    usuario: true,
    atendido: true,
  });
  const [alertInterval, setAlertInterval] = useState(3600000); // 1 hora
  const router = useRouter();

  function handleSave() {
    const settings = { showColumns, alertInterval };
    localStorage.setItem("settings", JSON.stringify(settings));
    router.push("/");
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Ajustes de Interfaz</Typography>
      <Box>
        <Typography variant="h6">Columnas a Mostrar</Typography>
        {Object.keys(showColumns).map((col) => (
          <FormControlLabel
            key={col}
            control={
              <Checkbox
                checked={showColumns[col]}
                onChange={(e) =>
                  setShowColumns((prev) => ({ ...prev, [col]: e.target.checked }))
                }
              />
            }
            label={col}
          />
        ))}
      </Box>
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Intervalo de Alertas (ms)"
          type="number"
          fullWidth
          value={alertInterval}
          onChange={(e) => setAlertInterval(Number(e.target.value))}
        />
      </Box>
      <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
        Guardar Ajustes
      </Button>
    </Container>
  );
}
