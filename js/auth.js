/* ════════════════════════════════════════
   auth.js
   Handles: User Auth, History, & Profiles.
   ════════════════════════════════════════ */

function initAuth() {
  const token = localStorage.getItem('pestisense_token');
  const user = JSON.parse(localStorage.getItem('pestisense_user'));

  if(token && user) {
     renderSignedIn(user);
  }

  // Auth UI setup
  const signInBtn = document.getElementById('header-signin-btn');
  const modal = document.getElementById('auth-modal');
  const closeBtn = document.querySelector('.auth-close');

  if(signInBtn) signInBtn.onclick = () => modal.style.display = 'flex';
  if(closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

  window.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
}

async function handleSignIn(event) {
  event.preventDefault();
  const email = event.target.email.value;
  const password = event.target.password.value;
  const errorEl = document.getElementById('auth-error');

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if(!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('pestisense_token', data.token);
    localStorage.setItem('pestisense_user', JSON.stringify(data.user));

    renderSignedIn(data.user);
    document.getElementById('auth-modal').style.display = 'none';
    location.reload();

  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

function renderSignedIn(user) {
  const signinBtn = document.getElementById('header-signin-btn');
  const userChip = document.getElementById('header-user-chip');
  const userName = document.getElementById('header-user-name');
  const userPic = document.getElementById('header-user-pic');
  const historyTrigger = document.getElementById('history-trigger');

  if(signinBtn) signinBtn.style.display = 'none';
  if(userChip) {
    userChip.style.display = 'flex';
    userName.textContent = user.name;
    userPic.src = user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=27ae60&color=fff`;
  }
  if(historyTrigger) historyTrigger.style.display = 'flex';
}

function handleSignOut() {
  localStorage.removeItem('pestisense_token');
  localStorage.removeItem('pestisense_user');
  location.reload();
}
