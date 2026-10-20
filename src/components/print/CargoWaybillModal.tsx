import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { CargoManifest } from '../../types';
import { Printer, X, Ship, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  cargo: CargoManifest;
  onClose: () => void;
}

export const CargoWaybillModal: React.FC<Props> = ({ cargo, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR code for tracking verification
    const verificationUrl = `https://ars-logistic.id/track/${cargo.trackingNumber}`;
    QRCode.toDataURL(verificationUrl, { width: 140, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [cargo]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#090E1C] text-white border-b border-white/10 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-crest font-bold text-base sm:text-lg tracking-wide text-white">
                SURAT MUATAN KAPAL LAUT (BILL OF LADING)
              </h3>
              <p className="text-xs text-amber-400/90 font-mono">No. Resi: {cargo.trackingNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div ref={printAreaRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white print:p-0 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm shrink-0">
                <img
                  src="/src/assets/images/vessel_fleet_insignia_1792469529727.jpg"
                  alt="ARS Insignia"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-crest tracking-tight text-slate-950">
                  ARS LOGISTIC & PASSENGER SERVICE
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  PT. ARS Samudra Nusantara Perkasa · Divisi Angkutan Laut & Logistik Terpadu
                </p>
                <p className="text-[11px] text-slate-500">
                  Pelabuhan Utama Nusantara · Izin Trayek Kemenhub RI: SK.094/AL.02/PHB-2024
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase rounded bg-slate-900 text-amber-300 mb-1">
                BILL OF LADING / RESI MUATAN
              </span>
              <div className="font-mono font-bold text-lg text-slate-900">{cargo.trackingNumber}</div>
              <div className="text-xs text-slate-500">Tgl Terbit: {new Date(cargo.createdAt).toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          {/* Shipper & Consignee Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PENGIRIM (SHIPPER)
              </div>
              <div className="font-bold text-sm text-slate-900">{cargo.shipperName}</div>
              <div className="text-slate-600 mt-1 flex items-center space-x-1.5">
                <span>Telp / WA:</span>
                <span className="font-mono font-semibold">{cargo.shipperPhone}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PENERIMA (CONSIGNEE)
              </div>
              <div className="font-bold text-sm text-slate-900">{cargo.consigneeName}</div>
              <div className="text-slate-600 mt-1 flex items-center space-x-1.5">
                <span>Telp / WA:</span>
                <span className="font-mono font-semibold">{cargo.consigneePhone}</span>
              </div>
            </div>
          </div>

          {/* Voyage & Ship Details */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-50/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-[10px] text-amber-800 font-bold uppercase">Kapal Pengangkut</div>
              <div className="font-bold text-slate-900 mt-0.5">{cargo.vesselName}</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-800 font-bold uppercase">Rute Pelayaran</div>
              <div className="font-bold text-slate-900 mt-0.5">{cargo.routeDescription}</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-800 font-bold uppercase">Jadwal Berangkat</div>
              <div className="font-bold text-slate-900 mt-0.5">{cargo.departureDate}</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-800 font-bold uppercase">Status Muatan</div>
              <div className="font-bold text-slate-900 mt-0.5 uppercase flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{cargo.shippingStatus}</span>
              </div>
            </div>
          </div>

          {/* Cargo Item Specifications Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Deskripsi Muatan</th>
                  <th className="py-2.5 px-3">Kontainer / No. Pol</th>
                  <th className="py-2.5 px-3 text-right">Berat (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Volume (M³)</th>
                  <th className="py-2.5 px-3 text-right">Total Ongkir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">{cargo.cargoType}</td>
                  <td className="py-3 px-3 max-w-xs">{cargo.itemDescription}</td>
                  <td className="py-3 px-3 font-mono">{cargo.containerOrPlateNumber || '-'}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium">{cargo.weightKg.toLocaleString('id-ID')} Kg</td>
                  <td className="py-3 px-3 text-right font-mono">{cargo.volumeM3 ? `${cargo.volumeM3} M³` : '-'}</td>
                  <td className="py-3 px-3 text-right font-bold text-sm text-slate-950 font-mono">
                    Rp {cargo.totalCost.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment & Security Footer with QR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 items-center">
            {/* QR Code */}
            <div className="flex items-center space-x-3">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Verifikasi Resi"
                  className="w-24 h-24 border border-slate-200 rounded-xl p-1 bg-white"
                />
              )}
              <div className="text-[11px] text-slate-500">
                <p className="font-semibold text-slate-800">QR Validasi Digital</p>
                <p>Pindai untuk verifikasi status muatan secara realtime.</p>
                <span className="inline-block mt-1 font-mono font-bold text-amber-700">
                  Status Bayar: {cargo.paymentStatus}
                </span>
              </div>
            </div>

            {/* Terms & Notes */}
            <div className="text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 uppercase">Ketentuan Pengangkutan:</p>
              <p>1. Barang telah diperiksa sesuai standar keselamatan pelayaran RI.</p>
              <p>2. Pengangkut tidak bertanggung jawab atas susut muatan alami.</p>
              <p>3. Pengambilan barang wajib menunjukkan dokumen asli ini.</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-around text-center text-[11px] pt-4">
              <div>
                <p className="text-slate-500 mb-10">Petugas Muatan ARS</p>
                <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Operasional Dermaga )</p>
              </div>
              <div>
                <p className="text-slate-500 mb-10">Pengirim / Shipper</p>
                <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
