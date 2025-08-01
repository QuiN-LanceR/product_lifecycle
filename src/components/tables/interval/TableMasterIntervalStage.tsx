"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditIntervalStageForm from "../../interval/EditIntervalStageForm";
import AddIntervalStageForm from "../../interval/AddIntervalStageForm";
import { Pencil, Trash, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type IntervalStage = {
  id: number;
  id_stage_previous: number;
  id_stage_next: number;
  stage_previous_name: string;
  stage_next_name: string;
  interval: number;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
};

export default function TableMasterIntervalStage({ currentPage, onTotalChange }: Props) {
  const [intervalStages, setIntervalStages] = useState<IntervalStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIntervalStage, setEditingIntervalStage] = useState<IntervalStage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useUser();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentRole = user?.role;

  // Fungsi untuk styling badge stage (sama seperti di dashboard/all)
  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
      'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
      'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
      'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
    };
    return colors[stage] || 'bg-gradient-to-b from-gray-500 to-gray-700 text-white';
  };

  const fetchIntervalStages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchQuery,
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/interval/master?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setIntervalStages(data.data || []);
        onTotalChange(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching interval stages:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchIntervalStages();
  }, [fetchIntervalStages]);

  const handleAdd = () => {
    setEditingIntervalStage(null);
    openModal();
  };

  const handleEdit = (intervalStage: IntervalStage) => {
    setEditingIntervalStage(intervalStage);
    openModal();
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Data interval stage akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/interval/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Interval stage berhasil dihapus!'
          });
          fetchIntervalStages();
        } else {
          throw new Error(data.message || 'Gagal menghapus interval stage');
        }
      } catch (error) {
        console.error('Error deleting interval stage:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'Gagal menghapus interval stage'
        });
      }
    }
  };

  const handleSuccess = () => {
    closeModal();
    fetchIntervalStages();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
    </tr>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari interval stage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {(currentRole == "Admin") && (
          <Button onClick={handleAdd} className="whitespace-nowrap">
            + Tambah Interval Stage
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  {getSortIcon('id')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('stage_previous_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Stage Previous</span>
                  {getSortIcon('stage_previous_name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('stage_next_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Stage Next</span>
                  {getSortIcon('stage_next_name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('interval')}
              >
                <div className="flex items-center space-x-1">
                  <span>Interval (Bulan)</span>
                  {getSortIcon('interval')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Keterangan
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Dibuat</span>
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : intervalStages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Tidak ada data yang ditemukan' : 'Belum ada data interval stage'}
                </td>
              </tr>
            ) : (
              intervalStages.map((intervalStage) => (
                <tr key={intervalStage.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {intervalStage.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] ${getStageBadgeColor(intervalStage.stage_previous_name)}`}>
                      {intervalStage.stage_previous_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] ${getStageBadgeColor(intervalStage.stage_next_name)}`}>
                      {intervalStage.stage_next_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {intervalStage.interval} bulan
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {intervalStage.keterangan || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(intervalStage.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {currentRole === 'Admin' ? (
                        <div className="flex justify-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleEdit(intervalStage)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg 
                                    shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <Pencil size={16} />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleDelete(intervalStage.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg 
                                    shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <Trash size={16} />
                        </Button>
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm italic">No Action</span>
                    )}
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl">
        <div className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingIntervalStage ? "Edit Interval Stage" : "Tambah Interval Stage"}
          </h2>
          {editingIntervalStage ? (
            <EditIntervalStageForm
              intervalStage={editingIntervalStage}
              onSuccess={handleSuccess}
              onCancel={closeModal}
            />
          ) : (
            <AddIntervalStageForm
              onSuccess={handleSuccess}
              onCancel={closeModal}
            />
          )}
        </div>
      </Modal>
    </>
  );
}