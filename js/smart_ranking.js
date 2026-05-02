/* ════════════════════════════════════════
   smart_ranking.js
   Handles: Score-based pesticide sorting.
   ════════════════════════════════════════ */

function renderSmartRanking(recs) {
  if(!recs || recs.length === 0) return `<p class="no-recs">${T('no-recs')}</p>`;

  // Simple sort by score descending
  const sorted = [...recs].sort((a, b) => b.score - a.score);

  return `
    <div class="rec-list">
      ${sorted.map((r, i) => `
        <div class="rec-card ${i === 0 ? 'top-pick' : ''}">
          <div class="rec-header" onclick="toggleRec(this.parentElement)">
            <div class="rec-rank rank-${i < 3 ? i + 1 : 'n'}">${i + 1}</div>
            <div class="rec-name">
               ${r.brand}
               <div style="font-size:0.75rem; color:#888; font-weight:400;">${r.activeIngredient}</div>
            </div>
            <div class="rec-score">
               ${T('lbl-conf')}
               <strong>${r.score}%</strong>
            </div>
          </div>
          <div class="rec-body">
             <div class="status-pill status-${r.legality === 'Approved' ? 'approved' : 'banned'}">
               ${r.legality === 'Approved' ? '✓ CIBRC Approved' : '⚠️ BANNED / RESTRICTED'}
             </div>
             
             <div class="rec-grid">
                <div class="rec-detail">
                   <div class="dl">${T('dt-cost')}</div>
                   <div class="dv">₹${r.costPerAcre} / acre</div>
                </div>
                <div class="rec-detail">
                   <div class="dl">${T('dt-interval')}</div>
                   <div class="dv">${r.repeatInterval}</div>
                </div>
             </div>

             <div class="advisory-box">
                <strong>${T('rsn')}</strong> ${r.reason[currentLang]}
             </div>

             <div class="et-title">✨ ${T('et-title')}</div>
             <div class="et-steps">
                <div class="et-step">
                   <div class="et-icon">💦</div>
                   <div class="et-day">${T('et-day1')}</div>
                   <div class="et-label">${T('et-day1-l')}</div>
                </div>
                <div class="et-step">
                   <div class="et-icon">🔬</div>
                   <div class="et-day">${T('et-day3')}</div>
                   <div class="et-label">${T('et-day3-l')}</div>
                </div>
                <div class="et-step">
                   <div class="et-icon">🛡️</div>
                   <div class="et-day">${T('et-day7')}</div>
                   <div class="et-label">${T('et-day7-l')}</div>
                </div>
             </div>

             <div class="conc-guide">
                <div class="cg-title">📋 ${T('cg-title')}</div>
                <div class="cg-row">
                   <div class="cg-label">${T('dt-conc')}</div>
                   <div class="cg-val">${r.concentration}</div>
                </div>
                <div class="cg-row">
                   <div class="cg-label">${T('dt-dose-acre')}</div>
                   <div class="cg-val">${r.dose_acre}</div>
                </div>
                <div class="cg-row">
                   <div class="cg-label">${T('dt-dose-litre')}</div>
                   <div class="cg-val">${r.dose_15L} / 15L tank</div>
                </div>
                <div class="cg-row">
                   <div class="cg-label">${T('dt-water')}</div>
                   <div class="cg-val">200 Litres / acre</div>
                </div>
             </div>

             <div class="patience-note">${T('patience-note')}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
