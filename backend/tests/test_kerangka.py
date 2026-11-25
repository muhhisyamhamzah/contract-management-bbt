import pytest
from pydantic import ValidationError


def test_cek_server_hidup(klien):
    r = klien.get("/api/cek")
    assert r.status_code == 200 and r.json() == {"status": "ok"}


def test_jwt_secret_bawaan_ditolak():
    from app.config import Pengaturan

    with pytest.raises(ValidationError):
        Pengaturan(jwt_secret="ganti-dengan-teks-acak-yang-panjang", _env_file=None)


def test_jwt_secret_pendek_ditolak():
    from app.config import Pengaturan

    with pytest.raises(ValidationError):
        Pengaturan(jwt_secret="a" * 31, _env_file=None)
