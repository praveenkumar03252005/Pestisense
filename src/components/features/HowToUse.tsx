import React from 'react';
import { translations } from '../../lib/translations';
import { motion } from 'motion/react';
import { Info, Image, MapPin, ClipboardCheck, Activity } from 'lucide-react';

interface HowToUseProps {
  lang: 'te' | 'en';
}

export default function HowToUse({ lang }: HowToUseProps) {
  const t = translations[lang];

  const steps = [
    { id: 1, icon: <Activity className="w-6 h-6 text-blue-500" />, title: t['how-to-s1'], desc: t['how-to-s1-desc'] },
    { id: 2, icon: <ClipboardCheck className="w-6 h-6 text-green-500" />, title: t['how-to-s2'], desc: t['how-to-s2-desc'] },
    { id: 3, icon: <MapPin className="w-6 h-6 text-red-500" />, title: t['how-to-s3'], desc: t['how-to-s3-desc'] },
    { id: 4, icon: <Image className="w-6 h-6 text-purple-500" />, title: t['how-to-s4'], desc: t['how-to-s4-desc'] },
    { id: 5, icon: <Info className="w-6 h-6 text-amber-500" />, title: t['how-to-s5'], desc: t['how-to-s5-desc'] },
  ];

  return (
    <div id="how-to-guide" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-soil-100 rounded-2xl">
          <Info className="w-6 h-6 text-soil-800" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">{t['how-to-title']}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl space-y-3 relative overflow-hidden h-full"
          >
            <div className="p-3 bg-white rounded-xl shadow-sm z-10">
              {step.icon}
            </div>
            <h3 className="font-bold text-sm text-gray-900 z-10">{step.title}</h3>
            <p className="text-xs text-gray-500 font-medium z-10">{step.desc}</p>
            
            {/* Step Number Background */}
            <div className="absolute -right-2 -bottom-4 text-7xl font-black text-gray-200/40 select-none">
              {step.id}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
