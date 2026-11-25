def test_galat_api_berbentuk_detail_kode(klien_uji):
    r = klien_uji.get("/uji/galat")
    assert r.status_code == 409
    assert r.json() == {"detail": "Nomor PKS sudah dipakai.", "kode": "NOMOR_PKS_DIPAKAI", "sisaDetik": 3}


def test_isian_salah_422_dengan_kolom_camelcase(klien_uji):
    r = klien_uji.post("/uji/isian", json={"tanggalBerakhir": "bukan-tanggal"})
    assert r.status_code == 422
    assert r.json()["kode"] == "ISIAN_TIDAK_SAH"
    assert set(r.json()["kolom"]) == {"tanggalBerakhir"}
    assert r.json()["detail"]


def test_isian_kosong_menyebut_kolom_wajib(klien_uji):
    r = klien_uji.post("/uji/isian", json={})
    assert r.status_code == 422
    assert set(r.json()["kolom"]) == {"tanggalBerakhir"}


def test_json_rusak_400(klien_uji):  # Review Focus 3
    r = klien_uji.post("/uji/isian", content=b"{tanggal", headers={"content-type": "application/json"})
    assert r.status_code == 400 and r.json()["kode"] == "PERMINTAAN_RUSAK"


def test_alamat_tidak_ada_404(klien):
    r = klien.get("/api/tidak-ada")
    assert r.status_code == 404 and r.json()["kode"] == "TIDAK_DITEMUKAN"


def test_metode_salah_405(klien):
    r = klien.post("/api/cek")
    assert r.status_code == 405 and r.json()["kode"] == "PERMINTAAN_RUSAK"


def test_galat_tak_terduga_500_tanpa_rincian(klien_uji_tanpa_raise):
    r = klien_uji_tanpa_raise.get("/uji/rusak")
    assert r.status_code == 500 and r.json()["kode"] == "GALAT_SERVER"
    assert "rahasia" not in r.text
