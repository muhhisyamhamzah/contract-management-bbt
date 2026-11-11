// Daftar alamat (route) aplikasi dan halaman yang ditampilkan di setiap alamat.

import { Navigate, Route, Routes } from 'react-router-dom'
import TataLetakHP from './components/TataLetakHP'
import TataLetakUtama from './components/TataLetakUtama'
import Beranda from './pages/Beranda'
import Kontrak from './pages/Kontrak'
import Pengingat from './pages/Pengingat'
import DetailKontrak from './pages/DetailKontrak'
import FormKontrak from './pages/FormKontrak'
import ContohKomponen from './pages/ContohKomponen'

function App() {
  return (
    <Routes>
      <Route element={<TataLetakHP />}>
        {/* Halaman dengan navigasi bawah */}
        <Route element={<TataLetakUtama />}>
          <Route path="/" element={<Beranda />} />
          {/* Filter status bisa dikirim lewat alamat, misalnya /kontrak?status=segera */}
          <Route path="/kontrak" element={<Kontrak />} />
          <Route path="/pengingat" element={<Pengingat />} />
        </Route>

        {/* Halaman tanpa navigasi bawah (punya tombol bawah sendiri) */}
        <Route path="/kontrak/:id" element={<DetailKontrak />} />
        <Route path="/tambah" element={<FormKontrak />} />

        {/* SEMENTARA: halaman cek komponen, hanya saat npm run dev. Hapus setelah tahap 7. */}
        {import.meta.env.DEV && <Route path="/contoh-komponen" element={<ContohKomponen />} />}
      </Route>

      {/* Alamat yang tidak dikenal (termasuk /profil) dikembalikan ke Beranda */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
