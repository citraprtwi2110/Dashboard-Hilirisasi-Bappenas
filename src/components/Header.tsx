import React from 'react';
import { Download, RefreshCw, Sliders, Globe, Layers, BookOpen } from 'lucide-react';
import { ScenarioPreset } from '../types/ahp';

interface HeaderProps {
  currentScenario: ScenarioPreset;
  allScenarios: ScenarioPreset[];
  onSelectScenario: (scenarioId: string) => void;
  lang: 'id' | 'en';
  onToggleLang: () => void;
  onReset: () => void;
  onOpenCustomBuilder: () => void;
  onOpenReport: () => void;
  activeTab: 'summary' | 'criteria' | 'alternatives' | 'sensitivity' | 'valuechain';
  onSelectTab: (tab: 'summary' | 'criteria' | 'alternatives' | 'sensitivity' | 'valuechain') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  allScenarios,
  onSelectScenario,
  lang,
  onToggleLang,
  onReset,
  onOpenCustomBuilder,
  onOpenReport,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner & Title Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/image_371bd17e.png"
            alt="Logo Resmi Bappenas"
            className="h-12 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {lang === 'id' ? 'Dasbor AHP Hilirisasi Industri' : 'Industrial Downstream AHP Dashboard'}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {lang === 'id' ? 'Metode Saaty' : 'Saaty Method'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'id'
                ? 'Sistem Pendukung Keputusan Multi-Kriteria Prioritas Komoditas Strategis Indonesia'
                : 'Multi-Criteria Decision Support System for Strategic Commodity Downstream Priorities'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scenario Selector */}
          <div className="relative">
            <select
              value={currentScenario.id}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              {allScenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {lang === 'id' ? sc.title : sc.titleEn}
                </option>
              ))}
            </select>
          </div>

          {/* Model Customizer Button */}
          <button
            onClick={onOpenCustomBuilder}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
            title={lang === 'id' ? 'Kustomisasi Kriteria & Alternatif' : 'Customize Criteria & Alternatives'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Model Kustom' : 'Custom Model'}</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg px-3 py-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Laporan Kebijakan' : 'Policy Brief'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={lang === 'id' ? 'Reset Nilai Matriks' : 'Reset Matrix Values'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <Globe className="w-3 h-3" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-1">
        <button
          onClick={() => onSelectTab('summary')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'summary'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? '1. Dasbor Eksekutif' : '1. Executive Summary'}</span>
        </button>

        <button
          onClick={() => onSelectTab('criteria')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'criteria'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{lang === 'id' ? '2. Matriks Perbandingan Kriteria' : '2. Criteria Pairwise Matrix'}</span>
        </button>

        <button
          onClick={() => onSelectTab('alternatives')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'alternatives'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{lang === 'id' ? '3. Penilaian Alternatif' : '3. Alternative Scoring'}</span>
        </button>

        <button
          onClick={() => onSelectTab('sensitivity')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sensitivity'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? '4. Analisis Sensitivitas (What-If)' : '4. Sensitivity Simulation'}</span>
        </button>

        <button
          onClick={() => onSelectTab('valuechain')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'valuechain'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? '5. Rantai Nilai Hilirisasi' : '5. Value Chain Deep Dive'}</span>
        </button>
      </div>
    </header>
  );
};
