// Navigasi bawah: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil.

import { Link, NavLink } from 'react-router-dom'
import Ikon, { type NamaIkon } from './Ikon'

type ItemNav = {
  ke: string
  label: string
  ikon: NamaIkon
}

const itemKiri: ItemNav[] = [
  { ke: '/', label: 'Beranda', ikon: 'beranda' },
  { ke: '/kontrak', label: 'Kontrak', ikon: 'kontrak' },
]

const itemKanan: ItemNav[] = [
  { ke: '/pengingat', label: 'Pengingat', ikon: 'pengingat' },
  { ke: '/profil', label: 'Profil', ikon: 'profil' },
]

/** Satu tombol menu. Warna berubah saat halamannya sedang dibuka. */
function TautanNav({ ke, label, ikon }: ItemNav) {
  return (
    <NavLink
      to={ke}
      // "end" supaya Beranda (/) tidak ikut aktif saat membuka halaman lain.
      end={ke === '/'}
      className={({ isActive }) =>
        `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold ${
          isActive ? 'text-aksi' : 'text-teks-lembut'
        }`
      }
    >
      <Ikon nama={ikon} />
      {label}
    </NavLink>
  )
}

function NavBawah() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-garis bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md items-center gap-1 px-2 py-1.5">
        {itemKiri.map((item) => (
          <TautanNav key={item.ke} {...item} />
        ))}

        <div className="flex flex-1 justify-center">
          <Link
            to="/tambah"
            aria-label="Tambah kontrak"
            className="-mt-6 flex size-14 items-center justify-center rounded-full bg-aksi text-white shadow-lg ring-4 ring-latar"
          >
            <Ikon nama="tambah" className="size-7" />
          </Link>
        </div>

        {itemKanan.map((item) => (
          <TautanNav key={item.ke} {...item} />
        ))}
      </div>
    </nav>
  )
}

export default NavBawah
