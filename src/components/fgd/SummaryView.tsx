import React, { useMemo } from 'react';
import { FGD_META } from '../../data/fgdMetadata';
import {
  RespondentEntry,
  aggregateEntries,
  evaluateEntry,
  argmax,
  formatPercent,
  formatDecimal,
} from '../../utils/fgdAhp';
import { ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface SummaryViewProps {
  entries: RespondentEntry[];
  onSelectCommodity: (fgdCode: string) => void;
  onNavigateToForm: (fgdCode?: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  entries,
  onSelectCommodity,
  onNavigateToForm,
}) => {
  // Aggregate data for each of the 11 FGD commodities
  const commodityRows = useMemo(() => {
    return FGD_META.fgd.map((f) => {
      const list = entries.filter((e) => e.fgd === f.code);
      const agg = aggregateEntries(list);
      return { f, list, agg };
    });
  }, [entries]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const totalResp = entries.length;
    const evaluated = entries.map(evaluateEntry);
    const consistentResp = evaluated.filter((r) => r.ok).length;
    const answeredFgds = new Set(entries.map((e) => e.fgd)).size;

    const grpCounts: Record<string, number> = {};
    entries.forEach((e) => {
      const grp = e.kelompok || 'Lainnya';
      grpCounts[grp] = (grpCounts[grp] || 0) + 1;
    });

    const topGrpEntry = Object.entries(grpCounts).sort((a, b) => b[1] - a[1])[0];

    const lastTime = entries.reduce((max, e) => Math.max(max, e.ts || 0), 0);

    return {
      totalResp,
      consistentResp,
      consistentPct: totalResp > 0 ? (consistentResp / totalResp) * 100 : 0,
      answeredFgds,
      totalFgds: FGD_META.fgd.length,
      topGroup: topGrpEntry ? topGrpEntry[0] : '–',
      topGroupCount: topGrpEntry ? topGrpEntry[1] : 0,
      lastDate: lastTime > 0 ? new Date(lastTime).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'belum ada',
    };
  }, [entries]);

  // Heatmap cell color calculation
  const getHeatmapStyle = (value: number | null | undefined, baseColor = '#0E6B63') => {
    if (value == null || isNaN(value)) {
      return { backgroundColor: '#f8fafc', color: '#94a3b8' };
    }
    // Intensity from 0 to 0.45
    const ratio = Math.min(1, Math.max(0, value / 0.4));
    const opacity = Math.round(ratio * 80);
    return {
      backgroundColor: `color-mix(in srgb, ${baseColor} ${opacity}%, #ffffff)`,
      color: opacity > 45 ? '#ffffff' : '#0f172a',
    };
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Jawaban Masuk
          </span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-1 block">
            {kpis.totalResp}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Terakhir: {kpis.lastDate}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            FGD Berjawaban
          </span>
          <span className="text-2xl font-mono font-extrabold text-teal-800 mt-1 block">
            {kpis.answeredFgds} / {kpis.totalFgds}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Komoditas telah dinilai
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Jawaban Konsisten
          </span>
          <span className="text-2xl font-mono font-extrabold text-emerald-700 mt-1 block">
            {kpis.consistentPct.toFixed(1).replace('.', ',')}%
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {kpis.consistentResp} dari {kpis.totalResp} (CR ≤ 0,10)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Kelompok Terbanyak
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block truncate">
            {kpis.topGroup}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {kpis.topGroupCount} responden
          </span>
        </div>
      </div>

      {/* Cross-Commodity Priority Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Prioritas Hasil AHP per Komoditas</h2>
            <p className="text-xs text-slate-500">
              Bobot agregat gabungan semua responden (rata-rata geometrik). Klik baris untuk melihat rincian per komoditas.
            </p>
          </div>
          <button
            onClick={() => onNavigateToForm()}
            className="text-xs font-bold text-[#0D9488] hover:text-[#134E4A] bg-[#F0FDFA] hover:bg-teal-100/60 border border-[#CCFBF1] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Isi Penilaian Komoditas</span>
          </button>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="p-2.5 font-bold w-12 text-center">FGD</th>
                <th className="p-2.5 font-bold min-w-[170px]">Komoditas &amp; Jadwal</th>
                <th className="p-2.5 font-bold text-center">Responden</th>
                <th className="p-2.5 font-bold min-w-[180px]">Kriteria Terpenting</th>
                <th className="p-2.5 font-bold min-w-[200px]">Jalur Prioritas (Hilirisasi)</th>
                <th className="p-2.5 font-bold min-w-[180px]">Instrumen Paling Efektif</th>
                <th className="p-2.5 font-bold text-center">Konsistensi Gabungan</th>
                <th className="p-2.5 font-bold text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {commodityRows.map(({ f, list, agg }) => {
                const topCrit = agg.A ? FGD_META.crit[argmax(agg.A.w)] : null;
                const topCritWeight = agg.A ? Math.max(...agg.A.w) : null;

                const topAlt = agg.alt ? f.alts[argmax(agg.alt.map((x) => x.total))] : null;
                const topAltScore = agg.alt ? Math.max(...agg.alt.map((x) => x.total)) : null;

                const topInst = agg.C ? FGD_META.instr[argmax(agg.C.w)] : null;
                const topInstScore = agg.C ? Math.max(...agg.C.w) : null;

                const crValues = [agg.A?.cr, agg.crB, agg.C?.cr].filter((x) => x != null) as number[];
                const maxCr = crValues.length ? Math.max(...crValues) : null;

                return (
                  <tr
                    key={f.code}
                    onClick={() => onSelectCommodity(f.code)}
                    className="border-b border-slate-100 hover:bg-teal-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-2.5 font-mono font-bold text-center text-teal-900 bg-slate-50/50">
                      {f.code}
                    </td>
                    <td className="p-2.5">
                      <strong className="text-slate-900 font-bold block">{f.kom}</strong>
                      <span className="text-[11px] text-slate-500">{f.tgl}</span>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                      {list.length}
                    </td>
                    <td className="p-2.5">
                      {topCrit ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">{topCrit.n}</span>
                          <span className="text-[11px] font-mono font-bold text-teal-800">
                            {formatPercent(topCritWeight)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {topAlt ? (
                        <div>
                          <strong className="text-slate-900 font-bold block">{topAlt.n}</strong>
                          <span className="text-[11px] font-mono font-bold text-teal-800">
                            {formatPercent(topAltScore)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {topInst ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">{topInst.n}</span>
                          <span className="text-[11px] font-mono font-bold text-teal-800">
                            {formatPercent(topInstScore)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      {maxCr != null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            maxCr <= 0.1001
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          CR {formatDecimal(maxCr)}
                        </span>
                      ) : (
                        <span className="text-slate-400">–</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-0.5">
                        Lihat <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmaps Grid: Bobot Kriteria & Efektivitas Instrumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Kriteria */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900">Bobot Kriteria Antarkomoditas</h3>
          <p className="text-xs text-slate-500 mb-3">
            Semakin gelap warnanya, semakin penting kriteria tersebut bagi komoditas tersebut.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2 font-bold text-slate-700">Komoditas</th>
                  {FGD_META.crit.map((c) => (
                    <th key={c.k} className="p-2 font-bold text-center" title={c.n}>
                      {c.k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commodityRows.map(({ f, agg }) => (
                  <tr key={f.code} className="border-b border-slate-100">
                    <td className="p-2 font-semibold text-slate-800">{f.kom}</td>
                    {FGD_META.crit.map((_, i) => {
                      const val = agg.A ? agg.A.w[i] : null;
                      return (
                        <td
                          key={i}
                          className="p-2 text-center font-mono text-[11px] font-bold"
                          style={getHeatmapStyle(val, '#0E6B63')}
                        >
                          {val != null ? formatPercent(val) : '–'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
            {FGD_META.crit.map((c) => (
              <span key={c.k} className="mr-3 inline-block">
                <strong>{c.k}:</strong> {c.n}
              </span>
            ))}
          </div>
        </div>

        {/* Heatmap Instrumen */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900">Efektivitas Instrumen Kebijakan</h3>
          <p className="text-xs text-slate-500 mb-3">
            Semakin gelap warnanya, semakin efektif instrumen kebijakan menurut responden.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2 font-bold text-slate-700">Komoditas</th>
                  {FGD_META.instr.map((ins) => (
                    <th key={ins.k} className="p-2 font-bold text-center" title={ins.n}>
                      {ins.k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commodityRows.map(({ f, agg }) => (
                  <tr key={f.code} className="border-b border-slate-100">
                    <td className="p-2 font-semibold text-slate-800">{f.kom}</td>
                    {FGD_META.instr.map((_, i) => {
                      const val = agg.C ? agg.C.w[i] : null;
                      return (
                        <td
                          key={i}
                          className="p-2 text-center font-mono text-[11px] font-bold"
                          style={getHeatmapStyle(val, '#3C679B')}
                        >
                          {val != null ? formatPercent(val) : '–'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
            {FGD_META.instr.map((ins) => (
              <span key={ins.k} className="mr-3 inline-block">
                <strong>{ins.k}:</strong> {ins.n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
