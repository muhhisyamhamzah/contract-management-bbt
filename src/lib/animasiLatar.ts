// Pilihan "Animasi latar" (mozaik bergerak) milik satu pengguna, disimpan di browser (localStorage).
// Mozaik bergerak terus atas permintaan Hisyam (18 Nov 2026). Supaya tetap memenuhi WCAG 2.2.2
// (gerak otomatis harus bisa dihentikan), pengguna bisa mematikannya dari menu akun.
// Kalau perangkat memakai mode kurangi gerak, mozaik tetap diam apa pun pilihannya (motion-safe: di Mozaik).

import { useSyncExternalStore } from 'react'

const KUNCI = 'cm-bbt-animasi-latar'
const pendengar = new Set<() => void>()

function baca(): boolean {
  try {
    return localStorage.getItem(KUNCI) !== 'mati'
  } catch {
    return true
  }
}

let nyala = baca()

function langgan(panggil: () => void) {
  pendengar.add(panggil)
  return () => pendengar.delete(panggil)
}

export function aturAnimasiLatar(nilai: boolean) {
  nyala = nilai
  try {
    localStorage.setItem(KUNCI, nilai ? 'nyala' : 'mati')
  } catch {
    // Penyimpanan browser tidak tersedia: pilihan tetap berlaku sampai halaman dimuat ulang.
  }
  for (const panggil of pendengar) panggil()
}

/** true kalau mozaik boleh bergerak. */
export function useAnimasiLatar(): boolean {
  return useSyncExternalStore(langgan, () => nyala)
}
