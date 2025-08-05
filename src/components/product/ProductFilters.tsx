import React from 'react';
import { ProductFilters as IProductFilters, DropdownOption } from '../../types/product.types';

interface ProductFiltersProps {
  filters: IProductFilters;
  kategoriOptions: DropdownOption[];
  segmenOptions: DropdownOption[];
  stageOptions: DropdownOption[];
  loadingOptions: boolean;
  onFilterChange: (key: keyof IProductFilters, value: string) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  kategoriOptions,
  segmenOptions,
  stageOptions,
  loadingOptions,
  onFilterChange,
  onClearFilters
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari produk..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
          <select
            value={filters.kategori}
            onChange={(e) => onFilterChange('kategori', e.target.value)}
            disabled={loadingOptions}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Semua Kategori</option>
            {kategoriOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.kategori}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Segmen</label>
          <select
            value={filters.segmen}
            onChange={(e) => onFilterChange('segmen', e.target.value)}
            disabled={loadingOptions}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Semua Segmen</option>
            {segmenOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.segmen}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stage</label>
          <select
            value={filters.stage}
            onChange={(e) => onFilterChange('stage', e.target.value)}
            disabled={loadingOptions}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Semua Stage</option>
            {stageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.stage}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="group relative w-full px-4 py-2.5 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 border border-transparent hover:border-gray-300/50 dark:hover:border-gray-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/30 dark:focus:ring-gray-400/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm overflow-hidden flex items-center justify-center gap-2"
            title="Clear all filters"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/0 via-gray-400/8 to-gray-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-gray-300/8 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            
            <svg className="h-4 w-4 relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            
            <span className="relative z-10 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              Reset Filter
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;