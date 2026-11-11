// Navigasi bawah: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil.
// Ukuran dan warna mengikuti docs/prototipe-referensi.html.

import { Link, NavLink } from 'react-router-dom'
import { useToast } from '../lib/toast'
import Ikon, { type NamaIkon } from './Ikon'

// Class bersama untuk keempat menu (tanpa warna).
const kelasMenu =
  'flex min-h-11 flex-col items-center justify-center gap-1 border-none bg-transparent text-[11px] font-bold no-underline'

type Props = {
  ke: string
  label: string
  ikon: NamaIkon
}

/** Satu menu navigasi. Berwarna biru saat halamannya sedang dibuka. */
function MenuNav({ ke, label, ikon }: Props) {
  return (
    <NavLink
      to={ke}
      end
      className={({ isActive }) => `${kelasMenu} ${isActive ? 'text-aksi' : 'text-teks-lembut'}`}
    >
      <Ikon nama={ikon} />
      {label}
    </NavLink>
  )
}

function NavBawah() {
  const tampilkanToast = useToast()

  return (
    <nav
      aria-label="Navigasi utama"
      // Tinggi 86px dengan 20px ruang bawah untuk garis home HP.
      // Kalau HP butuh ruang lebih besar (safe area), ruangnya ikut membesar.
      className="grid flex-none grid-cols-5 items-center border-t border-garis bg-white pt-0 pb-[max(20px,env(safe-area-inset-bottom))] [min-height:calc(66px+max(20px,env(safe-area-inset-bottom)))]"
    >
      <MenuNav ke="/" label="Beranda" ikon="beranda" />
      <MenuNav ke="/kontrak" label="Kontrak" ikon="kontrak" />

      <Link
        to="/tambah"
        aria-label="Tambah kontrak baru"
        className="-mt-[30px] flex size-[58px] items-center justify-center justify-self-center rounded-[20px] border-4 border-latar bg-linear-135 from-aksi to-aksi-ungu text-white shadow-tombol-tambah hover:text-white"
      >
        <Ikon nama="tambah" ukuran={24} tebal={2.5} />
      </Link>

      <MenuNav ke="/pengingat" label="Pengingat" ikon="pengingat" />

      {/* Profil belum masuk MVP: tidak ada halaman, tombol ini hanya memunculkan toast. */}
      <button
        type="button"
        onClick={() => tampilkanToast('Halaman profil belum masuk desain MVP')}
        className={`${kelasMenu} cursor-pointer text-teks-lembut`}
      >
        <Ikon nama="profil" />
        Profil
      </button>
    </nav>
  )
}

export default NavBawah
