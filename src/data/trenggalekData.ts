export interface VariableItem {
  id: string;
  s: string;
  name: string;
  hyp: string;
  def: string;
  ind: string;
  base: string;
  src: string;
  crit?: string;
}

export interface CriterionItem {
  id: string;
  en: string;
  name: string;
  short: string;
  color: string;
  desc: string;
  vars: VariableItem[];
}

export interface PairItem {
  a: string;
  b: string;
  key: string;
}

export interface MatrixDef {
  id: string;
  title: string;
  items: string[];
  crit?: string;
  pairs: PairItem[];
}

export interface RespondentProfile {
  name: string;
  org: string;
  role: string;
  weight?: number;
  createdAt: number;
  demo?: boolean;
}

export interface AhpEntry {
  j: Record<string, number>;
  updatedAt: number;
}

export interface ConfirmEntry {
  votes: Record<string, 'S' | 'C' | 'T'>;
  notes: Record<string, string>;
  proposals: string[];
  submitted: boolean;
  updatedAt: number;
}

export interface TrenggalekConfig {
  target?: number;
  threshold?: number;
  weights?: Record<string, number>;
}

export interface TrenggalekState {
  respondents: Record<string, RespondentProfile>;
  ahp: Record<string, AhpEntry>;
  confirm: Record<string, ConfirmEntry>;
  config: TrenggalekConfig;
}

export const GOAL = {
  title: "Prioritas akar masalah kenaikan Indeks Gini Kabupaten Trenggalek",
  question: "Faktor mana yang paling berpengaruh terhadap kenaikan ketimpangan pengeluaran (Gini 0,335 pada 2021 menjadi 0,359 pada 2025), dan seberapa kuat pengaruhnya dibanding faktor lain?"
};

export const CRIT: CriterionItem[] = [
  {
    id: "MAN",
    en: "Man",
    name: "Sumber daya manusia",
    short: "SDM",
    color: "c1",
    desc: "Pendidikan, keterampilan, dan kesempatan kerja penduduk.",
    vars: [
      {
        id: "MAN1",
        s: "Pendidikan pekerja",
        name: "Pendidikan pekerja",
        hyp: "H2",
        def: "Tingkat pendidikan penduduk bekerja yang menentukan peluang memperoleh upah dan pekerjaan berproduktivitas tinggi.",
        ind: "Persentase penduduk bekerja berpendidikan SMP ke bawah; rata-rata lama sekolah (RLS).",
        base: "67,36% pekerja berpendidikan SMP ke bawah; RLS 8,09 tahun (2025)",
        src: "BPS, Sakernas dan IPM Kab. Trenggalek"
      },
      {
        id: "MAN2",
        s: "Kesempatan kerja perempuan",
        name: "Kesempatan kerja perempuan",
        hyp: "H3",
        def: "Partisipasi dan akses perempuan terhadap pekerjaan yang layak dan usaha produktif.",
        ind: "TPAK perempuan; selisih TPAK laki-laki dan perempuan.",
        base: "TPAK perempuan 68,78%; TPAK total 77,67% (2025)",
        src: "BPS, Sakernas"
      },
      {
        id: "MAN3",
        s: "Serapan lulusan perg. tinggi",
        name: "Keterserapan lulusan perguruan tinggi",
        hyp: "H3",
        def: "Kemampuan pasar kerja lokal menyerap lulusan pendidikan tinggi.",
        ind: "Tingkat pengangguran terbuka (TPT) menurut pendidikan tertinggi.",
        base: "TPT lulusan universitas 13,44% (TPT total 3,86%)",
        src: "BPS, Sakernas"
      }
    ]
  },
  {
    id: "MAC",
    en: "Machine",
    name: "Infrastruktur dan sarana",
    short: "Infrastruktur",
    color: "c2",
    desc: "Jalan, layanan dasar, dan sarana produksi yang menentukan akses antarwilayah.",
    vars: [
      {
        id: "MAC1",
        s: "Konektivitas antarkecamatan",
        name: "Konektivitas dan aksesibilitas antarkecamatan",
        hyp: "H5",
        def: "Kualitas jalan dan waktu tempuh yang menghubungkan desa dan kecamatan ke pusat ekonomi dan layanan.",
        ind: "Indeks Infrastruktur; panjang jalan baik; waktu tempuh ke pusat layanan.",
        base: "Indeks Infrastruktur 60,34 (target 51,95); data waktu tempuh perlu diminta",
        src: "Bapperida (Evaluasi RPJMD); Dinas PUPR"
      },
      {
        id: "MAC2",
        s: "Akses layanan dasar",
        name: "Akses layanan dasar pendidikan dan kesehatan",
        hyp: "H5",
        def: "Jarak dan ketersediaan fasilitas pendidikan dan kesehatan, terutama di kecamatan berlereng curam.",
        ind: "Jarak ke fasilitas; rasio fasilitas per penduduk menurut kecamatan.",
        base: "Penduduk terkonsentrasi: 36,2% penduduk pada 21,9% luas (lima kecamatan dataran)",
        src: "BPS; Dinas Pendidikan; Dinas Kesehatan"
      },
      {
        id: "MAC3",
        s: "Sarana produksi dan pasar",
        name: "Sarana produksi dan pasar",
        hyp: "H1",
        def: "Irigasi, pasar, tempat pelelangan ikan, dan sarana pascapanen yang menopang pendapatan petani dan nelayan.",
        ind: "Luas sawah teririgasi; jumlah pasar dan sarana pascapanen berfungsi.",
        base: "Belum tersedia; diminta ke Dinas Pertanian, DKP, dan Disperindag",
        src: "Perangkat Daerah pengampu"
      }
    ]
  },
  {
    id: "MTD",
    en: "Method",
    name: "Kebijakan dan tata kelola program",
    short: "Kebijakan",
    color: "c3",
    desc: "Arah belanja daerah, perlindungan sosial, dan program pemberdayaan.",
    vars: [
      {
        id: "MTD1",
        s: "Belanja daerah 2025",
        name: "Belanja daerah dan keberlanjutan program",
        hyp: "H4",
        def: "Pengetatan belanja pemerintah pada 2025 yang diduga menekan permintaan dan pendapatan kelompok bawah.",
        ind: "Realisasi belanja modal dan belanja sosial 2023 sampai 2025.",
        base: "Dugaan RKPD 2027 dan Evaluasi RPJMD; belum diuji dengan data belanja",
        src: "Bapperida; BPKAD"
      },
      {
        id: "MTD2",
        s: "Ketepatan sasaran bansos",
        name: "Ketepatan sasaran perlindungan sosial",
        hyp: "H4",
        def: "Kesesuaian penerima bantuan sosial dengan kelompok pengeluaran terbawah.",
        ind: "Persentase penerima bantuan menurut desil kesejahteraan; exclusion dan inclusion error.",
        base: "Belum diukur; DTSEN by name by address belum dimanfaatkan penuh",
        src: "Dinas Sosial; Kemensos (DTSEN)"
      },
      {
        id: "MTD3",
        s: "Pemberdayaan UMKM",
        name: "Pemberdayaan UMKM, koperasi, dan kewirausahaan",
        hyp: "H3",
        def: "Jangkauan dan dampak program usaha bagi rumah tangga berpenghasilan rendah, termasuk perempuan.",
        ind: "Jumlah UMKM binaan; akses pembiayaan; kenaikan omzet usaha mikro.",
        base: "Belum diukur; diminta ke Dinas Koperasi dan UKM",
        src: "Dinas Koperasi dan UKM"
      }
    ]
  },
  {
    id: "MTR",
    en: "Material",
    name: "Struktur ekonomi dan aset produktif",
    short: "Struktur ekonomi",
    color: "c4",
    desc: "Produktivitas sektor, nilai tambah, dan akses modal.",
    vars: [
      {
        id: "MTR1",
        s: "Produktivitas pertanian",
        name: "Produktivitas sektor pertanian",
        hyp: "H1",
        def: "Nilai tambah per pekerja di sektor primer yang menyerap tenaga kerja terbesar.",
        ind: "PDRB per pekerja sektor primer dibanding sekunder; pangsa pertanian dalam PDRB.",
        base: "Primer Rp37,67 juta vs sekunder Rp56,56 juta per pekerja; pertanian 24,83% PDRB",
        src: "BPS, PDRB dan Sakernas"
      },
      {
        id: "MTR2",
        s: "Hilirisasi industri",
        name: "Nilai tambah dan hilirisasi industri pengolahan",
        hyp: "H1",
        def: "Kemampuan industri pengolahan menaikkan nilai tambah hasil pertanian dan perikanan lokal.",
        ind: "Pangsa dan pertumbuhan industri pengolahan; jumlah industri hilir.",
        base: "Industri pengolahan 19,96% PDRB (17,98% pada 2021); tumbuh 7,73% pada 2025",
        src: "BPS, PDRB"
      },
      {
        id: "MTR3",
        s: "Akses modal kelompok bawah",
        name: "Akses modal dan aset produktif kelompok bawah",
        hyp: "H1",
        def: "Kemampuan rumah tangga bawah memperoleh kredit, lahan, dan peralatan usaha.",
        ind: "Penyaluran KUR dan kredit mikro menurut desil; kepemilikan lahan garapan.",
        base: "Belum diukur; perlu data perbankan dan Dinas Koperasi",
        src: "OJK/perbankan; Dinas Koperasi dan UKM"
      }
    ]
  },
  {
    id: "MSR",
    en: "Measurement",
    name: "Data dan pengukuran",
    short: "Data",
    color: "c5",
    desc: "Kualitas, ketersediaan, dan konsistensi data yang menjadi dasar kebijakan.",
    vars: [
      {
        id: "MSR1",
        s: "Kualitas data sasaran",
        name: "Kualitas data sasaran (DTSEN)",
        hyp: "H6",
        def: "Ketersediaan data rumah tangga by name by address untuk menentukan penerima program.",
        ind: "Cakupan dan pemutakhiran DTSEN; tingkat pemanfaatan oleh Perangkat Daerah.",
        base: "Akses DTSEN by name by address belum dimanfaatkan penuh",
        src: "Kemensos; Dinas Sosial"
      },
      {
        id: "MSR2",
        s: "Data tingkat kecamatan",
        name: "Ketersediaan data tingkat kecamatan",
        hyp: "H6",
        def: "Data pengeluaran dan kemiskinan menurut kecamatan untuk analisis spasial.",
        ind: "Jumlah indikator kesejahteraan yang tersedia per kecamatan.",
        base: "Pengeluaran dan kemiskinan kecamatan tidak dipublikasikan BPS",
        src: "BPS Kab. Trenggalek"
      },
      {
        id: "MSR3",
        s: "Konsistensi angka",
        name: "Konsistensi angka antardokumen",
        hyp: "H6",
        def: "Kesamaan angka indikator yang sama pada dokumen perencanaan yang berbeda.",
        ind: "Jumlah indikator dengan selisih angka antardokumen.",
        base: "Gini 2023: 0,336 (teks RKPD) vs 0,33 (grafik); seri TPT berbeda antardokumen",
        src: "RKPD 2027; Evaluasi RPJMD; BPS"
      }
    ]
  },
  {
    id: "ENV",
    en: "Environment",
    name: "Lingkungan dan wilayah",
    short: "Wilayah",
    color: "c6",
    desc: "Topografi, kerentanan bencana, dan sebaran penduduk.",
    vars: [
      {
        id: "ENV1",
        s: "Topografi dan lereng",
        name: "Topografi dan kemiringan lereng",
        hyp: "H5",
        def: "Kondisi fisik wilayah berlereng curam yang menaikkan biaya pembangunan dan membatasi lahan produktif.",
        ind: "Persentase wilayah dengan lereng lebih dari 25 persen.",
        base: "48,49% wilayah berlereng >25%",
        src: "BPS, Kab. Trenggalek Dalam Angka"
      },
      {
        id: "ENV2",
        s: "Kerentanan bencana",
        name: "Kerentanan bencana dan kerusakan lingkungan",
        hyp: "H5",
        def: "Risiko longsor, banjir, dan bencana lain yang merusak aset dan pendapatan rumah tangga rentan.",
        ind: "Indeks Risiko Bencana; jumlah kejadian dan kerugian.",
        base: "Indeks Risiko Bencana 120,85 (target 138,59)",
        src: "BPBD; Bapperida (IKU)"
      },
      {
        id: "ENV3",
        s: "Disparitas antarkecamatan",
        name: "Konsentrasi penduduk dan disparitas antarkecamatan",
        hyp: "H5",
        def: "Pemusatan penduduk dan kegiatan ekonomi di kecamatan dataran dibanding kecamatan pinggiran.",
        ind: "Indeks Theil antarkecamatan; kepadatan penduduk; indeks Moran.",
        base: "36,2% penduduk menempati 21,9% luas wilayah (lima kecamatan dataran)",
        src: "BPS; perhitungan konsultan"
      }
    ]
  }
];

export const VARS: VariableItem[] = [];
CRIT.forEach((c) =>
  c.vars.forEach((v) => {
    v.crit = c.id;
    VARS.push(v);
  })
);

export const VAR: Record<string, VariableItem> = Object.fromEntries(VARS.map((v) => [v.id, v]));
export const CR: Record<string, CriterionItem> = Object.fromEntries(CRIT.map((c) => [c.id, c]));

export const SAATY: [string | number, string, string][] = [
  [1, "Sama berpengaruh", "Kedua faktor memberi pengaruh yang sama terhadap kenaikan Gini."],
  [3, "Sedikit lebih berpengaruh", "Pengalaman dan data sedikit mendukung satu faktor atas yang lain."],
  [5, "Lebih berpengaruh", "Pengalaman dan data kuat mendukung satu faktor atas yang lain."],
  [7, "Sangat lebih berpengaruh", "Satu faktor sangat dominan dan terbukti dalam praktik."],
  [9, "Mutlak lebih berpengaruh", "Bukti yang mendukung satu faktor atas yang lain berada pada tingkat tertinggi."],
  ["2, 4, 6, 8", "Nilai antara", "Dipakai saat penilaian berada di antara dua tingkat di atas."]
];

export const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
export const CR_LIMIT = 0.10;

function pairsOf(items: string[]): [string, string][] {
  const o: [string, string][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      o.push([items[i], items[j]]);
    }
  }
  return o;
}

export const MATS: MatrixDef[] = [
  { id: "C", title: "Kriteria utama (kategori 6M)", items: CRIT.map((c) => c.id), pairs: [] }
].concat(
  CRIT.map((c) => ({
    id: "S:" + c.id,
    title: c.en + " · " + c.name,
    items: c.vars.map((v) => v.id),
    crit: c.id,
    pairs: []
  }))
);

MATS.forEach((m) => {
  m.pairs = pairsOf(m.items).map(([a, b]) => ({ a, b, key: m.id + "|" + a + "|" + b }));
});

export const MAT: Record<string, MatrixDef> = Object.fromEntries(MATS.map((m) => [m.id, m]));
export const ALL_KEYS = MATS.flatMap((m) => m.pairs.map((p) => p.key));
export const TOTAL_PAIRS = ALL_KEYS.length; // 15 + 6*3 = 33

export const ORGS = [
  "Bapperida Kabupaten Trenggalek",
  "Perangkat Daerah (OPD) pengampu",
  "BPS Kabupaten Trenggalek",
  "Akademisi & Peneliti",
  "Pelaku usaha / Asosiasi UMKM",
  "Komunitas / Masyarakat Sipil",
  "Tim Konsultan Ahli",
  "Lainnya"
];

// k = -8..8 ; k>0 left side more influential (ratio k+1), k<0 right side more influential (1/(|k|+1)), 0 equal
export function ratioFromK(k: number): number {
  return k === 0 ? 1 : k > 0 ? k + 1 : 1 / (1 - k);
}

export function kFromRatio(r: number): number {
  if (r >= 1) return Math.min(8, Math.round(r) - 1);
  return -Math.min(8, Math.round(1 / r) - 1);
}

export function buildMatrix(m: MatrixDef, j: Record<string, number> | undefined) {
  const n = m.items.length;
  const idx = Object.fromEntries(m.items.map((x, i) => [x, i]));
  const A = Array.from({ length: n }, () => Array(n).fill(1));
  let answered = 0;
  m.pairs.forEach((p) => {
    const k = j && j[p.key];
    if (typeof k === "number" && isFinite(k)) {
      const r = ratioFromK(k);
      const a = idx[p.a];
      const b = idx[p.b];
      A[a][b] = r;
      A[b][a] = 1 / r;
      answered++;
    }
  });
  return { A, answered, total: m.pairs.length, complete: answered === m.pairs.length };
}

export function priority(A: number[][]) {
  const n = A.length;
  let w = Array(n).fill(1 / n);
  for (let it = 0; it < 500; it++) {
    const v = A.map((r) => r.reduce((s, a, i) => s + a * w[i], 0));
    const s = v.reduce((x, y) => x + y, 0);
    const nw = v.map((x) => x / s);
    const d = nw.reduce((m, x, i) => Math.max(m, Math.abs(x - w[i])), 0);
    w = nw;
    if (d < 1e-13) break;
  }
  const Aw = A.map((r) => r.reduce((s, a, i) => s + a * w[i], 0));
  const lmax = Aw.reduce((s, x, i) => s + x / w[i], 0) / n;
  const ci = n > 2 ? Math.max(0, (lmax - n) / (n - 1)) : 0;
  const cr = n > 2 ? ci / RI[n - 1] : 0;
  return { w, lmax, ci, cr };
}

export function worstPair(
  m: MatrixDef,
  A: number[][],
  w: number[]
): { pair: PairItem; dev: number; implied: number; given: number } | null {
  let best: { pair: PairItem; dev: number; implied: number; given: number } | null = null;
  for (let i = 0; i < m.pairs.length; i++) {
    const p = m.pairs[i];
    const a = m.items.indexOf(p.a);
    const b = m.items.indexOf(p.b);
    const dev = Math.abs(Math.log(A[a][b]) - Math.log(w[a] / w[b]));
    if (!best || dev > best.dev) {
      best = { pair: p, dev, implied: w[a] / w[b], given: A[a][b] };
    }
  }
  return best;
}

export function aggregate(items: string[], mats: { A: number[][]; wt: number }[]): number[][] {
  const n = items.length;
  const A = Array.from({ length: n }, () => Array(n).fill(1));
  const W = mats.reduce((s, x) => s + x.wt, 0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      A[i][j] = Math.exp(mats.reduce((s, x) => s + x.wt * Math.log(x.A[i][j]), 0) / W);
    }
  }
  return A;
}

export interface AhpComputationResult {
  per: Record<string, Record<string, {
    answered: number;
    total: number;
    complete: boolean;
    w?: number[];
    cr?: number;
    lmax?: number;
    ci?: number;
    A?: number[][];
  }>>;
  groups: Record<string, {
    n: number;
    items: string[];
    provisional: boolean;
    A?: number[][];
    w: Record<string, number>;
    cr: number;
    lmax: number;
    ci: number;
    range: Record<string, [number, number]> | null;
    hint: { pair: PairItem; dev: number; implied: number; given: number } | null;
  }>;
  global: Record<string, number>;
  globalRange: Record<string, [number, number]>;
  prog: Record<string, {
    answered: number;
    total: number;
    pct: number;
    maxCR: number | null;
    crCrit: number | null;
    bad: string[];
    done: boolean;
  }>;
  provisional: boolean;
  nResp: number;
  nComplete: number;
}

export function computeAHP(
  respondents: Record<string, RespondentProfile>,
  ahp: Record<string, AhpEntry>,
  opts: { onlyConsistent?: boolean } = {}
): AhpComputationResult {
  const per: AhpComputationResult['per'] = {};
  const uids = Object.keys(ahp || {}).filter((u) => respondents && respondents[u]);

  uids.forEach((u) => {
    per[u] = {};
    const j = (ahp[u] && ahp[u].j) || {};
    MATS.forEach((m) => {
      const b = buildMatrix(m, j);
      const o: any = { answered: b.answered, total: b.total, complete: b.complete };
      if (b.complete) {
        const pr = priority(b.A);
        Object.assign(o, pr, { A: b.A });
      }
      per[u][m.id] = o;
    });
  });

  const groups: AhpComputationResult['groups'] = {};
  MATS.forEach((m) => {
    const inc = uids.filter(
      (u) => per[u][m.id]?.complete && (!opts.onlyConsistent || (per[u][m.id]?.cr ?? 1) <= CR_LIMIT)
    );
    const g: any = { n: inc.length, items: m.items, provisional: false };
    if (inc.length) {
      const A = aggregate(
        m.items,
        inc.map((u) => ({
          A: per[u][m.id].A!,
          wt: Math.max(0.0001, +(respondents[u].weight ?? 1))
        }))
      );
      const pr = priority(A);
      g.A = A;
      g.w = Object.fromEntries(m.items.map((x, i) => [x, pr.w[i]]));
      g.cr = pr.cr;
      g.lmax = pr.lmax;
      g.ci = pr.ci;
      g.range = Object.fromEntries(
        m.items.map((x, i) => {
          const vals = inc.map((u) => per[u][m.id].w![i]);
          return [x, [Math.min(...vals), Math.max(...vals)]];
        })
      );
      g.hint = pr.cr > CR_LIMIT ? worstPair(m, A, pr.w) : null;
    } else {
      g.provisional = true;
      g.w = Object.fromEntries(m.items.map((x) => [x, 1 / m.items.length]));
      g.cr = 0;
      g.lmax = m.items.length;
      g.ci = 0;
      g.range = null;
      g.hint = null;
    }
    groups[m.id] = g;
  });

  const global: Record<string, number> = {};
  const globalRange: Record<string, [number, number]> = {};

  CRIT.forEach((c) => {
    c.vars.forEach((v) => {
      global[v.id] = groups.C.w[c.id] * groups["S:" + c.id].w[v.id];
      const both = uids.filter((u) => per[u]?.C?.complete && per[u]?.["S:" + c.id]?.complete);
      if (both.length) {
        const ci = MAT.C.items.indexOf(c.id);
        const vi = MAT["S:" + c.id].items.indexOf(v.id);
        const vals = both.map((u) => per[u].C.w![ci] * per[u]["S:" + c.id].w![vi]);
        globalRange[v.id] = [Math.min(...vals), Math.max(...vals)];
      }
    });
  });

  const prog: AhpComputationResult['prog'] = {};
  uids.forEach((u) => {
    const answered = MATS.reduce((s, m) => s + (per[u][m.id]?.answered || 0), 0);
    const crs = MATS.filter((m) => per[u][m.id]?.complete).map((m) => per[u][m.id].cr!);
    prog[u] = {
      answered,
      total: TOTAL_PAIRS,
      pct: answered / TOTAL_PAIRS,
      maxCR: crs.length ? Math.max(...crs) : null,
      crCrit: per[u].C?.complete ? (per[u].C.cr ?? null) : null,
      bad: MATS.filter((m) => per[u][m.id]?.complete && (per[u][m.id].cr ?? 0) > CR_LIMIT).map((m) => m.id),
      done: answered === TOTAL_PAIRS
    };
  });

  const provisional = groups.C.provisional;
  return {
    per,
    groups,
    global,
    globalRange,
    prog,
    provisional,
    nResp: uids.length,
    nComplete: uids.filter((u) => prog[u]?.done).length
  };
}

export interface ConfirmItemResult {
  id: string;
  crit: string;
  gw: number;
  S: number;
  C: number;
  T: number;
  wS: number;
  wC: number;
  wT: number;
  n: number;
  w: number;
  notes: { uid: string; vote: 'S' | 'C' | 'T'; text: string }[];
  konsensus: number;
  status: 'ok' | 'bahas' | 'tolak' | 'belum';
  R: number;
  share: number;
  cum?: number;
}

export interface ConfirmComputationResult {
  items: Record<string, ConfirmItemResult>;
  cat: Record<string, { id: string; share: number; gw: number; nOk: number; n: number }>;
  ranked: ConfirmItemResult[];
  cnt: { ok: number; bahas: number; tolak: number; belum: number };
  sumR: number;
  voters: number;
  submitted: number;
  thr: number;
}

export function computeConfirm(
  respondents: Record<string, RespondentProfile>,
  confirm: Record<string, ConfirmEntry>,
  globalW: Record<string, number>,
  thr: number = 0.7
): ConfirmComputationResult {
  const out: Record<string, ConfirmItemResult> = {};
  const totalVoters = new Set<string>();
  let submitted = 0;

  VARS.forEach((v) => {
    out[v.id] = {
      id: v.id,
      crit: v.crit || '',
      gw: globalW[v.id] || 0,
      S: 0,
      C: 0,
      T: 0,
      wS: 0,
      wC: 0,
      wT: 0,
      n: 0,
      w: 0,
      notes: [],
      konsensus: 0,
      status: 'belum',
      R: 0,
      share: 0
    };
  });

  Object.keys(confirm || {}).forEach((u) => {
    if (!respondents || !respondents[u]) return;
    const c = confirm[u];
    const wt = Math.max(0.0001, +(respondents[u].weight ?? 1));
    const votes = c.votes || {};
    let any = false;
    VARS.forEach((v) => {
      const x = votes[v.id];
      if (x === "S") {
        const o = out[v.id];
        o.S++;
        o.wS += wt;
        o.n++;
        o.w += wt;
        any = true;
        const note = (c.notes || {})[v.id];
        if (note) o.notes.push({ uid: u, vote: x, text: note });
      } else if (x === "C") {
        const o = out[v.id];
        o.C++;
        o.wC += wt;
        o.n++;
        o.w += wt;
        any = true;
        const note = (c.notes || {})[v.id];
        if (note) o.notes.push({ uid: u, vote: x, text: note });
      } else if (x === "T") {
        const o = out[v.id];
        o.T++;
        o.wT += wt;
        o.n++;
        o.w += wt;
        any = true;
        const note = (c.notes || {})[v.id];
        if (note) o.notes.push({ uid: u, vote: x, text: note });
      }
    });
    if (any) totalVoters.add(u);
    if (c.submitted) submitted++;
  });

  const conf: ConfirmItemResult[] = [];
  VARS.forEach((v) => {
    const o = out[v.id];
    o.gw = globalW[v.id] || 0;
    o.konsensus = o.n ? (o.wS + 0.5 * o.wC) / o.w : 0;
    o.status = !o.n ? "belum" : o.konsensus >= thr ? "ok" : o.wT / o.w >= 0.5 ? "tolak" : "bahas";
    o.R = o.n ? o.gw * o.konsensus : 0;
    if (o.status === "ok") conf.push(o);
  });

  const sumR = conf.reduce((s, o) => s + o.R, 0);
  VARS.forEach((v) => {
    const o = out[v.id];
    o.share = o.status === "ok" && sumR > 0 ? o.R / sumR : 0;
  });

  const cat: Record<string, { id: string; share: number; gw: number; nOk: number; n: number }> = {};
  CRIT.forEach((c) => {
    cat[c.id] = { id: c.id, share: 0, gw: 0, nOk: 0, n: c.vars.length };
  });

  VARS.forEach((v) => {
    const o = out[v.id];
    cat[v.crit!].share += o.share;
    cat[v.crit!].gw += o.gw;
    if (o.status === "ok") cat[v.crit!].nOk++;
  });

  const ranked = conf.slice().sort((a, b) => b.R - a.R);
  let cum = 0;
  ranked.forEach((o) => {
    cum += o.share;
    o.cum = cum;
  });

  const cnt = { ok: 0, bahas: 0, tolak: 0, belum: 0 };
  VARS.forEach((v) => cnt[out[v.id].status]++);

  return { items: out, cat, ranked, cnt, sumR, voters: totalVoters.size, submitted, thr };
}

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  let u = 0,
    v = 0;
  while (!u) u = r();
  while (!v) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function makeDemo(): TrenggalekState {
  const r = mulberry(20261029);
  const base: Record<string, Record<string, number>> = {
    C: { MAN: 0.23, MAC: 0.11, MTD: 0.17, MTR: 0.25, MSR: 0.09, ENV: 0.15 },
    "S:MAN": { MAN1: 0.46, MAN2: 0.3, MAN3: 0.24 },
    "S:MAC": { MAC1: 0.42, MAC2: 0.33, MAC3: 0.25 },
    "S:MTD": { MTD1: 0.3, MTD2: 0.45, MTD3: 0.25 },
    "S:MTR": { MTR1: 0.52, MTR2: 0.28, MTR3: 0.2 },
    "S:MSR": { MSR1: 0.5, MSR2: 0.3, MSR3: 0.2 },
    "S:ENV": { ENV1: 0.34, ENV2: 0.22, ENV3: 0.44 }
  };

  const people: [string, string, string, number][] = [
    ["Rina Wulandari, S.E., M.Ec.", "Bapperida Kabupaten Trenggalek", "Kepala Bidang Perekonomian & SDA", 0.04],
    ["Agus Prasetyo, M.M.", "Dinas Koperasi dan UKM", "Kepala Bidang Usaha Mikro", 0.08],
    ["Dewi Lestari, S.Sos.", "Dinas Sosial, PPPA", "Kepala Seksi Pemberdayaan & Bansos", 0.05],
    ["Hendra Kusuma, S.Si.", "BPS Kabupaten Trenggalek", "Statistisi Ahli Muda", 0.03],
    ["Prof. Dr. Slamet Riyadi", "Akademisi Universitas", "Guru Besar Ekonomi Pembangunan Regional", 0.06],
    ["Ir. Yuliani Putri", "Dinas Pertanian & Pangan", "Kepala Bidang Sarana & Prasarana Pertanian", 0.12],
    ["Bagus Santoso", "Asosiasi UMKM & Pelaku Usaha", "Ketua Forum Industri Olahan Trenggalek", 0.07],
    ["Fitri Handayani", "Komunitas & Masyarakat Sipil", "Koordinator Kelompok Tani Wanita Pedesaan", 0.35],
    ["Eko Nugroho, M.Pd.", "Dinas Pendidikan", "Kepala Seksi Kurikulum & Ketenagaan", 0.09]
  ];

  const respondents: Record<string, RespondentProfile> = {};
  const ahp: Record<string, AhpEntry> = {};
  const confirm: Record<string, ConfirmEntry> = {};

  people.forEach((p, i) => {
    const uid = "demo" + (i + 1);
    respondents[uid] = {
      name: p[0],
      org: p[1],
      role: p[2],
      weight: 1,
      createdAt: Date.now() - 86400000 * (9 - i),
      demo: true
    };
    const j: Record<string, number> = {};
    const sigma = p[3];
    const limit = i === 8 ? 21 : TOTAL_PAIRS;
    let c = 0;
    MATS.forEach((m) => {
      m.pairs.forEach((pr) => {
        c++;
        if (c > limit) return;
        const wa = base[m.id][pr.a];
        const wb = base[m.id][pr.b];
        const ratio = (wa / wb) * Math.exp(gauss(r) * sigma * 3);
        j[pr.key] = kFromRatio(ratio);
      });
    });
    ahp[uid] = { j, updatedAt: Date.now() - 3600000 * (i + 1) };

    const votes: Record<string, 'S' | 'C' | 'T'> = {};
    const notes: Record<string, string> = {};
    const pOk: Record<string, number> = {
      MAN1: 0.95, MAN2: 0.8, MAN3: 0.7,
      MAC1: 0.85, MAC2: 0.8, MAC3: 0.55,
      MTD1: 0.7, MTD2: 0.9, MTD3: 0.65,
      MTR1: 0.97, MTR2: 0.8, MTR3: 0.45,
      MSR1: 0.85, MSR2: 0.75, MSR3: 0.7,
      ENV1: 0.9, ENV2: 0.6, ENV3: 0.8
    };

    if (i < 8) {
      VARS.forEach((v) => {
        const x = r();
        const prob = pOk[v.id];
        if (x < prob * 0.8) {
          votes[v.id] = "S";
        } else if (x < prob) {
          votes[v.id] = "C";
          notes[v.id] = "Perlu dilengkapi data pendukung per kecamatan dan validasi lapangan.";
        } else {
          votes[v.id] = "T";
        }
      });
    }

    confirm[uid] = {
      votes,
      notes,
      proposals: i === 3 ? ["Rasio ketergantungan penduduk menurut kecamatan (Dependency Ratio)"] : [],
      submitted: i < 7,
      updatedAt: Date.now() - 1800000 * (i + 1)
    };
  });

  return { respondents, ahp, confirm, config: { target: 12, threshold: 0.7 } };
}
