import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../../lib/translations';

interface AIChatbotProps {
  lang: 'te' | 'en';
}

export default function AIChatbot({ lang }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', text: userMsg }],
          lang
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Service temporarily unavailable.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: err.message || "Service temporarily unavailable. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col border border-stone-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-soil-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm tracking-tight">{t['ai-chat-title']}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-10 px-6 space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-3xl">👨‍🌾</div>
                  <p className="text-stone-500 text-sm font-medium leading-relaxed">{t['ai-welcome']}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${m.role === 'user' ? 'bg-soil-800 text-white rounded-tr-none' : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-soil-800" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
              <input 
                type="text" 
                placeholder={t['ai-chat-ph']}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-soil-800 transition-all font-medium"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-soil-800 text-white rounded-xl flex items-center justify-center hover:bg-soil-900 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-soil-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
}
