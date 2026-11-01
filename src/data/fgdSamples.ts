import { FGD_META, RESPONDENT_GROUPS, NA_CRIT, NB_ALTS, NC_INST } from './fgdMetadata';
import { RespondentEntry, generatePairs } from '../utils/fgdAhp';

export function generateSeedResponses(): RespondentEntry[] {
  let seed = 17;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const snap = (r: number): number => {
    const x = Math.max(1 / 9, Math.min(9, r));
    const opts = [1 / 9, 1 / 7, 1 / 5, 1 / 3, 1, 3, 5, 7, 9];
    return opts.reduce((best, opt) =>
      Math.abs(Math.log(opt) - Math.log(x)) < Math.abs(Math.log(best) - Math.log(x)) ? opt : best,
      1
    );
  };

  const fromWeights = (w: number[]): number[] => {
    const p = generatePairs(w.length);
    return p.map(([i, j]) => snap((w[i] / w[j]) * Math.exp((rnd() - 0.5) * 0.28)));
  };

  const out: RespondentEntry[] = [];

  const institutionSamples = [
    'Kementerian Koordinator Bidang Perekonomian',
    'Kementerian Perindustrian RI',
    'Kementerian ESDM (Ditjen Minerba)',
    'PT Vale Indonesia Tbk',
    'PT Aneka Tambang Tbk (Antam)',
    'PT Freeport Indonesia',
    'Asosiasi Penambang Nikel Indonesia (APNI)',
    'Institut Teknologi Bandung (ITB)',
    'Pemerintah Provinsi Sulawesi Tengah',
    'Pemerintah Provinsi Maluku Utara',
  ];

  FGD_META.fgd.forEach((f, fi) => {
    // Base weight distribution for criteria per commodity
    const baseK = [5, 4, 3, 3.5, 2.5].map((x, i) => x * (1 + 0.5 * Math.sin(fi * 1.3 + i)));
    // Base weight distribution for policy instruments
    const baseI = [3, 4, 4.5, 3.5, 2].map((x, i) => x * (1 + 0.45 * Math.cos(fi * 1.8 + i)));

    const numRespondents = 4 + (fi % 3);

    for (let r = 0; r < numRespondents; r++) {
      const jitter = (base: number[]) => base.map((x) => Math.max(0.6, x * (0.75 + rnd() * 0.5)));

      const B: number[] = [];
      for (let c = 0; c < 5; c++) {
        const altWeights = [3.5 + c * 0.2 * (fi % 3), 2.2 + rnd() * 1.5, 1.8 + (c % 2)];
        B.push(...fromWeights(jitter(altWeights)));
      }

      const answersD = [
        `Tingkat keekonomian proyek di ${f.kom} sangat dipengaruhi oleh stabilitas harga acuan global dan ketersediaan pasokan energi listrik andal.`,
        `Kemitraan alih teknologi dengan mitra internasional dan kepastian penyerapan pasar domestik menjadi kunci percepatan investasi.`,
        `Perlu skema tarif bea keluar berjenjang serta insentif tax holiday yang konsisten untuk industri pengolahan hilir lanjut.`,
        `Diperlukan sinkronisasi regulasi izin kawasan industri dan penyederhanaan perizinan lingkungan hidup (Amdal) terpadu.`,
      ];

      out.push({
        id: `seed-${f.code}-${r + 1}`,
        fgd: f.code,
        kelompok: RESPONDENT_GROUPS[r % RESPONDENT_GROUPS.length],
        institusi: institutionSamples[(fi * 2 + r) % institutionSamples.length],
        jabatan: r % 2 === 0 ? 'Analis Kebijakan Industri' : 'Manajer Pengembangan Bisnis',
        src: 'contoh',
        A: fromWeights(jitter(baseK)),
        B,
        C: fromWeights(jitter(baseI)),
        D: r < 2 ? answersD : ['', '', '', ''],
        ts: Date.now() - (fi * 86400000 + r * 14400000),
      });
    }
  });

  return out;
}
