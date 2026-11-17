// Kerangka semua halaman setelah masuk: tautan "Lewati ke konten" untuk pengguna keyboard,
// isi halaman (header navy + konten), dan kaki halaman.
// Header (dengan navigasi atas) digambar oleh tiap halaman lewat <HeaderGelombang>, karena judulnya berbeda.
// Halaman ini juga melindungi rute: yang belum masuk diarahkan ke /masuk.

import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useData } from '../lib/data'
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
    <div className="flex min-h-dvh flex-col bg-latar">
      <a
        href="#konten"
        className="sr-only z-50 rounded-xl bg-white px-4 py-3 font-semibold text-aksi shadow-menu focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Lewati ke konten
      </a>

      <Outlet />

      <footer className={`${KELAS_WADAH} mt-auto flex flex-wrap justify-between gap-2 py-8 text-[12px] text-teks-lembut`}>
        <span>Contract Management · Badan Bank Tanah</span>
        <span>Versi 0.2 (purwarupa, data contoh)</span>
      </footer>
    </div>
  )
}

export default TataLetakWebsite
