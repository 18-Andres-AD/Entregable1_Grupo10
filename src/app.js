import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);


app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error en la carga de archivos: ${err.code}` });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
