"use client"

import React, { useEffect, useRef } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useProductFilters } from '../../hooks/useProductFilters';
import { useProductModals } from '../../hooks/useProductModals';
import { useAttachments } from '../../hooks/useAttachments';
import ProductHeader from './ProductHeader';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import ProductPagination from './ProductPagination';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import AttachmentModal from './AttachmentModal';
import AddAttachmentModal from './AddAttachmentModal';
import ImportModal from './ImportModal';
import Swal from 'sweetalert2';

const ProductPage: React.FC = () => {
  const {
    products,
    loading,
    pagination,
    fetchProducts,
    deleteProduct
  } = useProducts();

  const {
    filters,
    kategoriOptions,
    segmenOptions,
    stageOptions,
    loadingOptions,
    fetchDropdownOptions,
    handleFilterChange,
    clearFilters
  } = useProductFilters();

  const {
    showAddModal,
    showEditModal,
    showViewAttachmentsModal,
    showAddAttachmentModal,
    showImportModal,
    selectedProduct,
    formLoading,
    setShowImportModal,
    setFormLoading,
    openAddModal,
    openEditModal,
    openViewAttachmentsModal,
    openAddAttachmentModal,  // Tambahkan ini
    closeAllModals
  } = useProductModals();

  const {
    selectedAttachments,
    fetchAttachments,
    handleSubmitAttachment,
    handleDeleteAttachment
  } = useAttachments();

  // PERBAIKAN: Gunakan ref untuk mencegah infinite loop
  const isInitialMount = useRef(true);
  const prevFilters = useRef(filters);

  // Load initial data
  useEffect(() => {
    fetchDropdownOptions();
  }, [fetchDropdownOptions]);

  // PERBAIKAN: Fetch products hanya saat filters berubah atau initial load
  useEffect(() => {
    if (isInitialMount.current) {
      fetchProducts(filters, 1);
      isInitialMount.current = false;
    } else {
      // Cek apakah filters benar-benar berubah
      const filtersChanged = JSON.stringify(prevFilters.current) !== JSON.stringify(filters);
      if (filtersChanged) {
        fetchProducts(filters, 1); // Reset ke halaman 1 saat filter berubah
        prevFilters.current = filters;
      }
    }
  }, [filters, fetchProducts]);

  // Handlers
  const handlePageChange = (page: number) => {
    fetchProducts(filters, page);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (product: any) => {
    openEditModal(product);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteProduct(id);
    if (success) {
      fetchProducts(filters, pagination.currentPage);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewAttachments = (product: any) => {
    openViewAttachmentsModal(product);
    fetchAttachments(product.id);
  };

  const handleFormSuccess = () => {
    closeAllModals();
    fetchProducts(filters, pagination.currentPage);
  };

  const handleAddSubmit = async (formData: FormData) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/produk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add product');

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Produk berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false,
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
      });

      handleFormSuccess();
    } catch (error) {
      console.error('Error adding product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal menambahkan produk',
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedProduct) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/produk/${selectedProduct.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update product');

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Produk berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });

      handleFormSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memperbarui produk',
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProductHeader
        onAddProduct={openAddModal}
        onImport={() => setShowImportModal(true)}
        totalProducts={pagination.totalItems}
      />

      {/* Filters */}
      <ProductFilters
        filters={filters}
        kategoriOptions={kategoriOptions}
        segmenOptions={segmenOptions}
        stageOptions={stageOptions}
        loadingOptions={loadingOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewAttachments={handleViewAttachments}
        onAddProduct={openAddModal}
      />

      {/* Pagination */}
      <ProductPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={closeAllModals}
        onSubmit={handleAddSubmit}
        onSuccess={handleFormSuccess}
        isLoading={formLoading}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onSubmit={handleEditSubmit}
        onSuccess={handleFormSuccess}
        isLoading={formLoading}
      />

      <AttachmentModal
        isOpen={showViewAttachmentsModal}
        onClose={closeAllModals}
        product={selectedProduct}
        attachments={selectedAttachments}
        onAddAttachment={() => {
          closeAllModals();
          if (selectedProduct) {
            openAddAttachmentModal(selectedProduct);
          }
        }}
        onDeleteAttachment={handleDeleteAttachment}
      />

      <AddAttachmentModal
        isOpen={showAddAttachmentModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onSubmit={handleSubmitAttachment}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          fetchProducts(filters, pagination.currentPage);
        }}
      />
    </div>
  );
};

export default ProductPage;