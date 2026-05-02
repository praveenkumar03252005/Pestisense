/* ════════════════════════════════════════
   hotspot.js
   ════════════════════════════════════════ */

async function initHotspotMap() {
    try {
        const resp = await fetch(`${API_BASE}/disease-hotspots`);
        const data = await resp.json();
        console.log('Hotspots loaded:', data);
    } catch (err) {
        console.error(err);
    }
}
