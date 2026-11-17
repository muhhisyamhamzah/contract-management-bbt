// Menyusun daftar notifikasi (panel lonceng) dari jadwal pengingat kontrak dan critical point.
// Belum ada backend: notifikasi dihitung dari data, bukan dikirim server.

import type { Kontrak, Notifikasi } from '../types/kontrak'
import { formatTanggal } from './format'
import { hitungSisaHari, hitungStatus, jadwalPengingat, LABEL_CRITICAL_POINT } from './status'

/** Berapa hari ke belakang notifikasi masih ditampilkan di panel. */
const BATAS_HARI_NOTIFIKASI = 120

/** Semua notifikasi yang sudah "terkirim" (tanggalnya hari ini atau sebelumnya), dari yang terbaru. */
export function susunNotifikasi(daftar: Kontrak[], hariIni: Date = new Date()): Notifikasi[] {
  const hasil: Notifikasi[] = []

  for (const kontrak of daftar) {
    if (hitungStatus(kontrak, hariIni) === 'selesai') continue

    // Pengingat bertahap 3, 2, 1 bulan sebelum habis.
    for (const tahap of jadwalPengingat(kontrak.tanggalBerakhir, hariIni)) {
      if (!tahap.terkirim) continue
      hasil.push({
        id: `${kontrak.id}-tahap-${tahap.bulan}`,
        judul: `Pengingat ${tahap.bulan} bulan`,
        isi: `"${kontrak.nama}" habis ${formatTanggal(kontrak.tanggalBerakhir)}.`,
        tanggal: tahap.tanggal,
        kontrakId: kontrak.id,
        jenis: 'pengingat',
      })
    }

    // Kontrak yang sudah lewat tapi belum ditutup.
    if (hitungSisaHari(kontrak.tanggalBerakhir, hariIni) < 0) {
      hasil.push({
        id: `${kontrak.id}-lewat`,
        judul: 'Kontrak sudah lewat',
        isi: `"${kontrak.nama}" belum diperpanjang atau ditandai selesai.`,
        tanggal: kontrak.tanggalBerakhir,
        kontrakId: kontrak.id,
        jenis: 'lewat',
      })
    }

    // Critical point yang punya tanggal penting: jadwalnya sama dengan kontrak.
    for (const butir of kontrak.criticalPoint) {
      if (butir.status === 'selesai' || !butir.tanggalPenting) continue
      for (const tahap of jadwalPengingat(butir.tanggalPenting, hariIni)) {
        if (!tahap.terkirim) continue
        hasil.push({
          id: `${butir.id}-tahap-${tahap.bulan}`,
          judul: `Critical point: ${LABEL_CRITICAL_POINT[butir.jenis]}`,
          isi: `${butir.pasal} "${kontrak.nama}" jatuh pada ${formatTanggal(butir.tanggalPenting)}.`,
          tanggal: tahap.tanggal,
          kontrakId: kontrak.id,
          jenis: 'critical',
        })
      }
    }
  }

  return hasil
    .filter((n) => hitungSisaHari(n.tanggal, hariIni) >= -BATAS_HARI_NOTIFIKASI)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}
