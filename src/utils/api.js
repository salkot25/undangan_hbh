import { logWarn, logError } from "./observability";

// Google Apps Script Web App URL
// MASUKKAN URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI
const DEFAULT_GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbzxvG-IOdZPfWzOCwnI5P4DW21O0A3yckjT-JLMt_ISwBy9XeQ7aqeNQJhEdgLwMp1q/exec";

export const GOOGLE_SHEETS_URL = (
  import.meta.env.VITE_GOOGLE_SHEETS_URL || DEFAULT_GOOGLE_SHEETS_URL
).trim();

const REQUEST_TIMEOUT_MS = 8000;
const API_PROVIDER_GOOGLE_SHEETS = "google-sheets";
const API_PROVIDER_INTERNAL_REST = "internal-rest";
const STATUS_HADIR = "Hadir";
const STATUS_TIDAK_HADIR = "Tidak Hadir";
const ATTENDANCE_STATUS_FALLBACK = "Absen";
const API_ERROR_RATE_LIMIT = "RATE_LIMIT";
const API_ERROR_DUPLICATE = "DUPLICATE_RSVP";

const EVENT_UNITS = [
  "Back Office",
  "Billman",
  "MCB On",
  "P2TL",
  "ULP Salkot",
  "Yantek",
];
const ALLOWED_RSVP_STATUS = new Set([STATUS_HADIR, STATUS_TIDAK_HADIR]);
const ALLOWED_ATTENDANCE_STATUS = new Set([
  STATUS_HADIR,
  STATUS_TIDAK_HADIR,
  ATTENDANCE_STATUS_FALLBACK,
]);

const MOCK_DELAY = 800; // ms

// Mock attendance data
const mockAttendees = [
  {
    id: 1,
    name: "Budi Santoso",
    phone: "081234567890",
    unit: "Yantek",
    status: "Hadir",
  },
  {
    id: 2,
    name: "Siti Rahmawati",
    phone: "082345678901",
    unit: "Back Office",
    status: "Hadir",
  },
  {
    id: 3,
    name: "Ahmad Fadillah",
    phone: "083456789012",
    unit: "P2TL",
    status: "Absen",
  },
  {
    id: 4,
    name: "Dewi Kusuma",
    phone: "081567890123",
    unit: "Yantek",
    status: "Hadir",
  },
  {
    id: 5,
    name: "Rizky Pratama",
    phone: "082678901234",
    unit: "MCB On",
    status: "Hadir",
  },
  {
    id: 6,
    name: "Nurul Hidayah",
    phone: "083789012345",
    unit: "Billman",
    status: "Absen",
  },
  {
    id: 7,
    name: "Fajar Setiawan",
    phone: "081890123456",
    unit: "ULP Salkot",
    status: "Hadir",
  },
  {
    id: 8,
    name: "Indah Permata",
    phone: "082901234567",
    unit: "Back Office",
    status: "Hadir",
  },
  {
    id: 9,
    name: "Dimas Arya",
    phone: "083012345678",
    unit: "Yantek",
    status: "Hadir",
  },
  {
    id: 10,
    name: "Putri Amelia",
    phone: "081123456789",
    unit: "P2TL",
    status: "Absen",
  },
  {
    id: 11,
    name: "Wahyu Nugroho",
    phone: "082234567890",
    unit: "MCB On",
    status: "Hadir",
  },
  {
    id: 12,
    name: "Rina Marlina",
    phone: "083345678901",
    unit: "Billman",
    status: "Hadir",
  },
  {
    id: 13,
    name: "Hendra Gunawan",
    phone: "081456789012",
    unit: "Yantek",
    status: "Hadir",
  },
  {
    id: 14,
    name: "Maya Sari",
    phone: "082567890123",
    unit: "MCB On",
    status: "Absen",
  },
  {
    id: 15,
    name: "Agus Kurniawan",
    phone: "083678901234",
    unit: "ULP Salkot",
    status: "Hadir",
  },
  {
    id: 16,
    name: "Lestari Wulandari",
    phone: "081789012345",
    unit: "Back Office",
    status: "Hadir",
  },
  {
    id: 17,
    name: "Bambang Supriyadi",
    phone: "082890123456",
    unit: "P2TL",
    status: "Hadir",
  },
  {
    id: 18,
    name: "Ratna Dewi",
    phone: "083901234567",
    unit: "Yantek",
    status: "Hadir",
  },
  {
    id: 19,
    name: "Eko Prasetyo",
    phone: "081012345678",
    unit: "Billman",
    status: "Absen",
  },
  {
    id: 20,
    name: "Ani Sulistyowati",
    phone: "082123456789",
    unit: "MCB On",
    status: "Hadir",
  },
  {
    id: 21,
    name: "Joko Susanto",
    phone: "083234567890",
    unit: "ULP Salkot",
    status: "Hadir",
  },
  {
    id: 22,
    name: "Sri Wahyuni",
    phone: "081345678901",
    unit: "Back Office",
    status: "Hadir",
  },
  {
    id: 23,
    name: "Taufik Hidayat",
    phone: "082456789012",
    unit: "MCB On",
    status: "Absen",
  },
  {
    id: 24,
    name: "Kartini Rahayu",
    phone: "083567890123",
    unit: "P2TL",
    status: "Hadir",
  },
];

const ITEMS_PER_PAGE = 5;

function normalizeText(value, maxLen = 120) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function normalizePhone(value) {
  return String(value || "")
    .replace(/[^0-9]/g, "")
    .slice(0, 15);
}

function normalizeStatus(value) {
  if (ALLOWED_ATTENDANCE_STATUS.has(value)) return value;
  return ATTENDANCE_STATUS_FALLBACK;
}

function sanitizeRsvpPayload(data) {
  const name = normalizeText(data?.name, 100);
  const phone = normalizePhone(data?.phone);
  const unit = normalizeText(data?.unit, 50);
  const rawStatus = normalizeText(data?.status, 20);
  const status = ALLOWED_RSVP_STATUS.has(rawStatus) ? rawStatus : STATUS_HADIR;

  if (!name || !phone || !unit) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  if (!/^[0-9]{10,13}$/.test(phone)) {
    return { success: false, message: "Nomor HP harus 10-13 digit angka." };
  }

  if (!EVENT_UNITS.includes(unit)) {
    return { success: false, message: "Unit kerja tidak valid." };
  }

  return {
    success: true,
    data: { name, phone, unit, status },
  };
}

function resolveApiUrl({ baseUrl, allowedHosts, logger }) {
  if (!baseUrl) return "";

  try {
    const parsed = new URL(baseUrl);

    if (
      parsed.protocol !== "https:" ||
      !allowedHosts.includes(parsed.hostname)
    ) {
      logger.warn("api.endpoint.blocked", {
        reason: "host_or_protocol_not_allowed",
        protocol: parsed.protocol,
        host: parsed.hostname,
      });
      return "";
    }

    return parsed.toString();
  } catch {
    logger.warn("api.endpoint.blocked", {
      reason: "invalid_url",
    });
    return "";
  }
}

async function fetchJsonWithTimeout({
  fetchImpl,
  url,
  timeoutMs,
  logger,
  options = {},
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      credentials: "omit",
      cache: "no-store",
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.warn("api.http.non_ok", {
        status: response.status,
        url,
      });
      throw new Error("http_non_ok");
    }

    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      logger.warn("api.http.timeout", { url, timeoutMs });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeAttendanceItem(item, idx) {
  const name = normalizeText(item?.name, 100);
  const phone = normalizePhone(item?.phone);
  const unit = normalizeText(item?.unit, 50);

  if (!name || !unit) return null;

  return {
    id: item?.id ?? `att-${idx + 1}`,
    name,
    phone,
    unit: EVENT_UNITS.includes(unit) ? unit : "Lainnya",
    status: normalizeStatus(normalizeText(item?.status, 20)),
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAllowedHosts(raw) {
  return (raw || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

function createLogger(customLogger) {
  if (customLogger) return customLogger;
  return {
    warn: logWarn,
    error: logError,
  };
}

function getProvider(env) {
  const provider = (
    env?.VITE_API_PROVIDER || API_PROVIDER_GOOGLE_SHEETS
  ).trim();
  if (
    [API_PROVIDER_GOOGLE_SHEETS, API_PROVIDER_INTERNAL_REST].includes(provider)
  ) {
    return provider;
  }
  return API_PROVIDER_GOOGLE_SHEETS;
}

function getAuthToken(env) {
  return String(env?.VITE_API_AUTH_TOKEN || "").trim();
}

function toGoogleSheetsPayload(payload, authToken) {
  const formData = new URLSearchParams();
  formData.append("action", "submitRsvp");
  formData.append("name", payload.name);
  formData.append("phone", payload.phone);
  formData.append("unit", payload.unit);
  formData.append("status", payload.status);
  if (authToken) {
    formData.append("token", authToken);
  }
  return formData;
}

function buildAuthHeaders(authToken) {
  if (!authToken) return {};
  return { "X-API-Token": authToken };
}

function mapSubmitFailureMessage(result) {
  const code = normalizeText(result?.code, 40).toUpperCase();
  if (code === API_ERROR_RATE_LIMIT) {
    return "Terlalu banyak percobaan. Silakan tunggu sebentar dan coba lagi.";
  }
  if (code === API_ERROR_DUPLICATE) {
    return "Nomor HP ini sudah terdaftar sebelumnya.";
  }
  const message = normalizeText(result?.message, 200);
  if (message) return message;
  return "Gagal menyimpan data ke server.";
}

function buildPaginatedAttendanceResult(items, page) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const data = items.slice(start, start + ITEMS_PER_PAGE);

  return {
    success: true,
    currentPage: safePage,
    totalPages,
    totalItems,
    data,
  };
}

function normalizeAttendanceList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map((item, idx) => normalizeAttendanceItem(item, idx))
    .filter(Boolean);
}

function isSuccessResult(result) {
  return result?.success === true;
}

export function createApiAdapter(options = {}) {
  const env = options.env || import.meta.env;
  const fetchImpl = options.fetchImpl || fetch;
  const requestTimeoutMs = options.requestTimeoutMs || REQUEST_TIMEOUT_MS;
  const logger = createLogger(options.logger);
  const provider = getProvider(env);
  const authToken = getAuthToken(env);

  const safeGoogleSheetsUrl = resolveApiUrl({
    baseUrl: (env?.VITE_GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL || "").trim(),
    allowedHosts: getAllowedHosts(
      env?.VITE_API_ALLOWED_HOSTS || "script.google.com",
    ),
    logger,
  });

  const safeInternalRestBaseUrl = resolveApiUrl({
    baseUrl: (env?.VITE_INTERNAL_API_BASE_URL || "").trim(),
    allowedHosts: getAllowedHosts(
      env?.VITE_INTERNAL_API_ALLOWED_HOSTS || "localhost,127.0.0.1",
    ),
    logger,
  });

  async function submitViaGoogleSheets(payload) {
    const result = await fetchJsonWithTimeout({
      fetchImpl,
      url: safeGoogleSheetsUrl,
      timeoutMs: requestTimeoutMs,
      logger,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          ...buildAuthHeaders(authToken),
        },
        body: toGoogleSheetsPayload(payload, authToken),
      },
    });

    if (!isSuccessResult(result)) {
      logger.warn("api.submit.invalid_response", {
        provider: API_PROVIDER_GOOGLE_SHEETS,
        success: result?.success,
        code: result?.code,
      });
      return { success: false, message: mapSubmitFailureMessage(result) };
    }

    return result;
  }

  async function submitViaInternalRest(payload) {
    const endpoint = `${safeInternalRestBaseUrl}/rsvp`;
    const result = await fetchJsonWithTimeout({
      fetchImpl,
      url: endpoint,
      timeoutMs: requestTimeoutMs,
      logger,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(authToken),
        },
        body: JSON.stringify(payload),
      },
    });

    if (!isSuccessResult(result)) {
      logger.warn("api.submit.invalid_response", {
        provider: API_PROVIDER_INTERNAL_REST,
        success: result?.success,
        code: result?.code,
      });
      return { success: false, message: mapSubmitFailureMessage(result) };
    }

    return result;
  }

  async function getAttendanceViaGoogleSheets() {
    const query = new URLSearchParams({ action: "getAttendees" });
    if (authToken) {
      query.set("token", authToken);
    }
    const endpoint = `${safeGoogleSheetsUrl}?${query.toString()}`;
    const result = await fetchJsonWithTimeout({
      fetchImpl,
      url: endpoint,
      timeoutMs: requestTimeoutMs,
      logger,
      options: {
        headers: {
          ...buildAuthHeaders(authToken),
        },
      },
    });

    if (!isSuccessResult(result) || !Array.isArray(result.data)) {
      logger.warn("api.attendance.invalid_response", {
        provider: API_PROVIDER_GOOGLE_SHEETS,
        success: result?.success,
        hasArrayData: Array.isArray(result?.data),
      });
      return null;
    }

    return normalizeAttendanceList(result.data);
  }

  async function getAttendanceViaInternalRest(page, search) {
    const query = new URLSearchParams({
      page: String(page),
      search,
    }).toString();
    const endpoint = `${safeInternalRestBaseUrl}/attendance?${query}`;
    const result = await fetchJsonWithTimeout({
      fetchImpl,
      url: endpoint,
      timeoutMs: requestTimeoutMs,
      logger,
      options: {
        headers: {
          ...buildAuthHeaders(authToken),
        },
      },
    });

    if (!isSuccessResult(result) || !Array.isArray(result.data)) {
      logger.warn("api.attendance.invalid_response", {
        provider: API_PROVIDER_INTERNAL_REST,
        success: result?.success,
        hasArrayData: Array.isArray(result?.data),
      });
      return null;
    }

    return normalizeAttendanceList(result.data);
  }

  async function submitRsvp(data) {
    const sanitized = sanitizeRsvpPayload(data);
    if (!sanitized.success) {
      return sanitized;
    }
    const payload = sanitized.data;

    try {
      if (provider === API_PROVIDER_GOOGLE_SHEETS && safeGoogleSheetsUrl) {
        return await submitViaGoogleSheets(payload);
      }

      if (provider === API_PROVIDER_INTERNAL_REST && safeInternalRestBaseUrl) {
        return await submitViaInternalRest(payload);
      }
    } catch (error) {
      logger.error("api.submit.failed", {
        provider,
        message: error?.message || "unknown",
      });

      return {
        success: false,
        message: "Terjadi kesalahan jaringan saat mengirim data.",
      };
    }

    await delay(MOCK_DELAY + Math.random() * 500);
    return {
      success: true,
      message: "Data RSVP berhasil dikirim (Mock Mode)!",
      data: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async function getAttendance({ page = 1, search = "" }) {
    let allData = [];

    try {
      if (provider === API_PROVIDER_GOOGLE_SHEETS && safeGoogleSheetsUrl) {
        const remoteData = await getAttendanceViaGoogleSheets();
        allData = remoteData || [...mockAttendees];
      } else if (
        provider === API_PROVIDER_INTERNAL_REST &&
        safeInternalRestBaseUrl
      ) {
        const remoteData = await getAttendanceViaInternalRest(page, search);
        allData = remoteData || [...mockAttendees];
      } else {
        await delay(MOCK_DELAY);
        allData = [...mockAttendees];
      }
    } catch (error) {
      logger.error("api.attendance.failed", {
        provider,
        message: error?.message || "unknown",
      });
      allData = [...mockAttendees];
    }

    let filtered = [...allData];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q),
      );
    }

    return buildPaginatedAttendanceResult(filtered, page);
  }

  const isRemoteEnabled =
    (provider === API_PROVIDER_GOOGLE_SHEETS && Boolean(safeGoogleSheetsUrl)) ||
    (provider === API_PROVIDER_INTERNAL_REST &&
      Boolean(safeInternalRestBaseUrl));

  return {
    submitRsvp,
    getAttendance,
    isRemoteEnabled,
    provider,
  };
}

const defaultApiAdapter = createApiAdapter();

export async function submitRsvp(data) {
  return defaultApiAdapter.submitRsvp(data);
}

export async function getAttendance(params) {
  return defaultApiAdapter.getAttendance(params);
}

// Event details configuration
export const EVENT_CONFIG = {
  name: "Halalbihalal",
  organization: "PT PLN (Persero) ULP Salatiga Kota",
  date: "2026-04-02",
  time: "10:00",
  endTime: "Selesai",
  location: "Joglo Ki Penjawi Salatiga",
  address: "MFRW+V4 Sidorejo Lor, Kota Salatiga, Jawa Tengah",
  mapsUrl: "https://maps.google.com/?q=Joglo+Ki+Penjawi+Salatiga",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Joglo%20Ki%20Penjawi,%20Salatiga&t=&z=16&ie=UTF8&iwloc=&output=embed",
  dressCode: "Seragam / Bebas Rapi",
  units: EVENT_UNITS,
};
