import React, { useState } from 'react';
import { useTrenggalekStore } from '../../utils/trenggalekStore';
import { Header, TrenggalekTab } from './Header';
import { RingkasanTab } from './RingkasanTab';
import { InstrumenTab } from './InstrumenTab';
import { HasilTab } from './HasilTab';
import { KonfirmasiTab } from './KonfirmasiTab';
import { FishboneTab } from './FishboneTab';
import { StrukturTab } from './StrukturTab';
import { PesertaTab } from './PesertaTab';
import { ShareModal } from './ShareModal';

export const TrenggalekDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TrenggalekTab>('ringkasan');
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const {
    state,
    isDemoMode,
    setIsDemoMode,
    myUid,
    myProfile,
    myAhp,
    myConfirm,
    ahpResult,
    confirmResult,
    effectiveThreshold,
    setActiveThreshold,
    onlyConsistent,
    setOnlyConsistent,
    selectedRespondent,
    setSelectedRespondent,
    saveStatus,
    saveMyProfile,
    saveAhpPair,
    saveVote,
    saveNote,
    addProposal,
    setSubmittedStatus,
    updateConfig,
    deleteRespondent,
    resetAllData
  } = useTrenggalekStore();

  const myAnswersCount = Object.keys(myAhp).filter((k) => typeof myAhp[k] === 'number').length;
  const myVotesCount = Object.keys(myConfirm.votes || {}).length;
  const respondentCount = Object.keys(state.respondents).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onOpenShare={() => setIsShareOpen(true)}
        respondentCount={respondentCount}
        myAnswersCount={myAnswersCount}
        myVotesCount={myVotesCount}
        confirmedCount={confirmResult.cnt.ok}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
        {activeTab === 'ringkasan' && (
          <RingkasanTab
            state={state}
            ahpResult={ahpResult}
            confirmResult={confirmResult}
            isDemoMode={isDemoMode}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'instrumen' && (
          <InstrumenTab
            myUid={myUid}
            myProfile={myProfile}
            myAhp={myAhp}
            saveMyProfile={saveMyProfile}
            saveAhpPair={saveAhpPair}
            saveStatus={saveStatus}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'hasil' && (
          <HasilTab
            state={state}
            ahpResult={ahpResult}
            onlyConsistent={onlyConsistent}
            setOnlyConsistent={setOnlyConsistent}
            selectedRespondent={selectedRespondent}
            setSelectedRespondent={setSelectedRespondent}
          />
        )}

        {activeTab === 'konfirmasi' && (
          <KonfirmasiTab
            state={state}
            confirmResult={confirmResult}
            myUid={myUid}
            myConfirm={myConfirm}
            saveVote={saveVote}
            saveNote={saveNote}
            addProposal={addProposal}
            setSubmittedStatus={setSubmittedStatus}
          />
        )}

        {activeTab === 'fishbone' && (
          <FishboneTab
            ahpResult={ahpResult}
            confirmResult={confirmResult}
            effectiveThreshold={effectiveThreshold}
            setActiveThreshold={setActiveThreshold}
          />
        )}

        {activeTab === 'struktur' && <StrukturTab />}

        {activeTab === 'peserta' && (
          <PesertaTab
            state={state}
            ahpResult={ahpResult}
            updateConfig={updateConfig}
            deleteRespondent={deleteRespondent}
            resetAllData={resetAllData}
            onOpenShare={() => setIsShareOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              AHP Trenggalek 2026
            </span>{' '}
            · Sistem Pendukung Keputusan Analisis Kesejahteraan Ekonomi & Indeks Gini Kabupaten Trenggalek.
          </div>
          <div className="flex items-center gap-4">
            <span>Bapperida Kabupaten Trenggalek</span>
            <span>·</span>
            <button
              onClick={() => setIsShareOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Bagikan Survei Publik
            </button>
          </div>
        </div>
      </footer>

      {/* Public Share Modal */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
};
