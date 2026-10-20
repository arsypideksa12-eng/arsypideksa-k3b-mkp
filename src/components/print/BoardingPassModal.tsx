import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { PassengerTicket } from '../../types';
import { Printer, X, Ticket, Ship, CheckCircle2 } from 'lucide-react';

interface Props {
  ticket: PassengerTicket;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<Props> = ({ ticket, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyString = `ARS-PASS-${ticket.ticketNumber}-${ticket.passengerName}-${ticket.seatNumber}`;
    QRCode.toDataURL(verifyString, { width: 140, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [ticket]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#090E1C] text-white border-b border-white/10 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-crest font-bold text-base text-white tracking-wide">
                BOARDING PASS & TIKET PENUMPANG
              </h3>
              <p className="text-xs text-amber-400 font-mono">No. Tiket: {ticket.ticketNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Boarding Pass</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Boarding Pass Body */}
        <div ref={printAreaRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white print:p-0">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-gradient-to-br from-amber-50/20 via-white to-slate-50 relative">
            {/* Cut line indicators */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm shrink-0">
                  <img
                    src="/src/assets/images/vessel_fleet_insignia_1792469529727.jpg"
                    alt="ARS Crest"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-crest font-black text-lg text-slate-950 tracking-tight">
                    ARS PASSENGER SERVICE
                  </h2>
                  <p className="text-xs text-slate-500">Boarding Pass Resmi Angkutan Laut Penumpang</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-lg">
                  KELAS {ticket.seatOrDeckClass.toUpperCase()}
                </span>
                <p className="font-mono text-xs text-slate-600 mt-1 font-semibold">{ticket.ticketNumber}</p>
              </div>
            </div>

            {/* Main Passenger Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
              <div className="col-span-2">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Nama Lengkap Penumpang</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{ticket.passengerName}</p>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  NIK: {ticket.idCardNumber} · ({ticket.passengerType} - {ticket.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                </p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Nomor Kursi / Dek</p>
                <p className="text-2xl font-black text-amber-600 mt-0.5 font-mono">{ticket.seatNumber}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Tarif Tiket</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  Rp {ticket.fare.toLocaleString('id-ID')}
                </p>
                <span className="inline-block text-[10px] text-emerald-600 font-bold">LUNAS</span>
              </div>
            </div>

            {/* Voyage Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Armada Kapal</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center space-x-1.5">
                  <Ship className="w-4 h-4 text-amber-600" />
                  <span>{ticket.vesselName}</span>
                </p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Rute Perjalanan</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{ticket.routeDescription}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Jadwal Berangkat</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {ticket.departureDate} {ticket.departureTime ? `· ${ticket.departureTime}` : ''}
                </p>
              </div>
            </div>

            {/* Verification and Barcode */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <div className="flex items-center space-x-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Boarding Pass"
                    className="w-20 h-20 border border-slate-200 rounded-xl p-1 bg-white"
                  />
                )}
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status: {ticket.boardingStatus.toUpperCase()}</span>
                  </p>
                  <p>Tunjukkan boarding pass ini di pintu masuk dermaga dan kapal.</p>
                  <p className="font-mono text-[10px] text-slate-400">Security Gate Scan Code Valid</p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                <p className="font-mono tracking-widest text-slate-700 font-bold">|||||||||||||||||||||||||||||||</p>
                <p>{ticket.ticketNumber}</p>
                <p className="text-[10px] text-slate-400 mt-1">Harap hadir 60 menit sebelum keberangkatan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
