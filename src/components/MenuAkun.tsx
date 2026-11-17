// Menu akun di kanan atas: lingkaran inisial. Diklik membuka nama, email, peran, dan tombol Keluar.
// Menggantikan halaman Profil (keputusan 17 Nov 2026).

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData, usePengguna } from '../lib/data'
import { inisial } from '../lib/format'
import { usePopover } from '../lib/popover'
import { useToast } from '../lib/toast'
import DialogKonfirmasi from './DialogKonfirmasi'
import Ikon from './Ikon'

function MenuAkun() {
  const pengguna = usePengguna()
  const { keluar } = useData()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const { terbuka, setTerbuka, wadah, tombol } = usePopover()
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false)

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
                {pengguna.peran === 'admin' ? 'Admin IT' : 'Pengguna'}
              </span>
              <span className="text-teks-lembut">{pengguna.jabatan}</span>
            </span>
          </div>
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
