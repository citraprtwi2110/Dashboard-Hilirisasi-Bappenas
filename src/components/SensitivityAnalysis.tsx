import React, { useState } from 'react';
import { Alternative, Criterion } from '../types/ahp';
import { calculateCompositeScores, rebalanceWeightsForSensitivity } from '../utils/ahp';
import { Sliders, RotateCcw, TrendingUp, Info, HelpCircle } from 'lucide-react';

interface SensitivityAnalysisProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  baselineWeights: number[];
  lang: 'id' | 'en';
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  criteria,
  alternatives,
  baselineWeights,
  lang,
}) => {
  // Current dynamic weights in sensitivity simulator
  const [activeWeights, setActiveWeights] = useState<number[]>([...baselineWeights]);
  const [focusedCritIndex, setFocusedCritIndex] = useState<number>(0);

  // Re-calculate scores dynamically based on activeWeights
  const currentRanked = calculateCompositeScores(alternatives, criteria, activeWeights);
  const baselineRanked = calculateCompositeScores(alternatives, criteria, baselineWeights);

  const handleSliderChange = (targetIdx: number, newPct: number) => {
    const newWeight = newPct / 100;
    const rebalanced = rebalanceWeightsForSensitivity(activeWeights, targetIdx, newWeight);
    setActiveWeights(rebalanced);
    setFocusedCritIndex(targetIdx);
  };

  const handleResetWeights = () => {
    setActiveWeights([...baselineWeights]);
  };

  // Pre-generate sensitivity curve for the focused criterion (x from 0% to 100%)
  const focusedCrit = criteria[focusedCritIndex];
  const curveSteps = 21; // 0%, 5%, 10%, ..., 100%
  const chartPoints: { xPct: number; scores: Record<string, number> }[] = [];

  for (let s = 0; s <= curveSteps; s++) {
    const xPct = (s / curveSteps) * 100;
    const w = xPct / 100;
    const testWeights = rebalanceWeightsForSensitivity(baselineWeights, focusedCritIndex, w);
    const testScores = calculateCompositeScores(alternatives, criteria, testWeights);
    const scoreMap: Record<string, number> = {};
    testScores.forEach((r) => {
      scoreMap[r.alternativeId] = r.compositeScore;
    });
    chartPoints.push({ xPct, scores: scoreMap });
  }

  // Chart SVG Dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const palette = ['#0284c7', '#16a34a', '#d97706', '#9333ea', '#e11d48'];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'id' ? 'Simulasi & Analisis Sensitivitas Dinamis (What-If)' : 'Dynamic Sensitivity & What-If Simulation'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              {lang === 'id' ? 'Interaktif Real-time' : 'Real-time Interactive'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
            {lang === 'id'
              ? 'Geser slider bobot kriteria untuk melihat titik kritis (crossover points) di mana prioritas komoditas hilirisasi berganti. Bobot kriteria lainnya otomatis diseimbangkan (rebalanced) secara proporsional.'
              : 'Drag criteria weight sliders to observe critical crossover points where commodity priorities flip. Other weights rebalance automatically in proportional harmony.'}
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? 'Kembalikan Bobot AHP' : 'Restore AHP Weights'}</span>
        </button>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Weight Sliders */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <span>{lang === 'id' ? 'Penyesuaian Bobot Kriteria' : 'Criteria Weight Sliders'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
              Total: {(activeWeights.reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="space-y-4">
            {criteria.map((c, idx) => {
              const currentWeightPct = Math.round((activeWeights[idx] ?? 0) * 100);
              const baselinePct = Math.round((baselineWeights[idx] ?? 0) * 100);
              const isFocused = focusedCritIndex === idx;

              return (
                <div
                  key={c.id}
                  onClick={() => setFocusedCritIndex(idx)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isFocused
                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c.color }} />
                      <span className="font-bold text-slate-900">{c.code}:</span>
                      <span className="text-slate-700 font-medium truncate max-w-[150px]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        (Baseline: {baselinePct}%)
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {currentWeightPct}%
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentWeightPct}
                    onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>0% (Diabaikan)</span>
                    <span className="text-teal-700 font-medium">
                      {isFocused ? (lang === 'id' ? 'Sedang Ditinjau di Grafik' : 'Active in Curve Chart') : ''}
                    </span>
                    <span>100% (Dominan Mutlak)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Ranking Reordering + Sensitivity Curve Chart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Ranking Shift Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>{lang === 'id' ? 'Perubahan Peringkat Komoditas Real-Time:' : 'Real-Time Rank Shifts:'}</span>
              <span className="text-xs text-slate-500 font-normal">
                {lang === 'id' ? 'Bandingkan dengan Baseline AHP' : 'Compared to AHP Baseline'}
              </span>
            </h3>

            <div className="space-y-2.5">
              {currentRanked.map((curr) => {
                const alt = alternatives.find((a) => a.id === curr.alternativeId);
                const baseInfo = baselineRanked.find((b) => b.alternativeId === curr.alternativeId);
                if (!alt) return null;

                const rankDiff = (baseInfo?.rank ?? curr.rank) - curr.rank; // positive means improved

                return (
                  <div
                    key={curr.alternativeId}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                          curr.rank === 1
                            ? 'bg-amber-500 text-white'
                            : curr.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {curr.rank}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{alt.name}</span>
                        <span className="text-[11px] text-slate-500">{alt.hilirisasiTarget}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {rankDiff !== 0 && (
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-sm text-[11px] ${
                            rankDiff > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rankDiff > 0 ? `▲ +${rankDiff}` : `▼ ${rankDiff}`}
                        </span>
                      )}
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {(curr.compositeScore * 100).toFixed(1)} pt
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {curr.percentageShare.toFixed(1)}% share
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Sensitivity Curve Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'id' ? `Kurva Sensitivitas Kriteria: ${focusedCrit?.code} (${focusedCrit?.name})` : `Sensitivity Curves for: ${focusedCrit?.code} (${focusedCrit?.nameEn})`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'id'
                    ? 'Sumbu X: Bobot Kriteria (0 - 100%) · Sumbu Y: Skor Komposit Alternatif'
                    : 'X-axis: Criteria Weight (0 - 100%) · Y-axis: Alternative Composite Score'}
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-xs">
                {alternatives.map((alt, i) => (
                  <div key={alt.id} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
                    <span className="text-slate-600 font-medium text-[11px]">{alt.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG Plot */}
            <div className="overflow-x-auto">
              <svg width={svgWidth} height={svgHeight} className="overflow-visible mx-auto">
                {/* Axes and Grid */}
                <line
                  x1={padding.left}
                  y1={svgHeight - padding.bottom}
                  x2={svgWidth - padding.right}
                  y2={svgHeight - padding.bottom}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={svgHeight - padding.bottom}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />

                {/* Y-axis grid lines (0, 0.25, 0.5, 0.75, 1.0) */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((yVal) => {
                  const yPos = svgHeight - padding.bottom - yVal * plotHeight;
                  return (
                    <g key={yVal}>
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={svgWidth - padding.right}
                        y2={yPos}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={yPos + 3}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {(yVal * 100).toFixed(0)}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels (0%, 25%, 50%, 75%, 100%) */}
                {[0, 25, 50, 75, 100].map((xPct) => {
                  const xPos = padding.left + (xPct / 100) * plotWidth;
                  return (
                    <g key={xPct}>
                      <line
                        x1={xPos}
                        y1={svgHeight - padding.bottom}
                        x2={xPos}
                        y2={svgHeight - padding.bottom + 4}
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                      <text
                        x={xPos}
                        y={svgHeight - padding.bottom + 16}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-500 font-mono"
                      >
                        {xPct}%
                      </text>
                    </g>
                  );
                })}

                {/* Current Active Weight Vertical Guideline */}
                {focusedCritIndex !== -1 && (
                  <g>
                    {(() => {
                      const curX =
                        padding.left + (activeWeights[focusedCritIndex] ?? 0) * plotWidth;
                      return (
                        <>
                          <line
                            x1={curX}
                            y1={padding.top}
                            x2={curX}
                            y2={svgHeight - padding.bottom}
                            stroke="#0f172a"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                          />
                          <text
                            x={curX}
                            y={padding.top - 6}
                            textAnchor="middle"
                            className="text-[10px] fill-slate-900 font-bold"
                          >
                            Posisi Saat Ini ({Math.round(activeWeights[focusedCritIndex] * 100)}%)
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* Multi-line curves for each alternative */}
                {alternatives.map((alt, altIdx) => {
                  const pathData = chartPoints
                    .map((pt, idx) => {
                      const x = padding.left + (pt.xPct / 100) * plotWidth;
                      const score = pt.scores[alt.id] ?? 0;
                      const y = svgHeight - padding.bottom - score * plotHeight;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ');

                  return (
                    <path
                      key={alt.id}
                      d={pathData}
                      fill="none"
                      stroke={palette[altIdx % palette.length]}
                      strokeWidth="2.5"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
