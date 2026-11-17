// Penyedia toast: menyimpan pesan yang sedang tampil dan menggambarnya di bawah tengah layar.
// Dipasang sekali di main.tsx. Halaman memunculkan toast lewat useToast() (src/lib/toast.ts).

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { DURASI_TOAST, KonteksToast } from '../lib/toast'

type Props = {
  children: ReactNode
}

function PenyediaToast({ children }: Props) {
  const [pesan, setPesan] = useState('')
  const pengaturWaktu = useRef<number | undefined>(undefined)

  const tampilkanToast = useCallback((teks: string) => {
    setPesan(teks)
    // Kalau ada toast baru sebelum yang lama hilang, hitungan waktunya diulang.
    window.clearTimeout(pengaturWaktu.current)
    pengaturWaktu.current = window.setTimeout(() => setPesan(''), DURASI_TOAST)
  }, [])

  // Bersihkan pengatur waktu saat komponen dilepas.
  useEffect(() => () => window.clearTimeout(pengaturWaktu.current), [])

  return (
    <KonteksToast.Provider value={tampilkanToast}>
      {children}

      {/*
        Elemen ini selalu ada (hanya disembunyikan saat kosong), supaya pembaca layar
        tetap membacakan pesan baru yang muncul.
      */}
      <div
        role="status"
        className={
          pesan
            ? 'fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-50 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-2xl bg-judul px-5 py-3.5 text-center font-semibold text-white shadow-toast'
            : 'sr-only'
        }
      >
        {pesan}
      </div>
    </KonteksToast.Provider>
  )
}

export default PenyediaToast
