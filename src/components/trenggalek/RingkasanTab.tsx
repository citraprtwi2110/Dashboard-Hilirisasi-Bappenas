import React from 'react';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  CRIT,
  CR,
  VARS,
  VAR,
  TOTAL_PAIRS,
  CR_LIMIT,
  AhpComputationResult,
  ConfirmComputationResult,
  TrenggalekState,
  GOAL
} from '../../data/trenggalekData';
import { TrenggalekTab } from './Header';

interface RingkasanTabProps {
  state: TrenggalekState;
  ahpResult: AhpComputationResult;
  confirmResult: ConfirmComputationResult;
  isDemoMode: boolean;
  onNavigateTab: (tab: TrenggalekTab) => void;
}

export const RingkasanTab: React.FC<RingkasanTabProps> = ({
  state,
  ahpResult,
  confirmResult,
  isDemoMode,
  onNavigateTab
}) => {
  const respondentsList = Object.entries(state.respondents);
  const registeredCount = respondentsList.length;
  const targetCount = state.config.target || 12;
  const targetPct = targetCount ? Math.min(100, Math.round((registeredCount / targetCount) * 100)) : 100;

  // Criteria sorted by weight
  const gC = ahpResult.groups.C;
  const sortedCriteria = [...CRIT].sort((a, b) => (gC.w[b.id] || 0) - (gC.w[a.id] || 0));
  const maxCritWeight = Math.max(...sortedCriteria.map((c) => gC.w[c.id] || 0), 0.001);

  // Variables sorted by global weight
  const sortedVars = [...VARS].sort(
    (a, b) => (ahpResult.global[b.id] || 0) - (ahpResult.global[a.id] || 0)
  );
  const topVar = sortedVars[0];
  const maxVarWeight = topVar ? ahpResult.global[topVar.id] || 0.001 : 0.001;

  // Consistency checks across group matrices
  const validMatrices = Object.keys(ahpResult.groups).filter((mid) => ahpResult.groups[mid].n > 0);
  const consistentMatrices = validMatrices.filter(
    (mid) => (ahpResult.groups[mid]?.cr ?? 1) <= CR_LIMIT
  );

  const formatPct = (val: number, decimals: number = 1) => `${(val * 100).toFixed(decimals)}%`;
  const formatNum = (val: number, decimals: number = 3) => val.toFixed(decimals);

  const colorStyles: Record<string, { bg: string; fill: string; text: string }> = {
    c1: { bg: 'bg-blue-50 dark:bg-blue-950/40', fill: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-300' },
    c2: { bg: 'bg-orange-50 dark:bg-orange-950/40', fill: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' },
    c3: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', fill: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-300' },
    c4: { bg: 'bg-amber-50 dark:bg-amber-950/40', fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
    c5: { bg: 'bg-pink-50 dark:bg-pink-950/40', fill: 'bg-pink-500', text: 'text-pink-700 dark:text-pink-300' },
    c6: { bg: 'bg-teal-50 dark:bg-teal-950/40', fill: 'bg-teal-600', text: 'text-teal-700 dark:text-teal-300' }
  };

  const getRelativeTime = (ts: number) => {
    if (!ts) return 'belum ada';
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            Dasbor Kebijakan Publik Berbasis Bukti
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Ringkasan Prioritas Akar Masalah Gini Kabupaten Trenggalek
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-4xl">
            {GOAL.question} Seluruh pembobotan AHP dan konfirmasi indikator dihitung otomatis secara real-time dari seluruh stakeholder yang berpartisipasi.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('instrumen')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
          >
            <span>Isi Instrumen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Provisional notice banner if applicable */}
      {ahpResult.provisional && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Hasil Sementara (Default Seimbang):</span> Belum ada responden yang menyelesaikan matriks perbandingan penuh. Hasil agregat akan langsung otomatis terbarui saat instrumen terisi.
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('instrumen')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shrink-0"
          >
            Mulai Isi
          </button>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Responden */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Responden Terdaftar</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {registeredCount}
              </span>
              <span className="text-xs text-slate-500">dari target {targetCount}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {ahpResult.nComplete} responden telah menyelesaikan 33 perbandingan penuh
            </p>
          </div>
        </div>

        {/* KPI 2: Konsistensi */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Konsistensi Kelompok</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {ahpResult.provisional ? '–' : formatNum(gC.cr, 3)}
              </span>
              <span className="text-xs text-slate-500">CR Kriteria</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              {!ahpResult.provisional && gC.cr <= CR_LIMIT ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3 h-3" /> Konsisten (CR ≤ 0,10)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Perlu Penyesuaian
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {validMatrices.length
                ? `${consistentMatrices.length} dari ${validMatrices.length} matriks kelompok konsisten`
                : 'Menunggu jawaban responden'}
            </p>
          </div>
        </div>

        {/* KPI 3: Indikator Terkonfirmasi */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Indikator Terkonfirmasi</span>
              <CheckCircle className="w-4 h-4 text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {confirmResult.cnt.ok}
              </span>
              <span className="text-xs text-slate-500">dari {VARS.length} variabel</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(confirmResult.cnt.ok / VARS.length) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {confirmResult.cnt.bahas} dibahas · {confirmResult.cnt.tolak} ditolak · {confirmResult.cnt.belum} belum dinilai
            </p>
          </div>
        </div>

        {/* KPI 4: Variabel Prioritas Utama */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Prioritas Akar Masalah Utama</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                {topVar ? topVar.s : '–'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                Kategori: <strong className="text-slate-700 dark:text-slate-200">{topVar ? CR[topVar.crit!].en : '–'}</strong>
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {topVar ? formatPct(ahpResult.global[topVar.id], 2) : '–'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Criteria weights & Fishbone consensus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Criteria Weights 6M */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bobot Kriteria Utama (Kategori 6M)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hasil sintesis eigen vector perbandingan 6 dimensi penyebab kenaikan Indeks Gini
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('hasil')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Lihat Detail
            </button>
          </div>

          <div className="space-y-3.5">
            {sortedCriteria.map((c, i) => {
              const weight = gC.w[c.id] || 0;
              const range = gC.range ? gC.range[c.id] : null;
              const widthPct = (weight / maxCritWeight) * 100;
              const clr = colorStyles[c.color] || colorStyles.c1;

              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-right font-mono font-semibold text-slate-400">
                        #{i + 1}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-sm ${clr.fill}`} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.en} · {c.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatPct(weight, 1)}
                    </span>
                  </div>

                  {/* Horizontal Bar with whisker range overlay */}
                  <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                    <div
                      className={`h-full ${clr.fill} rounded-md transition-all duration-500`}
                      style={{ width: `${widthPct}%` }}
                    />
                    {range && maxCritWeight > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-2 bg-slate-900/60 dark:bg-white/70 rounded-xs pointer-events-none"
                        style={{
                          left: `${(range[0] / maxCritWeight) * 100}%`,
                          width: `${Math.max(2, ((range[1] - range[0]) / maxCritWeight) * 100)}%`
                        }}
                        title={`Rentang responden: ${formatPct(range[0])} – ${formatPct(range[1])}`}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{c.desc}</span>
                    {range && (
                      <span className="font-mono">
                        Rentang: {formatPct(range[0], 0)} – {formatPct(range[1], 0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Fishbone Indicator Consensus */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kesepakatan Indikator Fishbone
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konsensus stakeholder untuk rusuk diagram sebab-akibat
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('fishbone')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Buka Fishbone
              </button>
            </div>

            {/* Stacked Status Bar */}
            <div className="space-y-2">
              <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(confirmResult.cnt.ok / VARS.length) * 100}%` }}
                  title={`Terkonfirmasi: ${confirmResult.cnt.ok}`}
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${(confirmResult.cnt.bahas / VARS.length) * 100}%` }}
                  title={`Perlu Dibahas: ${confirmResult.cnt.bahas}`}
                />
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${(confirmResult.cnt.tolak / VARS.length) * 100}%` }}
                  title={`Ditolak: ${confirmResult.cnt.tolak}`}
                />
                <div
                  className="bg-slate-200 dark:bg-slate-700 h-full transition-all"
                  style={{ width: `${(confirmResult.cnt.belum / VARS.length) * 100}%` }}
                  title={`Belum Dinilai: ${confirmResult.cnt.belum}`}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                  <span>Terkonfirmasi ({confirmResult.cnt.ok})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
                  <span>Perlu Dibahas ({confirmResult.cnt.bahas})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-red-500" />
                  <span>Ditolak ({confirmResult.cnt.tolak})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700" />
                  <span>Belum ({confirmResult.cnt.belum})</span>
                </div>
              </div>
            </div>

            {/* Category breakdown rows */}
            <div className="mt-5 space-y-2.5">
              {CRIT.map((c) => {
                const cat = confirmResult.cat[c.id];
                const clr = colorStyles[c.color] || colorStyles.c1;
                return (
                  <div key={c.id} className="flex items-center gap-3 text-xs">
                    <span className={`w-2 h-2 rounded-xs ${clr.fill} shrink-0`} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200 w-28 truncate">
                      {c.en} ({c.short})
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-md overflow-hidden">
                      <div
                        className={`h-full ${clr.fill} rounded-md transition-all`}
                        style={{ width: `${(cat.nOk / cat.n) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 w-16 text-right">
                      {cat.nOk}/{cat.n} ok
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Ambang batas konsensus: <strong>{formatPct(confirmResult.thr, 0)}</strong>. Indikator yang lolos ambang otomatis masuk sebagai tulang cabang utama diagram Fishbone.
          </div>
        </div>
      </div>

      {/* Second Row: Top 10 variables & Respondent live progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 10 Variables */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                10 Variabel dengan Bobot Global Tertinggi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bobot Global = Bobot Kriteria Utama × Bobot Lokal Variabel
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('hasil')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Semua 18 Variabel
            </button>
          </div>

          <div className="space-y-3">
            {sortedVars.slice(0, 10).map((v, i) => {
              const globalWeight = ahpResult.global[v.id] || 0;
              const c = CR[v.crit!];
              const clr = colorStyles[c.color] || colorStyles.c1;
              const barWidth = (globalWeight / maxVarWeight) * 100;

              return (
                <div key={v.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-slate-400 w-5 text-right font-semibold">
                        #{i + 1}
                      </span>
                      <span className={`w-2 h-2 rounded-xs ${clr.fill} shrink-0`} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {v.s}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        ({v.id} · {c.en})
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                      {formatPct(globalWeight, 2)}
                    </span>
                  </div>

                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                    <div
                      className={`h-full ${clr.fill} rounded-md transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Respondent Live Progress */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Partisipasi Responden & Stakeholder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pembaruan terakhir: {getRelativeTime(Date.now() - 3600000)}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('peserta')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Kelola Peserta
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Responden</th>
                  <th className="pb-2">AHP</th>
                  <th className="pb-2">CR</th>
                  <th className="pb-2 text-right">Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {respondentsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Belum ada responden terdaftar
                    </td>
                  </tr>
                ) : (
                  respondentsList.slice(0, 7).map(([uid, r]) => {
                    const prog = ahpResult.prog[uid];
                    const conf = state.confirm[uid];
                    const confCount = conf?.votes ? Object.keys(conf.votes).length : 0;
                    const maxCr = prog?.maxCR;

                    return (
                      <tr key={uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 pr-2">
                          <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                            {r.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                            {r.org}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {prog?.answered || 0}/{TOTAL_PAIRS}
                          </div>
                          <div className="w-14 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${(prog?.pct || 0) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
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
                        <td className="py-2.5 pl-2 text-right">
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {confCount}/{VARS.length}
                          </span>
                          {conf?.submitted && (
                            <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Total {respondentsList.length} kontributor terdaftar
            </span>
            <button
              onClick={() => onNavigateTab('instrumen')}
              className="font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              + Beri Penilaian Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
