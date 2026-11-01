import React, { useState } from 'react';
import { Alternative, AlternativeScoreResult, Criterion, ScenarioPreset, AhpCalculationResult } from '../types/ahp';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ScenarioPreset;
  criteria: Criterion[];
  alternatives: Alternative[];
  ahpResult: AhpCalculationResult;
  rankedResults: AlternativeScoreResult[];
  lang: 'id' | 'en';
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  criteria,
  alternatives,
  ahpResult,
  rankedResults,
  lang,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textLines = [
      `LAPORAN EKSEKUTIF AHP HILIRISASI INDUSTRI`,
      `Skenario: ${scenario.title} (${scenario.sectorBadge})`,
      `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
      `Rasio Konsistensi (CR): ${(ahpResult.cr * 100).toFixed(2)}% (${ahpResult.isConsistent ? 'KONSISTEN / VALID' : 'PERLU KALIBRASI'})`,
      ``,
      `--- PERINGKAT KOMODITAS HILIRISASI ---`,
      ...rankedResults.map((r, i) => {
        const alt = alternatives.find((a) => a.id === r.alternativeId);
        return `#${r.rank} ${alt?.name}: ${(r.compositeScore * 100).toFixed(1)} pt (${r.percentageShare.toFixed(1)}%) | Multiplier: ${alt?.multiplierValue}`;
      }),
      ``,
      `--- BOBOT PRIORITAS KRITERIA ---`,
      ...criteria.map((c) => `${c.code} ${c.name}: ${(c.weight * 100).toFixed(1)}%`),
      ``,
      `--- REKOMENDASI KEBIJAKAN ---`,
      scenario.policySummary,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        {/* Header - Hidden in Print */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-800" />
            <span className="font-bold text-slate-900 text-sm">
              {lang === 'id' ? 'Executive Policy Brief (Siap Cetak / Unduh)' : 'Executive Policy Brief (Print Ready)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'id' ? 'Tersalin!' : 'Copied!') : (lang === 'id' ? 'Salin Ringkasan' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatted Policy Document */}
        <div className="p-8 space-y-6 text-slate-900 print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>LEMBAGA ANALISIS KEBIJAKAN HILIRISASI NASIONAL</span>
              <span>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
              {lang === 'id' ? 'RINGKASAN EKSEKUTIF: PRIORITAS HILIRISASI INDUSTRI' : 'EXECUTIVE BRIEF: INDUSTRIAL DOWNSTREAM PRIORITIES'}
            </h1>
            <p className="text-xs font-medium text-slate-600 mt-1">
              {lang === 'id' ? scenario.title : scenario.titleEn} · {scenario.sectorBadge}
            </p>
          </div>

          {/* Validation & Methodology Badge */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Metodologi: Analytic Hierarchy Process (AHP - Thomas L. Saaty)</span>
              <span className={ahpResult.isConsistent ? 'text-emerald-700' : 'text-amber-700'}>
                CR: {(ahpResult.cr * 100).toFixed(2)}% ({ahpResult.isConsistent ? 'VALID & KONSISTEN' : 'PERLU KALIBRASI'})
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Karakteristik matematis: λ max = {ahpResult.lambdaMax.toFixed(3)}, CI = {ahpResult.ci.toFixed(3)}, RI = {ahpResult.ri.toFixed(2)}. Tingkat konsistensi berada dalam ambang toleransi standard 10%.
            </p>
          </div>

          {/* Results Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">
              {lang === 'id' ? '1. Hasil Peringkat Komposit Komoditas Hilirisasi' : '1. Downstream Composite Rankings'}
            </h3>
            <table className="w-full text-xs border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <th className="p-2 text-center w-12 font-bold">Rank</th>
                  <th className="p-2 text-left font-bold">Komoditas & Target Hilirisasi</th>
                  <th className="p-2 text-center font-bold">Multiplier Nilai</th>
                  <th className="p-2 text-center font-bold">Estimasi Investasi</th>
                  <th className="p-2 text-center font-bold">Skor Komposit</th>
                  <th className="p-2 text-center font-bold">Pangsa Prioritas</th>
                </tr>
              </thead>
              <tbody>
                {rankedResults.map((r) => {
                  const alt = alternatives.find((a) => a.id === r.alternativeId);
                  return (
                    <tr key={r.alternativeId} className="border-b border-slate-100">
                      <td className="p-2 text-center font-bold">{r.rank}</td>
                      <td className="p-2">
                        <span className="font-bold text-slate-900 block">{alt?.name}</span>
                        <span className="text-[11px] text-slate-500">{alt?.hilirisasiTarget}</span>
                      </td>
                      <td className="p-2 text-center font-mono font-semibold">{alt?.multiplierValue}</td>
                      <td className="p-2 text-center">{alt?.capexEstimate}</td>
                      <td className="p-2 text-center font-mono font-bold">{(r.compositeScore * 100).toFixed(1)}</td>
                      <td className="p-2 text-center font-mono font-semibold">{r.percentageShare.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Criteria Priority Weights */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">
              {lang === 'id' ? '2. Struktur Bobot Kriteria Kebijakan' : '2. Criteria Priority Distribution'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {criteria.map((c) => (
                <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="font-bold text-slate-900 block">{c.code} ({(c.weight * 100).toFixed(1)}%)</span>
                  <span className="text-slate-600 text-[11px] block truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations & Action Plan */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">
              {lang === 'id' ? '3. Rekomendasi Aksi & Kebijakan Strategis' : '3. Strategic Policy Recommendations'}
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                <strong>Prioritas Utama:</strong> {rankedResults[0] ? alternatives.find((a) => a.id === rankedResults[0].alternativeId)?.name : ''} menempati peringkat teratas dengan skor komposit tertinggi. Kebijakan percepatan harus dipusatkan pada kepastian pasokan bahan baku domestik dan percepatan integrasi rantai pasok hilir.
              </p>
              <p>
                <strong>Insentif & Regulasi:</strong> {scenario.policySummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
