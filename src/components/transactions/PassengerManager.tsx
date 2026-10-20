import React, { useState } from 'react';
import {
  PassengerTicket,
  PassengerType,
  Gender,
  SeatClass,
  BoardingStatus,
  Vessel,
  Route
} from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Ship,
  UserCheck
} from 'lucide-react';

interface Props {
  passengerTickets: PassengerTicket[];
  vessels: Vessel[];
  routes: Route[];
  onOpenPrint: (ticket: PassengerTicket) => void;
}

export const PassengerManager: React.FC<Props> = ({
  passengerTickets,
  vessels,
  routes,
  onOpenPrint,
}) => {
  const { canManagePassengers, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<PassengerTicket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PassengerTicket | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [ticketNumber, setTicketNumber] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [passengerType, setPassengerType] = useState<PassengerType>('Adult');
  const [gender, setGender] = useState<Gender>('L');
  const [phone, setPhone] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [seatOrDeckClass, setSeatOrDeckClass] = useState<SeatClass>('Economy');
  const [seatNumber, setSeatNumber] = useState('E-12');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState('08:00 WIB');
  const [fare, setFare] = useState(45000);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [boardingStatus, setBoardingStatus] = useState<BoardingStatus>('Booked');

  const updateFare = (selectedRouteId: string, selectedClass: SeatClass) => {
    const selRoute = routes.find((r) => r.id === selectedRouteId);
    if (selRoute) {
      if (selectedClass === 'VIP') setFare(selRoute.passengerRateVip);
      else if (selectedClass === 'Business') setFare(selRoute.passengerRateBusiness);
      else setFare(selRoute.passengerRateEconomy);
    }
  };

  const openAddModal = () => {
    setEditingTicket(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setTicketNumber(`ARS-TCK-${new Date().getFullYear()}-${randomSuffix}`);
    setPassengerName('');
    setIdCardNumber('');
    setPassengerType('Adult');
    setGender('L');
    setPhone('');
    setVesselId(vessels[0]?.id || '');
    const firstRoute = routes[0]?.id || '';
    setRouteId(firstRoute);
    setSeatOrDeckClass('Economy');
    setSeatNumber(`E-${Math.floor(1 + Math.random() * 80)}`);
    setDepartureDate(new Date().toISOString().slice(0, 10));
    setDepartureTime('08:00 WIB');
    setPaymentStatus('Paid');
    setBoardingStatus('Booked');
    updateFare(firstRoute, 'Economy');
    setIsModalOpen(true);
  };

  const openEditModal = (t: PassengerTicket) => {
    setEditingTicket(t);
    setTicketNumber(t.ticketNumber);
    setPassengerName(t.passengerName);
    setIdCardNumber(t.idCardNumber);
    setPassengerType(t.passengerType);
    setGender(t.gender);
    setPhone(t.phone);
    setVesselId(t.vesselId);
    setRouteId(t.routeId);
    setSeatOrDeckClass(t.seatOrDeckClass);
    setSeatNumber(t.seatNumber);
    setDepartureDate(t.departureDate);
    setDepartureTime(t.departureTime || '08:00 WIB');
    setFare(t.fare);
    setPaymentStatus(t.paymentStatus);
    setBoardingStatus(t.boardingStatus);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim() || !idCardNumber.trim()) {
      alert('Nama Penumpang dan Nomor Identitas (NIK/Paspor) wajib diisi.');
      return;
    }

    const selVessel = vessels.find((v) => v.id === vesselId);
    const selRoute = routes.find((r) => r.id === routeId);

    setSaving(true);
    try {
      const ticketId = editingTicket ? editingTicket.id : `tck-${Date.now()}`;
      const payload: PassengerTicket = {
        id: ticketId,
        ticketNumber,
        passengerName: passengerName.trim(),
        idCardNumber: idCardNumber.trim(),
        passengerType,
        gender,
        phone: phone.trim() || '0812xxxxxxxx',
        vesselId,
        vesselName: selVessel ? selVessel.name : 'KM ARS Nusantara Raya',
        routeId,
        routeDescription: selRoute
          ? `${selRoute.originPort} -> ${selRoute.destinationPort}`
          : 'Merak -> Bakauheni',
        seatOrDeckClass,
        seatNumber: seatNumber.trim() || 'E-01',
        departureDate,
        departureTime,
        fare: Number(fare),
        paymentStatus,
        boardingStatus,
        createdAt: editingTicket ? editingTicket.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.savePassenger(payload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan tiket penumpang.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbService.deletePassenger(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus tiket.');
    }
  };

  const filteredTickets = passengerTickets.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(q) ||
      t.passengerName.toLowerCase().includes(q) ||
      t.idCardNumber.toLowerCase().includes(q) ||
      t.vesselName.toLowerCase().includes(q);

    const matchesClass = filterClass === 'ALL' || t.seatOrDeckClass === filterClass;
    const matchesStatus = filterStatus === 'ALL' || t.boardingStatus === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Transaksi Tiket Penumpang & Boarding Pass
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Reservasi tiket kapal penumpang laut, pemilihan kelas (Ekonomi, Bisnis, VIP), alokasi kursi, check-in, dan pencetakan boarding pass resmi.
              </p>
            </div>
          </div>
        </div>

        {canManagePassengers && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Tiket Baru</span>
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
            placeholder="Cari No. Tiket, Nama Penumpang, NIK KTP..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Kelas</option>
            <option value="Economy">Ekonomi</option>
            <option value="Business">Bisnis</option>
            <option value="VIP">VIP</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Semua Status Boarding</option>
            <option value="Booked">Dipesan (Booked)</option>
            <option value="CheckedIn">Check-In</option>
            <option value="Boarded">Naik Kapal (Boarded)</option>
            <option value="Completed">Selesai Berlayar</option>
            <option value="Cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="luxury-card rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Tiket & Penumpang</th>
                <th className="py-3.5 px-4">NIK & Kategori</th>
                <th className="py-3.5 px-4">Kapal & Rute</th>
                <th className="py-3.5 px-4">Kelas & Kursi</th>
                <th className="py-3.5 px-4 text-right">Tarif Tiket</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Tidak ada tiket penumpang yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-100">{t.ticketNumber}</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{t.passengerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Telp: {t.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-300">{t.idCardNumber}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {t.passengerType === 'Adult' ? 'Dewasa' : t.passengerType === 'Child' ? 'Anak' : 'Bayi'} · ({t.gender})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                        <Ship className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{t.vesselName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[170px]">
                        {t.routeDescription}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {t.departureDate} {t.departureTime ? `· ${t.departureTime}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-amber-300">
                        {t.seatOrDeckClass}
                      </div>
                      <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">
                        {t.seatNumber}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-amber-300 text-sm">
                        Rp {t.fare.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {t.paymentStatus === 'Paid' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          t.boardingStatus === 'Boarded'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : t.boardingStatus === 'CheckedIn'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : t.boardingStatus === 'Completed'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : t.boardingStatus === 'Cancelled'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                        }`}
                      >
                        {t.boardingStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onOpenPrint(t)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
                          title="Cetak Boarding Pass"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {canManagePassengers && (
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                            title="Ubah Tiket"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                            title="Hapus Tiket"
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

      {/* Modal Add / Edit Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0A101F] rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/10 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingTicket ? 'Ubah Data Tiket Penumpang' : 'Terbitkan Tiket Penumpang Baru'}
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
                    No. Tiket (Auto)
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={ticketNumber}
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
                    onChange={(e) => {
                      setRouteId(e.target.value);
                      updateFare(e.target.value, seatOrDeckClass);
                    }}
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

              {/* Passenger Details */}
              <div className="p-3.5 bg-slate-900/60 border border-white/[0.06] rounded-xl space-y-3">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                  Data Identitas Penumpang
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-0.5">Nama Lengkap Penumpang *</label>
                    <input
                      type="text"
                      required
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Sesuai KTP / Paspor"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-0.5">Nomor NIK KTP / Paspor *</label>
                    <input
                      type="text"
                      required
                      value={idCardNumber}
                      onChange={(e) => setIdCardNumber(e.target.value)}
                      placeholder="16 Digit NIK"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl font-mono text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-0.5">Kategori</label>
                    <select
                      value={passengerType}
                      onChange={(e) => setPassengerType(e.target.value as PassengerType)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                    >
                      <option value="Adult">Dewasa</option>
                      <option value="Child">Anak-anak</option>
                      <option value="Infant">Bayi (Infant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-0.5">Jenis Kelamin</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                    >
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-0.5">No. HP / WA</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Seat, Class and Pricing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Kelas Kursi
                  </label>
                  <select
                    value={seatOrDeckClass}
                    onChange={(e) => {
                      const newClass = e.target.value as SeatClass;
                      setSeatOrDeckClass(newClass);
                      updateFare(routeId, newClass);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Economy">Ekonomi</option>
                    <option value="Business">Bisnis</option>
                    <option value="VIP">VIP Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Nomor Kursi
                  </label>
                  <input
                    type="text"
                    required
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="Contoh: E-12 / VIP-01"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tarif Tiket (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={fare}
                    onChange={(e) => setFare(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Status Boarding
                  </label>
                  <select
                    value={boardingStatus}
                    onChange={(e) => setBoardingStatus(e.target.value as BoardingStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Booked">Dipesan (Booked)</option>
                    <option value="CheckedIn">Check-In</option>
                    <option value="Boarded">Naik Kapal (Boarded)</option>
                    <option value="Completed">Selesai Berlayar</option>
                    <option value="Cancelled">Batal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Tanggal Keberangkatan
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Jam Keberangkatan
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Contoh: 08:00 WIB"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
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
                  {saving ? 'Menyimpan...' : 'Simpan Tiket'}
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
              <h3 className="font-bold text-base text-white">Hapus Tiket Penumpang?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Yakin membatalkan / menghapus tiket <strong>{deleteTarget.ticketNumber}</strong> a.n. {deleteTarget.passengerName}?
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
