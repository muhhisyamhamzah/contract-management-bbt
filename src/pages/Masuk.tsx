// Halaman Masuk: email kantor + kata sandi, dengan pembatasan percobaan masuk.
// Pesan gagal: akun tidak ditemukan, akun nonaktif, kata sandi salah, akun dikunci sementara.
// Tidak ada "lupa kata sandi" otomatis: pengguna menghubungi admin IT.
//
// Belum ada backend: akun memakai data contoh (src/data/akunContoh.ts). Kotak "Akun contoh"
// di bawah form memudahkan demo, dan dibuang saat backend sudah ada.

import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Ikon from '../components/Ikon'
import IsianForm from '../components/IsianForm'
import { akunContoh, SANDI_CONTOH } from '../data/akunContoh'
import { MAKS_PERCOBAAN_MASUK, useData, type HasilMasuk } from '../lib/data'
import { KELAS_ISIAN, KELAS_TOMBOL_UTAMA } from '../lib/tataLetak'
import { useToast } from '../lib/toast'

/** Pesan kesalahan masuk yang menjelaskan cara memperbaikinya. */
function pesanGagal(hasil: Exclude<HasilMasuk, { berhasil: true }>): string {
  switch (hasil.alasan) {
    case 'tidak-ada':
      return 'Email ini belum terdaftar. Periksa ejaannya, atau minta admin IT membuatkan akun.'
    case 'nonaktif':
      return 'Akun ini sedang dinonaktifkan. Hubungi admin IT untuk mengaktifkannya lagi.'
    case 'sandi':
      return `Kata sandi salah. Sisa ${hasil.sisaPercobaan} kali percobaan sebelum akun dikunci sementara.`
    case 'terkunci':
      return `Terlalu banyak percobaan gagal. Akun dikunci sementara, coba lagi dalam ${hasil.sisaDetik} detik.`
  }
}

/** Akun contoh yang ditampilkan untuk demo: satu pengguna dan satu admin. */
const AKUN_DEMO = akunContoh.filter((a) => a.id === 'a2' || a.id === 'a5')

function Masuk() {
  const { pengguna, masuk } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const tampilkanToast = useToast()

  const [email, setEmail] = useState('')
  const [sandi, setSandi] = useState('')
  const [lihatSandi, setLihatSandi] = useState(false)
  const [galatKolom, setGalatKolom] = useState<{ email?: string; sandi?: string }>({})
  const [galatMasuk, setGalatMasuk] = useState('')
  const isianEmail = useRef<HTMLInputElement>(null)
  const isianSandi = useRef<HTMLInputElement>(null)

  const tujuan = (location.state as { dari?: string } | null)?.dari ?? '/'

  if (pengguna) return <Navigate to={tujuan} replace />

  function kirim(event: FormEvent) {
    event.preventDefault()
    setGalatMasuk('')

    const galat: { email?: string; sandi?: string } = {}
    if (!email.trim()) galat.email = 'Isi email kantor, misalnya nama@banktanah.id.'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) galat.email = 'Format email belum benar, misalnya nama@banktanah.id.'
    if (!sandi) galat.sandi = 'Isi kata sandi.'
    setGalatKolom(galat)
    if (galat.email) return isianEmail.current?.focus()
    if (galat.sandi) return isianSandi.current?.focus()

    const hasil = masuk(email, sandi)
    if (!hasil.berhasil) {
      setGalatMasuk(pesanGagal(hasil))
      if (hasil.alasan === 'sandi') {
        setSandi('')
        isianSandi.current?.focus()
      }
      return
    }
    navigate(tujuan, { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-linear-150 from-galaxy-900 via-galaxy-900 to-galaxy-700 text-white">
      {/* Hiasan latar (sama dengan header) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[10%] size-[480px] rounded-full bg-aksen/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-[420px] rounded-full bg-aksi/60 blur-3xl" />
        <div className="absolute -top-24 right-[14%] size-80 rounded-full border border-white/10" />
        <div className="absolute -top-48 right-[8%] size-[520px] rounded-full border border-white/[0.06]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1.5px)] bg-size-[14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      </div>

      <main className="relative z-10 mx-auto grid w-full max-w-[1080px] items-center gap-10 px-5 py-10 md:grid-cols-[1fr_440px] md:gap-16 md:py-16">
        {/* Penjelasan singkat aplikasi */}
        <div className="permukaan-gelap flex flex-col gap-5">
          <p className="m-0 text-[13px] font-semibold tracking-[0.08em] text-tombol-emas uppercase">Badan Bank Tanah</p>
          <h1 className="m-0 text-[30px] leading-[1.15] font-bold md:text-[44px]">Contract Management</h1>
          <p className="m-0 max-w-[460px] text-[16px] leading-relaxed text-teks-header">
            Pantau semua kontrak PKS di satu tempat, dan dapatkan pengingat 3, 2, dan 1 bulan sebelum kontrak habis.
          </p>
          <ul className="m-0 hidden list-none flex-col gap-3 p-0 md:flex">
            {[
              'Kontrak yang hampir habis langsung terlihat di Beranda',
              'Klausul berisiko (pengakhiran, denda) tercatat per kontrak',
              'Setiap perubahan tercatat: siapa, kapan, apa yang berubah',
            ].map((teks) => (
              <li key={teks} className="flex items-center gap-3 text-[15px]">
                <span className="flex size-7 flex-none items-center justify-center rounded-full bg-white/10 text-tombol-emas">
                  <Ikon nama="centang" ukuran={16} tebal={2.5} />
                </span>
                {teks}
              </li>
            ))}
          </ul>
        </div>

        {/* Kartu masuk */}
        <div className="rounded-[24px] bg-white p-7 text-teks shadow-toast md:p-9">
          <img src="/logo-bbt.png" alt="Badan Bank Tanah" className="block h-12 w-auto" />
          <h2 className="m-0 mt-6 text-[24px] text-judul">Masuk ke akun</h2>
          <p className="m-0 mt-1 text-teks-lembut">Gunakan email kantor dan kata sandi Anda.</p>

          <form noValidate onSubmit={kirim} className="mt-6 flex flex-col gap-4">
            {galatMasuk && (
              <div role="alert" className="flex gap-2.5 rounded-xl bg-hapus-latar px-3.5 py-3 text-[13px] font-semibold text-hapus-teks">
                <Ikon nama="peringatan" ukuran={18} className="flex-none" />
                {galatMasuk}
              </div>
            )}

            <IsianForm id="isian-email" label="Email kantor" wajib galat={galatKolom.email}>
              {(props) => (
                <span className="relative flex">
                  <Ikon nama="email" ukuran={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-teks-lembut" />
                  <input
                    {...props}
                    ref={isianEmail}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@banktanah.id"
                    className={`${KELAS_ISIAN} h-12 pl-11`}
                  />
                </span>
              )}
            </IsianForm>

            <IsianForm id="isian-sandi" label="Kata sandi" wajib galat={galatKolom.sandi}>
              {(props) => (
                <span className="relative flex">
                  <Ikon nama="kunci" ukuran={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-teks-lembut" />
                  <input
                    {...props}
                    ref={isianSandi}
                    type={lihatSandi ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={sandi}
                    onChange={(e) => setSandi(e.target.value)}
                    className={`${KELAS_ISIAN} h-12 pr-12 pl-11`}
                  />
                  <button
                    type="button"
                    aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    aria-pressed={lihatSandi}
                    onClick={() => setLihatSandi(!lihatSandi)}
                    className="absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-teks-lembut hover:text-judul"
                  >
                    <Ikon nama={lihatSandi ? 'mataTutup' : 'mata'} ukuran={18} />
                  </button>
                </span>
              )}
            </IsianForm>

            <button type="submit" className={`${KELAS_TOMBOL_UTAMA} mt-2 h-12 w-full`}>
              Masuk
            </button>

            <p className="m-0 text-center text-[13px] text-teks-lembut">
              Lupa kata sandi?{' '}
              <button
                type="button"
                onClick={() => tampilkanToast('Hubungi admin IT untuk dibuatkan kata sandi sementara.')}
                className="min-h-11 cursor-pointer border-none bg-transparent p-0 font-semibold text-aksi underline-offset-2 hover:underline"
              >
                Hubungi admin IT
              </button>
            </p>
          </form>

          {/* Khusus purwarupa: akun contoh supaya demo cepat. */}
          <div className="mt-4 rounded-2xl border border-dashed border-garis-input bg-latar p-4">
            <p className="m-0 text-[12px] font-semibold text-teks-lembut">
              Akun contoh (purwarupa) · kata sandi <span className="font-mono text-judul">{SANDI_CONTOH}</span> · dikunci
              setelah {MAKS_PERCOBAAN_MASUK} kali salah
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {AKUN_DEMO.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setEmail(a.email)
                    setSandi(SANDI_CONTOH)
                    setGalatKolom({})
                    setGalatMasuk('')
                  }}
                  className="flex min-h-11 cursor-pointer flex-col items-start rounded-xl border border-garis bg-white px-3 py-2 text-left hover:border-garis-input"
                >
                  <span className="text-[13px] font-semibold text-judul">{a.nama}</span>
                  <span className="text-[12px] text-teks-lembut">{a.peran === 'admin' ? 'Admin IT' : a.jabatan}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Masuk
