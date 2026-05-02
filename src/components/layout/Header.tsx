import React from 'react';
import { Leaf, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: any;
  lang: 'te' | 'en';
  setLang: (lang: 'te' | 'en') => void;
  onLogout: () => void;
  onHistory: () => void;
  activeTab: string;
}

export default function Header({ user, lang, setLang, onLogout, onHistory, activeTab }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-green-600 p-1.5 rounded-lg shadow-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-800">
            Pesti<span className="text-green-600">Sense</span>
          </span>
          <div className="ml-4 flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
            <button 
              onClick={() => setLang('te')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'te' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
              తెలుగు
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
              English
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 border border-green-200">
                <UserIcon className="w-5 h-5" />
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm"
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
