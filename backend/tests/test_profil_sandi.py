import pytest
from sqlalchemy import select

from app.models import Riwayat

EMAIL = "wahyu.contoh@bbt.go.id"
SANDI = "sandi-contoh-1"


def _masuk(klien, sandi=SANDI):
    return klien.post("/api/auth/masuk", json={"email": EMAIL, "sandi": sandi}).json()["token"]


@pytest.fixture
def klien_masuk(klien, buat_akun):
    buat_akun()
    klien.headers["Authorization"] = f"Bearer {_masuk(klien)}"
    return klien


def _riwayat(db):
    return list(db.scalars(select(Riwayat).order_by(Riwayat.id)))


def test_ubah_profil_trim_dan_catat_riwayat(klien_masuk, db):
    r = klien_masuk.patch("/api/auth/saya", json={"nama": "  Wahyu Contoh Baru ", "jabatan": "Tim Contoh"})
    assert r.status_code == 200 and r.json()["nama"] == "Wahyu Contoh Baru"
    (baris,) = _riwayat(db)
    assert (baris.aksi, baris.oleh_nama, baris.kontrak_id) == ("akun", "Wahyu Contoh", None)
    assert baris.rincian == 'Mengubah profil sendiri: nama "Wahyu Contoh" menjadi "Wahyu Contoh Baru"'


def test_ubah_nama_dan_jabatan_satu_kalimat(klien_masuk, db):
    klien_masuk.patch("/api/auth/saya", json={"nama": "Wahyu Contoh Baru", "jabatan": "Tim Contoh Lain"})
    (baris,) = _riwayat(db)
    assert baris.rincian == (
        'Mengubah profil sendiri: nama "Wahyu Contoh" menjadi "Wahyu Contoh Baru", '
        'jabatan "Tim Contoh" menjadi "Tim Contoh Lain"'
    )


def test_profil_tanpa_perubahan_tidak_mencatat_riwayat(klien_masuk, db):
    r = klien_masuk.patch("/api/auth/saya", json={"nama": "Wahyu Contoh", "jabatan": " Tim Contoh "})
    assert r.status_code == 200
    assert _riwayat(db) == []


def test_nama_kosong_422_kolom_nama(klien_masuk):
    r = klien_masuk.patch("/api/auth/saya", json={"nama": "   "})
    assert r.status_code == 422 and r.json()["kode"] == "ISIAN_TIDAK_SAH" and "nama" in r.json()["kolom"]


def test_ubah_profil_tanpa_masuk_401(klien, db):
    assert klien.patch("/api/auth/saya", json={"nama": "Contoh"}).status_code == 401


def test_ganti_sandi_memberi_token_baru_dan_membatalkan_token_lama(klien_masuk, db):
    lama = klien_masuk.headers["Authorization"]
    r = klien_masuk.post("/api/auth/ganti-sandi", json={"sandiLama": SANDI, "sandiBaru": "sandi-contoh-baru"})
    assert r.status_code == 200
    baru = r.json()["token"]
    assert klien_masuk.get("/api/auth/saya", headers={"Authorization": lama}).json()["kode"] == "PERLU_MASUK"
    assert klien_masuk.get("/api/auth/saya", headers={"Authorization": f"Bearer {baru}"}).status_code == 200
    (baris,) = _riwayat(db)
    assert (baris.aksi, baris.rincian) == ("akun", "Mengganti kata sandi akun Wahyu Contoh")
    # Sandi baru bisa dipakai masuk, sandi lama tidak.
    assert _masuk(klien_masuk, "sandi-contoh-baru")


def test_sandi_lama_salah_422_kolom_sandiLama(klien_masuk, db):
    r = klien_masuk.post("/api/auth/ganti-sandi", json={"sandiLama": "salah", "sandiBaru": "sandi-contoh-baru"})
    assert r.status_code == 422 and "sandiLama" in r.json()["kolom"]
    assert _riwayat(db) == []


def test_sandi_baru_kurang_dari_8_422(klien_masuk):
    r = klien_masuk.post("/api/auth/ganti-sandi", json={"sandiLama": SANDI, "sandiBaru": "pendek"})
    assert r.status_code == 422 and "sandiBaru" in r.json()["kolom"]


def test_sandi_baru_lebih_dari_72_byte_422(klien_masuk):  # Review Focus 4
    r = klien_masuk.post("/api/auth/ganti-sandi", json={"sandiLama": SANDI, "sandiBaru": "😀" * 19})
    assert r.status_code == 422 and "sandiBaru" in r.json()["kolom"]
