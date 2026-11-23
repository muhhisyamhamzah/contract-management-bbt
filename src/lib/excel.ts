// Pembuat file Excel (.xlsx) di browser, TANPA library tambahan (aturan proyek: jangan menambah library npm).
//
// File .xlsx adalah arsip ZIP berisi beberapa file XML (format Office Open XML). Modul ini menyusun XML-nya,
// lalu membungkusnya dalam ZIP tanpa kompresi ("stored"), yang tetap sah dan dibuka Excel, Google Sheets,
// LibreOffice, dan Numbers. Fitur yang dipakai sengaja sedikit: teks, angka, tanggal, rumus, baris judul tebal
// yang dibekukan, filter di judul kolom, dan lebar kolom.

/** Satu sel: teks, angka, tanggal ({ tanggal: 'YYYY-MM-DD' }), rupiah ({ rupiah }), rumus ({ rumus }), atau kosong. */
export type Sel =
  | string
  | number
  | null
  | { tanggal: string }
  | { rupiah: number }
  | { rumus: string; tebal?: boolean }
  | { teks: string; tebal: true }

export type Lembar = {
  /** Nama lembar (maksimal 31 karakter, tanpa : \ / ? * [ ]). */
  nama: string
  /** Baris pertama = judul kolom (dicetak tebal, dibekukan, diberi filter). */
  baris: Sel[][]
  /** Lebar kolom dalam satuan karakter Excel. */
  lebarKolom?: number[]
}

// --- ZIP (tanpa kompresi) ---------------------------------------------------------------------------

const TABEL_CRC = (() => {
  const tabel = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabel[n] = c >>> 0
  }
  return tabel
})()

function crc32(data: Uint8Array): number {
  let c = 0xffffffff
  for (const b of data) c = TABEL_CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(file: { nama: string; isi: string }[]): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder()
  const bagianLokal: Uint8Array[] = []
  const bagianPusat: Uint8Array[] = []
  let offset = 0
  // Tanggal file 1 Januari 1980 (nilai terkecil format ZIP); tidak berpengaruh pada isi.
  const tanggalDos = (0 << 9) | (1 << 5) | 1

  for (const f of file) {
    const nama = enc.encode(f.nama)
    const data = enc.encode(f.isi)
    const crc = crc32(data)

    const lokal = new DataView(new ArrayBuffer(30))
    lokal.setUint32(0, 0x04034b50, true) // tanda kepala file lokal
    lokal.setUint16(4, 20, true) // versi yang dibutuhkan
    lokal.setUint16(6, 0x0800, true) // nama file UTF-8
    lokal.setUint16(8, 0, true) // tanpa kompresi
    lokal.setUint16(10, 0, true)
    lokal.setUint16(12, tanggalDos, true)
    lokal.setUint32(14, crc, true)
    lokal.setUint32(18, data.length, true)
    lokal.setUint32(22, data.length, true)
    lokal.setUint16(26, nama.length, true)
    lokal.setUint16(28, 0, true)
    bagianLokal.push(new Uint8Array(lokal.buffer), nama, data)

    const pusat = new DataView(new ArrayBuffer(46))
    pusat.setUint32(0, 0x02014b50, true) // tanda direktori pusat
    pusat.setUint16(4, 20, true)
    pusat.setUint16(6, 20, true)
    pusat.setUint16(8, 0x0800, true)
    pusat.setUint16(10, 0, true)
    pusat.setUint16(12, 0, true)
    pusat.setUint16(14, tanggalDos, true)
    pusat.setUint32(16, crc, true)
    pusat.setUint32(20, data.length, true)
    pusat.setUint32(24, data.length, true)
    pusat.setUint16(28, nama.length, true)
    pusat.setUint32(42, offset, true)
    bagianPusat.push(new Uint8Array(pusat.buffer), nama)

    offset += 30 + nama.length + data.length
  }

  const ukuranPusat = bagianPusat.reduce((n, b) => n + b.length, 0)
  const akhir = new DataView(new ArrayBuffer(22))
  akhir.setUint32(0, 0x06054b50, true) // tanda akhir direktori pusat
  akhir.setUint16(8, file.length, true)
  akhir.setUint16(10, file.length, true)
  akhir.setUint32(12, ukuranPusat, true)
  akhir.setUint32(16, offset, true)

  const semua = [...bagianLokal, ...bagianPusat, new Uint8Array(akhir.buffer)]
  const hasil = new Uint8Array(semua.reduce((n, b) => n + b.length, 0))
  let posisi = 0
  for (const b of semua) {
    hasil.set(b, posisi)
    posisi += b.length
  }
  return hasil
}

// --- XML lembar kerja --------------------------------------------------------------------------------

/** Membuang karakter kendali yang tidak sah di XML, lalu meloloskan & < > ". */
function aman(teks: string): string {
  return teks
    // Karakter kendali (kode 0-31 kecuali tab, baris baru, CR) tidak sah di XML dan membuat file rusak.
    .split('')
    .filter((c) => c.charCodeAt(0) >= 32 || c === '\t' || c === '\n' || c === '\r')
    .join('')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Nomor kolom (0, 1, ...) menjadi huruf kolom Excel (A, B, ..., Z, AA, ...). */
function hurufKolom(indeks: number): string {
  let n = indeks + 1
  let huruf = ''
  while (n > 0) {
    const sisa = (n - 1) % 26
    huruf = String.fromCharCode(65 + sisa) + huruf
    n = Math.floor((n - 1) / 26)
  }
  return huruf
}

/** Tanggal "YYYY-MM-DD" menjadi nomor seri tanggal Excel (hari sejak 30 Desember 1899). */
function seriTanggal(teks: string): number {
  const [tahun, bulan, hari] = teks.split('-').map(Number)
  return Math.round((Date.UTC(tahun, bulan - 1, hari) - Date.UTC(1899, 11, 30)) / 86_400_000)
}

/** Indeks gaya di styles.xml: 0 biasa, 1 judul tebal, 2 tanggal, 3 rupiah, 4 rupiah tebal, 5 teks tebal. */
const GAYA = { biasa: 0, judul: 1, tanggal: 2, rupiah: 3, rupiahTebal: 4, tebal: 5 }

function xmlSel(sel: Sel, ref: string, judul: boolean): string {
  if (sel === null || sel === '') return ''
  if (typeof sel === 'number') return `<c r="${ref}"><v>${sel}</v></c>`
  if (typeof sel === 'string') {
    const gaya = judul ? ` s="${GAYA.judul}"` : ''
    return `<c r="${ref}" t="inlineStr"${gaya}><is><t xml:space="preserve">${aman(sel)}</t></is></c>`
  }
  if ('tanggal' in sel) return sel.tanggal ? `<c r="${ref}" s="${GAYA.tanggal}"><v>${seriTanggal(sel.tanggal)}</v></c>` : ''
  if ('rupiah' in sel) return `<c r="${ref}" s="${GAYA.rupiah}"><v>${sel.rupiah}</v></c>`
  if ('rumus' in sel) return `<c r="${ref}" s="${sel.tebal ? GAYA.rupiahTebal : GAYA.rupiah}"><f>${aman(sel.rumus)}</f></c>`
  return `<c r="${ref}" t="inlineStr" s="${GAYA.tebal}"><is><t xml:space="preserve">${aman(sel.teks)}</t></is></c>`
}

function xmlLembar(lembar: Lembar): string {
  const jumlahKolom = Math.max(1, ...lembar.baris.map((b) => b.length))
  const kolom = (lembar.lebarKolom ?? [])
    .map((lebar, i) => `<col min="${i + 1}" max="${i + 1}" width="${lebar}" customWidth="1"/>`)
    .join('')
  const baris = lembar.baris
    .map((isi, r) => `<row r="${r + 1}">${isi.map((sel, c) => xmlSel(sel, `${hurufKolom(c)}${r + 1}`, r === 0)).join('')}</row>`)
    .join('')
  const filter = lembar.baris.length > 1 ? `<autoFilter ref="A1:${hurufKolom(jumlahKolom - 1)}1"/>` : ''
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    (kolom ? `<cols>${kolom}</cols>` : '') +
    `<sheetData>${baris}</sheetData>` +
    filter +
    '</worksheet>'
  )
}

const GAYA_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="2"><numFmt numFmtId="164" formatCode="d mmm yyyy"/><numFmt numFmtId="165" formatCode="&quot;Rp&quot; #,##0"/></numFmts>' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFEEF1F8"/><bgColor indexed="64"/></patternFill></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="6">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="top" wrapText="1"/></xf>' +
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="top" wrapText="1"/></xf>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment vertical="top"/></xf>' +
  '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment vertical="top"/></xf>' +
  '<xf numFmtId="165" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"><alignment vertical="top"/></xf>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment vertical="top"/></xf>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>'

/** Menyusun file .xlsx dari beberapa lembar. */
export function buatXlsx(lembar: Lembar[]): Blob {
  const nama = lembar.map((l) => aman(l.nama.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31)))
  const file = [
    {
      nama: '[Content_Types].xml',
      isi:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        lembar
          .map(
            (_, i) =>
              `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
          )
          .join('') +
        '</Types>',
    },
    {
      nama: '_rels/.rels',
      isi:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      nama: 'xl/workbook.xml',
      isi:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets>${nama.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>` +
        '</workbook>',
    },
    {
      nama: 'xl/_rels/workbook.xml.rels',
      isi:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        lembar
          .map(
            (_, i) =>
              `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
          )
          .join('') +
        `<Relationship Id="rId${lembar.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        '</Relationships>',
    },
    { nama: 'xl/styles.xml', isi: GAYA_XML },
    ...lembar.map((l, i) => ({ nama: `xl/worksheets/sheet${i + 1}.xml`, isi: xmlLembar(l) })),
  ]
  return new Blob([zip(file)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/** Mengunduh Blob sebagai file lewat tautan sementara. */
export function unduhBlob(blob: Blob, namaFile: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = namaFile
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
