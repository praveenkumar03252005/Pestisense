import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, MapPin, CheckCircle, XCircle, Search, Volume2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FarmerReviewsProps {
  lang: 'te' | 'en';
}

export default function FarmerReviews({ lang }: FarmerReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ pesticide: 'all', area: '' });
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'te' ? 'te-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFilter({ ...filter, area: transcript });
    };
    recognition.start();
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

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.pesticide !== 'all') params.append('pesticide_id', filter.pesticide);
    if (filter.area) params.append('area', filter.area);
    
    setLoading(true);
    fetch('/api/reviews?' + params.toString())
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const speakReview = (r: any) => {
    if (isPlaying === r._id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    const curedText = r.cured 
      ? (lang === 'te' ? 'వ్యాధి నయమైంది.' : 'Disease cured.')
      : (lang === 'te' ? 'మార్పు లేదు.' : 'No improvement.');
    
    const textToSpeak = `${r.reviewer_name}. ${lang === 'te' ? 'ఊరు' : 'Village'}: ${r.reviewer_village}. ${r.review_text}. ${curedText}`;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-US';
    utterance.onstart = () => setIsPlaying(r._id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{lang === 'te' ? 'పురుగుమందు' : 'Pesticide'}</label>
          <select 
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm"
            value={filter.pesticide}
            onChange={e => setFilter({ ...filter, pesticide: e.target.value })}
          >
            <option value="all">{lang === 'te' ? 'అన్ని మందులు' : 'All Pesticides'}</option>
            <option value="mancozeb">Mancozeb 75% WP</option>
            <option value="carbendazim">Carbendazim 50% WP</option>
            <option value="copper">Copper Oxychloride</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{lang === 'te' ? 'ప్రాంతం / ఊరు' : 'Area / Village'}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={lang === 'te' ? 'ప్రాంతం ద్వారా వెతకండి...' : "Search by area..."}
              className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm"
              value={filter.area}
              onChange={e => setFilter({ ...filter, area: e.target.value })}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button 
                type="button"
                onClick={() => speakText(filter.area || (lang === 'te' ? 'ప్రాంతం నమోదు చేయండి' : 'Enter area'), 'search-tts')}
                className={`p-1.5 rounded-lg transition-all ${isPlaying === 'search-tts' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:text-green-700'}`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={startListening}
                className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-300 hover:text-green-700'}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-400 font-bold uppercase tracking-widest">{lang === 'te' ? 'సమీక్షల కోసం వెతుకుతోంది...' : 'Searching reviews...'}</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-3xl border border-dashed border-gray-200">{lang === 'te' ? 'సమీక్షలు ఏవీ దొరకలేదు' : 'No reviews found for this selection'}</div>
        ) : (
          <AnimatePresence>
            {reviews.map((r, i) => (
              <motion.div 
                key={r._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative"
              >
                <button 
                  onClick={() => speakReview(r)}
                  className={`absolute right-4 top-4 p-2 rounded-xl transition-all ${isPlaying === r._id ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-50 text-gray-300 hover:text-green-700'}`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <div className="flex justify-between items-start pr-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black text-lg">
                      {r.reviewer_name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{r.reviewer_name}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.reviewer_village}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{lang === 'te' ? 'వాడిన మందు' : 'Pesticide Used'}</div>
                  <div className="text-sm font-bold text-green-700">{r.pesticide_name}</div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                  "{r.review_text}"
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.cured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.cured ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.cured ? (lang === 'te' ? 'వ్యాధి నయమైంది' : 'Disease Cured') : (lang === 'te' ? 'మార్పు లేదు' : 'No Improvement')}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
