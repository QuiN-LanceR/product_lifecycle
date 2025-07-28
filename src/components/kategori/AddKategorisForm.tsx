"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';

interface AddKategoriFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddKategorisForm({ onSuccess, onCancel }: AddKategoriFormProps) {
  const [loading, setLoading] = useState(false);
  const [kategoriName, setKategoriName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!kategoriName.trim()) {
      setError("Nama kategori wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/kategoris/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ kategori: kategoriName })
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", "Kategori berhasil ditambahkan", "success");
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
      <h2 className="text-xl font-semibold mb-4">Tambah Kategori Baru</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="kategori">Nama Kategori</Label>
          <Input
            id="kategori"
            name="kategori"
            type="text"
            defaultValue={kategoriName}
            onChange={(e) => setKategoriName(e.target.value)}
            placeholder="Masukkan nama kategori"
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