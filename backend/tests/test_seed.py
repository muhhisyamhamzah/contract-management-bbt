import pytest
from sqlalchemy import select

from app.models import Akun
from app.security import cocok_sandi

ADMIN = dict(admin_email=" Admin.Kantor@BBT.go.id ", admin_nama="Admin Kantor Contoh", admin_sandi="sandi-admin-1")


def test_isi_admin_saja(db):
    from seed import isi_akun

    dibuat = isi_akun(db, contoh=False, **ADMIN)
    assert dibuat == ["admin.kantor@bbt.go.id"]
    a = db.scalars(select(Akun)).one()
    assert (a.peran, a.aktif, a.nama) == ("admin", True, "Admin Kantor Contoh")
    assert a.password_hash != "sandi-admin-1" and cocok_sandi("sandi-admin-1", a.password_hash)


def test_isi_dengan_contoh_fiktif(db):
    from seed import SANDI_CONTOH, isi_akun

    dibuat = isi_akun(db, contoh=True, **ADMIN)
    assert len(dibuat) == 6
    contoh = [a for a in db.scalars(select(Akun)) if a.email != "admin.kantor@bbt.go.id"]
    assert len(contoh) == 5
    assert all("Contoh" in a.nama for a in contoh)
    assert all(a.password_hash != SANDI_CONTOH and cocok_sandi(SANDI_CONTOH, a.password_hash) for a in contoh)
    sari = next(a for a in contoh if a.nama == "Sari Contoh")
    assert sari.aktif is False and sari.nonaktif_alasan == "Pindah divisi atau unit" and sari.nonaktif_waktu
    assert next(a for a in contoh if a.nama == "Admin Contoh").peran == "admin"


def test_dijalankan_dua_kali_tidak_ganda(db):
    from seed import isi_akun

    isi_akun(db, contoh=True, **ADMIN)
    assert isi_akun(db, contoh=True, **ADMIN) == []
    assert len(list(db.scalars(select(Akun)))) == 6


def test_sandi_admin_pendek_ditolak(db):
    from seed import isi_akun

    with pytest.raises(ValueError):
        isi_akun(db, contoh=False, admin_email="a@bbt.go.id", admin_nama="A", admin_sandi="pendek")
    assert list(db.scalars(select(Akun))) == []
