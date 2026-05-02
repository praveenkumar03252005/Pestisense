/* ════════════════════════════════════════
   soilmap.js
   ════════════════════════════════════════ */

async function initSoilMapTab() {
  try {
    const resp = await fetch(`${API_BASE}/soil`);
    const data = await resp.json();
    console.log('Soil data loaded:', data);
  } catch (err) {
      console.error(err);
  }
}
