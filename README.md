# Entregable1_Grupo10

API REST en Node.js + Express para gestionar **usuarios** y **mascotas**, con persistencia en archivos JSON (`fs/promises`), contraseñas hasheadas (`crypto`), subida de imágenes (`multer.diskStorage`) y archivos estáticos (`express.static`).

## Instalación y ejecución

```bash
npm install
npm run dev     # o: npm start
```

Servidor: `http://localhost:8080`

## Endpoints

### Usuarios `/api/users`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Lista usuarios (sin password) |
| GET | `/api/users/:id` | Usuario por id |
| POST | `/api/users` | form-data: firstname, lastname, username, password, avatar (archivo) |
| PUT | `/api/users/:id` | Actualiza datos, password o avatar |
| DELETE | `/api/users/:id` | Elimina usuario |

### Mascotas `/api/pets`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pets` | Lista mascotas |
| GET | `/api/pets/:id` | Mascota por id |
| POST | `/api/pets` | form-data: especie, color, edad, sexo, img (hasta 5 archivos) |
| PUT | `/api/pets/:id` | Actualiza datos o imágenes |
| DELETE | `/api/pets/:id` | Elimina mascota |

Las imágenes quedan accesibles en `http://localhost:8080/img/users/...` y `http://localhost:8080/img/pets/...`
