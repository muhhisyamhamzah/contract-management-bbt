// Daftar alamat (route) website dan halaman yang ditampilkan di setiap alamat.

import { Navigate, Route, Routes } from 'react-router-dom'
import RuteAdmin from './components/RuteAdmin'
import TataLetakWebsite from './components/TataLetakWebsite'
import Admin from './pages/Admin'
import Beranda from './pages/Beranda'
import DetailKontrak from './pages/DetailKontrak'
import FormKontrak from './pages/FormKontrak'
import Kontrak from './pages/Kontrak'
import Masuk from './pages/Masuk'
import Pengingat from './pages/Pengingat'

function App() {
  return (
    <Routes>
      <Route path="/masuk" element={<Masuk />} />

      {/* Halaman yang hanya bisa dibuka setelah masuk */}
      <Route element={<TataLetakWebsite />}>
        <Route path="/" element={<Beranda />} />
        {/* Filter status bisa dikirim lewat alamat, misalnya /kontrak?status=segera */}
        <Route path="/kontrak" element={<Kontrak />} />
        <Route path="/kontrak/:id" element={<DetailKontrak />} />
        <Route path="/kontrak/:id/ubah" element={<FormKontrak />} />
        <Route path="/tambah" element={<FormKontrak />} />
        <Route path="/pengingat" element={<Pengingat />} />
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
