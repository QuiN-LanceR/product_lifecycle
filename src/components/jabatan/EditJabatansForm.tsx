"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';

type Jabatan = {
  id: number;
  jabatan: string;
};

interface EditJabatanFormProps {
  jabatan: Jabatan;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditJabatansForm({ jabatan, onSuccess, onCancel }: EditJabatanFormProps) {
  const [loading, setLoading] = useState(false);
  const [jabatanName, setJabatanName] = useState(jabatan.jabatan);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!jabatanName.trim()) {
      setError("Nama jabatan wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/jabatans/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: jabatan.id, jabatan: jabatanName })
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", "Jabatan berhasil diperbarui", "success");
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
      <h2 className="text-xl dark:text-white font-semibold mb-4">Edit Jabatan</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="jabatan">Nama Jabatan</Label>
          <Input
            id="jabatan"
            name="jabatan"
            type="text"
            defaultValue={jabatanName}
            onChange={(e) => setJabatanName(e.target.value)}
            placeholder="Masukkan nama jabatan"
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