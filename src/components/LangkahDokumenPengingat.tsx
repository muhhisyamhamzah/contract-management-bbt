// Langkah 3 form Tambah kontrak: pilih dokumen (PDF atau foto), waktu pengingat,
// dan ringkasan isian sebelum disimpan.

import { formatTanggalSingkat } from '../lib/format'
import { denganTitikRibuan, PILIHAN_PENGINGAT, type DataFormKontrak } from '../lib/formKontrak'
import Ikon from './Ikon'
import PilihFile from './PilihFile'
import TombolPilihan from './TombolPilihan'

type Props = {
  data: DataFormKontrak
  ubah: <K extends keyof DataFormKontrak>(kolom: K, nilai: DataFormKontrak[K]) => void
}

function LangkahDokumenPengingat({ data, ubah }: Props) {
  const periode =
    `${data.tanggalMulai ? formatTanggalSingkat(data.tanggalMulai) : '-'} sampai ` +
    `${data.tanggalBerakhir ? formatTanggalSingkat(data.tanggalBerakhir) : '-'}`

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <PilihFile label="Unggah PDF" ikon="unggah" accept="application/pdf" onPilih={(n) => ubah('namaFile', n)} />
        <PilihFile
          label="Foto dokumen"
          ikon="kamera"
          accept="image/*"
          capture="environment"
          onPilih={(n) => ubah('namaFile', n)}
        />
      </div>

      {data.namaFile && (
        <div className="flex items-center gap-3 rounded-2xl bg-white py-2.5 pr-2.5 pl-3.5 shadow-kotak">
          <Ikon nama="centang" ukuran={20} tebal={2.5} className="flex-none text-berjalan" />
          <span className="min-w-0 flex-1 truncate font-semibold">{data.namaFile}</span>
          <button
            type="button"
            aria-label="Hapus file"
            onClick={() => ubah('namaFile', '')}
            className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-none bg-hapus-latar text-hapus-teks"
          >
            <Ikon nama="sampah" ukuran={18} />
          </button>
        </div>
      )}

      <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
        <legend className="mb-2 p-0 text-[13px] font-semibold text-judul">Ingatkan saya sebelum kontrak habis</legend>
        <div className="grid grid-cols-3 gap-2">
          {PILIHAN_PENGINGAT.map((hari) => (
            <TombolPilihan
              key={hari}
              label={`${hari} hari`}
              aktif={data.pengingatHari === hari}
              onPilih={() => ubah('pengingatHari', hari)}
              className="rounded-[14px]"
            />
          ))}
        </div>
      </fieldset>

      {/* Ringkasan sebelum simpan */}
      <section aria-labelledby="judul-ringkasan" className="flex flex-col gap-2 rounded-[18px] bg-lembut p-4">
        <h2 id="judul-ringkasan" className="m-0 text-[12px] font-extrabold tracking-[0.06em] text-aksi-tua uppercase">
          Ringkasan
        </h2>
        <span className="text-[16px] font-bold text-judul">{data.judul || '-'}</span>
        <span className="text-[13px] text-aksi-tua">
          {data.nomor || '-'} · {data.jenis}
        </span>
        <span className="text-[13px] text-aksi-tua">{data.mitra || '-'}</span>
        <span className="font-semibold text-judul">Rp {denganTitikRibuan(data.nilai) || '0'}</span>
        <span className="text-[13px] text-aksi-tua">{periode}</span>
      </section>
    </>
  )
}

export default LangkahDokumenPengingat
