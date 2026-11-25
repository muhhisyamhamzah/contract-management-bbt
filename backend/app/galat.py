"""
Satu bentuk galat untuk semua endpoint (docs/RANCANGAN-BACKEND.md bagian 2):

    {"detail": "<kalimat untuk pengguna>", "kode": "<KODE_MESIN>", ...tambahan}

`detail` boleh langsung ditampilkan frontend. `kode` dipakai frontend untuk membedakan kasus.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.config import pengaturan
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("galat")


class GalatApi(Exception):
    """Galat yang disengaja. `tambahan` ikut ke badan JSON, misalnya sisaPercobaan=4 atau kolom={...}."""

    def __init__(self, status: int, kode: str, detail: str, **tambahan):
        super().__init__(detail)
        self.status = status
        self.kode = kode
        self.detail = detail
        self.tambahan = tambahan

    def badan(self) -> dict:
        return {"detail": self.detail, "kode": self.kode, **self.tambahan}


# Status HTTP bawaan (dari FastAPI/Starlette) -> (kode, detail).
_KODE_STATUS = {
    400: ("PERMINTAAN_RUSAK", "Permintaan tidak bisa dibaca."),
    401: ("PERLU_MASUK", "Silakan masuk terlebih dahulu."),
    403: ("KHUSUS_ADMIN", "Anda tidak punya akses ke fitur ini."),
    404: ("TIDAK_DITEMUKAN", "Data atau alamat tidak ditemukan."),
    405: ("PERMINTAAN_RUSAK", "Metode permintaan tidak didukung untuk alamat ini."),
    413: ("BERKAS_TERLALU_BESAR", "File terlalu besar."),
}

_PESAN_GALAT_SERVER = "Terjadi galat di server. Coba lagi sebentar lagi."


def _pesan_kolom(e: dict) -> str:
    """Pesan Indonesia untuk satu galat isian Pydantic (pola _pesan() Sismon)."""
    ctx = e.get("ctx") or {}
    match e["type"]:
        case "missing":
            return "Wajib diisi."
        case "string_too_short":
            return f"Minimal {ctx.get('min_length')} karakter."
        case "string_too_long":
            return f"Maksimal {ctx.get('max_length')} karakter."
        case "date_from_datetime_parsing" | "date_parsing" | "date_type":
            return "Tanggal tidak valid. Gunakan format YYYY-MM-DD."
        case "int_parsing" | "int_type" | "float_parsing":
            return "Harus berupa angka."
        case "literal_error" | "enum":
            return "Pilihan tidak valid."
        case "value_error" if "email" in str(e.get("msg", "")).lower():
            return "Format email tidak valid."
        case _:
            return "Isian tidak valid."


def kolom_dari_galat(galat: list[dict]) -> dict[str, str]:
    kolom: dict[str, str] = {}
    for e in galat:
        nama = str(e["loc"][-1]) if e.get("loc") else "isian"
        kolom.setdefault(nama, _pesan_kolom(e))
    return kolom


def _asal_diizinkan(app: FastAPI) -> list[str]:
    """Asal CORS yang dipasang di app (CORSMiddleware); bawaan: pengaturan.daftar_asal."""
    for m in app.user_middleware:
        if getattr(m.cls, "__name__", "") == "CORSMiddleware":
            return list(m.kwargs.get("allow_origins", []))
    return pengaturan.daftar_asal


def pasang_penangan(app: FastAPI) -> None:
    @app.exception_handler(GalatApi)
    async def _galat_api(_: Request, exc: GalatApi):
        return JSONResponse(status_code=exc.status, content=exc.badan())

    @app.exception_handler(RequestValidationError)
    async def _isian(_: Request, exc: RequestValidationError):
        galat = list(exc.errors())
        if any(e["type"] == "json_invalid" for e in galat):
            return JSONResponse(
                status_code=400,
                content={"detail": "Isi permintaan bukan JSON yang sah.", "kode": "PERMINTAAN_RUSAK"},
            )
        kolom = kolom_dari_galat(galat)
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Periksa lagi isian yang ditandai.",
                "kode": "ISIAN_TIDAK_SAH",
                "kolom": kolom,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        kode, detail = _KODE_STATUS.get(exc.status_code, ("GALAT_SERVER", _PESAN_GALAT_SERVER))
        return JSONResponse(status_code=exc.status_code, content={"detail": detail, "kode": kode}, headers=exc.headers)

    @app.exception_handler(Exception)
    async def _tak_terduga(request: Request, exc: Exception):
        log.exception("Galat tak terduga di %s %s", request.method, request.url.path)
        # Penangan Exception berjalan di luar CORSMiddleware, jadi header CORS dipasang di sini.
        # Tanpa ini browser menyembunyikan jawaban 500 dari frontend (terlihat sebagai galat jaringan).
        header = {}
        asal = request.headers.get("origin")
        if asal and asal in _asal_diizinkan(app):
            header = {"Access-Control-Allow-Origin": asal, "Access-Control-Allow-Credentials": "true", "Vary": "Origin"}
        return JSONResponse(
            status_code=500, content={"detail": _PESAN_GALAT_SERVER, "kode": "GALAT_SERVER"}, headers=header
        )
