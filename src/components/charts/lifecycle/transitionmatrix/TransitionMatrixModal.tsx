"use client";
import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, DollarSign, Tag } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && stage && segment && count > 0) {
      fetchProducts();
    }
  }, [isOpen, stage, segment, count]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Detail Produk: {stage} - {segment}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total {count} produk ditemukan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data produk...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && count === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada produk untuk kombinasi {stage} - {segment}
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        {product.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>{formatPrice(product.price)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Tag className="w-4 h-4 mr-2" />
                          <span>{product.category}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(product.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}