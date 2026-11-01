import React, { useState } from 'react';
import {
  HelpCircle,
  Wand2,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AhpCalculationResult, Criterion } from '../types/ahp';
import {
  autoTuneMatrixForConsistency,
  formatFraction,
  SAATY_SCALE,
} from '../utils/ahp';

interface PairwiseMatrixProps {
  criteria: Criterion[];
  matrix: number[][];
  onChangeMatrix: (newMatrix: number[][]) => void;
  ahpResult: AhpCalculationResult;
  lang: 'id' | 'en';
  onNavigateToNext: () => void;
}

export const PairwiseMatrix: React.FC<PairwiseMatrixProps> = ({
  criteria,
  matrix,
  onChangeMatrix,
  ahpResult,
  lang,
  onNavigateToNext,
}) => {
  const n = criteria.length;
  const [selectedPair, setSelectedPair] = useState<{ row: number; col: number }>({ row: 0, col: 1 });
  const [showSaatyGuide, setShowSaatyGuide] = useState(false);

  // Update cell (i, j) and reciprocal (j, i)
  const handleCellChange = (i: number, j: number, value: number) => {
    if (i === j) return;
    const newMatrix = matrix.map((row) => [...row]);
    newMatrix[i][j] = value;
    newMatrix[j][i] = 1 / value;
    onChangeMatrix(newMatrix);
  };

  // Auto-tune to fix inconsistency
  const handleAutoTune = () => {
    const tuned = autoTuneMatrixForConsistency(matrix);
    onChangeMatrix(tuned);
  };

  // Apply predefined strategic presets
  const applyPreset = (presetType: 'economic' | 'esg' | 'jobs' | 'infrastructure' | 'equal') => {
    const newMatrix = Array.from({ length: n }, () => Array(n).fill(1));

    if (presetType === 'economic') {
      // Prioritize K1 heavily
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) newMatrix[i][j] = 1;
          else if (i === 0) newMatrix[i][j] = j === 1 ? 3 : j === 2 ? 4 : j === 3 ? 3 : 5;
          else if (j === 0) newMatrix[i][j] = 1 / newMatrix[0][i];
          else if (i === 1) newMatrix[i][j] = 2;
          else if (j === 1) newMatrix[i][j] = 0.5;
        }
      }
    } else if (presetType === 'esg') {
      // Prioritize ESG (index 3 or 'c4-esg')
      const esgIdx = criteria.findIndex((c) => c.id.includes('esg')) !== -1
        ? criteria.findIndex((c) => c.id.includes('esg'))
        : 3;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) newMatrix[i][j] = 1;
          else if (i === esgIdx) newMatrix[i][j] = 3;
          else if (j === esgIdx) newMatrix[i][j] = 1 / 3;
        }
      }
    } else if (presetType === 'jobs') {
      // Prioritize Jobs (index 4 or 'c5-sosial')
      const jobIdx = criteria.findIndex((c) => c.id.includes('sosial')) !== -1
        ? criteria.findIndex((c) => c.id.includes('sosial'))
        : 4;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) newMatrix[i][j] = 1;
          else if (i === jobIdx) newMatrix[i][j] = 3;
          else if (j === jobIdx) newMatrix[i][j] = 1 / 3;
        }
      }
    } else if (presetType === 'infrastructure') {
      // Prioritize Infrastructure (index 1 or 'c2-infrastruktur')
      const infraIdx = criteria.findIndex((c) => c.id.includes('infrastruktur')) !== -1
        ? criteria.findIndex((c) => c.id.includes('infrastruktur'))
        : 1;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) newMatrix[i][j] = 1;
          else if (i === infraIdx) newMatrix[i][j] = 3;
          else if (j === infraIdx) newMatrix[i][j] = 1 / 3;
        }
      }
    } else {
      // Equal
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newMatrix[i][j] = 1;
        }
      }
    }

    onChangeMatrix(newMatrix);
  };

  const currentPairVal = matrix[selectedPair.row]?.[selectedPair.col] ?? 1;
  const critA = criteria[selectedPair.row];
  const critB = criteria[selectedPair.col];

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {lang === 'id' ? 'Matriks Perbandingan Berpasangan Kriteria' : 'Criteria Pairwise Comparison Matrix'}
          </h2>
          <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
            {lang === 'id'
              ? 'Tentukan tingkat kepentingan relatif antar-kriteria menggunakan Skala Fundamental Saaty (1-9). Perubahan nilai akan menghitung bobot prioritas dan rasio konsistensi (CR) secara langsung.'
              : 'Evaluate relative importance between criteria using Saaty’s 1-9 fundamental scale. Calculations update priority weights and consistency ratio (CR) in real time.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaatyGuide(!showSaatyGuide)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Skala Saaty (1-9)' : 'Saaty Scale Guide'}</span>
          </button>
        </div>
      </div>

      {/* Saaty Scale Modal / Drawer if open */}
      {showSaatyGuide && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">
              {lang === 'id' ? 'Tabel Skala Fundamental Saaty (1 s.d. 9):' : 'Saaty Fundamental Scale Reference:'}
            </span>
            <button
              onClick={() => setShowSaatyGuide(false)}
              className="text-slate-500 hover:text-slate-800 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {SAATY_SCALE.map((lvl) => (
              <div key={lvl.value} className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">
                  {lang === 'id' ? lvl.labelId : lvl.labelEn}
                </span>
                <span className="text-slate-600 block text-[11px]">
                  {lang === 'id' ? lvl.explanationId : lvl.explanationEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Strategic Presets Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800">
              {lang === 'id' ? 'Profil Arah Kebijakan (Preset):' : 'Policy Strategic Presets:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => applyPreset('economic')}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Devisa & Nilai Tambah' : 'Economic & FX'}
            </button>
            <button
              onClick={() => applyPreset('esg')}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Hijau & ESG' : 'Green & ESG'}
            </button>
            <button
              onClick={() => applyPreset('jobs')}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Padat Karya & Rakyat' : 'Labor & Smallholders'}
            </button>
            <button
              onClick={() => applyPreset('infrastructure')}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Kesiapan Smelter & Energi' : 'Smelter & Infrastructure'}
            </button>
            <button
              onClick={() => applyPreset('equal')}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Bobot Sama Rata' : 'Equal Weights'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparative Editor (Dual Slider / Step Chooser) */}
      {critA && critB && selectedPair.row !== selectedPair.col && (
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-teal-400 font-semibold uppercase tracking-wider">
              {lang === 'id' ? 'Editor Komparasi Interaktif Terpilih:' : 'Active Pairwise Focus Comparison:'}
            </span>
            <span className="text-slate-400">
              {critA.code} vs {critB.code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 py-2">
            {/* Left Criterion */}
            <div
              className={`md:col-span-4 p-3 rounded-lg border transition-all ${
                currentPairVal >= 1
                  ? 'bg-slate-800/90 border-teal-500/80 text-white'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-teal-300">{critA.code}</span>
                {currentPairVal > 1 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-teal-500/20 text-teal-300">
                    +{Math.round(currentPairVal)}x {lang === 'id' ? 'Lebih Penting' : 'More Favored'}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm block">{lang === 'id' ? critA.name : critA.nameEn}</span>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {lang === 'id' ? critA.description : critA.descriptionEn}
              </p>
            </div>

            {/* Center Comparator Button Palette */}
            <div className="md:col-span-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {currentPairVal === 1
                  ? lang === 'id'
                    ? 'Kedua Kriteria Sama Penting (1)'
                    : 'Both Criteria Equally Important (1)'
                  : currentPairVal > 1
                  ? `${critA.code} ${lang === 'id' ? 'lebih penting dari' : 'favored over'} ${critB.code} (${Math.round(currentPairVal)})`
                  : `${critB.code} ${lang === 'id' ? 'lebih penting dari' : 'favored over'} ${critA.code} (${Math.round(1 / currentPairVal)})`}
              </span>

              {/* Saaty values bar: 9, 7, 5, 3, 1, 3, 5, 7, 9 */}
              <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                {/* Favor Crit A (9, 7, 5, 3) */}
                {[9, 7, 5, 3].map((val) => (
                  <button
                    key={`A-${val}`}
                    onClick={() => handleCellChange(selectedPair.row, selectedPair.col, val)}
                    className={`w-7 h-7 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      Math.abs(currentPairVal - val) < 0.2
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={`${critA.code} ${val}x`}
                  >
                    {val}
                  </button>
                ))}

                {/* Equal (1) */}
                <button
                  onClick={() => handleCellChange(selectedPair.row, selectedPair.col, 1)}
                  className={`px-2 h-7 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    Math.abs(currentPairVal - 1) < 0.1
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={lang === 'id' ? 'Sama Penting (1)' : 'Equally Important (1)'}
                >
                  1
                </button>

                {/* Favor Crit B (1/3, 1/5, 1/7, 1/9) */}
                {[3, 5, 7, 9].map((val) => {
                  const frac = 1 / val;
                  return (
                    <button
                      key={`B-${val}`}
                      onClick={() => handleCellChange(selectedPair.row, selectedPair.col, frac)}
                      className={`w-7 h-7 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        Math.abs(currentPairVal - frac) < 0.05
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={`${critB.code} ${val}x`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between w-full text-[10px] text-slate-400 px-2">
                <span>← {critA.code} Lebih Dominan</span>
                <span>Sama</span>
                <span>{critB.code} Lebih Dominan →</span>
              </div>
            </div>

            {/* Right Criterion */}
            <div
              className={`md:col-span-4 p-3 rounded-lg border transition-all ${
                currentPairVal < 1
                  ? 'bg-slate-800/90 border-amber-500/80 text-white'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-300">{critB.code}</span>
                {currentPairVal < 1 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300">
                    +{Math.round(1 / currentPairVal)}x {lang === 'id' ? 'Lebih Penting' : 'More Favored'}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm block">{lang === 'id' ? critB.name : critB.nameEn}</span>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {lang === 'id' ? critB.description : critB.descriptionEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Pairwise Comparison Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'id' ? 'Tabel Matriks Keputusan AHP (n × n)' : 'AHP Decision Matrix Table (n × n)'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'id'
                ? 'Klik sel di atas diagonal untuk mengubah nilai perbandingan berpasangan secara langsung.'
                : 'Click any cell above the diagonal to focus and modify comparison values.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-2.5 font-bold text-slate-700 w-24">
                  {lang === 'id' ? 'Kriteria' : 'Criteria'}
                </th>
                {criteria.map((c) => (
                  <th key={c.id} className="p-2.5 font-bold text-slate-800 text-center min-w-[70px]">
                    <span className="block">{c.code}</span>
                    <span className="text-[10px] text-slate-500 font-normal truncate block max-w-[80px]">
                      {c.name.split('&')[0]}
                    </span>
                  </th>
                ))}
                <th className="p-2.5 font-bold text-slate-900 text-center bg-slate-100 min-w-[90px]">
                  {lang === 'id' ? 'Bobot (wi)' : 'Weight (wi)'}
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((rowCrit, i) => (
                <tr key={rowCrit.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: rowCrit.color }} />
                      <span>{rowCrit.code}</span>
                    </div>
                  </td>

                  {criteria.map((colCrit, j) => {
                    const isDiagonal = i === j;
                    const isUpper = i < j;
                    const val = matrix[i]?.[j] ?? 1;
                    const isSelected = selectedPair.row === i && selectedPair.col === j;

                    if (isDiagonal) {
                      return (
                        <td key={colCrit.id} className="p-2.5 text-center font-bold text-slate-400 bg-slate-50/70">
                          1.0
                        </td>
                      );
                    }

                    if (isUpper) {
                      return (
                        <td
                          key={colCrit.id}
                          onClick={() => setSelectedPair({ row: i, col: j })}
                          className={`p-2 text-center cursor-pointer font-bold transition-all ${
                            isSelected
                              ? 'bg-teal-50 ring-2 ring-teal-500 text-teal-900 rounded-md shadow-xs'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="py-1 px-1.5 rounded-md bg-white border border-slate-200 hover:border-slate-400 shadow-2xs font-mono">
                            {formatFraction(val)}
                          </div>
                        </td>
                      );
                    }

                    // Lower triangle: Reciprocal
                    return (
                      <td
                        key={colCrit.id}
                        onClick={() => setSelectedPair({ row: j, col: i })}
                        className="p-2.5 text-center text-slate-500 font-mono text-[11px] bg-slate-50/30 cursor-pointer hover:bg-slate-100"
                        title={lang === 'id' ? 'Nilai resiprokal otomatis 1 / a(j,i)' : 'Automatic reciprocal 1 / a(j,i)'}
                      >
                        {formatFraction(val)}
                      </td>
                    );
                  })}

                  {/* Priority Weight Result Column */}
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 bg-slate-50">
                    <span className="text-sm font-extrabold text-teal-800">
                      {((ahpResult.weights[i] ?? 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}

              {/* Column Sums Row */}
              <tr className="bg-slate-100 font-bold text-slate-700">
                <td className="p-2.5 text-xs">
                  {lang === 'id' ? 'Total Kolom' : 'Column Sum'}
                </td>
                {criteria.map((_, j) => (
                  <td key={j} className="p-2.5 text-center font-mono text-[11px] text-slate-600">
                    {(ahpResult.columnSums[j] ?? 0).toFixed(2)}
                  </td>
                ))}
                <td className="p-2.5 text-center font-mono text-xs text-slate-900">
                  100.0%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Consistency Check & Inconsistency Diagnostic Box */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              ahpResult.isConsistent
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {ahpResult.isConsistent ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <span className="font-bold text-sm">
                  {ahpResult.isConsistent
                    ? lang === 'id'
                      ? 'Matriks Lolos Uji Konsistensi Saaty (CR ≤ 0.10)'
                      : 'Matrix Passes Saaty Consistency Test (CR ≤ 0.10)'
                    : lang === 'id'
                    ? 'Peringatan: Rasio Konsistensi Melebihi Batas Toleransi (> 0.10)'
                    : 'Warning: Consistency Ratio Exceeds 10% Threshold (> 0.10)'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {lang === 'id'
                  ? `Nilai CR adalah ${(ahpResult.cr * 100).toFixed(2)}% (Index CI = ${ahpResult.ci.toFixed(3)}, Random Index RI = ${ahpResult.ri.toFixed(2)}, λ max = ${ahpResult.lambdaMax.toFixed(3)}). ${
                      ahpResult.isConsistent
                        ? 'Pertimbangan pembobotan logis dan valid untuk analisis kebijakan.'
                        : 'Penilaian perbandingan berpasangan memiliki kontradiksi transitif yang perlu ditinjau kembali.'
                    }`
                  : `Current CR is ${(ahpResult.cr * 100).toFixed(2)}% (CI = ${ahpResult.ci.toFixed(3)}, RI = ${ahpResult.ri.toFixed(2)}, λ max = ${ahpResult.lambdaMax.toFixed(3)}). ${
                      ahpResult.isConsistent
                        ? 'Judgments are mathematically consistent and valid for decision making.'
                        : 'Pairwise preferences contain logical contradictions that require recalibration.'
                    }`}
              </p>

              {/* Inconsistency Hotspot suggestion */}
              {!ahpResult.isConsistent && ahpResult.inconsistencyHotspots && ahpResult.inconsistencyHotspots.length > 0 && (
                <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-lg border border-amber-300">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    {lang === 'id' ? 'Saran Koreksi Cepat:' : 'Correction Hotspot:'}
                  </span>
                  <p className="text-amber-800">
                    {lang === 'id'
                      ? `Inkonsistensi terbesar terjadi pada perbandingan [${criteria[ahpResult.inconsistencyHotspots[0].row]?.code} vs ${criteria[ahpResult.inconsistencyHotspots[0].col]?.code}] (Nilai sekarang: ${formatFraction(ahpResult.inconsistencyHotspots[0].actual)}, Disarankan mendekati: ${formatFraction(ahpResult.inconsistencyHotspots[0].ideal)}).`
                      : `Highest deviation is found at [${criteria[ahpResult.inconsistencyHotspots[0].row]?.code} vs ${criteria[ahpResult.inconsistencyHotspots[0].col]?.code}] (Current: ${formatFraction(ahpResult.inconsistencyHotspots[0].actual)}, Ideal: ~${formatFraction(ahpResult.inconsistencyHotspots[0].ideal)}).`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!ahpResult.isConsistent && (
                <button
                  onClick={handleAutoTune}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Otomatis Kalibrasi Matriks' : 'Auto-Tune Matrix'}</span>
                </button>
              )}

              <button
                onClick={onNavigateToNext}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>{lang === 'id' ? 'Lanjut ke Penilaian Alternatif' : 'Proceed to Alternatives'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
