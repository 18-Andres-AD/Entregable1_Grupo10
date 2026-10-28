import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { hashPassword } from '../utils/crypto.js';
import { readJSON, writeJSON, nextId, deletePublicFile, USERS_PATH } from '../utils/fileManager.js';

const router = Router();


const sinPassword = ({ password, ...user }) => user;


router.get('/', async (_req, res) => {
  try {
    const users = await readJSON(USERS_PATH);
    res.status(200).json(users.map(sinPassword));
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
      await deletePublicFile(avatar); // no dejar imágenes huérfanas
      return res.status(400).json({ error: 'firstname, lastname, username y password son obligatorios' });
    }

    const users = await readJSON(USERS_PATH);

    if (users.some((u) => u.username === username)) {
      await deletePublicFile(avatar);
      return res.status(400).json({ error: 'El username ya está registrado' });
    }

    const nuevo = {
      id: nextId(users),
      firstname,
      lastname,
      username,
      password: hashPassword(password), // RE-03: nunca en texto plano
      avatar,
    };

    users.push(nuevo);
    await writeJSON(USERS_PATH, users);

    res.status(201).json(sinPassword(nuevo));
  } catch (error) {
    await deletePublicFile(avatar);
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
