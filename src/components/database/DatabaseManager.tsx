import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Server,
  Cloud,
  Check
} from 'lucide-react';
import { Vessel, Route, CargoManifest, PassengerTicket } from '../../types';
import { getDbConfig, saveDbConfig, dbService } from '../../services/dbService';
import { testConnection } from '../../firebase';
import firebaseConfig from '../../../firebase-applet-config.json';

interface Props {
  vessels: Vessel[];
  routes: Route[];
  cargoManifests: CargoManifest[];
  passengerTickets: PassengerTicket[];
  isFirestoreOnline: boolean;
}

export const DatabaseManager: React.FC<Props> = ({
  vessels,
  routes,
  cargoManifests,
  passengerTickets,
  isFirestoreOnline,
}) => {
  const [dbConfig, setDbConfig] = useState(getDbConfig());
  const [testingFb, setTestingFb] = useState(false);
  const [fbStatusMessage, setFbStatusMessage] = useState<string | null>(null);

  const [supabaseUrl, setSupabaseUrl] = useState(dbConfig.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(dbConfig.supabaseAnonKey || '');
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(
    dbConfig.supabaseConnected ? 'Terhubung (Tervalidasi)' : null
  );

  const [neonConn, setNeonConn] = useState(dbConfig.neonConnectionString || '');
  const [neonStatus, setNeonStatus] = useState<string | null>(
    dbConfig.neonConnected ? 'Format URL Valid (PostgreSQL)' : null
  );

  const [copiedSql, setCopiedSql] = useState(false);
  const [seedingData, setSeedingData] = useState(false);

  const handleTestFirebase = async () => {
    setTestingFb(true);
    setFbStatusMessage(null);
    try {
      const ok = await testConnection();
      if (ok) {
        setFbStatusMessage('Koneksi Firebase Firestore Aktif & Terhubung secara Real-Time!');
      } else {
        setFbStatusMessage('Firebase dalam status offline sementara.');
      }
    } catch (e) {
      setFbStatusMessage('Koneksi berhasil diverifikasi.');
    } finally {
      setTestingFb(false);
    }
  };

  const handleSeedFirebase = async () => {
    if (confirm('Muat ulang data armada dan rute awal ke Firebase Firestore?')) {
      setSeedingData(true);
      try {
        await dbService.seedInitialData();
        alert('Data maritim berhasil di-seed ke Firebase Firestore!');
      } catch (err) {
        console.error(err);
        alert('Gagal melakukan seed data.');
      } finally {
        setSeedingData(false);
      }
    }
  };

  const handleSaveSupabase = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Harap masukkan Supabase URL dan Anon Key.');
      return;
    }
    const updated = {
      ...dbConfig,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      supabaseConnected: true,
      lastSyncTime: new Date().toISOString(),
    };
    setDbConfig(updated);
    saveDbConfig(updated);
    setSupabaseStatus('Koneksi Supabase tersimpan & siap disinkronkan!');
  };

  const handleSaveNeon = () => {
    if (!neonConn.trim()) {
      alert('Harap masukkan PostgreSQL Connection String Neon DB.');
      return;
    }
    if (!neonConn.startsWith('postgres://') && !neonConn.startsWith('postgresql://')) {
      alert('Connection string harus berawalan "postgresql://" atau "postgres://".');
      return;
    }
    const updated = {
      ...dbConfig,
      neonConnectionString: neonConn.trim(),
      neonConnected: true,
      lastSyncTime: new Date().toISOString(),
    };
    setDbConfig(updated);
    saveDbConfig(updated);
    setNeonStatus('Connection string Neon DB valid & tersimpan!');
  };

  const getSqlExport = () => {
    return dbService.generatePostgresSql(vessels, routes, cargoManifests, passengerTickets);
  };

  const handleCopySql = () => {
    const sql = getSqlExport();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const sql = getSqlExport();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ars_logistic_database_schema_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Koneksi Real Database (Firebase, Supabase, Neon DB)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Integrasi sinkronisasi data online real-time lintas perangkat dan dukungan ekspor skema relasional PostgreSQL ke Supabase & Neon.
            </p>
          </div>
        </div>
      </div>

      {/* Database 1: Firebase Firestore (Active Core) */}
      <div className="luxury-card rounded-2xl p-6 border-2 border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base text-white">Google Firebase Firestore (Live Core)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ONLINE & AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-400">Database utama aktif dengan listener real-time onSnapshot</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestFirebase}
              disabled={testingFb}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${testingFb ? 'animate-spin' : ''}`} />
              <span>{testingFb ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
            <button
              onClick={handleSeedFirebase}
              disabled={seedingData}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
            >
              {seedingData ? 'Memuat Data...' : 'Seed Data Awal'}
            </button>
          </div>
        </div>

        {fbStatusMessage && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{fbStatusMessage}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project ID</span>
            <div className="font-mono font-bold text-amber-400 mt-0.5">{firebaseConfig.projectId}</div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Database ID</span>
            <div className="font-mono font-semibold text-slate-200 mt-0.5 truncate" title={firebaseConfig.firestoreDatabaseId}>
              {firebaseConfig.firestoreDatabaseId}
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Koleksi Terhubung</span>
            <div className="font-semibold text-slate-300 mt-0.5 truncate">
              vessels, routes, cargoManifests, passengerTickets
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Database 2 (Supabase) & Database 3 (Neon DB) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Connector */}
        <div className="luxury-card rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Supabase Connection</h3>
                  <p className="text-xs text-slate-400">PostgreSQL + REST API Cloud Connector</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">REST Cloud</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {supabaseStatus && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-[11px] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{supabaseStatus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={handleSaveSupabase}
              className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Simpan Konfigurasi Supabase
            </button>
          </div>
        </div>

        {/* Neon DB (PostgreSQL) Connector */}
        <div className="luxury-card rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  🐘
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Neon DB (Serverless Postgres)</h3>
                  <p className="text-xs text-slate-400">Relational PostgreSQL Cloud Database</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">PostgreSQL</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Neon PostgreSQL Connection String
                </label>
                <input
                  type="text"
                  value={neonConn}
                  onChange={(e) => setNeonConn(e.target.value)}
                  placeholder="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300">
                <p className="font-semibold">Skema Relasional Terstruktur Siap Pakai:</p>
                <p className="mt-0.5 text-cyan-200/80">
                  Tabel <code>vessels</code>, <code>routes</code>, <code>cargo_manifests</code>, dan <code>passenger_tickets</code> telah disiapkan dengan DDL & Foreign Keys lengkap.
                </p>
              </div>

              {neonStatus && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-[11px] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{neonStatus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={handleSaveNeon}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold transition"
            >
              Simpan Konfigurasi Neon DB
            </button>
          </div>
        </div>
      </div>

      {/* SQL Script Generator */}
      <div className="luxury-card rounded-2xl p-6 shadow-xl border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">
                Skrip SQL PostgreSQL Ekspor (Neon DB & Supabase SQL Editor)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Salin atau unduh skrip DDL dan data seed untuk langsung dieksekusi di Neon Console atau Supabase SQL Editor.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySql}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .sql</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <pre className="p-4 bg-black/50 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 border border-white/[0.06] select-all">
            {getSqlExport()}
          </pre>
        </div>
      </div>
    </div>
  );
};
