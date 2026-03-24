import { useHealthCheck } from "../../hooks/useHealthCheck";

function formatTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const STATUS_CONFIG = {
  idle: { label: "Belum dicek", className: "text-gray-400" },
  checking: {
    label: "Memeriksa...",
    className: "text-yellow-400 animate-pulse",
  },
  ok: { label: "✓ Terhubung", className: "text-green-400" },
  error: { label: "✗ Gagal", className: "text-red-400" },
};

function Row({ label, value, valueClass = "text-white" }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`truncate text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function DebugPanel() {
  const {
    provider,
    isRemoteEnabled,
    status,
    lastChecked,
    errorDetail,
    itemCount,
    check,
  } = useHealthCheck();

  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-gray-950 border border-gray-700 rounded-xl text-xs font-mono shadow-2xl overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-800 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
        <span className="text-yellow-400 font-bold tracking-widest uppercase">
          Debug Panel
        </span>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2 text-gray-300">
        <Row label="Provider" value={provider} />
        <Row
          label="Mode"
          value={isRemoteEnabled ? "Remote" : "Mock (offline)"}
          valueClass={isRemoteEnabled ? "text-green-400" : "text-orange-400"}
        />
        <Row
          label="Koneksi"
          value={statusCfg.label}
          valueClass={statusCfg.className}
        />

        {status === "ok" && itemCount !== null && (
          <Row
            label="Total peserta"
            value={`${itemCount} orang`}
            valueClass="text-green-400"
          />
        )}

        {status === "error" && errorDetail && (
          <Row
            label="Detail error"
            value={errorDetail}
            valueClass="text-red-400"
          />
        )}

        <Row label="Dicek pada" value={formatTime(lastChecked)} />

        <div className="pt-1">
          <button
            onClick={check}
            disabled={status === "checking"}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-white font-bold tracking-wide transition-colors"
          >
            {status === "checking" ? "Memeriksa..." : "Cek Koneksi"}
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-gray-900 text-gray-600 text-center">
        Akses via <span className="text-gray-400">?debug=1</span>
      </div>
    </div>
  );
}
