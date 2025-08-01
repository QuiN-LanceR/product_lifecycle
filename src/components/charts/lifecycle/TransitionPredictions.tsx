"use client";
import React, { useEffect, useState } from 'react';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../ui/dropdown/Dropdown";

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
    if (probability >= 0.8) return 'bg-green-500';
    if (probability >= 0.6) return 'bg-yellow-500';
    if (probability >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
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
      'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
    };
    return colors[stage] || 'bg-gradient-to-b from-gray-500 to-gray-700 text-white';
  };

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Segments</option>
            {data.data.segments.map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
          
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {data.data.stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {/* Predictions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPredictions.map((prediction, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageBadgeColor(prediction.fromStage)}`}>
                      {prediction.fromStage}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageBadgeColor(prediction.toStage)}`}>
                      {prediction.toStage}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {prediction.segment}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getProbabilityColor(prediction.probability)}`}></div>
                      <span className={`text-sm font-medium ${getProbabilityTextColor(prediction.probability)}`}>
                        {Math.round(prediction.probability * 100)}% probability
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ~{prediction.expectedDays} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}