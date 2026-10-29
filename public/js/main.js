// Hace la petición y devuelve el JSON, o lanza el error que mande el servidor
async function pedir(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || 'Error ' + respuesta.status);
  }
  return datos;
}

function crearTarjeta(tipo, foto, inicial, titulo, detalle, urlEliminar) {
  const li = document.createElement('li');
  li.className = 'tarjeta ' + tipo;

  let imagen;
  if (foto) {
    imagen = document.createElement('img');
    imagen.src = foto;
    imagen.alt = titulo;
  } else {
    imagen = document.createElement('div');
    imagen.className = 'sin-foto';
    imagen.textContent = inicial;
  }

  const datos = document.createElement('div');
  datos.className = 'datos';
  const nombre = document.createElement('strong');
  nombre.textContent = titulo;
  const info = document.createElement('span');
  info.textContent = detalle;
  datos.append(nombre, info);

  const botonEliminar = document.createElement('button');
  botonEliminar.className = 'boton-eliminar';
  botonEliminar.textContent = 'Eliminar';
  botonEliminar.addEventListener('click', () => eliminar(urlEliminar, botonEliminar));

  li.append(imagen, datos, botonEliminar);
  return li;
}

function mostrarVacio(lista, texto) {
  const li = document.createElement('li');
  li.className = 'vacio';
  li.textContent = texto;
  lista.replaceChildren(li);
}

async function cargarUsuarios() {
  const lista = document.getElementById('lista-usuarios');
  try {
    const usuarios = await pedir('/api/users');
    if (usuarios.length === 0) {
      mostrarVacio(lista, 'Todavía no hay usuarios registrados');
      return;
    }
    const tarjetas = usuarios.map((usuario) =>
      crearTarjeta(
        'usuario',
        usuario.avatar,
        usuario.firstname.charAt(0).toUpperCase(),
        usuario.firstname + ' ' + usuario.lastname,
        usuario.username,
        '/api/users/' + usuario.id
      )
    );
    lista.replaceChildren(...tarjetas);
  } catch (error) {
    mostrarVacio(lista, 'No se pudieron cargar los usuarios: ' + error.message);
  }
}

async function cargarMascotas() {
  const lista = document.getElementById('lista-mascotas');
  try {
    const mascotas = await pedir('/api/pets');
    if (mascotas.length === 0) {
      mostrarVacio(lista, 'Todavía no hay mascotas registradas');
      return;
    }
    const tarjetas = mascotas.map((mascota) => {
      const fotos = mascota.img || [];
      return crearTarjeta(
        'mascota',
        fotos[0],
        mascota.especie.charAt(0).toUpperCase(),
        mascota.especie + ' (' + mascota.sexo + ', ' + mascota.edad + ' años)',
        mascota.color + ' · ' + fotos.length + ' foto(s)',
        '/api/pets/' + mascota.id
      );
    });
    lista.replaceChildren(...tarjetas);
  } catch (error) {
    mostrarVacio(lista, 'No se pudieron cargar las mascotas: ' + error.message);
  }
}

async function eliminar(url, boton) {
  if (!confirm('¿Seguro que quieres eliminar este registro?')) return;

  boton.disabled = true;
  try {
    await pedir(url, { method: 'DELETE' });
    cargarUsuarios();
    cargarMascotas();
  } catch (error) {
    alert(error.message);
    boton.disabled = false;
  }
}

function prepararFormulario(formulario, alGuardar) {
  const mensaje = formulario.querySelector('.mensaje');
  const boton = formulario.querySelector('button[type="submit"]');

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      mensaje.textContent = 'Faltan campos por llenar';
      mensaje.className = 'mensaje error';
      return;
    }

    boton.disabled = true;
    try {
      await pedir(formulario.getAttribute('action'), {
        method: 'POST',
        body: new FormData(formulario),
      });
      mensaje.textContent = 'Guardado correctamente';
      mensaje.className = 'mensaje bien';
      formulario.reset();
      formulario.querySelectorAll('input[type="file"]').forEach(mostrarArchivos);
      alGuardar();
    } catch (error) {
      mensaje.textContent = error.message;
      mensaje.className = 'mensaje error';
    } finally {
      boton.disabled = false;
    }
  });
}

// Cambia el texto de la caja de subida según los archivos elegidos
function mostrarArchivos(input) {
  const caja = input.closest('.subir-archivo');
  const texto = caja.querySelector('.subir-texto');

  if (!caja.dataset.textoInicial) caja.dataset.textoInicial = texto.textContent;

  if (input.files.length === 0) {
    texto.textContent = caja.dataset.textoInicial;
    caja.classList.remove('con-archivo');
  } else if (input.files.length === 1) {
    texto.textContent = input.files[0].name;
    caja.classList.add('con-archivo');
  } else {
    texto.textContent = input.files.length + ' imágenes seleccionadas';
    caja.classList.add('con-archivo');
  }
}

document.querySelectorAll('.subir-archivo input').forEach((input) => {
  input.addEventListener('change', () => mostrarArchivos(input));
});

const botonVer = document.getElementById('ver-password');
const campoPassword = document.getElementById('password');
botonVer.addEventListener('click', () => {
  const oculta = campoPassword.type === 'password';
  campoPassword.type = oculta ? 'text' : 'password';
  botonVer.textContent = oculta ? 'Ocultar' : 'Mostrar';
});

prepararFormulario(document.getElementById('form-usuario'), cargarUsuarios);
prepararFormulario(document.getElementById('form-mascota'), cargarMascotas);

cargarUsuarios();
cargarMascotas();
