import React, { useMemo } from 'react';
import {
  FGD_META,
  RESPONDENT_GROUPS,
  SAATY_SCALE_BUTTONS,
  NA_CRIT,
  NB_ALTS,
  NC_INST,
  TOTAL_PAIRS,
} from '../../data/fgdMetadata';
import {
  RespondentEntry,
  generatePairs,
  calculateFgdAhp,
  findWorstInconsistentPair,
  formatPercent,
  formatDecimal,
  isCompleteArray,
} from '../../utils/fgdAhp';
import { CheckCircle2, AlertTriangle, RotateCcw, Sparkles, Save, Check } from 'lucide-react';

interface InstrumentFormProps {
  form: RespondentEntry;
  onChangeForm: (newForm: RespondentEntry) => void;
  onSaveForm: () => void;
  saveMessage: string;
  onLoadSampleAnswers: () => void;
  onClearForm: () => void;
}

export const InstrumentForm: React.FC<InstrumentFormProps> = ({
  form,
  onChangeForm,
  onSaveForm,
  saveMessage,
  onLoadSampleAnswers,
  onClearForm,
}) => {
  const currentFgd = useMemo(() => {
    return FGD_META.fgd.find((f) => f.code === form.fgd) || FGD_META.fgd[0];
  }, [form.fgd]);

  // Convert raw value (e.g. 3, 1/3, 1) to button index (0..8)
  const valToIdx = (v: number | null): number => {
    if (v == null) return -1;
    if (Math.abs(v - 1) < 0.001) return 4;
    const r = v > 1 ? v : 1 / v;
    const scaleValues = [9, 7, 5, 3];
    const match = scaleValues.findIndex((s) => Math.abs(s - Math.round(r)) < 0.2);
    if (match === -1) return 4;
    return v > 1 ? match : 8 - match;
  };

  // Convert button index (0..8) to pairwise numerical value
  const idxToVal = (idx: number): number => {
    if (idx < 4) return SAATY_SCALE_BUTTONS[idx];
    if (idx === 4) return 1;
    return 1 / SAATY_SCALE_BUTTONS[idx];
  };

  // Handle scale button click
  const handleButtonClick = (sec: 'A' | 'B' | 'C', pairIndex: number, btnIndex: number) => {
    const val = idxToVal(btnIndex);
    const newArr = [...form[sec]];
    newArr[pairIndex] = val;
    onChangeForm({
      ...form,
      [sec]: newArr,
    });
  };

  // Calculate flagged pairs for inconsistency
  const flagged = useMemo(() => {
    const flags = new Set<string>();

    if (isCompleteArray(form.A, NA_CRIT)) {
      const worst = findWorstInconsistentPair(form.A as number[], 5);
      if (worst >= 0) flags.add(`A-${worst}`);
    }

    if (isCompleteArray(form.C, NC_INST)) {
      const worst = findWorstInconsistentPair(form.C as number[], 5);
      if (worst >= 0) flags.add(`C-${worst}`);
    }

    if (isCompleteArray(form.B, NB_ALTS)) {
      for (let c = 0; c < 5; c++) {
        const slice = form.B.slice(c * 3, c * 3 + 3) as number[];
        const worst = findWorstInconsistentPair(slice, 3);
        if (worst >= 0) flags.add(`B-${c * 3 + worst}`);
      }
    }

    return flags;
  }, [form.A, form.B, form.C]);

  // Calculation for live preview
  const liveResults = useMemo(() => {
    const fullA = isCompleteArray(form.A, NA_CRIT);
    const fullB = isCompleteArray(form.B, NB_ALTS);
    const fullC = isCompleteArray(form.C, NC_INST);

    const evalA = fullA ? calculateFgdAhp(form.A as number[], 5) : null;
    const evalB = fullB
      ? [0, 1, 2, 3, 4].map((c) =>
          calculateFgdAhp(form.B.slice(c * 3, c * 3 + 3) as number[], 3)
        )
      : null;
    const evalC = fullC ? calculateFgdAhp(form.C as number[], 5) : null;

    let altResults: { label: string; total: number; parts: number[] }[] | null = null;
    if (evalA && evalB) {
      altResults = currentFgd.alts.map((a, ai) => {
        const parts = evalB.map((b, c) => evalA.w[c] * b.w[ai]);
        const total = parts.reduce((acc, p) => acc + p, 0);
        return { label: `${a.k} ${a.n}`, total, parts };
      });
    }

    return { evalA, evalB, evalC, altResults };
  }, [form.A, form.B, form.C, currentFgd]);

  // Section status badge
  const renderSecStatus = (vals: (number | null)[], len: number, isSubcriteria = false) => {
    const done = vals.filter((v) => v != null).length;
    if (done < len) {
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {done}/{len} terisi
        </span>
      );
    }

    if (isSubcriteria) {
      const crs = [0, 1, 2, 3, 4].map(
        (c) => calculateFgdAhp(vals.slice(c * 3, c * 3 + 3) as number[], 3).cr
      );
      const maxCr = Math.max(...crs);
      return maxCr <= 0.1001 ? (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          Konsisten · CR {formatDecimal(maxCr)}
        </span>
      ) : (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
          Perlu ditinjau · CR {formatDecimal(maxCr)}
        </span>
      );
    }

    const res = calculateFgdAhp(vals as number[], 5);
    return res.cr <= 0.1001 ? (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
        Konsisten · CR {formatDecimal(res.cr)}
      </span>
    ) : (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
        Perlu ditinjau · CR {formatDecimal(res.cr)}
      </span>
    );
  };

  const answeredCount = [...form.A, ...form.B, ...form.C].filter((v) => v != null).length;
  const progressPct = Math.round((answeredCount / TOTAL_PAIRS) * 100);

  // Criteria pairs combinations (5 criteria = 10 pairs)
  const pairs5 = useMemo(() => generatePairs(5), []);
  const pairs3 = useMemo(() => generatePairs(3), []);

  let questionCounter = 1;

  return (
    <div className="space-y-6 pb-20">
      {/* Introduction Card & Respondent Identification */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Isi Instrumen Penilaian AHP ({currentFgd.code} · {currentFgd.kom})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih angka di sisi pilihan yang lebih penting: <strong>3</strong> sedikit lebih penting,{' '}
              <strong>5</strong> lebih penting, <strong>7</strong> jauh lebih penting,{' '}
              <strong>9</strong> mutlak lebih penting. Pilih <strong>1</strong> bila sama penting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLoadSampleAnswers}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Contoh Jawaban Lengkap</span>
            </button>
            <button
              onClick={onClearForm}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Kosongkan Isian"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Identity Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Komoditas FGD:</label>
            <select
              value={form.fgd}
              onChange={(e) => {
                onChangeForm({
                  ...form,
                  fgd: e.target.value,
                  B: Array(NB_ALTS).fill(null), // reset B when commodity alts change
                  D: ['', '', '', ''],
                });
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              {FGD_META.fgd.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.code} {f.kom} ({f.tgl})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kelompok Responden:</label>
            <select
              value={form.kelompok}
              onChange={(e) => onChangeForm({ ...form, kelompok: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="">Pilih Kelompok Responden</option>
              {RESPONDENT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Institusi / Perusahaan:</label>
            <input
              type="text"
              placeholder="Contoh: Kementerian Perindustrian / PT Smelter"
              value={form.institusi}
              onChange={(e) => onChangeForm({ ...form, institusi: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jabatan / Unit Kerja:</label>
            <input
              type="text"
              placeholder="Contoh: Analis Kebijakan / Direktur Operasi"
              value={form.jabatan}
              onChange={(e) => onChangeForm({ ...form, jabatan: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Bagian A: Perbandingan Kriteria (pairs 5 = 10) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            A. Dalam memilih strategi hilirisasi {currentFgd.kom.toLowerCase()}, mana yang lebih penting?
          </h3>
          {renderSecStatus(form.A, NA_CRIT)}
        </div>

        <div className="divide-y divide-slate-100">
          {pairs5.map(([i, j], k) => {
            const no = questionCounter++;
            const leftCrit = FGD_META.crit[i];
            const rightCrit = FGD_META.crit[j];
            const currentVal = form.A[k];
            const selectedIdx = valToIdx(currentVal);
            const isFlagged = flagged.has(`A-${k}`);

            return (
              <div
                key={`A-${k}`}
                className={`py-3 px-2 rounded-lg grid grid-cols-1 md:grid-cols-12 items-center gap-2 transition-colors ${
                  isFlagged ? 'bg-amber-50/70 border border-amber-300' : 'hover:bg-slate-50/50'
                }`}
                title={isFlagged ? 'Perbandingan ini paling bertentangan dengan jawaban lain di bagian ini' : ''}
              >
                <div className="md:col-span-4 text-xs font-medium text-slate-800 text-left md:text-right">
                  <span className="font-mono text-slate-400 font-bold mr-1">{no}.</span>
                  <span className="font-bold text-teal-900">{leftCrit.k}</span> {leftCrit.n}
                </div>

                <div className="md:col-span-4 flex items-center justify-center gap-1">
                  {SAATY_SCALE_BUTTONS.map((sVal, btnIdx) => {
                    const isPressed = btnIdx === selectedIdx;
                    const isEqual = btnIdx === 4;

                    return (
                      <button
                        key={btnIdx}
                        type="button"
                        onClick={() => handleButtonClick('A', k, btnIdx)}
                        className={`w-7 h-8 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                          isPressed
                            ? 'bg-teal-700 text-white shadow-xs scale-105'
                            : isEqual
                            ? 'bg-slate-100 text-slate-700 border border-dashed border-slate-300 hover:bg-slate-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                        title={
                          btnIdx < 4
                            ? `${leftCrit.n} lebih penting (${sVal})`
                            : isEqual
                            ? 'Sama penting (1)'
                            : `${rightCrit.n} lebih penting (${sVal})`
                        }
                      >
                        {sVal}
                      </button>
                    );
                  })}
                </div>

                <div className="md:col-span-4 text-xs font-medium text-slate-800 text-left">
                  <span className="font-bold text-teal-900">{rightCrit.k}</span> {rightCrit.n}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bagian B: Perbandingan Jalur Hilirisasi menurut Kriteria (5 kriteria * 3 pairs = 15) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              B. Dilihat dari setiap kriteria, jalur mana yang lebih menjanjikan?
            </h3>
            <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
              {currentFgd.alts.map((a) => (
                <div key={a.k}>
                  <strong className="text-slate-900">{a.k} {a.n}:</strong> {a.d}
                </div>
              ))}
            </div>
          </div>
          {renderSecStatus(form.B, NB_ALTS, true)}
        </div>

        {/* 5 sub-sections, each has 3 pairs */}
        <div className="space-y-4">
          {FGD_META.crit.map((crit, ci) => (
            <div key={crit.k} className="bg-slate-50/60 border border-slate-200 rounded-lg p-3">
              <span className="text-xs font-bold text-teal-900 block mb-2">
                Menurut {crit.k} {crit.n}
              </span>

              <div className="divide-y divide-slate-200/60">
                {pairs3.map(([i, j], k) => {
                  const no = questionCounter++;
                  const altLeft = currentFgd.alts[i];
                  const altRight = currentFgd.alts[j];
                  const pairIdx = ci * 3 + k;
                  const currentVal = form.B[pairIdx];
                  const selectedIdx = valToIdx(currentVal);
                  const isFlagged = flagged.has(`B-${pairIdx}`);

                  return (
                    <div
                      key={`B-${pairIdx}`}
                      className={`py-2 px-1 rounded-md grid grid-cols-1 md:grid-cols-12 items-center gap-2 ${
                        isFlagged ? 'bg-amber-100/70 border border-amber-300' : ''
                      }`}
                      title={isFlagged ? 'Perbandingan ini paling bertentangan dengan jawaban lain' : ''}
                    >
                      <div className="md:col-span-4 text-xs font-medium text-slate-800 text-left md:text-right truncate">
                        <span className="font-mono text-slate-400 font-bold mr-1">{no}.</span>
                        <strong>{altLeft.k}</strong> {altLeft.n}
                      </div>

                      <div className="md:col-span-4 flex items-center justify-center gap-1">
                        {SAATY_SCALE_BUTTONS.map((sVal, btnIdx) => {
                          const isPressed = btnIdx === selectedIdx;
                          const isEqual = btnIdx === 4;

                          return (
                            <button
                              key={btnIdx}
                              type="button"
                              onClick={() => handleButtonClick('B', pairIdx, btnIdx)}
                              className={`w-7 h-8 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                                isPressed
                                  ? 'bg-teal-700 text-white shadow-xs scale-105'
                                  : isEqual
                                  ? 'bg-slate-100 text-slate-700 border border-dashed border-slate-300 hover:bg-slate-200'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {sVal}
                            </button>
                          );
                        })}
                      </div>

                      <div className="md:col-span-4 text-xs font-medium text-slate-800 text-left truncate">
                        <strong>{altRight.k}</strong> {altRight.n}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian C: Efektivitas Instrumen Kebijakan (pairs 5 = 10) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            C. Untuk mendorong hilirisasi {currentFgd.kom.toLowerCase()}, instrumen kebijakan mana yang lebih efektif?
          </h3>
          {renderSecStatus(form.C, NC_INST)}
        </div>

        <div className="divide-y divide-slate-100">
          {pairs5.map(([i, j], k) => {
            const no = questionCounter++;
            const leftInst = FGD_META.instr[i];
            const rightInst = FGD_META.instr[j];
            const currentVal = form.C[k];
            const selectedIdx = valToIdx(currentVal);
            const isFlagged = flagged.has(`C-${k}`);

            return (
              <div
                key={`C-${k}`}
                className={`py-3 px-2 rounded-lg grid grid-cols-1 md:grid-cols-12 items-center gap-2 transition-colors ${
                  isFlagged ? 'bg-amber-50/70 border border-amber-300' : 'hover:bg-slate-50/50'
                }`}
                title={isFlagged ? 'Perbandingan ini paling bertentangan dengan jawaban lain' : ''}
              >
                <div className="md:col-span-4 text-xs font-medium text-slate-800 text-left md:text-right">
                  <span className="font-mono text-slate-400 font-bold mr-1">{no}.</span>
                  <span className="font-bold text-teal-900">{leftInst.k}</span> {leftInst.n}
                </div>

                <div className="md:col-span-4 flex items-center justify-center gap-1">
                  {SAATY_SCALE_BUTTONS.map((sVal, btnIdx) => {
                    const isPressed = btnIdx === selectedIdx;
                    const isEqual = btnIdx === 4;

                    return (
                      <button
                        key={btnIdx}
                        type="button"
                        onClick={() => handleButtonClick('C', k, btnIdx)}
                        className={`w-7 h-8 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                          isPressed
                            ? 'bg-teal-700 text-white shadow-xs scale-105'
                            : isEqual
                            ? 'bg-slate-100 text-slate-700 border border-dashed border-slate-300 hover:bg-slate-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sVal}
                      </button>
                    );
                  })}
                </div>

                <div className="md:col-span-4 text-xs font-medium text-slate-800 text-left">
                  <span className="font-bold text-teal-900">{rightInst.k}</span> {rightInst.n}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bagian D: Pertanyaan Singkat Kualitatif */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">
            D. Pertanyaan Singkat Terbuka ({currentFgd.kom})
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
            Boleh dengan angka perkiraan
          </span>
        </div>

        <div className="space-y-3">
          {currentFgd.qs.map((q, idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 block">
                D{idx + 1}. {q}
              </label>
              <textarea
                value={form.D[idx] || ''}
                onChange={(e) => {
                  const newD = [...form.D];
                  newD[idx] = e.target.value;
                  onChangeForm({ ...form, D: newD });
                }}
                placeholder="Tuliskan analisis, data perkiraan, atau pandangan Anda..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hasil Penilaian Anda (Live Preview Panels) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Hasil Penilaian Anda (Dihitung Otomatis)</h3>
          <p className="text-xs text-slate-500">
            Dihitung otomatis saat Anda memilih angka. Jika terdapat tanda &quot;Perlu ditinjau&quot;,
            periksa perbandingan yang ditandai kuning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bobot Kriteria */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Bobot Kriteria (Bagian A)</span>
              {liveResults.evalA && (
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    liveResults.evalA.cr <= 0.1001
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  CR {formatDecimal(liveResults.evalA.cr)}
                </span>
              )}
            </div>

            {liveResults.evalA ? (
              <div className="space-y-1.5 pt-1">
                {FGD_META.crit.map((c, i) => {
                  const w = liveResults.evalA!.w[i];
                  return (
                    <div key={c.k} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{c.k} {c.n}</span>
                        <span className="font-mono font-bold text-slate-900">{formatPercent(w)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${w * 100}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 pt-2">
                Lengkapi 10 perbandingan kriteria untuk melihat hasil.
              </p>
            )}
          </div>

          {/* Prioritas Jalur Hilirisasi */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Prioritas Jalur Hilirisasi (Bagian B)</span>
              {liveResults.evalB && (
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    Math.max(...liveResults.evalB.map((x) => x.cr)) <= 0.1001
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  CR Max {formatDecimal(Math.max(...liveResults.evalB.map((x) => x.cr)))}
                </span>
              )}
            </div>

            {liveResults.altResults ? (
              <div className="space-y-2 pt-1">
                {liveResults.altResults.map((a) => (
                  <div key={a.label} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{a.label}</span>
                      <span className="font-mono font-bold text-slate-900">{formatPercent(a.total)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      {a.parts.map((p, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            width: `${p * 100}%`,
                            backgroundColor: FGD_META.crit[cIdx].color,
                          }}
                          className="h-full"
                          title={`${FGD_META.crit[cIdx].n}: ${formatPercent(p)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 pt-2">
                Lengkapi perbandingan Bagian A dan B untuk melihat skor sintesis jalur.
              </p>
            )}
          </div>

          {/* Efektivitas Instrumen */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Efektivitas Instrumen (Bagian C)</span>
              {liveResults.evalC && (
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    liveResults.evalC.cr <= 0.1001
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  CR {formatDecimal(liveResults.evalC.cr)}
                </span>
              )}
            </div>

            {liveResults.evalC ? (
              <div className="space-y-1.5 pt-1">
                {FGD_META.instr.map((ins, i) => {
                  const w = liveResults.evalC!.w[i];
                  return (
                    <div key={ins.k} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 truncate max-w-[170px]">{ins.k} {ins.n}</span>
                        <span className="font-mono font-bold text-slate-900">{formatPercent(w)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-700"
                          style={{ width: `${w * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 pt-2">
                Lengkapi 10 perbandingan instrumen untuk melihat hasil.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Progress & Save Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            {answeredCount} / {TOTAL_PAIRS} perbandingan terisi ({progressPct}%)
          </span>
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-xs">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
              <Check className="w-4 h-4 text-teal-600" />
              <span>{saveMessage}</span>
            </span>
          )}

          <button
            onClick={onSaveForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Jawaban</span>
          </button>
        </div>
      </div>
    </div>
  );
};
