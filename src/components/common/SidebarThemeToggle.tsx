"use client";
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";

export default function SidebarThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isExpand = isExpanded || isHovered || isMobileOpen;

  return (
    <div className="py-5">
      {/* Toggle Container */}
      <div 
        className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 transition-colors duration-200"
        style={{ minWidth: isExpand ? '200px' : '60px' }}
      >
        {/* Sliding Background */}
        <div 
          className={`absolute top-1 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
            theme === 'light' 
              ? 'left-1 right-1/2' 
              : 'left-1/2 right-1'
          }`}
          style={{
            filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))'
          }}
        />
        
        {/* Toggle Content */}
        <div className="relative z-10 flex h-full">
          {/* Light Mode Button */}
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 ${
              theme === 'light' 
                ? 'text-gray-900' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {/* Sun Icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99996 13.3332C8.16163 13.3332 6.66663 11.8382 6.66663 9.99984C6.66663 8.1615 8.16163 6.6665 9.99996 6.6665C11.8383 6.6665 13.3333 8.1615 13.3333 9.99984C13.3333 11.8382 11.8383 13.3332 9.99996 13.3332Z" stroke="currentColor" strokeWidth="0.833333"/>
                <path d="M9.99996 2.9165V4.58317M17.0833 9.99984H15.4166M4.58329 9.99984H2.91663M9.99996 15.4165V17.0832M13.75 6.24984L15 4.99984M4.99996 14.9998L6.24996 13.7498M4.99996 4.99984L6.24996 6.24984M13.75 13.7498L15 14.9998" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round"/>
            </svg>
            {isExpand && (
              <span className="text-sm font-medium">Light</span>
            )}
          </button>
          
          {/* Dark Mode Button */}
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 ${
              theme === 'dark' 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {/* Moon Icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.67497 11.0665C6.10997 8.504 5.59663 4.744 6.96413 1.6665C5.93913 2.00817 5.08413 2.6915 4.22997 3.5465C3.41765 4.35218 2.7729 5.31073 2.33291 6.36684C1.89291 7.42295 1.66638 8.55573 1.66638 9.69984C1.66638 10.8439 1.89291 11.9767 2.33291 13.0328C2.7729 14.0889 3.41765 15.0475 4.22997 15.8532C7.6483 19.2715 12.9466 19.1007 16.365 15.6823C17.22 14.8273 17.9033 13.9732 18.245 12.9473C14.9983 14.144 11.2375 13.6307 8.6733 11.0673" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {isExpand && (
              <span className="text-sm font-medium">Dark</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}