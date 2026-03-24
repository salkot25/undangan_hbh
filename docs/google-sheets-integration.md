# Panduan Integrasi Google Sheets (Backend Tanpa Server)

Aplikasi undangan ini sudah siap dihubungkan dengan Google Sheets menggunakan **Google Apps Script (GAS)** sebagai _backend serverless_. Saat digunakan, data peserta yang mengisi formulir RSVP akan otomatis masuk ke dalam baris Google Sheets, dan daftar hadir di aplikasi akan otomatis ditarik dari data sheet tersebut.

## Langkah 1: Buat Google Sheet Baru

1. Buka [Google Sheets](https://sheets.google.com) dan buat dokumen baru (Misal: `Data RSVPHalalbihalal PLN`).
2. Ganti nama _Sheet_ pertama (di bagian bawah kiri layar) menjadi `Data`.
3. Pada baris pertama (A1 sampai F1), buat kolom header persis seperti ini:
   - `A1`: `ID`
   - `B1`: `Timestamp`
   - `C1`: `Nama`
   - `D1`: `Phone`
   - `E1`: `Unit`
   - `F1`: `Status`
4. (Opsional) Berikan warna latar (_Highlight_) pada baris pertama agar terlihat sebagai Header.

## Langkah 2: Buat Google Apps Script

1. Dari menu atas Google Sheets, klik **Extensions** (Ekstensi) -> **Apps Script**.
2. Akan terbuka tab editor kode baru. Hapus semua kode default (`function myFunction()...`).
3. Ganti nama proyek di kiri atas (klik `Untitled project`) menjadi `RSVP Backend API`.
4. Copy dan _Paste_ seluruh kode di bawah ini ke dalam editor:

```javascript
// Nama sheet tempat data disimpan
const SHEET_NAME = "Data";

function doGet(e) {
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
    });
  }

  // Return JSON ke React app
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      data: result.reverse(), // Reverse agar data terbaru tampil di paling atas
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Menangani request POST dari aplikasi React (Memasukkan data RSVP Baru)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  try {
    // Menarik data dari Form URL Encoded payload React App
    var name = e.parameter.name || "";
    var phone = "'" + (e.parameter.phone || ""); // Tambahkan kutip agar angka 0 tidak hilang di Sheet
    var unit = e.parameter.unit || "";
    var status = e.parameter.status || "";
    var timestamp = new Date().toISOString();

    // Generate UUID/ID unik
    var id = Utilities.getUuid();

    // Tambahkan baris baru ke paling bawah Google Sheets
    sheet.appendRow([id, timestamp, name, phone, unit, status]);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Data RSVP berhasil masuk ke Google Sheets!",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "Gagal menyimpan data: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Klik tombol **Save** 💾 (Ikon Disket) di toolbar bagian atas.

## Langkah 3: Deploy Script Menjadi Web App API

Dapatkan Link (URL API) Anda dengan cara:

1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** -> **New deployment**.
2. Klik ikon gir (Select type) di sebelah kiri, pilih **Web app**.
3. Isi konfigurasi seperti berikut:
   - **Description**: `Versi 1.0 RSVP API`
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
VITE_GOOGLE_SHEETS_URL="https://script.google.com/macros/s/AKfycbwYOUR_APP_URL_HERE/exec"
VITE_API_ALLOWED_HOSTS="script.google.com"
```

4. Selesai! Aplikasi Anda secara otomatis akan mengganti _mock data_ (data palsu sementara) menjadi membaca dan menulis data ke Google Sheets Anda secara _Real-time_.

> **Tip Penting**: Jika sewaktu-waktu Anda mengubah kode _Google Apps Script_, Anda wajib mengklik **Deploy -> Manage deployments**, lalu edit _(pencil icon)_, dan ubah versi ke _New version_, lalu klik _Deploy_ kembali. Jika tidak menggunakan _New Version_, perubahan kode Google Sheets Anda tidak akan bekerja.
