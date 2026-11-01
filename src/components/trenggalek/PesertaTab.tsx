import React, { useState } from 'react';
import {
  Users,
  Settings,
  Trash2,
  Share2,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  Award,
  Globe
} from 'lucide-react';
import {
  TOTAL_PAIRS,
  VARS,
  CR_LIMIT,
  AhpComputationResult,
  TrenggalekConfig,
  TrenggalekState
} from '../../data/trenggalekData';

interface PesertaTabProps {
  state: TrenggalekState;
  ahpResult: AhpComputationResult;
  updateConfig: (config: Partial<TrenggalekConfig>) => void;
  deleteRespondent: (uid: string) => void;
  resetAllData: () => void;
  onOpenShare: () => void;
}

export const PesertaTab: React.FC<PesertaTabProps> = ({
  state,
  ahpResult,
  updateConfig,
  deleteRespondent,
  resetAllData,
  onOpenShare
}) => {
  const [targetVal, setTargetVal] = useState<number>(state.config.target || 12);
  const [thresholdVal, setThresholdVal] = useState<number>(
    Math.round((state.config.threshold || 0.7) * 100)
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  const respondentsList = Object.entries(state.respondents);
  const publicUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = () => {
    updateConfig({
      target: targetVal,
      threshold: thresholdVal / 100
    });
  };

  const handleWeightChange = (uid: string, weight: number) => {
    const currentWeights = { ...(state.config.weights || {}) };
    currentWeights[uid] = weight;
    updateConfig({ weights: currentWeights });
  };

  const formatNum = (val: number, d: number = 2) => val.toFixed(d);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Manajemen Stakeholder & Parameter Survei
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Peserta, Bobot Pakar, & Pengaturan Kesepakatan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Daftar responden yang berpartisipasi, verifikasi konsistensi isian, penyesuaian bobot keahlian (expert weighting), serta konfigurasi target survei publik.
          </p>
        </div>

        <button
          onClick={onOpenShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan Tautan Survei</span>
        </button>
      </div>

      {/* Share Box for Public Free Access */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40 mb-2">
              <Globe className="w-3.5 h-3.5" /> Akses Publik Terbuka (Free & Online)
            </span>
            <h3 className="text-base sm:text-lg font-bold">
              Siap Disebarkan ke Pemangku Kepentingan
            </h3>
            <p className="text-xs text-blue-100/90 max-w-2xl mt-0.5">
              Siapa saja dapat membuka dasbor ini melalui peramban HP atau laptop, mengisi penilaian perbandingan, dan langsung tercatat ke dalam hasil sintesis AHP kelompok.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/60 p-2 rounded-xl border border-blue-400/30 shrink-0">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="text-xs font-mono bg-transparent text-white border-0 focus:outline-hidden px-2 select-all w-52 sm:w-64"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Study Configuration */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Parameter Kajian & Kesepakatan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konfigurasi ambang penerimaan indikator dan target responden
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Jumlah Responden:
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={targetVal}
                onChange={(e) => setTargetVal(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Ambang Lolos Indikator:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {thresholdVal}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={thresholdVal}
                onChange={(e) => setThresholdVal(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Indikator dengan skor kesepakatan K ≥ ambang ini dinyatakan lolos masuk ke Fishbone.
              </span>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
            >
              Simpan Pengaturan
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                if (window.confirm('Reset seluruh data survei ke data simulasi awal?')) {
                  resetAllData();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Contoh Bapperida Awal</span>
            </button>
          </div>
        </div>

        {/* Right: Respondents Directory Table */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Responden ({respondentsList.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur bobot relatif keahlian responden (1,0 = standar seimbang)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Nama & Instansi</th>
                  <th className="py-2.5 px-2">AHP</th>
                  <th className="py-2.5 px-2">CR</th>
                  <th className="py-2.5 px-2">Konfirmasi</th>
                  <th className="py-2.5 px-2">Bobot</th>
                  <th className="py-2.5 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {respondentsList.map(([uid, r]) => {
                  const prog = ahpResult.prog[uid];
                  const conf = state.confirm[uid];
                  const confCount = conf?.votes ? Object.keys(conf.votes).length : 0;
                  const maxCr = prog?.maxCR;
                  const currentWeight = state.config.weights?.[uid] ?? 1;

                  return (
                    <tr key={uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {r.org} · {r.role}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {prog?.answered || 0}/{TOTAL_PAIRS}
                      </td>
                      <td className="py-3 px-2">
                        {maxCr != null ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              maxCr <= CR_LIMIT
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {formatNum(maxCr, 2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">–</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {confCount}/{VARS.length}
                        {conf?.submitted && (
                          <span className="ml-1 text-[10px] text-emerald-600 font-bold">✓</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={currentWeight}
                          onChange={(e) => handleWeightChange(uid, parseFloat(e.target.value))}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono p-1"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="1">1.0x (Normal)</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2.0x (Pakar)</option>
                          <option value="3">3.0x (Utama)</option>
                        </select>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => setDeleteCandidate(uid)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Hapus responden ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Delete confirmation banner if triggered */}
          {deleteCandidate && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs flex items-center justify-between gap-3 text-red-900 dark:text-red-200">
              <span>
                Hapus responden <strong>{state.respondents[deleteCandidate]?.name}</strong> beserta seluruh penilaiannya?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    deleteRespondent(deleteCandidate);
                    setDeleteCandidate(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                >
                  Ya, Hapus
                </button>
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
