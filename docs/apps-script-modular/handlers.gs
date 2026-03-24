function doGet(e) {
  try {
    ensureDataSheet_();
    const auth = authorizeRequest_(e, "GET");
    if (!auth.allowed) return jsonResponse_(auth.response);

    const action = sanitizeField_(param_(e, "action"), 40);
    if (!action || action === "getAttendees") {
      return handleGetAttendees_();
    }

    if (action === "health") {
      return jsonResponse_({
        success: true,
        message: "ok",
        timestamp: new Date().toISOString(),
      });
    }

    return jsonResponse_({
      success: false,
      code: "BAD_REQUEST",
      message: "Action tidak dikenal.",
    });
  } catch (error) {
    writeAuditLog_("server", "error", String(error), "", "", "");
    return jsonResponse_({
      success: false,
      code: "SERVER_ERROR",
      message: "Terjadi kesalahan internal.",
    });
  }
}

function doPost(e) {
  try {
    ensureDataSheet_();
    const auth = authorizeRequest_(e, "POST");
    if (!auth.allowed) return jsonResponse_(auth.response);

    const action = sanitizeField_(param_(e, "action"), 40);
    if (action !== "submitRsvp") {
      return jsonResponse_({
        success: false,
        code: "BAD_REQUEST",
        message: "Action tidak valid untuk POST.",
      });
    }

    const rateKey = buildRateKey_(auth.callerId, auth.origin);
    if (!checkRateLimit_(rateKey)) {
      writeAuditLog_(
        "rate-limit",
        "rejected",
        "too_many_requests",
        auth.callerId,
        auth.origin,
        auth.token,
      );
      return jsonResponse_({
        success: false,
        code: "RATE_LIMIT",
        message: "Terlalu banyak percobaan, coba beberapa saat lagi.",
      });
    }

    const payloadResult = sanitizeAndValidatePayload_(e);
    if (!payloadResult.success) {
      writeAuditLog_(
        "payload",
        "rejected",
        payloadResult.message,
        auth.callerId,
        auth.origin,
        auth.token,
      );
      return jsonResponse_({
        success: false,
        code: "VALIDATION_ERROR",
        message: payloadResult.message,
      });
    }

    const payload = payloadResult.data;
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      if (isDuplicateRsvp_(sheet, payload)) {
        writeAuditLog_(
          "duplicate",
          "rejected",
          payload.idempotencyKey || payload.eventDate + "|" + payload.phone,
          auth.callerId,
          auth.origin,
          auth.token,
        );
        return jsonResponse_({
          success: false,
          code: "DUPLICATE_RSVP",
          message: "Data RSVP terdeteksi duplikat untuk event ini.",
        });
      }

      const id = Utilities.getUuid();
      const timestamp = new Date().toISOString();

      sheet.appendRow([
        id,
        timestamp,
        payload.name,
        "'" + payload.phone,
        payload.unit,
        payload.status,
        payload.eventDate,
        payload.idempotencyKey,
      ]);

      return jsonResponse_({
        success: true,
        message: "Data RSVP berhasil masuk ke Google Sheets!",
      });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    writeAuditLog_("server", "error", String(error), "", "", "");
    return jsonResponse_({
      success: false,
      code: "SERVER_ERROR",
      message: "Gagal menyimpan data.",
    });
  }
}

function handleGetAttendees_() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  const result = [];
  for (let i = 1; i < values.length; i++) {
    result.push({
      id: values[i][0] || i,
      timestamp: values[i][1] || "",
      name: values[i][2] || "",
      phone: String(values[i][3] || "").replace(/^'/, ""),
      unit: values[i][4] || "",
      status: values[i][5] || "",
      eventDate: values[i][6] || "",
      idempotencyKey: values[i][7] || "",
    });
  }

  return jsonResponse_({
    success: true,
    data: result.reverse(),
  });
}
