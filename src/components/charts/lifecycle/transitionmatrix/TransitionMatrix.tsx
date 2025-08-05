"use client";
import React, { useState, useEffect } from 'react';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../../ui/dropdown/Dropdown";
import { ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import TransitionMatrixModal from './TransitionMatrixModal';

interface TransitionMatrixData {
  stages: string[];
  segments: string[];
  matrixData: number[][];
  lastUpdated: string;
}

export default function TransitionMatrix() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('Semua Segmen');
  const [selectedStage, setSelectedStage] = useState('Semua Tahap');
  const [segmentDropdownOpen, setSegmentDropdownOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [data, setData] = useState<TransitionMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState('');
  const [modalSegment, setModalSegment] = useState('');
  const [modalCount, setModalCount] = useState(0);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/lifecycle/transition-matrix');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to fetch data');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data berdasarkan selection
  const getFilteredData = () => {
    if (!data) return { stages: [], segments: [], matrixData: [] };
    
    let filteredStages = data.stages;
    let filteredSegments = data.segments;
    let filteredMatrixData = data.matrixData;
    
    // Filter stages
    if (selectedStage !== 'Semua Tahap') {
      const stageIndex = data.stages.indexOf(selectedStage);
      if (stageIndex !== -1) {
        filteredStages = [selectedStage];
        filteredMatrixData = [data.matrixData[stageIndex]];
      }
    }
    
    // Filter segments
    if (selectedSegment !== 'Semua Segmen') {
      const segmentIndex = data.segments.indexOf(selectedSegment);
      if (segmentIndex !== -1) {
        filteredSegments = [selectedSegment];
        filteredMatrixData = filteredMatrixData.map(row => [row[segmentIndex]]);
      }
    }
    
    return {
      stages: filteredStages,
      segments: filteredSegments,
      matrixData: filteredMatrixData
    };
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const getIntensityColor = (value: number): string => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (value <= 2) return 'bg-cyan-100 dark:bg-cyan-900/30';
    if (value <= 5) return 'bg-cyan-200 dark:bg-cyan-800/50';
    if (value <= 9) return 'bg-cyan-300 dark:bg-cyan-700/70';
    return 'bg-cyan-500 dark:bg-cyan-500/90';
  };

  const getTextColor = (value: number): string => {
    if (value === 0) return 'text-gray-500 dark:text-gray-400';
    if (value <= 5) return 'text-gray-700 dark:text-gray-200';
    return 'text-white';
  };

  const handleCellClick = (stage: string, segment: string, count: number) => {
    if (count > 0) {
      setModalStage(stage);
      setModalSegment(segment);
      setModalCount(count);
      setModalOpen(true);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        segment: selectedSegment,
        stage: selectedStage
      });
      
      const response = await fetch(`/api/lifecycle/transition-matrix/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transition-matrix-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      closeDropdown();
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        segment: selectedSegment,
        stage: selectedStage
      });
      
      const response = await fetch(`/api/lifecycle/transition-matrix/export-pdf?${params}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transition-matrix-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      closeDropdown();
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stages, segments, matrixData } = getFilteredData();

  return (
    <>
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
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
              <button onClick={toggleDropdown} className="dropdown-toggle">
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" />
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
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Excel'}
                </DropdownItem>
                <DropdownItem
                  onItemClick={handleExportPDF}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
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
                        setSelectedSegment('Semua Segmen');
                        setSegmentDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      Semua Segmen
                    </button>
                    {data?.segments.map((segment) => (
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
                        setSelectedStage('Semua Tahap');
                        setStageDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      Semua Tahap
                    </button>
                    {data?.stages.map((stage) => (
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

        {/* Matrix Table */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"></th>
                  {segments.map((segment) => (
                    <th key={segment} className="text-center p-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 min-w-[80px]">
                      <div className="truncate" title={segment}>
                        {segment}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, stageIndex) => (
                  <tr key={stage} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] border-r border-gray-200 dark:border-gray-700">
                      <div className="truncate" title={stage}>
                        {stage}
                      </div>
                    </td>
                    {segments.map((segment, segmentIndex) => {
                      const value = matrixData[stageIndex][segmentIndex];
                      return (
                        <td key={segment} className="p-1 text-center">
                          <div 
                            className={`w-20 h-10 flex items-center justify-center rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-600 ${
                              getIntensityColor(value)
                            } ${getTextColor(value)} transition-all duration-200 hover:scale-105 hover:shadow-md mx-auto ${
                              value > 0 ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            onClick={() => handleCellClick(stage, segment, value)}
                            title={value > 0 ? `Klik untuk melihat detail ${value} produk` : ''}
                          >
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
          
          {/* Color Scale Legend */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
            <div className="flex border border-gray-200 dark:border-gray-600 rounded">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600"></div>
              <div className="w-4 h-4 bg-cyan-100 dark:bg-cyan-900/30 border-r border-gray-200 dark:border-gray-600"></div>
              <div className="w-4 h-4 bg-cyan-200 dark:bg-cyan-800/50 border-r border-gray-200 dark:border-gray-600"></div>
              <div className="w-4 h-4 bg-cyan-300 dark:bg-cyan-700/70 border-r border-gray-200 dark:border-gray-600"></div>
              <div className="w-4 h-4 bg-cyan-400 dark:bg-cyan-600/80 border-r border-gray-200 dark:border-gray-600"></div>
              <div className="w-4 h-4 bg-cyan-500 dark:bg-cyan-500/90"></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">9+</span>
          </div>
          
          {/* Update Info */}
          <div className="mt-3 flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Terakhir diperbarui: {data?.lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <TransitionMatrixModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stage={modalStage}
        segment={modalSegment}
        count={modalCount}
      />
    </>
  );
}