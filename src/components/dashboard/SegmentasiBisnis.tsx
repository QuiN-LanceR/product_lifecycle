"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Package } from "lucide-react";
import Image from "next/image";
import { useNavigateWithLoading } from '@/hooks/useNavigateWithLoading';

interface Segment {
  id: number;
  name: string;
  productCount: number;
  icon_light?: string;
  icon_dark?: string;
}

export const SegmentasiBisnis = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { navigateTo } = useNavigateWithLoading();


  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/segments');
      const result = await response.json();
      
      if (result.success) {
        const mappedSegments = result.data.map((item: { id: number; name: string; productCount: number; icon_light: string; icon_dark: string }) => ({
          id: item.id,
          name: item.name,
          productCount: item.productCount,
          icon_light: item.icon_light,
          icon_dark: item.icon_dark
        }));
        setSegments(mappedSegments);
      } else {
        throw new Error(result.message || 'Failed to fetch segments data');
      }
    } catch (err) {
      console.error('Error fetching segments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load segments data');
      setSegments([]);
    } finally {
      setLoading(false);
    }
  };  

  const handleSegmentClick = (id: number) => {
    navigateTo(`/admin/dashboard/segment/${id}`);
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleRetry = () => {
    fetchSegments();
  };

    // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Segmentasi Bisnis
            </h3>
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={`segment-skeleton-${index}`} className="relative w-full max-w-[175px] mx-auto">
              {/* Main box skeleton dengan clip-path yang sama */}
              <div 
                className="relative p-4 overflow-hidden transition-colors duration-200 bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{
                  clipPath: 'path("M0 129V24C0 10.7452 10.7452 0 24 0H151C164.255 0 175 10.7451 175 24V81.1644C175 93.9889 164.604 104.385 151.779 104.385C138.955 104.385 128.559 114.781 128.559 127.606V129C128.559 142.255 117.813 153 104.559 153H24C10.7452 153 0 142.255 0 129Z")',
                  width: '100%',
                  aspectRatio: '175/153',
                  minHeight: '120px'
                }}
              >
                <div className="relative space-y-1 sm:space-y-2 z-10">
                  {/* Nama segment skeleton */}
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  
                  {/* Angka besar skeleton */}
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                  
                  {/* Label Products skeleton */}
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
              
              {/* Icon circle skeleton */}
              <div className="absolute bottom-1 right-1 w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Segmentasi Bisnis
          </h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to Load Segments Data
          </h4>
          <p className="text-xs text-red-600 dark:text-red-300 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-gray-800 dark:text-gray-300" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15V13.3333H17.5V15H7.5ZM7.5 10.8333V9.16667H17.5V10.8333H7.5ZM2.5 6.66667V5H17.5V6.66667H2.5Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Segmentasi Bisnis
          </h3>
        </div>
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </button>
      </div>

      {segments && segments.length > 0 && (
        <div className={`grid gap-4 ${
          segments.length === 1 ? 'grid-cols-1' :
          segments.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          segments.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          segments.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          segments.length === 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' :
          segments.length === 6 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        }`}>
          {segments.map((segment) => (
            <div 
              key={segment.id} 
              className="relative w-full max-w-[175px] mx-auto cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => handleSegmentClick(segment.id)}
            >
              {/* Main box dengan background yang responsive untuk dark mode */}
              <div 
                className="relative p-4 overflow-hidden transition-colors duration-200 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
                style={{
                  clipPath: 'path("M0 129V24C0 10.7452 10.7452 0 24 0H151C164.255 0 175 10.7451 175 24V81.1644C175 93.9889 164.604 104.385 151.779 104.385C138.955 104.385 128.559 114.781 128.559 127.606V129C128.559 142.255 117.813 153 104.559 153H24C10.7452 153 0 142.255 0 129Z")',
                  width: '100%',
                  aspectRatio: '175/153',
                  minHeight: '120px'
                }}
              >
                
                {/* Content */}
                <div className="relative space-y-1 sm:space-y-2 z-10">
                  {/* Nama segment */}
                  <h4 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight pr-8 sm:pr-12">
                    {segment.name}
                  </h4>
                  
                  {/* Angka besar */}
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    {segment.productCount}
                  </p>
                  
                  {/* Label Products */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Products
                  </p>
                </div>
              </div>
              
              {/* Icon circle dengan background yang responsive untuk dark mode */}
              <div 
                className="absolute flex items-center justify-center z-20 transition-colors duration-200 bg-gray-100 dark:bg-gray-600"
                style={{
                  borderRadius: '50%',
                  width: 'clamp(35px, 25%, 43px)',
                  height: 'clamp(35px, 25%, 43px)',
                  bottom: '3.5%',
                  right: '-1.5%'
                }}
              >
                
                {/* Icon content */}
                <div className="relative z-10">
                  {segment.icon_light && segment.icon_dark ? (
                    <>
                      <Image
                        src={`/images/product/segmen/${segment.icon_light}`}
                        alt={segment.name}
                        width={18}
                        height={18}
                        className="block dark:hidden w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <Image
                        src={`/images/product/segmen/${segment.icon_dark}`}
                        alt={segment.name}
                        width={18}
                        height={18}
                        className="hidden dark:block w-4 h-4 sm:w-5 sm:h-5"
                      />
                    </>
                  ) : (
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};