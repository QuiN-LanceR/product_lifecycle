"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditKategorisForm from "../../kategori/EditKategorisForm";
import AddKategorisForm from "../../kategori/AddKategorisForm";
import { Pencil, Trash } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Kategori = {
  id: number;
  kategori: string;
  created_at?: string;
  updated_at?: string;
};

export default function TableMasterKategoris({ currentPage, onTotalChange }: Props) {
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Kategori | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentRole = user?.role;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchKategoris = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/kategoris/master?page=${currentPage}&search=${debouncedSearchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setKategoris(data.kategoris);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching kategoris:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder, onTotalChange]);

  const handleSort = (field: keyof Kategori) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: keyof Kategori) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " 🔼" : " 🔽";
  };

  useEffect(() => {
    fetchKategoris();
  }, [fetchKategoris]);

  const handleDelete = async (kategoriName: string, id: number) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus kategori "${kategoriName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/kategoris/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });

        const data = await res.json();
        
        if (data.success) {
          Swal.fire('Berhasil!', 'Kategori berhasil dihapus.', 'success');
          fetchKategoris();
        } else {
          Swal.fire('Gagal!', data.message, 'error');
        }
      } catch (error) {
        console.error('Error deleting kategori:', error);
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus kategori.', 'error');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-4 py-2 border-r text-center">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </td>
    </tr>
  );

  const handleEdit = (kategori: Kategori) => {
    setEditingKategori(kategori);
    openModal();
  };

  const handleCloseEdit = () => {
    setEditingKategori(null);
    closeModal();
  };

  const handleEditSuccess = () => {
    fetchKategoris();
    handleCloseEdit();
  };

  const handleAddKategori = () => {
    setEditingKategori(null);
    openModal();
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari role..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        
        {currentRole === 'Admin' && (
          <Button
            onClick={handleAddKategori}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Kategori
          </Button>
        )}
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th 
              className="px-4 py-2 text-left text-gray-900 dark:text-white border-r border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => handleSort("id")}
            >
              No{renderSortIcon("id")}
            </th>
            <th 
              className="px-4 py-2 text-left text-gray-900 dark:text-white border-r border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => handleSort("kategori")}
            >
              Nama Kategori{renderSortIcon("kategori")}
            </th>
            <th 
              className="px-4 py-2 text-left text-gray-900 dark:text-white border-r border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => handleSort("created_at")}
            >
              Created At{renderSortIcon("created_at")}
            </th>
            <th className="px-4 py-2 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-white/20">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))
          ) : kategoris.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {debouncedSearchQuery ? 
                  `Tidak ada kategori yang ditemukan untuk "${debouncedSearchQuery}"` : 
                  "Belum ada data kategori"
                }
              </td>
            </tr>
          ) : (
            kategoris.map((kategori, idx) => (
              <tr key={kategori.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b border-gray-300 dark:border-white/20 
               hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{(currentPage - 1) * 10 + idx + 1}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{kategori.kategori}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
                  {kategori.created_at
                    ? new Date(kategori.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"
                  }
                </td>
                <td className="px-4 py-2 border-r text-center">
                  {currentRole === 'Admin' ? (
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        className="text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 border border-green-700 dark:border-green-300 transition-colors"
                        onClick={() => handleEdit(kategori)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 border border-red-700 dark:border-red-300 transition-colors"
                        onClick={() => handleDelete(kategori.kategori, kategori.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm italic text-gray-400">No Action</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={closeModal} 
          className="max-w-md p-5"
        >
          {editingKategori ? (
            <EditKategorisForm 
              kategori={editingKategori} 
              onSuccess={handleEditSuccess} 
              onCancel={handleCloseEdit} 
            />
          ) : (            
            <AddKategorisForm 
              onSuccess={() => {
                fetchKategoris();
                closeModal();
              }} 
              onCancel={closeModal} 
            />
          )}
        </Modal>
      )}
    </div>
  );
}