/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useState } from 'react';
import { ChevronDownIcon, PDFLight, PDFDark, ExcelIcon } from '../../../../icons';

interface TransitionSpeedAnalysisHeaderProps {
  // Hapus props yang tidak diperlukan
}

const TransitionSpeedAnalysisHeader: React.FC<TransitionSpeedAnalysisHeaderProps> = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExportType('excel');
      
      const response = await fetch(`/api/lifecycle/transition-speed/export?unit=months&type=duration`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transition-speed-analysis-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
      setIsDropdownOpen(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      
      const response = await fetch('/api/lifecycle/transition-speed/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeUnit: 'months', analysisType: 'duration' })
      });
      
      if (!response.ok) {
        throw new Error('PDF export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transition-speed-analysis-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Transition Speed Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Analysis of product lifecycle transition speeds and efficiency
        </p>
      </div>
      
      <div className="flex items-center">
        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting {exportType === 'excel' ? 'Excel' : 'PDF'}...
              </>
            ) : (
              <>
                Export Data
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
          
          {isDropdownOpen && !isExporting && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <ExcelIcon className="mr-3 h-4 w-4 text-green-600" />
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  {isDark ? (
                    <PDFDark className="mr-3 h-4 w-4" />
                  ) : (
                    <PDFLight className="mr-3 h-4 w-4" />
                  )}
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransitionSpeedAnalysisHeader;