import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-r from-pln-600 to-pln-500 text-white shadow-lg shadow-pln-500/25 hover:shadow-pln-500/40 hover:from-pln-700 hover:to-pln-600 active:scale-[0.97]",
  secondary:
    "bg-white text-pln-700 border-2 border-pln-200 hover:bg-pln-50 hover:border-pln-300 active:scale-[0.97] shadow-sm",
  ghost:
    "text-surface-600 hover:bg-surface-100 hover:text-surface-800 active:scale-[0.97]",
  danger:
    "bg-gradient-to-r from-danger-600 to-danger-500 text-white shadow-lg shadow-danger-500/25 hover:shadow-danger-500/40 active:scale-[0.97]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === "sm" ? 14 : size === "md" ? 16 : 20} />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "md" ? 16 : 20} />
      ) : null}
      <span>{loading ? "Mengirim..." : children}</span>
    </button>
  );
}
