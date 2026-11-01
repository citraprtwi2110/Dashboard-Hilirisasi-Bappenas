import React from 'react';
import {
  Layers,
  HelpCircle,
  FileText,
  Calculator,
  Database,
  ExternalLink
} from 'lucide-react';
import {
  CRIT,
  VARS,
  SAATY,
  RI,
  CR_LIMIT,
  GOAL
} from '../../data/trenggalekData';

export const StrukturTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          Metodologi & Landasan Teori
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Struktur Hierarki Keputusan & Definisi Operasional
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Hierarki AHP 3 tingkat (Tujuan → 6 Kriteria 6M Fishbone → 18 Variabel Indikator) diturunkan dari 6 Hipotesis (H1–H6) Kajian Kesejahteraan Ekonomi Kabupaten Trenggalek 2026.
        </p>
      </div>

      {/* Goal & 6M Hierarchy Cards */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Level 1: Tujuan Utama (Goal)
          </h3>
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200">
            <span className="font-bold text-sm block mb-1">{GOAL.title}</span>
            <p className="text-slate-600 dark:text-slate-300">{GOAL.question}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Level 2 & 3: 6 Kriteria 6M dan 18 Variabel Indikator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CRIT.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {c.en} · {c.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{c.desc}</p>
                <div className="space-y-1.5 pt-1">
                  {c.vars.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{v.name}</span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                          {v.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Hipotesis {v.hyp} · Sumber: {v.src}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Definitions Detailed Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Tabel Definisi Operasional Variabel & Basis Data Awal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Berdasarkan Laporan Pendahuluan, RPJMD, dan BPS Kabupaten Trenggalek
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Variabel</th>
                <th className="py-2.5 px-3">Definisi Operasional</th>
                <th className="py-2.5 px-3">Ukuran / Indikator</th>
                <th className="py-2.5 px-3">Data Awal</th>
                <th className="py-2.5 px-3">Sumber Data</th>
                <th className="py-2.5 px-3 text-center">Hipotesis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {VARS.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {v.id}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    {v.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs">
                    {v.def}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs">
                    {v.ind}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200 font-medium">
                    {v.base}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{v.src}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {v.hyp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two columns: Saaty scale & Mathematical Calculation Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saaty Scale Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Skala Penilaian Perbandingan Berpasangan Saaty (1–9)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standar fundamental Analytic Hierarchy Process (AHP)
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="py-2">Nilai</th>
                <th className="py-2">Definisi</th>
                <th className="py-2">Penjelasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SAATY.map((r, i) => (
                <tr key={i}>
                  <td className="py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {r[0]}
                  </td>
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r[1]}</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation formulas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Langkah Formulasi Matematis AHP & Fishbone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Metode power iteration, sintesis geometrik agregat, dan skor komposit
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2 border border-slate-200 dark:border-slate-700">
            <div>1. Matriks A: a_ij = nilai perbandingan, a_ji = 1 / a_ij</div>
            <div>2. Vektor bobot w: iterasi pangkat hingga konvergensi d &lt; 10^-13</div>
            <div>3. Nilai eigen maksimum: λmaks = rata-rata ((A·w)_i / w_i)</div>
            <div>4. Consistency Index: CI = (λmaks − n) / (n − 1)</div>
            <div>5. Consistency Ratio: CR = CI / RI(n), lolos jika CR ≤ 0,10</div>
            <div>6. Agregasi Kelompok: AIJ (Rata-rata Geometrik Tertimbang)</div>
            <div>7. Bobot Global Variabel: G = Bobot Kriteria × Bobot Lokal</div>
            <div>8. Konsensus Lapangan: K = (S + 0.5×C) / Total Penilai</div>
            <div>9. Skor Fishbone: R = G × K, lolos jika K ≥ ambang batas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
