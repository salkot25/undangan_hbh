function shouldLogDebug() {
  return (
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true"
  );
}

function getSinkName() {
  return (import.meta.env.VITE_OBSERVABILITY_SINK || "console").toLowerCase();
}

function normalizeContext(context) {
  if (!context || typeof context !== "object") return {};
  return context;
}

function emitConsole(payload) {
  if (payload.level === "error") {
    console.error("[app]", payload);
    return;
  }

  if (payload.level === "warn") {
    console.warn("[app]", payload);
    return;
  }

  if (shouldLogDebug()) {
    console.info("[app]", payload);
  }
}

function emitToWindowHook(payload) {
  if (typeof window === "undefined") return;
  const handler = window.__APP_OBSERVABILITY__;
  if (typeof handler !== "function") return;

  try {
    handler(payload);
  } catch {
    // Never allow telemetry sink to break app flow.
  }
}

function emit(level, event, context = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    context: normalizeContext(context),
  };

  const sink = getSinkName();
  if (sink === "window") {
    emitToWindowHook(payload);
    emitConsole(payload);
    return;
  }

  emitConsole(payload);
}

export function logInfo(event, context) {
  emit("info", event, context);
}

export function logWarn(event, context) {
  emit("warn", event, context);
}

export function logError(event, context) {
  emit("error", event, context);
}
