"use client";
import { useEffect, useState } from "react";
import ProductDistribution from "@/components/charts/lifecycle/productdistribution/ProductDistribution";
import TransitionMatrix from "@/components/charts/lifecycle/matrix/TransitionMatrix";
import TransitionSpeedAnalysis from "@/components/charts/lifecycle/speedanalis/TransitionSpeedAnalysis";
import TransitionPredictions from "@/components/charts/lifecycle/TransitionPredictions";
import LifecycleTimeline from "@/components/charts/lifecycle/timeline/LifecycleTimeline";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function LifeCyclePage() {
  const [, setUser] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const windowSize = useWindowSize();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        
        if (!data.authenticated) {
          window.location.href = "/login";
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/lifecycle/dashboard/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifecycle-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <PageBreadcrumb pageTitle="Lifecycle Analysis" secondTitle="" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Product Lifecycle Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                Comprehensive analysis of product lifecycle stages, transitions, and predictions
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {/* Download PDF Button */}
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="space-y-6 sm:space-y-8">
          {/* Top Row - Product Distribution & Transition Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Distribution */}
            <div className="w-full">
              <div className="h-[480px] w-full">
                <ProductDistribution key={`product-${windowSize.width}`} />
              </div>
            </div>
            
            {/* Transition Matrix */}
            <div className="w-full">
              <div className="h-[480px] w-full">
                <TransitionMatrix key={`matrix-${windowSize.width}`} />
              </div>
            </div>
          </div>

          {/* Middle Row - Lifecycle Timeline (Full Width) - Reduced Height */}
          <div className="w-full mt-10 mb-20">
            <div className="h-[360px] w-full">
              <LifecycleTimeline key={`timeline-${windowSize.width}`} />
            </div>
          </div>

          {/* Bottom Row - Speed Analysis & Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6   mt-10 mb-10">
            {/* Speed Analysis */}
            <div className="w-full">
              <div className="h-[650px] w-full">
                <TransitionSpeedAnalysis key={`speed-${windowSize.width}`} />
              </div>
            </div>
            
            {/* Predictions */}
            <div className="w-full">
              <div className="h-[650px] w-full">
                <TransitionPredictions key={`predictions-${windowSize.width}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}