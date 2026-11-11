// Navigasi bawah: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil.
// Gaya: datar dengan label, menu aktif navy, tombol + bulat bergradasi navy.

import { Link } from 'react-router-dom'
import { useToast } from '../lib/toast'
import Ikon from './Ikon'
import MenuNav from './MenuNav'

function NavBawah() {
  const tampilkanToast = useToast()

  return (
    <nav
      aria-label="Navigasi utama"
      // Tinggi 78px dengan 16px ruang bawah untuk garis home HP.
      // Kalau HP butuh ruang lebih besar (safe area), ruangnya ikut membesar.
      className="grid flex-none grid-cols-5 items-center border-t border-garis bg-white pb-[max(16px,env(safe-area-inset-bottom))] [min-height:calc(62px+max(16px,env(safe-area-inset-bottom)))]"
    >
      <MenuNav ke="/" label="Beranda" ikon="beranda" />
      <MenuNav ke="/kontrak" label="Kontrak" ikon="kontrak" />

      <Link
        to="/tambah"
        aria-label="Tambah kontrak baru"
        className="-mt-7 flex size-[52px] items-center justify-center justify-self-center rounded-full bg-linear-135 from-galaxy-900 to-galaxy-700 text-white shadow-tombol-tambah ring-4 ring-latar hover:text-white"
      >
        <Ikon nama="tambah" ukuran={24} tebal={2.5} />
      </Link>

      <MenuNav ke="/pengingat" label="Pengingat" ikon="pengingat" />

      {/* Profil belum masuk MVP: tidak ada halaman, tombol ini hanya memunculkan toast. */}
      <MenuNav
        label="Profil"
        ikon="profil"
        onKlik={() => tampilkanToast('Halaman profil belum masuk desain MVP')}
      />
    </nav>
  )
}

export default NavBawah
