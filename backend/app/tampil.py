"""Mengubah baris database menjadi bentuk keluar API."""
from app.config import ZONA
from app.models import Akun
from app.schemas import AkunKeluar, CatatanNonaktif


def ke_akun(a: Akun) -> AkunKeluar:
    nonaktif = None
    if a.nonaktif_alasan:
        nonaktif = CatatanNonaktif(
            alasan=a.nonaktif_alasan,
            keterangan=a.nonaktif_keterangan or "",
            waktu=a.nonaktif_waktu.astimezone(ZONA).isoformat() if a.nonaktif_waktu else "",
            oleh=a.nonaktif_oleh or "",
        )
    return AkunKeluar(
        id=str(a.id),
        nama=a.nama,
        email=a.email,
        jabatan=a.jabatan,
        peran=a.peran,
        aktif=a.aktif,
        nonaktif=nonaktif,
        email_notifikasi=a.email_notifikasi or None,
    )
