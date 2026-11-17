// Kerangka semua halaman setelah masuk: tautan "Lewati ke konten" untuk pengguna keyboard,
// isi halaman (navigasi pil + judul + konten), dan kaki halaman.
// Kepala halaman (dengan navigasi atas) digambar oleh tiap halaman lewat <KepalaHalaman>, karena judulnya berbeda.
// Halaman ini juga melindungi rute: yang belum masuk diarahkan ke /masuk.

import { Suspense, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useData } from '../lib/data'
import Mozaik from './Mozaik'
import { KELAS_WADAH } from '../lib/tataLetak'

function TataLetakWebsite() {
  const { pengguna } = useData()
  const location = useLocation()

  // Pindah halaman: mulai dari atas, atau langsung ke bagian yang dituju (misalnya #critical-point).
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [location.pathname, location.hash])

  if (!pengguna) {
    // Setelah masuk, pengguna dikembalikan ke halaman yang tadi ingin dibuka.
    return <Navigate to="/masuk" replace state={{ dari: location.pathname + location.search }} />
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-latar">
      {/* Latar mozaik kavling di semua halaman (60% atas layar, lalu memudar). */}
      <Mozaik />
      <a
        href="#konten"
        className="sr-only z-50 rounded-full bg-white px-4 py-3 font-semibold text-aksi shadow-menu focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Lewati ke konten
      </a>

      <div className="relative flex flex-1 flex-col">
        {/* Halaman dimuat saat dibuka (React.lazy di App.tsx). Selama memuat, tampil penanda singkat. */}
        <Suspense
          fallback={
            <p role="status" className={`${KELAS_WADAH} m-0 py-24 text-center text-teks-lembut`}>
              Memuat halaman…
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </div>

      <footer className={`${KELAS_WADAH} mt-auto pt-10`}>
        <div className="flex flex-wrap justify-between gap-2 border-t border-garis-lembut py-7 text-[12px] text-teks-lembut">
          <span>Contract Management, Badan Bank Tanah</span>
          <span>Versi 0.2, purwarupa dengan data contoh</span>
        </div>
      </footer>
    </div>
  )
}

export default TataLetakWebsite
