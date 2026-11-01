import React from 'react';
import {
  BarChart3,
  Edit3,
  Layers,
  CheckCircle2,
  GitGraph,
  HelpCircle,
  Users,
  Share2,
  Sparkles
} from 'lucide-react';
import { TOTAL_PAIRS, VARS } from '../../data/trenggalekData';

export type TrenggalekTab =
  | 'ringkasan'
  | 'instrumen'
  | 'hasil'
  | 'konfirmasi'
  | 'fishbone'
  | 'struktur'
  | 'peserta';

interface HeaderProps {
  activeTab: TrenggalekTab;
  setActiveTab: (tab: TrenggalekTab) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onOpenShare: () => void;
  respondentCount: number;
  myAnswersCount: number;
  myVotesCount: number;
  confirmedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  onOpenShare,
  respondentCount,
  myAnswersCount,
  myVotesCount,
  confirmedCount
}) => {
  const tabs: { id: TrenggalekTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'ringkasan',
      label: 'Ringkasan',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'instrumen',
      label: 'Isi Instrumen',
      icon: <Edit3 className="w-4 h-4" />,
      badge: myAnswersCount > 0 ? `${myAnswersCount}/${TOTAL_PAIRS}` : undefined
    },
    {
      id: 'hasil',
      label: 'Hasil AHP',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'konfirmasi',
      label: 'Konfirmasi Indikator',
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: myVotesCount > 0 ? `${myVotesCount}/${VARS.length}` : undefined
    },
    {
      id: 'fishbone',
      label: 'Fishbone',
      icon: <GitGraph className="w-4 h-4" />,
      badge: `${confirmedCount}/${VARS.length}`
    },
    {
      id: 'struktur',
      label: 'Struktur AHP',
      icon: <HelpCircle className="w-4 h-4" />
    },
    {
      id: 'peserta',
      label: 'Peserta & Pengaturan',
      icon: <Users className="w-4 h-4" />,
      badge: `${respondentCount}`
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-0">
        {/* Top bar with branding, live badge, controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-500/20 shrink-0">
              TR
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  AHP Trenggalek
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Kajian Gini 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Bapperida Kabupaten Trenggalek · Sistem Pendukung Keputusan Kebijakan & 6M Fishbone
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live status badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                isDemoMode
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span>
                {isDemoMode
                  ? 'Mode Contoh (9 Responden Simulasi)'
                  : `Online Publik · ${respondentCount} Responden`}
              </span>
            </div>

            {/* Toggle demo data */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition select-none">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="hidden xs:inline">Data contoh</span>
            </label>

            {/* Public share button */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
              title="Bagikan tautan online untuk publik / responden"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Survei</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-800/80 py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-blue-800 text-blue-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
