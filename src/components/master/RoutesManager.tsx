import React, { useState } from 'react';
import { Route, RouteStatus } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Navigation
} from 'lucide-react';

interface Props {
  routes: Route[];
}

export const RoutesManager: React.FC<Props> = ({ routes }) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [distanceNm, setDistanceNm] = useState(25);
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [cargoRatePerTon, setCargoRatePerTon] = useState(500000);
  const [passengerRateEconomy, setPassengerRateEconomy] = useState(50000);
  const [passengerRateBusiness, setPassengerRateBusiness] = useState(85000);
  const [passengerRateVip, setPassengerRateVip] = useState(150000);
  const [status, setStatus] = useState<RouteStatus>('Active');

  const openAddModal = () => {
    setEditingRoute(null);
    setOriginPort('');
    setDestinationPort('');
    setDistanceNm(45);
    setEstimatedHours(4);
    setCargoRatePerTon(600000);
    setPassengerRateEconomy(60000);
    setPassengerRateBusiness(95000);
    setPassengerRateVip(160000);
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Route) => {
    setEditingRoute(r);
    setOriginPort(r.originPort);
    setDestinationPort(r.destinationPort);
    setDistanceNm(r.distanceNm);
    setEstimatedHours(r.estimatedHours);
    setCargoRatePerTon(r.cargoRatePerTon);
    setPassengerRateEconomy(r.passengerRateEconomy);
    setPassengerRateBusiness(r.passengerRateBusiness);
    setPassengerRateVip(r.passengerRateVip);
    setStatus(r.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originPort.trim() || !destinationPort.trim()) {
      alert('Pelabuhan asal dan tujuan wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const routeId = editingRoute ? editingRoute.id : `route-${Date.now()}`;
      const payload: Route = {
        id: routeId,
        originPort: originPort.trim(),
        destinationPort: destinationPort.trim(),
        distanceNm: Number(distanceNm),
        estimatedHours: Number(estimatedHours),
        cargoRatePerTon: Number(cargoRatePerTon),
        passengerRateEconomy: Number(passengerRateEconomy),
        passengerRateBusiness: Number(passengerRateBusiness),
        passengerRateVip: Number(passengerRateVip),
        status,
        createdAt: editingRoute ? editingRoute.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveRoute(payload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan rute.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbService.deleteRoute(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus rute.');
    }
  };

  const filteredRoutes = routes.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.originPort.toLowerCase().includes(q) ||
      r.destinationPort.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Master Rute & Tarif Pelayaran
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi jalur laut antar-pelabuhan nusantara, jarak mil laut, durasi tempuh, serta struktur tarif kargo dan penumpang.
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rute Baru</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="luxury-card p-4 rounded-2xl border border-white/[0.08]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pelabuhan asal atau pelabuhan tujuan..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>
      </div>

      {/* Routes Table */}
      <div className="luxury-card rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Rute Pelayaran</th>
                <th className="py-3.5 px-4 text-right">Jarak (Mil Laut)</th>
                <th className="py-3.5 px-4 text-right">Estimasi Tempuh</th>
                <th className="py-3.5 px-4 text-right">Tarif Kargo (Per Ton)</th>
                <th className="py-3.5 px-4 text-right">Tarif Tiket (Eko / Bisnis / VIP)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Tidak ada rute yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 flex items-center space-x-2">
                        <span>{r.originPort}</span>
                        <Navigation className="w-3.5 h-3.5 text-amber-400 rotate-90 shrink-0" />
                        <span>{r.destinationPort}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {r.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-100">
                      {r.distanceNm} NM
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ~ {r.estimatedHours} Jam
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      Rp {r.cargoRatePerTon.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                      <span className="text-slate-100 font-semibold">Rp {r.passengerRateEconomy.toLocaleString('id-ID')}</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-indigo-300 font-semibold">{r.passengerRateBusiness.toLocaleString('id-ID')}</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-amber-300 font-bold">{r.passengerRateVip.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          r.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {r.status === 'Active' ? 'Aktif' : 'Peringatan Cuaca'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                          title="Ubah Rute"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                            title="Hapus Rute"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Route */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0A101F] rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/10 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingRoute ? 'Ubah Rute Pelayaran' : 'Tambah Rute & Tarif Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Pelabuhan Asal *
                  </label>
                  <input
                    type="text"
                    required
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    placeholder="Contoh: Tanjung Priok (Jakarta)"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Pelabuhan Tujuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    placeholder="Contoh: Tanjung Perak (Surabaya)"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Jarak (Mil Laut/NM)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={distanceNm}
                    onChange={(e) => setDistanceNm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Estimasi Jam Tempuh
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Status Jalur
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RouteStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Active">Aktif Normal</option>
                    <option value="Inactive">Nonaktif</option>
                    <option value="WeatherAlert">Peringatan Cuaca</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px]">
                  Struktur Tarif Dasar
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Tarif Dasar Kargo (Per Ton) - Rp
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  value={cargoRatePerTon}
                  onChange={(e) => setCargoRatePerTon(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tiket Eko (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={passengerRateEconomy}
                    onChange={(e) => setPassengerRateEconomy(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tiket Bisnis (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={passengerRateBusiness}
                    onChange={(e) => setPassengerRateBusiness(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tiket VIP (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={passengerRateVip}
                    onChange={(e) => setPassengerRateVip(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono text-amber-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-300 hover:bg-white/5 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold transition shadow-md"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Rute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0A101F] border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Hapus Rute Pelayaran?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Yakin menghapus rute <strong>{deleteTarget.originPort} - {deleteTarget.destinationPort}</strong>?
              </p>
            </div>
            <div className="flex space-x-2.5 justify-center pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-white/10 text-slate-300 hover:bg-white/5 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
