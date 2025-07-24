// DashboardPages.tsx
"use client";
import React from "react";
// import { TrendingUpIcon, BoxIcon, TrendingDownIcon } from "@/icons";

export const DashboardPages = () => {
  return (
    <div className="space-y-6">
      {/* Product Lifecycle Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {/* Introduction Stage */}
        <div className="rounded-2xl bg-orange-400 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
              {/* <BoxIcon className="w-4 h-4" /> */}
            </div>
            <span className="text-sm font-medium">Introduction Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">1</h2>
            <p className="text-sm opacity-90">New Products</p>
          </div>
        </div>

        {/* Growth Stage */}
        <div className="rounded-2xl bg-green-500 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
              {/* <TrendingUpIcon className="w-4 h-4" /> */}
            </div>
            <span className="text-sm font-medium">Growth Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">3</h2>
            <p className="text-sm opacity-90">Growing Products</p>
          </div>
        </div>

        {/* Maturity Stage */}
        <div className="rounded-2xl bg-blue-500 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
              {/* <BoxIcon className="w-4 h-4" /> */}
            </div>
            <span className="text-sm font-medium">Maturity Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">2</h2>
            <p className="text-sm opacity-90">Mature Products</p>
          </div>
        </div>

        {/* Decline Stage */}
        <div className="rounded-2xl bg-red-600 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
              {/* <TrendingDownIcon className="w-4 h-4" /> */}
            </div>
            <span className="text-sm font-medium">Decline Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">1</h2>
            <p className="text-sm opacity-90">Declining Products</p>
          </div>
        </div>
      </div>

      {/* Total Products Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Total Products</h3>
          <h2 className="text-4xl font-bold">7</h2>
          <p className="text-sm opacity-90">All Products</p>
        </div>
      </div>
    </div>
  );
};