import React from 'react';
import DatePicker from '../../form/date-picker';

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

interface ProductPricingProps {
  formData: FormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Harga */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Harga <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="harga"
          value={formData.harga}
          onChange={onInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
            errors.harga ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Masukkan harga produk"
          min="0"
          step="0.01"
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
        <DatePicker
          id="tanggal_launch"
          defaultDate={formData.tanggal_launch}
          onChange={(dates) => {
            const e = {
              target: {
                name: 'tanggal_launch',
                value: dates[0].toISOString().split('T')[0]
              }
            } as React.ChangeEvent<HTMLInputElement>;
            onInputChange(e);
          }}
        />
      </div>
    </div>
  );
};

export default ProductPricing;