// Judul tab browser per halaman (impeccable harden, 19 Nov 2026; WCAG 2.4.2 "Page Titled").
// Sebelumnya semua halaman berjudul sama, jadi pengguna dengan banyak tab dan pengguna pembaca layar
// tidak tahu halaman mana yang terbuka. Pola: "Nama halaman | Contract Management BBT".

import { useEffect } from 'react'

/** Nama aplikasi di judul tab. [TERBUKA] nama resmi aplikasi masih menunggu atasan. */
export const NAMA_APLIKASI = 'Contract Management BBT'

/** Mengatur judul tab selama halaman ini terbuka. Panggil sebelum `return` lebih awal di halaman. */
export function useJudulHalaman(judul?: string) {
  useEffect(() => {
    document.title = judul ? `${judul} | ${NAMA_APLIKASI}` : NAMA_APLIKASI
  }, [judul])
}
