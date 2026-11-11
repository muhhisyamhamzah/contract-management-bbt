// Header navy dengan bagian bawah bergelombang, dipakai di Beranda dan Kontrak.
// Supaya tidak terasa datar dan kaku, di belakang isi ada lapisan hiasan halus:
// cahaya biru muda yang samar, lingkaran garis tipis, dan pola titik.
// Isi header diberikan lewat children. Kotak pencarian biasanya diletakkan tepat di bawahnya
// dengan margin negatif supaya menumpuk di gelombang.

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Ruang bawah (supaya kotak pencarian bisa menumpuk). Bawaan pb-16. */
  kelasBawah?: string
}

function HeaderGelombang({ children, kelasBawah = 'pb-16' }: Props) {
  return (
    <div
      className={`relative flex-none overflow-hidden bg-linear-150 from-galaxy-900 via-galaxy-900 to-galaxy-700 px-5 pt-[max(56px,env(safe-area-inset-top))] text-white ${kelasBawah}`}
    >
      {/* Lapisan hiasan (tidak dibaca pembaca layar) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Cahaya biru muda di kanan atas dan kiri bawah, supaya biru tidak datar.
            (Cahaya emas sudah dicoba: tercampur navy jadi abu kusam.) */}
        <div className="absolute -top-28 -right-20 size-72 rounded-full bg-aksen/35 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-60 rounded-full bg-aksi/60 blur-3xl" />
        {/* Lingkaran garis tipis */}
        <div className="absolute -top-14 -right-14 size-44 rounded-full border border-white/10" />
        <div className="absolute -top-24 -right-24 size-64 rounded-full border border-white/[0.06]" />
        {/* Pola titik halus yang memudar ke kiri */}
        <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(rgb(255_255_255/0.09)_1px,transparent_1.5px)] bg-size-[14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      </div>

      {/* Isi header di atas lapisan hiasan dan gelombang (supaya menu dropdown tidak tertutup) */}
      <div className="relative z-10">{children}</div>

      {/* Gelombang di bawah header, warnanya sama dengan latar halaman */}
      <svg
        viewBox="0 0 390 36"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-px left-0 block h-9 w-full"
      >
        <path d="M0 36 L0 22 C 90 6, 200 40, 300 18 C 340 9, 370 6, 390 4 L390 36 Z" className="fill-latar" />
      </svg>
    </div>
  )
}

export default HeaderGelombang
