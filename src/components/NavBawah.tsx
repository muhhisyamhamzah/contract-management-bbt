// Navigasi bawah: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil.
// Gaya: datar dengan label, menu aktif navy, tombol + bulat bergradasi navy.

import { Link } from 'react-router-dom'
import Ikon from './Ikon'
import MenuNav from './MenuNav'

function NavBawah() {
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

      <MenuNav ke="/profil" label="Profil" ikon="profil" />
    </nav>
  )
}

export default NavBawah
