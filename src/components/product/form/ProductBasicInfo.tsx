import React from 'react';

interface DropdownOption {
  id: number;
  kategori?: string;
  segmen?: string;
  stage?: string;
}

interface LoadingState {
  kategori: boolean;
  segmen: boolean;
  stage: boolean;
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

interface ProductBasicInfoProps {
  formData: FormData;
  errors: Record<string, string>;
  kategoriOptions: DropdownOption[];
  segmenOptions: DropdownOption[];
  stageOptions: DropdownOption[];
  loadingOptions: LoadingState;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  formData,
  errors,
  kategoriOptions,
  segmenOptions,
  stageOptions,
  loadingOptions,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nama Produk */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nama Produk <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nama_produk"
          value={formData.nama_produk}
          onChange={onInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
            errors.nama_produk ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Masukkan nama produk"
        />
        {errors.nama_produk && (
          <p className="text-red-500 text-sm mt-1">{errors.nama_produk}</p>
        )}
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          name="id_kategori"
          value={formData.id_kategori}
          onChange={onInputChange}
          disabled={loadingOptions.kategori}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            errors.id_kategori ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${loadingOptions.kategori ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
        >
          <option value="">{loadingOptions.kategori ? 'Memuat...' : 'Pilih Kategori'}</option>
          {kategoriOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.kategori}
            </option>
          ))}
        </select>
        {errors.id_kategori && (
          <p className="text-red-500 text-sm mt-1">{errors.id_kategori}</p>
        )}
      </div>

      {/* Segmen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Segmen <span className="text-red-500">*</span>
        </label>
        <select
          name="id_segmen"
          value={formData.id_segmen}
          onChange={onInputChange}
          disabled={loadingOptions.segmen}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            errors.id_segmen ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${loadingOptions.segmen ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
        >
          <option value="">{loadingOptions.segmen ? 'Memuat...' : 'Pilih Segmen'}</option>
          {segmenOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.segmen}
            </option>
          ))}
        </select>
        {errors.id_segmen && (
          <p className="text-red-500 text-sm mt-1">{errors.id_segmen}</p>
        )}
      </div>

      {/* Stage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stage <span className="text-red-500">*</span>
        </label>
        <select
          name="id_stage"
          value={formData.id_stage}
          onChange={onInputChange}
          disabled={loadingOptions.stage}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            errors.id_stage ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${loadingOptions.stage ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
        >
          <option value="">{loadingOptions.stage ? 'Memuat...' : 'Pilih Stage'}</option>
          {stageOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.stage}
            </option>
          ))}
        </select>
        {errors.id_stage && (
          <p className="text-red-500 text-sm mt-1">{errors.id_stage}</p>
        )}
      </div>
    </div>
  );
};

export default ProductBasicInfo;