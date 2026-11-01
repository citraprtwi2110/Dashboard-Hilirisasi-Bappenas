import React, { useMemo, useState } from 'react';
import { FGD_META, RESPONDENT_GROUPS } from '../../data/fgdMetadata';
import {
  RespondentEntry,
  aggregateEntries,
  evaluateEntry,
  argmax,
  formatPercent,
  formatDecimal,
} from '../../utils/fgdAhp';
import { Filter, Edit3, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CommodityViewProps {
  entries: RespondentEntry[];
  selectedFgd: string;
  onSelectFgd: (fgdCode: string) => void;
  onNavigateToForm: (fgdCode: string) => void;
}

export const CommodityView: React.FC<CommodityViewProps> = ({
  entries,
  selectedFgd,
  onSelectFgd,
  onNavigateToForm,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [onlyConsistent, setOnlyConsistent] = useState<boolean>(false);

  const fgd = useMemo(() => {
    return FGD_META.fgd.find((f) => f.code === selectedFgd) || FGD_META.fgd[0];
  }, [selectedFgd]);

  // Entries filtered by FGD
  const allForThisFgd = useMemo(() => {
    return entries.filter((e) => e.fgd === fgd.code);
  }, [entries, fgd.code]);

  // Entries with evaluation
  const evaluatedList = useMemo(() => {
    return allForThisFgd.map((e) => ({
      e,
      r: evaluateEntry(e),
    }));
  }, [allForThisFgd]);

  // Filtered entries according to group and consistency
  const filteredEntries = useMemo(() => {
    let list = evaluatedList;
    if (selectedGroup) {
      list = list.filter((item) => item.e.kelompok === selectedGroup);
    }
    if (onlyConsistent) {
      list = list.filter((item) => item.r.ok);
    }
    return list.map((item) => item.e);
  }, [evaluatedList, selectedGroup, onlyConsistent]);

  const agg = useMemo(() => {
    return aggregateEntries(filteredEntries);
  }, [filteredEntries]);

  const consCount = evaluatedList.filter((x) => x.r.ok).length;

  // Criteria bar max for proportional width
  const maxCritWeight = agg.A ? Math.max(...agg.A.w) : 1;
  const topCritIndex = agg.A ? argmax(agg.A.w) : -1;

  // Alternatives bar max
  const maxAltScore = agg.alt ? Math.max(...agg.alt.map((x) => x.total)) : 1;
  const topAltIndex = agg.alt ? argmax(agg.alt.map((x) => x.total)) : -1;

  // Instruments bar max
  const maxInstWeight = agg.C ? Math.max(...agg.C.w) : 1;
  const topInstIndex = agg.C ? argmax(agg.C.w) : -1;

  // Distinct respondent groups in this FGD
  const availableGroups = useMemo(() => {
    return Array.from(new Set(allForThisFgd.map((e) => e.kelompok || 'Lainnya')));
  }, [allForThisFgd]);

  return (
    <div className="space-y-6">
      {/* Commodity Selector Chips & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Pilih Komoditas FGD Hilirisasi:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {FGD_META.fgd.map((f) => {
              const count = entries.filter((e) => e.fgd === f.code).length;
              const isSelected = f.code === fgd.code;

              return (
                <button
                  key={f.code}
                  onClick={() => onSelectFgd(f.code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{f.kom}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-teal-950/40 text-teal-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <label className="font-semibold text-slate-700">Kelompok:</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
              >
                <option value="">Semua Kelompok</option>
                {RESPONDENT_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyConsistent}
                onChange={(e) => setOnlyConsistent(e.target.checked)}
                className="rounded-xs border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
              />
              <span>Hanya jawaban konsisten (CR ≤ 0,10)</span>
            </label>
          </div>

          <button
            onClick={() => onNavigateToForm(fgd.code)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Isi Penilaian untuk {fgd.kom}</span>
          </button>
        </div>
      </div>

      {/* Commodity KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Responden
          </span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-1 block">
            {filteredEntries.length}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block truncate">
            {fgd.code} · {fgd.tgl}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Konsisten
          </span>
          <span className="text-2xl font-mono font-extrabold text-emerald-700 mt-1 block">
            {evaluatedList.length ? `${consCount}/${evaluatedList.length}` : '–'}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            CR ≤ 0,10 di semua bagian
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            CR Gabungan Kriteria
          </span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-1 block">
            {formatDecimal(agg.A?.cr)}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {agg.A ? (agg.A.cr <= 0.1001 ? 'konsisten' : 'perlu ditinjau') : 'belum ada'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            CR Gabungan Instrumen
          </span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-1 block">
            {formatDecimal(agg.C?.cr)}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {agg.C ? (agg.C.cr <= 0.1001 ? 'konsisten' : 'perlu ditinjau') : 'belum ada'}
          </span>
        </div>
      </div>

      {/* 4 Detail Panels Grid: Kriteria, Jalur, Instrumen, Kelompok */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Bobot Kriteria */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Bobot Kriteria</h3>
          <p className="text-xs text-slate-500 mb-4">
            Apa yang paling penting dalam memilih strategi hilirisasi komoditas {fgd.kom.toLowerCase()}.
          </p>

          {agg.A ? (
            <div className="space-y-3">
              {FGD_META.crit.map((c, i) => {
                const w = agg.A!.w[i];
                const isTop = i === topCritIndex;
                const pct = (w / maxCritWeight) * 100;

                return (
                  <div key={c.k} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isTop ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        {c.k} {c.n}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{formatPercent(w)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada jawaban lengkap untuk bagian kriteria.
            </div>
          )}
        </div>

        {/* Panel 2: Prioritas Jalur Hilirisasi */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Prioritas Jalur Hilirisasi</h3>
          <p className="text-xs text-slate-500 mb-4">
            Skor global; warna menunjukkan sumbangan setiap kriteria.
          </p>

          {agg.alt ? (
            <div className="space-y-3">
              {fgd.alts.map((a, i) => {
                const altInfo = agg.alt![i];
                const isTop = i === topAltIndex;

                return (
                  <div key={a.k} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isTop ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        {a.k} {a.n}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{formatPercent(altInfo.total)}</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-md overflow-hidden flex shadow-inner">
                      {altInfo.parts.map((p, cIdx) => {
                        const pctSeg = (p / maxAltScore) * 100;
                        return (
                          <div
                            key={cIdx}
                            style={{
                              width: `${pctSeg}%`,
                              backgroundColor: FGD_META.crit[cIdx].color,
                            }}
                            className="h-full"
                            title={`${FGD_META.crit[cIdx].n}: ${formatPercent(p)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[11px] text-slate-500 border-t border-slate-100">
                {FGD_META.crit.map((c) => (
                  <div key={c.k} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c.color }} />
                    <span>{c.k} {c.n}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada jawaban lengkap untuk bagian jalur hilirisasi.
            </div>
          )}
        </div>

        {/* Panel 3: Efektivitas Instrumen Kebijakan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Efektivitas Instrumen Kebijakan</h3>
          <p className="text-xs text-slate-500 mb-4">
            Instrumen yang dinilai paling mendorong hilirisasi {fgd.kom.toLowerCase()}.
          </p>

          {agg.C ? (
            <div className="space-y-3">
              {FGD_META.instr.map((ins, i) => {
                const w = agg.C!.w[i];
                const isTop = i === topInstIndex;
                const pct = (w / maxInstWeight) * 100;

                return (
                  <div key={ins.k} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isTop ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        {ins.k} {ins.n}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{formatPercent(w)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-300 bg-teal-800"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada jawaban lengkap untuk bagian instrumen kebijakan.
            </div>
          )}
        </div>

        {/* Panel 4: Perbandingan Kelompok Responden */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900">Perbandingan Kelompok Responden</h3>
          <p className="text-xs text-slate-500 mb-3">
            Jalur dan instrumen teratas menurut pandangan pemerintah, pelaku usaha, dan akademisi.
          </p>

          {availableGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-2 font-bold">Kelompok</th>
                    <th className="p-2 font-bold text-center">n</th>
                    <th className="p-2 font-bold">Kriteria Terpenting</th>
                    <th className="p-2 font-bold">Jalur Prioritas</th>
                    <th className="p-2 font-bold">Instrumen Teratas</th>
                  </tr>
                </thead>
                <tbody>
                  {availableGroups.map((g) => {
                    const subList = allForThisFgd.filter((e) => (e.kelompok || 'Lainnya') === g);
                    const subAgg = aggregateEntries(subList);

                    const topCrit = subAgg.A ? FGD_META.crit[argmax(subAgg.A.w)] : null;
                    const topAlt = subAgg.alt ? fgd.alts[argmax(subAgg.alt.map((x) => x.total))] : null;
                    const topInst = subAgg.C ? FGD_META.instr[argmax(subAgg.C.w)] : null;

                    return (
                      <tr key={g} className="border-b border-slate-100">
                        <td className="p-2 font-semibold text-slate-900">{g}</td>
                        <td className="p-2 text-center font-mono font-bold text-slate-700">
                          {subList.length}
                        </td>
                        <td className="p-2 text-slate-700">{topCrit ? topCrit.n : '–'}</td>
                        <td className="p-2 font-semibold text-slate-900">{topAlt ? topAlt.n : '–'}</td>
                        <td className="p-2 text-slate-700">{topInst ? topInst.n : '–'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada data responden untuk membandingkan kelompok.
            </div>
          )}
        </div>
      </div>

      {/* Panel 5: Tabel Responden */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
        <h3 className="text-sm font-bold text-slate-900">Daftar Responden ({fgd.kom})</h3>
        <p className="text-xs text-slate-500 mb-3">
          CR di atas 0,10 berarti jawaban kurang konsisten dan sebaiknya ditinjau kembali.
        </p>

        {evaluatedList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-2.5 font-bold">Kelompok</th>
                  <th className="p-2.5 font-bold">Institusi / Perusahaan</th>
                  <th className="p-2.5 font-bold text-center">Kriteria CR</th>
                  <th className="p-2.5 font-bold text-center">Jalur CR</th>
                  <th className="p-2.5 font-bold text-center">Instrumen CR</th>
                  <th className="p-2.5 font-bold text-center">Sumber</th>
                  <th className="p-2.5 font-bold text-right">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {evaluatedList
                  .sort((a, b) => (b.e.ts || 0) - (a.e.ts || 0))
                  .map(({ e, r }) => (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="p-2.5 font-semibold text-slate-800">{e.kelompok || '–'}</td>
                      <td className="p-2.5 text-slate-700">{e.institusi || '–'}</td>
                      <td className="p-2.5 text-center">
                        {r.A ? (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              r.A.cr <= 0.1001 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            CR {formatDecimal(r.A.cr)}
                          </span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {r.crB != null ? (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              r.crB <= 0.1001 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            CR {formatDecimal(r.crB)}
                          </span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {r.C ? (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              r.C.cr <= 0.1001 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            CR {formatDecimal(r.C.cr)}
                          </span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {e.src === 'excel' ? 'Excel' : e.src === 'contoh' ? 'Contoh' : 'Formulir'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-slate-500">
                        {e.ts ? new Date(e.ts).toLocaleDateString('id-ID', { dateStyle: 'short' }) : '–'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            Belum ada responden untuk komoditas {fgd.kom}.
          </div>
        )}
      </div>

      {/* Panel 6: Jawaban Singkat Bagian D */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Jawaban Singkat Pengisi Celah Data (Bagian D · {fgd.kom})
        </h3>

        <div className="space-y-4">
          {fgd.qs.map((q, qIdx) => {
            const answers = allForThisFgd.filter(
              (e) => e.D && e.D[qIdx] && String(e.D[qIdx]).trim().length > 0
            );

            return (
              <div key={qIdx} className="space-y-2">
                <span className="text-xs font-bold text-teal-900 block">
                  D{qIdx + 1}. {q}
                </span>

                {answers.length > 0 ? (
                  <div className="space-y-2">
                    {answers.map((e) => (
                      <div
                        key={e.id}
                        className="p-3 bg-slate-50 border-l-4 border-teal-700 rounded-r-lg text-xs space-y-1"
                      >
                        <p className="text-slate-800 leading-relaxed italic">&ldquo;{e.D[qIdx]}&rdquo;</p>
                        <span className="text-[11px] text-slate-500 block">
                          — {e.kelompok || 'Responden'}{e.institusi ? ` · ${e.institusi}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada jawaban untuk pertanyaan ini.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
