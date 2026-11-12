// Langkah 2 form Tambah kontrak: nilai, tanggal mulai dan berakhir, dan termin pembayaran.

import {
  denganTitikRibuan,
  hanyaAngka,
  KELAS_ISIAN,
  MAKS_TERMIN,
  type DataFormKontrak,
  type IsianTermin,
} from '../lib/formKontrak'

type Props = {
  data: DataFormKontrak
  ubah: <K extends keyof DataFormKontrak>(kolom: K, nilai: DataFormKontrak[K]) => void
  /** Kolom wajib yang masih kosong (ditandai merah setelah mencoba lanjut). */
  kosong: (keyof DataFormKontrak)[]
}

const kelasLabel = 'flex flex-col gap-1.5 text-[13px] font-semibold text-judul'
const kelasIsianKecil =
  'h-11 min-w-0 rounded-xl border border-garis-input bg-white px-2.5 text-[13px] text-teks outline-none focus:border-aksi focus:ring-2 focus:ring-aksi/20'

function LangkahNilaiWaktu({ data, ubah, kosong }: Props) {
  function ubahTermin(indeks: number, perubahan: Partial<IsianTermin>) {
    ubah(
      'termin',
      data.termin.map((t, i) => (i === indeks ? { ...t, ...perubahan } : t)),
    )
  }

  return (
    <>
      {/* Nilai kontrak dengan awalan "Rp", ditampilkan dengan titik ribuan */}
      <label className={kelasLabel}>
        Nilai kontrak
        <span
          className={`flex h-[50px] items-center gap-2 rounded-[14px] border bg-white px-3.5 focus-within:border-aksi focus-within:ring-2 focus-within:ring-aksi/20 ${
            kosong.includes('nilai') ? 'border-hapus' : 'border-garis-input'
          }`}
        >
          <span className="font-semibold text-teks-lembut">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={denganTitikRibuan(data.nilai)}
            onChange={(e) => ubah('nilai', hanyaAngka(e.target.value))}
            placeholder="0"
            aria-invalid={kosong.includes('nilai')}
            className="min-w-0 flex-1 border-none bg-transparent text-right text-[16px] font-semibold text-teks outline-none"
          />
        </span>
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        <label className={kelasLabel}>
          Tanggal mulai
          <input
            type="date"
            value={data.tanggalMulai}
            onChange={(e) => ubah('tanggalMulai', e.target.value)}
            aria-invalid={kosong.includes('tanggalMulai')}
            className={`${KELAS_ISIAN} px-2 text-[14px]`}
          />
        </label>
        <label className={kelasLabel}>
          Tanggal berakhir
          <input
            type="date"
            value={data.tanggalBerakhir}
            min={data.tanggalMulai || undefined}
            onChange={(e) => ubah('tanggalBerakhir', e.target.value)}
            aria-invalid={kosong.includes('tanggalBerakhir')}
            className={`${KELAS_ISIAN} px-2 text-[14px]`}
          />
        </label>
      </div>

      {/* Termin pembayaran */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3.5 shadow-kotak">
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2.5">
          <span className="flex flex-col">
            <span className="font-semibold text-judul">Dibayar bertahap</span>
            <span className="text-[12px] text-teks-lembut">Aktifkan jika ada termin pembayaran</span>
          </span>
          <input
            type="checkbox"
            checked={data.pakaiTermin}
            onChange={(e) => ubah('pakaiTermin', e.target.checked)}
            className="size-[22px] cursor-pointer accent-aksi"
          />
        </label>

        {data.pakaiTermin && (
          <>
            {data.termin.map((termin, i) => {
              const nama = `Termin ${i + 1}`
              return (
                <div key={i} className="grid grid-cols-[70px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
                  <span className="text-[13px] font-semibold text-judul">{nama}</span>
                  <input
                    type="month"
                    aria-label={`Jatuh tempo ${nama}`}
                    value={termin.bulan}
                    onChange={(e) => ubahTermin(i, { bulan: e.target.value })}
                    className={`${kelasIsianKecil} text-[12px]`}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`Persentase ${nama}`}
                    placeholder="% nilai"
                    value={termin.persen}
                    onChange={(e) => ubahTermin(i, { persen: hanyaAngka(e.target.value).slice(0, 3) })}
                    className={`${kelasIsianKecil} text-right`}
                  />
                </div>
              )
            })}
            {data.termin.length < MAKS_TERMIN && (
              <button
                type="button"
                onClick={() => ubah('termin', [...data.termin, { bulan: '', persen: '' }])}
                className="h-11 cursor-pointer rounded-xl border-[1.5px] border-dashed border-aksen bg-white font-semibold text-aksi"
              >
                + Tambah termin
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default LangkahNilaiWaktu
