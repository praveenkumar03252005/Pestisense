/* ════════════════════════════════════════
   analysis.js
   Disease analysis flow: form validation,
   API call / demo fallback, result render.
   ════════════════════════════════════════ */

let lastAnalysisData = null;

function previewFile(input, previewId, nameId) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById(previewId);
  const nameEl  = document.getElementById(nameId);
  preview.style.display = 'block';
  nameEl.textContent    = '✓ ' + file.name;
  if (file.type.startsWith('image/')) {
    const img = preview.querySelector('img');
    img.src          = URL.createObjectURL(file);
    img.style.display = 'block';
  }
}

function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('step-' + i);
    if (i < n)       el.className = 'loader-step done';
    else if (i === n) el.className = 'loader-step active';
    else              el.className = 'loader-step';
  }
}

async function runAnalysis() {
  const areaName = document.getElementById('area-name').value.trim();
  const leafFile = document.getElementById('leaf-file').files[0];
  const soilFile = document.getElementById('soil-file').files[0];
  const stage    = document.getElementById('growth-stage').value;

  if (!areaName) { alert(T('err-loc'));  return; }
  if (!leafFile) { alert(T('err-leaf')); return; }

  document.getElementById('form-section').style.display = 'none';
  document.getElementById('loader').style.display       = 'block';
  setStep(1);

  try {
    const formData = new FormData();
    formData.append('area',   areaName);
    formData.append('leaf_image',  leafFile);
    formData.append('crop_stage', stage);
    if (soilFile) formData.append('soil_report', soilFile);

    setStep(2);
    const resp = await fetch(API_BASE + '/analysis', { 
        method: 'POST', 
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: formData 
    });
    
    if (!resp.ok) throw new Error('API error ' + resp.status);
    const data = await resp.json();
    setStep(4);
    lastAnalysisData = data.record;
    document.getElementById('loader').style.display = 'none';
    renderResults(data.record);
  } catch (err) {
    alert('Error: ' + err.message);
    document.getElementById('form-section').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
  }
}

function renderResults(data) {
  document.getElementById('results').style.display = 'block';
  const nameEl = document.getElementById('disease-card');
  if (nameEl) {
      nameEl.innerHTML = `
        <div class="disease-name">${data.disease_name}</div>
        <div class="severity-badge sev-${data.severity}">${data.severity}</div>
        <div class="confidence-bar"><div class="confidence-fill" style="width:${data.confidence_pct}%"></div></div>
      `;
  }
  
  const list = document.getElementById('rec-list');
  if (list && data.recommendations) {
      list.innerHTML = data.recommendations.map(r => `
        <div class="rec-card">
            <div class="rec-header">
                <div class="rec-name">${r.name}</div>
                <div class="rec-score">${r.cost}</div>
            </div>
        </div>
      `).join('');
  }
}

function resetForm() {
  document.getElementById('results').style.display = 'none';
  document.getElementById('form-section').style.display = 'block';
}
