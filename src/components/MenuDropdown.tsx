// Tombol yang membuka menu kecil di bawahnya. Dipakai untuk:
// - dropdown urutan di halaman Kontrak ("Paling cepat habis", dll)
// - menu titik tiga di Detail kontrak (Edit, Unduh, Hapus)
//
// Menu tertutup saat: salah satu pilihan diklik, klik di luar menu, atau tombol Escape.

import { useEffect, useRef, useState, type ReactNode } from 'react'

export type ItemMenu = {
  label: string
  onPilih: () => void
  /** Pilihan yang sedang aktif: diberi latar ungu muda dan tanda centang. */
  terpilih?: boolean
  /** Aksi berbahaya (misalnya Hapus): teks merah tebal. */
  bahaya?: boolean
}

type Props = {
  /** Isi tombol pembuka (ikon dan/atau teks). */
  isiTombol: ReactNode
  /** Class tombol pembuka (ukuran, warna). */
  kelasTombol: string
  /** Wajib kalau tombol hanya berisi ikon, misalnya "Menu lainnya". */
  labelTombol?: string
  /** Judul kecil di atas pilihan, misalnya "Urutkan berdasarkan". */
  judul?: string
  item: ItemMenu[]
  /** Lebar menu dalam piksel. */
  lebar?: number
  /** Bayangan lebih pekat, untuk menu di atas header gelap. */
  bayanganTebal?: boolean
}

function MenuDropdown({
  isiTombol,
  kelasTombol,
  labelTombol,
  judul,
  item,
  lebar = 230,
  bayanganTebal = false,
}: Props) {
  const [terbuka, setTerbuka] = useState(false)
  const wadah = useRef<HTMLDivElement>(null)
  const tombol = useRef<HTMLButtonElement>(null)

  // Saat menu terbuka: tutup kalau klik di luar atau menekan Escape.
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

    document.addEventListener('pointerdown', saatKlik)
    document.addEventListener('keydown', saatTombolKeyboard)
    return () => {
      document.removeEventListener('pointerdown', saatKlik)
      document.removeEventListener('keydown', saatTombolKeyboard)
    }
  }, [terbuka])

  function pilih(itemMenu: ItemMenu) {
    setTerbuka(false)
    itemMenu.onPilih()
  }

  return (
    <div ref={wadah} className="relative">
      <button
        ref={tombol}
        type="button"
        aria-label={labelTombol}
        aria-haspopup="menu"
        aria-expanded={terbuka}
        onClick={() => setTerbuka(!terbuka)}
        className={kelasTombol}
      >
        {isiTombol}
      </button>

      {terbuka && (
        <div
          role="menu"
          style={{ width: lebar }}
          // Menu muncul 6px di bawah tombol, rata kanan dengan tombol.
          className={`absolute top-[calc(100%+6px)] right-0 z-20 flex flex-col rounded-2xl border border-garis bg-white p-1.5 ${
            bayanganTebal ? 'shadow-menu-tebal' : 'shadow-menu'
          }`}
        >
          {judul && (
            <span className="px-3 pt-2 pb-1 text-[12px] font-semibold text-teks-lembut">
              {judul}
            </span>
          )}

          {item.map((itemMenu) => (
            <button
              key={itemMenu.label}
              type="button"
              // Pilihan yang bisa "terpilih" (misalnya urutan) diumumkan sebagai pilihan bercentang.
              role={itemMenu.terpilih === undefined ? 'menuitem' : 'menuitemradio'}
              aria-checked={itemMenu.terpilih}
              onClick={() => pilih(itemMenu)}
              className={`flex h-11 cursor-pointer items-center justify-between rounded-xl border-none px-3 text-left ${
                itemMenu.terpilih
                  ? 'bg-lembut font-bold text-judul'
                  : itemMenu.bahaya
                    ? 'bg-white font-bold text-hapus-teks'
                    : 'bg-white text-teks'
              }`}
            >
              {itemMenu.label}
              {itemMenu.terpilih && (
                <span aria-hidden="true" className="font-extrabold text-aksi">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MenuDropdown
