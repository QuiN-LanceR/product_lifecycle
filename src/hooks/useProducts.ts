import { useState, useCallback } from 'react';
import { Product, PaginationInfo, ProductFilters } from '../types/product.types';
import Swal from 'sweetalert2';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
  });

  const fetchProducts = useCallback(async (filters: ProductFilters, page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        search: filters.search,
        kategori: filters.kategori,
        segmen: filters.segmen,
        stage: filters.stage,
      });

      const response = await fetch(`/api/produk/master?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const result = await response.json();
      
      // PERBAIKAN: Akses data dari property 'data', bukan 'products'
      setProducts(result.data || []);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: result.pagination?.totalPages || 1,
        totalItems: result.pagination?.totalItems || 0,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data produk',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data produk akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/produk/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete product');

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Produk berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false
        });

        return true;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal menghapus produk'
      });
    }
    return false;
  };

  return {
    products,
    loading,
    pagination,
    fetchProducts,
    deleteProduct,
    setPagination
  };
};