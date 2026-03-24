import { useState, useCallback } from "react";
import { ToastContext } from "./toast-context";

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    (message, variant = "success", duration = 3000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto animate-slide-down rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm
              flex items-center gap-3 text-sm font-medium cursor-pointer
              ${
                toast.variant === "success"
                  ? "bg-success-500/90 text-white"
                  : toast.variant === "error"
                    ? "bg-danger-500/90 text-white"
                    : "bg-pln-600/90 text-white"
              }
            `}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <span className="shrink-0">
              {toast.variant === "success"
                ? "✓"
                : toast.variant === "error"
                  ? "✕"
                  : "ℹ"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
