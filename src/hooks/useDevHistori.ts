import { useState, useCallback, useEffect } from 'react';
import { DevHistori } from '../types/devhistori.types';
import Swal from 'sweetalert2';

export const useDevHistori = (currentPage: number, onTotalChange: (totalPages: number) => void) => {
  const [devHistoris, setDevHistoris] = useState<DevHistori[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDevHistoris = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/devhistori/master?page=${currentPage}&search=${debouncedSearchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setDevHistoris(data.devHistoris);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching dev historis:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder, onTotalChange]);

  useEffect(() => {
    fetchDevHistoris();
  }, [fetchDevHistoris]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Data development history akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        container: 'swal2-container-custom-z-index'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/devhistori/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            title: 'Berhasil!',
            text: 'Development history berhasil dihapus.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              container: 'swal2-container-custom-z-index'
            }
          });
          fetchDevHistoris();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error deleting dev history:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus development history.',
          icon: 'error',
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
        });
      }
    }
  };

  return {
    devHistoris,
    loading,
    searchQuery,
    setSearchQuery,
    setDebouncedSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    handleDelete,
    fetchDevHistoris
  };
};