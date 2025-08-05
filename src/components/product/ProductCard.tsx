import React from 'react';
import { Product } from '../../types/product.types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStageBadgeColor, getSegmentBadgeColor } from '../../utils/productHelpers';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onViewAttachments: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onViewAttachments
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Product Header */}
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {product.nama_produk}
          </h3>
          <div className="ml-3">
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] ${getStageBadgeColor(product.stage || '')}`}>
              {product.stage}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Kategori:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{product.kategori}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Segmen:</span>
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentBadgeColor(product.segmen || '')}`}>
              {product.segmen}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Customer:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{product.customer}</span>
          </div>
        </div>

        {/* Price and Launch Date */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Harga</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.harga)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Launch Date</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(product.tanggal_launch)}
            </p>
          </div>
        </div>

        {/* Description */}
        {product.deskripsi && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{product.deskripsi}</p>
          </div>
        )}

        {/* Attachment Count */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>{product.attachments?.length || 0} file attachment</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="group relative p-3 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300/60 dark:hover:border-orange-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Edit Product"
          >
            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(product.id)}
            className="group relative p-3 hover:bg-red-100/60 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300/60 dark:hover:border-red-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Delete Product"
          >
            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <button
            onClick={() => onViewAttachments(product)}
            className="group relative p-3 hover:bg-teal-100/60 dark:hover:bg-teal-900/20 border border-transparent hover:border-teal-300/60 dark:hover:border-teal-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="View Files"
          >
            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;