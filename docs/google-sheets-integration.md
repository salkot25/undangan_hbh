# Panduan Integrasi Google Sheets (Backend Tanpa Server)

Aplikasi undangan ini sudah siap dihubungkan dengan Google Sheets menggunakan **Google Apps Script (GAS)** sebagai _backend serverless_. Saat digunakan, data peserta yang mengisi formulir RSVP akan otomatis masuk ke dalam baris Google Sheets, dan daftar hadir di aplikasi akan otomatis ditarik dari data sheet tersebut.

## Langkah 1: Buat Google Sheet Baru

1. Buka [Google Sheets](https://sheets.google.com) dan buat dokumen baru (Misal: `Data RSVPHalalbihalal PLN`).
2. Ganti nama _Sheet_ pertama (di bagian bawah kiri layar) menjadi `Data`.
3. Pada baris pertama (A1 sampai H1), buat kolom header persis seperti ini:
   - `A1`: `ID`
   - `B1`: `Timestamp`
   - `C1`: `Nama`
   - `D1`: `Phone`
   - `E1`: `Unit`
   - `F1`: `Status`

- `G1`: `EventDate`
- `H1`: `IdempotencyKey`

4. (Opsional) Berikan warna latar (_Highlight_) pada baris pertama agar terlihat sebagai Header.

## Langkah 2: Buat Google Apps Script

1. Dari menu atas Google Sheets, klik **Extensions** (Ekstensi) -> **Apps Script**.
2. Akan terbuka tab editor kode baru. Hapus semua kode default (`function myFunction()...`).
3. Ganti nama proyek di kiri atas (klik `Untitled project`) menjadi `RSVP Backend API`.
4. Copy dan _Paste_ seluruh kode di bawah ini ke dalam editor:

```javascript
// Nama sheet tempat data disimpan
const SHEET_NAME = "Data";
const API_TOKEN = "GANTI_DENGAN_TOKEN_RAHASIA_ANDA";
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUEST_PER_WINDOW = 5;

function getClientIp_() {
  return (
    (Session.getTemporaryActiveUserKey &&
      Session.getTemporaryActiveUserKey()) ||
    "anonymous"
  );
}

function verifyToken_(e) {
  const tokenFromHeader =
    (e && e.parameter && e.parameter.token) ||
    (e && e.parameters && e.parameters.token && e.parameters.token[0]) ||
    "";

  if (!API_TOKEN) return true;
  return tokenFromHeader === API_TOKEN;
}

function checkRateLimit_(key) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "rate:" + key;
  const now = Date.now();
  const raw = cache.get(cacheKey);
  let state = { count: 0, startAt: now };

  if (raw) {
    state = JSON.parse(raw);
  }

  if (now - state.startAt > RATE_LIMIT_WINDOW_MS) {
    state = { count: 0, startAt: now };
  }

  state.count += 1;
  cache.put(
    cacheKey,
    JSON.stringify(state),
    Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  );

  return state.count <= MAX_REQUEST_PER_WINDOW;
}

function normalizeName_(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isDuplicateRsvp_(sheet, payload) {
  const normalizedPhone = String(payload.phone || "").replace(/\D/g, "");
  const normalizedName = normalizeName_(payload.name);
  const eventDate = String(payload.eventDate || "").trim();
  const idempotencyKey = String(payload.idempotencyKey || "").trim();
  if (!normalizedPhone && !idempotencyKey) return false;

  const data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowPhone = String(data[i][3] || "").replace(/\D/g, "");
    var rowName = normalizeName_(data[i][2]);
    var rowEventDate = String(data[i][6] || "").trim();
    var rowIdempotencyKey = String(data[i][7] || "").trim();

    // Prioritas dedupe via idempotency key (retry-safe)
    if (
      idempotencyKey &&
      rowIdempotencyKey &&
      idempotencyKey === rowIdempotencyKey
    ) {
      return true;
    }

    // Fallback dedupe via phone+name dalam event date yang sama
    if (
      eventDate &&
      rowEventDate === eventDate &&
      rowPhone === normalizedPhone &&
      rowName === normalizedName
    ) {
      return true;
    }
  }
  return false;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doGet(e) {
  if (!verifyToken_(e)) {
    return jsonResponse_({
      success: false,
      code: "UNAUTHORIZED",
      message: "Token tidak valid.",
    });
  }

  // Menangani request GET dari aplikasi React (Menarik Data Kehadiran)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  // Mengubah data baris menjadi array of objects JSON
  var result = [];
  // Mulai dari indeks 1 untuk melewati Header baris ke-1
  for (var i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0] || i,
      timestamp: data[i][1],
      name: data[i][2],
      phone: String(data[i][3]),
      unit: data[i][4],
      status: data[i][5],
      eventDate: data[i][6],
      idempotencyKey: data[i][7],
    });
  }

  // Return JSON ke React app
  return jsonResponse_({
    success: true,
    data: result.reverse(), // Reverse agar data terbaru tampil di paling atas
  });
}

function doPost(e) {
  if (!verifyToken_(e)) {
    return jsonResponse_({
      success: false,
      code: "UNAUTHORIZED",
      message: "Token tidak valid.",
    });
  }

  const ipKey = getClientIp_();
  if (!checkRateLimit_(ipKey)) {
    return jsonResponse_({
      success: false,
      code: "RATE_LIMIT",
      message: "Terlalu banyak percobaan, coba beberapa saat lagi.",
    });
  }

  // Menangani request POST dari aplikasi React (Memasukkan data RSVP Baru)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  try {
    // Menarik data dari Form URL Encoded payload React App
    var name = e.parameter.name || "";
    var phone = "'" + (e.parameter.phone || ""); // Tambahkan kutip agar angka 0 tidak hilang di Sheet
    var unit = e.parameter.unit || "";
    var status = e.parameter.status || "";
    var eventDate = e.parameter.eventDate || "";
    var idempotencyKey = e.parameter.idempotencyKey || "";
    var timestamp = new Date().toISOString();

    if (
      isDuplicateRsvp_(sheet, {
        name: name,
        phone: phone,
        eventDate: eventDate,
        idempotencyKey: idempotencyKey,
      })
    ) {
      return jsonResponse_({
        success: false,
        code: "DUPLICATE_RSVP",
        message: "Data RSVP terdeteksi duplikat untuk event ini.",
      });
    }

    // Generate UUID/ID unik
    var id = Utilities.getUuid();

    // Tambahkan baris baru ke paling bawah Google Sheets
    sheet.appendRow([
      id,
      timestamp,
      name,
      phone,
      unit,
      status,
      eventDate,
      idempotencyKey,
    ]);

    return jsonResponse_({
      success: true,
      message: "Data RSVP berhasil masuk ke Google Sheets!",
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: "Gagal menyimpan data: " + error.toString(),
    });
  }
}
```

5. Klik tombol **Save** 💾 (Ikon Disket) di toolbar bagian atas.

## Langkah 3: Deploy Script Menjadi Web App API

Dapatkan Link (URL API) Anda dengan cara:

1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** -> **New deployment**.
2. Klik ikon gir (Select type) di sebelah kiri, pilih **Web app**.
3. Isi konfigurasi seperti berikut:

- **Description**: `Versi 2.0 RSVP API (Modular)`
- **Execute as**: `Me` (Pilih email Anda)
- **Who has access**: **`Anyone`** (Krusial! Wajib pilih _Anyone_ agar aplikasi web Anda bisa mengaksesnya tanpa harus login akun Google).

4. Klik **Deploy**.
5. Google mungkin akan meminta _Authorize access_ (Izin akses). Klik **Authorize access**, pilih akun Google Anda. Jika muncul peringatan keamanan _"Google hasn't verified this app"_, klik tautan kecil **Advanced**, lalu klik tautan **Go to RSVP Backend API (unsafe)** di bagian bawah, dan klik **Allow**.
6. Deployment Sukses! Anda akan melihat jendela yang berisi **Web app URL**.
   URL tersebut panjang dan diawali dengan `https://script.google.com/macros/s/...`
7. **Salin / Copy (Ctrl+C)** URL tersebut.

## Langkah 4: Tautkan Web App URL Punya Anda Ke Aplikasi Undangan

1. Kembali ke editor kode aplikasi undangan Anda di _Visual Studio Code_.
2. Buat file `.env` dari template `.env.example`.
3. Isi variabel berikut dengan URL Web App yang sudah Anda salin:

```bash
VITE_API_PROVIDER="google-sheets"
VITE_EVENT_DATE="2026-04-02"
VITE_GOOGLE_SHEETS_URL="https://script.google.com/macros/s/AKfycbwYOUR_APP_URL_HERE/exec"
VITE_API_ALLOWED_HOSTS="script.google.com"
VITE_API_AUTH_TOKEN="GANTI_DENGAN_TOKEN_RAHASIA_ANDA"
```

4. Selesai! Aplikasi Anda secara otomatis akan mengganti _mock data_ (data palsu sementara) menjadi membaca dan menulis data ke Google Sheets Anda secara _Real-time_.

> **Tip Penting**: Jika sewaktu-waktu Anda mengubah kode _Google Apps Script_, Anda wajib mengklik **Deploy -> Manage deployments**, lalu edit _(pencil icon)_, dan ubah versi ke _New version_, lalu klik _Deploy_ kembali. Jika tidak menggunakan _New Version_, perubahan kode Google Sheets Anda tidak akan bekerja.

## Langkah 5: Security Hardening (Wajib untuk Production)

Tambahkan penguatan berikut pada kode Google Apps Script:

```javascript
const API_TOKENS = ["TOKEN_AKTIF_SEKARANG", "TOKEN_SEBELUMNYA_OPSIONAL"];
const REVOKED_TOKENS = [
  // "TOKEN_BOCOR_YANG_DICABUT"
];
const ALLOWED_CALLERS = ["undangan-hbh-web"];
const ALLOWED_ORIGINS = ["https://undangan.salkot.online"];
const AUDIT_SHEET_NAME = "AuditLog";

function sanitizeField_(value, maxLen) {
  return String(value || "")
    .replace(/[<>"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen || 120);
}

function getToken_(e) {
  return sanitizeField_(
    (e && e.parameter && e.parameter.token) ||
      (e && e.parameters && e.parameters.token && e.parameters.token[0]) ||
      "",
    200,
  );
}

function isTokenAllowed_(token) {
  if (!token) return false;
  if (REVOKED_TOKENS.indexOf(token) >= 0) return false;
  return API_TOKENS.indexOf(token) >= 0;
}

function isCallerAllowed_(e) {
  var callerId = sanitizeField_(e.parameter.callerId || "", 80);
  var origin = sanitizeField_(e.parameter.origin || "", 160);
  if (ALLOWED_CALLERS.indexOf(callerId) < 0) return false;
  if (ALLOWED_ORIGINS.indexOf(origin) < 0) return false;
  return true;
}

function writeAuditLog_(eventName, status, detail) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(AUDIT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(AUDIT_SHEET_NAME);
    sheet.appendRow(["Timestamp", "Event", "Status", "Detail"]);
  }
  sheet.appendRow([
    new Date().toISOString(),
    sanitizeField_(eventName, 80),
    sanitizeField_(status, 40),
    sanitizeField_(detail, 300),
  ]);
}
```

Lalu gunakan di `doGet` dan `doPost`:

```javascript
var token = getToken_(e);
if (!isTokenAllowed_(token)) {
  writeAuditLog_("auth", "unauthorized", "token invalid or revoked");
  return jsonResponse_({
    success: false,
    code: "UNAUTHORIZED",
    message: "Token tidak valid.",
  });
}

if (!isCallerAllowed_(e)) {
  writeAuditLog_("caller", "forbidden", "origin/caller rejected");
  return jsonResponse_({
    success: false,
    code: "FORBIDDEN_CALLER",
    message: "Caller tidak diizinkan.",
  });
}
```

Untuk penolakan rate-limit atau duplicate, tambahkan audit log:

```javascript
if (!checkRateLimit_(ipKey)) {
  writeAuditLog_("rate-limit", "rejected", ipKey);
  return jsonResponse_({
    success: false,
    code: "RATE_LIMIT",
    message: "Terlalu banyak percobaan.",
  });
}

if (isDuplicateRsvp_(sheet, payload)) {
  writeAuditLog_(
    "duplicate",
    "rejected",
    payload.idempotencyKey || payload.phone,
  );
  return jsonResponse_({
    success: false,
    code: "DUPLICATE_RSVP",
    message: "Data RSVP terdeteksi duplikat.",
  });
}
```

### Prosedur Rotasi Token dan Revoke

1. Buat token baru, tambahkan ke `API_TOKENS` bersama token lama.
2. Update frontend `VITE_API_AUTH_TOKEN` ke token baru.
3. Deploy frontend dan pantau 24 jam.
4. Hapus token lama dari `API_TOKENS`.
5. Jika token bocor, tambahkan token tersebut ke `REVOKED_TOKENS` dan redeploy GAS.

## Langkah 6: Backup Sheet Otomatis Harian + Retention

Tambahkan fungsi berikut di Apps Script:

```javascript
const BACKUP_PREFIX = "Backup_Data_";
const BACKUP_RETENTION_DAYS = 14;

function runDailyBackup_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getSheetByName(SHEET_NAME);
  if (!source) throw new Error("Sheet Data tidak ditemukan");

  var tz = Session.getScriptTimeZone() || "Asia/Jakarta";
  var dateLabel = Utilities.formatDate(new Date(), tz, "yyyyMMdd");
  var backupName = BACKUP_PREFIX + dateLabel;

  var existing = ss.getSheetByName(backupName);
  if (existing) ss.deleteSheet(existing);

  var backup = source.copyTo(ss).setName(backupName);
  backup.getDataRange().copyTo(backup.getDataRange(), { contentsOnly: true });
  cleanupOldBackups_();
}

function cleanupOldBackups_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();
  var allSheets = ss.getSheets();

  allSheets.forEach(function (sheet) {
    var name = sheet.getName();
    if (name.indexOf(BACKUP_PREFIX) !== 0) return;

    var datePart = name.replace(BACKUP_PREFIX, "");
    if (!/^\d{8}$/.test(datePart)) return;

    var year = Number(datePart.slice(0, 4));
    var month = Number(datePart.slice(4, 6)) - 1;
    var day = Number(datePart.slice(6, 8));
    var backupDate = new Date(year, month, day);
    var ageDays = Math.floor((now - backupDate) / (24 * 60 * 60 * 1000));

    if (ageDays > BACKUP_RETENTION_DAYS) {
      ss.deleteSheet(sheet);
    }
  });
}
```

Aktifkan trigger harian:

1. Buka Apps Script -> **Triggers**.
2. Tambah trigger untuk `runDailyBackup_`.
3. Pilih **Time-driven** -> **Day timer** -> misal pukul 01:00-02:00.
4. Simpan dan pastikan trigger status aktif.

Hasil:

- Setiap hari terbentuk backup sheet baru.
- Backup lebih lama dari `BACKUP_RETENTION_DAYS` akan dihapus otomatis.

## Lampiran: Versi 2 (Modular Multi-File)

Jika Anda ingin struktur Apps Script yang lebih mudah dipelihara, gunakan template modular pada folder berikut:

- [docs/apps-script-modular/README.md](docs/apps-script-modular/README.md)
- [docs/apps-script-modular/config.gs](docs/apps-script-modular/config.gs)
- [docs/apps-script-modular/utils.gs](docs/apps-script-modular/utils.gs)
- [docs/apps-script-modular/audit.gs](docs/apps-script-modular/audit.gs)
- [docs/apps-script-modular/auth.gs](docs/apps-script-modular/auth.gs)
- [docs/apps-script-modular/rate-limit.gs](docs/apps-script-modular/rate-limit.gs)
- [docs/apps-script-modular/validation.gs](docs/apps-script-modular/validation.gs)
- [docs/apps-script-modular/duplicate.gs](docs/apps-script-modular/duplicate.gs)
- [docs/apps-script-modular/handlers.gs](docs/apps-script-modular/handlers.gs)
- [docs/apps-script-modular/backup.gs](docs/apps-script-modular/backup.gs)

Ringkasan arsitektur modular:

1. `config.gs`: semua konstanta environment dan kebijakan.
2. `utils.gs`: helper umum, sanitize, response JSON, dan bootstrap sheet.
3. `auth.gs` + `rate-limit.gs`: proteksi akses API.
4. `validation.gs` + `duplicate.gs`: validasi dan anti-duplikasi RSVP.
5. `handlers.gs`: endpoint `doGet` dan `doPost`.
6. `backup.gs`: backup harian + retention + manajemen trigger.
