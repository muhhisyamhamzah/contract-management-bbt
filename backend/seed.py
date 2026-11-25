"""
Mengisi akun admin pertama, dan (opsional) akun contoh fiktif yang sama dengan src/data/akunContoh.ts.

    python seed.py --admin-email admin@kantor.go.id --admin-nama "Nama Admin"            # sandi ditanyakan
    python seed.py --admin-email admin@kantor.go.id --admin-nama "Nama Admin" --contoh   # + akun contoh

Aman dijalankan berulang: email yang sudah ada dilewati. Akun contoh HANYA untuk database pengembangan.
"""
import argparse
import getpass
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import ZONA
from app.models import Akun
from app.security import MIN_PANJANG_SANDI, acak_sandi, sandi_terlalu_panjang

# Sama dengan SANDI_CONTOH di src/data/akunContoh.ts. Hanya untuk akun contoh fiktif.
SANDI_CONTOH = "contoh123"

AKUN_CONTOH = [
    dict(nama="Wahyu Contoh", email="wahyu.contoh@banktanah.id", email_notifikasi="wahyu.contoh.pribadi@gmail.com",
         jabatan="Kepala Divisi Umum", peran="pengguna"),
    dict(nama="Dewi Contoh", email="dewi.contoh@banktanah.id", email_notifikasi="dewi.contoh.pribadi@gmail.com",
         jabatan="Tim Pengadaan", peran="pengguna"),
    dict(nama="Rizal Contoh", email="rizal.contoh@banktanah.id", jabatan="Tim Pengadaan", peran="pengguna"),
    dict(nama="Sari Contoh", email="sari.contoh@banktanah.id", jabatan="Tim Pengadaan", peran="pengguna",
         aktif=False, nonaktif_alasan="Pindah divisi atau unit",
         nonaktif_keterangan="Pindah ke Divisi Keuangan Contoh", nonaktif_oleh="Admin Contoh"),
    dict(nama="Admin Contoh", email="admin.contoh@banktanah.id", jabatan="Tim IT", peran="admin"),
]


def isi_akun(db: Session, admin_email: str, admin_nama: str, admin_sandi: str, contoh: bool) -> list[str]:
    """Membuat akun yang belum ada. Mengembalikan email akun yang baru dibuat."""
    if len(admin_sandi) < MIN_PANJANG_SANDI or sandi_terlalu_panjang(admin_sandi):
        raise ValueError(f"Sandi admin harus {MIN_PANJANG_SANDI} karakter sampai 72 byte.")

    calon = [dict(nama=admin_nama.strip(), email=admin_email, jabatan="Admin", peran="admin", sandi=admin_sandi)]
    if contoh:
        calon += [dict(a, sandi=SANDI_CONTOH) for a in AKUN_CONTOH]

    ada = set(db.scalars(select(Akun.email)))
    dibuat = []
    sekarang = datetime.now(ZONA)
    for isi in calon:
        isi = dict(isi)
        email = isi.pop("email").strip().lower()
        if email in ada:
            continue
        sandi = isi.pop("sandi")
        if not isi.get("aktif", True):
            isi["nonaktif_waktu"] = sekarang - timedelta(days=3)
        db.add(Akun(email=email, password_hash=acak_sandi(sandi), **isi))
        ada.add(email)
        dibuat.append(email)
    db.commit()
    return dibuat


def main() -> None:
    p = argparse.ArgumentParser(description="Isi akun admin pertama dan akun contoh fiktif.")
    p.add_argument("--admin-email", required=True)
    p.add_argument("--admin-nama", required=True)
    p.add_argument("--contoh", action="store_true", help="tambahkan akun contoh fiktif (hanya untuk pengembangan)")
    a = p.parse_args()

    sandi = getpass.getpass("Sandi admin (tidak tampil saat diketik): ")
    if sandi != getpass.getpass("Ulangi sandi admin: "):
        raise SystemExit("Sandi tidak sama.")

    from app.database import SesiLokal

    with SesiLokal() as db:
        dibuat = isi_akun(db, a.admin_email, a.admin_nama, sandi, a.contoh)
    print(f"{len(dibuat)} akun dibuat: {', '.join(dibuat) or '-'}")
    if a.contoh:
        print(f"Sandi akun contoh: {SANDI_CONTOH}")


if __name__ == "__main__":
    main()
