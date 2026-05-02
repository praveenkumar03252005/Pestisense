/* ════════════════════════════════════════
   analysis.js
   Handles: File previews, API calls,
   Loader steps, and Result rendering.
   ════════════════════════════════════════ */

let lastAnalysisData = null;

const inputLeaf = document.getElementById('leaf-upload-input');
const previewLeaf = document.getElementById('leaf-preview');

inputLeaf.onchange = () => {
  const file = inputLeaf.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      previewLeaf.src = e.target.result;
      previewLeaf.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
};

/* ── SET LOADER STEP STATUS ── */
function setStep(stepId, status) {
  const el = document.querySelector(`[data-step="${stepId}"]`);
  if (!el) return;
  el.classList.remove('active', 'done');
  if (status === 'active') el.classList.add('active');
  if (status === 'done') el.classList.add('done');
}

/* ── MAIN ANALYSIS FLOW ── */
async function runAnalysis() {
  const location = document.getElementById('loc-input').value.trim();
  const growthStage = document.getElementById('stage-select').value;
  const leafImage = inputLeaf.files[0];

  if (!location) return alert(T('err-loc'));
  if (!leafImage) return alert(T('err-leaf'));

  const formWrap = document.getElementById('analysis-form-wrap');
  const loader = document.getElementById('loader');
  const results = document.getElementById('results');

  formWrap.style.display = 'none';
  loader.style.display = 'block';
  results.style.display = 'none';

  try {
    setStep('s1', 'active');
    await new Promise(r => setTimeout(r, 800));
    setStep('s1', 'done'); setStep('s2', 'active');

    await new Promise(r => setTimeout(r, 1200));
    setStep('s2', 'done'); setStep('s3', 'active');

    await new Promise(r => setTimeout(r, 900));
    setStep('s3', 'done'); setStep('s4', 'active');

    const formData = new FormData();
    formData.append('location', location);
    formData.append('growthStage', growthStage);
    formData.append('leaf_image', leafImage);

    const soilFile = document.getElementById('soil-upload-input').files[0];
    if (soilFile) formData.append('soil_report', soilFile);

    const token = localStorage.getItem('pestisense_token');

    const res = await fetch(`${API_BASE}/analysis`, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!res.ok) throw new Error('Analysis failed server-side');

    const data = await res.json();
    lastAnalysisData = data;

    await new Promise(r => setTimeout(r, 400));
    setStep('s4', 'done');

    loader.style.display = 'none';
    renderResults(data);
    results.style.display = 'block';

    if (token) fetchHistory();

  } catch (err) {
    console.error(err);
    alert('Something went wrong during analysis. Please try again.');
    resetAnalysis();
  }
}

/* ── RENDER RESULTS VIEW ── */
function renderResults(data) {
  const container = document.getElementById('results-content');
  container.innerHTML = '';

  const weatherHtml = `
    <div class="weather-strip">
      <div class="weather-item"><div class="val">${data.weather.temp}°C</div><div class="lbl">${T('lbl-temp')}</div></div>
      <div class="weather-item"><div class="val">${data.weather.humidity}%</div><div class="lbl">${T('lbl-hum')}</div></div>
      <div class="weather-item"><div class="val">${data.weather.rainChance}%</div><div class="lbl">${T('lbl-rain')}</div></div>
      <div class="weather-item"><div class="val">${data.weather.soilMoisture}%</div><div class="lbl">${T('lbl-soil')}</div></div>
    </div>
  `;

  const timingHtml = `
    <div class="timing-box">
      <div class="timing-icon">🕒</div>
      <div>
        <div class="timing-title">${T('res-timing')}</div>
        <div class="timing-text">${data.sprayTiming[currentLang]}</div>
      </div>
    </div>
  `;

  const diseaseHtml = `
    <div class="disease-card">
      <div class="disease-header">
        <div>
          <div class="disease-name">${data.diagnosis.disease[currentLang]}</div>
          <div class="lbl-sm">${T('lbl-disease')}</div>
        </div>
        <div class="severity-badge sev-${data.diagnosis.severity.toLowerCase()}">${T('sev-' + data.diagnosis.severity.toLowerCase())}</div>
      </div>
      <div class="confidence-bar"><div class="confidence-fill" style="width:${data.diagnosis.confidence}%"></div></div>
      <div class="lbl-sm">${T('lbl-conf')}: ${data.diagnosis.confidence}%</div>
    </div>

    <div class="spray-timeline">
      <div class="spray-timeline-title">📍 ${T('spray-sched-title')}</div>
      <div class="timeline-steps">
        <div class="timeline-step">
          <div class="timeline-dot td-spray">1</div>
          <div class="timeline-content">
            <div class="timeline-label">${T('tl-spray')}</div>
            <div class="timeline-desc">${T('tl-spray-d')}</div>
          </div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-step">
          <div class="timeline-dot td-wait">2</div>
          <div class="timeline-content">
            <div class="timeline-label">${T('tl-wait')}</div>
            <div class="timeline-desc">${T('tl-wait-d')}</div>
          </div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-step">
          <div class="timeline-dot td-check">3</div>
          <div class="timeline-content">
            <div class="timeline-label">${T('tl-check')}</div>
            <div class="timeline-desc">${T('tl-check-d')}</div>
          </div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-step">
          <div class="timeline-dot td-next">4</div>
          <div class="timeline-content">
            <div class="timeline-label">${T('tl-next')}</div>
            <div class="timeline-desc">${T('tl-next-d')}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="conc-note-box">${T('conc-note')}</div>

    <h3 style="margin:25px 0 15px; font-weight:700;">${T('res-rec')}</h3>
  `;

  const rankingHtml = renderSmartRanking(data.recommendations);

  container.innerHTML = weatherHtml + timingHtml + diseaseHtml + rankingHtml;
}

function toggleRec(card) {
  const body = card.querySelector('.rec-body');
  body.classList.toggle('open');
}

function resetAnalysis() {
  document.getElementById('analysis-form-wrap').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('loader').style.display = 'none';
  document.getElementById('loc-input').value = '';
  document.getElementById('leaf-upload-input').value = '';
  document.getElementById('soil-upload-input').value = '';
  previewLeaf.style.display = 'none';
  previewLeaf.src = '';

  document.querySelectorAll('.loader-step').forEach(s => s.classList.remove('active', 'done'));
}
