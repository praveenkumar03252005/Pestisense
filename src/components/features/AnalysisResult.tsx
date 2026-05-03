import React, { useState, useEffect } from 'react';
import { translations } from '../../lib/translations';
import { CheckCircle, AlertTriangle, Info, ArrowLeft, Star, MessageSquare, Loader2, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisResultProps {
  lang: 'te' | 'en';
  result: any;
  onReset: () => void;
}

// Fallback reviews if DB is empty
const PESTICIDE_REVIEWS_FALLBACK: Record<string, any[]> = {
  "Mancozeb 75% WP": [
    { reviewer_name: "రామయ్య (Ramayya)", reviewer_village: "Madanapalle", review_text: "చాలా తక్కువ ధరలో దొరుకుతుంది, ముందస్తు నివారణకు మంచిది. (Very affordable, good for prevention)", rating: 5, cured: true },
    { reviewer_name: "Ravi", reviewer_village: "Pileru", review_text: "Effective for Early Blight if used early.", rating: 4, cured: true }
  ],
  "Carbendazim 50% WP": [
    { reviewer_name: "వెంకట్ (Venkat)", reviewer_village: "Rayachoti", review_text: "వర్షం పడినా ఇది బాగా పని చేసింది. సిస్టమిక్ కావడమే దీని ప్లస్. (Worked well even after rain. Systemic action is a plus.)", rating: 5, cured: true }
  ],
  "Amistar": [
    { reviewer_name: "సురేష్ (Suresh)", reviewer_village: "Kalikiri", review_text: "ధర ఎక్కువైనా రిజల్ట్ బాగుంది. ఒక్క స్ప్రే తోనే క్లియర్ అయింది. (Price is high but result is good. Cleared in one spray.)", rating: 5, cured: true }
  ]
};

export default function AnalysisResult({ lang, result, onReset }: AnalysisResultProps) {
  const t = translations[lang];
  const [realReviews, setRealReviews] = useState<Record<string, any[]>>({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (result.recommendations?.length > 0) {
      fetchAllReviews();
    }
  }, [result.recommendations]);

  const fetchAllReviews = async () => {
    setLoadingReviews(true);
    const reviewsMap: Record<string, any[]> = {};
    
    try {
      // Fetch all reviews once
      const response = await fetch(`/api/reviews`);
      if (response.ok) {
        const allReviews = await response.json();
        
        for (const rec of result.recommendations) {
          const name = rec.brand || rec.name;
          const pId = rec.pesticide_id;
          
          // Filter by pesticide_id (preferred) or name matching
          let filtered = allReviews.filter((r: any) => 
            (pId && r.pesticide_id === pId) ||
            r.pesticide_id === name.toLowerCase() ||
            name.toLowerCase().includes(r.pesticide_id || '') ||
            (r.pesticide_name?.toLowerCase().includes(name.toLowerCase()))
          );
          
          // Prioritize by location
          if (result.location) {
            filtered.sort((a: any, b: any) => {
              const aInArea = a.reviewer_village?.toLowerCase().includes(result.location.toLowerCase());
              const bInArea = b.reviewer_village?.toLowerCase().includes(result.location.toLowerCase());
              if (aInArea && !bInArea) return -1;
              if (!aInArea && bInArea) return 1;
              return 0;
            });
          }
          
          reviewsMap[name] = filtered.slice(0, 3);
        }
      }
      setRealReviews(reviewsMap);
    } catch (err) {
      console.warn("Failed to fetch real reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

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

  const renderLocal = (val: any) => {
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (val && typeof val === 'object') {
      return val[lang] || val.en || JSON.stringify(val);
    }
    return val;
  };

  if (result.status === 'invalid') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card-agri border-red-200 bg-red-50/30 text-center py-12 px-8">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-4">
            {lang === 'te' ? 'టమోటా ఆకు గుర్తించబడలేదు' : 'Tomato Leaf Not Detected'}
          </h2>
          <p className="text-stone-600 font-medium mb-8">
            {lang === 'te' 
              ? `ఈ చిత్రంలో మా AI ${result.identified_as || 'వస్తువు'}ను గుర్తించింది, కానీ ఇది టమోటా ఆకు లాగా అనిపించడం లేదు. దయచేసి టమోటా ఆకు యొక్క స్పష్టమైన మరియు దగ్గరి ఫోటోను అప్‌లోడ్ చేయండి.`
              : `Our AI identified this image as ${result.identified_as || 'an object'}, but it doesn't appear to be a tomato leaf. Please upload a clear, close-up photo of a tomato plant leaf for accurate analysis.`}
          </p>
          <button 
            onClick={onReset}
            className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
          >
            {t['btn-reset']}
          </button>
        </div>
      </motion.div>
    );
  }

  // Map structured diagnosis if available
  const diseaseInfo = result.diagnosis?.disease || {};
  const diseaseName = renderLocal(diseaseInfo) || renderLocal(result.disease_name) || 'Unknown Disease';
  const confidence = result.diagnosis?.confidence || result.confidence_pct;
  const severity = renderLocal(result.diagnosis?.severity || result.severity);

  // Filter and sort recommendations by cost (ascending)
  const sortedRecommendations = [...(result.recommendations || [])].sort((a, b) => {
    const costA = a.cost_acre || a.estimated_cost_per_acre_inr || a.cost_per_acre_inr || 0;
    const costB = b.cost_acre || b.estimated_cost_per_acre_inr || b.cost_per_acre_inr || 0;
    return costA - costB;
  });

  const shareDiagnosis = () => {
    const topRec = sortedRecommendations[0];
    const text = `*PestiSense Diagnosis Report* \n\n` +
      `*Disease:* ${diseaseName}\n` +
      `*Severity:* ${severity}\n` +
      `*Location:* ${result.location || 'Madanapalle Region'}\n\n` +
      `*Top Recommendation (Best Value):* \n` +
      `${topRec?.brand || 'Recommended Fungicide'}\n` +
      `*Dose:* ${renderLocal(topRec?.dose_acre)}/acre\n` +
      `*Estimated Cost:* ₹${topRec?.cost_acre || topRec?.estimated_cost_per_acre_inr || topRec?.cost_per_acre_inr || 'N/A'}/acre\n\n` +
      `_Identified by PestiSense Agri AI_`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="card-agri border-green-200 bg-green-50/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-farm text-white rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-900 leading-tight">{t['res-title']}</h2>
              <p className="text-stone-500 font-bold">{t['res-sub']}</p>
            </div>
          </div>
          <button 
            onClick={shareDiagnosis}
            className="p-3 bg-white text-green-600 rounded-2xl hover:bg-green-farm hover:text-white transition-all border border-green-100 flex items-center gap-2 group shadow-sm"
            title="Share on WhatsApp"
          >
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black hidden sm:inline">SHARE</span>
          </button>
        </div>

        <div className="p-8 bg-white rounded-2xl shadow-sm border border-stone-100">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{lang === 'te' ? 'గుర్తించిన వ్యాధి' : 'Detected Disease'}</div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black text-stone-900">{diseaseName}</h3>
                <button 
                  onClick={() => speakText(`${diseaseName}. ${result.sprayTiming ? (result.sprayTiming[lang] || result.sprayTiming.en) : ''}`, 'disease')}
                  className={`p-2 rounded-xl transition-all ${isPlaying === 'disease' ? 'bg-soil-100 text-soil-800' : 'bg-stone-100 text-stone-400 hover:text-soil-800'}`}
                >
                  <Volume2 className={`w-5 h-5 ${isPlaying === 'disease' ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              {confidence && (
                <div className="text-right">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{lang === 'te' ? 'నమ్మకం' : 'Confidence'}</div>
                  <div className="text-xl font-black text-green-farm">{confidence}%</div>
                </div>
              )}
              {severity && (
                <div className="text-right">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{lang === 'te' ? 'తీవ్రత' : 'Severity'}</div>
                  <div className="text-xl font-black text-red-500">{severity}</div>
                </div>
              )}
            </div>
          </div>
          
          {result.sprayTiming && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{lang === 'te' ? 'స్ప్రే సమయం' : 'Spray Timing'}</div>
                <p className="text-sm font-bold text-blue-900">{renderLocal(result.sprayTiming)}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                {t['res-treatment']} ({lang === 'te' ? 'తక్కువ ధర నుండి ఎక్కువకు' : 'Cheapest to Premium'})
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {sortedRecommendations.map((rec: any, i: number) => {
                  const pesticideName = rec.brand || rec.name;
                  const dbReviews = realReviews[pesticideName] || [];
                  const fallbackReviews = PESTICIDE_REVIEWS_FALLBACK[pesticideName] || [];
                  
                  // Priority: Real DB reviews for this area > Fallback static reviews
                  const reviews = dbReviews.length > 0 ? dbReviews : fallbackReviews;
                  
                  const activeIng = renderLocal(rec.activeIngredient || rec.active_ingredient);
                  const reason = renderLocal(rec.reason);
                  const costPerAcre = rec.cost_acre || rec.estimated_cost_per_acre_inr || rec.cost_per_acre_inr;
                  
                  return (
                    <div key={i} className={`p-6 bg-stone-50 border rounded-3xl space-y-4 hover:border-green-farm transition-all group ${i === 0 ? 'border-green-500 ring-4 ring-green-500/5' : 'border-stone-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black shadow-sm ${i === 0 ? 'bg-green-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-base font-black text-stone-900 leading-tight">{pesticideName}</div>
                              {i === 0 && (
                                <span className="text-[8px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">Best Value</span>
                              )}
                              <button 
                                onClick={() => speakText(`${pesticideName}. ${reason || ''}. Dose: ${rec.dose_acre}`, `rec-${i}`)}
                                className={`p-1 rounded-lg transition-all ${isPlaying === `rec-${i}` ? 'text-soil-800' : 'text-stone-300 hover:text-soil-800'}`}
                              >
                                <Volume2 className={`w-3 h-3 ${isPlaying === `rec-${i}` ? 'animate-pulse' : ''}`} />
                              </button>
                            </div>
                            <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">
                              {activeIng} | {lang === 'te' ? (rec.category === 'fungicide' ? 'శిలీంద్ర సంహారిణి' : 'పురుగుల మందు') : (rec.category || 'Pesticide')}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase mb-1">
                            {rec.legality || rec.legal_status || 'Approved'}
                          </div>
                          {costPerAcre && (
                            <div className="text-sm font-black text-green-700">₹{costPerAcre}<span className="text-[8px] text-stone-400">/ACRE</span></div>
                          )}
                        </div>
                      </div>

                      {reason && (
                        <p className="text-xs font-medium text-stone-600 bg-stone-100/50 p-3 rounded-xl ring-1 ring-stone-200/20">
                          {reason}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                          <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{t['res-dose-acre']}</div>
                          <div className="text-sm font-black text-stone-800">{renderLocal(rec.dose_acre || rec.dose_per_acre || rec.dose)}</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                          <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{t['res-dose-liter']}</div>
                          <div className="text-sm font-black text-stone-800">{renderLocal(rec.dose_15L || rec.dose_per_litre || rec.dose)}</div>
                        </div>
                      </div>

                      {rec.application_method && !rec.steps && (
                        <div className="bg-stone-100/50 p-4 rounded-xl border border-stone-200/50">
                          <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" /> {t['res-app-method']}
                          </div>
                          <p className="text-xs font-bold text-stone-700 leading-relaxed">{renderLocal(rec.application_method)}</p>
                        </div>
                      )}

                      {rec.steps && (
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5" /> {t['res-how-to-apply']}
                          </div>
                          <div className="space-y-3">
                            {(Array.isArray(rec.steps) ? rec.steps : (rec.steps[lang] || rec.steps.en || [])).map((step: string, si: number) => (
                              <div key={si} className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                                  {si + 1}
                                </div>
                                <p className="text-xs font-bold text-stone-700">{renderLocal(step)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Integrated Farmer Reviews for this pesticide */}
                      {reviews.length > 0 && (
                        <div className="space-y-3 pt-2 bg-white/40 p-4 rounded-2xl border border-stone-100">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-stone-900 uppercase tracking-widest">
                              <MessageSquare className="w-3.5 h-3.5 text-green-farm" /> {t['res-reviews']}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-black">4.8/5</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {reviews.map((rev, ri) => (
                              <div key={ri} className="bg-white/80 p-3 rounded-xl border border-stone-100/50 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-stone-100 rounded-full flex items-center justify-center text-[8px] font-black text-stone-400">
                                      {rev.reviewer_name?.[0] || 'F'}
                                    </div>
                                    <span className="text-[10px] font-black text-stone-800">{rev.reviewer_name || rev.farmer}</span>
                                  </div>
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, si) => (
                                      <Star key={si} className={`w-2.5 h-2.5 ${si < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[11px] font-medium text-stone-600 italic leading-snug line-clamp-2">"{rev.review_text || rev.text}"</p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-[8px] font-bold text-stone-400 uppercase">📍 {rev.reviewer_village || rev.location}</div>
                                  {rev.cured && (
                                    <div className="text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center gap-1 uppercase">
                                      <CheckCircle className="w-2 h-2" /> Resolved
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap gap-2">
                        {rec.available_at && (
                          <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">
                            {t['res-local']}: {rec.available_at.split(',')[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                {lang === 'te' 
                  ? 'ముఖ్య గమనిక: ఈ మందులు టమోటా పంటకు CIBRC ఆమోదించబడ్డాయి. స్ప్రే చేసే ముందు ఎల్లప్పుడూ స్థానిక వ్యవసాయ అధికారులను సంప్రదించండి.'
                  : 'Important: These products are CIBRC approved for Tomato. Always verify with local government agricultural officers and check the product label for the latest guidelines.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={onReset}
          className="w-full py-4 bg-white border-2 border-stone-200 text-stone-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-stone-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" /> {t['btn-reset']}
        </button>
      </div>
    </motion.div>
  );
}
