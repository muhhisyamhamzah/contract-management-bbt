// Halaman detail satu kontrak. Alamatnya /kontrak/:id, misalnya /kontrak/1.
// Isinya (cincin sisa hari, tab, tombol aksi) dikerjakan di tahap 6.

import { useParams } from 'react-router-dom'
import JudulHalaman from '../components/JudulHalaman'
import { useKembali } from '../lib/navigasi'

function DetailKontrak() {
  const { id } = useParams()
  // Kalau halaman dibuka langsung lewat alamat, tombol Kembali menuju daftar kontrak.
  const kembali = useKembali('/kontrak')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <JudulHalaman judul="Detail kontrak" keterangan={`ID: ${id}`}>
        <button
          type="button"
          onClick={kembali}
          className="mt-2 h-11 self-start rounded-[14px] bg-latar px-4 font-bold text-judul"
        >
          Kembali
        </button>
      </JudulHalaman>
    </div>
  )
}

export default DetailKontrak
