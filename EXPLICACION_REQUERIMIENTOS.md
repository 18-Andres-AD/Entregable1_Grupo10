# Explicación de los requerimientos (RE-01 a RE-05)

En este documento explicamos dónde quedó cada requerimiento en el código, cómo lo hicimos y para qué sirve.

## Estructura del proyecto

```
Entrega1/
├── public/                         carpeta pública (RE-01)
│   ├── index.html, css/, js/       página para probar la API
│   └── img/
│       ├── users/                  fotos de perfil (RE-02)
│       └── pets/                   fotos de mascotas (RE-02)
└── src/
    ├── app.js                      servidor, archivos estáticos y rutas
    ├── middlewares/
    │   └── multer.middleware.js    configuración de multer (RE-02)
    ├── utils/
    │   ├── crypto.js               encriptar contraseñas (RE-03)
    │   └── fileManager.js          leer y guardar los JSON, borrar imágenes
    ├── routes/
    │   ├── users.router.js         /api/users (RE-04)
    │   └── pets.router.js          /api/pets (RE-05)
    └── data/
        ├── users.json
        └── pets.json
```

### Qué pasa cuando se crea un usuario

1. Desde Postman o la página se manda un `POST /api/users` con form-data.
2. `app.js` manda la petición a `users.router.js`.
3. `upload.single('avatar')` (multer) guarda la foto en `public/img/users`.
4. Se encripta la contraseña con `encriptarPassword`.
5. Se agrega el usuario a `users.json` con `guardarArchivo`.
6. Se responde el usuario sin la contraseña, y la foto se puede ver en `http://localhost:8080/img/users/<archivo>`.

---

## RE-01: Archivos estáticos

**Dónde está:** `src/app.js`, línea 19.

```js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
...
app.use(express.static(path.join(__dirname, '../public')));
```

**Cómo lo hicimos:** el proyecto usa `"type": "module"` en el `package.json`, y así no existe `__dirname`, por eso lo armamos con `fileURLToPath` y `path.dirname`. Después, con `path.join(__dirname, '../public')`, salimos de `src` y apuntamos a la carpeta `public`. No usamos prefijo, entonces la URL es igual a la ruta de la carpeta.

**Para qué sirve:** cualquier archivo que esté en `public` se puede abrir desde el navegador sin crear una ruta aparte.

| Archivo | URL |
|---|---|
| `public/index.html` | `http://localhost:8080/` |
| `public/img/users/1793216008966-160959234.jpg` | `http://localhost:8080/img/users/1793216008966-160959234.jpg` |

Usamos el puerto 8080, igual que el enunciado (o el que venga en la variable `PORT`).

---

## RE-02: multer.diskStorage

**Dónde está:** `src/middlewares/multer.middleware.js`.

```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const carpeta = file.fieldname === 'avatar' ? 'users' : 'pets';
    cb(null, path.join(carpetaImagenes, carpeta));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
```

**Cómo lo hicimos:**
- `destination`: mira el nombre del campo. Si es `avatar`, la imagen va a `public/img/users`; si es `img`, va a `public/img/pets`. Así usamos el mismo `upload` para los dos routers.
- `filename`: le pone la fecha en milisegundos antes del nombre, por ejemplo `1793216008966-foto.jpg`. Si dos personas suben `foto.jpg`, no se reemplazan.
- También agregamos `soloImagenes`, que rechaza lo que no sea imagen, y un límite de 5 MB por archivo. Si multer da error, `app.js` (línea 25) responde con un 400.

**Qué se guarda en el JSON:** guardamos la ruta pública y no la del disco, para que funcione directo con `express.static`:

```js
// users.router.js, línea 29
const avatar = req.file ? `/img/users/${req.file.filename}` : null;
```

En `users.json` queda así:

```json
"avatar": "/img/users/1793216008966-160959234.jpg"
```

---

## RE-03: Contraseñas con crypto

**Dónde está:** `src/utils/crypto.js`, y se usa en `src/routes/users.router.js` (líneas 9 y 52).

```js
export const encriptarPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};
```

**Cómo lo hicimos:**
1. Creamos un salt aleatorio de 16 bytes. Así, si dos usuarios tienen la misma contraseña, en el JSON se ven distintas.
2. Con `scryptSync` sacamos el hash. Es un método lento a propósito, para que sea difícil adivinar la contraseña probando muchas.
3. Se guarda como `salt:hash`, por ejemplo `"password": "6fe942eb...:d86d46c0..."`.
4. `compararPassword` queda lista para un login: separa el salt, vuelve a sacar el hash y compara con `timingSafeEqual`.
5. Para no devolver la contraseña usamos:

   ```js
   const quitarPassword = ({ password, ...usuario }) => usuario;
   ```

   Saca el campo `password` y devuelve lo demás. Se usa en el `GET` y en la respuesta del `POST`.

---

## RE-04: Router de usuarios

**Dónde está:** `src/routes/users.router.js`. Se conecta en `src/app.js`, línea 21:

```js
app.use('/api/users', usersRouter);
```

Como el prefijo ya está ahí, dentro del router solo escribimos `/` y `/:id`.

| Endpoint | Línea | Estado |
|---|---|---|
| `GET /api/users` | 11 | Hecho. Lee `users.json` y quita el password |
| `GET /api/users/:id` | 20 | Pendiente (responde 501) |
| `POST /api/users` | 28 | Hecho |
| `PUT /api/users/:id` | 66 | Pendiente, ya tiene `upload.single('avatar')` |
| `DELETE /api/users/:id` | 74 | Pendiente (responde 501) |

**Cómo funciona el POST:**
1. `upload.single('avatar')` guarda la foto en `public/img/users`.
2. Revisa que vengan `firstname`, `lastname`, `username` y `password`. Si falta alguno, responde 400.
3. Revisa que el `username` no esté repetido. Si está, responde 400.
4. En esos dos casos borra la foto con `borrarImagen`, porque multer ya la había guardado.
5. Crea el id con `generarId` (el mayor + 1).
6. Encripta la contraseña y guarda con `guardarArchivo`.
7. Responde 201 con el usuario, sin password.

**Funciones de `src/utils/fileManager.js`:**
- `leerArchivo` y `guardarArchivo`: leen y escriben los JSON con `fs/promises`.
- `generarId`: calcula el siguiente id.
- `borrarImagen`: borra una imagen usando la ruta que queda en el JSON. Nos va a servir en el PUT (cambiar la foto) y en el DELETE.

---

## RE-05: Router de mascotas

**Dónde está:** `src/routes/pets.router.js`. Se conecta en `src/app.js`, línea 22:

```js
app.use('/api/pets', petsRouter);
```

| Endpoint | Línea | Estado |
|---|---|---|
| `GET /api/pets` | 7 | Pendiente (responde 501) |
| `GET /api/pets/:id` | 15 | Pendiente (responde 501) |
| `POST /api/pets` | 23 | Pendiente, ya tiene `upload.array('img', 5)` |
| `PUT /api/pets/:id` | 31 | Pendiente, ya tiene `upload.array('img', 5)` |
| `DELETE /api/pets/:id` | 39 | Pendiente (responde 501) |

**Lo que ya está:** el prefijo, las cinco rutas y `upload.array('img', 5)`, que acepta hasta 5 imágenes en el campo `img`. Como el campo no se llama `avatar`, multer las guarda en `public/img/pets`. Si mandan más de 5, multer da error y `app.js` responde 400.

**Lo que falta:** en el POST, multer deja los archivos en `req.files` (un arreglo), entonces el campo `img` se puede armar así:

```js
const img = (req.files || []).map((archivo) => `/img/pets/${archivo.filename}`);
```

---

## Resumen

| Requerimiento | Archivo | Estado |
|---|---|---|
| RE-01 Archivos estáticos | `src/app.js` | Completo |
| RE-02 multer.diskStorage | `src/middlewares/multer.middleware.js` | Completo |
| RE-03 crypto | `src/utils/crypto.js` | Se usa en POST y GET; falta en PUT |
| RE-04 Usuarios | `src/routes/users.router.js` | GET y POST listos; falta GET por id, PUT y DELETE |
| RE-05 Mascotas | `src/routes/pets.router.js` | Rutas y multer listos; falta la lógica |

## Cómo probarlo

```bash
npm install
npm run dev
```

- Abrir `http://localhost:8080` para usar la página.
- O en Postman: `POST http://localhost:8080/api/users`, Body en **form-data** con `firstname`, `lastname`, `username`, `password` (texto) y `avatar` (tipo File).
- `GET http://localhost:8080/api/users` devuelve los usuarios sin `password`.
- Para ver la foto se abre `http://localhost:8080` más lo que diga el campo `avatar`.
