/* ════════════════════════════════════════
   app.js
   Bootstraps the PestiSense application.
   Handles tab switching, translations,
   and auth readiness.
   ════════════════════════════════════════ */

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 PestiSense Bootstrap Started');

  const savedLang = localStorage.getItem('pestisense_lang') || 'te';
  setLang(savedLang);

  initAuth();

  initTabs();

  initVoiceSupport();

  initFloatingAI();
});

/* ── TAB NAVIGATION ── */
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => {
        p.classList.remove('active');
        if (p.id === targetId + '-panel') p.classList.add('active');
      });

      if (targetId === 'soilmap') initSoilMapTab();
      if (targetId === 'hotspot') initHotspotMap();
      if (targetId === 'weather') loadWeatherForecast();
      if (targetId === 'reviews') initReviewsTab();
      if (targetId === 'sales')   initSalesModule();
      if (targetId === 'ocr')     initPesticideOCR();
    });
  });
}

const showToast = (msg, type = 'info') => {
  alert(`${type.toUpperCase()}: ${msg}`);
};
