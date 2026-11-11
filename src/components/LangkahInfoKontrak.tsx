// Langkah 1 form Tambah kontrak: judul, nomor, jenis, mitra, dan unit pemilik.

import { KELAS_ISIAN, PILIHAN_JENIS, UNIT_KERJA, type DataFormKontrak } from '../lib/formKontrak'
import TombolPilihan from './TombolPilihan'

type Props = {
  data: DataFormKontrak
  ubah: <K extends keyof DataFormKontrak>(kolom: K, nilai: DataFormKontrak[K]) => void
  /** Kolom wajib yang masih kosong (ditandai merah setelah mencoba lanjut). */
  kosong: (keyof DataFormKontrak)[]
}

const kelasLabel = 'flex flex-col gap-1.5 text-[13px] font-semibold text-judul'

function LangkahInfoKontrak({ data, ubah, kosong }: Props) {
  return (
    <>
      <label className={kelasLabel}>
        Judul kontrak
        <input
          type="text"
          value={data.judul}
          onChange={(e) => ubah('judul', e.target.value)}
          placeholder="Contoh: Jasa konsultan hukum"
          aria-invalid={kosong.includes('judul')}
          className={KELAS_ISIAN}
        />
      </label>

      <label className={kelasLabel}>
        Nomor kontrak
        <input
          type="text"
          value={data.nomor}
          onChange={(e) => ubah('nomor', e.target.value)}
          placeholder="Contoh: 045/BBT/SPK/2026"
          aria-invalid={kosong.includes('nomor')}
          className={KELAS_ISIAN}
        />
      </label>

      <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
        <legend className="mb-2 p-0 text-[13px] font-semibold text-judul">Jenis kontrak</legend>
        <div className="flex flex-wrap gap-2">
          {PILIHAN_JENIS.map((jenis) => (
            <TombolPilihan
              key={jenis}
              label={jenis}
              aktif={data.jenis === jenis}
              onPilih={() => ubah('jenis', jenis)}
            />
          ))}
        </div>
      </fieldset>

      <label className={kelasLabel}>
        Mitra (pihak kedua)
        <input
          type="text"
          value={data.mitra}
          onChange={(e) => ubah('mitra', e.target.value)}
          placeholder="Nama perusahaan atau instansi"
          aria-invalid={kosong.includes('mitra')}
          className={KELAS_ISIAN}
        />
      </label>

      <label className={kelasLabel}>
        Unit pemilik
        <select
          value={data.unitPemilik}
          onChange={(e) => ubah('unitPemilik', e.target.value)}
          className={KELAS_ISIAN}
        >
          <option value="">Pilih unit kerja</option>
          {UNIT_KERJA.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}

export default LangkahInfoKontrak
