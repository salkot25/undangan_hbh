export default function Select({
  label,
  error,
  id,
  options = [],
  placeholder = "Pilih...",
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-surface-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full min-h-[48px] px-4 py-3 rounded-xl border-2
          bg-white text-surface-800 text-sm font-medium
          transition-all duration-200 ease-out
          outline-none appearance-none
          focus:border-pln-400 focus:ring-4 focus:ring-pln-100
          ${error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100"
            : "border-surface-200 hover:border-surface-300"
          }
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
        aria-invalid={error ? "true" : "false"}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs font-medium text-danger-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
