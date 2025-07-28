"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditStagesForm from "../../stage/EditStagesForm";
import AddStagesForm from "../../stage/AddStagesForm";
import { Pencil, Trash, Search, X } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Stage = {
  id: number;
  stage: string;
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
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder, onTotalChange]);

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

  const getSortIcon = (field: keyof Stage) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
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

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-4 py-2 border-r text-center">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </td>
    </tr>
  );

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari stage..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
        
        {currentRole === 'Admin' && (
          <Button
            onClick={handleAddStage}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
          >
            + Add Stage
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-white/20">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-white/20">
                No
              </th>
              <th 
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center justify-between">
                  Nama Stage
                  <span className="ml-1">{getSortIcon('stage')}</span>
                </div>
              </th>
              <th 
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-white/20 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center justify-between">
                  Created At
                  <span className="ml-1">{getSortIcon('created_at')}</span>
                </div>
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonRow key={idx} />
            ))
          ) : stages.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {debouncedSearchQuery ? 
                  `Tidak ada stage yang ditemukan untuk "${debouncedSearchQuery}"` : 
                  "Belum ada data stage"
                }
              </td>
            </tr>
          ) : (
            stages.map((stage, idx) => (
              <tr key={stage.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b border-gray-300 dark:border-white/20 
               hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{(currentPage - 1) * 10 + idx + 1}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{stage.stage}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
                  {stage.created_at
                    ? new Date(stage.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"
                  }
                </td>
                <td className="px-4 py-2 border-r text-center">
                  {currentRole === 'Admin' ? (
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(stage)}
                        className="text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 border border-green-700 dark:border-green-300 transition-colors"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(stage.id)}
                        className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 border border-red-700 dark:border-red-300 transition-colors"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Tidak ada aksi</span>
                  )}
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      <Modal 
      isOpen={isOpen} 
      onClose={handleCloseEdit} 
      className="max-w-md p-5">
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