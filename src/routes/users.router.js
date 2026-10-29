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
    const usuarios = await leerArchivo(rutaUsuarios);
    const usuario = usuarios.find((u) => u.id === Number(req.params.id));

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(quitarPassword(usuario));
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
  const avatarNuevo = req.file ? `/img/users/${req.file.filename}` : null;

  try {
    const usuarios = await leerArchivo(rutaUsuarios);
    const usuario = usuarios.find((u) => u.id === Number(req.params.id));

    if (!usuario) {
      await borrarImagen(avatarNuevo);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { firstname, lastname, username, password } = req.body;

    if (username && usuarios.some((u) => u.username === username && u.id !== usuario.id)) {
      await borrarImagen(avatarNuevo);
      return res.status(400).json({ error: 'El username ya está registrado' });
    }

    if (firstname) usuario.firstname = firstname;
    if (lastname) usuario.lastname = lastname;
    if (username) usuario.username = username;
    if (password) usuario.password = encriptarPassword(password);

    if (avatarNuevo) {
      await borrarImagen(usuario.avatar);
      usuario.avatar = avatarNuevo;
    }

    await guardarArchivo(rutaUsuarios, usuarios);

    res.status(200).json(quitarPassword(usuario));
  } catch (error) {
    await borrarImagen(avatarNuevo);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const usuarios = await leerArchivo(rutaUsuarios);
    const posicion = usuarios.findIndex((u) => u.id === Number(req.params.id));

    if (posicion === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const [eliminado] = usuarios.splice(posicion, 1);
    await guardarArchivo(rutaUsuarios, usuarios);
    await borrarImagen(eliminado.avatar);

    res.status(200).json({ mensaje: 'Usuario eliminado', usuario: quitarPassword(eliminado) });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
