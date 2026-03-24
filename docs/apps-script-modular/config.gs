const SHEET_NAME = "Data";
const AUDIT_SHEET_NAME = "AuditLog";
const BACKUP_PREFIX = "Backup_Data_";

// Security config
const API_TOKENS = [
  "TOKEN_AKTIF_V2",
  "TOKEN_AKTIF_V1", // sementara saat window rotasi token
];

const REVOKED_TOKENS = [
  // "TOKEN_BOCOR_ABC123",
];

const ALLOWED_CALLERS = ["undangan-hbh-web"];
const ALLOWED_ORIGINS = ["https://undangan.salkot.online"];

// Business config
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUEST_PER_WINDOW = 5;
const BACKUP_RETENTION_DAYS = 14;

const ALLOWED_UNITS = [
  "Back Office",
  "Billman",
  "MCB On",
  "P2TL",
  "ULP Salkot",
  "Yantek",
];

const ALLOWED_STATUS = ["Hadir", "Tidak Hadir"];
