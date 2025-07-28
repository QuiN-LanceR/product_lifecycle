// DashboardPages.tsx
"use client";
import React from "react";

export const DashboardPages = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <div className="rounded-2xl bg-gradient-to-b from-orange-300 to-orange-500 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-medium">Introduction Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-5xl font-bold">1</h2>
            <p className="text-sm">New Products</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-b from-green-400 to-green-600 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-medium">Growth Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-5xl font-bold">3</h2>
            <p className="text-sm">Growing Products</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-medium">Maturity Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-5xl font-bold">2</h2>
            <p className="text-sm">Mature Products</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-b from-red-500 to-red-700 p-5 text-white md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-medium">Decline Stage</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-5xl font-bold">1</h2>
            <p className="text-sm">Declining Products</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-b from-indigo-800 to-indigo-900 p-6 text-white">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Total Products</h3>
          <h2 className="text-6xl font-bold">7</h2>
          <p className="text-sm">All Products</p>
        </div>
      </div>
    </div>
  );
};