// Halaman Profil (permintaan Hisyam, 21 Nov 2026): isinya meniru Profil Sismon, dengan gaya Kavling.
// - Data diri: nama dan jabatan bisa diubah sendiri. Email kantor dan peran hanya diubah admin.
// - Keamanan akun: ganti kata sandi (kata sandi saat ini, kata sandi baru minimal 8 karakter, ulangi).
// - Email pengingat: alamat penerima pengingat + contoh email pengingat (uji isi sebelum backend ada).
// - Keluar dari akun.
// Dibuka dari menu "Profil" di navigasi atas atau avatar (23 Nov 2026: dropdown menu akun dihapus).

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import DialogContohEmail from '../components/DialogContohEmail'
import DialogEmailNotifikasi from '../components/DialogEmailNotifikasi'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import Ikon from '../components/Ikon'
import IsianForm from '../components/IsianForm'
import KartuBagian from '../components/KartuBagian'
import KepalaHalaman from '../components/KepalaHalaman'
import { alamatPengingat } from '../lib/akun'
import { MIN_PANJANG_SANDI, useData, usePengguna } from '../lib/data'
import { inisial } from '../lib/format'
import { useJudulHalaman } from '../lib/judulHalaman'
import {
  KELAS_ISIAN,
  KELAS_KOTAK,
  KELAS_TAUTAN_AKSI,
  KELAS_TOMBOL_KEDUA,
  KELAS_TOMBOL_UTAMA,
  KELAS_WADAH,
} from '../lib/tataLetak'
import { useToast } from '../lib/toast'

function Profil() {
  useJudulHalaman('Profil')
  const pengguna = usePengguna()
  const { keluar } = useData()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const [aturEmail, setAturEmail] = useState(false)
  const [contohEmail, setContohEmail] = useState(false)
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false)
  const emailPribadi = Boolean(pengguna.emailNotifikasi)

  return (
    <>
      <KepalaHalaman judul="Profil" keterangan="Data akun, email pengingat, dan kata sandi Anda." />

      <main id="konten" className={`${KELAS_WADAH} flex flex-col gap-5 pb-4`}>
        {/* Identitas singkat, seperti kepala Profil di Sismon, tanpa gradasi (DESIGN.md). */}
        <section aria-label="Akun" className={`${KELAS_KOTAK} flex flex-wrap items-center gap-4 px-5 py-5 md:gap-5 md:px-7`}>
          <span
            aria-hidden="true"
            className="flex size-16 flex-none items-center justify-center rounded-2xl bg-galaxy-900 text-[22px] font-bold text-white md:size-[72px] md:text-[24px]"
          >
            {inisial(pengguna.nama)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="m-0 text-[22px] break-words text-judul">{pengguna.nama}</h2>
            <span className="text-[14px] break-words text-teks-lembut">{pengguna.email}</span>
            <span className="mt-1 flex flex-wrap gap-1.5 text-[12px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-lembut px-2.5 py-1 font-semibold text-aksi-tua">
                <Ikon nama="perisai" ukuran={14} />
                {pengguna.peran === 'admin' ? 'Admin' : 'Pengguna'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-berjalan-latar px-2.5 py-1 font-semibold text-berjalan-teks">
                <Ikon nama="centang" ukuran={14} tebal={2.3} />
                Akun aktif
              </span>
            </span>
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,8fr)_minmax(0,5fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <DataDiri />
            <KeamananAkun />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <KartuBagian
              judul="Email pengingat"
              aksi={
                <button type="button" onClick={() => setAturEmail(true)} className={KELAS_TAUTAN_AKSI}>
                  <Ikon nama="pensil" ukuran={16} />
                  Ubah
                </button>
              }
            >
              <p className="m-0 text-[14px] text-teks-lembut">
                Pengingat kontrak 3, 2, dan 1 bulan sebelum habis dikirim otomatis ke:
              </p>
              <p className="m-0 mt-2 flex items-start gap-2 text-[15px] font-semibold break-words text-judul">
                <Ikon nama="email" ukuran={18} className="mt-0.5 flex-none text-teks-lembut" />
                <span className="min-w-0">{alamatPengingat(pengguna)}</span>
              </p>
              <p className="m-0 mt-1 text-[13px] text-teks-lembut">
                {emailPribadi ? 'Email pribadi. Masuk tetap dengan email kantor.' : 'Email kantor. Isi email pribadi lewat Ubah.'}
              </p>
              <button type="button" onClick={() => setContohEmail(true)} className={`${KELAS_TOMBOL_KEDUA} mt-4 w-full`}>
                <Ikon nama="email" ukuran={16} />
                Lihat contoh email
              </button>
            </KartuBagian>

            <section aria-label="Keluar" className={`${KELAS_KOTAK} px-5 py-5 md:px-7`}>
              <button
                type="button"
                onClick={() => setKonfirmasiKeluar(true)}
                className={`${KELAS_TOMBOL_KEDUA} w-full border-hapus text-hapus-teks hover:bg-hapus-latar hover:text-hapus-teks`}
              >
                <Ikon nama="keluar" ukuran={16} />
                Keluar dari akun
              </button>
            </section>
          </div>
        </div>
      </main>

      <DialogEmailNotifikasi akun={aturEmail ? pengguna : null} diriSendiri onTutup={() => setAturEmail(false)} />
      <DialogContohEmail akun={contohEmail ? pengguna : null} onTutup={() => setContohEmail(false)} />
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
    </>
  )
}

/** Data diri: tampil sebagai daftar, tombol Ubah membuka isian nama dan jabatan. */
function DataDiri() {
  const pengguna = usePengguna()
  const { ubahProfil } = useData()
  const tampilkanToast = useToast()
  const [mengubah, setMengubah] = useState(false)
  const [nama, setNama] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [sudahDicoba, setSudahDicoba] = useState(false)

  const galat = {
    nama: sudahDicoba && !nama.trim() ? 'Isi nama lengkap.' : '',
    jabatan: sudahDicoba && !jabatan.trim() ? 'Isi jabatan, misalnya Tim Pengadaan.' : '',
  }

  function mulaiUbah() {
    setNama(pengguna.nama)
    setJabatan(pengguna.jabatan)
    setSudahDicoba(false)
    setMengubah(true)
  }

  function simpan(event: FormEvent) {
    event.preventDefault()
    setSudahDicoba(true)
    if (!nama.trim() || !jabatan.trim()) {
      document.getElementById(!nama.trim() ? 'profil-nama' : 'profil-jabatan')?.focus()
      return
    }
    ubahProfil({ nama, jabatan })
    setMengubah(false)
    tampilkanToast('Profil tersimpan')
  }

  const baris: [string, string][] = [
    ['Nama lengkap', pengguna.nama],
    ['Jabatan', pengguna.jabatan],
    ['Peran di sistem', pengguna.peran === 'admin' ? 'Admin' : 'Pengguna'],
    ['Email kantor', pengguna.email],
  ]

  return (
    <KartuBagian
      judul="Data diri"
      keterangan={mengubah ? undefined : 'Email kantor dan peran diubah oleh admin'}
      aksi={
        mengubah ? undefined : (
          <button type="button" onClick={mulaiUbah} className={KELAS_TAUTAN_AKSI}>
            <Ikon nama="pensil" ukuran={16} />
            Ubah profil
          </button>
        )
      }
    >
      {mengubah ? (
        <form noValidate onSubmit={simpan} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <IsianForm id="profil-nama" label="Nama lengkap" wajib galat={galat.nama}>
              {(props) => (
                <input
                  {...props}
                  autoComplete="name"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={`${KELAS_ISIAN} h-11`}
                />
              )}
            </IsianForm>
            <IsianForm id="profil-jabatan" label="Jabatan" wajib galat={galat.jabatan}>
              {(props) => (
                <input
                  {...props}
                  autoComplete="organization-title"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className={`${KELAS_ISIAN} h-11`}
                />
              )}
            </IsianForm>
          </div>
          <p className="m-0 text-[13px] text-teks-lembut">
            Email kantor ({pengguna.email}) dan peran hanya bisa diubah admin.
          </p>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setMengubah(false)} className={KELAS_TOMBOL_KEDUA}>
              Batal
            </button>
            <button type="submit" className={`${KELAS_TOMBOL_KEDUA} border-galaxy-900`}>
              Simpan profil
            </button>
          </div>
        </form>
      ) : (
        <dl className="m-0">
          {baris.map(([label, nilai]) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-garis-lembut py-3 last:border-b-0"
            >
              <dt className="flex-none text-[14px] text-teks-lembut">{label}</dt>
              <dd className="m-0 ml-auto min-w-0 text-right text-[15px] font-semibold break-words text-judul">{nilai}</dd>
            </div>
          ))}
        </dl>
      )}
    </KartuBagian>
  )
}

type KolomSandi = 'lama' | 'baru' | 'ulang'

/** Keamanan akun: ganti kata sandi (pola Sismon). */
function KeamananAkun() {
  const { gantiSandi } = useData()
  const tampilkanToast = useToast()
  const [isi, setIsi] = useState<Record<KolomSandi, string>>({ lama: '', baru: '', ulang: '' })
  const [lihat, setLihat] = useState(false)
  const [galat, setGalat] = useState<Record<KolomSandi, string>>({ lama: '', baru: '', ulang: '' })

  function periksa(): Record<KolomSandi, string> {
    return {
      lama: isi.lama ? '' : 'Isi kata sandi yang sekarang dipakai untuk masuk.',
      baru: !isi.baru
        ? `Isi kata sandi baru, minimal ${MIN_PANJANG_SANDI} karakter.`
        : isi.baru.length < MIN_PANJANG_SANDI
          ? `Kata sandi baru minimal ${MIN_PANJANG_SANDI} karakter (sekarang ${isi.baru.length}).`
          : isi.baru === isi.lama
            ? 'Kata sandi baru harus berbeda dari yang sekarang.'
            : '',
      ulang: !isi.ulang ? 'Ketik ulang kata sandi baru.' : isi.ulang !== isi.baru ? 'Belum sama dengan kata sandi baru. Ketik ulang.' : '',
    }
  }

  function simpan(event: FormEvent) {
    event.preventDefault()
    const hasil = periksa()
    const salah = (['lama', 'baru', 'ulang'] as const).find((k) => hasil[k])
    if (salah) {
      setGalat(hasil)
      document.getElementById(`sandi-${salah}`)?.focus()
      return
    }
    if (!gantiSandi(isi.lama, isi.baru)) {
      setGalat({ lama: 'Kata sandi saat ini salah. Periksa lagi, termasuk huruf besar dan kecil.', baru: '', ulang: '' })
      document.getElementById('sandi-lama')?.focus()
      return
    }
    setIsi({ lama: '', baru: '', ulang: '' })
    setGalat({ lama: '', baru: '', ulang: '' })
    setLihat(false)
    tampilkanToast('Kata sandi tersimpan. Pakai kata sandi baru saat masuk lagi.')
  }

  const kolom: { id: KolomSandi; label: string; petunjuk?: string; autoComplete: string; penuh?: boolean }[] = [
    { id: 'lama', label: 'Kata sandi saat ini', autoComplete: 'current-password', penuh: true },
    { id: 'baru', label: 'Kata sandi baru', petunjuk: `Minimal ${MIN_PANJANG_SANDI} karakter.`, autoComplete: 'new-password' },
    { id: 'ulang', label: 'Ulangi kata sandi baru', autoComplete: 'new-password' },
  ]

  return (
    <KartuBagian judul="Keamanan akun" keterangan="Ganti kata sandi secara berkala">
      <form noValidate onSubmit={simpan} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {kolom.map((k) => (
            <IsianForm
              key={k.id}
              id={`sandi-${k.id}`}
              label={k.label}
              wajib
              petunjuk={k.petunjuk}
              galat={galat[k.id]}
              className={k.penuh ? 'sm:col-span-2' : ''}
            >
              {(props) => (
                <input
                  {...props}
                  type={lihat ? 'text' : 'password'}
                  autoComplete={k.autoComplete}
                  value={isi[k.id]}
                  onChange={(e) => setIsi((lama) => ({ ...lama, [k.id]: e.target.value }))}
                  className={`${KELAS_ISIAN} h-11`}
                />
              )}
            </IsianForm>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-judul">
            <input
              type="checkbox"
              checked={lihat}
              onChange={(e) => setLihat(e.target.checked)}
              className="size-5 flex-none cursor-pointer accent-aksi"
            />
            Tampilkan kata sandi
          </label>
          <button type="submit" className={KELAS_TOMBOL_UTAMA}>
            Simpan kata sandi
          </button>
        </div>
      </form>
    </KartuBagian>
  )
}

export default Profil
