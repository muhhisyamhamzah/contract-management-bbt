// Halaman tambah kontrak. Form 3 langkah dikerjakan nanti.

import { Link } from 'react-router-dom'
import JudulHalaman from '../components/JudulHalaman'

function FormKontrak() {
  return (
    <main className="mx-auto min-h-dvh max-w-md">
      <Link to="/" className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-aksi">
        ← Batal
      </Link>
      <JudulHalaman judul="Tambah Kontrak" />
    </main>
  )
}

export default FormKontrak
