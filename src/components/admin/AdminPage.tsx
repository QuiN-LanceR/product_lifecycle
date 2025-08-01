"use client";
import { useEffect, useState } from "react";
import DashboardPages from "@/components/dashboard/DashboardPage";
import { SegmentasiBisnis } from "@/components/dashboard/SegmentasiBisnis";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useNavigateWithLoading } from '@/hooks/useNavigateWithLoading';

export default function AdminPage() {
  
  const [user, setUser] = useState<unknown>(null);
  const { navigateTo } = useNavigateWithLoading();

  useEffect(() => {
    fetch("/api/me")
    .then(res => res.json())
    .then(data => {
      if (user && typeof user === "object") {
        if (!data.authenticated) {
          navigateTo("/login");
        } else {
          setUser(data.user);
        }
      }
    });
  }, [navigateTo, user]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" secondTitle="" />
      <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
        <div className="w-full">
          <DashboardPages />
        </div>
        <div className="w-full">
          <SegmentasiBisnis />
        </div>
      </div>
    </div>
  );
}