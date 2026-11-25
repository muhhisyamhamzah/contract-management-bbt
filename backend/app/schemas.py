"""Bentuk data masuk dan keluar API. Field camelCase, sama dengan src/types/kontrak.ts."""
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class SkemaDasar(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, serialize_by_alias=True)


# --- Masuk ---


class IsianMasuk(SkemaDasar):
    email: str = Field(max_length=254)
    sandi: str = Field(max_length=200)


class CatatanNonaktif(SkemaDasar):
    alasan: str
    keterangan: str
    # ISO 8601 berzona Asia/Jakarta.
    waktu: str
    # Nama admin yang menonaktifkan.
    oleh: str


class AkunKeluar(SkemaDasar):
    """Padanan tipe Akun di frontend, tanpa sandi. Field opsional yang kosong tidak dikirim."""

    id: str
    nama: str
    email: str
    jabatan: str
    peran: Literal["pengguna", "admin"]
    aktif: bool
    nonaktif: CatatanNonaktif | None = None
    email_notifikasi: str | None = None


class HasilMasukOk(SkemaDasar):
    token: str
    akun: AkunKeluar


class TokenBaru(SkemaDasar):
    token: str


# --- Akun sendiri ---


class IsianProfil(SkemaDasar):
    nama: str | None = Field(default=None, max_length=200)
    jabatan: str | None = Field(default=None, max_length=200)


class IsianGantiSandi(SkemaDasar):
    sandi_lama: str = Field(max_length=200)
    # Minimal 8 karakter, sama dengan MIN_PANJANG_SANDI di frontend. Batas 72 byte dicek di router.
    sandi_baru: str = Field(min_length=8, max_length=200)
