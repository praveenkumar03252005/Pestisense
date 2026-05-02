import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import Analysis from './components/features/Analysis';
import AnalysisResult from './components/features/AnalysisResult';
import WeatherForecast from './components/features/WeatherForecast';
import FarmerReviews from './components/features/FarmerReviews';
import IdentifyPesticide from './components/features/IdentifyPesticide';
import { PesticideCatalog } from './components/features/PesticideCatalog';
import AIChatbot from './components/features/AIChatbot';
import RegionalMap from './components/features/RegionalMap';
import AuthModal from './components/layout/AuthModal';
import { translations } from './lib/translations';
import { 
  Stethoscope, 
  Map as MapIcon, 
  Flame, 
  CloudSun, 
  Banknote, 
  Search, 
  Star,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'analysis' | 'soilmap' | 'hotspot' | 'weather' | 'sales' | 'ocr' | 'reviews';

export default function App() {
  const [lang, setLang] = useState<'te' | 'en'>( (localStorage.getItem('lang') as 'te' | 'en') || 'te');
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);
  const [hasSoilReport, setHasSoilReport] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return lastResult ? (
          <AnalysisResult lang={lang} result={lastResult} onReset={() => setLastResult(null)} />
        ) : (
          <Analysis 
            lang={lang} 
            token={token} 
            onResult={(res) => setLastResult(res)} 
            onSoilReport={() => setHasSoilReport(true)}
          />
        );
      case 'weather':
        return <WeatherForecast />;
      case 'reviews':
        return <FarmerReviews />;
      case 'sales':
        return <PesticideCatalog lang={lang} />;
      case 'ocr':
        return <IdentifyPesticide lang={lang} />;
      case 'soilmap':
        return <RegionalMap lang={lang} initialMode="soil" hasReport={hasSoilReport} />;
      case 'hotspot':
        return <RegionalMap lang={lang} initialMode="disease" />;
      default:
        return (
          <div className="card-agri text-center py-20 space-y-4">
            <div className="text-5xl">🛠️</div>
            <h3 className="text-2xl font-black text-stone-800">Feature Coming Soon</h3>
            <p className="text-stone-500">We are working hard to bring this feature to Madanapalle farmers.</p>
          </div>
        );
    }
  };

  const tabs: { id: TabType; icon: any; label: string }[] = [
    { id: 'analysis', icon: <Stethoscope className="w-5 h-5" />, label: t['tab-analysis'] },
    { id: 'soilmap', icon: <MapIcon className="w-5 h-5" />, label: t['tab-soilmap'] },
    { id: 'hotspot', icon: <Flame className="w-5 h-5" />, label: t['tab-hotspot'] },
    { id: 'weather', icon: <CloudSun className="w-5 h-5" />, label: t['tab-weather'] },
    { id: 'sales', icon: <ShoppingBag className="w-5 h-5" />, label: t['tab-sales'] },
    { id: 'ocr', icon: <Search className="w-5 h-5" />, label: t['tab-ocr'] },
    { id: 'reviews', icon: <Star className="w-5 h-5" />, label: t['tab-reviews'] },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-soil-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        lang={lang} 
        setLang={setLang} 
        onLogout={handleLogout} 
        onHistory={() => {}}
        activeTab={activeTab}
      />
      
      {activeTab === 'analysis' && !lastResult && <Hero lang={lang} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-stone-200 flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-agri flex-shrink-0 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="hidden sm:inline">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (lastResult ? '-res' : '-form')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-12 px-4 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xl font-black text-white mb-4">Pesti<span className="text-amber-500">Sense</span></div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2">&copy; 2026 AgriTech for Madanapalle</p>
            <p className="text-sm max-w-md opacity-60">Providing science-based agriculture advisory for the Madanapalle tomato belt. Helping farmers grow more with less cost.</p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 italic text-[11px] leading-relaxed">
            Important: Always read pesticide labels before use. PestiSense uses CIBRC approved data but the final decision rests with the grower. Consult with local agricultural officers before major chemical applications.
          </div>
        </div>
      </footer>
      <AIChatbot lang={lang} />
      <AuthModal lang={lang} onSuccess={handleLoginSuccess} />
    </div>
  );
}
