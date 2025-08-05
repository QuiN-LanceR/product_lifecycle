import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DevHistoriTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const DevHistoriTableHeader: React.FC<DevHistoriTableHeaderProps> = ({
  sortBy,
  sortOrder,
  onSort
}) => {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-500" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-500" />
    );
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th 
      className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <span className="ml-2 group-hover:text-purple-500 transition-colors">{getSortIcon(column)}</span>
      </div>
    </th>
  );

  return (
    <thead className="bg-gray-50 dark:bg-gray-900">
      <tr>
        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900 z-20 border-r border-gray-200 dark:border-gray-700 shadow-sm">
          No
        </th>
        <SortableHeader column="nama_produk">Nama Produk</SortableHeader>
        <SortableHeader column="tipe_pekerjaan">Tipe Pekerjaan</SortableHeader>
        <SortableHeader column="tanggal_mulai">Tgl Mulai</SortableHeader>
        <SortableHeader column="tanggal_akhir">Tgl Akhir</SortableHeader>
        <SortableHeader column="version">Version</SortableHeader>
        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          Deskripsi
        </th>
        <SortableHeader column="status">Status</SortableHeader>
        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 z-20 border-l border-gray-200 dark:border-gray-700 shadow-sm">
          Aksi
        </th>
      </tr>
    </thead>
  );
};

export default DevHistoriTableHeader;