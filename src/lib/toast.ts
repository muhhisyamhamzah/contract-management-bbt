// Jalur untuk memunculkan toast (pesan singkat di bawah tengah layar) dari halaman mana pun.
// Tampilannya ada di src/components/Toast.tsx.
//
// Cara pakai di komponen:
//   const tampilkanToast = useToast()
//   tampilkanToast('Kontrak tersimpan.')

import { createContext, useContext } from 'react'

/** Lama toast tampil sebelum hilang sendiri, dalam milidetik. */
export const DURASI_TOAST = 2800

export const KonteksToast = createContext<((pesan: string) => void) | null>(null)

export function useToast(): (pesan: string) => void {
  const tampilkanToast = useContext(KonteksToast)
  if (!tampilkanToast) {
    throw new Error('useToast harus dipakai di dalam <PenyediaToast>.')
  }
  return tampilkanToast
}
