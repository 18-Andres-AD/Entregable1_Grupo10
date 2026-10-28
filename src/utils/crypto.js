import crypto from 'crypto';


export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};


export const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(':');
  const hashToCompare = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToCompare, 'hex'));
};
