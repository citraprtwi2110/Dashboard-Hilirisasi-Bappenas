import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  PlusCircle,
  MessageSquare,
  Send,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import {
  CRIT,
  CR,
  VARS,
  VAR,
  ConfirmComputationResult,
  ConfirmEntry,
  TrenggalekState
} from '../../data/trenggalekData';

interface KonfirmasiTabProps {
  state: TrenggalekState;
  confirmResult: ConfirmComputationResult;
  myUid: string;
  myConfirm: ConfirmEntry;
  saveVote: (varId: string, vote: 'S' | 'C' | 'T') => void;
  saveNote: (varId: string, noteText: string) => void;
  addProposal: (text: string) => void;
  setSubmittedStatus: (submitted: boolean) => void;
}

export const KonfirmasiTab: React.FC<KonfirmasiTabProps> = ({
  state,
  confirmResult,
  myUid,
  myConfirm,
  saveVote,
  saveNote,
  addProposal,
  setSubmittedStatus
}) => {
  const [proposalInput, setProposalInput] = useState('');
  const [activeNoteVar, setActiveNoteVar] = useState<string | null>(null);

  const myVotes = myConfirm.votes || {};
  const myNotes = myConfirm.notes || {};
  const myVotedCount = Object.keys(myVotes).length;
  const isAllVoted = myVotedCount === VARS.length;

  const handleAddProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalInput.trim()) return;
    addProposal(proposalInput.trim());
    setProposalInput('');
  };

  const statusBadges: Record<
    'ok' | 'bahas' | 'tolak' | 'belum',
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    ok: {
      label: 'Terkonfirmasi',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
    },
    bahas: {
      label: 'Perlu Dibahas',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
    },
    tolak: {
      label: 'Ditolak',
      bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: <XCircle className="w-3.5 h-3.5 text-red-600" />
    },
    belum: {
      label: 'Belum Dinilai',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      icon: <Clock className="w-3.5 h-3.5 text-slate-400" />
    }
  };

  const formatPct = (val: number) => `${(val * 100).toFixed(0)}%`;

  // Aggregate proposals across all respondents
  const allProposals = Object.entries(state.confirm).flatMap(([uid, conf]) => {
    const author = state.respondents[uid];
    return (conf.proposals || []).map((text) => ({
      uid,
      authorName: author?.name || 'Responden',
      authorOrg: author?.org || 'Stakeholder',
      text
    }));
  });

  return (
    <div className="space-y-6">
      {/* Header & Personal Confirmation Progress */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Validasi & Konfirmasi Lapangan
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Konfirmasi Indikator Penyebab untuk Fishbone
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Berikan verifikasi apakah setiap variabel terbukti di lapangan sebagai akar masalah kenaikan Indeks Gini di Kabupaten Trenggalek. Suara seluruh pemangku kepentingan diagregasi dengan ambang batas {formatPct(confirmResult.thr)}.
          </p>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
          <div>
            <div className="text-right text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {myVotedCount}/{VARS.length} Indikator Dinilai
            </div>
            <div className="w-36 bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(myVotedCount / VARS.length) * 100}%` }}
              />
            </div>
          </div>

          {myConfirm.submitted ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Final Terkirim
              </span>
              <button
                onClick={() => setSubmittedStatus(false)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              >
                Buka Lagi
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSubmittedStatus(true)}
              disabled={!isAllVoted}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Konfirmasi Final</span>
            </button>
          )}
        </div>
      </div>

      {/* 6M Criteria Groups */}
      <div className="space-y-6">
        {CRIT.map((c) => {
          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {c.en} · {c.name}
                  </h3>
                  <span className="text-xs text-slate-500 hidden sm:inline">— {c.desc}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {c.vars.length} Indikator
                </span>
              </div>

              {/* Variables List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {c.vars.map((v) => {
                  const itemResult = confirmResult.items[v.id];
                  const myVote = myVotes[v.id];
                  const currentNote = myNotes[v.id] || '';
                  const badge = statusBadges[itemResult?.status || 'belum'];

                  const totalItemVoters = itemResult?.n || 0;
                  const sPct = totalItemVoters ? (itemResult.S / totalItemVoters) * 100 : 0;
                  const cPct = totalItemVoters ? (itemResult.C / totalItemVoters) * 100 : 0;
                  const tPct = totalItemVoters ? (itemResult.T / totalItemVoters) * 100 : 0;

                  return (
                    <div key={v.id} className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* Left: Info, Definitions, & Voting */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {v.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {v.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            Hipotesis {v.hyp}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {v.def}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                              Indikator Ukuran:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 text-[11px]">
                              {v.ind}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                              Data Awal (RPJMD/BPS):
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 text-[11px]">
                              {v.base}
                            </span>
                          </div>
                        </div>

                        {/* Voting Buttons */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Penilaian Konfirmasi Anda:
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveVote(v.id, 'S')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                myVote === 'S'
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setuju</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                saveVote(v.id, 'C');
                                setActiveNoteVar(v.id);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                myVote === 'C'
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500'
                              }`}
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Setuju dgn Catatan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                saveVote(v.id, 'T');
                                setActiveNoteVar(v.id);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                myVote === 'T'
                                  ? 'bg-red-600 border-red-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-red-500'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tidak Setuju</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setActiveNoteVar(activeNoteVar === v.id ? null : v.id)
                              }
                              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-xs flex items-center gap-1"
                              title="Tulis catatan pendukung"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-[11px]">
                                {currentNote ? 'Edit Catatan' : '+ Catatan'}
                              </span>
                            </button>
                          </div>

                          {/* Notes field */}
                          {(activeNoteVar === v.id || currentNote) && (
                            <div className="mt-2.5">
                              <textarea
                                value={currentNote}
                                onChange={(e) => saveNote(v.id, e.target.value)}
                                placeholder="Tuliskan alasan singkat atau rekomendasi data pelengkap (mis. perlu verifikasi angka tingkat kecamatan)..."
                                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y min-h-[50px]"
                                maxLength={300}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Aggregated Consensus Tally & Notes from other stakeholders */}
                      <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>

                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {formatPct(itemResult?.konsensus || 0)} Kesepakatan
                          </span>
                        </div>

                        {/* Stacked Vote Distribution Bar */}
                        <div className="space-y-1">
                          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden flex">
                            <div
                              className="bg-emerald-500 h-full transition-all"
                              style={{ width: `${sPct}%` }}
                              title={`Setuju: ${itemResult?.S || 0}`}
                            />
                            <div
                              className="bg-amber-400 h-full transition-all"
                              style={{ width: `${cPct}%` }}
                              title={`Dengan Catatan: ${itemResult?.C || 0}`}
                            />
                            <div
                              className="bg-red-500 h-full transition-all"
                              style={{ width: `${tPct}%` }}
                              title={`Tidak Setuju: ${itemResult?.T || 0}`}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>S: {itemResult?.S || 0}</span>
                            <span>C: {itemResult?.C || 0}</span>
                            <span>T: {itemResult?.T || 0}</span>
                            <span>Total: {totalItemVoters} penilai</span>
                          </div>
                        </div>

                        {/* Stakeholder Notes list */}
                        {itemResult && itemResult.notes.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Catatan Stakeholder:
                            </span>
                            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                              {itemResult.notes.map((n, nIdx) => {
                                const resp = state.respondents[n.uid];
                                return (
                                  <div
                                    key={nIdx}
                                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5"
                                  >
                                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-[10px]">
                                      {resp?.name || 'Responden'} ({resp?.org || 'Stakeholder'})
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 italic">
                                      "{n.text}"
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Indicators Proposal Section */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Usulan Indikator Tambahan dari Stakeholder
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Apakah ada indikator penentu ketimpangan di Trenggalek yang belum terakomodasi dalam 18 variabel di atas? Tuliskan usulan Anda.
          </p>
        </div>

        <form onSubmit={handleAddProposal} className="flex gap-2">
          <input
            type="text"
            value={proposalInput}
            onChange={(e) => setProposalInput(e.target.value)}
            placeholder="mis. Rasio ketergantungan penduduk menurut kecamatan (Dependency Ratio)"
            className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            maxLength={140}
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shrink-0"
          >
            Tambah Usulan
          </button>
        </form>

        {allProposals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {allProposals.map((prop, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                  "{prop.text}"
                </div>
                <div className="text-[10px] text-slate-500">
                  Diusulkan oleh: <strong>{prop.authorName}</strong> ({prop.authorOrg})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400 italic">
            Belum ada indikator tambahan yang diusulkan.
          </div>
        )}
      </div>
    </div>
  );
};
