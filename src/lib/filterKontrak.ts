// Filter tambahan di halaman Kontrak (24 Nov 2026), di luar filter status dan kata kunci:
// status adendum, tanggal berakhir, nilai, riwayat adendum, dan kelengkapan BAST.
// Semua disimpan di alamat (?adendum=&berakhir=&dari=&sampai=&bulan=&nilai=&riwayat=&bast=), sama seperti status
// dan kata kunci, jadi bisa dibagikan dan tetap ada saat kembali dari Detail. Nilai yang tidak sah diabaikan.

import type { Kontrak, Perpanjangan } from '../types/kontrak'
import { bacaBulan, formatBulan } from './beranda'
import { formatRupiahSingkat, formatTanggalSingkat, geserTanggal, keTeksTanggal } from './format'
import { STATUS_PERPANJANGAN } from './status'

/** Pilihan cepat tanggal berakhir. "rentang" = isi tanggal sendiri (dari/sampai). */
export type PilihanBerakhir = 'h30' | 'h60' | 'h90' | 'tahun' | 'rentang'

export const LABEL_BERAKHIR: Record<PilihanBerakhir, string> = {
  h30: '30 hari ke depan',
  h60: '60 hari ke depan',
  h90: '90 hari ke depan',
  tahun: 'Tahun ini',
  rentang: 'Pilih tanggal',
}

/** Batas kelompok nilai kontrak. [ASUMSI] usulan, disesuaikan dengan nilai kontrak yang biasa di BBT. */
export const BATAS_NILAI = { kecil: 500_000_000, besar: 1_000_000_000 }

export type KelompokNilai = 'kecil' | 'sedang' | 'besar'

export const LABEL_NILAI: Record<KelompokNilai, string> = {
  kecil: `Di bawah ${formatRupiahSingkat(BATAS_NILAI.kecil)}`,
  sedang: `${formatRupiahSingkat(BATAS_NILAI.kecil)} sampai ${formatRupiahSingkat(BATAS_NILAI.besar)}`,
  besar: `Di atas ${formatRupiahSingkat(BATAS_NILAI.besar)}`,
}

export type RiwayatAdendum = 'belum' | 'sudah'

export const LABEL_RIWAYAT: Record<RiwayatAdendum, string> = {
  belum: 'Belum pernah adendum',
  sudah: 'Sudah pernah adendum',
}

export type KelengkapanBast = 'belum' | 'ada'

export const LABEL_BAST: Record<KelengkapanBast, string> = {
  belum: 'Belum ada BAST',
  ada: 'Sudah ada BAST',
}

export type FilterKontrak = {
  adendum: Perpanjangan | null
  berakhir: PilihanBerakhir | null
  /** Untuk berakhir = "rentang", YYYY-MM-DD. Boleh salah satu saja. */
  dari: string | null
  sampai: string | null
  /** YYYY-MM, dari garis waktu Beranda. */
  bulan: string | null
  nilai: KelompokNilai | null
  riwayat: RiwayatAdendum | null
  bast: KelengkapanBast | null
}

/** Nama parameter alamat yang dipakai filter ini (untuk "Hapus semua filter"). */
export const PARAMETER_FILTER = ['adendum', 'berakhir', 'dari', 'sampai', 'bulan', 'nilai', 'riwayat', 'bast'] as const

function pilihan<T extends string>(teks: string | null, sah: readonly T[]): T | null {
  return sah.includes(teks as T) ? (teks as T) : null
}

function bacaTanggal(teks: string | null): string | null {
  return teks && /^\d{4}-\d{2}-\d{2}$/.test(teks) ? teks : null
}

/** Membaca semua filter tambahan dari alamat. */
export function bacaFilterKontrak(parameter: URLSearchParams): FilterKontrak {
  return {
    adendum: pilihan(parameter.get('adendum'), Object.keys(STATUS_PERPANJANGAN) as Perpanjangan[]),
    berakhir: pilihan(parameter.get('berakhir'), Object.keys(LABEL_BERAKHIR) as PilihanBerakhir[]),
    dari: bacaTanggal(parameter.get('dari')),
    sampai: bacaTanggal(parameter.get('sampai')),
    bulan: bacaBulan(parameter.get('bulan')),
    nilai: pilihan(parameter.get('nilai'), Object.keys(LABEL_NILAI) as KelompokNilai[]),
    riwayat: pilihan(parameter.get('riwayat'), Object.keys(LABEL_RIWAYAT) as RiwayatAdendum[]),
    bast: pilihan(parameter.get('bast'), Object.keys(LABEL_BAST) as KelengkapanBast[]),
  }
}

/** Rentang tanggal berakhir (YYYY-MM-DD, keduanya termasuk) dari pilihan cepat atau isian sendiri. */
function rentangBerakhir(f: FilterKontrak, hariIni: Date): { dari: string | null; sampai: string | null } | null {
  const hari = keTeksTanggal(hariIni)
  switch (f.berakhir) {
    case 'h30':
      return { dari: hari, sampai: geserTanggal(hari, 30) }
    case 'h60':
      return { dari: hari, sampai: geserTanggal(hari, 60) }
    case 'h90':
      return { dari: hari, sampai: geserTanggal(hari, 90) }
    case 'tahun':
      return { dari: `${hariIni.getFullYear()}-01-01`, sampai: `${hariIni.getFullYear()}-12-31` }
    case 'rentang':
      return f.dari || f.sampai ? { dari: f.dari, sampai: f.sampai } : null
    default:
      return null
  }
}

function kelompokNilai(nilai: number): KelompokNilai {
  if (nilai < BATAS_NILAI.kecil) return 'kecil'
  return nilai > BATAS_NILAI.besar ? 'besar' : 'sedang'
}

/** Apakah kontrak lolos semua filter tambahan. */
export function cocokFilterKontrak(kontrak: Kontrak, f: FilterKontrak, hariIni: Date = new Date()): boolean {
  if (f.adendum && kontrak.perpanjangan !== f.adendum) return false
  if (f.bulan && !kontrak.tanggalBerakhir.startsWith(f.bulan)) return false
  const rentang = rentangBerakhir(f, hariIni)
  // Teks YYYY-MM-DD bisa dibandingkan langsung.
  if (rentang?.dari && kontrak.tanggalBerakhir < rentang.dari) return false
  if (rentang?.sampai && kontrak.tanggalBerakhir > rentang.sampai) return false
  if (f.nilai && kelompokNilai(kontrak.nilai) !== f.nilai) return false
  if (f.riwayat) {
    const pernah = kontrak.dokumen.some((d) => d.jenis === 'Adendum')
    if (pernah !== (f.riwayat === 'sudah')) return false
  }
  if (f.bast) {
    const ada = kontrak.dokumen.some((d) => d.jenis === 'BAST')
    if (ada !== (f.bast === 'ada')) return false
  }
  return true
}

export type ChipFilterAktif = {
  /** Teks chip, misalnya "Adendum: Sedang diproses". */
  label: string
  /** Parameter alamat yang dihapus saat chip ditutup. */
  parameter: string[]
}

/** Huruf pertama dibuat kecil, untuk label di tengah kalimat ("Rp" tetap). */
function hurufKecilAwal(teks: string): string {
  return teks.charAt(0).toLowerCase() + teks.slice(1)
}

/** Filter tambahan yang sedang aktif, untuk baris chip "Filter aktif". */
export function chipFilterAktif(f: FilterKontrak): ChipFilterAktif[] {
  const chip: ChipFilterAktif[] = []
  if (f.adendum) chip.push({ label: `Adendum: ${STATUS_PERPANJANGAN[f.adendum].label}`, parameter: ['adendum'] })
  if (f.bulan) chip.push({ label: `Berakhir ${formatBulan(f.bulan)}`, parameter: ['bulan'] })
  if (f.berakhir && f.berakhir !== 'rentang') {
    chip.push({ label: `Berakhir ${hurufKecilAwal(LABEL_BERAKHIR[f.berakhir])}`, parameter: ['berakhir'] })
  }
  if (f.berakhir === 'rentang' && (f.dari || f.sampai)) {
    const teks =
      f.dari && f.sampai
        ? `${formatTanggalSingkat(f.dari)} sampai ${formatTanggalSingkat(f.sampai)}`
        : f.dari
          ? `mulai ${formatTanggalSingkat(f.dari)}`
          : `sampai ${formatTanggalSingkat(f.sampai as string)}`
    chip.push({ label: `Berakhir ${teks}`, parameter: ['berakhir', 'dari', 'sampai'] })
  }
  if (f.nilai) chip.push({ label: `Nilai: ${hurufKecilAwal(LABEL_NILAI[f.nilai])}`, parameter: ['nilai'] })
  if (f.riwayat) chip.push({ label: LABEL_RIWAYAT[f.riwayat], parameter: ['riwayat'] })
  if (f.bast) chip.push({ label: LABEL_BAST[f.bast], parameter: ['bast'] })
  return chip
}
