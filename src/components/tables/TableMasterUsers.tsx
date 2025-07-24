"use client";

import { useCallback, useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash } from "lucide-react";
import { useUser } from "@/context/UsersContext";
import Input from "../form/input/InputField";
import Label from "../form/Label";
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

type Role = {
  id: number;
  role: string;
};

type Jabatan = {
  id: number;
  jabatan: string;
};

export default function TableMasterUsers({ currentPage, onTotalChange }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const currentUsers = user?.username;
  const currentRole = user?.role;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/users/master?page=${currentPage}`);
    const data = await res.json();

    setUsers(data.users);
    onTotalChange(Math.ceil(data.total / data.perPage));
    setLoading(false);
  }, [currentPage, onTotalChange]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const resRoles = await fetch('/api/users/roles/get');
        const dataRoles = await resRoles.json();
        setRoles(dataRoles);

        const resJabatans = await fetch('/api/users/jabatans/get');
        const dataJabatans = await resJabatans.json();
        setJabatans(dataJabatans);
      } catch (error) {
        console.error("Gagal fetch data dropdown:", error);
      }
    };

    fetchOptions();
  }, []);


  const handleDelete = async (fullname: string, id: number) => {
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
            fetchUsers(); // refresh data tabel
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/users/add", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    closeModal();
    if (data.success) {
      fetchUsers(); // Refresh data
      Swal.fire("Berhasil", "User berhasil ditambahkan", "success");
    } else {
      Swal.fire("Gagal", data.message || "Terjadi kesalahan", "error");
    }
  };



  if (loading) { 
    return (
      <div className="flex items-center">
        <div className="animate-pulse flex items-center">
          <div className="rounded-full bg-gray-300 h-11 w-11 mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <Button onClick={openModal} className="bg-blue-600 hover:bg-blue-500 text-white">
          + Add User
        </Button>
      </div>
      <table className="min-w-full table-auto border-2 border-gray-400 dark:border-white/30 rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white font-semibold border-b-4 border-gray-400 dark:border-white/30">
            <th className="px-4 py-2 text-left">No</th>
            <th className="px-4 py-2 text-left">Photo</th>
            <th className="px-4 py-2 text-left">Fullname</th>
            <th className="px-4 py-2 text-left">Jabatan</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b border-gray-300 dark:border-white/20">
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{(currentPage - 1) * 10 + idx + 1}</td>
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20 text-center">
                {user.photo ? (
                  <Image
                    src={`/images/user/${user.photo}`}
                    alt={user.fullname}
                    className="w-10 h-10 rounded-full mx-auto"
                    width={100}
                    height={100}
                  />
                ) : (
                  <span className="text-gray-400 italic">No Photo</span>
                )}
              </td>
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{user.fullname}</td>
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{user.jabatan}</td>
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{user.email}</td>
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{user.username}</td>
              <td className="px-4 py-2 border-r border-gray-300 dark:border-white/20">{user.role}</td>
              <td className="px-4 py-2 border-r text-center">
                {currentUsers !== user.username && currentRole === 'Admin' ? (
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      className="dark:text-gray-800 text-white-600 hover:text-gray-800 border-gray-800 hover:border-green-700 bg-green-600 border dark:bg-green-500 hover:bg-green-400 dark:hover:bg-green-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="dark:text-gray-800 text-white-600 hover:text-gray-800 border-gray-800 hover:border-red-700 bg-red-600 border dark:bg-red-500 hover:bg-red-400 dark:hover:bg-red-700"
                      onClick={() => handleDelete(user.fullname, user.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm italic text-gray-400">No Action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <form onSubmit={handleSave}>
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Add New User
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Isi data pengguna baru.
              </p>
            </div>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Full Name</Label>
                    <Input type="text" name="fullname" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Role</Label>
                    <select name="role" className="w-full border p-2 rounded">
                      <option value="">Pilih Role</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Jabatan</Label>
                    <select name="jabatan" className="w-full border p-2 rounded">
                      <option value="">Pilih Jabatan</option>
                      {jabatans.map(j => (
                        <option key={j.id} value={j.id}>{j.jabatan}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="email" name="email" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Username</Label>
                    <Input type="text" name="username" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Password</Label>
                    <Input type="text" name="password" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Photo</Label>
                    <Input type="file" name="photo" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm">
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
}
