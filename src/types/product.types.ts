export interface Product {
  id: number;
  nama_produk: string;
  id_kategori: number;
  id_segmen: number;
  id_stage: number;
  harga: number;
  tanggal_launch: string;
  customer: string;
  deskripsi: string;
  kategori?: string;
  segmen?: string;
  stage?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  nama_attachment: string;
  url_attachment: string;
  ukuran_file: number;
  type: string;
  created_at: string;
}

export interface DropdownOption {
  id: number;
  kategori?: string;
  segmen?: string;
  stage?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ProductFilters {
  search: string;
  kategori: string;
  segmen: string;
  stage: string;
}