// Isi file Excel rekap kontrak (permintaan atasan, 20 Nov 2026). Format file ada di src/lib/excel.ts.
// Lembar "Kontrak": satu baris per kontrak + baris total nilai. Lembar "Dokumen": semua dokumen tiap kontrak.
// [ASUMSI] Susunan kolom sementara; diganti mengikuti template Excel atasan kalau sudah ada.

import type { Kontrak } from '../types/kontrak'
import { urutkanDokumen } from './daftarKontrak'
import { formatPeriode, formatTanggalSingkat, hariIniTeks } from './format'
import { buatXlsx, type Lembar, type Sel } from './excel'
import { hitungSisaHari, hitungStatus, jadwalPengingat, LABEL_KETENTUAN, STATUS_PERPANJANGAN, TAMPILAN_STATUS } from './status'

const JUDUL_KONTRAK = [
  'No',
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

function lembarKontrak(daftar: Kontrak[]): Lembar {
  const baris: Sel[][] = daftar.map((k, i) => {
    const status = hitungStatus(k)
    return [
      i + 1,
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
      k.dokumen.filter((d) => d.jenis === 'Adendum').length,
      k.dokumen.length,
      k.ketentuan.pengakhiran,
      k.ketentuan.denda,
      k.ketentuan.jaminan,
      k.ketentuan.keterangan,
      status === 'selesai' ? 'Berhenti' : jadwalPengingat(k.tanggalBerakhir).map((t) => formatTanggalSingkat(t.tanggal)).join(', '),
      k.ditandaiSelesai ? k.keteranganSelesai : '',
    ]
  })
  // Baris total memakai rumus SUM, supaya tetap benar kalau atasan mengubah angka di Excel.
  const akhir = daftar.length + 1
  const total: Sel[] = [null, { teks: `Total ${daftar.length} kontrak`, tebal: true }, null, null, null, null, null, null, { rumus: `SUM(I2:I${akhir})`, tebal: true }]
  return {
    nama: 'Kontrak',
    baris: [JUDUL_KONTRAK, ...baris, ...(daftar.length > 1 ? [total] : [])],
    lebarKolom: [5, 34, 30, 22, 13, 13, 13, 14, 20, 14, 10, 24, 10, 10, 40, 40, 40, 40, 30, 30],
  }
}

function lembarDokumen(daftar: Kontrak[]): Lembar {
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

/** File Excel rekap untuk kontrak terpilih. */
export function buatRekapExcel(daftar: Kontrak[]): Blob {
  return buatXlsx([lembarKontrak(daftar), lembarDokumen(daftar)])
}

/** Nama file: "Rekap kontrak BBT 2026-11-20.xlsx", atau nama kontrak kalau hanya satu. */
export function namaFileRekap(daftar: Kontrak[]): string {
  const tanggal = hariIniTeks()
  if (daftar.length === 1) {
    const nama = daftar[0].nama.replace(/[\\/:*?"<>|]/g, '-').slice(0, 60)
    return `Kontrak ${nama} ${tanggal}.xlsx`
  }
  return `Rekap kontrak BBT ${tanggal}.xlsx`
}
