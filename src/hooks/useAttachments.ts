import { useState, useCallback } from 'react';
import { Attachment } from '../types/product.types';
import Swal from 'sweetalert2';

export const useAttachments = () => {
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const fetchAttachments = useCallback(async (productId: number) => {
    try {
      setAttachmentLoading(true);
      const response = await fetch(`/api/produk/${productId}/attachments`);
      if (!response.ok) throw new Error('Failed to fetch attachments');
      
      const data = await response.json();
      setSelectedAttachments(data.attachments || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat file attachment',
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });
    } finally {
      setAttachmentLoading(false);
    }
  }, []);

  const handleSubmitAttachment = async (formData: FormData) => {
    try {
      const response = await fetch('/api/attachment/add', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload attachment');

      Swal.fire({
        title: 'Berhasil!',
        text: 'File berhasil ditambahkan',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });

      // Refresh attachments
      const productId = formData.get('id');
      if (productId) {
        await fetchAttachments(Number(productId));
      }

      return true;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengupload file',
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });
      return false;
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: 'Apakah Anda yakin ingin menghapus file ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });

      if (result.isConfirmed) {
        const response = await fetch('/api/attachment/delete', { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: attachmentId }),
        });

        if (!response.ok) throw new Error('Failed to delete attachment');

        await Swal.fire({
          title: 'Berhasil!',
          text: 'File berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            container: 'swal2-container-custom-z-index'
          }
        });

        // Remove from local state
        setSelectedAttachments(prev => 
          prev.filter(attachment => attachment.id !== attachmentId)
        );

        return true;
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal menghapus file',
        customClass: {
          container: 'swal2-container-custom-z-index'
        }
      });
    }
    return false;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    selectedAttachments,
    attachmentLoading,
    fetchAttachments,
    handleSubmitAttachment,
    handleDeleteAttachment,
    formatFileSize
  };
};