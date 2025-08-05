import React from 'react';
import { Modal } from '../ui/modal';
import { Product } from '../../types/product.types';

interface AddAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (formData: FormData) => Promise<boolean>;
}

const AddAttachmentModal: React.FC<AddAttachmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit
}) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (product) {
      formData.append('id', product.id.toString());
    }
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="p-6 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah File Attachment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih File
            </label>
            <input
              type="file"
              name="attachment"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddAttachmentModal;