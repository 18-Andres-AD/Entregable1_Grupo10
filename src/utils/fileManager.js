import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const rutaUsuarios = path.join(__dirname, '../data/users.json');
export const rutaMascotas = path.join(__dirname, '../data/pets.json');
const carpetaPublic = path.join(__dirname, '../../public');

export const leerArchivo = async (ruta) => {
  const contenido = await fs.readFile(ruta, 'utf-8');
  return JSON.parse(contenido);
};

export const guardarArchivo = async (ruta, datos) => {
  await fs.writeFile(ruta, JSON.stringify(datos, null, 2));
};


export const generarId = (lista) =>
  lista.length ? Math.max(...lista.map((item) => item.id)) + 1 : 1;


export const borrarImagen = async (rutaImagen) => {
  if (!rutaImagen) return;
  try {
    await fs.unlink(path.join(carpetaPublic, rutaImagen));
  } catch {

  }
};
