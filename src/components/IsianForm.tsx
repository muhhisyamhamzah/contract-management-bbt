// Pembungkus satu kotak isian: label yang terlihat, tanda wajib, petunjuk, dan pesan kesalahan.
// Pesan kesalahan dan petunjuk dihubungkan ke kotak isian lewat aria-describedby, jadi
// pembaca layar menyebutkan alasan kesalahannya, bukan hanya "tidak valid".
//
// Cara pakai:
//   <IsianForm id="isian-nama" label="Nama kontrak" wajib galat={galat.nama}>
//     {(props) => <input {...props} className={KELAS_ISIAN} />}
//   </IsianForm>

import type { ReactNode } from 'react'
import Ikon from './Ikon'

/** Atribut yang harus dipasang ke kotak isian di dalamnya. */
export type PropsIsian = {
  id: string
  'aria-invalid': boolean
  'aria-describedby'?: string
  'aria-required'?: boolean
}

type Props = {
  id: string
  label: string
  wajib?: boolean
  /** Petunjuk di bawah kotak, misalnya format yang diharapkan. */
  petunjuk?: string
  /** Pesan kesalahan. Kosong kalau isian benar. */
  galat?: string
  children: (props: PropsIsian) => ReactNode
  className?: string
}

function IsianForm({ id, label, wajib = false, petunjuk, galat, children, className = '' }: Props) {
  const idPetunjuk = petunjuk ? `${id}-petunjuk` : undefined
  const idGalat = galat ? `${id}-galat` : undefined
  const keterangan = [idGalat, idPetunjuk].filter(Boolean).join(' ') || undefined

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-judul">
        {label}
        {wajib && (
          <span className="text-hapus-teks" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-invalid': Boolean(galat), 'aria-describedby': keterangan, 'aria-required': wajib || undefined })}
      {galat && (
        <span id={idGalat} className="flex items-start gap-1.5 text-[13px] font-semibold text-hapus-teks">
          <Ikon nama="info" ukuran={16} className="mt-px flex-none" />
          {galat}
        </span>
      )}
      {petunjuk && (
        <span id={idPetunjuk} className="text-[12px] text-teks-lembut">
          {petunjuk}
        </span>
      )}
    </div>
  )
}

export default IsianForm
