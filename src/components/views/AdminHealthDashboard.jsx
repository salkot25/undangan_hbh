import { useMemo, useState } from "react";
import {
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Trash2,
  Upload,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";
import { useHealthCheck } from "../../hooks/useHealthCheck";
import { useToast } from "../../hooks/useToast";
import { submitRsvp, EVENT_CONFIG } from "../../utils/api";

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

function trendBucketTone(rate) {
  if (rate >= 95) return "bg-green/80";
  if (rate >= 70) return "bg-pln-yellow/80";
  return "bg-red/80";
}

function parseCsvLine(line) {
  const output = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuote = !inQuote;
      }
      continue;
    }

    if (char === "," && !inQuote) {
      output.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  output.push(current.trim());
  return output;
}

function parseFallbackCsv(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const firstRow = parseCsvLine(lines[0]).map((item) => item.toLowerCase());
  const hasHeader =
    firstRow.includes("name") ||
    firstRow.includes("nama") ||
    firstRow.includes("phone") ||
    firstRow.includes("nomor_hp");

  const rows = hasHeader ? lines.slice(1) : lines;
  const getIndex = (variants, fallbackIndex) => {
    const idx = firstRow.findIndex((value) => variants.includes(value));
    return idx >= 0 ? idx : fallbackIndex;
  };

  const nameIdx = getIndex(["name", "nama"], 0);
  const phoneIdx = getIndex(["phone", "no hp", "nomor hp", "nomor_hp"], 1);
  const unitIdx = getIndex(["unit", "unit kerja", "unit_kerja"], 2);
  const statusIdx = getIndex(["status"], 3);

  return rows.map((line) => {
    const cols = parseCsvLine(line);
    return {
      name: cols[nameIdx] || "",
      phone: cols[phoneIdx] || "",
      unit: cols[unitIdx] || "",
      status: cols[statusIdx] || "Hadir",
    };
  });
}

function buildLast24HourTrend(history) {
  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, idx) => {
    const start = now - (23 - idx) * 60 * 60 * 1000;
    return {
      label: `${String(new Date(start).getHours()).padStart(2, "0")}:00`,
      start,
      end: start + 60 * 60 * 1000,
      total: 0,
      success: 0,
    };
  });

  history.forEach((item) => {
    const ts = new Date(item.checkedAt).getTime();
    if (!Number.isFinite(ts)) return;
    if (ts < now - 24 * 60 * 60 * 1000 || ts > now) return;

    const idx = Math.min(
      23,
      Math.max(
        0,
        Math.floor((ts - (now - 24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
      ),
    );
    const bucket = buckets[idx];
    bucket.total += 1;
    if (item.success) bucket.success += 1;
  });

  return buckets.map((bucket) => ({
    ...bucket,
    successRate: bucket.total
      ? Math.round((bucket.success / bucket.total) * 100)
      : 0,
  }));
}

export default function AdminHealthDashboard() {
  const { addToast } = useToast();
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
    dailySummary,
    clearHistory,
    check,
  } = useHealthCheck();
  const [manualForm, setManualForm] = useState({
    name: "",
    phone: "",
    unit: EVENT_CONFIG.units[0] || "",
    status: "Hadir",
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

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

  const trend24h = useMemo(() => buildLast24HourTrend(history), [history]);

  async function handleManualInputSubmit(event) {
    event.preventDefault();
    setManualLoading(true);
    try {
      const result = await submitRsvp(manualForm);
      if (result.success) {
        addToast("Input manual berhasil disimpan.", "success");
        setManualForm((prev) => ({ ...prev, name: "", phone: "" }));
      } else {
        addToast(result.message || "Input manual gagal.", "error");
      }
    } catch {
      addToast("Input manual gagal karena gangguan jaringan.", "error");
    } finally {
      setManualLoading(false);
    }
  }

  async function handleCsvImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    try {
      const text = await file.text();
      const rows = parseFallbackCsv(text).filter(
        (row) => row.name || row.phone || row.unit,
      );

      if (!rows.length) {
        addToast("CSV kosong atau format tidak dikenali.", "error");
        return;
      }

      let success = 0;
      let failed = 0;
      for (const row of rows) {
        const result = await submitRsvp(row);
        if (result.success) {
          success += 1;
        } else {
          failed += 1;
        }
      }

      if (failed === 0) {
        addToast(`Import CSV sukses: ${success} data.`, "success", 4500);
      } else {
        addToast(
          `Import selesai: ${success} sukses, ${failed} gagal.`,
          "info",
          5000,
        );
      }
    } catch {
      addToast("Gagal membaca file CSV.", "error");
    } finally {
      setCsvLoading(false);
      event.target.value = "";
    }
  }

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

        <div className="mt-8 rounded-2xl border border-line bg-paper-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">Tren 24 Jam</h2>
            <p className="text-xs text-ink-faint">Per jam (success rate)</p>
          </div>

          <div className="grid grid-cols-12 md:grid-cols-24 gap-1.5">
            {trend24h.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full min-h-8 rounded ${trendBucketTone(item.successRate)}`}
                  style={{
                    height: `${Math.max(18, Math.round(item.successRate * 0.8))}px`,
                  }}
                  title={`${item.label} • ${item.successRate}% • ${item.success}/${item.total}`}
                />
                <span className="text-[10px] text-ink-faint">
                  {item.label.slice(0, 2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-paper-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">Ringkasan Harian</h2>
            <p className="text-xs text-ink-faint">
              Uptime, latensi rata-rata, dan max streak
            </p>
          </div>

          {dailySummary.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Belum ada ringkasan harian.
            </p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Tanggal
                    </th>
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Uptime
                    </th>
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Avg Latency
                    </th>
                    <th className="py-2 pr-3 text-xs uppercase tracking-wide text-ink-faint">
                      Max Failure Streak
                    </th>
                    <th className="py-2 text-xs uppercase tracking-wide text-ink-faint">
                      Checks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailySummary.slice(0, 14).map((item) => (
                    <tr
                      key={item.date}
                      className="border-b border-line-light last:border-0"
                    >
                      <td className="py-2 pr-3 text-ink-muted">{item.date}</td>
                      <td className="py-2 pr-3 text-ink-muted">
                        {item.uptimePct}%
                      </td>
                      <td className="py-2 pr-3 text-ink-muted">
                        {item.avgLatencyMs !== null
                          ? `${item.avgLatencyMs} ms`
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 text-ink-muted">
                        {item.maxFailureStreak}
                      </td>
                      <td className="py-2 text-ink-muted">
                        {item.totalChecks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-paper-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">
              Fallback Mode Panitia
            </h2>
            <p className="text-xs text-ink-faint">
              Input manual dan import CSV saat gangguan
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <form
              onSubmit={handleManualInputSubmit}
              className="space-y-3 border border-line rounded-xl p-4 bg-paper-warm/50"
            >
              <p className="text-sm font-bold text-ink inline-flex items-center gap-2">
                <UserPlus size={16} />
                Input Manual
              </p>

              <input
                value={manualForm.name}
                onChange={(event) =>
                  setManualForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="w-full h-11 rounded-lg border border-line bg-paper-white px-3 text-sm"
                placeholder="Nama"
              />
              <input
                value={manualForm.phone}
                onChange={(event) =>
                  setManualForm((prev) => ({
                    ...prev,
                    phone: event.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                className="w-full h-11 rounded-lg border border-line bg-paper-white px-3 text-sm"
                placeholder="Nomor HP"
              />
              <select
                value={manualForm.unit}
                onChange={(event) =>
                  setManualForm((prev) => ({
                    ...prev,
                    unit: event.target.value,
                  }))
                }
                className="w-full h-11 rounded-lg border border-line bg-paper-white px-3 text-sm"
              >
                {EVENT_CONFIG.units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <select
                value={manualForm.status}
                onChange={(event) =>
                  setManualForm((prev) => ({
                    ...prev,
                    status: event.target.value,
                  }))
                }
                className="w-full h-11 rounded-lg border border-line bg-paper-white px-3 text-sm"
              >
                <option value="Hadir">Hadir</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
              </select>

              <button
                type="submit"
                disabled={manualLoading}
                className="h-11 px-4 rounded-lg bg-accent text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <UserPlus size={14} />
                {manualLoading ? "Menyimpan..." : "Simpan Input Manual"}
              </button>
            </form>

            <div className="space-y-3 border border-line rounded-xl p-4 bg-paper-warm/50">
              <p className="text-sm font-bold text-ink inline-flex items-center gap-2">
                <FileSpreadsheet size={16} />
                Import CSV
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                Format kolom: <strong>name,phone,unit,status</strong>. Header
                boleh ada atau tidak.
              </p>

              <label className="h-11 px-4 rounded-lg border border-line bg-paper-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-paper">
                <Upload size={14} />
                {csvLoading ? "Memproses CSV..." : "Pilih File CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvImport}
                  className="hidden"
                  disabled={csvLoading}
                />
              </label>

              <div className="text-xs text-ink-faint bg-paper-white border border-line rounded-lg p-3">
                Contoh baris:
                <br />
                Budi Santoso,081234567890,Yantek,Hadir
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
