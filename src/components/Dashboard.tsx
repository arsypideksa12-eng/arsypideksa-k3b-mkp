import React from 'react';
import {
  Ship,
  Package,
  Ticket,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ArrowUpRight,
  Plus,
  FileText,
  Anchor,
  Compass,
  ChevronRight
} from 'lucide-react';
import { Vessel, Route, CargoManifest, PassengerTicket, Schedule } from '../types';
import { ActiveTab } from './Sidebar';

interface Props {
  vessels: Vessel[];
  routes: Route[];
  cargoManifests: CargoManifest[];
  passengerTickets: PassengerTicket[];
  schedules: Schedule[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCargoPrint: (cargo: CargoManifest) => void;
  onOpenTicketPrint: (ticket: PassengerTicket) => void;
}

export const Dashboard: React.FC<Props> = ({
  vessels,
  routes,
  cargoManifests,
  passengerTickets,
  schedules,
  setActiveTab,
  onOpenCargoPrint,
  onOpenTicketPrint,
}) => {
  // Calculations
  const totalCargoIncome = cargoManifests.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const totalPassengerIncome = passengerTickets.reduce((acc, curr) => acc + (curr.fare || 0), 0);
  const totalRevenue = totalCargoIncome + totalPassengerIncome;

  const totalCargoTons = cargoManifests.reduce((acc, curr) => acc + (curr.weightKg || 0), 0) / 1000;
  const activeVesselsCount = vessels.filter((v) => v.status === 'Ready' || v.status === 'Sailing').length;
  const sailingVessels = vessels.filter((v) => v.status === 'Sailing');

  return (
    <div className="space-y-7">
      {/* Cinematic Luxury Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 shadow-2xl min-h-[300px] flex items-end">
        {/* Real Generated Luxury Vessel Image Backdrop */}
        <img
          src="/src/assets/images/hero_maritime_vessel_1792469510249.jpg"
          alt="ARS Luxury Vessel at Sunset"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Sophisticated Multi-stop Scrim for 4.5:1 Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060A14] via-[#080D1A]/80 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#060A14]/40 to-[#060A14]/90" />

        {/* Content Overlay */}
        <div className="relative z-10 p-6 sm:p-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs text-amber-300 font-semibold tracking-wider uppercase">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="font-crest">PT ARS SAMUDRA NUSANTARA PERKASA</span>
              <span className="text-amber-500/60">·</span>
              <span className="text-slate-300 font-normal">DIVISI ANGKUTAN LAUT & LOGISTIK</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              ARS LOGISTIC & PASSENGER SERVICE
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl font-normal">
              Sistem informasi manajemen terintegrasi operasional muatan kapal kargo, tiket penumpang, pemantauan armada laut, dan kepelabuhanan secara real-time.
            </p>

            {/* Quick Action Luxury Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('cargo')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all duration-200"
              >
                <Package className="w-4 h-4" />
                <span>Terbitkan Resi Muatan</span>
              </button>

              <button
                onClick={() => setActiveTab('passengers')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white border border-white/20 active:scale-95 font-semibold rounded-xl text-xs backdrop-blur-md transition-all duration-200"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Reservasi Tiket</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 active:scale-95 font-medium rounded-xl text-xs backdrop-blur-md transition-all duration-200"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Rekapitulasi Laporan</span>
              </button>
            </div>
          </div>

          {/* Quick Fleet Readiness Summary */}
          <div className="hidden lg:block p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md text-xs text-right space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-400/90 tracking-wider">
              Kesiapan Armada Laut
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {activeVesselsCount} / {vessels.length} <span className="text-xs font-normal text-slate-400">Kapal Siap</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-end space-x-1.5">
              <span>{sailingVessels.length} Kapal Dalam Pelayaran</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid (Luxury Obsidian & Gold Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="luxury-card luxury-card-hover rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Pendapatan
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono tracking-tight text-gold-gradient">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <div className="mt-1.5 text-xs text-slate-400 flex items-center space-x-1.5">
              <span className="text-amber-400/90 font-medium">Kargo + Tiket</span>
              <span>terkumpul</span>
            </div>
          </div>
        </div>

        {/* Total Muatan Kargo */}
        <div className="luxury-card luxury-card-hover rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Muatan Kargo Kapal
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {totalCargoTons.toFixed(1)} <span className="text-sm font-normal text-slate-400">Tonase</span>
            </div>
            <div className="mt-1.5 text-xs text-slate-400 flex items-center justify-between">
              <span>{cargoManifests.length} Surat Muatan</span>
              <span className="font-mono text-amber-300 font-medium">Rp {totalCargoIncome.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Total Penumpang */}
        <div className="luxury-card luxury-card-hover rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tiket Penumpang
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {passengerTickets.length} <span className="text-sm font-normal text-slate-400">Pax</span>
            </div>
            <div className="mt-1.5 text-xs text-slate-400 flex items-center justify-between">
              <span>Tiket Terbit</span>
              <span className="font-mono text-indigo-300 font-medium">Rp {totalPassengerIncome.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Armada Pelayaran */}
        <div className="luxury-card luxury-card-hover rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Armada Kapal ARS
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {activeVesselsCount} <span className="text-sm font-normal text-slate-400">/ {vessels.length} Kapal</span>
            </div>
            <div className="mt-1.5 text-xs text-slate-400 flex items-center space-x-1.5">
              <span className="text-emerald-400 font-medium">{sailingVessels.length} Berlayar</span>
              <span>·</span>
              <span>{vessels.length - activeVesselsCount} Docking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Live Tracking & Operational Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Fleet Status Cards */}
        <div className="lg:col-span-2 luxury-card rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2.5">
              <Anchor className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Status Armada Kapal & Posisi Terkini
                </h2>
                <p className="text-xs text-slate-400">Pemantauan armada kapal RORO, kargo kontainer & fast boat</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('vessels')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 transition"
            >
              <span>Kelola Armada</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {vessels.map((vessel) => (
              <div
                key={vessel.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-amber-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-widest">
                      {vessel.type}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 mt-0.5">{vessel.name}</h3>
                    <p className="text-xs font-mono text-slate-400">{vessel.code}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                      vessel.status === 'Sailing'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : vessel.status === 'Ready'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {vessel.status === 'Sailing'
                      ? 'Sedang Berlayar'
                      : vessel.status === 'Ready'
                      ? 'Siap Berlayar'
                      : 'Docking'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span className="truncate text-slate-300">{vessel.currentLocation || 'Dermaga Operasional'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Kargo: <strong className="text-slate-200 font-mono">{vessel.cargoCapacityTons} T</strong></span>
                    <span>Penumpang: <strong className="text-slate-200 font-mono">{vessel.passengerCapacity} Org</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Operational Schedule Snapshot */}
        <div className="luxury-card rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Jadwal Pelayaran Terdekat
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('schedules')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
              >
                Semua
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {schedules.slice(0, 4).map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] hover:border-white/10 transition text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="truncate max-w-[150px]">{sch.vesselName}</span>
                    <span className="font-mono text-[10px] text-amber-400">{sch.scheduleCode}</span>
                  </div>
                  <div className="text-slate-400 mt-0.5 truncate">{sch.routeDescription}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-white/[0.05]">
                    <span className="font-mono text-slate-300 flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{sch.etd}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-semibold rounded-md ${
                        sch.status === 'Boarding'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : sch.status === 'Departed'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.08] text-center">
            <button
              onClick={() => setActiveTab('schedules')}
              className="w-full py-2.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition"
            >
              Lihat Seluruh Jadwal & Dermaga Sandar
            </button>
          </div>
        </div>
      </div>

      {/* Recent Cargo Waybills & Passenger Tickets Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cargo Waybills */}
        <div className="luxury-card rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Resi Muatan Kargo Terbaru
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('cargo')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
            >
              Buka Semua Kargo
            </button>
          </div>

          <div className="mt-3 divide-y divide-white/[0.05]">
            {cargoManifests.slice(0, 4).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-100">{c.trackingNumber}</span>
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      {c.cargoType}
                    </span>
                  </div>
                  <p className="text-slate-400 truncate mt-0.5">
                    {c.shipperName} ➔ {c.consigneeName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {c.weightKg.toLocaleString('id-ID')} Kg · Rp {c.totalCost.toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => onOpenCargoPrint(c)}
                  className="shrink-0 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-400 border border-amber-500/30 rounded-xl transition duration-200"
                >
                  Cetak Resi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Passenger Tickets */}
        <div className="luxury-card rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Tiket Penumpang Terbit Terbaru
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('passengers')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              Buka Semua Tiket
            </button>
          </div>

          <div className="mt-3 divide-y divide-white/[0.05]">
            {passengerTickets.slice(0, 4).map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-100">{t.ticketNumber}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">
                      {t.seatOrDeckClass} ({t.seatNumber})
                    </span>
                  </div>
                  <p className="text-slate-200 font-semibold truncate mt-0.5">{t.passengerName}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {t.vesselName} · {t.departureDate}
                  </p>
                </div>
                <button
                  onClick={() => onOpenTicketPrint(t)}
                  className="shrink-0 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 hover:text-slate-950 bg-indigo-500/10 hover:bg-indigo-400 border border-indigo-500/30 rounded-xl transition duration-200"
                >
                  Cetak Pass
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
