// Jendela konfirmasi sebelum aksi penting, misalnya menghapus kontrak.
// Memakai elemen <dialog> bawaan browser: fokus otomatis terkunci di dalam dialog,
// dan tombol Escape menutupnya (dianggap Batal).

import { useEffect, useRef } from 'react'

type Props = {
  terbuka: boolean
  judul: string
  pesan: string
  /** Teks tombol konfirmasi, misalnya "Hapus". */
  labelKonfirmasi: string
  /** true kalau aksinya berbahaya (menghapus): tombol konfirmasi merah. */
  bahaya?: boolean
  onKonfirmasi: () => void
  onBatal: () => void
}

function DialogKonfirmasi({
  terbuka,
  judul,
  pesan,
  labelKonfirmasi,
  bahaya = false,
  onKonfirmasi,
  onBatal,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

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
      aria-labelledby="judul-dialog"
      aria-describedby="pesan-dialog"
      // Escape atau klik tombol kembali di HP: dianggap Batal.
      onCancel={(event) => {
        event.preventDefault()
        onBatal()
      }}
      className="m-auto w-[calc(100%-40px)] max-w-[360px] rounded-[20px] border-none bg-white p-5 text-teks shadow-toast backdrop:bg-galaxy-900/50"
    >
      <h2 id="judul-dialog" className="m-0 text-[17px] text-judul">
        {judul}
      </h2>
      <p id="pesan-dialog" className="m-0 mt-2 text-[14px] leading-normal text-teks-lembut">
        {pesan}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onBatal}
          className="h-12 cursor-pointer rounded-[14px] border border-garis bg-white font-semibold text-judul"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onKonfirmasi}
          className={`h-12 cursor-pointer rounded-[14px] border-none font-semibold text-white ${
            bahaya ? 'bg-hapus' : 'bg-aksi'
          }`}
        >
          {labelKonfirmasi}
        </button>
      </div>
    </dialog>
  )
}

export default DialogKonfirmasi
