// Pelindung halaman khusus admin IT. Pengguna biasa yang membuka alamatnya dikembalikan ke Beranda.

import { Navigate, Outlet } from 'react-router-dom'
import { usePengguna } from '../lib/data'

function RuteAdmin() {
  const pengguna = usePengguna()
  if (pengguna.peran !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

export default RuteAdmin
