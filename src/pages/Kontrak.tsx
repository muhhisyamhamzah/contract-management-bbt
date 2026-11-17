// Halaman Kontrak (gabungan halaman Kontrak dan Pengingat, keputusan Hisyam 17 Nov 2026).
// Kontrak dikelompokkan menurut tahap pengingat dalam tabel terpisah:
// Sudah lewat, H-1 bulan, H-2 bulan, H-3 bulan, Berjalan (lebih dari 3 bulan), lalu Selesai.
// Kalimat di bawah tiap judul menjelaskan tahap pengingatnya. Pil di atas melompat ke tabel yang sesuai.
// Kata kunci dari kotak cari Beranda dibawa lewat alamat, misalnya /kontrak?q=hukum.

import { Link, useSearchParams } from 'react-router-dom'
import BagianTahap from '../components/BagianTahap'
import BarisKontrak from '../components/BarisKontrak'
import Ikon from '../components/Ikon'
import KepalaHalaman from '../components/KepalaHalaman'
import { useData } from '../lib/data'
import { cocokKataKunci, urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { hitungStatus, hitungTahap, JUDUL_TAHAP_KONTRAK, perluPerhatian, URUTAN_TAHAP, type TahapWaktu } from '../lib/status'
import type { Kontrak as DataKontrak } from '../types/kontrak'
import { KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'

function Kontrak() {
  const { kontrak } = useData()
  const [parameter, setParameter] = useSearchParams()
  const kataKunci = parameter.get('q') ?? ''

  const cocok = kontrak.filter((k) => cocokKataKunci(k, kataKunci))
  const aktif = urutkanPalingCepatHabis(cocok.filter((k) => hitungStatus(k) !== 'selesai'))
  const selesai = cocok.filter((k) => hitungStatus(k) === 'selesai')
  // Satu putaran: tiap kontrak dihitung tahapnya sekali, lalu dimasukkan ke kelompoknya.
  const perTahap = new Map<TahapWaktu, DataKontrak[]>(URUTAN_TAHAP.map((t) => [t, []]))
  for (const k of aktif) perTahap.get(hitungTahap(k.tanggalBerakhir))?.push(k)
  const kelompok = URUTAN_TAHAP.map((tahap) => ({ tahap, ...JUDUL_TAHAP_KONTRAK[tahap], isi: perTahap.get(tahap) ?? [] }))
  const jumlahAktif = kontrak.filter((k) => hitungStatus(k) !== 'selesai').length
  const jumlahPerhatian = kontrak.filter((k) => perluPerhatian(k)).length

  function ubahKataKunci(nilai: string) {
    setParameter(
      (lama) => {
        const baru = new URLSearchParams(lama)
        if (nilai) baru.set('q', nilai)
        else baru.delete('q')
        return baru
      },
      // Mengetik tidak menambah riwayat Back untuk setiap huruf.
      { replace: true },
    )
  }

  return (
    <>
      <KepalaHalaman
        judul="Kontrak"
        keterangan={`${jumlahAktif} kontrak aktif, ${jumlahPerhatian} perlu perhatian. Dikelompokkan menurut tahap pengingat, yang dikirim otomatis 3, 2, dan 1 bulan sebelum kontrak habis.`}
      />

      <main id="konten" className={`${KELAS_WADAH} flex flex-col gap-8 pb-4`}>
        <div className="flex flex-col gap-3">
          <label className="flex h-[52px] items-center gap-3 rounded-full border border-garis-input bg-white pr-2 pl-5 shadow-pil focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi">
            <Ikon nama="cari" ukuran={20} className="flex-none text-teks-lembut" />
            <span className="sr-only">Cari kontrak</span>
            <input
              type="search"
              value={kataKunci}
              onChange={(event) => ubahKataKunci(event.target.value)}
              placeholder="Cari nama, penyedia, atau nomor PKS"
              // Garis fokus digambar oleh label pembungkus (focus-within), supaya seluruh kotak tersorot.
              className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-teks outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {kataKunci && (
              <button
                type="button"
                aria-label="Hapus kata kunci"
                onClick={() => ubahKataKunci('')}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut hover:bg-latar hover:text-judul"
              >
                <Ikon nama="tutup" ukuran={18} />
              </button>
            )}
          </label>

          {/* Pil lompat cepat ke tiap tabel */}
          <nav aria-label="Lompat ke tahap" className="flex flex-wrap gap-2">
            {kelompok.map((g) => (
              <a
                key={g.tahap}
                href={`#tahap-${g.tahap}`}
                className="flex min-h-11 items-center gap-2 rounded-full border border-garis bg-white px-4 text-[14px] font-semibold text-teks no-underline hover:border-garis-input hover:text-teks"
              >
                <span className="text-judul">{g.isi.length}</span>
                {g.judul}
              </a>
            ))}
            <a
              href="#tahap-selesai"
              className="flex min-h-11 items-center gap-2 rounded-full border border-garis bg-white px-4 text-[14px] font-semibold text-teks no-underline hover:border-garis-input hover:text-teks"
            >
              <span className="text-judul">{selesai.length}</span>
              Selesai
            </a>
          </nav>

          {kataKunci && (
            <p aria-live="polite" className="m-0 px-1 text-[13px] text-teks-lembut">
              Menampilkan {cocok.length} kontrak untuk “{kataKunci}”.
            </p>
          )}

          {/* Di HP, tombol Tambah kontrak tidak ada di navigasi, jadi tampil di sini */}
          <Link to="/tambah" className={`${KELAS_TOMBOL_UTAMA} self-start md:hidden`}>
            <Ikon nama="tambah" ukuran={18} tebal={2.5} />
            Tambah kontrak
          </Link>
        </div>

        {kelompok.map((g) => (
          <BagianTahap
            key={g.tahap}
            id={`tahap-${g.tahap}`}
            judul={g.judul}
            keterangan={g.keterangan}
            kosong={g.isi.length === 0}
            pesanKosong="Tidak ada kontrak di tahap ini."
          >
            {g.isi.map((k) => (
              <BarisKontrak key={k.id} kontrak={k} denganNomor />
            ))}
          </BagianTahap>
        ))}

        <BagianTahap
          id="tahap-selesai"
          judul="Selesai"
          keterangan="Sudah ditandai selesai. Pengingatnya berhenti."
          kosong={selesai.length === 0}
          pesanKosong="Belum ada kontrak yang ditandai selesai."
        >
          {selesai.map((k) => (
            <BarisKontrak key={k.id} kontrak={k} denganNomor />
          ))}
        </BagianTahap>
      </main>
    </>
  )
}

export default Kontrak
