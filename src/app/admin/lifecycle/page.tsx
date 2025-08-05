"use client";
import { useEffect, useState } from "react";
import ProductDistribution from "@/components/charts/lifecycle/productdistribution/ProductDistribution";
import TransitionMatrix from "@/components/charts/lifecycle/transitionmatrix/TransitionMatrix";
import TransitionSpeedAnalysis from "@/components/charts/lifecycle/TransitionSpeedAnalysis";
import TransitionPredictions from "@/components/charts/lifecycle/TransitionPredictions";
import LifecycleTimeline from "@/components/charts/lifecycle/LifecycleTimeline";
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <PageBreadcrumb pageTitle="Lifecycle Analysis" secondTitle="" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Product Lifecycle Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Comprehensive analysis of product lifecycle stages, transitions, and predictions
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Top Row - Product Distribution & Transition Matrix */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-[500px]">
            <ProductDistribution key={`product-${windowSize.width}`} />
          </div>
          <div className="h-[500px]">
            <TransitionMatrix key={`matrix-${windowSize.width}`} />
          </div>
        </div>

        {/* Middle Row - Lifecycle Timeline (Full Width) */}
        <div className="h-[400px]">
          <LifecycleTimeline key={`timeline-${windowSize.width}`} />
        </div>

        {/* Bottom Row - Speed Analysis & Predictions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-[450px]">
            <TransitionSpeedAnalysis key={`speed-${windowSize.width}`} />
          </div>
          <div className="h-[450px]">
            <TransitionPredictions key={`predictions-${windowSize.width}`} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Dashboard Information
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                This dashboard provides real-time insights into product lifecycle management. 
                Data is automatically updated and reflects the current state of all products in the system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}