"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';
import { Product, Attachment } from '@/components/product/type';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}


  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0];
  };

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    produk: string;
    deskripsi: string;
    kategori: string;
    segmen: string;
    stage: string;
    harga: string;
    tanggal_launch: string;
    pelanggan: string;
  }>({    
    produk: product?.produk || "",
    deskripsi: product?.deskripsi || "",
    kategori: product?.kategori || "",
    segmen: product?.segmen || "",
    stage: product?.stage || "",
    harga: product?.harga || "",
    tanggal_launch: product?.tanggal_launch ? formatDateForInput(product.tanggal_launch) : "",
    pelanggan: product?.pelanggan || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>(product?.attachments || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Hanya file PDF yang diperbolehkan");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus attachment ini?')) {
      try {
        const res = await fetch("/api/attachment/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: attachmentId })
        });

        const data = await res.json();

        if (data.success) {
          setAttachments(prev => prev.filter(att => att.id !== attachmentId));
          Swal.fire("Berhasil", "Attachment berhasil dihapus", "success");
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Terjadi kesalahan pada server");
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.produk.trim() || !formData.kategori.trim() || !formData.segmen.trim() || !formData.stage.trim()) {
      setError("Produk, kategori, segmen, dan stage wajib diisi");
      setLoading(false);
      return;
    }

    const submitFormData = new FormData();
    
    if (product?.id) {
      submitFormData.append("id", product.id);
    }
    
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });
    
    if (file) {
      submitFormData.append("attachment", file);
    }

    try {
      const url = product ? "/api/produk/edit" : "/api/produk/add";
      const res = await fetch(url, {
        method: "POST",
        body: submitFormData
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Berhasil", product ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan", "success");
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
      <h2 className="text-xl font-semibold mb-4">{product ? "Edit Produk" : "Tambah Produk Baru"}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label htmlFor="produk">Nama Produk</Label>
            <Input
              id="produk"
              name="produk"
              type="text"
              defaultValue={formData.produk}
              onChange={handleChange}
              placeholder="Masukkan nama produk"
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="kategori">Kategori</Label>
            <Input
              id="kategori"
              name="kategori"
              type="text"
              defaultValue={formData.kategori}
              onChange={handleChange}
              placeholder="Masukkan kategori"
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="segmen">Segmen</Label>
            <Input
              id="segmen"
              name="segmen"
              type="text"
              defaultValue={formData.segmen}
              onChange={handleChange}
              placeholder="Masukkan segmen"
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="stage">Stage</Label>
            <Input
              id="stage"
              name="stage"
              type="text"
              defaultValue={formData.stage}
              onChange={handleChange}
              placeholder="Masukkan stage"
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="harga">Harga</Label>
            <Input
              id="harga"
              name="harga"
              type="text"
              defaultValue={formData.harga}
              onChange={handleChange}
              placeholder="Masukkan harga"
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="tanggal_launch">Tanggal Launch</Label>
            <Input
              id="tanggal_launch"
              name="tanggal_launch"
              type="date"
              defaultValue={formData.tanggal_launch}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="pelanggan">Pelanggan</Label>
            <Input
              id="pelanggan"
              name="pelanggan"
              type="text"
              defaultValue={formData.pelanggan}
              onChange={handleChange}
              placeholder="Masukkan pelanggan"
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="attachment">Attachment (PDF)</Label>
            <Input
              id="attachment"
              name="attachment"
              type="file"
              onChange={handleFileChange}
              className="w-full"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                File terpilih: {file.name}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
              placeholder="Masukkan deskripsi produk"
              className="w-full h-24 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Attachment yang ada:</h3>
            <ul className="space-y-2">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <a 
                      href={attachment.url_attachment} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {attachment.nama_attachment}
                    </a>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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