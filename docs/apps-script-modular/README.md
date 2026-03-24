# Google Apps Script Modular (Versi 2)

Folder ini berisi template backend GAS yang dipecah per file agar mudah maintenance.

## Urutan Buat File di Apps Script

1. `config.gs`
2. `utils.gs`
3. `audit.gs`
4. `auth.gs`
5. `rate-limit.gs`
6. `validation.gs`
7. `duplicate.gs`
8. `handlers.gs`
9. `backup.gs`

## Checklist Integrasi Frontend

- `VITE_API_AUTH_TOKEN` cocok dengan token aktif di `API_TOKENS`.
- `VITE_API_CLIENT_ID` cocok dengan `ALLOWED_CALLERS`.
- `VITE_API_CLIENT_ORIGIN` cocok dengan `ALLOWED_ORIGINS`.
- Frontend mengirim `eventDate` dan `idempotencyKey`.

## Trigger Backup

Setelah semua file dipasang, jalankan sekali fungsi `installDailyBackupTrigger_()` dari editor Apps Script.
