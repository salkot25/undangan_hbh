# Undangan Halalbihalal PT PLN (Persero) ULP Salatiga Kota

Aplikasi web undangan interaktif dan RSVP *Halalbihalal* untuk Keluarga Besar PT PLN (Persero) ULP Salatiga Kota. Dibangun menggunakan arsitektur modern berbasis **React + Vite** dengan pendekatan desain **Minimalis** dan **Mobile-First UX**.

![Hero Section](preview.png) *(Catatan: Ganti dengan screenshot aktual jika ada)*

## ✨ Fitur Utama (Features)

Aplikasi ini telah dirancang secara teliti dari sisi *User Experience (UX)* dan *User Interface (UI)* dengan standar *Enterprise Grade*:

### 1. Identitas Korporat PLN (Corporate Identity)
- Skema warna resmi menggunakan **PLN Cyan**, **Deep PLN Blue**, dan **PLN Yellow**.
- Menggunakan **Corporate Navy** untuk *dark mode* pada form RSVP, memberikan nuansa premium dan berkelas.
- Tipografi dan tata bahasa yang baku, sopan, dan profesional (misalnya "Ketentuan Pakaian", "Undangan Resmi").

### 2. Pengalaman Mobile-First (Mobile-First UX)
- **Sticky CTA (FAB)**: Tombol konfirmasi kehadiran yang melayang di bagian bawah layar HP, muncul pintar setelah area *Hero*.
- **Huge Touch Targets**: Semua tombol, *input*, dan *dropdown* dikalibrasi ke ketinggian minimal 56px agar sangat ergonomis untuk jari.
- **Card-Based Mobile List**: Menghindari tabel *scroll horizontal* di HP. Daftar kehadiran secara dinamis berubah menjadi kumpulan "kartu" (dengan *avatar* inisial) di layar kecil.

### 3. Fungsionalitas Cerdas
- **Validasi Form Real-time**: Formulir RSVP (*segmented control*) memvalidasi isian secara instan dengan *error feedback* terarah.
- **Integrasi Google Calendar**: Pengunjung dapat sekali klik tombol **"Tambahkan ke Kalender"** untuk secara instan membuat jadwal Halalbihalal di Google Calendar (lengkap dengan jam dan tempat).
- **Integrasi Peta Dinamis**: Iframe Google Maps difokuskan langsung pada lokasi **Joglo Ki Penjawi**.
- **Hubungi Panitia via WhatsApp**: Formulir mini untuk mengirimkan pertanyaan langsung ke WhatsApp panitia (`0895623408000`) dengan format pesan yang sudah otomatis dirangkai beserta identitas pengirim.

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite (Cepat & Ringan)
- **Styling**: Tailwind CSS v4 (Utility-first CSS)
- **Iconography**: Lucide React
- **Architecture**: Single Page Application (SPA) dengan *Smooth Scroll Navigation*.
- **Manajemen State**: React Hooks (`useState`, `useEffect`, Custom Hooks seperti `useToast` & `useAttendance`).

## 🚀 Instalasi & Menjalankan Lokal (Development)

1. **Kloning Repositori**:
   ```bash
   git clone https://github.com/salkot25/undangan_hbh.git
   cd undangan_hbh
   ```

2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173/`.

## 📦 Build & Deployment

Untuk mempersiapkan aplikasi menuju *production*:

```bash
npm run build
```

Aplikasi ini siap di-deploy langsung ke modern edge-hosting seperti **Cloudflare Pages**, Vercel, atau Netlify cukup dengan mengarahkan publikasi ke direktori `dist/`.

---
*Didesain dan dikembangkan sebagai wujud dukungan terhadap silaturahmi Keluarga Besar PT PLN (Persero) ULP Salatiga Kota.*
