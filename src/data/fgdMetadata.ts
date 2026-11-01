export interface FGDAlternative {
  k: string;
  n: string;
  d: string;
}

export interface FGDCommodity {
  code: string;
  kom: string;
  tgl: string;
  alts: FGDAlternative[];
  qs: string[];
}

export interface FGDMetaCriterion {
  k: string;
  n: string;
  d: string;
  color?: string;
}

export interface FGDMetaInstrument {
  k: string;
  n: string;
  d: string;
}

export const FGD_META = {
  crit: [
    {
      k: 'K1',
      n: 'Nilai tambah dan kedalaman industri',
      d: 'Seberapa jauh jalur ini membuat produk naik kelas dari bahan mentah/produk antara menjadi produk akhir, dan menghidupkan industri pengguna di dalam negeri.',
      color: '#0E6B63',
    },
    {
      k: 'K2',
      n: 'Daya saing dan akses pasar',
      d: 'Peluang produk terjual dengan harga bersaing di pasar domestik dan ekspor, termasuk syarat pembeli (perjanjian dagang, jejak karbon).',
      color: '#C2862A',
    },
    {
      k: 'K3',
      n: 'Tenaga kerja dan manfaat daerah',
      d: 'Jumlah dan mutu lapangan kerja serta manfaat bagi pemasok, UMKM, dan penerimaan daerah.',
      color: '#3C679B',
    },
    {
      k: 'K4',
      n: 'Kesiapan bahan baku, energi, dan infrastruktur',
      d: 'Ketersediaan bahan baku yang pasti, listrik/gas dengan harga wajar, pelabuhan, dan kawasan industri.',
      color: '#8A4C7B',
    },
    {
      k: 'K5',
      n: 'Keberlanjutan lingkungan dan sosial',
      d: 'Dampak terhadap lingkungan (emisi, limbah/tailing, lahan) dan penerimaan masyarakat sekitar.',
      color: '#6A8636',
    },
  ],
  instr: [
    {
      k: 'I1',
      n: 'Pengendalian ekspor bahan mentah',
      d: 'Larangan atau pembatasan ekspor, bea keluar berjenjang menurut tingkat pengolahan.',
    },
    {
      k: 'I2',
      n: 'Insentif fiskal bertahap',
      d: 'Tax holiday, pembebasan bea masuk, dan fasilitas KEK yang makin besar bila produk makin hilir.',
    },
    {
      k: 'I3',
      n: 'Infrastruktur dan energi',
      d: 'Listrik (terutama rendah karbon), gas, pelabuhan, dan kawasan industri/KEK yang siap pakai.',
    },
    {
      k: 'I4',
      n: 'Pasar domestik dan industri pengguna',
      d: 'Kontrak pasokan ke industri pengguna dalam negeri, TKDN, dan belanja pemerintah.',
    },
    {
      k: 'I5',
      n: 'Diplomasi ekonomi dan akses pasar',
      d: 'Perjanjian dagang, penyelesaian sengketa, sertifikasi jejak karbon dan ketertelusuran.',
    },
  ],
  fgd: [
    {
      code: 'F1',
      kom: 'Batubara',
      tgl: 'Rab, 28 Okt 2026',
      alts: [
        { k: 'A1', n: 'Gasifikasi menjadi DME dan metanol', d: 'Substitusi impor LPG dan bahan kimia dasar.' },
        { k: 'A2', n: 'Kokas dan produk karbon untuk industri logam', d: 'Kokas untuk smelter nikel dan pabrik baja.' },
        { k: 'A3', n: 'Produk kimia turunan batubara', d: 'Amonia/pupuk, tar batubara dan turunannya.' },
      ],
      qs: [
        'Pada harga batubara dan harga produk berapa proyek DME atau kokas menjadi layak secara bisnis?',
        'Apa hambatan terbesar proyek hilirisasi batubara yang sedang berjalan (teknologi, pendanaan, harga, pembeli)?',
        'Bagaimana sebaiknya bea keluar batubara dirancang agar mendorong pengolahan di dalam negeri tanpa mengganggu penerimaan negara?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F2',
      kom: 'Minyak dan Gas Bumi',
      tgl: 'Selasa, 3 Nov 2026',
      alts: [
        { k: 'A1', n: 'Kapasitas dan kompleksitas kilang', d: 'Meningkatkan produksi BBM dalam negeri dan mengurangi impor.' },
        { k: 'A2', n: 'Integrasi kilang–petrokimia', d: 'Olefin, aromatik, dan metanol untuk industri plastik dan kimia.' },
        { k: 'A3', n: 'Gas bumi untuk industri dan pupuk', d: 'Pemanfaatan gas domestik untuk amonia, pupuk, dan industri pengguna.' },
      ],
      qs: [
        'Berapa tambahan kapasitas kilang dan petrokimia yang sudah pasti beroperasi hingga 2030?',
        'Seberapa besar Harga Gas Bumi Tertentu (HGBT) menaikkan daya saing industri pengguna? Mohon contoh angka bila ada.',
        'Produk petrokimia impor apa yang paling layak diproduksi di dalam negeri dalam lima tahun ke depan?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F7',
      kom: 'Bauksit dan Aluminium',
      tgl: 'Senin, 16 Nov 2026',
      alts: [
        { k: 'A1', n: 'Perluasan kapasitas alumina', d: 'Mengolah bauksit menjadi alumina (smelter grade dan chemical grade).' },
        { k: 'A2', n: 'Aluminium primer rendah karbon', d: 'Smelter aluminium dengan listrik rendah karbon.' },
        { k: 'A3', n: 'Produk aluminium hilir', d: 'Lembaran, foil, ekstrusi, dan kabel.' },
      ],
      qs: [
        'Berapa kapasitas dan utilisasi pabrik alumina saat ini, serta rencana tambahannya hingga 2030?',
        'Berapa porsi biaya listrik dalam produksi aluminium dan dari mana sumber listriknya?',
        'Apa kendala pasokan aluminium primer ke industri hilir di dalam negeri?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F6',
      kom: 'Mangan',
      tgl: 'Selasa, 17 Nov 2026',
      alts: [
        { k: 'A1', n: 'Feromangan dan silikomangan', d: 'Bahan paduan untuk industri baja.' },
        { k: 'A2', n: 'Mangan sulfat kemurnian tinggi', d: 'Bahan katoda baterai kendaraan listrik.' },
        { k: 'A3', n: 'Penguatan basis sumber daya', d: 'Eksplorasi, pencatatan cadangan, dan neraca mangan.' },
      ],
      qs: [
        'Dari mana sumber bijih mangan untuk produksi feromangan saat ini (domestik atau impor) dan berapa porsinya?',
        'Seberapa besar peluang mangan sulfat untuk baterai di Indonesia, dan apa syarat teknologinya?',
        'Data cadangan dan produksi mangan apa yang paling dibutuhkan namun belum tersedia?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F8',
      kom: 'Tembaga',
      tgl: 'Selasa, 23 Nov 2026',
      alts: [
        { k: 'A1', n: 'Operasi penuh smelter dan katoda', d: 'Memastikan seluruh konsentrat diolah menjadi katoda.' },
        { k: 'A2', n: 'Industri pengguna katoda', d: 'Batang, kawat, kabel, dan foil tembaga untuk baterai.' },
        { k: 'A3', n: 'Produk samping bernilai tinggi', d: 'Emas, perak, lumpur anoda, dan asam sulfat.' },
      ],
      qs: [
        'Berapa utilisasi smelter saat ini dan berapa konsentrat yang masih diekspor?',
        'Berapa katoda yang terserap industri dalam negeri dan apa hambatannya?',
        'Produk tembaga impor apa yang paling layak diproduksi di dalam negeri?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F4',
      kom: 'Nikel',
      tgl: 'Senin, 30 Nov 2026',
      alts: [
        { k: 'A1', n: 'Jalur baja nirkarat', d: 'Feronikel/NPI menjadi baja nirkarat dan produk turunannya.' },
        { k: 'A2', n: 'Jalur baterai kendaraan listrik', d: 'MHP/nikel sulfat menjadi prekursor, katoda, dan sel baterai.' },
        { k: 'A3', n: 'Logam nikel murni dan paduan', d: 'Nikel kelas satu dan paduan khusus untuk industri.' },
      ],
      qs: [
        'Berapa lama cadangan bijih nikel kadar tinggi (saprolit) dapat memenuhi kapasitas smelter yang ada?',
        'Perlukah moratorium pembangunan smelter baru yang hanya menghasilkan produk setengah jadi? Jika ya, dengan syarat apa?',
        'Apa kendala utama pasokan MHP/nikel sulfat ke pabrik prekursor dan katoda di dalam negeri?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F5',
      kom: 'Kobalt',
      tgl: 'Selasa, 1 Des 2026',
      alts: [
        { k: 'A1', n: 'Kobalt sulfat untuk baterai domestik', d: 'Memasok prekursor baterai di dalam negeri.' },
        { k: 'A2', n: 'Logam dan serbuk kobalt', d: 'Untuk paduan logam dan industri lain.' },
        { k: 'A3', n: 'Daur ulang baterai', d: 'Memulihkan kobalt, nikel, dan litium dari baterai bekas.' },
      ],
      qs: [
        'Berapa volume kobalt (dalam MHP, hidroksida, atau sulfat) yang dihasilkan saat ini dan ke mana dijual?',
        'Apa syarat agar pembeli dalam negeri (pabrik prekursor) mau menyerap kobalt domestik?',
        'Standar jejak karbon dan ketertelusuran apa yang diminta pembeli luar negeri?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F3',
      kom: 'Besi dan Baja',
      tgl: 'Rabu, 2 Des 2026',
      alts: [
        { k: 'A1', n: 'Baja karbon hulu–hilir', d: 'Slab, baja canai panas dan dingin untuk menggantikan impor.' },
        { k: 'A2', n: 'Baja nirkarat lanjutan', d: 'Mengolah slab nirkarat menjadi lembaran, pipa, dan produk fabrikasi.' },
        { k: 'A3', n: 'Barang jadi dari besi dan baja', d: 'Pipa, struktur, komponen otomotif dan mesin (HS Bab 73).' },
      ],
      qs: [
        'Berapa utilisasi pabrik Bapak/Ibu dan produk baja impor apa yang paling besar menekan industri dalam negeri?',
        'Apa yang menghambat slab baja nirkarat diolah lebih lanjut di dalam negeri?',
        'Produk baja apa yang belum memiliki kode HS atau data yang memadai untuk dipantau?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F9',
      kom: 'Litium',
      tgl: 'Kamis, 3 Des 2026',
      alts: [
        { k: 'A1', n: 'Pemurnian litium dari bahan impor', d: 'Spodumen/konsentrat impor diolah menjadi litium hidroksida atau karbonat.' },
        { k: 'A2', n: 'Manufaktur sel baterai', d: 'Fokus pada sel LFP/NMC dengan bahan baku impor.' },
        { k: 'A3', n: 'Pengamanan pasokan', d: 'Eksplorasi sumber domestik dan kemitraan pasokan luar negeri.' },
      ],
      qs: [
        'Dari negara mana bahan baku litium diperoleh, dalam bentuk apa, dan berapa harganya?',
        'Berapa kebutuhan litium industri baterai di Indonesia hingga 2030?',
        'Kode HS apa yang digunakan saat mengimpor atau mengekspor bahan litium?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F10',
      kom: 'Timah dan Logam Tanah Jarang',
      tgl: 'Jumat, 4 Des 2026',
      alts: [
        { k: 'A1', n: 'Produk hilir timah', d: 'Solder, bahan kimia timah, dan pelat timah (tinplate).' },
        { k: 'A2', n: 'Pengolahan monasit menjadi logam tanah jarang', d: 'Pemisahan dan pemurnian oksida logam tanah jarang.' },
        { k: 'A3', n: 'Mineral ikutan lain', d: 'Zirkon, ilmenit, dan senotim dari penambangan timah.' },
      ],
      qs: [
        'Berapa persen timah yang diolah menjadi produk hilir di dalam negeri dan apa hambatannya?',
        'Berapa volume monasit yang tersimpan dan regulasi apa yang menghambat pengolahannya?',
        'Kemitraan teknologi seperti apa yang dibutuhkan untuk mengolah logam tanah jarang?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
    {
      code: 'F11',
      kom: 'Pasir Silika',
      tgl: 'Senin, 7 Des 2026',
      alts: [
        { k: 'A1', n: 'Kaca lembaran dan kaca pengaman', d: 'Untuk bangunan dan otomotif.' },
        { k: 'A2', n: 'Kaca surya dan silikon', d: 'Rantai pasok panel surya: kaca surya, silikon metalurgi, polisilikon.' },
        { k: 'A3', n: 'Bahan industri berbasis silika', d: 'Silika olahan dan natrium silikat untuk industri kimia.' },
      ],
      qs: [
        'Berapa volume pasir silika yang memenuhi spesifikasi kaca dan kaca surya, dan di mana lokasinya?',
        'Bagaimana dampak rencana penataan izin pasir kuarsa terhadap pasokan industri?',
        'Berapa kebutuhan pasir silika industri kaca surya dan silikon hingga 2030?',
        'Kebijakan apa yang paling perlu diubah dalam dua tahun ke depan agar hilirisasi komoditas ini naik kelas?',
      ],
    },
  ],
};

export const RESPONDENT_GROUPS = [
  'Pemerintah pusat',
  'Pemerintah daerah',
  'BUMN',
  'Swasta',
  'Asosiasi',
  'Akademisi/peneliti',
  'Lainnya',
];

export const SAATY_SCALE_BUTTONS = [9, 7, 5, 3, 1, 3, 5, 7, 9];
export const NA_CRIT = 10; // pairs(5) = 10
export const NB_ALTS = 15; // 5 criteria * pairs(3) = 15
export const NC_INST = 10; // pairs(5) = 10
export const TOTAL_PAIRS = NA_CRIT + NB_ALTS + NC_INST; // 35
