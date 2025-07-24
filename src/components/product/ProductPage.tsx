"use client";
import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  type: 'Korporat' | 'Distribusi';
  description: string;
  launchDate: string;
  launchUpdated: string;
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Cloud Management Platform',
    category: 'Infrastructure',
    type: 'Korporat',
    description: 'Enterprise cloud infrastructure management solution',
    launchDate: '15/01/2023',
    launchUpdated: '10/07/2023'
  },
  {
    id: '2',
    name: 'AI Analytics Tool',
    category: 'Analytics',
    type: 'Distribusi',
    description: 'Machine learning powered business analytics',
    launchDate: '01/01/2024',
    launchUpdated: '10/07/2025'
  },
  {
    id: '3',
    name: 'Legacy ERP System',
    category: 'Enterprise Software',
    type: 'Korporat',
    description: 'Traditional enterprise resource planning',
    launchDate: '01/06/2018',
    launchUpdated: '10/07/2025'
  }
];

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (productId: string) => {
    console.log('Edit product:', productId);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleAddProduct = () => {
    console.log('Add new product');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Product Catalog</h1>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search:
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
            </div>
          </div>

          <button
            onClick={handleAddProduct}
            className="ml-0 md:ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h3>
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {product.category}
                </span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.type === 'Distribusi'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    ● {product.type}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 min-h-[2.5rem]">
              {product.description}
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Launch Date:</span>
                <span className="font-medium">Launch Updated:</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{product.launchDate}</span>
                <span>{product.launchUpdated}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleEdit(product.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No products found</div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product'}
          </div>
        </div>
      )}
    </div>
  );
}
