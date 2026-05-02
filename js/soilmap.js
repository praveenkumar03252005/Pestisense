/* ════════════════════════════════════════
   soilmap.js
   Handles: Soil Nutrient Map tab logic,
   SVG interactions, and data fetching.
   ════════════════════════════════════════ */

async function initSoilMapTab() {
  const container = document.getElementById('soilmap-panel');
  if(!container) return;

  const content = document.getElementById('soilmap-content');
  content.innerHTML = '<div class="loader-ring"></div><p style="text-align:center">Loading soil data...</p>';

  try {
    const res = await fetch(`${API_BASE}/soil`);
    if(!res.ok) throw new Error('Failed to fetch soil');
    const data = await res.json();

    content.innerHTML = `
      <div class="nutrient-toggle">
        <button class="nt-btn active" onclick="switchNutrientType('macro')">Macro Nutrients</button>
        <button class="nt-btn" onclick="switchNutrientType('micro')">Micro Nutrients</button>
      </div>

      <div class="field-map-container">
        <div class="field-map-title">📍 Farm Soil Map — Village Average</div>
        <div class="field-map-svg-wrap" id="soil-svg-container">
           ${renderSoilSVG(data)}
        </div>
        <div class="map-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#27ae60"></span> Optimal</div>
          <div class="legend-item"><span class="legend-dot" style="background:#f39c12"></span> Medium</div>
          <div class="legend-item"><span class="legend-dot" style="background:#e74c3c"></span> Deficient</div>
        </div>
      </div>

      <div class="nutrient-grid">
        ${data.nutrients.map(n => renderNutrientBar(n)).join('')}
      </div>

      <div class="ratio-section">
        <div class="ratio-title">⚖️ Health Ratios</div>
        <div class="ratio-grid">
           <div class="ratio-card">
              <div class="ratio-label">N:P:K Ratio</div>
              <div class="ratio-value">${data.ratios.npk}</div>
              <div class="ratio-status rs-warn">Needs P</div>
           </div>
           <div class="ratio-card">
              <div class="ratio-label">C:N Ratio</div>
              <div class="ratio-value">${data.ratios.cn}</div>
              <div class="ratio-status rs-good">Healthy</div>
           </div>
        </div>
      </div>
    `;

    setupSVGEvents();

  } catch (err) {
    console.error(err);
    content.innerHTML = '<p class="error-text">Failed to load soil data. Please try again.</p>';
  }
}

function renderNutrientBar(n) {
  const pct = Math.min(100, (n.value / n.max) * 100);
  let status = 'optimal';
  if(pct < 35) status = 'low';
  else if(pct < 70) status = 'medium';

  return `
    <div class="nutrient-bar-card">
      <div class="nb-header">
        <div class="nb-name">${n.name} <span class="nb-symbol">${n.symbol}</span></div>
        <div class="nb-value ${status}">${n.value}${n.unit}</div>
      </div>
      <div class="nb-bar-track">
        <div class="nb-bar-fill fill-${status}" style="width:${pct}%"></div>
      </div>
      <div class="nb-status">
        <span>Target: ${n.target}${n.unit}</span>
        <span class="st ${status}">${status.toUpperCase()}</span>
      </div>
    </div>
  `;
}

function renderSoilSVG(data) {
  return `
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,10 L90,10 L85,50 L15,50 Z" fill="#e8e0d8" stroke="#8d6e63" stroke-width="0.5" />
      <polygon points="10,10 50,10 45,30 15,30" fill="#a5d6a7" fill-opacity="0.6" class="field-zone" data-info="North Zone: High N" />
      <polygon points="50,10 90,10 85,30 45,30" fill="#fff59d" fill-opacity="0.6" class="field-zone" data-info="East Zone: Low P" />
      <polygon points="15,30 45,30 40,50 15,50" fill="#ef9a9a" fill-opacity="0.6" class="field-zone" data-info="West Zone: Acidic" />
      <polygon points="45,30 85,30 85,50 40,50" fill="#a5d6a7" fill-opacity="0.6" class="field-zone" data-info="South Zone: Optimal" />
    </svg>
  `;
}

function setupSVGEvents() {
  const zones = document.querySelectorAll('.field-zone');
  zones.forEach(z => {
    z.onmouseover = () => z.style.fillOpacity = "0.9";
    z.onmouseout = () => z.style.fillOpacity = "0.6";
    z.onclick = () => alert(z.getAttribute('data-info'));
  });
}

function switchNutrientType(type) {
  const btns = document.querySelectorAll('.nt-btn');
  btns.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  initSoilMapTab(); // re-fetch or re-filter
}
