// Menu akun di kanan atas: lingkaran inisial. Diklik membuka nama, email, peran, tautan Profil, dan tombol Keluar.
// Halaman Profil kembali ada (Hisyam 21 Nov 2026) untuk ubah data diri dan ganti kata sandi; menu ini tetap untuk hal cepat.
// Ada sakelar "Animasi latar" untuk menghentikan mozaik yang bergerak terus (WCAG 2.2.2, 18 Nov 2026).

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { alamatPengingat } from '../lib/akun'
import { aturAnimasiLatar, useAnimasiLatar } from '../lib/animasiLatar'
import { useData, usePengguna } from '../lib/data'
import { inisial } from '../lib/format'
import { usePopover } from '../lib/popover'
import { useToast } from '../lib/toast'
import DialogEmailNotifikasi from './DialogEmailNotifikasi'
import DialogKonfirmasi from './DialogKonfirmasi'
import Ikon from './Ikon'

function MenuAkun() {
  const pengguna = usePengguna()
  const { keluar } = useData()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const { terbuka, setTerbuka, wadah, tombol } = usePopover()
  const [aturEmail, setAturEmail] = useState(false)
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false)
  const animasiNyala = useAnimasiLatar()

  return (
    <div ref={wadah} className="relative">
      <button
        ref={tombol}
        type="button"
        aria-label={`Menu akun ${pengguna.nama}`}
        aria-expanded={terbuka}
        aria-controls="panel-akun"
        onClick={() => setTerbuka(!terbuka)}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-none bg-transparent px-1 text-judul transition-[background-color,border-color,color] duration-150 hover:bg-latar motion-reduce:transition-none lg:pr-2"
      >
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-lembut text-[13px] font-bold text-galaxy-900"
        >
          {inisial(pengguna.nama)}
        </span>
        <Ikon nama="bawah" ukuran={16} className="hidden text-teks-lembut lg:block" />
      </button>

      {terbuka && (
        <div
          id="panel-akun"
          className="absolute top-[calc(100%+8px)] right-0 z-30 flex w-[280px] flex-col rounded-[20px] border border-garis bg-white p-1.5 text-teks shadow-menu-tebal"
        >
          <div className="flex flex-col gap-0.5 px-3 pt-2.5 pb-3">
            <span className="font-bold text-judul">{pengguna.nama}</span>
            <span className="truncate text-[13px] text-teks-lembut">{pengguna.email}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
              <span className="rounded-full bg-lembut px-2 py-0.5 font-semibold text-aksi-tua">
                {pengguna.peran === 'admin' ? 'Admin' : 'Pengguna'}
              </span>
              <span className="text-teks-lembut">{pengguna.jabatan}</span>
            </span>
          </div>
          <Link
            to="/profil"
            onClick={() => setTerbuka(false)}
            className="flex min-h-11 items-center gap-2.5 rounded-full px-3 font-semibold text-judul no-underline hover:bg-latar hover:text-judul"
          >
            <Ikon nama="pengguna" ukuran={18} />
            Profil dan kata sandi
          </Link>
          {/* Email pengingat: alamat yang menerima pengingat kontrak (Gmail pribadi atau email kantor). */}
          <button
            type="button"
            onClick={() => {
              setTerbuka(false)
              setAturEmail(true)
            }}
            className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-2xl border-none bg-white px-3 py-1.5 text-left text-judul hover:bg-latar"
          >
            <Ikon nama="email" ukuran={18} className="flex-none" />
            <span className="flex min-w-0 flex-col">
              <span className="font-semibold">Email pengingat</span>
              <span className="text-[12px] break-words text-teks-lembut">{alamatPengingat(pengguna)}</span>
            </span>
          </button>
          {/* Sakelar: aria-checked menyebutkan keadaannya ke pembaca layar, teks Nyala/Mati untuk yang melihat. */}
          <button
            type="button"
            role="switch"
            aria-checked={animasiNyala}
            onClick={() => aturAnimasiLatar(!animasiNyala)}
            className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-full border-none bg-white px-3 text-left font-semibold text-judul hover:bg-latar"
          >
            <span className="flex flex-col">
              <span>Animasi latar</span>
              <span className="text-[12px] font-normal text-teks-lembut">Kotak warna di atas halaman</span>
            </span>
            <span className="flex items-center gap-2 text-[12px] text-teks-lembut">
              {animasiNyala ? 'Nyala' : 'Mati'}
              <span
                aria-hidden="true"
                className={`relative h-6 w-10 flex-none rounded-full border transition-[background-color] duration-150 motion-reduce:transition-none ${
                  animasiNyala ? 'border-galaxy-900 bg-galaxy-900' : 'border-garis-input bg-white'
                }`}
              >
                <span
                  className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-[left] duration-150 motion-reduce:transition-none ${
                    animasiNyala ? 'left-[19px] bg-white' : 'left-[3px] bg-teks-lembut'
                  }`}
                />
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTerbuka(false)
              setKonfirmasiKeluar(true)
            }}
            className="flex h-11 cursor-pointer items-center gap-2.5 rounded-full border-none bg-white px-3 text-left font-semibold text-judul hover:bg-latar"
          >
            <Ikon nama="keluar" ukuran={18} />
            Keluar
          </button>
        </div>
      )}

      <DialogEmailNotifikasi akun={aturEmail ? pengguna : null} diriSendiri onTutup={() => setAturEmail(false)} />
      <DialogKonfirmasi
        terbuka={konfirmasiKeluar}
        judul="Keluar dari akun?"
        pesan="Anda perlu masuk lagi dengan email kantor untuk membuka data kontrak."
        labelKonfirmasi="Keluar"
        onKonfirmasi={() => {
          setKonfirmasiKeluar(false)
          keluar()
          navigate('/masuk', { replace: true })
          tampilkanToast('Anda sudah keluar.')
        }}
        onBatal={() => setKonfirmasiKeluar(false)}
      />
    </div>
  )
}

export default MenuAkun
