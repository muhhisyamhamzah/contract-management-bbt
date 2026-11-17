// Daftar alamat (route) website dan halaman yang ditampilkan di setiap alamat.
//
// Halaman Masuk dimuat langsung (halaman pertama). Halaman lain dimuat saat dibuka (React.lazy),
// supaya file JavaScript awal lebih kecil. Penanda "Memuat halaman" ada di TataLetakWebsite (Suspense).

import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RuteAdmin from './components/RuteAdmin'
import TataLetakWebsite from './components/TataLetakWebsite'
import Masuk from './pages/Masuk'

const Admin = lazy(() => import('./pages/Admin'))
const Beranda = lazy(() => import('./pages/Beranda'))
const CriticalPoint = lazy(() => import('./pages/CriticalPoint'))
const DetailKontrak = lazy(() => import('./pages/DetailKontrak'))
const FormKontrak = lazy(() => import('./pages/FormKontrak'))
const Kontrak = lazy(() => import('./pages/Kontrak'))
const Rekap = lazy(() => import('./pages/Rekap'))
const UbahData = lazy(() => import('./pages/UbahData'))

function App() {
  return (
    <Routes>
      <Route path="/masuk" element={<Masuk />} />

      {/* Halaman yang hanya bisa dibuka setelah masuk */}
      <Route element={<TataLetakWebsite />}>
        <Route path="/" element={<Beranda />} />
        {/* Kontrak dikelompokkan per tahap pengingat (gabungan Kontrak + Pengingat). Kata kunci lewat ?q= */}
        <Route path="/kontrak" element={<Kontrak />} />
        <Route path="/kontrak/:id" element={<DetailKontrak />} />
        <Route path="/kontrak/:id/ubah" element={<FormKontrak />} />
        <Route path="/tambah" element={<FormKontrak />} />
        <Route path="/critical-point" element={<CriticalPoint />} />
        {/* Rekap: semua kontrak + dokumen. Filter status lewat alamat, misalnya /rekap?status=segera */}
        <Route path="/rekap" element={<Rekap />} />
        <Route path="/ubah-data" element={<UbahData />} />
        <Route path="/ubah-data/:id" element={<UbahData />} />
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
