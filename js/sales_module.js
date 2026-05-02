/* ════════════════════════════════════════
   sales_module.js
   Handles: Pesticide catalog & SHC analysis.
   ════════════════════════════════════════ */

async function initSalesModule() {
  const content = document.getElementById('sales-content');
  if(!content) return;

  content.innerHTML = '<div class="loader-ring"></div><p style="text-align:center">Loading Prices & Catalog...</p>';

  try {
     // Fetch catalog
     content.innerHTML = `
        <div style="background:#fff; border-radius:12px; padding:20px; border:1.5px solid var(--border);">
           <h3 style="margin-bottom:15px; font-weight:700;">Local Pesticide Directory</h3>
           <div class="catalog-filters">
              <input type="text" placeholder="Search product name..." id="cat-search" onkeyup="filterCatalog()">
              <select id="cat-filter">
                 <option value="all">All Categories</option>
                 <option value="fungicide">Fungicides</option>
                 <option value="insecticide">Insecticides</option>
              </select>
           </div>
           <div id="pesticide-catalog-grid">
              ${renderCatalogItems()}
           </div>
        </div>

        <div style="margin-top:20px; background:white; border-radius:12px; padding:20px; border:1.5px solid var(--border);">
           <h3 style="margin-bottom:15px; font-weight:700;">Soil Health Card (SHC) Interpretation</h3>
           <p style="font-size:0.85rem; color:#666; margin-bottom:15px;">Enter your SHC values below to see exact nutrient deficits and correction costs.</p>
           
           <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
              <div class="field-v2">
                 <label>Nitrogen (kg/ha)</label>
                 <input type="number" value="210" id="shc-n">
              </div>
              <div class="field-v2">
                 <label>Phosphorus (kg/ha)</label>
                 <input type="number" value="18" id="shc-p">
              </div>
           </div>
           <button class="btn-primary" onclick="analyzeSHC()">Analyze My Soil Card →</button>
           <div id="shc-result" style="margin-top:20px;"></div>
        </div>
     `;

  } catch (err) {
    console.error(err);
    content.innerHTML = "Error loading sales module.";
  }
}

function renderCatalogItems() {
  const items = [
    { name: "Nativo 75 WG", company: "Bayer", active: "Tebuconazole + Trifloxystrobin", price: 850, size: "100g", category: "fungicide" },
    { name: "Amistar Top", company: "Syngenta", active: "Azoxystrobin + Difenoconazole", price: 1200, size: "200ml", category: "fungicide" },
    { name: "Tata Blitox", company: "Tata Rallis", active: "Copper Oxychloride 50% WP", price: 350, size: "500g", category: "fungicide" },
  ];

  return items.map(p => `
    <div class="pesticide-catalog-card" data-cat="${p.category}">
       <div class="pc-cat-badge" style="background:${p.category === 'fungicide' ? '#27ae60' : '#2980b9'}">${p.category.toUpperCase()}</div>
       <div class="pc-trade-name">${p.name}</div>
       <div class="pc-active-ing">${p.active}</div>
       <div class="pc-price-grid">
          <div class="pc-price-box highlight">
             <div class="pc-lbl">Retail Price</div>
             <div class="pc-val">₹${p.price}</div>
          </div>
          <div class="pc-price-box">
             <div class="pc-lbl">Pack Size</div>
             <div class="pc-val">${p.size}</div>
          </div>
       </div>
       <div style="font-size:0.75rem; color:#888;">Company: <strong>${p.company}</strong></div>
    </div>
  `).join('');
}

function analyzeSHC() {
  const n = document.getElementById('shc-n').value;
  const p = document.getElementById('shc-p').value;
  const target = document.getElementById('shc-result');

  target.innerHTML = `
    <div style="background:#fff7ed; padding:15px; border-radius:10px; border:1px solid #ffedd5;">
       <div style="font-weight:700; color:#9a3412; margin-bottom:10px;">📉 Deficiency Detected</div>
       <div style="font-size:0.85rem; line-height:1.6;">
          Your Nitrogen is <strong>${n} kg/ha</strong>. For Tomato, optimal is <strong>280 kg/ha</strong>.<br/>
          Deficit: <span style="color:#e11d48; font-weight:700;">-70 kg/ha</span>.
       </div>
       <div style="margin-top:10px; background:#fff; border:1px solid #fed7aa; padding:10px; border-radius:8px;">
          <div style="font-weight:700; font-size:0.8rem;">Correction Advice:</div>
          <div style="font-size:0.85rem;">Apply <strong>150kg Urea</strong> per acre across 3 doses.</div>
          <div style="font-size:0.85rem; color:#22c55e; font-weight:700; margin-top:4px;">Est. Cost: ₹450 (Subsidized Price)</div>
       </div>
    </div>
  `;
}

function filterCatalog() {
   const q = document.getElementById('cat-search').value.toLowerCase();
   const cards = document.querySelectorAll('.pesticide-catalog-card');
   cards.forEach(c => {
      const name = c.querySelector('.pc-trade-name').textContent.toLowerCase();
      c.style.display = name.includes(q) ? 'block' : 'none';
   });
}
