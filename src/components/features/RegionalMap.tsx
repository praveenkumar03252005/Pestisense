import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, ArrowUpRight, ShieldCheck, AlertCircle, FlaskConical as Flask, Activity, Beaker, Calendar, CheckCircle, Volume2 } from 'lucide-react';
import { DISEASE_PREVALENCE, getMandalNutrients } from '../../lib/agriData';

interface MandalProps {
  id: string;
  name: string;
  path: string;
  zone: 'madanapalle' | 'rayachoti' | 'rajampeta';
  color: string;
  hoverColor: string;
}

export default function RegionalMap({ lang, initialMode = 'disease', hasReport = false }: { lang: 'te' | 'en', initialMode?: 'disease' | 'soil', hasReport?: boolean }) {
  const [hoveredMandal, setHoveredMandal] = useState<MandalProps | null>(null);
  const [selectedMandal, setSelectedMandal] = useState<MandalProps | null>(null);
  const [mapMode, setMapMode] = useState<'disease' | 'soil'>(initialMode);
  const [nutrientTab, setNutrientTab] = useState<'macro' | 'micro' | 'ratios'>('macro');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const speakText = (text: string, id: string) => {
    if (isPlaying === id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-US';
    utterance.onstart = () => setIsPlaying(id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  const speakNutrient = (title: string, value: string, unit: string, status: string) => {
    const text = lang === 'te' 
      ? `${title}. విలువ ${value} ${unit}. ఇది ${status}.` 
      : `${title}. Value is ${value} ${unit}. It is ${status}.`;
    speakText(text, title);
  };

  const mandals: MandalProps[] = [
    // --- RAYACHOTI HUB (Yellow) ---
    { id: 'galiveedu', name: 'Galiveedu', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 285,120 L 325,125 L 335,160 L 295,160 Z" },
    { id: 'lakkireddipalle', name: 'Lakki Reddi Palle', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 325,125 L 375,135 L 385,170 L 335,160 Z" },
    { id: 'ramapuram', name: 'Rama Puram', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 375,135 L 425,145 L 435,180 L 385,170 Z" },
    { id: 'rayachoti', name: 'Rayachoti', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 315,160 L 385,170 L 395,210 L 325,200 Z" },
    { id: 'chinnamandem', name: 'Chinna Mandem', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 325,200 L 395,210 L 405,250 L 335,240 Z" },
    { id: 'sambepalle', name: 'Sambe Palle', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 395,210 L 455,220 L 465,260 L 405,250 Z" },
    { id: 'gurramkonda', name: 'Gurram Konda', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 295,200 L 325,200 L 335,260 L 305,260 Z" },
    { id: 'kalakada', name: 'Kalakada', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 335,240 L 385,250 L 420,300 L 365,290 Z" },
    { id: 'kambhamvaripalle', name: 'Kambham Vari Palle', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 405,250 L 465,260 L 515,320 L 455,310 Z" },
    { id: 'pileru', name: 'Pileru', zone: 'rayachoti', color: '#facc15', hoverColor: '#fde047', path: "M 455,310 L 515,320 L 485,380 L 425,370 Z" },

    // --- MADANAPALLE HUB (Green) ---
    { id: 'peddamandyam', name: 'Pedda Mandyam', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 245,180 L 305,200 L 315,240 L 255,225 Z" },
    { id: 'thamballapalle', name: 'Thamballapalle', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 185,220 L 245,230 L 255,280 L 195,270 Z" },
    { id: 'mulakalacheruvu', name: 'Mulakala Cheruvu', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 135,260 L 195,270 L 205,320 L 145,310 Z" },
    { id: 'peddathippasamudram', name: 'Pedda Thippa Samudram', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 75,300 L 135,310 L 145,360 L 85,350 Z" },
    { id: 'bkothakota', name: 'B.Kothakota', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 125,360 L 205,370 L 215,430 L 135,410 Z" },
    { id: 'madanapalle', name: 'Madanapalle', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 205,370 L 285,380 L 295,440 L 215,430 Z" },
    { id: 'ramasamudram', name: 'Rama Samudram', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 205,440 L 265,460 L 270,510 L 215,490 Z" },
    { id: 'nimmanapalle', name: 'Nimmanapalle', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 285,380 L 365,390 L 375,440 L 295,440 Z" },
    { id: 'kurabalakota', name: 'Kurabala Kota', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 245,315 L 305,325 L 315,385 L 255,375 Z" },
    { id: 'valmikipuram', name: 'Valmikipuram', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 305,325 L 385,335 L 395,395 L 315,385 Z" },
    { id: 'kalikiri', name: 'Kalikiri', zone: 'madanapalle', color: '#22c55e', hoverColor: '#4ade80', path: "M 385,310 L 445,320 L 455,370 L 395,360 Z" },

    // --- RAJAMPETA HUB (Blue) ---
    { id: 'nandalur', name: 'Nandalur', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 525,30 L 595,40 L 605,80 L 535,70 Z" },
    { id: 'penagalur', name: 'Penagalur', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 595,40 L 675,55 L 690,95 L 610,80 Z" },
    { id: 'rajampeta', name: 'Rajampeta', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 525,80 L 610,95 L 625,155 L 540,140 Z" },
    { id: 'pullampeta', name: 'Pullampeta', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 520,150 L 610,165 L 625,225 L 535,210 Z" },
    { id: 'chitvel', name: 'Chitvel', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 625,105 L 710,120 L 725,180 L 640,165 Z" },
    { id: 'obulavaripalle', name: 'Obula Vari Palle', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 610,185 L 685,200 L 700,260 L 625,245 Z" },
    { id: 'kodur', name: 'Kodur', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 615,260 L 695,275 L 680,335 L 600,320 Z" },
    { id: 'tsundupalle', name: 'Tsundupalle', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 450,195 L 530,210 L 545,270 L 465,255 Z" },
    { id: 'veeraballe', name: 'Veeraballe', zone: 'rajampeta', color: '#0ea5e9', hoverColor: '#38bdf8', path: "M 440,135 L 520,150 L 535,210 L 455,195 Z" },
  ];

  return (
    <div className="space-y-6">
      <div className="card-agri bg-white border-2 border-stone-100 shadow-xl overflow-hidden p-0">
        <div className="bg-stone-900 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-500" />
              {lang === 'te' ? 'అన్నమయ్య జిల్లా - మండలాలు' : 'Annamayya District - Mandal Map'}
            </h3>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
              {lang === 'te' ? 'పూర్తి ప్రాంతీయ మ్యాప్' : 'Full Regional Mandal Breakdown'}
            </p>
          </div>
          <div className="flex bg-stone-800 p-1 rounded-xl">
             <button 
               onClick={() => setMapMode('disease')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === 'disease' ? 'bg-amber-500 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
             >
               {lang === 'te' ? 'వ్యాధి వ్యాప్తి' : 'Disease Prevalence'}
             </button>
             <button 
               onClick={() => setMapMode('soil')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === 'soil' ? 'bg-green-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
             >
               {lang === 'te' ? 'నేల ఆరోగ్యం' : 'Soil Health'}
             </button>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className="text-[10px] font-black uppercase tracking-tighter">Madanapalle Hub</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
               <span className="text-[10px] font-black uppercase tracking-tighter">Rayachoti Hub</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-500"></div>
               <span className="text-[10px] font-black uppercase tracking-tighter">Rajampeta Hub</span>
             </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full bg-stone-100/50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <svg viewBox="0 0 750 550" className="w-full h-full drop-shadow-2xl">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="2" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {mandals.map((m) => (
              <g key={m.id}>
                <motion.path
                  d={m.path}
                  fill={selectedMandal?.id === m.id ? m.hoverColor : m.color}
                  stroke="white"
                  strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: hoveredMandal?.id === m.id ? 1.01 : 1,
                    filter: hoveredMandal?.id === m.id ? 'url(#shadow)' : 'none'
                  }}
                  whileHover={{ scale: 1.015 }}
                  onHoverStart={() => setHoveredMandal(m)}
                  onHoverEnd={() => setHoveredMandal(null)}
                  onClick={() => setSelectedMandal(m)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ strokeLinejoin: 'round' }}
                />
              </g>
            ))}
            
            {/* Small Mandal Labels - Better alignment with paths */}
            <g className="pointer-events-none fill-stone-900 text-[7px] font-black uppercase tracking-tighter" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.5))' }}>
               <text x="305" y="145">Galiveedu</text>
               <text x="355" y="150" textAnchor="middle">LakkiReddi</text>
               <text x="415" y="155" textAnchor="middle">RamaPuram</text>
               <text x="350" y="195" textAnchor="middle">Rayachoti</text>
               <text x="210" y="255">Thamballapalle</text>
               <text x="100" y="325">P.T.Samudram</text>
               <text x="160" y="390">B.Kothakota</text>
               <text x="230" y="415" textAnchor="middle">Madanapalle</text>
               <text x="490" y="240">Veeraballe</text>
               <text x="560" y="60">Nandalur</text>
               <text x="580" y="125" textAnchor="middle">Rajampeta</text>
               <text x="650" y="235" textAnchor="middle">Kodur</text>
            </g>

            {/* Hub Red Dots - Central Locations */}
            <circle cx="350" cy="190" r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
            <circle cx="250" cy="410" r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
            <circle cx="580" cy="120" r="5" fill="#ef4444" stroke="white" strokeWidth="2" />

            {/* Hub Overlay Labels (Professional Style) */}
            <g className="pointer-events-none">
              <rect x="250" y="470" width="130" height="28" fill="white" stroke="black" strokeWidth="1" rx="4" />
              <text x="315" y="489" className="fill-black text-[12px] font-black uppercase" textAnchor="middle">MADANAPALLE</text>
              
              <rect x="580" y="180" width="110" height="28" fill="white" stroke="black" strokeWidth="1" rx="4" />
              <text x="635" y="199" className="fill-black text-[12px] font-black uppercase" textAnchor="middle">RAJAMPETA</text>
              
              <rect x="200" y="80" width="110" height="28" fill="white" stroke="black" strokeWidth="1" rx="4" />
              <text x="255" y="99" className="fill-black text-[12px] font-black uppercase" textAnchor="middle">RAYACHOTI</text>
            </g>
          </svg>

          {/* Floating Info */}
          <AnimatePresence>
            {hoveredMandal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-stone-200 min-w-[200px]"
              >
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{hoveredMandal.zone} Hub</div>
                <h4 className="text-lg font-black text-stone-900">{hoveredMandal.name}</h4>
                <div className="mt-2 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredMandal.color }}></div>
                   <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Active Monitoring</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedMandal ? (
          <div className="md:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-agri flex flex-col md:flex-row justify-between items-center gap-6"
              style={{ borderLeft: `8px solid ${selectedMandal.color}` }}
            >
              <div>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Village Analysis</div>
                <div className="flex items-center gap-3">
                  <h4 className="text-3xl font-black text-stone-900">{selectedMandal.name}</h4>
                  <button 
                    onClick={() => speakText(`${selectedMandal.name}. ${selectedMandal.zone} Hub.`, 'mandal-title')}
                    className={`p-2 rounded-xl transition-all ${isPlaying === 'mandal-title' ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-400 hover:text-orange-700'}`}
                  >
                    <Volume2 className={`w-5 h-5 ${isPlaying === 'mandal-title' ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                <p className="text-stone-500 font-medium mt-1">Detailed horticultural tracking for the {selectedMandal.zone} sub-region.</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center p-4 bg-stone-50 rounded-2xl min-w-[120px] relative group">
                  <button 
                    onClick={() => speakText(`Humidity is 74 percent.`, 'humidity')}
                    className={`absolute right-1 top-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPlaying === 'humidity' ? 'opacity-100 bg-orange-100 text-orange-700' : 'text-stone-300 hover:text-orange-700'}`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <div className="text-[10px] font-black text-stone-400 uppercase mb-1">Humidity</div>
                  <div className="text-xl font-black text-stone-900">74%</div>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-2xl min-w-[120px] relative group">
                  <button 
                    onClick={() => speakText(`Pest Alert is Moderate.`, 'pest-alert')}
                    className={`absolute right-1 top-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPlaying === 'pest-alert' ? 'opacity-100 bg-orange-100 text-orange-700' : 'text-stone-300 hover:text-orange-700'}`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <div className="text-[10px] font-black text-stone-400 uppercase mb-1">Pest Alert</div>
                  <div className="text-xl font-black text-amber-600">Moderate</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMandal(null)}
                className="px-6 py-3 bg-stone-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                Clear
              </button>
            </motion.div>

            {/* Disease Prevalence for Selected Mandal */}
            {mapMode === 'disease' && DISEASE_PREVALENCE[selectedMandal.name] && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {Object.entries(DISEASE_PREVALENCE[selectedMandal.name]).map(([disease, prevalence]) => (
                  <div key={disease} className="card-agri p-4 bg-white border border-stone-100 flex flex-col justify-center shadow-sm relative group">
                    <button 
                      onClick={() => speakText(`${disease}. ${prevalence} percent prevalence.`, `disease-${disease}`)}
                      className={`absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPlaying === `disease-${disease}` ? 'opacity-100 bg-orange-50 text-orange-600' : 'text-stone-300 hover:text-orange-600'}`}
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">{disease}</span>
                       {prevalence > 60 ? <AlertCircle className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-black text-stone-900">{prevalence}%</div>
                      <div className="text-[10px] font-bold text-stone-400 mb-1">PREVALENCE</div>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${prevalence}%` }}
                         className={`h-full ${prevalence > 60 ? 'bg-red-500' : prevalence > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                       />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Soil Health Card Mode */}
            {mapMode === 'soil' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                       {lang === 'te' ? 'స్కానింగ్ తేదీ' : 'Scanned'}: 10/4/2026
                    </span>
                    <span className="mx-2 text-stone-300">|</span>
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-tight">13.5504°N, 78.5012°E</span>
                    {hasReport && selectedMandal.name === 'Madanapalle' && (
                      <>
                        <span className="mx-2 text-stone-300">|</span>
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full ring-1 ring-green-600/20">
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase">Report Active</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
                    {[
                      { id: 'macro', label: lang === 'te' ? 'మాక్రో పోషకాలు' : 'Macro Nutrients' },
                      { id: 'micro', label: lang === 'te' ? 'సూక్ష్మ పోషకాలు' : 'Micro Nutrients' },
                      { id: 'ratios', label: lang === 'te' ? 'నిష్పత్తులు' : 'Ratios' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setNutrientTab(tab.id as any)}
                        className={`flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-black transition-all ${nutrientTab === tab.id ? 'bg-white text-orange-700 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50/30 p-6 rounded-[2rem] border border-orange-100">
                   <h5 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-2">
                     <div className="w-2 h-6 bg-orange-600 rounded-full"></div>
                     {lang === 'te' 
                        ? (nutrientTab === 'macro' ? 'పొలం మాక్రో పోషక పంపిణీ మ్యాప్' : nutrientTab === 'micro' ? 'పొలం మైక్రో పోషక పంపిణీ మ్యాప్' : 'నేల పోషక నిష్పత్తులు') 
                        : (nutrientTab === 'macro' ? 'Field Macro Nutrient Distribution Map' : nutrientTab === 'micro' ? 'Field Micro Nutrient Distribution Map' : 'Soil Nutrient Ratios & Balances')}
                   </h5>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {nutrientTab === 'macro' && [
                        { title: 'Nitrogen', code: 'N', value: getMandalNutrients(selectedMandal.name).nitrogen, unit: 'kg/ha', optimal: '150-280', color: 'bg-red-500' },
                        { title: 'Phosphorus', code: 'P₂O₅', value: getMandalNutrients(selectedMandal.name).phosphorus, unit: 'kg/ha', optimal: '20-45', color: 'bg-red-400' },
                        { title: 'Potassium', code: 'K₂O', value: getMandalNutrients(selectedMandal.name).potassium, unit: 'kg/ha', optimal: '150-300', color: 'bg-red-500' },
                        { title: 'Soil pH', code: 'pH', value: getMandalNutrients(selectedMandal.name).ph, unit: '', optimal: '6-7.5', color: 'bg-amber-500', isPH: true },
                      ].map((nut, idx) => {
                        const status = nut.value < parseFloat(nut.optimal.split('-')[0]) ? (nut.isPH ? (nut.value < 6 ? (lang === 'te' ? 'ఆమ్ల స్వభావం' : 'Acidic') : (lang === 'te' ? 'సాధారణం' : 'Normal')) : (lang === 'te' ? 'తక్కువ' : 'Low')) : (lang === 'te' ? 'సరిపడా' : 'Adequate');
                        return (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden group">
                           <button 
                             onClick={() => speakNutrient(nut.title, nut.value.toFixed(1), nut.unit || '', status)}
                             className={`absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPlaying === nut.title ? 'opacity-100 bg-orange-50 text-orange-600' : 'text-stone-300 hover:text-orange-600'}`}
                           >
                             <Volume2 className="w-3.5 h-3.5" />
                           </button>
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <span className="text-base font-black text-stone-900">{nut.title}</span>
                               <span className="ml-1 text-[10px] font-bold text-stone-400 uppercase">{nut.code}</span>
                             </div>
                             <div className="text-right">
                               <span className="text-2xl font-black text-orange-700">{nut.value.toFixed(1)}</span>
                               <span className="ml-1 text-[10px] font-black text-stone-400 uppercase">{nut.unit}</span>
                             </div>
                           </div>
                           
                           <div className="space-y-2">
                              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (nut.value / (parseFloat(nut.optimal.split('-')[1]) || 10)) * 100)}%` }}
                                  className={`h-full ${nut.color}`}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                <span className={nut.value < parseFloat(nut.optimal.split('-')[0]) ? 'text-red-500' : 'text-stone-400'}>
                                  {nut.isPH ? (nut.value < 6 ? 'Acidic' : nut.value > 7.5 ? 'Alkaline' : 'Normal') : (nut.value < parseFloat(nut.optimal.split('-')[0]) ? 'Low' : 'Adequate')}
                                </span>
                                <span className="text-stone-400">Optimal: {nut.optimal} {nut.unit}</span>
                              </div>
                           </div>
                        </div>
                        );
                      })}

                      {nutrientTab === 'micro' && [
                        { title: 'Iron', code: 'Fe', value: getMandalNutrients(selectedMandal.name).iron, unit: 'ppm', optimal: '4.5-8', color: 'bg-stone-500' },
                        { title: 'Zinc', code: 'Zn', value: getMandalNutrients(selectedMandal.name).zinc, unit: 'ppm', optimal: '0.6-1.5', color: 'bg-stone-400' },
                        { title: 'Manganese', code: 'Mn', value: getMandalNutrients(selectedMandal.name).manganese, unit: 'ppm', optimal: '2.0-5', color: 'bg-stone-500' },
                        { title: 'Copper', code: 'Cu', value: getMandalNutrients(selectedMandal.name).copper, unit: 'ppm', optimal: '0.2-1.0', color: 'bg-stone-400' },
                      ].map((nut, idx) => {
                        const status = nut.value < parseFloat(nut.optimal.split('-')[0]) ? (lang === 'te' ? 'తక్కువ' : 'Slightly Deficient') : (lang === 'te' ? 'సరిపడా' : 'Sufficient');
                        return (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden group">
                           <button 
                             onClick={() => speakNutrient(nut.title, nut.value.toFixed(2), nut.unit, status)}
                             className={`absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPlaying === nut.title ? 'opacity-100 bg-orange-50 text-orange-600' : 'text-stone-300 hover:text-orange-600'}`}
                           >
                             <Volume2 className="w-3.5 h-3.5" />
                           </button>
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <span className="text-base font-black text-stone-900">{nut.title}</span>
                               <span className="ml-1 text-[10px] font-bold text-stone-400 uppercase">{nut.code}</span>
                             </div>
                             <div className="text-right">
                               <span className="text-2xl font-black text-stone-900">{nut.value.toFixed(2)}</span>
                               <span className="ml-1 text-[10px] font-black text-stone-400 uppercase">{nut.unit}</span>
                             </div>
                           </div>
                           
                           <div className="space-y-2">
                              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (nut.value / (parseFloat(nut.optimal.split('-')[1]) || 5)) * 100)}%` }}
                                  className={`h-full ${nut.color}`}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                <span className={nut.value < parseFloat(nut.optimal.split('-')[0]) ? 'text-amber-600' : 'text-green-600'}>
                                  {nut.value < parseFloat(nut.optimal.split('-')[0]) ? 'Slightly Deficient' : 'Sufficient'}
                                </span>
                                <span className="text-stone-400">Optimal: {nut.optimal} {nut.unit}</span>
                              </div>
                           </div>
                        </div>
                        );
                      })}

                      {nutrientTab === 'ratios' && [
                        { title: 'N : K Ratio', code: 'Nitrogen/Potassium', value: getMandalNutrients(selectedMandal.name).nitrogen / getMandalNutrients(selectedMandal.name).potassium, unit: ': 1', optimal: '0.5:1', color: 'bg-indigo-500' },
                        { title: 'Ca : Mg Ratio', code: 'Calcium/Magnesium', value: getMandalNutrients(selectedMandal.name).calcium / getMandalNutrients(selectedMandal.name).magnesium, unit: ': 1', optimal: '3:1', color: 'bg-indigo-400' },
                      ].map((nut, idx) => {
                        const status = Math.abs(nut.value - parseFloat(nut.optimal)) > 0.5 ? (lang === 'te' ? 'అసమతుల్యత' : 'Imbalanced') : (lang === 'te' ? 'సమతుల్యత' : 'Balanced');
                        return (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden group">
                           <button 
                             onClick={() => speakNutrient(nut.title, nut.value.toFixed(2), nut.unit, status)}
                             className={`absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPlaying === nut.title ? 'opacity-100 bg-orange-50 text-orange-600' : 'text-stone-300 hover:text-orange-600'}`}
                           >
                             <Volume2 className="w-3.5 h-3.5" />
                           </button>
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <span className="text-base font-black text-stone-900">{nut.title}</span>
                               <span className="ml-1 text-[8px] font-bold text-stone-400 uppercase block">{nut.code}</span>
                             </div>
                             <div className="text-right">
                               <span className="text-2xl font-black text-indigo-700">{nut.value.toFixed(2)}</span>
                               <span className="ml-1 text-[10px] font-black text-stone-400 uppercase">{nut.unit}</span>
                             </div>
                           </div>
                           
                           <div className="space-y-2">
                              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (nut.value / (parseFloat(nut.optimal) * 2)) * 100)}%` }}
                                  className={`h-full ${nut.color}`}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                <span className={Math.abs(nut.value - parseFloat(nut.optimal)) > 0.5 ? 'text-amber-600' : 'text-green-600'}>
                                  {Math.abs(nut.value - parseFloat(nut.optimal)) > 0.5 ? 'Imbalanced' : 'Balanced'}
                                </span>
                                <span className="text-stone-400">Target: {nut.optimal}</span>
                              </div>
                           </div>
                        </div>
                        );
                      })}
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="md:col-span-3 card-agri bg-stone-50 border-dashed border-stone-200 text-center py-10">
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Select your mandal on the map for local data</p>
          </div>
        )}
      </div>
    </div>
  );
}

