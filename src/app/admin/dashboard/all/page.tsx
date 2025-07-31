"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

interface Product {
  id: number;
  name: string;
  stage: string;
  segment: string;
  created_at: string;
}

const AllProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/all-products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const handleBack = () => {
    router.push('/admin');
  };

  const getSegmentBadgeColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Korporat': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Distribusi': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Pelayanan Pelanggan': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'EP & Pembangkit': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Transmisi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Growth': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Maturity': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Decline': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="All Products" secondTitle="Dashboard" />
      
      {/* Header dengan gradient ungu */}
      <div className="bg-gradient-to-r from-[#5153FF] to-[#3D40CC] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Products</h1>
            <p className="text-lg opacity-90">Total Produk: {totalProducts}</p>
          </div>
          <div className="text-right">
            <Package className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Tombol kembali */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>

      {/* Content area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Semua Produk ({totalProducts})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5153FF]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Belum ada produk</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Produk</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Segmen</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageBadgeColor(product.stage)}`}>
                          {product.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentBadgeColor(product.segment)}`}>
                          {product.segment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {new Date(product.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;