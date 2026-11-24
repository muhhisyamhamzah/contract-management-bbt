// Daftar kartu Agenda kontrak di Beranda (24 Nov 2026): tingginya dibatasi 2 baris kartu (6 kartu di desktop,
// 3 kolom), sisanya di-scroll di dalam kotaknya sendiri, jadi Agenda tidak memanjangkan halaman.
// Kartu yang belum terlihat muncul dari bawah (memudar + naik) saat di-scroll masuk ke kotak. Tanpa library:
// IntersectionObserver + transisi CSS. Mode kurangi gerak: kartu langsung tampil tanpa gerak.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Kontrak } from '../types/kontrak'
import KartuKontrak from './KartuKontrak'

/** Jumlah baris kartu yang terlihat sebelum perlu scroll. */
const BARIS_TERLIHAT = 2

type Props = {
  daftar: Kontrak[]
}

/**
 * Tinggi dari atas daftar sampai dasar baris ke-BARIS_TERLIHAT. null = tidak perlu dibatasi.
 * Daftar diberi `relative`, jadi offsetTop kartu dihitung dari atas daftar.
 */
function hitungTinggi(daftar: HTMLElement): number | null {
  const item = Array.from(daftar.children) as HTMLElement[]
  const atasBaris = [...new Set(item.map((el) => el.offsetTop))].sort((a, b) => a - b)
  if (atasBaris.length <= BARIS_TERLIHAT) return null
  const batas = atasBaris[BARIS_TERLIHAT - 1]
  return Math.max(...item.filter((el) => el.offsetTop <= batas).map((el) => el.offsetTop + el.offsetHeight))
}

function DaftarAgenda({ daftar }: Props) {
  const ref = useRef<HTMLUListElement>(null)
  const [tinggi, setTinggi] = useState<number | null>(null)
  const [sisa, setSisa] = useState(0)

  // Mengukur ulang saat lebar berubah (jumlah kolom 1/2/3 ikut berubah).
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ukur = () => {
      // Ukur tanpa batas dulu, supaya posisi semua kartu terbaca.
      el.style.maxHeight = ''
      const baru = hitungTinggi(el)
      setTinggi(baru)
      setSisa(baru === null ? 0 : Array.from(el.children).filter((c) => (c as HTMLElement).offsetTop >= baru).length)
      if (baru !== null) el.style.maxHeight = `${baru}px`
    }
    ukur()
    // Hanya lebar yang dipantau: tinggi daftar berubah karena batas ini sendiri, jangan sampai mengukur berulang.
    let lebar = el.clientWidth
    const pengamat = new ResizeObserver(() => {
      if (el.clientWidth === lebar) return
      lebar = el.clientWidth
      ukur()
    })
    pengamat.observe(el)
    return () => pengamat.disconnect()
  }, [daftar])

  // Kartu di bawah batas disembunyikan dulu, lalu muncul dari bawah saat masuk ke kotak.
  useEffect(() => {
    const el = ref.current
    if (!el || tinggi === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const item = Array.from(el.children) as HTMLElement[]
    for (const kartu of item) {
      if (kartu.offsetTop >= tinggi) kartu.dataset.muncul = 'belum'
    }
    const pengamat = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          if (!e.isIntersecting) continue
          ;(e.target as HTMLElement).dataset.muncul = 'sudah'
          pengamat.unobserve(e.target)
        }
      },
      { root: el, threshold: 0.15 },
    )
    item.filter((k) => k.dataset.muncul === 'belum').forEach((k) => pengamat.observe(k))
    return () => pengamat.disconnect()
  }, [tinggi, daftar])

  return (
    <div className="flex flex-col gap-2">
      <ul
        ref={ref}
        id="daftar-agenda"
        aria-label={`${daftar.length} kontrak di agenda`}
        className={`relative m-0 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3 ${
          tinggi !== null ? 'overflow-y-auto pr-1' : ''
        }`}
      >
        {daftar.map((k) => (
          <li
            key={k.id}
            className="transition-[opacity,transform] duration-500 ease-out data-[muncul=belum]:translate-y-6 data-[muncul=belum]:opacity-0 motion-reduce:transition-none"
          >
            <KartuKontrak kontrak={k} />
          </li>
        ))}
      </ul>
      {sisa > 0 && (
        <p className="m-0 text-center text-[13px] text-teks-lembut">
          Scroll di dalam kotak untuk melihat {sisa} kontrak lainnya
        </p>
      )}
    </div>
  )
}

export default DaftarAgenda
