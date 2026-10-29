import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error al subir el archivo: ${err.code}` });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});


app.listen(PORT, (error) => {
  if (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${PORT} ya está en uso. Cierra el otro programa o usa otro puerto (PORT=4000 npm run dev).`);
    } else {
      console.error('No se pudo iniciar el servidor:', error);
    }
    process.exit(1);
  }
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
