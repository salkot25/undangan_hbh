const DEFAULT_SUPPORT_WHATSAPP_NUMBER = "6281999386550";

function normalizeWhatsAppNumber(value) {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  if (!digits) return DEFAULT_SUPPORT_WHATSAPP_NUMBER;

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export const SUPPORT_WHATSAPP_NUMBER = normalizeWhatsAppNumber(
  import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER ||
    DEFAULT_SUPPORT_WHATSAPP_NUMBER,
);

export function createWhatsAppUrl({
  phone = SUPPORT_WHATSAPP_NUMBER,
  message,
}) {
  const safePhone = normalizeWhatsAppNumber(phone);
  const safeMessage = String(message || "").trim();
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(safeMessage)}`;
}

export function openWhatsAppMessage({
  phone = SUPPORT_WHATSAPP_NUMBER,
  message,
}) {
  if (typeof window === "undefined") return false;
  const url = createWhatsAppUrl({ phone, message });
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function buildContactMessage({ name, message }) {
  return `Halo Panitia, saya ${name}.\n\n${message}\n\n--\nDikirim dari Aplikasi Undangan Halalbihalal PT PLN (Persero) ULP Salatiga Kota`;
}

export function buildFallbackRsvpMessage({ name, phone, unit, status }) {
  const safeName = String(name || "-").trim() || "-";
  const safePhone = String(phone || "-").trim() || "-";
  const safeUnit = String(unit || "-").trim() || "-";
  const safeStatus = String(status || "Hadir").trim() || "Hadir";

  return [
    "Halo Panitia, saya ingin kirim RSVP manual karena formulir sedang bermasalah.",
    "",
    `Nama: ${safeName}`,
    `No HP: ${safePhone}`,
    `Unit: ${safeUnit}`,
    `Status: ${safeStatus}`,
    "",
    "Mohon dibantu input ke daftar hadir. Terima kasih.",
  ].join("\n");
}
