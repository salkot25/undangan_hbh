function sanitizeAndValidatePayload_(e) {
  const name = sanitizeField_(param_(e, "name"), 100);
  const phone = normalizePhone_(param_(e, "phone"));
  const unit = sanitizeField_(param_(e, "unit"), 50);
  const status = sanitizeField_(param_(e, "status"), 20);
  const eventDate = sanitizeField_(param_(e, "eventDate"), 10);
  const idempotencyKey = sanitizeField_(param_(e, "idempotencyKey"), 120);

  if (!name || !phone || !unit || !status || !eventDate || !idempotencyKey) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  if (!/^[0-9]{10,13}$/.test(phone)) {
    return { success: false, message: "Nomor HP harus 10-13 digit angka." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { success: false, message: "Format eventDate harus YYYY-MM-DD." };
  }

  if (ALLOWED_UNITS.indexOf(unit) < 0) {
    return { success: false, message: "Unit kerja tidak valid." };
  }

  if (ALLOWED_STATUS.indexOf(status) < 0) {
    return { success: false, message: "Status kehadiran tidak valid." };
  }

  if (!/^rsvp-[a-z0-9-]+$/i.test(idempotencyKey)) {
    return { success: false, message: "Idempotency key tidak valid." };
  }

  return {
    success: true,
    data: {
      name: name,
      phone: phone,
      unit: unit,
      status: status,
      eventDate: eventDate,
      idempotencyKey: idempotencyKey,
    },
  };
}
