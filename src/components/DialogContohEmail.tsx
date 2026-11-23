// Dialog "Contoh email pengingat" (halaman Profil, 21 Nov 2026): menguji isi pengingat sebelum backend ada.
// Menampilkan email yang akan diterima akun ini: tujuan (email pengingat atau email kantor), subjek, dan daftar
// kontrak yang sama dengan isi lonceng. Purwarupa TIDAK mengirim email; pengiriman dibuat di backend (SMTP).

import DialogKonfirmasi from './DialogKonfirmasi'
import { alamatPengingat } from '../lib/akun'
import { useData } from '../lib/data'
import { formatTanggal } from '../lib/format'
import { NAMA_APLIKASI } from '../lib/judulHalaman'
import { susunNotifikasi } from '../lib/notifikasi'
import type { Akun } from '../types/kontrak'

type Props = {
  /** Akun penerima. null = dialog tertutup. */
  akun: Akun | null
  onTutup: () => void
}

function DialogContohEmail({ akun, onTutup }: Props) {
  const { kontrak } = useData()
  if (!akun) return null

  const daftar = susunNotifikasi(kontrak)
  const subjek =
    daftar.length > 0 ? `Pengingat kontrak: ${daftar.length} kontrak perlu diurus` : 'Pengingat kontrak: tidak ada yang perlu diurus'

  return (
    <DialogKonfirmasi
      terbuka
      lebar
      judul="Contoh email pengingat"
      pesan="Begini email yang diterima saat pengingat 3, 2, atau 1 bulan keluar. Isinya sama dengan lonceng notifikasi hari ini."
      labelKonfirmasi="Tutup"
      tanpaBatal
      onKonfirmasi={onTutup}
      onBatal={onTutup}
    >
      <div className="flex flex-col rounded-2xl border border-garis">
        <dl className="m-0 flex flex-col gap-1.5 border-b border-garis-lembut px-4 py-3 text-[13px]">
          {[
            ['Dari', NAMA_APLIKASI],
            ['Kepada', alamatPengingat(akun)],
            ['Subjek', subjek],
          ].map(([label, isi]) => (
            <div key={label} className="flex gap-3">
              <dt className="w-14 flex-none text-teks-lembut">{label}</dt>
              <dd className="m-0 min-w-0 font-semibold break-words text-judul">{isi}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 px-4 py-4 text-[14px] text-teks">
          <p className="m-0">Halo {akun.nama},</p>
          {daftar.length > 0 ? (
            <>
              <p className="m-0">Kontrak berikut perlu diperpanjang, diadendum, atau ditandai selesai:</p>
              <ul className="m-0 flex flex-col gap-2 pl-5">
                {daftar.map((n) => (
                  <li key={n.id}>
                    <span className="font-semibold text-judul">{n.judul}</span> ({formatTanggal(n.tanggal)}): {n.isi}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="m-0">Belum ada kontrak yang perlu diurus.</p>
          )}
          <p className="m-0">Buka {NAMA_APLIKASI} dan masuk dengan email kantor untuk melihat rinciannya.</p>
        </div>
      </div>
      <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-segera-latar px-3.5 py-2.5 text-[13px] text-segera-teks">
        Ini pratinjau. Purwarupa belum mengirim email sungguhan; pengirimannya dibuat nanti di backend.
      </p>
    </DialogKonfirmasi>
  )
}

export default DialogContohEmail
