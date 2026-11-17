// Satu baris di daftar akun (halaman Admin): inisial, nama, jabatan, email, status, Reset sandi, dan menu.

import { inisial } from '../lib/format'
import type { Akun } from '../types/kontrak'
import MenuDropdown from './MenuDropdown'
import Ikon from './Ikon'

type Props = {
  akun: Akun
  /** true kalau ini akun admin yang sedang masuk (tidak boleh menonaktifkan diri sendiri). */
  diriSendiri: boolean
  onResetSandi: () => void
  onUbahAktif: () => void
}

function BarisAkun({ akun, diriSendiri, onResetSandi, onUbahAktif }: Props) {
  const admin = akun.peran === 'admin'

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis-lembut py-4 last:border-b-0">
      <span
        aria-hidden="true"
        className={`flex size-11 flex-none items-center justify-center rounded-full text-[14px] font-bold ${
          admin ? 'bg-galaxy-900 text-logo-emas' : 'bg-lembut text-aksi'
        }`}
      >
        {inisial(akun.nama)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold text-judul">
          {akun.nama}
          {diriSendiri && <span className="font-normal text-teks-lembut"> (Anda)</span>}
        </span>
        <span className="text-[13px] text-teks-lembut">{akun.jabatan}</span>
        <span className="text-[13px] break-all text-teks-lembut">{akun.email}</span>
      </span>

      <span className="flex flex-none items-center gap-2 max-sm:w-full max-sm:pl-15">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            akun.aktif ? 'bg-berjalan-latar text-berjalan-teks' : 'bg-selesai-latar text-selesai-teks'
          }`}
        >
          <span aria-hidden="true" className={`size-1.5 rounded-full ${akun.aktif ? 'bg-berjalan' : 'bg-selesai'}`} />
          {akun.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
        <button
          type="button"
          onClick={onResetSandi}
          className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-none bg-transparent px-3 text-[13px] font-semibold whitespace-nowrap text-aksi hover:bg-lembut"
        >
          <Ikon nama="kunci" ukuran={15} />
          Reset sandi<span className="sr-only"> {akun.nama}</span>
        </button>
        {!diriSendiri && (
          <MenuDropdown
            labelTombol={`Menu akun ${akun.nama}`}
            isiTombol={<Ikon nama="titikTiga" ukuran={20} />}
            kelasTombol="flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut hover:bg-latar hover:text-judul"
            lebar={200}
            item={[
              akun.aktif
                ? { label: 'Nonaktifkan akun', bahaya: true, onPilih: onUbahAktif }
                : { label: 'Aktifkan akun', onPilih: onUbahAktif },
            ]}
          />
        )}
      </span>
    </li>
  )
}

export default BarisAkun
