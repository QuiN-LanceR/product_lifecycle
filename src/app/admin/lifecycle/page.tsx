"use client";
import { useEffect, useState } from "react";
import ProductDistribution from "@/components/charts/lifecycle/productdistribution/ProductDistribution";
import TransitionMatrix from "@/components/charts/lifecycle/transitionmatrix/TransitionMatrix";
import TransitionSpeedAnalysis from "@/components/charts/lifecycle/TransitionSpeedAnalysis";
import TransitionPredictions from "@/components/charts/lifecycle/TransitionPredictions";
import LifecycleTimeline from "@/components/charts/lifecycle/timeline/LifecycleTimeline";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function LifeCyclePage() {
  const [, setUser] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
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
              <div className="h-[440px] w-full">
                <TransitionSpeedAnalysis key={`speed-${windowSize.width}`} />
              </div>
            </div>
            
            {/* Predictions */}
            <div className="w-full">
              <div className="h-[440px] w-full">
                <TransitionPredictions key={`predictions-${windowSize.width}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200 dark:border-cyan-800 transition-colors duration-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-800 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-cyan-800 dark:text-cyan-200">
                Dashboard Information
              </h4>
              <p className="mt-2 text-sm text-cyan-700 dark:text-cyan-300 leading-relaxed">
                This dashboard provides real-time insights into product lifecycle management. 
                Data is automatically updated and reflects the current state of all products in the system.
                Use the interactive charts to explore trends, analyze transitions, and make data-driven decisions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200">
                  Real-time Data
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                  Interactive Charts
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                  Export Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}