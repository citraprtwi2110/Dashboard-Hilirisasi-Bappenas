import React, { useState } from 'react';
import {
  GitGraph,
  Sliders,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Info,
  Maximize2
} from 'lucide-react';
import {
  CRIT,
  CR,
  VARS,
  VAR,
  ConfirmComputationResult,
  AhpComputationResult,
  VariableItem
} from '../../data/trenggalekData';

interface FishboneTabProps {
  ahpResult: AhpComputationResult;
  confirmResult: ConfirmComputationResult;
  effectiveThreshold: number;
  setActiveThreshold: (val: number) => void;
}

export const FishboneTab: React.FC<FishboneTabProps> = ({
  ahpResult,
  confirmResult,
  effectiveThreshold,
  setActiveThreshold
}) => {
  const [metric, setMetric] = useState<'kontribusi' | 'bobot' | 'konsensus'>('kontribusi');
  const [showAll, setShowAll] = useState<boolean>(true);
  const [selectedVarId, setSelectedVarId] = useState<string | null>('MTR1');

  const formatPct = (val: number, d: number = 1) => `${(val * 100).toFixed(d)}%`;
  const formatNum = (val: number, d: number = 2) => val.toFixed(d);

  // Metric evaluation helper
  const getMetricValue = (vId: string) => {
    const item = confirmResult.items[vId];
    if (!item) return 0;
    if (metric === 'kontribusi') return item.R;
    if (metric === 'bobot') return item.gw;
    return item.konsensus;
  };

  const maxMetricVal = Math.max(1e-9, ...VARS.map((v) => getMetricValue(v.id)));

  // Category totals for bone thickness
  const catTotals: Record<string, number> = {};
  CRIT.forEach((c) => {
    catTotals[c.id] = c.vars.reduce((sum, v) => {
      const item = confirmResult.items[v.id];
      const isVisible = showAll || item.status === 'ok';
      return sum + (isVisible ? getMetricValue(v.id) : 0);
    }, 0);
  });
  const maxCatVal = Math.max(1e-9, ...Object.values(catTotals));

  // Bone geometry anchors (3 top, 3 bottom)
  // Top: Man (0), Machine (1), Method (2)
  // Bottom: Material (3), Measurement (4), Environment (5)
  const AX = [330, 620, 910];
  const YT = [130, 195, 260];
  const YB = [385, 450, 515];

  const categoryColors: Record<string, string> = {
    MAN: '#2563eb', // blue
    MAC: '#ea580c', // orange
    MTD: '#059669', // emerald
    MTR: '#d97706', // amber
    MSR: '#db2777', // pink
    ENV: '#0d9488'  // teal
  };

  const statusColors: Record<string, string> = {
    ok: '#10b981',
    bahas: '#f59e0b',
    tolak: '#ef4444',
    belum: '#94a3b8'
  };

  const selectedVar = selectedVarId ? VAR[selectedVarId] : null;
  const selectedItem = selectedVarId ? confirmResult.items[selectedVarId] : null;

  return (
    <div className="space-y-6">
      {/* Heading & Key Insights Strip */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <GitGraph className="w-4 h-4" />
            Diagram Sebab-Akibat Otomatis (Ishikawa / Fishbone)
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Analisis Akar Masalah Kenaikan Indeks Gini 6M Trenggalek
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Ketebalan tulang dan rusuk diagram terhitung secara otomatis dari bobot AHP dan skor konsensus stakeholder (R = G × K). Klik pada setiap rusuk untuk membedah kalkulasi.
          </p>
        </div>

        {/* 4 Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px]">Terkonfirmasi:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {confirmResult.cnt.ok}/{VARS.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px]">Ambang:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              {formatPct(effectiveThreshold, 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px]">Dimensi Dominan:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {CRIT.reduce((prev, curr) =>
                confirmResult.cat[curr.id].share > confirmResult.cat[prev.id].share ? curr : prev
              ).short}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px]">Pemberi Suara:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
              {confirmResult.voters} Instansi
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Metric Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Skala Tebal Rusuk:</span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {(
              [
                ['kontribusi', 'Kontribusi (R = G × K)'],
                ['bobot', 'Bobot AHP Global'],
                ['konsensus', 'Tingkat Kesepakatan']
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  metric === key
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Threshold Slider */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Tampilkan indikator belum terkonfirmasi</span>
          </label>

          <div className="flex items-center gap-2.5 min-w-[200px]">
            <span className="text-xs font-semibold text-slate-500">Ambang:</span>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={Math.round(effectiveThreshold * 100)}
              onChange={(e) => setActiveThreshold(+e.target.value / 100)}
              className="w-28 accent-blue-600 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {formatPct(effectiveThreshold, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Fishbone SVG Canvas */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500">
            Geser secara horizontal jika tampilan terpotong di layar seluler.
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Terkonfirmasi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Perlu Dibahas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Ditolak</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-2">
          <svg
            className="w-full min-w-[980px] h-auto select-none"
            viewBox="0 0 1240 640"
            role="group"
            aria-label="Diagram Fishbone Penyebab Kenaikan Indeks Gini"
          >
            {/* Main Central Spine Line */}
            <line
              x1="30"
              y1="320"
              x2="982"
              y2="320"
              stroke="#1e293b"
              strokeWidth="5"
              strokeLinecap="round"
              className="dark:stroke-slate-200"
            />
            <polygon
              points="982,308 1002,320 982,332"
              fill="#1e293b"
              className="dark:fill-slate-200"
            />

            {/* 6 Diagonal Bones for 6M Categories */}
            {CRIT.map((c, ci) => {
              const isTop = ci < 3;
              const ax = AX[ci % 3];
              const sx = ax - 120;
              const sy = isTop ? 78 : 562;
              const ys = isTop ? YT : YB;
              const color = categoryColors[c.id];
              const catWeight = catTotals[c.id] || 0;
              const boneWidth = 3 + (10 * catWeight) / maxCatVal;
              const catStat = confirmResult.cat[c.id];

              return (
                <g key={c.id}>
                  {/* Diagonal Bone Line */}
                  <line
                    x1={sx}
                    y1={sy}
                    x2={ax}
                    y2="320"
                    stroke={color}
                    strokeWidth={boneWidth}
                    strokeLinecap="round"
                  />

                  {/* Category Box Header */}
                  <rect
                    x={sx - 102}
                    y={isTop ? 28 : 564}
                    width="204"
                    height="48"
                    rx="10"
                    fill="#ffffff"
                    stroke={color}
                    strokeWidth="2.5"
                    className="dark:fill-slate-900"
                  />
                  <text
                    x={sx}
                    y={isTop ? 49 : 585}
                    textAnchor="middle"
                    fontSize="13.5"
                    fontWeight="800"
                    fill="#0f172a"
                    className="dark:fill-white font-sans"
                  >
                    {c.en} · {c.short}
                  </text>
                  <text
                    x={sx}
                    y={isTop ? 66 : 602}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#64748b"
                    className="dark:fill-slate-400"
                  >
                    {catStat.nOk}/{catStat.n} ok · {formatPct(catStat.share, 0)} kontribusi
                  </text>

                  {/* Indicator Ribs */}
                  {c.vars.map((v, j) => {
                    const item = confirmResult.items[v.id];
                    const isVisible = showAll || item.status === 'ok';
                    if (!isVisible) return null;

                    const y = ys[j];
                    const xb = ax - (120 * Math.abs(320 - y)) / 242;
                    const val = getMetricValue(v.id);
                    const ribWidth = 2 + (11 * val) / maxMetricVal;
                    const isSelected = selectedVarId === v.id;
                    const stColor = statusColors[item.status] || '#94a3b8';
                    const isConfirmed = item.status === 'ok';

                    return (
                      <g
                        key={v.id}
                        onClick={() => setSelectedVarId(v.id)}
                        className="cursor-pointer group"
                      >
                        {/* Hover & click bounding hitbox */}
                        <rect
                          x={xb - 248}
                          y={y - 24}
                          width={252}
                          height={48}
                          rx="8"
                          fill={isSelected ? '#dbeafe' : 'transparent'}
                          className={isSelected ? 'dark:fill-blue-950/60' : 'group-hover:fill-slate-100/60 dark:group-hover:fill-slate-800/40'}
                        />

                        {/* Horizontal rib line */}
                        <line
                          x1={xb - 30}
                          y1={y}
                          x2={xb}
                          y2={y}
                          stroke={color}
                          strokeWidth={ribWidth}
                          strokeLinecap="round"
                          strokeDasharray={isConfirmed ? undefined : '5 4'}
                          strokeOpacity={isConfirmed ? 1 : 0.6}
                        />

                        {/* Status Circle dot */}
                        <circle
                          cx={xb - 30}
                          cy={y}
                          r={isSelected ? '7' : '5.5'}
                          fill={item.status === 'belum' ? '#ffffff' : stColor}
                          stroke={stColor}
                          strokeWidth="2"
                        />

                        {/* Rib Text Label */}
                        <text
                          x={xb - 42}
                          y={y - 3}
                          textAnchor="end"
                          fontSize="12.5"
                          fontWeight={isSelected ? '800' : '700'}
                          fill={isSelected ? '#1d4ed8' : '#0f172a'}
                          className="dark:fill-slate-200"
                        >
                          {v.s}
                        </text>

                        <text
                          x={xb - 42}
                          y={y + 13}
                          textAnchor="end"
                          fontSize="10.5"
                          fontFamily="monospace"
                          fill="#64748b"
                          className="dark:fill-slate-400"
                        >
                          G {formatPct(item.gw, 1)} · K {item.n ? formatPct(item.konsensus, 0) : '–'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Fish Head Box: Problem Statement */}
            <g className="head">
              <rect
                x="1004"
                y="258"
                width="226"
                height="124"
                rx="14"
                fill="#0f172a"
                className="dark:fill-slate-800 shadow-xl"
              />
              <text
                x="1117"
                y="292"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#94a3b8"
                letterSpacing="1"
              >
                AKAR MASALAH UTAMA
              </text>
              <text
                x="1117"
                y="320"
                textAnchor="middle"
                fontSize="17"
                fontWeight="800"
                fill="#ffffff"
              >
                Indeks Gini Naik
              </text>
              <text
                x="1117"
                y="346"
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="14"
                fontWeight="700"
                fill="#38bdf8"
              >
                0,335 (2021) → 0,359 (2025)
              </text>
              <text
                x="1117"
                y="368"
                textAnchor="middle"
                fontSize="11"
                fill="#cbd5e1"
              >
                Kabupaten Trenggalek
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Two columns: Pareto ranking & Rib detail inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pareto Ranking List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Peringkat Akar Masalah Terkonfirmasi (Pareto Analysis)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kontribusi relatif dan persentase kumulatif indikator penyebab
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {confirmResult.ranked.length} Lolos Ambang
            </span>
          </div>

          <div className="space-y-3">
            {confirmResult.ranked.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada indikator yang mencapai ambang batas {formatPct(effectiveThreshold, 0)}.
              </div>
            ) : (
              confirmResult.ranked.map((item, idx) => {
                const v = VAR[item.id];
                const c = CR[v.crit!];
                const maxShare = confirmResult.ranked[0]?.share || 1;
                const barWidth = (item.share / maxShare) * 100;
                const isSelected = selectedVarId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedVarId(item.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 w-5 text-right font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-slate-900 dark:text-white">{v.name}</span>
                        <span className="text-[10px] text-slate-400">({c.en})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {formatPct(item.share, 1)}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Kumulatif: {formatPct(item.cum || 0, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Rib Inspector Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Detail Kalkulasi Indikator Terpilih
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Klik salah satu rusuk diagram untuk melihat rincian formulanya
            </p>
          </div>

          {selectedVar && selectedItem ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <div className="font-bold text-sm text-blue-950 dark:text-blue-200">
                  {selectedVar.name}
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  ID: {selectedVar.id} · Hipotesis {selectedVar.hyp} · Kategori: {CR[selectedVar.crit!].en}
                </div>
              </div>

              {/* Formula & metrics list */}
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">
                    Bobot Global AHP (G):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatPct(selectedItem.gw, 2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">
                    Tingkat Sepakat (K):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedItem.n ? formatPct(selectedItem.konsensus, 1) : '–'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">
                    Skor Komposit (R = G × K):
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {formatNum(selectedItem.R * 100, 2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">
                    Pangsa Kontribusi:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedItem.status === 'ok' ? formatPct(selectedItem.share, 1) : '–'}
                  </span>
                </div>
              </div>

              {/* Baseline data notes */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Data Awal & Dasar Masalah:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedVar.base}
                </p>
              </div>

              {selectedItem.notes.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Catatan Stakeholder:
                  </span>
                  <div className="space-y-1">
                    {selectedItem.notes.map((n, i) => (
                      <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        • "{n.text}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Pilih salah satu indikator di diagram untuk melihat kalkulasinya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
