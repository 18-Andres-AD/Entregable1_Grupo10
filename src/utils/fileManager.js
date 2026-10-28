import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const USERS_PATH = path.join(__dirname, '../data/users.json');
export const PETS_PATH = path.join(__dirname, '../data/pets.json');
export const PUBLIC_DIR = path.join(__dirname, '../../public');


export const readJSON = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
};

export const writeJSON = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};


export const nextId = (items) =>
  items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;


export const deletePublicFile = async (publicPath) => {
  if (!publicPath) return;
  try {
    await fs.unlink(path.join(PUBLIC_DIR, publicPath));
  } catch {
  }
};
