import os
import re

from pydantic_settings import BaseSettings, SettingsConfigDict


class _AlamatUji(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = ""
    database_url_uji: str = ""


def _endpoint(url: str) -> str:
    """Nama endpoint Neon dari alamat, tanpa akhiran -pooler (untuk membandingkan branch)."""
    m = re.search(r"@([^/:?]+)", url)
    return m.group(1).split(".")[0].removesuffix("-pooler") if m else ""


_alamat = _AlamatUji()
# Semua uji (dan app yang diimpor uji) memakai branch "uji". Dipasang sebelum app diimpor,
# karena variabel lingkungan menang atas isi .env.
if _alamat.database_url_uji:
    if _endpoint(_alamat.database_url_uji) == _endpoint(_alamat.database_url):
        raise RuntimeError("DATABASE_URL_UJI menunjuk database yang sama dengan DATABASE_URL. Uji menghapus isi tabel!")
    os.environ["DATABASE_URL"] = _alamat.database_url_uji
    os.environ["DATABASE_URL_MIGRASI"] = _alamat.database_url_uji
# Nilai uji, dipasang sebelum app diimpor supaya validator JWT_SECRET tidak menolak.
os.environ.setdefault("JWT_SECRET", "uji-" + "x" * 40)
os.environ["LAMA_KUNCI_DETIK"] = "300"

import pytest
from fastapi.testclient import TestClient

_TABEL = "akun, kontrak, riwayat, percobaan_masuk"
SANDI_CONTOH = "sandi-contoh-1"


@pytest.fixture(scope="session")
def _skema_uji():
    """Membangun ulang tabel di branch uji sekali per sesi lewat migrasi Alembic."""
    if not _alamat.database_url_uji:
        pytest.exit("DATABASE_URL_UJI di backend/.env masih kosong. Isi dengan alamat direct branch Neon 'uji'.", 2)
    from alembic import command
    from alembic.config import Config

    cfg = Config("alembic.ini")
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")


@pytest.fixture
def db(_skema_uji):
    from sqlalchemy import text

    from app.database import SesiLokal

    sesi = SesiLokal()
    sesi.execute(text(f"TRUNCATE {_TABEL} RESTART IDENTITY CASCADE"))
    sesi.commit()
    try:
        yield sesi
    finally:
        sesi.rollback()
        sesi.close()


@pytest.fixture
def buat_akun(db):
    import bcrypt

    from app.models import Akun

    def _buat(sandi: str = SANDI_CONTOH, **ubah) -> Akun:
        isi = dict(nama="Wahyu Contoh", email="wahyu.contoh@bbt.go.id", jabatan="Tim Contoh", peran="pengguna", aktif=True)
        isi.update(ubah)
        akun = Akun(password_hash=bcrypt.hashpw(sandi.encode(), bcrypt.gensalt(4)).decode(), **isi)
        db.add(akun)
        db.commit()
        return akun

    return _buat


@pytest.fixture
def klien():
    from app.main import app

    return TestClient(app)


def _app_uji():
    """App kecil dengan rute yang sengaja menimbulkan galat, untuk menguji penangan galat."""
    from datetime import date

    from fastapi import FastAPI
    from pydantic import BaseModel, ConfigDict
    from pydantic.alias_generators import to_camel

    from app.galat import GalatApi, pasang_penangan

    class IsianUji(BaseModel):
        model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
        tanggal_berakhir: date

    app_uji = FastAPI()
    pasang_penangan(app_uji)

    @app_uji.get("/uji/galat")
    def galat():
        raise GalatApi(409, "NOMOR_PKS_DIPAKAI", "Nomor PKS sudah dipakai.", sisaDetik=3)

    @app_uji.get("/uji/rusak")
    def rusak():
        raise RuntimeError("rahasia internal")

    @app_uji.post("/uji/isian")
    def isian(isi: IsianUji):
        return {"ok": True}

    return app_uji


@pytest.fixture
def klien_uji():
    return TestClient(_app_uji())


@pytest.fixture
def klien_uji_tanpa_raise():
    return TestClient(_app_uji(), raise_server_exceptions=False)
