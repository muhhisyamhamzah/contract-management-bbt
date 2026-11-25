# Rancangan backend Contract Management BBT

Status: **rancangan, belum dibuat** (25 Nov 2026). Disusun dengan skill api-and-interface-design.
Tanda keputusan sama dengan CLAUDE.md: [ASUMSI] keputusan sementara tim, [TERBUKA] menunggu atasan.

Prinsip utamanya **kontrak dulu, kode belakangan**. Bentuk data API sama persis dengan tipe di `src/types/kontrak.ts`,
dan setiap operasi di `NilaiData` (`src/lib/data.ts`) punya satu endpoint. Jadi frontend tinggal mengganti isi
`PenyediaData` dari data contoh ke panggilan API, tanpa mengubah halaman.

---

## 1. Teknologi dan susunan folder

Sama dengan Sismon (versi pustaka disamakan dengan `sismon_bank_tanah/backend/requirements.txt`):
FastAPI, SQLAlchemy 2, Alembic, PostgreSQL (Neon) lewat psycopg 3, PyJWT, bcrypt, pywebpush, boto3 (Cloudflare R2), tzdata.
Tidak ada pustaka baru di luar daftar Sismon. Pengiriman email memakai `smtplib` bawaan Python.

```
backend/
  alembic/                 migrasi database
  app/
    main.py                aplikasi, CORS, penangan galat
    config.py              pengaturan dari .env (pydantic-settings)
    database.py            sesi SQLAlchemy
    models.py              tabel (bagian 3)
    schemas.py             bentuk masuk/keluar (camelCase, sama dengan src/types)
    security.py            bcrypt + JWT (salin pola Sismon: sidik sandi di token)
    batas_masuk.py         pembatasan percobaan masuk
    deps.py                akun_masuk(), wajib_admin()
    riwayat.py             catat_riwayat(), dipanggil di setiap perubahan
    berkas.py              unggah/hapus/tautan R2
    versi.py               simpan versi kontrak di PKS/adendum (padanan src/lib/versiKontrak.ts)
    pengingat.py           jadwal 3-2-1 bulan + pengiriman (padanan TAHAP_PENGINGAT_BULAN)
    routers/  auth.py kontrak.py dokumen.py akun.py riwayat.py notifikasi.py push.py
  kirim_pengingat.py       dijalankan cron sekali sehari
  seed.py                  akun admin pertama + data contoh fiktif
  KONTRAK-API.md           salinan bagian 4 setelah disepakati
  requirements.txt
```

Folder `backend/` ada di repo yang sama dengan frontend, seperti Sismon.

## 2. Aturan umum API

- Semua alamat diawali `/api`. Nama alamat dan field berbahasa Indonesia, **camelCase**, sama dengan `src/types/kontrak.ts`.
- Tanggal: `"YYYY-MM-DD"`. Waktu kejadian: ISO 8601 dengan zona (`2026-11-25T09:30:00+07:00`).
  Semua hitungan tanggal (status, pengingat) memakai zona **Asia/Jakarta**.
- `id` dikirim sebagai **string** (di database angka). Frontend tidak boleh menghitung dengan id.
- `nilai` dikirim sebagai angka. Batas 15 digit (Rp 999 triliun) masih aman di JavaScript (di bawah 2^53).
- Kecuali `POST /auth/masuk`, setiap permintaan membawa `Authorization: Bearer <token>`.
- **Satu bentuk galat untuk semua endpoint** (perluasan pola Sismon `{detail}`, ditambah `kode`):

  ```json
  { "detail": "Nomor PKS 019/BBT/PKS/2025 sudah dipakai kontrak lain.", "kode": "NOMOR_PKS_DIPAKAI" }
  ```

  `detail` boleh langsung ditampilkan ke pengguna. `kode` dipakai frontend untuk membedakan kasus.
  Galat isian (422) menambahkan `"kolom": {"tanggalBerakhir": "Harus setelah tanggal mulai."}` supaya pesan
  bisa ditaruh di bawah kotak isian yang salah.

  | Status | Arti | Contoh `kode` |
  |---|---|---|
  | 400 | Permintaan tidak bisa dibaca | `PERMINTAAN_RUSAK` |
  | 401 | Belum masuk, token habis, atau kata sandi sudah diganti | `PERLU_MASUK` |
  | 403 | Sudah masuk tapi bukan haknya | `KHUSUS_ADMIN` |
  | 404 | Data tidak ada | `TIDAK_DITEMUKAN` |
  | 409 | Bentrok dengan keadaan data | `NOMOR_PKS_DIPAKAI`, `DATA_SUDAH_BERUBAH`, `AKUN_MASIH_AKTIF` |
  | 413 | File terlalu besar | `BERKAS_TERLALU_BESAR` |
  | 422 | Isian tidak sah | `ISIAN_TIDAK_SAH` |
  | 423 | Akun dikunci sementara | `TERKUNCI` (+ `sisaDetik`) |
  | 500 | Galat server (tanpa rincian teknis) | `GALAT_SERVER` |

- **Validasi hanya di batas sistem** (schemas.py dan router). Kode di dalam mempercayai data yang sudah lolos.
- Status kontrak (berjalan, segera, lewat, selesai) **tidak disimpan dan tidak dihitung di backend**. Frontend tetap
  menghitungnya dari tanggal (`src/lib/status.ts`), supaya aturannya hanya ada di satu tempat.
  Backend hanya butuh tanggal berakhir dan `ditandaiSelesai` untuk pengingat.

## 3. Tabel database

Nama tabel dan kolom memakai snake_case (gaya Sismon). Schemas mengubahnya ke camelCase.

**akun**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | int PK | |
| nama, jabatan | varchar | |
| email | varchar, unik, disimpan huruf kecil | email kantor untuk masuk |
| email_notifikasi | varchar null | kosong = pengingat ke email kantor |
| peran | `pengguna` / `admin` | |
| aktif | bool | |
| password_hash | varchar | bcrypt. Tidak pernah dikirim ke frontend |
| nonaktif_alasan, nonaktif_keterangan | varchar/text null | diisi saat dinonaktifkan |
| nonaktif_waktu | timestamptz null | |
| nonaktif_oleh | varchar null | nama admin (teks, supaya tetap terbaca kalau akunnya dihapus) |
| terakhir_masuk, dibuat_pada | timestamptz | |

**kontrak**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | int PK | |
| nama, penyedia | varchar | |
| nomor_pks | varchar **unik** | |
| tanggal_pks, tanggal_mulai, tanggal_berakhir | date | CHECK mulai ≤ berakhir |
| nilai | bigint | CHECK 0 ≤ nilai ≤ 999.999.999.999.999 |
| ketentuan_pengakhiran, _denda, _jaminan, _keterangan | text default '' | `ketentuan` di API |
| perpanjangan | `belum` / `proses` / `diperpanjang` / `tidak` | |
| ditandai_selesai | bool | |
| keterangan_selesai | text default '' | |
| revisi | int default 1 | naik setiap kali diubah (bagian 5, perubahan bersamaan) |
| dibuat_pada, diubah_pada | timestamptz | |

Indeks: `tanggal_berakhir` (pengingat). [TERBUKA] Termin pembayaran **tidak** dibuat sampai ada keputusan atasan.

**dokumen**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | int PK | |
| kontrak_id | FK kontrak, ON DELETE CASCADE | |
| nama | varchar | nama file asli |
| jenis | `PKS utama` / `Adendum` / `BAST` / `Lainnya` | |
| ukuran | bigint | byte |
| tipe_isi | varchar | content-type dari unggahan |
| tanggal | date | tanggal unggah |
| kunci_r2 | varchar unik | `kontrak/{kontrakId}/{uuid}`; nama asli tidak dipakai di kunci |
| versi | jsonb null | isi `VersiKontrak` saat dokumen ini berlaku (lihat bagian 5) |
| diunggah_oleh | FK akun null, ON DELETE SET NULL | |

**riwayat**: id, waktu, oleh_id (FK akun null, SET NULL), oleh_nama (teks), aksi (`tambah`/`ubah`/`hapus`/`selesai`/`unggah`/`akun`),
rincian (teks), kontrak_id (FK null, ON DELETE SET NULL). Indeks: `waktu desc`, `kontrak_id`.
`oleh_nama` disimpan sebagai teks karena akun nonaktif boleh dihapus (CLAUDE.md, 19 Nov 2026).

**percobaan_masuk**: id, akun_id, waktu, berhasil. Dipakai `batas_masuk.py`.

**pengingat_terkirim**: kontrak_id, tahap (3/2/1), tanggal_berakhir, kanal (`email`/`push`), akun_id, waktu.
**UNIK (kontrak_id, tahap, tanggal_berakhir, kanal, akun_id).** Unik ini yang menjamin satu tahap dikirim sekali
(bagian 6). Kalau adendum memindahkan tanggal berakhir, tahapnya dihitung ulang dan dikirim lagi untuk tanggal baru.

**notifikasi_dibaca**: akun_id, kunci (id notifikasi dari `susunNotifikasi`), waktu. UNIK (akun_id, kunci).

**langganan_push**: akun_id, endpoint (unik), p256dh, auth, dibuat_pada. Sama dengan Sismon.

**kunci_idempotensi**: kunci (PK), akun_id, hash_permintaan, keadaan (`berjalan`/`selesai`), jawaban (jsonb), dibuat_pada.
Dihapus setelah 7 hari (bagian 5).

## 4. Daftar endpoint

Kolom "Padanan" menunjuk fungsi di `NilaiData` yang akan memanggilnya.

### Masuk dan akun sendiri
| Metode | Alamat | Hak | Isi → Jawaban | Padanan |
|---|---|---|---|---|
| POST | `/auth/masuk` | semua | `{email, sandi}` → `{token, akun}` | `masuk` |
| GET | `/auth/saya` | login | → `Akun` (memulihkan sesi dari token) | memuat ulang halaman |
| PATCH | `/auth/saya` | login | `{nama?, jabatan?}` → `Akun` | `ubahProfil` |
| POST | `/auth/ganti-sandi` | login | `{sandiLama, sandiBaru}` → `{token}` | `gantiSandi` |

- Gagal masuk memetakan `HasilMasuk`: akun tidak ada atau nonaktif → 401 `AKUN_TIDAK_DITEMUKAN` / `AKUN_NONAKTIF`;
  sandi salah → 401 `SANDI_SALAH` + `sisaPercobaan`; terlalu sering → 423 `TERKUNCI` + `sisaDetik`.
- Pesan "akun tidak ditemukan" sengaja dibedakan karena CLAUDE.md memintanya. [ASUMSI] Dari sisi keamanan,
  pesan ini membocorkan email mana yang terdaftar. Perlu dikonfirmasi tim IT.
- Batas: 5 percobaan gagal (`MAKS_PERCOBAAN_MASUK`), lalu dikunci. [ASUMSI] 5 menit di server (demo 60 detik).
- Token berlaku 12 jam [ASUMSI]. Token membawa sidik hash kata sandi (pola Sismon), jadi ganti atau reset kata sandi
  langsung membatalkan token lama di semua perangkat. Menonaktifkan akun juga ditolak di `akun_masuk()`.
- `sandiBaru` minimal 8 karakter (`MIN_PANJANG_SANDI`) dan maksimal 72 byte (batas bcrypt).

### Kontrak
| Metode | Alamat | Hak | Isi → Jawaban | Padanan |
|---|---|---|---|---|
| GET | `/kontrak` | login | → `Kontrak[]` | daftar, Beranda |
| GET | `/kontrak/{id}` | login | → `Kontrak` | Detail |
| POST | `/kontrak` | login | multipart: `data` (JSON) + `filePks` (opsional) → 201 `Kontrak` | `simpanKontrak(_, true)` |
| PATCH | `/kontrak/{id}` | login | `{revisi, ...field yang berubah}` → `Kontrak` | `simpanKontrak(_, false)` tanpa file baru |
| POST | `/kontrak/{id}/pks` | login | multipart: `data` (JSON, berisi `revisi`) + `filePks` → `Kontrak` | `simpanKontrak` dengan PKS pengganti |
| DELETE | `/kontrak/{id}` | login | → 204 | `hapusKontrak` |
| POST | `/kontrak/{id}/selesai` | login | `{keterangan}` → `Kontrak` | `tandaiSelesai` |
| POST | `/kontrak/{id}/buka-kembali` | login | → `Kontrak` | `bukaKembaliKontrak` |
| POST | `/kontrak/{id}/adendum` | login | multipart: `file`, `tanggalBerakhir`, `nilai`, `revisi` → `Kontrak` | `catatAdendum` |

- **`GET /kontrak` sengaja tanpa pembagian halaman.** Beranda menghitung ringkasan dari semua kontrak, sementara
  filter, urutan, dan pembagian halaman sudah ada di frontend dan tersimpan di alamat. Perkiraan jumlahnya ratusan
  kontrak. Kalau suatu hari lebih dari 2.000, ditambahkan `?hal=&per=` sebagai parameter opsional, tanpa mengubah
  bentuk jawaban lama.
- `Kontrak.dokumen` ikut dikirim tanpa `url`. Tautan file diminta terpisah (lihat Dokumen), karena tautan bertanda
  tangan cepat kedaluwarsa.
- `selesai` juga mengubah perpanjangan `belum`/`proses` menjadi `tidak`; `buka-kembali` mengembalikan `tidak` menjadi
  `belum`. Aturan ini sama dengan komentar di `data.ts`. Kontrak yang sudah selesai → 409 `SUDAH_SELESAI`.
- `adendum` dijalankan dalam satu transaksi: versi lama disimpan, file masuk sebagai dokumen `Adendum`, tanggal berakhir
  dan nilai diganti, perpanjangan menjadi `diperpanjang`, lalu riwayat dicatat.
- Setiap perubahan mencatat satu baris riwayat dengan kalimat yang sama seperti purwarupa.

### Dokumen
| Metode | Alamat | Hak | Isi → Jawaban | Padanan |
|---|---|---|---|---|
| POST | `/kontrak/{id}/dokumen` | login | multipart: `file`, `jenis` → 201 `Dokumen` | `tambahDokumen` |
| GET | `/dokumen/{id}/tautan?unduh=true` | login | → `{url, berlakuSampai}` | pratinjau dan unduh |

- File dikirim **lewat backend** (bukan langsung ke R2), seperti Sismon. Dengan cara ini ukuran dan jenis file bisa
  dicek di satu tempat, dan tidak ada file yatim kalau penyimpanan ke database gagal.
- Batas ukuran file: [TERBUKA] pertanyaan untuk atasan. Untuk sementara `MAKS_UKURAN_BERKAS_MB=25` di `.env` [ASUMSI].
  Lebih dari itu → 413.
- Semua jenis file boleh (CLAUDE.md), tetapi `Content-Disposition` unduhan selalu `attachment` untuk jenis selain
  PDF dan gambar, supaya file HTML atau SVG tidak dijalankan di browser.
- Tautan R2 bertanda tangan berlaku 10 menit [ASUMSI]. `unduh=true` menambahkan nama file asli di tautan.
- Tidak ada endpoint hapus dokumen, karena purwarupa juga tidak punya. PKS lama tetap disimpan sebagai riwayat.

### Akun (admin)
| Metode | Alamat | Hak | Isi → Jawaban | Padanan |
|---|---|---|---|---|
| GET | `/akun` | admin | → `Akun[]` | halaman Admin |
| GET | `/akun/alasan-nonaktif` | admin | → `string[]` | pilihan alasan di dialog nonaktifkan |
| POST | `/akun` | admin | `{nama, email, jabatan, peran, emailNotifikasi?}` → 201 `{akun, sandiSementara}` | `tambahAkun` |
| POST | `/akun/{id}/reset-sandi` | admin | → `{sandiSementara}` | `resetSandi` |
| POST | `/akun/{id}/nonaktifkan` | admin | `{alasan, keterangan}` → `Akun` | `ubahAktifAkun(_, false)` |
| POST | `/akun/{id}/aktifkan` | admin | → `Akun` | `ubahAktifAkun(_, true)` |
| DELETE | `/akun/{id}` | admin | → 204; akun aktif → 409 `AKUN_MASIH_AKTIF` | `hapusAkun` |
| PUT | `/akun/{id}/email-notifikasi` | admin atau pemilik | `{emailNotifikasi}` (kosong = email kantor) → `Akun` | `ubahEmailNotifikasi` |

- `sandiSementara` hanya muncul sekali di jawaban itu dan tidak disimpan dalam bentuk asli.
- Admin tidak bisa menonaktifkan atau menghapus dirinya sendiri, dan admin aktif terakhir tidak bisa dinonaktifkan
  → 409 `ADMIN_TERAKHIR`. Ini mencegah tidak ada lagi yang bisa mengelola akun.
- `alasan` harus salah satu dari `ALASAN_NONAKTIF` (`src/lib/akun.ts`). Daftarnya dipindah ke backend dan frontend
  memintanya lewat `GET /akun/alasan-nonaktif`, supaya hanya ada satu daftar.
- Tipe `Akun` di frontend kehilangan field `sandi` (hanya untuk data contoh).

### Riwayat, notifikasi, Web Push
| Metode | Alamat | Hak | Isi → Jawaban |
|---|---|---|---|
| GET | `/riwayat?kontrakId=&sebelum=&batas=20` | login | → `{data: CatatanRiwayat[], berikutnya: string \| null}` |
| GET | `/notifikasi/dibaca` | login | → `string[]` |
| POST | `/notifikasi/dibaca` | login | `{ids: string[]}` → 204 |
| GET | `/push/kunci-publik` | login | → `{kunci}` |
| POST | `/push/langganan` | login | langganan browser → 204 |
| DELETE | `/push/langganan` | login | `{endpoint}` → 204 |

- Riwayat dibagi per halaman dengan kursor (`sebelum` = id terakhir yang sudah tampil), karena jumlahnya terus bertambah.
- Pengguna biasa hanya menerima riwayat kontrak. Riwayat akun (`aksi = akun`) hanya untuk admin (CLAUDE.md).
- Isi notifikasi lonceng tetap disusun frontend dari daftar kontrak (`susunNotifikasi`). Backend hanya menyimpan
  mana yang sudah dibaca, per akun, supaya tetap sama di HP dan laptop.
- Unduh Excel tetap dibuat di frontend (`src/lib/excel.ts`) dari data `GET /kontrak`, jadi tidak perlu endpoint.

## 5. Perubahan bersamaan, ulangan permintaan, dan versi

**Dua orang mengubah kontrak yang sama.** Setiap `Kontrak` membawa `revisi`. Perubahan (`PATCH`, `/pks`,
`/adendum`) wajib mengirim `revisi` yang terakhir dibaca. Kalau sudah berbeda → 409 `DATA_SUDAH_BERUBAH`, dan
frontend memuat ulang kontrak lalu menampilkan pesan "Kontrak ini baru saja diubah orang lain." Tanpa ini, perubahan
orang pertama hilang diam-diam.

**Permintaan terkirim dua kali** (klik ganda, sinyal putus lalu diulang).
- Aman diulang tanpa tambahan apa pun: `PATCH` (hasilnya sama), `DELETE` (kalau sudah terhapus tetap 204),
  `selesai` dan `buka-kembali` (409 kalau sudah dalam keadaan itu), `notifikasi/dibaca` (unik per akun).
- Bisa membuat data ganda: `POST /kontrak` (dijaga unik `nomor_pks`), `POST /kontrak/{id}/dokumen`,
  `POST /kontrak/{id}/adendum`. Ketiganya menerima header `Idempotency-Key`. Frontend membuat kunci itu sekali
  per pengiriman form (bukan per percobaan), lalu memakainya lagi saat mengulang.
  - Kunci diklaim dengan `INSERT` ke `kunci_idempotensi`. **Unik di database yang menentukan pemenangnya**,
    bukan "cek dulu lalu simpan".
  - Kunci yang sama dengan isi berbeda → 422 `KUNCI_DIPAKAI_ULANG`.
  - Kunci yang masih berjalan → 409 `MASIH_DIPROSES`. Frontend menunggu sebentar lalu mengulang.
  - Kunci selesai → jawaban pertama dikirim ulang.
  - Disimpan 7 hari, lebih lama dari ulangan apa pun di aplikasi ini.

**Versi kontrak** (padanan `src/lib/versiKontrak.ts`). Saat PKS pengganti atau adendum masuk, `versi.py` lebih dulu
menyimpan data kontrak saat ini ke dokumen berversi terakhir yang belum punya `versi`, baru setelah itu data kontrak
diganti. Semuanya dalam satu transaksi.

**Urutan file dan database.** File diunggah ke R2 dulu, lalu transaksi database dijalankan. Kalau transaksi gagal,
file di R2 langsung dihapus. Menghapus kontrak menghapus baris dulu, lalu file R2-nya. File yang gagal dihapus dicatat
di log untuk dibersihkan, tanpa membatalkan penghapusan.

## 6. Pengingat 3, 2, 1 bulan

- `kirim_pengingat.py` dijalankan cron di server **sekali sehari pukul 07.00 WIB** [ASUMSI]. Tidak butuh pustaka
  penjadwal baru.
- Untuk setiap kontrak yang belum `ditandai_selesai`: tanggal tahap = tanggal berakhir mundur 3, 2, 1 bulan kalender.
  Kalau tanggalnya tidak ada di bulan itu, dipakai hari terakhir bulannya. Aturannya sama dengan `src/lib/status.ts`,
  dan harus diuji dengan contoh yang sama (13 Des → 13 Sep, 13 Okt, 13 Nov; 31 Mei → 28/29 Feb).
- Tahap yang tanggalnya sudah lewat atau hari ini dan belum tercatat di `pengingat_terkirim` dikirim ke semua akun aktif:
  email (ke `email_notifikasi` atau email kantor) dan Web Push.
  - Sebelum mengirim, baris di `pengingat_terkirim` dibuat dulu.
  - Kalau `INSERT` bentrok dengan unik, berarti sudah dikirim, jadi dilewati.
  - Dengan cara ini, cron yang jalan dua kali atau diulang setelah server mati tidak mengirim dobel.
- Pengiriman yang gagal (SMTP mati) menghapus barisnya lagi, sehingga dicoba ulang besok.
- [TERBUKA] Layanan email belum dipilih: SMTP kantor, atau layanan seperti Brevo/Resend. Cukup ganti isi `.env`.

## 7. Pengaturan (.env)

```
DATABASE_URL=postgresql+psycopg://...neon.tech/...   # pakai alamat "pooled" Neon
DATABASE_URL_MIGRASI=...  # alamat "direct" Neon untuk Alembic (migrasi tidak lewat pooler)
DATABASE_URL_UJI=...      # alamat direct branch Neon "uji", hanya untuk pytest
JWT_SECRET=...            JWT_MENIT=720
LAMA_KUNCI_DETIK=300      # lama akun dikunci setelah 5 kali salah sandi
R2_ACCOUNT_ID=...  R2_ACCESS_KEY=...  R2_SECRET_KEY=...  R2_BUCKET=...  R2_URL_MENIT=10
MAKS_UKURAN_BERKAS_MB=25
SMTP_HOST=...  SMTP_PORT=587  SMTP_USER=...  SMTP_SANDI=...  SMTP_PENGIRIM=...
VAPID_PUBLIK=...  VAPID_PRIVAT=...  VAPID_KONTAK=mailto:...
ASAL_FRONTEND=https://...   # CORS
```

`.env` tidak pernah di-commit. Contohnya ditulis di `backend/.env.contoh` (dikecualikan di `.gitignore` lewat `!.env.contoh`).

## 8. Urutan pengerjaan

1. Kerangka: config, database, migrasi awal untuk `akun` dan `kontrak`, `seed.py` dengan data contoh **fiktif**
   (berkata "Contoh", bukan isi PKS asli).
2. Auth: masuk, saya, ganti sandi, batas percobaan. Frontend: halaman Masuk dan `PenyediaData` memakai token.
3. Kontrak: GET, POST, PATCH, DELETE, selesai, buka kembali, riwayat. Frontend: Beranda, Kontrak, Detail, form.
4. Dokumen dan R2: unggah, tautan, PKS pengganti, adendum, versi.
5. Akun (admin) dan Profil.
6. Notifikasi dibaca, Web Push, `kirim_pengingat.py` + email.
7. `KONTRAK-API.md` final dan uji ujung ke ujung.

Setiap langkah bisa dipakai sendiri. Selama langkah 3 belum selesai, data contoh di frontend tetap jalan.

## 9. Pertanyaan yang memengaruhi backend

| Pertanyaan | Untuk | Pengaruh |
|---|---|---|
| Batas ukuran file dokumen | atasan | `MAKS_UKURAN_BERKAS_MB` |
| Termin pembayaran perlu dicatat? | atasan | tabel baru `termin` (tambahan, tidak mengubah yang lama) |
| Layanan email pengingat | tim IT | isi `.env` SMTP |
| Server untuk backend dan cron | tim IT | sama dengan Sismon atau terpisah |
| Database produksi di akun siapa dan di negara mana | tim IT / hukum | Database **produksi** harus atas nama akun kantor, bukan akun pribadi pengembang. Neon terdekat ada di Singapura; perlu dicek apakah data kontrak instansi boleh disimpan di luar Indonesia. Selama pengembangan dipakai database terpisah berisi data **fiktif** saja. |
| Pesan "akun tidak ditemukan" boleh dibedakan? | tim IT | keamanan halaman Masuk |
| Lama kunci setelah gagal masuk, lama sesi | tim IT | `batas_masuk.py`, `JWT_MENIT` |
| Template Excel impor data awal | atasan | endpoint impor (belum dirancang) |
