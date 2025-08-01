"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditKategoriForm from "@/components/kategori/EditKategorisForm";
import AddKategoriForm from "@/components/kategori/AddKategorisForm";
import { Pencil, Trash, Search, X, ChevronUp, ChevronDown, Package, Plus } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';
import Image from "next/image";

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Kategori = {
  id: number;
  nama_kategori: string;
  icon_light?: string;
  icon_dark?: string;
  created_at: string;
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

  const getSortIcon = (field: keyof Kategori) => {
    if (sortBy !== field) return <ChevronUp className="h-4 w-4 text-gray-400" />;
    return sortOrder === "asc" ? 
      <ChevronUp className="h-4 w-4 text-purple-500" /> : 
      <ChevronDown className="h-4 w-4 text-purple-500" />;
  };

  const handleSort = (field: keyof Kategori) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
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
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchKategoris();
  }, [fetchKategoris]);

  const handleDelete = useCallback(async (kategoriName: string, id: number) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus kategori "${kategoriName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'swal2-popup-custom'
      }
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
          Swal.fire({
            title: 'Berhasil!', 
            text: 'Kategori berhasil dihapus.', 
            icon: 'success',
            customClass: {
              popup: 'swal2-popup-custom'
            }
          });
          fetchKategoris();
        } else {
          Swal.fire({
            title: 'Gagal!', 
            text: data.message, 
            icon: 'error',
            customClass: {
              popup: 'swal2-popup-custom'
            }
          });
        }
      } catch (error) {
        console.error('Error deleting kategori:', error);
        Swal.fire({
          title: 'Error!', 
          text: 'Terjadi kesalahan saat menghapus kategori.', 
          icon: 'error',
          customClass: {
            popup: 'swal2-popup-custom'
          }
        });
      }
    }
  }, [fetchKategoris]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 dark:from-purple-800 dark:via-purple-900 dark:to-purple-950 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Master Kategori</h2>
              <p className="text-purple-100">Kelola data kategori produk</p>
            </div>
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={handleAddKategori}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Kategori</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={handleAddKategori}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 
                       text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              + Add Kategori
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
                  onClick={() => handleSort('nama_kategori')}
                >
                  <div className="flex items-center justify-between">
                    <span>Nama Kategori</span>
                    <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('nama_kategori')}</span>
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
            ) : kategoris.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {debouncedSearchQuery ? 
                        `Tidak ada kategori yang ditemukan untuk "${debouncedSearchQuery}"` : 
                        "Belum ada data kategori"
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              kategoris.map((kategori, idx) => (
                <tr key={kategori.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * 10 + idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {kategori.nama_kategori}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {kategori.icon_light ? (
                      <div className="flex justify-center">
                        <Image 
                          src={`/images/product/kategori/${kategori.icon_light}`} 
                          alt={`${kategori.nama_kategori} light icon`}
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
                    {kategori.icon_dark ? (
                      <div className="flex justify-center">
                        <Image 
                          src={`/images/product/kategori/${kategori.icon_dark}`} 
                          alt={`${kategori.nama_kategori} dark icon`}
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
                    {kategori.created_at
                      ? new Date(kategori.created_at).toLocaleDateString("id-ID", {
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
                        <Button
                          size="sm"
                          onClick={() => handleEdit(kategori)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg 
                                   shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(kategori.nama_kategori, kategori.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg 
                                   shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Tidak ada aksi</span>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal */}
      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={closeModal} 
          className="max-w-2xl"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            {editingKategori ? (
              <EditKategoriForm 
                kategori={editingKategori} 
                onSuccess={handleEditSuccess} 
                onCancel={handleCloseEdit} 
              />
            ) : (            
              <AddKategoriForm 
                onSuccess={() => {
                  fetchKategoris();
                  closeModal();
                }} 
                onCancel={closeModal} 
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}