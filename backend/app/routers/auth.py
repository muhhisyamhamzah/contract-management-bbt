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
from app.riwayat import catat_riwayat
from app.schemas import AkunKeluar, HasilMasukOk, IsianGantiSandi, IsianMasuk, IsianProfil, TokenBaru
from app.security import acak_sandi, buat_token, cocok_sandi, sandi_terlalu_panjang
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
    # FOR UPDATE: percobaan masuk untuk akun yang sama diproses satu per satu (dilepas saat commit),
    # supaya permintaan bersamaan tidak bisa melewati batas 5 percobaan.
    akun = db.scalar(select(Akun).where(Akun.email == isi.email.strip().lower()).with_for_update())
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


def _isian_salah(kolom: str, pesan: str) -> GalatApi:
    return GalatApi(422, "ISIAN_TIDAK_SAH", pesan, kolom={kolom: pesan})


@router.patch("/saya", response_model=AkunKeluar, response_model_exclude_none=True)
def ubah_profil(isi: IsianProfil, akun: Akun = Depends(akun_masuk), db: Session = Depends(ambil_db)):
    """Pemilik akun hanya boleh mengubah nama dan jabatannya sendiri. Kalimat riwayat sama dengan ubahProfil()."""
    nama = isi.nama.strip() if isi.nama is not None else akun.nama
    jabatan = isi.jabatan.strip() if isi.jabatan is not None else akun.jabatan
    if not nama:
        raise _isian_salah("nama", "Nama tidak boleh kosong.")

    berubah = []
    if nama != akun.nama:
        berubah.append(f'nama "{akun.nama}" menjadi "{nama}"')
    if jabatan != akun.jabatan:
        berubah.append(f'jabatan "{akun.jabatan}" menjadi "{jabatan}"')
    if berubah:
        # Dicatat atas nama lama, sama dengan purwarupa.
        catat_riwayat(db, akun, "akun", f"Mengubah profil sendiri: {', '.join(berubah)}")
        akun.nama, akun.jabatan = nama, jabatan
        db.commit()
    return ke_akun(akun)


@router.post("/ganti-sandi", response_model=TokenBaru)
def ganti_sandi(isi: IsianGantiSandi, akun: Akun = Depends(akun_masuk), db: Session = Depends(ambil_db)):
    if sandi_terlalu_panjang(isi.sandi_baru):
        raise _isian_salah("sandiBaru", "Kata sandi baru terlalu panjang (maksimal 72 byte; huruf khusus atau emoji dihitung lebih).")
    if not cocok_sandi(isi.sandi_lama, akun.password_hash):
        raise _isian_salah("sandiLama", "Kata sandi saat ini salah.")
    akun.password_hash = acak_sandi(isi.sandi_baru)
    catat_riwayat(db, akun, "akun", f"Mengganti kata sandi akun {akun.nama}")
    db.commit()
    # Token lama (termasuk di perangkat lain) tidak berlaku lagi; perangkat ini diberi token baru.
    return TokenBaru(token=buat_token(akun.id, akun.password_hash))
