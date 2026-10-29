import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { encriptarPassword } from '../utils/crypto.js';
import { leerArchivo, guardarArchivo, generarId, borrarImagen, rutaUsuarios } from '../utils/fileManager.js';

const router = Router();


const quitarPassword = ({ password, ...usuario }) => usuario;

router.get('/', async (req, res) => {
  try {
    const usuarios = await leerArchivo(rutaUsuarios);
    res.status(200).json(usuarios.map(quitarPassword));
  } catch (error) {
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

router.post('/', upload.single('avatar'), async (req, res) => {
  const avatar = req.file ? `/img/users/${req.file.filename}` : null;

  try {
    const { firstname, lastname, username, password } = req.body;

    if (!firstname || !lastname || !username || !password) {
      await borrarImagen(avatar);
      return res.status(400).json({ error: 'firstname, lastname, username y password son obligatorios' });
    }

    const usuarios = await leerArchivo(rutaUsuarios);

    if (usuarios.some((u) => u.username === username)) {
      await borrarImagen(avatar);
      return res.status(400).json({ error: 'El username ya está registrado' });
    }

    const nuevoUsuario = {
      id: generarId(usuarios),
      firstname,
      lastname,
      username,
      password: encriptarPassword(password),
      avatar,
    };

    usuarios.push(nuevoUsuario);
    await guardarArchivo(rutaUsuarios, usuarios);

    res.status(201).json(quitarPassword(nuevoUsuario));
  } catch (error) {
    await borrarImagen(avatar);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    res.status(501).json({ error: 'No implementado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
