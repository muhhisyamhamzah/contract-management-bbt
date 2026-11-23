// Pilihan alasan saat admin menonaktifkan akun (Hisyam 19 Nov 2026).
// [ASUMSI] Daftar ini usulan tim; bisa diubah kalau atasan punya istilah resmi. "Lainnya" dijelaskan di Keterangan.

export const ALASAN_NONAKTIF = [
  'Pindah divisi atau unit',
  'Keluar dari kantor (resign atau pensiun)',
  'Masa kerja atau magang selesai',
  'Cuti panjang',
  'Lainnya',
] as const

// --- Email pengingat (permintaan atasan, 20 Nov 2026) ---
// Pengingat 3, 2, 1 bulan juga dikirim ke email. Pengguna masuk dengan email kantor, lalu pengingat diteruskan
// ke email pribadinya (misalnya Gmail) kalau diisi. Tidak perlu izin apa pun: langsung aktif.
// Purwarupa hanya menyimpan alamatnya; pengirimannya dibuat di backend (layanan email/SMTP, belum ada).

/** Alamat yang menerima email pengingat untuk akun ini. */
export function alamatPengingat(akun: { email: string; emailNotifikasi?: string }): string {
  return akun.emailNotifikasi?.trim() || akun.email
}

/** Pesan kesalahan untuk isian email pengingat, atau kosong kalau benar. Isian kosong boleh. */
export function cekEmailNotifikasi(teks: string, emailKantor?: string): string {
  const isi = teks.trim()
  if (!isi) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(isi)) return 'Format email belum benar, misalnya nama.anda@gmail.com.'
  if (emailKantor && isi.toLowerCase() === emailKantor.toLowerCase())
    return 'Ini sama dengan email kantor. Isi email pribadi, atau kosongkan.'
  return ''
}
