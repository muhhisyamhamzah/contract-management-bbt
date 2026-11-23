// Dialog berisi kata sandi sementara setelah admin membuat akun atau mereset sandi.
// Kata sandi hanya tampil sekali di sini; admin menyampaikannya langsung ke pengguna.

import { useState } from 'react'
import DialogKonfirmasi from './DialogKonfirmasi'
import Ikon from './Ikon'

type Props = {
  /** Nama dan email pemilik akun, serta kata sandinya. null = dialog tertutup. */
  isi: { nama: string; email: string; sandi: string; judul: string } | null
  onTutup: () => void
}

function KartuSandiSementara({ isi, onTutup }: Props) {
  const [tersalin, setTersalin] = useState(false)

  async function salin() {
    if (!isi) return
    try {
      await navigator.clipboard.writeText(isi.sandi)
      setTersalin(true)
    } catch {
      setTersalin(false)
    }
  }

  return (
    <DialogKonfirmasi
      terbuka={isi !== null}
      judul={isi?.judul ?? ''}
      // Ganti kata sandi tersedia di halaman Profil (21 Nov 2026), jadi pemilik akun diminta menggantinya.
      pesan="Sampaikan kata sandi ini langsung ke pemilik akun. Kata sandi hanya tampil sekali, di layar ini. Minta pemilik akun menggantinya di halaman Profil setelah masuk."
      labelKonfirmasi="Selesai"
      tanpaBatal
      onKonfirmasi={() => {
        setTersalin(false)
        onTutup()
      }}
      onBatal={() => {
        setTersalin(false)
        onTutup()
      }}
    >
      {isi && (
        <div className="flex flex-col gap-3 rounded-[20px] bg-galaxy-900 p-5 text-white">
          <div className="flex items-center gap-2 text-[13px] text-white">
            <Ikon nama="perisai" ukuran={16} />
            {isi.nama}, {isi.email}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[26px] font-bold tracking-[0.08em] break-all">{isi.sandi}</span>
            <button
              type="button"
              onClick={salin}
              className="flex h-11 flex-none cursor-pointer items-center gap-1.5 rounded-full border-none bg-white px-4 font-semibold text-galaxy-900"
            >
              <Ikon nama={tersalin ? 'centang' : 'salin'} ukuran={16} tebal={2.3} />
              {tersalin ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <span role="status" className="sr-only">
            {tersalin ? 'Kata sandi tersalin.' : ''}
          </span>
        </div>
      )}
    </DialogKonfirmasi>
  )
}

export default KartuSandiSementara
