// Halaman Tambah kontrak: form 3 langkah (info kontrak; nilai dan waktu; dokumen dan pengingat).
// Tiap langkah divalidasi sebelum boleh lanjut. Langkah 3 menampilkan ringkasan sebelum disimpan.
// Belum ada backend: "Simpan" hanya memunculkan toast lalu membuka daftar Kontrak.

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import LangkahDokumenPengingat from '../components/LangkahDokumenPengingat'
import LangkahInfoKontrak from '../components/LangkahInfoKontrak'
import LangkahNilaiWaktu from '../components/LangkahNilaiWaktu'
import {
  DATA_AWAL,
  kolomKosong,
  NAMA_LANGKAH,
  periksaLangkah,
  type DataFormKontrak,
  type Langkah,
} from '../lib/formKontrak'
import { useKembali } from '../lib/navigasi'
import { useToast } from '../lib/toast'

const SEMUA_LANGKAH: Langkah[] = [1, 2, 3]

function FormKontrak() {
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  // Kalau halaman dibuka langsung lewat alamat, tombol Batal menuju Beranda.
  const batal = useKembali('/')

  const [data, setData] = useState<DataFormKontrak>(DATA_AWAL)
  const [langkah, setLangkah] = useState<Langkah>(1)
  const [galat, setGalat] = useState('')
  const isi = useRef<HTMLDivElement>(null)

  // Kolom wajib yang kosong baru ditandai merah setelah mencoba lanjut.
  const kosong = galat ? kolomKosong(langkah, data) : []

  function ubah<K extends keyof DataFormKontrak>(kolom: K, nilai: DataFormKontrak[K]) {
    setData((lama) => ({ ...lama, [kolom]: nilai }))
    setGalat('')
  }

  function pindahLangkah(baru: Langkah) {
    setLangkah(baru)
    setGalat('')
    isi.current?.scrollTo({ top: 0 })
  }

  function lanjut() {
    const pesan = periksaLangkah(langkah, data)
    if (pesan) {
      setGalat(pesan)
      return
    }
    if (langkah < 3) {
      pindahLangkah((langkah + 1) as Langkah)
      return
    }
    // Simpan (sementara: belum ada backend).
    tampilkanToast(`Kontrak tersimpan. Pengingat aktif ${data.pengingatHari} hari sebelum habis.`)
    navigate('/kontrak', { replace: true })
  }

  function kembali() {
    if (langkah > 1) pindahLangkah((langkah - 1) as Langkah)
    else batal()
  }

  return (
    <>
      <div ref={isi} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <HeaderGelombang kelasBawah="pb-12">
          <div className="flex flex-col gap-4">
            <div className="-mt-1.5 flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Batal"
                onClick={batal}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-[14px] border-none bg-white/14 text-white"
              >
                <Ikon nama="tutup" ukuran={20} />
              </button>
              <span className="flex flex-col">
                <h1 className="m-0 text-[18px] font-bold">Kontrak baru</h1>
                <span aria-live="polite" className="text-[12px] text-white/75">
                  Langkah {langkah} dari 3 · {NAMA_LANGKAH[langkah]}
                </span>
              </span>
            </div>

            {/* Penanda langkah: 3 garis, yang sudah dilewati berwarna emas */}
            <div aria-hidden="true" className="grid grid-cols-3 gap-1.5">
              {SEMUA_LANGKAH.map((l) => (
                <div
                  key={l}
                  className={`h-[5px] rounded-full transition-colors duration-200 motion-reduce:transition-none ${
                    l <= langkah ? 'bg-logo-emas' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </HeaderGelombang>

        <div className="flex flex-col gap-4 px-5 pt-3 pb-6">
          {langkah === 1 && <LangkahInfoKontrak data={data} ubah={ubah} kosong={kosong} />}
          {langkah === 2 && <LangkahNilaiWaktu data={data} ubah={ubah} kosong={kosong} />}
          {langkah === 3 && <LangkahDokumenPengingat data={data} ubah={ubah} />}

          {galat && (
            <div
              role="alert"
              className="rounded-[14px] bg-hapus-latar px-3.5 py-3 text-[13px] font-semibold text-hapus-teks"
            >
              {galat}
            </div>
          )}
        </div>
      </div>

      {/* Tombol bawah */}
      <div className="grid flex-none grid-cols-2 gap-2.5 border-t border-garis bg-white px-5 pt-3 pb-[max(26px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={kembali}
          className="h-[50px] cursor-pointer rounded-[14px] border border-garis bg-white font-semibold text-judul"
        >
          {langkah === 1 ? 'Batal' : 'Kembali'}
        </button>
        <button
          type="button"
          onClick={lanjut}
          className="h-[50px] cursor-pointer rounded-[14px] border-none bg-linear-135 from-galaxy-900 to-galaxy-700 font-semibold text-white shadow-tombol-tambah"
        >
          {langkah === 3 ? 'Simpan kontrak' : 'Lanjut'}
        </button>
      </div>
    </>
  )
}

export default FormKontrak
