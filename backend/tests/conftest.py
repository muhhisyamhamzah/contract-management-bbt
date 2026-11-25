import os

# Nilai uji, dipasang sebelum app diimpor supaya validator JWT_SECRET tidak menolak.
os.environ.setdefault("JWT_SECRET", "uji-" + "x" * 40)

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def klien():
    from app.main import app

    return TestClient(app)


def _app_uji():
    """App kecil dengan rute yang sengaja menimbulkan galat, untuk menguji penangan galat."""
    from datetime import date

    from fastapi import FastAPI
    from pydantic import BaseModel, ConfigDict
    from pydantic.alias_generators import to_camel

    from app.galat import GalatApi, pasang_penangan

    class IsianUji(BaseModel):
        model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
        tanggal_berakhir: date

    app_uji = FastAPI()
    pasang_penangan(app_uji)

    @app_uji.get("/uji/galat")
    def galat():
        raise GalatApi(409, "NOMOR_PKS_DIPAKAI", "Nomor PKS sudah dipakai.", sisaDetik=3)

    @app_uji.get("/uji/rusak")
    def rusak():
        raise RuntimeError("rahasia internal")

    @app_uji.post("/uji/isian")
    def isian(isi: IsianUji):
        return {"ok": True}

    return app_uji


@pytest.fixture
def klien_uji():
    return TestClient(_app_uji())


@pytest.fixture
def klien_uji_tanpa_raise():
    return TestClient(_app_uji(), raise_server_exceptions=False)
