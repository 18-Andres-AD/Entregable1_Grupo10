import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { leerArchivo, guardarArchivo, generarId, borrarImagen, rutaMascotas } from '../utils/fileManager.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer mascotas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer mascotas' });
  }
});

router.post('/', upload.array('img', 5), async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear mascota' });
  }
});

router.put('/:id', upload.array('img', 5), async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mascota' });
  }
});

export default router;
