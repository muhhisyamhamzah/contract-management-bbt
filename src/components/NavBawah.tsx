// Navigasi bawah: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil.
// Gaya: datar dengan label, menu aktif navy, tombol + bulat bergradasi navy.

import { Link, NavLink } from 'react-router-dom'
import { useToast } from '../lib/toast'
import Ikon, { type NamaIkon } from './Ikon'

// Class bersama untuk keempat menu (tanpa warna).
const kelasMenu =
  'flex min-h-11 flex-col items-center justify-center gap-1 border-none bg-transparent text-[11px] no-underline'

type Props = {
  ke: string
  label: string
  ikon: NamaIkon
}

/** Satu menu navigasi. Berwarna navy dan lebih tebal saat halamannya sedang dibuka. */
function MenuNav({ ke, label, ikon }: Props) {
  return (
    <NavLink
      to={ke}
      end
      className={({ isActive }) =>
        `${kelasMenu} ${isActive ? 'font-semibold text-aksi hover:text-aksi' : 'font-medium text-teks-lembut hover:text-teks-lembut'}`
      }
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
      <button
        type="button"
        onClick={() => tampilkanToast('Halaman profil belum masuk desain MVP')}
        className={`${kelasMenu} cursor-pointer font-medium text-teks-lembut`}
      >
        <Ikon nama="profil" />
        Profil
      </button>
    </nav>
  )
}

export default NavBawah
