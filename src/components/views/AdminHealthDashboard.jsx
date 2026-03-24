import { useMemo } from "react";
import {
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Trash2,
} from "lucide-react";
import { useHealthCheck } from "../../hooks/useHealthCheck";

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatClock(date) {
  if (!date) return "—";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function statusTone(status) {
  if (status === "ok") return "text-green bg-green/10 border-green/20";
  if (status === "degraded")
    return "text-pln-yellow bg-pln-yellow/10 border-pln-yellow/20";
  if (status === "error") return "text-red bg-red/10 border-red/20";
  if (status === "checking") return "text-accent bg-accent/10 border-accent/20";
  return "text-ink-faint bg-paper border-line";
}

export default function AdminHealthDashboard() {
  const {
    provider,
    isRemoteEnabled,
    status,
    lastChecked,
    lastSuccessAt,
    errorDetail,
    latencyMs,
    failureCount,
    healthCheckIntervalMs,
    history,
    clearHistory,
    check,
  } = useHealthCheck();

  const metrics = useMemo(() => {
    if (!history.length) {
      return {
        uptimePct: 0,
        avgLatency: null,
        successCount: 0,
      };
    }

    const successItems = history.filter((item) => item.success);
    const uptimePct = Math.round((successItems.length / history.length) * 100);
    const latencyValues = successItems
      .map((item) => item.latencyMs)
      .filter((value) => Number.isFinite(value));
    const avgLatency = latencyValues.length
      ? Math.round(
          latencyValues.reduce((total, value) => total + value, 0) /
            latencyValues.length,
        )
      : null;

    return {
      uptimePct,
      avgLatency,
      successCount: successItems.length,
    };
  }, [history]);

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint mb-3">
              Admin Monitoring
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Release Health Dashboard
            </h1>
            <p className="text-sm text-ink-muted mt-2">
              Pantau status runtime produksi tanpa harus membuka GitHub Actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => check()}
              className="h-11 px-4 rounded-xl bg-accent text-white text-sm font-bold inline-flex items-center gap-2 hover:bg-accent-dark transition-colors"
            >
              <RefreshCw size={16} />
              Cek Sekarang
            </button>
            <button
              onClick={clearHistory}
              className="h-11 px-4 rounded-xl border border-line bg-paper-white text-ink-muted text-sm font-semibold inline-flex items-center gap-2 hover:bg-paper-warm transition-colors"
            >
              <Trash2 size={16} />
              Reset Histori
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-line bg-paper-white p-5">
            <p className="text-xs uppercase tracking-wider text-ink-faint font-bold mb-2">
              Status
            </p>
            <span
              className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-bold ${statusTone(status)}`}
            >
              {status.toUpperCase()}
            </span>
            <p className="text-xs text-ink-faint mt-2">
              Dicek: {formatClock(lastChecked)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper-white p-5">
            <p className="text-xs uppercase tracking-wider text-ink-faint font-bold mb-2">
              Runtime
            </p>
            <p className="text-lg font-extrabold text-ink">
              {metrics.uptimePct}%
            </p>
            <p className="text-xs text-ink-faint">
              Uptime dari {history.length} sampel terakhir
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper-white p-5">
            <p className="text-xs uppercase tracking-wider text-ink-faint font-bold mb-2">
              Latensi
            </p>
            <p className="text-lg font-extrabold text-ink">
              {latencyMs !== null ? `${latencyMs} ms` : "—"}
            </p>
            <p className="text-xs text-ink-faint">
              Rata-rata:{" "}
              {metrics.avgLatency !== null ? `${metrics.avgLatency} ms` : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper-white p-5">
            <p className="text-xs uppercase tracking-wider text-ink-faint font-bold mb-2">
              Endpoint
            </p>
            <p className="text-sm font-bold text-ink">{provider}</p>
            <p
              className={`text-xs mt-1 ${isRemoteEnabled ? "text-green" : "text-red"}`}
            >
              {isRemoteEnabled ? "Remote aktif" : "Mock aktif"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-line bg-paper-white p-5 flex items-start gap-3">
            <ShieldCheck className="text-green mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-ink">Sukses Terakhir</p>
              <p className="text-sm text-ink-muted mt-1">
                {formatClock(lastSuccessAt)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper-white p-5 flex items-start gap-3">
            <AlertTriangle className="text-red mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-ink">Failure Streak</p>
              <p className="text-sm text-ink-muted mt-1">
                {failureCount} kali beruntun
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper-white p-5 flex items-start gap-3">
            <Activity className="text-accent mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-ink">Interval Check</p>
              <p className="text-sm text-ink-muted mt-1">
                {Math.round(healthCheckIntervalMs / 1000)} detik
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">Riwayat Health Check</h2>
            <p className="text-xs text-ink-faint">
              {history.length} item tersimpan
            </p>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-ink-muted">Belum ada histori check.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Waktu
                    </th>
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Status
                    </th>
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Latensi
                    </th>
                    <th className="py-2 text-xs uppercase tracking-wide text-ink-faint">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 20).map((item, idx) => (
                    <tr
                      key={`${item.checkedAt}-${idx}`}
                      className="border-b border-line-light last:border-0"
                    >
                      <td className="py-2 pr-3 text-ink-muted">
                        {formatDateTime(item.checkedAt)}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${statusTone(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-ink-muted">
                        {item.latencyMs !== null && item.latencyMs !== undefined
                          ? `${item.latencyMs} ms`
                          : "—"}
                      </td>
                      <td className="py-2 text-ink-muted">
                        {item.error || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {errorDetail ? (
            <p className="mt-4 text-sm text-red">Error aktif: {errorDetail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
