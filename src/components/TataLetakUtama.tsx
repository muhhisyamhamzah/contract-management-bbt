// Kerangka untuk halaman yang punya navigasi bawah (Beranda, Kontrak, Pengingat, Profil).
// Halaman Detail dan Form tidak memakai ini, karena nanti punya tombol bawah sendiri.

import { Outlet } from 'react-router-dom'
import NavBawah from './NavBawah'

function TataLetakUtama() {
  return (
    <>
      {/* pb-24 memberi ruang supaya isi halaman tidak tertutup navigasi bawah. */}
      <main className="mx-auto min-h-dvh max-w-md pb-24">
        <Outlet />
      </main>
      <NavBawah />
    </>
  )
}

export default TataLetakUtama
