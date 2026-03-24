function ensureAuditSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(AUDIT_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(AUDIT_SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Event",
      "Status",
      "Detail",
      "CallerId",
      "Origin",
      "TokenHash",
    ]);
  }

  return sheet;
}

function writeAuditLog_(eventName, status, detail, callerId, origin, token) {
  try {
    const sheet = ensureAuditSheet_();
    sheet.appendRow([
      new Date().toISOString(),
      sanitizeField_(eventName, 80),
      sanitizeField_(status, 40),
      sanitizeField_(detail, 300),
      sanitizeField_(callerId, 80),
      sanitizeField_(origin, 160),
      token ? shortHash_(token) : "",
    ]);
  } catch (_err) {
    // Do not block main flow if audit logging fails.
  }
}
