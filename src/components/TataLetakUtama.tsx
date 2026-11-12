// Kerangka untuk halaman yang punya navigasi bawah: Beranda, Kontrak, dan Pengingat.
// Halaman Detail dan Tambah kontrak tidak memakai ini, karena punya tombol bawah sendiri.

import { Outlet } from 'react-router-dom'
import NavBawah from './NavBawah'

function TataLetakUtama() {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <NavBawah />
    </>
  )
}

export default TataLetakUtama
