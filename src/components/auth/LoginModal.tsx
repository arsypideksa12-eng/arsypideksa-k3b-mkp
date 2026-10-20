import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, ShieldAlert, CheckCircle, KeyRound, Anchor } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginWithCredentials, loginWithGoogle, loginAsPreset, loading } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrUser.trim() || !password) {
      setErrorMessage('Harap masukkan Username/Email dan Password.');
      return;
    }

    const res = await loginWithCredentials(emailOrUser, password);
    if (res.success) {
      setSuccessMessage('Login berhasil! Mengalihkan ke sistem...');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.message || 'Login gagal. Periksa kembali kredensial Anda.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const res = await loginWithGoogle();
    if (res.success) {
      setSuccessMessage('Login dengan akun Google berhasil!');
      setTimeout(() => onClose(), 600);
    } else if (res.message) {
      setErrorMessage(res.message);
    }
  };

  const handleQuickPreset = (role: 'super_admin' | 'cargo_officer' | 'ticket_agent') => {
    loginAsPreset(role);
    setSuccessMessage(`Login berhasil sebagai ${role === 'super_admin' ? 'Super Admin' : role === 'cargo_officer' ? 'Operator Muatan' : 'Petugas Tiket'}!`);
    setTimeout(() => onClose(), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#090E1C] rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header with Insignia */}
        <div className="px-6 py-6 bg-gradient-to-b from-[#111A30] to-[#090E1C] border-b border-white/10 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/40 shadow-md shrink-0">
              <img
                src="/src/assets/images/vessel_fleet_insignia_1792469529727.jpg"
                alt="ARS Insignia"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-crest font-bold text-base text-white tracking-wide">
                PORTAL ADMIN ARS
              </h3>
              <p className="text-xs text-amber-400/90 font-medium">ARS Logistic & Passenger Service</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Username atau Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="admin@arslogistic.com atau pideksaarsy1206@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full pl-10 pr-12 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? 'Tutup' : 'Lihat'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Memproses Otentikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[11px] font-medium uppercase tracking-wider">
              Akses Cepat Pengujian
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Quick preset logins */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPreset('super_admin')}
              className="p-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold transition text-center"
            >
              <div className="font-bold text-[11px]">Super Admin</div>
              <div className="text-[9px] text-amber-400/70">Akses Penuh</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('cargo_officer')}
              className="p-2 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl text-xs font-semibold transition text-center"
            >
              <div className="font-bold text-[11px]">Petugas Kargo</div>
              <div className="text-[9px] text-blue-400/70">Logistik Kapal</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('ticket_agent')}
              className="p-2 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold transition text-center"
            >
              <div className="font-bold text-[11px]">Petugas Tiket</div>
              <div className="text-[9px] text-indigo-400/70">Loket & Pax</div>
            </button>
          </div>

          {/* Google Firebase Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-xl transition flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Google (Firebase Auth)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
