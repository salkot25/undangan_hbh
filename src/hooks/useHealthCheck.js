import { useState, useCallback, useEffect } from "react";
import { createApiAdapter } from "../utils/api";

// Singleton adapter — dibuat sekali saat modul dimuat
const adapter = createApiAdapter();
const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_WARN_LATENCY_MS = 1_500;

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

        if (result.success) {
          setStatus(elapsed > warnLatencyMs ? "degraded" : "ok");
          setItemCount(result.totalItems);
          setLastSuccessAt(new Date());
          setFailureCount(0);
        } else {
          setStatus("error");
          setFailureCount((current) => current + 1);
          setErrorDetail("Response tidak valid dari server");
        }
      } catch (e) {
        setStatus("error");
        setFailureCount((current) => current + 1);
        setErrorDetail(e?.message || "Unknown error");
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
    healthCheckIntervalMs,
    warnLatencyMs,
    check,
  };
}
