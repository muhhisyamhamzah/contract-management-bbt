// Halaman pengingat. Daftar "Sudah lewat" dan "Habis dalam 30 hari" dikerjakan di tahap 5.

import JudulHalaman from '../components/JudulHalaman'

function Pengingat() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <JudulHalaman
        judul="Pengingat"
        keterangan="Kontrak yang perlu diputuskan: diperpanjang atau ditutup."
      />
    </div>
  )
}

export default Pengingat
