import crypto from 'crypto';

export const encriptarPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};


export const compararPassword = (password, guardada) => {
  const [salt, hash] = guardada.split(':');
  const hashNuevo = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashNuevo, 'hex'));
};
