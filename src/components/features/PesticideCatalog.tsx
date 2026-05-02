import React, { useState, useMemo } from 'react';
import { Search, Filter, Droplets, Target, ShoppingBag, CheckCircle2, AlertCircle, Volume2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FALLBACK_PESTICIDES } from '../../lib/agriData';
import { translations } from '../../lib/translations';

interface PesticideCatalogProps {
  lang: 'te' | 'en';
}

export const PesticideCatalog: React.FC<PesticideCatalogProps> = ({ lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
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
      setSearchTerm(transcript);
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

  const filteredPesticides = useMemo(() => {
    return FALLBACK_PESTICIDES.filter((p) => {
      const matchesSearch = 
        p.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.diseases.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter]);

  const t = translations[lang];

  const categories = [
    { label: t['cat-all'], value: 'All' },
    { label: t['cat-fungicide'], value: 'fungicide' },
    { label: t['cat-insecticide'], value: 'insecticide' },
    { label: t['cat-bactericide'], value: 'bactericide' },
  ];

  const speakPesticide = (p: any) => {
    if (isPlaying === p.id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    const categoryText = lang === 'te' 
      ? (p.category === 'fungicide' ? 'శిలీంద్ర సంహారిణి' : p.category === 'insecticide' ? 'పురుగుల మందు' : 'బాక్టీరియా సంహారిణి') 
      : p.category;
    
    const targetText = lang === 'te' ? `నివారించే వ్యాధులు: ${p.diseases.join(', ')}` : `Targets: ${p.diseases.join(', ')}`;
    const doseText = lang === 'te' ? `మోతాదు: లీటరుకు ${p.dosage_per_liter}` : `Dosage: ${p.dosage_per_liter} per liter`;
    const priceText = lang === 'te' ? `ధర: ${p.exact_pack_price_inr} రూపాయలు` : `Price: ${p.exact_pack_price_inr} rupees`;

    const textToSpeak = `${p.trade_name}. ${categoryText}. ${targetText}. ${doseText}. ${priceText}.`;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-US';
    utterance.onstart = () => setIsPlaying(p.id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-black text-stone-900">
                {lang === 'te' ? 'పురుగుమందుల ధరల జాబితా' : 'Pesticide Catalog'}
                <span className="ml-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  ({FALLBACK_PESTICIDES.length}+ Items)
                </span>
              </h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
              <div className="mt-1">💡</div>
              <p className="text-xs font-bold text-blue-700 leading-relaxed">
                {lang === 'te' 
                  ? 'టొమాటోకు ఉపయోగించే అన్ని ముఖ్యమైన మందుల ధరలు, మోతాదు మరియు అవి దేనికి పనిచేస్తాయో ఇక్కడ చూడవచ్చు.'
                  : 'Check prices, dosages, and target diseases for all essential tomato pesticides available locally.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              placeholder={t['cat-search']}
              className="w-full pl-11 pr-24 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-farm focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                type="button"
                onClick={() => speakText(searchTerm || (lang === 'te' ? 'మందు పేరు నమోదు చేయండి' : 'Enter pesticide name'), 'search-tts')}
                className={`p-1.5 rounded-lg transition-all ${isPlaying === 'search-tts' ? 'bg-green-100 text-green-700' : 'text-stone-300 hover:text-green-700'}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={startListening}
                className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-stone-300 hover:text-green-700'}`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
          <select 
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold outline-none cursor-pointer min-w-[200px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPesticides.map((p) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={p.id}
              className="bg-white border-2 border-stone-100 rounded-2xl p-5 hover:border-green-farm transition-all duration-300 group shadow-sm flex flex-col relative"
            >
              <button 
                onClick={() => speakPesticide(p)}
                className={`absolute right-4 top-4 p-2 rounded-xl transition-all ${isPlaying === p.id ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-stone-50 text-stone-300 hover:text-green-700'}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Category Badge */}
              <div className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 ${
                p.category === 'fungicide' ? 'bg-green-500 text-white' : 
                p.category === 'insecticide' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {lang === 'te' ? (p.category === 'fungicide' ? 'శిలీంద్ర సంహారిణి' : p.category === 'insecticide' ? 'పురుగుల మందు' : 'బాక్టీరియా సంహారిణి') : p.category}
              </div>

              <h4 className="text-xl font-black text-stone-900 group-hover:text-green-farm transition-colors pr-8">{p.trade_name}</h4>
              <p className="text-xs font-bold text-stone-400 mb-4">{p.active_ingredient}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-stone-50 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="text-[9px] font-black text-stone-400 uppercase mb-1">{lang === 'te' ? 'ధర' : 'Pack Price'} ({p.pack_size})</div>
                  <div className="text-lg font-black text-stone-800">₹{p.exact_pack_price_inr}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl flex flex-col items-center justify-center text-center border border-green-100">
                  <div className="text-[9px] font-black text-green-600 uppercase mb-1">{lang === 'te' ? 'ఎకరాకు ఖర్చు' : 'Cost per Acre'}</div>
                  <div className="text-lg font-black text-green-700">₹{p.cost_per_acre_inr}</div>
                </div>
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-stone-400 mt-0.5" />
                  <div className="flex-grow">
                    <span className="text-[10px] font-black text-stone-400 uppercase mr-2">{lang === 'te' ? 'నివారించేవి:' : 'Target:'}</span>
                    <span className="text-xs font-bold text-stone-700">{p.diseases.join(', ')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
                  <div className="flex-grow">
                    <span className="text-[10px] font-black text-stone-400 uppercase mr-2">{lang === 'te' ? 'మోతాదు:' : 'Dosage:'}</span>
                    <span className="text-xs font-bold text-stone-700">{p.dosage_per_liter}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center">
                {p.locally_available ? (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">{lang === 'te' ? 'స్థానికంగా అందుబాటులో ఉంది' : 'Available Locally'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">{lang === 'te' ? 'పరిమితంగా అందుబాటులో ఉంది' : 'Limited Stock'}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPesticides.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
          <p className="text-stone-400 font-bold">No pesticides found matching your search.</p>
        </div>
      )}
    </div>
  );
};
