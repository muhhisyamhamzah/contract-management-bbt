"""Acak kata sandi (bcrypt) dan token login (JWT). Pola Sismon."""
import hashlib
import hmac
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import pengaturan

ALGORITMA = "HS256"
# Sama dengan MIN_PANJANG_SANDI di src/lib/data.ts.
MIN_PANJANG_SANDI = 8
# bcrypt hanya menerima sampai 72 byte; bcrypt 5 melempar ValueError bila lebih.
MAKS_BYTE_SANDI = 72


def sandi_terlalu_panjang(sandi: str) -> bool:
    return len(sandi.encode("utf-8")) > MAKS_BYTE_SANDI


def acak_sandi(sandi: str) -> str:
    return bcrypt.hashpw(sandi.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def cocok_sandi(sandi: str, hash_: str) -> bool:
    try:
        return bcrypt.checkpw(sandi.encode("utf-8"), hash_.encode("utf-8"))
    except ValueError:
        return False


def sidik_sandi(hash_: str) -> str:
    """
    Sidik pendek dari hash kata sandi, ditaruh di token. Bila kata sandi diganti atau di-reset,
    sidiknya berubah sehingga token lama di semua perangkat otomatis ditolak.
    """
    return hmac.new(pengaturan.jwt_secret.encode("utf-8"), hash_.encode("utf-8"), hashlib.sha256).hexdigest()[:16]


def buat_token(akun_id: int, password_hash: str) -> str:
    # Peran tidak ditaruh di token: dibaca ulang dari database di setiap permintaan.
    kedaluwarsa = datetime.now(timezone.utc) + timedelta(minutes=pengaturan.jwt_menit)
    isi = {"sub": str(akun_id), "sv": sidik_sandi(password_hash), "exp": kedaluwarsa}
    return jwt.encode(isi, pengaturan.jwt_secret, algorithm=ALGORITMA)


def baca_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, pengaturan.jwt_secret, algorithms=[ALGORITMA], options={"require": ["exp", "sub"]})
    except jwt.PyJWTError:
        return None
