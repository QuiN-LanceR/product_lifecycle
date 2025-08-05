"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditStagesForm from "../../stage/EditStagesForm";
import AddStagesForm from "../../stage/AddStagesForm";
import { Pencil, Trash, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';
import Image from "next/image";

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Stage = {
  id: number;
  stage: string;
  icon_light?: string;
  icon_dark?: string;
  created_at?: string;
  updated_at?: string;
};

export default function TableMasterStages({ currentPage, onTotalChange }: Props) {
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [stages, setStages] = useState<Stage[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Stage | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentRole = user?.role;

  const getSortIcon = (field: keyof Stage) => {
    if (sortBy !== field) return <ChevronUp className="h-4 w-4 text-gray-400" />;
    return sortOrder === "asc" ? 
      <ChevronUp className="h-4 w-4 text-blue-500" /> : 
      <ChevronDown className="h-4 w-4 text-blue-500" />;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-8"></div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-24"></div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-20"></div>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStages = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/stages/master?page=${currentPage}&search=${debouncedSearchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setStages(data.stages);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching stages:", error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const handleSort = (field: keyof Stage) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data stage akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/stages/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        if (data.success) {
          Swal.fire('Terhapus!', 'Stage berhasil dihapus.', 'success');
          fetchStages();
        } else {
          Swal.fire('Error!', data.message, 'error');
        }
      } catch (error) {
        console.error('Error deleting stage:', error);
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus stage.', 'error');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleEdit = (stage: Stage) => {
    setEditingStage(stage);
    openModal();
  };

  const handleCloseEdit = () => {
    setEditingStage(null);
    closeModal();
  };

  const handleEditSuccess = () => {
    fetchStages();
    handleCloseEdit();
  };

  const handleAddStage = () => {
    setEditingStage(null);
    openModal();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari stage..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={handleAddStage}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                       text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              + Add Stage
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  No
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider 
                           cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center justify-between">
                    <span>Nama Stage</span>
                    <span className="ml-2 group-hover:text-blue-500 transition-colors">{getSortIcon('stage')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Light Icon
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dark Icon
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider 
                           cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center justify-between">
                    <span>Created At</span>
                    <span className="ml-2 group-hover:text-blue-500 transition-colors">{getSortIcon('created_at')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonRow key={idx} />
              ))
            ) : stages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {debouncedSearchQuery ? 
                        `Tidak ada stage yang ditemukan untuk "${debouncedSearchQuery}"` : 
                        "Belum ada data stage"
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              stages.map((stage, idx) => (
                <tr key={stage.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * 10 + idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {stage.stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {stage.icon_light ? (
                      <div className="flex justify-center">
                        <Image 
                          src={`/images/product/stage/${stage.icon_light}`} 
                          alt={`${stage.stage} light icon`}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400" style={{display: 'none'}}>
                          N/A
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          N/A
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {stage.icon_dark ? (
                      <div className="flex justify-center">
                        <Image 
                          src={`/images/product/stage/${stage.icon_dark}`} 
                          alt={`${stage.stage} dark icon`}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400" style={{display: 'none'}}>
                          N/A
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          N/A
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stage.created_at
                      ? new Date(stage.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {currentRole === 'Admin' ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(stage)}
                          className="group relative p-3 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300/60 dark:hover:border-orange-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                          title="Edit Stage"
                        >
                          <Pencil className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                        </button>
                        <button
                          onClick={() => handleDelete(stage.id)}
                          className="group relative p-3 hover:bg-red-100/60 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300/60 dark:hover:border-red-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                          title="Delete Stage"
                        >
                          <Trash className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Tidak ada aksi</span>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseEdit} 
        className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
      >
        {editingStage ? (
          <EditStagesForm
            stage={editingStage}
            onSuccess={handleEditSuccess}
            onCancel={handleCloseEdit}
          />
        ) : (
          <AddStagesForm
            onSuccess={handleEditSuccess}
            onCancel={handleCloseEdit}
          />
        )}
      </Modal>
    </div>
  );
}