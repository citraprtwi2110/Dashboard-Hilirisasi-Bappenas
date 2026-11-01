import React, { useState } from 'react';
import { Alternative, AlternativeScoreResult, Criterion } from '../types/ahp';
import { SlidersHorizontal, RotateCcw, ArrowRight, Check, Award, Layers } from 'lucide-react';

interface AlternativeScoringProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  onChangeAlternativeScore: (altId: string, critId: string, newScore: number) => void;
  onResetAlternativeScores: () => void;
  rankedResults: AlternativeScoreResult[];
  lang: 'id' | 'en';
  onNavigateToTab: (tab: 'sensitivity' | 'valuechain') => void;
}

export const AlternativeScoring: React.FC<AlternativeScoringProps> = ({
  criteria,
  alternatives,
  onChangeAlternativeScore,
  onResetAlternativeScores,
  rankedResults,
  lang,
  onNavigateToTab,
}) => {
  const [selectedAltId, setSelectedAltId] = useState<string>(alternatives[0]?.id || '');
  const activeAlt = alternatives.find((a) => a.id === selectedAltId) || alternatives[0];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {lang === 'id' ? 'Matriks Penilaian Alternatif Hilirisasi' : 'Alternative Commodity Scoring Matrix'}
          </h2>
          <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
            {lang === 'id'
              ? 'Evaluasi kinerja masing-masing opsi komoditas hilirisasi terhadap setiap kriteria kebijakan (skor 0 - 100). Ubah slider untuk menyimulasikan proyek spesifik atau kesiapan regional.'
              : 'Evaluate the performance score of each downstream commodity against criteria (0 - 100). Tweak sliders to simulate specific regional projects or new plant readiness.'}
          </p>
        </div>

        <button
          onClick={onResetAlternativeScores}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? 'Reset Nilai Default' : 'Reset Default Scores'}</span>
        </button>
      </div>

      {/* Main Alternative Grid / Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-bold text-slate-800 min-w-[200px]">
                  {lang === 'id' ? 'Alternatif Hilirisasi' : 'Downstream Alternative'}
                </th>
                <th className="p-3 font-bold text-slate-700 text-center">
                  {lang === 'id' ? 'Multiplier' : 'Multiplier'}
                </th>
                <th className="p-3 font-bold text-slate-700 text-center">
                  TRL
                </th>
                {criteria.map((c) => (
                  <th key={c.id} className="p-3 font-bold text-slate-800 text-center min-w-[90px]">
                    <span className="block">{c.code}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {((c.weight) * 100).toFixed(0)}%
                    </span>
                  </th>
                ))}
                <th className="p-3 font-bold text-slate-900 text-center bg-slate-100 min-w-[110px]">
                  {lang === 'id' ? 'Skor Komposit' : 'Composite Score'}
                </th>
                <th className="p-3 font-bold text-slate-900 text-center min-w-[80px]">
                  {lang === 'id' ? 'Peringkat' : 'Rank'}
                </th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt) => {
                const rankInfo = rankedResults.find((r) => r.alternativeId === alt.id);
                const isSelected = alt.id === selectedAltId;

                return (
                  <tr
                    key={alt.id}
                    onClick={() => setSelectedAltId(alt.id)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50/40 font-medium' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {alt.code}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{alt.name}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {alt.keyCommodity}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-center font-semibold text-slate-700 font-mono">
                      {alt.multiplierValue}
                    </td>

                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        TRL {alt.trl}
                      </span>
                    </td>

                    {/* Criteria Scores */}
                    {criteria.map((c) => {
                      const score = alt.scores[c.id] ?? 0;
                      return (
                        <td key={c.id} className="p-3 text-center">
                          <span className="font-mono font-bold text-slate-800">
                            {(score * 100).toFixed(0)}
                          </span>
                          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${score * 100}%`, backgroundColor: c.color }}
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Composite Score */}
                    <td className="p-3 text-center bg-slate-50/60 font-mono font-extrabold text-sm text-slate-900">
                      {rankInfo ? (rankInfo.compositeScore * 100).toFixed(1) : '-'}
                    </td>

                    {/* Rank Badge */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          rankInfo?.rank === 1
                            ? 'bg-amber-500 text-white'
                            : rankInfo?.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rankInfo?.rank ?? '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Detail & Fine-Tuning Drawer for Active Alternative */}
      {activeAlt && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                {activeAlt.code}
              </span>
              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  {lang === 'id' ? 'Penyesuaian Parameter Proyek' : 'Active Project Parameter Tuning'}
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeAlt.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">{lang === 'id' ? 'Estimasi Investasi' : 'Estimated Investment'}</span>
                <span className="font-bold text-slate-800">{activeAlt.capexEstimate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{lang === 'id' ? 'Serapan Kerja' : 'Job Creation'}</span>
                <span className="font-bold text-slate-800">{activeAlt.jobsEstimate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{lang === 'id' ? 'Resiko ESG' : 'ESG Risk'}</span>
                <span className="font-bold text-slate-800">{activeAlt.esgRisk}</span>
              </div>
            </div>
          </div>

          {/* Interactive Sliders for Each Criterion */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criteria.map((c) => {
              const currentScore = activeAlt.scores[c.id] ?? 0;
              const weightedContribution = currentScore * c.weight;

              return (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c.color }} />
                      <span className="font-bold text-slate-800">{c.code}</span>
                      <span className="text-slate-600 truncate max-w-[120px]">{c.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {Math.round(currentScore * 100)} / 100
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(currentScore * 100)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) / 100;
                      onChangeAlternativeScore(activeAlt.id, c.id, val);
                    }}
                    className="w-full accent-slate-900 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{lang === 'id' ? 'Bobot AHP: ' : 'AHP Weight: '}{(c.weight * 100).toFixed(0)}%</span>
                    <span className="font-medium text-slate-700">
                      +{((weightedContribution) * 100).toFixed(1)} pt {lang === 'id' ? 'ke skor total' : 'to total'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {lang === 'id'
                ? '*Pergeseran skor akan langsung memperbarui kalkulasi komposit pada Dasbor & Analisis Sensitivitas'
                : '*Score adjustments immediately update calculations across the Executive Dashboard & Sensitivity simulation'}
            </span>
            <button
              onClick={() => onNavigateToTab('sensitivity')}
              className="flex items-center gap-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <span>{lang === 'id' ? 'Uji Sensitivitas (What-If)' : 'Test Sensitivity (What-If)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
