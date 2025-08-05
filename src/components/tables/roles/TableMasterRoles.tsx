"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditRoleForm from "@/components/roles/EditRolesForm";
import AddRoleForm from "@/components/roles/AddRolesForm";
import { Pencil, Trash, Search, X, Shield, Plus, Calendar } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Role = {
  id: number;
  nama_role: string;
  created_at: string;
};

// Skeleton Loading Component
const SkeletonRow = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-900 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-indigo-300 dark:bg-indigo-600 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default function TableMasterRoles({ currentPage, onTotalChange }: Props) {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [roles, setRoles] = useState<Role[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRole = user?.role;

  // Optimized debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/roles/master?page=${currentPage}&search=${debouncedSearchQuery}`
      );
      const data = await res.json();
      setRoles(data.roles);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = useCallback(async (roleName: string, id: number) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: `Role dengan nama: ${roleName} akan dihapus permanen`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/roles/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id })
        });

        const data = await res.json();

        if (data.success) {          
          Swal.fire('Berhasil!', 'Role berhasil dihapus.', 'success').then(() => {
            fetchRoles();
          });
        } else {
          Swal.fire('Gagal', data.message, 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Terjadi kesalahan pada server.', 'error');
        console.log(err);
      }
    }
  }, [fetchRoles]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    openModal();
  };

  const handleCloseEdit = () => {
    setEditingRole(null);
    closeModal();
  };

  const handleEditSuccess = () => {
    fetchRoles();
    handleCloseEdit();
  };

  const handleAddRole = () => {
    setEditingRole(null);
    openModal();
  };

  return ( 
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-800 dark:via-indigo-900 dark:to-indigo-950 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Master Role</h2>
              <p className="text-indigo-100">Kelola peran dan hak akses pengguna</p>
            </div>
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={handleAddRole}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Role</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari role..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {debouncedSearchQuery !== searchQuery && (
          <div className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
            <span>Mencari &quot;{searchQuery}&quot;...</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {debouncedSearchQuery ? "Role tidak ditemukan" : "Belum ada role"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {debouncedSearchQuery 
              ? `Tidak ada role yang cocok dengan "${debouncedSearchQuery}"`
              : "Mulai dengan menambahkan role pertama"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role, idx) => (
            <div key={role.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {(currentPage - 1) * 10 + idx + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {role.nama_role}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Dibuat: {role.created_at
                            ? new Date(role.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long", 
                                year: "numeric",
                              })
                            : "-"
                          }
                        </span>
                      </div>
                    </div>
                  </div>                  
                  {currentRole === 'Admin' && (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(role)}
                        className="group relative p-3 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300/60 dark:hover:border-orange-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        title="Edit Role"
                      >
                        <Pencil className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.nama_role, role.id)}
                        className="group relative p-3 hover:bg-red-100/60 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300/60 dark:hover:border-red-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        title="Delete Role"
                      >
                        <Trash className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal */}
      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={closeModal} 
          className="max-w-2xl"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            {editingRole ? (
              <EditRoleForm 
                role={editingRole} 
                onSuccess={handleEditSuccess} 
                onCancel={handleCloseEdit} 
              />
            ) : (            
              <AddRoleForm 
                onSuccess={() => {
                  fetchRoles();
                  closeModal();
                }} 
                onCancel={closeModal} 
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}