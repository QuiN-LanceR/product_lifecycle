"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';
import Image from "next/image";

interface AddSegmenFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddSegmensForm({ onSuccess, onCancel }: AddSegmenFormProps) {
  const [loading, setLoading] = useState(false);
  const [segmenName, setSegmenName] = useState("");
  const [error, setError] = useState("");
  const [iconLight, setIconLight] = useState("");
  const [iconDark, setIconDark] = useState("");
  const [iconLightPreview, setIconLightPreview] = useState("");
  const [iconDarkPreview, setIconDarkPreview] = useState("");
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);

  const handleFileUpload = async (file: File, type: 'light' | 'dark') => {
    if (type === 'light') setUploadingLight(true);
    else setUploadingDark(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/segmens/upload-icon', {
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
        body: JSON.stringify({ 
          segmen: segmenName,
          icon_light: iconLight || null,
          icon_dark: iconDark || null
        })
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

        {/* Icon Upload Section - Horizontal Layout */}
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Icon Light Upload */}
            <div>
              <Label htmlFor="icon_light">Icon Light</Label>
              <input
                id="icon_light"
                name="icon_light"
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
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900/20 dark:file:text-blue-400
                  dark:hover:file:bg-blue-900/30"
              />
              {uploadingLight && (
                <p className="text-sm text-blue-600 dark:text-blue-400">Mengupload...</p>
              )}
              {iconLightPreview && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                      <Image 
                        src={iconLightPreview} 
                        alt="Light icon" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 object-contain" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Light Theme</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{iconLight}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Icon Dark Upload */}
            <div>
              <Label htmlFor="icon_dark">Icon Dark</Label>
              <input
                id="icon_dark"
                name="icon_dark"
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Theme</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{iconDark}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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