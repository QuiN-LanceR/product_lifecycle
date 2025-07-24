"use client";
import React from "react";

export const SegmentasiBisnis = () => {
  const segments = [
    {
      icon: "⚡️",
      name: "Pembangkit",
      color: "bg-orange-500",
    },
    {
      icon: "🗼",
      name: "Transmisi",
      color: "bg-purple-500",
    },
    {
      icon: "🔵",
      name: "Distribusi",
      color: "bg-blue-500",
    },
    {
      icon: "🏢",
      name: "Korporat",
      color: "bg-gray-500",
    },
    {
      icon: "👥",
      name: "Pelayanan Pelanggan",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Segmentasi Bisnis
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center text-center"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${segment.color}`}
            >
              {segment.icon}
            </div>
            <div className="mt-2 text-sm text-gray-800 dark:text-gray-100 font-medium leading-tight">
              {segment.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
