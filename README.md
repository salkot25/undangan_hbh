# Undangan Halalbihalal PT PLN (Persero) ULP Salatiga Kota

Aplikasi web undangan interaktif dan RSVP _Halalbihalal_ untuk Keluarga Besar PT PLN (Persero) ULP Salatiga Kota. Dibangun menggunakan arsitektur modern berbasis **React + Vite** dengan pendekatan desain **Minimalis** dan **Mobile-First UX**.

![Hero Section](preview.png) _(Catatan: Ganti dengan screenshot aktual jika ada)_

## ✨ Fitur Utama (Features)

Aplikasi ini telah dirancang secara teliti dari sisi _User Experience (UX)_ dan _User Interface (UI)_ dengan standar _Enterprise Grade_:

### 1. Identitas Korporat PLN (Corporate Identity)

- Skema warna resmi menggunakan **PLN Cyan**, **Deep PLN Blue**, dan **PLN Yellow**.
- Menggunakan **Corporate Navy** untuk _dark mode_ pada form RSVP, memberikan nuansa premium dan berkelas.
- Tipografi dan tata bahasa yang baku, sopan, dan profesional (misalnya "Ketentuan Pakaian", "Undangan Resmi").

### 2. Pengalaman Mobile-First (Mobile-First UX)

- **Sticky CTA (FAB)**: Tombol konfirmasi kehadiran yang melayang di bagian bawah layar HP, muncul pintar setelah area _Hero_.
- **Huge Touch Targets**: Semua tombol, _input_, dan _dropdown_ dikalibrasi ke ketinggian minimal 56px agar sangat ergonomis untuk jari.
- **Card-Based Mobile List**: Menghindari tabel _scroll horizontal_ di HP. Daftar kehadiran secara dinamis berubah menjadi kumpulan "kartu" (dengan _avatar_ inisial) di layar kecil.

### 3. Fungsionalitas Cerdas

- **Validasi Form Real-time**: Formulir RSVP (_segmented control_) memvalidasi isian secara instan dengan _error feedback_ terarah.
- **Integrasi Google Calendar**: Pengunjung dapat sekali klik tombol **"Tambahkan ke Kalender"** untuk secara instan membuat jadwal Halalbihalal di Google Calendar (lengkap dengan jam dan tempat).
- **Auto-Update Real-time**: Daftar hadir akan otomatis diperbarui (_refresh_) setiap kali ada peserta baru yang mengirim konfirmasi RSVP, tanpa perlu memuat ulang halaman secara manual.
- **Integrasi Peta Dinamis**: Iframe Google Maps difokuskan langsung pada lokasi **Joglo Ki Penjawi**.
- **Hubungi Panitia via WhatsApp**: Formulir mini untuk mengirimkan pertanyaan langsung ke WhatsApp panitia (`0895623408000`) dengan format pesan yang sudah otomatis dirangkai beserta identitas pengirim.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite (Cepat & Ringan)
- **Styling**: Tailwind CSS v4 (Utility-first CSS)
- **Iconography**: Lucide React
- **Architecture**: Single Page Application (SPA) dengan _Smooth Scroll Navigation_.
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

3. **Konfigurasi Environment**:

   ```bash
   cp .env.example .env
   ```

   Konfigurasi provider API melalui `VITE_API_PROVIDER`:
   `google-sheets` untuk Google Apps Script atau `internal-rest` untuk backend internal.
   Jika memakai Google Sheets, isi `VITE_GOOGLE_SHEETS_URL`, `VITE_API_ALLOWED_HOSTS`, dan opsional `VITE_API_AUTH_TOKEN` untuk verifikasi token backend.
   Jika memakai backend internal, isi `VITE_INTERNAL_API_BASE_URL` dan `VITE_INTERNAL_API_ALLOWED_HOSTS`.
   Untuk observability sink, gunakan `VITE_OBSERVABILITY_SINK` (`console` atau `window`).

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173/`.

## ✅ Quality Gate (Disarankan sebelum release)

```bash
npm run lint
npm run test:run
npm run build
```

## 🔎 Smoke Check Production

Setelah deploy, jalankan verifikasi cepat ke domain production:

```bash
npm run smoke:prod
```

Opsional override target URL:

```bash
SMOKE_URL="https://undangan.salkot.online/" npm run smoke:prod
```

### Alert WhatsApp Otomatis

Repository ini memiliki dua workflow monitoring:

1. [Smoke Check Production](.github/workflows/smoke-prod.yml): berjalan setelah update branch `gh-pages`, kirim notifikasi jika smoke check gagal.
2. [Health Monitor Production](.github/workflows/health-monitor.yml): berjalan terjadwal tiap 10 menit, kirim notifikasi jika gagal beruntun minimal 3 kali.

Nomor admin target sudah diset ke `081999386550`.

Untuk benar-benar mengirim WhatsApp otomatis, tambahkan secret repository:

- `WHATSAPP_CALLMEBOT_APIKEY`

Jika ingin menjalankan test notifikasi dari lokal, isi juga env berikut pada `.env`:

- `WHATSAPP_CALLMEBOT_APIKEY=<api_key_callmebot_anda>`

Catatan:

- Tanpa secret di atas, workflow tetap berjalan dan akan menampilkan fallback link `wa.me` di log.
- Dengan secret aktif, notifikasi dikirim otomatis via CallMeBot API ke WhatsApp admin.

## 📊 Admin Health Dashboard

Untuk membuka dashboard monitoring internal, tambahkan query berikut pada URL:

`?admin=1`

Contoh:

`https://undangan.salkot.online/?admin=1`

Fitur dashboard:

1. Status runtime (ok/degraded/error) dan failure streak.
2. Ringkasan uptime dari histori check lokal.
3. Histori health check tersimpan (localStorage) hingga 50 item.
4. Tombol check manual dan reset histori.

## 📦 Build & Deployment

Untuk mempersiapkan aplikasi menuju _production_:

```bash
npm run build
```

Aplikasi ini siap di-deploy langsung ke modern edge-hosting seperti **Cloudflare Pages**, Vercel, atau Netlify cukup dengan mengarahkan publikasi ke direktori `dist/`.

### Custom Domain: undangan.salkot.online

Untuk menggunakan subdomain `undangan.salkot.online`, lakukan konfigurasi berikut:

1. Di DNS provider domain `salkot.online`, buat record:
   - Type: `CNAME`
   - Name/Host: `undangan`
   - Target/Value: `salkot25.github.io`
2. Di GitHub repository Settings > Pages, isi Custom domain: `undangan.salkot.online` lalu simpan.
3. Aktifkan opsi `Enforce HTTPS` setelah sertifikat terbit.

File [public/CNAME](public/CNAME) sudah disiapkan agar branch publish menyimpan domain kustom secara konsisten.

### GitHub Pages (Auto Publish)

Repository ini sudah memiliki workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) untuk publish otomatis ke GitHub Pages setiap ada push ke branch `main`.

Langkah aktivasi (sekali saja):

1. Buka GitHub repository settings.
2. Masuk ke menu Pages.
3. Pada Build and deployment, pilih Source: GitHub Actions.

Setelah aktif, URL publish default:

https://salkot25.github.io/undangan_hbh/

Catatan teknis: workflow build menggunakan `VITE_BASE_PATH=/undangan_hbh/` agar asset path sesuai untuk Pages project site.

---

_Didesain dan dikembangkan sebagai wujud dukungan terhadap silaturahmi Keluarga Besar PT PLN (Persero) ULP Salatiga Kota._
