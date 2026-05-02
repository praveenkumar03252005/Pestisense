/* ════════════════════════════════════════
   history.js
   Handles: Loading analysis history.
   ════════════════════════════════════════ */

async function fetchHistory() {
  const token = localStorage.getItem('pestisense_token');
  if(!token) return;

  const historyList = document.getElementById('history-list');
  if(!historyList) return;

  try {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if(!res.ok) return;

    const history = await res.json();
    historyList.innerHTML = history.length ? history.map(h => `
      <div class="history-card">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <div style="font-weight:700; font-size:0.85rem; color:var(--soil);">${h.disease[currentLang]}</div>
          <div style="font-size:0.7rem; color:#999;">${new Date(h.date).toLocaleDateString()}</div>
        </div>
        <div style="font-size:0.75rem; color:#666; margin-bottom:8px;">Location: ${h.location}</div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
           <button class="history-action-btn" style="border:1px solid var(--border); background:#fff;" onclick="viewHistoryItem('${h.id}')">View Report</button>
        </div>
      </div>
    `).join('') : '<p style="text-align:center; padding:20px; color:#999; font-size:0.85rem;">No history found.</p>';

  } catch (err) {
    console.error('History fetch error:', err);
  }
}

async function viewHistoryItem(id) {
  // Mock switching logic
  alert(`Loading full report for #${id} ... (Mock)`);
}

function toggleHistory() {
  const panel = document.getElementById('history-panel');
  const trigger = document.getElementById('history-trigger');
  
  if(panel.style.display === 'block') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';
    fetchHistory();
  }
}
