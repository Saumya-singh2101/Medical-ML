import React from 'react';
import { Activity, LogOut, LayoutDashboard, BookOpen, Clock } from 'lucide-react';
import { AuthUser } from '../services/auth';

type Screen = 'dashboard' | 'education' | 'history';

interface NavBarProps {
  user: AuthUser;
  onLogout: () => void;
  currentScreen: string;
  onNavigate: (screen: Screen) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ user, onLogout, currentScreen, onNavigate }) => {
  return (
    <header className="border-b border-white/[0.06] bg-panel/50 backdrop-blur-xl sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/25 flex items-center justify-center">
            <Activity size={15} className="text-cyan" />
          </div>
          <span className="font-display font-bold text-white tracking-tight">
            PULSE<span className="text-cyan">.</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase transition-all ${
              currentScreen === 'dashboard'
                ? 'bg-cyan/10 text-cyan border border-cyan/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <LayoutDashboard size={12} />
            Console
          </button>
          <button
            onClick={() => onNavigate('education')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase transition-all ${
              currentScreen === 'education'
                ? 'bg-magenta/10 text-magenta border border-magenta/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <BookOpen size={12} />
            Learn
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase transition-all ${
              currentScreen === 'history'
                ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Clock size={12} />
            History
          </button>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-lime/5 border border-lime/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-lime/70">
              {user.username}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-slate-600 hover:text-magenta transition"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};
