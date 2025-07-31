"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

interface Product {
  id: number;
  name: string;
  segment: string;
  stage: string;
  created_at: string;
}

interface SegmentDetail {
  id: number;
  name: string;
  totalProducts: number;
}

const SegmentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [segmentDetail, setSegmentDetail] = useState<SegmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const segmentId = params.id as string;

  const fetchSegmentProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dashboard/by-segment?id=${segmentId}`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products);
        setSegmentDetail(result.data.segment);
      } else {
        throw new Error(result.message || 'Failed to fetch segment products');
      }
    } catch (err) {
      console.error('Error fetching segment products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load segment products');
    } finally {
      setLoading(false);
    }
  }, [segmentId]);

  useEffect(() => {
    if (segmentId) {
      fetchSegmentProducts();
    }
  }, [segmentId, fetchSegmentProducts]);

  const handleBack = () => {
    router.push('/admin');
  };

  const getSegmentBadgeColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Korporat': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Distribusi': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Pelayanan Pelanggan': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Pembangkit': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Transmisi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
    };
    return colors[stage] || 'bg-gradient-to-b from-gray-500 to-gray-700 text-white';
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Segment Detail" secondTitle="Dashboard" />
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Segment Detail" secondTitle="Dashboard" />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Segment Detail" secondTitle="Dashboard" />
      
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {segmentDetail?.name} Segment
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Total Products: {segmentDetail?.totalProducts}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Products in {segmentDetail?.name} ({products.length})
          </h2>
        </div>
        
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[80px] ${getSegmentBadgeColor(product.segment)}`}>
                        {product.segment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] ${getStageBadgeColor(product.stage)}`}>
                        {product.stage}
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
        ) : (
          <div className="p-6 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No products found in this segment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentDetailPage;