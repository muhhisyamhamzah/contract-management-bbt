// Isi tab "Ringkasan" di Detail kontrak: kotak peringatan (kalau perlu keputusan),
// kartu info (mitra, jenis, nilai, unit, penanggung jawab, pengingat), dan kartu pembayaran.

import { terminContoh } from '../data/rincianContoh'
import { formatRupiah } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import Ikon from './Ikon'

type Props = {
  kontrak: Kontrak
}

function RingkasanKontrak({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const perluKeputusan = status === 'segera' || status === 'lewat'
  const termin = terminContoh(kontrak)
  const jumlahLunas = termin.filter((t) => t.lunas).length

  const info: [string, string][] = [
    ['Mitra', kontrak.mitra],
    ['Jenis', kontrak.jenis],
    ['Nilai', formatRupiah(kontrak.nilai)],
    ['Unit pemilik', kontrak.unitPemilik],
    ['Penanggung jawab', '[Nama PIC]'],
    ['Pengingat', `${kontrak.pengingatHari} hari sebelum habis`],
  ]

  return (
    <>
      {perluKeputusan && (
        <div role="status" className={`flex gap-3 rounded-2xl p-3.5 ${TAMPILAN_STATUS[status].kelasBadge}`}>
          <Ikon nama="info" ukuran={20} className="flex-none" />
          <span className="text-[13px] leading-normal">
            <strong>Perlu keputusan.</strong> Perpanjang lewat adendum, atau tandai selesai jika tidak
            dilanjutkan.
          </span>
        </div>
      )}

      {/* Info kontrak */}
      <section className="rounded-2xl bg-white px-4 py-1 shadow-kotak">
        <dl className="m-0">
          {info.map(([label, nilai], i) => (
            <div
              key={label}
              className={`flex justify-between gap-3 py-3 ${i < info.length - 1 ? 'border-b border-garis-lembut' : ''}`}
            >
              <dt className="text-teks-lembut">{label}</dt>
              <dd className="m-0 text-right font-semibold text-judul">{nilai}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Pembayaran per termin */}
      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-kotak">
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 text-[15px] font-semibold text-judul">Pembayaran</h2>
          <span className="text-[12px] text-teks-lembut">
            {jumlahLunas} dari {termin.length} termin lunas
          </span>
        </div>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${termin.length}, minmax(0, 1fr))` }}>
          {termin.map((t) => (
            <div key={t.ke} className={`h-2 rounded-full ${t.lunas ? 'bg-berjalan' : 'bg-garis'}`} />
          ))}
        </div>
        {termin.map((t) => (
          <div key={t.ke} className="flex justify-between text-[13px]">
            <span>
              Termin {t.ke} · {t.persen}%
            </span>
            <span className={`font-semibold ${t.lunas ? 'text-berjalan-teks' : 'text-teks-lembut'}`}>
              {t.lunas ? 'Lunas' : 'Belum dibayar'}
            </span>
          </div>
        ))}
      </section>
    </>
  )
}

export default RingkasanKontrak
