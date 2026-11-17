// Navigasi atas: logo BBT + nama aplikasi, menu halaman, lonceng notifikasi, dan menu akun.
// Di desktop satu baris. Di HP dua baris: logo dan ikon di atas, menu di bawah (tanpa scroll ke samping).
// Tidak ada sidebar (supaya berbeda dari Sismon).

import { Link, NavLink } from 'react-router-dom'
import { usePengguna, useData } from '../lib/data'
import { perluPerhatian } from '../lib/status'
import { KELAS_WADAH } from '../lib/tataLetak'
import MenuAkun from './MenuAkun'
import PanelNotifikasi from './PanelNotifikasi'

function kelasMenu({ isActive }: { isActive: boolean }) {
  return `relative flex min-h-11 items-center justify-center gap-1.5 px-1 text-[14px] no-underline transition-[background-color,border-color,color] duration-150 motion-reduce:transition-none after:absolute after:inset-x-1 after:bottom-0 after:h-[3px] after:rounded-full md:justify-start ${
    isActive
      ? 'font-semibold text-white after:bg-tombol-emas hover:text-white'
      : 'font-medium text-teks-header after:bg-transparent hover:text-white'
  }`
}

function NavAtas() {
  const pengguna = usePengguna()
  const { kontrak } = useData()
  const jumlahPerhatian = kontrak.filter((k) => perluPerhatian(k)).length

  const menu = (
    <>
      <NavLink to="/" end className={kelasMenu}>
        Beranda
      </NavLink>
      <NavLink to="/kontrak" className={kelasMenu}>
        Kontrak
      </NavLink>
      <NavLink
        to="/pengingat"
        className={kelasMenu}
        aria-label={`Pengingat, ${jumlahPerhatian} kontrak perlu perhatian`}
      >
        Pengingat
        {jumlahPerhatian > 0 && (
          <span
            aria-hidden="true"
            className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-tombol-emas px-1.5 text-[11px] font-bold text-galaxy-900"
          >
            {jumlahPerhatian}
          </span>
        )}
      </NavLink>
      {pengguna.peran === 'admin' && (
        <NavLink to="/admin" className={kelasMenu}>
          Admin
        </NavLink>
      )}
    </>
  )

  return (
    <nav aria-label="Navigasi utama" className={`${KELAS_WADAH} pt-[max(14px,env(safe-area-inset-top))]`}>
      <div className="flex min-h-14 items-center gap-6">
        {/* Logo BBT di alas putih: warna logo tidak boleh diubah, jadi alasnya yang menyesuaikan latar navy. */}
        <Link
          to="/"
          className="flex flex-none items-center gap-3 text-white no-underline hover:text-white"
          aria-label="Contract Management, Badan Bank Tanah. Ke Beranda"
        >
          <span className="flex h-11 items-center rounded-xl bg-white px-2.5 shadow-kotak">
            <img src="/logo-bbt.png" alt="" className="block h-[30px] w-auto" />
          </span>
          <span className="hidden text-[17px] font-bold tracking-[-0.01em] sm:block">Contract Management</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">{menu}</div>

        <div className="ml-auto flex items-center gap-1.5">
          <PanelNotifikasi />
          <MenuAkun />
        </div>
      </div>

      {/* Menu di HP: baris kedua, dibagi rata */}
      <div className={`mt-1 grid border-t border-white/10 md:hidden ${pengguna.peran === 'admin' ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {menu}
      </div>
    </nav>
  )
}

export default NavAtas
