"use client";
import React, { useState } from 'react';
import { PDFLight, PDFDark, ExcelIcon } from "@/icons";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../../ui/dropdown/Dropdown";
import { ChevronDown } from 'lucide-react';

interface TransitionMatrixHeaderProps {
  selectedSegment: string;
  selectedStage: string;
  segments: string[];
  stages: string[];
  onSegmentChange: (segment: string) => void;
  onStageChange: (stage: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  exportType: 'excel' | 'pdf' | null;
  isDark: boolean;
}

export default function TransitionMatrixHeader({
  selectedSegment,
  selectedStage,
  segments,
  stages,
  onSegmentChange,
  onStageChange,
  onExportExcel,
  onExportPDF,
  isExporting,
  exportType,
  isDark
}: TransitionMatrixHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [segmentDropdownOpen, setSegmentDropdownOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleExportExcel = () => {
    onExportExcel();
    closeDropdown();
  };

  const handleExportPDF = () => {
    onExportPDF();
    closeDropdown();
  };

  return (
    <div className="px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Transition Matrix
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualization of product transitions between lifecycle stages vs segmentation
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
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
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-48 p-2"
          >
            <DropdownItem
              onItemClick={handleExportExcel}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <ExcelIcon className="w-4 h-4 mr-2 text-green-600" />
              {isExporting && exportType === 'excel' ? 'Exporting...' : 'Export Excel'}
            </DropdownItem>
            <DropdownItem
              onItemClick={handleExportPDF}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {isDark ? (
                <PDFDark className="w-4 h-4 mr-2" />
              ) : (
                <PDFLight className="w-4 h-4 mr-2" />
              )}
              {isExporting && exportType === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter:
        </span>
        
        {/* Segment Filter */}
        <div className="relative">
          <button
            onClick={() => setSegmentDropdownOpen(!segmentDropdownOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {selectedSegment}
            <ChevronDown className="w-3 h-3" />
          </button>
          {segmentDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
              <div className="p-1">
                <button
                  onClick={() => {
                    onSegmentChange('Semua Segmen');
                    setSegmentDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                  Semua Segmen
                </button>
                {segments.map((segment) => (
                  <button
                    key={segment}
                    onClick={() => {
                      onSegmentChange(segment);
                      setSegmentDropdownOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {segment}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stage Filter */}
        <div className="relative">
          <button
            onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {selectedStage}
            <ChevronDown className="w-3 h-3" />
          </button>
          {stageDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
              <div className="p-1">
                <button
                  onClick={() => {
                    onStageChange('Semua Tahap');
                    setStageDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                  Semua Tahap
                </button>
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => {
                      onStageChange(stage);
                      setStageDropdownOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}