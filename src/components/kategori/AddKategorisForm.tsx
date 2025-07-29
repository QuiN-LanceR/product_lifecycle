"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';
import Image from "next/image";

interface AddKategoriFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddKategorisForm({ onSuccess, onCancel }: AddKategoriFormProps) {
  const [loading, setLoading] = useState(false);
  const [kategoriName, setKategoriName] = useState("");
  const [iconLight, setIconLight] = useState("");
  const [iconDark, setIconDark] = useState("");
  const [iconLightPreview, setIconLightPreview] = useState("");
  const [iconDarkPreview, setIconDarkPreview] = useState("");
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file: File, type: 'light' | 'dark') => {
    if (type === 'light') setUploadingLight(true);
    else setUploadingDark(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/kategoris/upload-icon', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        if (type === 'light') {
          setIconLight(result.fileName);
          setIconLightPreview(result.filePath);
        } else {
          setIconDark(result.fileName);
          setIconDarkPreview(result.filePath);
        }      
        Swal.fire({
          title: 'Berhasil',
          text: 'File berhasil diupload',
          icon: 'success',
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
        });
      } else {        
        Swal.fire({
          title: 'Error',
          text: result.message,
          icon: 'error',
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire('Error', 'Terjadi kesalahan saat mengupload file', 'error');
    } finally {
      if (type === 'light') setUploadingLight(false);
      else setUploadingDark(false);
    }
  };

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
        body: JSON.stringify({ 
          kategori: kategoriName,
          icon_light: iconLight || null,
          icon_dark: iconDark || null
        })
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
    <div className="px-6 py-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tambah Kategori Baru</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan kategori produk baru dengan icon</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="kategori">Nama Kategori *</Label>
          <Input
            id="kategori"
            name="kategori"
            type="text"
            defaultValue={kategoriName}
            onChange={(e) => setKategoriName(e.target.value)}
            placeholder="Masukkan nama kategori"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Icon Light Mode */}
          <div>
            <Label htmlFor="icon_light">Icon Light Mode</Label>
            <div className="space-y-3">
              <input
                type="file"
                accept=".svg,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'light');
                }}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                  dark:file:bg-purple-900/20 dark:file:text-purple-400
                  dark:hover:file:bg-purple-900/30"
              />
              {uploadingLight && (
                <p className="text-sm text-blue-600 dark:text-blue-400">Mengupload...</p>
              )}
              {iconLightPreview && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                      <Image 
                        src={iconLightPreview} 
                        alt="Light icon" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 object-contain" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{iconLight}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Light Mode</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Icon Dark Mode */}
          <div>
            <Label htmlFor="icon_dark">Icon Dark Mode</Label>
            <div className="space-y-3">
              <input
                type="file"
                accept=".svg,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'dark');
                }}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                  dark:file:bg-purple-900/20 dark:file:text-purple-400
                  dark:hover:file:bg-purple-900/30"
              />
              {uploadingDark && (
                <p className="text-sm text-blue-600 dark:text-blue-400">Mengupload...</p>
              )}
              {iconDarkPreview && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-900 border border-gray-600 rounded-lg flex items-center justify-center">
                      <Image 
                        src={iconDarkPreview} 
                        alt="Dark icon" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 object-contain" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{iconDark}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dark Mode</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2"
          >
            Batal
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
            disabled={loading || uploadingLight || uploadingDark}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}