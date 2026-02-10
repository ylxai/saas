# Photo Selection Desktop Application

Aplikasi desktop untuk memproses file RAW berdasarkan pilihan klien dari sistem galeri web.

## Deskripsi

Aplikasi ini merupakan bagian dari sistem Photo Selection yang memungkinkan fotografer untuk mengotomatiskan proses pemilihan dan pengeditan foto. Setelah klien memilih foto melalui galeri web, aplikasi desktop ini akan:

1. Mengambil daftar file yang dipilih dari database
2. Mencocokkan file-file tersebut dengan file RAW di komputer lokal
3. Menyalin file RAW yang dipilih ke folder "Edited"
4. Memperbarui status di database

## Teknologi yang Digunakan

- **Electron**: Framework untuk aplikasi desktop cross-platform
- **React**: Library untuk antarmuka pengguna
- **TypeScript**: Type safety untuk kode yang lebih aman
- **Zustand**: State management untuk aplikasi
- **Zod**: Validasi runtime untuk data
- **NeonDB**: Database PostgreSQL serverless
- **Cloudflare R2**: Object storage untuk file media

## Instalasi

1. Pastikan Node.js (versi 18 atau lebih baru) dan npm terinstal di sistem Anda
2. Clone repositori ini
3. Jalankan perintah berikut di direktori proyek:

```bash
npm install
```

4. Buat file `.env` berdasarkan contoh `.env.example` dan isi dengan informasi koneksi database dan Cloudflare R2 Anda

## Pengembangan

Untuk menjalankan aplikasi dalam mode pengembangan:

```bash
npm run dev
```

Perintah ini akan:
- Mengkompilasi kode TypeScript
- Menjalankan aplikasi Electron
- Mengaktifkan hot reload untuk perubahan kode

## Pembuatan

Untuk membuat versi produksi aplikasi:

```bash
npm run dist
```

Perintah ini akan membuat executable untuk platform Anda. Untuk platform lain:

- Windows: `npm run dist:win`
- Linux: `npm run dist:linux`
- macOS: `npm run dist:mac`

## Struktur Proyek

```
desktop-app/
├── main/                 # Kode untuk proses utama Electron
│   ├── index.ts          # Entry point utama
│   ├── preload.ts        # Preload script untuk komunikasi aman
│   ├── database.ts       # Konfigurasi dan fungsi database
│   └── fileProcessor.ts  # Fungsi untuk memproses file
├── renderer/             # Kode untuk antarmuka pengguna
│   ├── index.tsx         # Entry point renderer
│   ├── App.tsx           # Komponen utama aplikasi
│   └── styles.css        # File CSS
├── types/                # File definisi tipe TypeScript
├── store/                # Zustand stores untuk state management
├── utils/                # Fungsi utilitas
├── config/               # File konfigurasi
├── assets/               # File statis seperti ikon
├── dist/                 # Output kompilasi
├── node_modules/         # Modul dependensi
├── package.json          # Konfigurasi proyek dan dependensi
├── tsconfig*.json        # Konfigurasi TypeScript
├── webpack*.js           # Konfigurasi webpack
└── .env                  # Variabel lingkungan (tidak disimpan di repo)
```

## Konfigurasi

Aplikasi ini menggunakan file `.env` untuk konfigurasi. Variabel lingkungan yang diperlukan:

- `DATABASE_URL`: Koneksi string untuk database NeonDB
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: Access key ID untuk Cloudflare R2
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Secret access key untuk Cloudflare R2
- `CLOUDFLARE_R2_BUCKET_NAME`: Nama bucket di Cloudflare R2
- `CLOUDFLARE_R2_ACCOUNT_ID`: Account ID untuk Cloudflare R2
- `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL`: Public URL untuk Cloudflare R2

## Fitur Utama

1. **Pemilihan Folder**: Antarmuka untuk memilih folder sumber (berisi file RAW) dan folder target (untuk file yang telah diproses)

2. **Proses Otomatis**: Fungsi untuk mencocokkan dan menyalin file RAW berdasarkan pilihan klien di database

3. **Pelacakan Status**: Sistem untuk melacak status proses dan menampilkan kemajuan

4. **Log Aktivitas**: Pencatatan aktivitas untuk debugging dan pelacakan

## Integrasi dengan Sistem Web

Aplikasi ini dirancang untuk bekerja sama dengan sistem galeri web:
- Mengakses database yang sama untuk mendapatkan informasi pilihan klien
- Menggunakan konfigurasi Cloudflare R2 yang konsisten
- Mengikuti struktur data yang ditetapkan oleh sistem web

## Lisensi

MIT License - Silakan lihat file LICENSE untuk detail lebih lanjut.