"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Modal } from '../ui/modal';
import ProductForm from './ProductForm';

interface Product {
  id: number;
  nama_produk: string;
  id_kategori: number;
  id_segmen: number;
  id_stage: number;
  harga: number;
  tanggal_launch: string;
  customer: string;
  deskripsi: string;
  kategori?: string;
  segmen?: string;
  stage?: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: number;
  nama_attachment: string;
  url_attachment: string;
  ukuran_file: number;
  type: string;
  created_at: string;
}

interface DropdownOption {
  id: number;
  kategori?: string;
  segmen?: string;
  stage?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const ProductPage: React.FC = () => {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9
  });

  // Filter states
  const [filters, setFilters] = useState({
    kategori: '',
    segmen: '',
    stage: ''
  });

  // Dropdown options
  const [kategoriOptions, setKategoriOptions] = useState<DropdownOption[]>([]);
  const [segmenOptions, setSegmenOptions] = useState<DropdownOption[]>([]);
  const [stageOptions, setStageOptions] = useState<DropdownOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewAttachmentsModal, setShowViewAttachmentsModal] = useState(false);
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);

  // Form loading state
  const [formLoading, setFormLoading] = useState(false);

  // Tambah state untuk import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch dropdown options - PERBAIKAN: Menggunakan response langsung tanpa .data
  const fetchDropdownOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [kategoriRes, segmenRes, stageRes] = await Promise.all([
        fetch('/api/produk/kategoris/get'),
        fetch('/api/produk/segmens/get'),
        fetch('/api/produk/stages/get')
      ]);

      if (kategoriRes.ok) {
        const kategoriData = await kategoriRes.json();
        setKategoriOptions(kategoriData || []); // Langsung gunakan response
      }

      if (segmenRes.ok) {
        const segmenData = await segmenRes.json();
        setSegmenOptions(segmenData || []); // Langsung gunakan response
      }

      if (stageRes.ok) {
        const stageData = await stageRes.json();
        setStageOptions(stageData || []); // Langsung gunakan response
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      Swal.fire('Gagal', 'Gagal memuat opsi filter', 'error');
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // Fetch products with filters and pagination
  const fetchProducts = useCallback(async (_page?: number) => {
    const page = _page || currentPage;
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        search: searchTerm,
        ...(filters.kategori && { kategori: filters.kategori }),
        ...(filters.segmen && { segmen: filters.segmen }),
        ...(filters.stage && { stage: filters.stage })
      });

      const response = await fetch(`/api/produk/master?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
        setPagination({
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0,
          itemsPerPage: data.pagination?.itemsPerPage || 10
        });
        setCurrentPage(page);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire('Gagal', 'Gagal memuat data produk', 'error');
      setProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filters, pagination.itemsPerPage]);

  // Initial data fetch
  useEffect(() => {
    fetchDropdownOptions();
  }, [fetchDropdownOptions]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Search handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Filter handlers
  const handleFilterChange = useCallback((filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ kategori: '', segmen: '', stage: '' });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // CRUD handlers
  const handleAddProduct = useCallback(() => {
    setSelectedProduct(null);
    setShowAddModal(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (productId: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Produk yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/produk/delete', {
          method: 'DELETE', // Ubah dari POST ke DELETE
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: productId }),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire('Berhasil!', 'Produk berhasil dihapus.', 'success');
          fetchProducts();
        } else {
          throw new Error(data.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Gagal', 'Gagal menghapus produk', 'error');
      }
    }
  }, [fetchProducts]);

  const handleViewAttachments = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSelectedAttachments(product.attachments || []);
    setShowViewAttachmentsModal(true);
  }, []);

  // Form submission handlers
  const handleFormSuccess = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowAddAttachmentModal(false);
    setSelectedProduct(null);
    fetchProducts();
  }, [fetchProducts]);

  const handleAddSubmit = useCallback(async (formData: FormData) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/produk/add', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  }, []);

  const handleEditSubmit = useCallback(async (formData: FormData) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/produk/edit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  }, []);

  const handleSubmitAttachment = useCallback(async (formData: FormData) => {
    try {
      const response = await fetch('/api/attachment/add', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire('Berhasil', 'Attachment berhasil ditambahkan', 'success');
        handleFormSuccess();
      } else {
        throw new Error(data.message || 'Failed to add attachment');
      }
    } catch (error) {
      console.error('Error adding attachment:', error);
      Swal.fire('Gagal', 'Gagal menambahkan attachment', 'error');
    }
  }, [handleFormSuccess]);

  const handleDeleteAttachment = useCallback(async (attachmentId: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Attachment yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/attachment/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: attachmentId }),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire('Berhasil!', 'Attachment berhasil dihapus.', 'success');
          setSelectedAttachments(prev => prev.filter(att => att.id !== attachmentId));
          fetchProducts();
        } else {
          throw new Error(data.message || 'Failed to delete attachment');
        }
      } catch (error) {
        console.error('Error deleting attachment:', error);
        Swal.fire('Gagal', 'Gagal menghapus attachment', 'error');
      }
    }
  }, [fetchProducts]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchProducts(page);
    }
  }, [pagination.totalPages, fetchProducts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fungsi untuk download template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/produk/template/download');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Template_Import_Produk.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Gagal download template');
      }
    } catch (error) {
      Swal.fire('Error!', 'Gagal download template Excel', 'error');
      console.log(error)
    }
  };

  // Fungsi untuk import Excel
  const handleImportExcel = async () => {
    if (!selectedFile) {
      Swal.fire('Warning!', 'Pilih file Excel terlebih dahulu', 'warning');
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/produk/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire('Berhasil!', `${result.imported} produk berhasil diimport`, 'success');
        setShowImportModal(false);
        setSelectedFile(null);
        fetchProducts(); // Refresh data
      } else {
        throw new Error(result.message || 'Gagal import data');
      }
    } catch (error) {
      Swal.fire('Error!', error instanceof Error ? error.message : 'Gagal import data', 'error');
    } finally {
      setImportLoading(false);
    }
  };
  
  // Fungsi untuk handle drag and drop
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
      // Validasi file Excel
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        Swal.fire('Error!', 'File harus berformat Excel (.xlsx atau .xls)', 'error');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };  

  // Tambahkan fungsi untuk styling badge stage
  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
    };
    return colors[stage] || 'bg-gradient-to-b from-gray-500 to-gray-700 text-white';
  };

  // Tambahkan fungsi untuk styling badge segmen
  const getSegmentBadgeColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Pelayanan Pelanggan': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Korporat': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Distribusi': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'EP & Pembangkit': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    };
    return colors[segment] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  };

  const ProductCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col animate-pulse">
      {/* Product Header Skeleton */}
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="ml-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-24"></div>
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-300 dark:bg-purple-600 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-300 dark:bg-green-600 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
          </div>
        </div>

        {/* Price and Launch Date Skeleton */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="text-right">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
        </div>

        {/* Attachment Count Skeleton */}
        <div className="flex items-center mb-4">
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 mt-auto">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          
            <div className="flex gap-3">
              {/* Add Product Button - Ghost Style dengan Blue Theme */}
              <button
                onClick={handleAddProduct}
                className="group relative p-3 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-300/60 dark:hover:border-blue-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/40 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm overflow-hidden"
                title="Add New Product"
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-300/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                
                <svg className="h-5 w-5 relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                
                {/* Tooltip on hover */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  Add Product
                </div>
              </button>
              
              {/* Import Button - Ghost Style dengan Green Theme */}
              <button
                onClick={() => setShowImportModal(true)}
                className="group relative p-3 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-300/60 dark:hover:border-emerald-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-400/40 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm overflow-hidden"
                title="Import Products"
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-emerald-400/10 to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                
                {/* Shimmer effect dengan delay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-emerald-300/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 delay-100"></div>
                
                <svg className="h-5 w-5 relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                
                {/* Tooltip on hover */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  Import Data
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
            <select
              value={filters.kategori}
              onChange={(e) => handleFilterChange('kategori', e.target.value)}
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.kategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Segmen</label>
            <select
              value={filters.segmen}
              onChange={(e) => handleFilterChange('segmen', e.target.value)}
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Semua Segmen</option>
              {segmenOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.segmen}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stage</label>
            <select
              value={filters.stage}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Semua Stage</option>
              {stageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.stage}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="group relative w-full px-4 py-2.5 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 border border-transparent hover:border-gray-300/50 dark:hover:border-gray-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/30 dark:focus:ring-gray-400/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm overflow-hidden flex items-center justify-center gap-2"
              title="Clear all filters"
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/0 via-gray-400/8 to-gray-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-gray-300/8 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              
              {/* Reset Icon */}
              <svg className="h-4 w-4 relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              
              {/* Text */}
              <span className="relative z-10 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                Reset Filter
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(9)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                {/* Product Header */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                      {product.nama_produk}
                    </h3>
                    <div className="ml-3">
                      {/* Status Badge berdasarkan stage */}
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] ${getStageBadgeColor(product.stage || '')}`}>
                        {product.stage}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Kategori:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{product.kategori}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Segmen:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentBadgeColor(product.segmen || '')}`}>
                        {product.segmen}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Customer:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{product.customer}</span>
                    </div>
                  </div>

                  {/* Price and Launch Date */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Harga</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.harga)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Launch Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(product.tanggal_launch).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {product.deskripsi && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{product.deskripsi}</p>
                    </div>
                  )}

                  {/* Attachment Count */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>{product.attachments?.length || 0} file attachment</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-4 py-3 bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="group relative p-3 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300/60 dark:hover:border-orange-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                      title="Edit Product"
                    >
                      <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="group relative p-3 hover:bg-red-100/60 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300/60 dark:hover:border-red-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                      title="Delete Product"
                    >
                      <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleViewAttachments(product)}
                      className="group relative p-3 hover:bg-teal-100/60 dark:hover:bg-teal-900/20 border border-transparent hover:border-teal-300/60 dark:hover:border-teal-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                      title="View Files"
                    >
                      <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada produk</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mulai dengan menambahkan produk baru.</p>
                <div className="mt-6">
                  <button
                    onClick={handleAddProduct}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Produk
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} produk
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border-t border-b ${
                      pagination.currentPage === page
                        ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    } transition-colors duration-200`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal View Attachments */}
      <Modal
        isOpen={showViewAttachmentsModal}
        onClose={() => setShowViewAttachmentsModal(false)}
        className="max-w-4xl"
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">File Attachment</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedProduct?.nama_produk}</p>
            </div>
            <button
              onClick={() => {
                setShowViewAttachmentsModal(false);
                setShowAddAttachmentModal(true);
              }}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah File
            </button>
          </div>

          {selectedAttachments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAttachments.map((attachment) => (
                <div key={attachment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{attachment.nama_attachment}</h3>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p><span className="font-medium">Ukuran:</span> {formatFileSize(attachment.ukuran_file)}</p>
                        <p><span className="font-medium">Tipe:</span> {attachment.type}</p>
                        <p><span className="font-medium">Upload:</span> {new Date(attachment.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <a
                        href={attachment.url_attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded hover:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200 text-center"
                      >
                        Lihat
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded hover:bg-red-600 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors duration-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Belum ada file</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tambahkan file attachment untuk produk ini.</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowViewAttachmentsModal(false);
                    setShowAddAttachmentModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah File
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Tambah Produk */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        className="max-w-4xl"
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah Produk Baru</h2>
          <ProductForm
            onSubmit={handleAddSubmit}
            onCancel={() => setShowAddModal(false)}
            onSuccess={handleFormSuccess}
            isLoading={formLoading}
          />
        </div>
      </Modal>

      {/* Modal Edit Produk */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="max-w-4xl"
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Produk</h2>
          <ProductForm
            product={selectedProduct || undefined}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            isLoading={formLoading}
          />
        </div>
      </Modal>

      {/* Modal Tambah Attachment */}
      <Modal
        isOpen={showAddAttachmentModal}
        onClose={() => setShowAddAttachmentModal(false)}
        className="max-w-md"
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah File Attachment</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            if (selectedProduct) {
              formData.append('id', selectedProduct.id.toString());
            }
            handleSubmitAttachment(formData);
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih File
              </label>
              <input
                type="file"
                name="attachment"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddAttachmentModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setSelectedFile(null);
          setIsDragOver(false);
        }}
        className="max-w-2xl"
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Import Produk dari Excel</h2>
          
          {/* Template Download Section */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Download Template</h3>
            <p className="text-blue-700 dark:text-blue-300 mb-3 text-sm">
              Download template Excel yang sudah berisi format dan master data yang diperlukan.
            </p>
            <button
              onClick={handleDownloadTemplate}
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
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileInputChange}
                className="hidden"
                id="excel-upload"
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <svg className="h-12 w-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Hapus file
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="excel-upload"
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
                setShowImportModal(false);
                setSelectedFile(null);
                setIsDragOver(false);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleImportExcel}
              disabled={!selectedFile || importLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {importLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {importLoading ? 'Mengimport...' : 'Import Data'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductPage;