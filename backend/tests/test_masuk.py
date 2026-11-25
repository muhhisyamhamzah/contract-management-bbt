from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.config import ZONA, pengaturan

EMAIL = "wahyu.contoh@bbt.go.id"
SANDI = "sandi-contoh-1"


def masuk(klien, email, sandi):
    return klien.post("/api/auth/masuk", json={"email": email, "sandi": sandi})


def saya(klien, token):
    return klien.get("/api/auth/saya", headers={"Authorization": f"Bearer {token}"})


def token_dengan(sub="1", sv="x", tanpa_sv=False):
    isi = {"sub": sub, "exp": datetime.now(timezone.utc) + timedelta(minutes=5)}
    if not tanpa_sv:
        isi["sv"] = sv
    return jwt.encode(isi, pengaturan.jwt_secret, algorithm="HS256")


def test_masuk_berhasil_mengirim_token_dan_akun(klien, buat_akun):
    a = buat_akun()
    r = masuk(klien, EMAIL, SANDI)
    assert r.status_code == 200
    assert r.json()["token"]
    assert r.json()["akun"] == {
        "id": str(a.id),
        "nama": "Wahyu Contoh",
        "email": EMAIL,
        "jabatan": "Tim Contoh",
        "peran": "pengguna",
        "aktif": True,
    }


def test_masuk_mengirim_email_notifikasi_bila_ada(klien, buat_akun):
    buat_akun(email_notifikasi="wahyu.contoh@gmail.com")
    assert masuk(klien, EMAIL, SANDI).json()["akun"]["emailNotifikasi"] == "wahyu.contoh@gmail.com"


def test_email_huruf_besar_dan_spasi_tetap_cocok(klien, buat_akun):  # Review Focus 1
    buat_akun()
    assert masuk(klien, "  Wahyu.Contoh@BBT.go.id ", SANDI).status_code == 200


def test_akun_tidak_ada(klien, db):
    r = masuk(klien, "tidak.ada@bbt.go.id", "apa-saja")
    assert (r.status_code, r.json()["kode"]) == (401, "AKUN_TIDAK_DITEMUKAN")


def test_akun_nonaktif(klien, buat_akun):
    buat_akun(aktif=False)
    r = masuk(klien, EMAIL, SANDI)
    assert (r.status_code, r.json()["kode"]) == (401, "AKUN_NONAKTIF")


def test_sandi_salah_memberi_sisa_percobaan(klien, buat_akun):
    buat_akun()
    r = masuk(klien, EMAIL, "salah")
    assert r.status_code == 401 and r.json()["kode"] == "SANDI_SALAH" and r.json()["sisaPercobaan"] == 4
    assert "4" in r.json()["detail"]


def test_gagal_kelima_423_terkunci_dan_sandi_benar_pun_ditolak(klien, buat_akun):
    buat_akun()
    for _ in range(4):
        masuk(klien, EMAIL, "salah")
    r = masuk(klien, EMAIL, "salah")
    assert r.status_code == 423 and r.json()["kode"] == "TERKUNCI" and r.json()["sisaDetik"] == 300
    r = masuk(klien, EMAIL, SANDI)
    assert r.status_code == 423 and 0 < r.json()["sisaDetik"] <= 300


def test_masuk_berhasil_mencatat_terakhir_masuk(klien, db, buat_akun):
    a = buat_akun()
    masuk(klien, EMAIL, SANDI)
    db.refresh(a)
    assert a.terakhir_masuk is not None


def test_isian_kosong_422(klien, db):
    r = klien.post("/api/auth/masuk", json={"email": EMAIL})
    assert r.status_code == 422 and "sandi" in r.json()["kolom"]


def test_saya_memulihkan_sesi(klien, buat_akun):
    buat_akun()
    token = masuk(klien, EMAIL, SANDI).json()["token"]
    r = saya(klien, token)
    assert r.status_code == 200 and r.json()["nama"] == "Wahyu Contoh" and "token" not in r.json()


def test_saya_tanpa_token_401(klien, db):
    r = klien.get("/api/auth/saya")
    assert (r.status_code, r.json()["kode"]) == (401, "PERLU_MASUK")


def test_akun_nonaktif_setelah_masuk_ditolak(klien, db, buat_akun):
    a = buat_akun()
    token = masuk(klien, EMAIL, SANDI).json()["token"]
    a.aktif = False
    db.commit()
    r = saya(klien, token)
    assert (r.status_code, r.json()["kode"]) == (401, "PERLU_MASUK")


def test_nonaktif_tampil_lengkap_dengan_zona(db, buat_akun):
    from app.tampil import ke_akun

    a = buat_akun(
        aktif=False,
        nonaktif_alasan="Cuti panjang",
        nonaktif_keterangan="Contoh keterangan",
        nonaktif_waktu=datetime(2026, 11, 25, 2, 30, tzinfo=timezone.utc),
        nonaktif_oleh="Dewi Contoh",
    )
    keluar = ke_akun(a).model_dump(by_alias=True, exclude_none=True)
    assert keluar["nonaktif"] == {
        "alasan": "Cuti panjang",
        "keterangan": "Contoh keterangan",
        "waktu": "2026-11-25T09:30:00+07:00",
        "oleh": "Dewi Contoh",
    }
    assert "emailNotifikasi" not in keluar


def _token_akun_dihapus(db, buat_akun):
    from app.security import buat_token

    a = buat_akun()
    t = buat_token(a.id, a.password_hash)
    db.delete(a)
    db.commit()
    return t


@pytest.mark.parametrize(
    "buat",
    [
        lambda db, ba: "",
        lambda db, ba: "bukan.jwt",
        lambda db, ba: token_dengan(sub="abc"),
        lambda db, ba: token_dengan(tanpa_sv=True),
        lambda db, ba: token_dengan(sub="1", sv="sidik-salah"),
        _token_akun_dihapus,
    ],
    ids=["kosong", "bukan-jwt", "sub-bukan-angka", "tanpa-sv", "sidik-salah", "akun-dihapus"],
)
def test_token_rusak_401(klien, db, buat_akun, buat):  # Review Focus 2
    token = buat(db, buat_akun)
    r = saya(klien, token)
    assert (r.status_code, r.json()["kode"]) == (401, "PERLU_MASUK")


def test_percobaan_bersamaan_tetap_terkunci_setelah_5(buat_akun):  # temuan tinjauan akhir
    """10 sandi salah dikirim bersamaan: hanya 4 boleh dijawab SANDI_SALAH, sisanya TERKUNCI."""
    from concurrent.futures import ThreadPoolExecutor

    from fastapi.testclient import TestClient

    from app.main import app

    buat_akun()

    def coba(_):
        with TestClient(app) as k:
            return masuk(k, EMAIL, "salah").json()["kode"]

    with ThreadPoolExecutor(max_workers=10) as pool:
        kode = list(pool.map(coba, range(10)))
    assert kode.count("SANDI_SALAH") == 4, kode
    assert kode.count("TERKUNCI") == 6, kode
