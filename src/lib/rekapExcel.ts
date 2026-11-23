// Isi file Excel rekap kontrak (permintaan atasan, 20 Nov 2026). Format file ada di src/lib/excel.ts.
// Lembar "Kontrak": satu baris per versi data yang dipilih + baris total nilai. Lembar "Dokumen": semua dokumen tiap kontrak.
// Versi data (Hisyam 23 Nov 2026): per kontrak bisa dipilih data terbaru, data saat satu PKS/adendum berlaku
// (misalnya Adendum ke-2), atau semua versi sekaligus. Lihat daftarVersi di src/lib/versiKontrak.ts.
// [ASUMSI] Susunan kolom sementara; diganti mengikuti template Excel atasan kalau sudah ada.

import type { Kontrak } from '../types/kontrak'
import { urutkanDokumen } from './daftarKontrak'
import { formatPeriode, formatTanggalSingkat, hariIniTeks } from './format'
import { buatXlsx, type Lembar, type Sel } from './excel'
import { hitungSisaHari, hitungStatus, jadwalPengingat, LABEL_KETENTUAN, STATUS_PERPANJANGAN, TAMPILAN_STATUS } from './status'
import { daftarVersi, type BarisVersi } from './versiKontrak'

/**
 * Versi yang diunduh untuk satu kontrak: 'terbaru', 'semua', atau daftar id dokumen PKS/adendum tertentu
 * (boleh satu atau beberapa, misalnya hanya dokumen 4 dari 7).
 */
export type PilihanVersi = 'terbaru' | 'semua' | string[]

export type PilihanUnduh = { kontrak: Kontrak; versi: PilihanVersi }

/** Versi yang masuk ke file untuk satu pilihan, urut dari yang paling lama. */
export function versiTerpilih({ kontrak, versi }: PilihanUnduh): BarisVersi[] {
  const semua = daftarVersi(kontrak)
  if (versi === 'semua') return semua
  if (versi === 'terbaru') return semua.slice(-1)
  return semua.filter((v) => (v.dokumen ? versi.includes(v.dokumen.id) : v.terbaru))
}

/** Sebutan versi di file: "Terbaru (Adendum ke-5, dokumen 6)" atau "Adendum ke-2 (dokumen 3)". */
function sebutanVersi(v: BarisVersi): string {
  const dok = v.nomor > 0 ? `dokumen ${v.nomor}` : ''
  if (v.terbaru) return v.nomor > 0 ? `Terbaru (${v.label}, ${dok})` : 'Terbaru'
  return `${v.label} (${dok})`
}

const JUDUL_KONTRAK = [
  'No',
  'Versi data',
  'Nama kontrak',
  'Penyedia',
  'Nomor PKS',
  'Tanggal PKS',
  'Awal kontrak',
  'Akhir kontrak',
  'Periode',
  'Nilai kontrak',
  'Status',
  'Sisa hari',
  'Status adendum',
  'Jumlah adendum',
  'Jumlah dokumen',
  LABEL_KETENTUAN.pengakhiran,
  LABEL_KETENTUAN.denda,
  LABEL_KETENTUAN.jaminan,
  LABEL_KETENTUAN.keterangan,
  'Pengingat (3, 2, 1 bulan)',
  'Keterangan selesai',
]

function barisTerbaru(k: Kontrak, v: BarisVersi): Sel[] {
  const status = hitungStatus(k)
  return [
    sebutanVersi(v),
    k.nama,
    k.penyedia,
    k.nomorPks,
    { tanggal: k.tanggalPks },
    { tanggal: k.tanggalMulai },
    { tanggal: k.tanggalBerakhir },
    formatPeriode(k.tanggalMulai, k.tanggalBerakhir),
    { rupiah: k.nilai },
    TAMPILAN_STATUS[status].label,
    status === 'selesai' ? null : hitungSisaHari(k.tanggalBerakhir),
    STATUS_PERPANJANGAN[k.perpanjangan].label,
    v.jumlahAdendum,
    k.dokumen.length,
    k.ketentuan.pengakhiran,
    k.ketentuan.denda,
    k.ketentuan.jaminan,
    k.ketentuan.keterangan,
    status === 'selesai' ? 'Berhenti' : jadwalPengingat(k.tanggalBerakhir).map((t) => formatTanggalSingkat(t.tanggal)).join(', '),
    k.ditandaiSelesai ? k.keteranganSelesai : '',
  ]
}

/** Versi lama: data saat dokumen itu berlaku. Status dan pengingat tidak dihitung, karena versi ini sudah diganti. */
function barisLama(k: Kontrak, v: BarisVersi): Sel[] {
  const berlaku = `Berlaku ${formatTanggalSingkat(v.mulai)} sampai ${v.sampai ? formatTanggalSingkat(v.sampai) : '-'}`
  const status = `Diganti ${v.digantiOleh ?? 'versi berikutnya'}`
  const d = v.data
  if (!d) {
    return [sebutanVersi(v), k.nama, k.penyedia, k.nomorPks, null, null, null, 'Data versi ini tidak tercatat', null, status, null, null, v.jumlahAdendum, v.jumlahDokumen, '', '', '', '', berlaku, '']
  }
  return [
    sebutanVersi(v),
    d.nama,
    d.penyedia,
    d.nomorPks,
    { tanggal: d.tanggalPks },
    { tanggal: d.tanggalMulai },
    { tanggal: d.tanggalBerakhir },
    formatPeriode(d.tanggalMulai, d.tanggalBerakhir),
    { rupiah: d.nilai },
    status,
    null,
    STATUS_PERPANJANGAN[d.perpanjangan].label,
    v.jumlahAdendum,
    v.jumlahDokumen,
    d.ketentuan.pengakhiran,
    d.ketentuan.denda,
    d.ketentuan.jaminan,
    d.ketentuan.keterangan,
    berlaku,
    '',
  ]
}

function lembarKontrak(pilihan: PilihanUnduh[]): Lembar {
  const baris: Sel[][] = []
  for (const p of pilihan) {
    for (const v of versiTerpilih(p)) {
      baris.push([baris.length + 1, ...(v.terbaru ? barisTerbaru(p.kontrak, v) : barisLama(p.kontrak, v))])
    }
  }
  // Total memakai rumus, supaya tetap benar kalau atasan mengubah angka di Excel.
  // Kalau satu kontrak muncul lebih dari sekali (beberapa versi), hanya baris "Terbaru" yang dijumlah (SUMIF), supaya
  // nilai kontrak yang sama tidak terhitung dua kali. Kalau tiap kontrak hanya satu baris, semua baris dijumlah.
  const akhir = baris.length + 1
  const adaGanda = pilihan.some((p) => versiTerpilih(p).length > 1)
  const jumlahTerbaru = pilihan.filter((p) => versiTerpilih(p).some((v) => v.terbaru)).length
  const total: Sel[] = [
    null,
    { teks: adaGanda ? `Total nilai terbaru, ${jumlahTerbaru} kontrak` : `Total nilai, ${pilihan.length} kontrak`, tebal: true },
    null, null, null, null, null, null, null,
    { rumus: adaGanda ? `SUMIF(B2:B${akhir},"Terbaru*",J2:J${akhir})` : `SUM(J2:J${akhir})`, tebal: true },
  ]
  const tampilkanTotal = baris.length > 1 && (!adaGanda || jumlahTerbaru > 0)
  return {
    nama: 'Kontrak',
    baris: [JUDUL_KONTRAK, ...baris, ...(tampilkanTotal ? [total] : [])],
    lebarKolom: [5, 30, 34, 30, 22, 13, 13, 13, 14, 20, 24, 10, 24, 10, 10, 40, 40, 40, 40, 30, 30],
  }
}

function lembarDokumen(pilihan: PilihanUnduh[]): Lembar {
  const daftar = pilihan.map((p) => p.kontrak)
  const baris: Sel[][] = []
  for (const k of daftar) {
    urutkanDokumen(k.dokumen).forEach((d, i) => {
      baris.push([k.nama, k.nomorPks, i + 1, d.jenis, d.nama, { tanggal: d.tanggal }])
    })
  }
  return {
    nama: 'Dokumen',
    baris: [['Nama kontrak', 'Nomor PKS', 'No dokumen', 'Jenis', 'Nama file', 'Tanggal unggah'], ...baris],
    lebarKolom: [34, 22, 11, 12, 40, 15],
  }
}

/** File Excel rekap untuk kontrak dan versi terpilih. */
export function buatRekapExcel(pilihan: PilihanUnduh[]): Blob {
  return buatXlsx([lembarKontrak(pilihan), lembarDokumen(pilihan)])
}

/**
 * Nama file: "Rekap kontrak BBT 2026-11-20.xlsx", atau nama kontrak kalau hanya satu
 * (ditambah versinya kalau bukan terbaru, misalnya "Kontrak Jasa konsultan hukum Adendum ke-2 2026-11-23.xlsx").
 */
export function namaFileRekap(pilihan: PilihanUnduh[]): string {
  const tanggal = hariIniTeks()
  if (pilihan.length === 1) {
    const [satu] = pilihan
    const nama = satu.kontrak.nama.replace(/[\\/:*?"<>|]/g, '-').slice(0, 60)
    const versi = versiTerpilih(satu)
    const tambahan =
      versi.length > 1 ? ` ${versi.length} versi` : versi.length === 1 && !versi[0].terbaru ? ` ${versi[0].label}` : ''
    return `Kontrak ${nama}${tambahan} ${tanggal}.xlsx`
  }
  return `Rekap kontrak BBT ${tanggal}.xlsx`
}
