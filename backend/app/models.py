"""Tabel database (docs/RANCANGAN-BACKEND.md bagian 3). Kolom snake_case; schemas.py mengubahnya ke camelCase."""
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    false,
    text,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

SEKARANG = text("now()")
KOSONG = text("''")

PERAN = ("pengguna", "admin")
PERPANJANGAN = ("belum", "proses", "diperpanjang", "tidak")
AKSI_RIWAYAT = ("tambah", "ubah", "hapus", "selesai", "unggah", "akun")
# Batas nilai kontrak: 15 digit (Rp 999 triliun), masih aman sebagai angka di JavaScript.
NILAI_MAKS = 999_999_999_999_999


def _pilihan(kolom: str, pilihan: tuple[str, ...]) -> str:
    return f"{kolom} IN ({', '.join(repr(p) for p in pilihan)})"


class Akun(Base):
    __tablename__ = "akun"
    __table_args__ = (
        UniqueConstraint("email", name="uq_akun_email"),
        # Email disimpan huruf kecil, supaya unik tidak bisa diakali dengan huruf besar.
        CheckConstraint("email = lower(email)", name="ck_akun_email_kecil"),
        CheckConstraint(_pilihan("peran", PERAN), name="ck_akun_peran"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama: Mapped[str] = mapped_column(String(200))
    jabatan: Mapped[str] = mapped_column(String(200), server_default=KOSONG)
    email: Mapped[str] = mapped_column(String(254))
    # Kosong = pengingat dikirim ke email kantor.
    email_notifikasi: Mapped[str | None] = mapped_column(String(254))
    peran: Mapped[str] = mapped_column(String(20), server_default=text("'pengguna'"))
    aktif: Mapped[bool] = mapped_column(Boolean, server_default=true())
    # bcrypt. Tidak pernah dikirim ke frontend.
    password_hash: Mapped[str] = mapped_column(String(100))
    nonaktif_alasan: Mapped[str | None] = mapped_column(String(200))
    nonaktif_keterangan: Mapped[str | None] = mapped_column(Text)
    nonaktif_waktu: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Nama admin (teks), supaya tetap terbaca walau akun admin itu dihapus.
    nonaktif_oleh: Mapped[str | None] = mapped_column(String(200))
    terakhir_masuk: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=SEKARANG)


class Kontrak(Base):
    __tablename__ = "kontrak"
    __table_args__ = (
        UniqueConstraint("nomor_pks", name="uq_kontrak_nomor_pks"),
        CheckConstraint("tanggal_mulai <= tanggal_berakhir", name="ck_kontrak_tanggal"),
        CheckConstraint(f"nilai BETWEEN 0 AND {NILAI_MAKS}", name="ck_kontrak_nilai"),
        CheckConstraint(_pilihan("perpanjangan", PERPANJANGAN), name="ck_kontrak_perpanjangan"),
        Index("ix_kontrak_tanggal_berakhir", "tanggal_berakhir"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama: Mapped[str] = mapped_column(String(300))
    penyedia: Mapped[str] = mapped_column(String(300))
    nomor_pks: Mapped[str] = mapped_column(String(100))
    tanggal_pks: Mapped[date] = mapped_column(Date)
    tanggal_mulai: Mapped[date] = mapped_column(Date)
    tanggal_berakhir: Mapped[date] = mapped_column(Date)
    nilai: Mapped[int] = mapped_column(BigInteger)
    # Empat kolom ketentuan dikirim sebagai objek `ketentuan` di API.
    ketentuan_pengakhiran: Mapped[str] = mapped_column(Text, server_default=KOSONG)
    ketentuan_denda: Mapped[str] = mapped_column(Text, server_default=KOSONG)
    ketentuan_jaminan: Mapped[str] = mapped_column(Text, server_default=KOSONG)
    ketentuan_keterangan: Mapped[str] = mapped_column(Text, server_default=KOSONG)
    perpanjangan: Mapped[str] = mapped_column(String(20), server_default=text("'belum'"))
    ditandai_selesai: Mapped[bool] = mapped_column(Boolean, server_default=false())
    keterangan_selesai: Mapped[str] = mapped_column(Text, server_default=KOSONG)
    # Naik setiap kali diubah; dipakai menolak perubahan bersamaan (rancangan bagian 5).
    revisi: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=SEKARANG)
    diubah_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=SEKARANG)


class Riwayat(Base):
    __tablename__ = "riwayat"
    __table_args__ = (
        CheckConstraint(_pilihan("aksi", AKSI_RIWAYAT), name="ck_riwayat_aksi"),
        Index("ix_riwayat_waktu", text("waktu DESC")),
        Index("ix_riwayat_kontrak_id", "kontrak_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=SEKARANG)
    oleh_id: Mapped[int | None] = mapped_column(ForeignKey("akun.id", ondelete="SET NULL"))
    # Nama disimpan sebagai teks karena akun nonaktif boleh dihapus.
    oleh_nama: Mapped[str] = mapped_column(String(200))
    aksi: Mapped[str] = mapped_column(String(20))
    rincian: Mapped[str] = mapped_column(Text)
    kontrak_id: Mapped[int | None] = mapped_column(ForeignKey("kontrak.id", ondelete="SET NULL"))


class PercobaanMasuk(Base):
    __tablename__ = "percobaan_masuk"
    __table_args__ = (Index("ix_percobaan_masuk_akun_waktu", "akun_id", "waktu"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    akun_id: Mapped[int] = mapped_column(ForeignKey("akun.id", ondelete="CASCADE"))
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=SEKARANG)
    berhasil: Mapped[bool] = mapped_column(Boolean)
