"use client";

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  nama_produk: string;
  id_kategori: number;
  id_segmen: number;
  id_stage: number;
  harga: number;
  tanggal_launch: string;
  customer: string;
  deskripsi: string;
  kategori?: string;
  segmen?: string;
  stage?: string;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
}

interface DropdownOption {
  id: number;
  kategori?: string;
  segmen?: string;
  stage?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  onSuccess,
  isLoading = false
}) => {
  // Fungsi helper untuk format tanggal
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    // Jika sudah dalam format YYYY-MM-DD, return langsung
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Jika dalam format ISO atau format lain, convert ke YYYY-MM-DD
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    nama_produk: product?.nama_produk || '',
    id_kategori: product?.id_kategori?.toString() || '',
    id_segmen: product?.id_segmen?.toString() || '',
    id_stage: product?.id_stage?.toString() || '',
    harga: product?.harga?.toString() || '',
    tanggal_launch: formatDateForInput(product?.tanggal_launch || ''),
    customer: product?.customer || '',
    deskripsi: product?.deskripsi || ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [kategoriOptions, setKategoriOptions] = useState<DropdownOption[]>([]);
  const [segmenOptions, setSegmenOptions] = useState<DropdownOption[]>([]);
  const [stageOptions, setStageOptions] = useState<DropdownOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState({
    kategori: false,
    segmen: false,
    stage: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        nama_produk: product.nama_produk || '',
        id_kategori: product.id_kategori?.toString() || '',
        id_segmen: product.id_segmen?.toString() || '',
        id_stage: product.id_stage?.toString() || '',
        harga: product.harga?.toString() || '',
        tanggal_launch: formatDateForInput(product.tanggal_launch || ''),
        customer: product.customer || '',
        deskripsi: product.deskripsi || ''
      });
    }
  }, [product]);

  // PERBAIKAN: Menggunakan response langsung tanpa .data
  const fetchDropdownOptions = async () => {
    setLoadingOptions({ kategori: true, segmen: true, stage: true });
    
    try {
      const [kategoriRes, segmenRes, stageRes] = await Promise.all([
        fetch('/api/produk/kategoris/get'),
        fetch('/api/produk/segmens/get'),
        fetch('/api/produk/stages/get')
      ]);

      if (kategoriRes.ok) {
        const kategoriData = await kategoriRes.json();
        setKategoriOptions(kategoriData || []); // Langsung gunakan response
      }

      if (segmenRes.ok) {
        const segmenData = await segmenRes.json();
        setSegmenOptions(segmenData || []); // Langsung gunakan response
      }

      if (stageRes.ok) {
        const stageData = await stageRes.json();
        setStageOptions(stageData || []); // Langsung gunakan response
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      Swal.fire("Gagal", "Gagal memuat opsi dropdown", "error");
    } finally {
      setLoadingOptions({ kategori: false, segmen: false, stage: false });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_produk.trim()) {
      newErrors.nama_produk = 'Nama produk wajib diisi';
    }
    if (!formData.id_kategori) {
      newErrors.id_kategori = 'Kategori wajib dipilih';
    }
    if (!formData.id_segmen) {
      newErrors.id_segmen = 'Segmen wajib dipilih';
    }
    if (!formData.id_stage) {
      newErrors.id_stage = 'Stage wajib dipilih';
    }
    if (!formData.harga || Number(formData.harga) <= 0) {
      newErrors.harga = 'Harga harus lebih dari 0';
    }
    if (!formData.tanggal_launch) {
      newErrors.tanggal_launch = 'Tanggal launch wajib diisi';
    }
    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // DRAG AND DROP HANDLERS
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif'];
    
    const validFiles = droppedFiles.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(fileExtension);
    });

    if (validFiles.length !== droppedFiles.length) {
      Swal.fire("Peringatan", "Beberapa file tidak didukung. Hanya file PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF yang diizinkan.", "warning");
    }

    setFiles(validFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire("Peringatan", "Mohon lengkapi semua field yang wajib diisi", "warning");
      return;
    }

    setSubmitLoading(true);
    
    try {
      const submitFormData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value.toString());
      });
      
      // Add product ID for edit mode
      if (product?.id) {
        submitFormData.append('id', product.id.toString());
      }
      
      // Add files
      files.forEach((file) => {
        submitFormData.append('files', file);
      });

      await onSubmit(submitFormData);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      Swal.fire("Berhasil", product ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan", "success");
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan produk", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Produk */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama_produk"
            value={formData.nama_produk}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
              errors.nama_produk ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Masukkan nama produk"
          />
          {errors.nama_produk && (
            <p className="text-red-500 text-sm mt-1">{errors.nama_produk}</p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="id_kategori"
            value={formData.id_kategori}
            onChange={handleInputChange}
            disabled={loadingOptions.kategori}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.id_kategori ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${loadingOptions.kategori ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
          >
            <option value="">{loadingOptions.kategori ? 'Memuat...' : 'Pilih Kategori'}</option>
            {kategoriOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.kategori}
              </option>
            ))}
          </select>
          {errors.id_kategori && (
            <p className="text-red-500 text-sm mt-1">{errors.id_kategori}</p>
          )}
        </div>

        {/* Segmen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Segmen <span className="text-red-500">*</span>
          </label>
          <select
            name="id_segmen"
            value={formData.id_segmen}
            onChange={handleInputChange}
            disabled={loadingOptions.segmen}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.id_segmen ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${loadingOptions.segmen ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
          >
            <option value="">{loadingOptions.segmen ? 'Memuat...' : 'Pilih Segmen'}</option>
            {segmenOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.segmen}
              </option>
            ))}
          </select>
          {errors.id_segmen && (
            <p className="text-red-500 text-sm mt-1">{errors.id_segmen}</p>
          )}
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stage <span className="text-red-500">*</span>
          </label>
          <select
            name="id_stage"
            value={formData.id_stage}
            onChange={handleInputChange}
            disabled={loadingOptions.stage}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.id_stage ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${loadingOptions.stage ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
          >
            <option value="">{loadingOptions.stage ? 'Memuat...' : 'Pilih Stage'}</option>
            {stageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.stage}
              </option>
            ))}
          </select>
          {errors.id_stage && (
            <p className="text-red-500 text-sm mt-1">{errors.id_stage}</p>
          )}
        </div>

        {/* Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Harga <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
              errors.harga ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Masukkan harga"
          />
          {errors.harga && (
            <p className="text-red-500 text-sm mt-1">{errors.harga}</p>
          )}
        </div>

        {/* Tanggal Launch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tanggal Launch <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_launch"
            value={formData.tanggal_launch}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.tanggal_launch ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              colorScheme: 'light dark',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield'
            }}
          />
          {errors.tanggal_launch && (
            <p className="text-red-500 text-sm mt-1">{errors.tanggal_launch}</p>
          )}
        </div>

        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customer"
            value={formData.customer}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
              errors.customer ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Masukkan nama customer"
          />
          {errors.customer && (
            <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
          )}
        </div>

        {/* Deskripsi */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deskripsi
          </label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Masukkan deskripsi produk (opsional)"
          />
        </div>

        {/* File Upload - DRAG AND DROP YANG BERFUNGSI */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload File Attachment (Multiple Files)
          </label>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            } dark:bg-gray-800/50`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className={`mx-auto h-12 w-12 transition-colors duration-200 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
              }`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className={`font-medium transition-colors duration-200 ${
                    isDragOver ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400 hover:text-blue-500'
                  }`}>Klik untuk upload</span> atau drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF (Max 10MB per file)
                </p>
              </div>
            </label>
          </div>
          
          {/* Display selected files */}
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File yang dipilih:</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitLoading}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors duration-200 font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitLoading || isLoading}
          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center transition-colors duration-200 font-medium"
        >
          {(submitLoading || isLoading) && (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {product ? 'Update Produk' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;