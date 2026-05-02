/* ════════════════════════════════════════
   app.js — Bootstrap & Tab Switching
   SINGLE SOURCE OF TRUTH for API_BASE.
   Backend runs on port 3000.
   ════════════════════════════════════════ */

// ── Global API base URL ──────────────────────
const API_BASE = '/api';

// ── Tab switching ────────────────────────────────────────────
function switchTab(tabId, clickedEl) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
  if (clickedEl) clickedEl.classList.add('active');
}

function switchToAnalysisTab() {
  const panel  = document.getElementById('tab-analysis');
  const navTab = document.querySelector('[onclick*="tab-analysis"]');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  if (panel)  panel.classList.add('active');
  if (navTab) navTab.classList.add('active');
}

// ── Bootstrap on DOM ready ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('[PestiSense] App bootstrap — API_BASE:', API_BASE);
  const savedLang = localStorage.getItem('pestisense_lang') || 'te';
  if (typeof setLang === 'function') setLang(savedLang);
});
