// Halaman detail satu kontrak. Alamatnya /kontrak/:id, misalnya /kontrak/k-001.
// Isi (cincin sisa hari, tab, tombol aksi) dikerjakan nanti.

import { Link, useParams } from 'react-router-dom'
import JudulHalaman from '../components/JudulHalaman'

function DetailKontrak() {
  const { id } = useParams()

  return (
    <main className="mx-auto min-h-dvh max-w-md">
      <Link
        to="/kontrak"
        className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-aksi"
      >
        ← Kembali
      </Link>
      <JudulHalaman judul="Detail Kontrak" keterangan={`ID: ${id}`} />
    </main>
  )
}

export default DetailKontrak
