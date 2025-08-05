import React from 'react';

interface ProductFileUploadProps {
  files: File[];
  isDragOver: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
}

const ProductFileUpload: React.FC<ProductFileUploadProps> = ({
  files,
  isDragOver,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Lampiran File (Opsional)
      </label>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="text-center">
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg className={`mx-auto h-12 w-12 transition-colors duration-200 ${
              isDragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className={`font-medium transition-colors duration-200 ${
                  isDragOver ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400 hover:text-blue-500'
                }`}>Klik untuk upload</span> atau drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF (Max 10MB per file)
              </p>
            </div>
          </label>
        </div>
      </div>
      
      {/* Display selected files */}
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File yang dipilih:</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFileUpload;