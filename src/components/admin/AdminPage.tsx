"use client";
import { useEffect, useState } from "react";
import DashboardPages from "@/components/dashboard/DashboardPage";
import { SegmentasiBisnis } from "@/components/dashboard/SegmentasiBisnis";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useNavigateWithLoading } from '@/hooks/useNavigateWithLoading';
import { Suspense } from 'react';

export default function AdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<unknown>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { navigateTo } = useNavigateWithLoading();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        
        if (!data.authenticated) {
          navigateTo("/login");
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigateTo("/login");
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const DashboardSkeleton = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" secondTitle="" />
      <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="w-full">
            <DashboardPages />
          </div>
          <div className="w-full">
            <SegmentasiBisnis />
          </div>
        </Suspense>
      </div>
    </div>
  );
}