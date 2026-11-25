import os

# Nilai uji, dipasang sebelum app diimpor supaya validator JWT_SECRET tidak menolak.
os.environ.setdefault("JWT_SECRET", "uji-" + "x" * 40)

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def klien():
    from app.main import app

    return TestClient(app)
