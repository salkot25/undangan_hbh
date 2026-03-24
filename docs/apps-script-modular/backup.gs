function runDailyBackup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName(SHEET_NAME);
  if (!source) throw new Error("Sheet Data tidak ditemukan.");

  const tz = Session.getScriptTimeZone() || "Asia/Jakarta";
  const dateLabel = Utilities.formatDate(new Date(), tz, "yyyyMMdd");
  const backupName = BACKUP_PREFIX + dateLabel;

  const existing = ss.getSheetByName(backupName);
  if (existing) ss.deleteSheet(existing);

  const backup = source.copyTo(ss).setName(backupName);
  backup.getDataRange().copyTo(backup.getDataRange(), { contentsOnly: true });

  cleanupOldBackups_();
}

function cleanupOldBackups_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const now = new Date();

  allSheets.forEach(function (sheet) {
    const name = sheet.getName();
    if (name.indexOf(BACKUP_PREFIX) !== 0) return;

    const datePart = name.replace(BACKUP_PREFIX, "");
    if (!/^\d{8}$/.test(datePart)) return;

    const year = Number(datePart.slice(0, 4));
    const month = Number(datePart.slice(4, 6)) - 1;
    const day = Number(datePart.slice(6, 8));
    const backupDate = new Date(year, month, day);
    const ageDays = Math.floor((now - backupDate) / (24 * 60 * 60 * 1000));

    if (ageDays > BACKUP_RETENTION_DAYS) {
      ss.deleteSheet(sheet);
    }
  });
}

function installDailyBackupTrigger_() {
  const functionName = "runDailyBackup_";
  const existing = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === functionName;
  });

  if (existing.length > 0) return;

  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
}

function removeDailyBackupTriggers_() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === "runDailyBackup_") {
      ScriptApp.deleteTrigger(t);
    }
  });
}
