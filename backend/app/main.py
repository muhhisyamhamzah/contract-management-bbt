"""
Titik masuk backend Contract Management BBT.
Jalankan:  uvicorn app.main:app --reload --port 8000
Dokumentasi API otomatis:  http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import pengaturan
from app.galat import pasang_penangan

app = FastAPI(
    title="API Contract Management BBT",
    version="0.1.0",
    description="Backend pengelolaan kontrak PKS Badan Bank Tanah. Rancangan: docs/RANCANGAN-BACKEND.md.",
)

pasang_penangan(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=pengaturan.daftar_asal,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/cek", tags=["Lain-lain"])
def cek():
    """Untuk memastikan server hidup."""
    return {"status": "ok"}
