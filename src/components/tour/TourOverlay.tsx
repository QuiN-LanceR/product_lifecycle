"use client";
import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward, Lightbulb } from 'lucide-react';

interface TourOverlayProps {
  isOpen: boolean;
  currentStep: number;
  tourSteps: Array<{
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'bottom-end' | 'left' | 'right';
  }>;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({
  isOpen,
  currentStep,
  tourSteps,
  onNext,
  onPrev,
  onSkip,
  onClose
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !tourSteps[currentStep]) return;

    const waitForElement = (selector: string, maxAttempts = 10): Promise<HTMLElement | null> => {
      return new Promise((resolve) => {
        let attempts = 0;
        
        const checkElement = () => {
          const element = document.querySelector(selector) as HTMLElement;
          
          if (element && element.getBoundingClientRect().width > 0) {
            // Element found and has proper dimensions
            resolve(element);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkElement, 100); // Wait 100ms before next attempt
          } else {
            resolve(null);
          }
        };
        
        checkElement();
      });
    };

    const setupTour = async () => {
      const target = await waitForElement(tourSteps[currentStep].target);
      
      if (target) {
        setTargetElement(target);
        
        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait a bit more for any animations to complete
        setTimeout(() => {
          // Calculate tooltip position with better spacing
          const rect = target.getBoundingClientRect();
          const placement = tourSteps[currentStep].placement || 'bottom';
          const tooltipWidth = 320;
          const tooltipHeight = 250;
          
          let top = 0;
          let left = 0;
          
          switch (placement) {
            case 'top':
              top = rect.top - tooltipHeight - 20;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
              break;
            case 'bottom':
              top = rect.bottom + 20;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
              break;
            case 'bottom-end':
              top = rect.bottom + 20;
              left = rect.right - tooltipWidth - 10;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.left - tooltipWidth - 20;
              break;
            case 'right':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.right + 20;
              break;
          }
          
          // Ensure tooltip stays within viewport bounds
          const padding = 20;
          top = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, top));
          left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left));
          
          setTooltipPosition({ top, left });
        }, 200); // Additional delay for animations
      }
    };

    setupTour();
  }, [isOpen, currentStep, tourSteps]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentStep > 0) onPrev();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentStep, onNext, onPrev, onClose]);

  if (!isOpen || !tourSteps[currentStep]) return null;

  const currentTourStep = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Enhanced backdrop with blur effect */}
      <div className="fixed inset-0 transition-all duration-300" />
      
      {/* Animated highlight with pulse effect */}
      {targetElement && (
        <>
          {/* Glow effect */}
          <div
            className="fixed z-[9999] pointer-events-none rounded-lg animate-pulse"
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
              filter: 'blur(8px)',
            }}
          />
          
          {/* Main border */}
          <div
            className="fixed z-[9999] pointer-events-none border-3 rounded-lg transition-all duration-500"
            style={{
              top: targetElement.getBoundingClientRect().top - 4,
              left: targetElement.getBoundingClientRect().left - 4,
              width: targetElement.getBoundingClientRect().width + 8,
              height: targetElement.getBoundingClientRect().height + 8,
              borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
              boxShadow: isDarkMode 
                ? '0 0 0 2px rgba(96, 165, 250, 0.4), 0 0 20px rgba(96, 165, 250, 0.3)' 
                : '0 0 0 2px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)',
            }}
          />
        </>
      )}
      
      {/* Enhanced tooltip with gradient and animations */}
      <div
        className={`fixed z-[10000] rounded-xl shadow-2xl p-6 transition-all duration-300 transform animate-in slide-in-from-bottom-4 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600' 
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: window.innerWidth < 768 ? Math.min(280, window.innerWidth - 40) : '360px',
          maxHeight: '500px',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
            }`}>
              <Lightbulb 
                size={20} 
                className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
              />
            </div>
            <h3 className={`text-lg font-bold leading-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {currentTourStep.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Enhanced content with better typography */}
        <div className="mb-6 max-h-[140px] overflow-y-auto custom-scrollbar">
          <p className={`leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {currentTourStep.content}
          </p>
        </div>
        
        {/* Enhanced progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? (isDarkMode ? 'bg-blue-400 scale-150 shadow-lg shadow-blue-400/50' : 'bg-blue-600 scale-150 shadow-lg shadow-blue-600/50')
                      : index < currentStep
                      ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-400')
                      : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isDarkMode 
                ? 'text-blue-400 bg-blue-400/20' 
                : 'text-blue-600 bg-blue-600/10'
            }`}>
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>
          
          {/* Animated progress bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Enhanced action buttons */}
        <div className="space-y-3">
          {/* Back button row */}
          {!isFirstStep && (
            <div className="flex justify-start">
              <button
                onClick={onPrev}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={18} />
                <span className="font-medium">Kembali</span>
              </button>
            </div>
          )}
          
          {/* Main action buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onSkip}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SkipForward size={18} />
              <span className="font-medium">Lewati</span>
            </button>
            
            <button
              onClick={onNext}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-600/25'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-600/25'
              }`}
            >
              <span>{isLastStep ? 'Selesai' : 'Lanjut'}</span>
              {!isLastStep && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
        
        {/* Keyboard hint */}
        <div className={`mt-4 pt-4 border-t text-xs text-center ${
          isDarkMode 
            ? 'border-gray-700 text-gray-500' 
            : 'border-gray-200 text-gray-400'
        }`}>
          Gunakan ← → atau spasi untuk navigasi • ESC untuk keluar
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#d1d5db'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#9ca3af' : '#9ca3af'};
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        
        .slide-in-from-bottom-4 {
          animation-duration: 0.3s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};