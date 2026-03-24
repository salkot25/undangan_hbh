function isDuplicateRsvp_(sheet, payload) {
  const normalizedPhone = String(payload.phone || "").replace(/\D/g, "");
  const normalizedName = normalizeName_(payload.name);
  const eventDate = String(payload.eventDate || "").trim();
  const idempotencyKey = String(payload.idempotencyKey || "").trim();

  if (!idempotencyKey && !normalizedPhone) return false;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowName = normalizeName_(data[i][2]);
    const rowPhone = String(data[i][3] || "").replace(/\D/g, "");
    const rowEventDate = String(data[i][6] || "").trim();
    const rowIdempotencyKey = String(data[i][7] || "").trim();

    if (
      idempotencyKey &&
      rowIdempotencyKey &&
      idempotencyKey === rowIdempotencyKey
    ) {
      return true;
    }

    if (
      eventDate &&
      rowEventDate === eventDate &&
      normalizedPhone &&
      rowPhone === normalizedPhone &&
      rowName === normalizedName
    ) {
      return true;
    }
  }

  return false;
}
