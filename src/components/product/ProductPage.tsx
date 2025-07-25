"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import ProductForm from '@/components/product/ProductForm';
import Swal from 'sweetalert2';
import { Product } from '@/components/product/type';

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isViewAttachmentsModalOpen, openModal: openViewAttachmentsModal, closeModal: closeViewAttachmentsModal } = useModal();
  const { isOpen: isAddAttachmentModalOpen, openModal: openAddAttachmentModal, closeModal: closeAddAttachmentModal } = useModal();

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [attachmentLoading, setAttachmentLoading] = useState(false);


  const fetchProducts = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/produk/master?page=${page}&search=${search}`);
      const data = await res.json();
      
      if (res.ok) {
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / data.perPage));
        setCurrentPage(data.currentPage);
      } else {
        setError(data.error || 'Gagal mengambil data produk');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    openEditModal();
  };

  const handleDelete = async (productId: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data produk akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/produk/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: productId })
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          fetchProducts(currentPage, searchTerm);
        } else {
          Swal.fire('Error!', data.message, 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus produk.', 'error');
      }
    }
  };

  const handleViewAttachments = (product: Product) => {
    setSelectedProduct(product);
    openViewAttachmentsModal();
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    openAddModal();
  };

  const handleFormSuccess = () => {
    closeAddModal();
    closeEditModal();
    fetchProducts(currentPage, searchTerm);
  };

  const handleDeleteAttachment = async (attachmentId: string, productId: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Attachment akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        container: 'swal2-container-custom-z-index'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/attachment/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: attachmentId })
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            title: 'Terhapus!',
            text: 'Attachment berhasil dihapus.',
            icon: 'success',
            customClass: {
              container: 'swal2-container-custom-z-index'
            }
          });

          setProducts(prevProducts => {
            return prevProducts.map(product => {
              if (product.id === productId) {
                return {
                  ...product,
                  attachments: product.attachments?.filter(att => att.id !== attachmentId) || []
                };
              }
              return product;
            });
          });
          
          // Update selectedProduct juga
          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct({
              ...selectedProduct,
              attachments: selectedProduct.attachments?.filter(att => att.id !== attachmentId) || []
            });
          }
        } else {
          Swal.fire({
            title: 'Error!',
            text: data.message || 'Gagal menghapus attachment',
            icon: 'error',
            customClass: {
              container: 'swal2-container-custom-z-index'
            }
          });

        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error!',
          text: 'Terjadi kesalahan pada server',
          icon: 'error',
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
        });
      }
    }
  };

  const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setAttachmentError("Hanya file PDF yang diperbolehkan");
        return;
      }
      setAttachmentFile(selectedFile);
      setAttachmentError("");
    }
  };

  const handleAddAttachment = () => {
    if (!selectedProduct) return;
    openAddAttachmentModal();
  };

  const handleAttachmentSuccess = async () => {
    closeAddAttachmentModal();
    try {
      const res = await fetch(`/api/produk/detail?id=${selectedProduct?.id}`);
      const data = await res.json();
      
      if (res.ok && data.product) {
        setSelectedProduct(data.product);
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            if (product.id === selectedProduct?.id) {
              return data.product;
            }
            return product;
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAttachment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct || !attachmentFile) return;
    
    setAttachmentLoading(true);
    setAttachmentError("");
    
    const formData = new FormData();
    formData.append("id", selectedProduct.id);
    formData.append("attachment", attachmentFile);
    
    try {
      const res = await fetch("/api/attachment/add", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      
      if (data.success) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Attachment berhasil ditambahkan',
          icon: 'success',
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
        });

        handleAttachmentSuccess();
      } else {
        setAttachmentError(data.message || "Gagal menambahkan attachment");
      }
    } catch (err) {
      console.error(err);
      setAttachmentError("Terjadi kesalahan pada server");
    } finally {
      setAttachmentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cari:
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Cari produk"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-300" />
              </button>
            </div>
          </form>

          <button
            onClick={handleAddProduct}
            className="ml-0 md:ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {product.produk}
                  </h3>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {product.kategori}
                    </span>
                    <div className="mt-1 flex gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {product.segmen}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {product.stage}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 min-h-[2.5rem]">
                  {product.deskripsi || 'Tidak ada deskripsi'}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Tanggal Launch:</span>
                    <span className="font-medium">Harga:</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{product.tanggal_launch ? new Date(product.tanggal_launch).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }) : '-'}</span>
                    <span>{product.harga || '-'}</span>
                  </div>
                </div>

                <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleViewAttachments(product)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Attachment
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-2 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Tidak ada produk ditemukan</div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">
                {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan produk pertama Anda'}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal Tambah Produk */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        className="max-w-3xl p-0"
      >
        <ProductForm 
          onSuccess={handleFormSuccess} 
          onCancel={closeAddModal} 
        />
      </Modal>

      {/* Modal Edit Produk */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        className="max-w-3xl p-0"
      >
        {selectedProduct && (
          <ProductForm 
            product={selectedProduct}
            onSuccess={handleFormSuccess} 
            onCancel={closeEditModal} 
          />
        )}
      </Modal>

      {/* Modal View Attachments */}
      <Modal
        isOpen={isViewAttachmentsModalOpen}
        onClose={closeViewAttachmentsModal}
        className="max-w-lg p-6"
      >
        {selectedProduct && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Attachment untuk {selectedProduct.produk}</h2>

            <div className="mb-4">
              <button
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Tambah Attachment
              </button>
            </div>
            
            {selectedProduct.attachments && selectedProduct.attachments.length > 0 ? (
              <ul className="space-y-3">
                {selectedProduct.attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <a 
                          href={attachment.url_attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {attachment.nama_attachment}
                        </a>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(attachment.size / 1024)} KB • {new Date(attachment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAttachment(attachment.id, selectedProduct.id)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                      title="Hapus attachment"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada attachment untuk produk ini
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeViewAttachmentsModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddAttachmentModalOpen}
        onClose={closeAddAttachmentModal}
        className="max-w-md p-6"
      >
        {selectedProduct && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tambah Attachment</h2>
            <form onSubmit={handleSubmitAttachment} className="space-y-4">
              <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Attachment (PDF)
                </label>
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  accept="application/pdf"
                  onChange={handleAttachmentFileChange}
                  className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  required
                />
              </div>
              
              {attachmentError && <p className="text-red-500 text-sm">{attachmentError}</p>}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeAddAttachmentModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={attachmentLoading}
                >
                  {attachmentLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}