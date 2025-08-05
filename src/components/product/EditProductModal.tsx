import React from 'react';
import { Modal } from '../ui/modal';
import ProductForm from './ProductForm';
import { Product } from '../../types/product.types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
  isLoading: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  onSuccess,
  isLoading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="p-6 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Produk</h2>
        <ProductForm
          product={product || undefined}
          onSubmit={onSubmit}
          onCancel={onClose}
          onSuccess={onSuccess}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
};

export default EditProductModal;