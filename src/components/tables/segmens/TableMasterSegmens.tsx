"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditSegmensForm from "../../segmen/EditSegmensForm";
import AddSegmensForm from "../../segmen/AddSegmensForm";
import { Pencil, Trash, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';
import Image from "next/image";

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Segmen = {
  id: number;
  segmen: string;
  icon_light?: string;
  icon_dark?: string;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder]);

  const handleSort = (field: keyof Segmen) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
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

  const getSortIcon = (field: keyof Segmen) => {
    if (sortBy !== field) return <ChevronUp className="h-4 w-4 text-gray-400" />;
    return sortOrder === "asc" ? 
      <ChevronUp className="h-4 w-4 text-blue-500" /> : 
      <ChevronDown className="h-4 w-4 text-blue-500" />;
  };

    const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari segmen..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={handleAddSegmen}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 
                       text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              + Add Segmen
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  No
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider 
                           cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => handleSort('segmen')}
                >
                  <div className="flex items-center justify-between">
                    <span>Nama Segmen</span>
                    <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('segmen')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Light Icon
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dark Icon
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider 
                           cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center justify-between">
                    <span>Created At</span>
                    <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('created_at')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonRow key={idx} />
              ))
            ) : segmens.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {debouncedSearchQuery ? 
                        `Tidak ada segmen yang ditemukan untuk "${debouncedSearchQuery}"` : 
                        "Belum ada data segmen"
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              segmens.map((segmen, idx) => (
                <tr key={segmen.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * 10 + idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {segmen.segmen}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {segmen.icon_light ? (
                      <div className="flex justify-center">
                        <Image 
                          src={`/images/product/segmen/${segmen.icon_light}`} 
                          alt={`${segmen.segmen} light icon`}
                          className="w-8 h-8 object-contain"
                          width={32}
                          height={32}
                        />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400" style={{display: 'none'}}>
                          N/A
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          N/A
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {segmen.icon_dark ? (
                      <div className="flex justify-center">
                        <Image 
                          src={`/images/product/segmen/${segmen.icon_dark}`} 
                          alt={`${segmen.segmen} dark icon`}
                          className="w-8 h-8 object-contain"
                          width={32}
                          height={32}
                        />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400" style={{display: 'none'}}>
                          N/A
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          N/A
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {segmen.created_at
                      ? new Date(segmen.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {currentRole === 'Admin' ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(segmen)}
                          className="group relative p-3 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300/60 dark:hover:border-orange-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                          title="Edit Segmen"
                        >
                          <Pencil className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                        </button>
                        <button
                          onClick={() => handleDelete(segmen.segmen, segmen.id)}
                          className="group relative p-3 hover:bg-red-100/60 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300/60 dark:hover:border-red-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                          title="Delete Segmen"
                        >
                          <Trash className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">No Action</span>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={closeModal} 
          className="max-w-3xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
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