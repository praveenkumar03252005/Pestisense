import React, { useState, useRef } from 'react';
import { Camera, MapPin, Stethoscope, FlaskConical, CheckCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../../lib/translations';
import { analyzeLeaf } from '../../services/geminiService';

interface AnalysisProps {
  lang: 'te' | 'en';
  token: string | null;
  onResult: (result: any) => void;
  onSoilReport: () => void;
}

export default function Analysis({ lang, token, onResult, onSoilReport }: AnalysisProps) {
  const t = translations[lang];
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({ area: '', crop_stage: 'flowering' });
  const [leafFile, setLeafFile] = useState<File | null>(null);
  const [soilFile, setSoilFile] = useState<File | null>(null);
  const leafInputRef = useRef<HTMLInputElement>(null);
  const soilInputRef = useRef<HTMLInputElement>(null);

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
        // We still pass it to Result so it can show a proper "Invalid Image" page
        onResult({ ...finalResult, status: 'invalid' });
        return;
      }

      // Save to history if logged in
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card-agri space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-soil-800" />
              {t['loc-title']}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t['loc-title']}</label>
                <input 
                  type="text" 
                  placeholder={t['loc-ph']}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-soil-800 outline-none transition-all font-bold"
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                />
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
              <input type="file" ref={soilInputRef} className="hidden" onChange={e => e.target.files?.[0] && setSoilFile(e.target.files[0])} />
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
            <input type="file" ref={leafInputRef} className="hidden" onChange={e => e.target.files?.[0] && setLeafFile(e.target.files[0])} />
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
      </div>
    </div>
  );
}
