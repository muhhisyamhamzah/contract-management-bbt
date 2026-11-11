// Fungsi bantu untuk perpindahan halaman.

import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Mengembalikan fungsi "kembali" untuk tombol Kembali atau Batal.
 * - Kalau halaman ini dibuka dari halaman lain di aplikasi, kembali ke halaman sebelumnya.
 * - Kalau halaman ini dibuka langsung lewat alamat (riwayat kosong), pindah ke `cadangan`.
 */
export function useKembali(cadangan: string): () => void {
  const navigate = useNavigate()
  const location = useLocation()

  return () => {
    // react-router memberi key "default" pada halaman pertama yang dibuka.
    if (location.key === 'default') {
      navigate(cadangan, { replace: true })
    } else {
      navigate(-1)
    }
  }
}
