import React, { useState } from 'react';
import { FGD_META, RESPONDENT_GROUPS, NA_CRIT, NB_ALTS, NC_INST } from '../../data/fgdMetadata';
import { RespondentEntry, evaluateEntry, formatDecimal } from '../../utils/fgdAhp';
import { UploadCloud, Download, Trash2, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExcelImportViewProps {
  entries: RespondentEntry[];
  onAddEntries: (newEntries: RespondentEntry[]) => void;
  onDeleteEntry: (id: string) => void;
  onClearAllEntries: () => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({
  entries,
  onAddEntries,
  onDeleteEntry,
  onClearAllEntries,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [previewEntries, setPreviewEntries] = useState<RespondentEntry[]>([]);

  // Export all responses to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Hasil_Penilaian_AHP_Hilirisasi_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export summary table to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'FGD', 'Komoditas', 'Kelompok', 'Institusi', 'Jabatan', 'Sumber', 'CR_Kriteria', 'CR_Jalur', 'CR_Instrumen', 'Konsisten'];
    const rows = entries.map((e) => {
      const f = FGD_META.fgd.find((x) => x.code === e.fgd);
      const r = evaluateEntry(e);
      return [
        e.id,
        e.fgd,
        f?.kom || '',
        `"${e.kelompok || ''}"`,
        `"${e.institusi || ''}"`,
        `"${e.jabatan || ''}"`,
        e.src,
        r.A ? r.A.cr.toFixed(3) : '',
        r.crB != null ? r.crB.toFixed(3) : '',
        r.C ? r.C.cr.toFixed(3) : '',
        r.ok ? 'Ya' : 'Tidak',
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `Rekap_Responden_AHP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle JSON file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setPreviewEntries(parsed);
          setImportMessage(`Terbaca ${parsed.length} data instrumen dari berkas.`);
        } else if (parsed && parsed.fgd) {
          setPreviewEntries([parsed]);
          setImportMessage(`Terbaca 1 data instrumen dari berkas.`);
        } else {
          setImportMessage('Format berkas tidak sesuai struktur instrumen AHP.');
        }
      } catch (err) {
        setImportMessage('Gagal membaca berkas. Pastikan berkas berformat JSON hasil ekspor instrumen.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveImported = () => {
    if (previewEntries.length === 0) return;
    onAddEntries(previewEntries);
    setImportMessage(`Berhasil menyimpan ${previewEntries.length} data ke dasbor!`);
    setPreviewEntries([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Impor &amp; Ekspor Data Instrumen AHP</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah berkas instrumen responden (.json / hasil rekap data) atau unduh seluruh data penilaian komoditas ke CSV/JSON.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-teal-600 bg-teal-50/50' : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800">
            Tarik &amp; lepas berkas instrumen ke sini
          </p>
          <p className="text-[11px] text-slate-500 mt-1">atau klik untuk memilih berkas dari komputer</p>
          <input
            type="file"
            accept=".json,.xlsx"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="mt-3 text-xs text-slate-600"
          />
        </div>

        {importMessage && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-900 flex items-center justify-between">
            <span>{importMessage}</span>
            {previewEntries.length > 0 && (
              <button
                onClick={handleSaveImported}
                className="px-3 py-1 bg-teal-800 text-white rounded-md hover:bg-teal-900 cursor-pointer"
              >
                Simpan ke Dasbor
              </button>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Rekap ke CSV (Excel)</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Cadangkan Semua Data (JSON)</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Seluruh Jawaban Masuk ({entries.length})</h3>
            <p className="text-xs text-slate-500">
              Daftar seluruh instrumen yang tersimpan di dasbor lintas 11 komoditas FGD.
            </p>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Yakin ingin mengosongkan seluruh data responden?')) {
                  onClearAllEntries();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Kosongkan Semua Data
            </button>
          )}
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="p-2.5 font-bold">FGD</th>
                <th className="p-2.5 font-bold">Komoditas</th>
                <th className="p-2.5 font-bold">Kelompok</th>
                <th className="p-2.5 font-bold">Institusi / Responden</th>
                <th className="p-2.5 font-bold text-center">Konsistensi</th>
                <th className="p-2.5 font-bold text-center">Sumber</th>
                <th className="p-2.5 font-bold text-center w-12">Hapus</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const f = FGD_META.fgd.find((x) => x.code === e.fgd);
                const evalRes = evaluateEntry(e);

                return (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="p-2.5 font-mono font-bold text-teal-900">{e.fgd}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{f?.kom || '–'}</td>
                    <td className="p-2.5 text-slate-700">{e.kelompok || '–'}</td>
                    <td className="p-2.5 text-slate-600">
                      <span className="font-medium text-slate-800 block">{e.institusi || '–'}</span>
                      <span className="text-[11px] text-slate-400">{e.jabatan}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          evalRes.ok
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {evalRes.ok ? 'Konsisten' : 'Perlu Ditinjau'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {e.src === 'excel' ? 'Excel' : e.src === 'contoh' ? 'Contoh' : 'Formulir'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => onDeleteEntry(e.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Hapus Jawaban"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
