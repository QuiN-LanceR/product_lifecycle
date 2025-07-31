"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditJabatansForm from "../../jabatan/EditJabatansForm";
import AddJabatansForm from "../../jabatan/AddJabatansForm";
import { Pencil, Trash, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Jabatan = {
  id: number;
  jabatan: string;
  created_at?: string;
  updated_at?: string;
};

export default function TableMasterJabatans({ currentPage, onTotalChange }: Props) {
  const [editingJabatan, setEditingJabatan] = useState<Jabatan | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Jabatan | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentRole = user?.role;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchJabatans = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/jabatans/master?page=${currentPage}&search=${debouncedSearchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setJabatans(data.jabatans);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching jabatans:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder, onTotalChange]);

  const handleSort = (field: keyof Jabatan) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    fetchJabatans();
  }, [fetchJabatans]);

  const handleDelete = async (jabatanName: string, id: number) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: `Jabatan dengan nama: ${jabatanName} akan dihapus permanen`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/jabatans/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id })
        });

        const data = await res.json();

        if (data.success) {          
          Swal.fire('Berhasil!', 'Jabatan berhasil dihapus.', 'success').then(() => {
            fetchJabatans();
          });
        } else {
          Swal.fire('Gagal', data.message, 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Terjadi kesalahan pada server.', 'error');
        console.log(err);
      }
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (jabatan: Jabatan) => {
    setEditingJabatan(jabatan);
    openModal();
  };

  const handleCloseEdit = () => {
    setEditingJabatan(null);
    closeModal();
  };

  const handleEditSuccess = () => {
    fetchJabatans();
    handleCloseEdit();
  };

  const handleAddJabatan = () => {
    setEditingJabatan(null);
    openModal();
  };

  const getSortIcon = (field: keyof Jabatan) => {
    if (sortBy !== field) return <ChevronUp className="h-4 w-4 text-gray-400" />;
    return sortOrder === "asc" ? 
      <ChevronUp className="h-4 w-4 text-orange-500" /> : 
      <ChevronDown className="h-4 w-4 text-orange-500" />;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) { 
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div className="w-64 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            <div className="w-32 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

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
                placeholder="Cari jabatan..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                         transition-colors duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={handleAddJabatan}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 
                       text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              + Add Jabatan
            </Button>
          )}
        </div>
        
        {debouncedSearchQuery !== searchQuery && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Mencari &quot;{searchQuery}&quot;...
          </div>
        )}
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
                  onClick={() => handleSort('jabatan')}
                >
                  <div className="flex items-center justify-between">
                    <span>Jabatan</span>
                    <span className="ml-2 group-hover:text-orange-500 transition-colors">{getSortIcon('jabatan')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider 
                           cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center justify-between">
                    <span>Created At</span>
                    <span className="ml-2 group-hover:text-orange-500 transition-colors">{getSortIcon('created_at')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonRow key={idx} />
                ))
              ) : jabatans.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {debouncedSearchQuery ? 
                        `Tidak ada jabatan yang ditemukan untuk "${debouncedSearchQuery}"` : 
                        "Tidak ada data jabatan"
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              jabatans.map((jabatan, idx) => (
                <tr key={jabatan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * 10 + idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {jabatan.jabatan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {jabatan.created_at
                      ? new Date(jabatan.created_at).toLocaleDateString("id-ID", {
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
                          onClick={() => handleEdit(jabatan)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg 
                                   shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(jabatan.jabatan, jabatan.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg 
                                   shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Trash size={16} />
                        </Button>
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
          className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
        >
          {editingJabatan ? (
            <EditJabatansForm 
              jabatan={editingJabatan} 
              onSuccess={handleEditSuccess} 
              onCancel={handleCloseEdit} 
            />
          ) : (            
            <AddJabatansForm 
              onSuccess={() => {
                fetchJabatans();
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