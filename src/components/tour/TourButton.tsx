"use client";
import React from 'react';
import { useTour } from '@/hooks/useTour';
import { HelpCircle } from 'lucide-react';

export const TourButton: React.FC = () => {
  const { startTour, hasSeenTour, isTourOpen } = useTour();

  // Sembunyikan tombol hanya saat tour sedang berjalan
  if (isTourOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">      
      {/* Tombol Mulai Tour */}
      <button
        onClick={startTour}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group hover:scale-105"
        title="Mulai Tour Aplikasi"
      >
        <HelpCircle size={24} />
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {hasSeenTour ? 'Mulai ulang tour aplikasi' : 'Klik untuk memulai tour aplikasi'}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  );
};