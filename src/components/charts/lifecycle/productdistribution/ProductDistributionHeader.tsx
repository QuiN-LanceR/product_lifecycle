import React, { useState } from 'react';
import { MoreDotIcon } from '../../../../icons/index';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';

const ProductDistributionHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      closeDropdown();
      
      const response = await fetch('/api/dashboard/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Data_Produk_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Product Distribution
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Distribusi produk berdasarkan tahap siklus hidup 
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Dropdown
          isOpen={isOpen}
          onClick={toggleDropdown}
          onClose={closeDropdown}
          trigger={
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreDotIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          }
        >
          <DropdownItem 
            onClick={handleExport}
          >
            {isExporting ? 'Mengexport...' : 'Export'}
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};

export default ProductDistributionHeader;