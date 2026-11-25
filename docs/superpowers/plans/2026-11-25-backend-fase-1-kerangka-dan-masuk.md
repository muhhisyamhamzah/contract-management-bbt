# Backend fase 1: kerangka dan masuk. Rencana pengerjaan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Folder `backend/` yang bisa dijalankan. Isinya: tabel `akun`, `kontrak`, `riwayat`, dan `percobaan_masuk` di Neon, serta endpoint `/api/auth/*` (masuk, saya, ubah profil, ganti sandi) dengan bentuk jawaban yang sama persis dengan tipe frontend.

**Architecture:** FastAPI + SQLAlchemy 2 (sinkron) + Alembic, dengan pola Sismon (`sismon_bank_tanah/backend`): `config.py` (pydantic-settings), `database.py`, `security.py` (bcrypt dan JWT dengan sidik hash sandi), `deps.py`. Galat memakai satu bentuk `{detail, kode, ...}` dari satu modul `galat.py`. Uji memakai pytest pada branch Neon `uji`, bukan database utama.

**Tech Stack:** Python 3.12 (`/opt/anaconda3/bin/python3.12`, sama dengan venv Sismon), FastAPI 0.141.1, SQLAlchemy 2.0.54, Alembic 1.20.0, psycopg 3.3.6, PyJWT 2.7.0, bcrypt 5.0.0, pydantic-settings 2.15.0. Untuk uji: pytest dan httpx (lihat Batasan).

**Spec:** `docs/RANCANGAN-BACKEND.md` (bagian 1, 2, 3, 4 "Masuk dan akun sendiri", 7, dan 8 langkah 1–2). Baca juga `src/types/kontrak.ts` (`Akun`, `CatatanNonaktif`) dan `src/lib/data.ts` (`HasilMasuk`, `MAKS_PERCOBAAN_MASUK`, `MIN_PANJANG_SANDI`).

**Di luar rencana ini:** endpoint kontrak dan data contoh kontrak (fase 3), R2 dan dokumen (fase 4), admin akun (fase 5), serta penyambungan halaman Masuk di frontend ke API (rencana terpisah setelah ini). Halaman frontend tidak berubah di sini.

## Global Constraints

- **Izin Hisyam diperlukan sebelum Task 1:** `pytest` dan `httpx` adalah pustaka baru, karena Sismon tidak punya uji. Keduanya hanya masuk ke `backend/requirements-dev.txt` dan tidak ikut ke server. Kalau tidak diizinkan, rencana ini harus diubah dulu.
- Versi pustaka produksi disalin persis dari `sismon_bank_tanah/backend/requirements.txt`. Selain pytest dan httpx, tidak ada pustaka di luar daftar itu.
- Semua alamat diawali `/api`. Field JSON memakai camelCase berbahasa Indonesia. Kolom database memakai snake_case.
- `id` dikirim sebagai string. Waktu dikirim sebagai ISO 8601 berzona `+07:00` (Asia/Jakarta).
- Semua galat berbentuk `{"detail": str, "kode": str}`, dengan tambahan `sisaPercobaan`, `sisaDetik`, atau `kolom` bila perlu. `detail` adalah kalimat Indonesia yang langsung ditampilkan ke pengguna.
- Field opsional yang kosong (`nonaktif`, `emailNotifikasi`) **tidak ikut dikirim**, karena frontend memakai `?:`, bukan `null`.
- `MAKS_PERCOBAAN_MASUK = 5`. Lama kunci diatur lewat `.env` `LAMA_KUNCI_DETIK`, bawaannya 300 (purwarupa memakai 60).
- `MIN_PANJANG_SANDI = 8`. Sandi paling panjang 72 **byte**.
- Token berlaku `JWT_MENIT=720`. Server menolak menyala kalau `JWT_SECRET` masih bawaan atau kurang dari 32 karakter (pola Sismon).
- Neon: aplikasi memakai alamat **pooled** (`-pooler`), Alembic memakai alamat **direct** (`DATABASE_URL_MIGRASI`), sesuai skill neon-postgres. Variabel ini menambah bagian 7 di rancangan, jadi perbarui juga dokumennya di Task 1.
- Data contoh hanya akun fiktif dengan kata "Contoh" (salin dari `src/data/akunContoh.ts`). Jangan memakai isi PKS asli.
- `.env`, `.venv/`, dan `__pycache__/` tidak boleh di-commit. Setiap commit ditutup dengan baris `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Jangan push** tanpa izin Hisyam.

## Review Focus

1. **Email dengan huruf besar atau spasi di tepi** (`" Wahyu.Contoh@BBT.go.id "`) harus tetap menemukan akunnya. Di purwarupa, email di-trim dan dikecilkan. Diuji di Task 5.
2. **Token rusak**, misalnya `sub` bukan angka, tanpa `sv`, atau akunnya sudah dihapus, harus menghasilkan 401 `PERLU_MASUK`, bukan 500. Diuji di Task 5.
3. **Badan permintaan bukan JSON yang sah** harus menghasilkan 400 `PERMINTAAN_RUSAK`, bukan 422 bawaan FastAPI. Diuji di Task 2.
4. **Sandi baru dengan huruf non-ASCII** yang di bawah 72 karakter tapi di atas 72 byte (misalnya 30 emoji) harus menghasilkan 422 dengan pesan, bukan 500 dari bcrypt. Diuji di Task 6.
5. **Setelah kunci berakhir**, pengguna mendapat 5 percobaan lagi, bukan langsung terkunci lagi pada percobaan berikutnya. Ini sama dengan purwarupa. Diuji di Task 4.

---

## Susunan file

```
backend/
  requirements.txt  requirements-dev.txt  .env.contoh  alembic.ini  README.md  seed.py
  alembic/env.py  alembic/script.py.mako  alembic/versions/0001_akun_kontrak_riwayat.py
  app/__init__.py
  app/config.py      pengaturan .env, ZONA
  app/database.py    engine, SesiLokal, Base, ambil_db()
  app/galat.py       GalatApi + penangan galat terpasang ke app
  app/main.py        app, CORS, router, /api/cek
  app/models.py      Akun, Kontrak, Riwayat, PercobaanMasuk
  app/schemas.py     model masuk/keluar camelCase
  app/security.py    bcrypt, JWT, sidik sandi
  app/batas_masuk.py hitung kunci dari percobaan_masuk
  app/deps.py        akun_masuk()
  app/riwayat.py     catat_riwayat()
  app/tampil.py      ke_akun(Akun) -> AkunKeluar
  app/routers/__init__.py  app/routers/auth.py
  tests/conftest.py  tests/test_*.py
```

---

### Task 0: Persiapan oleh Hisyam (tidak ada kode)

- [ ] **Step 1:** Setujui pustaka uji `pytest` dan `httpx`.
- [ ] **Step 2:** Di console.neon.tech, buat proyek `contract-management-bbt` (region Singapore, seperti Sismon) dengan branch `main`, lalu buat branch `uji` dari `main`.
- [ ] **Step 3:** Catat tiga alamat: pooled `main`, direct `main`, dan direct `uji`. Ganti awalan `postgresql://` menjadi `postgresql+psycopg://`. Ketiganya ditaruh di `backend/.env` pada Task 1, **tidak** ditempel di chat.

---

### Task 1: Kerangka aplikasi dan pengaturan

**Files:**
- Create: `backend/requirements.txt`, `backend/requirements-dev.txt`, `backend/.env.contoh`, `backend/app/__init__.py`, `backend/app/config.py`, `backend/app/database.py`, `backend/app/main.py`, `backend/app/routers/__init__.py`, `backend/tests/__init__.py`, `backend/tests/test_kerangka.py`, `backend/pytest.ini`
- Modify: `.gitignore` (tambahkan `backend/.env`, `backend/.venv/`, `__pycache__/`, `.pytest_cache/`), `docs/RANCANGAN-BACKEND.md` bagian 7 (tambahkan `DATABASE_URL_MIGRASI`, `DATABASE_URL_UJI`, `LAMA_KUNCI_DETIK`)

**Interfaces:**
- Produces:
  - `app.config.pengaturan: Pengaturan`, dengan field `database_url`, `database_url_migrasi` (kosong berarti memakai `database_url`), `database_url_uji`, `jwt_secret`, `jwt_menit=720`, `lama_kunci_detik=300`, dan `asal_frontend="http://localhost:5173"`.
  - Properti `daftar_asal: list[str]` (dipisah koma).
  - `app.config.ZONA = ZoneInfo("Asia/Jakarta")`.
  - `app.database.engine`, `SesiLokal`, `Base(DeclarativeBase)`, dan `ambil_db() -> Generator[Session]` (salin dari Sismon).
  - `app.main.app: FastAPI`.

- [ ] **Step 1:** Buat venv dengan `/opt/anaconda3/bin/python3.12 -m venv backend/.venv`, lalu tulis `requirements.txt`. Isinya baris fastapi, uvicorn[standard], SQLAlchemy, psycopg[binary], alembic, pydantic, pydantic-settings, email-validator, PyJWT, bcrypt, dan tzdata, dengan versi persis dari Sismon. pywebpush dan boto3 menyusul di fase 4 dan 6. Tulis `requirements-dev.txt`: `-r requirements.txt`, `pytest`, `httpx` (versi dipatok ke yang terpasang). Jalankan `backend/.venv/bin/pip install -r backend/requirements-dev.txt`.
- [ ] **Step 2: Tulis uji yang gagal** di `tests/test_kerangka.py`:

```python
def test_cek_server_hidup(klien):
    r = klien.get("/api/cek")
    assert r.status_code == 200 and r.json() == {"status": "ok"}

def test_jwt_secret_bawaan_ditolak():
    with pytest.raises(ValidationError):
        Pengaturan(jwt_secret="ganti-dengan-teks-acak-yang-panjang", _env_file=None)

def test_jwt_secret_pendek_ditolak():
    with pytest.raises(ValidationError):
        Pengaturan(jwt_secret="a" * 31, _env_file=None)
```

  Fixture `klien` sementara ditaruh di `tests/conftest.py` sebagai `TestClient(app)`. `pytest.ini` berisi `pythonpath = .` dan `testpaths = tests`.
- [ ] **Step 3:** Jalankan `cd backend && .venv/bin/pytest tests/test_kerangka.py -v`. Hasil yang diharapkan: FAIL karena `app.config` belum ada.
- [ ] **Step 4:** Tulis `config.py`, `database.py`, dan `main.py`.
  - Validator `jwt_secret` dan konstanta `JWT_SECRET_BAWAAN` disalin dari Sismon.
  - CORS memakai `daftar_asal`.
  - `GET /api/cek` menjawab `{"status": "ok"}`.
  - `.env.contoh` memuat semua variabel bagian 7 rancangan ditambah tiga variabel baru, dengan nilai contoh. `JWT_SECRET` diisi petunjuk cara membuatnya.
- [ ] **Step 5:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: 3 passed.
- [ ] **Step 6: Commit**

```bash
git add .gitignore docs/RANCANGAN-BACKEND.md backend/requirements*.txt backend/.env.contoh backend/pytest.ini backend/app backend/tests
git commit -m "backend: kerangka fastapi, pengaturan, dan cek server"
```

---

### Task 2: Satu bentuk galat

**Files:**
- Create: `backend/app/galat.py`, `backend/tests/test_galat.py`
- Modify: `backend/app/main.py` (panggil `pasang_penangan(app)`)

**Interfaces:**
- Produces:
  - `class GalatApi(Exception)` dengan konstruktor `__init__(self, status: int, kode: str, detail: str, **tambahan)`. `tambahan` ikut ke badan JSON, misalnya `sisaPercobaan=4` atau `kolom={...}`.
  - `pasang_penangan(app: FastAPI) -> None`.

- [ ] **Step 1: Tulis uji yang gagal.** Untuk uji ini, daftarkan rute sementara di `conftest.py` pada sebuah app uji kecil yang juga memanggil `pasang_penangan`:
  - `GET /uji/galat` melempar `GalatApi(409, "NOMOR_PKS_DIPAKAI", "Nomor PKS sudah dipakai.", sisaDetik=3)`.
  - `GET /uji/rusak` melempar `RuntimeError("rahasia internal")`.
  - `POST /uji/isian` menerima `{tanggalBerakhir: date}` lewat model alias camelCase.

```python
def test_galat_api_berbentuk_detail_kode(klien_uji):
    r = klien_uji.get("/uji/galat")
    assert r.status_code == 409
    assert r.json() == {"detail": "Nomor PKS sudah dipakai.", "kode": "NOMOR_PKS_DIPAKAI", "sisaDetik": 3}

def test_isian_salah_422_dengan_kolom_camelcase(klien_uji):
    r = klien_uji.post("/uji/isian", json={"tanggalBerakhir": "bukan-tanggal"})
    assert r.status_code == 422
    assert r.json()["kode"] == "ISIAN_TIDAK_SAH"
    assert set(r.json()["kolom"]) == {"tanggalBerakhir"}

def test_json_rusak_400(klien_uji):   # Review Focus 3
    r = klien_uji.post("/uji/isian", content=b"{tanggal", headers={"content-type": "application/json"})
    assert r.status_code == 400 and r.json()["kode"] == "PERMINTAAN_RUSAK"

def test_alamat_tidak_ada_404(klien):
    r = klien.get("/api/tidak-ada")
    assert r.status_code == 404 and r.json()["kode"] == "TIDAK_DITEMUKAN"

def test_galat_tak_terduga_500_tanpa_rincian(klien_uji_tanpa_raise):
    r = klien_uji_tanpa_raise.get("/uji/rusak")
    assert r.status_code == 500 and r.json()["kode"] == "GALAT_SERVER"
    assert "rahasia" not in r.text
```

  `klien_uji_tanpa_raise` dibuat dengan `TestClient(app_uji, raise_server_exceptions=False)`.
- [ ] **Step 2:** Jalankan `.venv/bin/pytest tests/test_galat.py -v`. Hasil yang diharapkan: FAIL karena `app.galat` belum ada.
- [ ] **Step 3:** Tulis `galat.py` dengan empat penangan:
  - `GalatApi` dijawab dengan status dan badannya sendiri.
  - `RequestValidationError`: kalau ada galat bertipe `json_invalid`, jawab 400 `PERMINTAAN_RUSAK`. Selain itu jawab 422 `ISIAN_TIDAK_SAH`, dengan `kolom` dari `loc[-1]` (alias camelCase) berisi pesan Indonesia. Pesannya meniru `_pesan()` Sismon, dan `detail` adalah gabungan pesan-pesan itu.
  - `StarletteHTTPException`: 404 menjadi `TIDAK_DITEMUKAN`, 405 menjadi `PERMINTAAN_RUSAK`, dan selain itu dipetakan menurut tabel status di bagian 2.
  - `Exception`: catat ke log, lalu jawab 500 `GALAT_SERVER` dengan detail "Terjadi galat di server. Coba lagi sebentar lagi."
- [ ] **Step 4:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: semua lulus.
- [ ] **Step 5:** Commit dengan pesan `backend: satu bentuk galat {detail, kode}`.

---

### Task 3: Tabel dan migrasi pertama

**Files:**
- Create: `backend/app/models.py`, `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/script.py.mako`, `backend/alembic/versions/0001_akun_kontrak_riwayat.py`, `backend/tests/test_tabel.py`
- Modify: `backend/tests/conftest.py`

**Interfaces:**
- Produces:
  - Model `Akun`, `Kontrak`, `Riwayat`, `PercobaanMasuk` dengan kolom persis seperti bagian 3 rancangan. Atribut Python sama dengan nama kolom snake_case.
  - Fixture `db: Session`, terhubung ke `DATABASE_URL_UJI`.
  - Fixture `buat_akun(**ubah) -> Akun`. Bawaannya `nama="Wahyu Contoh"`, `email="wahyu.contoh@bbt.go.id"`, `jabatan="Tim Contoh"`, `peran="pengguna"`, `aktif=True`, sandi `"sandi-contoh-1"`. Hasilnya sudah di-commit.

- [ ] **Step 1:** `conftest.py`:
  - Sekali per sesi uji: hentikan uji dengan pesan jelas kalau `DATABASE_URL_UJI` kosong. Lalu tetapkan `DATABASE_URL` dan `DATABASE_URL_MIGRASI` ke alamat uji **sebelum** mengimpor `app`, dan jalankan `alembic downgrade base` lalu `alembic upgrade head` lewat `alembic.command`.
  - Per uji: jalankan `TRUNCATE akun, kontrak, riwayat, percobaan_masuk RESTART IDENTITY CASCADE`.
  - Fixture `klien` mengganti `ambil_db` ke sesi uji lewat `app.dependency_overrides`.
- [ ] **Step 2: Tulis uji yang gagal** di `tests/test_tabel.py`:

```python
def test_email_disimpan_huruf_kecil_dan_unik(db, buat_akun):
    buat_akun(email="wahyu.contoh@bbt.go.id")
    with pytest.raises(IntegrityError):
        buat_akun(email="WAHYU.CONTOH@bbt.go.id")   # CHECK email = lower(email) atau unik

def test_peran_hanya_pengguna_atau_admin(db, buat_akun):
    with pytest.raises(IntegrityError):
        buat_akun(peran="superadmin")

def test_kontrak_tanggal_mulai_setelah_berakhir_ditolak(db):
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, tanggal_mulai=date(2026, 12, 2), tanggal_berakhir=date(2026, 12, 1))

def test_kontrak_nilai_di_luar_batas_ditolak(db):
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, nilai=1_000_000_000_000_000)
    db.rollback()
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, nilai=-1)

def test_nomor_pks_unik(db):
    simpan_kontrak(db, nomor_pks="001/CONTOH/PKS/2026")
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, nomor_pks="001/CONTOH/PKS/2026")

def test_kontrak_baru_revisi_1_dan_perpanjangan_belum(db):
    k = simpan_kontrak(db)
    assert k.revisi == 1 and k.perpanjangan == "belum" and k.ditandai_selesai is False

def test_hapus_kontrak_mengosongkan_kontrak_id_riwayat(db, buat_akun):
    ...  # riwayat.kontrak_id menjadi NULL, barisnya tetap ada

def test_model_sama_dengan_migrasi(db):
    # alembic.autogenerate.compare_metadata(MigrationContext.configure(conn), Base.metadata) == []
```

  `simpan_kontrak(db, **ubah)` adalah fungsi bantu di file uji dengan isi kontrak fiktif "Contoh", lalu `db.commit()`.
- [ ] **Step 3:** Jalankan `.venv/bin/pytest tests/test_tabel.py -v`. Hasil yang diharapkan: FAIL karena `app.models` belum ada.
- [ ] **Step 4:** Tulis `models.py` dan migrasi `0001`. Migrasi ditulis tangan, nama constraint eksplisit, dan `downgrade()` menghapus semuanya.
  - Constraint:
    - `ck_akun_email_kecil` (`email = lower(email)`) dan `uq_akun_email`
    - `ck_akun_peran`
    - `ck_kontrak_tanggal` (`tanggal_mulai <= tanggal_berakhir`)
    - `ck_kontrak_nilai` (`nilai BETWEEN 0 AND 999999999999999`)
    - `ck_kontrak_perpanjangan`
    - `uq_kontrak_nomor_pks`
    - `ck_riwayat_aksi`
  - Indeks: `ix_kontrak_tanggal_berakhir`, `ix_riwayat_waktu` (desc), `ix_riwayat_kontrak_id`, `ix_percobaan_masuk_akun_waktu` (`akun_id`, `waktu`).
  - `percobaan_masuk.akun_id` merujuk `akun` dengan ON DELETE CASCADE.
  - Waktu memakai `timestamptz` dengan `server_default=func.now()`.
  - `alembic/env.py` disalin dari Sismon, tetapi memakai `pengaturan.database_url_migrasi or pengaturan.database_url`.
- [ ] **Step 5:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: semua lulus, termasuk `test_model_sama_dengan_migrasi`.
- [ ] **Step 6:** Commit dengan pesan `backend: tabel akun, kontrak, riwayat, percobaan_masuk (migrasi 0001)`.

---

### Task 4: Keamanan sandi, token, dan batas percobaan

**Files:**
- Create: `backend/app/security.py`, `backend/app/batas_masuk.py`, `backend/tests/test_security.py`, `backend/tests/test_batas_masuk.py`

**Interfaces:**
- Consumes: `Akun`, `PercobaanMasuk`, fixture `db`, dan `buat_akun`.
- Produces:
  - `security.py`, disalin dari Sismon:
    - `MAKS_BYTE_SANDI = 72`, `MIN_PANJANG_SANDI = 8`
    - `sandi_terlalu_panjang(s) -> bool`
    - `acak_sandi(s) -> str`, `cocok_sandi(s, hash_) -> bool`
    - `sidik_sandi(hash_) -> str`
    - `buat_token(akun_id: int, password_hash: str) -> str`, dengan isi `sub`, `sv`, `exp`, tanpa `peran` karena peran dibaca ulang dari database
    - `baca_token(t) -> dict | None`
  - `batas_masuk.py`:
    - `MAKS_PERCOBAAN_MASUK = 5`
    - `sisa_detik_kunci(db, akun, sekarang: datetime) -> int` (0 artinya boleh mencoba)
    - `catat_gagal(db, akun, sekarang) -> int | None`: mengembalikan sisa percobaan, atau `None` kalau percobaan ini membuat akun terkunci
    - `catat_berhasil(db, akun, sekarang) -> None`
    - Parameter `sekarang` disediakan supaya uji tidak perlu menunggu.

- [ ] **Step 1: Tulis uji yang gagal**, `test_security.py`:
  - Sandi yang benar cocok dengan hasil `acak_sandi`, sedangkan sandi lain tidak.
  - `cocok_sandi("x", "bukan-hash")` bernilai `False`, tidak melempar galat.
  - `sandi_terlalu_panjang("😀" * 19)` bernilai `True` (76 byte).
  - `baca_token(buat_token(7, h))["sub"] == "7"`.
  - `sidik_sandi(h1) != sidik_sandi(h2)`.
  - Token yang `exp`-nya lewat dibaca sebagai `None`.
- [ ] **Step 2: Tulis uji yang gagal**, `test_batas_masuk.py`. Semua waktu memakai `t0 = datetime(2026, 11, 25, 9, 0, tzinfo=ZONA)`:

```python
def test_gagal_pertama_sisa_4(db, buat_akun):
    a = buat_akun(); assert catat_gagal(db, a, t0) == 4

def test_gagal_kelima_mengunci_selama_lama_kunci(db, buat_akun):
    a = buat_akun()
    for i in range(4): catat_gagal(db, a, t0 + timedelta(seconds=i))
    assert catat_gagal(db, a, t0 + timedelta(seconds=4)) is None
    assert sisa_detik_kunci(db, a, t0 + timedelta(seconds=5)) == 299
    assert sisa_detik_kunci(db, a, t0 + timedelta(seconds=4 + 300)) == 0

def test_setelah_kunci_habis_dapat_5_percobaan_lagi(db, buat_akun):   # Review Focus 5
    ...  # 5 gagal, lewati 300 detik, gagal sekali lagi -> sisa 4 (bukan terkunci)

def test_berhasil_mereset_hitungan(db, buat_akun):
    ...  # 3 gagal, catat_berhasil, gagal sekali -> sisa 4
```

- [ ] **Step 3:** Jalankan `.venv/bin/pytest tests/test_security.py tests/test_batas_masuk.py -v`. Hasil yang diharapkan: FAIL karena modulnya belum ada.
- [ ] **Step 4:** Tulis kedua modul. Aturan hitung di `batas_masuk`:
  1. `gagal` = percobaan gagal dengan `waktu` setelah percobaan berhasil terakhir, diurutkan menurut waktu. Misalkan `n = len(gagal)`.
  2. Akun terkunci kalau `n > 0`, `n % 5 == 0`, dan `gagal[-1] + lama_kunci_detik > sekarang`.
  3. Sisa percobaan = `5 - (n % 5)`.

  `sisa_detik_kunci` dibulatkan ke atas, seperti `Math.ceil` di purwarupa. Lama kunci dibaca dari `pengaturan.lama_kunci_detik`.
- [ ] **Step 5:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: semua lulus.
- [ ] **Step 6:** Commit dengan pesan `backend: bcrypt, jwt dengan sidik sandi, dan batas percobaan masuk`.

---

### Task 5: Masuk dan memulihkan sesi

**Files:**
- Create: `backend/app/schemas.py`, `backend/app/tampil.py`, `backend/app/deps.py`, `backend/app/routers/auth.py`, `backend/tests/test_masuk.py`
- Modify: `backend/app/main.py` (pasang router auth)

**Interfaces:**
- Consumes: `security.*`, `batas_masuk.*`, `GalatApi`.
- Produces:
  - `schemas.SkemaDasar(BaseModel)`, dengan `alias_generator=to_camel`, `populate_by_name=True`, dan `serialize_by_alias=True`. Semua skema lain mewarisinya.
  - Skema `IsianMasuk {email: str, sandi: str}`.
  - Skema `CatatanNonaktif {alasan, keterangan, waktu: str, oleh}`.
  - Skema `AkunKeluar {id: str, nama, email, jabatan, peran, aktif, nonaktif?: CatatanNonaktif, emailNotifikasi?: str}`.
  - Skema `HasilMasukOk {token: str, akun: AkunKeluar}` dan `TokenBaru {token: str}`.
  - `tampil.ke_akun(a: Akun) -> AkunKeluar`. `nonaktif` diisi hanya kalau `nonaktif_alasan` ada. `waktu` dalam ISO berzona `ZONA`.
  - `deps.akun_masuk(...) -> Akun`, sebagai dependensi FastAPI.
  - Router `APIRouter(prefix="/api/auth")`. Rute yang mengembalikan `AkunKeluar` memakai `response_model_exclude_none=True`.

- [ ] **Step 1: Tulis uji yang gagal** di `tests/test_masuk.py`. Fungsi bantu `masuk(klien, email, sandi)` mengirim `POST /api/auth/masuk`.

```python
def test_masuk_berhasil_mengirim_token_dan_akun(klien, buat_akun):
    a = buat_akun()
    r = masuk(klien, "wahyu.contoh@bbt.go.id", "sandi-contoh-1")
    assert r.status_code == 200
    assert r.json()["akun"] == {"id": str(a.id), "nama": "Wahyu Contoh", "email": "wahyu.contoh@bbt.go.id",
                                "jabatan": "Tim Contoh", "peran": "pengguna", "aktif": True}

def test_email_huruf_besar_dan_spasi_tetap_cocok(klien, buat_akun):        # Review Focus 1
    buat_akun(); assert masuk(klien, "  Wahyu.Contoh@BBT.go.id ", "sandi-contoh-1").status_code == 200

def test_akun_tidak_ada(klien):
    r = masuk(klien, "tidak.ada@bbt.go.id", "apa-saja")
    assert (r.status_code, r.json()["kode"]) == (401, "AKUN_TIDAK_DITEMUKAN")

def test_akun_nonaktif(klien, buat_akun):
    buat_akun(aktif=False)
    assert masuk(klien, "wahyu.contoh@bbt.go.id", "sandi-contoh-1").json()["kode"] == "AKUN_NONAKTIF"

def test_sandi_salah_memberi_sisa_percobaan(klien, buat_akun):
    buat_akun(); r = masuk(klien, "wahyu.contoh@bbt.go.id", "salah")
    assert r.status_code == 401 and r.json()["kode"] == "SANDI_SALAH" and r.json()["sisaPercobaan"] == 4

def test_gagal_kelima_423_terkunci_dan_sandi_benar_pun_ditolak(klien, buat_akun):
    buat_akun()
    for _ in range(4): masuk(klien, "wahyu.contoh@bbt.go.id", "salah")
    r = masuk(klien, "wahyu.contoh@bbt.go.id", "salah")
    assert r.status_code == 423 and r.json()["kode"] == "TERKUNCI" and r.json()["sisaDetik"] == 300
    assert masuk(klien, "wahyu.contoh@bbt.go.id", "sandi-contoh-1").status_code == 423

def test_saya_memulihkan_sesi(klien, buat_akun):
    buat_akun(); token = masuk(klien, "wahyu.contoh@bbt.go.id", "sandi-contoh-1").json()["token"]
    r = klien.get("/api/auth/saya", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200 and r.json()["nama"] == "Wahyu Contoh"

def test_akun_nonaktif_setelah_masuk_ditolak(klien, db, buat_akun): ...   # set aktif=False -> 401 PERLU_MASUK
def test_nonaktif_tampil_lengkap_dengan_zona(...): ...  # ke_akun: waktu berakhiran "+07:00", oleh = nama admin

@pytest.mark.parametrize("token", ["", "bukan.jwt", token_dengan(sub="abc"), token_dengan(tanpa_sv=True),
                                    token_akun_yang_dihapus])                 # Review Focus 2
def test_token_rusak_401(klien, token): ...  # 401, kode PERLU_MASUK
```

  `token_dengan(...)` adalah fungsi bantu yang memanggil `jwt.encode` dengan `pengaturan.jwt_secret`.
- [ ] **Step 2:** Jalankan `.venv/bin/pytest tests/test_masuk.py -v`. Hasil yang diharapkan: FAIL dengan 404 `TIDAK_DITEMUKAN`.
- [ ] **Step 3:** Implementasi `POST /masuk` dengan urutan cek yang sama seperti `masuk()` di `PenyediaData.tsx`:
  1. Cari akun lewat email yang sudah di-trim dan dikecilkan. Kalau akun ada dan sedang terkunci, jawab 423.
  2. Akun tidak ada: 401 `AKUN_TIDAK_DITEMUKAN`.
  3. Akun nonaktif: 401 `AKUN_NONAKTIF`.
  4. Sandi salah: jalankan `catat_gagal`. Kalau hasilnya `None`, jawab 423 dengan `sisaDetik=lama_kunci_detik`. Selain itu jawab 401 `SANDI_SALAH` dengan `sisaPercobaan`.
  5. Sandi benar: jalankan `catat_berhasil`, isi `terakhir_masuk`, lalu jawab 200.

  Isi `detail` pakai kalimat Indonesia, misalnya "Kata sandi salah. Sisa 4 percobaan." `deps.akun_masuk` menjawab semua kegagalan dengan `GalatApi(401, "PERLU_MASUK", ...)`, dengan pesan berbeda-beda seperti di Sismon. `GET /saya` mengembalikan `ke_akun(akun)`.
- [ ] **Step 4:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: semua lulus.
- [ ] **Step 5:** Commit dengan pesan `backend: endpoint masuk dan saya dengan batas percobaan`.

---

### Task 6: Ubah profil, ganti sandi, dan riwayat

**Files:**
- Create: `backend/app/riwayat.py`, `backend/tests/test_profil_sandi.py`
- Modify: `backend/app/routers/auth.py`, `backend/app/schemas.py`

**Interfaces:**
- Consumes: `akun_masuk`, `ke_akun`, `acak_sandi`, `buat_token`, `sandi_terlalu_panjang`.
- Produces:
  - `riwayat.catat_riwayat(db, oleh: Akun, aksi: str, rincian: str, kontrak_id: int | None = None) -> None`. Fungsi ini hanya menambah baris dan tidak meng-commit.
  - Skema `IsianProfil {nama?: str, jabatan?: str}` dan `IsianGantiSandi {sandiLama: str, sandiBaru: str}`.

- [ ] **Step 1: Tulis uji yang gagal**:

```python
def test_ubah_profil_trim_dan_catat_riwayat(klien_masuk, db):
    r = klien_masuk.patch("/api/auth/saya", json={"nama": "  Wahyu Contoh Baru ", "jabatan": "Tim Contoh"})
    assert r.status_code == 200 and r.json()["nama"] == "Wahyu Contoh Baru"
    baris = db.scalars(select(Riwayat)).one()
    assert (baris.aksi, baris.oleh_nama) == ("akun", "Wahyu Contoh")
    assert baris.rincian == 'Mengubah profil sendiri: nama "Wahyu Contoh" menjadi "Wahyu Contoh Baru"'

def test_profil_tanpa_perubahan_tidak_mencatat_riwayat(klien_masuk, db): ...
def test_nama_kosong_422_kolom_nama(klien_masuk): ...          # {"nama": "   "} -> kolom has "nama"

def test_ganti_sandi_memberi_token_baru_dan_membatalkan_token_lama(klien, buat_akun):
    ...  # lama -> GET /saya 401 PERLU_MASUK; baru -> 200; riwayat "Mengganti kata sandi akun Wahyu Contoh"

def test_sandi_lama_salah_422_kolom_sandiLama(klien_masuk): ...
def test_sandi_baru_kurang_dari_8_422(klien_masuk): ...
def test_sandi_baru_lebih_dari_72_byte_422(klien_masuk):        # Review Focus 4
    r = klien_masuk.post("/api/auth/ganti-sandi", json={"sandiLama": "sandi-contoh-1", "sandiBaru": "😀" * 19})
    assert r.status_code == 422 and "sandiBaru" in r.json()["kolom"]
```

  Fixture `klien_masuk` adalah `klien` yang header `Authorization`-nya sudah diisi token Wahyu Contoh.
- [ ] **Step 2:** Jalankan `.venv/bin/pytest tests/test_profil_sandi.py -v`. Hasil yang diharapkan: FAIL dengan 405 atau 404.
- [ ] **Step 3:** Implementasi `PATCH /saya`, `POST /ganti-sandi`, dan `catat_riwayat`.
  - `nama` di-trim dan tidak boleh kosong.
  - Kalimat riwayat disalin dari `ubahProfil` dan `gantiSandi` di `PenyediaData.tsx`.
  - Galat isian dilempar sebagai `GalatApi(422, "ISIAN_TIDAK_SAH", ..., kolom={...})`.
- [ ] **Step 4:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: semua lulus.
- [ ] **Step 5:** Commit dengan pesan `backend: ubah profil, ganti sandi, dan riwayat akun`.

---

### Task 7: Seed akun dan cara menjalankan

**Files:**
- Create: `backend/seed.py`, `backend/README.md`, `backend/tests/test_seed.py`

**Interfaces:**
- Consumes: `Akun`, `acak_sandi`.
- Produces: `seed.isi_akun(db, admin_email: str, admin_nama: str, admin_sandi: str, contoh: bool) -> list[str]`, yang mengembalikan email akun yang baru dibuat. Dari baris perintah: `python seed.py --admin-email ... --admin-nama ... [--contoh]`. Sandi admin ditanyakan lewat `getpass`, tidak lewat argumen.

- [ ] **Step 1: Tulis uji yang gagal**:
  - `isi_akun(..., contoh=True)` membuat 1 admin ditambah akun dari `src/data/akunContoh.ts`. Semua nama akun contoh memuat "Contoh", dan sandi contoh tidak disimpan sebagai teks asli.
  - Menjalankan `isi_akun` dua kali tidak membuat akun ganda. Pemanggilan kedua mengembalikan `[]`.
  - Sandi admin yang kurang dari 8 karakter ditolak dengan `ValueError`.
- [ ] **Step 2:** Jalankan `.venv/bin/pytest tests/test_seed.py -v`. Hasil yang diharapkan: FAIL.
- [ ] **Step 3:** Tulis `seed.py` dan `README.md`. README berisi langkah singkat: membuat venv, menyalin `.env.contoh` ke `.env`, `alembic upgrade head`, `python seed.py`, `uvicorn app.main:app --reload --port 8000`, dan `pytest`.
- [ ] **Step 4:** Jalankan `.venv/bin/pytest -v`. Hasil yang diharapkan: semua lulus. Setelah itu uji manual: `alembic upgrade head` ke branch `main`, jalankan `python seed.py --contoh`, nyalakan uvicorn, lalu jalankan `curl -s localhost:8000/api/cek` dan `POST /api/auth/masuk` dengan akun contoh. Hasil yang diharapkan: token keluar.
- [ ] **Step 5:** Commit dengan pesan `backend: seed akun admin dan akun contoh fiktif`.
