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
    
    setTimeout(() => setIsToggling(false), 300);
  };

  // Auto-animate on mount for a cool intro effect
  useEffect(() => {
    const timer = setTimeout(() => setHasInteracted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-all duration-500 ease-out ${
      isExpand 
        ? 'px-4 py-3' 
        : 'px-2 py-3 flex justify-center'
    }`}>
      {/* Main Toggle Container */}
      <div 
        className={`relative overflow-hidden rounded-2xl transition-all duration-500 ease-out transform cursor-pointer ${
          isExpand 
            ? 'w-full min-w-[220px] h-14' 
            : 'w-16 h-16 hover:scale-105'
        } ${
          hasInteracted ? 'shadow-lg hover:shadow-xl' : 'shadow-md'
        } ${
          theme === 'light'
            ? 'bg-gradient-to-r from-orange-100 via-yellow-50 to-orange-100 border border-orange-200/50'
            : 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border border-slate-700/50'
        }`}
        onClick={!isExpand ? (e: React.MouseEvent<HTMLDivElement>) => handleToggle(e as unknown as React.MouseEvent<HTMLButtonElement>) : undefined}
      >
        {/* Animated Background Glow */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-yellow-200/20 via-orange-200/30 to-yellow-200/20'
            : 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10'
        } ${hasInteracted ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Sliding Indicator */}
        <div 
          className={`absolute top-2 bottom-2 rounded-xl transition-all duration-500 ease-out ${
            isToggling ? 'scale-95' : 'scale-100'
          } ${
            theme === 'light' 
              ? isExpand 
                ? 'left-2 right-1/2 mr-1' 
                : 'left-2 right-2'
              : isExpand
                ? 'left-1/2 right-2 ml-1' 
                : 'left-2 right-2'
          } ${
            theme === 'light'
              ? 'bg-gradient-to-br from-white via-orange-50 to-yellow-50 shadow-lg border border-orange-200/30'
              : 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 shadow-xl border border-slate-600/50'
          }`}
          style={{
            backdropFilter: 'blur(10px)',
            filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15))'
          }}
        >
          {/* Inner glow effect */}
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
            theme === 'light'
              ? 'bg-gradient-to-br from-yellow-200/30 to-orange-200/30'
              : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
          } ${hasInteracted ? 'opacity-100' : 'opacity-0'}`} />
        </div>
        
        {/* Toggle Content */}
        <div className="relative z-10 flex h-full">
          {/* Collapsed Mode - Single Icon Display */}
          {!isExpand && (
            <div className="flex-1 flex items-center justify-center">
              {/* Current Theme Icon */}
              <div className={`relative transition-all duration-300 ${
                theme === 'light' ? 'animate-pulse' : 'animate-pulse'
              }`}>
                {theme === 'light' ? (
                  // Sun Icon for Light Mode
                  <>
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={`flex-shrink-0 transition-all duration-300 ${
                        theme === 'light' ? 'text-orange-600' : 'text-gray-400'
                      }`}
                    >
                      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor"/>
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" 
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-lg animate-pulse" />
                  </>
                ) : (
                  // Moon Icon for Dark Mode
                  <>
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="flex-shrink-0 text-blue-400"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg animate-pulse" />
                  </>
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
                className={`flex-1 flex items-center justify-center transition-all duration-300 rounded-xl group relative z-20 ${
                  theme === 'light' 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-400 hover:text-gray-300'
                } gap-3 px-2 ${
                  theme !== 'light' ? 'hover:bg-white/5 active:bg-white/10' : ''
                }`}
              >
                {/* Enhanced Sun Icon with Animation */}
                <div className={`relative transition-all duration-300 ${
                  theme === 'light' ? 'animate-pulse' : ''
                } ${
                  theme !== 'light' ? 'group-hover:scale-110 group-hover:rotate-12' : ''
                }`}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" className={theme === 'light' ? 'fill-current' : ''}/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {/* Subtle glow effect for active state */}
                  {theme === 'light' && (
                    <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-lg animate-pulse" />
                  )}
                </div>
                <span className={`text-sm font-semibold tracking-wide transition-all duration-300 ${
                  theme === 'light' ? 'text-orange-700' : 'text-gray-400 group-hover:text-gray-300'
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
                className={`flex-1 flex items-center justify-center gap-3 px-2 rounded-xl transition-all duration-300 group relative z-20 ${
                  theme === 'dark' 
                    ? 'text-blue-400 dark:text-blue-300' 
                    : 'text-gray-400 hover:text-gray-600'
                } ${
                  theme !== 'dark' ? 'hover:bg-black/5 active:bg-black/10' : ''
                }`}
              >
                {/* Enhanced Moon Icon with Animation */}
                <div className={`relative transition-all duration-300 ${
                  theme === 'dark' ? 'animate-pulse' : ''
                } ${
                  theme !== 'dark' ? 'group-hover:scale-110 group-hover:-rotate-12' : ''
                }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          className={theme === 'dark' ? 'fill-current' : ''}/>
                  </svg>
                  {/* Subtle glow effect for active state */}
                  {theme === 'dark' && (
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg animate-pulse" />
                  )}
                </div>
                <span className={`text-sm font-semibold tracking-wide transition-all duration-300 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  Dark
                </span>
              </button>
            </>
          )}
        </div>

        {/* Decorative Elements */}
        <div className={`absolute top-1 left-1 w-2 h-2 rounded-full transition-all duration-700 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 opacity-60'
            : 'bg-gradient-to-br from-blue-400 to-purple-400 opacity-40'
        } ${hasInteracted ? 'animate-pulse' : ''}`} />
        
        <div className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full transition-all duration-700 delay-200 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-orange-400 to-red-400 opacity-50'
            : 'bg-gradient-to-br from-purple-400 to-pink-400 opacity-30'
        } ${hasInteracted ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
}