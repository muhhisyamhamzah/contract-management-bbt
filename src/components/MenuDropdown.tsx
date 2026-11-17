// Tombol yang membuka panel pilihan kecil di bawahnya. Dipakai untuk:
// - pilihan urutan di halaman Kontrak ("Paling cepat habis", dll)
// - menu titik tiga di Detail kontrak dan daftar akun
//
// Polanya "disclosure" (tombol + daftar tombol biasa), bukan role="menu", supaya tombol Tab
// dan pembaca layar bekerja seperti biasa (lihat docs/ui-audit.md temuan 8).
// Panel tertutup saat pilihan diklik, klik di luar, Escape, atau fokus keluar.

import { useId, type ReactNode } from 'react'
import { usePopover } from '../lib/popover'

export type ItemMenu = {
  label: string
  onPilih: () => void
  /** Pilihan yang sedang aktif: diberi latar biru muda dan tanda centang. */
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
  /** Lebar panel dalam piksel. */
  lebar?: number
}

function MenuDropdown({ isiTombol, kelasTombol, labelTombol, judul, item, lebar = 230 }: Props) {
  const { terbuka, setTerbuka, wadah, tombol } = usePopover()
  const id = useId()

  function pilih(itemMenu: ItemMenu) {
    setTerbuka(false)
    tombol.current?.focus()
    itemMenu.onPilih()
  }

  return (
    <div ref={wadah} className="relative">
      <button
        ref={tombol}
        type="button"
        aria-label={labelTombol}
        aria-expanded={terbuka}
        aria-controls={id}
        onClick={() => setTerbuka(!terbuka)}
        className={kelasTombol}
      >
        {isiTombol}
      </button>

      {terbuka && (
        <div
          id={id}
          style={{ width: lebar }}
          // Panel muncul 6px di bawah tombol, rata kanan dengan tombol.
          className="absolute top-[calc(100%+6px)] right-0 z-30 flex flex-col rounded-2xl border border-garis bg-white p-1.5 text-teks shadow-menu"
        >
          {judul && <span className="px-3 pt-2 pb-1 text-[12px] font-semibold text-teks-lembut">{judul}</span>}

          {item.map((itemMenu) => (
            <button
              key={itemMenu.label}
              type="button"
              aria-pressed={itemMenu.terpilih}
              onClick={() => pilih(itemMenu)}
              className={`flex h-11 cursor-pointer items-center justify-between rounded-xl border-none px-3 text-left hover:bg-latar ${
                itemMenu.terpilih
                  ? 'bg-lembut font-bold text-judul hover:bg-lembut'
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
