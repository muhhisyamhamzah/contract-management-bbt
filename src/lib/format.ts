// Fungsi untuk menampilkan angka rupiah, tanggal, dan ukuran file dalam format Indonesia.

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

/** Contoh: 1500000000 menjadi "Rp 1,5 M". Untuk tempat sempit seperti baris daftar. */
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

/** Mengubah objek Date menjadi teks "YYYY-MM-DD" (kebalikan dari keTanggal). */
export function keTeksTanggal(tanggal: Date): string {
  const tahun = tanggal.getFullYear()
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0')
  const hari = String(tanggal.getDate()).padStart(2, '0')
  return `${tahun}-${bulan}-${hari}`
}

/** Tanggal hari ini dalam format "YYYY-MM-DD". */
export function hariIniTeks(): string {
  return keTeksTanggal(new Date())
}

/** Contoh: "2026-12-31" menjadi "31 Desember 2026". */
export function formatTanggal(teks: string): string {
  return keTanggal(teks).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Contoh: "2026-12-31" menjadi "31 Des 2026". Untuk tempat sempit. */
export function formatTanggalSingkat(teks: string): string {
  return keTanggal(teks).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Contoh: "Selasa, 17 November 2026". Untuk tanggal hari ini di header Beranda. */
export function formatTanggalHariIni(tanggal: Date = new Date()): string {
  return tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Contoh: waktu ISO menjadi "17 Nov 2026, 08.55". Untuk riwayat perubahan. */
export function formatWaktu(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Menggeser tanggal "YYYY-MM-DD" sebanyak sekian hari (negatif = mundur). */
export function geserTanggal(teks: string, jumlahHari: number): string {
  const tanggal = keTanggal(teks)
  tanggal.setDate(tanggal.getDate() + jumlahHari)
  return keTeksTanggal(tanggal)
}

/**
 * Menggeser tanggal "YYYY-MM-DD" sebanyak sekian bulan kalender (negatif = mundur).
 * Kalau tanggalnya tidak ada di bulan tujuan (misalnya 31 Februari), dipakai hari terakhir bulan itu.
 * Contoh: geserBulan("2027-05-31", -3) menjadi "2027-02-28".
 */
export function geserBulan(teks: string, jumlahBulan: number): string {
  const [tahun, bulan, hari] = teks.split('-').map(Number)
  const awalBulanTujuan = new Date(tahun, bulan - 1 + jumlahBulan, 1)
  const hariTerakhir = new Date(awalBulanTujuan.getFullYear(), awalBulanTujuan.getMonth() + 1, 0).getDate()
  awalBulanTujuan.setDate(Math.min(hari, hariTerakhir))
  return keTeksTanggal(awalBulanTujuan)
}

/** Periode kontrak dalam teks, misalnya "10 bulan" atau "1 tahun 2 bulan". Dihitung dari awal dan akhir. */
export function formatPeriode(mulai: string, berakhir: string): string {
  const a = keTanggal(mulai)
  const b = keTanggal(berakhir)
  let bulan = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  // Sisa hari lebih dari separuh bulan dibulatkan ke atas.
  if (b.getDate() - a.getDate() >= 15) bulan += 1
  if (b.getDate() - a.getDate() <= -15) bulan -= 1
  if (bulan < 1) {
    const hari = Math.round((b.getTime() - a.getTime()) / 86_400_000)
    return `${Math.max(hari, 0)} hari`
  }
  const tahun = Math.floor(bulan / 12)
  const sisaBulan = bulan % 12
  if (tahun === 0) return `${sisaBulan} bulan`
  return sisaBulan === 0 ? `${tahun} tahun` : `${tahun} tahun ${sisaBulan} bulan`
}

/** Contoh: 2516582 menjadi "2,4 MB". */
export function formatUkuranFile(byte: number): string {
  if (byte >= 1024 * 1024) {
    return `${(byte / (1024 * 1024)).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`
  }
  return `${Math.max(1, Math.round(byte / 1024))} KB`
}

/** Huruf depan nama untuk lingkaran avatar, misalnya "Dewi Contoh" menjadi "DC". */
export function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]!.toUpperCase())
    .join('')
}
