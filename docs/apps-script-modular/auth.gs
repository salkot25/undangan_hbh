function getToken_(e) {
  return sanitizeField_(param_(e, "token"), 220);
}

function isTokenAllowed_(token) {
  if (!token) return false;
  if (REVOKED_TOKENS.indexOf(token) >= 0) return false;
  return API_TOKENS.indexOf(token) >= 0;
}

function isCallerAllowed_(callerId, origin) {
  if (!callerId || !origin) return false;
  if (ALLOWED_CALLERS.indexOf(callerId) < 0) return false;
  if (ALLOWED_ORIGINS.indexOf(origin) < 0) return false;
  return true;
}

function authorizeRequest_(e, method) {
  const token = getToken_(e);
  const callerId = sanitizeField_(param_(e, "callerId"), 80);
  const origin = sanitizeField_(param_(e, "origin"), 160);

  if (!isTokenAllowed_(token)) {
    writeAuditLog_(
      "auth",
      "rejected",
      "unauthorized_token",
      callerId,
      origin,
      token,
    );
    return {
      allowed: false,
      response: {
        success: false,
        code: "UNAUTHORIZED",
        message: "Token tidak valid.",
      },
    };
  }

  if (!isCallerAllowed_(callerId, origin)) {
    writeAuditLog_(
      "caller",
      "rejected",
      "forbidden_caller_or_origin",
      callerId,
      origin,
      token,
    );
    return {
      allowed: false,
      response: {
        success: false,
        code: "FORBIDDEN_CALLER",
        message: "Caller atau origin tidak diizinkan.",
      },
    };
  }

  return {
    allowed: true,
    token: token,
    callerId: callerId,
    origin: origin,
    method: method,
  };
}
