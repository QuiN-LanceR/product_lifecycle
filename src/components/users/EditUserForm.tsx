"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import Swal from 'sweetalert2';

type Role = {
  id: number;
  role: string;
};

type Jabatan = {
  id: number;
  jabatan: string;
};

type User = {
  id: number;
  fullname: string;
  username: string;
  email: string;
  photo: string;
  role: string;
  jabatan: string;
};

interface EditUserFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedJabatan, setSelectedJabatan] = useState<string>("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const resRoles = await fetch('/api/users/roles/get');
        const dataRoles = await resRoles.json();
        setRoles(dataRoles);

        const resJabatans = await fetch('/api/users/jabatans/get');
        const dataJabatans = await resJabatans.json();
        setJabatans(dataJabatans);

        // Set nilai awal untuk role dan jabatan
        const userRole = dataRoles.find((r: Role) => r.role === user.role);
        const userJabatan = dataJabatans.find((j: Jabatan) => j.jabatan === user.jabatan);
        
        if (userRole) setSelectedRole(userRole.id.toString());
        if (userJabatan) setSelectedJabatan(userJabatan.id.toString());
      } catch (error) {
        console.error("Gagal fetch data dropdown:", error);
      }
    };

    fetchOptions();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", user.id.toString());

    try {
      const res = await fetch("/api/users/edit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", "Data pengguna berhasil diperbarui", "success");
        onSuccess();
      } else {
        Swal.fire("Gagal", data.message || "Terjadi kesalahan", "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error", "Terjadi kesalahan pada server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header dengan padding yang lebih baik */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit User
        </h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Edit data pengguna.
        </p>
      </div>
      
      {/* Content area dengan padding yang konsisten */}
      <div className="px-6 py-4">
        <div className="custom-scrollbar max-h-[450px] overflow-y-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user.username}
                />
              </div>
              <div>
                <Label htmlFor="fullname">Nama Lengkap</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  defaultValue={user.fullname}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  required
                >
                  <option value="">Pilih Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="jabatan">Jabatan</Label>
                <select
                  id="jabatan"
                  name="jabatan"
                  value={selectedJabatan}
                  onChange={(e) => setSelectedJabatan(e.target.value)}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  required
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatans.map((jabatan) => (
                    <option key={jabatan.id} value={jabatan.id}>
                      {jabatan.jabatan}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="photo">Foto Profil</Label>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {(preview || user.photo) && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Preview Foto:</p>
                <div className="w-20 h-20 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-600">
                  <Image
                    src={preview || `/images/user/${user.photo}`}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer dengan padding yang konsisten */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
            className="px-6"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            disabled={loading}
            size="sm"
            className="px-6"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}