"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';

type Role = {
  id: number;
  nama_role: string;
  created_at: string;
};

interface EditRoleFormProps {
  role: Role;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditRolesForm({ role, onSuccess, onCancel }: EditRoleFormProps) {
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState(role.nama_role);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!roleName.trim()) {
      setError("Nama role wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/roles/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: role.id, role: roleName })
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", "Role berhasil diperbarui", "success");
        onSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl dark:text-white font-semibold mb-4">Edit Role</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="role">Nama Role</Label>
          <Input
            id="role"
            name="role"
            type="text"
            defaultValue={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Masukkan nama role"
            className="w-full"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Batal
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}