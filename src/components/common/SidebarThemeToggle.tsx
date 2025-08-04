"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";

export default function SidebarThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [isToggling, setIsToggling] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const isExpand = isExpanded || isHovered || isMobileOpen;

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    setHasInteracted(true);
    toggleTheme();
    
    setTimeout(() => setIsToggling(false), 200);
  };

  // Auto-animate on mount for a subtle intro effect
  useEffect(() => {
    const timer = setTimeout(() => setHasInteracted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-all duration-300 ease-out ${
      isExpand 
        ? 'px-4 py-3' 
        : 'px-2 py-3 flex justify-center'
    }`}>
      {/* Main Toggle Container */}
      <div 
        className={`relative overflow-hidden rounded-lg transition-all duration-300 ease-out transform cursor-pointer ${
          isExpand 
            ? 'w-full min-w-[200px] h-12' 
            : 'w-12 h-12 hover:scale-105'
        } ${
          hasInteracted ? 'shadow-sm hover:shadow-md' : 'shadow-sm'
        } ${
          theme === 'light'
            ? 'bg-gray-50 border border-gray-200/80 hover:bg-gray-100'
            : 'bg-gray-800 border border-gray-700/80 hover:bg-gray-750'
        }`}
        onClick={!isExpand ? (e: React.MouseEvent<HTMLDivElement>) => handleToggle(e as unknown as React.MouseEvent<HTMLButtonElement>) : undefined}
      >
        
        {/* Sliding Indicator */}
        <div 
          className={`absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out ${
            isToggling ? 'scale-95' : 'scale-100'
          } ${
            theme === 'light' 
              ? isExpand 
                ? 'left-1 right-1/2 mr-0.5' 
                : 'left-1 right-1'
              : isExpand
                ? 'left-1/2 right-1 ml-0.5' 
                : 'left-1 right-1'
          } ${
            theme === 'light'
              ? 'bg-white shadow-sm border border-gray-300/50'
              : 'bg-gray-700 shadow-sm border border-gray-600/50'
          }`}
        />
        
        {/* Toggle Content */}
        <div className="relative z-10 flex h-full">
          {/* Collapsed Mode - Single Icon Display */}
          {!isExpand && (
            <div className="flex-1 flex items-center justify-center">
              {/* Current Theme Icon */}
              <div className="relative transition-all duration-200">
                {theme === 'light' ? (
                  // Sun Icon for Light Mode
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 text-gray-600"
                  >
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Moon Icon for Dark Mode
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="flex-shrink-0 text-gray-300"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                  </svg>
                )}
              </div>
            </div>
          )}
          
          {/* Expanded Mode - Both Icons */}
          {isExpand && (
            <>
              {/* Light Mode Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (theme !== 'light') handleToggle(e);
                }}
                disabled={isToggling}
                className={`flex-1 flex items-center justify-center transition-all duration-200 rounded-md group relative z-20 ${
                  theme === 'light' 
                    ? 'text-gray-700' 
                    : 'text-gray-400 hover:text-gray-300'
                } gap-2 px-2 ${
                  theme !== 'light' ? 'hover:bg-white/5' : ''
                }`}
              >
                {/* Sun Icon */}
                <div className={`relative transition-all duration-200 ${
                  theme !== 'light' ? 'group-hover:scale-110' : ''
                }`}>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" className={theme === 'light' ? 'fill-current' : ''}/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className={`text-sm font-medium transition-all duration-200 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  Light
                </span>
              </button>
              
              {/* Dark Mode Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (theme !== 'dark') handleToggle(e);
                }}
                disabled={isToggling}
                className={`flex-1 flex items-center justify-center gap-2 px-2 rounded-md transition-all duration-200 group relative z-20 ${
                  theme === 'dark' 
                    ? 'text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
                } ${
                  theme !== 'dark' ? 'hover:bg-black/5' : ''
                }`}
              >
                {/* Moon Icon */}
                <div className={`relative transition-all duration-200 ${
                  theme !== 'dark' ? 'group-hover:scale-110' : ''
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          className={theme === 'dark' ? 'fill-current' : ''}/>
                  </svg>
                </div>
                <span className={`text-sm font-medium transition-all duration-200 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  Dark
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}