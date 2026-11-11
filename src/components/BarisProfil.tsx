// Satu baris di kartu halaman Profil: ikon, label, nilai (opsional), dan panah.
// Kalau diberi onKlik, baris menjadi tombol; kalau tidak, hanya menampilkan informasi.

import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  ikon: NamaIkon
  label: string
  /** Nilai di bawah label, misalnya alamat email. */
  nilai?: string
  onKlik?: () => void
  /** Baris terakhir di kartu tidak diberi garis bawah. */
  terakhir?: boolean
}

function BarisProfil({ ikon, label, nilai, onKlik, terakhir = false }: Props) {
  const isi = (
    <>
      <span
        aria-hidden="true"
        className="flex size-10 flex-none items-center justify-center rounded-xl bg-lembut text-aksi"
      >
        <Ikon nama={ikon} ukuran={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="font-semibold text-judul">{label}</span>
        {nilai && <span className="truncate text-[12px] text-teks-lembut">{nilai}</span>}
      </span>
      {onKlik && <Ikon nama="kanan" ukuran={16} className="flex-none text-teks-lembut" />}
    </>
  )

  const kelas = `flex min-h-[60px] w-full items-center gap-3 py-2.5 ${terakhir ? '' : 'border-b border-garis-lembut'}`

  return onKlik ? (
    <button type="button" onClick={onKlik} className={`${kelas} cursor-pointer border-x-0 border-t-0 bg-transparent px-0 text-teks`}>
      {isi}
    </button>
  ) : (
    <div className={kelas}>{isi}</div>
  )
}

export default BarisProfil
