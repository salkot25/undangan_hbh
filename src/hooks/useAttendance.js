import { useState, useEffect, useCallback, useRef } from "react";
import { getAttendance } from "../utils/api";

export function useAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const fetchData = useCallback(async (currentPage, currentSearch) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAttendance({ page: currentPage, search: currentSearch });
      if (result.success) {
        setData(result.data);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } else {
        setError("Gagal memuat data.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, fetchData]);

  // Page change effect
  useEffect(() => {
    fetchData(page, search);
  }, [page, fetchData]);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
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
    refetch: () => fetchData(page, search),
  };
}
