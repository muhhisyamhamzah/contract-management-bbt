// Mozaik kavling: kotak-kotak warna BBT yang tersusun seperti peta kavling tanah, lalu memudar ke latar.
// Tampil di semua halaman (keputusan Hisyam 17 Nov 2026): menutupi sekitar 60% tinggi layar bagian atas lalu memudar,
// 40% bawah polos. Dua baris teratas berwarna, baris berikutnya sangat pudar supaya judul tetap terbaca. Murni hiasan (aria-hidden).
// Warna berpindah dari navy (kiri) ke biru, biru muda, putih, emas, lalu tanah (kanan), dan makin pucat ke bawah.
// Polanya tetap (dihitung dari posisi, bukan acak), jadi tampilannya sama setiap kali dibuka.
// Gerak (24 Nov 2026, menggantikan gelombang setiap 9 detik): kotak muncul berurutan sekali saat dibuka, lalu diam.
// Kotak hanya bergerak saat dilewati kursor, dan yang bergerak HANYA kotak di bawah kursor (meredup dan mengecil
// sebentar, lalu kembali). Tidak ada pengatur waktu dan tidak ada animasi yang berjalan selama kursor diam.
// Tetap tidak bergerak sama sekali kalau perangkat memakai mode kurangi gerak. Di HP (tanpa kursor) mozaik diam.
//
// Mozaik berada di belakang navigasi dan judul (pointer-events-none), jadi kotak tidak bisa menerima hover sendiri.
// Posisi kursor dibaca dari seluruh halaman, lalu kotak di bawahnya dicari dari ukuran grid (tanpa mengukur 160 kotak).

import { memo, useEffect, useRef, type RefObject } from 'react'

/** Gerak satu kotak saat dilewati kursor: sama dengan gelombang lama, tapi lebih singkat. */
const GERAK_KOTAK: Keyframe[] = [
  { opacity: 1, transform: 'translateY(0) scale(1)' },
  { opacity: 0.25, transform: 'translateY(6px) scale(0.9)', offset: 0.42 },
  { opacity: 1, transform: 'translateY(0) scale(1)' },
]
const DURASI_GERAK_MS = 800

/** Jarak antarkotak, harus sama dengan gap-1.5 di grid (6px). */
const JARAK_KOTAK = 6

/** Kotak di bawah titik (x, y) pada grid yang sedang terlihat, atau null kalau titik di luar kotak. */
function kotakDiTitik(grid: HTMLElement, kolom: number, x: number, y: number): Element | null {
  const kotak = grid.getBoundingClientRect()
  const langkah = (kotak.width + JARAK_KOTAK) / kolom
  const kiri = x - kotak.left
  const atas = y - kotak.top
  if (kiri < 0 || atas < 0 || kiri >= kotak.width || atas >= kotak.height) return null
  // Di sela antarkotak tidak ada yang bergerak.
  if (kiri % langkah > langkah - JARAK_KOTAK || atas % langkah > langkah - JARAK_KOTAK) return null
  const indeks = Math.floor(atas / langkah) * kolom + Math.floor(kiri / langkah)
  const el = grid.children[indeks]
  return el instanceof HTMLElement && el.dataset.kotak !== undefined ? el : null
}

/** Menggerakkan kotak yang dilewati kursor. Kotak yang sedang bergerak tidak diulang dari awal. */
function useGerakKursor(gridHp: RefObject<HTMLDivElement | null>, gridDesktop: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)')
    const berjalan = new WeakMap<Element, Animation>()
    let terakhir: Element | null = null
    let bingkai = 0
    let titik = { x: 0, y: 0 }

    const periksa = () => {
      bingkai = 0
      // Grid yang tersembunyi (display: none) tidak punya offsetParent.
      const desktop = gridDesktop.current?.offsetParent ? gridDesktop.current : null
      const grid = desktop ?? (gridHp.current?.offsetParent ? gridHp.current : null)
      const el = grid ? kotakDiTitik(grid, desktop ? KOLOM_DESKTOP : KOLOM_HP, titik.x, titik.y) : null
      if (el === terakhir) return
      terakhir = el
      if (!el || berjalan.get(el)?.playState === 'running') return
      berjalan.set(el, el.animate(GERAK_KOTAK, { duration: DURASI_GERAK_MS, easing: 'ease-in-out' }))
    }

    const gerak = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || kurangiGerak.matches) return
      titik = { x: e.clientX, y: e.clientY }
      // Paling banyak sekali per frame layar.
      if (!bingkai) bingkai = requestAnimationFrame(periksa)
    }

    window.addEventListener('pointermove', gerak, { passive: true })
    return () => {
      window.removeEventListener('pointermove', gerak)
      cancelAnimationFrame(bingkai)
    }
  }, [gridHp, gridDesktop])
}

/** Urutan warna dari kiri ke kanan. Semua dari token di src/index.css. */
const WARNA = [
  'var(--color-galaxy-900)',
  'var(--color-aksi)',
  'var(--color-mozaik-biru)',
  'white', // jeda putih di tengah, supaya biru dan emas tidak bercampur menjadi abu kusam
  'var(--color-logo-emas)',
  'var(--color-logo-tanah)',
]

const BARIS = 8
/** Varian pendek (halaman Masuk): hanya 3 baris, supaya form tetap terlihat di layar laptop. */
const BARIS_PENDEK = 3

/** Jumlah kolom: 20 di desktop, 8 di HP. Kolom ke-9 dan seterusnya disembunyikan di HP. */
const KOLOM_DESKTOP = 20
const KOLOM_HP = 8

/** Kotak yang dibiarkan kosong, supaya mozaik tidak terlihat seperti tabel. */
function kosong(x: number, y: number): boolean {
  return (x * 7 + y * 11) % 9 === 0 || (x + y * 3) % 13 === 4
}

/**
 * Batas putih minimal (persen) tiap warna di WARNA, untuk kotak yang berada di belakang teks.
 * Dengan batas ini teks-lembut (#59627D) dan tautan aksi (#2B4C9B) tetap minimal 4,6:1 di atas kotak.
 * Dihitung 18 Nov 2026: navy 88, aksi 84, biru muda 66, putih 0, emas 60, tanah 74.
 * Sebelumnya semua kotak di belakang teks dipukul rata 88%, jadi emas dan biru muda tampak terlalu pudar.
 */
const PUTIH_MINIMAL = [88, 84, 66, 0, 60, 74]

/**
 * Warna satu kotak: campuran dua warna terdekat, lalu dicampur putih makin ke bawah.
 * `barisPekat`: jumlah baris teratas yang boleh pekat karena tidak ada teks di depannya
 * (di belakang navigasi dan di sela navigasi dan judul). Baris di bawahnya memakai PUTIH_MINIMAL.
 */
function warnaKotak(x: number, y: number, kolom: number, barisPekat: number): string {
  const posisi = (x / (kolom - 1)) * (WARNA.length - 1)
  const kiri = Math.floor(posisi)
  const kanan = Math.min(WARNA.length - 1, kiri + 1)
  const porsiKiri = Math.round((1 - (posisi - kiri)) * 100)
  const acak = ((x * 7 + y * 3) % 5) * 6
  // Kotak campuran memakai batas yang lebih ketat dari dua warnanya.
  const lantai = Math.max(PUTIH_MINIMAL[kiri], porsiKiri < 100 ? PUTIH_MINIMAL[kanan] : 0)
  const pucat =
    y < barisPekat
      ? 14 + y * 8 + Math.round(acak * 0.75)
      : // Makin ke bawah makin pudar, juga untuk navy (yang batas putihnya sudah tinggi), supaya kotak
        // tidak tampak seperti kotak abu-abu yang belum termuat.
        Math.min(97, Math.max(lantai + (y - barisPekat) * 3, 70 + (y - barisPekat) * 6 + acak / 4))
  return `color-mix(in srgb, color-mix(in srgb, ${WARNA[kiri]} ${porsiKiri}%, ${WARNA[kanan]}) ${100 - pucat}%, white)`
}

type PropsKotak = { x: number; y: number; kolom: number; barisPekat: number; kelas?: string }

function Kotak({ x, y, kolom, barisPekat, kelas = '' }: PropsKotak) {
  if (kosong(x, y)) return <span className={kelas} />
  // Jeda dihitung dari posisi (diagonal), jadi kotak muncul berurutan seperti kavling yang terisi.
  const urutan = x + y * 2
  return (
    <span
      data-kotak
      className={`rounded-[10px] motion-safe:animate-meletup ${kelas}`}
      style={{ background: warnaKotak(x, y, kolom, barisPekat), animationDelay: `${urutan * 22}ms` }}
    />
  )
}

/**
 * Dibungkus memo: tidak ikut digambar ulang setiap kali pindah halaman (TataLetakWebsite ikut digambar ulang saat
 * alamat berubah). Gerak karena kursor tidak menggambar ulang komponen (langsung lewat Web Animations).
 */
const Mozaik = memo(function Mozaik({ pendek = false }: { pendek?: boolean }) {
  const baris = pendek ? BARIS_PENDEK : BARIS
  const gridHp = useRef<HTMLDivElement>(null)
  const gridDesktop = useRef<HTMLDivElement>(null)
  useGerakKursor(gridHp, gridDesktop)
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden px-1.5 [mask-image:linear-gradient(to_bottom,black,rgb(0_0_0/0.55)_45%,transparent)] ${
        // Desktop: baris berwarna diturunkan (Hisyam 18 Nov 2026) supaya terlihat utuh di bawah navigasi.
        // Caranya mozaik dimulai 52px (satu baris kurang 20px) di atas layar, bukan diberi jarak atas,
        // supaya tidak ada celah kosong di tepi atas. Judul halaman ikut turun (KepalaHalaman, Beranda).
        pendek
          ? 'h-[130px] md:h-[200px]'
          : 'h-[45vh] min-h-[280px] md:top-[-52px] md:h-[calc(60vh+52px)] md:min-h-[472px]'
      }`}
    >
      {/* HP: 8 kolom. Tiga baris pekat: baris ketiga berada di sela navigasi dan judul, tanpa teks di depannya. */}
      <div ref={gridHp} className="grid grid-cols-8 gap-1.5 md:hidden">
        {Array.from({ length: KOLOM_HP * baris }, (_, i) => (
          <Kotak key={i} x={i % KOLOM_HP} y={Math.floor(i / KOLOM_HP)} kolom={KOLOM_HP} barisPekat={pendek ? 2 : 3} kelas="aspect-square" />
        ))}
      </div>
      {/* Desktop: 20 kolom. Tiga baris pekat: di atas layar, di belakang navigasi, dan di bawah navigasi. */}
      <div ref={gridDesktop} className="hidden grid-cols-20 gap-1.5 md:grid">
        {Array.from({ length: KOLOM_DESKTOP * baris }, (_, i) => (
          <Kotak key={i} x={i % KOLOM_DESKTOP} y={Math.floor(i / KOLOM_DESKTOP)} kolom={KOLOM_DESKTOP} barisPekat={pendek ? 2 : 3} kelas="aspect-square" />
        ))}
      </div>
    </div>
  )
})

export default Mozaik
