
async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function thumbnail(src, alt) {
  return src ? el('img', { src, alt, loading: 'lazy' }) : el('div', { className: 'placeholder' });
}

function card({ image, alt, title, subtitle, badge, deleteUrl }) {
  const deleteButton = el('button', { type: 'button', className: 'danger', textContent: 'Eliminar' });
  deleteButton.dataset.url = deleteUrl;

  return el('li', { className: 'card' }, [
    thumbnail(image, alt),
    el('div', { className: 'info' }, [
      el('strong', { textContent: title }),
      el('br'),
      el('small', { textContent: subtitle }),
      ...(badge ? [el('br'), el('span', { className: 'badge', textContent: badge })] : []),
    ]),
    deleteButton,
  ]);
}

const resources = {
  'user-list': {
    endpoint: '/api/users',
    toCard: (u) => ({
      image: u.avatar,
      alt: `Avatar de ${u.username}`,
      title: `${u.firstname} ${u.lastname}`,
      subtitle: `@${u.username}`,
      // la API nunca envía el password: si no viene, está protegido correctamente
      badge: 'password' in u ? null : 'Contraseña protegida',
    }),
  },
  'pet-list': {
    endpoint: '/api/pets',
    toCard: (p) => ({
      image: p.img?.[0],
      alt: `Foto de ${p.especie}`,
      title: `${p.especie} (${p.sexo}, ${p.edad} años)`,
      subtitle: `${p.color} · ${p.img?.length ?? 0} foto(s)`,
    }),
  },
};


async function loadList(listId) {
  const list = document.getElementById(listId);
  const { endpoint, toCard } = resources[listId];

  try {
    const items = await request(endpoint);
    if (!items.length) {
      list.replaceChildren(el('li', { className: 'empty', textContent: 'Sin registros' }));
      return;
    }
    list.replaceChildren(
      ...items.map((item) => card({ ...toCard(item), deleteUrl: `${endpoint}/${item.id}` }))
    );
  } catch (err) {
    list.replaceChildren(el('li', { className: 'empty', textContent: `No se pudo cargar: ${err.message}` }));
  }
}

function setupDelete(listId) {
  document.getElementById(listId).addEventListener('click', async (e) => {
    const button = e.target.closest('button[data-url]');
    if (!button || !confirm('¿Eliminar este registro?')) return;

    button.disabled = true;
    try {
      await request(button.dataset.url, { method: 'DELETE' });
      await loadList(listId);
    } catch (err) {
      alert(err.message);
      button.disabled = false;
    }
  });
}

function setupForm(form) {
  const msg = form.querySelector('.msg');
  const submit = form.querySelector('button[type="submit"]');
  const { endpoint, list } = form.dataset;

  const showMessage = (text, type) => {
    msg.textContent = text;
    msg.className = `msg ${type}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      showMessage('Completa todos los campos obligatorios', 'error');
      return;
    }

    submit.disabled = true;
    try {
      await request(endpoint, { method: 'POST', body: new FormData(form) });
      showMessage('Creado correctamente', 'ok');
      form.reset();
      await loadList(list);
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      submit.disabled = false;
    }
  });
}

function setupPasswordToggle(button) {
  const input = document.getElementById(button.getAttribute('aria-controls'));
  button.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.textContent = visible ? 'Ocultar' : 'Mostrar';
    button.setAttribute('aria-pressed', String(visible));
  });
}

document.querySelectorAll('.toggle-password').forEach(setupPasswordToggle);
document.querySelectorAll('form[data-endpoint]').forEach(setupForm);
Object.keys(resources).forEach((listId) => {
  setupDelete(listId);
  loadList(listId);
});
