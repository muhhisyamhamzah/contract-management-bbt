// Satu menu di navigasi bawah (ikon + label).
// Kalau diberi "ke", menjadi tautan yang berwarna navy saat halamannya sedang dibuka.
// Kalau diberi "onKlik", menjadi tombol biasa (misalnya Profil yang hanya memunculkan toast).

import { NavLink } from 'react-router-dom'
import Ikon, { type NamaIkon } from './Ikon'

const kelasDasar =
  'flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 border-none bg-transparent text-[11px] no-underline'

type Props = {
  label: string
  ikon: NamaIkon
  /** Alamat tujuan (menjadi tautan). */
  ke?: string
  /** Aksi saat diklik (menjadi tombol). */
  onKlik?: () => void
}

function MenuNav({ label, ikon, ke, onKlik }: Props) {
  if (!ke) {
    return (
      <button type="button" onClick={onKlik} className={`${kelasDasar} font-medium text-teks-lembut`}>
        <Ikon nama={ikon} />
        {label}
      </button>
    )
  }

  return (
    <NavLink
      to={ke}
      end
      className={({ isActive }) =>
        `${kelasDasar} ${isActive ? 'font-semibold text-aksi hover:text-aksi' : 'font-medium text-teks-lembut hover:text-teks-lembut'}`
      }
    >
      <Ikon nama={ikon} />
      {label}
    </NavLink>
  )
}

export default MenuNav
