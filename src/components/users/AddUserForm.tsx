"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';

type Role = {
  id: number;
  role: string;
};

type Jabatan = {
  id: number;
  jabatan: string;
};

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (!formData.get("fullname") || !formData.get("email")) {
      Swal.fire("Gagal", "Nama dan email wajib diisi!", "warning");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", "User berhasil ditambahkan", "success");
        onSuccess();
      } else {
        Swal.fire("Gagal", data.message || "Terjadi kesalahan", "error");
      }
    } catch (error) {
      console.error("Error adding user:", error);
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
          Add New User
        </h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Isi data pengguna baru.
        </p>
      </div>
      
      {/* Content area dengan padding yang konsisten */}
      <div className="px-6 py-4">
        <div className="custom-scrollbar max-h-[450px] overflow-y-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullname">Nama Lengkap</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password"
                />
              </div>

              <div>
                <Label htmlFor="photo">Foto Profil</Label>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                />
              </div>
            </div>
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