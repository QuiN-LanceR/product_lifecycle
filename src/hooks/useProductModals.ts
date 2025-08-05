import { useState } from 'react';
import { Product } from '../types/product.types';

export const useProductModals = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewAttachmentsModal, setShowViewAttachmentsModal] = useState(false);
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const openAddModal = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openViewAttachmentsModal = (product: Product) => {
    setSelectedProduct(product);
    setShowViewAttachmentsModal(true);
  };

  const openAddAttachmentModal = (product: Product) => {
    setSelectedProduct(product);
    setShowAddAttachmentModal(true);
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewAttachmentsModal(false);
    setShowAddAttachmentModal(false);
    setShowImportModal(false);
    setSelectedProduct(null);
  };

  return {
    showAddModal,
    showEditModal,
    showViewAttachmentsModal,
    showAddAttachmentModal,
    showImportModal,
    selectedProduct,
    formLoading,
    setShowAddModal,
    setShowEditModal,
    setShowViewAttachmentsModal,
    setShowAddAttachmentModal,
    setShowImportModal,
    setFormLoading,
    openAddModal,
    openEditModal,
    openViewAttachmentsModal,
    openAddAttachmentModal,
    closeAllModals
  };
};