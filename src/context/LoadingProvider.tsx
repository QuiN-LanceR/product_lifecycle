"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset loading state when pathname changes
    setIsNavigating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname]);

  const setIsNavigatingWithTimeout = (loading: boolean) => {
    if (loading) {
      setIsNavigating(true);
      // Auto-hide loading after 10 seconds to prevent stuck loading
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 10000);
    } else {
      setIsNavigating(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  return (
    <LoadingContext.Provider value={{ isNavigating, setIsNavigating: setIsNavigatingWithTimeout }}>
      {children}
      {isNavigating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 dark:text-gray-300">Memuat halaman...</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}