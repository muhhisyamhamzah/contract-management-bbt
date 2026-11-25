import pytest

from tests.conftest import cek_alamat_uji

UJI = "postgresql+psycopg://u:p@ep-uji-123.c-5.ap-southeast-1.aws.neon.tech/neondb"
PROD_POOL = "postgresql+psycopg://u:p@ep-prod-456-pooler.c-5.ap-southeast-1.aws.neon.tech/neondb"
PROD_DIRECT = "postgresql+psycopg://u:p@ep-prod-456.c-5.ap-southeast-1.aws.neon.tech/neondb"


def test_uji_berbeda_dari_semua_alamat_lolos():
    cek_alamat_uji(UJI, PROD_POOL, PROD_DIRECT)


def test_uji_sama_dengan_alamat_aplikasi_ditolak():
    with pytest.raises(RuntimeError):
        cek_alamat_uji(PROD_DIRECT, PROD_POOL, "")


def test_uji_sama_dengan_alamat_migrasi_ditolak():  # temuan tinjauan akhir
    with pytest.raises(RuntimeError):
        cek_alamat_uji(PROD_DIRECT, "postgresql+psycopg://u:p@ep-dev-789-pooler.x/neondb", PROD_DIRECT)
