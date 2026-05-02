import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { DISEASE_PREVALENCE } from '../../lib/agriData';

interface MandalProps {
  id: string;
  name: string;
  path: string;
  zone: 'madanapalle' | 'rayachoti' | 'rajampeta';
  color: string;
  hoverColor: string;
}

export default function RegionalMap({ lang }: { lang: 'te' | 'en' }) {
  const [hoveredMandal, setHoveredMandal] = useState<MandalProps | null>(null);
  const [selectedMandal, setSelectedMandal] = useState<MandalProps | null>(null);

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
                <h4 className="text-3xl font-black text-stone-900">{selectedMandal.name}</h4>
                <p className="text-stone-500 font-medium mt-1">Detailed horticultural tracking for the {selectedMandal.zone} sub-region.</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center p-4 bg-stone-50 rounded-2xl min-w-[120px]">
                  <div className="text-[10px] font-black text-stone-400 uppercase mb-1">Humidity</div>
                  <div className="text-xl font-black text-stone-900">74%</div>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-2xl min-w-[120px]">
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
            {DISEASE_PREVALENCE[selectedMandal.name] && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {Object.entries(DISEASE_PREVALENCE[selectedMandal.name]).map(([disease, prevalence]) => (
                  <div key={disease} className="card-agri p-4 bg-white border border-stone-100 flex flex-col justify-center">
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

