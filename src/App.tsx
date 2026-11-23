// Daftar alamat (route) website dan halaman yang ditampilkan di setiap alamat.
//
// Halaman Masuk dimuat langsung (halaman pertama). Halaman lain dimuat saat dibuka (React.lazy),
// supaya file JavaScript awal lebih kecil. Penanda "Memuat halaman" ada di TataLetakWebsite (Suspense).

import { lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import RuteAdmin from './components/RuteAdmin'
import TataLetakWebsite from './components/TataLetakWebsite'
import Masuk from './pages/Masuk'

const Admin = lazy(() => import('./pages/Admin'))
const Beranda = lazy(() => import('./pages/Beranda'))
const CatatAdendum = lazy(() => import('./pages/CatatAdendum'))
const DetailKontrak = lazy(() => import('./pages/DetailKontrak'))
const FormKontrak = lazy(() => import('./pages/FormKontrak'))
const Kontrak = lazy(() => import('./pages/Kontrak'))
const Profil = lazy(() => import('./pages/Profil'))

/** Alamat lama /rekap diarahkan ke /kontrak, filter dan kata kunci (?status=, ?q=) ikut dibawa. */
function KeKontrak() {
  const { search } = useLocation()
  return <Navigate to={`/kontrak${search}`} replace />
}

/** Alamat lama /ubah-data/:id diarahkan ke form ubah kontrak tersebut. */
function KeUbahKontrak() {
  const { id } = useParams()
  return <Navigate to={`/kontrak/${id}/ubah`} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/masuk" element={<Masuk />} />

      {/* Halaman yang hanya bisa dibuka setelah masuk */}
      <Route element={<TataLetakWebsite />}>
        <Route path="/" element={<Beranda />} />
        {/* Daftar semua kontrak (gabungan halaman Kontrak dan Rekap, 18 Nov 2026).
            Filter, kata kunci, dan urutan lewat alamat, misalnya /kontrak?status=segera&q=hukum */}
        <Route path="/kontrak" element={<Kontrak />} />
        <Route path="/kontrak/:id" element={<DetailKontrak />} />
        <Route path="/kontrak/:id/ubah" element={<FormKontrak />} />
        {/* Catat adendum: perpanjangan kontrak dalam satu form (file, akhir kontrak baru, nilai) */}
        <Route path="/kontrak/:id/adendum" element={<CatatAdendum />} />
        <Route path="/tambah" element={<FormKontrak />} />
        {/* Profil: data diri, email pengingat, ganti kata sandi (Hisyam 21 Nov 2026, meniru Sismon). */}
        <Route path="/profil" element={<Profil />} />
        {/* Halaman Critical point dihapus (keputusan Hisyam 18 Nov 2026); alamat lama diarahkan ke Kontrak. */}
        <Route path="/critical-point" element={<Navigate to="/kontrak" replace />} />
        {/* Menu Rekap dan Ubah data digabung ke Kontrak (18 Nov 2026); alamat lama tetap berfungsi. */}
        <Route path="/rekap" element={<KeKontrak />} />
        <Route path="/ubah-data" element={<Navigate to="/kontrak" replace />} />
        <Route path="/ubah-data/:id" element={<KeUbahKontrak />} />
        {/* Halaman Pengingat sudah digabung ke Kontrak; alamat lama diarahkan supaya tautan tidak mati. */}
        <Route path="/pengingat" element={<Navigate to="/kontrak" replace />} />
        <Route element={<RuteAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* Alamat yang tidak dikenal dikembalikan ke Beranda */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
