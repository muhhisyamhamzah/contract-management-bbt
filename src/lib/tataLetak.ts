// Class tata letak bersama, supaya lebar konten sama di semua halaman.

/** Wadah konten di tengah layar: lebar konten 1040px di desktop (desain v4), 20px jarak tepi di HP. */
export const KELAS_WADAH = 'mx-auto w-full max-w-[1080px] px-5'

/** Kotak putih bergaris tipis, gaya kartu di desain v4. */
export const KELAS_KOTAK = 'rounded-2xl border border-garis bg-white shadow-kotak'

/** Tombol utama di atas header navy (emas). */
export const KELAS_TOMBOL_EMAS =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-none bg-tombol-emas px-5 font-semibold text-galaxy-900 no-underline shadow-tombol-emas transition-[background-color,border-color,color] duration-150 hover:bg-tombol-emas-tua hover:text-galaxy-900 motion-reduce:transition-none'

/** Tombol kedua di atas header navy (transparan). */
export const KELAS_TOMBOL_GELAP =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-white/25 bg-white/10 px-4 font-semibold text-white no-underline transition-[background-color,border-color,color] duration-150 hover:bg-white/20 hover:text-white motion-reduce:transition-none'

/** Tombol utama di atas latar putih (navy bergradasi). */
export const KELAS_TOMBOL_UTAMA =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-none bg-linear-135 from-galaxy-900 to-galaxy-700 px-5 font-semibold text-white shadow-tombol-tambah disabled:cursor-not-allowed disabled:opacity-60'

/** Tombol kedua di atas latar putih. */
export const KELAS_TOMBOL_KEDUA =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-garis-input bg-white px-4 font-semibold text-judul no-underline transition-[background-color,border-color,color] duration-150 hover:bg-latar hover:text-judul motion-reduce:transition-none'

/** Tautan teks kecil, misalnya "+ Tambah" di judul kartu. Tinggi 44px supaya mudah disentuh. */
export const KELAS_TAUTAN_AKSI =
  'inline-flex min-h-11 cursor-pointer items-center gap-1 border-none bg-transparent px-1 text-[13px] font-semibold text-aksi no-underline hover:text-aksi-tua'

/** Kotak isian (input, select, textarea). Garis 3:1, merah saat aria-invalid. */
export const KELAS_ISIAN =
  'w-full min-w-0 rounded-[12px] border border-garis-input bg-white px-3.5 text-[14px] text-teks aria-[invalid=true]:border-hapus aria-[invalid=true]:border-2'
