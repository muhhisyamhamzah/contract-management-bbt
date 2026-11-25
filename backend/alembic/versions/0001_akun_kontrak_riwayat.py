"""akun, kontrak, riwayat, percobaan_masuk

Revision ID: 0001
Revises:
Create Date: 2026-11-25
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SEKARANG = sa.text("now()")
KOSONG = sa.text("''")


def upgrade() -> None:
    op.create_table(
        "akun",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nama", sa.String(200), nullable=False),
        sa.Column("jabatan", sa.String(200), nullable=False, server_default=KOSONG),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("email_notifikasi", sa.String(254), nullable=True),
        sa.Column("peran", sa.String(20), nullable=False, server_default=sa.text("'pengguna'")),
        sa.Column("aktif", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("password_hash", sa.String(100), nullable=False),
        sa.Column("nonaktif_alasan", sa.String(200), nullable=True),
        sa.Column("nonaktif_keterangan", sa.Text(), nullable=True),
        sa.Column("nonaktif_waktu", sa.DateTime(timezone=True), nullable=True),
        sa.Column("nonaktif_oleh", sa.String(200), nullable=True),
        sa.Column("terakhir_masuk", sa.DateTime(timezone=True), nullable=True),
        sa.Column("dibuat_pada", sa.DateTime(timezone=True), nullable=False, server_default=SEKARANG),
        sa.UniqueConstraint("email", name="uq_akun_email"),
        sa.CheckConstraint("email = lower(email)", name="ck_akun_email_kecil"),
        sa.CheckConstraint("peran IN ('pengguna', 'admin')", name="ck_akun_peran"),
    )

    op.create_table(
        "kontrak",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nama", sa.String(300), nullable=False),
        sa.Column("penyedia", sa.String(300), nullable=False),
        sa.Column("nomor_pks", sa.String(100), nullable=False),
        sa.Column("tanggal_pks", sa.Date(), nullable=False),
        sa.Column("tanggal_mulai", sa.Date(), nullable=False),
        sa.Column("tanggal_berakhir", sa.Date(), nullable=False),
        sa.Column("nilai", sa.BigInteger(), nullable=False),
        sa.Column("ketentuan_pengakhiran", sa.Text(), nullable=False, server_default=KOSONG),
        sa.Column("ketentuan_denda", sa.Text(), nullable=False, server_default=KOSONG),
        sa.Column("ketentuan_jaminan", sa.Text(), nullable=False, server_default=KOSONG),
        sa.Column("ketentuan_keterangan", sa.Text(), nullable=False, server_default=KOSONG),
        sa.Column("perpanjangan", sa.String(20), nullable=False, server_default=sa.text("'belum'")),
        sa.Column("ditandai_selesai", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("keterangan_selesai", sa.Text(), nullable=False, server_default=KOSONG),
        sa.Column("revisi", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("dibuat_pada", sa.DateTime(timezone=True), nullable=False, server_default=SEKARANG),
        sa.Column("diubah_pada", sa.DateTime(timezone=True), nullable=False, server_default=SEKARANG),
        sa.UniqueConstraint("nomor_pks", name="uq_kontrak_nomor_pks"),
        sa.CheckConstraint("tanggal_mulai <= tanggal_berakhir", name="ck_kontrak_tanggal"),
        sa.CheckConstraint("nilai BETWEEN 0 AND 999999999999999", name="ck_kontrak_nilai"),
        sa.CheckConstraint(
            "perpanjangan IN ('belum', 'proses', 'diperpanjang', 'tidak')", name="ck_kontrak_perpanjangan"
        ),
    )
    op.create_index("ix_kontrak_tanggal_berakhir", "kontrak", ["tanggal_berakhir"])

    op.create_table(
        "riwayat",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("waktu", sa.DateTime(timezone=True), nullable=False, server_default=SEKARANG),
        sa.Column("oleh_id", sa.Integer(), sa.ForeignKey("akun.id", ondelete="SET NULL"), nullable=True),
        sa.Column("oleh_nama", sa.String(200), nullable=False),
        sa.Column("aksi", sa.String(20), nullable=False),
        sa.Column("rincian", sa.Text(), nullable=False),
        sa.Column("kontrak_id", sa.Integer(), sa.ForeignKey("kontrak.id", ondelete="SET NULL"), nullable=True),
        sa.CheckConstraint(
            "aksi IN ('tambah', 'ubah', 'hapus', 'selesai', 'unggah', 'akun')", name="ck_riwayat_aksi"
        ),
    )
    op.create_index("ix_riwayat_waktu", "riwayat", [sa.text("waktu DESC")])
    op.create_index("ix_riwayat_kontrak_id", "riwayat", ["kontrak_id"])

    op.create_table(
        "percobaan_masuk",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("akun_id", sa.Integer(), sa.ForeignKey("akun.id", ondelete="CASCADE"), nullable=False),
        sa.Column("waktu", sa.DateTime(timezone=True), nullable=False, server_default=SEKARANG),
        sa.Column("berhasil", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_percobaan_masuk_akun_waktu", "percobaan_masuk", ["akun_id", "waktu"])


def downgrade() -> None:
    op.drop_table("percobaan_masuk")
    op.drop_table("riwayat")
    op.drop_table("kontrak")
    op.drop_table("akun")
