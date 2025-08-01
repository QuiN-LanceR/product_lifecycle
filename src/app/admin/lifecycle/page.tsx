"use client";
import { useEffect, useState } from "react";
import ProductDistribution from "@/components/charts/lifecycle/ProductDistribution";
import TransitionMatrix  from "@/components/charts/lifecycle/TransitionMatrix";
import TransitionSpeedAnalysis from "@/components/charts/lifecycle/TransitionSpeedAnalysis";
import TransitionPredictions from "@/components/charts/lifecycle/TransitionPredictions";
import LifecycleTimeline from "@/components/charts/lifecycle/LifecycleTimeline";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageBreadcrumb pageTitle="Lifecycle Analysis" secondTitle="" />
      <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Grid Layout untuk Product Distribution dan Transition Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Product Distribution */}
          <div className="w-full">
            <ProductDistribution key={`product-${windowSize.width}`} />
          </div>
          
          {/* Transition Matrix */}
          <div className="w-full">
            <TransitionMatrix key={`matrix-${windowSize.width}`} />
          </div>
        </div>
  
        {/* Lifecycle Timeline - Full Width */}
        <div className="w-full">
          <LifecycleTimeline key={`timeline-${windowSize.width}`} />
        </div>

        {/* Grid Layout untuk Transition Speed Analysis dan Transition Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Transition Speed Analysis */}
          <div className="w-full">
            <TransitionSpeedAnalysis key={`speed-${windowSize.width}`} />
          </div>
          
          {/* Transition Predictions */}
          <div className="w-full">
            <TransitionPredictions key={`predictions-${windowSize.width}`} />
          </div>
        </div>
      </div>
    </div>      
  );
}