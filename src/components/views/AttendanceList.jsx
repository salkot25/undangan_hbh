import { Search, ChevronLeft, ChevronRight, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { useAttendance } from "../../hooks/useAttendance";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

function SkeletonRow() {
  return (
    <tr>
      <td className="px-3 sm:px-4 py-3 border-b border-amber-900/10 border-r border-r-amber-900/10">
        <div className="skeleton h-4 w-8 rounded" />
      </td>
      <td className="px-3 sm:px-4 py-3 border-b border-amber-900/10 border-r border-r-amber-900/10">
        <div className="skeleton h-4 w-28 rounded" />
      </td>
      <td className="px-3 sm:px-4 py-3 border-b border-amber-900/10 border-r border-r-amber-900/10">
        <div className="skeleton h-4 w-24 rounded" />
      </td>
      <td className="px-3 sm:px-4 py-3 border-b border-amber-900/10 border-r border-r-amber-900/10">
        <div className="skeleton h-4 w-20 rounded" />
      </td>
      <td className="px-3 sm:px-4 py-3 border-b border-amber-900/10">
        <div className="skeleton h-6 w-16 rounded-full" />
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/60 flex items-center justify-center">
            <BookOpen className="text-amber-700/40" size={28} />
          </div>
          <p className="text-sm font-semibold text-amber-800/60">Belum Ada Data</p>
          <p className="text-xs text-amber-700/40 max-w-xs">
            Data kehadiran akan muncul setelah peserta melakukan RSVP.
          </p>
        </div>
      </td>
    </tr>
  );
}

function ErrorState({ onRetry }) {
  return (
    <tr>
      <td colSpan={5} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-red-100/60 flex items-center justify-center">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <p className="text-sm font-semibold text-amber-900/70">Gagal Memuat Data</p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
            Coba Lagi
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AttendanceList() {
  const {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    search,
    setSearch,
    setPage,
    nextPage,
    prevPage,
    refetch,
  } = useAttendance();

  const startIndex = (page - 1) * 5;

  return (
    <div className="animate-fade-in">
      {/* Title */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-surface-900">Daftar Hadir</h2>
        <p className="text-sm text-surface-500 mt-1">
          {totalItems > 0 ? `${totalItems} peserta terdaftar` : "Lihat daftar peserta yang telah RSVP"}
        </p>
      </div>

      {/* === BOOK CONTAINER === */}
      <div className="relative animate-slide-up">
        {/* Book shadow / depth layers */}
        <div className="absolute -bottom-2 left-2 right-2 h-4 bg-amber-950/15 rounded-b-2xl blur-sm" />
        <div className="absolute -bottom-1 left-1 right-1 h-3 bg-amber-900/10 rounded-b-xl" />

        {/* Main Book */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #fef7ed, #fdf2e0, #fce8c8)",
            boxShadow: `
              0 1px 3px rgba(120, 80, 30, 0.1),
              0 4px 12px rgba(120, 80, 30, 0.08),
              0 12px 30px rgba(120, 80, 30, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 -1px 0 rgba(120, 80, 30, 0.1)
            `,
          }}
        >
          {/* Book spine effect - left edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-10 sm:w-14 pointer-events-none z-10"
            style={{
              background: `linear-gradient(90deg, 
                rgba(139, 90, 43, 0.15) 0%, 
                rgba(139, 90, 43, 0.08) 30%,
                rgba(139, 90, 43, 0.03) 60%, 
                transparent 100%
              )`,
            }}
          />

          {/* Book binding stitching */}
          <div className="absolute left-5 sm:left-7 top-4 bottom-4 w-px pointer-events-none z-10"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, rgba(139, 90, 43, 0.2) 0px, rgba(139, 90, 43, 0.2) 8px, transparent 8px, transparent 16px)",
            }}
          />

          {/* Page texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Horizontal ruled lines (faint) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, rgba(100, 130, 180, 0.08) 43px, rgba(100, 130, 180, 0.08) 44px)",
              backgroundPosition: "0 44px",
            }}
          />

          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 left-[68px] sm:left-[88px] w-px bg-red-400/15 pointer-events-none z-10" />

          {/* === BOOK HEADER === */}
          <div className="relative z-20 px-5 sm:px-8 pt-6 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-8 sm:ml-10">
              {/* Book title header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #92400e, #78350f)",
                    boxShadow: "0 2px 6px rgba(120, 53, 15, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <BookOpen size={20} className="text-amber-100" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-950 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', serif" }}>
                    Buku Daftar Hadir
                  </h3>
                  <p className="text-[11px] text-amber-800/50 font-medium tracking-wide uppercase">
                    Corporate Gathering 2026
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/40" size={16} />
                <input
                  type="text"
                  placeholder="Cari peserta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium
                    text-amber-900 placeholder:text-amber-700/30
                    transition-all duration-200 outline-none border-2
                    border-amber-800/10 focus:border-amber-600/30 focus:ring-2 focus:ring-amber-400/10"
                  style={{
                    background: "rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(4px)",
                  }}
                  id="attendance-search"
                  aria-label="Cari peserta"
                />
              </div>
            </div>
          </div>

          {/* === TABLE === */}
          <div className="relative z-20 px-3 sm:px-6 pb-4 overflow-x-auto">
            <div className="ml-5 sm:ml-8">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th
                      className="px-3 sm:px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-amber-900/20 border-r border-r-amber-900/10 w-12"
                      style={{ color: "rgba(120, 53, 15, 0.6)" }}
                    >
                      No
                    </th>
                    <th
                      className="px-3 sm:px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-amber-900/20 border-r border-r-amber-900/10"
                      style={{ color: "rgba(120, 53, 15, 0.6)" }}
                    >
                      Nama Lengkap
                    </th>
                    <th
                      className="px-3 sm:px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-amber-900/20 border-r border-r-amber-900/10"
                      style={{ color: "rgba(120, 53, 15, 0.6)" }}
                    >
                      Nomor HP
                    </th>
                    <th
                      className="px-3 sm:px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-amber-900/20 border-r border-r-amber-900/10"
                      style={{ color: "rgba(120, 53, 15, 0.6)" }}
                    >
                      Unit Kerja
                    </th>
                    <th
                      className="px-3 sm:px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider border-b-2 border-amber-900/20"
                      style={{ color: "rgba(120, 53, 15, 0.6)" }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {error ? (
                    <ErrorState onRetry={refetch} />
                  ) : loading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : data.length === 0 ? (
                    <EmptyState />
                  ) : (
                    data.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="animate-fade-in transition-colors hover:bg-amber-100/30"
                        style={{ animationDelay: `${idx * 0.06}s` }}
                      >
                        <td className="px-3 sm:px-4 py-3.5 border-b border-amber-900/8 border-r border-r-amber-900/8 text-amber-800/40 text-xs font-mono font-bold text-center">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-3 sm:px-4 py-3.5 border-b border-amber-900/8 border-r border-r-amber-900/8">
                          <span className="font-semibold text-amber-950" style={{ fontFamily: "'Plus Jakarta Sans', serif" }}>
                            {item.name}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3.5 border-b border-amber-900/8 border-r border-r-amber-900/8">
                          <span className="text-amber-800/70 font-mono text-xs tracking-wide">
                            {item.phone}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3.5 border-b border-amber-900/8 border-r border-r-amber-900/8">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                            style={{
                              background: "rgba(120, 53, 15, 0.06)",
                              color: "rgba(120, 53, 15, 0.65)",
                            }}
                          >
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3.5 border-b border-amber-900/8 text-center">
                          <Badge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* === PAGINATION FOOTER === */}
          {!error && !loading && data.length > 0 && (
            <div className="relative z-20 px-5 sm:px-8 pb-5">
              <div className="ml-5 sm:ml-8 flex items-center justify-between pt-3 border-t border-amber-900/10">
                <p className="text-xs text-amber-800/50 font-medium">
                  Halaman <span className="font-bold text-amber-900/70">{page}</span> dari{" "}
                  <span className="font-bold text-amber-900/70">{totalPages}</span>
                  <span className="hidden sm:inline text-amber-700/30 ml-2">
                    • {totalItems} peserta
                  </span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevPage}
                    disabled={page <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                      text-amber-800/60 transition-all duration-200 active:scale-95
                      disabled:opacity-30 disabled:cursor-not-allowed
                      hover:bg-amber-800/10"
                    style={{
                      border: "1px solid rgba(120, 53, 15, 0.12)",
                      background: page <= 1 ? "transparent" : "rgba(255,255,255,0.4)",
                    }}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                        transition-all duration-200
                        ${p === page
                          ? "text-white shadow-sm"
                          : "text-amber-800/50 hover:bg-amber-800/10"
                        }
                      `}
                      style={p === page ? {
                        background: "linear-gradient(135deg, #92400e, #78350f)",
                        boxShadow: "0 2px 6px rgba(120, 53, 15, 0.25)",
                      } : {
                        border: "1px solid rgba(120, 53, 15, 0.08)",
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={page >= totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                      text-amber-800/60 transition-all duration-200 active:scale-95
                      disabled:opacity-30 disabled:cursor-not-allowed
                      hover:bg-amber-800/10"
                    style={{
                      border: "1px solid rgba(120, 53, 15, 0.12)",
                      background: page >= totalPages ? "transparent" : "rgba(255,255,255,0.4)",
                    }}
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom page curl effect */}
          <div
            className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none z-30"
            style={{
              background: "linear-gradient(315deg, rgba(180,140,80,0.1) 0%, transparent 60%)",
              borderRadius: "0",
            }}
          />
        </div>
      </div>

      {/* Bottom spacer for mobile nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
