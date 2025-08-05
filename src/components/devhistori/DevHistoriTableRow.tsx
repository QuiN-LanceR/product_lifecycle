import React from 'react';
import { Pencil, Trash, Eye } from 'lucide-react';
import { DevHistori } from '../../types/devhistori.types';

interface DevHistoriTableRowProps {
  devHistori: DevHistori;
  index: number;
  currentPage: number;
  onEdit: (devHistori: DevHistori) => void;
  onDelete: (id: number) => void;
  onViewDescription: (description: string) => void;
  currentRole?: string;
}

const DevHistoriTableRow: React.FC<DevHistoriTableRowProps> = ({
  devHistori,
  index,
  currentPage,
  onEdit,
  onDelete,
  onViewDescription,
  currentRole
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
        {(currentPage - 1) * 10 + index + 1}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {devHistori.nama_produk}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {devHistori.tipe_pekerjaan}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(devHistori.tanggal_mulai)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(devHistori.tanggal_akhir)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {devHistori.version}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-gray-900 dark:text-white max-w-xs">
          <div className="line-clamp-2">
            {devHistori.deskripsi}
          </div>
          {devHistori.deskripsi && devHistori.deskripsi.length > 100 && (
            <button
              onClick={() => onViewDescription(devHistori.deskripsi)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs mt-1 flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Lihat selengkapnya
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(devHistori.status)}`}>
          {devHistori.status}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-center sticky right-0 bg-white dark:bg-gray-800 z-10 border-l border-gray-200 dark:border-gray-700">
        <div className="flex justify-center gap-1">
          {(currentRole == "Admin") && (
            <>
              <button
                onClick={() => onEdit(devHistori)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(devHistori.id)}
                className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Hapus"
              >
                <Trash className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DevHistoriTableRow;