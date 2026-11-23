// Semua definisi tipe aplikasi disimpan di sini, supaya mudah diubah saat
// kolom final dari atasan berubah (lihat CLAUDE.md bagian "Data kontrak").

/**
 * Status kontrak. Tidak diisi manual, tapi dihitung dari tanggal akhir
 * (lihat src/lib/status.ts). Status baru, misalnya untuk alur persetujuan
 * nanti, cukup ditambahkan di sini.
 */
export type StatusKontrak = 'berjalan' | 'segera' | 'lewat' | 'selesai'

/**
 * Ketentuan kontrak dari PKS (dulu "critical point", diubah Hisyam 18 Nov 2026).
 * Empat kolom isian teks tetap, semuanya boleh kosong. Tidak ada tanggal dan pengingat.
 */
export type KetentuanKontrak = {
  pengakhiran: string
  denda: string
  jaminan: string
  /** Keterangan lain. Menggantikan kolom Monitoring, Catatan, dan Keterangan lama (dihapus 18 Nov 2026). */
  keterangan: string
}

/**
 * Perpanjangan kontrak, diisi pengguna (Hisyam 18 Nov 2026).
 * Status kontrak yang tampil dihitung dari isian ini (lihat STATUS_PERPANJANGAN di src/lib/status.ts).
 */
export type Perpanjangan = 'belum' | 'proses' | 'diperpanjang' | 'tidak'

export type JenisDokumen = 'PKS utama' | 'Adendum' | 'BAST' | 'Lainnya'

/** Satu file dokumen kontrak (PKS, adendum, BAST, dll.). Semua jenis file boleh. */
export type Dokumen = {
  id: string
  nama: string
  jenis: JenisDokumen
  /** Ukuran file dalam byte. */
  ukuran: number
  /** Tanggal unggah, format YYYY-MM-DD. */
  tanggal: string
  /**
   * Alamat file untuk pratinjau dan unduh. Di purwarupa: alamat sementara browser (URL.createObjectURL)
   * untuk file yang diunggah di sesi ini; dokumen contoh tidak punya file. Nanti: tautan bertanda tangan Cloudflare R2.
   */
  url?: string
  /**
   * Data kontrak saat dokumen ini berlaku (hanya PKS dan adendum). Dipakai halaman Detail untuk menampilkan
   * data versi dokumen yang dibuka di samping data terbaru (permintaan atasan, 20 Nov 2026).
   * Dokumen lain (BAST, lainnya) tidak punya versi sendiri: mengikuti versi yang berlaku pada tanggal unggahnya.
   */
  versi?: VersiKontrak
}

/** Isi data kontrak yang berlaku pada satu versi (PKS awal, PKS pengganti, atau adendum). */
export type VersiKontrak = Pick<
  Kontrak,
  'nama' | 'penyedia' | 'nomorPks' | 'tanggalPks' | 'tanggalMulai' | 'tanggalBerakhir' | 'nilai' | 'ketentuan' | 'perpanjangan'
>

export type Kontrak = {
  id: string
  /** Nama kontrak. */
  nama: string
  /** Pihak penyedia (dulu disebut "mitra"). */
  penyedia: string
  /** Nomor PKS, unik. */
  nomorPks: string
  /** Format YYYY-MM-DD */
  tanggalPks: string
  /** Awal kontrak, format YYYY-MM-DD */
  tanggalMulai: string
  /** Akhir kontrak, format YYYY-MM-DD */
  tanggalBerakhir: string
  /** Nilai kontrak dalam rupiah, angka bulat. */
  nilai: number
  ketentuan: KetentuanKontrak
  /** Perpanjangan kontrak: belum diproses, sedang diproses, sudah diperpanjang, atau tidak diperpanjang. */
  perpanjangan: Perpanjangan
  dokumen: Dokumen[]
  /** true kalau sudah ditandai selesai oleh pengguna. */
  ditandaiSelesai: boolean
  /** Keterangan saat ditandai selesai. */
  keteranganSelesai: string
}

// ---------------------------------------------------------------------------
// Akun, riwayat perubahan, dan notifikasi
// ---------------------------------------------------------------------------

export type Peran = 'pengguna' | 'admin'

/** Alasan dan jejak penonaktifan akun. */
export type CatatanNonaktif = {
  alasan: string
  keterangan: string
  /** Waktu dinonaktifkan, format ISO. */
  waktu: string
  /** Nama admin yang menonaktifkan. */
  oleh: string
}

export type Akun = {
  id: string
  nama: string
  email: string
  /** Jabatan yang tampil di daftar akun, misalnya "Tim Pengadaan". */
  jabatan: string
  peran: Peran
  aktif: boolean
  /** HANYA untuk data contoh selama belum ada backend. Backend menyimpan hash. */
  sandi: string
  /**
   * Catatan saat akun dinonaktifkan (Hisyam 19 Nov 2026): alasan, keterangan, kapan (ISO), dan oleh siapa.
   * Dikosongkan saat akun diaktifkan lagi; jejaknya tetap ada di riwayat perubahan.
   */
  nonaktif?: CatatanNonaktif
  /**
   * Email pribadi (misalnya Gmail) untuk menerima pengingat kontrak (permintaan atasan, 20 Nov 2026).
   * Masuk ke website tetap dengan email kantor; email kantor menjadi "jembatan" ke email ini.
   * Kosong: pengingat dikirim ke email kantor. Pengiriman otomatis tanpa perlu izin (beda dengan Web Push).
   */
  emailNotifikasi?: string
}

/** Satu baris riwayat perubahan: siapa, kapan, apa yang berubah. */
export type CatatanRiwayat = {
  id: string
  /** Waktu kejadian, format ISO. */
  waktu: string
  /** Nama orang yang melakukan. */
  oleh: string
  aksi: 'tambah' | 'ubah' | 'hapus' | 'selesai' | 'unggah' | 'akun'
  /** Kalimat singkat, misalnya "Menambah kontrak Jasa penilaian aset". */
  rincian: string
  /** Kontrak yang terkait (kosong untuk perubahan akun atau kontrak yang sudah dihapus). */
  kontrakId?: string
}

/** Notifikasi di panel lonceng. Dihitung dari jadwal pengingat. */
export type Notifikasi = {
  id: string
  judul: string
  isi: string
  /** Tanggal pengingat, format YYYY-MM-DD. */
  tanggal: string
  kontrakId: string
  jenis: 'pengingat' | 'lewat'
}
