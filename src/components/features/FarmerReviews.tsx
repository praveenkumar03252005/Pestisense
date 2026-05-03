import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, MapPin, CheckCircle, XCircle, Search, Volume2, Mic, Plus, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FALLBACK_PESTICIDES } from '../../lib/agriData';

interface FarmerReviewsProps {
  lang: 'te' | 'en';
}

export default function FarmerReviews({ lang }: FarmerReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ pesticide: 'all', area: '' });
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newReview, setNewReview] = useState({
    reviewer_name: '',
    reviewer_village: '',
    pesticide_id: '',
    rating: 5,
    review_text: '',
    cured: true
  });

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

  const fetchReviews = () => {
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
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.reviewer_name || !newReview.pesticide_id || !newReview.review_text) {
      alert(lang === 'te' ? 'దయచేసి అన్ని వివరాలు నింపండి' : 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const pData = FALLBACK_PESTICIDES.find(p => p.id === newReview.pesticide_id);
      const payload = {
        ...newReview,
        pesticide_name: pData?.trade_name || newReview.pesticide_id
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddForm(false);
        setNewReview({
          reviewer_name: '',
          reviewer_village: '',
          pesticide_id: '',
          rating: 5,
          review_text: '',
          cured: true
        });
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Header with Search and Add Toggle */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-soil-50 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-soil-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-soil-900 tracking-tight">{lang === 'te' ? 'రైతు సమీక్షలు' : 'Farmer Reviews'}</h2>
              <p className="text-xs font-bold text-soil-400 uppercase tracking-widest">{lang === 'te' ? 'నిజమైన అనుభవాలు' : 'Real-world Efficacy'}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${showAddForm ? 'bg-red-50 text-red-600' : 'bg-soil-900 text-white hover:bg-soil-800'}`}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? (lang === 'te' ? 'రద్దు చేయి' : 'Cancel') : (lang === 'te' ? 'సమీక్ష రాయండి' : 'Write a Review')}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmitReview} className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block ml-1">
                      {lang === 'te' ? 'మీ పేరు' : 'Your Name'}
                    </label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-soil-500 font-bold text-sm"
                      placeholder={lang === 'te' ? 'ఉదా: రాము' : 'e.g., Ramu'}
                      value={newReview.reviewer_name}
                      onChange={e => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block ml-1">
                      {lang === 'te' ? 'ప్రాంతం / ఊరు' : 'Your Village'}
                    </label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-soil-500 font-bold text-sm"
                      placeholder={lang === 'te' ? 'ఉదా: మదనపల్లె' : 'e.g., Madanapalle'}
                      value={newReview.reviewer_village}
                      onChange={e => setNewReview({ ...newReview, reviewer_village: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block ml-1">
                      {lang === 'te' ? 'పురుగుమందు' : 'Pesticide'}
                    </label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-soil-500 font-bold text-sm"
                      value={newReview.pesticide_id}
                      onChange={e => setNewReview({ ...newReview, pesticide_id: e.target.value })}
                    >
                      <option value="">{lang === 'te' ? 'మందును ఎంచుకోండి' : 'Select Pesticide'}</option>
                      {FALLBACK_PESTICIDES.map(p => (
                        <option key={p.id} value={p.id}>{p.trade_name} ({p.active_ingredient})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block ml-1">
                      {lang === 'te' ? 'రేటింగ్' : 'Rating'}
                    </label>
                    <div className="flex items-center gap-2 px-2 py-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star className={`w-6 h-6 ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block ml-1">
                    {lang === 'te' ? 'మీ అనుభవం' : 'Your Review'}
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-soil-500 font-bold text-sm min-h-[100px]"
                    placeholder={lang === 'te' ? 'ఈ మందు ఎలా పనిచేసింది?' : 'How did this pesticide perform?'}
                    value={newReview.review_text}
                    onChange={e => setNewReview({ ...newReview, review_text: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-6 p-4 bg-white rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    {lang === 'te' ? 'వ్యాధి తగ్గిందా?' : 'Was it effective?'}
                  </span>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewReview({ ...newReview, cured: true })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${newReview.cured ? 'bg-green-100 text-green-700' : 'text-stone-400 hover:bg-stone-50'}`}
                    >
                      <CheckCircle className="w-4 h-4" /> {lang === 'te' ? 'అవును' : 'Yes'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewReview({ ...newReview, cured: false })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${!newReview.cured ? 'bg-red-100 text-red-700' : 'text-stone-400 hover:bg-stone-50'}`}
                    >
                      <XCircle className="w-4 h-4" /> {lang === 'te' ? 'లేదు' : 'No'}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-soil-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-soil-800 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  {isSubmitting ? (lang === 'te' ? 'పంపిస్తోంది...' : 'Submitting...') : (lang === 'te' ? 'సమీక్షను పంపండి' : 'Post Review')}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-4 items-end pt-4 border-t border-gray-50">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{lang === 'te' ? 'పురుగుమందు ద్వారా వెతకండి' : 'Filter by Pesticide'}</label>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm"
              value={filter.pesticide}
              onChange={e => setFilter({ ...filter, pesticide: e.target.value })}
            >
              <option value="all">{lang === 'te' ? 'అన్ని మందులు' : 'All Pesticides'}</option>
              {FALLBACK_PESTICIDES.map(p => (
                <option key={p.id} value={p.id}>{p.trade_name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{lang === 'te' ? 'ప్రాంతం / ఊరు ద్వారా వెతకండి' : 'Filter by Area / Village'}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={lang === 'te' ? 'ప్రాంతం ద్వారా వెతకండి...' : "Search by village..."}
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
                layout
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-20" />
                <button 
                  onClick={() => speakReview(r)}
                  className={`absolute right-4 top-4 z-10 p-2 rounded-xl transition-all ${isPlaying === r._id ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-50 text-gray-300 hover:text-green-700'}`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <div className="flex justify-between items-start pr-12 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-soil-100 rounded-full flex items-center justify-center text-soil-700 font-black text-lg">
                      {r.reviewer_name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{r.reviewer_name}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-soil-500" /> {r.reviewer_village}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{lang === 'te' ? 'వాడిన మందు' : 'Pesticide Used'}</div>
                  <div className="text-sm font-black text-soil-800">{r.pesticide_name}</div>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed font-medium italic relative">
                  "{r.review_text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-50 mt-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.cured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.cured ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.cured ? (lang === 'te' ? 'వ్యాధి నయమైంది' : 'Disease Cured') : (lang === 'te' ? 'మార్పు లేదు' : 'No Improvement')}
                  </div>
                  <span className="text-[10px] font-bold text-stone-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
