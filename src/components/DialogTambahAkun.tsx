// Dialog form untuk admin membuat akun baru: nama, email kantor, email pengingat (Gmail pribadi), jabatan, dan peran.
// Email yang sudah terdaftar ditolak. Setelah dibuat, kata sandi sementara ditampilkan.

import { useState } from 'react'
import { useData, type IsianAkunBaru } from '../lib/data'
import { KELAS_ISIAN } from '../lib/tataLetak'
import type { Peran } from '../types/kontrak'
import DialogKonfirmasi from './DialogKonfirmasi'
import { cekEmailNotifikasi } from '../lib/akun'
import IsianForm from './IsianForm'

type Props = {
  terbuka: boolean
  onBatal: () => void
  /** Dipanggil dengan isian yang sudah sah. */
  onSimpan: (isi: IsianAkunBaru) => void
}

const ISIAN_AWAL: IsianAkunBaru = { nama: '', email: '', jabatan: 'Tim Pengadaan', peran: 'pengguna', emailNotifikasi: '' }

function DialogTambahAkun({ terbuka, onBatal, onSimpan }: Props) {
  const { akun } = useData()
  const [isi, setIsi] = useState<IsianAkunBaru>(ISIAN_AWAL)
  const [sudahDicoba, setSudahDicoba] = useState(false)

  const galat: Partial<Record<keyof IsianAkunBaru, string>> = {}
  if (sudahDicoba) {
    if (!isi.nama.trim()) galat.nama = 'Isi nama lengkap pemilik akun.'
    if (!isi.email.trim()) galat.email = 'Isi email kantor, misalnya nama@banktanah.id.'
    else if (!/^\S+@\S+\.\S+$/.test(isi.email.trim())) galat.email = 'Format email belum benar, misalnya nama@banktanah.id.'
    else if (akun.some((a) => a.email.toLowerCase() === isi.email.trim().toLowerCase()))
      galat.email = 'Email ini sudah punya akun. Pakai Reset sandi kalau pemiliknya lupa kata sandi.'
    if (!isi.jabatan.trim()) galat.jabatan = 'Isi jabatan, misalnya Tim Pengadaan.'
    const galatEmailPengingat = cekEmailNotifikasi(isi.emailNotifikasi ?? '', isi.email.trim())
    if (galatEmailPengingat) galat.emailNotifikasi = galatEmailPengingat
  }

  function tutup() {
    setIsi(ISIAN_AWAL)
    setSudahDicoba(false)
    onBatal()
  }

  function simpan() {
    setSudahDicoba(true)
    const nama = isi.nama.trim()
    const email = isi.email.trim()
    const sah =
      nama &&
      /^\S+@\S+\.\S+$/.test(email) &&
      !akun.some((a) => a.email.toLowerCase() === email.toLowerCase()) &&
      isi.jabatan.trim() &&
      !cekEmailNotifikasi(isi.emailNotifikasi ?? '', email)
    if (!sah) return
    onSimpan({ ...isi, nama, email, jabatan: isi.jabatan.trim() })
    setIsi(ISIAN_AWAL)
    setSudahDicoba(false)
  }

  return (
    <DialogKonfirmasi
      terbuka={terbuka}
      judul="Tambah akun"
      pesan="Kata sandi sementara dibuat otomatis setelah akun disimpan."
      labelKonfirmasi="Buat akun"
      onKonfirmasi={simpan}
      onBatal={tutup}
    >
      <div className="flex flex-col gap-4">
        <IsianForm id="akun-nama" label="Nama lengkap" wajib galat={galat.nama}>
          {(props) => (
            <input {...props} type="text" value={isi.nama} onChange={(e) => setIsi({ ...isi, nama: e.target.value })} className={`${KELAS_ISIAN} h-11`} />
          )}
        </IsianForm>
        <IsianForm id="akun-email" label="Email kantor" wajib galat={galat.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              spellCheck={false}
              value={isi.email}
              onChange={(e) => setIsi({ ...isi, email: e.target.value })}
              placeholder="nama@banktanah.id"
              className={`${KELAS_ISIAN} h-11`}
            />
          )}
        </IsianForm>
        <IsianForm
          id="akun-email-pengingat"
          label="Email pengingat (Gmail pribadi)"
          petunjuk="Pengingat kontrak dikirim otomatis ke email ini, tanpa perlu izin. Kosongkan kalau cukup ke email kantor."
          galat={galat.emailNotifikasi}
        >
          {(props) => (
            <input
              {...props}
              type="email"
              spellCheck={false}
              value={isi.emailNotifikasi ?? ''}
              onChange={(e) => setIsi({ ...isi, emailNotifikasi: e.target.value })}
              className={`${KELAS_ISIAN} h-11`}
            />
          )}
        </IsianForm>
        <div className="grid gap-4 sm:grid-cols-2">
          <IsianForm id="akun-jabatan" label="Jabatan" wajib galat={galat.jabatan}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={isi.jabatan}
                onChange={(e) => setIsi({ ...isi, jabatan: e.target.value })}
                className={`${KELAS_ISIAN} h-11`}
              />
            )}
          </IsianForm>
          <IsianForm id="akun-peran" label="Peran" wajib>
            {(props) => (
              <select
                {...props}
                value={isi.peran}
                onChange={(e) => setIsi({ ...isi, peran: e.target.value as Peran })}
                className={`${KELAS_ISIAN} h-11`}
              >
                <option value="pengguna">Pengguna</option>
                <option value="admin">Admin</option>
              </select>
            )}
          </IsianForm>
        </div>
      </div>
    </DialogKonfirmasi>
  )
}

export default DialogTambahAkun
