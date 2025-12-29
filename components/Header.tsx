
import React from 'react';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[60] px-4 py-3 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm lg:hidden">
            <i className="fa-solid fa-kaaba text-sm"></i>
          </div>
          <span className="font-bold text-slate-900 tracking-tight lg:hidden">Al-Muwaffaq</span>
          
          {/* Breadcrumb or active state could go here on desktop */}
          <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <i className="fa-solid fa-shield-halved text-teal-600/50"></i>
            <span>Secured Session</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">AI Online</span>
          </div>

          <button 
            onClick={onOpenMenu}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 hover:shadow-sm transition-all active:scale-95"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
        </div>
      </div>
    </header>
  );
};
