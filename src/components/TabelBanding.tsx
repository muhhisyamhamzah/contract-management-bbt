// Tabel perbandingan dua sisi, misalnya "Sekarang | Setelah adendum" (Catat adendum) atau
// "Saat dokumen ini | Terbaru" (Detail kontrak saat dokumen lama dibuka).
// Laptop: tabel tiga kolom. HP: daftar bertumpuk (nama data, lalu dua nilai berdampingan), karena tabel tiga kolom
// di 390px memotong kolom kanan yang justru paling penting. Hanya satu yang tampil (yang lain display:none),
// jadi pembaca layar tidak membacanya dua kali. Nilai kanan yang berbeda dari kiri ditebalkan.

export type BarisBanding = [label: string, kiri: string, kanan: string]

type Props = {
  judulKiri: string
  judulKanan: string
  baris: BarisBanding[]
  /** Label tersembunyi untuk kolom pertama (nama data). */
  labelData?: string
  /**
   * "-" di kanan dihitung sebagai perubahan (isi dihapus). Benar untuk perbandingan versi (Detail);
   * di Catat adendum "-" berarti belum diisi, jadi bukan perubahan.
   */
  kosongBerubah?: boolean
}

function TabelBanding({ judulKiri, judulKanan, baris, labelData = 'Data', kosongBerubah = false }: Props) {
  const berubah = (kiri: string, kanan: string) => kanan !== kiri && (kosongBerubah || kanan !== '-')
  return (
    <>
      <dl className="m-0 flex flex-col rounded-2xl border border-garis sm:hidden">
        {baris.map(([label, kiri, kanan]) => (
          <div key={label} className="flex flex-col gap-1.5 border-t border-garis-lembut px-4 py-3 first:border-t-0">
            <dt className="text-[13px] text-teks-lembut">{label}</dt>
            {/* HP: nilai yang sama ditulis sekali saja, supaya kolom sempit tidak memotong isi. */}
            {kiri === kanan ? (
              <dd className="m-0 flex flex-col text-[14px]">
                <span className="text-[12px] text-teks-lembut">Sama di keduanya</span>
                <span className="text-teks">{kanan}</span>
              </dd>
            ) : (
            <dd className="m-0 grid grid-cols-2 gap-3 text-[14px]">
              <span className="flex flex-col">
                <span className="text-[12px] text-teks-lembut">{judulKiri}</span>
                <span className="text-teks">{kiri}</span>
              </span>
              <span className="flex flex-col">
                <span className="text-[12px] text-teks-lembut">{judulKanan}</span>
                <span className={berubah(kiri, kanan) ? 'font-bold text-judul' : 'text-teks'}>{kanan}</span>
              </span>
            </dd>
            )}
          </div>
        ))}
      </dl>
      <div className="hidden overflow-x-auto rounded-2xl border border-garis sm:block">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="bg-latar text-[12px] text-teks-lembut">
              <th scope="col" className="px-4 py-2.5 font-semibold">
                <span className="sr-only">{labelData}</span>
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                {judulKiri}
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                {judulKanan}
              </th>
            </tr>
          </thead>
          <tbody>
            {baris.map(([label, kiri, kanan]) => (
              <tr key={label} className="border-t border-garis-lembut align-top">
                <th scope="row" className="px-4 py-2.5 font-normal text-teks-lembut">
                  {label}
                </th>
                <td className="px-4 py-2.5 text-teks">{kiri}</td>
                <td className={`px-4 py-2.5 ${berubah(kiri, kanan) ? 'font-bold text-judul' : 'text-teks'}`}>{kanan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TabelBanding
