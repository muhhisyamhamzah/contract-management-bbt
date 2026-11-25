"""Riwayat perubahan: satu baris untuk setiap perubahan data."""
from sqlalchemy.orm import Session

from app.models import Akun, Riwayat


def catat_riwayat(db: Session, oleh: Akun, aksi: str, rincian: str, kontrak_id: int | None = None) -> None:
    """Menambah satu baris riwayat. Tidak meng-commit: ikut transaksi perubahan yang dicatat."""
    db.add(Riwayat(oleh_id=oleh.id, oleh_nama=oleh.nama, aksi=aksi, rincian=rincian, kontrak_id=kontrak_id))
