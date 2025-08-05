import { useState, useEffect } from 'react';

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

interface FormData {
  nama_produk: string;
  id_kategori: string;
  id_segmen: string;
  id_stage: string;
  harga: string;
  tanggal_launch: string;
  customer: string;
  deskripsi: string;
}

export const useProductForm = (product?: Product) => {
  const [formData, setFormData] = useState<FormData>({
    nama_produk: '',
    id_kategori: '',
    id_segmen: '',
    id_stage: '',
    harga: '',
    tanggal_launch: '',
    customer: '',
    deskripsi: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return {
    formData,
    errors,
    submitLoading,
    setSubmitLoading,
    validateForm,
    handleInputChange
  };
};