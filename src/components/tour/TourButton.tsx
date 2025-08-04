"use client";
import React from 'react';
import { useTour } from '@/hooks/useTour';
import { HelpCircle } from 'lucide-react';

export const TourButton: React.FC = () => {
  const { startTour, hasSeenTour } = useTour();

  // Hanya tampilkan tombol jika user sudah pernah melihat tour
  if (!hasSeenTour) return null;

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center"
      title="Mulai Tour Aplikasi"
    >
      <HelpCircle size={24} />
    </button>
  );
};