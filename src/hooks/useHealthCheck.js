import { useState, useCallback, useEffect } from "react";
import { createApiAdapter } from "../utils/api";

// Singleton adapter — dibuat sekali saat modul dimuat
const adapter = createApiAdapter();
const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_WARN_LATENCY_MS = 1_500;
const HEALTH_HISTORY_KEY = "hbh_health_history_v1";
const HEALTH_DAILY_SUMMARY_KEY = "hbh_health_daily_summary_v1";
const MAX_HISTORY_ITEMS = 2_000;
const MAX_DAILY_SUMMARY_ITEMS = 45;

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toDateKey(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
}

function computeMaxFailureStreak(items) {
  let maxStreak = 0;
  let current = 0;

  items.forEach((item) => {
    if (item.status === "error") {
      current += 1;
      if (current > maxStreak) {
        maxStreak = current;
      }
    } else {
      current = 0;
    }
  });

  return maxStreak;
}

function buildDailySummaries(history) {
  const groups = new Map();

  history.forEach((item) => {
    const dateKey = toDateKey(item.checkedAt);
    if (dateKey === "unknown") return;

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey).push(item);
  });

  return Array.from(groups.entries())
    .map(([date, items]) => {
      const chronologicalItems = [...items].sort(
        (a, b) => new Date(a.checkedAt) - new Date(b.checkedAt),
      );
      const successItems = chronologicalItems.filter((item) => item.success);
      const latencyValues = successItems
        .map((item) => item.latencyMs)
        .filter((value) => Number.isFinite(value));
      const avgLatencyMs = latencyValues.length
        ? Math.round(
            latencyValues.reduce((total, value) => total + value, 0) /
              latencyValues.length,
          )
        : null;

      return {
        date,
        totalChecks: chronologicalItems.length,
        successCount: successItems.length,
        uptimePct: chronologicalItems.length
          ? Math.round((successItems.length / chronologicalItems.length) * 100)
          : 0,
        avgLatencyMs,
        maxFailureStreak: computeMaxFailureStreak(chronologicalItems),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_DAILY_SUMMARY_ITEMS);
}

export function useHealthCheck() {
  const [status, setStatus] = useState("idle"); // idle | checking | ok | degraded | error
  const [lastChecked, setLastChecked] = useState(null);
  const [lastSuccessAt, setLastSuccessAt] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [itemCount, setItemCount] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [failureCount, setFailureCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HEALTH_HISTORY_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      setHistory(parsed);
    } catch {
      // Ignore malformed storage payloads
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HEALTH_DAILY_SUMMARY_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      setDailySummary(parsed);
    } catch {
      // Ignore malformed storage payloads
    }
  }, []);

  useEffect(() => {
    try {
      if (!history.length) {
        window.localStorage.removeItem(HEALTH_HISTORY_KEY);
      } else {
        window.localStorage.setItem(
          HEALTH_HISTORY_KEY,
          JSON.stringify(history),
        );
      }
    } catch {
      // Ignore storage failures in private mode/quota issues
    }
  }, [history]);

  useEffect(() => {
    if (!history.length) {
      setDailySummary([]);
      try {
        window.localStorage.removeItem(HEALTH_DAILY_SUMMARY_KEY);
      } catch {
        // Ignore storage failures
      }
      return;
    }

    const nextSummary = buildDailySummaries(history);
    setDailySummary(nextSummary);

    try {
      window.localStorage.setItem(
        HEALTH_DAILY_SUMMARY_KEY,
        JSON.stringify(nextSummary),
      );
    } catch {
      // Ignore storage failures in private mode/quota issues
    }
  }, [history]);

  const healthCheckIntervalMs = toPositiveNumber(
    import.meta.env.VITE_HEALTHCHECK_INTERVAL_MS,
    DEFAULT_INTERVAL_MS,
  );
  const warnLatencyMs = toPositiveNumber(
    import.meta.env.VITE_HEALTHCHECK_WARN_LATENCY_MS,
    DEFAULT_WARN_LATENCY_MS,
  );

  const check = useCallback(
    async (options = {}) => {
      const isBackground = options.background === true;

      if (!isBackground) {
        setStatus("checking");
      }
      setErrorDetail(null);
      const startedAt = performance.now();

      try {
        const result = await adapter.getAttendance({ page: 1, search: "" });
        const elapsed = Math.round(performance.now() - startedAt);
        setLatencyMs(elapsed);

        const checkedAt = new Date();

        if (result.success) {
          const nextStatus = elapsed > warnLatencyMs ? "degraded" : "ok";
          setStatus(nextStatus);
          setItemCount(result.totalItems);
          setLastSuccessAt(checkedAt);
          setFailureCount(0);
          setHistory((prev) => {
            const next = [
              {
                checkedAt: checkedAt.toISOString(),
                status: nextStatus,
                latencyMs: elapsed,
                success: true,
              },
              ...prev,
            ].slice(0, MAX_HISTORY_ITEMS);
            return next;
          });
        } else {
          setStatus("error");
          setFailureCount((current) => current + 1);
          setErrorDetail("Response tidak valid dari server");
          setHistory((prev) => {
            const next = [
              {
                checkedAt: checkedAt.toISOString(),
                status: "error",
                latencyMs: elapsed,
                success: false,
                error: "Response tidak valid dari server",
              },
              ...prev,
            ].slice(0, MAX_HISTORY_ITEMS);
            return next;
          });
        }
      } catch (e) {
        const checkedAt = new Date();
        setStatus("error");
        setFailureCount((current) => current + 1);
        setErrorDetail(e?.message || "Unknown error");
        setHistory((prev) => {
          const next = [
            {
              checkedAt: checkedAt.toISOString(),
              status: "error",
              latencyMs: null,
              success: false,
              error: e?.message || "Unknown error",
            },
            ...prev,
          ].slice(0, MAX_HISTORY_ITEMS);
          return next;
        });
      }

      setLastChecked(new Date());
    },
    [warnLatencyMs],
  );

  useEffect(() => {
    const initialTimerId = setTimeout(() => {
      check({ background: true });
    }, 0);

    const timerId = setInterval(() => {
      check({ background: true });
    }, healthCheckIntervalMs);

    return () => {
      clearTimeout(initialTimerId);
      clearInterval(timerId);
    };
  }, [check, healthCheckIntervalMs]);

  return {
    provider: adapter.provider,
    isRemoteEnabled: adapter.isRemoteEnabled,
    status,
    lastChecked,
    lastSuccessAt,
    errorDetail,
    itemCount,
    latencyMs,
    failureCount,
    history,
    dailySummary,
    healthCheckIntervalMs,
    warnLatencyMs,
    clearHistory: () => {
      setHistory([]);
      setDailySummary([]);
      try {
        window.localStorage.removeItem(HEALTH_HISTORY_KEY);
        window.localStorage.removeItem(HEALTH_DAILY_SUMMARY_KEY);
      } catch {
        // Ignore storage failures
      }
    },
    check,
  };
}
