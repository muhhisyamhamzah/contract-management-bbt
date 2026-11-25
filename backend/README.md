# Backend Contract Management BBT

FastAPI + SQLAlchemy + Alembic + PostgreSQL (Neon). Rancangan lengkap: `../docs/RANCANGAN-BACKEND.md`.

## Menjalankan pertama kali

```bash
cd backend
/opt/anaconda3/bin/python3.12 -m venv .venv          # Python 3.12, sama dengan Sismon
.venv/bin/pip install -r requirements-dev.txt          # server cukup requirements.txt
cp .env.contoh .env                                    # lalu isi; .env TIDAK PERNAH di-commit
.venv/bin/alembic upgrade head                         # buat/ubah tabel (lewat DATABASE_URL_MIGRASI)
.venv/bin/python seed.py --admin-email admin@kantor.go.id --admin-nama "Nama Admin"
.venv/bin/uvicorn app.main:app --reload --port 8000    # dokumentasi API: http://localhost:8000/docs
```

Tambahkan `--contoh` pada `seed.py` untuk akun contoh fiktif (sandi `contoh123`). Hanya untuk database pengembangan.

## Uji

```bash
.venv/bin/pytest
```

Uji memakai `DATABASE_URL_UJI` (branch Neon `uji`) dan **menghapus isi tabelnya** setiap uji. Uji menolak jalan kalau
alamat itu sama dengan `DATABASE_URL`.

## Pindah ke server perusahaan

Kode tidak berubah. Isi `.env` server dengan alamat PostgreSQL dari tim IT, lalu jalankan `alembic upgrade head` dan
`seed.py` (tanpa `--contoh`).
