// Semua definisi tipe aplikasi disimpan di sini, supaya mudah diubah saat
// kolom final dari atasan berubah (lihat CLAUDE.md bagian "Data kontrak").

/**
 * Status kontrak. Tidak diisi manual, tapi dihitung dari tanggal akhir
 * (lihat src/lib/status.ts). Status baru, misalnya untuk alur persetujuan
 * nanti, cukup ditambahkan di sini.
 */
export type StatusKontrak = 'berjalan' | 'segera' | 'lewat' | 'selesai'

/** Jenis klausul berisiko di PKS. */
export type JenisCriticalPoint = 'pengakhiran' | 'denda' | 'lainnya'

/** Satu klausul berisiko di PKS, misalnya pasal pengakhiran kontrak atau denda. */
export type CriticalPoint = {
  id: string
  jenis: JenisCriticalPoint
  /** Rujukan pasal, misalnya "Pasal 12". */
  pasal: string
  /** Ringkasan singkat yang ditulis pengguna. */
  ringkasan: string
  /** Tanggal penting (opsional), format YYYY-MM-DD. Kalau diisi, ikut diingatkan. */
  tanggalPenting: string
  status: 'aktif' | 'selesai'
  /** Keterangan penanganan, diisi saat ditandai selesai. */
  penanganan: string
}

export type JenisDokumen = 'PKS utama' | 'Adendum' | 'BAST' | 'Lainnya'

/** Satu file PDF kontrak. */
export type Dokumen = {
  id: string
  nama: string
  jenis: JenisDokumen
  /** Ukuran file dalam byte. */
  ukuran: number
  /** Tanggal unggah, format YYYY-MM-DD. */
  tanggal: string
}

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
  criticalPoint: CriticalPoint[]
  /** [TERBUKA] Isinya progres pekerjaan atau status pembayaran. */
  monitoring: string
  catatan: string
  /** [TERBUKA] Bedanya dengan catatan belum jelas. */
  keterangan: string
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
  jenis: 'pengingat' | 'lewat' | 'critical'
}
