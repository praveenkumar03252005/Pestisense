/* ════════════════════════════════════════════════════════════
   history.js  — Crop Analysis History
   ════════════════════════════════════════════════════════════ */

async function loadUserHistory() {
  if (!window.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/history`, {
      headers: {'Authorization': `Bearer ${window.authToken}`},
    });
    const data = await res.json();
    renderHistory(data.records || []);
  } catch (err) {
      console.error(err);
  }
}

function renderHistory(records) {
    const list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = records.map(r => `
        <div class="history-card">
            <strong>${r.disease_name}</strong> - ${r.area}
        </div>
    `).join('');
}
