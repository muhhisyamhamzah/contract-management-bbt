// Halaman Masuk: email kantor + kata sandi, dengan pembatasan percobaan masuk.
// Pesan gagal: akun tidak ditemukan, akun nonaktif, kata sandi salah, akun dikunci sementara.
// Tidak ada "lupa kata sandi" otomatis. Panel "Lupa kata sandi?" menjelaskan dua jalan (Hisyam 18 Nov 2026):
// - pengguna: admin IT membuat kata sandi sementara lewat menu Admin;
// - admin: direset admin lain; kalau tidak ada admin lain, tim IT mengganti kata sandi langsung di database.
//
// Belum ada backend: akun memakai data contoh (src/data/akunContoh.ts). Kotak "Akun contoh"
// di bawah form memudahkan demo, dan dibuang saat backend sudah ada.

import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Ikon from '../components/Ikon'
import IsianForm from '../components/IsianForm'
import Mozaik from '../components/Mozaik'
import { akunContoh, SANDI_CONTOH } from '../data/akunContoh'
import { MAKS_PERCOBAAN_MASUK, useData, type HasilMasuk } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
import { KELAS_ISIAN, KELAS_TOMBOL_UTAMA } from '../lib/tataLetak'

/** Pesan kesalahan masuk yang menjelaskan cara memperbaikinya. */
function pesanGagal(hasil: Exclude<HasilMasuk, { berhasil: true }>): string {
  switch (hasil.alasan) {
    case 'tidak-ada':
      return 'Email ini belum terdaftar. Periksa ejaannya, atau minta admin membuatkan akun.'
    case 'nonaktif':
      return 'Akun ini sedang dinonaktifkan. Hubungi admin untuk mengaktifkannya lagi.'
    case 'sandi':
      return `Kata sandi salah. Sisa ${hasil.sisaPercobaan} kali percobaan sebelum akun dikunci sementara.`
    case 'terkunci':
      return `Terlalu banyak percobaan gagal. Akun dikunci sementara, coba lagi dalam ${hasil.sisaDetik} detik.`
  }
}

/** Akun contoh yang ditampilkan untuk demo: satu pengguna dan satu admin. */
const AKUN_DEMO = akunContoh.filter((a) => a.id === 'a2' || a.id === 'a5')

function Masuk() {
  useJudulHalaman('Masuk')
  const { pengguna, masuk } = useData()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [sandi, setSandi] = useState('')
  const [lihatSandi, setLihatSandi] = useState(false)
  const [galatKolom, setGalatKolom] = useState<{ email?: string; sandi?: string }>({})
  const [galatMasuk, setGalatMasuk] = useState('')
  // Panel bantuan lupa kata sandi (tetap terlihat, tidak hilang sendiri seperti toast).
  const [bantuanSandi, setBantuanSandi] = useState(false)
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
    <div className="relative flex min-h-dvh flex-col bg-latar">
      <Mozaik pendek />

      <main className="relative z-10 mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 pt-[120px] pb-10 md:pt-[170px]">
        {/* Logo dan judul: logo duduk langsung di latar terang, warnanya tidak diubah */}
        <div className="flex flex-col items-center text-center">
          <img src="/logo-bbt.png" alt="Badan Bank Tanah" width={1160} height={464} fetchPriority="high" className="block h-12 w-auto md:h-14" />
          <h1 className="m-0 mt-6 text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] text-judul md:text-[40px]">
            Contract Management
          </h1>
          <p className="m-0 mt-3 text-[15px] text-teks-lembut">
            Badan Bank Tanah. Masuk dengan email kantor Anda.
          </p>
        </div>

        {/* Kartu masuk */}
        <div className="mt-8 rounded-[20px] border border-garis bg-white p-6 text-teks md:rounded-3xl md:p-8">
          <h2 className="m-0 text-[20px] text-judul">Masuk ke akun</h2>

          <form noValidate onSubmit={kirim} className="mt-5 flex flex-col gap-4">
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
                    spellCheck={false}
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
                    className="absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut hover:text-judul"
                  >
                    <Ikon nama={lihatSandi ? 'mataTutup' : 'mata'} ukuran={18} />
                  </button>
                </span>
              )}
            </IsianForm>

            <button type="submit" className={`${KELAS_TOMBOL_UTAMA} mt-2 w-full`}>
              Masuk
            </button>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                aria-expanded={bantuanSandi}
                aria-controls="bantuan-sandi"
                onClick={() => setBantuanSandi(!bantuanSandi)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1 border-none bg-transparent px-2 text-[13px] font-semibold text-aksi underline-offset-2 hover:underline"
              >
                Lupa kata sandi?
                <Ikon
                  nama="bawah"
                  ukuran={16}
                  tebal={2.5}
                  className={`transition-transform duration-150 motion-reduce:transition-none ${bantuanSandi ? 'rotate-180' : ''}`}
                />
              </button>
              {bantuanSandi && (
                <dl id="bantuan-sandi" className="m-0 flex w-full flex-col gap-3 rounded-2xl bg-latar px-4 py-3.5 text-[13px]">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-semibold text-judul">Pengguna</dt>
                    <dd className="m-0 text-teks-lembut">
                      Hubungi admin. Admin membuatkan kata sandi sementara lewat menu Admin, lalu Anda masuk dengan kata sandi itu.
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-semibold text-judul">Admin</dt>
                    <dd className="m-0 text-teks-lembut">
                      Minta admin lain mereset kata sandi Anda. Kalau tidak ada admin lain, tim IT mengganti kata sandi langsung di
                      database.
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </form>

          {/* Khusus purwarupa: akun contoh supaya demo cepat. */}
          <div className="mt-5 rounded-2xl border border-dashed border-garis-input bg-latar p-4">
            <p className="m-0 text-[12px] text-teks-lembut">
              <span className="font-semibold text-judul">Akun contoh untuk purwarupa.</span> Kata sandi{' '}
              <span className="font-semibold text-judul">{SANDI_CONTOH}</span>. Akun dikunci sementara setelah{' '}
              {MAKS_PERCOBAAN_MASUK} kali salah.
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
                  className="flex min-h-11 cursor-pointer flex-col items-start rounded-xl border border-garis bg-white px-3 py-2 text-left transition-[border-color] duration-150 hover:border-garis-input motion-reduce:transition-none"
                >
                  <span className="text-[13px] font-semibold text-judul">{a.nama}</span>
                  <span className="text-[12px] text-teks-lembut">{a.peran === 'admin' ? 'Admin' : a.jabatan}</span>
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
