// Layar pembuka (splash): logo BBT di tengah layar putih saat aplikasi pertama dibuka,
// lalu memudar dan menampilkan aplikasi. Logo BBT HANYA tampil di sini, tidak di dalam aplikasi.
//
// Hanya muncul sekali per tab browser (dicatat di sessionStorage), supaya tidak
// muncul lagi setiap kali halaman dimuat ulang saat bekerja.

import { useEffect, useState } from 'react'

/** Lama logo tampil sebelum mulai memudar, dalam milidetik. */
const LAMA_TAMPIL = 1200
/** Lama efek memudar, dalam milidetik. Harus sama dengan class duration-300 di bawah. */
const LAMA_MEMUDAR = 300
const KUNCI_SUDAH_TAMPIL = 'layarPembukaSudahTampil'

type Tahap = 'tampil' | 'memudar' | 'selesai'

function LayarPembuka() {
  const [tahap, setTahap] = useState<Tahap>(() =>
    sessionStorage.getItem(KUNCI_SUDAH_TAMPIL) ? 'selesai' : 'tampil',
  )

  useEffect(() => {
    if (tahap === 'selesai') return
    sessionStorage.setItem(KUNCI_SUDAH_TAMPIL, 'ya')

    const mulaiMemudar = window.setTimeout(() => setTahap('memudar'), LAMA_TAMPIL)
    const hilang = window.setTimeout(() => setTahap('selesai'), LAMA_TAMPIL + LAMA_MEMUDAR)
    return () => {
      window.clearTimeout(mulaiMemudar)
      window.clearTimeout(hilang)
    }
    // Hanya dijalankan sekali saat aplikasi dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (tahap === 'selesai') return null

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 z-50 flex flex-col items-center bg-white px-10 transition-opacity duration-300 motion-reduce:transition-none ${
        tahap === 'memudar' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo di tengah layar */}
      <div className="flex flex-1 items-center justify-center">
        <img src="/logo-bbt.png" alt="" className="block w-[220px] max-w-full" />
      </div>

      {/* Nama aplikasi di bawah, di atas ruang garis home HP */}
      <div className="flex flex-col items-center gap-0.5 pb-[max(48px,env(safe-area-inset-bottom))]">
        <span className="text-[12px] text-teks-lembut">Aplikasi</span>
        <span className="text-[15px] font-bold text-judul">Contract Management</span>
      </div>
    </div>
  )
}

export default LayarPembuka
