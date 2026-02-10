# Tinjauan Codebase - Daftar Tugas yang Diusulkan

Dokumen ini merangkum 4 tugas prioritas berdasarkan temuan pada codebase.

## 1) Tugas perbaikan salah ketik
**Judul:** Perbaiki salah ketik pada komentar "fetch photonya" menjadi "fetch fotonya".

- **Temuan:** Ada salah ketik pada komentar berbahasa Indonesia: kata "photonya" tidak konsisten dengan istilah "foto" di bagian lain codebase.
- **Lokasi:**
  - `web-gallery/app/page.tsx`
  - `web-gallery/app/dashboard/page.tsx`
- **Dampak:** Kualitas dokumentasi inline menurun dan dapat membingungkan kontributor baru.
- **Kriteria selesai:** Semua komentar typo diperbaiki dan konsisten dengan istilah bahasa Indonesia yang digunakan tim.

## 2) Tugas perbaikan bug
**Judul:** Sinkronkan payload ekspor agar `clientId` selalu dikirim dari store ke API `/api/export`.

- **Temuan:** API `POST /api/export` mewajibkan `clientId`, tetapi action `exportSelection` di store hanya mengirim `photoIds`.
- **Lokasi:**
  - `web-gallery/store/galleryStore.ts` (body request saat export)
  - `web-gallery/app/api/export/route.ts` (validasi `clientId` wajib)
- **Dampak:** Fitur export gagal dengan respons 400 (`Client ID is required`) meskipun pengguna sudah memilih foto.
- **Kriteria selesai:**
  1. Store mengirim `clientId` valid.
  2. Export berhasil end-to-end untuk payload valid.
  3. Error message jelas jika `clientId` memang tidak tersedia.

## 3) Tugas perbaikan komentar/dokumentasi yang tidak selaras
**Judul:** Perbarui dokumentasi API export agar mencantumkan requirement `clientId`.

- **Temuan:** README mendeskripsikan `POST /api/export` tanpa menyebut bahwa `clientId` wajib, padahal route menolak request tanpa `clientId`.
- **Lokasi:**
  - `web-gallery/README.md` (bagian API Endpoints)
  - `web-gallery/app/api/export/route.ts` (validasi request)
- **Dampak:** Konsumen API akan mengirim payload yang salah dan mengalami error 400.
- **Kriteria selesai:** README menampilkan kontrak request yang benar, termasuk contoh payload minimal (`photoIds`, `clientId`).

## 4) Tugas peningkatan pengujian
**Judul:** Tambahkan pengujian otomatis untuk validasi payload export dan alur `exportSelection` di store.

- **Temuan:** Belum ada test script di `web-gallery/package.json`, sehingga regresi pada kontrak API/store sulit terdeteksi dini.
- **Lokasi:**
  - `web-gallery/package.json` (scripts)
  - `web-gallery/store/galleryStore.ts`
  - `web-gallery/app/api/export/route.ts`
- **Dampak:** Bug integrasi sederhana (seperti `clientId` hilang) lolos ke runtime.
- **Kriteria selesai:**
  1. Ada framework test (mis. Vitest/Jest) dan script `test`.
  2. Minimal 1 unit/integration test untuk kasus gagal tanpa `clientId`.
  3. Minimal 1 test untuk kasus sukses export ketika payload lengkap.
