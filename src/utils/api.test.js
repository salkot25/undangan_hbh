import { describe, it, expect, vi } from "vitest";
import { createApiAdapter } from "./api";

function createSilentLogger() {
  return {
    warn: () => {},
    error: () => {},
  };
}

describe("api adapter contracts", () => {
  it("rejects RSVP when required field is missing", async () => {
    const api = createApiAdapter({
      env: {},
      fetchImpl: vi.fn(),
      logger: createSilentLogger(),
    });

    const result = await api.submitRsvp({
      name: "",
      phone: "081234567890",
      unit: "Yantek",
      status: "Hadir",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/wajib diisi/i);
  });

  it("uses mock backend when endpoint host is not allowlisted", async () => {
    const fetchSpy = vi.fn();
    const api = createApiAdapter({
      env: {
        VITE_GOOGLE_SHEETS_URL: "https://evil.example.com/exec",
        VITE_API_ALLOWED_HOSTS: "script.google.com",
      },
      fetchImpl: fetchSpy,
      logger: createSilentLogger(),
    });

    const result = await api.getAttendance({ page: 1, search: "" });

    expect(api.isRemoteEnabled).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it("rejects tampered payload when unit is invalid", async () => {
    const api = createApiAdapter({
      env: {},
      fetchImpl: vi.fn(),
      logger: createSilentLogger(),
    });

    const result = await api.submitRsvp({
      name: "Budi Santoso",
      phone: "081234567890",
      unit: "DROP TABLE users",
      status: "Hadir",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/unit kerja tidak valid/i);
  });

  it("returns network error when remote submit fails", async () => {
    const api = createApiAdapter({
      env: {
        VITE_GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/test/exec",
      },
      fetchImpl: vi.fn().mockRejectedValue(new Error("network down")),
      logger: createSilentLogger(),
    });

    const result = await api.submitRsvp({
      name: "Budi Santoso",
      phone: "081234567890",
      unit: "Yantek",
      status: "Hadir",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/kesalahan jaringan/i);
  });

  it("returns network error when submit receives HTTP non-ok", async () => {
    const api = createApiAdapter({
      env: {
        VITE_GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/test/exec",
      },
      fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      logger: createSilentLogger(),
    });

    const result = await api.submitRsvp({
      name: "Budi Santoso",
      phone: "081234567890",
      unit: "Yantek",
      status: "Hadir",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/kesalahan jaringan/i);
  });

  it("falls back to mock data when remote attendance schema is invalid", async () => {
    const api = createApiAdapter({
      env: {
        VITE_GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/test/exec",
      },
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { invalid: true } }),
      }),
      logger: createSilentLogger(),
    });

    const result = await api.getAttendance({ page: 1, search: "" });

    expect(result.success).toBe(true);
    expect(result.totalItems).toBeGreaterThan(0);
    expect(result.data.length).toBeLessThanOrEqual(5);
  });

  it("normalizes remote attendance response values", async () => {
    const api = createApiAdapter({
      env: {
        VITE_GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/test/exec",
      },
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: "abc",
              name: "   Nama    Panjang    ",
              phone: "08a12-34",
              unit: "Unit Tidak Dikenal",
              status: "Status Aneh",
            },
          ],
        }),
      }),
      logger: createSilentLogger(),
    });

    const result = await api.getAttendance({ page: 1, search: "" });

    expect(result.success).toBe(true);
    expect(result.data[0].name).toBe("Nama Panjang");
    expect(result.data[0].phone).toBe("081234");
    expect(result.data[0].unit).toBe("Lainnya");
    expect(result.data[0].status).toBe("Absen");
  });

  it("falls back to mock attendance on timeout", async () => {
    const api = createApiAdapter({
      env: {
        VITE_GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/test/exec",
      },
      requestTimeoutMs: 5,
      fetchImpl: vi.fn(
        (_url, options) =>
          new Promise((_, reject) => {
            options.signal.addEventListener("abort", () => {
              const abortError = new Error("aborted");
              abortError.name = "AbortError";
              reject(abortError);
            });
          }),
      ),
      logger: createSilentLogger(),
    });

    const result = await api.getAttendance({ page: 1, search: "" });

    expect(result.success).toBe(true);
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it("supports internal REST provider without changing UI API surface", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: "1",
              name: "Rina Rest",
              phone: "081234567890",
              unit: "Back Office",
              status: "Hadir",
            },
          ],
        }),
      });

    const api = createApiAdapter({
      env: {
        VITE_API_PROVIDER: "internal-rest",
        VITE_INTERNAL_API_BASE_URL: "https://localhost/api",
        VITE_INTERNAL_API_ALLOWED_HOSTS: "localhost",
      },
      fetchImpl,
      logger: createSilentLogger(),
    });

    const submitResult = await api.submitRsvp({
      name: "Rina Rest",
      phone: "081234567890",
      unit: "Back Office",
      status: "Hadir",
    });
    const attendanceResult = await api.getAttendance({ page: 1, search: "" });

    expect(api.provider).toBe("internal-rest");
    expect(api.isRemoteEnabled).toBe(true);
    expect(submitResult.success).toBe(true);
    expect(attendanceResult.success).toBe(true);
    expect(attendanceResult.data[0].name).toBe("Rina Rest");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
