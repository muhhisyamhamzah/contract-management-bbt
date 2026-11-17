// Halaman Admin (hanya admin IT): akun pengguna dan riwayat perubahan.
// Admin bisa menambah akun, mereset kata sandi (kata sandi sementara tampil sekali), dan
// menonaktifkan / mengaktifkan akun. Hapus kontrak permanen, jadi tidak ada tab arsip.

import { useRef, useState, type KeyboardEvent } from 'react'
import BarisAkun from '../components/BarisAkun'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import DialogTambahAkun from '../components/DialogTambahAkun'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import KartuSandiSementara from '../components/KartuSandiSementara'
import RiwayatKontrak from '../components/RiwayatKontrak'
import { useData, usePengguna } from '../lib/data'
import { KELAS_KOTAK, KELAS_TOMBOL_EMAS, KELAS_WADAH } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Akun } from '../types/kontrak'

type Tab = 'akun' | 'riwayat'

const DAFTAR_TAB: { id: Tab; label: string }[] = [
  { id: 'akun', label: 'Akun pengguna' },
  { id: 'riwayat', label: 'Riwayat perubahan' },
]

type IsiKartuSandi = { nama: string; email: string; sandi: string; judul: string }

function Admin() {
  const pengguna = usePengguna()
  const { akun, riwayat, tambahAkun, resetSandi, ubahAktifAkun } = useData()
  const tampilkanToast = useToast()

  const [tab, setTab] = useState<Tab>('akun')
  const tombolTab = useRef<(HTMLButtonElement | null)[]>([])
  const [dialogTambah, setDialogTambah] = useState(false)
  const [targetReset, setTargetReset] = useState<Akun | null>(null)
  const [targetNonaktif, setTargetNonaktif] = useState<Akun | null>(null)
  const [kartuSandi, setKartuSandi] = useState<IsiKartuSandi | null>(null)

  const jumlahAktif = akun.filter((a) => a.aktif).length

  /** Tombol panah kiri/kanan untuk berpindah tab (pola tab yang ramah keyboard). */
  function pindahTabDenganPanah(event: KeyboardEvent<HTMLButtonElement>, indeks: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const arah = event.key === 'ArrowRight' ? 1 : -1
    const berikut = (indeks + arah + DAFTAR_TAB.length) % DAFTAR_TAB.length
    setTab(DAFTAR_TAB[berikut].id)
    tombolTab.current[berikut]?.focus()
  }

  return (
    <>
      <HeaderGelombang
        judul={tab === 'akun' ? 'Akun pengguna' : 'Riwayat perubahan'}
        keterangan={
          tab === 'akun'
            ? `${jumlahAktif} akun aktif dari ${akun.length}. Tambah akun, reset kata sandi, atau nonaktifkan.`
            : 'Semua tambah, ubah, hapus, tandai selesai, unggah PDF, dan perubahan akun.'
        }
        aksi={
          <button type="button" onClick={() => setDialogTambah(true)} className={KELAS_TOMBOL_EMAS}>
            <Ikon nama="tambah" ukuran={18} tebal={2.5} />
            Tambah akun
          </button>
        }
      />

      <main id="konten" className={`${KELAS_WADAH} relative z-10 -mt-14 flex flex-col gap-5 pb-4`}>
        <div role="tablist" aria-label="Bagian admin" className={`${KELAS_KOTAK} grid grid-cols-2 gap-1 p-1.5`}>
          {DAFTAR_TAB.map((t, i) => {
            const aktif = tab === t.id
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tombolTab.current[i] = el
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={aktif}
                aria-controls={aktif ? `panel-${t.id}` : undefined}
                tabIndex={aktif ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(event) => pindahTabDenganPanah(event, i)}
                className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-none text-[14px] font-semibold transition-[background-color,border-color,color] duration-150 motion-reduce:transition-none ${
                  aktif ? 'bg-galaxy-900 text-white' : 'bg-transparent text-teks hover:bg-latar'
                }`}
              >
                <Ikon nama={t.id === 'akun' ? 'pengguna' : 'riwayat'} ukuran={17} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={`${KELAS_KOTAK} px-4 md:px-7`}>
          {tab === 'akun' ? (
            <ul className="m-0 list-none p-0">
              {akun.map((a) => (
                <BarisAkun
                  key={a.id}
                  akun={a}
                  diriSendiri={a.id === pengguna.id}
                  onResetSandi={() => setTargetReset(a)}
                  onUbahAktif={() => {
                    if (a.aktif) {
                      setTargetNonaktif(a)
                    } else {
                      ubahAktifAkun(a.id, true)
                      tampilkanToast(`Akun ${a.nama} aktif lagi.`)
                    }
                  }}
                />
              ))}
            </ul>
          ) : (
            <div className="pt-6">
              <RiwayatKontrak daftar={riwayat} />
            </div>
          )}
        </div>
      </main>

      <DialogTambahAkun
        terbuka={dialogTambah}
        onBatal={() => setDialogTambah(false)}
        onSimpan={(isi) => {
          const sandi = tambahAkun(isi)
          setDialogTambah(false)
          setKartuSandi({ ...isi, sandi, judul: 'Akun dibuat' })
        }}
      />

      <DialogKonfirmasi
        terbuka={targetReset !== null}
        judul="Reset kata sandi?"
        pesan={targetReset ? `Kata sandi lama ${targetReset.nama} tidak bisa dipakai lagi. Kata sandi sementara baru akan dibuat.` : ''}
        labelKonfirmasi="Reset sandi"
        onKonfirmasi={() => {
          if (targetReset) {
            const sandi = resetSandi(targetReset.id)
            setKartuSandi({ nama: targetReset.nama, email: targetReset.email, sandi, judul: 'Kata sandi direset' })
          }
          setTargetReset(null)
        }}
        onBatal={() => setTargetReset(null)}
      />

      <DialogKonfirmasi
        terbuka={targetNonaktif !== null}
        judul="Nonaktifkan akun?"
        pesan={
          targetNonaktif
            ? `${targetNonaktif.nama} tidak bisa masuk dan tidak menerima pengingat sampai akunnya diaktifkan lagi. Data kontrak tidak berubah.`
            : ''
        }
        labelKonfirmasi="Nonaktifkan"
        bahaya
        onKonfirmasi={() => {
          if (targetNonaktif) {
            ubahAktifAkun(targetNonaktif.id, false)
            tampilkanToast(`Akun ${targetNonaktif.nama} dinonaktifkan.`)
          }
          setTargetNonaktif(null)
        }}
        onBatal={() => setTargetNonaktif(null)}
      />

      <KartuSandiSementara isi={kartuSandi} onTutup={() => setKartuSandi(null)} />
    </>
  )
}

export default Admin
