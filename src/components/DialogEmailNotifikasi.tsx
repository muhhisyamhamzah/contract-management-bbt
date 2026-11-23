// Dialog "Email pengingat": mengatur email pribadi (misalnya Gmail) yang menerima pengingat kontrak
// (permintaan atasan, 20 Nov 2026). Dibuka dari halaman Profil (akun sendiri) atau dari halaman Admin (akun siapa pun).
// Kosong berarti pengingat dikirim ke email kantor. Tidak perlu izin: langsung aktif setelah disimpan.

import { useState } from 'react'
import DialogKonfirmasi from './DialogKonfirmasi'
import IsianForm from './IsianForm'
import { cekEmailNotifikasi } from '../lib/akun'
import { useData } from '../lib/data'
import { KELAS_ISIAN } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Akun } from '../types/kontrak'

type Props = {
  /** Akun yang diatur. Kosong berarti dialog tertutup. */
  akun: Akun | null
  /** true kalau pemilik akun sendiri yang mengatur (kalimat memakai "Anda"). */
  diriSendiri?: boolean
  onTutup: () => void
}

function DialogEmailNotifikasi({ akun, diriSendiri = false, onTutup }: Props) {
  // Dipasang ulang setiap dibuka, supaya isian mulai dari email yang tersimpan.
  return akun ? <IsiDialog key={akun.id} akun={akun} diriSendiri={diriSendiri} onTutup={onTutup} /> : null
}

function IsiDialog({ akun, diriSendiri, onTutup }: { akun: Akun; diriSendiri: boolean; onTutup: () => void }) {
  const { ubahEmailNotifikasi } = useData()
  const tampilkanToast = useToast()
  const [isi, setIsi] = useState(akun.emailNotifikasi ?? '')
  const [sudahDicoba, setSudahDicoba] = useState(false)
  const galat = sudahDicoba ? cekEmailNotifikasi(isi, akun.email) : ''

  function simpan() {
    setSudahDicoba(true)
    if (cekEmailNotifikasi(isi, akun.email)) {
      document.getElementById('email-pengingat')?.focus()
      return
    }
    ubahEmailNotifikasi(akun.id, isi)
    tampilkanToast(`Email tersimpan. Pengingat dikirim ke ${isi.trim() || akun.email}`)
    onTutup()
  }

  return (
    <DialogKonfirmasi
      terbuka
      judul="Email pengingat"
      pesan={
        <>
          Pengingat kontrak (3, 2, dan 1 bulan sebelum habis) dikirim otomatis ke email ini, tanpa perlu izin.
          {diriSendiri ? ' Anda' : ` ${akun.nama}`} tetap masuk ke website dengan email kantor <strong className="break-words">{akun.email}</strong>.
        </>
      }
      labelKonfirmasi="Simpan email"
      onKonfirmasi={simpan}
      onBatal={onTutup}
    >
      <IsianForm
        id="email-pengingat"
        label="Email pribadi (Gmail)"
        petunjuk="Kosongkan kalau pengingat cukup dikirim ke email kantor."
        galat={galat}
      >
        {(props) => (
          <input
            {...props}
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') simpan()
            }}
            className={`${KELAS_ISIAN} h-11`}
          />
        )}
      </IsianForm>
    </DialogKonfirmasi>
  )
}

export default DialogEmailNotifikasi
