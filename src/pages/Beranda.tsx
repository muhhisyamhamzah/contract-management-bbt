// Halaman Beranda: kontrak yang perlu perhatian dan ringkasan jumlah per status.
// Isi dari atas ke bawah: header (tanggal, sapaan, tombol Tambah kontrak), ringkasan tiga kartu,
// daftar "Perlu perhatian" (sudah lewat + habis dalam 90 hari), dan critical point terdekat.

import { Link } from 'react-router-dom'
import BarisKontrak from '../components/BarisKontrak'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import KartuBagian from '../components/KartuBagian'
import KeadaanKosong from '../components/KeadaanKosong'
import KotakKalender from '../components/KotakKalender'
import RingkasanStatus from '../components/RingkasanStatus'
import { useData, usePengguna } from '../lib/data'
import { urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { formatRupiahSingkat, formatTanggalHariIni } from '../lib/format'
import {
  BATAS_HARI_SEGERA,
  hitungJumlahPerStatus,
  hitungSisaHari,
  hitungStatus,
  LABEL_CRITICAL_POINT,
  perluPerhatian,
  TAMPILAN_STATUS,
} from '../lib/status'
import { KELAS_KOTAK, KELAS_TAUTAN_AKSI, KELAS_TOMBOL_EMAS, KELAS_WADAH } from '../lib/tataLetak'

/** Critical point yang tanggal pentingnya jatuh dalam sekian hari ke depan ikut tampil di Beranda. */
const HARI_CRITICAL_TERDEKAT = BATAS_HARI_SEGERA

function Beranda() {
  const pengguna = usePengguna()
  const { kontrak } = useData()

  const jumlah = hitungJumlahPerStatus(kontrak)
  const perhatian = urutkanPalingCepatHabis(kontrak.filter((k) => perluPerhatian(k)))
  const nilaiPerhatian = perhatian.reduce((total, k) => total + k.nilai, 0)

  // Critical point aktif yang punya tanggal penting dalam 90 hari ke depan (atau sudah lewat).
  const criticalTerdekat = kontrak
    .filter((k) => hitungStatus(k) !== 'selesai')
    .flatMap((k) =>
      k.criticalPoint
        .filter((b) => b.status === 'aktif' && b.tanggalPenting)
        .map((b) => ({ kontrak: k, butir: b, sisa: hitungSisaHari(b.tanggalPenting) })),
    )
    .filter((c) => c.sisa <= HARI_CRITICAL_TERDEKAT)
    .sort((a, b) => a.sisa - b.sisa)

  const namaDepan = pengguna.nama.split(' ')[0]

  return (
    <>
      <HeaderGelombang
        atas={<span className="text-[14px] text-teks-header">{formatTanggalHariIni()}</span>}
        judul={<>Halo, {namaDepan} 👋</>}
        keterangan={
          perhatian.length > 0 ? (
            <>
              Ada{' '}
              <Link to="/pengingat" className="font-bold text-tombol-emas hover:text-white">
                {perhatian.length} kontrak
              </Link>{' '}
              yang perlu Anda perhatikan, senilai {formatRupiahSingkat(nilaiPerhatian)}.
            </>
          ) : (
            'Semua kontrak aman. Tidak ada yang lewat atau habis dalam 3 bulan.'
          )
        }
        aksi={
          <Link to="/tambah" className={KELAS_TOMBOL_EMAS}>
            <Ikon nama="tambah" ukuran={18} tebal={2.5} />
            Tambah kontrak
          </Link>
        }
      />

      <main id="konten" className={`${KELAS_WADAH} relative z-10 -mt-14 flex flex-col gap-8 pb-4`}>
        <RingkasanStatus
          perluPerhatian={jumlah.segera + jumlah.lewat}
          berjalan={jumlah.berjalan}
          selesai={jumlah.selesai}
        />

        <section aria-labelledby="judul-perhatian" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="judul-perhatian" className="m-0 text-[20px] text-judul">
              Perlu perhatian
            </h2>
            <Link to="/pengingat" className={KELAS_TAUTAN_AKSI}>
              Lihat pengingat
              <Ikon nama="kanan" ukuran={14} tebal={2.5} />
            </Link>
          </div>
          <div className={`${KELAS_KOTAK} px-4 md:px-7`}>
            {perhatian.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {perhatian.map((k) => (
                  <BarisKontrak key={k.id} kontrak={k} />
                ))}
              </ul>
            ) : (
              <KeadaanKosong
                ikon="centangLingkaran"
                kelasIkon="text-berjalan-teks"
                judul="Semua kontrak aman"
                pesan={`Tidak ada kontrak yang sudah lewat atau habis dalam ${BATAS_HARI_SEGERA} hari.`}
              />
            )}
          </div>
        </section>

        {criticalTerdekat.length > 0 && (
          <KartuBagian
            id="critical-terdekat"
            judul="Critical point terdekat"
            ikon="peringatan"
            keterangan="Klausul berisiko dengan tanggal penting"
          >
            <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
              {criticalTerdekat.map(({ kontrak: k, butir, sisa }) => {
                const lewat = sisa < 0
                return (
                  <li key={butir.id}>
                    <Link
                      to={`/kontrak/${k.id}#critical-point`}
                      className="flex h-full gap-3.5 rounded-xl border border-garis bg-latar p-4 text-teks no-underline transition-[background-color,border-color,color] duration-150 hover:border-garis-input hover:text-teks motion-reduce:transition-none"
                    >
                      <KotakKalender
                        tanggal={butir.tanggalPenting}
                        kelasPita={lewat ? TAMPILAN_STATUS.lewat.kelasPita : TAMPILAN_STATUS.segera.kelasPita}
                      />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-[13px] font-semibold text-judul">
                          {LABEL_CRITICAL_POINT[butir.jenis]}
                          {butir.pasal && <span className="font-normal text-teks-lembut"> · {butir.pasal}</span>}
                        </span>
                        <span className="text-[13px] leading-snug text-teks">{butir.ringkasan}</span>
                        <span className={`text-[12px] font-semibold ${lewat ? 'text-lewat-teks' : 'text-segera-teks'}`}>
                          {k.nama} · {lewat ? `lewat ${Math.abs(sisa)} hari` : sisa === 0 ? 'hari ini' : `${sisa} hari lagi`}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </KartuBagian>
        )}
      </main>
    </>
  )
}

export default Beranda
