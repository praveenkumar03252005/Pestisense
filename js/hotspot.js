/* ════════════════════════════════════════
   hotspot.js
   Handles: Disease Hotspot visualization.
   ════════════════════════════════════════ */

let hotspotMap = null;

async function initHotspotMap() {
  const container = document.getElementById('hotspot-panel');
  if(!container) return;

  const content = document.getElementById('hotspot-content');
  
  // Basic UI shell for map
  content.innerHTML = `
    <div style="background:#fff; border-radius:12px; padding:15px; border:1.5px solid var(--border);">
       <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
         <h3 style="font-size:1rem; font-weight:700;">Live Disease Alerts (Chittoor District)</h3>
         <div style="background:var(--red-light); color:var(--red); padding:4px 10px; border-radius:99px; font-size:0.7rem; font-weight:700;">3 NEW OUTBREAKS</div>
       </div>
       <div id="leaflet-map" style="height:400px; background:#f0f0f0; border-radius:10px; overflow:hidden; border:1px solid #ddd;"></div>
       <div style="margin-top:15px; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div style="background:#fafafa; padding:10px; border-radius:8px; border:1px solid #eee;">
             <div style="font-size:0.7rem; color:#888;">MOST ACTIVE DISEASE</div>
             <div style="font-weight:700; color:var(--red);">Early Blight (70% coverage)</div>
          </div>
          <div style="background:#fafafa; padding:10px; border-radius:8px; border:1px solid #eee;">
             <div style="font-size:0.7rem; color:#888;">NEXT 7-DAY RISK</div>
             <div style="font-weight:700; color:#f39c12;">High (Rain predicted)</div>
          </div>
       </div>
    </div>
  `;

  // Wait for a frame to ensure div is in DOM
  setTimeout(() => {
    renderHotspotLeaflet();
  }, 100);
}

function renderHotspotLeaflet() {
  // Mock coordinates for Madanapalle area
  const center = [13.6288, 78.5015];
  
  if (hotspotMap) {
      hotspotMap.remove();
  }

  hotspotMap = L.map('leaflet-map').setView(center, 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(hotspotMap);

  // Add dummy hotspots
  const points = [
    { coords: [13.6288, 78.5015], msg: "Madanapalle: Early Blight (Critical)", color: 'red' },
    { coords: [13.5500, 78.4500], msg: "Punganur: Powdery Mildew (Low)", color: 'orange' },
    { coords: [13.7000, 78.6000], msg: "Palamaner: Late Blight (Medium)", color: 'red' },
  ];

  points.forEach(p => {
    L.circle(p.coords, {
      color: p.color,
      fillColor: p.color,
      fillOpacity: 0.4,
      radius: 1200
    }).addTo(hotspotMap).bindPopup(p.msg);
  });
}
