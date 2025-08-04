"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { Activity, MapPin, Monitor, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityLogItem {
  id: number;
  activity_type: string;
  activity_description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchActivityLog = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/activity-log?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivityLog(currentPage);
    }
  }, [isOpen, currentPage]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
          <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>;
      case 'logout':
        return <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
          <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>;
      case 'password_change':
        return <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>;
      default:
        return <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
          <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'logout':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'password_change':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] m-4">
      <div className="relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-100 p-3 dark:bg-brand-900/30">
                <Activity className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Log Aktivitas
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Riwayat aktivitas akun Anda
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivityLog(currentPage)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="group rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-brand-900/10"
                >
                  <div className="flex items-start gap-4">
                    {getActivityIcon(activity.activity_type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.activity_type)}`}>
                          {activity.activity_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(activity.created_at), 'dd MMM yyyy, HH:mm')}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        {activity.activity_description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{activity.ip_address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {activity.user_agent.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} aktivitas
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={!pagination.hasPrevPage || loading}
              >
                Sebelumnya
              </Button>
              
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}