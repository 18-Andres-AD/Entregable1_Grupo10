import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { leerArchivo, guardarArchivo, generarId, borrarImagen, rutaMascotas } from '../utils/fileManager.js';

const router = Router();


const rutasImagenes = (archivos = []) => archivos.map((archivo) => `/img/pets/${archivo.filename}`);
const borrarImagenes = (imagenes) => Promise.all(imagenes.map(borrarImagen));
const edadValida = (edad) => edad !== '' && !isNaN(edad) && Number(edad) >= 0;

router.get('/', async (req, res) => {
  try {
    const mascotas = await leerArchivo(rutaMascotas);
    res.status(200).json(mascotas);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer mascotas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mascotas = await leerArchivo(rutaMascotas);
    const mascota = mascotas.find((m) => m.id === Number(req.params.id));

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.status(200).json(mascota);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer mascotas' });
  }
});

router.post('/', upload.array('img', 5), async (req, res) => {
  const img = rutasImagenes(req.files);

  try {
    const { especie, color, edad, sexo } = req.body ?? {};

    if (!especie || !color || edad === undefined || !sexo) {
      await borrarImagenes(img);
      return res.status(400).json({ error: 'especie, color, edad y sexo son obligatorios' });
    }

    if (!edadValida(edad)) {
      await borrarImagenes(img);
      return res.status(400).json({ error: 'La edad debe ser un número mayor o igual a 0' });
    }

    const mascotas = await leerArchivo(rutaMascotas);

    const nuevaMascota = {
      id: generarId(mascotas),
      especie,
      color,
      edad: Number(edad),
      sexo,
      img,
    };

    mascotas.push(nuevaMascota);
    await guardarArchivo(rutaMascotas, mascotas);

    res.status(201).json(nuevaMascota);
  } catch (error) {
    await borrarImagenes(img);
    res.status(500).json({ error: 'Error al crear mascota' });
  }
});

router.put('/:id', upload.array('img', 5), async (req, res) => {
  const img = rutasImagenes(req.files);

  try {
    const mascotas = await leerArchivo(rutaMascotas);
    const mascota = mascotas.find((m) => m.id === Number(req.params.id));

    if (!mascota) {
      await borrarImagenes(img);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const { especie, color, edad, sexo } = req.body ?? {};

    if (edad !== undefined && !edadValida(edad)) {
      await borrarImagenes(img);
      return res.status(400).json({ error: 'La edad debe ser un número mayor o igual a 0' });
    }

    if (especie) mascota.especie = especie;
    if (color) mascota.color = color;
    if (edad !== undefined) mascota.edad = Number(edad);
    if (sexo) mascota.sexo = sexo;

    // Las imágenes nuevas se agregan a las que ya tenía la mascota
    mascota.img = [...(mascota.img || []), ...img];

    await guardarArchivo(rutaMascotas, mascotas);

    res.status(200).json(mascota);
  } catch (error) {
    await borrarImagenes(img);
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mascotas = await leerArchivo(rutaMascotas);
    const indice = mascotas.findIndex((m) => m.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const [eliminada] = mascotas.splice(indice, 1);
    await guardarArchivo(rutaMascotas, mascotas);
    await borrarImagenes(eliminada.img || []);

    res.status(200).json(eliminada);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mascota' });
  }
});

export default router;
