import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, LogIn, LogOut, Menu, Shield, Anchor } from 'lucide-react';

interface Props {
  onToggleMobileMenu: () => void;
  onOpenLogin: () => void;
  onOpenDbModal: () => void;
  isDbConnected: boolean;
}

export const Navbar: React.FC<Props> = ({
  onToggleMobileMenu,
  onOpenLogin,
  onOpenDbModal,
  isDbConnected,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#070C18]/90 backdrop-blur-md border-b border-white/[0.08] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Left: Mobile hamburger + Prestigious Brand Wordmark */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-white/5 transition"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="#" className="flex items-center space-x-3 group whitespace-nowrap shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-transparent border border-amber-400/30 flex items-center justify-center shadow-inner group-hover:border-amber-400/60 transition duration-300">
              <Anchor className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-crest font-bold text-base sm:text-lg tracking-wider text-white">
                  ARS
                </span>
                <span className="text-gold-gradient font-bold text-sm sm:text-base tracking-tight font-display">
                  LOGISTIC & PASSENGER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Maritime Fleet & Passenger Service
              </p>
            </div>
          </a>
        </div>

        {/* Center: Quiet Editorial Tagline (Desktop) */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 font-medium tracking-wide">
          <span>Armada Maritim Nusantara</span>
          <span className="text-slate-600">/</span>
          <span>Sistem Muatan Terpadu</span>
          <span className="text-slate-600">/</span>
          <span>Reservasi Tiket</span>
        </div>

        {/* Right: Real Database Connection Pill & User Profile */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Real Database Indicator */}
          <button
            onClick={onOpenDbModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 text-xs transition duration-200"
            title="Kelola Koneksi Database Real (Firebase, Supabase, Neon DB)"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-slate-200">
              {isDbConnected ? 'Firestore: Online' : 'Koneksi DB'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          {/* User Auth controls */}
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-100 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-amber-400/90 font-medium capitalize mt-0.5">
                  {user.role.replace('_', ' ')}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition"
                title="Keluar dari Akun Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl text-xs shadow-md transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
