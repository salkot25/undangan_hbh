import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAttendance } from "../../hooks/useAttendance";

function StatusDot({ status, compact = false }) {
  const isHadir = status === "Hadir";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider ${
        compact ? "px-2 py-1 text-[9px]" : "px-2.5 py-1 text-[10px]"
      } ${isHadir ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}
    >
      {status}
    </span>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SkeletonRow() {
  return (
    <tr>
      <td className="py-4 pr-4">
        <div className="skeleton h-4 w-6 rounded" />
      </td>
      <td className="py-4 pr-4">
        <div className="skeleton h-4 w-28 rounded" />
      </td>
      <td className="py-4 pr-4">
        <div className="skeleton h-4 w-24 rounded" />
      </td>
      <td className="py-4 pr-4">
        <div className="skeleton h-4 w-16 rounded" />
      </td>
      <td className="py-4">
        <div className="skeleton h-4 w-14 rounded" />
      </td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-2xl border border-line bg-paper-white flex gap-3">
      <div className="skeleton w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 py-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

function getVisiblePages(currentPage, totalPages, maxVisible = 7) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  const siblingCount = 1;
  let left = Math.max(2, currentPage - siblingCount);
  let right = Math.min(totalPages - 1, currentPage + siblingCount);

  if (currentPage <= 4) {
    left = 2;
    right = 5;
  } else if (currentPage >= totalPages - 3) {
    left = totalPages - 4;
    right = totalPages - 1;
  }

  if (left > 2) pages.push("left-ellipsis");

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < totalPages - 1) pages.push("right-ellipsis");
  pages.push(totalPages);

  return pages;
}

export default function AttendanceSection() {
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
  const visiblePages = getVisiblePages(page, totalPages, 7);

  return (
    <section id="hadir" className="py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint mb-3">
              Daftar Kehadiran
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
              Peserta Terdaftar
            </h2>
            {totalItems > 0 && (
              <p className="mt-2 text-[15px] font-medium text-ink-muted">
                {totalItems} peserta telah terdaftar
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 mt-2 md:mt-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama peserta..."
              className="w-full pl-11 pr-4 h-12 sm:h-14 text-[15px] font-semibold text-ink bg-paper-white border border-line rounded-2xl outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/5 placeholder:text-ink-faint/60 shadow-sm"
              aria-label="Cari peserta"
            />
          </div>
        </div>

        {error ? (
          <div className="py-16 text-center bg-paper-white rounded-3xl border border-line">
            <p className="text-[15px] text-ink-muted mb-4 font-medium">
              Mohon maaf, gagal memuat data peserta.
            </p>
            <button
              onClick={refetch}
              className="px-6 py-3 bg-paper border border-line rounded-full text-[13px] font-bold text-ink hover:bg-line-light transition-colors active:scale-95"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="py-20 text-center bg-paper-white rounded-3xl border border-line border-dashed">
            <p className="text-[15px] font-medium text-ink-muted">
              {search
                ? "Hasil pencarian tidak ditemukan."
                : "Belum ada data peserta yang terdaftar."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (md and up) */}
            <div className="hidden md:block rounded-3xl border border-line bg-paper-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-accent/5">
                      <th className="py-4 pl-6 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink-faint w-16">
                        No
                      </th>
                      <th className="py-4 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                        Nama Lengkap
                      </th>
                      <th className="py-4 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                        Nomor HP
                      </th>
                      <th className="py-4 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                        Unit Kerja
                      </th>
                      <th className="py-4 pr-6 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                      : data.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="border-b border-line-light last:border-0 hover:bg-paper-warm/50 transition-colors"
                          >
                            <td className="py-5 pl-6 pr-4 text-ink-faint/60 font-mono text-xs">
                              {startIndex + idx + 1}
                            </td>
                            <td className="py-5 pr-4 font-bold text-ink">
                              {item.name}
                            </td>
                            <td className="py-5 pr-4 text-ink-muted font-mono text-xs tracking-wider">
                              {item.phone}
                            </td>
                            <td className="py-5 pr-4">
                              <span className="inline-flex px-3 py-1.5 rounded-lg bg-paper border border-line text-[11px] font-bold text-ink-muted tracking-wide">
                                {item.unit}
                              </span>
                            </td>
                            <td className="py-5 pr-6">
                              <StatusDot status={item.status} />
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View (below md) */}
            <div className="md:hidden flex flex-col gap-3">
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                : data.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-line bg-paper-white shadow-sm flex items-center gap-3 hover:border-accent/40 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 relative">
                        <span className="text-xs font-bold text-accent tracking-widest">
                          {getInitials(item.name)}
                        </span>
                        {/* Inner status dot on avatar */}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-paper-white ${item.status === "Hadir" ? "bg-green" : "bg-red"}`}
                        />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-bold text-ink truncate">
                              {item.name}
                            </h3>
                          </div>
                          <StatusDot status={item.status} compact />
                        </div>
                        <div className="flex border-t border-line/50 mt-2 pt-2 items-center justify-between gap-3">
                          <span className="text-[11px] font-semibold text-ink-faint truncate">
                            {item.unit}
                          </span>
                          <span className="text-[11px] font-mono text-ink-faint tracking-wider shrink-0">
                            {item.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination Layer - Larger touch targets */}
            {!loading && data.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-6 sm:gap-0">
                <p className="text-[13px] font-medium text-ink-faint">
                  Halaman <span className="font-bold text-ink">{page}</span>{" "}
                  dari {totalPages}
                </p>
                <div className="flex items-center bg-paper-white p-1.5 rounded-2xl border border-line shadow-sm">
                  <button
                    onClick={prevPage}
                    disabled={page <= 1}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-ink hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                    aria-label="Sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center px-2 gap-1">
                    {visiblePages.map((p) => {
                      if (typeof p !== "number") {
                        return (
                          <span
                            key={p}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-[13px] font-bold text-ink-faint flex items-center justify-center"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${
                            p === page
                              ? "bg-accent text-white shadow-lg shadow-accent/20"
                              : "text-ink-muted hover:bg-paper"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={nextPage}
                    disabled={page >= totalPages}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-ink hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                    aria-label="Berikutnya"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
