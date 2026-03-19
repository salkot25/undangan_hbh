// Google Apps Script Web App URL
// MASUKKAN URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI
export const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzxvG-IOdZPfWzOCwnI5P4DW21O0A3yckjT-JLMt_ISwBy9XeQ7aqeNQJhEdgLwMp1q/exec"; 

const MOCK_DELAY = 800; // ms

// Mock attendance data
const mockAttendees = [
  { id: 1, name: "Budi Santoso", phone: "081234567890", unit: "Yantek", status: "Hadir" },
  { id: 2, name: "Siti Rahmawati", phone: "082345678901", unit: "Back Office", status: "Hadir" },
  { id: 3, name: "Ahmad Fadillah", phone: "083456789012", unit: "P2TL", status: "Absen" },
  { id: 4, name: "Dewi Kusuma", phone: "081567890123", unit: "Yantek", status: "Hadir" },
  { id: 5, name: "Rizky Pratama", phone: "082678901234", unit: "MCB On", status: "Hadir" },
  { id: 6, name: "Nurul Hidayah", phone: "083789012345", unit: "Billman", status: "Absen" },
  { id: 7, name: "Fajar Setiawan", phone: "081890123456", unit: "ULP Salkot", status: "Hadir" },
  { id: 8, name: "Indah Permata", phone: "082901234567", unit: "Back Office", status: "Hadir" },
  { id: 9, name: "Dimas Arya", phone: "083012345678", unit: "Yantek", status: "Hadir" },
  { id: 10, name: "Putri Amelia", phone: "081123456789", unit: "P2TL", status: "Absen" },
  { id: 11, name: "Wahyu Nugroho", phone: "082234567890", unit: "MCB On", status: "Hadir" },
  { id: 12, name: "Rina Marlina", phone: "083345678901", unit: "Billman", status: "Hadir" },
  { id: 13, name: "Hendra Gunawan", phone: "081456789012", unit: "Yantek", status: "Hadir" },
  { id: 14, name: "Maya Sari", phone: "082567890123", unit: "MCB On", status: "Absen" },
  { id: 15, name: "Agus Kurniawan", phone: "083678901234", unit: "ULP Salkot", status: "Hadir" },
  { id: 16, name: "Lestari Wulandari", phone: "081789012345", unit: "Back Office", status: "Hadir" },
  { id: 17, name: "Bambang Supriyadi", phone: "082890123456", unit: "P2TL", status: "Hadir" },
  { id: 18, name: "Ratna Dewi", phone: "083901234567", unit: "Yantek", status: "Hadir" },
  { id: 19, name: "Eko Prasetyo", phone: "081012345678", unit: "Billman", status: "Absen" },
  { id: 20, name: "Ani Sulistyowati", phone: "082123456789", unit: "MCB On", status: "Hadir" },
  { id: 21, name: "Joko Susanto", phone: "083234567890", unit: "ULP Salkot", status: "Hadir" },
  { id: 22, name: "Sri Wahyuni", phone: "081345678901", unit: "Back Office", status: "Hadir" },
  { id: 23, name: "Taufik Hidayat", phone: "082456789012", unit: "MCB On", status: "Absen" },
  { id: 24, name: "Kartini Rahayu", phone: "083567890123", unit: "P2TL", status: "Hadir" },
];

const ITEMS_PER_PAGE = 5;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitRsvp(data) {
  // Simulate validation
  if (!data.name || !data.phone || !data.unit) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  // Jika GOOGLE_SHEETS_URL diisi, gunakan API asli
  if (GOOGLE_SHEETS_URL) {
    try {
      const formData = new URLSearchParams();
      formData.append("action", "submitRsvp");
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("unit", data.unit);
      formData.append("status", data.status);

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Gagal mengirim RSVP:", error);
      return { success: false, message: "Terjadi kesalahan jaringan saat mengirim data." };
    }
  }

  // Fallback to mock data if no URL
  await delay(MOCK_DELAY + Math.random() * 500);
  return {
    success: true,
    message: "Data RSVP berhasil dikirim (Mock Mode)!",
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function getAttendance({ page = 1, search = "" }) {
  let allData = [];

  // Jika GOOGLE_SHEETS_URL diisi, fetch dari API
  if (GOOGLE_SHEETS_URL) {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getAttendees`);
      const result = await response.json();
      if (result.success && result.data) {
        allData = result.data;
      } else {
        allData = [...mockAttendees]; // fallback
      }
    } catch (error) {
      console.error("Gagal memuat peserta dari server:", error);
      allData = [...mockAttendees];
    }
  } else {
    // Gunakan mook data
    await delay(MOCK_DELAY);
    allData = [...mockAttendees];
  }

  let filtered = [...allData];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q)
    );
  }

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const data = filtered.slice(start, start + ITEMS_PER_PAGE);

  return {
    success: true,
    currentPage: safePage,
    totalPages,
    totalItems,
    data,
  };
}

// Event details configuration
export const EVENT_CONFIG = {
  name: "Halalbihalal",
  organization: "PT PLN (Persero) ULP Salatiga Kota",
  date: "2026-04-02",
  time: "12:00",
  endTime: "Selesai",
  location: "Joglo Ki Penjawi Salatiga",
  address: "MFRW+V4 Sidorejo Lor, Kota Salatiga, Jawa Tengah",
  mapsUrl: "https://maps.google.com/?q=Joglo+Ki+Penjawi+Salatiga",
  mapsEmbedUrl: "https://maps.google.com/maps?q=Joglo%20Ki%20Penjawi,%20Salatiga&t=&z=16&ie=UTF8&iwloc=&output=embed",
  dressCode: "Batik / Bebas Rapi",
  units: ["Back Office", "Billman", "MCB On", "P2TL", "ULP Salkot", "Yantek"]
};
