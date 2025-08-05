"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import DatePicker from '../form/date-picker';

interface Product {
  id: number;
  nama_produk: string;
}

interface DevHistori {
  id: number;
  id_produk: number;
  tipe_pekerjaan: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  version: string;
  deskripsi: string;
  status: string;
}

interface EditDevHistoriFormProps {
  devHistori: DevHistori;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditDevHistoriForm: React.FC<EditDevHistoriFormProps> = ({
  devHistori,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    id_produk: devHistori.id_produk.toString(),
    tipe_pekerjaan: devHistori.tipe_pekerjaan,
    tanggal_mulai: devHistori.tanggal_mulai.split('T')[0],
    tanggal_akhir: devHistori.tanggal_akhir ? devHistori.tanggal_akhir.split('T')[0] : '',
    version: devHistori.version,
    deskripsi: devHistori.deskripsi,
    status: devHistori.status,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/devhistori/produk");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(`Gagal memuat data produk: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/devhistori/${devHistori.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id_produk: parseInt(formData.id_produk),
        }),
      });

      if (response.ok) {
        toast.success("Development history berhasil diperbarui!", {
          duration: 4000,
          position: 'top-center',
        });
        // Delay sedikit sebelum menutup modal agar toast terlihat
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Gagal memperbarui development history");
      }
    } catch (error) {
      console.error("Error updating dev histori:", error);
      toast.error("Gagal memperbarui development history");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler untuk DatePicker
  const handleDateChange = (field: string) => (selectedDates: Date[], dateStr: string) => {
    setFormData(prev => ({ ...prev, [field]: dateStr }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="id_produk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Produk *
          </label>
          {isLoadingProducts ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Memuat produk...
              </span>
            </div>
          ) : (
            <select
              id="id_produk"
              value={formData.id_produk}
              onChange={(e) => handleInputChange("id_produk", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Pilih produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id.toString()}>
                  {product.nama_produk}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="tipe_pekerjaan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipe Pekerjaan *
          </label>
          <input
            id="tipe_pekerjaan"
            type="text"
            value={formData.tipe_pekerjaan}
            onChange={(e) => handleInputChange("tipe_pekerjaan", e.target.value)}
            placeholder="Contoh: Bug Fix, Feature, Enhancement"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <DatePicker
            id="tanggal_mulai_edit"
            label="Tanggal Mulai *"
            placeholder="Pilih tanggal mulai"
            defaultDate={formData.tanggal_mulai || undefined}
            onChange={handleDateChange("tanggal_mulai")}
          />
        </div>

        <div className="space-y-2">
          <DatePicker
            id="tanggal_akhir_edit"
            label="Tanggal Akhir"
            placeholder="Pilih tanggal akhir"
            defaultDate={formData.tanggal_akhir || undefined}
            onChange={handleDateChange("tanggal_akhir")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Version *
          </label>
          <input
            id="version"
            type="text"
            value={formData.version}
            onChange={(e) => handleInputChange("version", e.target.value)}
            placeholder="Contoh: 1.0.0"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Released">Released</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Deskripsi *
        </label>
        <textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e) => handleInputChange("deskripsi", e.target.value)}
          placeholder="Deskripsi perubahan atau fitur baru"
          rows={3}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memperbarui...
            </>
          ) : (
            "Perbarui"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditDevHistoriForm;