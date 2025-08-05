"use client";
import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

interface TransitionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: string;
  segment: string;
  count: number;
}

// Custom Rupiah Icon Component
const RupiahIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 3h4a4 4 0 0 1 0 8H6z" />
    <path d="M6 11h3a3 3 0 0 1 0 6H6z" />
    <path d="M6 21V3" />
    <path d="M10 21l4-4" />
  </svg>
);

export default function TransitionMatrixModal({ 
  isOpen, 
  onClose, 
  stage, 
  segment, 
  count 
}: TransitionMatrixModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Menampilkan 6 item per halaman
  
  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/lifecycle/transition-matrix/products?stage=${encodeURIComponent(stage)}&segment=${encodeURIComponent(segment)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stage && segment && count > 0) {
      fetchProducts();
      setCurrentPage(1); // Reset to first page when modal opens
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, stage, segment, count]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Badge styling sesuai dengan admin/dashboard/all
  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
    };
    return colors[stage] || 'bg-gradient-to-b from-gray-500 to-gray-700 text-white';
  };

  const getSegmentBadgeColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Korporat': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Distribusi': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Pelayanan Pelanggan': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'EP & Pembangkit': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Transmisi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Premium': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Standard': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Budget': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageBadgeColor(stage)}`}>
                  {stage}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentBadgeColor(segment)}`}>
                  {segment}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detail Produk
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="font-medium text-blue-600 dark:text-blue-400">{count}</span> produk ditemukan
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-xl transition-all duration-200 group"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-pulse"></div>
              </div>
              <span className="ml-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Memuat data produk...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto">
                <div className="text-red-600 dark:text-red-400 mb-4 text-lg font-medium">{error}</div>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {!loading && !error && count === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
                <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Tidak ada produk untuk kombinasi <span className="font-medium">{stage}</span> - <span className="font-medium">{segment}</span>
                </p>
              </div>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="space-y-4 mb-6">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                          {product.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                            <RupiahIcon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                            <span className="font-semibold text-green-700 dark:text-green-300">{formatPrice(product.price)}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                            <Tag className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium">{product.category}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                            <Calendar className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                            <span className="font-medium">{formatDate(product.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, products.length)} dari {products.length} produk
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}