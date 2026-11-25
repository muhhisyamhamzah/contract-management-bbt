from datetime import date

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError


def simpan_kontrak(db, **ubah):
    from app.models import Kontrak

    isi = dict(
        nama="Jasa Contoh Pemeliharaan",
        penyedia="PT Contoh Sejahtera",
        nomor_pks="001/CONTOH/PKS/2026",
        tanggal_pks=date(2026, 1, 5),
        tanggal_mulai=date(2026, 1, 10),
        tanggal_berakhir=date(2026, 12, 31),
        nilai=150_000_000,
    )
    isi.update(ubah)
    k = Kontrak(**isi)
    db.add(k)
    db.commit()
    return k


def test_email_disimpan_huruf_kecil_dan_unik(db, buat_akun):
    buat_akun(email="wahyu.contoh@bbt.go.id")
    with pytest.raises(IntegrityError):
        buat_akun(email="WAHYU.CONTOH@bbt.go.id")


def test_email_sama_ditolak(db, buat_akun):
    buat_akun()
    with pytest.raises(IntegrityError):
        buat_akun(nama="Dewi Contoh")


def test_peran_hanya_pengguna_atau_admin(db, buat_akun):
    with pytest.raises(IntegrityError):
        buat_akun(peran="superadmin")


def test_kontrak_tanggal_mulai_setelah_berakhir_ditolak(db):
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, tanggal_mulai=date(2026, 12, 2), tanggal_berakhir=date(2026, 12, 1))


def test_kontrak_nilai_di_luar_batas_ditolak(db):
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, nilai=1_000_000_000_000_000)
    db.rollback()
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, nilai=-1)


def test_kontrak_nilai_batas_atas_diterima(db):
    assert simpan_kontrak(db, nilai=999_999_999_999_999).nilai == 999_999_999_999_999


def test_nomor_pks_unik(db):
    simpan_kontrak(db, nomor_pks="001/CONTOH/PKS/2026")
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, nomor_pks="001/CONTOH/PKS/2026", nama="Kontrak Contoh Lain")


def test_perpanjangan_hanya_pilihan_yang_sah(db):
    with pytest.raises(IntegrityError):
        simpan_kontrak(db, perpanjangan="mungkin")


def test_kontrak_baru_revisi_1_dan_perpanjangan_belum(db):
    k = simpan_kontrak(db)
    db.refresh(k)
    assert k.revisi == 1 and k.perpanjangan == "belum" and k.ditandai_selesai is False
    assert k.ketentuan_pengakhiran == "" and k.keterangan_selesai == ""


def test_hapus_kontrak_mengosongkan_kontrak_id_riwayat(db, buat_akun):
    from app.models import Riwayat

    a = buat_akun()
    k = simpan_kontrak(db)
    db.add(Riwayat(oleh_id=a.id, oleh_nama=a.nama, aksi="tambah", rincian="Menambah kontrak Contoh", kontrak_id=k.id))
    db.commit()
    db.delete(k)
    db.commit()
    baris = db.scalars(select(Riwayat)).one()
    assert baris.kontrak_id is None and baris.rincian == "Menambah kontrak Contoh"


def test_hapus_akun_mengosongkan_oleh_id_tapi_nama_tetap(db, buat_akun):
    from app.models import Riwayat

    a = buat_akun()
    db.add(Riwayat(oleh_id=a.id, oleh_nama=a.nama, aksi="akun", rincian="Contoh"))
    db.commit()
    db.delete(a)
    db.commit()
    baris = db.scalars(select(Riwayat)).one()
    assert baris.oleh_id is None and baris.oleh_nama == "Wahyu Contoh"


def test_aksi_riwayat_hanya_pilihan_yang_sah(db):
    from app.models import Riwayat

    db.add(Riwayat(oleh_nama="Contoh", aksi="lain", rincian="x"))
    with pytest.raises(IntegrityError):
        db.commit()


def test_model_sama_dengan_migrasi(db):
    from alembic.autogenerate import compare_metadata
    from alembic.migration import MigrationContext

    from app.database import Base

    with db.get_bind().connect() as conn:
        beda = compare_metadata(MigrationContext.configure(conn), Base.metadata)
    assert beda == []


def test_perintah_alembic_bisa_dijalankan_dari_folder_backend(_skema_uji):
    """Langkah README `alembic upgrade head` harus bisa menemukan paket app tanpa bantuan pytest."""
    import os
    import subprocess
    import sys
    from pathlib import Path

    alembic = Path(sys.executable).with_name("alembic")
    env = {k: v for k, v in os.environ.items() if k != "PYTHONPATH"}
    hasil = subprocess.run([str(alembic), "current"], capture_output=True, text=True, env=env, cwd=Path(__file__).parents[1])
    assert hasil.returncode == 0, hasil.stderr[-500:]
    assert "0001" in hasil.stdout
