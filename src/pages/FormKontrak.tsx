// Halaman tambah kontrak. Form 3 langkah dikerjakan di tahap 7.

import JudulHalaman from '../components/JudulHalaman'
import { useKembali } from '../lib/navigasi'

function FormKontrak() {
  // Kalau halaman dibuka langsung lewat alamat, tombol Batal menuju Beranda.
  const batal = useKembali('/')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <JudulHalaman judul="Kontrak baru">
        <button
          type="button"
          onClick={batal}
          className="mt-2 h-11 self-start rounded-[14px] bg-latar px-4 font-bold text-judul"
        >
          Batal
        </button>
      </JudulHalaman>
    </div>
  )
}

export default FormKontrak
