import React from 'react';

interface ProductHeaderProps {
  onAddProduct: () => void;
  onImport: () => void;
  totalProducts: number;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  onAddProduct,
  onImport,
  totalProducts
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola semua produk dalam siklus hidup pengembangan. Total: {totalProducts} produk
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Add Product Button */}
          <button
            onClick={onAddProduct}
            className="group relative p-3 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-300/60 dark:hover:border-blue-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/40 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm overflow-hidden"
            title="Add New Product"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-300/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            
            <svg className="h-5 w-5 relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
              Add Product
            </div>
          </button>
          
          {/* Import Button */}
          <button
            onClick={onImport}
            className="group relative p-3 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-300/60 dark:hover:border-emerald-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-400/40 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm overflow-hidden"
            title="Import Products"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-emerald-400/10 to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-emerald-300/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 delay-100"></div>
            
            <svg className="h-5 w-5 relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
              Import Data
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;