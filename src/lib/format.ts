// Fungsi untuk menampilkan angka rupiah dan tanggal dalam format Indonesia.

const pemformatRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** Contoh: 150000000 menjadi "Rp 150.000.000". */
export function formatRupiah(nilai: number): string {
  // Intl memakai spasi khusus (non-breaking) setelah "Rp"; diganti spasi biasa.
  return pemformatRupiah.format(nilai).replace(/\s/g, ' ')
}

/** Contoh: 1500000000 menjadi "Rp 1,5 M". Untuk tempat sempit seperti kartu. */
export function formatRupiahSingkat(nilai: number): string {
  const satuan = [
    { batas: 1_000_000_000_000, akhiran: 'T' },
    { batas: 1_000_000_000, akhiran: 'M' },
    { batas: 1_000_000, akhiran: 'jt' },
  ]
  for (const { batas, akhiran } of satuan) {
    if (Math.abs(nilai) >= batas) {
      const angka = (nilai / batas).toLocaleString('id-ID', { maximumFractionDigits: 1 })
      return `Rp ${angka} ${akhiran}`
    }
  }
  return formatRupiah(nilai)
}

/** Mengubah "YYYY-MM-DD" menjadi tanggal lokal jam 00:00 (tanpa geser zona waktu). */
export function keTanggal(teks: string): Date {
  const [tahun, bulan, hari] = teks.split('-').map(Number)
  return new Date(tahun, bulan - 1, hari)
}

/** Contoh: "2026-12-31" menjadi "31 Desember 2026". */
export function formatTanggal(teks: string): string {
  return keTanggal(teks).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Contoh: "2026-12-31" menjadi "31 Des 2026". Untuk tempat sempit. */
export function formatTanggalSingkat(teks: string): string {
  return keTanggal(teks).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Mengubah objek Date menjadi teks "YYYY-MM-DD" (kebalikan dari keTanggal). */
export function keTeksTanggal(tanggal: Date): string {
  const tahun = tanggal.getFullYear()
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0')
  const hari = String(tanggal.getDate()).padStart(2, '0')
  return `${tahun}-${bulan}-${hari}`
}
