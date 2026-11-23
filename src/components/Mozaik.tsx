// Mozaik kavling: kotak-kotak warna BBT yang tersusun seperti peta kavling tanah, lalu memudar ke latar.
// Tampil di semua halaman (keputusan Hisyam 17 Nov 2026): menutupi sekitar 60% tinggi layar bagian atas lalu memudar,
// 40% bawah polos. Dua baris teratas berwarna, baris berikutnya sangat pudar supaya judul tetap terbaca. Murni hiasan (aria-hidden).
// Warna berpindah dari navy (kiri) ke biru, biru muda, putih, emas, lalu tanah (kanan), dan makin pucat ke bawah.
// Polanya tetap (dihitung dari posisi, bukan acak), jadi tampilannya sama setiap kali dibuka.
// Gerak (Hisyam 18 Nov 2026): kotak muncul berurutan saat dibuka, lalu setiap 9 detik ada "gelombang" yang
// mengulang efek itu dari kiri atas ke kanan bawah.
// Gelombang berjalan terus di SEMUA halaman, termasuk Masuk, tanpa sakelar (Hisyam 23 Nov 2026; sakelar
// "Animasi latar" di menu akun dihapus). Tetap tidak bergerak sama sekali kalau perangkat memakai mode kurangi gerak.
//
// Optimasi (19 Nov 2026, impeccable optimize): gelombang dipicu pengatur waktu, sekali jalan, hanya 5 baris teratas.
// Di antara gelombang tidak ada animasi yang berjalan, dan pengatur waktu berhenti saat tab tidak dilihat.
// Sebelumnya: animasi 9 detik tanpa henti di 160 kotak, sekitar 10% kerja browser terus-menerus.

import { memo, useEffect, useState } from 'react'

/** Jarak antargelombang, dan jeda sebelum gelombang pertama. */
const SELANG_GELOMBANG_MS = 9000
const GELOMBANG_PERTAMA_MS = 4000

/** Hanya baris teratas yang ikut bergelombang; baris di bawahnya hampir putih, geraknya tidak terlihat. */
const BARIS_BERGERAK = 5

/**
 * Nomor gelombang yang sedang berjalan: 0 = baru muncul (belum ada gelombang), 1, 2, 3, ...
 * Bertambah setiap SELANG_GELOMBANG_MS selama tab sedang dilihat dan perangkat tidak memakai mode kurangi gerak.
 */
function useGelombang(): number {
  const [putaran, setPutaran] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let selang: number | undefined
    const picu = () => {
      if (!document.hidden) setPutaran((n) => n + 1)
    }
    const awal = window.setTimeout(() => {
      picu()
      selang = window.setInterval(picu, SELANG_GELOMBANG_MS)
    }, GELOMBANG_PERTAMA_MS)
    return () => {
      window.clearTimeout(awal)
      window.clearInterval(selang)
    }
  }, [])
  return putaran
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

type PropsKotak = { x: number; y: number; kolom: number; barisPekat: number; putaran: number; kelas?: string }

/** Class animasi satu kotak. Ditulis lengkap supaya Tailwind menemukannya. */
function kelasAnimasi(putaran: number, y: number): string {
  // Sebelum gelombang pertama, dan untuk baris bawah: hanya efek muncul (sekali, lalu selesai).
  if (putaran === 0 || y >= BARIS_BERGERAK) return 'motion-safe:animate-meletup'
  // Nama a dan b bergantian: berganti nama membuat browser memutar ulang animasinya.
  return putaran % 2 === 1 ? 'motion-safe:animate-gelombang-a' : 'motion-safe:animate-gelombang-b'
}

function Kotak({ x, y, kolom, barisPekat, putaran, kelas = '' }: PropsKotak) {
  if (kosong(x, y)) return <span className={kelas} />
  // Jeda dihitung dari posisi (diagonal), jadi kotak bergerak berurutan seperti kavling yang terisi.
  const urutan = x + y * 2
  const gelombang = putaran > 0 && y < BARIS_BERGERAK
  return (
    <span
      className={`rounded-[10px] ${kelasAnimasi(putaran, y)} ${kelas}`}
      style={{
        background: warnaKotak(x, y, kolom, barisPekat),
        animationDelay: `${urutan * (gelombang ? 45 : 22)}ms`,
      }}
    />
  )
}

/**
 * Dibungkus memo: tidak ikut digambar ulang setiap kali pindah halaman (TataLetakWebsite ikut digambar ulang saat
 * alamat berubah). Mozaik hanya digambar ulang saat gelombang baru dipicu (setiap 9 detik).
 */
const Mozaik = memo(function Mozaik({ pendek = false }: { pendek?: boolean }) {
  const baris = pendek ? BARIS_PENDEK : BARIS
  const putaran = useGelombang()
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
      <div className="grid grid-cols-8 gap-1.5 md:hidden">
        {Array.from({ length: KOLOM_HP * baris }, (_, i) => (
          <Kotak key={i} x={i % KOLOM_HP} y={Math.floor(i / KOLOM_HP)} kolom={KOLOM_HP} barisPekat={pendek ? 2 : 3} putaran={putaran} kelas="aspect-square" />
        ))}
      </div>
      {/* Desktop: 20 kolom. Tiga baris pekat: di atas layar, di belakang navigasi, dan di bawah navigasi. */}
      <div className="hidden grid-cols-20 gap-1.5 md:grid">
        {Array.from({ length: KOLOM_DESKTOP * baris }, (_, i) => (
          <Kotak key={i} x={i % KOLOM_DESKTOP} y={Math.floor(i / KOLOM_DESKTOP)} kolom={KOLOM_DESKTOP} barisPekat={pendek ? 2 : 3} putaran={putaran} kelas="aspect-square" />
        ))}
      </div>
    </div>
  )
})

export default Mozaik
