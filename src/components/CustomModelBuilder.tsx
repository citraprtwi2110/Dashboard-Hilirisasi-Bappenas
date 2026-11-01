import React, { useState } from 'react';
import { Criterion, Alternative } from '../types/ahp';
import { Plus, Trash2, X, Check, Sliders, Sparkles } from 'lucide-react';

interface CustomModelBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: Criterion[];
  alternatives: Alternative[];
  onUpdateCriteria: (newCriteria: Criterion[]) => void;
  onUpdateAlternatives: (newAlternatives: Alternative[]) => void;
  lang: 'id' | 'en';
}

export const CustomModelBuilder: React.FC<CustomModelBuilderProps> = ({
  isOpen,
  onClose,
  criteria,
  alternatives,
  onUpdateCriteria,
  onUpdateAlternatives,
  lang,
}) => {
  if (!isOpen) return null;

  // New criterion form
  const [newCritName, setNewCritName] = useState('');
  const [newCritCode, setNewCritCode] = useState(`K${criteria.length + 1}`);
  const [newCritDesc, setNewCritDesc] = useState('');

  // New alternative form
  const [newAltName, setNewAltName] = useState('');
  const [newAltCode, setNewAltCode] = useState(`A${alternatives.length + 1}`);
  const [newAltTarget, setNewAltTarget] = useState('');
  const [newAltMultiplier, setNewAltMultiplier] = useState('6.0x - 15x');
  const [newAltCapex, setNewAltCapex] = useState('US$ 500 Juta');
  const [newAltJobs, setNewAltJobs] = useState('12.000 TK');

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const id = `c-custom-${Date.now()}`;
    const colors = ['#0284c7', '#0d9488', '#7c3aed', '#16a34a', '#ea580c', '#e11d48', '#d97706'];
    const color = colors[criteria.length % colors.length];

    const newCriterion: Criterion = {
      id,
      code: newCritCode.trim() || `K${criteria.length + 1}`,
      name: newCritName.trim(),
      nameEn: newCritName.trim(),
      description: newCritDesc.trim() || 'Kriteria kustom pengguna',
      descriptionEn: newCritDesc.trim() || 'User custom criterion',
      weight: 1 / (criteria.length + 1),
      color,
    };

    // Update alternatives so they have a default score of 0.70 for this new criterion
    const updatedAlts = alternatives.map((alt) => ({
      ...alt,
      scores: {
        ...alt.scores,
        [id]: 0.7,
      },
    }));

    onUpdateCriteria([...criteria, newCriterion]);
    onUpdateAlternatives(updatedAlts);

    setNewCritName('');
    setNewCritDesc('');
    setNewCritCode(`K${criteria.length + 2}`);
  };

  const handleDeleteCriterion = (id: string) => {
    if (criteria.length <= 2) {
      alert(lang === 'id' ? 'Minimal harus ada 2 kriteria untuk AHP.' : 'Minimum 2 criteria required for AHP.');
      return;
    }
    const filtered = criteria.filter((c) => c.id !== id);
    onUpdateCriteria(filtered);
  };

  const handleAddAlternative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAltName.trim()) return;

    const id = `alt-custom-${Date.now()}`;
    const initialScores: Record<string, number> = {};
    criteria.forEach((c) => {
      initialScores[c.id] = 0.75;
    });

    const newAlternative: Alternative = {
      id,
      code: newAltCode.trim() || `A${alternatives.length + 1}`,
      name: newAltName.trim(),
      nameEn: newAltName.trim(),
      category: 'custom',
      keyCommodity: newAltName.trim(),
      hilirisasiTarget: newAltTarget.trim() || 'Produk olahan bernilai tambah',
      multiplierValue: newAltMultiplier,
      capexEstimate: newAltCapex,
      jobsEstimate: newAltJobs,
      trl: 7,
      esgRisk: 'Sedang',
      description: `Rantai hilirisasi kustom untuk komoditas ${newAltName}.`,
      descriptionEn: `Custom downstream chain for ${newAltName}.`,
      scores: initialScores,
      valueChain: [
        {
          stage: 'Hulu',
          stageEn: 'Upstream',
          products: ['Bahan Baku Mentah'],
          tech: 'Ekstraksi / Pemanenan',
          valueAdd: '1.0x',
        },
        {
          stage: 'Antara',
          stageEn: 'Midstream',
          products: ['Produk Olahan Tingkat Pertama'],
          tech: 'Refining / Smelting',
          valueAdd: '3.5x',
        },
        {
          stage: 'Hilir',
          stageEn: 'Downstream',
          products: [newAltTarget || 'Produk Jadi Komersial'],
          tech: 'Advanced Processing',
          valueAdd: newAltMultiplier,
        },
      ],
    };

    onUpdateAlternatives([...alternatives, newAlternative]);
    setNewAltName('');
    setNewAltTarget('');
    setNewAltCode(`A${alternatives.length + 2}`);
  };

  const handleDeleteAlternative = (id: string) => {
    if (alternatives.length <= 2) {
      alert(lang === 'id' ? 'Minimal harus ada 2 alternatif untuk analisis perbandingan.' : 'Minimum 2 alternatives required for comparison.');
      return;
    }
    const filtered = alternatives.filter((a) => a.id !== id);
    onUpdateAlternatives(filtered);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'id' ? 'Kustomisasi Model AHP Hilirisasi' : 'Customize AHP Downstream Model'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'id'
                  ? 'Tambah atau sesuaikan kriteria penentu serta opsi komoditas hilirisasi Anda'
                  : 'Add or adjust criteria and downstream commodity alternatives'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Criteria Customization */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'id' ? '1. Daftar Kriteria Penilaian AHP' : '1. AHP Evaluation Criteria'}
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {criteria.length} {lang === 'id' ? 'Kriteria Terdaftar' : 'Criteria'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {criteria.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: c.color }} />
                    <div>
                      <span className="font-bold text-slate-900">
                        {c.code}: {c.name}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{c.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCriterion(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-2 cursor-pointer"
                    title={lang === 'id' ? 'Hapus Kriteria' : 'Delete Criterion'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Criterion Form */}
            <form onSubmit={handleAddCriterion} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                {lang === 'id' ? '+ Tambah Kriteria Baru:' : '+ Add New Criterion:'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Kode (misal: K6)' : 'Code (e.g. K6)'}
                  </label>
                  <input
                    type="text"
                    value={newCritCode}
                    onChange={(e) => setNewCritCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Nama Kriteria' : 'Criterion Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'id' ? 'Contoh: Kemandirian Geopolitik & Rantai Pasok' : 'e.g. Geopolitical Supply Chain Security'}
                    value={newCritName}
                    onChange={(e) => setNewCritName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors cursor-pointer"
              >
                {lang === 'id' ? 'Tambahkan ke Matriks AHP' : 'Add to AHP Matrix'}
              </button>
            </form>
          </div>

          {/* Section 2: Alternative Customization */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'id' ? '2. Opsi Komoditas Hilirisasi (Alternatif)' : '2. Downstream Commodity Alternatives'}
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {alternatives.length} {lang === 'id' ? 'Alternatif Terdaftar' : 'Alternatives'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {alternatives.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-200 font-bold flex items-center justify-center text-xs">
                      {a.code}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{a.name}</span>
                      <span className="text-slate-500 block text-[11px]">{a.hilirisasiTarget}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">{a.multiplierValue}</span>
                    <button
                      onClick={() => handleDeleteAlternative(a.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Alternative Form */}
            <form onSubmit={handleAddAlternative} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                {lang === 'id' ? '+ Tambah Komoditas Hilirisasi Kustom:' : '+ Add Custom Downstream Commodity:'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Kode (misal: A5)' : 'Code (e.g. A5)'}
                  </label>
                  <input
                    type="text"
                    value={newAltCode}
                    onChange={(e) => setNewAltCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Nama Komoditas' : 'Commodity Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'id' ? 'Contoh: Hilirisasi Logam Tanah Jarang (Monasit)' : 'e.g. Rare Earth Elements Downstream'}
                    value={newAltName}
                    onChange={(e) => setNewAltName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Target Produk Hilir' : 'Target Downstream Product'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'id' ? 'Magnet Permanen NdFeB' : 'NdFeB Permanent Magnets'}
                    value={newAltTarget}
                    onChange={(e) => setNewAltTarget(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Multiplier Nilai Tambah' : 'Value Multiplier'}
                  </label>
                  <input
                    type="text"
                    value={newAltMultiplier}
                    onChange={(e) => setNewAltMultiplier(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {lang === 'id' ? 'Estimasi Investasi' : 'CAPEX Estimate'}
                  </label>
                  <input
                    type="text"
                    value={newAltCapex}
                    onChange={(e) => setNewAltCapex(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors cursor-pointer"
              >
                {lang === 'id' ? 'Tambahkan Alternatif' : 'Add Alternative'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Selesai & Terapkan Perubahan' : 'Done & Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
