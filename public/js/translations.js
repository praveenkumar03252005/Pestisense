/* ════════════════════════════════════════
   translations.js
   All UI strings in Telugu (te) and
   English (en). Single source of truth.
   Usage: T('key') → string for currentLang
   ════════════════════════════════════════ */

const TR = {

  /* ── ENGLISH ─────────────────────────── */
  en: {
    /* Header / Hero */
    'badge':        'Madanapalle Tomato Belt',
    'hero-tag':     'Soil-Based Advisory Platform',
    'hero-title':   'Right pesticide.<br/><em>Lowest cost.</em> Legally approved.',
    'hero-desc':    'Upload your soil report and diseased leaf — PestiSense fetches live weather data and recommends the safest, cheapest, approved pesticide for your farm.',
    'step-1': 'Upload soil report',
    'step-2': 'Enter village',
    'step-3': 'Diseased leaf photo',
    'step-4': 'Get recommendation',

    /* Knowledge Banner */
    'kb-title': 'Important Information for Farmers',
    'kb-t1a': 'Pesticide takes time to work',
    'kb-t1b': 'Most pesticides work within 3-7 days. You won\'t see instant results — spray once and wait patiently.',
    'kb-t2a': 'Spray only once',
    'kb-t2b': 'If disease persists, wait the full recommended days before asking for another spray or switching product.',
    'kb-t3a': 'Don\'t worry about the percentage',
    'kb-t3b': '75% WP and 50% WP are different formulations — each has its own dose. Follow the dosage shown, not the percentage.',

    /* Nav Tabs */
    'tab-analysis': '🔬 Disease Analysis',
    'tab-soilmap':  '🗺️ Soil Nutrient Map',
    'tab-hotspot':  '🌡️ Disease Hotspot',
    'tab-weather':  '🌤 Weather Forecast',
    'tab-sales':    '💰 Prices & Soil Card',
    'tab-ocr':      '📸 Identify Pesticide',
    'tab-reviews':  '⭐ Farmer Reviews',
    'tab-chat':     '🌿 AI Farmer Assistant',

    /* Form */
    'loc-title':    'Your Location',
    'loc-label':    'Village / Town Name',
    'loc-ph':       'e.g. Madanapalle, Palamaner, Punganur',
    'stage-label':  'Tomato Growth Stage',
    'stage-opt1':   'Seedling / Nursery (0–21 days)',
    'stage-opt2':   'Transplanting (21–35 days)',
    'stage-opt3':   'Vegetative Growth (35–55 days)',
    'stage-opt4':   'Flowering / Fruit Set (55–75 days)',
    'stage-opt5':   'Fruit Development (75–110 days)',
    'stage-opt6':   'Harvest / Late Season (110+ days)',
    'leaf-title':   'Diseased Leaf Photo',
    'leaf-upload':  'Click here or drag your leaf photo',
    'leaf-hint':    'JPG, PNG — clear photo of the most affected leaf',
    'soil-title':   'Soil Health Card',
    'soil-opt':     '(Optional but recommended)',
    'soil-upload':  'Upload Soil Health Card photo or PDF',
    'soil-hint':    'Govt SHC or lab report — improves accuracy',
    'btn-analyze':  'Analyze & Get Recommendations →',

    /* Loader */
    'load-text': 'Analyzing your farm data...',
    'load-s1':   'Fetching live weather for your area',
    'load-s2':   'Detecting disease from leaf image',
    'load-s3':   'Reading soil nutrient values',
    'load-s4':   'Scoring and ranking pesticides',

    /* Results */
    'res-title':         'Analysis Complete',
    'res-sub':           'Your recommendation is ready.',
    'res-timing':        'Spray Timing Advisory',
    'spray-sched-title': 'Spray Schedule — Read and follow in the field',
    'conc-note':         '⚠️ <strong>About the % (percentage):</strong> The percentage in a pesticide name shows the active ingredient strength. A 75% WP and 50% WP work very differently. <strong>When buying, say the product name and check the dose shown below — do NOT buy by percentage alone.</strong>',
    'res-rec':           'Pesticide Recommendations — Ranked by Suitability & Cost',
    'btn-explain':       '🌿 Explain these results in detail (AI)',
    'ai-exp-title':      'AI Explanation',
    'btn-reset':         '← Analyze Another Field',

    /* Dynamic JS labels */
    'lbl-temp':  'Temperature',
    'lbl-hum':   'Humidity',
    'lbl-rain':  'Rainfall',
    'lbl-wind':  'Wind Speed',
    'lbl-soil':  'Soil Moisture',
    'lbl-cond':  'Condition',
    'lbl-disease': 'Detected Disease',
    'lbl-conf':    'Confidence',
    'sev-critical': 'Critical',
    'sev-high':     'High',
    'sev-medium':   'Medium',
    'sev-low':      'Low',
    'sev-none':     'None',
    'no-recs': 'No pesticide recommendations found.',
  },

  /* ── TELUGU ──────────────────────────── */
  te: {
    /* Header / Hero */
    'badge':        'మదనపల్లె టొమాటో బెల్ట్',
    'hero-tag':     'నేల-ఆధారిత సలహా వేదిక',
    'hero-title':   'సరైన పురుగుమందు.<br/><em>తక్కువ ఖర్చు.</em> చట్టబద్ధంగా ఆమోదించబడింది.',
    'hero-desc':    'మీ నేల నివేదిక మరియు రోగగ్రస్త ఆకును అప్‌లోడ్ చేయండి — PestiSense మీ ప్రాంతానికి నేరుగా వాతావరణ డేటా తీసుకుని, మీ పొలానికి సురక్షితమైన, చౌకైన, ఆమోదించబడిన పురుగుమందు సూచిస్తుంది.',
    'step-1': 'నేల నివేదిక అప్‌లోడ్',
    'step-2': 'మీ గ్రామం నమోదు',
    'step-3': 'రోగగ్రస్త ఆకు ఫోటో',
    'step-4': 'సూచన పొందండి',

    /* Nav Tabs */
    'tab-analysis': '🔬 వ్యాధి విశ్లేషణ',
    'tab-soilmap':  '🗺️ నేల పోషక మ్యాప్',
    'tab-hotspot':  '🌡️ వ్యాధి హాట్‌స్పాట్',
    'tab-weather':  '🌤 వాతావరణ అంచనా',
    'tab-sales':    '💰 ధరలు & నేల కార్డు',
    'tab-ocr':      '📸 మందు గుర్తించండి',
    'tab-reviews':  '⭐ రైతుల రివ్యూలు',
    'tab-chat':     '🌿 AI రైతు సహాయకుడు',

    /* Results */
    'res-title':         'విశ్లేషణ పూర్తయింది',
    'res-sub':           'మీ పొలానికి సూచన సిద్ధంగా ఉంది.',
    'lbl-disease': 'గుర్తించిన వ్యాధి',
    'lbl-conf':    'నమ్మకం',
    'sev-critical': 'అత్యంత తీవ్రం',
    'sev-high':     'తీవ్రం',
    'sev-medium':   'మధ్యస్థం',
    'sev-low':      'తక్కువ',
    'sev-none':     'లేదు',
  }
};

/* ── Active language & helper ── */
let currentLang = 'te';

function T(key) {
  return TR[currentLang][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('pestisense_lang', lang); 

  document.getElementById('lb-te').classList.toggle('active', lang === 'te');
  document.getElementById('lb-en').classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-t]').forEach(el => {
    const k = el.getAttribute('data-t');
    if (TR[lang][k]) {
      if (TR[lang][k].includes('<')) el.innerHTML = TR[lang][k];
      else el.textContent = TR[lang][k];
    }
  });

  document.querySelectorAll('[data-t-placeholder]').forEach(el => {
    const k = el.getAttribute('data-t-placeholder');
    if (TR[lang][k]) el.placeholder = TR[lang][k];
  });
}
