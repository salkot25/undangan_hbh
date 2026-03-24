function buildRateKey_(callerId, origin) {
  const ipKey = getClientIp_();
  return [ipKey, callerId, origin].join("|");
}

function checkRateLimit_(key) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "rate:" + key;
  const now = Date.now();
  const raw = cache.get(cacheKey);

  let state = { count: 0, startAt: now };
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (_err) {
      state = { count: 0, startAt: now };
    }
  }

  if (now - state.startAt > RATE_LIMIT_WINDOW_MS) {
    state = { count: 0, startAt: now };
  }

  state.count += 1;
  cache.put(
    cacheKey,
    JSON.stringify(state),
    Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  );

  return state.count <= MAX_REQUEST_PER_WINDOW;
}
