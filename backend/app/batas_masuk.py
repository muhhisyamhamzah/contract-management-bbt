"""
Batas percobaan masuk (sama dengan masuk() di src/components/PenyediaData.tsx):
5 kali salah sandi berturut-turut -> akun dikunci LAMA_KUNCI_DETIK. Setelah kunci habis, ada 5 percobaan lagi.
Hitungan dimulai ulang setelah masuk berhasil.
"""
from datetime import datetime, timedelta
from math import ceil

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import pengaturan
from app.models import Akun, PercobaanMasuk

MAKS_PERCOBAAN_MASUK = 5


def _gagal_berturut(db: Session, akun: Akun) -> list[datetime]:
    """Waktu kegagalan sejak masuk berhasil terakhir, terlama dulu."""
    terakhir_berhasil = db.scalar(
        select(func.max(PercobaanMasuk.waktu)).where(PercobaanMasuk.akun_id == akun.id, PercobaanMasuk.berhasil)
    )
    q = select(PercobaanMasuk.waktu).where(PercobaanMasuk.akun_id == akun.id, ~PercobaanMasuk.berhasil)
    if terakhir_berhasil is not None:
        q = q.where(PercobaanMasuk.waktu > terakhir_berhasil)
    return list(db.scalars(q.order_by(PercobaanMasuk.waktu)))


def _sisa_detik(gagal: list[datetime], sekarang: datetime) -> int:
    n = len(gagal)
    if n == 0 or n % MAKS_PERCOBAAN_MASUK != 0:
        return 0
    sisa = (gagal[-1] + timedelta(seconds=pengaturan.lama_kunci_detik) - sekarang).total_seconds()
    return ceil(sisa) if sisa > 0 else 0


def sisa_detik_kunci(db: Session, akun: Akun, sekarang: datetime) -> int:
    """Sisa detik akun terkunci; 0 berarti boleh mencoba masuk."""
    return _sisa_detik(_gagal_berturut(db, akun), sekarang)


def catat_gagal(db: Session, akun: Akun, sekarang: datetime) -> int | None:
    """Mencatat satu kegagalan. Mengembalikan sisa percobaan, atau None bila percobaan ini membuat akun terkunci."""
    db.add(PercobaanMasuk(akun_id=akun.id, waktu=sekarang, berhasil=False))
    db.commit()
    n = len(_gagal_berturut(db, akun))
    if n % MAKS_PERCOBAAN_MASUK == 0:
        return None
    return MAKS_PERCOBAAN_MASUK - n % MAKS_PERCOBAAN_MASUK


def catat_berhasil(db: Session, akun: Akun, sekarang: datetime) -> None:
    """Mencatat masuk berhasil (hitungan gagal mulai dari nol lagi). Tidak meng-commit."""
    db.add(PercobaanMasuk(akun_id=akun.id, waktu=sekarang, berhasil=True))
