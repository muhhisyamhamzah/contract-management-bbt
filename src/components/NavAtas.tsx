// Navigasi atas: pil putih yang ikut turun saat di-scroll (arah "Kavling", DESIGN.md).
// Isi: logo BBT + nama aplikasi, menu (Beranda, Kontrak, Critical point, Rekap, Ubah data, Admin khusus admin),
// lonceng notifikasi, menu akun, dan tombol "Tambah kontrak" (desktop, kecuali di halaman form).
// Logo duduk langsung di atas putih, warnanya tidak diubah.
// Di desktop satu baris. Di HP: logo dan ikon di atas, menu di bawah dalam grid 3 kolom (tanpa scroll ke samping).
// Tidak ada sidebar (supaya berbeda dari Sismon).

import { Link, NavLink, useLocation } from 'react-router-dom'
import { usePengguna, useData } from '../lib/data'
import { hitungStatus, hitungTahap, perluPerhatian } from '../lib/status'
import { KELAS_TOMBOL_UTAMA } from '../lib/tataLetak'
import Ikon from './Ikon'
import MenuAkun from './MenuAkun'
import PanelNotifikasi from './PanelNotifikasi'

function kelasMenu({ isActive }: { isActive: boolean }) {
  return `flex min-h-11 items-center justify-center gap-1.5 rounded-full px-1 text-[13px] whitespace-nowrap no-underline transition-[background-color,color] duration-150 motion-reduce:transition-none md:text-[14px] xl:px-3 ${
    isActive
      ? 'bg-lembut font-bold text-galaxy-900 hover:text-galaxy-900'
      : 'font-medium text-teks hover:bg-latar hover:text-galaxy-900'
  }`
}

/** Bulatan angka kecil di samping nama menu. */
function Jumlah({ angka }: { angka: number }) {
  if (angka <= 0) return null
  return (
    <span
      aria-hidden="true"
      className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-logo-emas px-1.5 text-[11px] font-bold text-galaxy-900"
    >
      {angka}
    </span>
  )
}

/** Halaman yang sudah berupa form tidak menampilkan tombol Tambah kontrak (satu tombol utama per layar). */
function halamanForm(path: string): boolean {
  return path === '/tambah' || path.endsWith('/ubah') || path.startsWith('/ubah-data')
}

function NavAtas() {
  const pengguna = usePengguna()
  const { kontrak } = useData()
  const { pathname } = useLocation()

  const jumlahKontrak = kontrak.filter((k) => perluPerhatian(k)).length
  // Critical point aktif yang tanggal pentingnya sudah lewat atau sudah masuk tahap pengingat (3 bulan).
  const jumlahCritical = kontrak
    .filter((k) => hitungStatus(k) !== 'selesai')
    .flatMap((k) => k.criticalPoint)
    .filter((b) => b.status === 'aktif' && b.tanggalPenting && hitungTahap(b.tanggalPenting) !== 'nanti').length

  const menu = (
    <>
      <NavLink to="/" end className={kelasMenu}>
        Beranda
      </NavLink>
      <NavLink to="/kontrak" end className={kelasMenu} aria-label={`Kontrak, ${jumlahKontrak} perlu perhatian`}>
        Kontrak
        <Jumlah angka={jumlahKontrak} />
      </NavLink>
      <NavLink
        to="/critical-point"
        className={kelasMenu}
        aria-label={`Critical point, ${jumlahCritical} perlu perhatian`}
      >
        Critical point
        <Jumlah angka={jumlahCritical} />
      </NavLink>
      <NavLink to="/rekap" className={kelasMenu}>
        Rekap
      </NavLink>
      <NavLink to="/ubah-data" className={kelasMenu}>
        Ubah data
      </NavLink>
      {pengguna.peran === 'admin' && (
        <NavLink to="/admin" className={kelasMenu}>
          Admin
        </NavLink>
      )}
    </>
  )

  return (
    <nav
      aria-label="Navigasi utama"
      className="relative z-20 rounded-[20px] border border-garis bg-white py-2 pr-1.5 pl-3 shadow-pil md:rounded-[22px] md:pr-2 md:pl-5"
    >
      <div className="flex min-h-12 items-center gap-2 md:gap-3 xl:gap-5">
        <Link to="/" className="flex min-h-11 min-w-0 flex-none items-center gap-2 text-judul no-underline hover:text-judul md:gap-3">
          <img
            src="/logo-bbt.png"
            alt="Badan Bank Tanah"
            width={1160}
            height={464}
            className="block h-[26px] w-auto md:h-10"
          />
          <span className="border-l border-garis pl-2 text-[13px] font-extrabold tracking-[-0.02em] whitespace-nowrap md:pl-3 md:text-[17px]">
            Contract Management
          </span>
          <span className="sr-only">, ke Beranda</span>
        </Link>

        <div className="mx-auto hidden items-center gap-0.5 xl:flex">{menu}</div>

        <div className="ml-auto flex flex-none items-center gap-0.5 md:gap-1 xl:ml-0">
          <PanelNotifikasi />
          <MenuAkun />
          {!halamanForm(pathname) && (
            <Link to="/tambah" className={`${KELAS_TOMBOL_UTAMA} ml-1.5 max-md:hidden`}>
              <Ikon nama="tambah" ukuran={18} tebal={2.5} />
              Tambah kontrak
            </Link>
          )}
        </div>
      </div>

      {/* Menu di HP (grid 3 kolom) dan tablet/laptop kecil (satu baris kedua), di dalam pil */}
      <div className="mt-1 grid grid-cols-3 gap-1 md:grid-cols-6 xl:hidden">{menu}</div>
    </nav>
  )
}

export default NavAtas
