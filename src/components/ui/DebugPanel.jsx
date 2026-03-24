import { useEffect, useRef } from "react";
import { useHealthCheck } from "../../hooks/useHealthCheck";
import { useToast } from "../../hooks/useToast";

const DEFAULT_ALERT_FAILURE_THRESHOLD = 3;
const DEFAULT_ALERT_COOLDOWN_MS = 120_000;

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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
  ok: { label: "✓ Sehat", className: "text-green-400" },
  degraded: { label: "! Melambat", className: "text-yellow-400" },
  error: { label: "✗ Gagal", className: "text-red-400" },
};

const STATUS_DOT_CLASS = {
  idle: "bg-gray-400",
  checking: "bg-yellow-400 animate-pulse",
  ok: "bg-green-400",
  degraded: "bg-yellow-400",
  error: "bg-red-500",
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
  const { addToast } = useToast();
  const {
    provider,
    isRemoteEnabled,
    status,
    lastChecked,
    lastSuccessAt,
    errorDetail,
    itemCount,
    latencyMs,
    failureCount,
    healthCheckIntervalMs,
    warnLatencyMs,
    check,
  } = useHealthCheck();
  const lastAlertAtRef = useRef(0);
  const hasActiveFailureAlertRef = useRef(false);

  const alertFailureThreshold = toPositiveNumber(
    import.meta.env.VITE_HEALTHCHECK_ALERT_FAILURE_THRESHOLD,
    DEFAULT_ALERT_FAILURE_THRESHOLD,
  );
  const alertCooldownMs = toPositiveNumber(
    import.meta.env.VITE_HEALTHCHECK_ALERT_COOLDOWN_MS,
    DEFAULT_ALERT_COOLDOWN_MS,
  );

  const statusCfg = STATUS_CONFIG[status];
  const statusDotClass = STATUS_DOT_CLASS[status] || STATUS_DOT_CLASS.idle;

  useEffect(() => {
    const now = Date.now();
    const isFailure =
      status === "error" && failureCount >= alertFailureThreshold;

    if (isFailure) {
      const cooldownPassed = now - lastAlertAtRef.current >= alertCooldownMs;
      if (cooldownPassed) {
        addToast(
          `Health check gagal ${failureCount}x beruntun (${provider}).`,
          "error",
          6000,
        );
        lastAlertAtRef.current = now;
      }
      hasActiveFailureAlertRef.current = true;
      return;
    }

    const isRecovered =
      hasActiveFailureAlertRef.current &&
      (status === "ok" || status === "degraded");

    if (isRecovered) {
      addToast("Koneksi server pulih kembali.", "success", 4000);
      hasActiveFailureAlertRef.current = false;
      lastAlertAtRef.current = now;
    }
  }, [
    addToast,
    alertCooldownMs,
    alertFailureThreshold,
    failureCount,
    provider,
    status,
  ]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-gray-950 border border-gray-700 rounded-xl text-xs font-mono shadow-2xl overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-800 flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${statusDotClass}`}
        />
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
        <Row
          label="Latensi"
          value={latencyMs !== null ? `${latencyMs} ms` : "—"}
          valueClass={
            latencyMs !== null && latencyMs > warnLatencyMs
              ? "text-yellow-400"
              : "text-green-400"
          }
        />

        {(status === "ok" || status === "degraded") && itemCount !== null && (
          <Row
            label="Total peserta"
            value={`${itemCount} orang`}
            valueClass="text-green-400"
          />
        )}

        <Row
          label="Gagal beruntun"
          value={String(failureCount)}
          valueClass={failureCount > 0 ? "text-red-400" : "text-green-400"}
        />

        {status === "error" && errorDetail && (
          <Row
            label="Detail error"
            value={errorDetail}
            valueClass="text-red-400"
          />
        )}

        <Row label="Dicek pada" value={formatTime(lastChecked)} />
        <Row label="Sukses terakhir" value={formatTime(lastSuccessAt)} />
        <Row
          label="Auto cek"
          value={`${Math.round(healthCheckIntervalMs / 1000)} detik`}
          valueClass="text-cyan-400"
        />
        <Row
          label="Alert saat gagal"
          value={`${alertFailureThreshold}x beruntun`}
          valueClass="text-orange-400"
        />

        <div className="pt-1">
          <button
            onClick={check}
            disabled={status === "checking"}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-white font-bold tracking-wide transition-colors"
          >
            {status === "checking" ? "Memeriksa..." : "Cek Sekarang"}
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
