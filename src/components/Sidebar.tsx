import React from 'react';
import {
  LayoutDashboard,
  Ship,
  MapPin,
  Package,
  Ticket,
  CalendarDays,
  FileSpreadsheet,
  Database,
  Anchor,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab =
  | 'dashboard'
  | 'vessels'
  | 'routes'
  | 'cargo'
  | 'passengers'
  | 'schedules'
  | 'reports'
  | 'database';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  cargoCount: number;
  passengerCount: number;
  vesselCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  cargoCount,
  passengerCount,
  vesselCount,
}) => {
  const { user } = useAuth();

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-18 left-0 z-50 md:z-20 h-[calc(100vh-4.5rem)] w-64 bg-[#080D1A] border-r border-white/[0.07] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] md:hidden">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Anchor className="w-5 h-5 text-amber-400" />
            <span className="font-crest">ARS MARITIME</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Group 1: Dashboard */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Pusat Kendali
            </div>
            <button
              onClick={() => handleSelect('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Dashboard Utama</span>
              </div>
            </button>
          </div>

          {/* Group 2: Master Data */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Master Data Armada
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect('vessels')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'vessels'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Ship className={`w-4 h-4 ${activeTab === 'vessels' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Master Kapal</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {vesselCount}
                </span>
              </button>

              <button
                onClick={() => handleSelect('routes')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'routes'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className={`w-4 h-4 ${activeTab === 'routes' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Master Rute & Tarif</span>
                </div>
              </button>
            </div>
          </div>

          {/* Group 3: Transaksi Data */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Transaksi Operasional
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect('cargo')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'cargo'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className={`w-4 h-4 ${activeTab === 'cargo' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Muatan Kapal (Kargo)</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80">
                  {cargoCount}
                </span>
              </button>

              <button
                onClick={() => handleSelect('passengers')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'passengers'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Ticket className={`w-4 h-4 ${activeTab === 'passengers' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Tiket Penumpang</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400/80">
                  {passengerCount}
                </span>
              </button>

              <button
                onClick={() => handleSelect('schedules')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'schedules'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CalendarDays className={`w-4 h-4 ${activeTab === 'schedules' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Jadwal Pelayaran</span>
                </div>
              </button>
            </div>
          </div>

          {/* Group 4: Laporan & Database */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Laporan & Integrasi
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect('reports')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'reports' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Laporan & Cetak</span>
                </div>
              </button>

              <button
                onClick={() => handleSelect('database')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeTab === 'database'
                    ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 border-l-2 border-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Database className={`w-4 h-4 ${activeTab === 'database' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Koneksi Real DB</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-white/[0.07] bg-black/20 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-amber-400/80" />
            <span className="font-crest font-semibold text-slate-300 text-[11px] tracking-wider">ARS PRESTIGE</span>
          </div>
          <span className="text-amber-400/90 font-mono text-[10px]">v2.6 Enterprise</span>
        </div>
      </aside>
    </>
  );
};
