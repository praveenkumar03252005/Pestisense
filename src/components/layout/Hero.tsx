import React from 'react';
import { translations } from '../../lib/translations';

interface HeroProps {
  lang: 'te' | 'en';
}

export default function Hero({ lang }: HeroProps) {
  const t = translations[lang];
  
  return (
    <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-12 px-4 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
          {t['badge']}
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-[1.1] tracking-tight">
          {t['hero-title'].split('.').map((part: string, i: number) => (
            <React.Fragment key={i}>
              {i === 1 ? <em className="text-amber-300 not-italic">{part}.</em> : part + (i === 1 ? '' : '.')}
              {i < 2 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <p className="text-lg text-green-50/80 max-w-2xl mb-10 font-medium leading-relaxed">
          {t['hero-desc']}
        </p>
        
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <span className="w-6 h-6 flex items-center justify-center bg-amber-500 rounded-full text-[10px] font-black text-white">{num}</span>
              <span className="text-sm font-bold opacity-90">{t[`step-${num}`]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
