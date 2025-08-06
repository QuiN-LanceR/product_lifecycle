"use client";
import { useEffect, useState } from "react";
import ProductDistribution from "@/components/charts/lifecycle/productdistribution/ProductDistribution";
import TransitionMatrix  from "@/components/charts/lifecycle/matrix/TransitionMatrix";
import LifecycleTimeline from "@/components/charts/lifecycle/timeline/LifecycleTimeline";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function LifeCyclePage() {
  
  const [user, setUser] = useState<unknown>(null);
  const windowSize = useWindowSize();

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
      <PageBreadcrumb pageTitle="Lifecycle Analysis" secondTitle="" />
      <div className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 lg:gap-6 w-full">
          <div className="w-full xl:w-1/2 min-w-0">
              <ProductDistribution key={`product-${windowSize.width}`} />
          </div>
          <div className="w-full xl:w-1/2 min-w-0">
              <TransitionMatrix key={`matrix-${windowSize.width}`} />
          </div>
        </div>
        <div className="w-full min-w-0">
          <LifecycleTimeline key={`timeline-${windowSize.width}`} />
        </div>
      </div>
    </div>      
  );
}