import React, { useState, useRef } from 'react';
import { Search, Camera, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../../lib/translations';
import { FALLBACK_PESTICIDES } from '../../lib/agriData';

interface IdentifyPesticideProps {
  lang: 'te' | 'en';
}

export default function IdentifyPesticide({ lang }: IdentifyPesticideProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/identify-pesticide', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to identify pesticide.");
      }

      const data = await response.json();
      
      // Enrich with local database info if possible
      const matched = FALLBACK_PESTICIDES.find(p => 
        p.trade_name.toLowerCase().includes(data.name?.toLowerCase()) || 
        p.active_ingredient.toLowerCase().includes(data.active?.toLowerCase())
      );

      if (matched) {
        data.local_info = matched;
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult({ 
        name: "Identification Failed", 
        warning: err.message || "Could not read label. Please ensure the photo is clear and well-lit." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card-agri bg-blue-600 text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
             <Search className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">{t['tab-ocr']}</h2>
            <p className="text-blue-100 font-bold opacity-80">Identify chemicals using AI Vision</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed max-w-2xl">
          Take a clear photo of the pesticide bottle or label. Our AI will identify the active ingredients and check if it's suitable for your current crop stage or disease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-agri flex flex-col items-center justify-center min-h-[350px]">
          <div 
            onClick={() => inputRef.current?.click()}
            className={`w-full flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${file ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:border-blue-400 bg-stone-50'}`}
          >
            <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
            {file ? (
              <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-64 rounded-xl shadow-md border border-stone-200" />
            ) : (
              <>
                <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center text-stone-300 mb-4">
                  <Camera className="w-10 h-10" />
                </div>
                <p className="font-black text-stone-600">Click to upload photo</p>
                <p className="text-[10px] font-black text-stone-400 mt-2 uppercase tracking-widest">Supports JPG, PNG</p>
              </>
            )}
          </div>
          
          <button 
            onClick={handleProcess}
            disabled={!file || loading}
            className="w-full mt-6 py-4 bg-soil-800 text-white rounded-2xl font-black text-lg hover:bg-soil-900 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Identify Now</>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-agri space-y-6 flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-black text-stone-900">Identification Result</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Product</div>
                    <div className="font-bold text-stone-800">{result.name}</div>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Formulation</div>
                    <div className="font-bold text-stone-800">{result.form}</div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Active Ingredient</div>
                  <div className="font-bold text-green-farm text-lg">{result.active}</div>
                </div>

                {result.local_info && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                       <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">Database Match Found</div>
                       <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase">Verified</div>
                    </div>
                    <div className="text-sm font-black text-stone-900">{result.local_info.trade_name}</div>
                    <div className="text-xs text-stone-600 mt-1">Recommended Cost: ₹{result.local_info.cost_per_acre_inr}/Acre</div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-900">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1">AI Recommendation</div>
                    <p className="text-sm font-bold leading-relaxed">{result.usage || "No specific tomato usage information found."}</p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 text-red-900">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1">Safety First</div>
                    <p className="text-xs font-bold leading-relaxed">{result.warning}</p>
                  </div>
                </div>
              </div>
              
              <button onClick={() => {setResult(null); setFile(null);}} className="text-stone-400 text-xs font-black uppercase tracking-widest hover:text-soil-800 self-center">Clear & Try Again</button>
            </motion.div>
          )}
          {!result && !loading && (
            <div className="card-agri flex flex-col items-center justify-center bg-stone-50/50 border-stone-100">
              <div className="text-center space-y-4 opacity-40 grayscale">
                <Search className="w-16 h-16 mx-auto" />
                <p className="font-black text-sm uppercase tracking-widest">Waiting for photo</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="card-agri flex flex-col items-center justify-center">
              <div className="text-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-soil-800 mx-auto" />
                <div>
                  <h3 className="text-xl font-black text-stone-800">Reading Label...</h3>
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mt-2">Connecting to AgriVision AI</p>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
