import React from 'react';
import { Modal } from '../ui/modal';
import ProductForm from './ProductForm';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  onSuccess: () => void;
  isLoading: boolean;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
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
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah Produk Baru</h2>
        <ProductForm
          onSubmit={onSubmit}
          onCancel={onClose}
          onSuccess={onSuccess}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
};

export default AddProductModal;