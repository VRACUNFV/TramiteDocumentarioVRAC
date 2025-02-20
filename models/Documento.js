// models/Documento.js
import mongoose from 'mongoose';

const DocumentoSchema = new mongoose.Schema({
  nt: { type: String, required: true },
  fechaLlegada: { type: String },
  estado: { type: String },
  urgente: { type: Boolean, default: false },
  atrasado: { type: Boolean, default: false },
  responsable: { type: String },
  atendido: { type: Boolean, default: false }
}, {
  timestamps: true // crea createdAt y updatedAt
});

export default mongoose.models.Documento || mongoose.model('Documento', DocumentoSchema);
