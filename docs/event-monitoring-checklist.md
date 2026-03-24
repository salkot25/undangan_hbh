# Checklist Pre-Event & Live Monitoring

## Pre-Event (H-1 / H-0)

1. Validasi environment production:
   - `VITE_GOOGLE_SHEETS_URL` benar dan masih aktif.
   - `VITE_API_AUTH_TOKEN` sesuai token backend aktif.
   - `VITE_API_CLIENT_ID` dan `VITE_API_ALLOWED_HOSTS` sesuai konfigurasi backend.
2. Jalankan quality gate lokal:
   - `npm run lint`
   - `npm run test:run`
   - `npm run build`
3. Jalankan smoke production:
   - `npm run smoke:prod`
4. Cek workflow GitHub Actions:
   - Deploy terakhir sukses.
   - Health monitor tidak memiliki failure streak aktif.
5. Verifikasi fallback mode panitia:
   - Admin dashboard `?admin=1` bisa dibuka.
   - Input manual tersimpan.
   - Import CSV minimal 1 baris berhasil.
6. Verifikasi notifikasi admin:
   - Secret `WHATSAPP_CALLMEBOT_APIKEY` tersedia.
   - Uji kirim notifikasi dari workflow manual.
7. Verifikasi backup Google Sheets:
   - Trigger backup harian aktif.
   - Retention policy berjalan (hapus backup lama otomatis).

## Live Event (Monitoring Berkala)

1. Pantau status dashboard admin setiap 15-30 menit:
   - Status runtime.
   - Failure streak.
   - Tren 24 jam.
2. Pantau workflow monitor:
   - Tidak ada failure streak >= 3.
   - Recovery alert terkirim jika sebelumnya ada gangguan.
3. Pantau volume input fallback panitia:
   - Catat jumlah input manual.
   - Catat jumlah baris CSV yang diimpor.
4. Jika gangguan terjadi:
   - Aktifkan protokol di `incident-response-runbook.md`.

## Post-Event

1. Rekonsiliasi data fallback ke sheet utama.
2. Verifikasi duplikat berdasarkan `idempotencyKey`.
3. Arsipkan ringkasan monitoring harian (uptime, avg latency, max failure streak).
4. Catat lessons learned untuk event berikutnya.
