import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    className = "",
    transformUppercase = false,
    ...props
  },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-surface-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`
          w-full min-h-[48px] px-4 py-3 rounded-xl border-2
          bg-white text-surface-800 text-sm font-medium
          placeholder:text-surface-400
          transition-all duration-200 ease-out
          outline-none
          focus:border-pln-400 focus:ring-4 focus:ring-pln-100
          ${error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100"
            : "border-surface-200 hover:border-surface-300"
          }
          ${transformUppercase ? "uppercase" : ""}
          ${className}
        `}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-600 animate-fade-in">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${id}-helper`} className="text-xs text-surface-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
