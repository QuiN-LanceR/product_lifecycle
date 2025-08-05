import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import Swal from 'sweetalert2';

interface DevHistoriImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DevHistoriImportModal: React.FC<DevHistoriImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/devhistori/template/download');
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'template_dev_history.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mendownload template'
      });
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) return;

    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/devhistori/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import data');
      }

      const result = await response.json();
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: `
          <div class="text-left">
            <p><strong>Berhasil diimport:</strong> ${result.successCount || 0} data</p>
            ${result.errorCount > 0 ? `<p><strong>Gagal diimport:</strong> ${result.errorCount} data</p>` : ''}
            ${result.errors && result.errors.length > 0 ? `
              <div class="mt-3">
                <p><strong>Detail error:</strong></p>
                <ul class="text-sm text-left list-disc list-inside max-h-32 overflow-y-auto">
                  ${result.errors.slice(0, 5).map((error: string) => `<li>${error}</li>`).join('')}
                  ${result.errors.length > 5 ? `<li>... dan ${result.errors.length - 5} error lainnya</li>` : ''}
                </ul>
              </div>
            ` : ''}
          </div>
        `,
        timer: result.errorCount > 0 ? undefined : 3000,
        showConfirmButton: result.errorCount > 0
      });

      onSuccess();
    } catch (error) {
      console.error('Error importing data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Gagal mengimport data'
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragOver(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-2xl"
    >
      <div className="p-6 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Import Development History dari Excel</h2>
        
        {/* Template Download Section */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Download Template</h3>
          <p className="text-purple-700 dark:text-purple-300 mb-3 text-sm">
            Download template Excel yang sudah berisi format yang diperlukan untuk import development history.
          </p>
          <div className="text-xs text-purple-600 dark:text-purple-400 mb-3">
            <p><strong>Format yang diperlukan:</strong></p>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>ID Produk (harus sudah ada di database)</li>
              <li>Tipe Pekerjaan</li>
              <li>Tanggal Mulai (YYYY-MM-DD)</li>
              <li>Tanggal Akhir (YYYY-MM-DD, opsional)</li>
              <li>Version</li>
              <li>Deskripsi</li>
              <li>Status (Development/Testing/Released/Deprecated)</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Template
          </button>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upload File Excel</h3>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileInputChange}
              className="hidden"
              id="devhistori-excel-upload"
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <svg className="h-12 w-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">{selectedFile.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Hapus file
                </button>
              </div>
            ) : (
              <label
                htmlFor="devhistori-excel-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className={`h-12 w-12 mb-3 ${
                  isDragOver ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className={`text-lg font-medium mb-1 ${
                  isDragOver ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {isDragOver ? 'Lepaskan file di sini' : 'Drag & drop file Excel atau klik untuk pilih'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  Format yang didukung: .xlsx, .xls (Maksimal 10MB)
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Batal
          </button>
          <button
            onClick={handleImportExcel}
            disabled={!selectedFile || importLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            {importLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {importLoading ? 'Mengimport...' : 'Import Data'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DevHistoriImportModal;