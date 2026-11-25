"""Pemeriksaan login yang dipakai banyak endpoint."""
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import ambil_db
from app.galat import GalatApi
from app.models import Akun
from app.security import baca_token, sidik_sandi

_bearer = HTTPBearer(auto_error=False)


def _tolak(detail: str) -> GalatApi:
    return GalatApi(401, "PERLU_MASUK", detail)


def akun_masuk(
    kredensial: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(ambil_db),
) -> Akun:
    if kredensial is None or not kredensial.credentials:
        raise _tolak("Silakan masuk terlebih dahulu.")
    isi = baca_token(kredensial.credentials)
    if not isi:
        raise _tolak("Sesi habis. Silakan masuk lagi.")
    try:
        akun_id = int(isi["sub"])
    except (KeyError, TypeError, ValueError):
        raise _tolak("Sesi tidak sah. Silakan masuk lagi.") from None
    akun = db.get(Akun, akun_id)
    if akun is None or not akun.aktif:
        raise _tolak("Akun tidak aktif. Silakan hubungi admin.")
    # Kata sandi sudah diganti atau di-reset sejak token ini dibuat.
    if isi.get("sv") != sidik_sandi(akun.password_hash):
        raise _tolak("Kata sandi akun ini sudah diganti. Silakan masuk lagi.")
    return akun
