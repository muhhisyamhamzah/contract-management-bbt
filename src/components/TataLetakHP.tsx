// Bingkai luar aplikasi: satu kolom selebar layar HP (maksimal 430px) di tengah layar,
// setinggi layar. Semua halaman tampil di dalam bingkai ini.
//
// Halaman di dalamnya memakai "flex-1 min-h-0" dan mengatur scroll sendiri,
// supaya header atau tombol bawah bisa tetap diam saat isi di-scroll.
// Toast juga dipasang di sini supaya muncul di dalam kolom HP.

import { Outlet } from 'react-router-dom'
import LayarPembuka from './LayarPembuka'
import PenyediaToast from './Toast'

function TataLetakHP() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-latar min-[431px]:border-x min-[431px]:border-garis">
      <PenyediaToast>
        <Outlet />
      </PenyediaToast>
      {/* Logo BBT saat aplikasi pertama dibuka, menutupi seluruh kolom HP */}
      <LayarPembuka />
    </div>
  )
}

export default TataLetakHP
