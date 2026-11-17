// Mozaik kavling: kotak-kotak warna BBT yang tersusun seperti peta kavling tanah, lalu memudar ke latar.
// Tampil di semua halaman (keputusan Hisyam 17 Nov 2026): menutupi sekitar 60% tinggi layar bagian atas lalu memudar,
// 40% bawah polos. Dua baris teratas berwarna, baris berikutnya sangat pudar supaya judul tetap terbaca. Murni hiasan (aria-hidden).
// Warna berpindah dari navy (kiri) ke biru, biru muda, putih, emas, lalu tanah (kanan), dan makin pucat ke bawah.
// Polanya tetap (dihitung dari posisi, bukan acak), jadi tampilannya sama setiap kali dibuka.

import { memo } from 'react'

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

/** Warna satu kotak: campuran dua warna terdekat, lalu dicampur putih makin ke bawah. */
function warnaKotak(x: number, y: number, kolom: number): string {
  const posisi = (x / (kolom - 1)) * (WARNA.length - 1)
  const kiri = Math.floor(posisi)
  const kanan = Math.min(WARNA.length - 1, kiri + 1)
  const porsiKiri = Math.round((1 - (posisi - kiri)) * 100)
  // Dua baris teratas boleh pekat; mulai baris ketiga (di belakang judul halaman) sangat pudar.
  const acak = ((x * 7 + y * 3) % 5) * 6
  // Minimal 88% putih: teks-lembut (#59627D) di atas kotak navy 88% putih masih 4,80:1 (lolos 4,5:1); warna lain 5,0–5,6:1.
  const pucat = y < 2 ? 30 + y * 14 + acak : Math.min(96, 88 + (y - 2) * 2 + acak / 4)
  return `color-mix(in srgb, color-mix(in srgb, ${WARNA[kiri]} ${porsiKiri}%, ${WARNA[kanan]}) ${100 - pucat}%, white)`
}

function Kotak({ x, y, kolom, kelas = '' }: { x: number; y: number; kolom: number; kelas?: string }) {
  if (kosong(x, y)) return <span className={kelas} />
  // Satu-satunya momen gerak di website (Fase 4): kotak muncul berurutan dari kiri atas, seperti kavling yang terisi.
  // Hanya sekali saat halaman dibuka, dan tidak berjalan kalau pengguna memilih kurangi gerak.
  return (
    <span
      className={`rounded-[10px] motion-safe:animate-meletup ${kelas}`}
      style={{ background: warnaKotak(x, y, kolom), animationDelay: `${(x + y * 2) * 22}ms` }}
    />
  )
}

/**
 * Dibungkus memo: isinya tidak pernah berubah, jadi tidak perlu dihitung ulang setiap kali pindah halaman
 * (TataLetakWebsite ikut digambar ulang saat alamat berubah).
 */
const Mozaik = memo(function Mozaik({ pendek = false }: { pendek?: boolean }) {
  const baris = pendek ? BARIS_PENDEK : BARIS
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden px-1.5 [mask-image:linear-gradient(to_bottom,black,rgb(0_0_0/0.55)_45%,transparent)] ${
        pendek ? 'h-[130px] md:h-[200px]' : 'h-[45vh] min-h-[280px] md:h-[60vh] md:min-h-[420px]'
      }`}
    >
      {/* HP: 8 kolom */}
      <div className="grid grid-cols-8 gap-1.5 md:hidden">
        {Array.from({ length: KOLOM_HP * baris }, (_, i) => (
          <Kotak key={i} x={i % KOLOM_HP} y={Math.floor(i / KOLOM_HP)} kolom={KOLOM_HP} kelas="aspect-square" />
        ))}
      </div>
      {/* Desktop: 20 kolom */}
      <div className="hidden grid-cols-20 gap-1.5 md:grid">
        {Array.from({ length: KOLOM_DESKTOP * baris }, (_, i) => (
          <Kotak key={i} x={i % KOLOM_DESKTOP} y={Math.floor(i / KOLOM_DESKTOP)} kolom={KOLOM_DESKTOP} kelas="aspect-square" />
        ))}
      </div>
    </div>
  )
})

export default Mozaik
