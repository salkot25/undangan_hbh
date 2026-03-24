# Incident Response Runbook (1 Halaman)

Tujuan: menjaga RSVP tetap berjalan saat terjadi gangguan produksi.

## Trigger Insiden

- Endpoint down: website blank/5xx, smoke check gagal.
- GAS quota habis: response Apps Script error quota/time limit, submit sering gagal.
- Notifikasi gagal: workflow error, tetapi WhatsApp admin tidak terkirim.

## 5 Menit Pertama

1. Konfirmasi status live: jalankan `npm run smoke:prod`.
2. Cek run terbaru di workflow `deploy-pages.yml` dan `health-monitor.yml`.
3. Aktifkan fallback panitia: minta input via Admin Dashboard (`?admin=1`) mode manual/CSV.
4. Informasikan panitia: layanan online terganggu, registrasi tetap berjalan lewat fallback.

## Tindakan Per Skenario

### A. Endpoint Down

1. Verifikasi deploy terakhir dan asset path.
2. Cek DNS/CNAME domain `undangan.salkot.online`.
3. Purge CDN cache bila ada indikasi stale bundle.
4. Jika belum pulih, rollback ke commit stabil terakhir.

### B. GAS Quota Habis / Backend Error

1. Cek Apps Script execution log dan quota di dashboard Google.
2. Pastikan token aktif dan tidak direvoke.
3. Pastikan sheet `Data` + `AuditLog` + sheet backup tersedia.
4. Pindahkan input ke fallback mode panitia sampai quota reset.

### C. Notifikasi Gagal

1. Cek secret `WHATSAPP_CALLMEBOT_APIKEY` di repository.
2. Jalankan test manual notifikasi dari workflow `smoke-prod.yml`.
3. Gunakan fallback `wa.me` link dari log workflow jika API notifikasi gagal.

## Komunikasi Internal

- Saat insiden: "Registrasi online sedang gangguan. Panitia tetap menerima RSVP via mode fallback."
- Saat pulih: "Layanan online telah pulih. Data fallback akan direkonsiliasi ke sheet utama."

## Penutupan

1. Catat waktu mulai dan waktu pulih.
2. Catat jumlah data fallback (manual + CSV).
3. Rekonsiliasi data fallback ke Google Sheets.
4. Catat root cause dan aksi pencegahan release berikutnya.
