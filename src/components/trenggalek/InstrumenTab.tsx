import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  Briefcase,
  Save,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import {
  MATS,
  MAT,
  CRIT,
  CR,
  VARS,
  VAR,
  ORGS,
  TOTAL_PAIRS,
  CR_LIMIT,
  buildMatrix,
  priority,
  worstPair,
  ratioFromK,
  PairItem,
  RespondentProfile
} from '../../data/trenggalekData';
import { TrenggalekTab } from './Header';

interface InstrumenTabProps {
  myUid: string;
  myProfile: RespondentProfile | null;
  myAhp: Record<string, number>;
  saveMyProfile: (profile: { name: string; org: string; role: string }) => void;
  saveAhpPair: (pairKey: string, kValue: number) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onNavigateTab: (tab: TrenggalekTab) => void;
}

const LVL: Record<number, string> = {
  1: 'sama kuat',
  2: 'sedikit lebih (antara)',
  3: 'sedikit lebih',
  4: 'cukup lebih (antara)',
  5: 'lebih',
  6: 'lebih kuat (antara)',
  7: 'sangat lebih',
  8: 'sangat lebih (antara)',
  9: 'mutlak lebih'
};

export const InstrumenTab: React.FC<InstrumenTabProps> = ({
  myUid,
  myProfile,
  myAhp,
  saveMyProfile,
  saveAhpPair,
  saveStatus,
  onNavigateTab
}) => {
  const [activeStepId, setActiveStepId] = useState<string>('C');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(!myProfile);

  // Profile form state
  const [name, setName] = useState(myProfile?.name || '');
  const [org, setOrg] = useState(myProfile?.org || ORGS[0]);
  const [role, setRole] = useState(myProfile?.role || '');

  const activeMatrix = MAT[activeStepId] || MATS[0];
  const stepIndex = MATS.findIndex((m) => m.id === activeStepId);

  const activeCriterion = activeMatrix.crit ? CR[activeMatrix.crit] : null;

  // Name helper
  const getNameOf = (id: string) => {
    if (VAR[id]) return VAR[id].s;
    if (CR[id]) return `${CR[id].en} · ${CR[id].short}`;
    return id;
  };

  const getFullNameOf = (id: string) => {
    if (VAR[id]) return VAR[id].name;
    if (CR[id]) return `${CR[id].en} (${CR[id].name})`;
    return id;
  };

  // Build matrix for current active step
  const currentBuild = buildMatrix(activeMatrix, myAhp);
  const currentPriority = currentBuild.complete ? priority(currentBuild.A) : null;

  // Total answered across all 33 pairs
  const totalAnswered = Object.keys(myAhp).filter((k) => typeof myAhp[k] === 'number').length;
  const isAllComplete = totalAnswered === TOTAL_PAIRS;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMyProfile({ name: name.trim(), org, role: role.trim() });
    setIsEditingProfile(false);
  };

  const handleDotClick = (pairKey: string, kValue: number) => {
    saveAhpPair(pairKey, kValue);
  };

  const formatPct = (val: number) => `${(val * 100).toFixed(1)}%`;
  const formatNum = (val: number, d: number = 3) => val.toFixed(d);

  // Interpretation helper
  const renderInterpretation = (pair: PairItem, k: number | undefined) => {
    if (typeof k !== 'number') {
      return (
        <span className="text-slate-400 dark:text-slate-500 italic text-xs">
          Pilih salah satu lingkaran untuk membandingkan tingkat pengaruh kedua faktor.
        </span>
      );
    }
    if (k === 0) {
      return (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          <strong className="text-blue-600 dark:text-blue-400">{getNameOf(pair.a)}</strong> dan{' '}
          <strong className="text-indigo-600 dark:text-indigo-400">{getNameOf(pair.b)}</strong>{' '}
          memiliki <strong>pengaruh yang sama</strong> (Nilai: 1).
        </span>
      );
    }
    const winId = k > 0 ? pair.a : pair.b;
    const loseId = k > 0 ? pair.b : pair.a;
    const val = Math.abs(k) + 1;
    const isLeft = k > 0;

    return (
      <span className="text-xs text-slate-700 dark:text-slate-300">
        <strong className={isLeft ? 'text-blue-600 dark:text-blue-400' : 'text-indigo-600 dark:text-indigo-400'}>
          {getNameOf(winId)}
        </strong>{' '}
        <span className="font-semibold text-slate-900 dark:text-white">
          {LVL[val]} berpengaruh
        </span>{' '}
        dibanding {getNameOf(loseId)} (Skala Saaty: <span className="font-mono font-bold">{val}</span>).
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Overview */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Info className="w-4 h-4" />
            Instrumen Pembobotan Analytic Hierarchy Process (AHP)
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Penilaian Perbandingan Berpasangan (Pairwise Comparison)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Tentukan faktor mana yang lebih kuat memicu kenaikan Indeks Gini Kabupaten Trenggalek beserta intensitas pengaruhnya (skala 1–9 Saaty).
          </p>
        </div>

        {/* Profile Card & Edit Button */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900 dark:text-white">
              {myProfile?.name || 'Responden Baru'}
            </div>
            <div className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
              {myProfile?.org || 'Klik untuk melengkapi data'}
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition"
          >
            Ubah
          </button>
        </div>
      </div>

      {/* Profile Modal / Drawer */}
      {isEditingProfile && (
        <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl animate-in fade-in duration-150">
          <div className="max-w-xl">
            <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200 mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Identitas Responden / Stakeholder
            </h3>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mb-4">
              Identitas digunakan untuk mengelompokkan perspektif (Perangkat Daerah, BPS, Akademisi, UMKM, Masyarakat) dan menguji konsistensi agregat.
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Rina Wulandari, S.E."
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instansi / Unsur Stakeholder
                  </label>
                  <select
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {ORGS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan / Peran
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="mis. Kepala Bidang / Dosen"
                    className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                >
                  Simpan & Mulai Mengisi
                </button>
                {myProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step Navigator across the 7 matrices */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MATS.map((m, idx) => {
          const mb = buildMatrix(m, myAhp);
          const pr = mb.complete ? priority(mb.A) : null;
          const crit = m.crit ? CR[m.crit] : null;
          const isActive = activeStepId === m.id;

          return (
            <button
              key={m.id}
              onClick={() => setActiveStepId(m.id)}
              className={`flex-none text-left p-3 rounded-xl border transition min-w-[150px] ${
                isActive
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}>
                  {crit ? `${crit.en} (${crit.short})` : 'Kriteria 6M'}
                </span>
                {mb.complete && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {mb.answered}/{mb.total} terisi
                {pr && (
                  <span className={`ml-1 font-mono font-semibold ${pr.cr <= CR_LIMIT ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    · CR {formatNum(pr.cr, 2)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Work Grid: Pairs list on left, sticky live diagnostic on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pairwise comparisons */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeCriterion ? (
                  <span>
                    Sub-Kriteria: <span className="text-blue-600 dark:text-blue-400">{activeCriterion.en}</span> · {activeCriterion.name}
                  </span>
                ) : (
                  <span>Perbandingan Kriteria Utama (Kategori 6M)</span>
                )}
              </h3>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {currentBuild.answered}/{currentBuild.total} Terisi
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeCriterion
                ? `${activeCriterion.desc} Bandingkan ketiga variabel di bawah untuk menentukan prioritas lokal.`
                : 'Bandingkan 6 kategori penyebab utama untuk menentukan bobot kriteria AHP.'}
            </p>
          </div>

          {/* Pairs List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeMatrix.pairs.map((pair, pIdx) => {
              const currentK = myAhp[pair.key];

              return (
                <div key={pair.key} className="py-5 space-y-3">
                  {/* Pair Header: Option A vs Option B */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                    {/* Option A (Left) */}
                    <div className="md:col-span-5 text-left">
                      <div className="font-bold text-sm text-blue-700 dark:text-blue-400">
                        {getFullNameOf(pair.a)}
                      </div>
                      {VAR[pair.a] && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2" title={VAR[pair.a].def}>
                          {VAR[pair.a].def}
                        </p>
                      )}
                    </div>

                    {/* VS Badge */}
                    <div className="md:col-span-1 text-center">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
                        VS
                      </span>
                    </div>

                    {/* Option B (Right) */}
                    <div className="md:col-span-5 md:text-right">
                      <div className="font-bold text-sm text-indigo-700 dark:text-indigo-400">
                        {getFullNameOf(pair.b)}
                      </div>
                      {VAR[pair.b] && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 md:text-right" title={VAR[pair.b].def}>
                          {VAR[pair.b].def}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 17-Dot Interactive Comparison Scale */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-1 sm:gap-2 px-1">
                      {Array.from({ length: 17 }).map((_, i) => {
                        const kk = 8 - i; // from +8 down to -8
                        const val = Math.abs(kk) + 1;
                        const isSelected = currentK === kk;
                        const isLeft = kk > 0;
                        const isCenter = kk === 0;

                        // Dot sizing & styling based on distance from center
                        const sizePx = 14 + Math.abs(kk) * 1.8;

                        return (
                          <button
                            key={kk}
                            type="button"
                            onClick={() => handleDotClick(pair.key, kk)}
                            className="flex flex-col items-center justify-center py-2 flex-1 group transition focus:outline-hidden"
                            title={
                              isCenter
                                ? 'Sama berpengaruh (1)'
                                : isLeft
                                ? `${getNameOf(pair.a)} lebih berpengaruh (${val})`
                                : `${getNameOf(pair.b)} lebih berpengaruh (${val})`
                            }
                          >
                            <span
                              className={`rounded-full transition-all duration-150 flex items-center justify-center border-2 ${
                                isSelected
                                  ? isCenter
                                    ? 'bg-slate-600 border-slate-600 ring-2 ring-slate-300 dark:ring-slate-700'
                                    : isLeft
                                    ? 'bg-blue-600 border-blue-600 ring-2 ring-blue-300 dark:ring-blue-800'
                                    : 'bg-indigo-600 border-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-800'
                                  : isCenter
                                  ? 'border-slate-400/80 bg-transparent group-hover:bg-slate-200 dark:group-hover:bg-slate-800'
                                  : isLeft
                                  ? 'border-blue-400/80 bg-transparent group-hover:bg-blue-100 dark:group-hover:bg-blue-950'
                                  : 'border-indigo-400/80 bg-transparent group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950'
                              }`}
                              style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                            />
                            <span
                              className={`mt-1 font-mono text-[10px] ${
                                isSelected
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {val}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Scale endpoints indicator */}
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-2 pt-1">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        ← Mutlak {getNameOf(pair.a)} (9)
                      </span>
                      <span>Sama (1)</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Mutlak {getNameOf(pair.b)} (9) →
                      </span>
                    </div>

                    {/* Immediate Indonesian verbal interpretation */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      {renderInterpretation(pair, currentK)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation between steps */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (stepIndex > 0) setActiveStepId(MATS[stepIndex - 1].id);
              }}
              disabled={stepIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {stepIndex < MATS.length - 1 ? (
              <button
                onClick={() => {
                  setActiveStepId(MATS[stepIndex + 1].id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
              >
                <span>Bagian Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('konfirmasi')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
              >
                <span>Lanjut ke Konfirmasi Indikator</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Live Diagnostic Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Hasil Sementara Anda
                </h4>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {totalAnswered}/{TOTAL_PAIRS} Total
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(totalAnswered / TOTAL_PAIRS) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Matrix Result */}
            {!currentBuild.complete ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                Lengkapi <strong>{currentBuild.total - currentBuild.answered}</strong> perbandingan lagi pada bagian ini untuk melihat hasil bobot lokal dan uji rasio konsistensi (CR).
              </div>
            ) : currentPriority ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Bobot Prioritas Anda ({activeMatrix.title}):
                  </div>
                  {activeMatrix.items.map((id, idx) => {
                    const w = currentPriority.w[idx];
                    return (
                      <div key={id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300 truncate">
                            {getNameOf(id)}
                          </span>
                          <span className="font-mono text-slate-900 dark:text-white">
                            {formatPct(w)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${w * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Consistency Score Badge */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Rasio Konsistensi (CR):</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        currentPriority.cr <= CR_LIMIT
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      {formatNum(currentPriority.cr, 3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>λmaks: {formatNum(currentPriority.lmax, 3)}</span>
                    <span>CI: {formatNum(currentPriority.ci, 3)}</span>
                  </div>

                  {(() => {
                    if (currentPriority.cr <= CR_LIMIT) {
                      return (
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Penilaian Anda konsisten secara matematis (CR ≤ 0,10).</span>
                        </div>
                      );
                    }
                    const wp = worstPair(activeMatrix, currentBuild.A, currentPriority.w);
                    if (!wp) return null;
                    return (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-700 dark:text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Saran Perbaikan Konsistensi
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Periksa kembali perbandingan antara <strong>{getNameOf(wp.pair.a)}</strong> dan{' '}
                          <strong>{getNameOf(wp.pair.b)}</strong>. Nilai saat ini: {formatNum(wp.given, 1)}, sedangkan nilai yang selaras dengan pilihan lain adalah sekitar {formatNum(wp.implied, 1)}.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : null}

            {/* If all 33 complete */}
            {isAllComplete && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-4 h-4" />
                    Instrumen 100% Selesai!
                  </div>
                  <p className="text-[11px]">
                    Seluruh 33 perbandingan telah lengkap dan tersinkronisasi ke hasil kelompok. Lanjutkan ke tahap konfirmasi indikator.
                  </p>
                  <button
                    onClick={() => onNavigateTab('konfirmasi')}
                    className="w-full py-1.5 text-center font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Buka Konfirmasi Indikator
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
