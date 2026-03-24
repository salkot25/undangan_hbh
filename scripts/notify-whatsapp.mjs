import process from "node:process";

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function buildMessage({ title, body, url, streak }) {
  const lines = [
    "[ALERT UNDANGAN HBH]",
    title || "Terjadi gangguan monitoring.",
  ];

  if (body) lines.push(body);
  if (typeof streak === "number" && Number.isFinite(streak)) {
    lines.push(`Failure streak: ${streak}`);
  }
  if (url) lines.push(`Detail: ${url}`);

  return lines.join("\n");
}

async function sendViaCallMeBot({ phone, apiKey, message }) {
  const endpoint = new URL("https://api.callmebot.com/whatsapp.php");
  endpoint.searchParams.set("phone", phone);
  endpoint.searchParams.set("text", message);
  endpoint.searchParams.set("apikey", apiKey);

  const response = await fetch(endpoint, { method: "GET" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CallMeBot gagal (${response.status}): ${text}`);
  }
}

async function main() {
  const phone = normalizePhone(
    process.env.WHATSAPP_ADMIN_PHONE || "081999386550",
  );
  const apiKey = String(process.env.WHATSAPP_CALLMEBOT_APIKEY || "").trim();
  const title = String(process.env.ALERT_TITLE || "").trim();
  const body = String(process.env.ALERT_BODY || "").trim();
  const detailUrl = String(process.env.ALERT_URL || "").trim();
  const streak = Number(process.env.ALERT_STREAK || "");

  if (!phone) {
    console.warn("Skip notify: nomor WhatsApp admin tidak valid.");
    return;
  }

  const message = buildMessage({
    title,
    body,
    url: detailUrl,
    streak: Number.isFinite(streak) ? streak : undefined,
  });

  if (!apiKey) {
    console.warn(
      "Skip notify: secret WHATSAPP_CALLMEBOT_APIKEY belum diset. " +
        `Fallback link: https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    );
    return;
  }

  await sendViaCallMeBot({ phone, apiKey, message });
  console.log(`WhatsApp alert sent to ${phone}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
