"use client";
import { useEffect, useState } from "react";
import { DashboardPages } from "@/components/dashboard/DashboardPage";
import { SegmentasiBisnis } from "@/components/dashboard/SegmentasiBisnis";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";

export default function AdminPage() {
  
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    fetch("/api/me")
    .then(res => res.json())
    .then(data => {
      if (user && typeof user === "object") {
        if (!data.authenticated) {
          window.location.href = "/login";
        } else {
          setUser(data.user);
        }
      }
    });
  }, [user]);

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