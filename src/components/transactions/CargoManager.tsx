import React, { useState } from 'react';
import {
  CargoManifest,
  CargoType,
  PaymentStatus,
  ShippingStatus,
  Vessel,
  Route
} from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Ship,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Props {
  cargoManifests: CargoManifest[];
  vessels: Vessel[];
  routes: Route[];
  onOpenPrint: (cargo: CargoManifest) => void;
}

export const CargoManager: React.FC<Props> = ({
  cargoManifests,
  vessels,
  routes,
  onOpenPrint,
}) => {
  const { canManageCargo, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<CargoManifest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CargoManifest | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [trackingNumber, setTrackingNumber] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [consigneePhone, setConsigneePhone] = useState('');
  const [cargoType, setCargoType] = useState<CargoType>('GeneralCargo');
  const [itemDescription, setItemDescription] = useState('');
  const [weightKg, setWeightKg] = useState(1000);
  const [volumeM3, setVolumeM3] = useState(2.5);
  const [containerOrPlateNumber, setContainerOrPlateNumber] = useState('');
  const [totalCost, setTotalCost] = useState(850000);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>('Booked');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Auto calculate cost when route or weight changes
  const handleRouteChange = (selectedRouteId: string, currentWeight: number) => {
    setRouteId(selectedRouteId);
    const selRoute = routes.find((r) => r.id === selectedRouteId);
    if (selRoute) {
      const tons = currentWeight / 1000;
      const calculated = Math.round(tons * selRoute.cargoRatePerTon);
      setTotalCost(Math.max(calculated, 300000));
    }
  };

  const handleWeightChange = (newWeight: number) => {
    setWeightKg(newWeight);
    const selRoute = routes.find((r) => r.id === routeId);
    if (selRoute) {
      const tons = newWeight / 1000;
      const calculated = Math.round(tons * selRoute.cargoRatePerTon);
      setTotalCost(Math.max(calculated, 300000));
    }
  };

  const openAddModal = () => {
    setEditingCargo(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setTrackingNumber(`ARS-CRG-${new Date().getFullYear()}-${randomSuffix}`);
    setVesselId(vessels[0]?.id || '');
    const firstRoute = routes[0]?.id || '';
    setRouteId(firstRoute);
    setShipperName('');
    setShipperPhone('');
    setConsigneeName('');
    setConsigneePhone('');
    setCargoType('GeneralCargo');
    setItemDescription('');
    setWeightKg(2500);
    setVolumeM3(4.0);
    setContainerOrPlateNumber('');
    const selRoute = routes[0];
    const initialCost = selRoute ? Math.round((2500 / 1000) * selRoute.cargoRatePerTon) : 1200000;
    setTotalCost(initialCost);
    setPaymentStatus('Paid');
    setShippingStatus('Booked');
    setDepartureDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: CargoManifest) => {
    setEditingCargo(c);
    setTrackingNumber(c.trackingNumber);
    setVesselId(c.vesselId);
    setRouteId(c.routeId);
    setShipperName(c.shipperName);
    setShipperPhone(c.shipperPhone);
    setConsigneeName(c.consigneeName);
    setConsigneePhone(c.consigneePhone);
    setCargoType(c.cargoType);
    setItemDescription(c.itemDescription);
    setWeightKg(c.weightKg);
    setVolumeM3(c.volumeM3 || 0);
    setContainerOrPlateNumber(c.containerOrPlateNumber || '');
    setTotalCost(c.totalCost);
    setPaymentStatus(c.paymentStatus);
    setShippingStatus(c.shippingStatus);
    setDepartureDate(c.departureDate);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipperName.trim() || !consigneeName.trim() || !itemDescription.trim()) {
      alert('Nama Pengirim, Nama Penerima, dan Deskripsi Muatan wajib diisi.');
      return;
    }

    const selVessel = vessels.find((v) => v.id === vesselId);
    const selRoute = routes.find((r) => r.id === routeId);

    setSaving(true);
    try {
      const cargoId = editingCargo ? editingCargo.id : `crg-${Date.now()}`;
      const payload: CargoManifest = {
        id: cargoId,
        trackingNumber,
        vesselId,
        vesselName: selVessel ? selVessel.name : 'KM ARS Nusantara',
        routeId,
        routeDescription: selRoute
          ? `${selRoute.originPort} -> ${selRoute.destinationPort}`
          : 'Merak -> Bakauheni',
        shipperName: shipperName.trim(),
        shipperPhone: shipperPhone.trim(),
        consigneeName: consigneeName.trim(),
        consigneePhone: consigneePhone.trim(),
        cargoType,
        itemDescription: itemDescription.trim(),
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3),
        containerOrPlateNumber: containerOrPlateNumber.trim() || undefined,
        totalCost: Number(totalCost),
        paymentStatus,
        shippingStatus,
        departureDate,
        notes: notes.trim() || undefined,
        createdAt: editingCargo ? editingCargo.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveCargo(payload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan manifes muatan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbService.deleteCargo(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus resi muatan.');
    }
  };

  const filteredCargo = cargoManifests.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.trackingNumber.toLowerCase().includes(q) ||
      c.shipperName.toLowerCase().includes(q) ||
      c.consigneeName.toLowerCase().includes(q) ||
      c.itemDescription.toLowerCase().includes(q) ||
      (c.containerOrPlateNumber && c.containerOrPlateNumber.toLowerCase().includes(q));

    const matchesStatus = filterStatus === 'ALL' || c.shippingStatus === filterStatus;
    const matchesType = filterType === 'ALL' || c.cargoType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Transaksi Muatan Kapal (Cargo & Logistics)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Penerbitan surat muatan laut (Bill of Lading), manifes kargo pelabuhan, kalkulasi ongkos angkut dan pelacakan status bongkar muat.
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
            <span>Buat Resi Muatan Baru</span>
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
            placeholder="Cari No. Resi, nama pengirim, penerima, kontainer / plat..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Status Muatan</option>
            <option value="Booked">Dipesan (Booked)</option>
            <option value="Loading">Muat Dermaga (Loading)</option>
            <option value="InTransit">Berlayar (In Transit)</option>
            <option value="Arrived">Tiba di Pelabuhan</option>
            <option value="Completed">Selesai Dibongkar</option>
            <option value="Cancelled">Dibatalkan</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Kategori Kargo</option>
            <option value="Container">Kontainer</option>
            <option value="GeneralCargo">General Cargo</option>
            <option value="Vehicle">Kendaraan Bermotor</option>
            <option value="Sembako">Sembako / Pangan</option>
            <option value="HeavyEquipment">Alat Berat</option>
            <option value="HazardousDG">Barang Berbahaya (DG)</option>
          </select>
        </div>
      </div>

      {/* Cargo Table */}
      <div className="luxury-card rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Resi & Muatan</th>
                <th className="py-3.5 px-4">Pengirim & Penerima</th>
                <th className="py-3.5 px-4">Kapal & Rute</th>
                <th className="py-3.5 px-4 text-right">Berat / Volume</th>
                <th className="py-3.5 px-4 text-right">Total Ongkir</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredCargo.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Tidak ada transaksi muatan kargo yang cocok.
                  </td>
                </tr>
              ) : (
                filteredCargo.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-100">{c.trackingNumber}</div>
                      <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                        {c.cargoType}
                        {c.containerOrPlateNumber && ` · ${c.containerOrPlateNumber}`}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                        {c.itemDescription}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{c.shipperName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <span>Ke:</span>
                        <span className="text-slate-200">{c.consigneeName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{c.consigneePhone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                        <Ship className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{c.vesselName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[170px]">
                        {c.routeDescription}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">Tgl: {c.departureDate}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-100">
                        {c.weightKg.toLocaleString('id-ID')} Kg
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ({(c.weightKg / 1000).toFixed(2)} Ton)
                        {c.volumeM3 ? ` · ${c.volumeM3} M³` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-amber-300 text-sm">
                        Rp {c.totalCost.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {c.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          c.shippingStatus === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : c.shippingStatus === 'InTransit'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : c.shippingStatus === 'Loading'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : c.shippingStatus === 'Arrived'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : c.shippingStatus === 'Cancelled'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                        }`}
                      >
                        {c.shippingStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onOpenPrint(c)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                          title="Cetak Surat Muatan Kapal (Bill of Lading)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {canManageCargo && (
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                            title="Ubah Resi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                            title="Hapus Resi"
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

      {/* Modal Add / Edit Cargo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0A101F] rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/10 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingCargo ? 'Ubah Manifes Muatan Kapal' : 'Terbitkan Resi / Surat Muatan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-3.5 bg-slate-900/80 border border-white/10 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    No. Resi (Auto)
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={trackingNumber}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Pilih Kapal *
                  </label>
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Pilih Rute Pelayaran *
                  </label>
                  <select
                    value={routeId}
                    onChange={(e) => handleRouteChange(e.target.value, weightKg)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.originPort} ➔ {r.destinationPort}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shipper & Consignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-900/60 border border-white/[0.06] rounded-xl space-y-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                    Identitas Pengirim (Shipper)
                  </span>
                  <div>
                    <label className="block text-slate-300 mb-0.5">Nama Perusahaan / Pengirim *</label>
                    <input
                      type="text"
                      required
                      value={shipperName}
                      onChange={(e) => setShipperName(e.target.value)}
                      placeholder="PT Indo Logistik / Nama Orang"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-0.5">No. Telp / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={shipperPhone}
                      onChange={(e) => setShipperPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 border border-white/[0.06] rounded-xl space-y-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                    Identitas Penerima (Consignee)
                  </span>
                  <div>
                    <label className="block text-slate-300 mb-0.5">Nama Penerima Barang *</label>
                    <input
                      type="text"
                      required
                      value={consigneeName}
                      onChange={(e) => setConsigneeName(e.target.value)}
                      placeholder="CV Mitra Bahari / Nama Orang"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-0.5">No. Telp / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={consigneePhone}
                      onChange={(e) => setConsigneePhone(e.target.value)}
                      placeholder="0813xxxxxxxx"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Kategori Muatan
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value as CargoType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    <option value="GeneralCargo">General Cargo</option>
                    <option value="Container">Kontainer</option>
                    <option value="Vehicle">Kendaraan</option>
                    <option value="Sembako">Sembako / Pangan</option>
                    <option value="HeavyEquipment">Alat Berat</option>
                    <option value="HazardousDG">Barang Berbahaya (DG)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Berat Muatan (Kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={weightKg}
                    onChange={(e) => handleWeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Volume (M³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={volumeM3}
                    onChange={(e) => setVolumeM3(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    No. Kontainer / Plat
                  </label>
                  <input
                    type="text"
                    value={containerOrPlateNumber}
                    onChange={(e) => setContainerOrPlateNumber(e.target.value)}
                    placeholder="Contoh: B 9912 UXT / TGHU-20"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Rincian & Deskripsi Barang *
                </label>
                <textarea
                  required
                  rows={2}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Sebutkan jenis barang yang diangkut, merk, dan jumlah kemasan..."
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>

              {/* Status and Financials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Total Biaya (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalCost}
                    onChange={(e) => setTotalCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Status Bayar
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Paid">Lunas (Paid)</option>
                    <option value="Unpaid">Belum Lunas</option>
                    <option value="COD">Bayar di Tempat (COD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Status Muatan
                  </label>
                  <select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value as ShippingStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Booked">Dipesan (Booked)</option>
                    <option value="Loading">Masuk Dermaga (Loading)</option>
                    <option value="InTransit">Sedang Berlayar</option>
                    <option value="Arrived">Tiba di Tujuan</option>
                    <option value="Completed">Selesai Dibongkar</option>
                    <option value="Cancelled">Batal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tgl Berangkat
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end space-x-2.5 shrink-0">
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
                  {saving ? 'Menyimpan...' : 'Simpan Resi Muatan'}
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
              <h3 className="font-bold text-base text-white">Hapus Resi Muatan?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Yakin menghapus surat muatan <strong>{deleteTarget.trackingNumber}</strong>?
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
