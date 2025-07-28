"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditSegmensForm from "../../segmen/EditSegmensForm";
import AddSegmensForm from "../../segmen/AddSegmensForm";
import { Pencil, Trash, Search, X } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Segmen = {
  id: number;
  segmen: string;
  created_at?: string;
  updated_at?: string;
};

export default function TableMasterSegmens({ currentPage, onTotalChange }: Props) {
  const [editingSegmen, setEditingSegmen] = useState<Segmen | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [segmens, setSegmens] = useState<Segmen[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Segmen | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentRole = user?.role;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSegmens = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/segmens/master?page=${currentPage}&search=${debouncedSearchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setSegmens(data.segmens);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching segmens:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder, onTotalChange]);

  const handleSort = (field: keyof Segmen) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: keyof Segmen) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " 🔼" : " 🔽";
  };

  useEffect(() => {
    fetchSegmens();
  }, [fetchSegmens]);

  const handleDelete = async (segmenName: string, id: number) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus segmen "${segmenName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/segmens/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });

        const data = await res.json();
        
        if (data.success) {
          Swal.fire('Berhasil!', 'Segmen berhasil dihapus.', 'success');
          fetchSegmens();
        } else {
          Swal.fire('Gagal!', data.message, 'error');
        }
      } catch (error) {
        console.error('Error deleting segmen:', error);
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus segmen.', 'error');
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

  const handleEdit = (segmen: Segmen) => {
    setEditingSegmen(segmen);
    openModal();
  };

  const handleCloseEdit = () => {
    setEditingSegmen(null);
    closeModal();
  };

  const handleEditSuccess = () => {
    fetchSegmens();
    handleCloseEdit();
  };

  const handleAddSegmen = () => {
    setEditingSegmen(null);
    openModal();
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari segmen..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {currentRole === 'Admin' && (
          <Button
            onClick={handleAddSegmen}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Segmen
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
              onClick={() => handleSort("segmen")}
            >
              Nama Segmen{renderSortIcon("segmen")}
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
          ) : segmens.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {debouncedSearchQuery ? 
                  `Tidak ada segmen yang ditemukan untuk "${debouncedSearchQuery}"` : 
                  "Belum ada data segmen"
                }
              </td>
            </tr>
          ) : (
            segmens.map((segmen, idx) => (
              <tr key={segmen.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b border-gray-300 dark:border-white/20 
               hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{(currentPage - 1) * 10 + idx + 1}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{segmen.segmen}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
                  {segmen.created_at
                    ? new Date(segmen.created_at).toLocaleDateString("id-ID", {
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
                        onClick={() => handleEdit(segmen)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 border border-red-700 dark:border-red-300 transition-colors"
                        onClick={() => handleDelete(segmen.segmen, segmen.id)}
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
          {editingSegmen ? (
            <EditSegmensForm 
              segmen={editingSegmen} 
              onSuccess={handleEditSuccess} 
              onCancel={handleCloseEdit} 
            />
          ) : (            
            <AddSegmensForm 
              onSuccess={() => {
                fetchSegmens();
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