// Jendela konfirmasi sebelum aksi penting: simpan, tandai selesai, hapus, nonaktifkan akun, keluar.
// Memakai elemen <dialog> bawaan browser: fokus otomatis terkunci di dalam dialog,
// dan tombol Escape menutupnya (dianggap Batal).

import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = {
  terbuka: boolean
  judul: string
  pesan?: ReactNode
  /** Isi tambahan di bawah pesan, misalnya kotak isian keterangan atau ringkasan. */
  children?: ReactNode
  /** Teks tombol konfirmasi, misalnya "Hapus". */
  labelKonfirmasi: string
  /** Teks tombol batal. Bawaan "Batal". */
  labelBatal?: string
  /** true kalau aksinya berbahaya (menghapus): tombol konfirmasi merah. */
  bahaya?: boolean
  /** Tombol konfirmasi dimatikan, misalnya selama keterangan wajib belum diisi. */
  konfirmasiNonaktif?: boolean
  /** Dialog lebih lebar, untuk ringkasan. */
  lebar?: boolean
  /** Tanpa tombol Batal (dialog informasi, misalnya kartu kata sandi sementara). */
  tanpaBatal?: boolean
  onKonfirmasi: () => void
  onBatal: () => void
}

function DialogKonfirmasi({
  terbuka,
  judul,
  pesan,
  children,
  labelKonfirmasi,
  labelBatal = 'Batal',
  bahaya = false,
  konfirmasiNonaktif = false,
  lebar = false,
  tanpaBatal = false,
  onKonfirmasi,
  onBatal,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()

  // Buka atau tutup <dialog> mengikuti nilai "terbuka".
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (terbuka && !el.open) el.showModal()
    if (!terbuka && el.open) el.close()
  }, [terbuka])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-judul`}
      aria-describedby={pesan ? `${id}-pesan` : undefined}
      // Escape atau tombol kembali di HP: dianggap Batal.
      onCancel={(event) => {
        event.preventDefault()
        onBatal()
      }}
      className={`m-auto w-[calc(100%-32px)] rounded-[20px] border-none bg-white p-6 text-teks shadow-toast backdrop:bg-galaxy-900/55 ${
        lebar ? 'max-w-[520px]' : 'max-w-[420px]'
      }`}
    >
      <h2 id={`${id}-judul`} className="m-0 text-[18px] text-judul">
        {judul}
      </h2>
      {pesan && (
        <p id={`${id}-pesan`} className="m-0 mt-2 text-[14px] leading-normal text-teks-lembut">
          {pesan}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
      <div className={`mt-6 grid gap-2.5 ${tanpaBatal ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {!tanpaBatal && (
          <button
            type="button"
            onClick={onBatal}
            className="h-12 cursor-pointer rounded-[14px] border border-garis-input bg-white font-semibold text-judul"
          >
            {labelBatal}
          </button>
        )}
        <button
          type="button"
          onClick={onKonfirmasi}
          disabled={konfirmasiNonaktif}
          className={`h-12 cursor-pointer rounded-[14px] border-none font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            bahaya ? 'bg-hapus' : 'bg-linear-135 from-galaxy-900 to-galaxy-700'
          }`}
        >
          {labelKonfirmasi}
        </button>
      </div>
    </dialog>
  )
}

export default DialogKonfirmasi
