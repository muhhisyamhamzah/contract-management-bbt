from datetime import datetime, timedelta

from app.batas_masuk import MAKS_PERCOBAAN_MASUK, catat_berhasil, catat_gagal, sisa_detik_kunci
from app.config import ZONA

t0 = datetime(2026, 11, 25, 9, 0, tzinfo=ZONA)


def detik(n: float) -> datetime:
    return t0 + timedelta(seconds=n)


def test_maks_percobaan_5():
    assert MAKS_PERCOBAAN_MASUK == 5


def test_gagal_pertama_sisa_4(db, buat_akun):
    a = buat_akun()
    assert catat_gagal(db, a, t0) == 4
    assert sisa_detik_kunci(db, a, detik(1)) == 0


def test_gagal_kelima_mengunci_selama_lama_kunci(db, buat_akun):
    a = buat_akun()
    for i in range(4):
        assert catat_gagal(db, a, detik(i)) == 4 - i
    assert catat_gagal(db, a, detik(4)) is None
    assert sisa_detik_kunci(db, a, detik(5)) == 299
    assert sisa_detik_kunci(db, a, detik(4.5)) == 300  # dibulatkan ke atas
    assert sisa_detik_kunci(db, a, detik(4 + 300)) == 0


def test_setelah_kunci_habis_dapat_5_percobaan_lagi(db, buat_akun):  # Review Focus 5
    a = buat_akun()
    for i in range(5):
        catat_gagal(db, a, detik(i))
    assert catat_gagal(db, a, detik(400)) == 4
    assert sisa_detik_kunci(db, a, detik(401)) == 0


def test_berhasil_mereset_hitungan(db, buat_akun):
    a = buat_akun()
    for i in range(3):
        catat_gagal(db, a, detik(i))
    catat_berhasil(db, a, detik(10))
    assert catat_gagal(db, a, detik(11)) == 4


def test_hitungan_per_akun(db, buat_akun):
    a = buat_akun()
    b = buat_akun(nama="Dewi Contoh", email="dewi.contoh@bbt.go.id")
    for i in range(5):
        catat_gagal(db, a, detik(i))
    assert sisa_detik_kunci(db, b, detik(6)) == 0
    assert catat_gagal(db, b, detik(6)) == 4
