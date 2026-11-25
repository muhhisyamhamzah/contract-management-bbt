from datetime import datetime, timedelta, timezone

import jwt

from app.config import pengaturan
from app.security import (
    MAKS_BYTE_SANDI,
    MIN_PANJANG_SANDI,
    acak_sandi,
    baca_token,
    buat_token,
    cocok_sandi,
    sandi_terlalu_panjang,
    sidik_sandi,
)


def test_konstanta_sama_dengan_frontend():
    assert MIN_PANJANG_SANDI == 8 and MAKS_BYTE_SANDI == 72


def test_sandi_benar_cocok_dan_sandi_lain_tidak():
    h = acak_sandi("sandi-contoh-1")
    assert h != "sandi-contoh-1"
    assert cocok_sandi("sandi-contoh-1", h) is True
    assert cocok_sandi("sandi-contoh-2", h) is False


def test_hash_rusak_tidak_melempar():
    assert cocok_sandi("x", "bukan-hash") is False


def test_sandi_emoji_lebih_72_byte_terdeteksi():
    assert sandi_terlalu_panjang("😀" * 19) is True  # 19 karakter, 76 byte
    assert sandi_terlalu_panjang("a" * 72) is False


def test_token_bolak_balik():
    h = acak_sandi("sandi-contoh-1")
    isi = baca_token(buat_token(7, h))
    assert isi["sub"] == "7" and isi["sv"] == sidik_sandi(h)


def test_sidik_berubah_bila_hash_berubah():
    assert sidik_sandi(acak_sandi("a-sandi-1")) != sidik_sandi(acak_sandi("a-sandi-1"))


def test_token_kedaluwarsa_ditolak():
    lewat = datetime.now(timezone.utc) - timedelta(minutes=1)
    t = jwt.encode({"sub": "7", "sv": "x", "exp": lewat}, pengaturan.jwt_secret, algorithm="HS256")
    assert baca_token(t) is None


def test_token_kunci_lain_ditolak():
    t = jwt.encode({"sub": "7", "sv": "x"}, "kunci-lain-" + "y" * 40, algorithm="HS256")
    assert baca_token(t) is None
