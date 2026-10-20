import React, { useState } from 'react';
import { Vessel, VesselType, VesselStatus } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import {
  Ship,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  MapPin,
  Anchor
} from 'lucide-react';

interface Props {
  vessels: Vessel[];
}

export const VesselsManager: React.FC<Props> = ({ vessels }) => {
  const { isAdmin, canManageCargo } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vessel | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<VesselType>('RORO');
  const [cargoCapacityTons, setCargoCapacityTons] = useState(1000);
  const [passengerCapacity, setPassengerCapacity] = useState(500);
  const [vehicleCapacity, setVehicleCapacity] = useState(50);
  const [buildYear, setBuildYear] = useState(2022);
  const [status, setStatus] = useState<VesselStatus>('Ready');
  const [captainName, setCaptainName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  const openAddModal = () => {
    setEditingVessel(null);
    setName('');
    setCode(`KM-ARS-0${vessels.length + 1}`);
    setType('RORO');
    setCargoCapacityTons(1200);
    setPassengerCapacity(600);
    setVehicleCapacity(80);
    setBuildYear(2023);
    setStatus('Ready');
    setCaptainName('');
    setCurrentLocation('Dermaga Eksekutif Merak');
    setIsModalOpen(true);
  };

  const openEditModal = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setName(vessel.name);
    setCode(vessel.code);
    setType(vessel.type);
    setCargoCapacityTons(vessel.cargoCapacityTons);
    setPassengerCapacity(vessel.passengerCapacity);
    setVehicleCapacity(vessel.vehicleCapacity);
    setBuildYear(vessel.buildYear);
    setStatus(vessel.status);
    setCaptainName(vessel.captainName || '');
    setCurrentLocation(vessel.currentLocation || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Nama dan Kode Kapal wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const vesselId = editingVessel ? editingVessel.id : `vessel-${Date.now()}`;
      const payload: Vessel = {
        id: vesselId,
        name: name.trim(),
        code: code.trim(),
        type,
        cargoCapacityTons: Number(cargoCapacityTons),
        passengerCapacity: Number(passengerCapacity),
        vehicleCapacity: Number(vehicleCapacity),
        buildYear: Number(buildYear),
        status,
        captainName: captainName.trim() || 'Capt. Belum Ditugaskan',
        currentLocation: currentLocation.trim() || 'Dermaga Operasional',
        createdAt: editingVessel ? editingVessel.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveVessel(payload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data kapal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbService.deleteVessel(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data kapal.');
    }
  };

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.captainName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || v.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Master Data Kapal & Armada Laut
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Spesifikasi teknis, daya angkut muatan kargo, kapasitas penumpang, dan status armada pelayaran ARS.
              </p>
            </div>
          </div>
        </div>

        {canManageCargo && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kapal Baru</span>
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
            placeholder="Cari nama kapal, kode callsign, atau nakhoda..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Tipe:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Tipe Kapal</option>
            <option value="RORO">Ferry RORO</option>
            <option value="Cargo">Kapal Kargo / Kontainer</option>
            <option value="FastBoat">Kapal Cepat (Fast Boat)</option>
            <option value="Tongkang">Tongkang / Tugboat</option>
            <option value="Pelni">Kapal Penumpang Besar</option>
          </select>
        </div>
      </div>

      {/* Vessels Table */}
      <div className="luxury-card rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama & Kode Kapal</th>
                <th className="py-3.5 px-4">Tipe Armada</th>
                <th className="py-3.5 px-4 text-right">Daya Muat Kargo</th>
                <th className="py-3.5 px-4 text-right">Kapasitas Pax</th>
                <th className="py-3.5 px-4 text-right">Kendaraan</th>
                <th className="py-3.5 px-4">Nakhoda & Posisi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredVessels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Tidak ada armada kapal yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredVessels.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{v.name}</div>
                      <div className="text-[11px] font-mono text-amber-400/90">{v.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-300 font-medium">
                        {v.type}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">Thn {v.buildYear}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-100">
                      {v.cargoCapacityTons.toLocaleString('id-ID')} Ton
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {v.passengerCapacity.toLocaleString('id-ID')} Org
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {v.vehicleCapacity} Unit
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200 truncate max-w-[150px]">{v.captainName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 text-amber-400/70 shrink-0" />
                        <span>{v.currentLocation}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          v.status === 'Sailing'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : v.status === 'Ready'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {v.status === 'Sailing'
                          ? 'Sedang Berlayar'
                          : v.status === 'Ready'
                          ? 'Siap Berlayar'
                          : 'Docking'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                          title="Ubah Data Kapal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                            title="Hapus Kapal"
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

      {/* Modal Add / Edit Vessel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0A101F] rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/10 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ship className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingVessel ? 'Ubah Data Armada Kapal' : 'Tambah Armada Kapal Baru'}
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
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Nama Kapal *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: KM ARS Samudra"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Kode / Callsign *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: KM-ARS-01"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tipe Kapal
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VesselType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="RORO">Ferry RORO</option>
                    <option value="Cargo">Cargo / Kontainer</option>
                    <option value="FastBoat">Kapal Cepat</option>
                    <option value="Tongkang">Tongkang</option>
                    <option value="Pelni">Kapal Penumpang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Status Operasi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VesselStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Ready">Siap Berlayar (Ready)</option>
                    <option value="Sailing">Sedang Berlayar</option>
                    <option value="Docking">Docking / Galangan</option>
                    <option value="Maintenance">Perawatan Rutin</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tahun Buat
                  </label>
                  <input
                    type="number"
                    value={buildYear}
                    onChange={(e) => setBuildYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Daya Muat Kargo (Ton)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cargoCapacityTons}
                    onChange={(e) => setCargoCapacityTons(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Kapasitas Pax (Org)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={passengerCapacity}
                    onChange={(e) => setPassengerCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Kendaraan (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Nama Nakhoda (Kapten)
                  </label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Contoh: Capt. Bambang, M.Mar"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Posisi Dermaga Saat Ini
                  </label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="Contoh: Dermaga Eksekutif Merak"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
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
                  {saving ? 'Menyimpan...' : 'Simpan Armada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0A101F] border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Hapus Data Armada?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong> ({deleteTarget.code})?
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
