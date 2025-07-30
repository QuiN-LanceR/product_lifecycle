"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

interface Product {
  id: number;
  name: string;
  stage: string;
  segment: string;
  created_at: string;
}

interface StageInfo {
  name: string;
  displayName: string;
  gradient: string;
  textColor: string;
}

const StageDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageName, setStageName] = useState<string>('');

  const stageId = params.stage as string;

  // Fetch products by stage
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/by-stage?id=${stageId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setStageName(data.stage || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [stageId]);

  // Mapping stage dengan warna gradient
  const stageConfig: Record<string, StageInfo> = {
    'introduction': {
      name: 'introduction',
      displayName: 'Introduction',
      gradient: 'bg-gradient-to-r from-[#FFBE62] to-[#FF9500]',
      textColor: 'text-white'
    },
    'growth': {
      name: 'growth',
      displayName: 'Growth',
      gradient: 'bg-gradient-to-r from-[#0EA976] to-[#006846]',
      textColor: 'text-white'
    },
    'maturity': {
      name: 'maturity',
      displayName: 'Maturity',
      gradient: 'bg-gradient-to-r from-[#4791F2] to-[#0E458D]',
      textColor: 'text-white'
    },
    'decline': {
      name: 'decline',
      displayName: 'Decline',
      gradient: 'bg-gradient-to-r from-[#F85124] to-[#86270E]',
      textColor: 'text-white'
    }
  };

  const currentStage = stageName ? stageConfig[stageName.toLowerCase()] || {
    name: stageName.toLowerCase(),
    displayName: stageName,
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-700',
    textColor: 'text-white'
  } : {
    name: '',
    displayName: 'Loading...',
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-700',
    textColor: 'text-white'
  };

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
      'Introduction': 'bg-gradient-to-r from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-r from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-r from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-r from-[#F85124] to-[#86270E] text-white'
    };
    return colors[stage] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle={`${currentStage.displayName} Stages`} secondTitle="" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle={`${currentStage.displayName} Products`} secondTitle="" />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle={`${currentStage.displayName} Stages`} secondTitle="Dashboard" />
      
      {/* Header dengan tombol back */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Stage Header */}
      <div className={`${currentStage.gradient} rounded-2xl p-6 mb-6 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${currentStage.textColor} mb-2`}>
              {currentStage.displayName} Stage
            </h1>
            <p className={`${currentStage.textColor} opacity-90`}>
              {products.length} products in this stage
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Package className={`w-8 h-8 ${currentStage.textColor}`} />
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daftar Produk di {currentStage.displayName} Stage
          </h2>
        </div>
        
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No products found in {currentStage.displayName} stage
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Segment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStageBadgeColor(product.stage)}`}>
                        {product.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSegmentBadgeColor(product.segment)}`}>
                        {product.segment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageDetailPage;