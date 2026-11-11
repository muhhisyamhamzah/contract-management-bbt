// Satu menu di navigasi bawah (ikon + label), berupa tautan.
// Berwarna navy dan lebih tebal saat halamannya sedang dibuka.

import { NavLink } from 'react-router-dom'
import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  /** Alamat tujuan. */
  ke: string
  label: string
  ikon: NamaIkon
}

function MenuNav({ ke, label, ikon }: Props) {
  return (
    <NavLink
      to={ke}
      end
      className={({ isActive }) =>
        `flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] no-underline ${
          isActive ? 'font-semibold text-aksi hover:text-aksi' : 'font-medium text-teks-lembut hover:text-teks-lembut'
        }`
      }
    >
      <Ikon nama={ikon} />
      {label}
    </NavLink>
  )
}

export default MenuNav
