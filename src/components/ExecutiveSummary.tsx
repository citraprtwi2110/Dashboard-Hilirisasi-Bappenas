import React from 'react';
import { Award, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Factory, ShieldCheck, ArrowRight } from 'lucide-react';
import { AhpCalculationResult, Alternative, AlternativeScoreResult, Criterion, ScenarioPreset } from '../types/ahp';

interface ExecutiveSummaryProps {
  scenario: ScenarioPreset;
  criteria: Criterion[];
  alternatives: Alternative[];
  ahpResult: AhpCalculationResult;
  rankedResults: AlternativeScoreResult[];
  lang: 'id' | 'en';
  onNavigateToTab: (tab: 'criteria' | 'alternatives' | 'sensitivity' | 'valuechain') => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  scenario,
  criteria,
  alternatives,
  ahpResult,
  rankedResults,
  lang,
  onNavigateToTab,
}) => {
  const topRanked = rankedResults[0];
  const topAlternative = alternatives.find((a) => a.id === topRanked?.alternativeId);

  // SVG Radar Chart Calculations
  const numCriteria = criteria.length;
  const radarRadius = 85;
  const radarCenter = 110;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numCriteria - Math.PI / 2;
    const r = radarRadius * Math.max(0, Math.min(1, value));
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
    };
  };

  const palette = ['#0284c7', '#16a34a', '#d97706', '#9333ea', '#e11d48'];

  return (
    <div className="space-y-6">
      {/* Scenario Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            {scenario.sectorBadge}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
                ahpResult.isConsistent
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {ahpResult.isConsistent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'id' ? 'Matriks Konsisten' : 'Consistent Matrix'} (CR = {(ahpResult.cr * 100).toFixed(1)}%)
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'id' ? 'Inkonsisten' : 'Inconsistent'} (CR = {(ahpResult.cr * 100).toFixed(1)}% &gt; 10%)
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          {lang === 'id' ? scenario.title : scenario.titleEn}
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {lang === 'id' ? scenario.description : scenario.descriptionEn}
        </p>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400 block">{lang === 'id' ? 'Jumlah Kriteria' : 'Criteria Evaluated'}</span>
            <span className="text-base font-bold text-white mt-0.5 block">{criteria.length} Kriteria AHP</span>
          </div>
          <div>
            <span className="text-slate-400 block">{lang === 'id' ? 'Alternatif Komoditas' : 'Alternative Options'}</span>
            <span className="text-base font-bold text-white mt-0.5 block">{alternatives.length} Rantai Hilirisasi</span>
          </div>
          <div>
            <span className="text-slate-400 block">{lang === 'id' ? 'Rasio Konsistensi (CR)' : 'Consistency Ratio'}</span>
            <span className="text-base font-bold text-teal-300 mt-0.5 block">
              {(ahpResult.cr * 100).toFixed(2)}% {ahpResult.isConsistent ? '(Valid ≤ 10%)' : '(Perlu Koreksi)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{lang === 'id' ? 'Rekomendasi Utama' : 'Top Recommendation'}</span>
            <span className="text-base font-bold text-amber-300 mt-0.5 block truncate">
              {topAlternative ? topAlternative.name.split('(')[0] : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Grid: Top Priority Card + Composite Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Priority Winner Card */}
        {topAlternative && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      {lang === 'id' ? 'Prioritas #1 Nasional' : 'Top National Priority #1'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{topAlternative.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">{lang === 'id' ? 'Skor Komposit' : 'Score'}</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {(topRanked.compositeScore * 100).toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {lang === 'id' ? topAlternative.description : topAlternative.descriptionEn}
              </p>

              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lang === 'id' ? 'Multiplier Nilai Tambah' : 'Value Multiplier'}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{topAlternative.multiplierValue}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'id' ? 'Estimasi CAPEX' : 'Estimated CAPEX'}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{topAlternative.capexEstimate}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Factory className="w-3.5 h-3.5 text-purple-600" />
                    <span>{lang === 'id' ? 'Kesiapan Teknologi' : 'TRL (Tech Level)'}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">TRL {topAlternative.trl} / 9</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                    <span>{lang === 'id' ? 'Resiko ESG' : 'ESG Risk Rating'}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{topAlternative.esgRisk}</span>
                </div>
              </div>

              {/* Target Products list */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3 text-xs mb-4">
                <span className="font-semibold text-emerald-900 block mb-1">
                  {lang === 'id' ? 'Produk Target Hilir Utama:' : 'Key Downstream Products:'}
                </span>
                <p className="text-emerald-800">{topAlternative.hilirisasiTarget}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('valuechain')}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg py-2 transition-colors cursor-pointer"
            >
              <span>{lang === 'id' ? 'Eksplorasi Rantai Nilai Lengkap' : 'Explore Full Value Chain'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Leaderboard & Contribution Stacked Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'id' ? 'Peringkat Komposit Hilirisasi' : 'Composite Downstream Leaderboard'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'id'
                    ? 'Skor agregat bobot AHP kriteria terhadap nilai kinerja alternatif'
                    : 'AHP criteria weighted aggregate performance scores'}
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('sensitivity')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'id' ? 'Simulasi What-If' : 'What-If Simulation'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Criteria Legend */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              {criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 font-medium">
                    {c.code}: {(c.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Stacked Bar Rows */}
            <div className="space-y-4">
              {rankedResults.map((result, idx) => {
                const alt = alternatives.find((a) => a.id === result.alternativeId);
                if (!alt) return null;

                return (
                  <div key={result.alternativeId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-500 text-white'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {result.rank}
                        </span>
                        <span className="font-bold text-slate-900">{alt.name}</span>
                        <span className="text-slate-400 font-normal">({alt.code})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {(result.compositeScore * 100).toFixed(1)} pt
                        </span>
                        <span className="text-slate-500">({result.percentageShare.toFixed(1)}%)</span>
                      </div>
                    </div>

                    {/* Stacked Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden flex shadow-inner">
                      {criteria.map((c) => {
                        const contribution = result.criteriaContributions[c.id] ?? 0;
                        const pctWidth = (contribution / 1.0) * 100;
                        return (
                          <div
                            key={c.id}
                            style={{
                              width: `${pctWidth}%`,
                              backgroundColor: c.color,
                            }}
                            title={`${c.name}: +${(contribution * 100).toFixed(1)} pt`}
                            className="h-full transition-all duration-300 hover:opacity-80"
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'id'
                ? '*Kontribusi warna mencerminkan porsi bobot kriteria dalam skor komposit'
                : '*Segment colors reflect criteria weighting proportion in total score'}
            </span>
            <button
              onClick={() => onNavigateToTab('alternatives')}
              className="font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {lang === 'id' ? 'Detail Nilai Komoditas →' : 'Commodity Score Details →'}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Criteria Weight Breakdown & Radar Spider Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Spider Comparison */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'id' ? 'Perbandingan Multi-Dimensi (Radar AHP)' : 'Multi-Dimensional Comparison (Radar)'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'id'
                  ? 'Visualisasi keunggulan komparatif alternatif terhadap seluruh kriteria'
                  : 'Comparative performance profile of alternatives across all criteria'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {alternatives.slice(0, 3).map((alt, i) => (
                <div key={alt.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette[i] }} />
                  <span className="text-slate-700 font-medium">{alt.code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
            {/* SVG Radar */}
            <div className="relative">
              <svg width="220" height="220" className="overflow-visible">
                {/* Background Concentric Webs */}
                {[0.25, 0.5, 0.75, 1.0].map((ring) => {
                  const points = criteria.map((_, i) => {
                    const coord = getCoordinates(i, ring);
                    return `${coord.x},${coord.y}`;
                  });
                  return (
                    <polygon
                      key={ring}
                      points={points.join(' ')}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth={ring === 1.0 ? '1.5' : '1'}
                      strokeDasharray={ring < 1.0 ? '2 2' : undefined}
                    />
                  );
                })}

                {/* Spoke lines */}
                {criteria.map((_, i) => {
                  const spoke = getCoordinates(i, 1.0);
                  return (
                    <line
                      key={i}
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={spoke.x}
                      y2={spoke.y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Alternative Polygons */}
                {alternatives.slice(0, 3).map((alt, altIdx) => {
                  const points = criteria.map((c, i) => {
                    const score = alt.scores[c.id] ?? 0;
                    const coord = getCoordinates(i, score);
                    return `${coord.x},${coord.y}`;
                  });
                  return (
                    <polygon
                      key={alt.id}
                      points={points.join(' ')}
                      fill={palette[altIdx]}
                      fillOpacity="0.18"
                      stroke={palette[altIdx]}
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Criteria labels around perimeter */}
                {criteria.map((c, i) => {
                  const labelCoord = getCoordinates(i, 1.22);
                  return (
                    <text
                      key={c.id}
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] font-bold fill-slate-700"
                    >
                      {c.code}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Radar Insights List */}
            <div className="space-y-2 text-xs flex-1">
              <span className="font-bold text-slate-800 block">
                {lang === 'id' ? 'Profil Keunggulan Komparatif:' : 'Comparative Advantage Profile:'}
              </span>
              {alternatives.map((alt, i) => {
                // Find highest scoring criterion for this alt
                let bestCrit = criteria[0];
                let maxScore = -1;
                criteria.forEach((c) => {
                  const s = alt.scores[c.id] ?? 0;
                  if (s > maxScore) {
                    maxScore = s;
                    bestCrit = c;
                  }
                });

                return (
                  <div key={alt.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                      style={{ backgroundColor: palette[i % palette.length] }}
                    />
                    <div>
                      <span className="font-bold text-slate-900">{alt.name.split('(')[0]}:</span>{' '}
                      <span className="text-slate-600">
                        {lang === 'id' ? 'Paling unggul pada dimensi ' : 'Excels most in '}
                        <span className="font-semibold text-slate-800">{bestCrit.name}</span> (
                        {(maxScore * 100).toFixed(0)} pt)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Criteria Weight Ranking & Consistency Verification Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'id' ? 'Bobot Prioritas Kriteria (AHP)' : 'Criteria Priority Weights (AHP)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'id' ? 'Vektor eigen prioritas hasil normalisasi Saaty' : 'Saaty normalized priority eigenvector'}
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('criteria')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {lang === 'id' ? 'Ubah Matriks →' : 'Edit Matrix →'}
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {criteria.map((c) => {
                const pct = (c.weight * 100).toFixed(1);
                return (
                  <div key={c.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{c.code}</span>
                        <span className="text-slate-600">{lang === 'id' ? c.name : c.nameEn}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Consistency Summary */}
          <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800">
                {lang === 'id' ? 'Uji Konsistensi Matematis (Saaty):' : 'Saaty Mathematical Consistency:'}
              </span>
              <span
                className={`font-bold ${
                  ahpResult.isConsistent ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {ahpResult.isConsistent
                  ? lang === 'id'
                    ? 'KONSISTEN (VALID)'
                    : 'CONSISTENT (VALID)'
                  : lang === 'id'
                  ? 'PERLU KALIBRASI'
                  : 'RECALIBRATE'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">λ max:</span>
                <span className="font-mono font-semibold text-slate-800">{ahpResult.lambdaMax.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">CI Index:</span>
                <span className="font-mono font-semibold text-slate-800">{ahpResult.ci.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Random Index (RI):</span>
                <span className="font-mono font-semibold text-slate-800">{ahpResult.ri.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Policy Takeaway Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700">
        <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
          <span>{lang === 'id' ? 'Rangkuman Rekomendasi Kebijakan (Policy Brief):' : 'Strategic Policy Takeaways:'}</span>
        </h4>
        <p className="leading-relaxed text-slate-600">
          {lang === 'id' ? scenario.policySummary : scenario.policySummaryEn}
        </p>
      </div>
    </div>
  );
};
