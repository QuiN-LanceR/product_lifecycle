export interface Attachment {
  id: number;
  nama_attachment: string;
  url_attachment: string;
  size: number;
  type: string;
  created_at: string;
}

export interface Product {
  id: number;
  produk: string;
  deskripsi: string;
  id_kategori: number;
  kategori: string;
  id_segmen: number;
  segmen: string;
  id_stage: number;
  stage: string;
  harga: number;
  tanggal_launch: string;
  pelanggan: string;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export interface DropdownOption {
  id: number;
  kategori?: string;
  segmen?: string;
  stage?: string;
}