// Class tata letak bersama, supaya lebar konten sama di semua halaman.
// Arah desain "Kavling" (DESIGN.md): panel putih bergaris tepi dengan sudut lebar (24px, 20px di HP),
// tombol berbentuk pil, kotak isian 12px. Tidak ada gradasi dan tidak ada bayangan pada panel dan tombol.

/** Wadah konten di tengah layar: lebar maksimal 1280px (supaya navbar muat semua menu), 20px jarak tepi di HP, 24px mulai tablet. */
export const KELAS_WADAH = 'mx-auto w-full max-w-[1280px] px-5 md:px-6'

/** Panel putih bergaris tipis. Dipakai seperlunya: tabel/agenda, form, panel samping. Jangan bersarang. */
export const KELAS_KOTAK = 'rounded-[20px] border border-garis bg-white md:rounded-3xl'

/**
 * Kolom tabel di halaman Kontrak (judul kolom di Kontrak.tsx dan tiap BarisKontrak memakai class yang sama):
 * No | Kontrak | Nomor PKS | Masa kontrak | Nilai | Status | Adendum | Dokumen | panah.
 * Tabel baru tampil mulai xl (1280px). Di bawahnya kolom Kontrak terlalu sempit, jadi baris memakai susunan bertumpuk.
 */
export const KELAS_KOLOM_TABEL_KONTRAK =
  'xl:grid-cols-[32px_minmax(0,2fr)_130px_150px_100px_150px_180px_56px_24px]'

/** Tombol utama: pil navy datar. Satu per layar. */
export const KELAS_TOMBOL_UTAMA =
  'inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-galaxy-900 whitespace-nowrap px-5 font-semibold text-white no-underline transition-[background-color] duration-150 hover:bg-aksi hover:text-white disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'

/** Tombol kedua: pil putih bergaris. */
export const KELAS_TOMBOL_KEDUA =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap border border-garis-input bg-white px-4 font-semibold text-judul no-underline transition-[background-color,border-color,color] duration-150 hover:bg-latar hover:text-judul motion-reduce:transition-none'

/** Tautan teks kecil, misalnya "+ Tambah" di judul kartu. Tinggi 44px supaya mudah disentuh. */
export const KELAS_TAUTAN_AKSI =
  'inline-flex min-h-11 cursor-pointer items-center gap-1 border-none bg-transparent px-1 text-[13px] font-semibold text-aksi no-underline hover:text-aksi-tua'

/** Kotak isian (input, select, textarea). Garis 3:1, merah saat aria-invalid. */
export const KELAS_ISIAN =
  'w-full min-w-0 rounded-xl border border-garis-input bg-white px-3.5 text-[14px] text-teks aria-[invalid=true]:border-hapus aria-[invalid=true]:border-2'
