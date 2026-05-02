import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Github, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  onSuccess: (token: string, user: any) => void;
  lang: 'te' | 'en';
}

export default function AuthModal({ onSuccess, lang }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-auth', handleOpen);
    return () => window.removeEventListener('open-auth', handleOpen);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, user } = event.data;
        onSuccess(token, user);
        setIsOpen(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (data.url) {
        window.open(data.url, 'Google Auth', 'width=500,height=600');
      }
    } catch (err) {
      setError('Failed to initiate Google login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.token, data.user);
        setIsOpen(false);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
          >
            <div className="flex border-b border-stone-100">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${mode === 'login' ? 'text-green-700 border-b-2 border-green-700 bg-white' : 'text-stone-400 bg-stone-50 hover:text-stone-600'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${mode === 'signup' ? 'text-green-700 border-b-2 border-green-700 bg-white' : 'text-stone-400 bg-stone-50 hover:text-stone-600'}`}
              >
                Sign Up
              </button>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-stone-900 mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Join PestiSense'}
                </h2>
                <p className="text-sm text-stone-500 font-medium">
                  {mode === 'login' 
                    ? 'Sign in to access your farm analysis history' 
                    : 'Create an account to save your farm data'}
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-xl font-bold text-sm text-stone-700 hover:bg-stone-50 transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-stone-400 font-bold tracking-widest">Or email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input 
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-green-600 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="email"
                      placeholder="Email Address"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-green-600 outline-none transition-all"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      placeholder="Password"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-green-600 outline-none transition-all"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">
                      {error}
                    </p>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-soil-800 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-soil-900 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
              <p className="text-sm text-stone-500">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 font-black text-green-700 hover:underline"
                >
                  {mode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
