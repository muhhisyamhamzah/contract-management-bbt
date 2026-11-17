// Halaman Critical point: semua klausul berisiko dari kontrak yang belum selesai, dikelompokkan menurut
// tanggal pentingnya (Sudah lewat, H-1/H-2/H-3 bulan, Lebih dari 3 bulan), lalu Tanpa tanggal dan Selesai.
// [ASUMSI] Pengingat critical point hanya untuk butir yang punya tanggal penting, dengan jadwal 3, 2, 1 bulan.
// Menandai selesai tetap dilakukan di halaman Detail kontrak (tautan di setiap baris).

import { Link, useSearchParams } from 'react-router-dom'
import BadgeStatus from '../components/BadgeStatus'
import BagianTahap from '../components/BagianTahap'
import Ikon from '../components/Ikon'
import KepalaHalaman from '../components/KepalaHalaman'
import KotakKalender from '../components/KotakKalender'
import { useData } from '../lib/data'
import {
  hitungSisaHari,
  hitungStatus,
  hitungTahap,
  JUDUL_TAHAP_CRITICAL,
  LABEL_CRITICAL_POINT,
  TAMPILAN_STATUS,
  URUTAN_TAHAP,
  type TahapWaktu,
} from '../lib/status'
import { KELAS_WADAH } from '../lib/tataLetak'
import type { CriticalPoint as ButirCritical, Kontrak } from '../types/kontrak'

type Butir = { kontrak: Kontrak; butir: ButirCritical; sisa: number }

function teksSisa(sisa: number): string {
  if (sisa < 0) return `Lewat ${Math.abs(sisa)} hari`
  if (sisa === 0) return 'Hari ini'
  return `${sisa} hari lagi`
}

function BarisCritical({ kontrak: k, butir, sisa }: Butir) {
  const adaTanggal = Boolean(butir.tanggalPenting)
  const selesai = butir.status === 'selesai'
  const lewat = sisa < 0
  return (
    <li className="border-b border-garis-lembut last:border-b-0">
      <Link
        to={`/kontrak/${k.id}#critical-point`}
        className="group -mx-3 grid grid-cols-[54px_minmax(0,1fr)_20px] items-center gap-x-4 gap-y-2 rounded-2xl px-3 py-4 text-teks no-underline transition-[background-color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none md:grid-cols-[54px_minmax(0,1.5fr)_minmax(0,1fr)_130px_20px]"
      >
        {adaTanggal ? (
          <KotakKalender
            tanggal={butir.tanggalPenting}
            kelasPita={selesai ? TAMPILAN_STATUS.selesai.kelasPita : lewat ? TAMPILAN_STATUS.lewat.kelasPita : TAMPILAN_STATUS.segera.kelasPita}
          />
        ) : (
          <span className="flex h-[54px] w-[54px] items-center justify-center rounded-xl border border-dashed border-garis-input text-center text-[11px] leading-tight font-bold text-teks-lembut">
            Tanpa tanggal
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex flex-wrap items-baseline gap-x-2 text-[14px]">
            <span className="font-bold text-judul">{LABEL_CRITICAL_POINT[butir.jenis]}</span>
            {butir.pasal && <span className="text-teks-lembut">{butir.pasal}</span>}
          </span>
          <span className="max-w-[72ch] text-[14px] text-teks">{butir.ringkasan}</span>
          {selesai && butir.penanganan && <span className="text-[13px] text-teks-lembut">Penanganan: {butir.penanganan}</span>}
          {/* Di HP, nama kontrak dan status tampil di bawah ringkasan */}
          <span className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
            <span className="text-[13px] font-semibold text-aksi">{k.nama}</span>
          </span>
        </span>
        <span className="hidden min-w-0 flex-col md:flex">
          <span className="text-[14px] font-semibold text-aksi">{k.nama}</span>
          <span className="text-[13px] text-teks-lembut">{k.nomorPks}</span>
        </span>
        <span className="col-start-2 md:col-auto md:flex md:justify-end">
          {selesai ? (
            <BadgeStatus status="selesai">Selesai</BadgeStatus>
          ) : adaTanggal ? (
            <BadgeStatus status={lewat ? 'lewat' : 'segera'}>{teksSisa(sisa)}</BadgeStatus>
          ) : (
            <BadgeStatus status="selesai">Pantau</BadgeStatus>
          )}
        </span>
        <Ikon
          nama="kanan"
          ukuran={18}
          className="col-start-3 row-span-2 row-start-1 text-teks-lembut transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none md:col-auto md:row-auto"
        />
      </Link>
    </li>
  )
}

function CriticalPoint() {
  const { kontrak } = useData()
  const [parameter, setParameter] = useSearchParams()
  const kataKunci = (parameter.get('q') ?? '').trim().toLowerCase()

  const semua: Butir[] = kontrak
    .filter((k) => hitungStatus(k) !== 'selesai')
    .flatMap((k) =>
      k.criticalPoint.map((butir) => ({
        kontrak: k,
        butir,
        sisa: butir.tanggalPenting ? hitungSisaHari(butir.tanggalPenting) : Number.POSITIVE_INFINITY,
      })),
    )
    .filter(({ kontrak: k, butir }) =>
      !kataKunci
        ? true
        : [butir.pasal, butir.ringkasan, k.nama, k.nomorPks, LABEL_CRITICAL_POINT[butir.jenis]]
            .join(' ')
            .toLowerCase()
            .includes(kataKunci),
    )
    // Butir tanpa tanggal bernilai tak hingga; dibandingkan sama dengan 0 supaya urutan tidak kacau (Infinity - Infinity = NaN).
    .sort((a, b) => (a.sisa === b.sisa ? 0 : a.sisa - b.sisa))

  const aktif = semua.filter((c) => c.butir.status === 'aktif')
  const bertanggal = aktif.filter((c) => c.butir.tanggalPenting)
  // Satu putaran: tiap butir dihitung tahapnya sekali, lalu dimasukkan ke kelompoknya.
  const perTahap = new Map<TahapWaktu, Butir[]>(URUTAN_TAHAP.map((t) => [t, []]))
  for (const c of bertanggal) perTahap.get(hitungTahap(c.butir.tanggalPenting))?.push(c)
  const kelompok = URUTAN_TAHAP.map((tahap) => ({ tahap, ...JUDUL_TAHAP_CRITICAL[tahap], isi: perTahap.get(tahap) ?? [] }))
  const tanpaTanggal = aktif.filter((c) => !c.butir.tanggalPenting)
  const selesai = semua.filter((c) => c.butir.status === 'selesai')

  const pil = [
    ...kelompok.map((g) => ({ id: `cp-${g.tahap}`, judul: g.judul, jumlah: g.isi.length })),
    { id: 'cp-tanpa', judul: 'Tanpa tanggal', jumlah: tanpaTanggal.length },
    { id: 'cp-selesai', judul: 'Selesai', jumlah: selesai.length },
  ]

  function ubahKataKunci(nilai: string) {
    setParameter(
      (lama) => {
        const baru = new URLSearchParams(lama)
        if (nilai) baru.set('q', nilai)
        else baru.delete('q')
        return baru
      },
      { replace: true },
    )
  }

  return (
    <>
      <KepalaHalaman
        judul="Critical point"
        keterangan="Klausul berisiko dari semua kontrak, terutama pengakhiran kontrak dan denda. Butir yang punya tanggal penting ikut diingatkan 3, 2, dan 1 bulan sebelumnya."
      />

      <main id="konten" className={`${KELAS_WADAH} flex flex-col gap-8 pb-4`}>
        <div className="flex flex-col gap-3">
          <label className="flex h-[52px] items-center gap-3 rounded-full border border-garis-input bg-white pr-2 pl-5 shadow-pil focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi">
            <Ikon nama="cari" ukuran={20} className="flex-none text-teks-lembut" />
            <span className="sr-only">Cari critical point</span>
            <input
              type="search"
              value={parameter.get('q') ?? ''}
              onChange={(event) => ubahKataKunci(event.target.value)}
              placeholder="Cari pasal, isi klausul, atau nama kontrak"
              className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-teks outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
          <nav aria-label="Lompat ke tahap" className="flex flex-wrap gap-2">
            {pil.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="flex min-h-11 items-center gap-2 rounded-full border border-garis bg-white px-4 text-[14px] font-semibold text-teks no-underline hover:border-garis-input hover:text-teks"
              >
                <span className="text-judul">{p.jumlah}</span>
                {p.judul}
              </a>
            ))}
          </nav>
        </div>

        {kelompok.map((g) => (
          <BagianTahap
            key={g.tahap}
            id={`cp-${g.tahap}`}
            judul={g.judul}
            keterangan={g.keterangan}
            kosong={g.isi.length === 0}
            pesanKosong="Tidak ada critical point di tahap ini."
          >
            {g.isi.map((c) => (
              <BarisCritical key={c.butir.id} {...c} />
            ))}
          </BagianTahap>
        ))}

        <BagianTahap
          id="cp-tanpa"
          judul="Tanpa tanggal"
          keterangan="Klausul yang tidak punya tanggal. Tidak ada pengingat, cukup dipantau."
          kosong={tanpaTanggal.length === 0}
          pesanKosong="Tidak ada critical point tanpa tanggal."
        >
          {tanpaTanggal.map((c) => (
            <BarisCritical key={c.butir.id} {...c} />
          ))}
        </BagianTahap>

        <BagianTahap
          id="cp-selesai"
          judul="Selesai"
          keterangan="Sudah ditandai selesai beserta keterangan penanganannya."
          kosong={selesai.length === 0}
          pesanKosong="Belum ada critical point yang ditandai selesai."
        >
          {selesai.map((c) => (
            <BarisCritical key={c.butir.id} {...c} />
          ))}
        </BagianTahap>
      </main>
    </>
  )
}

export default CriticalPoint
