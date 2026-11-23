// Menyusun daftar notifikasi (panel lonceng) dari jadwal pengingat kontrak.
// Belum ada backend: notifikasi dihitung dari data, bukan dikirim server.

import type { Kontrak, Notifikasi } from '../types/kontrak'
import { formatTanggal } from './format'
import { hitungSisaHari, hitungStatus, jadwalPengingat } from './status'

/** Berapa hari ke belakang notifikasi masih ditampilkan di panel. */
const BATAS_HARI_NOTIFIKASI = 120

/** Semua notifikasi yang sudah "terkirim" (tanggalnya hari ini atau sebelumnya), dari yang terbaru. */
export function susunNotifikasi(daftar: Kontrak[], hariIni: Date = new Date()): Notifikasi[] {
  const hasil: Notifikasi[] = []

  // Satu notifikasi per kontrak, yaitu tahap terbaru (18 Nov 2026). Pengingat 3 bulan sudah tidak berarti
  // kalau pengingat 1 bulan sudah keluar, jadi tidak ikut ditumpuk. Angka di lonceng pun sama dengan
  // jumlah kontrak yang perlu diurus, bukan jumlah semua pengingat yang pernah dikirim.
  // Id tetap per tahap, jadi tahap baru muncul lagi sebagai "belum dibaca".
  for (const kontrak of daftar) {
    if (hitungStatus(kontrak, hariIni) === 'selesai') continue

    // Kontrak yang sudah lewat tapi belum ditutup.
    if (hitungSisaHari(kontrak.tanggalBerakhir, hariIni) < 0) {
      hasil.push({
        id: `${kontrak.id}-lewat-${kontrak.tanggalBerakhir}`,
        judul: 'Kontrak sudah lewat',
        isi: `"${kontrak.nama}" belum diperpanjang atau ditandai selesai.`,
        tanggal: kontrak.tanggalBerakhir,
        kontrakId: kontrak.id,
        jenis: 'lewat',
      })
      continue
    }

    // Pengingat bertahap 3, 2, 1 bulan sebelum habis: ambil tahap terakhir yang sudah terkirim.
    const terbaru = jadwalPengingat(kontrak.tanggalBerakhir, hariIni)
      .filter((tahap) => tahap.terkirim)
      .at(-1)
    if (terbaru) {
      hasil.push({
        // Tanggal akhir ikut di id: setelah adendum, pengingat jadwal baru dihitung sebagai notifikasi baru.
        id: `${kontrak.id}-tahap-${terbaru.bulan}-${kontrak.tanggalBerakhir}`,
        judul: `Pengingat ${terbaru.bulan} bulan`,
        isi: `"${kontrak.nama}" habis ${formatTanggal(kontrak.tanggalBerakhir)}.`,
        tanggal: terbaru.tanggal,
        kontrakId: kontrak.id,
        jenis: 'pengingat',
      })
    }
  }

  return hasil
    .filter((n) => hitungSisaHari(n.tanggal, hariIni) >= -BATAS_HARI_NOTIFIKASI)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}
