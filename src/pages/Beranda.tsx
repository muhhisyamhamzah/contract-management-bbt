// Halaman Beranda. Isinya (sapaan, kartu status, dll) dikerjakan di tahap 3.

import JudulHalaman from '../components/JudulHalaman'

function Beranda() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <JudulHalaman judul="Beranda" />
    </div>
  )
}

export default Beranda
