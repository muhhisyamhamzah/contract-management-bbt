// Hook untuk panel kecil yang dibuka dari tombol (menu urutan, menu titik tiga, notifikasi, menu akun).
// Panel tertutup saat: klik di luar, tombol Escape (fokus kembali ke tombol), atau fokus keyboard keluar dari panel.

import { useEffect, useRef, useState } from 'react'

export function usePopover() {
  const [terbuka, setTerbuka] = useState(false)
  const wadah = useRef<HTMLDivElement>(null)
  const tombol = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!terbuka) return

    function saatKlik(event: PointerEvent) {
      if (!wadah.current?.contains(event.target as Node)) setTerbuka(false)
    }
    function saatTombolKeyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setTerbuka(false)
        tombol.current?.focus()
      }
    }
    function saatFokusPindah(event: FocusEvent) {
      if (event.target instanceof Node && !wadah.current?.contains(event.target)) setTerbuka(false)
    }

    document.addEventListener('pointerdown', saatKlik)
    document.addEventListener('keydown', saatTombolKeyboard)
    document.addEventListener('focusin', saatFokusPindah)
    return () => {
      document.removeEventListener('pointerdown', saatKlik)
      document.removeEventListener('keydown', saatTombolKeyboard)
      document.removeEventListener('focusin', saatFokusPindah)
    }
  }, [terbuka])

  return { terbuka, setTerbuka, wadah, tombol }
}
