"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import AddDevHistoriForm from "../../devhistori/AddDevHistoriForm";
import EditDevHistoriForm from "../../devhistori/EditDevHistoriForm";
import { Pencil, Trash, Search, X, ChevronUp, ChevronDown, Code, Eye } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type DevHistori = {
  id: number;
  id_produk: number;
  nama_produk: string;
  tipe_pekerjaan: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  version: string;
  deskripsi: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-3 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </td>
    <td className="px-4 py-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-4 text-center sticky right-0 bg-white dark:bg-gray-800 z-10 border-l border-gray-200 dark:border-gray-700">
      <div className="flex justify-center gap-1">
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </td>
  </tr>
);

export default function TableMasterDevHistori({ currentPage, onTotalChange }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useUser();
  const [devHistoris, setDevHistoris] = useState<DevHistori[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDevHistori, setEditingDevHistori] = useState<DevHistori | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);

  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const currentRole = user?.role;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDevHistoris = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: debouncedSearchQuery,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/devhistori?${params}`);
      const data = await response.json();

      if (data.success) {
        setDevHistoris(data.data);
        onTotalChange(data.pagination.totalPages);
      }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-500" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-500" />
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const handleAdd = () => {
    setEditingDevHistori(null);
    openModal();
  };

  const handleEdit = (devHistori: DevHistori) => {
    setEditingDevHistori(devHistori);
    openModal();
  };

  const handleSuccess = () => {
    fetchDevHistoris();
    closeModal();
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
      cancelButtonText: 'Batal'
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
            showConfirmButton: false
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
          icon: 'error'
        });
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setIsDescriptionModalOpen(true);
  };

    const handleImport = async () => {
      if (!importFile) return;

      try {
        setImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);

        const response = await fetch('/api/devhistori/import', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            title: 'Import Berhasil!',
            html: `
              <p>${data.message}</p>
              ${data.details.errors.length > 0 ? 
                `<div class="mt-2 text-sm text-red-600">
                  <p>Errors:</p>
                  <ul class="list-disc list-inside">
                    ${data.details.errors.map((error: string) => `<li>${error}</li>`).join('')}
                  </ul>
                </div>` : ''
              }
            `,
            icon: 'success',
            timer: 3000,
            showConfirmButton: true
          });
          
          // Delay sebelum menutup modal dan refresh data
          setTimeout(() => {
            setImportModalOpen(false);
            setImportFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            fetchDevHistoris();
          }, 1000);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error importing:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengimpor data.',
          icon: 'error'
        });
        setImportModalOpen(false);
        setImportFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setImporting(false);
      }
    };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setImportFile(file);
        setImportModalOpen(true);
      } else {
        Swal.fire('Error!', 'File harus berformat Excel (.xlsx atau .xls)', 'error');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportModalOpen(true);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/devhistori/template/download');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Template_Import_DevHistori.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Gagal download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      Swal.fire('Error!', 'Gagal mendownload template', 'error');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Product Development History
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kelola riwayat pengembangan produk
              </p>
            </div>
          </div>

          {currentRole === 'Admin' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setImportModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >                
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                +
              </Button>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan produk, tipe pekerjaan, version, atau deskripsi..."
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
        </div>

        {/* Table Section - Fully Responsive Solution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700" style={{minWidth: '500px'}}>
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900 z-20 border-r border-gray-200 dark:border-gray-700 shadow-sm">
                    No
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => handleSort('nama_produk')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Nama Produk</span>
                      <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('nama_produk')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => handleSort('tipe_pekerjaan')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Tipe Pekerjaan</span>
                      <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('tipe_pekerjaan')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => handleSort('tanggal_mulai')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Tgl Mulai</span>
                      <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('tanggal_mulai')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => handleSort('tanggal_akhir')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Tgl Akhir</span>
                      <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('tanggal_akhir')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Version</span>
                      <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('version')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon('status')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 z-20 border-l border-gray-200 dark:border-gray-700 shadow-sm">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : devHistoris.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Code className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          {searchQuery ? 'Tidak ada data yang ditemukan' : 'Belum ada data histori pengembangan'}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                          >
                            Hapus filter pencarian
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  devHistoris.map((devHistori, index) => (
                    <tr key={devHistori.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {devHistori.nama_produk}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {devHistori.tipe_pekerjaan}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(devHistori.tanggal_mulai)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(devHistori.tanggal_akhir)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {devHistori.version}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="relative group">
                          <div 
                            className="break-words cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors" 
                            style={{
                              wordWrap: 'break-word', 
                              whiteSpace: 'normal', 
                              lineHeight: '1.4', 
                              maxHeight: '3.6em', 
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                            onClick={() => handleViewDescription(devHistori.deskripsi)}
                            title="Klik untuk melihat deskripsi lengkap"
                          >
                            {devHistori.deskripsi}
                          </div>
                          {devHistori.deskripsi.length > 100 && (
                            <button
                              onClick={() => handleViewDescription(devHistori.deskripsi)}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500 hover:bg-purple-600 text-white p-1 rounded-full text-xs"
                              title="Lihat deskripsi lengkap"
                            >
                              <Eye size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusBadgeColor(devHistori.status)
                        }`}>
                          {devHistori.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center sticky right-0 bg-white dark:bg-gray-800 z-10 border-l border-gray-200 dark:border-gray-700 shadow-sm">
                        {user?.role === 'Admin' && (
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(devHistori)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDelete(devHistori.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Trash size={14} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        id="devhistori-excel-upload"
      />

      {/* Import Modal - Enhanced like ProductPage */}
      {importModalOpen && (
        <Modal 
          isOpen={importModalOpen} 
          onClose={() => {
            setImportModalOpen(false);
            setImportFile(null);
            setIsDragOver(false);
          }} 
          className="max-w-2xl"
        >
          <div className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Import Product Development History dari Excel</h2>
            
            {/* Template Download Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Download Template</h3>
              <p className="text-blue-700 dark:text-blue-300 mb-3 text-sm">
                Download template Excel yang sudah berisi format dan master data yang diperlukan.
              </p>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
              </button>
            </div>

            {/* File Upload Section dengan Drag and Drop */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upload File Excel</h3>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {importFile ? (
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-900 dark:text-white font-medium">{importFile.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(importFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      onClick={() => setImportFile(null)}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      Hapus file
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="devhistori-excel-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className={`h-12 w-12 mb-3 ${
                      isDragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className={`text-lg font-medium mb-1 ${
                      isDragOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {isDragOver ? 'Lepaskan file di sini' : 'Drag & drop file Excel atau klik untuk pilih'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Format yang didukung: .xlsx, .xls (Maksimal 10MB)
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFile(null);
                  setIsDragOver(false);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {importing && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {importing ? 'Mengimport...' : 'Import Data'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl">
          <div className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingDevHistori ? "Edit Product Development History" : "Tambah Product Development History"}
            </h2>
            {editingDevHistori ? (
              <EditDevHistoriForm
                devHistori={editingDevHistori}
                onSuccess={handleSuccess}
                onCancel={closeModal}
              />
            ) : (
              <AddDevHistoriForm
                onSuccess={handleSuccess}
                onCancel={closeModal}
              />
            )}
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
      >
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {selectedDescription}
            </p>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setIsDescriptionModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}