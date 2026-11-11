// Semua definisi tipe untuk kontrak disimpan di sini.
// Field masih sementara (menunggu wawancara dengan kepala divisi),
// jadi kalau ada perubahan cukup ubah file ini.

/** Jenis kontrak. Sementara: PKS, SPK, dan Lainnya. */
export type JenisKontrak = 'PKS' | 'SPK' | 'Lainnya'

/** Pilihan berapa hari sebelum berakhir pengingat dikirim. */
export type PengingatHari = 30 | 60 | 90

/**
 * Status kontrak. Tidak diisi manual, tapi dihitung dari tanggal berakhir
 * (lihat src/lib/status.ts). Status baru, misalnya untuk alur persetujuan
 * nanti, cukup ditambahkan di sini.
 */
export type StatusKontrak = 'berjalan' | 'segera' | 'lewat' | 'selesai'

export type Kontrak = {
  id: string
  nomor: string
  judul: string
  jenis: JenisKontrak
  mitra: string
  unitPemilik: string
  /** Nilai kontrak dalam rupiah, angka bulat tanpa titik. */
  nilai: number
  /** Format YYYY-MM-DD */
  tanggalMulai: string
  /** Format YYYY-MM-DD */
  tanggalBerakhir: string
  /** true kalau admin sudah menandai kontrak ini selesai. */
  ditandaiSelesai: boolean
  pengingatHari: PengingatHari
}
