import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { leerArchivo, guardarArchivo, generarId, borrarImagen, rutaMascotas } from '../utils/fileManager.js';

const router = Router();

const rutasDeImagenes = (archivos = []) => archivos.map((archivo) => `/img/pets/${archivo.filename}`);

const borrarImagenes = async (imagenes = []) => {
  for (const imagen of imagenes) {
    await borrarImagen(imagen);
  }
};

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
  const img = rutasDeImagenes(req.files);

  try {
    const { especie, color, edad, sexo } = req.body;

    if (!especie || !color || !edad || !sexo) {
      await borrarImagenes(img);
      return res.status(400).json({ error: 'especie, color, edad y sexo son obligatorios' });
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
  const imagenesNuevas = rutasDeImagenes(req.files);

  try {
    const mascotas = await leerArchivo(rutaMascotas);
    const posicion = mascotas.findIndex((m) => m.id === Number(req.params.id));

    if (posicion === -1) {
      await borrarImagenes(imagenesNuevas);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const mascota = mascotas[posicion];
    const { especie, color, edad, sexo, reemplazarImagenes } = req.body;

    if (especie) mascota.especie = especie;
    if (color) mascota.color = color;
    if (edad) mascota.edad = Number(edad);
    if (sexo) mascota.sexo = sexo;

    if (imagenesNuevas.length > 0) {
      if (reemplazarImagenes === 'true') {
        await borrarImagenes(mascota.img);
        mascota.img = imagenesNuevas;
      } else {
        mascota.img = [...(mascota.img || []), ...imagenesNuevas];
      }
    }

    await guardarArchivo(rutaMascotas, mascotas);

    res.status(200).json(mascota);
  } catch (error) {
    await borrarImagenes(imagenesNuevas);
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mascotas = await leerArchivo(rutaMascotas);
    const posicion = mascotas.findIndex((m) => m.id === Number(req.params.id));

    if (posicion === -1) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const [eliminada] = mascotas.splice(posicion, 1);
    await guardarArchivo(rutaMascotas, mascotas);
    await borrarImagenes(eliminada.img);

    res.status(200).json({ mensaje: 'Mascota eliminada', mascota: eliminada });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mascota' });
  }
});

export default router;
