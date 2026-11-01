import React, { useState } from 'react';
import {
  X,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  LogOut,
  ShieldCheck,
  Clock
} from 'lucide-react';
import {
  googleSignIn,
  logoutGoogle,
  backupResponsesToDrive,
  BackupResult
} from '../../utils/googleDriveBackup';
import { RespondentEntry } from '../../utils/fgdAhp';
import { User } from 'firebase/auth';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RespondentEntry[];
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  lastBackup: BackupResult | null;
  onBackupSuccess: (result: BackupResult) => void;
  autoBackup: boolean;
  onToggleAutoBackup: (val: boolean) => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentUser,
  onUserChange,
  lastBackup,
  onBackupSuccess,
  autoBackup,
  onToggleAutoBackup
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<BackupResult | null>(lastBackup);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onUserChange(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutGoogle();
      onUserChange(null);
      setSuccessResult(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformBackup = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await backupResponsesToDrive(entries, currentUser?.email || 'cpcitper@gmail.com');
      setSuccessResult(result);
      onBackupSuccess(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencadangkan data ke Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cadangkan ke Google Drive</h3>
              <p className="text-xs text-slate-500">
                Simpan seluruh data jawaban kuesioner ke akun Drive Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          {/* Target Account Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Akun Target:</span>
              <span className="font-mono font-bold text-slate-900">
                {currentUser?.email || 'cpcitper@gmail.com'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-slate-500">
              <span>Total Jawaban Saat Ini:</span>
              <span className="font-bold text-teal-800 font-mono">{entries.length} Responden</span>
            </div>
          </div>

          {/* Authentication State */}
          {!currentUser ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Untuk mencadangkan seluruh data jawaban ke Google Drive akun Anda, silakan hubungkan akun Google di bawah ini:
              </p>

              {/* Official Google Sign-in Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                )}
                <span>Masuk dengan Google ({loading ? 'Menghubungkan…' : 'Google Drive'})</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-semibold text-teal-900">
                    Terhubung sebagai: {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  title="Keluar"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar</span>
                </button>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePerformBackup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HardDrive className="w-4 h-4" />
                )}
                <span>
                  {loading ? 'Mengunggah ke Google Drive…' : 'Cadangkan Seluruh Jawaban Sekarang'}
                </span>
              </button>

              {/* Auto-backup toggle */}
              <label className="flex items-center gap-2.5 pt-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => onToggleAutoBackup(e.target.checked)}
                  className="w-4 h-4 text-teal-800 rounded focus:ring-teal-700"
                />
                <span>
                  Pencadangan otomatis setiap ada jawaban responden baru yang tersimpan
                </span>
              </label>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Status */}
          {successResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pencadangan Berhasil Disimpan ke Google Drive</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Berkas: <span className="font-mono font-semibold">{successResult.name}</span> ({successResult.totalEntries} responden)
              </p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-700">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Waktu: {successResult.timestamp}
                </span>
                {successResult.webViewLink && (
                  <a
                    href={successResult.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-teal-800 hover:underline"
                  >
                    <span>Buka di Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
