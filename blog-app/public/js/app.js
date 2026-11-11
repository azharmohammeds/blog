const API = '/api';
const CATEGORIES = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Education'];
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const token = () => localStorage.getItem('token');
const fmt = (d) => new Date(d).toLocaleDateString();

async function api(path, method = 'GET', body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: 'Bearer ' + token() } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token()) localStorage.removeItem('token');
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function renderNav() {
  const links = token()
    ? '<a href="/dashboard.html">Dashboard</a><a href="/create.html">New Blog</a><a href="#" id="logout">Logout</a>'
    : '<a href="/login.html">Login</a><a href="/register.html">Register</a>';
  $('#nav').innerHTML = '<a class="brand" href="/">📝 BlogApp</a><a href="/">Home</a>' + links;
  const lo = $('#logout');
  if (lo) lo.onclick = (e) => { e.preventDefault(); localStorage.removeItem('token'); location.href = '/login.html'; };
}

function requireAuth() {
  if (!token()) { location.href = '/login.html'; return false; }
  return true;
}

function blogCard(b, owner) {
  return `<div class="card">
    <span class="tag">${esc(b.category)}</span>
    <h3><a href="/blog.html?id=${b._id}">${esc(b.title)}</a></h3>
    <div class="meta">by ${esc(b.author?.name || 'Unknown')} · ${fmt(b.createdAt)}</div>
    <p>${esc(b.content.slice(0, 120))}${b.content.length > 120 ? '…' : ''}</p>
    ${owner ? `<div class="actions"><a class="btn" href="/create.html?id=${b._id}">Edit</a><button class="danger" data-del="${b._id}">Delete</button></div>` : ''}
  </div>`;
}

const pages = {
  async home() {
    const cat = $('#category');
    cat.innerHTML = '<option value="">All categories</option>' + CATEGORIES.map((c) => `<option>${c}</option>`).join('');
    const load = async () => {
      try {
        const q = new URLSearchParams({ search: $('#search').value, category: cat.value });
        const blogs = await api('/blogs?' + q);
        $('#list').innerHTML = blogs.length ? blogs.map((b) => blogCard(b)).join('') : '<p>No blogs found.</p>';
      } catch (e) { $('#list').innerHTML = `<p class="error">${esc(e.message)}</p>`; }
    };
    let t; $('#search').oninput = () => { clearTimeout(t); t = setTimeout(load, 300); };
    cat.onchange = load;
    load();
  },

  login() {
    $('#form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const d = await api('/auth/login', 'POST', { email: $('#email').value, password: $('#password').value });
        localStorage.setItem('token', d.token);
        location.href = '/dashboard.html';
      } catch (err) { $('#msg').textContent = err.message; }
    };
  },

  register() {
    $('#form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const d = await api('/auth/register', 'POST', { name: $('#name').value, email: $('#email').value, password: $('#password').value });
        localStorage.setItem('token', d.token);
        location.href = '/dashboard.html';
      } catch (err) { $('#msg').textContent = err.message; }
    };
  },

  async dashboard() {
    if (!requireAuth()) return;
    try {
      const me = await api('/auth/me');
      $('#profile').innerHTML = `<div><strong>${esc(me.name)}</strong><div class="meta">${esc(me.email)} · joined ${fmt(me.createdAt)}</div></div><a class="btn" href="/create.html">+ New Blog</a>`;
      const load = async () => {
        const blogs = await api('/blogs/mine');
        $('#list').innerHTML = blogs.length ? blogs.map((b) => blogCard(b, true)).join('') : '<p>You have not written any blogs yet.</p>';
      };
      $('#list').onclick = async (e) => {
        const id = e.target.dataset.del;
        if (id && confirm('Delete this blog?')) { await api('/blogs/' + id, 'DELETE'); load(); }
      };
      load();
    } catch (e) { location.href = '/login.html'; }
  },

  async create() {
    if (!requireAuth()) return;
    $('#category').innerHTML = CATEGORIES.map((c) => `<option>${c}</option>`).join('');
    const id = new URLSearchParams(location.search).get('id');
    if (id) {
      $('h1').textContent = 'Edit Blog';
      try {
        const b = await api('/blogs/' + id);
        $('#title').value = b.title; $('#content').value = b.content; $('#category').value = b.category;
      } catch (e) { $('#msg').textContent = e.message; }
    }
    $('#form').onsubmit = async (e) => {
      e.preventDefault();
      const body = { title: $('#title').value, content: $('#content').value, category: $('#category').value };
      try {
        const saved = id ? await api('/blogs/' + id, 'PUT', body) : await api('/blogs', 'POST', body);
        location.href = '/blog.html?id=' + saved._id;
      } catch (err) { $('#msg').textContent = err.message; }
    };
  },

  async blog() {
    const id = new URLSearchParams(location.search).get('id');
    try {
      const b = await api('/blogs/' + id);
      document.title = b.title;
      $('#post').innerHTML = `<span class="tag">${esc(b.category)}</span><h1>${esc(b.title)}</h1>
        <div class="meta">by ${esc(b.author?.name)} · ${fmt(b.createdAt)}</div><div class="article">${esc(b.content)}</div>`;
    } catch (e) { $('#post').innerHTML = `<p class="error">${esc(e.message)}</p>`; }
  }
};

renderNav();
pages[document.body.dataset.page]?.();
