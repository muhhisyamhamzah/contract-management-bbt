"""Pengaturan aplikasi, dibaca dari backend/.env (contohnya di .env.contoh)."""
from functools import lru_cache
from zoneinfo import ZoneInfo

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

JWT_SECRET_BAWAAN = "ganti-dengan-teks-acak-yang-panjang"


class Pengaturan(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Neon: aplikasi memakai alamat pooled (-pooler); migrasi Alembic memakai alamat direct.
    database_url: str = "postgresql+psycopg://localhost/contract_bbt"
    # Kosong = migrasi memakai database_url.
    database_url_migrasi: str = ""
    # Branch Neon "uji", hanya untuk pytest. Jangan arahkan ke branch main.
    database_url_uji: str = ""

    jwt_secret: str = JWT_SECRET_BAWAAN
    jwt_menit: int = 720
    # Lama akun dikunci setelah 5 kali salah sandi. Purwarupa memakai 60 detik.
    lama_kunci_detik: int = 300
    # Alamat frontend yang boleh memanggil API (CORS), dipisah koma.
    asal_frontend: str = "http://localhost:5173"

    @field_validator("jwt_secret")
    @classmethod
    def _rahasia_kuat(cls, nilai: str) -> str:
        # Kunci ini menandatangani token login. Nilai bawaannya tertulis di repo,
        # jadi server menolak menyala sampai diganti (pola Sismon).
        if nilai == JWT_SECRET_BAWAAN or len(nilai) < 32:
            raise ValueError(
                "JWT_SECRET di backend/.env masih bawaan atau kurang dari 32 karakter. Buat nilai acak dengan: "
                'python -c "import secrets; print(secrets.token_hex(32))"'
            )
        return nilai

    @property
    def daftar_asal(self) -> list[str]:
        return [a.strip() for a in self.asal_frontend.split(",") if a.strip()]


@lru_cache
def ambil_pengaturan() -> Pengaturan:
    return Pengaturan()


pengaturan = ambil_pengaturan()

# Semua tanggal dan jam di aplikasi ini memakai WIB.
ZONA = ZoneInfo("Asia/Jakarta")
