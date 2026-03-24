function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function param_(e, key) {
  if (!e) return "";

  if (e.parameter && Object.prototype.hasOwnProperty.call(e.parameter, key)) {
    return e.parameter[key];
  }

  if (
    e.parameters &&
    Object.prototype.hasOwnProperty.call(e.parameters, key) &&
    e.parameters[key] &&
    e.parameters[key][0]
  ) {
    return e.parameters[key][0];
  }

  return "";
}

function sanitizeField_(value, maxLen) {
  return String(value || "")
    .replace(/[<>\"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen || 120);
}

function normalizePhone_(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 15);
}

function normalizeName_(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getClientIp_() {
  try {
    if (Session.getTemporaryActiveUserKey) {
      return Session.getTemporaryActiveUserKey() || "anonymous";
    }
  } catch (_err) {
    // ignore
  }
  return "anonymous";
}

function shortHash_(value) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8,
  );

  const hex = digest
    .map(function (b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? "0" + v : v;
    })
    .join("");

  return hex.slice(0, 16);
}

function ensureDataSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = ss.getSheetByName(SHEET_NAME);

  if (!dataSheet) {
    dataSheet = ss.insertSheet(SHEET_NAME);
    dataSheet.appendRow([
      "ID",
      "Timestamp",
      "Nama",
      "Phone",
      "Unit",
      "Status",
      "EventDate",
      "IdempotencyKey",
    ]);
  }
}
