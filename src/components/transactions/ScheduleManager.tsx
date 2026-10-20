import React, { useState } from 'react';
import { Schedule, ScheduleStatus, Vessel, Route } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Ship,
  Clock,
  MapPin
} from 'lucide-react';

interface Props {
  schedules: Schedule[];
  vessels: Vessel[];
  routes: Route[];
}

export const ScheduleManager: React.FC<Props> = ({ schedules, vessels, routes }) => {
  const { isAdmin, canManageCargo, canManagePassengers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [scheduleCode, setScheduleCode] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [status, setStatus] = useState<ScheduleStatus>('Scheduled');
  const [dockNumber, setDockNumber] = useState('Dermaga Eksekutif 1');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingSchedule(null);
    const suffix = Math.floor(100 + Math.random() * 900);
    setScheduleCode(`ARS-SCH-${suffix}`);
    setVesselId(vessels[0]?.id || '');
    setRouteId(routes[0]?.id || '');
    const today = new Date().toISOString().slice(0, 10);
    setEtd(`${today} 08:00`);
    setEta(`${today} 11:30`);
    setStatus('Scheduled');
    setDockNumber('Dermaga 1 Barat');
    setNotes('Penyeberangan reguler');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Schedule) => {
    setEditingSchedule(s);
    setScheduleCode(s.scheduleCode);
    setVesselId(s.vesselId);
    setRouteId(s.routeId);
    setEtd(s.etd);
    setEta(s.eta);
    setStatus(s.status);
    setDockNumber(s.dockNumber || '');
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etd.trim() || !eta.trim()) {
      alert('Waktu Berangkat (ETD) dan Tiba (ETA) wajib diisi.');
      return;
    }

    const selVessel = vessels.find((v) => v.id === vesselId);
    const selRoute = routes.find((r) => r.id === routeId);

    setSaving(true);
    try {
      const schId = editingSchedule ? editingSchedule.id : `sch-${Date.now()}`;
      const payload: Schedule = {
        id: schId,
        scheduleCode,
        vesselId,
        vesselName: selVessel ? selVessel.name : 'KM ARS Nusantara',
        routeId,
        routeDescription: selRoute
          ? `${selRoute.originPort} -> ${selRoute.destinationPort}`
          : 'Merak -> Bakauheni',
        etd,
        eta,
        status,
        dockNumber,
        notes: notes.trim() || undefined,
        createdAt: editingSchedule ? editingSchedule.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveSchedule(payload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan jadwal pelayaran.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbService.deleteSchedule(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus jadwal.');
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.scheduleCode.toLowerCase().includes(q) ||
      s.vesselName.toLowerCase().includes(q) ||
      s.routeDescription.toLowerCase().includes(q) ||
      s.dockNumber.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Jadwal Pelayaran & Dermaga Sandar
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengaturan waktu keberangkatan (ETD), estimasi kedatangan (ETA), alokasi dermaga tambat, dan status pelayaran kapal.
              </p>
            </div>
          </div>
        </div>

        {(canManageCargo || canManagePassengers) && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="luxury-card p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode jadwal, nama kapal, rute, atau dermaga..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400/60"
        >
          <option value="ALL">Semua Status Jadwal</option>
          <option value="Scheduled">Terjadwal (Scheduled)</option>
          <option value="Boarding">Sedang Boarding</option>
          <option value="Departed">Telah Berangkat</option>
          <option value="Delayed">Tertunda (Delayed)</option>
          <option value="Arrived">Telah Tiba (Arrived)</option>
          <option value="Cancelled">Dibatalkan</option>
        </select>
      </div>

      {/* Schedules Table */}
      <div className="luxury-card rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Kode & Kapal</th>
                <th className="py-3.5 px-4">Rute Pelayaran</th>
                <th className="py-3.5 px-4">Keberangkatan (ETD)</th>
                <th className="py-3.5 px-4">Estimasi Tiba (ETA)</th>
                <th className="py-3.5 px-4">Dermaga Sandar</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Tidak ada jadwal yang cocok.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-amber-400">{s.scheduleCode}</div>
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5 mt-0.5">
                        <Ship className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.vesselName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{s.routeDescription}</div>
                      {s.notes && <div className="text-[10px] text-slate-500 mt-0.5">{s.notes}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-100 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                        <span>{s.etd}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-400 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{s.eta}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                        <span>{s.dockNumber}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          s.status === 'Boarding'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : s.status === 'Departed'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : s.status === 'Delayed'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : s.status === 'Arrived'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                          title="Ubah Jadwal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                            title="Hapus Jadwal"
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

      {/* Modal Add / Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0A101F] rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/10 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingSchedule ? 'Ubah Jadwal Pelayaran' : 'Tambah Jadwal Pelayaran Baru'}
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
                    Kode Jadwal
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleCode}
                    onChange={(e) => setScheduleCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Status Pelayaran
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Scheduled">Terjadwal (Scheduled)</option>
                    <option value="Boarding">Sedang Boarding</option>
                    <option value="Departed">Telah Berangkat</option>
                    <option value="Delayed">Tertunda (Delayed)</option>
                    <option value="Arrived">Telah Tiba (Arrived)</option>
                    <option value="Cancelled">Batal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Armada Kapal *
                  </label>
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Rute Pelayaran *
                  </label>
                  <select
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.originPort} ➔ {r.destinationPort}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Waktu Berangkat (ETD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={etd}
                    onChange={(e) => setEtd(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Estimasi Tiba (ETA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Dermaga Sandar (Docking Berth)
                </label>
                <input
                  type="text"
                  required
                  value={dockNumber}
                  onChange={(e) => setDockNumber(e.target.value)}
                  placeholder="Contoh: Dermaga Eksekutif 1 Merak"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Catatan Operasional
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kondisi cuaca, muatan khusus, instruksi kapten..."
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
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
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
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
              <h3 className="font-bold text-base text-white">Hapus Jadwal?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Yakin menghapus jadwal <strong>{deleteTarget.scheduleCode}</strong> ({deleteTarget.vesselName})?
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
