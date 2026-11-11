// Judul sederhana di bagian atas halaman. Dipakai sementara selama isi halaman belum dibuat.

type Props = {
  judul: string
  keterangan?: string
}

function JudulHalaman({ judul, keterangan }: Props) {
  return (
    <header className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-judul">{judul}</h1>
      {keterangan && <p className="mt-1 text-sm text-teks-lembut">{keterangan}</p>}
    </header>
  )
}

export default JudulHalaman
