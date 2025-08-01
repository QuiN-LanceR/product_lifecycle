"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, ArrowUpDown, Clock, FileText, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StageHistory {
  id: number;
  id_produk: number;
  nama_produk: string;
  stage_previous_id: number | null;
  stage_now_id: number | null;
  stage_previous_name: string | null;
  stage_now_name: string | null;
  catatan: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const MonitoringPage: React.FC = () => {
  const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch stage history data
  const fetchStageHistory = useCallback(async (_page?: number) => {
    const page = _page || currentPage;
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        search: searchTerm,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/monitoring?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stage history');
      }

      const data = await response.json();
      
      if (data.success) {
        setStageHistory(data.data || []);
        setPagination({
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0,
          itemsPerPage: data.pagination?.itemsPerPage || 10
        });
        setCurrentPage(page);
      } else {
        throw new Error(data.message || 'Failed to fetch stage history');
      }
    } catch (error) {
      console.error('Error fetching stage history:', error);
      toast.error('Gagal memuat data monitoring');
      setStageHistory([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, pagination.itemsPerPage]);

  useEffect(() => {
    fetchStageHistory();
  }, [fetchStageHistory]);

  // Search handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchStageHistory(page);
  }, [fetchStageHistory]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get stage badge color
  const getStageBadgeColor = (stage: string | null) => {
    if (!stage) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    
    const stageColors: { [key: string]: string } = {
      'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
    };
    return stageColors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Skeleton component
  const SkeletonRow = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monitoring Stage History</h1>
              <p className="text-gray-600 dark:text-gray-400">Pantau perubahan stage produk secara real-time</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Total Records: {pagination.totalItems}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari produk, stage, atau catatan..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="created_at-desc">Terbaru</option>
              <option value="created_at-asc">Terlama</option>
              <option value="nama_produk-asc">Produk A-Z</option>
              <option value="nama_produk-desc">Produk Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      ) : stageHistory.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? "Data tidak ditemukan" : "Belum ada data monitoring"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? `Tidak ada data yang cocok dengan "${searchTerm}"`
              : "Data monitoring stage history akan muncul di sini"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stageHistory.map((item, index) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {(currentPage - 1) * pagination.itemsPerPage + index + 1}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.nama_produk}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID: {item.id}</div>
                  </div>
                </div>

                {/* Stage Transition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stage Sebelumnya </label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(item.stage_previous_name)}`}>
                      {item.stage_previous_name || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stage Sekarang </label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(item.stage_now_name)}`}>
                      {item.stage_now_name || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Stage Transition Arrow */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                    <ArrowUpDown className="h-4 w-4" />
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>

                {/* Notes */}
                {item.catatan && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Catatan</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.catatan}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Menampilkan {((currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} data
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              Sebelumnya
            </button>
            
            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
              const pageNumber = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + index;
              if (pageNumber > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === pageNumber
                      ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringPage;