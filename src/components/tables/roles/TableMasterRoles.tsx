"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditRolesForm from "../../roles/EditRolesForm";
import AddRolesForm from "../../roles/AddRolesForm";
import { Pencil, Trash } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type Role = {
  id: number;
  role: string;
  created_at?: string;
  updated_at?: string;
};

export default function TableMasterRoles({ currentPage, onTotalChange }: Props) {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [roles, setRoles] = useState<Role[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Role | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentRole = user?.role;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/roles/master?page=${currentPage}&search=${debouncedSearchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setRoles(data.roles);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder, onTotalChange]);

  const handleSort = (field: keyof Role) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: keyof Role) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " 🔼" : " 🔽";
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (roleName: string, id: number) => {
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
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) { 
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="w-64 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="w-full border-2 border-gray-300 rounded overflow-hidden">
          <div className="h-12 bg-gray-200 w-full mb-2"></div>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex w-full mb-2">
              {[...Array(4)].map((_, cellIdx) => (
                <div key={cellIdx} className="h-12 bg-gray-100 flex-1 mx-1 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

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
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari role..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <Button onClick={handleAddRole} className="bg-blue-600 hover:bg-blue-500 text-white">
          + Add Role
        </Button>
      </div>

      {debouncedSearchQuery !== searchQuery && (
        <div className="text-sm text-gray-500 mb-2">
          Mencari &quot;{searchQuery}&quot;...
        </div>
      )}

      <table className="min-w-full table-auto border-2 border-gray-400 dark:border-white/30 rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white font-semibold border-b-4 border-gray-400 dark:border-white/30">
            <th className="px-4 py-2 text-left">No</th>
            <th onClick={() => handleSort("role")} className="cursor-pointer px-4 py-2 text-left hover:bg-gray-300 dark:hover:bg-gray-800">
              Role {renderSortIcon("role")}
            </th>
            <th onClick={() => handleSort("created_at")} className="cursor-pointer px-4 py-2 text-left hover:bg-gray-300 dark:hover:bg-gray-800">
              Created At {renderSortIcon("created_at")}
            </th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                {debouncedSearchQuery ? `Tidak ada role yang ditemukan untuk "${debouncedSearchQuery}"` : "Tidak ada data role"}
              </td>
            </tr>
          ) : (
            roles.map((role, idx) => (
              <tr key={role.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b border-gray-300 dark:border-white/20 
               hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{(currentPage - 1) * 10 + idx + 1}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{role.role}</td>
                <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">
                  {role.created_at ? new Date(role.created_at).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-2 border-r text-center">
                  {currentRole === 'Admin' ? (
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        className="text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 border border-green-700 dark:border-green-300 transition-colors"
                        onClick={() => handleEdit(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 border border-red-700 dark:border-red-300 transition-colors"
                        onClick={() => handleDelete(role.role, role.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm italic text-gray-400">No Action</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={closeModal} 
          className="max-w-md p-5"
        >
          {editingRole ? (
            <EditRolesForm 
              role={editingRole} 
              onSuccess={handleEditSuccess} 
              onCancel={handleCloseEdit} 
            />
          ) : (            
            <AddRolesForm 
              onSuccess={() => {
                fetchRoles();
                closeModal();
              }} 
              onCancel={closeModal} 
            />
          )}
        </Modal>
      )}
    </div>
  );
}