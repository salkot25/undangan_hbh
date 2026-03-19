export default function Badge({ status }) {
  const isHadir = status === "Hadir";

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
        ${isHadir
          ? "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm shadow-success-500/30"
          : "bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-sm shadow-danger-500/30"
        }
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isHadir ? "bg-success-100" : "bg-danger-100"}`} />
      {status}
    </span>
  );
}
