// Riwayat perubahan satu kontrak (atau semua, di halaman Admin): siapa, kapan, apa yang berubah.

import { formatWaktu } from '../lib/format'
import type { CatatanRiwayat } from '../types/kontrak'
import Ikon, { type NamaIkon } from './Ikon'

/** Ikon dan warna tiap jenis aksi. */
const TAMPILAN_AKSI: Record<CatatanRiwayat['aksi'], { ikon: NamaIkon; kelas: string; label: string }> = {
  tambah: { ikon: 'tambah', kelas: 'bg-berjalan-latar text-berjalan-teks', label: 'Tambah' },
  ubah: { ikon: 'pensil', kelas: 'bg-lembut text-aksi', label: 'Ubah' },
  hapus: { ikon: 'sampah', kelas: 'bg-hapus-latar text-hapus-teks', label: 'Hapus' },
  selesai: { ikon: 'centang', kelas: 'bg-selesai-latar text-selesai-teks', label: 'Selesai' },
  unggah: { ikon: 'unggah', kelas: 'bg-segera-latar text-segera-teks', label: 'Unggah' },
  akun: { ikon: 'pengguna', kelas: 'bg-lembut text-aksi-tua', label: 'Akun' },
}

type Props = {
  daftar: CatatanRiwayat[]
  /** Pesan kalau kosong. */
  pesanKosong?: string
}

function RiwayatKontrak({ daftar, pesanKosong = 'Belum ada perubahan yang tercatat.' }: Props) {
  if (daftar.length === 0) {
    return <p className="m-0 py-4 text-center text-teks-lembut">{pesanKosong}</p>
  }

  return (
    <ol className="m-0 list-none p-0">
      {daftar.map((catatan, i) => {
        const tampilan = TAMPILAN_AKSI[catatan.aksi]
        return (
          <li key={catatan.id} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-8 flex-none items-center justify-center rounded-full ${tampilan.kelas}`}
                aria-hidden="true"
              >
                <Ikon nama={tampilan.ikon} ukuran={15} tebal={2.3} />
              </span>
              {i < daftar.length - 1 && <span aria-hidden="true" className="w-0.5 flex-1 bg-garis" />}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5 pt-1 pb-5">
              <span className="text-[14px] leading-snug text-judul">
                <span className="sr-only">{tampilan.label}: </span>
                {catatan.rincian}
              </span>
              <span className="text-[12px] text-teks-lembut">
                {catatan.oleh}, {formatWaktu(catatan.waktu)}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default RiwayatKontrak
