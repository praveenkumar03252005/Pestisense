import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Stethoscope, FlaskConical, CheckCircle, Loader2, Info, Search, ShieldCheck, Microscope, Database, FileText, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../../lib/translations';
import { analyzeLeaf } from '../../services/geminiService';
import HowToUse from './HowToUse';

const ANALYSIS_STEPS = [
  { icon: Camera, en: "Uploading high-resolution image...", te: "చిత్రం అప్‌లోడ్ అవుతోంది..." },
  { icon: Microscope, en: "Analyzing structural foliage patterns...", te: "ఆకు నిర్మాణాన్ని విశ్లేషిస్తోంది..." },
  { icon: Search, en: "Identifying crop variety & health index...", te: "పంట రకాన్ని మరియు ఆరోగ్య స్థితిని గుర్తిస్తోంది..." },
  { icon: Database, en: "Scanning global plant pathology database...", te: "వ్యాధి డేటాబేస్‌ను పరిశీలిస్తోంది..." },
  { icon: ShieldCheck, en: "Cross-referencing with CIBRC guidelines...", te: "CIBRC మార్గదర్శకాలతో సరిపోలుస్తోంది..." },
  { icon: FileText, en: "Finalizing diagnostic report...", te: "తుది నివేదికను సిద్ధం చేస్తోంది..." }
];

interface AnalysisProps {
  lang: 'te' | 'en';
  token: string | null;
  onResult: (result: any) => void;
  onSoilReport: () => void;
}

export default function Analysis({ lang, token, onResult, onSoilReport }: AnalysisProps) {
  const t = translations[lang];
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({ area: '', crop_stage: 'flowering' });
  const [leafFile, setLeafFile] = useState<File | null>(null);
  const [soilFile, setSoilFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const leafInputRef = useRef<HTMLInputElement>(null);
  const soilInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep(prev => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'te' ? 'te-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, area: transcript }));
    };
    recognition.start();
  };

  const runAnalysis = async () => {
    if (!leafFile) return;
    setAnalyzing(true);
    
    if (soilFile) {
      onSoilReport();
    }
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(leafFile);
      const base64Image = await base64Promise;

      const aiResult = await analyzeLeaf(base64Image, leafFile.type, form.area, form.crop_stage);
      
      // Artificial delay to let user see the steps if AI is too fast
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Prepare final result with weather mock (matching backend behavior)
      const weather = {
        temp: 29 + Math.floor(Math.random() * 5),
        humidity: 60 + Math.floor(Math.random() * 10),
        rainChance: Math.floor(Math.random() * 30),
        soilMoisture: 40 + Math.floor(Math.random() * 20)
      };

      const finalResult = {
        location: form.area,
        growthStage: form.crop_stage,
        is_tomato: aiResult.is_tomato,
        identified_as: aiResult.identified_as,
        diagnosis: {
          disease: aiResult.disease,
          severity: aiResult.severity,
          confidence: aiResult.confidence
        },
        weather,
        sprayTiming: aiResult.sprayTiming || {
          en: "Safe to spray today. Ideal window: 4:00 PM – 6:30 PM.",
          te: "ఈరోజు పిచికారీ చేయడానికి అనువైన సమయం. సాయంత్రం 4:00 - 6:30 గంటల మధ్య పిచికారీ చేయండి."
        },
        recommendations: aiResult.recommendations,
        analyzedAt: new Date().toISOString()
      };

      if (!aiResult.is_tomato) {
        onResult({ ...finalResult, status: 'invalid' });
        return;
      }

      if (token) {
        try {
          await fetch('/api/analysis/save', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalResult)
          });
        } catch (saveErr) {
          console.warn("Failed to save to history, but analysis succeeded:", saveErr);
        }
      }

      onResult(finalResult);
    } catch (err: any) {
      console.error('Analysis Error:', err);
      alert(err.message || 'Connection error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* How to Use Guide */}
      <HowToUse lang={lang} />

      {/* Knowledge Banner */}
      <div className="bg-gradient-to-r from-green-farm to-green-800 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-amber-300" />
          <h3 className="font-black text-lg">{t['kb-title']}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(num => (
            <div key={num} className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <strong className="block text-amber-200 text-xs uppercase tracking-widest mb-1">{t[`kb-t${num}a`]}</strong>
              <p className="text-sm text-green-50/90 leading-relaxed">{t[`kb-t${num}b`]}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {analyzing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-agri p-12 text-center space-y-8"
          >
            <div className="relative w-32 h-32 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-green-farm rounded-full"
              />
              <div className="absolute inset-2 border-4 border-stone-100 rounded-full flex items-center justify-center bg-white shadow-inner">
                {React.createElement(ANALYSIS_STEPS[currentStep].icon, { className: "w-10 h-10 text-green-farm animate-pulse" })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-stone-900">
                {ANALYSIS_STEPS[currentStep][lang]}
              </h3>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                {lang === 'te' ? 'దయచేసి వేచి ఉండండి...' : 'PLEASE WAIT...'} STEP {currentStep + 1} OF 6
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {ANALYSIS_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-500 ${i <= currentStep ? 'w-8 bg-green-farm' : 'w-2 bg-stone-100'}`}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="card-agri space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-soil-800" />
                  {t['loc-title']}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t['loc-title']}</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder={t['loc-ph']}
                        className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-soil-800 outline-none transition-all font-bold"
                        value={form.area}
                        onChange={e => setForm({ ...form, area: e.target.value })}
                      />
                      <button 
                        onClick={toggleVoice}
                        className={`absolute right-2 top-1.5 p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-stone-400 hover:text-soil-800'}`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t['stage-label']}</label>
                    <select 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-soil-800 outline-none transition-all font-bold"
                      value={form.crop_stage}
                      onChange={e => setForm({ ...form, crop_stage: e.target.value })}
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={['seedling','transplant','vegetative','flowering','fruiting','harvest'][num-1]}>
                          {t[`stage-opt${num}`]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card-agri">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  {t['soil-title']}
                </h3>
                <div 
                  onClick={() => soilInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${soilFile ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:border-blue-400 bg-stone-50'}`}
                >
                  <input type="file" ref={soilInputRef} className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setSoilFile(file);
                  }} />
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm font-bold text-stone-700">{soilFile ? soilFile.name : t['soil-upload']}</p>
                  <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-wider">{t['soil-hint']}</p>
                </div>
              </div>
            </div>

            <div className="card-agri flex flex-col">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Stethoscope className="w-5 h-5 text-green-farm" />
                {t['leaf-title']}
              </h3>
              <div 
                onClick={() => leafInputRef.current?.click()}
                className={`flex-1 min-h-[250px] border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${leafFile ? 'border-green-farm bg-green-50' : 'border-stone-200 hover:border-green-farm bg-stone-50'}`}
              >
                <input type="file" ref={leafInputRef} className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setLeafFile(file);
                }} />
                {leafFile ? (
                  <img src={URL.createObjectURL(leafFile)} alt="Preview" className="max-h-48 rounded-xl border border-stone-200 shadow-sm" />
                ) : (
                  <>
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-sm font-bold text-stone-700">{t['leaf-upload']}</p>
                    <p className="text-[10px] font-bold text-stone-400 mt-2 uppercase tracking-widest">{t['leaf-hint']}</p>
                  </>
                )}
              </div>
              <button 
                onClick={runAnalysis}
                disabled={!leafFile || analyzing}
                className="w-full mt-6 py-4 bg-soil-800 text-white rounded-2xl font-black text-lg hover:bg-soil-900 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <><CheckCircle className="w-6 h-6" /> {t['btn-analyze']}</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

