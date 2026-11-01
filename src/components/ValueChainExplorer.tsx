import React, { useState } from 'react';
import { Alternative, ScenarioPreset } from '../types/ahp';
import {
  Factory,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Building,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface ValueChainExplorerProps {
  scenario: ScenarioPreset;
  alternatives: Alternative[];
  lang: 'id' | 'en';
}

export const ValueChainExplorer: React.FC<ValueChainExplorerProps> = ({
  scenario,
  alternatives,
  lang,
}) => {
  const [selectedAltId, setSelectedAltId] = useState<string>(alternatives[0]?.id || '');
  const alt = alternatives.find((a) => a.id === selectedAltId) || alternatives[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {lang === 'id' ? 'Eksplorasi Rantai Nilai Hilirisasi Industri' : 'Industrial Downstream Value Chain Deep-Dive'}
          </h2>
          <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
            {lang === 'id'
              ? 'Telusuri peta transformasi nilai dari komoditas mentah (Hulu) ke produk antara (Midstream) hingga produk akhir bernilai tinggi (Hilir) beserta teknologi dan regulasi pendukung.'
              : 'Explore the full transformation pathway from raw extraction (Upstream) to intermediate refining (Midstream) to advanced finished goods (Downstream).'}
          </p>
        </div>

        {/* Commodity Switcher Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {alternatives.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAltId(a.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                a.id === selectedAltId
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {a.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Commodity Banner */}
      {alt && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {alt.keyCommodity}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'id' ? 'Kesiapan Teknologi:' : 'Technology Readiness:'} TRL {alt.trl}/9
            </span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">{alt.name}</h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mb-4">
            {lang === 'id' ? alt.description : alt.descriptionEn}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block">{lang === 'id' ? 'Multiplier Nilai Tambah' : 'Value Multiplier'}</span>
              <span className="text-base font-bold text-teal-300">{alt.multiplierValue}</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'id' ? 'Estimasi Investasi' : 'Estimated CAPEX'}</span>
              <span className="text-base font-bold text-white">{alt.capexEstimate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'id' ? 'Serapan Tenaga Kerja' : 'Job Creation'}</span>
              <span className="text-base font-bold text-white">{alt.jobsEstimate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'id' ? 'Target Produk Hilir' : 'Primary Target'}</span>
              <span className="text-base font-bold text-amber-300 truncate block">{alt.hilirisasiTarget}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3-Stage Visual Value Chain Pipeline */}
      {alt && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>{lang === 'id' ? 'Tahapan Transformasi Rantai Pasok (Hulu ke Hilir):' : 'Value Chain Transformation Stages:'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alt.valueChain.map((step, idx) => {
              const isHilir = step.stage === 'Hilir';
              const isAntara = step.stage === 'Antara';

              return (
                <div
                  key={step.stage}
                  className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between ${
                    isHilir
                      ? 'border-emerald-300 ring-1 ring-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            isHilir
                              ? 'bg-emerald-600 text-white'
                              : isAntara
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">
                            {lang === 'id' ? `Tahap ${step.stage}` : `${step.stageEn} Stage`}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isHilir
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {step.valueAdd}
                      </span>
                    </div>

                    {/* Products List */}
                    <div className="mb-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        {lang === 'id' ? 'Output Komoditas / Produk:' : 'Commodity & Product Outputs:'}
                      </span>
                      <ul className="space-y-1.5 text-xs">
                        {step.products.map((prod, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5 text-slate-800">
                            <span className="text-slate-400 font-bold">·</span>
                            <span className="font-medium leading-snug">{prod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technology Used */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                        <Cpu className="w-3.5 h-3.5 text-teal-600" />
                        <span>{lang === 'id' ? 'Teknologi & Proses Kunci:' : 'Key Tech & Process:'}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{step.tech}</p>
                    </div>
                  </div>

                  {idx < 2 && (
                    <div className="pt-2 text-right hidden md:block text-slate-300">
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Industrial Policy & Regulatory Enablers Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <span>{lang === 'id' ? 'Kerangka Kebijakan & Insentif Hilirisasi Nasional' : 'National Downstream Policy & Regulatory Framework'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-1.5">
            <span className="font-bold text-slate-900 block">
              {lang === 'id' ? '1. Larangan Ekspor Mentah & UU Minerba' : '1. Raw Export Ban & Mining Law'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'id'
                ? 'Penerapan mandatory smelting berdasarkan UU No. 3/2020 untuk memastikan nilai tambah ekonomi diproses di dalam negeri sebelum ekspor.'
                : 'Mandatory domestic smelting under Law No. 3/2020, preventing raw ore leakages and securing in-country value retention.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-1.5">
            <span className="font-bold text-slate-900 block">
              {lang === 'id' ? '2. Insentif Pajak (Tax Holiday & KEK)' : '2. Fiscal Incentives & SEZs'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'id'
                ? 'Fasilitas pembebasan PPh Badan hingga 20 tahun untuk industri pionir, pembebasan bea masuk mesin pabrik, dan status Kawasan Ekonomi Khusus (KEK).'
                : 'Corporate tax holidays up to 20 years for pioneer industries, machinery import duty exemptions, and Special Economic Zone perks.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-1.5">
            <span className="font-bold text-slate-900 block">
              {lang === 'id' ? '3. Standar Keberlanjutan & Dekarbonisasi' : '3. ESG Standards & Decarbonization'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'id'
                ? 'Integrasi energi terbarukan (PLTS/PLTA) untuk smelter hijau, larangan deep sea tailing (DSTP) demi melindungi keanekaragaman hayati laut.'
                : 'Renewable power integration for green smelters and strict dry stacking tailing regulations to safeguard marine biodiversity.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
