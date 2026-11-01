import React, { useState, useEffect } from 'react';
import { FGD_META, NA_CRIT, NB_ALTS, NC_INST } from './data/fgdMetadata';
import { RespondentEntry } from './utils/fgdAhp';
import { generateSeedResponses } from './data/fgdSamples';
import { SummaryView } from './components/fgd/SummaryView';
import { CommodityView } from './components/fgd/CommodityView';
import { InstrumentForm } from './components/fgd/InstrumentForm';
import { ExcelImportView } from './components/fgd/ExcelImportView';
import { GoogleDriveBackupModal } from './components/fgd/GoogleDriveBackupModal';
import {
  initAuth,
  backupResponsesToDrive,
  getAccessToken,
  BackupResult
} from './utils/googleDriveBackup';
import { User } from 'firebase/auth';
import {
  Layers,
  BarChart3,
  Edit3,
  FileSpreadsheet,
  RotateCcw,
  HardDrive,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

import { BappenasLogo } from './components/BappenasLogo';

const STORAGE_KEY = 'ahp_hilirisasi_fgd_entries_v3';
const AUTO_BACKUP_KEY = 'ahp_hilirisasi_auto_backup';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'komoditas' | 'isi' | 'impor'>('ringkasan');
  const [selectedFgd, setSelectedFgd] = useState<string>('F1'); // Start with F1 Batubara (Rab, 28 Okt 2026)
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Google Drive & Auth State
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastBackup, setLastBackup] = useState<BackupResult | null>(null);
  const [autoBackup, setAutoBackup] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTO_BACKUP_KEY) === 'true';
    } catch (e) {
      return true;
    }
  });

  // Setup auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleToggleAutoBackup = (val: boolean) => {
    setAutoBackup(val);
    try {
      localStorage.setItem(AUTO_BACKUP_KEY, String(val));
    } catch (e) {}
  };

  // All respondent entries - reset to clean empty state (asumsikan belum pernah ada yang mengisi)
  const [entries, setEntries] = useState<RespondentEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return [];
  });

  // Sync entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save entries to localStorage', e);
    }
  }, [entries]);

  // Active form state for "Isi Instrumen"
  const [form, setForm] = useState<RespondentEntry>(() => {
    return {
      id: `entry-${Date.now()}`,
      fgd: 'F1',
      kelompok: '',
      institusi: '',
      jabatan: '',
      src: 'form',
      A: Array(NA_CRIT).fill(null),
      B: Array(NB_ALTS).fill(null),
      C: Array(NC_INST).fill(null),
      D: ['', '', '', ''],
      ts: Date.now(),
    };
  });

  // Switch FGD in form
  const handleSelectFgdForForm = (fgdCode: string) => {
    setSelectedFgd(fgdCode);
    setForm((prev) => ({
      ...prev,
      fgd: fgdCode,
      B: Array(NB_ALTS).fill(null),
      D: ['', '', '', ''],
    }));
    setActiveTab('isi');
  };

  // Save active form submission & trigger auto-backup to Drive if authenticated
  const handleSaveForm = async () => {
    if (!form.kelompok) {
      alert('Silakan pilih Kelompok Responden terlebih dahulu.');
      return;
    }

    const answeredCount = [...form.A, ...form.B, ...form.C].filter((v) => v != null).length;
    if (answeredCount === 0) {
      alert('Isi minimal satu bagian perbandingan berpasangan sebelum menyimpan.');
      return;
    }

    const newEntry: RespondentEntry = {
      ...form,
      id: `resp-${Date.now()}`,
      src: 'form',
      ts: Date.now(),
    };

    const nextEntries = [newEntry, ...entries];
    setEntries(nextEntries);

    let driveNotice = '';
    // Auto-backup to Google Drive if connected
    if (autoBackup) {
      const token = await getAccessToken();
      if (token && currentUser) {
        try {
          const res = await backupResponsesToDrive(nextEntries, currentUser.email || 'cpcitper@gmail.com');
          setLastBackup(res);
          driveNotice = ' & tercadangkan ke Google Drive!';
        } catch (err) {
          console.warn('Auto backup to Google Drive failed:', err);
        }
      }
    }

    setSaveMessage(`Tersimpan! Hasil di Dasbor langsung diperbarui${driveNotice}`);
    setTimeout(() => setSaveMessage(''), 4500);
  };

  // Load sample answers into active form for testing
  const handleLoadSampleAnswers = () => {
    const sampleSeed = generateSeedResponses().find((s) => s.fgd === form.fgd);
    if (sampleSeed) {
      setForm({
        ...form,
        kelompok: sampleSeed.kelompok,
        institusi: 'Kementerian Koordinator Bidang Kemaritiman dan Investasi',
        jabatan: 'Koordinator Pokja Hilirisasi',
        A: [...sampleSeed.A],
        B: [...sampleSeed.B],
        C: [...sampleSeed.C],
        D: [...sampleSeed.D],
      });
      setSaveMessage('Contoh jawaban terisi! Anda dapat mengubah nilai atau menyimpannya.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Reset active form
  const handleClearForm = () => {
    setForm({
      id: `entry-${Date.now()}`,
      fgd: form.fgd,
      kelompok: '',
      institusi: '',
      jabatan: '',
      src: 'form',
      A: Array(NA_CRIT).fill(null),
      B: Array(NB_ALTS).fill(null),
      C: Array(NC_INST).fill(null),
      D: ['', '', '', ''],
      ts: Date.now(),
    });
  };

  // Reset all entries to zero (asumsikan belum ada yang mengisi)
  const handleResetToZero = () => {
    if (window.confirm('Reset seluruh data jawaban? Dasbor akan kembali ke kondisi awal bersih (0 responden).')) {
      setEntries([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  };

  // Muat contoh simulasi bila ingin uji coba
  const handleLoadDemoSeed = () => {
    const seed = generateSeedResponses();
    setEntries(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  };

  const selectedCommodity = FGD_META.fgd.find((f) => f.code === selectedFgd);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-[#0D9488] selection:text-white">
      {/* Top Ticker - Variation 5 Style */}
      <div className="bg-[#134E4A] text-white px-4 sm:px-6 py-2 text-[11px] sm:text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Calendar className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span className="font-bold text-teal-200 shrink-0">Urutan FGD:</span>
          <span className="text-slate-100 font-medium">
            F1 Batubara (28 Okt) → F2 Migas (3 Nov) → F7 Bauksit (16 Nov) → F6 Mangan (17 Nov) → F8 Tembaga (23 Nov) → F4 Nikel (30 Nov) → F5 Kobalt (1 Des) → F3 Baja (2 Des) → F9 Litium (3 Des) → F10 Timah (4 Des) → F11 Silika (7 Des)
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold border border-white/20">
            {entries.length === 0 ? 'KONDISI AWAL (0 RESPONDEN)' : `${entries.length} RESPONDEN TERSIMPAN`}
          </span>
        </div>
      </div>

      {/* Main Header with Official Bappenas Logo */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo Section with Exact Attached Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <BappenasLogo imgClassName="h-12 sm:h-14 w-auto object-contain" />
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                  Dasbor AHP Hilirisasi Industri
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
                  11 Komoditas
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">
                Kajian Kerangka Kebijakan Hilirisasi Mineral, Batubara, Minyak dan Gas Bumi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Google Drive Backup Button */}
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#134E4A] border border-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
              title="Cadangkan seluruh jawaban ke Google Drive (cpcitper@gmail.com)"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="hidden sm:inline">Cadangan Google Drive</span>
              <span className="sm:hidden">Drive</span>
              {currentUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Terhubung Google Drive" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Klik untuk Hubungkan Drive" />
              )}
            </button>

            {/* Isi Instrumen Penilaian */}
            <button
              onClick={() => handleSelectFgdForForm(selectedFgd)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#134E4A] hover:bg-[#0f3d3a] px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Isi Instrumen</span>
            </button>

            {/* Reset to Clean Data */}
            <button
              onClick={handleResetToZero}
              className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
              title="Reset Seluruh Data (Kembali ke Kondisi Bersih 0 Responden)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Variation 5 style */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ringkasan'
                ? 'border-[#0D9488] text-[#134E4A]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ringkasan</span>
          </button>

          <button
            onClick={() => setActiveTab('komoditas')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'komoditas'
                ? 'border-[#0D9488] text-[#134E4A]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Per Komoditas</span>
          </button>

          <button
            onClick={() => setActiveTab('isi')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'isi'
                ? 'border-[#0D9488] text-[#134E4A]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Isi Instrumen ({selectedCommodity?.kom || 'Komoditas'})</span>
          </button>

          <button
            onClick={() => setActiveTab('impor')}
            className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'impor'
                ? 'border-[#0D9488] text-[#134E4A]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Impor Excel ({entries.length} Responden)</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'ringkasan' && (
          <div className="space-y-4">
            {entries.length === 0 && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">Dasbor Bersih Siap Digunakan:</span> Seluruh data telah di-reset ke kondisi awal (0 responden). Silakan mulai pengisian melalui tab <strong>"Isi Instrumen Penilaian"</strong> untuk setiap FGD komoditas sesuai urutan jadwal.
                  </div>
                </div>
                <button
                  onClick={handleLoadDemoSeed}
                  className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 font-semibold text-[11px] transition shrink-0"
                >
                  Muat Contoh Simulasi (Uji Coba)
                </button>
              </div>
            )}
            <SummaryView
              entries={entries}
              onSelectCommodity={(fgdCode) => {
                setSelectedFgd(fgdCode);
                setActiveTab('komoditas');
              }}
              onNavigateToForm={(fgdCode) => handleSelectFgdForForm(fgdCode || selectedFgd)}
            />
          </div>
        )}

        {activeTab === 'komoditas' && (
          <CommodityView
            entries={entries}
            selectedFgd={selectedFgd}
            onSelectFgd={(fgdCode: string) => setSelectedFgd(fgdCode)}
            onNavigateToForm={(fgdCode: string) => handleSelectFgdForForm(fgdCode)}
          />
        )}

        {activeTab === 'isi' && (
          <InstrumentForm
            form={form}
            onChangeForm={setForm}
            onSaveForm={handleSaveForm}
            saveMessage={saveMessage}
            onLoadSampleAnswers={handleLoadSampleAnswers}
            onClearForm={handleClearForm}
          />
        )}

        {activeTab === 'impor' && (
          <ExcelImportView
            entries={entries}
            onAddEntries={(newEntries) => setEntries((prev) => [...newEntries, ...prev])}
            onDeleteEntry={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
            onClearAllEntries={handleResetToZero}
          />
        )}
      </main>

      {/* Google Drive Backup Modal */}
      <GoogleDriveBackupModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        entries={entries}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        lastBackup={lastBackup}
        onBackupSuccess={setLastBackup}
        autoBackup={autoBackup}
        onToggleAutoBackup={handleToggleAutoBackup}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        Dasbor AHP Hilirisasi Komoditas Strategis Indonesia · Analytic Hierarchy Process (AHP) Multi-Kriteria
      </footer>
    </div>
  );
}
