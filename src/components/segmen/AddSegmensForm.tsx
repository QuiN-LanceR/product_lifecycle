"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';

interface AddSegmenFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddSegmensForm({ onSuccess, onCancel }: AddSegmenFormProps) {
  const [loading, setLoading] = useState(false);
  const [segmenName, setSegmenName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!segmenName.trim()) {
      setError("Nama segmen wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/segmens/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ segmen: segmenName })
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", "Segmen berhasil ditambahkan", "success");
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
      <h2 className="text-xl font-semibold mb-4">Tambah Segmen Baru</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="segmen">Nama Segmen</Label>
          <Input
            id="segmen"
            name="segmen"
            type="text"
            defaultValue={segmenName}
            onChange={(e) => setSegmenName(e.target.value)}
            placeholder="Masukkan nama segmen"
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