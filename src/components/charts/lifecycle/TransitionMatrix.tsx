"use client";
import React, { useState } from 'react';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { ChevronDown } from 'lucide-react';

export default function TransitionMatrix() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('Semua Segmen');
  const [selectedStage, setSelectedStage] = useState('Semua Tahap');
  const [segmentDropdownOpen, setSegmentDropdownOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Sample data for transition matrix
  const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
  const segments = ['Kit & EP', 'Transmisi', 'Distribusi', 'Korporat', 'PP'];
  
  const matrixData = [
    [0, 4, 2, 6, 1],
    [3, 3, 3, 9, 1], 
    [2, 9, 1, 7, 8],
    [7, 0, 1, 2, 6]
  ];

  const getIntensityColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (value <= 2) return 'bg-cyan-100 dark:bg-cyan-900/30';
    if (value <= 4) return 'bg-cyan-200 dark:bg-cyan-800/50';
    if (value <= 6) return 'bg-cyan-300 dark:bg-cyan-700/70';
    if (value <= 8) return 'bg-cyan-400 dark:bg-cyan-600/80';
    return 'bg-cyan-500 dark:bg-cyan-500/90';
  };

  const getTextColor = (value: number) => {
    if (value === 0) return 'text-gray-500 dark:text-gray-400';
    if (value <= 4) return 'text-gray-700 dark:text-gray-200';
    return 'text-white';
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 h-fit max-h-[500px]">
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Transition Matrix
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualization of product transitions between lifecycle stages vs segmentation
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Filter Section - Lebih Kompak */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </span>
          
          {/* Segment Filter */}
          <div className="relative">
            <button
              onClick={() => setSegmentDropdownOpen(!segmentDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {selectedSegment}
              <ChevronDown className="w-3 h-3" />
            </button>
            {segmentDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setSelectedSegment('Semua Segmen');
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
                        setSelectedSegment(segment);
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
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {selectedStage}
              <ChevronDown className="w-3 h-3" />
            </button>
            {stageDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setSelectedStage('Semua Tahap');
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
                        setSelectedStage(stage);
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

      {/* Matrix Table - Ukuran Lebih Kompak */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-1"></th>
                {segments.map((segment) => (
                  <th key={segment} className="text-center p-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {segment}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, stageIndex) => (
                <tr key={stage}>
                  <td className="p-1 text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                    {stage}
                  </td>
                  {segments.map((segment, segmentIndex) => {
                    const value = matrixData[stageIndex][segmentIndex];
                    return (
                      <td key={segment} className="p-0.5">
                        <div className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${
                          getIntensityColor(value)
                        } ${getTextColor(value)}`}>
                          {value}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Color Scale Legend - Lebih Kompak */}
        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
          <div className="flex">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700"></div>
            <div className="w-3 h-3 bg-cyan-100 dark:bg-cyan-900/30"></div>
            <div className="w-3 h-3 bg-cyan-200 dark:bg-cyan-800/50"></div>
            <div className="w-3 h-3 bg-cyan-300 dark:bg-cyan-700/70"></div>
            <div className="w-3 h-3 bg-cyan-400 dark:bg-cyan-600/80"></div>
            <div className="w-3 h-3 bg-cyan-500 dark:bg-cyan-500/90"></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">9+</span>
        </div>
        
        {/* Update Info */}
        <div className="mt-2 flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Terendah diperbarui: 21/07/2023, 04.15.27</span>
        </div>
      </div>
    </div>
  );
}