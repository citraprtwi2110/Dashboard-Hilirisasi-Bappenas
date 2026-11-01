import React, { useState } from 'react';
import { X, Copy, Check, Globe, Share2, ExternalLink, QrCode } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  // The published preview or current URL
  const publicUrl = window.location.origin;
  const standaloneUrl = `${window.location.origin}/assets/aistudio/ahp-dashboard-trenggalek-standalone_7e804fdb.html`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const whatsappMessage = encodeURIComponent(
    `Bapak/Ibu Stakeholder Kabupaten Trenggalek, mohon berkenan mengisi instrumen Penilaian AHP Prioritas Kenaikan Indeks Gini & Kesejahteraan Ekonomi 2026 melalui tautan online berikut (gratis & langsung tersinkron): ${publicUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bagikan Akses Publik</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akses bebas (free & public) untuk responden, tim Bapperida, & masyarakat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tautan Utama Dasbor & Survei Interaktif
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-700 dark:text-slate-300 select-all"
              />
              <button
                onClick={() => handleCopy(publicUrl)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold">Bebas Akses Tanpa Login:</span> Responden tidak perlu akun khusus atau instalasi. Begitu membuka tautan, mereka dapat mengisi profil, memberikan penilaian 33 perbandingan AHP, serta mengonfirmasi indikator Fishbone secara mandiri.
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Opsi Distribusi Cepat
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
              >
                Bagikan via WhatsApp
              </a>

              <a
                href={standaloneUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Versi HTML Mandiri
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
