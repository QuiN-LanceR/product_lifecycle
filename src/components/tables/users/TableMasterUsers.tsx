"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import EditUserForm from "@/components/users/EditUserForm";
import AddUserForm from "../../users/AddUserForm";
import { Pencil, Trash, Search, X, Users, Plus, Calendar, Mail, User, Shield } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Image from "next/image";
import Swal from 'sweetalert2';

interface Props {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}

type User = {
  id: number;
  fullname: string;
  username: string;
  email: string;
  photo: string;
  role: string;
  jabatan: string;
};

// Skeleton Loading Component
const SkeletonRow = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Avatar Skeleton dengan nomor */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-800 rounded-full"></div>
        </div>
        
        {/* User Info Skeleton */}
        <div className="space-y-2">
          {/* Name with icon */}
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-blue-200 dark:bg-blue-700 rounded"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
          </div>
          
          {/* Grid info skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Email */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            {/* Username */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            {/* Role */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 bg-blue-100 dark:bg-blue-900 rounded-full w-16"></div>
            </div>
            {/* Jabatan */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-700 rounded-lg"></div>
        <div className="w-8 h-8 bg-red-200 dark:bg-red-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default function TableMasterUsers({ currentPage, onTotalChange }: Props) {
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUsers = user?.username;
  const currentRole = user?.role;

  // Optimized debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Reduced from 1000ms to 500ms for better UX

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Memoized fetch function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(
        `/api/users/master?page=${currentPage}&search=${debouncedSearchQuery}`
      );
      const data = await res.json();
      setUsers(data.users);
      onTotalChange(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Optimized delete handler
  const handleDelete = useCallback(async (fullname: string, id: number) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: `User dengan Nama: ${fullname} akan dihapus permanen`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/users/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id })
        });

        const data = await res.json();

        if (data.success) {          
          Swal.fire('Berhasil!', 'User berhasil dihapus.', 'success').then(() => {
            fetchUsers();
          });
        } else {
          Swal.fire('Gagal', data.message, 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Terjadi kesalahan pada server.', 'error');
        console.log(err);
      }
    }
  }, [fetchUsers]);
  
  // Optimized search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Optimized clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Optimized loading state
  if (loading) { 
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        <div className="w-full border-2 border-gray-300 dark:border-gray-700 rounded overflow-hidden">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 w-full mb-2"></div>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex w-full mb-2">
              {[...Array(8)].map((_, cellIdx) => (
                <div key={cellIdx} className="h-12 bg-gray-100 dark:bg-gray-600 flex-1 mx-1 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleEdit = (user: User) => {
    setEditingUser(user);
    openModal();
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    closeModal();
  };

  const handleEditSuccess = () => {
    fetchUsers();
    handleCloseEdit();
  };

  return (   
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Master Users</h2>
              <p className="text-blue-100">Kelola data pengguna sistem</p>
            </div>
          </div>
          
          {currentRole === 'Admin' && (
            <Button
              onClick={() => {
                setEditingUser(null); 
                openModal();
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah User</span>
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
            placeholder="Cari user..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
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
          <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
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
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {debouncedSearchQuery ? "User tidak ditemukan" : "Belum ada user"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {debouncedSearchQuery 
              ? `Tidak ada user yang cocok dengan "${debouncedSearchQuery}"`
              : "Mulai dengan menambahkan user pertama"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user, idx) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {user.photo ? (
                        <Image
                          src={`/images/user/${user.photo}`}
                          alt={user.fullname}
                          className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 dark:border-blue-800 shadow-lg"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {user.fullname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        {(currentPage - 1) * 10 + idx + 1}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {user.fullname}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>@{user.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{user.jabatan}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {currentUsers !== user.username && currentRole === 'Admin' && (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(user)}
                        className="group relative p-3 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300/60 dark:hover:border-orange-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.fullname, user.id)}
                        className="group relative p-3 hover:bg-red-100/60 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300/60 dark:hover:border-red-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        title="Delete User"
                      >
                        <Trash className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                      </button>
                    </div>
                  )}
                  
                  {(currentUsers === user.username || currentRole !== 'Admin') && (
                    <div className="text-sm text-gray-400 italic">
                      {currentUsers === user.username ? "Akun Anda" : "Tidak ada aksi"}
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
          className="max-w-4xl"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            {editingUser ? (
              <EditUserForm 
                user={editingUser} 
                onSuccess={handleEditSuccess} 
                onCancel={handleCloseEdit} 
              />
            ) : (            
              <AddUserForm 
                onSuccess={() => {
                  fetchUsers();
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