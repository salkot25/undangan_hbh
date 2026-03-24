import { useState, useCallback, useEffect } from "react";
import { createApiAdapter } from "../utils/api";

// Singleton adapter — dibuat sekali saat modul dimuat
const adapter = createApiAdapter();
const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_WARN_LATENCY_MS = 1_500;
const HEALTH_HISTORY_KEY = "hbh_health_history_v1";
const MAX_HISTORY_ITEMS = 50;

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
    if (!history.length) return;
    try {
      window.localStorage.setItem(HEALTH_HISTORY_KEY, JSON.stringify(history));
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
    healthCheckIntervalMs,
    warnLatencyMs,
    clearHistory: () => {
      setHistory([]);
      try {
        window.localStorage.removeItem(HEALTH_HISTORY_KEY);
      } catch {
        // Ignore storage failures
      }
    },
    check,
  };
}
