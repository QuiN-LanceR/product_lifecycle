import React from 'react';

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

interface ProductDescriptionProps {
  formData: FormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      {/* Customer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Customer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="customer"
          value={formData.customer}
          onChange={onInputChange}
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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deskripsi
        </label>
        <textarea
          name="deskripsi"
          value={formData.deskripsi}
          onChange={onInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 resize-vertical"
          placeholder="Masukkan deskripsi produk (opsional)"
        />
      </div>
    </div>
  );
};

export default ProductDescription;