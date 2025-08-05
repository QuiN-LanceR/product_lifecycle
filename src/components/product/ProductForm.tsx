"use client";

import React from 'react';
import Swal from 'sweetalert2';
import { useProductForm } from '@/hooks/useProductForm';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useFileUpload } from '@/hooks/useFileUpload';
import ProductBasicInfo from './form/ProductBasicInfo';
import ProductPricing from './form/ProductPricing';
import ProductDescription from './form/ProductDescription';
import ProductFileUpload from './form/ProductFileUpload';

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

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  onSuccess,
  isLoading = false
}) => {
  const {
    formData,
    errors,
    submitLoading,
    setSubmitLoading,
    validateForm,
    handleInputChange
  } = useProductForm(product);

  const {
    kategoriOptions,
    segmenOptions,
    stageOptions,
    loadingOptions
  } = useDropdownOptions();

  const {
    files,
    isDragOver,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile
  } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    
    try {
      const submitFormData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });
      
      // Add files
      files.forEach((file) => {
        submitFormData.append('files', file);
      });
      
      await onSubmit(submitFormData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <ProductBasicInfo
        formData={formData}
        errors={errors}
        kategoriOptions={kategoriOptions}
        segmenOptions={segmenOptions}
        stageOptions={stageOptions}
        loadingOptions={loadingOptions}
        onInputChange={handleInputChange}
      />

      {/* Pricing Information */}
      <ProductPricing
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
      />

      {/* Description */}
      <ProductDescription
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
      />

      {/* File Upload */}
      <ProductFileUpload
        files={files}
        isDragOver={isDragOver}
        onFileChange={handleFileChange}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onRemoveFile={removeFile}
      />

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