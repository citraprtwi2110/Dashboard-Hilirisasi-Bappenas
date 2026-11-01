import React from 'react';
import {
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  CRIT,
  CR,
  VARS,
  VAR,
  MATS,
  MAT,
  CR_LIMIT,
  AhpComputationResult,
  TrenggalekState
} from '../../data/trenggalekData';

interface HasilTabProps {
  state: TrenggalekState;
  ahpResult: AhpComputationResult;
  onlyConsistent: boolean;
  setOnlyConsistent: (val: boolean) => void;
  selectedRespondent: string;
  setSelectedRespondent: (val: string) => void;
}

export const HasilTab: React.FC<HasilTabProps> = ({
  state,
  ahpResult,
  onlyConsistent,
  setOnlyConsistent,
  selectedRespondent,
  setSelectedRespondent
}) => {
  const gC = ahpResult.groups.C;
  const sortedCriteria = [...CRIT].sort((a, b) => (gC.w[b.id] || 0) - (gC.w[a.id] || 0));
  const maxCritWeight = Math.max(...sortedCriteria.map((c) => gC.w[c.id] || 0), 0.001);

  const sortedVars = [...VARS].sort(
    (a, b) => (ahpResult.global[b.id] || 0) - (ahpResult.global[a.id] || 0)
  );
  const maxGlobalWeight = sortedVars[0] ? ahpResult.global[sortedVars[0].id] || 0.001 : 0.001;

  const formatPct = (val: number, d: number = 2) => `${(val * 100).toFixed(d)}%`;
  const formatNum = (val: number, d: number = 3) => val.toFixed(d);

  const colorStyles: Record<string, { fill: string; text: string }> = {
    c1: { fill: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-300' },
    c2: { fill: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' },
    c3: { fill: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-300' },
    c4: { fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
    c5: { fill: 'bg-pink-500', text: 'text-pink-700 dark:text-pink-300' },
    c6: { fill: 'bg-teal-600', text: 'text-teal-700 dark:text-teal-300' }
  };

  // CSV Exporter
  const handleExportCsv = () => {
    const rows = [
      ['Peringkat', 'ID', 'Variabel', 'Kategori_6M', 'Hipotesis', 'Bobot_Lokal', 'Bobot_Global', 'Rentang_Min', 'Rentang_Maks']
    ];

    sortedVars.forEach((v, idx) => {
      const c = CR[v.crit!];
      const localW = ahpResult.groups['S:' + v.crit]?.w[v.id] || 0;
      const globalW = ahpResult.global[v.id] || 0;
      const rg = ahpResult.globalRange[v.id];

      rows.push([
        String(idx + 1),
        v.id,
        `"${v.name}"`,
        `"${c.en} (${c.name})"`,
        v.hyp,
        localW.toFixed(4),
        globalW.toFixed(4),
        rg ? rg[0].toFixed(4) : '',
        rg ? rg[1].toFixed(4) : ''
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_AHP_Trenggalek_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const respondentUids = Object.keys(state.respondents);

  return (
    <div className="space-y-6">
      {/* Control Bar: Respondent selector, Consistency filter, CSV export */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Tampilkan:</span>
            <select
              value={selectedRespondent}
              onChange={(e) => setSelectedRespondent(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="group">
                Gabungan Seluruh Stakeholder ({respondentUids.length} Responden)
              </option>
              {respondentUids.map((uid) => (
                <option key={uid} value={uid}>
                  Responden: {state.respondents[uid].name} ({state.respondents[uid].org})
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyConsistent}
              onChange={(e) => setOnlyConsistent(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Hanya jawaban konsisten (CR ≤ 0,10)</span>
          </label>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
        >
          <Download className="w-4 h-4" />
          <span>Unduh CSV Lengkap</span>
        </button>
      </div>

      {/* Criteria Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bobot Kriteria Utama (Kategori 6M)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vektor eigen utama matriks 6×6 kriteria · CR: {formatNum(gC.cr, 3)}
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
            Total Bobot: 100%
          </span>
        </div>

        <div className="space-y-3.5">
          {sortedCriteria.map((c, i) => {
            const w = gC.w[c.id] || 0;
            const clr = colorStyles[c.color] || colorStyles.c1;
            const barW = (w / maxCritWeight) * 100;
            const range = gC.range ? gC.range[c.id] : null;

            return (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-5 text-right">#{i + 1}</span>
                    <span className={`w-2.5 h-2.5 rounded-xs ${clr.fill}`} />
                    <span className="text-slate-900 dark:text-white">
                      {c.en} · {c.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-900 dark:text-white">{formatPct(w)}</span>
                </div>

                <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                  <div
                    className={`h-full ${clr.fill} rounded-md transition-all duration-500`}
                    style={{ width: `${barW}%` }}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* 6 Category Local Weights Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Bobot Lokal Variabel dalam Tiap Kriteria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CRIT.map((c) => {
            const grp = ahpResult.groups['S:' + c.id];
            const clr = colorStyles[c.color] || colorStyles.c1;
            const maxLoc = Math.max(...c.vars.map((v) => grp?.w[v.id] || 0), 0.001);

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-xs ${clr.fill}`} />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {c.en} · {c.short}
                      </h4>
                    </div>
                    {grp?.n ? (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          grp.cr <= CR_LIMIT
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}
                      >
                        CR {formatNum(grp.cr, 2)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Belum ada data</span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {c.vars.map((v) => {
                      const locW = grp?.w[v.id] || 0;
                      const barW = (locW / maxLoc) * 100;
                      return (
                        <div key={v.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[190px]">
                              {v.s}
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {formatPct(locW)}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${clr.fill} rounded-full transition-all`}
                              style={{ width: `${barW}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>λmaks: {formatNum(grp?.lmax || 3, 2)}</span>
                  <span>CI: {formatNum(grp?.ci || 0, 3)}</span>
                  <span>{grp?.n || 0} responden</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Global Weights Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Peringkat Keseluruhan 18 Variabel (Bobot Global AHP)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perkalian bobot kriteria dengan bobot lokal masing-masing variabel
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3 text-center">#</th>
                <th className="py-2.5 px-3">Variabel Indikator</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Bobot Lokal</th>
                <th className="py-2.5 px-3 min-w-[200px]">Bobot Global</th>
                <th className="py-2.5 px-3 text-right">Rentang Responden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedVars.map((v, idx) => {
                const c = CR[v.crit!];
                const clr = colorStyles[c.color] || colorStyles.c1;
                const localW = ahpResult.groups['S:' + v.crit]?.w[v.id] || 0;
                const globalW = ahpResult.global[v.id] || 0;
                const barW = (globalW / maxGlobalWeight) * 100;
                const rg = ahpResult.globalRange[v.id];

                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.id} · Hipotesis {v.hyp}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-xs ${clr.fill}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {c.en}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatPct(localW, 1)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${clr.fill} rounded-full transition-all`}
                            style={{ width: `${barW}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white w-14 text-right">
                          {formatPct(globalW, 2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                      {rg ? `${formatPct(rg[0], 1)} – ${formatPct(rg[1], 1)}` : '–'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consistency CR Matrix across all respondents */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Matriks Uji Konsistensi (Consistency Ratio - CR)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ambang batas konsisten Saaty: CR ≤ 0,10. Hijau: Konsisten, Merah: Perlu peninjauan ulang, Abu-abu: Belum lengkap.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Responden</th>
                {MATS.map((m) => (
                  <th key={m.id} className="py-2.5 px-2 text-center font-mono text-[11px]">
                    {m.id === 'C' ? 'Kriteria' : m.id.replace('S:', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {respondentUids.map((uid) => {
                const r = state.respondents[uid];
                const rPer = ahpResult.per[uid];

                return (
                  <tr key={uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {r.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{r.org}</span>
                    </td>
                    {MATS.map((m) => {
                      const entry = rPer ? rPer[m.id] : null;
                      if (!entry || !entry.complete) {
                        return (
                          <td key={m.id} className="py-2.5 px-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800">
                              {entry ? `${entry.answered}/${entry.total}` : '–'}
                            </span>
                          </td>
                        );
                      }
                      const isOk = (entry.cr ?? 1) <= CR_LIMIT;
                      return (
                        <td key={m.id} className="py-2.5 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isOk
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {formatNum(entry.cr ?? 0, 2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Group summary row */}
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                <td className="py-3 px-3 text-slate-900 dark:text-white">
                  Gabungan Kelompok (AIJ)
                </td>
                {MATS.map((m) => {
                  const grp = ahpResult.groups[m.id];
                  if (!grp || grp.provisional || !grp.n) {
                    return (
                      <td key={m.id} className="py-3 px-2 text-center font-mono text-slate-400">
                        –
                      </td>
                    );
                  }
                  const isOk = grp.cr <= CR_LIMIT;
                  return (
                    <td key={m.id} className="py-3 px-2 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isOk
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {formatNum(grp.cr, 2)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
