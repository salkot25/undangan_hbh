import { useState, useCallback } from "react";
import { createApiAdapter } from "../utils/api";

// Singleton adapter — dibuat sekali saat modul dimuat
const adapter = createApiAdapter();

export function useHealthCheck() {
  const [status, setStatus] = useState("idle"); // idle | checking | ok | error
  const [lastChecked, setLastChecked] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [itemCount, setItemCount] = useState(null);

  const check = useCallback(async () => {
    setStatus("checking");
    setErrorDetail(null);
    try {
      const result = await adapter.getAttendance({ page: 1, search: "" });
      if (result.success) {
        setStatus("ok");
        setItemCount(result.totalItems);
      } else {
        setStatus("error");
        setErrorDetail("Response tidak valid dari server");
      }
    } catch (e) {
      setStatus("error");
      setErrorDetail(e?.message || "Unknown error");
    }
    setLastChecked(new Date());
  }, []);

  return {
    provider: adapter.provider,
    isRemoteEnabled: adapter.isRemoteEnabled,
    status,
    lastChecked,
    errorDetail,
    itemCount,
    check,
  };
}
