/* ════════════════════════════════════════════════════════════
   auth.js  — PestiSense Authentication
   ════════════════════════════════════════════════════════════ */

window.currentUser  = null;
window.authToken    = null;

document.addEventListener('DOMContentLoaded', () => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    window.authToken = savedToken;
    _verifyToken(savedToken);
  }
});

function openAuthModal(tab = 'signin') {
  document.getElementById('auth-modal').style.display = 'flex';
  switchAuthTab(tab);
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function switchAuthTab(tab) {
  ['signin','signup'].forEach(t => {
    document.getElementById(`auth-tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`auth-panel-${t}`).style.display = t === tab ? 'block' : 'none';
  });
}

async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, password}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    _saveSession(data.token, data.user);
    closeAuthModal();
  } catch (err) {
    document.getElementById('auth-error').textContent = err.message;
    document.getElementById('auth-error').style.display = 'block';
  }
}

async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    _saveSession(data.token, data.user);
    closeAuthModal();
  } catch (err) {
    document.getElementById('auth-error').textContent = err.message;
    document.getElementById('auth-error').style.display = 'block';
  }
}

function signOut() {
  localStorage.removeItem('token');
  window.authToken = null;
  window.currentUser = null;
  location.reload();
}

function _saveSession(token, user) {
  localStorage.setItem('token', token);
  window.authToken = token;
  window.currentUser = user;
  _renderSignedIn(user);
}

async function _verifyToken(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {'Authorization': `Bearer ${token}`},
    });
    if (res.ok) {
        const user = await res.json();
        window.currentUser = user;
        _renderSignedIn(user);
    } else {
        localStorage.removeItem('token');
    }
  } catch {}
}

function _renderSignedIn(user) {
  document.getElementById('header-signin-btn').style.display = 'none';
  document.getElementById('header-user-chip').style.display = 'flex';
  document.getElementById('header-user-name').textContent = user.name;
}
