"use client";
import React, { useEffect, useState } from 'react';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../../ui/dropdown/Dropdown";

interface PredictionData {
  fromStage: string;
  toStage: string;
  segment: string;
  probability: number;
  expectedDays: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    predictions: PredictionData[];
    stages: string[];
    segments: string[];
  };
}

export default function TransitionPredictions() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/lifecycle/transition-predictions');
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError('Failed to fetch prediction data');
        }
      } catch (err) {
        setError('Error fetching data');
        console.log(err)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'bg-green-500 dark:bg-green-400';
    if (probability >= 0.6) return 'bg-yellow-500 dark:bg-yellow-400';
    if (probability >= 0.4) return 'bg-orange-500 dark:bg-orange-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const getProbabilityTextColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-700 dark:text-green-300';
    if (probability >= 0.6) return 'text-yellow-700 dark:text-yellow-300';
    if (probability >= 0.4) return 'text-orange-700 dark:text-orange-300';
    return 'text-red-700 dark:text-red-300';
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            
            {/* Filter skeleton */}
            <div className="flex gap-4 mb-4">
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            
            {/* Predictions list skeleton */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredPredictions = data.data.predictions.filter(pred => {
    const segmentMatch = selectedSegment === 'all' || pred.segment === selectedSegment;
    const stageMatch = selectedStage === 'all' || pred.fromStage === selectedStage;
    return segmentMatch && stageMatch;
  });

  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 text-white shadow-lg',
      'Growth': 'bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 text-white shadow-lg',
      'Maturity': 'bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 text-white shadow-lg',
      'Decline': 'bg-gradient-to-r from-red-400 to-red-600 dark:from-red-500 dark:to-red-700 text-white shadow-lg'
    };
    return colors[stage] || 'bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700 text-white shadow-lg';
  };

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Transition Predictions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualization of product transactions between lifecycle stages vs segmentation
            </p>
          </div>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <MoreDotIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            {isOpen && (
              <Dropdown isOpen onClose={closeDropdown}>
                <DropdownItem onClick={() => console.log('Export')}>Export Data</DropdownItem>
                <DropdownItem onClick={() => console.log('Refresh')}>Refresh</DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="all">All Segments</option>
            {data?.data.segments.map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
          
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="all">All Stages</option>
            {data?.data.stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredPredictions.map((prediction, index) => (
            <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getStageBadgeColor(prediction.fromStage)}`}>
                      {prediction.fromStage}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getStageBadgeColor(prediction.toStage)}`}>
                      {prediction.toStage}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-lg shadow-sm">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                  {prediction.segment}
                </span>
              </div>
              
              {/* Metrics Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                  <div className={`w-4 h-4 rounded-full ${getProbabilityColor(prediction.probability)} shadow-sm`}></div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Probability</p>
                    <p className={`text-lg font-bold ${getProbabilityTextColor(prediction.probability)}`}>
                      {Math.round(prediction.probability * 100)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 shadow-sm"></div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Duration</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {prediction.expectedDays} days
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Transition Confidence</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(prediction.probability * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProbabilityColor(prediction.probability)}`}
                    style={{ width: `${prediction.probability * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Hover Effect Indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {filteredPredictions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Predictions Found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}