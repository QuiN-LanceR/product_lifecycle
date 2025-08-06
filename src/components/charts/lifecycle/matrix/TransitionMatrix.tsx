"use client";
import React, { useState, useEffect } from 'react';
import TransitionMatrixHeader from './TransitionMatrixHeader';
import TransitionMatrixChart from './TransitionMatrixChart';
import TransitionMatrixModal from './TransitionMatrixModal';

interface TransitionMatrixData {
  stages: string[];
  segments: string[];
  matrixData: number[][];
  lastUpdated: string;
}

export default function TransitionMatrix() {
  const [selectedSegment, setSelectedSegment] = useState('Semua Segmen');
  const [selectedStage, setSelectedStage] = useState('Semua Tahap');
  const [data, setData] = useState<TransitionMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);
  const [isDark, setIsDark] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState('');
  const [modalSegment, setModalSegment] = useState('');
  const [modalCount, setModalCount] = useState(0);

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

  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportType('excel');
    
    try {
      const params = new URLSearchParams();
      if (selectedSegment !== 'Semua Segmen') {
        params.append('segment', selectedSegment);
      }
      if (selectedStage !== 'Semua Tahap') {
        params.append('stage', selectedStage);
      }
      
      const response = await fetch(`/api/lifecycle/transition-matrix/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'transition-matrix.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    
    try {
      const params = new URLSearchParams();
      if (selectedSegment !== 'Semua Segmen') {
        params.append('segment', selectedSegment);
      }
      if (selectedStage !== 'Semua Tahap') {
        params.append('stage', selectedStage);
      }
      
      const response = await fetch(`/api/lifecycle/transition-matrix/export-pdf?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'transition-matrix.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleCellClick = (stage: string, segment: string, value: number) => {
    if (value > 0) {
      setModalStage(stage);
      setModalSegment(segment);
      setModalCount(value);
      setModalOpen(true);
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
        <TransitionMatrixHeader
          selectedSegment={selectedSegment}
          selectedStage={selectedStage}
          segments={data?.segments || []}
          stages={data?.stages || []}
          onSegmentChange={setSelectedSegment}
          onStageChange={setSelectedStage}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
          exportType={exportType}
          isDark={isDark}
        />
        
        <TransitionMatrixChart
          stages={stages}
          segments={segments}
          matrixData={matrixData}
          lastUpdated={data?.lastUpdated || ''}
          onCellClick={handleCellClick}
        />
      </div>

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