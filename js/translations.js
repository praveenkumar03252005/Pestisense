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

    /* Voice */
    'voice-idle':      '',
    'voice-recording': '🔴 Listening... speak now',
    'voice-done':      '✓ Done — check the field',

    /* dynamic JS labels */
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
    'tl-spray':   'Spray Today',
    'tl-spray-d': 'Apply the recommended pesticide in the morning or evening',
    'tl-wait':    'Wait 3-4 Days',
    'tl-wait-d':  'Do NOT spray again. The medicine is working inside the plant even if not visible yet.',
    'tl-check':   'Check on Day 5-7',
    'tl-check-d': 'Look carefully at the leaves. Is the disease spreading or stopping? If stopping — the medicine worked!',
    'tl-next':    'If Disease Continues',
    'tl-next-d':  'Only then consider a second spray. Check with the dealer if you need the same medicine or a different one.',
    'et-title':    'How this pesticide works over time:',
    'et-day1':     'Day 1',
    'et-day1-l':   'Spray applied',
    'et-day3':     'Day 3-4',
    'et-day3-l':   'Starts working in leaves',
    'et-day7':     'Day 7',
    'et-day7-l':   'Full effect visible',
    'patience-note': '🙏 Please be patient — most farmers stop treatment too early. Give the medicine its full time before switching.',
    'cg-title':    'Dosage Guide (Do not buy by % alone)',
    'dt-conc':       'Concentration',
    'dt-dose-acre':  'Dose per Acre',
    'dt-dose-litre': 'Per Litre of Water',
    'dt-water':      'Water Needed',
    'dt-cost':       'Est. Cost/Acre',
    'dt-interval':   'Repeat Every',
    'dt-method':     'Application',
    'dt-available':  'Available At',
    'rsn':           'Why Recommended:',
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

    /* Knowledge Banner */
    'kb-title': 'రైతు అన్నాలకు ముఖ్యమైన సమాచారం',
    'kb-t1a': 'మందు పని చేయడానికి సమయం పడుతుంది',
    'kb-t1b': 'చాలా మందులు 3-7 రోజులలో పని చేస్తాయి. వెంటనే ఫలితం రాదు — ఒక్కసారి మాత్రమే వేసి వేచి ఉండండి.',
    'kb-t2a': 'ఒకే ఒక్కసారి వేయండి',
    'kb-t2b': 'వ్యాధి తగ్గకపోతే వేరే మందు వేయమని సూచించిన రోజులు పూర్తయిన తర్వాతే అడగండి.',
    'kb-t3a': 'శాతం గురించి గందరగోళం వద్దు',
    'kb-t3b': '75% WP అంటే అదే బలం కాదు — ఒక్కో మందు వేరే విధంగా పని చేస్తుంది. మోతాదు చదవండి.',

    /* Nav Tabs */
    'tab-analysis': '🔬 వ్యాధి విశ్లేషణ',
    'tab-soilmap':  '🗺️ నేల పోషక మ్యాప్',
    'tab-hotspot':  '🌡️ వ్యాధి హాట్‌స్పాట్',
    'tab-weather':  '🌤 వాతావరణ అంచనా',
    'tab-sales':    '💰 ధరలు & నేల కార్డు',
    'tab-ocr':      '📸 మందు గుర్తించండి',
    'tab-reviews':  '⭐ రైతుల రివ్యూలు',
    'tab-chat':     '🌿 AI రైతు సహాయకుడు',

    /* Form */
    'loc-title':   'మీ స్థానం',
    'loc-label':   'గ్రామం / పట్టణం పేరు',
    'loc-ph':      'ఉదా: మదనపల్లె, పాలమనేరు, పుంగనూరు',
    'stage-label': 'టొమాటో పెరుగుదల దశ',
    'stage-opt1':  'మొలకదశ / నర్సరీ (0–21 రోజులు)',
    'stage-opt2':  'నాటడం / స్థాపన (21–35 రోజులు)',
    'stage-opt3':  'వృక్షాభివృద్ధి (35–55 రోజులు)',
    'stage-opt4':  'పూత / కాయ తగలడం (55–75 రోజులు)',
    'stage-opt5':  'కాయ పెరుగుదల (75–110 రోజులు)',
    'stage-opt6':  'కోత / చివరి దశ (110+ రోజులు)',
    'leaf-title':  'రోగగ్రస్త ఆకు ఫోటో',
    'leaf-upload': 'ఇక్కడ క్లిక్ చేయండి లేదా ఆకు ఫోటో ఇక్కడ వదలండి',
    'leaf-hint':   'JPG, PNG — అత్యంత ప్రభావిత ఆకు యొక్క స్పష్టమైన ఫోటో తీయండి',
    'soil-title':  'నేల ఆరోగ్య కార్డు',
    'soil-opt':    '(ఐచ్ఛికం కానీ సూచించబడింది)',
    'soil-upload': 'మీ నేల ఆరోగ్య కార్డు ఫోటో లేదా PDF అప్‌లోడ్ చేయండి',
    'soil-hint':   'ప్రభుత్వ SHC లేదా ల్యాబ్ నివేదిక — సూచన ఖచ్చితత్వాన్ని మెరుగుపరుస్తుంది',
    'btn-analyze': 'విశ్లేషించు & పురుగుమందు సూచన పొందండి →',

    /* Loader */
    'load-text': 'మీ వ్యవసాయ డేటా విశ్లేషిస్తోంది...',
    'load-s1':   'మీ ప్రాంతానికి నేరుగా వాతావరణ డేటా తీసుకుంటోంది',
    'load-s2':   'ఆకు చిత్రం నుండి వ్యాధి గుర్తిస్తోంది',
    'load-s3':   'నేల పోషక విలువలు చదువుతోంది',
    'load-s4':   'పురుగుమందులను స్కోర్ చేసి ర్యాంక్ చేస్తోంది',

    /* Results */
    'res-title':         'విశ్లేషణ పూర్తయింది',
    'res-sub':           'మీ పొలానికి సూచన సిద్ధంగా ఉంది.',
    'res-timing':        'పిచికారీ సమయ సూచన',
    'spray-sched-title': 'పిచికారీ వేళాపాళా — ఇది చదివి పొలంలో అమలు చేయండి',
    'conc-note':         '⚠️ <strong>శాతం (%) గురించి గమనించండి:</strong> మందు పేరు తర్వాత వచ్చే శాతం ఆ మందు యొక్క సక్రియ పదార్థం యొక్క మోతాదు. ఒక మందు 75% అయినా మరొకటి 50% అయినా — రెండూ వేర్వేరు మోతాదుకు పని చేస్తాయి. <strong>మందు కొనేటప్పుడు పేరు చెప్పండి — క్రింద చూపిన మోతాదు అనుసరించండి.</strong>',
    'res-rec':           'పురుగుమందు సూచనలు — అనుకూలత & ధర ప్రకారం ర్యాంక్ చేయబడ్డాయి',
    'btn-explain':       '🌿 ఈ ఫలితాలను వివరంగా వివరించండి (AI)',
    'ai-exp-title':      'AI వివరణ',
    'btn-reset':         '← మరో పొలాన్ని విశ్లేషించండి',

    /* Dynamic JS labels */
    'lbl-temp':  'ఉష్ణోగ్రత',
    'lbl-hum':   'తేమ',
    'lbl-rain':  'వర్షపాతం',
    'lbl-wind':  'గాలి వేగం',
    'lbl-soil':  'నేల తేమ',
    'lbl-cond':  'పరిస్థితి',
    'lbl-disease': 'గుర్తించిన వ్యాధి',
    'lbl-conf':    'నమ్మకం',
    'sev-critical': 'అత్యంత తీవ్రం',
    'sev-high':     'తీవ్రం',
    'sev-medium':   'మధ్యస్థం',
    'sev-low':      'తక్కువ',
    'sev-none':     'లేదు',
    'no-recs': 'పురుగుమందు సూచనలు రాలేదు.',
    'tl-spray':   'నేడు పిచికారీ చేయండి',
    'tl-spray-d': 'సూచించిన మందును ఉదయం లేదా సాయంత్రం ఆకుల రెండు వైపులా బాగా పిచికారీ చేయండి.',
    'tl-wait':    '3-4 రోజులు వేచి ఉండండి',
    'tl-wait-d':  'మళ్ళీ పిచికారీ చేయకండి. మందు మొక్క లోపల పని చేస్తోంది — ఆపినా కనిపించకపోయినా.',
    'tl-check':   '5-7 రోజులకు పరీక్షించండి',
    'tl-check-d': 'ఆకులు జాగ్రత్తగా చూడండి. వ్యాధి వ్యాపిస్తోందా లేదా ఆగిపోతోందా? ఆగుతే — మందు పని చేసింది!',
    'tl-next':    'వ్యాధి కొనసాగితే మాత్రమే',
    'tl-next-d':  'అప్పుడు మాత్రమే రెండవ పిచికారీ ఆలోచించండి. అదే మందు వేయాలా వేరే మందు వేయాలా అని డీలర్‌ని అడగండి.',
    'et-title':    'ఈ మందు ఎలా పని చేస్తుందో చూడండి:',
    'et-day1':     '1వ రోజు',
    'et-day1-l':   'పిచికారీ చేయండి',
    'et-day3':     '3-4 రోజులు',
    'et-day3-l':   'ఆకులో పని మొదలవుతుంది',
    'et-day7':     '7వ రోజు',
    'et-day7-l':   'పూర్తి ఫలితం కనిపిస్తుంది',
    'patience-note': '🙏 దయచేసి వేచి ఉండండి — చాలా మంది రైతులు చాలా వేగంగా మందు ఆపేస్తారు. మందు మారే ముందు పూర్తి సమయం ఇవ్వండి.',
    'cg-title':    'మోతాదు మార్గదర్శి (శాతం ఒక్కటి చూసి కొనకండి)',
    'dt-conc':       'సాంద్రత',
    'dt-dose-acre':  'ఎకరానికి మోతాదు',
    'dt-dose-litre': 'లీటరు నీటికి మోతాదు',
    'dt-water':      'నీరు అవసరం',
    'dt-cost':       'ఎకరానికి ఖర్చు',
    'dt-interval':   'ప్రతి ఎన్ని రోజులకు',
    'dt-method':     'వేసే విధానం',
    'dt-available':  'ఎక్కడ దొరుకుతుంది',
    'rsn':           'ఎందుకు సూచించబడింది:',
    'err-loc':       'దయచేసి మీ గ్రామం లేదా పట్టణం పేరు నమోదు చేయండి.',
    'err-leaf':      'దయచేసి రోగగ్రస్త ఆకు ఫోటో అప్‌లోడ్ చేయండి.',
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

  if (lastAnalysisData && document.getElementById('results').style.display !== 'none') {
    renderResults(lastAnalysisData);
  }
}
