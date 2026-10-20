import React, { useState } from 'react';
import { Vessel, Route, CargoManifest, PassengerTicket } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  TrendingUp,
  Package,
  Ticket,
  Ship,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface Props {
  vessels: Vessel[];
  routes: Route[];
  cargoManifests: CargoManifest[];
  passengerTickets: PassengerTicket[];
}

export const ReportsManager: React.FC<Props> = ({
  vessels,
  routes,
  cargoManifests,
  passengerTickets,
}) => {
  const [reportType, setReportType] = useState<'ALL' | 'CARGO' | 'PASSENGERS'>('ALL');
  const [period, setPeriod] = useState<string>('ALL');
  const [selectedVessel, setSelectedVessel] = useState<string>('ALL');

  // Filtered Cargo
  const filteredCargo = cargoManifests.filter((c) => {
    if (selectedVessel !== 'ALL' && c.vesselId !== selectedVessel) return false;
    return true;
  });

  // Filtered Passengers
  const filteredPassengers = passengerTickets.filter((p) => {
    if (selectedVessel !== 'ALL' && p.vesselId !== selectedVessel) return false;
    return true;
  });

  const totalCargoIncome = filteredCargo.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const totalPassengerIncome = filteredPassengers.reduce((acc, curr) => acc + (curr.fare || 0), 0);
  const totalRevenue = totalCargoIncome + totalPassengerIncome;
  const totalTons = filteredCargo.reduce((acc, curr) => acc + (curr.weightKg || 0), 0) / 1000;

  // Export to CSV
  const exportToCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'CARGO' || reportType === 'ALL') {
      csvContent += 'LAPORAN TRANSAKSI MUATAN KAPAL (KARGO)\n';
      csvContent += 'No. Resi,Pengirim,Penerima,Kapal,Rute,Kategori,Berat (Kg),Biaya (Rp),Status Bayar,Status Kirim,Tgl Berangkat\n';
      filteredCargo.forEach((c) => {
        csvContent += `"${c.trackingNumber}","${c.shipperName}","${c.consigneeName}","${c.vesselName}","${c.routeDescription}","${c.cargoType}",${c.weightKg},${c.totalCost},"${c.paymentStatus}","${c.shippingStatus}","${c.departureDate}"\n`;
      });
      csvContent += '\n';
    }

    if (reportType === 'PASSENGERS' || reportType === 'ALL') {
      csvContent += 'LAPORAN TRANSAKSI TIKET PENUMPANG\n';
      csvContent += 'No. Tiket,Nama Penumpang,NIK,Tipe,Kapal,Rute,Kelas,Kursi,Tarif (Rp),Status Boarding,Tgl Berangkat\n';
      filteredPassengers.forEach((p) => {
        csvContent += `"${p.ticketNumber}","${p.passengerName}","${p.idCardNumber}","${p.passengerType}","${p.vesselName}","${p.routeDescription}","${p.seatOrDeckClass}","${p.seatNumber}",${p.fare},"${p.boardingStatus}","${p.departureDate}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_ARS_Logistic_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Laporan & Rekapitulasi Eksekutif
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Rekapitulasi pendapatan angkutan laut, manifes tonase muatan kargo, volume tiket penumpang, dan ekspor laporan resmi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportToCsv}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Hidden during print) */}
      <div className="luxury-card p-4 rounded-2xl border border-white/[0.08] flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Tipe Laporan:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 font-medium focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua (Kargo & Penumpang)</option>
            <option value="CARGO">Laporan Muatan Kargo</option>
            <option value="PASSENGERS">Laporan Tiket Penumpang</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Filter Kapal:</span>
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 font-medium focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Armada Kapal</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Periode:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 font-medium focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Tanggal</option>
            <option value="TODAY">Hari Ini</option>
            <option value="WEEK">7 Hari Terakhir</option>
            <option value="MONTH">Bulan Ini</option>
          </select>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/[0.08] space-y-6 print:bg-white print:text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 print:border-slate-800 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl font-crest shadow-md">
              ARS
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white print:text-slate-900 font-crest tracking-wide">
                ARS LOGISTIC AND PASSENGER SERVICE
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Laporan Resmi Operasional & Rekapitulasi Muatan Kapal dan Tiket Penumpang
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600">
            <div>Tgl Cetak: {new Date().toLocaleDateString('id-ID')}</div>
            <div className="font-semibold text-amber-400/90 print:text-slate-800">Database: Firebase Firestore Online</div>
          </div>
        </div>

        {/* Report Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] font-bold text-amber-400 print:text-slate-600 uppercase tracking-wider">Total Pendapatan</span>
            <div className="text-lg sm:text-xl font-black font-mono text-gold-gradient print:text-slate-900 mt-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Omset Kargo</span>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-1 print:text-slate-900">
              Rp {totalCargoIncome.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-amber-400/80">{totalTons.toFixed(1)} Ton Kargo</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Omset Penumpang</span>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-1 print:text-slate-900">
              Rp {totalPassengerIncome.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-indigo-400">{filteredPassengers.length} Tiket Terbit</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Armada & Rute</span>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-1 print:text-slate-900">
              {vessels.length} Kapal
            </div>
            <span className="text-[11px] text-slate-400">{routes.length} Rute Pelayaran</span>
          </div>
        </div>

        {/* Section 1: Cargo Table */}
        {(reportType === 'CARGO' || reportType === 'ALL') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-400 print:text-slate-900">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Rekapitulasi Muatan Kapal (Cargo & Logistics)</span>
            </div>

            <div className="border border-white/10 print:border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">No. Resi</th>
                    <th className="py-2.5 px-3">Pengirim ➔ Penerima</th>
                    <th className="py-2.5 px-3">Kapal & Rute</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right">Berat (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Biaya (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] print:divide-slate-200 text-slate-300 print:text-slate-800">
                  {filteredCargo.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 px-3 font-mono font-bold text-amber-400 print:text-blue-900">{c.trackingNumber}</td>
                      <td className="py-2 px-3">{c.shipperName} ➔ {c.consigneeName}</td>
                      <td className="py-2 px-3">{c.vesselName} ({c.routeDescription})</td>
                      <td className="py-2 px-3">{c.cargoType}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.weightKg.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {c.totalCost.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-center">{c.shippingStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Passengers Table */}
        {(reportType === 'PASSENGERS' || reportType === 'ALL') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 font-bold text-sm text-indigo-400 print:text-slate-900">
              <Ticket className="w-4 h-4 text-indigo-400" />
              <span>Rekapitulasi Tiket Penumpang & Okupansi</span>
            </div>

            <div className="border border-white/10 print:border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">No. Tiket</th>
                    <th className="py-2.5 px-3">Nama Penumpang</th>
                    <th className="py-2.5 px-3">NIK</th>
                    <th className="py-2.5 px-3">Kapal & Rute</th>
                    <th className="py-2.5 px-3">Kelas & Kursi</th>
                    <th className="py-2.5 px-3 text-right">Tarif (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] print:divide-slate-200 text-slate-300 print:text-slate-800">
                  {filteredPassengers.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-300 print:text-indigo-900">{p.ticketNumber}</td>
                      <td className="py-2 px-3 font-semibold text-slate-200 print:text-slate-900">{p.passengerName}</td>
                      <td className="py-2 px-3 font-mono">{p.idCardNumber}</td>
                      <td className="py-2 px-3">{p.vesselName} ({p.routeDescription})</td>
                      <td className="py-2 px-3">{p.seatOrDeckClass} ({p.seatNumber})</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {p.fare.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-center">{p.boardingStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signature Box for Print */}
        <div className="hidden print:grid grid-cols-2 pt-12 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-16">Mengetahui, Kepala Operasional Pelabuhan</p>
            <p className="font-bold border-t border-slate-400 inline-block px-8 pt-1 text-slate-900">
              Capt. Hendra Gunawan, M.Mar
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Petugas Administrasi & Keuangan</p>
            <p className="font-bold border-t border-slate-400 inline-block px-8 pt-1 text-slate-900">
              ARS Finance & Logistics Dept.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
