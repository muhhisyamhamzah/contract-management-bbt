// Data contoh untuk halaman Detail: termin pembayaran, dokumen, dan riwayat.
// Dihitung dari kontraknya supaya masuk akal (misalnya kontrak selesai sudah lunas semua),
// dan tanggalnya mengikuti tanggal mulai kontrak. Nanti diganti data dari backend.

import { geserTanggal } from '../lib/format'
import { hitungProgres, hitungStatus } from '../lib/status'
import type { Dokumen, KejadianRiwayat, Kontrak, Termin } from '../types/kontrak'

/** Persen tiap termin, sama dengan referensi (30% + 37% + 33%). */
const PERSEN_TERMIN = [30, 37, 33]

/** Nama sementara admin, sama dengan referensi. */
const ADMIN = '[Nama admin]'

/** Berapa termin yang sudah lunas, menurut status dan progres kontrak. */
function jumlahLunas(kontrak: Kontrak): number {
  const status = hitungStatus(kontrak)
  if (status === 'selesai') return PERSEN_TERMIN.length
  if (status === 'berjalan' && hitungProgres(kontrak) < 50) return 1
  return 2
}

/** Tanggal termin ke-n (mulai dari 1) ditandai lunas: 60 hari setelah mulai, lalu tiap 110 hari. */
function tanggalLunas(kontrak: Kontrak, ke: number): string {
  return geserTanggal(kontrak.tanggalMulai, 60 + (ke - 1) * 110)
}

export function terminContoh(kontrak: Kontrak): Termin[] {
  const lunas = jumlahLunas(kontrak)
  return PERSEN_TERMIN.map((persen, i) => ({ ke: i + 1, persen, lunas: i < lunas }))
}

export function dokumenContoh(kontrak: Kontrak): Dokumen[] {
  const dokumen: Dokumen[] = [{ nama: 'Kontrak utama.pdf', ukuran: '2,4 MB', tanggal: kontrak.tanggalMulai }]
  for (const termin of terminContoh(kontrak)) {
    if (termin.lunas) {
      dokumen.push({
        nama: `Berita acara termin ${termin.ke}.pdf`,
        ukuran: '540 KB',
        tanggal: tanggalLunas(kontrak, termin.ke),
      })
    }
  }
  return dokumen
}

/** Riwayat dari yang terbaru ke yang terlama. */
export function riwayatContoh(kontrak: Kontrak): KejadianRiwayat[] {
  const riwayat: KejadianRiwayat[] = []

  if (kontrak.ditandaiSelesai) {
    riwayat.push({ judul: 'Kontrak ditandai selesai', oleh: ADMIN, tanggal: kontrak.tanggalBerakhir, jenis: 'selesai' })
  }

  const lunas = terminContoh(kontrak).filter((termin) => termin.lunas).reverse()
  for (const termin of lunas) {
    riwayat.push({
      judul: `Termin ${termin.ke} ditandai lunas`,
      oleh: ADMIN,
      tanggal: tanggalLunas(kontrak, termin.ke),
      jenis: 'lunas',
    })
  }

  riwayat.push({ judul: 'Kontrak dicatat', oleh: ADMIN, tanggal: kontrak.tanggalMulai, jenis: 'dicatat' })
  return riwayat
}
