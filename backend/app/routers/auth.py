"""Masuk, memulihkan sesi, ubah profil, dan ganti kata sandi (rancangan bagian 4, "Masuk dan akun sendiri")."""
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import batas_masuk
from app.config import ZONA
from app.database import ambil_db
from app.deps import akun_masuk
from app.galat import GalatApi
from app.models import Akun
from app.schemas import AkunKeluar, HasilMasukOk, IsianMasuk
from app.security import buat_token, cocok_sandi
from app.tampil import ke_akun

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _sekarang() -> datetime:
    return datetime.now(ZONA)


def _terkunci(sisa_detik: int) -> GalatApi:
    menit = -(-sisa_detik // 60)
    return GalatApi(
        423,
        "TERKUNCI",
        f"Terlalu banyak percobaan masuk. Coba lagi dalam {menit} menit.",
        sisaDetik=sisa_detik,
    )


@router.post("/masuk", response_model=HasilMasukOk, response_model_exclude_none=True)
def masuk(isi: IsianMasuk, db: Session = Depends(ambil_db)):
    # Urutan pemeriksaan sama dengan masuk() di src/components/PenyediaData.tsx.
    akun = db.scalar(select(Akun).where(Akun.email == isi.email.strip().lower()))
    sekarang = _sekarang()
    if akun is not None and (sisa := batas_masuk.sisa_detik_kunci(db, akun, sekarang)):
        raise _terkunci(sisa)
    if akun is None:
        raise GalatApi(401, "AKUN_TIDAK_DITEMUKAN", "Akun dengan email ini tidak ditemukan.")
    if not akun.aktif:
        raise GalatApi(401, "AKUN_NONAKTIF", "Akun ini sudah dinonaktifkan. Silakan hubungi admin.")
    if not cocok_sandi(isi.sandi, akun.password_hash):
        sisa_percobaan = batas_masuk.catat_gagal(db, akun, sekarang)
        if sisa_percobaan is None:
            raise _terkunci(batas_masuk.sisa_detik_kunci(db, akun, sekarang))
        raise GalatApi(
            401,
            "SANDI_SALAH",
            f"Kata sandi salah. Sisa {sisa_percobaan} percobaan sebelum akun dikunci sementara.",
            sisaPercobaan=sisa_percobaan,
        )

    batas_masuk.catat_berhasil(db, akun, sekarang)
    akun.terakhir_masuk = sekarang
    db.commit()
    return HasilMasukOk(token=buat_token(akun.id, akun.password_hash), akun=ke_akun(akun))


@router.get("/saya", response_model=AkunKeluar, response_model_exclude_none=True)
def saya(akun: Akun = Depends(akun_masuk)):
    """Dipanggil frontend saat halaman dimuat ulang, untuk memulihkan sesi dari token."""
    return ke_akun(akun)
